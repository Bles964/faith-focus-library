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

  // Splits the single narration track's total length across stages, proportional
  // to each stage's word count. This is an estimate — if the timing feels off
  // once you watch the output, adjust the WORD_WEIGHT_OVERRIDE below (seconds
  // per stage, in order) instead of relying on the word-count guess.
  const WORD_WEIGHT_OVERRIDE: number[] | null = null; // e.g. [25, 17, 9, 10, 20]

  function getStageDurations(totalDuration: number): number[] {
    if (WORD_WEIGHT_OVERRIDE) return WORD_WEIGHT_OVERRIDE;
    const wordCounts = oaStages.map((s) => s.narration.trim().split(/\s+/).length);
    const totalWords = wordCounts.reduce((a, b) => a + b, 0);
    return wordCounts.map((w) => (w / totalWords) * totalDuration);
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

      setStatus("Reading narration audio...");
      const audioRes = await fetch("/oa-narration.m4a");
      if (!audioRes.ok) throw new Error("Could not load /oa-narration.m4a — check it's in the public folder");
      const audioBlob = await audioRes.blob();
      const totalDuration = await getAudioDuration(audioBlob);
      const stageDurations = getStageDurations(totalDuration);

      const inputsList: string[] = [];
      for (let idx = 0; idx < oaStages.length; idx++) {
        const stage = oaStages[idx];
        setStatus(`Drawing: ${stage.label}`);
        const pngBlob = await stageToPngBlob(stage);

        const pngName = `frame${idx}.png`;
        await ffmpeg.writeFile(pngName, await fetchFile(pngBlob));

        await ffmpeg.exec([
          "-loop", "1",
          "-i", pngName,
          "-t", String(stageDurations[idx].toFixed(2)),
          "-pix_fmt", "yuv420p",
          `clip${idx}.mp4`,
        ]);
        inputsList.push(`clip${idx}.mp4`);
        setProgress(Math.round(((idx + 1) / oaStages.length) * 70));
      }

      setStatus("Combining scenes...");
      const listContent = inputsList.map((f) => `file '${f}'`).join("\n");
      await ffmpeg.writeFile("list.txt", listContent);
      await ffmpeg.exec(["-f", "concat", "-safe", "0", "-i", "list.txt", "-c", "copy", "silent.mp4"]);
      setProgress(85);

      setStatus("Adding narration...");
      await ffmpeg.writeFile("narration.m4a", await fetchFile(audioBlob));
      await ffmpeg.exec([
        "-i", "silent.mp4",
        "-i", "narration.m4a",
        "-c:v", "copy",
        "-c:a", "aac",
        "-shortest",
        "output.mp4",
      ]);

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
        <>
          <video
            src={downloadUrl}
            controls
            playsInline
            style={{ width: "100%", marginTop: 16, borderRadius: 8, background: "#000" }}
          />
          <a
            href={downloadUrl}
            download="osteoarthritis.mp4"
            style={{ display: "inline-block", marginTop: 14, color: "#D4AF37", textDecoration: "underline" }}
          >
            Download MP4
          </a>
        </>
      )}
    </div>
  );
}
