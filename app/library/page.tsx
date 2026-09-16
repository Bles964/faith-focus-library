"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

type Doc = {
  id: string;
  title: string;
  category: string;
  specialty: string | null;
  description: string | null;
  file_path: string;
  created_at: string;
};

const CACHE_NAME = "library-pdfs-v1";

export default function LibraryPage() {
  const supabase = createClient();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | "All">("All");
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [offlineIds, setOfflineIds] = useState<Set<string>>(new Set());
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setSignedIn(!!user);

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();
        setIsAdmin(profile?.is_admin ?? false);
      }

      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) setDocs(data as Doc[]);
      setLoading(false);

      if (typeof window !== "undefined" && "caches" in window) {
        const cache = await caches.open(CACHE_NAME);
        const keys = await cache.keys();
        const cachedPaths = new Set(
          keys.map((req) => decodeURIComponent(new URL(req.url).pathname))
        );
        if (data) {
          const matched = (data as Doc[])
            .filter((d) => cachedPaths.has(`/${d.file_path}`))
            .map((d) => d.id);
          setOfflineIds(new Set(matched));
        }
      }
    }
    load();
  }, []);

  const categories = ["All", ...Array.from(new Set(docs.map((d) => d.category)))];

  const filtered = docs.filter((d) => {
    const matchesCategory = activeCategory === "All" || d.category === activeCategory;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      d.title.toLowerCase().includes(q) ||
      (d.specialty ?? "").toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  async function getCachedBlobUrl(doc: Doc): Promise<string | null> {
    if (!("caches" in window)) return null;
    const cache = await caches.open(CACHE_NAME);
    const match = await cache.match(`/${doc.file_path}`);
    if (!match) return null;
    const blob = await match.blob();
    return URL.createObjectURL(blob);
  }

  async function openDoc(doc: Doc) {
    const cachedUrl = await getCachedBlobUrl(doc);
    if (cachedUrl) {
      window.open(cachedUrl, "_blank");
      return;
    }

    const { data, error } = await supabase.storage
      .from("library-pdfs")
      .createSignedUrl(doc.file_path, 60 * 5);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    else alert(error?.message ?? "Could not open this file. You may be offline and this document hasn't been downloaded yet.");
  }

  async function listenToDoc(doc: Doc) {
    const primer = new SpeechSynthesisUtterance("");
    speechSynthesis.speak(primer);

    await new Promise<void>((resolve) => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve();
      } else {
        speechSynthesis.onvoiceschanged = () => resolve();
        setTimeout(() => resolve(), 1000); // fallback in case the event never fires
      }
    });

    if (speakingId === doc.id) {
      speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    let pdfUrl = await getCachedBlobUrl(doc);

    if (!pdfUrl) {
      const { data, error } = await supabase.storage
        .from("library-pdfs")
        .createSignedUrl(doc.file_path, 60 * 5);

      if (!data?.signedUrl) {
        alert(error?.message ?? "Could not load this file. You may be offline and this document hasn't been downloaded yet.");
        return;
      }
      pdfUrl = data.signedUrl;
    }

    setSpeakingId(doc.id);
    const { extractPdfText } = await import("@/lib/pdfText");
    const text = await extractPdfText(pdfUrl);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setSpeakingId(null);
    speechSynthesis.speak(utterance);
  }

  async function downloadForOffline(doc: Doc) {
    if (!("caches" in window)) {
      alert("Offline storage isn't supported in this browser.");
      return;
    }
    setDownloadingId(doc.id);
    try {
      const { data, error } = await supabase.storage
        .from("library-pdfs")
        .createSignedUrl(doc.file_path, 60 * 5);
      if (!data?.signedUrl) {
        alert(error?.message ?? "Could not fetch this file.");
        return;
      }
      const res = await fetch(data.signedUrl);
      const blob = await res.blob();
      const cache = await caches.open(CACHE_NAME);
      await cache.put(`/${doc.file_path}`, new Response(blob));
      setOfflineIds((prev) => new Set(prev).add(doc.id));
    } catch (e) {
      alert("Download failed. Check your connection and try again.");
    } finally {
      setDownloadingId(null);
    }
  }

  async function removeOffline(doc: Doc) {
    if (!("caches" in window)) return;
    const cache = await caches.open(CACHE_NAME);
    await cache.delete(`/${doc.file_path}`);
    setOfflineIds((prev) => {
      const next = new Set(prev);
      next.delete(doc.id);
      return next;
    });
  }

  async function downloadAll() {
    setDownloadingAll(true);
    for (const doc of docs) {
      if (offlineIds.has(doc.id)) continue;
      await downloadForOffline(doc);
    }
    setDownloadingAll(false);
  }

  async function renameDoc(doc: Doc) {
    const newTitle = window.prompt("Rename document:", doc.title);
    if (!newTitle || newTitle.trim() === "" || newTitle === doc.title) return;

    const { error } = await supabase
      .from("documents")
      .update({ title: newTitle.trim() })
      .eq("id", doc.id);

    if (error) {
      alert(error.message ?? "Could not rename this document.");
      return;
    }

    setDocs((prev) =>
      prev.map((d) => (d.id === doc.id ? { ...d, title: newTitle.trim() } : d))
    );
  }

  async function deleteDoc(doc: Doc) {
    const confirmed = window.confirm(`Delete "${doc.title}"? This cannot be undone.`);
    if (!confirmed) return;

    const { error: storageError } = await supabase.storage
      .from("library-pdfs")
      .remove([doc.file_path]);

    if (storageError) {
      alert(storageError.message ?? "Could not delete the file.");
      return;
    }

    const { error: dbError } = await supabase
      .from("documents")
      .delete()
      .eq("id", doc.id);

    if (dbError) {
      alert(dbError.message ?? "Could not delete the document record.");
      return;
    }

    await removeOffline(doc);
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
  }

  if (!signedIn && !loading) {
    return (
      <div className="text-center py-16">
        <p className="text-navy/70 mb-3">Sign in to browse your library.</p>
        <a href="/login" className="text-gold underline">Go to sign in</a>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif text-2xl text-navy">Browse</h1>
        <button
          onClick={downloadAll}
          disabled={downloadingAll}
          className="text-xs px-3 py-1.5 rounded border border-navy/30 text-navy/70 hover:border-gold disabled:opacity-50"
        >
          {downloadingAll ? "Downloading…" : "Download All for Offline"}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="Search by title or specialty…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-navy/20 rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`text-sm px-3 py-1 rounded-full border ${
              activeCategory === c
                ? "bg-navy text-paper border-navy"
                : "border-navy/30 text-navy/70 hover:border-navy"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-navy/50 text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-navy/50 text-sm">
          Nothing here yet. Use "Upload" to add your first guide.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((doc) => {
            const isOffline = offlineIds.has(doc.id);
            const isDownloading = downloadingId === doc.id;
            return (
              <div
                key={doc.id}
                className="text-left border border-navy/15 rounded-lg p-4 bg-white hover:border-gold transition-colors"
              >
                <button onClick={() => openDoc(doc)} className="text-left w-full">
                  <span className="text-xs uppercase tracking-wide text-gold font-medium">
                    {doc.category}
                    {doc.specialty ? ` · ${doc.specialty}` : ""}
                    {isOffline ? " · Available offline" : ""}
                  </span>
                  <h2 className="font-serif text-lg text-navy mt-1">{doc.title}</h2>
                  {doc.description && (
                    <p className="text-sm text-navy/60 mt-1">{doc.description}</p>
                  )}
                </button>

                <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-navy/10">
                  <button
                    onClick={() => listenToDoc(doc)}
                    className="text-xs text-navy/60 hover:text-gold underline"
                  >
                    {speakingId === doc.id ? "Stop" : "Listen"}
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => renameDoc(doc)}
                        className="text-xs text-navy/60 hover:text-gold underline"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => deleteDoc(doc)}
                        className="text-xs text-red-600 hover:text-red-800 underline"
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {isOffline ? (
                    <button
                      onClick={() => removeOffline(doc)}
                      className="text-xs text-navy/60 hover:text-gold underline"
                    >
                      Remove offline copy
                    </button>
                  ) : (
                    <button
                      onClick={() => downloadForOffline(doc)}
                      disabled={isDownloading}
                      className="text-xs text-navy/60 hover:text-gold underline disabled:opacity-50"
                    >
                      {isDownloading ? "Downloading…" : "Download for offline"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
