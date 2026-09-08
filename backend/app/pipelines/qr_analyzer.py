"""
DocScreen — QR Code & Barcode Analyzer.
Detects, extracts, and parses QR codes and barcodes from document images.
Uses OpenCV's built-in QRCodeDetector with fallback to pyzbar if installed.
"""
import re
import cv2
import numpy as np
from typing import Dict, Any


def _parse_qr_payload(data: str) -> Dict[str, str]:
    """
    Parses Aadhaar XML/JSON or key-value formatted QR payloads.
    """
    fields = {}
    if not data:
        return fields

    # Check for Aadhaar XML QR: <PrintLetterBarcodeData uid="..." name="..." dob="..." />
    if "<PrintLetterBarcodeData" in data or "uid=" in data:
        for attr in ("uid", "name", "gender", "dob", "yob", "co", "house", "street", "loc", "vtc", "po", "dist", "state", "pc"):
            match = re.search(rf'{attr}="([^"]*)"', data, re.IGNORECASE)
            if match:
                fields[attr] = match.group(1)
        if "uid" in fields and "id_number" not in fields:
            fields["id_number"] = fields["uid"]
        return fields

    # Check JSON
    if data.strip().startswith("{") and data.strip().endswith("}"):
        try:
            import json
            obj = json.loads(data)
            if isinstance(obj, dict):
                return {str(k): str(v) for k, v in obj.items()}
        except Exception:
            pass

    # Check delimiter separated (e.g. name, id, dob)
    parts = re.split(r'[,;|\n]', data)
    for part in parts:
        if ":" in part:
            k, v = part.split(":", 1)
            fields[k.strip().lower().replace(" ", "_")] = v.strip()

    return fields


def analyze_qr(img_cv: np.ndarray) -> Dict[str, Any]:
    """
    Detects QR code, decodes raw payload, and parses structured fields.
    """
    # 1. Try OpenCV QRCodeDetector
    detector = cv2.QRCodeDetector()
    data, bbox, _ = detector.detectAndDecode(img_cv)

    # 2. Try pyzbar if OpenCV found nothing
    if not data:
        try:
            from pyzbar.pyzbar import decode
            decoded_objects = decode(img_cv)
            if decoded_objects:
                data = decoded_objects[0].data.decode("utf-8", errors="ignore")
        except Exception:
            pass

    if not data:
        return {
            "qr_status": "not_found",
            "raw_data": None,
            "qr_fields": {},
        }

    qr_fields = _parse_qr_payload(data)
    return {
        "qr_status": "decoded",
        "raw_data": data[:200] + ("..." if len(data) > 200 else ""),
        "qr_fields": qr_fields,
    }
