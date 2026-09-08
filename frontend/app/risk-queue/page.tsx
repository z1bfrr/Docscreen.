"use client";
import { useEffect, useState } from "react";
import { getRiskQueue, submitReview } from "@/lib/api";
import { ReviewModal } from "@/components/ReviewModal";
import { AlertTriangle, Clock, CheckCircle2, Shield, Search, RefreshCw, Eye, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function RiskQueuePage() {
  const [queue, setQueue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL"|"HIGH"|"MEDIUM"|"LOW">("ALL");
  const [search, setSearch] = useState("");
  const [selectedReview, setSelectedReview] = useState<any | null>(null);

  const load = () => {
    setLoading(true);
    getRiskQueue().then(d => { setQueue(d); setLoading(false); })
                  .catch(() => setLoading(false));
  };
  useEffect(load, []);

  const high = queue?.high || [];
  const medium = queue?.medium || [];
  const low = queue?.low || [];

  let items = filter === "HIGH" ? high
            : filter === "MEDIUM" ? medium
            : filter === "LOW" ? low
            : [...high, ...medium, ...low];

  if (search.trim()) {
    items = items.filter((item: any) =>
      (item.document_type || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.analysis_id || "").toLowerCase().includes(search.toLowerCase())
    );
  }

  const total = high.length + medium.length + low.length;

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.06)"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.3)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <AlertTriangle size={18} color="#f59e0b" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#ffffff" }}>
              Officer Risk Triage Queue
            </h1>
          </div>
          <p style={{ color: "#94a3b8", fontSize: 13 }}>
            Flagged identity credentials pending manual evaluation and audit sign-off
          </p>
        </div>

        <button onClick={load} className="btn-secondary" style={{ fontSize: 12.5 }}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Triage
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>Total Flagged</div>
          <div className="font-mono" style={{ fontSize: 26, fontWeight: 800, color: "#f8fafc", marginTop: 4 }}>
            {total}
          </div>
        </div>
        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 11, color: "#f43f5e", fontWeight: 700, textTransform: "uppercase" }}>Critical / High Priority</div>
          <div className="font-mono" style={{ fontSize: 26, fontWeight: 800, color: "#f43f5e", marginTop: 4 }}>
            {high.length}
          </div>
        </div>
        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, textTransform: "uppercase" }}>Moderate Variance</div>
          <div className="font-mono" style={{ fontSize: 26, fontWeight: 800, color: "#f59e0b", marginTop: 4 }}>
            {medium.length}
          </div>
        </div>
        <div className="glass-card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: 11, color: "#34d399", fontWeight: 700, textTransform: "uppercase" }}>Low Risk Records</div>
          <div className="font-mono" style={{ fontSize: 26, fontWeight: 800, color: "#34d399", marginTop: 4 }}>
            {low.length}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="glass-card" style={{ padding: "14px 18px", marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { id: "ALL", label: `All Records (${total})` },
            { id: "HIGH", label: `High Risk (${high.length})` },
            { id: "MEDIUM", label: `Medium (${medium.length})` },
            { id: "LOW", label: `Low (${low.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              style={{
                padding: "6px 14px", borderRadius: 8,
                background: filter === tab.id ? "rgba(56, 189, 248, 0.15)" : "rgba(255,255,255,0.03)",
                border: filter === tab.id ? "1px solid rgba(56, 189, 248, 0.35)" : "1px solid rgba(255,255,255,0.06)",
                color: filter === tab.id ? "#38bdf8" : "#94a3b8",
                fontSize: 12.5, fontWeight: filter === tab.id ? 700 : 500,
                cursor: "pointer", transition: "all 0.15s"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: "relative", minWidth: 260 }}>
          <Search size={15} color="#64748b" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by analysis ID or document..."
            style={{
              width: "100%", padding: "8px 12px 8px 34px",
              background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, color: "#f8fafc", fontSize: 12.5, outline: "none"
            }}
          />
        </div>
      </div>

      {/* Queue Grid Table */}
      <div className="glass-card" style={{ overflow: "hidden" }}>
        {/* Table Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "180px 1fr 100px 140px 140px",
          padding: "12px 20px", background: "rgba(0,0,0,0.25)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px"
        }}>
          <div>Analysis ID</div>
          <div>Document Type & Date</div>
          <div>Risk Index</div>
          <div>Threat Tier</div>
          <div style={{ textAlign: "right" }}>Actions</div>
        </div>

        {items.map((item: any, i: number) => {
          const isHigh = item.risk_label === "HIGH";
          const isMed = item.risk_label === "MEDIUM";
          const color = isHigh ? "#f43f5e" : isMed ? "#f59e0b" : "#34d399";

          return (
            <div
              key={i}
              style={{
                display: "grid", gridTemplateColumns: "180px 1fr 100px 140px 140px",
                alignItems: "center",
                padding: "14px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                background: isHigh ? "rgba(244, 63, 94, 0.02)" : "transparent",
                transition: "background 0.15s"
              }}
            >
              <div className="font-mono" style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc" }}>
                {item.analysis_id}
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>
                  {item.document_type || "Government Identity Record"}
                </div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                  Ingested {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Today"}
                </div>
              </div>

              <div className="font-mono" style={{ fontSize: 20, fontWeight: 800, color }}>
                {item.risk_score}
              </div>

              <div>
                <span style={{
                  fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20,
                  background: `${color}15`, border: `1px solid ${color}35`, color,
                  fontFamily: "JetBrains Mono, monospace"
                }}>
                  {item.risk_label} RISK
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  onClick={() => setSelectedReview(item)}
                  className="btn-primary"
                  style={{ fontSize: 11.5, padding: "6px 12px" }}
                >
                  <Shield size={12} /> Audit
                </button>
                <Link href={`/analyze?result=${item.analysis_id}`} style={{ textDecoration: "none" }}>
                  <button className="btn-secondary" style={{ fontSize: 11.5, padding: "6px 10px" }}>
                    <Eye size={12} />
                  </button>
                </Link>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b", fontSize: 13 }}>
            {loading ? "Loading queue records..." : "No documents currently pending review matching filter."}
          </div>
        )}
      </div>

      {/* Audit Review Modal */}
      {selectedReview && (
        <ReviewModal
          analysisId={selectedReview.analysis_id}
          documentId={selectedReview.document_id}
          riskScore={selectedReview.risk_score}
          riskLabel={selectedReview.risk_label}
          onClose={() => setSelectedReview(null)}
          onSubmitted={() => {
            setSelectedReview(null);
            load();
          }}
        />
      )}
    </div>
  );
}
