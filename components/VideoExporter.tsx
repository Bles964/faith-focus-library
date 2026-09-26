"use client";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { oaStages } from "@/lib/oaScript";
import JointStageSvg from "./JointStageSvg";

export default function VideoExporter() {
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function stageToPngBlob(stage: (typeof oaStages)[number]): Promise<Blob> {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(<JointStageSvg stage={stage} />);
    await new Promise((r) => setTimeout(r, 50));
    const svgEl = container.querySelector("svg")!;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = 380;
    canvas.height = 460;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(url);
    root.unmount();
    document.body.removeChild(container);
    return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
  }

  async function getAudioDuration(blob: Blob): Promise<number> {
    const arrayBuffer = await blob.arrayBuffer();
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const decoded = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
    return decoded.duration;
  }

  async function build() {
    setBusy(true);
    setDownloadUrl(null);
    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { fetchFile, toBlobURL } = await import("@ffmpeg/util");
      const ffmpeg = new FFmpeg();
      setStatus("Loading video engine...");
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });

      const inputsList: string[] = [];
      for (let idx = 0; idx < oaStages.length; idx++) {
        const stage = oaStages[idx];
        setStatus(`Narrating: ${stage.label}`);
        const res = await fetch("/api/narrate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: stage.narration }),
        });
        if (!res.ok) throw new Error("Narration failed for " + stage.label);
        const audioBlob = await res.blob();
        const duration = await getAudioDuration(audioBlob);

        setStatus(`Drawing: ${stage.label}`);
        const pngBlob = await stageToPngBlob(stage);

        const pngName = `frame${idx}.png`;
        const mp3Name = `audio${idx}.mp3`;
        await ffmpeg.writeFile(pngName, await fetchFile(pngBlob));
        await ffmpeg.writeFile(mp3Name, await fetchFile(audioBlob));

        await ffmpeg.exec([
          "-loop", "1",
          "-i", pngName,
          "-i", mp3Name,
          "-c:v", "libx264",
          "-t", String(duration + 0.4),
          "-pix_fmt", "yuv420p",
          "-c:a", "aac",
          "-shortest",
          `clip${idx}.mp4`,
        ]);
        inputsList.push(`clip${idx}.mp4`);
        setProgress(Math.round(((idx + 1) / oaStages.length) * 90));
      }

      setStatus("Combining scenes...");
      const listContent = inputsList.map((f) => `file '${f}'`).join("\n");
      await ffmpeg.writeFile("list.txt", listContent);
      await ffmpeg.exec(["-f", "concat", "-safe", "0", "-i", "list.txt", "-c", "copy", "output.mp4"]);

      const data = await ffmpeg.readFile("output.mp4");
      const blob = new Blob([data as unknown as ArrayBuffer], { type: "video/mp4" });
      setDownloadUrl(URL.createObjectURL(blob));
      setProgress(100);
      setStatus("Done");
    } catch (e: any) {
      setStatus("Error: " + e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", color: "#F4F1EA" }}>
      <button
        onClick={build}
        disabled={busy}
        style={{
          background: "#D4AF37",
          color: "#081729",
          border: "none",
          borderRadius: 8,
          padding: "12px 16px",
          fontWeight: 600,
          cursor: busy ? "default" : "pointer",
          opacity: busy ? 0.6 : 1,
        }}
      >
        {busy ? "Building video..." : "Generate osteoarthritis video"}
      </button>
      {status && (
        <p style={{ color: "#9AA6B8", fontSize: ".85rem", marginTop: 10 }}>
          {status} {progress > 0 && `(${progress}%)`}
        </p>
      )}
      {downloadUrl && (
        <a
          href={downloadUrl}
          download="osteoarthritis.mp4"
          style={{ display: "inline-block", marginTop: 14, color: "#D4AF37", textDecoration: "underline" }}
        >
          Download MP4
        </a>
      )}
    </div>
  );
}
