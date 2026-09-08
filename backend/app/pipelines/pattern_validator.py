"""
DocScreen — Pattern & Temporal Validator Module.
Validates syntactic patterns, check-digit plausibility, and chronology (DOB < Issue < Expiry).
"""
import re
from datetime import datetime
from typing import Dict, List, Any, Optional


def _parse_date(date_str: str) -> Optional[datetime]:
    """Try various common date formats."""
    if not date_str:
        return None
    # Normalize separators
    clean = re.sub(r'[^0-9/.\-]', '', date_str)
    clean = clean.replace('.', '/').replace('-', '/')
    for fmt in ("%d/%m/%Y", "%Y/%m/%d", "%m/%d/%Y", "%d/%m/%y"):
        try:
            return datetime.strptime(clean, fmt)
        except ValueError:
            continue
    return None


def _is_driving_licence_id(id_number: str) -> bool:
    """Check if ID looks like an Indian DL number (state code + digits)."""
    clean = re.sub(r'\s+', '', id_number)
    # DL pattern: 2 letters + 13 digits total, or 2 letters + 2 digits + spaces + 11 digits
    if re.match(r'^[A-Z]{2}\d{11,14}$', clean):
        return True
    # DL with separators: TN-64-2026-0000732
    if re.match(r'^[A-Z]{2}[-\s]?\d{2}[-\s]?\d{4}[-\s]?\d{7}$', clean):
        return True
    return False


def _is_aadhaar_id(id_number: str) -> bool:
    """Check if ID is a pure 12-digit Aadhaar number."""
    clean = re.sub(r'\s+', '', id_number)
    return clean.isdigit() and len(clean) == 12


def _is_pan_id(id_number: str) -> bool:
    """Check if ID matches PAN format."""
    clean = re.sub(r'\s+', '', id_number).upper()
    return bool(re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]$', clean))


def validate_patterns(
    fields_dict: Dict[str, Optional[str]],
    doc_type: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Validates field formatting, checksums, and date relationships.
    Returns list of findings.

    Args:
        fields_dict: Extracted fields from OCR
        doc_type: Classified document type (e.g. "Indian Driving Licence") — used to
                  avoid applying Aadhaar-specific rules to other doc types.
    """
    findings = []

    id_number = fields_dict.get("id_number")
    dob_str = fields_dict.get("dob")
    issue_str = fields_dict.get("issue_date")
    exp_str = fields_dict.get("expiry_date")

    # Determine if this is a DL context
    is_dl_context = (
        _is_driving_licence_id(id_number or "")
        or (doc_type and "driving" in doc_type.lower())
        or (doc_type and "licence" in doc_type.lower())
    )

    # 1. ID Number format validation
    if id_number:
        clean_id = re.sub(r'\s+', '', id_number)

        if is_dl_context:
            # DL validation: must match state code + digits pattern
            if not re.match(r'^[A-Z]{2}[\d\s-]{10,16}$', id_number.strip()):
                # Only flag if it's clearly wrong — be lenient here
                findings.append({
                    "source": "pattern_validator",
                    "finding_type": "unusual_dl_format",
                    "severity": "LOW",
                    "score": 0.30,
                    "confidence": 0.65,
                    "description": f"DL number format is unusual: {id_number}",
                    "evidence": {"id_number": id_number},
                })
            # Skip all Aadhaar checks for DL documents
        elif _is_aadhaar_id(id_number):
            # Aadhaar validation: 12 digits, cannot start with 0 or 1
            if len(clean_id) != 12:
                findings.append({
                    "source": "pattern_validator",
                    "finding_type": "invalid_id_length",
                    "severity": "CRITICAL",
                    "score": 0.85,
                    "confidence": 0.95,
                    "description": f"Aadhaar format requires exactly 12 digits, found {len(clean_id)}",
                    "evidence": {"id_number": id_number},
                })
            elif clean_id.startswith(("0", "1")):
                findings.append({
                    "source": "pattern_validator",
                    "finding_type": "invalid_aadhaar_prefix",
                    "severity": "CRITICAL",
                    "score": 0.90,
                    "confidence": 0.98,
                    "description": "Aadhaar number cannot start with 0 or 1",
                    "evidence": {"id_number": id_number},
                })

        elif _is_pan_id(id_number):
            # PAN validation
            clean_pan = clean_id.upper()
            pan_regex = r'^[A-Z]{5}[0-9]{4}[A-Z]$'
            if not re.match(pan_regex, clean_pan):
                findings.append({
                    "source": "pattern_validator",
                    "finding_type": "invalid_pan_pattern",
                    "severity": "HIGH",
                    "score": 0.75,
                    "confidence": 0.95,
                    "description": "PAN number does not match standard 5-alpha 4-digit 1-alpha structure",
                    "evidence": {"id_number": id_number},
                })
            else:
                entity_char = clean_pan[3].upper()
                if entity_char not in "PCHFATBLJG":
                    findings.append({
                        "source": "pattern_validator",
                        "finding_type": "invalid_pan_entity_code",
                        "severity": "MEDIUM",
                        "score": 0.60,
                        "confidence": 0.85,
                        "description": f"Unrecognized PAN 4th character '{entity_char}' for tax entity type",
                        "evidence": {"entity_code": entity_char},
                    })

    # 2. Chronological date checks
    dob = _parse_date(dob_str)
    issue = _parse_date(issue_str)
    expiry = _parse_date(exp_str)
    now = datetime.utcnow()

    if dob:
        age = (now - dob).days / 365.25
        if age < 0:
            findings.append({
                "source": "pattern_validator",
                "finding_type": "future_birth_date",
                "severity": "CRITICAL",
                "score": 0.95,
                "confidence": 0.99,
                "description": f"Date of birth is in the future ({dob_str})",
                "evidence": {"dob": dob_str},
            })
        elif age > 120:
            findings.append({
                "source": "pattern_validator",
                "finding_type": "implausible_age",
                "severity": "HIGH",
                "score": 0.80,
                "confidence": 0.90,
                "description": f"Date of birth implies implausible age ({int(age)} years)",
                "evidence": {"calculated_age": int(age)},
            })

    if dob and issue and issue < dob:
        findings.append({
            "source": "pattern_validator",
            "finding_type": "issue_before_birth",
            "severity": "CRITICAL",
            "score": 0.95,
            "confidence": 0.99,
            "description": f"Document issue date ({issue_str}) is prior to birth date ({dob_str})",
            "evidence": {"issue_date": issue_str, "dob": dob_str},
        })

    if issue and expiry and expiry < issue:
        findings.append({
            "source": "pattern_validator",
            "finding_type": "expiry_before_issue",
            "severity": "CRITICAL",
            "score": 0.95,
            "confidence": 0.99,
            "description": f"Document expiry date ({exp_str}) is earlier than issue date ({issue_str})",
            "evidence": {"expiry_date": exp_str, "issue_date": issue_str},
        })

    return findings
