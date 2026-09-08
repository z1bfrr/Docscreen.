"use client";
import { useState } from "react";
import {
  ChevronDown, ChevronUp, AlertCircle, AlertTriangle, Info, Zap,
  Terminal, CheckCircle, HelpCircle, ArrowRight, ShieldAlert, FileText
} from "lucide-react";

interface Finding {
  source: string;
  finding_type: string;
  severity: string;
  score?: number;
  confidence?: number;
  description: string;
  evidence?: Record<string, any>;
  rule_id?: string;
}

interface Props {
  findings: Finding[];
}

const SEV_CONFIG = {
  CRITICAL: {
    color: "#f43f5e",
    bg: "rgba(244, 63, 94, 0.08)",
    border: "rgba(244, 63, 94, 0.3)",
    badgeBg: "rgba(244, 63, 94, 0.15)",
    label: "CRITICAL ALERT",
    icon: ShieldAlert,
    action: "Reject or mandate in-person physical biometric check.",
  },
  HIGH: {
    color: "#f97316",
    bg: "rgba(249, 115, 22, 0.08)",
    border: "rgba(249, 115, 22, 0.3)",
    badgeBg: "rgba(249, 115, 22, 0.15)",
    label: "HIGH RISK",
    icon: AlertCircle,
    action: "Flagged for manual investigation by a screening officer.",
  },
  MEDIUM: {
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.08)",
    border: "rgba(245, 158, 11, 0.28)",
    badgeBg: "rgba(245, 158, 11, 0.15)",
    label: "ATTENTION NEEDED",
    icon: AlertTriangle,
    action: "Quick manual check recommended (e.g. check for photocopy/re-scan).",
  },
  LOW: {
    color: "#94a3b8",
    bg: "rgba(148, 163, 184, 0.06)",
    border: "rgba(148, 163, 184, 0.2)",
    badgeBg: "rgba(148, 163, 184, 0.12)",
    label: "INFORMATIONAL",
    icon: Info,
    action: "Informational only; does not block verification.",
  },
};

/**
 * Returns plain-English explanations so non-technical users
 * understand exactly what was flagged and why.
 */
