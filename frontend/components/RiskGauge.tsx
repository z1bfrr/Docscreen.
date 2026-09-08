"use client";
import React, { useId } from "react";

interface Props {
  score: number;
  label: string;
  size?: number;
}

const COLORS = {
  LOW:    { stroke: "#10b981", glow: "rgba(16,185,129,0.45)",  text: "#34d399", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)" },
  MEDIUM: { stroke: "#f59e0b", glow: "rgba(245,158,11,0.45)",  text: "#fbbf24", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
  HIGH:   { stroke: "#f43f5e", glow: "rgba(244,63,94,0.55)",   text: "#fb7185", bg: "rgba(244,63,94,0.12)", border: "rgba(244,63,94,0.35)" },
};

export function RiskGauge({ score, label, size = 180 }: Props) {
  const filterId = useId().replace(/:/g, "");
  const normalizedLabel = (label?.toUpperCase() in COLORS) ? label.toUpperCase() : "LOW";
  const colors = COLORS[normalizedLabel as keyof typeof COLORS];
  
  const strokeWidth = 12;
  const R = size / 2 - strokeWidth;
  const cx = size / 2;
  const cy = size / 2 + 10;
  const circumference = Math.PI * R; // 180 degree semi-circle
  const pct = Math.min(100, Math.max(0, score)) / 100;
  const strokeDash = pct * circumference;

  return (
    <div style={{
      position: "relative", width: size, height: size / 2 + 50,
      display: "flex", flexDirection: "column", alignItems: "center"
    }}>
      <svg width={size} height={size / 2 + 20} style={{ overflow: "visible" }}>
        <defs>
          <filter id={`gauge-glow-${filterId}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id={`gauge-grad-${filterId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.stroke} stopOpacity="0.7" />
            <stop offset="100%" stopColor={colors.stroke} stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Ambient Track Arc */}
        <path
          d={`M ${strokeWidth} ${cy} A ${R} ${R} 0 0 1 ${size - strokeWidth} ${cy}`}
          fill="none"
          stroke="rgba(255, 255, 255, 0.07)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Dynamic Metric Arc */}
        <path
          d={`M ${strokeWidth} ${cy} A ${R} ${R} 0 0 1 ${size - strokeWidth} ${cy}`}
          fill="none"
          stroke={`url(#gauge-grad-${filterId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${strokeDash} ${circumference}`}
          style={{
            filter: `drop-shadow(0 0 10px ${colors.glow})`,
            transition: "stroke-dasharray 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />

        {/* Numeric Readout */}
        <text
          x={cx} y={cy - 12}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={size * 0.24}
          fontWeight={800}
          fontFamily="JetBrains Mono, monospace"
          letterSpacing="-1px"
        >
          {score}
        </text>
        <text
          x={cx} y={cy + 12}
          textAnchor="middle"
          fill="var(--text-muted)"
          fontSize={11}
          fontWeight={600}
          fontFamily="Plus Jakarta Sans, sans-serif"
          letterSpacing="0.5px"
        >
          RISK INDEX / 100
        </text>
      </svg>

      {/* Status Pill with Pulsing Dot */}
      <div style={{
        marginTop: 6,
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "4px 12px", borderRadius: 20,
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        boxShadow: `0 0 14px -3px ${colors.glow}`
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: "50%",
          backgroundColor: colors.stroke,
          boxShadow: `0 0 8px ${colors.stroke}`
        }} />
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.8px",
          color: colors.text, textTransform: "uppercase"
        }}>
          {label} RISK
        </span>
      </div>
    </div>
  );
}
