"""
Main analysis pipeline — orchestrates all modules in order.
Graceful degradation: each module failure is caught and logged.
"""
import uuid
import hashlib
import logging
import io
import time
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import cv2
from PIL import Image

from app.core.config import settings
from app.vision.preprocessor import preprocess_image
from app.vision.tamper_detector import analyze_tamper
from app.ocr.tesseract_engine import run_ocr
from app.ocr.structured_extractor import extract_fields, compute_ocr_disagreement
from app.templates.classifier import classify_document
from app.templates.layout_analyzer import analyze_layout
from app.pipelines.pattern_validator import validate_patterns
from app.pipelines.consistency_checker import check_consistency
from app.pipelines.qr_analyzer import analyze_qr
from app.forensics.metadata_extractor import extract_metadata
from app.anomaly.isolation_forest import predict_anomaly
from app.risk.risk_engine import compute_risk

logger = logging.getLogger(__name__)


def _sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _get_dimensions(image_bytes: bytes) -> Tuple[int, int]:
    try:
        img = Image.open(io.BytesIO(image_bytes))
        return img.width, img.height
    except Exception:
        return 0, 0


def _step(name: str, status: str, detail: str = "") -> Dict:
    return {"step": name, "status": status, "detail": detail,
            "timestamp": datetime.utcnow().isoformat()}


def _all_findings_as_dicts(findings_list: List) -> List[Dict]:
    """Convert dataclass findings to dicts."""
    result = []
    for f in findings_list:
        if hasattr(f, "__dict__"):
            result.append(f.__dict__)
        elif isinstance(f, dict):
            result.append(f)
    return result


