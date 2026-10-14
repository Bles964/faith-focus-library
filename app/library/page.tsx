"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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

const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

function withTimeout<T>(
  promise: Promise<T>,
  milliseconds: number,
  message: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;

  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), milliseconds);
  });

  return Promise.race([promise, timeout]).finally(() => {
    clearTimeout(timer);
  });
}

export default function LibraryPage() {
  const supabase = createClient();
  const router = useRouter();

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
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioStatus, setAudioStatus] = useState("");

  const chunksRef = useRef<string[]>([]);
  const chunkIndexRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prefetchRef = useRef<Map<number, Promise<string>>>(new Map());
  const tokenRef = useRef(0);

  useEffect(() => {
    try {
      const savedSearch = sessionStorage.getItem("library-search");
      if (savedSearch) setSearch(savedSearch);

      const savedCategory = sessionStorage.getItem("library-category");
      if (savedCategory) setActiveCategory(savedCategory);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem("library-search", search);
      sessionStorage.setItem("library-category", activeCategory);
    } catch {}
  }, [search, activeCategory]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (cancelled) return;

        setSignedIn(!!user);

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", user.id)
            .single();

          if (cancelled) return;

          setIsAdmin(profile?.is_admin ?? false);
        }

        const { data, error } = await supabase
          .from("documents")
          .select("*")
          .order("created_at", { ascending: false });

        if (cancelled) return;

        if (!error && data) {
          setDocs(data as Doc[]);
        } else if (error) {
          console.error("Could not load documents:", error.message);
        }

        if ("caches" in window && data) {
          const cache = await caches.open(CACHE_NAME);
          const keys = await cache.keys();

          if (cancelled) return;

          const cachedPaths = new Set(
            keys.map((request) =>
              decodeURIComponent(new URL(request.url).pathname)
            )
          );

          const matched = (data as Doc[])
            .filter((doc) => cachedPaths.has(`/${doc.file_path}`))
            .map((doc) => doc.id);

          setOfflineIds(new Set(matched));
        }
      } catch (error) {
        console.error("Library loading error:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(docs.map((doc) => doc.category))),
  ];

  const filtered = docs.filter((doc) => {
    const matchesCategory =
      activeCategory === "All" || doc.category === activeCategory;

    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      doc.title.toLowerCase().includes(query) ||
      (doc.specialty ?? "").toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  async function getCachedBlobUrl(doc: Doc): Promise<string | null> {
    if (!("caches" in window)) return null;

    const cache = await caches.open(CACHE_NAME);
    const match = await cache.match(`/${doc.file_path}`);

    if (!match) return null;

    return URL.createObjectURL(await match.blob());
  }

  function openDoc(doc: Doc) {
    router.push(`/read?doc=${doc.id}`);
  }

  function getAudio(): HTMLAudioElement {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = "auto";
      audioRef.current = audio;
    }

    return audioRef.current;
  }

  // Request narration and prevent a request from waiting forever.
  async function fetchChunkAudio(text: string): Promise<string> {
    let lastError = "Audio generation failed.";

    for (let attempt = 1; attempt <= 2; attempt++) {
      const controller = new AbortController();

      const timer = setTimeout(() => {
        controller.abort();
      }, 20000);

      try {
        const response = await fetch("/api/narrate-free", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const responseText = await response.text();

          try {
            const data = JSON.parse(responseText);
            lastError =
              data.error || `Voice server error (${response.status}).`;
          } catch {
            lastError = `Voice server error (${response.status}).`;
          }

          throw new Error(lastError);
        }

        const contentType = (
          response.headers.get("content-type") || ""
        ).toLowerCase();

        if (!contentType.startsWith("audio/")) {
          throw new Error(
            `The voice server returned "${contentType || "unknown"}" instead of audio.`
          );
        }

        const blob = await response.blob();

        if (blob.size === 0) {
          throw new Error("The voice server returned an empty audio file.");
        }

        return URL.createObjectURL(blob);
      } catch (error: unknown) {
        lastError =
          error instanceof Error && error.name === "AbortError"
            ? "The voice server took too long to respond."
            : error instanceof Error
              ? error.message
              : "Audio generation failed.";

        console.error(`Narration attempt ${attempt}:`, lastError);

        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } finally {
        clearTimeout(timer);
      }
    }

    throw new Error(lastError);
  }

  function prefetch(index: number) {
    if (index < 0 || index >= chunksRef.current.length) return;
    if (prefetchRef.current.has(index)) return;

    const promise = fetchChunkAudio(chunksRef.current[index]);

    promise.catch(() => {});
    prefetchRef.current.set(index, promise);
  }

  function clearPrefetch() {
    prefetchRef.current.forEach((promise) => {
      promise.then((url) => URL.revokeObjectURL(url)).catch(() => {});
    });

    prefetchRef.current.clear();
  }

  function stopPlayback() {
    tokenRef.current++;

    const audio = audioRef.current;

    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.onplaying = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }

    clearPrefetch();

    setSpeakingId(null);
    setAudioLoading(false);
    setAudioStatus("");
  }

  function finishPlayback() {
    clearPrefetch();
    setSpeakingId(null);
    setAudioLoading(false);
    setAudioStatus("");
  }

  async function playChunk(index: number, token: number) {
    if (token !== tokenRef.current) return;

    if (index >= chunksRef.current.length) {
      finishPlayback();
      return;
    }

    if (index < 0) index = 0;

    chunkIndexRef.current = index;

    setAudioLoading(true);
    setAudioStatus(
      `Generating audio (${index + 1} of ${chunksRef.current.length})…`
    );

    prefetch(index);

    let url: string;

    try {
      const request = prefetchRef.current.get(index);

      if (!request) {
        throw new Error("Could not start the audio request.");
      }

      url = await withTimeout(
        request,
        45000,
        "Audio preparation took too long. Please try again."
      );
    } catch (error: unknown) {
      if (token !== tokenRef.current) return;

      const message =
        error instanceof Error
          ? error.message
          : "Could not generate audio.";

      console.error("Audio preparation failed:", message);

      stopPlayback();

      alert(`Could not prepare the audio.\n\n${message}`);
      return;
    }

    if (token !== tokenRef.current) {
      URL.revokeObjectURL(url);
      return;
    }

    prefetch(index + 1);

    const audio = getAudio();

    audio.onended = () => {
      URL.revokeObjectURL(url);
      prefetchRef.current.delete(index);

      if (token === tokenRef.current) {
        playChunk(index + 1, token);
      }
    };

    audio.onerror = () => {
      if (token !== tokenRef.current) return;

      URL.revokeObjectURL(url);
      prefetchRef.current.delete(index);

      stopPlayback();

      alert(
        "The browser could not play the generated audio. " +
          "The audio file may be invalid or unsupported."
      );
    };

    audio.onplaying = () => {
      if (token === tokenRef.current) {
        setAudioLoading(false);
        setAudioStatus("");
      }
    };

    audio.src = url;

    try {
      await audio.play();

      if (token === tokenRef.current) {
        setAudioLoading(false);
        setAudioStatus("");
      }
    } catch (error: unknown) {
      if (token !== tokenRef.current) return;

      const message =
        error instanceof Error
          ? error.message
          : "Audio playback failed.";

      stopPlayback();

      alert(`Audio playback failed.\n\n${message}`);
    }
  }

  function skipForward() {
    const token = ++tokenRef.current;

    audioRef.current?.pause();

    playChunk(chunkIndexRef.current + 1, token);
  }

  function skipBack() {
    const token = ++tokenRef.current;

    audioRef.current?.pause();

    playChunk(Math.max(0, chunkIndexRef.current - 1), token);
  }

  function setMediaSession(title: string) {
    try {
      const mediaSession = (navigator as any).mediaSession;

      if (!mediaSession) return;

      mediaSession.metadata = new (window as any).MediaMetadata({
        title,
        artist: "Faith and Focus Library",
      });

      mediaSession.setActionHandler("nexttrack", skipForward);
      mediaSession.setActionHandler("previoustrack", skipBack);
      mediaSession.setActionHandler("pause", () =>
        audioRef.current?.pause()
      );
      mediaSession.setActionHandler("play", () =>
        audioRef.current?.play()
      );
    } catch (error) {
      console.warn("Media controls unavailable:", error);
    }
  }

  async function listenToDoc(doc: Doc) {
    if (speakingId === doc.id) {
      stopPlayback();
      return;
    }

    stopPlayback();

    const audio = getAudio();

    // Attempt to unlock playback during the user's tap.
    audio.src = SILENT_WAV;
    audio.play().catch(() => {});

    setSpeakingId(doc.id);
    setAudioLoading(true);
    setAudioStatus("Loading PDF…");

    let pdfUrl: string | null = null;
    let temporaryBlobUrl = false;

    // Give this playback session its own token so cancelled sessions
    // cannot unexpectedly start playing later.
    const token = ++tokenRef.current;

    try {
      pdfUrl = await withTimeout(
        getCachedBlobUrl(doc),
        15000,
        "Loading the offline PDF took too long."
      );

      if (!pdfUrl) {
        setAudioStatus("Opening PDF…");

        const result = await withTimeout(
          supabase.storage
            .from("library-pdfs")
            .createSignedUrl(doc.file_path, 60 * 5),
          15000,
          "The PDF storage service took too long to respond."
        );

        if (!result.data?.signedUrl) {
          throw new Error(
            result.error?.message ||
              "Could not load the PDF. Check your connection and try again."
          );
        }

        pdfUrl = result.data.signedUrl;
      } else {
        temporaryBlobUrl = true;
      }

      if (token !== tokenRef.current) return;

      setAudioStatus("Extracting PDF text…");

      const { extractPdfText } = await import("@/lib/pdfText");

      const text = await withTimeout(
        extractPdfText(pdfUrl),
        30000,
        "Extracting text from this PDF took too long. Try another document to check whether the problem is specific to this PDF."
      );

      if (token !== tokenRef.current) return;

      if (!text || !text.trim()) {
        throw new Error(
          "No readable text was found in this PDF. It may be a scanned document that requires OCR."
        );
      }

      setAudioStatus("Preparing narration…");

      // Split text into manageable pieces.
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      const pieces: string[] = [];

      for (const sentence of sentences) {
        let rest = sentence.trim();

        while (rest.length > 380) {
          let cut = rest.lastIndexOf(", ", 380);

          if (cut < 100) {
            cut = rest.lastIndexOf(" ", 380);
          }

          if (cut < 100) {
            cut = 380;
          }

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
          current = current ? `${current} ${piece}` : piece;
        }
      }

      if (current) chunks.push(current.trim());

      if (chunks.length === 0) {
        throw new Error("No readable text was found in this document.");
      }

      if (token !== tokenRef.current) return;

      chunksRef.current = chunks;
      chunkIndexRef.current = 0;

      setMediaSession(doc.title);

      await playChunk(0, token);
    } catch (error: unknown) {
      if (token !== tokenRef.current) return;

      const message =
        error instanceof Error
          ? error.message
          : "Could not start reading this document.";

      console.error("Listen feature error:", error);

      stopPlayback();

      alert(`Could not start reading this document.\n\n${message}`);
    } finally {
      if (temporaryBlobUrl && pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    }
  }

  async function downloadForOffline(doc: Doc) {
    if (!("caches" in window)) {
      alert("Offline storage is not supported in this browser.");
      return;
    }

    setDownloadingId(doc.id);

    try {
      const { data, error } = await supabase.storage
        .from("library-pdfs")
        .createSignedUrl(doc.file_path, 60 * 5);

      if (!data?.signedUrl) {
        alert(error?.message || "Could not fetch this file.");
        return;
      }

      const response = await fetch(data.signedUrl);

      if (!response.ok) {
        throw new Error("Could not download the PDF.");
      }

      const blob = await response.blob();
      const cache = await caches.open(CACHE_NAME);

      await cache.put(`/${doc.file_path}`, new Response(blob));

      setOfflineIds((previous) => new Set(previous).add(doc.id));
    } catch (error) {
      console.error("Offline download failed:", error);

      alert("Download failed. Check your connection and try again.");
    } finally {
      setDownloadingId(null);
    }
  }

  async function removeOffline(doc: Doc) {
    if (!("caches" in window)) return;

    const cache = await caches.open(CACHE_NAME);
    await cache.delete(`/${doc.file_path}`);

    setOfflineIds((previous) => {
      const next = new Set(previous);
      next.delete(doc.id);
      return next;
    });
  }

  async function downloadAll() {
    setDownloadingAll(true);

    try {
      for (const doc of docs) {
        if (offlineIds.has(doc.id)) continue;

        await downloadForOffline(doc);
      }
    } finally {
      setDownloadingAll(false);
    }
  }

  async function renameDoc(doc: Doc) {
    const newTitle = window.prompt("Rename document:", doc.title);

    if (
      !newTitle ||
      newTitle.trim() === "" ||
      newTitle === doc.title
    ) {
      return;
    }

    const { error } = await supabase
      .from("documents")
      .update({ title: newTitle.trim() })
      .eq("id", doc.id);

    if (error) {
      alert(error.message || "Could not rename this document.");
      return;
    }

    setDocs((previous) =>
      previous.map((item) =>
        item.id === doc.id
          ? { ...item, title: newTitle.trim() }
          : item
      )
    );
  }

  async function deleteDoc(doc: Doc) {
    const confirmed = window.confirm(
      `Delete "${doc.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    const { error: storageError } = await supabase.storage
      .from("library-pdfs")
      .remove([doc.file_path]);

    if (storageError) {
      alert(storageError.message || "Could not delete the file.");
      return;
    }

    const { error: databaseError } = await supabase
      .from("documents")
      .delete()
      .eq("id", doc.id);

    if (databaseError) {
      alert(
        databaseError.message ||
          "Could not delete the document record."
      );
      return;
    }

    await removeOffline(doc);

    setDocs((previous) =>
      previous.filter((item) => item.id !== doc.id)
    );
  }

  if (!signedIn && !loading) {
    return (
      <div className="text-center py-16">
        <p className="text-navy/70 mb-3">
          Sign in to browse your library.
        </p>

        <a href="/login" className="text-gold underline">
          Go to sign in
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-serif text-2xl text-navy">
          Browse
        </h1>

        {isAdmin && (
          <button
            onClick={downloadAll}
            disabled={downloadingAll}
            className="text-xs px-3 py-1.5 rounded border border-navy/30 text-navy/70 hover:border-gold disabled:opacity-50"
          >
            {downloadingAll
              ? "Downloading…"
              : "Download All for Offline"}
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="Search by title or specialty…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="flex-1 border border-navy/20 rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`text-sm px-3 py-1 rounded-full border ${
              activeCategory === category
                ? "bg-navy text-paper border-navy"
                : "border-navy/30 text-navy/70 hover:border-navy"
            }`}
          >
            {category}
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
            const isSpeaking = speakingId === doc.id;

            return (
              <div
                key={doc.id}
                className="text-left border border-navy/15 rounded-lg p-4 bg-white hover:border-gold transition-colors"
              >
                <button
                  onClick={() => openDoc(doc)}
                  className="text-left w-full"
                >
                  <span className="text-xs uppercase tracking-wide text-gold font-medium">
                    {doc.category}
                    {doc.specialty ? ` · ${doc.specialty}` : ""}
                    {isAdmin && isOffline
                      ? " · Available offline"
                      : ""}
                  </span>

                  <h2 className="font-serif text-lg text-navy mt-1">
                    {doc.title}
                  </h2>

                  {doc.description && (
                    <p className="text-sm text-navy/60 mt-1">
                      {doc.description}
                    </p>
                  )}
                </button>

                <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-navy/10">
                  <button
                    onClick={() => listenToDoc(doc)}
                    className="text-xs text-navy/60 hover:text-gold underline"
                  >
                    {isSpeaking
                      ? audioLoading
                        ? audioStatus || "Preparing…"
                        : "Stop"
                      : "Listen"}
                  </button>

                  {isSpeaking && (
                    <>
                      <button
                        onClick={skipBack}
                        className="text-xs text-navy/60 hover:text-gold underline"
                      >
                        ⏪ Back
                      </button>

                      <button
                        onClick={skipForward}
                        className="text-xs text-navy/60 hover:text-gold underline"
                      >
                        Forward ⏩
                      </button>
                    </>
                  )}

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
                          {isDownloading
                            ? "Downloading…"
                            : "Download for offline"}
                        </button>
                      )}
                    </>
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
