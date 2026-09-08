"""
Risk Engine — weighted signal fusion into 0-100 risk score.
Configurable weights. Critical findings escalate score.
"""
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# ── Signal Weights (must sum to 1.0) ─────────────────────────────────────────
SIGNAL_WEIGHTS = {
    "visual_tamper":         0.25,
    "template_layout":       0.15,
    "cross_field":           0.15,
    "ml_anomaly":            0.15,
    "ocr_anomalies":         0.10,
    "pattern_violations":    0.10,
    "metadata_anomalies":    0.05,
    "image_quality":         0.05,
}

# ── Risk Thresholds ───────────────────────────────────────────────────────────
RISK_LOW_MAX    = 30
RISK_MEDIUM_MAX = 65
# > 65 → HIGH


def _risk_label(score: int) -> str:
    if score <= RISK_LOW_MAX:
        return "LOW"
    elif score <= RISK_MEDIUM_MAX:
        return "MEDIUM"
    return "HIGH"


def _tamper_to_score(tamper_indicator: float) -> float:
    """Normalize tamper score 0-1 → 0-100."""
    return round(tamper_indicator * 100, 1)


def _layout_to_score(similarity: float, shifted: int, missing: int) -> float:
    """Low similarity + shifted/missing regions → high score."""
    base = (1.0 - similarity) * 100
    penalty = shifted * 8 + missing * 12
    return round(min(100.0, base + penalty), 1)


def _cross_field_to_score(inconsistency_count: int, critical_count: int) -> float:
    base = min(100.0, inconsistency_count * 20.0)
    base += critical_count * 15.0
    return round(min(100.0, base), 1)


def _ml_anomaly_to_score(isolation_forest_score: float, label: str) -> float:
    if label == "ANOMALY_DETECTED":
        return round(isolation_forest_score * 100, 1)
    return round(isolation_forest_score * 40, 1)


def _ocr_to_score(avg_confidence: float, low_conf_count: int) -> float:
    conf_score = (1.0 - avg_confidence) * 70
    low_conf_penalty = min(30.0, low_conf_count * 5.0)
    return round(min(100.0, conf_score + low_conf_penalty), 1)


def _pattern_to_score(violation_count: int, has_critical: bool) -> float:
    base = min(80.0, violation_count * 20.0)
    if has_critical:
        base += 20.0
    return round(min(100.0, base), 1)


def _metadata_to_score(metadata_anomaly_score: float) -> float:
    return round(metadata_anomaly_score * 100, 1)


def _quality_to_score(quality_score: float) -> float:
    """Low quality → high risk contribution."""
    return round(max(0, 100.0 - quality_score), 1)


@dataclass
class RiskSignalResult:
    signal: str
    weight: float
    raw_score: float
    contribution: float


def compute_risk(
    tamper_score: float = 0.0,
    tamper_suspicious_regions: int = 0,
    template_similarity: float = 1.0,
    layout_shifted: int = 0,
    layout_missing: int = 0,
    cross_field_inconsistencies: int = 0,
    cross_field_critical: int = 0,
    ml_isolation_score: float = 0.0,
    ml_label: str = "NORMAL",
    ocr_avg_confidence: float = 1.0,
    ocr_low_conf_words: int = 0,
    pattern_violations: int = 0,
    has_critical_pattern: bool = False,
    metadata_anomaly_score: float = 0.0,
    quality_score: float = 90.0,
    findings: Optional[List[Dict]] = None,
) -> Dict[str, Any]:
    """
    Compute weighted risk score from all pipeline signals.
    Returns risk_score (0-100), risk_label, breakdown, and final findings list.
    """
    findings = findings or []

    # Compute per-signal raw scores (0-100)
    s_tamper   = _tamper_to_score(tamper_score)
    s_layout   = _layout_to_score(template_similarity, layout_shifted, layout_missing)
    s_cross    = _cross_field_to_score(cross_field_inconsistencies, cross_field_critical)
    s_ml       = _ml_anomaly_to_score(ml_isolation_score, ml_label)
    s_ocr      = _ocr_to_score(ocr_avg_confidence, ocr_low_conf_words)
    s_pattern  = _pattern_to_score(pattern_violations, has_critical_pattern)
    s_meta     = _metadata_to_score(metadata_anomaly_score)
    s_quality  = _quality_to_score(quality_score)

    signal_scores = {
        "visual_tamper":      s_tamper,
        "template_layout":    s_layout,
        "cross_field":        s_cross,
        "ml_anomaly":         s_ml,
        "ocr_anomalies":      s_ocr,
        "pattern_violations": s_pattern,
        "metadata_anomalies": s_meta,
        "image_quality":      s_quality,
    }

    # Weighted sum
    weighted_total = 0.0
    breakdown = []
    for sig, w in SIGNAL_WEIGHTS.items():
        raw = signal_scores[sig]
        contribution = round(raw * w, 2)
        weighted_total += contribution
        breakdown.append(RiskSignalResult(
            signal=sig, weight=w, raw_score=raw, contribution=contribution
        ))

    risk_score = int(round(min(100.0, weighted_total)))

    # ── Security Findings Escalation ──
    # Any CRITICAL finding elevates score to at least 75 (HIGH RISK)
    has_critical = any(f.get("severity") == "CRITICAL" for f in findings)
    if has_critical and risk_score < 75:
        risk_score = 75

    # Multiple or single HIGH findings escalate
    high_count = sum(1 for f in findings if f.get("severity") == "HIGH")
    if high_count >= 2 and risk_score < 68:
        risk_score = 68
    elif high_count == 1 and risk_score < 48:
        risk_score = 48

    # Severe visual tamper score escalation
    if tamper_score >= 0.60 and risk_score < 72:
        risk_score = 72
    elif tamper_score >= 0.35 and risk_score < 42:
        risk_score = 42

    label = _risk_label(risk_score)

    breakdown_dicts = [
        {"signal": b.signal, "weight": b.weight,
         "raw_score": b.raw_score, "contribution": b.contribution}
        for b in sorted(breakdown, key=lambda x: x.contribution, reverse=True)
    ]

    return {
        "risk_score": risk_score,
        "risk_label": label,
        "risk_breakdown": breakdown_dicts,
        "signal_scores": signal_scores,
        "has_critical_finding": has_critical,
    }
