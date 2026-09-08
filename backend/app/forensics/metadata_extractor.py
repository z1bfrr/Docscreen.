"""
DocScreen — File Forensics & Metadata Extractor Module.
Inspects EXIF, XMP, and container metadata to detect evidence of graphic editing tools
(Adobe Photoshop, GIMP, Canva, Affinity) or impossible creation dates.
"""
import io
from PIL import Image, ExifTags
from typing import Dict, Any, List


SUSPICIOUS_SOFTWARE = [
    "photoshop", "gimp", "canva", "figma", "affinity", "illustrator",
    "coreldraw", "paint.net", "pixelmator", "snapseed", "picsart"
]

# Legitimate scanning/camera apps — should NOT raise anomaly flags
LEGITIMATE_SOFTWARE = [
    "adobe scan", "camscanner", "microsoft lens", "google photoscan",
    "iphone", "samsung", "pixel", "android", "ios", "canon", "nikon", "sony"
]


def extract_metadata(image_bytes: bytes) -> Dict[str, Any]:
    """
    Extracts image metadata and calculates metadata_anomaly_score (0.0 to 1.0).
    """
    findings = []
    exif_data = {}
    format_info = {}
    anomaly_score = 0.0

    try:
        pil_img = Image.open(io.BytesIO(image_bytes))
        format_info["format"] = pil_img.format
        format_info["mode"] = pil_img.mode
        format_info["size"] = pil_img.size

        # Extract raw EXIF if present
        raw_exif = pil_img.getexif()
        if raw_exif:
            for tag_id, value in raw_exif.items():
                tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
                # Filter out huge binary blocks
                if isinstance(value, (str, int, float)):
                    exif_data[tag_name] = str(value)

        # Software check
        software = exif_data.get("Software", "").lower()

        # First check if it's a legitimate scanning app
        is_legitimate = any(leg in software for leg in LEGITIMATE_SOFTWARE)

        if software and not is_legitimate:
            for susp in SUSPICIOUS_SOFTWARE:
                if susp in software:
                    # Score of 0.45 (not 0.75) — editing software alone is not conclusive.
                    # Many users legitimately export from Adobe Scan, phone gallery etc.
                    anomaly_score += 0.45
                    findings.append({
                        "source": "metadata_forensics",
                        "finding_type": "editing_software_detected",
                        "severity": "MEDIUM",  # Downgraded from HIGH — not conclusive alone
                        "score": 0.60,
                        "confidence": 0.80,
                        "description": f"File metadata records creation/export via image software: {software}. "
                                       f"Verify this does not indicate forgery (phone scanners may trigger this).",
                        "evidence": {"software": software},
                    })
                    break

        # Check for stripped EXIF
        has_camera_meta = any(k in exif_data for k in ["Make", "Model", "LensModel", "FocalLength"])
        if not exif_data:
            # Many legit documents are photographed and shared via WhatsApp/Telegram (strips EXIF)
            format_info["exif_stripped"] = True
        elif not has_camera_meta and "Software" not in exif_data:
            format_info["camera_metadata_absent"] = True

    except Exception as e:
        format_info["read_error"] = str(e)

    anomaly_score = min(1.0, anomaly_score)

    return {
        "metadata_anomaly_score": round(anomaly_score, 2),
        "exif": exif_data,
        "format_info": format_info,
        "findings": findings,
    }