async def run_pipeline(
    image_bytes: bytes,
    filename: str,
    mime_type: str,
    document_id: str,
) -> Dict[str, Any]:
    """
    Full analysis pipeline.
    Returns complete analysis result dict.
    """
    analysis_id = f"ANA-{uuid.uuid4().hex[:8].upper()}"
    steps: List[Dict] = []
    all_findings: List[Dict] = []
    start_time = time.time()

    result: Dict[str, Any] = {
        "analysis_id": analysis_id,
        "document_id": document_id,
        "status": "running",
        "pipeline_version": settings.PIPELINE_VERSION,
        "model_version": settings.MODEL_VERSION,
        "file_hash": _sha256(image_bytes),
        "created_at": datetime.utcnow().isoformat(),
    }

    # ── Step 1: File Validation ───────────────────────────────────────────────
    steps.append(_step("file_validation", "complete"))
    w, h = _get_dimensions(image_bytes)
    result["dimensions"] = {"width": w, "height": h}

    # ── Step 2: Image Preprocessing ──────────────────────────────────────────
    try:
        processed_bytes, quality, img_cv = preprocess_image(image_bytes)
        import dataclasses
        result["quality"] = dataclasses.asdict(quality)
        steps.append(_step("image_preprocessing", "complete",
                           f"Quality: {quality.quality_score}"))
    except Exception as e:
        logger.error(f"Preprocessing failed: {e}")
        steps.append(_step("image_preprocessing", "failed", str(e)))
        result["status"] = "error"
        result["error_message"] = "Image preprocessing failed"
        result["analysis_steps"] = steps
        return result

    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)

    # ── Step 3: OCR Extraction ────────────────────────────────────────────────
    ocr_result = {"engine": "none", "raw_text": "", "words": [],
                  "avg_confidence": 0.0, "low_confidence_word_count": 0, "total_words": 0}
    try:
        ocr_result = run_ocr(img_cv, engine=settings.OCR_ENGINE)
        result["ocr_status"] = "complete"
        result["ocr_avg_confidence"] = ocr_result["avg_confidence"]
        result["ocr_engine"] = ocr_result["engine"]
        steps.append(_step("ocr_extraction", "complete",
                           f"Words: {ocr_result['total_words']}, Avg conf: {ocr_result['avg_confidence']}"))
    except Exception as e:
        logger.error(f"OCR failed: {e}")
        result["ocr_status"] = "failed"
        steps.append(_step("ocr_extraction", "failed", str(e)))

    # ── Step 4: Document Classification ─────────────────────────────────────
    try:
        clf = classify_document(w, h, ocr_result.get("raw_text", ""), ocr_result.get("words"))
        result["document_type"] = clf["document_type"]
        result["classification_confidence"] = clf["confidence"]
        result["matched_template"] = clf.get("matched_template")
        steps.append(_step("document_classification", "complete",
                           f"Type: {clf['document_type']} ({clf['confidence']:.2f})"))
    except Exception as e:
        logger.error(f"Classification failed: {e}")
        result["document_type"] = "Unknown"
        result["classification_confidence"] = 0.0
        result["matched_template"] = None
        steps.append(_step("document_classification", "failed", str(e)))

    # ── Step 5: Structured Field Extraction ──────────────────────────────────
    extracted_fields_raw = []
    fields_dict: Dict[str, Optional[str]] = {}
    try:
        extracted_fields_raw = extract_fields(ocr_result)
        for ef in extracted_fields_raw:
            fields_dict[ef.field_name] = ef.value
        result["ocr_fields"] = [
            {"field_name": ef.field_name, "value": ef.value,
             "confidence": ef.confidence, "bbox": ef.bbox}
            for ef in extracted_fields_raw
        ]
        steps.append(_step("field_extraction", "complete",
                           f"Fields: {len(extracted_fields_raw)}"))
    except Exception as e:
        logger.error(f"Field extraction failed: {e}")
        steps.append(_step("field_extraction", "failed", str(e)))

    # ── Step 6: Template / Layout Analysis ───────────────────────────────────
    try:
        layout = analyze_layout(img_cv, result.get("matched_template"), ocr_result.get("words"))
        result["template_similarity"] = layout["similarity_score"]
        result["layout_details"] = layout
        steps.append(_step("template_analysis", "complete",
                           f"Similarity: {layout['similarity_score']}"))
        # Layout findings
        for shifted in layout.get("shifted_regions", []):
            all_findings.append({
                "source": "layout_analyzer", "finding_type": "shifted_region",
                "severity": "HIGH" if layout["similarity_score"] < 0.5 else "MEDIUM",
                "score": 1 - layout["similarity_score"],
                "confidence": 0.75,
                "description": f"Region '{shifted['region']}' shifted from expected position",
                "evidence": shifted,
            })
        for missing in layout.get("missing_regions", []):
            all_findings.append({
                "source": "layout_analyzer", "finding_type": "missing_region",
                "severity": "MEDIUM",
                "score": 0.6, "confidence": 0.7,
                "description": f"Expected region '{missing}' not found in document",
                "evidence": {"region": missing},
            })
    except Exception as e:
        logger.error(f"Layout analysis failed: {e}")
        result["template_similarity"] = 0.7
        result["layout_details"] = {"status": "unavailable"}
        steps.append(_step("template_analysis", "failed", str(e)))

    # ── Step 7: QR Analysis ───────────────────────────────────────────────────
    qr_fields = {}
    try:
        qr = analyze_qr(img_cv)
        result["qr_status"] = qr.get("qr_status", "not_found")
        result["qr_details"] = qr
        qr_fields = qr.get("qr_fields", {})
        steps.append(_step("qr_analysis", "complete", f"QR: {qr.get('qr_status')}"))

        # Check if QR code is expected for this document type (Aadhaar cards always carry a QR code)
        if result.get("document_type") == "Aadhaar Card" and result.get("qr_status") == "not_found":
            all_findings.append({
                "source": "qr_analyzer",
                "finding_type": "unreadable_or_missing_qr",
                "severity": "HIGH",
                "score": 0.75,
                "confidence": 0.85,
                "description": "Aadhaar security QR code is absent, unreadable, or fake. Genuine Aadhaar cards carry a machine-readable secure QR code.",
                "evidence": {"expected_in": "Aadhaar Card", "qr_status": "not_found"}
            })
    except Exception as e:
        logger.error(f"QR analysis failed: {e}")
        result["qr_status"] = "unavailable"
        steps.append(_step("qr_analysis", "failed", str(e)))

    # ── Step 8: Pattern Validation ────────────────────────────────────────────
    pattern_findings = []
    try:
        pattern_findings = validate_patterns(
            fields_dict,
            doc_type=result.get("document_type")
        )
        pf_dicts = _all_findings_as_dicts(pattern_findings)
        all_findings.extend(pf_dicts)
        steps.append(_step("pattern_validation", "complete",
                           f"Violations: {len(pattern_findings)}"))
    except Exception as e:
        logger.error(f"Pattern validation failed: {e}")
        steps.append(_step("pattern_validation", "failed", str(e)))

    # ── Step 9: Cross-Field Consistency ──────────────────────────────────────
    consistency_result = {"findings": [], "inconsistency_count": 0, "critical_count": 0}
    try:
        consistency_result = check_consistency(
            fields_dict, qr_fields,
            result.get("document_type"), result.get("matched_template")
        )
        cf_dicts = _all_findings_as_dicts(consistency_result["findings"])
        all_findings.extend(cf_dicts)
        result["consistency_details"] = {
            "inconsistency_count": consistency_result["inconsistency_count"],
            "critical_count": consistency_result["critical_count"],
        }
        steps.append(_step("consistency_check", "complete",
                           f"Inconsistencies: {consistency_result['inconsistency_count']}"))
    except Exception as e:
        logger.error(f"Consistency check failed: {e}")
        steps.append(_step("consistency_check", "failed", str(e)))

    # ── Step 10: Tamper Analysis ──────────────────────────────────────────────
    tamper_score = 0.0
    tamper = {}  # Always initialize so step 12 feature vector never errors
    suspicious_regions = []
    try:
        tamper = analyze_tamper(image_bytes)
        tamper_score = tamper.get("tamper_indicator_score", 0.0)
        suspicious_regions = tamper.get("suspicious_regions", [])
        result["tamper_score"] = tamper_score
        result["tamper_details"] = {
            "signals": tamper.get("signals", {}),
            "suspicious_regions": suspicious_regions,
        }
        # Save heatmap
        heatmap_bytes = tamper.get("forensic_heatmap_bytes")
        if heatmap_bytes:
            heatmap_path = settings.upload_path / f"{document_id}_heatmap.jpg"
            heatmap_path.write_bytes(heatmap_bytes)
            result["forensic_heatmap_path"] = f"{document_id}_heatmap.jpg"

        if suspicious_regions:
            has_severe = any(r.get("deviation", 0) > 10.0 or r.get("confidence", 0) > 0.90 for r in suspicious_regions)
            severity = "CRITICAL" if ((has_severe and len(suspicious_regions) >= 15) or tamper_score > 0.75) else (
                "HIGH" if (has_severe or tamper_score > 0.40 or len(suspicious_regions) >= 5) else "MEDIUM"
            )

            if len(suspicious_regions) > 5:
                max_dev = max(r.get("deviation", 4.0) for r in suspicious_regions)
                all_findings.append({
                    "source": "tamper_detection",
                    "finding_type": "noise_inconsistency_splice",
                    "severity": severity,
                    "score": tamper_score,
                    "confidence": 0.92,
                    "description": f"Extensive noise floor disparity ({len(suspicious_regions)} blocks, up to {max_dev:.1f}x deviation) indicates photo or text splicing",
                    "evidence": {"suspicious_region_count": len(suspicious_regions), "max_deviation": max_dev, "tamper_score": tamper_score},
                })
            else:
                for region in suspicious_regions:
                    all_findings.append({
                        "source": "tamper_detection",
                        "finding_type": region.get("type", "suspicious_region"),
                        "severity": severity,
                        "score": tamper_score,
                        "confidence": region.get("confidence", 0.7),
                        "description": f"Potential manipulation detected — {region.get('description', region.get('type'))}",
                        "evidence": {"bbox": region.get("bbox"), "tamper_score": tamper_score},
                    })

        steps.append(_step("tamper_analysis", "complete", f"Score: {tamper_score}"))
    except Exception as e:
        logger.error(f"Tamper analysis failed: {e}")
        result["tamper_score"] = 0.0
        steps.append(_step("tamper_analysis", "failed", str(e)))

    # ── Step 11: Metadata Forensics ───────────────────────────────────────────
    metadata_anomaly_score = 0.0
    try:
        meta = extract_metadata(image_bytes)
        metadata_anomaly_score = meta.get("metadata_anomaly_score", 0.0)
        result["metadata_anomaly_score"] = metadata_anomaly_score
        result["metadata_details"] = {"exif": meta.get("exif", {}),
                                       "format_info": meta.get("format_info", {})}
        all_findings.extend(meta.get("findings", []))
        steps.append(_step("metadata_forensics", "complete",
                           f"Anomaly: {metadata_anomaly_score}"))
    except Exception as e:
        logger.error(f"Metadata extraction failed: {e}")
        steps.append(_step("metadata_forensics", "failed", str(e)))

    # ── Step 12: Anomaly Detection ────────────────────────────────────────────
    layout_details = result.get("layout_details", {})
    shifted_count = len(layout_details.get("shifted_regions", []))
    missing_count = len(layout_details.get("missing_regions", []))
    layout_deviation = (shifted_count * 0.1 + missing_count * 0.15)

    is_aadhaar_no_qr = (result.get("document_type") == "Aadhaar Card" and result.get("qr_status") == "not_found")
    qr_consistency = 0.2 if is_aadhaar_no_qr else (
        1.0 if result.get("qr_status") == "not_found" else (
            0.0 if any(f.get("finding_type") == "qr_ocr_mismatch" for f in all_findings) else 1.0
        )
    )

    anomaly_signals = {
        "ocr_avg_confidence": ocr_result.get("avg_confidence", 0.8),
        "template_similarity_score": result.get("template_similarity", 0.8),
        "layout_deviation": layout_deviation,
        "image_quality_score": result.get("quality", {}).get("quality_score", 85.0),
        "blur_score": result.get("quality", {}).get("blur_score", 85.0),
        "compression_inconsistency": tamper.get("signals", {}).get("jpeg_block_inconsistency", 0.0),
        "tamper_indicator_score": tamper_score,
        "text_alignment_score": 0.8,
        "pattern_validation_failures": len(pattern_findings),
        "qr_consistency_score": qr_consistency,
        "metadata_anomaly_score": metadata_anomaly_score,
        "ocr_disagreement": 0.0,
        "cross_field_inconsistency_count": consistency_result.get("inconsistency_count", 0),
    }

    try:
        anomaly = predict_anomaly(anomaly_signals)
        result["anomaly_score"] = anomaly["anomaly_score"]
        result["anomaly_label"] = anomaly["anomaly_label"]
        result["anomaly_details"] = anomaly
        if anomaly["anomaly_label"] == "ANOMALY_DETECTED":
            iso_score = anomaly.get("isolation_forest_score", 0.0)
            ml_severity = "HIGH" if iso_score > 0.60 else "MEDIUM"
            all_findings.append({
                "source": "anomaly_detector",
                "finding_type": "ml_anomaly",
                "severity": ml_severity,
                "score": iso_score,
                "confidence": 0.80,
                "description": f"ML anomaly detector flagged this document as unusual (score: {iso_score:.3f})",
                "evidence": {"model": anomaly.get("model_used"),
                             "score": iso_score},
            })
        steps.append(_step("anomaly_detection", "complete",
                           f"Label: {anomaly['anomaly_label']}"))
    except Exception as e:
        logger.error(f"Anomaly detection failed: {e}")
        result["anomaly_score"] = 0.0
        result["anomaly_label"] = "UNKNOWN"
        steps.append(_step("anomaly_detection", "failed", str(e)))

    # ── Step 13: Risk Calculation ─────────────────────────────────────────────
    has_critical_pattern = any(
        getattr(f, "severity", f.get("severity") if isinstance(f, dict) else None) == "CRITICAL"
        for f in pattern_findings
    )
    try:
        risk = compute_risk(
            tamper_score=tamper_score,
            tamper_suspicious_regions=len(suspicious_regions),
            template_similarity=result.get("template_similarity", 0.8),
            layout_shifted=shifted_count,
            layout_missing=missing_count,
            cross_field_inconsistencies=consistency_result.get("inconsistency_count", 0),
            cross_field_critical=consistency_result.get("critical_count", 0),
            ml_isolation_score=result.get("anomaly_details", {}).get("isolation_forest_score", 0.0),
            ml_label=result.get("anomaly_label", "NORMAL"),
            ocr_avg_confidence=ocr_result.get("avg_confidence", 1.0),
            ocr_low_conf_words=ocr_result.get("low_confidence_word_count", 0),
            pattern_violations=len(pattern_findings),
            has_critical_pattern=has_critical_pattern,
            metadata_anomaly_score=metadata_anomaly_score,
            quality_score=result.get("quality", {}).get("quality_score", 90.0),
            findings=all_findings,
        )
        result["risk_score"] = risk["risk_score"]
        result["risk_label"] = risk["risk_label"]
        result["risk_breakdown"] = risk["risk_breakdown"]
        steps.append(_step("risk_calculation", "complete",
                           f"Score: {risk['risk_score']} ({risk['risk_label']})"))
    except Exception as e:
        logger.error(f"Risk calculation failed: {e}")
        result["risk_score"] = 50
        result["risk_label"] = "MEDIUM"
        steps.append(_step("risk_calculation", "failed", str(e)))

    # ── Finalize ──────────────────────────────────────────────────────────────
    result["findings"] = all_findings
    result["analysis_steps"] = steps
    result["status"] = "complete"
    result["completed_at"] = datetime.utcnow().isoformat()
    result["processing_time_seconds"] = round(time.time() - start_time, 2)

    def _sanitize(obj):
        if isinstance(obj, dict):
            return {str(k): _sanitize(v) for k, v in obj.items()}
        elif isinstance(obj, (list, tuple)):
            return [_sanitize(x) for x in obj]
        elif isinstance(obj, np.generic):
            return obj.item()
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        return obj

    return _sanitize(result)
