"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ScanLine, ArrowRight } from "lucide-react";

const NAV = [
  { href: "/",           label: "Overview" },
  { href: "/analyze",    label: "Forensic Studio", badge: "AI" },
  { href: "/documents",  label: "Ledger" },
  { href: "/risk-queue", label: "Threat Triage", badge: "Live" },
  { href: "/analytics",  label: "Intelligence" },
  { href: "/compare",    label: "Field Diff" },
  { href: "/settings",   label: "Config" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header style={{
      position: "sticky",
      top: 14,
      zIndex: 100,
      maxWidth: "1240px",
      margin: "0 auto",
      padding: "0 16px",
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        gap: 32,
        padding: "10px 24px",
        borderRadius: "999px",
        background: "rgba(10, 14, 20, 0.9)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 16px 40px -10px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
      }}>
        {/* Brand Left */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
          {/* Nordic Biometric Aperture Logo */}
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "linear-gradient(135deg, #4272D4 0%, #2F55A6 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(66, 114, 212, 0.45)",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            flexShrink: 0
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L20 6V12C20 17.5 12 22 12 22C12 22 4 17.5 4 12V6L12 2Z" />
              <circle cx="12" cy="11" r="2.5" stroke="#ffffff" strokeWidth="1.5" />
            </svg>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
            <span style={{
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: "0.06em",
              color: "#F4F8FD",
              fontFamily: "'Poppins', sans-serif",
            }}>
              DOCSCREEN
            </span>
            <span style={{
              fontWeight: 800,
              fontSize: 18,
              color: "#4272D4",
            }}>
              .
            </span>
          </div>
        </Link>

        {/* Center Nav Links - properly centered and spaced */}
        <nav style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 26,
          margin: "0 auto",
        }}>
          {NAV.map(({ href, label, badge }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} style={{ textDecoration: "none" }}>
                <span style={{
                  position: "relative",
                  fontSize: 13.5,
                  fontWeight: active ? 600 : 500,
                  color: active ? "#F4F8FD" : "#93A3B8",
                  transition: "color 0.2s ease",
                  padding: "6px 2px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5
                }}>
                  {label}
                  {badge && (
                    <span style={{
                      fontSize: 8.5,
                      fontWeight: 800,
                      padding: "1px 5px",
                      borderRadius: "999px",
                      background: badge === "Live" ? "rgba(244,63,94,0.18)" : "rgba(66,114,212,0.22)",
                      color: badge === "Live" ? "#f43f5e" : "#4272D4",
                      border: `1px solid ${badge === "Live" ? "rgba(244,63,94,0.3)" : "rgba(66,114,212,0.4)"}`
                    }}>
                      {badge}
                    </span>
                  )}
                  {/* Underline Indicator */}
                  {active && (
                    <span style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: 2,
                      borderRadius: 1,
                      background: "#4272D4",
                      boxShadow: "0 0 8px rgba(66, 114, 212, 0.8)",
                    }} />
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Right CTA Button */}
        <div>
          <Link href="/analyze" style={{ textDecoration: "none" }}>
            <button style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: "999px",
              fontWeight: 600,
              fontSize: 13,
              padding: "9px 20px",
              background: "#4272D4",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              cursor: "pointer",
              transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: "0 4px 18px rgba(66, 114, 212, 0.45)",
            }}>
              <ScanLine size={14} />
              <span>Screen Document</span>
              <ArrowRight size={13} />
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}