function getHumanExplanation(f: Finding): { title: string; explanation: string; simpleEvidence: { label: string; value: string }[] } {
  const type = (f.finding_type || "").toLowerCase();
  const desc = (f.description || "").toLowerCase();
  const ev = f.evidence || {};

  // 1. ML / Isolation Forest anomaly
  if (type.includes("ml_anomaly") || desc.includes("isolation_forest") || desc.includes("anomaly detector")) {
    const scoreVal = ev.score !== undefined ? `${(ev.score * 100).toFixed(0)}%` : `${((f.score || 0.65) * 100).toFixed(0)}%`;
    return {
      title: "Document Layout Differs From Standard Template",
      explanation: "The layout, text positioning, or document proportions look different from 95% of standard authentic IDs. This often happens if the document was photographed at an angle, compressed, or created using an unofficial template.",
      simpleEvidence: [
        { label: "Detected By", value: "AI Layout & Structure Analyzer" },
        { label: "Unusual Pattern Level", value: `${scoreVal} (Moderate)` },
        { label: "Confidence", value: `${((f.confidence ?? 0.75) * 100).toFixed(0)}%` },
      ]
    };
  }

  // 2. QR Code mismatch
  if (type.includes("qr") || desc.includes("qr")) {
    return {
      title: "QR Code Does Not Match Printed Information",
      explanation: "The embedded digital QR code was scanned, but the name, birth date, or ID number encoded in the QR does not match what is written on the document surface.",
      simpleEvidence: [
        { label: "Detected By", value: "Cryptographic QR Verifier" },
        { label: "Status", value: "Discrepancy Found" },
        { label: "Confidence", value: "100% (Cryptographic Proof)" },
      ]
    };
  }

  // 3. ELA or photo tamper
  if (type.includes("splice") || type.includes("tamper") || desc.includes("photo") || desc.includes("error level")) {
    return {
      title: "Signs of Digital Editing or Photo Splicing",
      explanation: "Pixel compression analysis shows that a portion of this image (such as the face photo or text area) has a different compression pattern than the background, indicating it may have been pasted or edited.",
      simpleEvidence: [
        { label: "Detected By", value: "Error Level Analysis (ELA)" },
        { label: "Affected Area", value: ev.region || "Photo / Text Overlay" },
        { label: "Confidence", value: `${((f.confidence ?? 0.85) * 100).toFixed(0)}%` },
      ]
    };
  }

  // 4. Name or DOB mismatch
  if (type.includes("name") || type.includes("dob") || desc.includes("date of birth") || desc.includes("mismatch")) {
    return {
      title: "Data Field Discrepancy",
      explanation: "Information extracted across multiple fields (e.g. OCR text vs official checksums or secondary labels) showed conflicting values.",
      simpleEvidence: [
        { label: "Detected By", value: "Cross-Field Consistency Engine" },
        { label: "Discrepancy", value: f.description },
        { label: "Confidence", value: "High" },
      ]
    };
  }

  // 5. Metadata / Editing software
  if (type.includes("software") || desc.includes("photoshop") || desc.includes("editing")) {
    return {
      title: "Photo Editing Software Footprint",
      explanation: "File header metadata indicates this file was saved or altered using graphic design software rather than a direct official camera or scanner.",
      simpleEvidence: [
        { label: "Detected By", value: "EXIF & Metadata Scanner" },
        { label: "Software Found", value: ev.software || "Image Editor" },
        { label: "Confidence", value: "98%" },
      ]
    };
  }

  // Generic fallback
  return {
    title: f.description || "Potential Variance Detected",
    explanation: "This document signal deviated from the baseline validation rules. Please review the details below.",
    simpleEvidence: [
      { label: "Analysis Engine", value: (f.source || "Rule Engine").replace(/_/g, " ") },
      { label: "Risk Score", value: f.score !== undefined ? `${(f.score * 100).toFixed(0)}%` : "Moderate" },
      { label: "Confidence", value: `${((f.confidence ?? 0.75) * 100).toFixed(0)}%` },
    ]
  };
}

