"use client";
import { useEffect, useState } from "react";
import { getDocuments } from "@/lib/api";
import { FolderOpen, FileText, Eye, ChevronLeft, ChevronRight, Search, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function DocumentsPage() {
  const [docs, setDocs]     = useState<any[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = (p: number) => {
    setLoading(true);
    getDocuments(p).then(d => {
      setDocs(d.documents || []); setTotal(d.total || 0); setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(page); }, [page]);

  const filteredDocs = search.trim()
    ? docs.filter((d: any) =>
        (d.original_filename || "").toLowerCase().includes(search.toLowerCase()) ||
        (d.document_type || "").toLowerCase().includes(search.toLowerCase()) ||
        (d.analysis_id || "").toLowerCase().includes(search.toLowerCase())
      )
    : docs;

  const totalPages = Math.max(1, Math.ceil(total / 20));

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
              background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.3)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <FolderOpen size={18} color="#38bdf8" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#ffffff" }}>
              Screened Documents Repository
            </h1>
          </div>
          <p style={{ color: "#94a3b8", fontSize: 13 }}>
            Historical register of all institutional identity documents evaluated by DocScreen ({total} total)
          </p>
        </div>

        {/* Search */}
        <div style={{ position: "relative", minWidth: 280 }}>
          <Search size={15} color="#64748b" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search documents or IDs..."
            style={{
              width: "100%", padding: "8px 12px 8px 34px",
              background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, color: "#f8fafc", fontSize: 12.5, outline: "none"
            }}
          />
        </div>
      </div>

      {/* Grid Table */}
      <div className="glass-card" style={{ overflow: "hidden", marginBottom: 20 }}>
        {/* Table Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "240px 1fr 120px 90px 120px 100px",
          padding: "14px 22px", background: "rgba(0,0,0,0.25)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          fontSize: 11, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px"
        }}>
          <div>Document Filename</div>
          <div>Classification & ID</div>
          <div>Threat Tier</div>
          <div>Score</div>
          <div>Audit Status</div>
          <div style={{ textAlign: "right" }}>Inspect</div>
        </div>

        {loading ? (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
            Querying repository ledger...
          </div>
        ) : filteredDocs.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center", color: "#64748b" }}>
            No document records found.
          </div>
        ) : (
          filteredDocs.map((doc: any, i: number) => {
            const isHigh = doc.risk_label === "HIGH";
            const isMed = doc.risk_label === "MEDIUM";
            const color = isHigh ? "#f43f5e" : isMed ? "#f59e0b" : "#34d399";

            return (
              <div
                key={i}
                style={{
                  display: "grid", gridTemplateColumns: "240px 1fr 120px 90px 120px 100px",
                  alignItems: "center",
                  padding: "14px 22px",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  transition: "background 0.15s"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    <FileText size={14} color="#38bdf8" />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#f8fafc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {doc.original_filename}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>
                    {doc.document_type || "National Identity Document"}
                  </div>
                  <div className="font-mono" style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                    {doc.analysis_id || doc.id.slice(0, 12)}
                  </div>
                </div>

                <div>
                  {doc.risk_label ? (
                    <span style={{
                      fontSize: 10.5, fontWeight: 800, padding: "2px 8px", borderRadius: 20,
                      background: `${color}15`, border: `1px solid ${color}35`, color,
                      fontFamily: "JetBrains Mono, monospace"
                    }}>
                      {doc.risk_label}
                    </span>
                  ) : (
                    <span style={{ color: "#64748b", fontSize: 11 }}>UNEVALUATED</span>
                  )}
                </div>

                <div className="font-mono" style={{ fontSize: 16, fontWeight: 800, color }}>
                  {doc.risk_score ?? "—"}
                </div>

                <div>
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: doc.review_status === "verified" ? "#34d399" : doc.review_status === "flagged_fraud" ? "#f43f5e" : "#94a3b8",
                    textTransform: "capitalize"
                  }}>
                    {doc.review_status || "Pending"}
                  </span>
                </div>

                <div style={{ textAlign: "right" }}>
                  {doc.analysis_id && (
                    <Link href={`/analyze?result=${doc.analysis_id}`} style={{ textDecoration: "none" }}>
                      <button className="btn-secondary" style={{ fontSize: 11.5, padding: "6px 12px" }}>
                        <Eye size={12} /> View
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            Page {page} of {totalPages} ({total} documents)
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary"
              style={{ padding: "6px 12px", fontSize: 12 }}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary"
              style={{ padding: "6px 12px", fontSize: 12 }}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
