"use client";
import { useEffect, useState } from "react";
import { getAnalytics, getRiskQueue, getHealth } from "@/lib/api";
import {
  AlertTriangle, FileCheck, TrendingUp, Shield, Activity,
  CheckCircle2, ArrowUpRight, ScanLine, Clock, Zap, Layers,
  Lock, Terminal, ArrowRight, ShieldCheck, Fingerprint,
  Sparkles, Check, AlertCircle, RefreshCw
} from "lucide-react";
import Link from "next/link";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";

function BentoStatCard({ label, value, sub, trend, color, icon: Icon }: {
  label: string; value: any; sub?: string; trend?: string; color: string; icon: any;
}) {
  return (
    <div className="bento-card" style={{ padding: "22px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <span style={{
          fontSize: 11, color: "#64748B", fontWeight: 700,
          letterSpacing: "0.08em", textTransform: "uppercase"
        }}>
          {label}
        </span>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: `${color}15`,
          border: `1px solid ${color}35`,
          display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <Icon size={15} color={color} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <div className="font-mono" style={{
          fontSize: 34, fontWeight: 800, color: "#ffffff",
          letterSpacing: "-0.04em", lineHeight: 1
        }}>
          {value}
        </div>
        {trend && (
          <span style={{
            fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: "999px",
            background: "rgba(16, 185, 129, 0.12)", color: "#34d399",
            fontFamily: "JetBrains Mono, monospace"
          }}>
            {trend}
          </span>
        )}
      </div>

      {sub && (
        <div style={{ fontSize: 12, color: "#93A3B8", marginTop: 10, fontWeight: 500 }}>
          {sub}
        </div>
      )}

      {/* NordPixel Subtle Accent Line */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${color} 0%, transparent 70%)`
      }} />
    </div>
  );
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [queue, setQueue]         = useState<any>(null);
  const [health, setHealth]       = useState<any>(null);

  useEffect(() => {
    getAnalytics().then(setAnalytics).catch(() => {});
    getRiskQueue().then(setQueue).catch(() => {});
    getHealth().then(setHealth).catch(() => {});
  }, []);

  const hasRealData = analytics && analytics.total_documents > 0;
  const totalPie = (analytics?.low_risk_count || 0) + (analytics?.medium_risk_count || 0) + (analytics?.high_risk_count || 0);

  const PIE_DATA = totalPie > 0 ? [
    { name: "Legitimate (Low)",  value: analytics.low_risk_count,    color: "#10b981" },
    { name: "Suspect (Medium)", value: analytics.medium_risk_count, color: "#f59e0b" },
    { name: "Tampered (High)",   value: analytics.high_risk_count,   color: "#f43f5e" },
  ] : [
    { name: "Legitimate (Low)",  value: 68, color: "#10b981" },
    { name: "Suspect (Medium)", value: 21, color: "#f59e0b" },
    { name: "Tampered (High)",   value: 11, color: "#f43f5e" },
  ];

  const hasAnomData = analytics && analytics.anomaly_breakdown && Object.keys(analytics.anomaly_breakdown).length > 0;

  const ANOM_DATA = hasAnomData ? Object.entries(analytics.anomaly_breakdown).map(
    ([k, v]) => ({ name: k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()), value: v })
  ) : [
    { name: "Visual Splice (ELA)", value: 14 },
    { name: "QR Crypt Hash Mismatch", value: 9 },
    { name: "Font / OCR Discrepancy", value: 7 },
    { name: "Layout Boundary Shift", value: 4 },
    { name: "Metadata Inconsistency", value: 2 },
  ];

  const pendingReview = (queue?.high?.length || 0) + (queue?.medium?.length || 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>

      {/* ── 1. NORDPIXEL-STYLE HERO SECTION ── */}
      <section style={{
        position: "relative",
        padding: "48px 0 20px 0",
        textAlign: "center",
        maxWidth: 960,
        margin: "0 auto",
      }}>
        {/* NordPixel Large Clean Heading */}
        <h1 style={{
          fontSize: "clamp(36px, 5.4vw, 58px)",
          fontWeight: 800,
          lineHeight: 1.14,
          letterSpacing: "-0.035em",
          color: "#FFFFFF",
          marginBottom: 18,
          fontFamily: "'Poppins', sans-serif"
        }}>
          Autonomous Multi-Layer <br />
          <span style={{
            background: "linear-gradient(135deg, #4272D4 0%, #6FCDA9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            Document Fraud Screening
          </span>
          .
        </h1>

        <p style={{
          fontSize: "clamp(15px, 1.8vw, 17px)",
          color: "#93A3B8",
          lineHeight: 1.6,
          maxWidth: 680,
          margin: "0 auto 32px auto",
          fontWeight: 400
        }}>
          Signal fusion architecture fusing pixel-level error analysis (ELA), encrypted QR cryptographic parsing, OCR discrepancy checks, and automated reason statements.
        </p>

        {/* Hero CTA Pills */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <Link href="/analyze" style={{ textDecoration: "none" }}>
            <button className="btn-primary" style={{ padding: "12px 28px", fontSize: 14 }}>
              <ScanLine size={16} />
              <span>Screen Document</span>
              <ArrowRight size={14} />
            </button>
          </Link>
          <Link href="/risk-queue" style={{ textDecoration: "none" }}>
            <button className="btn-secondary" style={{ padding: "12px 26px", fontSize: 14 }}>
              <AlertTriangle size={15} color="#f59e0b" />
              <span>Threat Triage Queue</span>
              {pendingReview > 0 && (
                <span style={{
                  background: "rgba(245, 158, 11, 0.2)",
                  color: "#f59e0b",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "1px 7px",
                  borderRadius: "999px",
                  marginLeft: 4
                }}>
                  {pendingReview}
                </span>
              )}
            </button>
          </Link>
        </div>

        {/* Telemetry Micro-Pill Bar */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 20,
          marginTop: 32,
          padding: "8px 20px",
          borderRadius: "999px",
          background: "rgba(15, 21, 34, 0.8)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          fontSize: 12,
          color: "#64748B",
          flexWrap: "wrap",
          justifyContent: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Activity size={13} color="#4272D4" />
            <span>OCR:</span>
            <span style={{ color: "#EFF3F8", fontWeight: 600 }}>Tesseract + EasyOCR Dual-Pass</span>
          </div>
          <span style={{ opacity: 0.3 }}>•</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Zap size={13} color="#6FCDA9" />
            <span>Forensics:</span>
            <span style={{ color: "#EFF3F8", fontWeight: 600 }}>ELA Heatmaps + FFT Noise</span>
          </div>
          <span style={{ opacity: 0.3 }}>•</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <CheckCircle2 size={13} color="#28C840" />
            <span>Ledger:</span>
            <span style={{ color: "#28C840", fontWeight: 600 }}>SQLite Async DB</span>
          </div>
        </div>
      </section>

      {/* ── 2. NORDPIXEL SIGNATURE WHITE ISLAND SECTION (.band-light) ── */}
      <section className="band-light">
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 24,
          marginBottom: 32
        }}>
          <div>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11.5,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#4272D4",
              marginBottom: 8
            }}>
              <Sparkles size={14} />
              EXPLAINABLE AI ENGINE
            </div>
            <h2 style={{
              fontSize: "clamp(24px, 3.2vw, 36px)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "#0A0E14",
              lineHeight: 1.15,
              margin: 0,
              fontFamily: "'Poppins', sans-serif"
            }}>
              Reasoned Legitimacy Verdicts.
            </h2>
            <p style={{ color: "#475569", fontSize: 14.5, marginTop: 6, maxWidth: 640, lineHeight: 1.5 }}>
              Every verification decision is justified with a human-readable forensic explanation, scoring breakdown, and verifiable cryptographic proof.
            </p>
          </div>

          <Link href="/analyze" style={{ textDecoration: "none" }}>
            <button style={{
              background: "#0A0E14",
              color: "#FFFFFF",
              borderRadius: "999px",
              padding: "12px 24px",
              fontSize: 13.5,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              transition: "transform 0.2s ease, background 0.2s ease"
            }}>
              <span>Test Live Document</span>
              <ArrowRight size={14} />
            </button>
          </Link>
        </div>

        {/* Interactive Comparison Demo Inside White Island */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20
        }}>
          {/* Sample Verdict 1: LEGITIMATE */}
          <div style={{
            background: "#FFFFFF",
            borderRadius: "24px",
            padding: "24px",
            border: "1px solid rgba(16, 185, 129, 0.25)",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{
                  background: "rgba(16, 185, 129, 0.12)",
                  color: "#059669",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5
                }}>
                  <CheckCircle2 size={13} />
                  CONFIRMED LEGITIMATE
                </span>
                <span className="font-mono" style={{ fontSize: 12, fontWeight: 700, color: "#059669" }}>
                  Risk: 08 / 100
                </span>
              </div>

              <div style={{ fontWeight: 700, fontSize: 16, color: "#0F172A", marginBottom: 8 }}>
                Aadhaar e-Identity Card #8821
              </div>

              <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.55, marginBottom: 16 }}>
                &ldquo;<strong>Verified Authentic.</strong> Digital QR signature decrypted successfully; payload matches OCR extracted name and DOB with 100% fidelity. Visual Error Level Analysis shows zero compression splicing or font alterations.&rdquo;
              </p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
              paddingTop: 14,
              borderTop: "1px solid #E2E8F0",
              fontSize: 11.5
            }}>
              <div>
                <div style={{ color: "#64748B" }}>QR Crypt</div>
                <div style={{ fontWeight: 700, color: "#059669" }}>Valid Match</div>
              </div>
              <div>
                <div style={{ color: "#64748B" }}>ELA Tamper</div>
                <div style={{ fontWeight: 700, color: "#059669" }}>0.0% Splice</div>
              </div>
              <div>
                <div style={{ color: "#64748B" }}>Font Grid</div>
                <div style={{ fontWeight: 700, color: "#059669" }}>Standard</div>
              </div>
            </div>
          </div>

          {/* Sample Verdict 2: TAMPERED */}
          <div style={{
            background: "#FFFFFF",
            borderRadius: "24px",
            padding: "24px",
            border: "1px solid rgba(244, 63, 94, 0.25)",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{
                  background: "rgba(244, 63, 94, 0.12)",
                  color: "#E11D48",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                  padding: "4px 12px",
                  borderRadius: "999px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5
                }}>
                  <AlertTriangle size={13} />
                  SUSPICIOUS // TAMPERED
                </span>
                <span className="font-mono" style={{ fontSize: 12, fontWeight: 700, color: "#E11D48" }}>
                  Risk: 88 / 100
                </span>
              </div>

              <div style={{ fontWeight: 700, fontSize: 16, color: "#0F172A", marginBottom: 8 }}>
                Modified Certificate #4419
              </div>

              <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.55, marginBottom: 16 }}>
                &ldquo;<strong>Potential Forgery Detected.</strong> High-energy pixel variance detected across the name &amp; date coordinates via ELA. Optical character glyphs display mismatched baseline heights indicative of manual photo-editing injection.&rdquo;
              </p>
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 8,
              paddingTop: 14,
              borderTop: "1px solid #E2E8F0",
              fontSize: 11.5
            }}>
              <div>
                <div style={{ color: "#64748B" }}>QR Crypt</div>
                <div style={{ fontWeight: 700, color: "#E11D48" }}>Mismatch</div>
              </div>
              <div>
                <div style={{ color: "#64748B" }}>ELA Tamper</div>
                <div style={{ fontWeight: 700, color: "#E11D48" }}>High Energy</div>
              </div>
              <div>
                <div style={{ color: "#64748B" }}>Font Grid</div>
                <div style={{ fontWeight: 700, color: "#E11D48" }}>Shifted</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. BENTO KPI METRICS STRIP ── */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        <BentoStatCard
          label="Total Screened"
          value={hasRealData ? analytics.total_documents : 100}
          trend="+18% week"
          sub="Institutional records ingested"
          icon={FileCheck}
          color="#4272D4"
        />
        <BentoStatCard
          label="High Risk Flagged"
          value={hasRealData ? analytics.high_risk_count : 11}
          trend="11% rate"
          sub="Digital tampering & splices blocked"
          icon={AlertTriangle}
          color="#f43f5e"
        />
        <BentoStatCard
          label="Pending Triage"
          value={pendingReview || (hasRealData ? 0 : 2)}
          sub="Officer manual review queue"
          icon={Clock}
          color="#f59e0b"
        />
        <BentoStatCard
          label="Mean Trust Index"
          value={hasRealData ? `${analytics.average_risk_score}` : "22"}
          trend="Low Risk"
          sub="Normalized 0–100 risk score"
          icon={TrendingUp}
          color="#10b981"
        />
      </section>

      {/* ── 4. ANALYTICS DUAL VISUALIZATION ── */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 20 }}>
        {/* Donut Chart: Risk Distribution */}
        <div className="bento-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#ffffff" }}>
                Screening Risk Distribution
              </div>
              <div style={{ fontSize: 12, color: "#64748B" }}>
                Severity classification across evaluated repository
              </div>
            </div>
            {!hasRealData && (
              <span style={{
                fontSize: 10, color: "#64748B", background: "rgba(255,255,255,0.06)",
                padding: "3px 8px", borderRadius: "999px", fontFamily: "JetBrains Mono, monospace"
              }}>
                BASELINE
              </span>
            )}
          </div>

          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={PIE_DATA}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={85}
                dataKey="value" paddingAngle={4}
                isAnimationActive={false}
              >
                {PIE_DATA.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#0b1120", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8, fontSize: 12, color: "#ffffff"
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginTop: 12 }}>
            {PIE_DATA.map((d, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: d.color }} />
                <span style={{ color: "#93A3B8" }}>{d.name}:</span>
                <span className="font-mono" style={{ color: "#EFF3F8", fontWeight: 700 }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart: Threat Vectors */}
        <div className="bento-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#ffffff" }}>
                Detected Threat Vectors
              </div>
              <div style={{ fontSize: 12, color: "#64748B" }}>
                Algorithmic detection incidence by anomaly class
              </div>
            </div>
            {!hasAnomData && (
              <span style={{
                fontSize: 10, color: "#64748B", background: "rgba(255,255,255,0.06)",
                padding: "3px 8px", borderRadius: "999px", fontFamily: "JetBrains Mono, monospace"
              }}>
                BASELINE
              </span>
            )}
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ANOM_DATA} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" stroke="#64748B" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="#93A3B8" fontSize={11.5} width={150} />
              <Tooltip
                contentStyle={{
                  background: "#0b1120", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 8, fontSize: 12, color: "#ffffff"
                }}
              />
              <Bar dataKey="value" fill="#4272D4" radius={[0, 6, 6, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── 5. QUICK SIMULATION TEST PRESETS LAB ── */}
      <section className="bento-card" style={{ padding: "24px 28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: "#4272D4", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              TEST &amp; BENCHMARK
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#FFFFFF" }}>
              Synthetic Forgery Simulation Lab
            </div>
          </div>
          <Link href="/analyze" style={{ textDecoration: "none" }}>
            <span style={{
              color: "#4272D4",
              fontSize: 12.5,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 4
            }}>
              Open Forensic Studio <ArrowUpRight size={14} />
            </span>
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
          {[
            { id: "authentic", label: "Authentic ID Standard", desc: "UIDAI biometric baseline compliant", risk: "LOW", tag: "AUTHENTIC", color: "#10b981" },
            { id: "text_tampered", label: "Text Splice Injection", desc: "Modified DOB and name typography", risk: "HIGH", tag: "TAMPER", color: "#f43f5e" },
            { id: "photo_tampered", label: "Face Patch Replacement", desc: "High ELA energy variance around face", risk: "HIGH", tag: "SPLICE", color: "#f43f5e" },
            { id: "qr_mismatch", label: "Encrypted QR Conflict", desc: "Payload hash does not match OCR field", risk: "HIGH", tag: "FORGERY", color: "#f59e0b" },
          ].map(item => (
            <Link key={item.id} href="/analyze" style={{ textDecoration: "none" }}>
              <div style={{
                padding: "16px 18px",
                borderRadius: "14px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.07)",
                transition: "all 0.2s ease",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(66, 114, 212, 0.4)";
                e.currentTarget.style.background = "rgba(66, 114, 212, 0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.07)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
              }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#EFF3F8" }}>{item.label}</span>
                  <span style={{
                    fontSize: 9.5, fontWeight: 800, padding: "2px 7px", borderRadius: "999px",
                    background: `${item.color}18`,
                    color: item.color,
                    border: `1px solid ${item.color}35`,
                    fontFamily: "JetBrains Mono, monospace"
                  }}>
                    {item.tag}
                  </span>
                </div>
                <div style={{ fontSize: 11.5, color: "#64748B", lineHeight: 1.4 }}>
                  {item.desc}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
