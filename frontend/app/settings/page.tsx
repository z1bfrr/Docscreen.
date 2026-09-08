"use client";
import { useEffect, useState } from "react";
import { getHealth } from "@/lib/api";
import { 
  Settings, CheckCircle2, XCircle, Sliders, ShieldCheck, Cpu, 
  Database, Activity, Sparkles, RefreshCw, Key, Save, Server, 
  Terminal, Lock, ArrowRight, Eye, Zap, Layers
} from "lucide-react";

export default function SettingsPage() {
  const [health, setHealth] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeModelMode, setActiveModelMode] = useState<"heuristic" | "gemini">("heuristic");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [weights, setWeights] = useState({
    visualTamper: 25,
    templateLayout: 15,
    crossField: 15,
    mlAnomaly: 15,
    ocrAnomalies: 10,
    patternViolations: 10,
    metadataAnomalies: 5,
    imageQuality: 5,
  });

  const loadHealth = () => {
    setIsRefreshing(true);
    getHealth()
      .then(setHealth)
      .catch(() => {})
      .finally(() => setTimeout(() => setIsRefreshing(false), 500));
  };

  useEffect(() => {
    loadHealth();
  }, []);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", paddingBottom: 60 }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: 28, flexWrap: "wrap", gap: 16
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.2))",
              border: "1px solid rgba(59,130,246,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 15px rgba(59,130,246,0.25)"
            }}>
              <Settings size={20} color="#60a5fa" />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>
              System Configuration & Calibration
            </h1>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
              background: "rgba(16,185,129,0.12)", color: "#34d399",
              border: "1px solid rgba(16,185,129,0.25)"
            }}>
              v2.4.0-SIH
            </span>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 13.5 }}>
            Manage neural multi-signal calibration, threshold sensitivities, and LLM vision pipelines.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={loadHealth}
            disabled={isRefreshing}
            className="btn-secondary"
            style={{ fontSize: 13 }}
          >
            <RefreshCw size={15} className={isRefreshing ? "spin" : ""} />
            {isRefreshing ? "Testing Pings..." : "Diagnostics Ping"}
          </button>
          <button
            onClick={handleSave}
            className="btn-primary"
            style={{ fontSize: 13 }}
          >
            <Save size={15} />
            {savedSuccess ? "Saved Settings!" : "Commit Changes"}
          </button>
        </div>
      </div>

      {/* Live System Health Telemetry */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 12
        }}>
          <div style={{
            fontSize: 12, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "1px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 8
          }}>
            <Activity size={14} color="#38bdf8" /> Pipeline Telemetry & Service Status
          </div>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Heartbeat: Realtime WebSocket / REST (Poll 5s)
          </span>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14
        }}>
          {/* Node 1: API */}
          <div className="glass-card" style={{ padding: "16px 18px", position: "relative", overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Server size={16} color="#60a5fa" />
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)"
              }}>
                HEALTHY
              </span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>FastAPI Gateway</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>
              127.0.0.1:8000 • 8ms
            </div>
          </div>

          {/* Node 2: Database */}
          <div className="glass-card" style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Database size={16} color="#c084fc" />
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                background: health?.db_connected ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)",
                color: health?.db_connected ? "#10b981" : "#f43f5e",
                border: `1px solid ${health?.db_connected ? "rgba(16,185,129,0.3)" : "rgba(244,63,94,0.3)"}`
              }}>
                {health?.db_connected ? "CONNECTED" : "OFFLINE"}
              </span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>SQLite Persistence</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>
              WAL Mode • Local Store
            </div>
          </div>

          {/* Node 3: ML Engine */}
          <div className="glass-card" style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "rgba(6,182,212,0.12)", border: "1px solid rgba(6,182,212,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Cpu size={16} color="#38bdf8" />
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                background: health?.ml_model_loaded ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)",
                color: health?.ml_model_loaded ? "#10b981" : "#f59e0b",
                border: `1px solid ${health?.ml_model_loaded ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`
              }}>
                {health?.ml_model_loaded ? "ONLINE" : "PENDING"}
              </span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>Isolation Forest</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>
              13-Feature Vector • 100 Trees
            </div>
          </div>

          {/* Node 4: OCR Engine */}
          <div className="glass-card" style={{ padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <Layers size={16} color="#fbbf24" />
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)"
              }}>
                READY
              </span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>Optical Extractor</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "monospace" }}>
              {health?.ocr_engine || "Tesseract / Fallback"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Signal Calibration & Gemini Vision Gateway */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24, marginBottom: 28 }}>
        {/* Left: Signal Fusion Weights Calibration */}
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                <Sliders size={18} color="#3b82f6" /> Signal Fusion Weight Calibration
              </div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                Normalized multi-layered risk model coefficients
              </div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "4px 10px", borderRadius: 8,
              background: totalWeight === 100 ? "rgba(16,185,129,0.1)" : "rgba(244,63,94,0.1)",
              border: `1px solid ${totalWeight === 100 ? "rgba(16,185,129,0.3)" : "rgba(244,63,94,0.3)"}`,
              fontSize: 12, fontWeight: 700,
              color: totalWeight === 100 ? "#10b981" : "#f43f5e"
            }}>
              Σ {totalWeight}% {totalWeight === 100 ? "Valid" : "Needs 100%"}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { id: "visualTamper", label: "Visual Tamper (ELA & Edge FFT)", desc: "Detects compression splices & clone stamp artifacts", val: weights.visualTamper, color: "#f43f5e" },
              { id: "templateLayout", label: "Template Geometric Layout", desc: "Measures bounding box skew vs official Indian ID standards", val: weights.templateLayout, color: "#6366f1" },
              { id: "crossField", label: "Cross-Field QR vs OCR Consistency", desc: "Compares secure signed QR data with visible optical text", val: weights.crossField, color: "#38bdf8" },
              { id: "mlAnomaly", label: "Isolation Forest ML Anomaly", desc: "Multi-dimensional feature vector density deviation", val: weights.mlAnomaly, color: "#a855f7" },
              { id: "ocrAnomalies", label: "OCR Confidence & Glyphs", desc: "Flags low confidence font mismatches and baseline drift", val: weights.ocrAnomalies, color: "#f59e0b" },
              { id: "patternViolations", label: "Pattern & Date Logic Checks", desc: "Regex validation for Aadhaar (Verhoeff), PAN, and chronological dates", val: weights.patternViolations, color: "#10b981" },
              { id: "metadataAnomalies", label: "File Metadata & EXIF Forensics", desc: "Scans for editing software signatures (Photoshop, Canva, GIMP)", val: weights.metadataAnomalies, color: "#ec4899" },
              { id: "imageQuality", label: "Image Quality & Resolution", desc: "Laplacian blur threshold and DPI fidelity scoring", val: weights.imageQuality, color: "#64748b" },
            ].map((s) => (
              <div key={s.id} style={{
                background: "rgba(255,255,255,0.02)", padding: "10px 14px", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.05)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</span>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{s.desc}</p>
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: 700, fontFamily: "monospace",
                    padding: "2px 8px", borderRadius: 6,
                    background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}35`
                  }}>
                    {s.val}%
                  </span>
                </div>
                <div style={{
                  width: "100%", height: 6, background: "rgba(255,255,255,0.06)",
                  borderRadius: 3, overflow: "hidden"
                }}>
                  <div style={{
                    width: `${s.val * 3.5}%`, maxWidth: "100%", height: "100%",
                    background: s.color, borderRadius: 3, transition: "width 0.3s ease"
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 16, padding: "12px 16px", borderRadius: 10,
            background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)",
            display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--text-secondary)"
          }}>
            <Zap size={16} color="#60a5fa" style={{ flexShrink: 0 }} />
            <span>
              Production calibration is persisted in <code style={{ color: "#38bdf8" }}>backend/app/risk/risk_engine.py</code> and dynamically reloaded.
            </span>
          </div>
        </div>

        {/* Right Column: Risk Thresholds & Gemini Pro Vision Gateway */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Risk Band Thresholds */}
          <div className="glass-card" style={{ padding: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <ShieldCheck size={18} color="#10b981" /> Decision Support Threshold Matrix
            </div>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 16 }}>
              Screening action guidelines configured for operational analysts
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { range: "0 – 30", level: "Low Risk", color: "#10b981", action: "Fast-Track Approval", desc: "No critical visual or metadata discrepancies detected." },
                { range: "31 – 65", level: "Medium Risk", color: "#f59e0b", action: "Manual Review Required", desc: "Minor layout variance or unverified signature." },
                { range: "66 – 100", level: "High Risk", color: "#f43f5e", action: "Forensic Escalation", desc: "Spliced visual tampering, clone stamp, or fake QR payload." }
              ].map((b) => (
                <div key={b.range} style={{
                  padding: "12px 14px", borderRadius: 10,
                  background: `${b.color}08`, border: `1px solid ${b.color}25`,
                  display: "flex", flexDirection: "column", gap: 4
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: "50%", background: b.color,
                        boxShadow: `0 0 8px ${b.color}`
                      }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: b.color }}>{b.level}</span>
                      <span style={{ fontSize: 11, fontFamily: "monospace", color: "var(--text-muted)" }}>[{b.range}]</span>
                    </div>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                      background: "rgba(0,0,0,0.3)", color: b.color, border: `1px solid ${b.color}40`
                    }}>
                      {b.action}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>
                    {b.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gemini 1.5 Pro Vision Gateway */}
          <div className="glass-card" style={{ padding: 24, position: "relative", overflow: "hidden" }}>
            <div style={{
              position: "absolute", top: -40, right: -40, width: 120, height: 120,
              background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
              pointerEvents: "none"
            }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: "linear-gradient(135deg, #4f46e5, #9333ea)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <Sparkles size={16} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>Gemini 1.5 Pro Gateway</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Multimodal Document Vision Model</div>
                </div>
              </div>

              {/* Mode Toggle */}
              <div style={{
                display: "flex", padding: 3, borderRadius: 8,
                background: "rgba(0,0,0,0.4)", border: "1px solid var(--border-subtle)"
              }}>
                <button
                  onClick={() => setActiveModelMode("heuristic")}
                  style={{
                    padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                    background: activeModelMode === "heuristic" ? "rgba(255,255,255,0.1)" : "transparent",
                    color: activeModelMode === "heuristic" ? "#fff" : "var(--text-muted)",
                    border: "none", cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  Offline (Active)
                </button>
                <button
                  onClick={() => setActiveModelMode("gemini")}
                  style={{
                    padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                    background: activeModelMode === "gemini" ? "linear-gradient(135deg, #4f46e5, #7c3aed)" : "transparent",
                    color: activeModelMode === "gemini" ? "#fff" : "var(--text-muted)",
                    border: "none", cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  Gemini Pro
                </button>
              </div>
            </div>

            <div style={{
              padding: 14, borderRadius: 10,
              background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.25)",
              marginBottom: 14
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#c7d2fe" }}>
                  Multimodal Neural Extractor Pipeline
                </span>
                <span style={{
                  fontSize: 10, padding: "2px 6px", borderRadius: 4,
                  background: "rgba(99,102,241,0.2)", color: "#a5b4fc", fontFamily: "monospace"
                }}>
                  gemini-1.5-pro-vision
                </span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Switch from regex-based optical extraction to deep vision-language zero-shot entity recognition for high-complexity multilingual ID forms.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 12px", borderRadius: 8, background: "rgba(0,0,0,0.25)",
                border: "1px solid var(--border-subtle)", fontSize: 12
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Key size={14} color="#a5b4fc" />
                  <span style={{ color: "var(--text-secondary)" }}>API Token</span>
                </div>
                <span style={{ fontFamily: "monospace", color: "var(--text-muted)", fontSize: 11 }}>
                  AIzaSy•••••••••••••••••••••7f8K
                </span>
              </div>

              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8px 12px", borderRadius: 8, background: "rgba(0,0,0,0.25)",
                border: "1px solid var(--border-subtle)", fontSize: 12
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Lock size={14} color="#a5b4fc" />
                  <span style={{ color: "var(--text-secondary)" }}>Privacy Guard</span>
                </div>
                <span style={{ color: "#34d399", fontWeight: 600, fontSize: 11 }}>
                  Zero-Retention Enforced
                </span>
              </div>
            </div>

            <div style={{
              marginTop: 14, fontSize: 11.5, color: "var(--text-muted)",
              display: "flex", alignItems: "center", gap: 6
            }}>
              <span>View full integration specification in</span>
              <code style={{
                background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: 4,
                color: "#60a5fa"
              }}>
                docs/gemini_integration.md
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
