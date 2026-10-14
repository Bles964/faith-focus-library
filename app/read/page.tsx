"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

type DocLite = { id: string; title: string };
type Chunk = { text: string; page: number };

// A tiny silent sound, used to unlock audio on phones when you tap Listen
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

// Cut one page of text into short pieces (a few sentences each)
function chunkText(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const pieces: string[] = [];
  for (const sentence of sentences) {
    let rest = sentence.trim();
    while (rest.length > 380) {
      let cut = rest.lastIndexOf(", ", 380);
      if (cut < 100) cut = rest.lastIndexOf(" ", 380);
      if (cut < 100) cut = 380;
      pieces.push(rest.slice(0, cut + 1).trim());
      rest = rest.slice(cut + 1).trim();
    }
    if (rest) pieces.push(rest);
  }
  const chunks: string[] = [];
  let current = "";
  for (const piece of pieces) {
    if ((current + " " + piece).length > 450) {
      if (current) chunks.push(current.trim());
      current = piece;
    } else {
      current = current ? current + " " + piece : piece;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

export default function ReadPage() {
  const supabase = createClient();
  const router = useRouter();
  const [docs, setDocs] = useState<DocLite[]>([]);
  const [currentId, setCurrentId] = useState("");
  const [filePath, setFilePath] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("Opening…");
  const [error, setError] = useState("");
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [listening, setListening] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);

  const pdfRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const loadTokenRef = useRef(0);
  const pageRef = useRef(1);

  // Listening
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prefetchRef = useRef<Map<number, Promise<string>>>(new Map());
  const chunksRef = useRef<Chunk[]>([]);
  const chunkIndexRef = useRef(0);
  const tokenRef = useRef(0);
  const usingFallbackRef = useRef(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  /* ---------------- Listening ---------------- */

  function getAudio(): HTMLAudioElement {
    if (!audioRef.current) {
      const a = new Audio();
      a.preload = "auto";
      audioRef.current = a;
    }
    return audioRef.current;
  }

  async function fetchChunkAudio(text: string): Promise<string> {
    let lastErr = "audio failed";
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const signal =
          typeof AbortSignal !== "undefined" && "timeout" in AbortSignal
            ? (AbortSignal as any).timeout(25000)
            : undefined;
        const res = await fetch("/api/narrate-free", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          signal,
        });
        if (res.ok) {
          const blob = await res.blob();
          return URL.createObjectURL(blob);
        }
        let msg = "";
        try {
          msg = (await res.json()).error;
        } catch {}
        lastErr = msg || `status ${res.status}`;
      } catch (e: any) {
        lastErr = e?.message || "network error";
      }
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
    throw new Error(lastErr);
  }

  function prefetch(index: number) {
    if (index >= chunksRef.current.length) return;
    if (prefetchRef.current.has(index)) return;
    const p = fetchChunkAudio(chunksRef.current[index].text);
    p.catch(() => {});
    prefetchRef.current.set(index, p);
  }

  function clearPrefetch() {
    prefetchRef.current.forEach((p) => {
      p.then((u) => URL.revokeObjectURL(u)).catch(() => {});
    });
    prefetchRef.current.clear();
  }

  function followPage(index: number) {
    const pg = chunksRef.current[index]?.page;
    if (pg && pg !== pageRef.current) {
      pageRef.current = pg;
      setPage(pg);
      window.scrollTo({ top: 0 });
    }
  }

  function finishListening() {
    setListening(false);
    setAudioLoading(false);
    clearPrefetch();
  }

  function stopListening() {
    tokenRef.current++;
    const a = audioRef.current;
    if (a) {
      a.onended = null;
      a.onerror = null;
      a.onplaying = null;
      a.pause();
    }
    clearPrefetch();
    try {
      speechSynthesis.cancel();
    } catch {}
    setListening(false);
    setAudioLoading(false);
  }

  function fallbackSpeak(token: number, index: number) {
    if (token !== tokenRef.current) return;
    if (index >= chunksRef.current.length) {
      finishListening();
      return;
    }
    chunkIndexRef.current = index;
    followPage(index);
    const u = new SpeechSynthesisUtterance(chunksRef.current[index].text);
    u.onend = () => fallbackSpeak(token, index + 1);
    u.onerror = (e: any) => {
      if (token !== tokenRef.current) return;
      if (e?.error === "canceled" || e?.error === "interrupted") return;
      fallbackSpeak(token, index + 1);
    };
    utteranceRef.current = u;
    setAudioLoading(false);
    speechSynthesis.speak(u);
  }

  async function playChunk(index: number, token: number) {
    if (token !== tokenRef.current) return;
    if (index >= chunksRef.current.length) {
      finishListening();
      return;
    }
    chunkIndexRef.current = index;
    prefetch(index);

    let url: string;
    try {
      url = await (prefetchRef.current.get(index) as Promise<string>);
    } catch (e: any) {
      prefetchRef.current.delete(index);
      if (token !== tokenRef.current) return;
      if (index === 0) {
        usingFallbackRef.current = true;
        alert(
          "The natural voice is not available right now (" +
            (e?.message || "error") +
            "). Using your phone's voice instead."
        );
        fallbackSpeak(token, 0);
        return;
      }
      playChunk(index + 1, token);
      return;
    }
    if (token !== tokenRef.current) return;

    prefetch(index + 1);
    prefetch(index + 2);
    followPage(index);

    const audio = getAudio();
    audio.onended = () => {
      URL.revokeObjectURL(url);
      prefetchRef.current.delete(index);
      playChunk(index + 1, token);
    };
    audio.onerror = () => {
      playChunk(index + 1, token);
    };
    audio.onplaying = () => setAudioLoading(false);
    audio.src = url;
    try {
      await audio.play();
    } catch (e: any) {
      if (e?.name === "NotAllowedError" && token === tokenRef.current) {
        stopListening();
        alert("Tap Listen again to start the audio.");
      }
    }
  }

  function skipForward() {
    const token = ++tokenRef.current;
    if (usingFallbackRef.current) {
      try {
        speechSynthesis.cancel();
      } catch {}
      fallbackSpeak(token, chunkIndexRef.current + 1);
      return;
    }
    audioRef.current?.pause();
    playChunk(chunkIndexRef.current + 1, token);
  }

  function skipBack() {
    const token = ++tokenRef.current;
    if (usingFallbackRef.current) {
      try {
        speechSynthesis.cancel();
      } catch {}
      fallbackSpeak(token, Math.max(0, chunkIndexRef.current - 1));
      return;
    }
    audioRef.current?.pause();
    playChunk(Math.max(0, chunkIndexRef.current - 1), token);
  }

  function setMediaSession() {
    try {
      const ms: any = (navigator as any).mediaSession;
      if (!ms) return;
      ms.metadata = new (window as any).MediaMetadata({
        title: title || "Reading aloud",
        artist: "Faith and Focus Library",
      });
      ms.setActionHandler("nexttrack", skipForward);
      ms.setActionHandler("previoustrack", skipBack);
      ms.setActionHandler("pause", () => audioRef.current?.pause());
      ms.setActionHandler("play", () => audioRef.current?.play());
    } catch {}
  }

  async function toggleListen() {
    if (listening) {
      stopListening();
      return;
    }
    const pdf = pdfRef.current;
    if (!pdf) return;

    // Unlock audio on phones while the tap is still fresh
    const audio = getAudio();
    stopListening();
    usingFallbackRef.current = false;
    audio.src = SILENT_WAV;
    audio.play().catch(() => {});

    setListening(true);
    setAudioLoading(true);

    try {
      const startPage = pageRef.current;
      const chunks: Chunk[] = [];
      for (let p = startPage; p <= pdf.numPages; p++) {
        const pg = await pdf.getPage(p);
        const content = await pg.getTextContent();
        const text = content.items
          .map((it: any) => it.str)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        if (!text) continue;
        for (const c of chunkText(text)) chunks.push({ text: c, page: p });
      }
      if (chunks.length === 0) throw new Error("No readable text was found from this page onward.");

      chunksRef.current = chunks;
      const token = ++tokenRef.current;
      setMediaSession();
      playChunk(0, token);
    } catch (e: any) {
      stopListening();
      alert(e?.message ?? "Could not start the audio.");
    }
  }

  // Stop the audio when you leave this page
  useEffect(() => {
    return () => {
      stopListening();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- Loading and drawing ---------------- */

  async function loadDocument(id: string) {
    const token = ++loadTokenRef.current;
    stopListening();
    setError("");
    setStatus("Opening…");
    setNumPages(0);
    setPage(1);
    pageRef.current = 1;
    setZoom(1);
    pdfRef.current = null;

    try {
      const { data: doc, error: docErr } = await supabase
        .from("documents")
        .select("title,file_path")
        .eq("id", id)
        .single();
      if (docErr || !doc) throw new Error("Document not found");
      if (token !== loadTokenRef.current) return;
      setTitle(doc.title);
      setFilePath(doc.file_path);
      setCurrentId(id);

      const { data: signed, error: urlErr } = await supabase.storage
        .from("library-pdfs")
        .createSignedUrl(doc.file_path, 60);
      if (!signed?.signedUrl) throw new Error(urlErr?.message ?? "Could not open this document");

      setStatus("Loading pages…");
      const res = await fetch(signed.signedUrl);
      if (!res.ok) throw new Error("Could not load this document");
      const buf = await res.arrayBuffer();
      if (token !== loadTokenRef.current) return;

      const pdfjsLib: any = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
      if (token !== loadTokenRef.current) return;

      pdfRef.current = pdf;
      setNumPages(pdf.numPages);
      setStatus("");
    } catch (e: any) {
      if (token === loadTokenRef.current) {
        setStatus("");
        setError(e?.message || "Something went wrong");
      }
    }
  }

  // First load: check sign-in, get the list of documents, open the chosen one
  useEffect(() => {
    async function init() {
      const id = new URLSearchParams(window.location.search).get("doc");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      setIsAdmin(profile?.is_admin === true);

      const { data: list } = await supabase
        .from("documents")
        .select("id,title")
        .order("title", { ascending: true });
      if (list) setDocs(list as DocLite[]);

      if (!id) {
        setStatus("");
        setError("No document selected. Pick one from the list above.");
        return;
      }
      loadDocument(id);
    }
    init();
    return () => {
      loadTokenRef.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Draw the current page
  useEffect(() => {
    const pdf = pdfRef.current;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!pdf || !canvas || !wrap || numPages === 0) return;
    let cancelled = false;

    async function draw() {
      try {
        const p = await pdf.getPage(page);
        if (cancelled) return;
        const base = p.getViewport({ scale: 1 });
        const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
        const cssScale = ((wrap!.clientWidth - 8) / base.width) * zoom;
        const viewport = p.getViewport({ scale: cssScale * dpr });

        if (renderTaskRef.current) {
          try {
            renderTaskRef.current.cancel();
          } catch {}
        }

        canvas!.width = viewport.width;
        canvas!.height = viewport.height;
        canvas!.style.width = `${viewport.width / dpr}px`;
        canvas!.style.height = `${viewport.height / dpr}px`;
        const ctx = canvas!.getContext("2d");
        if (!ctx) return;

        const task = p.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = task;
        await task.promise;
      } catch {
        // a cancelled render ends here, which is fine
      }
    }
    draw();
    return () => {
      cancelled = true;
    };
  }, [numPages, page, zoom]);

  function goTo(n: number) {
    const clamped = Math.max(1, Math.min(numPages, n));
    pageRef.current = clamped;
    setPage(clamped);
    window.scrollTo({ top: 0 });
  }

  function goBack() {
    stopListening();
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/library");
  }

  function switchDoc(id: string) {
    if (!id || id === currentId) return;
    window.history.replaceState(null, "", `/read?doc=${id}`);
    window.scrollTo({ top: 0 });
    loadDocument(id);
  }

  async function openOriginal() {
    if (!filePath) return;
    try {
      if ("caches" in window) {
        const cache = await caches.open("library-pdfs-v1");
        const match = await cache.match(`/${filePath}`);
        if (match) {
          const blob = await match.blob();
          window.open(URL.createObjectURL(blob), "_blank");
          return;
        }
      }
      const { data, error: urlErr } = await supabase.storage
        .from("library-pdfs")
        .createSignedUrl(filePath, 60 * 5);
      if (data?.signedUrl) window.open(data.signedUrl, "_blank");
      else alert(urlErr?.message ?? "Could not open the original file");
    } catch {
      alert("Could not open the original file");
    }
  }

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  }

  function onTouchEnd(e: React.TouchEvent) {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start || zoom !== 1) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 70 && Math.abs(dy) < 50) {
      goTo(dx < 0 ? page + 1 : page - 1);
    }
  }

  const btn =
    "px-3 py-1.5 rounded border border-navy/30 text-sm text-navy/80 hover:border-gold disabled:opacity-40";

  return (
    <div
      className="reader-root"
      onContextMenu={(e) => e.preventDefault()}
      style={{ userSelect: "none", WebkitUserSelect: "none", WebkitTouchCallout: "none" }}
    >
      <style>{`@media print { .reader-root { display: none !important; } }`}</style>

      <div className="flex items-center justify-between mb-3">
        <button onClick={goBack} className="text-sm text-gold underline">
          ← Back
        </button>
        {isAdmin && filePath && (
          <button onClick={openOriginal} className="text-xs text-navy/60 hover:text-gold underline">
            Open original PDF
          </button>
        )}
      </div>

      {docs.length > 0 && (
        <select
          value={currentId}
          onChange={(e) => switchDoc(e.target.value)}
          className="w-full border border-navy/20 rounded px-3 py-2 mb-3 text-sm text-navy bg-white"
        >
          <option value="" disabled>
            Choose a document…
          </option>
          {docs.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title}
            </option>
          ))}
        </select>
      )}

      {title && <h1 className="font-serif text-xl text-navy mb-3">{title}</h1>}

      {error && (
        <p className="text-sm text-red-600 border border-red-200 rounded p-3 mb-3">{error}</p>
      )}
      {status && !error && <p className="text-sm text-navy/60 mb-3">{status}</p>}

      {numPages > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button className={btn} onClick={() => goTo(page - 1)} disabled={page <= 1}>
            Prev
          </button>
          <span className="text-sm text-navy/70">
            Page{" "}
            <input
              type="number"
              min={1}
              max={numPages}
              value={page}
              onChange={(e) => {
                const n = parseInt(e.target.value, 10);
                if (!isNaN(n)) goTo(n);
              }}
              className="w-14 border border-navy/20 rounded px-1 py-0.5 text-center"
            />{" "}
            / {numPages}
          </span>
          <button className={btn} onClick={() => goTo(page + 1)} disabled={page >= numPages}>
            Next
          </button>
          <button
            className={btn}
            onClick={() => setZoom((z) => Math.max(1, +(z - 0.5).toFixed(1)))}
            disabled={zoom <= 1}
          >
            −
          </button>
          <button
            className={btn}
            onClick={() => setZoom((z) => Math.min(3, +(z + 0.5).toFixed(1)))}
            disabled={zoom >= 3}
          >
            +
          </button>
        </div>
      )}

      <div
        ref={wrapRef}
        className="overflow-auto border border-navy/10 rounded bg-white"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <canvas ref={canvasRef} className="block mx-auto" />
      </div>

      {numPages > 0 && (
        <div className="flex justify-between mt-3 mb-20">
          <button className={btn} onClick={() => goTo(page - 1)} disabled={page <= 1}>
            Prev
          </button>
          <button className={btn} onClick={() => goTo(page + 1)} disabled={page >= numPages}>
            Next
          </button>
        </div>
      )}

      {numPages > 0 && (
        <div className="sticky bottom-0 z-10 bg-white border-t border-navy/15 py-2 px-2 flex flex-wrap items-center justify-center gap-2 -mx-2">
          {listening && (
            <button className={btn} onClick={skipBack}>
              ⏪ Back
            </button>
          )}
          <button
            className={`${btn} ${listening ? "bg-navy text-paper border-navy" : ""}`}
            onClick={toggleListen}
          >
            {listening ? (audioLoading ? "Preparing… (tap to cancel)" : "⏹ Stop") : "▶ Listen from this page"}
          </button>
          {listening && (
            <button className={btn} onClick={skipForward}>
              Forward ⏩
            </button>
          )}
        </div>
      )}
    </div>
  );
}
