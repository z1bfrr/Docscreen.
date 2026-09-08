"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, FileSearch, FolderOpen, AlertTriangle,
  BarChart3, Cpu, Settings, Shield, ScanLine, Terminal, CheckCircle2
} from "lucide-react";

const NAV = [
  { href: "/",           label: "Overview",        icon: LayoutDashboard, badge: null, shortcut: "⌘1" },
  { href: "/analyze",    label: "Forensic Studio", icon: ScanLine,        badge: "AI", shortcut: "⌘2" },
  { href: "/documents",  label: "Ledger Vault",    icon: FolderOpen,      badge: null, shortcut: "⌘3" },
  { href: "/risk-queue", label: "Threat Triage",   icon: AlertTriangle,   badge: "Live", shortcut: "⌘4" },
  { href: "/analytics",  label: "Intelligence",    icon: BarChart3,       badge: null, shortcut: "⌘5" },
  { href: "/compare",    label: "Field Diff Lab",  icon: FileSearch,      badge: null, shortcut: "⌘6" },
  { href: "/settings",   label: "Core Config",     icon: Settings,        badge: null, shortcut: "⌘7" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      position: "fixed", left: 0, top: 0, bottom: 0,
      width: "240px",
      background: "#080c16",
      borderRight: "1px solid rgba(255, 255, 255, 0.07)",
      display: "flex", flexDirection: "column",
      zIndex: 100,
      boxShadow: "4px 0 25px rgba(0, 0, 0, 0.5)",
    }}>
      {/* Brand Header with Custom Modern Emblem */}
      <div style={{
        padding: "18px 18px 16px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Custom Biometric Radar Logo */}
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: "linear-gradient(135deg, #0284c7 0%, #3b82f6 50%, #4f46e5 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(14, 165, 233, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            flexShrink: 0
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L20 6V12C20 17.5 12 22 12 22C12 22 4 17.5 4 12V6L12 2Z" />
              <circle cx="12" cy="11" r="3" stroke="#38bdf8" strokeWidth="1.5" />
              <path d="M9 11H15" stroke="#38bdf8" strokeWidth="1.5" />
            </svg>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{
                fontWeight: 800, fontSize: 15,
                color: "#ffffff",
                letterSpacing: "-0.4px",
                lineHeight: 1.1
              }}>
                DOC<span style={{ color: "#38bdf8" }}>SCREEN</span>
              </span>
              <span style={{
                fontSize: 8.5, fontWeight: 700, padding: "1px 4px", borderRadius: 3,
                background: "rgba(56, 189, 248, 0.15)", color: "#38bdf8",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                fontFamily: "JetBrains Mono, monospace"
              }}>
                PRO
              </span>
            </div>
            <span style={{
              fontSize: 9.5, color: "#64748b", fontWeight: 600,
              letterSpacing: "0.5px", marginTop: 2
            }}>
              DOCUMENT INTELLIGENCE
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: "14px 10px", overflowY: "auto" }}>
        <div style={{
          fontSize: 9.5, fontWeight: 700, color: "#475569",
          letterSpacing: "0.9px", textTransform: "uppercase",
          padding: "4px 10px 8px"
        }}>
          Workspaces
        </div>
        {NAV.map(({ href, label, icon: Icon, badge, shortcut }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <div style={{
                position: "relative",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "8.5px 12px", borderRadius: 8, marginBottom: 2.5,
                background: active ? "rgba(56, 189, 248, 0.1)" : "transparent",
                border: active ? "1px solid rgba(56, 189, 248, 0.25)" : "1px solid transparent",
                color: active ? "#ffffff" : "#94a3b8",
                fontSize: 13, fontWeight: active ? 600 : 500,
                transition: "all 0.15s ease",
                cursor: "pointer",
              }}>
                {active && (
                  <div style={{
                    position: "absolute", left: 0, top: "25%", bottom: "25%",
                    width: 3, borderRadius: 2, background: "#38bdf8",
                    boxShadow: "0 0 8px #38bdf8"
                  }} />
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Icon size={16} color={active ? "#38bdf8" : "#64748b"} />
                  <span>{label}</span>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {badge && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: "1.5px 5px",
                      borderRadius: 4,
                      background: badge === "Live" ? "rgba(244,63,94,0.15)" : "rgba(56,189,248,0.18)",
                      color: badge === "Live" ? "#f43f5e" : "#38bdf8",
                    }}>
                      {badge}
                    </span>
                  )}
                  <span style={{
                    fontSize: 10, color: "#334155", fontFamily: "JetBrains Mono, monospace",
                    fontWeight: 600
                  }}>
                    {shortcut}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* System Status Mockup Card */}
      <div style={{
        padding: "12px 14px",
        margin: "10px",
        background: "rgba(15, 23, 42, 0.6)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: 10,
        fontSize: 11,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ color: "#64748b", fontWeight: 600 }}>Active Nodes</span>
          <span style={{ color: "#34d399", fontWeight: 700, display: "flex", alignItems: "center", gap: 5, fontSize: 10.5 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
            ONLINE
          </span>
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between", color: "#475569",
          fontSize: 10, fontFamily: "JetBrains Mono, monospace"
        }}>
          <span>LATENCY</span>
          <span style={{ color: "#94a3b8" }}>14ms · LOCAL</span>
        </div>
      </div>
    </aside>
  );
}
