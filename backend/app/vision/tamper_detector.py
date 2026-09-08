"""
DocScreen — Tamper Detection & Forensic Analysis Module.
Performs:
1. Error Level Analysis (ELA) to reveal compression rate disparities
2. Local noise inconsistency mapping
3. Edge gradient disparity (detecting synthetic insertions)
4. Forensic heatmap image generation
"""
import io
import cv2
import numpy as np
from PIL import Image, ImageChops, ImageEnhance
from typing import Dict, Any, List, Tuple


def _compute_ela(image_bytes: bytes, quality: int = 90) -> Tuple[np.ndarray, float]:
    """
    Error Level Analysis (ELA). Resaves at given quality and computes pixel difference.
    Different compression levels indicate spliced or modified regions.
    NOTE: All JPEGs show *some* ELA difference on resave — amplification must be conservative.
    """
    try:
        orig = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        buf = io.BytesIO()
        orig.save(buf, "JPEG", quality=quality)
        buf.seek(0)
        resaved = Image.open(buf)

        diff = ImageChops.difference(orig, resaved)
        extrema = diff.getextrema()
        max_diff = max([ex[1] for ex in extrema]) if extrema else 1
        scale = 255.0 / max(max_diff, 1)

        diff_enhanced = ImageEnhance.Brightness(diff).enhance(scale)
        diff_arr = np.array(diff_enhanced)

        # Mean difference energy as an inconsistency indicator
        # Use 1.5x amplification (not 3x) — normal JPEG resaves already show baseline noise
        raw_score = float(np.mean(diff_arr)) / 255.0
        ela_score = min(0.40, raw_score * 1.5)  # Cap at 0.40 — real docs won't exceed this naturally
        return diff_arr, ela_score
    except Exception:
        return np.zeros((400, 600, 3), dtype=np.uint8), 0.0


