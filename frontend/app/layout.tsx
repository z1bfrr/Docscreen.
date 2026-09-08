import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "DocScreen — AI Document Screening | SIH 2026",
  description: "Multi-Layer AI Document Intelligence and Risk Screening System. Signal fusion engine for document authenticity screening.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "var(--bg-primary)" }}>
          <Navbar />
          <main style={{
            flex: 1,
            width: "100%",
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "28px 24px 80px 24px",
          }}>
            {children}
          </main>
          
          {/* NordPixel-style Minimal Swiss Footer */}
          <footer style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.07)",
            padding: "36px 24px",
            background: "#080b10",
            marginTop: "auto"
          }}>
            <div style={{
              maxWidth: 1240,
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 20
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: "linear-gradient(135deg, #4272D4 0%, #2F55A6 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 0 12px rgba(66, 114, 212, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.2)"
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L20 6V12C20 17.5 12 22 12 22C12 22 4 17.5 4 12V6L12 2Z" />
                    <circle cx="12" cy="11" r="2.5" stroke="#ffffff" strokeWidth="1.5" />
                  </svg>
                </div>
                <span style={{ fontWeight: 800, fontSize: 14, letterSpacing: "0.08em", color: "#F4F8FD", fontFamily: "'Poppins', sans-serif" }}>
                  DOCSCREEN<span style={{ color: "#4272D4" }}>.</span>
                </span>
                <span style={{ fontSize: 12, color: "#64748B", marginLeft: 8 }}>
                  Multi-Layer Forensic Screening &amp; Verification Protocol
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 12, color: "#93A3B8" }}>
                <span>SIH 2026 Official</span>
                <span>•</span>
                <span>Forensic Protocol Active</span>
                <span>•</span>
                <span>Swiss-grade Verification Engine</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
