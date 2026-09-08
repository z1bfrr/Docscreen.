"""
Model evaluation script — Precision, Recall, F1, confusion matrix.
Run: python scripts/evaluate_model.py
"""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import numpy as np
import joblib
from pathlib import Path
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, confusion_matrix, classification_report
)

MODEL_PATH = Path("models_store/isolation_forest.pkl")


def build_test_set():
    """Build labeled test set with known ground truth."""
    rng = np.random.RandomState(99)

    def normal(n):
        return np.column_stack([
            rng.uniform(0.82, 0.98, n),
            rng.uniform(0.75, 0.98, n),
            rng.uniform(0.00, 0.10, n),
            rng.uniform(0.80, 1.00, n),
            rng.uniform(0.78, 0.99, n),
            rng.uniform(0.00, 0.15, n),
            rng.uniform(0.00, 0.20, n),
            rng.uniform(0.75, 0.98, n),
            rng.randint(0, 2, n).astype(float),
            rng.uniform(0.85, 1.00, n),
            rng.uniform(0.00, 0.15, n),
            rng.uniform(0.00, 0.10, n),
            rng.uniform(0.00, 0.10, n),
        ])

    def text_tampered(n):
        s = normal(n)
        s[:, 0] *= rng.uniform(0.4, 0.7, n)
        s[:, 8] = rng.randint(2, 6, n).astype(float)
        s[:, 12] = rng.uniform(0.4, 0.9, n)
        return s

    def photo_tampered(n):
        s = normal(n)
        s[:, 6] = rng.uniform(0.55, 0.99, n)
        s[:, 5] = rng.uniform(0.40, 0.80, n)
        return s

    def layout_tampered(n):
        s = normal(n)
        s[:, 1] = rng.uniform(0.2, 0.6, n)
        s[:, 2] = rng.uniform(0.3, 0.8, n)
        return s

    def qr_mismatch(n):
        s = normal(n)
        s[:, 9] = rng.uniform(0.0, 0.2, n)
        s[:, 12] = rng.uniform(0.5, 1.0, n)
        return s

    n_each = 50
    X_normal   = normal(n_each);       y_normal   = [1]  * n_each
    X_text     = text_tampered(n_each); y_text     = [-1] * n_each
    X_photo    = photo_tampered(n_each); y_photo   = [-1] * n_each
    X_layout   = layout_tampered(n_each); y_layout = [-1] * n_each
    X_qr       = qr_mismatch(n_each);  y_qr       = [-1] * n_each

    X = np.vstack([X_normal, X_text, X_photo, X_layout, X_qr])
    y = y_normal + y_text + y_photo + y_layout + y_qr
    cats = (["authentic"] * n_each + ["text_tampered"] * n_each +
            ["photo_tampered"] * n_each + ["layout_tampered"] * n_each +
            ["qr_mismatch"] * n_each)

    return X, np.array(y), cats


def main():
    if not MODEL_PATH.exists():
        print(f"[FAIL] Model not found at {MODEL_PATH}")
        print("   Run: python scripts/train_anomaly_model.py")
        return

    model = joblib.load(str(MODEL_PATH))
    print(f"[OK] Model loaded from {MODEL_PATH}\n")

    X, y_true, categories = build_test_set()
    y_pred = model.predict(X)

    # IF outputs: 1=normal, -1=anomaly
    # Convert to binary: 1=anomaly, 0=normal for standard metrics
    y_true_bin = (y_true == -1).astype(int)
    y_pred_bin = (y_pred == -1).astype(int)

    acc  = accuracy_score(y_true_bin, y_pred_bin)
    prec = precision_score(y_true_bin, y_pred_bin, zero_division=0)
    rec  = recall_score(y_true_bin, y_pred_bin, zero_division=0)
    f1   = f1_score(y_true_bin, y_pred_bin, zero_division=0)
    cm   = confusion_matrix(y_true_bin, y_pred_bin)

    print("=" * 50)
    print("  ANOMALY DETECTION EVALUATION")
    print("=" * 50)
    print(f"  Accuracy:  {acc:.3f}")
    print(f"  Precision: {prec:.3f}")
    print(f"  Recall:    {rec:.3f}")
    print(f"  F1 Score:  {f1:.3f}")
    print(f"\n  Confusion Matrix:")
    print(f"    TN={cm[0,0]}, FP={cm[0,1]}")
    print(f"    FN={cm[1,0]}, TP={cm[1,1]}")

    print("\n  Per-Category Detection:")
    n = 50
    cats = ["authentic", "text_tampered", "photo_tampered", "layout_tampered", "qr_mismatch"]
    for i, cat in enumerate(cats):
        start = i * n
        end   = start + n
        preds = y_pred[start:end]
        correct = sum(1 for p, t in zip(preds, y_true[start:end]) if p == t)
        print(f"    {cat:20s}: {correct}/{n} ({correct/n*100:.0f}%)")


if __name__ == "__main__":
    main()
