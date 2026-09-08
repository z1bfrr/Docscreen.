"""
DocScreen — Cross-Field Consistency Checker Module.
Compares OCR extracted fields with QR/barcode decoded data and validates internal coherence.
"""
import re
from typing import Dict, Any, List, Optional


def _normalize_str(s: str) -> str:
    return re.sub(r'[^a-zA-Z0-9]', '', s.lower())


def check_consistency(
    fields_dict: Dict[str, Optional[str]],
    qr_fields: Dict[str, str],
    doc_type: Optional[str] = None,
    template_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    Cross-checks values across OCR and QR/Barcode payloads.
    Returns:
        findings: List of inconsistency findings
        inconsistency_count: total discrepancies
        critical_count: severe discrepancies
    """
    findings = []
    inconsistency_count = 0
    critical_count = 0

    ocr_id = fields_dict.get("id_number")
    ocr_name = fields_dict.get("name")
    ocr_dob = fields_dict.get("dob")

    qr_id = qr_fields.get("id_number") or qr_fields.get("uid") or qr_fields.get("pan")
    qr_name = qr_fields.get("name")
    qr_dob = qr_fields.get("dob")

    # 1. ID Number Consistency
    if ocr_id and qr_id:
        norm_ocr_id = _normalize_str(ocr_id)
        norm_qr_id = _normalize_str(qr_id)
        if norm_ocr_id != norm_qr_id:
            inconsistency_count += 1
            critical_count += 1
            findings.append({
                "source": "consistency_checker",
                "finding_type": "qr_ocr_mismatch",
                "severity": "CRITICAL",
                "score": 0.95,
                "confidence": 0.98,
                "description": f"ID number mismatch: OCR shows '{ocr_id}' but QR payload contains '{qr_id}'",
                "evidence": {"ocr_id": ocr_id, "qr_id": qr_id},
            })

    # 2. Name Consistency
    if ocr_name and qr_name:
        norm_ocr_name = _normalize_str(ocr_name)
        norm_qr_name = _normalize_str(qr_name)
        if norm_ocr_name != norm_qr_name and norm_ocr_name not in norm_qr_name and norm_qr_name not in norm_ocr_name:
            inconsistency_count += 1
            critical_count += 1
            findings.append({
                "source": "consistency_checker",
                "finding_type": "name_mismatch",
                "severity": "CRITICAL",
                "score": 0.90,
                "confidence": 0.95,
                "description": f"Name mismatch: OCR shows '{ocr_name}' but QR code registers '{qr_name}'",
                "evidence": {"ocr_name": ocr_name, "qr_name": qr_name},
            })

    # 3. DOB Consistency
    if ocr_dob and qr_dob:
        norm_ocr_dob = _normalize_str(ocr_dob)
        norm_qr_dob = _normalize_str(qr_dob)
        if norm_ocr_dob != norm_qr_dob:
            inconsistency_count += 1
            findings.append({
                "source": "consistency_checker",
                "finding_type": "dob_mismatch",
                "severity": "HIGH",
                "score": 0.85,
                "confidence": 0.92,
                "description": f"DOB discrepancy: OCR reads '{ocr_dob}' while QR contains '{qr_dob}'",
                "evidence": {"ocr_dob": ocr_dob, "qr_dob": qr_dob},
            })

    return {
        "findings": findings,
        "inconsistency_count": inconsistency_count,
        "critical_count": critical_count,
    }
