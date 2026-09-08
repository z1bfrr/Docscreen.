"use client";
import { useState, useEffect } from "react";
import { compareAnalyses, getDocuments } from "@/lib/api";
import { FileSearch, CheckCircle2, XCircle, ArrowRightLeft, Sparkles, AlertCircle } from "lucide-react";

export default function ComparePage() {
  const [idA, setIdA] = useState("");
  const [idB, setIdB] = useState("");
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string|null>(null);

  useEffect(() => {
    getDocuments(1).then(d => setRecentDocs(d.documents || [])).catch(() => {});
  }, []);

  const handleCompare = async () => {
    if (!idA || !idB) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const r = await compareAnalyses(idA.trim(), idB.trim());
      setResult(r);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.3)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <FileSearch size={18} color="#38bdf8" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#ffffff" }}>
              Field-by-Field Identity Diff Engine
            </h1>
          </div>
          <p style={{ color: "#94a3b8", fontSize: 13 }}>
            Cross-compare two analysis reports side-by-side to detect altered credentials or forgery discrepancies
          </p>
        </div>
      </div>

      {/* Input Selection Card */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 50px 1fr", gap: 16, alignItems: "center" }}>
          <div>
            <label style={{
              fontSize: 11, color: "#94a3b8", fontWeight: 700,
              letterSpacing: "0.6px", textTransform: "uppercase", display: "block", marginBottom: 8
            }}>
              Analysis Document A
            </label>
            <input
              value={idA} onChange={e => setIdA(e.target.value)}
              placeholder="e.g. ANA-5A58DC3C"
              className="font-mono"
              style={{
                width: "100%", padding: "12px 14px",
                background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, color: "#f8fafc", fontSize: 13.5, outline: "none"
              }}
            />
          </div>

          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 40, height: 40, borderRadius: "50%",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            margin: "24px auto 0", color: "#64748b"
          }}>
            <ArrowRightLeft size={16} />
          </div>

          <div>
            <label style={{
              fontSize: 11, color: "#94a3b8", fontWeight: 700,
              letterSpacing: "0.6px", textTransform: "uppercase", display: "block", marginBottom: 8
            }}>
              Analysis Document B
            </label>
            <input
              value={idB} onChange={e => setIdB(e.target.value)}
              placeholder="e.g. ANA-3DC61E67"
              className="font-mono"
              style={{
                width: "100%", padding: "12px 14px",
                background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, color: "#f8fafc", fontSize: 13.5, outline: "none"
              }}
            />
          </div>
        </div>

        {/* Quick Pick Pills from Recent Database Records */}
        {recentDocs.length >= 2 && (
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, marginBottom: 8 }}>
              Quick Test: Select from Recent Ingestions
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {recentDocs.slice(0, 4).map((doc, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (!idA) setIdA(doc.analysis_id || doc.id);
                    else if (!idB) setIdB(doc.analysis_id || doc.id);
                    else { setIdA(doc.analysis_id || doc.id); setIdB(""); }
                  }}
                  style={{
                    padding: "4px 10px", borderRadius: 6,
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                    color: "#94a3b8", fontSize: 11.5, cursor: "pointer"
                  }}
                >
                  <span className="font-mono">{doc.analysis_id || doc.id.slice(0, 8)}</span>
                  <span style={{ color: "#64748b", marginLeft: 6 }}>({doc.risk_label || "DOC"})</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
          <button
            className="btn-primary"
            onClick={handleCompare}
            disabled={!idA || !idB || loading}
            style={{ opacity: (!idA || !idB) ? 0.5 : 1 }}
          >
            <Sparkles size={15} />
            {loading ? "Diffing Records..." : "Execute Side-by-Side Diff"}
          </button>
        </div>

        {error && (
          <div style={{
            marginTop: 14, padding: "12px 16px", borderRadius: 8,
            background: "rgba(244, 63, 94, 0.12)", border: "1px solid rgba(244, 63, 94, 0.3)",
            color: "#fb7185", fontSize: 13, display: "flex", alignItems: "center", gap: 8
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results Comparison Table */}
      {result && (
        <div className="glass-card" style={{ overflow: "hidden" }}>
          {/* Header row */}
          <div style={{
            display: "grid", gridTemplateColumns: "200px 1fr 1fr 90px",
            padding: "14px 22px", background: "rgba(0,0,0,0.3)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            fontSize: 11, fontWeight: 800, color: "#64748b", letterSpacing: "0.5px", textTransform: "uppercase"
          }}>
            <div>Target Attribute</div>
            <div className="font-mono" style={{ color: "#38bdf8" }}>{result.analysis_a}</div>
            <div className="font-mono" style={{ color: "#a855f7" }}>{result.analysis_b}</div>
            <div style={{ textAlign: "center" }}>Consistency</div>
          </div>

          {result.comparison.map((row: any, i: number) => {
            const match = row.match;
            const isMismatch = match === false;

            return (
              <div
                key={i}
                style={{
                  display: "grid", gridTemplateColumns: "200px 1fr 1fr 90px",
                  alignItems: "center",
                  padding: "14px 22px",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  background: isMismatch ? "rgba(244, 63, 94, 0.04)" : "transparent",
                  transition: "background 0.15s"
                }}
              >
                <div style={{ fontSize: 12.5, color: "#94a3b8", fontWeight: 700, textTransform: "capitalize" }}>
                  {(row.field as string).replace(/_/g, " ")}
                </div>

                <div className="font-mono" style={{ fontSize: 13, color: "#f8fafc", fontWeight: 500 }}>
                  {String(row.value_a ?? "—")}
                </div>

                <div className="font-mono" style={{
                  fontSize: 13,
                  color: isMismatch ? "#f43f5e" : "#f8fafc",
                  fontWeight: isMismatch ? 700 : 500,
                }}>
                  {String(row.value_b ?? "—")}
                </div>

                <div style={{ display: "flex", justifyContent: "center" }}>
                  {match === true ? (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "2px 8px", borderRadius: 12,
                      background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)",
                      color: "#34d399", fontSize: 11, fontWeight: 700
                    }}>
                      <CheckCircle2 size={12} /> MATCH
                    </span>
                  ) : match === false ? (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "2px 8px", borderRadius: 12,
                      background: "rgba(244, 63, 94, 0.15)", border: "1px solid rgba(244, 63, 94, 0.4)",
                      color: "#f43f5e", fontSize: 11, fontWeight: 800
                    }}>
                      <XCircle size={12} /> DIFF
                    </span>
                  ) : (
                    <span style={{ color: "#64748b", fontSize: 11 }}>—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
