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
        
        # 1. Keyword matching (weighted heavily: 65%)
        matched_keywords = [kw for kw in template["keywords"] if kw in text_lower]
        keyword_score = len(matched_keywords) / max(len(template["keywords"]), 1)
        if matched_keywords:
            score += min(0.65, len(matched_keywords) * 0.20)

        # 2. Aspect ratio compatibility (weighted: 25%)
        expected_ar = template["aspect_ratio"]
        tol = template["aspect_ratio_tolerance"]
        if abs(aspect_ratio - expected_ar) <= tol:
            score += 0.25
        else:
            score += max(0.0, 0.25 - abs(aspect_ratio - expected_ar) * 0.2)

        # 3. Specific ID format cues (15%)
        if key == "AADHAAR":
            if any(len(w.get("word", "")) == 4 and w.get("word", "").isdigit() for w in (words or [])) or "uidai" in text_lower or "aadhaar" in text_lower:
                score += 0.20
        elif key == "PAN":
            if any(len(w.get("word", "")) == 10 and w.get("word", "")[:5].isalpha() for w in (words or [])) or "income tax" in text_lower or "permanent account" in text_lower:
                score += 0.20
        elif key == "PASSPORT":
            if "p<ind" in text_lower or "republic of india" in text_lower and "passport" in text_lower:
                score += 0.25
        elif key == "DRIVING_LICENSE":
            if re.search(r'\b[A-Z]{2}[0-9]{2}\s?[0-9]{11}\b', raw_text) or any(k in text_lower for k in ["driving", "licence", "license", "transport", "dl no", "tamil nadu", "validity (nt)"]):
                score += 0.35

        if score > best_score:
            best_score = score
            best_match = key

    # Confidence threshold: if we found meaningful signals
    if best_score >= 0.25 and best_match:
        confidence = min(0.98, max(0.65, best_score))
        return {
            "document_type": TEMPLATES[best_match]["name"],
            "confidence": round(confidence, 2),
            "matched_template": best_match,
        }
    else:
        # Generic heuristic fallback
        return {
            "document_type": "Unknown Identity Document",
            "confidence": 0.30,
            "matched_template": None,
        }
