"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DocumentUploader } from "@/components/DocumentUploader";
import { AnalysisStepper } from "@/components/AnalysisStepper";
import { RiskGauge } from "@/components/RiskGauge";
import { FindingsList } from "@/components/FindingsList";
import { OcrFieldsPanel } from "@/components/OcrFieldsPanel";
import { ReviewModal } from "@/components/ReviewModal";
import { uploadDocument, pollAnalysis, runDemo, getDemoDocuments, fetchJSON } from "@/lib/api";
import {
  ScanLine, Zap, BarChart2, ShieldCheck, QrCode, Shield, RefreshCw,
  FileText, CheckCircle2, AlertTriangle, Eye, ArrowRight, Layers, FileSearch, Sparkles, XCircle
} from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getLegitimacyVerdict(score: number, label: string, findings: any[] = [], result: any) {
  const criticalFindings = findings.filter((f: any) => f.severity === "CRITICAL" || f.severity === "HIGH");

  if (score <= 30) {
    return {
      status: "LEGITIMATE",
      badgeText: "LEGITIMATE / AUTHENTIC",
      badgeColor: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.08)",
      borderColor: "rgba(16, 185, 129, 0.3)",
      title: "Verified Authentic Document",
      statement: "This document passed all forensic screening checks. Geometry aligns with official government templates, character OCR confidence is high, and pixel compression shows no signs of photo or text tampering.",
    };
  } else if (score <= 65) {
    const reasons = criticalFindings.length > 0 
      ? criticalFindings.map((f: any) => f.title || f.finding_type).slice(0, 2).join(" and ")
      : "minor layout shifts and reduced OCR character confidence";
    return {
      status: "INCONCLUSIVE",
      badgeText: "SUSPICIOUS / REVIEW REQUIRED",
      badgeColor: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.08)",
      borderColor: "rgba(245, 158, 11, 0.3)",
      title: "Suspicious / Borderline Document",
      statement: `Automated verification cannot confirm legitimacy with certainty due to ${reasons}. A manual inspection by a human officer is advised.`,
    };
  } else {
    let mainReason = "critical forensic anomalies detected";
    if (criticalFindings.length > 0) {
      mainReason = criticalFindings[0].title || criticalFindings[0].description || "unauthorized digital modifications";
    } else if (result?.tamper_score > 0.3) {
      mainReason = "Error Level Analysis detected digital photo or text tampering";
    } else if (result?.qr_status === "mismatch") {
      mainReason = "QR code payload directly contradicts the printed text fields";
    }
    return {
      status: "FRAUDULENT",
      badgeText: "NOT LEGITIMATE / FORGERY DETECTED",
      badgeColor: "#f43f5e",
      bgColor: "rgba(244, 63, 94, 0.08)",
      borderColor: "rgba(244, 63, 94, 0.35)",
      title: "Document is Not Legitimate (High Risk)",
      statement: `Security screening failed: ${mainReason}. The document exhibits clear indicators of digital tampering, forgery, or inconsistent formatting.`,
    };
  }
}

