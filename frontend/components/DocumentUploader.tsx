"use client";
import { useState, useRef } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface Props {
  onUpload: (file: File) => void;
  loading?: boolean;
}

export function DocumentUploader({ onUpload, loading }: Props) {
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file) return;
    setFilename(file.name);
    setFileSize((file.size / 1024).toFixed(1) + " KB");
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
    onUpload(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !loading && inputRef.current?.click()}
        style={{
          position: "relative",
          overflow: "hidden",
          border: dragging
            ? "2px dashed #38bdf8"
            : "2px dashed rgba(59, 130, 246, 0.25)",
          borderRadius: 16,
          padding: "36px 24px",
          textAlign: "center",
          cursor: loading ? "wait" : "pointer",
          background: dragging
            ? "linear-gradient(180deg, rgba(56,189,248,0.08) 0%, rgba(14,22,41,0.9) 100%)"
            : "linear-gradient(180deg, rgba(14,22,41,0.6) 0%, rgba(10,15,30,0.8) 100%)",
          backdropFilter: "blur(12px)",
          boxShadow: dragging
            ? "0 0 30px rgba(56, 189, 248, 0.25), inset 0 0 20px rgba(56, 189, 248, 0.05)"
            : "0 4px 20px rgba(0, 0, 0, 0.3)",
          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          minHeight: 210,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 14,
        }}
      >
        <input
          ref={inputRef} type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          style={{ display: "none" }}
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {loading ? (
          <>
            <div style={{
              position: "relative",
              width: 56, height: 56, borderRadius: "50%",
              background: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.3)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Loader2 size={26} color="#38bdf8" className="animate-spin" />
            </div>
            <div>
              <div style={{ color: "#f8fafc", fontSize: 14, fontWeight: 700 }}>
                Ingesting Document & Starting Pipeline...
              </div>
              <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 3 }}>
                Executing forensic analysis across 13 evaluation layers
              </div>
            </div>
          </>
        ) : preview ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{
              position: "relative",
              padding: 6,
              background: "rgba(0,0,0,0.4)",
              borderRadius: 12,
              border: "1px solid rgba(59, 130, 246, 0.3)",
            }}>
              <img src={preview} alt="preview" style={{
                maxHeight: 140, maxWidth: 280,
                borderRadius: 8, objectFit: "contain",
              }} />
            </div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "4px 12px", borderRadius: 8,
              background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)",
              color: "#34d399", fontSize: 12, fontWeight: 600
            }}>
              <CheckCircle2 size={14} />
              <span>{filename} ({fileSize}) — Click to change</span>
            </div>
          </div>
        ) : (
          <>
            <div style={{
              width: 62, height: 62, borderRadius: 16,
              background: "linear-gradient(135deg, rgba(56,189,248,0.15) 0%, rgba(99,102,241,0.15) 100%)",
              border: "1px solid rgba(56, 189, 248, 0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 20px rgba(56, 189, 248, 0.2)",
            }}>
              <Upload size={26} color="#38bdf8" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#f8fafc" }}>
                Drag and drop institutional document here
              </div>
              <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
                or <span style={{ color: "#38bdf8", textDecoration: "underline" }}>browse from device</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              {["JPEG", "PNG", "PDF", "UP TO 20 MB"].map(badge => (
                <span key={badge} style={{
                  fontSize: 10, fontWeight: 700, padding: "3px 8px",
                  borderRadius: 6, background: "rgba(255, 255, 255, 0.05)",
                  color: "#64748b", border: "1px solid rgba(255, 255, 255, 0.08)"
                }}>
                  {badge}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
