"use client";
import { useRef, useState } from "react";
import type { ComponentType } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@/lib/supabaseClient";

type BaseStage = { label: string; narration: string };

type Props<T extends BaseStage> = {
  stages: T[];
  StageComponent: ComponentType<{ stage: T }>;
  buttonLabel: string;
  fileName: string;
  voice?: string;
  saveTitle?: string;
};

const ENGINE_SERVERS = [
  "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd",
  "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd",
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function prettyTitle(fileName: string) {
  const t = fileName.replace(/\.mp4$/i, "").replace(/[-_]+/g, " ").trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export default function AutoVideoExporter<T extends BaseStage>({
  stages,
  StageComponent,
  buttonLabel,
  fileName,
  voice,
  saveTitle,
}: Props<T>) {
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Kept between attempts, so a retry does not repeat finished work
  const ffmpegRef = useRef<any>(null);
  const audioCache = useRef<Map<string, Blob>>(new Map());
  const blobRef = useRef<Blob | null>(null);
  const [title, setTitle] = useState(() => saveTitle ?? prettyTitle(fileName));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

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

  async function getEngine() {
    if (ffmpegRef.current) return ffmpegRef.current;

    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const { toBlobURL } = await import("@ffmpeg/util");

    let lastErr = "";
    for (let round = 1; round <= 2; round++) {
      for (let s = 0; s < ENGINE_SERVERS.length; s++) {
        const base = ENGINE_SERVERS[s];
        try {
          setStatus(
            round === 1 && s === 0
              ? "Loading video engine..."
              : `Loading video engine... (server ${s + 1}, try ${round})`
          );
          const ff = new FFmpeg();
          await ff.load({
            coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
            wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm"),
          });
          ffmpegRef.current = ff;
          return ff;
        } catch (e: any) {
          lastErr = e?.message || "download failed";
          setStatus("Engine download dropped, trying again...");
          await sleep(1500);
        }
      }
    }
    throw new Error(`Could not download the video engine (${lastErr}).`);
  }

  async function getNarration(stage: T): Promise<Blob> {
    const key = `${voice ?? ""}|${stage.narration}`;
    const cached = audioCache.current.get(key);
    if (cached) return cached;

    let lastErr = "";
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        setStatus(
          attempt === 1
            ? `Narrating: ${stage.label}`
            : `Narrating: ${stage.label} (try ${attempt} of 3)`
        );
        const signal =
          typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
            ? (AbortSignal as any).timeout(70000)
            : undefined;
        const res = await fetch("/api/narrate-free", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: stage.narration, voice }),
          signal,
        });
        if (res.ok) {
          const blob = await res.blob();
          audioCache.current.set(key, blob);
          return blob;
        }
        let msg = "";
        try {
          msg = (await res.json()).error;
        } catch {}
        lastErr = msg || `status ${res.status}`;
      } catch (e: any) {
        lastErr = e?.message || "network error";
      }
      await sleep(2000 * attempt);
    }
    throw new Error(`Narration failed for ${stage.label}: ${lastErr}`);
  }

  async function build() {
    setBusy(true);
    setVideoUrl(null);
    setProgress(0);
    setSaved(false);
    setSaveMsg("");
    blobRef.current = null;
    try {
      const ffmpeg = await getEngine();
      const { fetchFile } = await import("@ffmpeg/util");

      const clips: string[] = [];
      for (let idx = 0; idx < stages.length; idx++) {
        const stage = stages[idx];

        const audioBlob = await getNarration(stage);
        const duration = await getAudioDuration(audioBlob);

        setStatus(`Drawing: ${stage.label}`);
        const pngBlob = await stageToPngBlob(stage);

        const pngName = `frame${idx}.png`;
        const audioName = `audio${idx}.${audioBlob.type.includes("wav") ? "wav" : "mp3"}`;
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
      blobRef.current = blob;
      setVideoUrl(URL.createObjectURL(blob));
      setProgress(100);
      setStatus("Done");
    } catch (e: any) {
      const msg: string = e?.message || "Something went wrong";
      if (/load failed|failed to fetch|network/i.test(msg)) {
        setStatus(
          "Error: the connection dropped. Tap the button again. Parts already finished are kept, so it will be quicker."
        );
      } else {
        setStatus("Error: " + msg + " Tap the button to try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function saveToLibrary() {
    if (!blobRef.current || saved) return;
    if (!title.trim()) {
      setSaveMsg("Please type a title first.");
      return;
    }
    setSaving(true);
    setSaveMsg("Saving…");
    try {
      const supabase = createClient();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.mp4`;
      const { error: upErr } = await supabase.storage
        .from("exam-videos")
        .upload(path, blobRef.current, { contentType: "video/mp4", upsert: false });
      if (upErr) throw new Error(upErr.message);

      const { error: dbErr } = await supabase.from("exam_videos").insert({
        title: title.trim(),
        category: "Teaching videos",
        description: null,
        file_path: path,
      });
      if (dbErr) {
        await supabase.storage.from("exam-videos").remove([path]);
        throw new Error(dbErr.message);
      }
      setSaved(true);
      setSaveMsg("Saved. Students can now watch it in the Clinical tab.");
    } catch (e: any) {
      setSaveMsg("Could not save: " + (e?.message || "please try again"));
    } finally {
      setSaving(false);
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
          {status} {progress > 0 && progress < 100 && `(${progress}%)`}
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
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid #2A3E5C" }}>
            <p style={{ color: "#9AA6B8", fontSize: ".8rem", marginBottom: 6 }}>Save this video to the library</p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={saving || saved}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #2A3E5C",
                background: "#0B1F3A",
                color: "#F4F1EA",
                marginBottom: 10,
              }}
            />
            <button
              onClick={saveToLibrary}
              disabled={saving || saved}
              style={{
                background: "#D4AF37",
                color: "#081729",
                border: "none",
                borderRadius: 8,
                padding: "10px 14px",
                fontWeight: 600,
                cursor: saving || saved ? "default" : "pointer",
                opacity: saving || saved ? 0.6 : 1,
              }}
            >
              {saved ? "Saved" : saving ? "Saving..." : "Save to library"}
            </button>
            {saveMsg && <p style={{ color: "#9AA6B8", fontSize: ".85rem", marginTop: 8 }}>{saveMsg}</p>}
          </div>
        </>
      )}
    </div>
  );
}
