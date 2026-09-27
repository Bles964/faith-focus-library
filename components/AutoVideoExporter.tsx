"use client";
import { useState } from "react";
import type { ComponentType } from "react";
import { createRoot } from "react-dom/client";

type BaseStage = { label: string; narration: string };

type Props<T extends BaseStage> = {
  stages: T[];
  StageComponent: ComponentType<{ stage: T }>;
  buttonLabel: string;
  fileName: string;
  voice?: string;
};

export default function AutoVideoExporter<T extends BaseStage>({
  stages,
  StageComponent,
  buttonLabel,
  fileName,
  voice,
}: Props<T>) {
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function stageToPngBlob(stage: T): Promise<Blob> {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(<StageComponent stage={stage} />);
    await new Promise((r) => setTimeout(r, 100));
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
    audioCtx.close();
    return decoded.duration;
  }

  async function build() {
    setBusy(true);
    setVideoUrl(null);
    setProgress(0);
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

      const clips: string[] = [];
      for (let idx = 0; idx < stages.length; idx++) {
        const stage = stages[idx];

        setStatus(`Narrating: ${stage.label}`);
        const res = await fetch("/api/narrate-free", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: stage.narration, voice }),
        });
        if (!res.ok) {
          let msg = "";
          try {
            msg = (await res.json()).error;
          } catch {}
          throw new Error(`Narration failed for ${stage.label}: ${msg || res.status}`);
        }
        const audioBlob = await res.blob();
        const duration = await getAudioDuration(audioBlob);

        setStatus(`Drawing: ${stage.label}`);
        const pngBlob = await stageToPngBlob(stage);

        const pngName = `frame${idx}.png`;
        const audioName = `audio${idx}.mp3`;
        await ffmpeg.writeFile(pngName, await fetchFile(pngBlob));
        await ffmpeg.writeFile(audioName, await fetchFile(audioBlob));

        await ffmpeg.exec([
          "-loop", "1",
          "-i", pngName,
          "-i", audioName,
          "-c:v", "libx264",
          "-t", String((duration + 0.4).toFixed(2)),
          "-pix_fmt", "yuv420p",
          "-c:a", "aac",
          "-shortest",
          `clip${idx}.mp4`,
        ]);
        clips.push(`clip${idx}.mp4`);
        setProgress(Math.round(((idx + 1) / stages.length) * 90));
      }

      setStatus("Combining scenes...");
      await ffmpeg.writeFile("list.txt", clips.map((f) => `file '${f}'`).join("\n"));
      await ffmpeg.exec(["-f", "concat", "-safe", "0", "-i", "list.txt", "-c", "copy", "output.mp4"]);

      const data = await ffmpeg.readFile("output.mp4");
      const blob = new Blob([data as unknown as ArrayBuffer], { type: "video/mp4" });
      setVideoUrl(URL.createObjectURL(blob));
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
        {busy ? "Building video..." : buttonLabel}
      </button>
      {status && (
        <p style={{ color: "#9AA6B8", fontSize: ".85rem", marginTop: 10 }}>
          {status} {progress > 0 && `(${progress}%)`}
        </p>
      )}
      {videoUrl && (
        <>
          <video
            src={videoUrl}
            controls
            playsInline
            style={{ width: "100%", marginTop: 16, borderRadius: 8, background: "#000" }}
          />
          <a
            href={videoUrl}
            download={fileName}
            style={{ display: "inline-block", marginTop: 14, color: "#D4AF37", textDecoration: "underline" }}
          >
            Download MP4
          </a>
        </>
      )}
    </div>
  );
}
