"""
Train Isolation Forest anomaly detector on synthetic feature vectors.
Run: python scripts/train_anomaly_model.py
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import numpy as np
import joblib
from pathlib import Path
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import json

MODEL_DIR = Path("models_store")
MODEL_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = MODEL_DIR / "isolation_forest.pkl"

# ── Feature column names (must match isolation_forest.py) ────────────────────
FEATURE_NAMES = [
    "ocr_avg_confidence",
    "template_similarity_score",
    "layout_deviation",
    "image_quality_score_norm",
    "blur_score_norm",
    "compression_inconsistency",
    "tamper_indicator_score",
    "text_alignment_score",
    "pattern_validation_failures",
    "qr_consistency_score",
    "metadata_anomaly_score",
    "ocr_disagreement",
    "cross_field_inconsistency_count_norm",
]

rng = np.random.RandomState(42)


def _authentic_samples(n=500):
    """Normal documents — high quality, consistent."""
    return np.column_stack([
        rng.uniform(0.82, 0.98, n),   # ocr_avg_confidence
        rng.uniform(0.75, 0.98, n),   # template_similarity
        rng.uniform(0.00, 0.10, n),   # layout_deviation
        rng.uniform(0.80, 1.00, n),   # quality_score_norm
        rng.uniform(0.78, 0.99, n),   # blur_score_norm
        rng.uniform(0.00, 0.15, n),   # compression_inconsistency
        rng.uniform(0.00, 0.20, n),   # tamper_indicator
        rng.uniform(0.75, 0.98, n),   # text_alignment
        rng.randint(0, 2, n).astype(float),  # pattern_failures
        rng.uniform(0.85, 1.00, n),   # qr_consistency
        rng.uniform(0.00, 0.15, n),   # metadata_anomaly
        rng.uniform(0.00, 0.10, n),   # ocr_disagreement
        rng.uniform(0.00, 0.10, n),   # cross_field_norm
    ])


def _anomaly_samples(n=200):
    """Tampered/anomalous documents."""
    samples = []
    # Text tampered
    s1 = _authentic_samples(n // 4)
    s1[:, 0] *= rng.uniform(0.4, 0.75, n // 4)  # lower OCR confidence
    s1[:, 4] = rng.uniform(0.4, 0.85, n // 4)   # worse template
    s1[:, 8] = rng.randint(2, 5, n // 4).astype(float)  # more violations
    s1[:, 12] = rng.uniform(0.3, 0.8, n // 4)   # cross-field issues
    samples.append(s1)

    # Tamper region
    s2 = _authentic_samples(n // 4)
    s2[:, 6] = rng.uniform(0.55, 0.99, n // 4)  # high tamper score
    s2[:, 5] = rng.uniform(0.40, 0.80, n // 4)  # compression issues
    samples.append(s2)

    # QR mismatch
    s3 = _authentic_samples(n // 4)
    s3[:, 9] = rng.uniform(0.0, 0.2, n // 4)   # qr_consistency low
    s3[:, 12] = rng.uniform(0.5, 1.0, n // 4)  # cross_field high
    samples.append(s3)

    # Layout anomaly
    s4 = _authentic_samples(n // 4)
    s4[:, 1] = rng.uniform(0.2, 0.6, n // 4)  # low template similarity
    s4[:, 2] = rng.uniform(0.3, 0.8, n // 4)  # high layout deviation
    samples.append(s4)

    return np.vstack(samples)


def main():
    print("Training Isolation Forest anomaly model...")

    X_normal = _authentic_samples(500)
    X_anomaly = _anomaly_samples(200)
    X_all = np.vstack([X_normal, X_anomaly])

    print(f"  Training samples: {len(X_normal)} normal + {len(X_anomaly)} anomalous = {len(X_all)} total")

    model = IsolationForest(
        n_estimators=200,
        max_samples="auto",
        contamination=0.25,
        random_state=42,
        n_jobs=1,
    )

    # Fit primarily on normal data (unsupervised)
    model.fit(X_normal)

    # Evaluate on mixed
    preds_normal = model.predict(X_normal)
    preds_anomaly = model.predict(X_anomaly)
    normal_acc = np.mean(preds_normal == 1) * 100
    anomaly_recall = np.mean(preds_anomaly == -1) * 100

    print(f"\n  Normal correct:  {normal_acc:.1f}%")
    print(f"  Anomaly recall:  {anomaly_recall:.1f}%")

    # Save model
    joblib.dump(model, str(MODEL_PATH))
    print(f"\n[SUCCESS] Model saved to {MODEL_PATH.resolve()}")

    # Save metadata
    meta = {
        "model_type": "IsolationForest",
        "n_estimators": 200,
        "contamination": 0.25,
        "features": FEATURE_NAMES,
        "training_samples": len(X_normal),
        "normal_accuracy": round(normal_acc, 2),
        "anomaly_recall": round(anomaly_recall, 2),
        "model_version": "IF-001",
    }
    with open(MODEL_DIR / "model_meta.json", "w") as f:
        json.dump(meta, f, indent=2)
    print(f"   Metadata: {MODEL_DIR / 'model_meta.json'}")


if __name__ == "__main__":
    main()
