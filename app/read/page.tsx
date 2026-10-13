"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

type DocLite = { id: string; title: string };

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

  const pdfRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const loadTokenRef = useRef(0);

  async function loadDocument(id: string) {
    const token = ++loadTokenRef.current;
    setError("");
    setStatus("Opening…");
    setNumPages(0);
    setPage(1);
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
    setPage(clamped);
    window.scrollTo({ top: 0 });
  }

  function goBack() {
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
        <div className="flex justify-between mt-3">
          <button className={btn} onClick={() => goTo(page - 1)} disabled={page <= 1}>
            Prev
          </button>
          <button className={btn} onClick={() => goTo(page + 1)} disabled={page >= numPages}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
