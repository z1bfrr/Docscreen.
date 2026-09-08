"""
DocScreen — Document Template Definitions.
Defines layout geometry, keywords, and region coordinates for standard identity documents.
"""
from typing import Dict, Any, List

TEMPLATES: Dict[str, Dict[str, Any]] = {
    "AADHAAR": {
        "name": "Aadhaar Card",
        "aspect_ratio": 1.58,  # Standard ID-1 card (85.6mm x 53.98mm)
        "aspect_ratio_tolerance": 0.25,
        "keywords": [
            "government of india", "government ofindia", "unique identification", "aadhaar",
            "mera aadhaar", "uidai", "enrollment", "help@uidai.gov.in", "meri pehchan",
            "bharat sarkar", "भारत सरकार", "आधार", "भारतीय विशिष्ट पहचान प्राधिकरण",
            "मेरा आधार", "मेरी पहचान", "आम आदमी का अधिकार"
        ],
        "expected_regions": {
            "header": {"rel_bbox": [0.05, 0.02, 0.90, 0.18], "importance": "HIGH"},
            "photo": {"rel_bbox": [0.05, 0.22, 0.28, 0.48], "importance": "CRITICAL"},
            "name": {"rel_bbox": [0.35, 0.22, 0.40, 0.10], "importance": "HIGH"},
            "dob": {"rel_bbox": [0.35, 0.34, 0.40, 0.10], "importance": "HIGH"},
            "gender": {"rel_bbox": [0.35, 0.46, 0.30, 0.10], "importance": "MEDIUM"},
            "id_number": {"rel_bbox": [0.15, 0.78, 0.70, 0.14], "importance": "CRITICAL"},
            "qr_code": {"rel_bbox": [0.75, 0.25, 0.22, 0.45], "importance": "HIGH"},
        }
    },
    "PAN": {
        "name": "PAN Card",
        "aspect_ratio": 1.58,
        "aspect_ratio_tolerance": 0.25,
        "keywords": [
            "income tax department", "govt of india", "permanent account number",
            "pan", "father's name", "signature"
        ],
        "expected_regions": {
            "header": {"rel_bbox": [0.05, 0.02, 0.90, 0.20], "importance": "HIGH"},
            "photo": {"rel_bbox": [0.05, 0.30, 0.26, 0.46], "importance": "CRITICAL"},
            "name": {"rel_bbox": [0.34, 0.28, 0.60, 0.10], "importance": "HIGH"},
            "father_name": {"rel_bbox": [0.34, 0.40, 0.60, 0.10], "importance": "MEDIUM"},
            "dob": {"rel_bbox": [0.34, 0.52, 0.40, 0.10], "importance": "HIGH"},
            "id_number": {"rel_bbox": [0.34, 0.64, 0.50, 0.14], "importance": "CRITICAL"},
            "signature": {"rel_bbox": [0.60, 0.80, 0.35, 0.16], "importance": "MEDIUM"},
        }
    },
    "PASSPORT": {
        "name": "Passport",
        "aspect_ratio": 1.42,
        "aspect_ratio_tolerance": 0.30,
        "keywords": [
            "passport", "republic of india", "type p", "code ind",
            "nationality", "mrz", "p<ind"
        ],
        "expected_regions": {
            "header": {"rel_bbox": [0.05, 0.02, 0.90, 0.15], "importance": "HIGH"},
            "photo": {"rel_bbox": [0.05, 0.20, 0.30, 0.45], "importance": "CRITICAL"},
            "mrz": {"rel_bbox": [0.02, 0.75, 0.96, 0.22], "importance": "CRITICAL"},
            "id_number": {"rel_bbox": [0.65, 0.12, 0.30, 0.10], "importance": "CRITICAL"},
            "name": {"rel_bbox": [0.38, 0.20, 0.58, 0.12], "importance": "HIGH"},
        }
    },
    "DRIVING_LICENSE": {
        "name": "Indian Driving Licence",
        "aspect_ratio": 1.58,
        "aspect_ratio_tolerance": 0.30,
        "keywords": [
            "driving licence", "driving license", "indian union driving licence",
            "transport department", "dl no", "licence no", "license no",
            "authorization to drive", "authorisation to drive", "motor vehicles department",
            "validity", "validity (nt)", "validity (tr)", "date of birth", "blood group",
            "tamil nadu", "karnataka", "maharashtra", "delhi", "kerala", "gujarat",
            "andhra", "telangana", "son/daughter/wife", "form 7", "rto", "parivahan"
        ],
        "expected_regions": {
            "header": {"rel_bbox": [0.05, 0.02, 0.90, 0.20], "importance": "HIGH"},
            "photo": {"rel_bbox": [0.60, 0.18, 0.35, 0.55], "importance": "CRITICAL"},
            "id_number": {"rel_bbox": [0.15, 0.16, 0.65, 0.14], "importance": "CRITICAL"},
            "name": {"rel_bbox": [0.05, 0.35, 0.65, 0.14], "importance": "HIGH"},
            "dob": {"rel_bbox": [0.05, 0.48, 0.45, 0.12], "importance": "HIGH"},
            "validity": {"rel_bbox": [0.15, 0.25, 0.55, 0.14], "importance": "MEDIUM"},
        }
    },
    "VOTER_ID": {
        "name": "Voter ID",
        "aspect_ratio": 1.58,
        "aspect_ratio_tolerance": 0.25,
        "keywords": [
            "election commission of india", "elector photo identity card", "epic",
            "voter", "identity card"
        ],
        "expected_regions": {
            "header": {"rel_bbox": [0.05, 0.02, 0.90, 0.20], "importance": "HIGH"},
            "photo": {"rel_bbox": [0.05, 0.25, 0.30, 0.50], "importance": "CRITICAL"},
            "id_number": {"rel_bbox": [0.60, 0.15, 0.35, 0.10], "importance": "CRITICAL"},
            "name": {"rel_bbox": [0.38, 0.28, 0.58, 0.12], "importance": "HIGH"},
        }
    }
}


def get_template(template_id: str) -> Dict[str, Any]:
    """Retrieve template definition by key."""
    return TEMPLATES.get(template_id.upper(), {})