def _compute_noise_inconsistency(gray: np.ndarray) -> Tuple[float, List[Dict]]:
    """
    Divides image into grid blocks and measures noise variance disparity.
    Modified/pasted text or photo patches usually have a distinct noise signature.
    """
    h, w = gray.shape
    block_h = max(32, h // 12)
    block_w = max(32, w // 12)

    variances = []
    block_coords = []

    for y in range(0, h - block_h, block_h):
        for x in range(0, w - block_w, block_w):
            patch = gray[y:y + block_h, x:x + block_w]
            # High-pass filter patch
            lap = cv2.Laplacian(patch, cv2.CV_64F)
            v = float(np.var(lap))
            variances.append(v)
            block_coords.append((x, y, block_w, block_h, v))

    if not variances:
        return 0.0, []

    vars_arr = np.array(variances, dtype=float)
    median_var = float(np.median(vars_arr))
    mad = float(np.median(np.abs(vars_arr - median_var))) + 1e-5

    suspicious_regions = []
    for x, y, bw, bh, v in block_coords:
        z = abs(v - median_var) / mad
        if z > 4.0:  # Raised from 3.5 — require stronger deviation
            suspicious_regions.append({
                "bbox": [x, y, bw, bh],
                "type": "noise_inconsistency",
                "confidence": round(min(0.95, z / 6.0), 2),
                "description": f"Abnormal noise floor ({z:.1f}x deviation from background)",
            })

    inconsistency_score = min(1.0, len(suspicious_regions) / 10.0)
    return round(inconsistency_score, 3), suspicious_regions


def _detect_edge_irregularities(gray: np.ndarray) -> Tuple[float, List[Dict]]:
    """
    Detect sharp synthetic boundary transitions typical of copy-pasted or digitally inserted elements.
    Real identity cards (DL, Aadhaar) have rectangular features (photo box, stamp) — these must NOT
    be flagged. We require very high rectangularity (>0.92) AND we only score if 3+ such regions found.
    """
    edges = cv2.Canny(gray, 80, 200)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    dilated = cv2.dilate(edges, kernel, iterations=2)
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    suspicious = []
    h, w = gray.shape
    total_area = h * w

    for cnt in contours:
        x, y, cw, ch = cv2.boundingRect(cnt)
        area = cw * ch
        # Look for rectangular pasted patches (e.g. photo or field box modification)
        if 0.01 * total_area < area < 0.20 * total_area:
            rect_fill = cv2.contourArea(cnt) / (cw * ch + 1e-5)
            aspect = max(cw, ch) / max(min(cw, ch), 1)
            # Require very high rectangularity AND unusual aspect ratio
            # Normal card features: photo box (aspect ~1.2), stamp (~1.0) — these are legitimate
            # Suspicious: extremely thin strips or near-perfect squares with edges not matching doc layout
            if rect_fill > 0.92 and (aspect > 4.0 or aspect < 0.8):
                suspicious.append({
                    "bbox": [x, y, cw, ch],
                    "type": "edge_boundary_patch",
                    "confidence": 0.65,
                    "description": "Sharp rectilinear boundary with anomalous aspect ratio — possible digital insertion",
                })

    # Only produce a non-zero score if we have 3+ independent suspicious regions
    if len(suspicious) < 3:
        return 0.0, []

    score = min(1.0, (len(suspicious) - 2) * 0.20)
    return round(score, 3), suspicious


def _generate_heatmap(img_cv: np.ndarray, ela_img: np.ndarray, suspicious_regions: List[Dict]) -> bytes:
    """
    Generate combined forensic heatmap overlaid on the original document.
    """
    h, w = img_cv.shape[:2]
    # Resize ela to match img_cv
    ela_resized = cv2.resize(ela_img, (w, h))
    ela_gray = cv2.cvtColor(ela_resized, cv2.COLOR_RGB2GRAY)

    # Apply JET or INFERNO colormap
    norm = cv2.normalize(ela_gray, None, 0, 255, cv2.NORM_MINMAX)
    heatmap_colored = cv2.applyColorMap(norm, cv2.COLORMAP_JET)

    # Blend original and heatmap
    overlay = cv2.addWeighted(img_cv, 0.45, heatmap_colored, 0.55, 0)

    # Highlight suspicious bounding boxes
    for r in suspicious_regions:
        x, y, bw, bh = r["bbox"]
        cv2.rectangle(overlay, (x, y), (x + bw, y + bh), (0, 0, 255), 2)
        cv2.putText(overlay, r.get("type", "FLAG")[:15], (x, max(15, y - 5)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 255), 1)

    success, buf = cv2.imencode(".jpg", overlay, [cv2.IMWRITE_JPEG_QUALITY, 85])
    return buf.tobytes() if success else b""


def analyze_tamper(image_bytes: bytes) -> Dict[str, Any]:
    """
    Main tamper detection orchestrator.
    Returns:
        tamper_indicator_score: 0.0 to 1.0
        signals: dictionary of individual tamper signals
        suspicious_regions: list of bounding boxes + explanations
        forensic_heatmap_bytes: encoded JPEG bytes of forensic overlay
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img_cv is None:
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_cv = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)

    # 1. ELA
    ela_img, ela_score = _compute_ela(image_bytes)

    # 2. Noise Inconsistency
    noise_score, noise_regions = _compute_noise_inconsistency(gray)

    # 3. Edge / Boundary Inconsistency
    edge_score, edge_regions = _detect_edge_irregularities(gray)

    # Combine suspicious regions
    all_regions = noise_regions + edge_regions

    # Composite tamper indicator score
    # Require at least two signals to be non-zero for a meaningful score
    active_signals = sum(1 for s in [ela_score, noise_score, edge_score] if s > 0.05)
    tamper_score = round(
        0.40 * ela_score + 0.35 * noise_score + 0.25 * edge_score,
        2
    )
    # Attenuate if only one weak signal fired
    if active_signals < 2 and tamper_score < 0.25:
        tamper_score = tamper_score * 0.6

    tamper_score = min(1.0, max(0.0, tamper_score))

    # Heatmap
    heatmap_bytes = _generate_heatmap(img_cv, ela_img, all_regions)

    return {
        "tamper_indicator_score": tamper_score,
        "signals": {
            "jpeg_block_inconsistency": round(ela_score, 3),
            "noise_inconsistency": round(noise_score, 3),
            "edge_irregularity": round(edge_score, 3),
            "copy_move_detected": len(edge_regions) > 0,
            "resampling_score": round((ela_score + noise_score) / 2.0, 3),
            "active_signal_count": active_signals,
        },
        "suspicious_regions": all_regions,
        "forensic_heatmap_bytes": heatmap_bytes,
    }