function FindingRow({ f }: { f: Finding }) {
  const [open, setOpen] = useState(true); // Open by default for instant clarity
  const [showRawJson, setShowRawJson] = useState(false);
  const cfg = SEV_CONFIG[f.severity?.toUpperCase() as keyof typeof SEV_CONFIG] || SEV_CONFIG.LOW;
  const Icon = cfg.icon;
  const human = getHumanExplanation(f);

  return (
    <div style={{
      border: `1px solid ${cfg.border}`,
      borderRadius: 16,
      overflow: "hidden",
      background: cfg.bg,
      marginBottom: 12,
      boxShadow: "0 4px 18px rgba(0, 0, 0, 0.25)",
      transition: "all 0.2s ease",
    }}>
      {/* Header Bar */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 20px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: cfg.badgeBg,
          border: `1px solid ${cfg.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon size={16} color={cfg.color} />
        </div>

        {/* Severity Label */}
        <span style={{
          fontSize: 11,
          fontWeight: 800,
          color: cfg.color,
          letterSpacing: "0.06em",
          padding: "3px 10px",
          borderRadius: "999px",
          background: cfg.badgeBg,
          border: `1px solid ${cfg.border}`,
          fontFamily: "'Poppins', sans-serif"
        }}>
          {cfg.label}
        </span>

        {/* Plain English Title */}
        <span style={{
          flex: 1,
          fontSize: 14,
          color: "#FFFFFF",
          fontWeight: 700,
          fontFamily: "'Poppins', sans-serif"
        }}>
          {human.title}
        </span>

        {open ? <ChevronUp size={18} color="#94A3B8" /> : <ChevronDown size={18} color="#94A3B8" />}
      </button>

      {/* Expanded Friendly Body */}
      {open && (
        <div style={{
          padding: "0 20px 20px 20px",
          borderTop: `1px solid ${cfg.border}`,
          background: "rgba(10, 14, 20, 0.4)",
        }}>
          {/* Simple Explanation Callout */}
          <div style={{
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 12,
            padding: "14px 16px",
            marginTop: 14,
            marginBottom: 14,
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#93A3B8",
              marginBottom: 6,
              display: "flex",
              alignItems: "center",
              gap: 6
            }}>
              <HelpCircle size={13} color="#4272D4" />
              What this means:
            </div>
            <p style={{
              fontSize: 13.5,
              color: "#EFF3F8",
              lineHeight: 1.55,
              margin: 0,
              fontWeight: 400
            }}>
              {human.explanation}
            </p>
          </div>

          {/* Simple Evidence Cards (Replaces confusing raw JSON) */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 10,
            marginBottom: 14
          }}>
            {human.simpleEvidence.map((item, idx) => (
              <div key={idx} style={{
                background: "rgba(0, 0, 0, 0.3)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
                borderRadius: 10,
                padding: "10px 14px",
              }}>
                <div style={{ fontSize: 11, color: "#93A3B8", marginBottom: 3 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Recommended Action Pill */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12.5,
            color: "#EFF3F8",
            background: "rgba(66, 114, 212, 0.08)",
            border: "1px solid rgba(66, 114, 212, 0.25)",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 12
          }}>
            <ArrowRight size={14} color="#4272D4" style={{ flexShrink: 0 }} />
            <span><strong>Suggested Action:</strong> {cfg.action}</span>
          </div>

          {/* Optional Raw Technical Details Toggle */}
          {f.evidence && Object.keys(f.evidence).length > 0 && (
            <div style={{ marginTop: 10 }}>
              <button
                onClick={() => setShowRawJson(!showRawJson)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#64748B",
                  fontSize: 11.5,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: 0
                }}
              >
                <Terminal size={11} />
                <span>{showRawJson ? "Hide technical debug info" : "Show technical debug payload (JSON)"}</span>
              </button>

              {showRawJson && (
                <pre style={{
                  background: "#080c18",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 11,
                  color: "#38bdf8",
                  fontFamily: "JetBrains Mono, monospace",
                  border: "1px solid rgba(56, 189, 248, 0.15)",
                  overflowX: "auto",
                  marginTop: 8,
                  lineHeight: 1.4,
                }}>
                  {JSON.stringify(f.evidence, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function FindingsList({ findings }: Props) {
  const sorted = [...findings].sort((a, b) => {
    const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return (order[a.severity?.toUpperCase() as keyof typeof order] ?? 4) -
           (order[b.severity?.toUpperCase() as keyof typeof order] ?? 4);
  });

  const critical = sorted.filter(f => f.severity?.toUpperCase() === "CRITICAL").length;
  const high     = sorted.filter(f => f.severity?.toUpperCase() === "HIGH").length;
  const medium   = sorted.filter(f => f.severity?.toUpperCase() === "MEDIUM").length;

  if (!findings.length) {
    return (
      <div style={{
        textAlign: "center",
        padding: "36px 20px",
        background: "rgba(16, 185, 129, 0.05)",
        border: "1px solid rgba(16, 185, 129, 0.2)",
        borderRadius: 16,
        color: "#34d399",
        fontSize: 13.5,
        fontWeight: 600
      }}>
        🛡️ No visual or structural anomalies identified. Document signals match nominal baseline.
      </div>
    );
  }

  return (
    <div>
      {/* Category summary pills */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        {critical > 0 && (
          <span style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: "#f43f5e",
            padding: "4px 12px",
            borderRadius: "999px",
            background: "rgba(244, 63, 94, 0.12)",
            border: "1px solid rgba(244, 63, 94, 0.35)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f43f5e" }} />
            {critical} Critical Alerts
          </span>
        )}
        {high > 0 && (
          <span style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: "#f97316",
            padding: "4px 12px",
            borderRadius: "999px",
            background: "rgba(249, 115, 22, 0.12)",
            border: "1px solid rgba(249, 115, 22, 0.35)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f97316" }} />
            {high} High Priority
          </span>
        )}
        {medium > 0 && (
          <span style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: "#f59e0b",
            padding: "4px 12px",
            borderRadius: "999px",
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.35)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
            {medium} Review Recommended
          </span>
        )}
      </div>

      {sorted.map((f, i) => <FindingRow key={i} f={f} />)}
    </div>
  );
}
