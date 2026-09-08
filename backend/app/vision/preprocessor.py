"""
DocScreen — Image Preprocessing and Quality Analysis Module.
Calculates resolution, blur, exposure, noise, skew, and contrast scores.
Performs image normalization, contrast enhancement (CLAHE), deskewing.
"""
import io
import cv2
import numpy as np
from PIL import Image
from dataclasses import dataclass, asdict
from typing import Tuple, Dict, Any


@dataclass
class QualityMetrics:
    quality_score: float         # 0 - 100 overall
    blur_score: float            # 0 - 100 (higher = sharper)
    exposure_score: float        # 0 - 100 (higher = optimal exposure)
    resolution_score: float      # 0 - 100 (higher = higher resolution)
    skew_angle: float            # degrees
    noise_level: float           # estimated noise variance (lower = cleaner)
    contrast_score: float        # 0 - 100
    is_acceptable: bool          # quality meets minimum screening threshold


def _compute_blur_score(gray: np.ndarray) -> float:
    """Laplacian variance based sharpness metric, scaled 0-100."""
    try:
        var = cv2.Laplacian(gray, cv2.CV_64F).var()
        # Typical clear doc has var > 150-300; blurry < 50
        score = min(100.0, max(0.0, (var / 300.0) * 100.0))
        return round(score, 1)
    except Exception:
        return 50.0


def _compute_exposure_score(gray: np.ndarray) -> float:
    """Check for underexposure / overexposure clipping."""
    try:
        mean_val = float(np.mean(gray))
        # Optimal mean for white paper docs is ~ 140 - 200
        under_clipped = np.mean(gray < 15) * 100
        over_clipped = np.mean(gray > 245) * 100
        clipping_penalty = (under_clipped + over_clipped) * 2.0
        
        ideal_center = 170.0
        distance = abs(mean_val - ideal_center)
        base_score = max(0.0, 100.0 - (distance / 1.5))
        exposure = max(0.0, min(100.0, base_score - clipping_penalty))
        return round(exposure, 1)
    except Exception:
        return 75.0


def _compute_resolution_score(w: int, h: int) -> float:
    """Resolution adequacy for OCR and forensic screening."""
    pixels = w * h
    # >= 1080p equivalent ~ 2MP is optimal (100)
    if pixels >= 2_000_000:
        return 100.0
    elif pixels >= 800_000:
        return round(70.0 + (pixels - 800_000) / 1_200_000 * 30.0, 1)
    elif pixels >= 300_000:
        return round(40.0 + (pixels - 300_000) / 500_000 * 30.0, 1)
    else:
        return round(max(10.0, (pixels / 300_000) * 40.0), 1)


def _detect_skew_angle(gray: np.ndarray) -> float:
    """Estimate document orientation skew using Hough lines."""
    try:
        edges = cv2.Canny(gray, 50, 150, apertureSize=3)
        lines = cv2.HoughLinesP(edges, 1, np.pi / 180, threshold=100, minLineLength=100, maxLineGap=10)
        if lines is None or len(lines) == 0:
            return 0.0
        
        angles = []
        for line in lines:
            x1, y1, x2, y2 = line[0]
            if x2 - x1 == 0:
                continue
            angle = np.degrees(np.arctan2(y2 - y1, x2 - x1))
            if -45 < angle < 45:
                angles.append(angle)
        
        if not angles:
            return 0.0
        median_angle = float(np.median(angles))
        return round(median_angle, 2)
    except Exception:
        return 0.0


def _deskew_image(image: np.ndarray, angle: float) -> np.ndarray:
    """Rotate image to correct skew if significant (> 0.5 degrees)."""
    if abs(angle) < 0.5 or abs(angle) > 40:
        return image
    h, w = image.shape[:2]
    center = (w // 2, h // 2)
    M = cv2.getRotationMatrix2D(center, angle, 1.0)
    rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
    return rotated


def _compute_noise_level(gray: np.ndarray) -> float:
    """Fast noise variance estimation via high-pass Laplacian filter."""
    try:
        h, w = gray.shape
        M = [[1, -2, 1], [-2, 4, -2], [1, -2, 1]]
        sigma = np.sum(np.sum(np.abs(cv2.filter2D(gray, -1, np.array(M)))))
        sigma = sigma * np.sqrt(0.5 * np.pi) / (6 * (w - 2) * (h - 2))
        return round(float(sigma), 2)
    except Exception:
        return 5.0


def preprocess_image(image_bytes: bytes) -> Tuple[bytes, QualityMetrics, np.ndarray]:
    """
    Main entry point for image quality analysis and enhancement.
    Returns:
        (processed_bytes, QualityMetrics, img_cv_bgr)
    """
    # Load image from bytes
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img_cv is None:
        # Try PIL fallback
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_cv = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

    h, w = img_cv.shape[:2]
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)

    # Compute metrics
    blur = _compute_blur_score(gray)
    exposure = _compute_exposure_score(gray)
    res_score = _compute_resolution_score(w, h)
    skew = _detect_skew_angle(gray)
    noise = _compute_noise_level(gray)
    
    # Contrast score
    contrast = min(100.0, float(np.std(gray)) * 1.5)

    # Overall quality score: weighted fusion
    quality_score = round(
        0.35 * blur + 0.25 * exposure + 0.20 * res_score + 0.10 * contrast + 0.10 * max(0, 100 - noise * 5),
        1
    )
    quality_score = max(5.0, min(100.0, quality_score))
    is_acceptable = quality_score >= 35.0

    metrics = QualityMetrics(
        quality_score=quality_score,
        blur_score=blur,
        exposure_score=exposure,
        resolution_score=res_score,
        skew_angle=skew,
        noise_level=noise,
        contrast_score=round(contrast, 1),
        is_acceptable=is_acceptable
    )

    # Deskew if needed
    if abs(skew) >= 1.0:
        img_cv = _deskew_image(img_cv, skew)

    # Encode processed image to bytes
    success, buffer = cv2.imencode(".jpg", img_cv, [cv2.IMWRITE_JPEG_QUALITY, 95])
    processed_bytes = buffer.tobytes() if success else image_bytes

    return processed_bytes, metrics, img_cv
