"use client";
import { useState } from "react";

export default function TestFreeNarration() {
  const [text, setText] = useState(
    "Osteoarthritis isn't just wear and tear. It's a disease of the whole joint."
  );
  const [status, setStatus] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function generate() {
    setBusy(true);
    setAudioUrl(null);
    setStatus("Generating...");
    try {
      const res = await fetch("/api/narrate-free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed (${res.status})`);
      }
      const blob = await res.blob();
      setAudioUrl(URL.createObjectURL(blob));
      setStatus("Done");
    } catch (e: any) {
      setStatus("Error: " + e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", color: "#F4F1EA" }}>
      <p style={{ color: "#D4AF37", fontSize: ".8rem", textTransform: "uppercase", marginBottom: 8 }}>
        Test: free AI narration
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
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
        disabled={busy || !text}
        style={{
          background: "#D4AF37",
          color: "#081729",
          border: "none",
          borderRadius: 8,
          padding: "12px 16px",
          fontWeight: 600,
          cursor: busy ? "default" : "pointer",
          opacity: busy || !text ? 0.6 : 1,
        }}
      >
        {busy ? "Working..." : "Generate test clip"}
      </button>
      {status && (
        <p style={{ color: "#9AA6B8", fontSize: ".85rem", marginTop: 10 }}>{status}</p>
      )}
      {audioUrl && (
        <audio src={audioUrl} controls style={{ width: "100%", marginTop: 12 }} />
      )}
    </div>
  );
}
