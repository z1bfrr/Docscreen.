"""
Isolation Forest anomaly detector.
Pluggable interface — ready to swap for autoencoder or Gemini embedding-based detector.
"""
import logging
import numpy as np
import joblib
import os
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

_model = None
_MODEL_LOADED = False


def load_model() -> bool:
    """Load Isolation Forest model from disk. Called at startup."""
    global _model, _MODEL_LOADED
    path = settings.model_path
    if path.exists():
        try:
            _model = joblib.load(str(path))
            _MODEL_LOADED = True
            logger.info(f"Isolation Forest model loaded from {path}")
            return True
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            return False
    else:
        logger.warning(f"Model not found at {path} — anomaly engine disabled")
        return False


def _build_feature_vector(signals: Dict[str, float]) -> np.ndarray:
    """
    Build 13-feature vector from analysis signals.
    Feature order must match training (see scripts/train_anomaly_model.py).
    """
    features = [
        signals.get("ocr_avg_confidence", 0.8),
        signals.get("template_similarity_score", 0.8),
        signals.get("layout_deviation", 0.0),
        signals.get("image_quality_score", 85.0) / 100.0,
        signals.get("blur_score", 85.0) / 100.0,
        signals.get("compression_inconsistency", 0.0),
        signals.get("tamper_indicator_score", 0.0),
        signals.get("text_alignment_score", 0.8),
        signals.get("pattern_validation_failures", 0),
        signals.get("qr_consistency_score", 1.0),
        signals.get("metadata_anomaly_score", 0.0),
        signals.get("ocr_disagreement", 0.0),
        signals.get("cross_field_inconsistency_count", 0),
    ]
    return np.array(features, dtype=np.float32).reshape(1, -1)


def predict_anomaly(signals: Dict[str, float]) -> Dict[str, Any]:
    """
    Run anomaly detection.
    Returns: anomaly_score, anomaly_label, isolation_forest_score
    """
    if not _MODEL_LOADED or _model is None:
        # Rule-based fallback when model unavailable
        return _rule_based_fallback(signals)

    try:
        fv = _build_feature_vector(signals)
        raw_score = float(_model.decision_function(fv)[0])
        prediction = int(_model.predict(fv)[0])  # -1 = anomaly, 1 = normal

        # Normalize: decision_function returns negative for anomalies
        # Typical range: -0.5 to 0.5; we invert and normalize to 0-1
        normalized = round(min(1.0, max(0.0, 0.5 - raw_score)), 3)

        # Require strong outlier deviation OR corroborating hard signals
        # "Hard" signals: tamper > 0.35, metadata software detected (score > 0.3),
        #  pattern failures, or QR mismatch
        hard_signals_present = (
            signals.get("tamper_indicator_score", 0.0) > 0.35
            or signals.get("metadata_anomaly_score", 0.0) > 0.40
            or signals.get("pattern_validation_failures", 0) > 1
            or signals.get("cross_field_inconsistency_count", 0) > 0
        )

        # Require normalized >= 0.70 for a standalone anomaly call,
        # or >= 0.58 with at least one hard corroborating signal
        is_anomaly = (
            (normalized >= 0.70)
            or (normalized >= 0.58 and hard_signals_present)
        )
        label = "ANOMALY_DETECTED" if is_anomaly else "NORMAL"

        return {
            "anomaly_score": raw_score,
            "anomaly_label": label,
            "isolation_forest_score": normalized,
            "model_used": "isolation_forest",
            "status": "complete",
        }
    except Exception as e:
        logger.error(f"Anomaly prediction error: {e}")
        return _rule_based_fallback(signals)


def _rule_based_fallback(signals: Dict[str, float]) -> Dict[str, Any]:
    """
    Heuristic anomaly score when model is unavailable.
    Flags as anomaly only when MULTIPLE independent risk signals are elevated.
    A single weak signal should NOT trigger ANOMALY.
    """
    score = 0.0
    score += signals.get("tamper_indicator_score", 0.0) * 0.35
    score += (1 - signals.get("template_similarity_score", 1.0)) * 0.20
    score += signals.get("cross_field_inconsistency_count", 0) / 10 * 0.20
    score += signals.get("metadata_anomaly_score", 0.0) * 0.10
    score += (1 - signals.get("ocr_avg_confidence", 1.0)) * 0.15

    score = round(min(1.0, score), 3)

    # Count how many signals are meaningfully elevated
    elevated_signals = 0
    if signals.get("tamper_indicator_score", 0.0) > 0.20:
        elevated_signals += 1
    if signals.get("cross_field_inconsistency_count", 0) > 0:
        elevated_signals += 1
    if signals.get("metadata_anomaly_score", 0.0) > 0.35:
        elevated_signals += 1
    if signals.get("pattern_validation_failures", 0) > 1:
        elevated_signals += 1
    if (1 - signals.get("template_similarity_score", 1.0)) > 0.25:
        elevated_signals += 1

    # Require score > 0.55 AND at least 2 independent elevated signals
    label = "ANOMALY_DETECTED" if (score > 0.55 and elevated_signals >= 2) else "NORMAL"

    return {
        "anomaly_score": -score,   # negative to match IF convention
        "anomaly_label": label,
        "isolation_forest_score": score,
        "model_used": "rule_based_fallback",
        "status": "model_unavailable",
    }


def is_model_loaded() -> bool:
    return _MODEL_LOADED
