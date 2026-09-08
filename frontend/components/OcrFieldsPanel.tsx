"use client";
import { useState } from "react";
import { Copy, Check, Target } from "lucide-react";

interface OcrField {
  field_name: string;
  value?: string;
  confidence?: number;
  bbox?: number[];
}

interface Props {
  fields: OcrField[];
  onFieldClick?: (bbox: number[]) => void;
}

export function OcrFieldsPanel({ fields, onFieldClick }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleClick = (f: OcrField) => {
    setSelected(f.field_name === selected ? null : f.field_name);
    if (f.bbox && onFieldClick) onFieldClick(f.bbox);
  };

  const handleCopy = (e: React.MouseEvent, val: string, name: string) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(val);
    setCopiedField(name);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const confColor = (c?: number) => {
    if (!c) return "#94a3b8";
    if (c >= 0.85) return "#34d399";
    if (c >= 0.65) return "#fbbf24";
    return "#f43f5e";
  };

  const formatLabel = (s: string) =>
    s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  const activeFields = fields.filter(f => f.value);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
      {activeFields.map((f, i) => {
        const isSelected = selected === f.field_name;
        const conf = f.confidence ?? 0.85;
        const color = confColor(conf);

        return (
          <div
            key={i}
            onClick={() => handleClick(f)}
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px", borderRadius: 10,
              background: isSelected
                ? "linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)"
                : "rgba(255, 255, 255, 0.025)",
              border: isSelected
                ? "1px solid rgba(56, 189, 248, 0.35)"
                : "1px solid rgba(255, 255, 255, 0.06)",
              cursor: f.bbox ? "pointer" : "default",
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
              <div style={{ width: 120, flexShrink: 0 }}>
                <div style={{
                  fontSize: 10.5, fontWeight: 700, color: "#64748b",
                  textTransform: "uppercase", letterSpacing: "0.5px"
                }}>
                  {formatLabel(f.field_name)}
                </div>
              </div>

              <div style={{
                fontSize: 13, color: "#f8fafc", fontWeight: 600,
                fontFamily: f.field_name.includes("id") || f.field_name.includes("dob") || f.field_name.includes("date")
                  ? "JetBrains Mono, monospace" : "inherit",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                marginRight: 10
              }}>
                {f.value || "—"}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {/* Confidence Pill */}
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "2px 7px", borderRadius: 6,
                background: "rgba(0, 0, 0, 0.3)",
                border: `1px solid ${color}35`,
              }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: color }} />
                <span className="font-mono" style={{ fontSize: 10.5, fontWeight: 700, color }}>
                  {(conf * 100).toFixed(0)}%
                </span>
              </div>

              {/* Copy button */}
              {f.value && (
                <button
                  onClick={(e) => handleCopy(e, f.value!, f.field_name)}
                  title="Copy value"
                  style={{
                    background: "transparent", border: "none", cursor: "pointer",
                    color: copiedField === f.field_name ? "#34d399" : "#64748b",
                    padding: 4, borderRadius: 4, display: "flex", alignItems: "center"
                  }}
                >
                  {copiedField === f.field_name ? <Check size={13} /> : <Copy size={13} />}
                </button>
              )}

              {/* Target pinpoint indicator if bbox exists */}
              {f.bbox && (
                <div title="Coordinates available" style={{ color: "#38bdf8" }}>
                  <Target size={14} />
                </div>
              )}
            </div>
          </div>
        );
      })}

      {activeFields.length === 0 && (
        <div style={{
          color: "#64748b", fontSize: 12.5, padding: "20px", textAlign: "center",
          background: "rgba(255,255,255,0.02)", borderRadius: 10
        }}>
          No structured identity fields parsed from this document.
        </div>
      )}
    </div>
  );
}
