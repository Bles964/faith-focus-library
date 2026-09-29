"use client";
import { useState } from "react";
import { extractPdfText } from "@/lib/pdfText";
import AutoVideoExporter from "./AutoVideoExporter";
import AutoStageSvg from "./AutoStageSvg";
import type { AutoStage } from "./AutoStageSvg";

const CHUNK_SIZE = 5000;
const MAX_CHUNKS = 10;

function splitIntoChunks(text: string): string[] {
  const clean = text.replace(/\r/g, "").trim();
  if (clean.length <= CHUNK_SIZE) return [clean];

  // Break into small pieces first (paragraphs, then sentences, then hard slices)
  const pieces: string[] = [];
  for (const para of clean.split(/\n+/)) {
    const p = para.trim();
    if (!p) continue;
    if (p.length <= CHUNK_SIZE) {
      pieces.push(p);
      continue;
    }
    const sentences = p.match(/[^.!?]+[.!?]*\s*/g) || [p];
    for (const s of sentences) {
      if (s.length <= CHUNK_SIZE) {
        pieces.push(s.trim());
      } else {
        for (let i = 0; i < s.length; i += CHUNK_SIZE) {
          pieces.push(s.slice(i, i + CHUNK_SIZE));
        }
      }
    }
  }

  // Pack pieces into chunks up to CHUNK_SIZE
  const chunks: string[] = [];
  let current = "";
  for (const piece of pieces) {
    if (current && current.length + piece.length + 1 > CHUNK_SIZE) {
      chunks.push(current);
      current = piece;
    } else {
      current = current ? current + "\n" + piece : piece;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

async function generateForChunk(chunk: string): Promise<AutoStage[]> {
  const res = await fetch("/api/generate-script", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: chunk }),
  });
  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server didn't return JSON (status ${res.status})`);
  }
  if (!res.ok) throw new Error(data.error || "Script generation failed");
  if (!Array.isArray(data.stages) || data.stages.length === 0) {
    throw new Error("No stages came back");
  }
  return data.stages as AutoStage[];
}

export default function AutoVideoMaker() {
  const [pdfUrl, setPdfUrl] = useState("");
  const [status, setStatus] = useState("");
  const [stages, setStages] = useState<AutoStage[] | null>(null);
  const [busy, setBusy] = useState(false);

  async function makeScript() {
    setBusy(true);
    setStages(null);
    try {
      setStatus("Reading PDF...");
      let text = "";
      try {
        text = await extractPdfText(pdfUrl.trim());
      } catch (e: any) {
        throw new Error("PDF read step failed: " + e.message);
      }
      if (!text.trim()) throw new Error("Couldn't find any text in that PDF");

      let chunks = splitIntoChunks(text);
      let trimmedNote = "";
      if (chunks.length > MAX_CHUNKS) {
        chunks = chunks.slice(0, MAX_CHUNKS);
        trimmedNote = ` Only the first ${MAX_CHUNKS} parts were used.`;
      }

      const all: AutoStage[] = [];
      for (let i = 0; i < chunks.length; i++) {
        setStatus(`Writing script, part ${i + 1} of ${chunks.length}...`);
        let result: AutoStage[];
        try {
          result = await generateForChunk(chunks[i]);
        } catch {
          // one retry for this part
          try {
            result = await generateForChunk(chunks[i]);
          } catch (e2: any) {
            throw new Error(`Part ${i + 1} of ${chunks.length} failed: ${e2.message}`);
          }
        }
        all.push(...result);
      }

      setStages(all);
      setStatus(`Script ready (${all.length} stages). Now tap Make video.${trimmedNote}`);
    } catch (e: any) {
      setStatus("Error: " + e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", color: "#F4F1EA" }}>
      <p style={{ color: "#D4AF37", fontSize: ".8rem", textTransform: "uppercase", marginBottom: 8 }}>
        Automatic video from any document
      </p>
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
        onClick={makeScript}
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
        {busy ? "Working..." : "Step 1: Write script"}
      </button>

      {status && <p style={{ color: "#9AA6B8", fontSize: ".85rem", marginTop: 10 }}>{status}</p>}

      {stages && (
        <div style={{ marginTop: 20 }}>
          {stages.map((s, i) => (
            <p key={i} style={{ fontSize: ".9rem", marginBottom: 6 }}>
              <span style={{ color: "#D4AF37" }}>
                {i + 1}. {s.label}
              </span>
              <span style={{ color: "#9AA6B8" }}> · {s.visual?.type ?? "list"}</span>
            </p>
          ))}
          <div style={{ marginTop: 16 }}>
            <AutoVideoExporter
              key={stages.map((s) => s.label).join("|")}
              stages={stages}
              StageComponent={AutoStageSvg}
              buttonLabel="Step 2: Make video"
              fileName="faith-focus-video.mp4"
            />
          </div>
        </div>
      )}
    </div>
  );
}
