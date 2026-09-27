"use client";
import { useState } from "react";
import { extractPdfText } from "@/lib/pdfText";

type GeneratedStage = { label: string; narration: string };

export default function ScriptGenerator() {
  const [pdfUrl, setPdfUrl] = useState("");
  const [status, setStatus] = useState("");
  const [stages, setStages] = useState<GeneratedStage[] | null>(null);
  const [busy, setBusy] = useState(false);

  async function generate() {
    setBusy(true);
    setStages(null);
    try {
      setStatus("Reading PDF...");
      const text = await extractPdfText(pdfUrl);
      if (!text.trim()) throw new Error("Couldn't find any text in that PDF");

      setStatus("Writing script...");
      const res = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Script generation failed");

      setStages(data.stages);
      setStatus("Done");
    } catch (e: any) {
      setStatus("Error: " + e.message);
    } finally {
      setBusy(false);
    }
  }

  function copyAll() {
    if (!stages) return;
    const text = stages
      .map((s, i) => `${i + 1}. "${s.label}"\n${s.narration}`)
      .join("\n\n");
    navigator.clipboard.writeText(text);
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", color: "#F4F1EA" }}>
      <input
        type="text"
        value={pdfUrl}
        onChange={(e) => setPdfUrl(e.target.value)}
        placeholder="Paste the document's PDF URL"
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: 8,
          border: "1px solid #2A3E5C",
          background: "#0B1F3A",
          color: "#F4F1EA",
          marginBottom: 12,
        }}
      />
      <button
        onClick={generate}
        disabled={busy || !pdfUrl}
        style={{
          background: "#D4AF37",
          color: "#081729",
          border: "none",
          borderRadius: 8,
          padding: "12px 16px",
          fontWeight: 600,
          cursor: busy ? "default" : "pointer",
          opacity: busy || !pdfUrl ? 0.6 : 1,
        }}
      >
        {busy ? "Working..." : "Generate script"}
      </button>

      {status && (
        <p style={{ color: "#9AA6B8", fontSize: ".85rem", marginTop: 10 }}>{status}</p>
      )}

      {stages && (
        <div style={{ marginTop: 20 }}>
          {stages.map((s, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <p style={{ color: "#D4AF37", fontSize: ".8rem", textTransform: "uppercase", marginBottom: 4 }}>
                {i + 1}. {s.label}
              </p>
              <p style={{ fontSize: ".95rem", lineHeight: 1.5 }}>{s.narration}</p>
            </div>
          ))}
          <button
            onClick={copyAll}
            style={{
              marginTop: 8,
              background: "transparent",
              color: "#D4AF37",
              border: "1px solid #D4AF37",
              borderRadius: 8,
              padding: "8px 14px",
              cursor: "pointer",
            }}
          >
            Copy full script
          </button>
        </div>
      )}
    </div>
  );
}
