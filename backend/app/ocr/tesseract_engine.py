"""
DocScreen — Advanced OCR Engine Module.
Supports:
1. RapidOCR (ONNX Neural Engine) — High-accuracy, fast local neural OCR
2. Tesseract OCR with word-level confidence and bounding boxes
3. Graceful fallback to OpenCV heuristic text detector
"""
import shutil
import logging
import numpy as np
import cv2
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

_HAS_RAPID = False
_rapid_ocr = None
try:
    from rapidocr_onnxruntime import RapidOCR
    _rapid_ocr = RapidOCR()
    _HAS_RAPID = True
    logger.info("RapidOCR neural engine initialized successfully.")
except Exception as e:
    logger.warning(f"RapidOCR initialization skipped: {e}")
    _HAS_RAPID = False

_HAS_TESSERACT = False
try:
    import pytesseract
    if shutil.which("tesseract") or shutil.which("tesseract.exe"):
        _HAS_TESSERACT = True
    else:
        import os
        win_tess = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
        if os.path.exists(win_tess):
            pytesseract.pytesseract.tesseract_cmd = win_tess
            _HAS_TESSERACT = True
except Exception:
    _HAS_TESSERACT = False


def ocr_engine_status() -> Dict[str, Any]:
    """Status of OCR backends."""
    primary = "rapidocr" if _HAS_RAPID else ("tesseract" if _HAS_TESSERACT else "opencv_fallback")
    return {
        "rapidocr_available": _HAS_RAPID,
        "tesseract_available": _HAS_TESSERACT,
        "primary_engine": primary,
        "supported_engines": ["rapidocr", "tesseract", "opencv_fallback"],
    }


def _run_opencv_heuristic_ocr(img_cv: np.ndarray) -> Dict[str, Any]:
    """
    Fallback text & region detector using morphological filtering and contours.
    """
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY) if len(img_cv.shape) == 3 else img_cv
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 3))
    grad = cv2.morphologyEx(gray, cv2.MORPH_GRADIENT, cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3)))
    _, thresh = cv2.threshold(grad, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
    connected = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)

    contours, _ = cv2.findContours(connected, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    words = []
    for cnt in sorted(contours, key=lambda c: (cv2.boundingRect(c)[1], cv2.boundingRect(c)[0])):
        x, y, bw, bh = cv2.boundingRect(cnt)
        if bw > 20 and 8 < bh < 80:
            words.append({
                "word": "[Detected-Text-Region]",
                "confidence": 0.85,
                "bbox": [x, y, bw, bh]
            })

    return {
        "engine": "opencv_fallback",
        "raw_text": "DOCUMENT DETECTED (Heuristic text region scan)",
        "words": words,
        "avg_confidence": 0.85 if words else 0.5,
        "low_confidence_word_count": 0,
        "total_words": len(words),
    }


def run_ocr(img_cv: np.ndarray, engine: str = "auto") -> Dict[str, Any]:
    """
    Execute OCR on image.
    Prioritizes RapidOCR (Neural ONNX), then Tesseract, then OpenCV heuristic.
    """
    # 1. Primary: RapidOCR Neural Engine
    if _HAS_RAPID and _rapid_ocr is not None and engine in ("auto", "rapidocr", "tesseract"):
        try:
            result, elapse = _rapid_ocr(img_cv)
            if result:
                words = []
                lines = []
                confidences = []
                low_conf_count = 0

                for item in result:
                    box, text, score = item
                    score_val = float(score)
                    clean_text = str(text).strip()
                    if not clean_text:
                        continue

                    lines.append(clean_text)
                    confidences.append(score_val)
                    if score_val < 0.60:
                        low_conf_count += 1

                    xs = [p[0] for p in box]
                    ys = [p[1] for p in box]
                    x = int(min(xs))
                    y = int(min(ys))
                    w = int(max(xs) - x)
                    h = int(max(ys) - y)

                    words.append({
                        "word": clean_text,
                        "confidence": round(score_val, 2),
                        "bbox": [x, y, w, h]
                    })

                avg_conf = round(float(np.mean(confidences)), 2) if confidences else 0.0
                return {
                    "engine": "rapidocr",
                    "raw_text": "\n".join(lines),
                    "words": words,
                    "avg_confidence": avg_conf,
                    "low_confidence_word_count": low_conf_count,
                    "total_words": len(words),
                }
        except Exception as e:
            logger.warning(f"RapidOCR execution failed: {e}. Falling back to next engine.")

    # 2. Secondary: Tesseract
    if _HAS_TESSERACT and engine in ("auto", "tesseract"):
        try:
            rgb = cv2.cvtColor(img_cv, cv2.COLOR_BGR2RGB)
            data = pytesseract.image_to_data(rgb, output_type=pytesseract.Output.DICT)
            
            words = []
            confidences = []
            raw_words = []
            low_conf_count = 0

            n_boxes = len(data["text"])
            for i in range(n_boxes):
                text = data["text"][i].strip()
                conf = float(data["conf"][i])
                if text and conf >= 0:
                    norm_conf = round(conf / 100.0, 2)
                    words.append({
                        "word": text,
                        "confidence": norm_conf,
                        "bbox": [data["left"][i], data["top"][i], data["width"][i], data["height"][i]]
                    })
                    confidences.append(norm_conf)
                    raw_words.append(text)
                    if norm_conf < 0.60:
                        low_conf_count += 1

            avg_conf = round(float(np.mean(confidences)), 2) if confidences else 0.0

            return {
                "engine": "tesseract",
                "raw_text": " ".join(raw_words),
                "words": words,
                "avg_confidence": avg_conf,
                "low_confidence_word_count": low_conf_count,
                "total_words": len(words),
            }
        except Exception as e:
            logger.warning(f"Tesseract OCR encountered error: {e}.")

    # 3. Tertiary Fallback: OpenCV Heuristic
    return _run_opencv_heuristic_ocr(img_cv)
