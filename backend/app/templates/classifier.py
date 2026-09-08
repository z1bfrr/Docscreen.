"""
DocScreen — Document Template Classifier.
Classifies input documents into one of the known identity document types
based on aspect ratio matching, keywords in OCR text, and visual layout cues.
"""
import re
from typing import Dict, Any, List, Optional
from app.templates.template_store import TEMPLATES


def classify_document(
    width: int,
    height: int,
    raw_text: str,
    words: Optional[List[Dict]] = None
) -> Dict[str, Any]:
    """
    Classifies document and returns:
    - document_type (e.g. "Indian Driving Licence", "Aadhaar Card", "PAN Card", "Passport", etc.)
    - confidence (0.0 to 1.0)
    - matched_template (key like "AADHAAR", "PAN", "DRIVING_LICENSE", etc.)
    """
    if width <= 0 or height <= 0:
        aspect_ratio = 1.58
    else:
        # Standardize aspect ratio (width >= height for horizontal card)
        aspect_ratio = max(width, height) / max(min(width, height), 1)

    text_lower = raw_text.lower() if raw_text else ""
    
    best_match = None
    best_score = 0.0

    for key, template in TEMPLATES.items():
        score = 0.0
        cues_matched = 0

        # 1. Keyword matching (weighted heavily: up to 0.65)
        matched_keywords = [kw for kw in template["keywords"] if kw in text_lower]
        if matched_keywords:
            cues_matched += len(matched_keywords)
            score += min(0.65, len(matched_keywords) * 0.22)

        # 2. Specific ID format cues (up to 0.40)
        if key == "AADHAAR":
            has_12_digits = bool(re.search(r'\b\d{4}\s\d{4}\s\d{4}\b', raw_text) or re.search(r'\b\d{12}\b', raw_text))
            has_aadhaar_terms = any(k in text_lower for k in ["uidai", "aadhaar", "government ofindia", "government of india", "मेरा आधार", "भारत सरकार", "आधार"])
            has_gender_dob = any(k in text_lower for k in ["male", "female", "dob", "जन्म तिथि", "पुरुष", "महिला"])
            if has_12_digits and has_aadhaar_terms:
                score += 0.40
                cues_matched += 2
            elif has_12_digits and has_gender_dob:
                score += 0.35
                cues_matched += 2
            elif has_12_digits:
                score += 0.20
                cues_matched += 1
            elif has_aadhaar_terms:
                score += 0.25
                cues_matched += 1

        elif key == "DRIVING_LICENSE":
            has_dl_pattern = bool(
                re.search(r'\b[A-Z]{2}[-\s]?[0-9]{2}[-\s]?[0-9]{4}[-\s]?[0-9]{7}\b', raw_text) or
                re.search(r'\b[A-Z]{2}[0-9]{2}\s?[0-9]{11}\b', raw_text) or
                re.search(r'\b[A-Z]{2}[0-9]{13,15}\b', raw_text)
            )
            has_dl_terms = any(k in text_lower for k in [
                "driving licence", "driving license", "indian union driving",
                "transport department", "validity (nt)", "validity (tr)", "dl no", "licence no", "authorization to drive"
            ])
            if has_dl_pattern and has_dl_terms:
                score += 0.50
                cues_matched += 2
            elif has_dl_pattern:
                score += 0.35
                cues_matched += 1
            elif has_dl_terms:
                score += 0.35
                cues_matched += 1

        elif key == "PAN":
            has_pan_num = bool(re.search(r'\b[A-Z]{5}[0-9]{4}[A-Z]\b', raw_text))
            has_pan_terms = any(k in text_lower for k in ["income tax", "permanent account", "father's name"])
            if has_pan_num:
                score += 0.40
                cues_matched += 2
            elif has_pan_terms:
                score += 0.25
                cues_matched += 1

        elif key == "PASSPORT":
            has_passport_cue = bool("p<ind" in text_lower or re.search(r'\b[A-Z][0-9]{7}\b', raw_text))
            if has_passport_cue:
                score += 0.35
                cues_matched += 1

        elif key == "VOTER_ID":
            has_voter_cue = bool(re.search(r'\b[A-Z]{3}[0-9]{7}\b', raw_text) or "election commission" in text_lower)
            if has_voter_cue:
                score += 0.35
                cues_matched += 1

        # 3. Aspect ratio compatibility bonus (only if at least one textual cue matched)
        if cues_matched > 0:
            expected_ar = template["aspect_ratio"]
            tol = template["aspect_ratio_tolerance"]
            if abs(aspect_ratio - expected_ar) <= tol:
                score += 0.15

        if score > best_score and cues_matched > 0:
            best_score = score
            best_match = key

    # Confidence threshold: require at least 0.30 score AND a matched template
    if best_score >= 0.30 and best_match:
        confidence = min(0.98, max(0.70, best_score))
        return {
            "document_type": TEMPLATES[best_match]["name"],
            "confidence": round(confidence, 2),
            "matched_template": best_match,
        }
    else:
        # Fallback when no template positively matched
        return {
            "document_type": "Unknown Identity Document",
            "confidence": 0.25,
            "matched_template": None,
        }
