"use client";
import { useState } from "react";
import { submitReview } from "@/lib/api";
import { CheckCircle, XCircle, HelpCircle, Loader2 } from "lucide-react";

interface Props {
  analysisId: string;
  riskScore: number;
  riskLabel: string;
  onClose: () => void;
  onComplete: (decision: string) => void;
}

export function ReviewModal({ analysisId, riskScore, riskLabel, onClose, onComplete }: Props) {
  const [decision, setDecision] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const labelColor = riskLabel === "HIGH" ? "#f87171" : riskLabel === "MEDIUM" ? "#fbbf24" : "#34d399";

  const DECISIONS = [
    { id: "approve",      label: "APPROVE",         icon: CheckCircle,  color: "#34d399", bg: "rgba(52,211,153,0.1)" },
    { id: "reject",       label: "REJECT",           icon: XCircle,      color: "#f87171", bg: "rgba(248,113,113,0.1)" },
    { id: "request_info", label: "REQUEST MORE INFO", icon: HelpCircle,  color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  ];

  const handleSubmit = async () => {
    if (!decision) return;
    setLoading(true);
    try {
      await submitReview(analysisId, decision, notes);
      onComplete(decision);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, backdropFilter: "blur(4px)",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="glass-card" style={{ width: 480, padding: 28 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
            Human Review
          </div>
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Analysis ID: <span style={{ color: "var(--accent)" }}>{analysisId}</span>
            {" · "}<span style={{ color: labelColor, fontWeight: 600 }}>
              {riskLabel} RISK {riskScore}/100
            </span>
          </div>
        </div>

        <div style={{ marginBottom: 4, fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
          DECISION
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {DECISIONS.map(d => {
            const Icon = d.icon;
            const active = decision === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setDecision(d.id)}
                style={{
                  flex: 1, padding: "10px 8px",
                  border: `2px solid ${active ? d.color : "var(--border)"}`,
                  borderRadius: 8, background: active ? d.bg : "transparent",
                  color: active ? d.color : "var(--text-muted)",
                  cursor: "pointer", transition: "all 0.15s",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 4, fontSize: 10,
                  fontWeight: 700, letterSpacing: "0.5px",
                }}
              >
                <Icon size={18} />
                {d.label}
              </button>
            );
          })}
        </div>

        <div style={{ marginBottom: 4, fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
          NOTES (optional)
        </div>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Add review notes..."
          style={{
            width: "100%", minHeight: 80, padding: "10px 12px",
            background: "var(--bg-primary)", border: "1px solid var(--border)",
            borderRadius: 8, color: "var(--text-primary)", fontSize: 13,
            resize: "vertical", outline: "none",
            boxSizing: "border-box",
          }}
        />

        <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "flex-end" }}>
          <button className="btn-secondary" onClick={onClose} style={{ fontSize: 13 }}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!decision || loading}
            style={{ fontSize: 13, opacity: !decision ? 0.5 : 1 }}
          >
            {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "Submit Review"}
          </button>
        </div>
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
