"use client";
import { CheckCircle2, Loader2, XCircle, Clock, ShieldCheck } from "lucide-react";

const STEPS = [
  "File Validation",
  "Image Preprocessing",
  "OCR Extraction",
  "Document Classification",
  "Structured Field Extraction",
  "Template Layout Analysis",
  "QR / Barcode Verification",
  "Pattern & Temporal Checks",
  "Cross-Field Consistency",
  "Forensic Tamper Detection",
  "Metadata & EXIF Forensics",
  "ML Anomaly Classification",
  "Multi-Signal Risk Fusion",
];

interface Props {
  steps: { step: string; status: string; detail?: string }[];
  currentStep?: number;
  complete?: boolean;
  riskScore?: number;
  riskLabel?: string;
}

export function AnalysisStepper({ steps, currentStep, complete, riskScore, riskLabel }: Props) {
  const getStatus = (idx: number) => {
    if (steps && steps[idx]) return steps[idx].status;
    if (currentStep === undefined) return "pending";
    if (idx < currentStep) return "complete";
    if (idx === currentStep) return "running";
    return "pending";
  };

  const completedCount = steps ? steps.filter(s => s.status === "complete").length : (complete ? STEPS.length : (currentStep || 0));
  const progressPct = Math.round((completedCount / STEPS.length) * 100);

  const colors = {
    LOW:    { stroke: "#10b981", glow: "rgba(16,185,129,0.3)",  text: "#34d399", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.35)" },
    MEDIUM: { stroke: "#f59e0b", glow: "rgba(245,158,11,0.3)",  text: "#fbbf24", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)" },
    HIGH:   { stroke: "#f43f5e", glow: "rgba(244,63,94,0.35)",   text: "#fb7185", bg: "rgba(244,63,94,0.14)", border: "rgba(244,63,94,0.4)" },
  };
  const riskKey = (riskLabel?.toUpperCase() || "LOW") as keyof typeof colors;
  const activeColor = colors[riskKey] || colors.LOW;

  return (
    <div className="glass-card" style={{ padding: "20px 18px", overflow: "hidden" }}>
      {/* Header with progress */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 13, color: "#f8fafc", letterSpacing: "0.5px" }}>
            EVALUATION PIPELINE
          </div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>
            13 Deep Forensic Layers
          </div>
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "3px 8px", borderRadius: 12,
          background: "rgba(59, 130, 246, 0.12)",
          border: "1px solid rgba(59, 130, 246, 0.3)",
          color: "#38bdf8", fontSize: 11, fontWeight: 700
        }}>
          <span className="font-mono">{progressPct}%</span>
        </div>
      </div>

      {/* Progress Line */}
      <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 16 }}>
        <div style={{
          height: "100%", width: `${progressPct}%`,
          background: "linear-gradient(90deg, #38bdf8, #6366f1)",
          boxShadow: "0 0 10px #38bdf8",
          transition: "width 0.4s ease"
        }} />
      </div>

      {/* Steps List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {STEPS.map((stepLabel, i) => {
          const status = getStatus(i);
          const detail = steps?.[i]?.detail;
          const isCurrent = status === "running";
          const isDone = status === "complete";
          const isFailed = status === "failed";

          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "5px 10px", borderRadius: 8,
              background: isCurrent ? "rgba(56, 189, 248, 0.1)" : "transparent",
              border: isCurrent ? "1px solid rgba(56, 189, 248, 0.3)" : "1px solid transparent",
              transition: "all 0.2s ease",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                {isDone ? (
                  <CheckCircle2 size={15} color="#10b981" />
                ) : isCurrent ? (
                  <Loader2 size={15} color="#38bdf8" className="animate-spin" />
                ) : isFailed ? (
                  <XCircle size={15} color="#f43f5e" />
                ) : (
                  <div style={{
                    width: 14, height: 14, borderRadius: "50%",
                    border: "1.5px solid rgba(255,255,255,0.15)",
                  }} />
                )}
                <span style={{
                  fontSize: 12.5,
                  color: isDone ? "#e2e8f0" : isCurrent ? "#38bdf8" : isFailed ? "#f43f5e" : "#64748b",
                  fontWeight: isCurrent ? 700 : isDone ? 500 : 400,
                }}>
                  {stepLabel}
                </span>
              </div>
              {detail && isDone && (
                <span className="font-mono" style={{ fontSize: 10, color: "#64748b" }}>
                  {detail}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Completed Callout */}
      {complete && riskScore !== undefined && (
        <div style={{
          marginTop: 16, padding: "14px",
          background: activeColor.bg,
          border: `1px solid ${activeColor.border}`,
          borderRadius: 12, textAlign: "center",
          boxShadow: `0 0 20px -5px ${activeColor.glow}`,
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            color: activeColor.text, fontWeight: 800, fontSize: 14, letterSpacing: "0.4px"
          }}>
            <ShieldCheck size={16} />
            PIPELINE EVALUATED
          </div>
          <div style={{
            color: "#ffffff", fontSize: 13, fontWeight: 700, marginTop: 4,
            fontFamily: "JetBrains Mono, monospace"
          }}>
            {riskLabel} RISK · {riskScore}/100
          </div>
        </div>
      )}
    </div>
  );
}