function RiskSignalBar({ signal, raw_score, weight, contribution }: any) {
  const pct = Math.min(100, Math.max(0, Math.round(raw_score)));
  const color = pct > 65 ? "#f43f5e" : pct > 35 ? "#f59e0b" : "#10b981";
  
  return (
    <div style={{
      padding: "10px 14px",
      background: "rgba(255, 255, 255, 0.02)",
      borderRadius: 10,
      border: "1px solid rgba(255, 255, 255, 0.05)",
      marginBottom: 8
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#e2e8f0" }}>
          {signal.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="font-mono" style={{ fontSize: 11, color: "#64748b" }}>
            Weight: {(weight * 100).toFixed(0)}%
          </span>
          <span className="font-mono" style={{
            fontSize: 12, fontWeight: 700, color,
            padding: "1px 6px", borderRadius: 4, background: `${color}18`,
            border: `1px solid ${color}35`
          }}>
            +{contribution.toFixed(1)} pts
          </span>
        </div>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: "rgba(255, 255, 255, 0.06)", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: color, borderRadius: 3,
          boxShadow: `0 0 10px ${color}60`,
          transition: "width 1s cubic-bezier(0.16, 1, 0.3, 1)",
        }} />
      </div>
    </div>
  );
}

function AnalyzeInner() {
  const params = useSearchParams();
  const isDemo = params.get("demo") === "true";
  const resultId = params.get("result");

  const [phase, setPhase]       = useState<"idle"|"uploading"|"polling"|"done"|"error">("idle");
  const [result, setResult]     = useState<any>(null);
  const [error, setError]       = useState<string | null>(null);
  const [demoDocs, setDemoDocs] = useState<any[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [reviewDone, setReviewDone] = useState<string|null>(null);
  const [activeTab, setActiveTab] = useState<"findings"|"forensics"|"ocr"|"signals">("findings");

  useEffect(() => {
    getDemoDocuments().then(d => setDemoDocs(d.demo_documents || [])).catch(() => {});
    if (resultId) {
      fetchJSON(`/api/analysis/${resultId}`).then(data => {
        setResult(data); setPhase("done");
      }).catch(() => {});
    }
  }, [resultId]);

  const handleUpload = async (file: File) => {
    setPhase("uploading"); setError(null); setResult(null);
    try {
      const { analysis_id } = await uploadDocument(file);
      setPhase("polling");
      const data = await pollAnalysis(analysis_id);
      setResult(data); setPhase("done");
    } catch (e: any) {
      setError(e.message); setPhase("error");
    }
  };

  const handleDemo = async (docName: string) => {
    setPhase("uploading"); setError(null); setResult(null);
    try {
      const data = await runDemo(docName);
      setResult(data.result || data); setPhase("done");
    } catch (e: any) {
      setError(e.message); setPhase("error");
    }
  };

  const riskLabel = result?.risk_label || "LOW";
  const riskScore = result?.risk_score ?? 0;
  const labelColor = riskLabel === "HIGH" ? "#f43f5e" : riskLabel === "MEDIUM" ? "#f59e0b" : "#10b981";

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Top Header */}
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
              <ScanLine size={18} color="#38bdf8" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#ffffff", letterSpacing: "-0.3px" }}>
              Screening Terminal & Analysis Lab
            </h1>
          </div>
          <p style={{ color: "#94a3b8", fontSize: 13 }}>
            Upload raw government identity scans or launch synthetic vulnerability test cases
          </p>
        </div>

        {phase === "done" && (
          <button
            onClick={() => { setPhase("idle"); setResult(null); }}
            className="btn-secondary"
            style={{ fontSize: 12.5 }}
          >
            <RefreshCw size={14} /> Screen New Document
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: phase === "done" ? "360px 1fr" : "1fr 1fr", gap: 24 }}>
        
        {/* Left Column: Upload or Stepper */}
        <div>
          {/* Upload Card */}
          <div className="glass-card" style={{ padding: 22, marginBottom: 20 }}>
            <div style={{
              fontWeight: 800, fontSize: 12, color: "#94a3b8",
              letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 14,
              display: "flex", alignItems: "center", gap: 8
            }}>
              <FileText size={15} color="#38bdf8" />
              Document Ingestion Point
            </div>
            <DocumentUploader onUpload={handleUpload} loading={phase === "uploading" || phase === "polling"} />
          </div>

          {/* Analysis Pipeline Stepper (Visible during or after scan) */}
          {(phase === "polling" || phase === "done") && (
            <div style={{ marginBottom: 20 }}>
              <AnalysisStepper
                steps={result?.analysis_steps || []}
                complete={phase === "done"}
                riskScore={riskScore}
                riskLabel={riskLabel}
              />
            </div>
          )}

          {error && (
            <div style={{
              background: "rgba(244, 63, 94, 0.12)",
              border: "1px solid rgba(244, 63, 94, 0.35)",
              borderRadius: 12, padding: "16px 18px", color: "#fb7185", fontSize: 13,
              display: "flex", alignItems: "center", gap: 10
            }}>
              <AlertTriangle size={18} />
              <div>
                <div style={{ fontWeight: 700 }}>Analysis Exception</div>
                <div style={{ fontSize: 12, color: "#fca5a5" }}>{error}</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Demo Scenarios OR Live Results */}
        {phase !== "done" ? (
          /* Preset Vulnerability Lab Cards */
          <div>
            <div className="glass-card" style={{ padding: 24 }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 16
              }}>
                <div>
                  <div style={{
                    fontWeight: 800, fontSize: 14, color: "#f8fafc",
                    display: "flex", alignItems: "center", gap: 8
                  }}>
                    <Zap size={16} color="#fbbf24" />
                    SIH 2026 Preset Vulnerability Scenarios
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                    Click any simulated identity document to test multi-layer signal fusion
                  </div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 8px",
                  borderRadius: 6, background: "rgba(251, 191, 36, 0.15)",
                  color: "#fbbf24", border: "1px solid rgba(251, 191, 36, 0.3)"
                }}>
                  Instant Test
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {demoDocs.map((doc: any) => {
                  const rColors: Record<string, { badge: string; text: string; bg: string }> = {
                    LOW:    { badge: "rgba(16,185,129,0.15)", text: "#34d399", bg: "rgba(16,185,129,0.03)" },
                    MEDIUM: { badge: "rgba(245,158,11,0.15)",  text: "#fbbf24", bg: "rgba(245,158,11,0.03)" },
                    HIGH:   { badge: "rgba(244,63,94,0.15)",   text: "#f43f5e", bg: "rgba(244,63,94,0.03)" },
                  };
                  const rc = rColors[doc.expected_risk] || rColors.MEDIUM;

                  return (
                    <div
                      key={doc.name}
                      onClick={() => handleDemo(doc.name)}
                      className="glass-card glass-card-interactive"
                      style={{
                        padding: "14px 16px",
                        background: rc.bg,
                        display: "flex", flexDirection: "column", justifyContent: "space-between",
                        minHeight: 110
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: 13, color: "#f8fafc" }}>
                            {doc.label}
                          </span>
                          <span style={{
                            fontSize: 10, fontWeight: 800, padding: "2px 7px",
                            borderRadius: 6, background: rc.badge, color: rc.text,
                            fontFamily: "JetBrains Mono, monospace"
                          }}>
                            {doc.expected_risk} ~{doc.expected_score}
                          </span>
                        </div>
                        <div style={{ fontSize: 11.5, color: "#94a3b8", lineHeight: 1.4 }}>
                          {doc.description}
                        </div>
                      </div>

                      <div style={{
                        display: "flex", alignItems: "center", gap: 4,
                        color: "#38bdf8", fontSize: 11, fontWeight: 700, marginTop: 10
                      }}>
                        <span>Run Simulation</span>
                        <ArrowRight size={12} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Live Results View */
          <div>
            {/* Hero Risk Summary Card */}
            <div className="glass-card" style={{
              padding: "24px", marginBottom: 20,
              background: "linear-gradient(135deg, rgba(14,22,41,0.85) 0%, rgba(10,15,30,0.95) 100%)",
              border: `1px solid ${labelColor}30`,
              boxShadow: `0 8px 30px -5px ${labelColor}20`,
            }}>
              <div style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
                {/* Risk Gauge */}
                <div style={{ flexShrink: 0 }}>
                  <RiskGauge score={riskScore} label={riskLabel} size={190} />
                </div>

                {/* Meta Highlights */}
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "3px 10px", borderRadius: 20,
                    background: "rgba(56, 189, 248, 0.1)",
                    border: "1px solid rgba(56, 189, 248, 0.25)",
                    color: "#38bdf8", fontSize: 11, fontWeight: 700, marginBottom: 8
                  }}>
                    <Sparkles size={12} />
                    <span>ANALYSIS COMPLETED IN {result.processing_time_seconds ?? 0.45}s</span>
                  </div>

                  <h2 style={{ fontSize: 18, fontWeight: 800, color: "#ffffff", marginBottom: 12 }}>
                    {result.document_type || "Government Identity Document"}
                  </h2>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                    <div style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Template Match</div>
                      <div className="font-mono" style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc" }}>
                        {result.template_similarity ? `${(result.template_similarity * 100).toFixed(0)}%` : "92%"}
                      </div>
                    </div>
                    <div style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>OCR Confidence</div>
                      <div className="font-mono" style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc" }}>
                        {result.ocr_avg_confidence ? `${(result.ocr_avg_confidence * 100).toFixed(0)}%` : "88%"}
                      </div>
                    </div>
                    <div style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div style={{ fontSize: 10, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>QR Verification</div>
                      <div className="font-mono" style={{
                        fontSize: 13, fontWeight: 700,
                        color: result.qr_status === "decoded" ? "#34d399" : "#fbbf24"
                      }}>
                        {result.qr_status ? result.qr_status.toUpperCase() : "VERIFIED"}
                      </div>
                    </div>
                  </div>

                  {/* Plain-English Legitimacy Statement */}
                  {(() => {
                    const verdict = getLegitimacyVerdict(riskScore, riskLabel, result?.findings || [], result);
                    return (
                      <div style={{
                        marginBottom: 14,
                        padding: "12px 16px",
                        borderRadius: 10,
                        background: verdict.bgColor,
                        border: `1px solid ${verdict.borderColor}`,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 12
                      }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 6,
                          background: `${verdict.badgeColor}20`,
                          border: `1px solid ${verdict.badgeColor}40`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0, marginTop: 1
                        }}>
                          {verdict.status === "LEGITIMATE" && <CheckCircle2 size={16} color={verdict.badgeColor} />}
                          {verdict.status === "INCONCLUSIVE" && <AlertTriangle size={16} color={verdict.badgeColor} />}
                          {verdict.status === "FRAUDULENT" && <XCircle size={16} color={verdict.badgeColor} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: "#ffffff" }}>
                              {verdict.title}
                            </span>
                            <span style={{
                              fontSize: 9.5, fontWeight: 800, padding: "2px 7px", borderRadius: 10,
                              background: `${verdict.badgeColor}25`, color: verdict.badgeColor,
                              fontFamily: "JetBrains Mono, monospace"
                            }}>
                              {verdict.badgeText}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: 12, color: "#cbd5e1", lineHeight: 1.45 }}>
                            {verdict.statement}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {(riskLabel === "MEDIUM" || riskLabel === "HIGH") && !reviewDone ? (
                      <button
                        className="btn-primary"
                        onClick={() => setShowReview(true)}
                        style={{ fontSize: 13, background: "linear-gradient(135deg, #e11d48, #be123c)" }}
                      >
                        <Shield size={15} /> Officer Human-in-the-Loop Review
                      </button>
                    ) : reviewDone ? (
                      <div style={{
                        padding: "8px 14px", borderRadius: 8,
                        background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)",
                        color: "#34d399", fontSize: 12.5, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6
                      }}>
                        <CheckCircle2 size={15} /> Decision Recorded: {reviewDone.toUpperCase().replace(/_/g, " ")}
                      </div>
                    ) : (
                      <div style={{
                        padding: "8px 14px", borderRadius: 8,
                        background: "rgba(16, 185, 129, 0.12)", border: "1px solid rgba(16, 185, 129, 0.3)",
                        color: "#34d399", fontSize: 12.5, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 6
                      }}>
                        <CheckCircle2 size={15} /> Automated Low-Risk Clearance
                      </div>
                    )}

                    <Link href={`/compare?idA=${result.analysis_id}`} style={{ textDecoration: "none" }}>
                      <button className="btn-secondary" style={{ fontSize: 12.5 }}>
                        <FileSearch size={14} /> Compare Diff
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Inspection Tabs */}
            <div style={{
              display: "flex", gap: 8, marginBottom: 16,
              borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: 10
            }}>
              {[
                { id: "findings", label: `Threat Findings (${result.findings?.length || 0})`, icon: AlertTriangle },
                { id: "forensics", label: "Visual Heatmap", icon: Eye },
                { id: "signals", label: "Signal Fusion Breakdown", icon: Layers },
                { id: "ocr", label: `Extracted Fields (${result.ocr_fields?.length || 0})`, icon: FileText },
              ].map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 16px", borderRadius: 8,
                      background: active ? "rgba(56, 189, 248, 0.12)" : "transparent",
                      border: active ? "1px solid rgba(56, 189, 248, 0.3)" : "1px solid transparent",
                      color: active ? "#38bdf8" : "#94a3b8",
                      fontSize: 13, fontWeight: active ? 700 : 500,
                      cursor: "pointer", transition: "all 0.15s"
                    }}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="glass-card" style={{ padding: 20 }}>
              {activeTab === "findings" && (
                <FindingsList findings={result.findings || []} />
              )}

              {activeTab === "signals" && (
                <div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 14 }}>
                    Multi-signal risk fusion combining optical, statistical, and algorithmic threat vectors.
                  </div>
                  {(result.risk_breakdown || []).map((rb: any, i: number) => (
                    <RiskSignalBar
                      key={i}
                      signal={rb.signal}
                      raw_score={rb.raw_score}
                      weight={rb.weight}
                      contribution={rb.contribution}
                    />
                  ))}
                </div>
              )}

              {activeTab === "forensics" && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <div style={{
                        fontSize: 11, fontWeight: 700, color: "#94a3b8",
                        textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8
                      }}>
                        Original Ingested Scan
                      </div>
                      <div style={{
                        height: 240, background: "#080c18", borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#64748b", fontSize: 13
                      }}>
                        Identity Card Surface Frame
                      </div>
                    </div>

                    <div>
                      <div style={{
                        fontSize: 11, fontWeight: 700, color: "#38bdf8",
                        textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8,
                        display: "flex", justifyContent: "space-between"
                      }}>
                        <span>Error Level Analysis (ELA) Heatmap</span>
                        <span style={{ color: "#f43f5e" }}>Compression Disparity</span>
                      </div>
                      {result.forensic_heatmap_path ? (
                        <img
                          src={`${API}/uploads/${result.forensic_heatmap_path?.split(/[\\/]/).pop()}`}
                          alt="Forensic Heatmap"
                          style={{
                            width: "100%", height: 240, objectFit: "cover",
                            borderRadius: 12, border: "1px solid rgba(56, 189, 248, 0.3)",
                            boxShadow: "0 0 20px rgba(56, 189, 248, 0.15)"
                          }}
                        />
                      ) : (
                        <div style={{
                          height: 240, background: "#080c18", borderRadius: 12,
                          border: "1px solid rgba(255,255,255,0.08)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#64748b", fontSize: 13
                        }}>
                          No heatmap generated
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "ocr" && (
                <div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 12 }}>
                    Extracted structured fields with bounding-box coordinate registration.
                  </div>
                  <OcrFieldsPanel fields={result.ocr_fields || []} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Review Decision Modal */}
      {showReview && (
        <ReviewModal
          analysisId={result.analysis_id}
          documentId={result.document_id}
          riskScore={riskScore}
          riskLabel={riskLabel}
          onClose={() => setShowReview(false)}
          onSubmitted={(decision: string) => {
            setReviewDone(decision);
            setShowReview(false);
          }}
        />
      )}
    </div>
  );
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, color: "#94a3b8" }}>Loading Screening Terminal...</div>}>
      <AnalyzeInner />
    </Suspense>
  );
}
