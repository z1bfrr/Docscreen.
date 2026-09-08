"""
DocScreen — Template Layout Analyzer.
Verifies document visual geometry against expected template layout:
detects missing, shifted, or anomalous regions (photo, ID number, QR code).
"""
import cv2
import numpy as np
from typing import Dict, Any, List, Optional
from app.templates.template_store import TEMPLATES


def analyze_layout(
    img_cv: np.ndarray,
    matched_template: Optional[str],
    words: Optional[List[Dict]] = None
) -> Dict[str, Any]:
    """
    Compares visual features and text locations to expected layout.
    """
    if not matched_template or matched_template not in TEMPLATES:
        return {
            "similarity_score": 0.85,
            "status": "template_unmatched",
            "shifted_regions": [],
            "missing_regions": [],
            "unexpected_regions": [],
        }

    template = TEMPLATES[matched_template]
    expected_regions = template.get("expected_regions", {})
    h, w = img_cv.shape[:2]

    # Convert detected word bboxes to relative coordinates
    word_boxes = []
    for wd in (words or []):
        bx, by, bw, bh = wd.get("bbox", [0, 0, 0, 0])
        if w > 0 and h > 0:
            word_boxes.append((bx / w, by / h, bw / w, bh / h))

    missing_regions = []
    shifted_regions = []

    # Check for photo region (face or portrait rectangle)
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY) if len(img_cv.shape) == 3 else img_cv
    photo_expected = expected_regions.get("photo")
    if photo_expected:
        px, py, pw, ph = photo_expected["rel_bbox"]
        # Extract candidate photo patch
        y1, y2 = int(py * h), int((py + ph) * h)
        x1, x2 = int(px * w), int((px + pw) * w)
        patch = gray[y1:y2, x1:x2]
        
        # A valid photo patch has visual variance and texture
        if patch.size > 0:
            std_dev = float(np.std(patch))
            if std_dev < 12.0:  # Very flat / blank, missing photo
                missing_regions.append("photo")

    # Check text regions presence from words
    for reg_name, reg_info in expected_regions.items():
        if reg_name == "photo":
            continue
        rx, ry, rw, rh = reg_info["rel_bbox"]
        # Count words falling roughly inside or close to this region
        found = any(
            (rx - 0.08 <= wx <= rx + rw + 0.08) and (ry - 0.08 <= wy <= ry + rh + 0.08)
            for wx, wy, _, _ in word_boxes
        )
        if not found and reg_info.get("importance") == "CRITICAL":
            # For critical fields, check if shifted elsewhere
            if word_boxes:
                shifted_regions.append({
                    "region": reg_name,
                    "expected_bbox": [rx, ry, rw, rh],
                    "observed_state": "displaced_or_obscured"
                })

    # Compute overall similarity score
    penalties = len(missing_regions) * 0.20 + len(shifted_regions) * 0.15
    similarity_score = max(0.20, min(0.98, round(1.0 - penalties, 2)))

    return {
        "similarity_score": similarity_score,
        "matched_template": matched_template,
        "shifted_regions": shifted_regions,
        "missing_regions": missing_regions,
        "unexpected_regions": [],
    }
