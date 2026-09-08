"use client";
import { useEffect, useState } from "react";
import { getAnalytics } from "@/lib/api";
import { BarChart3, TrendingUp, PieChart as PieIcon, Layers, ShieldCheck, Activity } from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, AreaChart, Area
} from "recharts";

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "#0b1120",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: 8,
    color: "#f8fafc",
    fontSize: 12,
    boxShadow: "0 8px 25px rgba(0,0,0,0.5)"
  }
};

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { getAnalytics().then(setData).catch(() => {}); }, []);

  if (!data) return (
    <div style={{ color: "#94a3b8", padding: "80px 20px", textAlign: "center" }}>
      Loading intelligence analytics...
    </div>
  );

  const pieData = [
    { name: "Low Risk",    value: data.low_risk_count,    color: "#10b981" },
    { name: "Medium Risk", value: data.medium_risk_count, color: "#f59e0b" },
    { name: "High Risk",   value: data.high_risk_count,   color: "#f43f5e" },
  ];

  const anomData = Object.entries(data.anomaly_breakdown || {}).map(
    ([k, v]) => ({ name: k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()), value: v as number })
  );

  const trendData = [...(data.recent_trend || [])].reverse().map((item: any, idx: number) => ({
    index: idx + 1,
    date: item.date,
    score: item.risk_score,
    label: item.risk_label
  }));

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
              <BarChart3 size={18} color="#38bdf8" />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#ffffff" }}>
              Screening Intelligence & Threat Analytics
            </h1>
          </div>
          <p style={{ color: "#94a3b8", fontSize: 13 }}>
            Continuous monitoring of document fraud vectors and anomaly cluster rates
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 24 }}>
        {[
          ["TOTAL SCREENED", data.total_documents, "#f8fafc", "Historical volume"],
          ["LOW RISK",       `${data.low_risk_count}`,   "#34d399", `${data.low_risk_pct}% cleared`],
          ["MEDIUM RISK",    `${data.medium_risk_count}`, "#fbbf24", `${data.medium_risk_pct}% review`],
          ["HIGH RISK",      `${data.high_risk_count}`,   "#f43f5e", `${data.high_risk_pct}% fraud`],
          ["MEAN RISK SCORE", data.average_risk_score,    "#38bdf8", "Signal average"],
        ].map(([l, v, c, sub]) => (
          <div key={l as string} className="glass-card" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 10.5, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.6px" }}>
              {l}
            </div>
            <div className="font-mono" style={{ fontSize: 24, fontWeight: 800, color: c as string, marginTop: 4 }}>
              {v}
            </div>
            <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 4 }}>
              {sub}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 20, marginBottom: 20 }}>
        {/* Pie */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{
            fontWeight: 800, fontSize: 12, color: "#94a3b8",
            letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 16,
            display: "flex", alignItems: "center", gap: 6
          }}>
            <PieIcon size={14} color="#38bdf8" /> Risk Ratio Breakdown
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={pieData} cx="50%" cy="50%"
                outerRadius={90} innerRadius={55}
                dataKey="value" paddingAngle={4}
                label={({ name, percent }) => `${name} ${(((percent as number | undefined) ?? 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip {...TOOLTIP_STYLE} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Anomaly bar */}
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{
            fontWeight: 800, fontSize: 12, color: "#94a3b8",
            letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 16,
            display: "flex", alignItems: "center", gap: 6
          }}>
            <Layers size={14} color="#38bdf8" /> Threat Signature Frequencies
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={anomData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" stroke="#64748b" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} width={130} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="value" fill="#38bdf8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trend Area Chart */}
      {trendData.length > 0 && (
        <div className="glass-card" style={{ padding: 22 }}>
          <div style={{
            fontWeight: 800, fontSize: 12, color: "#94a3b8",
            letterSpacing: "0.6px", textTransform: "uppercase", marginBottom: 16,
            display: "flex", alignItems: "center", gap: 6
          }}>
            <Activity size={14} color="#38bdf8" /> Chronological Risk Index Trend
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ left: 0, right: 20, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="index" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" domain={[0, 100]} fontSize={11} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="score" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
