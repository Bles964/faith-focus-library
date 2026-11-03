"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";
import FolderPicker from "@/components/FolderPicker";

type Doc = {
  id: string;
  title: string;
  category: string;
  specialty: string | null;
  description: string | null;
  file_path: string;
  created_at: string;
};

type Folder = { id: string; parent_id: string | null; name: string; sort_order: number };
type Link = { document_id: string; folder_id: string };

const CACHE_NAME = "library-pdfs-v1";


export default function LibraryPage() {
  const supabase = createClient();
  const router = useRouter();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [movingDoc, setMovingDoc] = useState<Doc | null>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkFolderIds, setBulkFolderIds] = useState<string[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | "All">("All");
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [offlineIds, setOfflineIds] = useState<Set<string>>(new Set());
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  // Playback state for the currently speaking document
  const chunksRef = useRef<string[]>([]);
  const chunkIndexRef = useRef(0);
  const activeRef = useRef(false);
  const tokenRef = useRef(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const wakeLockRef = useRef<any>(null);

  // Remember the search box and category when you leave and come back
  useEffect(() => {
    try {
      const s = sessionStorage.getItem("library-search");
      if (s) setSearch(s);
      const c = sessionStorage.getItem("library-category");
      if (c) setActiveCategory(c);
      const f = sessionStorage.getItem("library-folder");
      if (f) setCurrentFolder(f);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem("library-search", search);
      sessionStorage.setItem("library-category", activeCategory);
      sessionStorage.setItem("library-folder", currentFolder ?? "");
    } catch {}
  }, [search, activeCategory, currentFolder]);

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

      // Your own folders (Manage catalogue) and which files sit in which folder
      const { data: folderData } = await supabase
        .from("folders")
        .select("id,parent_id,name,sort_order");
      if (folderData) setFolders(folderData as Folder[]);
      const { data: linkData } = await supabase
        .from("document_folders")
        .select("document_id,folder_id");
      if (linkData) setLinks(linkData as Link[]);

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

  // If the phone silently stops speaking partway through, start the same piece again
  useEffect(() => {
    if (!speakingId) return;
    const t = setInterval(() => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      if (!activeRef.current) return;
      if (speechSynthesis.paused) {
        speechSynthesis.resume();
        return;
      }
      if (
        !speechSynthesis.speaking &&
        !speechSynthesis.pending &&
        chunkIndexRef.current < chunksRef.current.length
      ) {
        speakChunkAt(chunkIndexRef.current);
      }
    }, 1500);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakingId]);

  useEffect(() => {
    return () => releaseWakeLock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = ["All", ...Array.from(new Set(docs.map((d) => d.category)))];

  // ---- Folder helpers ----
  const hasFolders = folders.length > 0;
  const sortedChildren = (parent: string | null) =>
    folders
      .filter((f) => f.parent_id === parent)
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));

  // A folder and everything inside it
  function folderAndDescendants(id: string): Set<string> {
    const out = new Set<string>([id]);
    let grew = true;
    while (grew) {
      grew = false;
      for (const f of folders) {
        if (f.parent_id && out.has(f.parent_id) && !out.has(f.id)) {
          out.add(f.id);
          grew = true;
        }
      }
    }
    return out;
  }

  // If a saved folder was deleted, go back to the top
  const folderExists = currentFolder ? folders.some((f) => f.id === currentFolder) : true;
  const activeFolder = folderExists ? currentFolder : null;

  const breadcrumb: Folder[] = [];
  {
    let cur = activeFolder ? folders.find((f) => f.id === activeFolder) : undefined;
    while (cur) {
      breadcrumb.unshift(cur);
      const pid: string | null = cur.parent_id;
      cur = pid ? folders.find((f) => f.id === pid) : undefined;
    }
  }

  const q = search.trim().toLowerCase();
  const matchesSearch = (d: Doc) =>
    !q || d.title.toLowerCase().includes(q) || (d.specialty ?? "").toLowerCase().includes(q);

  const filedIds = new Set(links.map((l) => l.document_id));

  let filtered: Doc[];
  if (!hasFolders) {
    filtered = docs.filter(
      (d) => (activeCategory === "All" || d.category === activeCategory) && matchesSearch(d)
    );
  } else if (q) {
    // Searching looks through everything
    filtered = docs.filter(matchesSearch);
  } else if (activeFolder) {
    // Inside a folder: the files placed directly in it
    const here = new Set(links.filter((l) => l.folder_id === activeFolder).map((l) => l.document_id));
    filtered = docs.filter((d) => here.has(d.id));
  } else {
    // Top level: files that are not in any folder yet
    filtered = docs.filter((d) => !filedIds.has(d.id));
  }

  // How many files are inside a folder (including its sub-folders)
  function countIn(folderId: string): number {
    const ids = folderAndDescendants(folderId);
    return new Set(links.filter((l) => ids.has(l.folder_id)).map((l) => l.document_id)).size;
  }

  async function reloadFolders() {
    const { data: fd } = await supabase.from("folders").select("id,parent_id,name,sort_order");
    if (fd) setFolders(fd as Folder[]);
    const { data: ld } = await supabase.from("document_folders").select("document_id,folder_id");
    if (ld) setLinks(ld as Link[]);
  }

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function endSelecting() {
    setSelectMode(false);
    setSelected(new Set());
    setBulkOpen(false);
    setBulkFolderIds([]);
  }

  // Adds the chosen files to the chosen folders (keeps any folders they are already in)
  async function applyBulk() {
    if (selected.size === 0 || bulkFolderIds.length === 0) return;
    setBulkBusy(true);
    const rows = Array.from(selected).flatMap((document_id) =>
      bulkFolderIds.map((folder_id) => ({ document_id, folder_id }))
    );
    const { error } = await supabase
      .from("document_folders")
      .upsert(rows, { onConflict: "document_id,folder_id" });
    setBulkBusy(false);
    if (error) return alert(error.message ?? "Could not put the files in those folders.");
    await reloadFolders();
    endSelecting();
  }

  async function createFolder() {
    const name = window.prompt(activeFolder ? "Name of the new folder inside here:" : "Name of the new folder:");
    if (!name || !name.trim()) return;
    const sibs = sortedChildren(activeFolder);
    const next = sibs.length ? Math.max(...sibs.map((f) => f.sort_order)) + 1 : 1;
    const { error } = await supabase
      .from("folders")
      .insert({ name: name.trim(), parent_id: activeFolder, sort_order: next });
    if (error) return alert(error.message ?? "Could not create the folder.");
    reloadFolders();
  }

  async function renameFolder(f: Folder) {
    const name = window.prompt("Rename folder:", f.name);
    if (!name || !name.trim() || name === f.name) return;
    const { error } = await supabase.from("folders").update({ name: name.trim() }).eq("id", f.id);
    if (error) return alert(error.message ?? "Could not rename the folder.");
    reloadFolders();
  }

  async function deleteFolder(f: Folder) {
    if (!window.confirm(`Delete the folder "${f.name}" and any folders inside it? Your files are not deleted.`)) return;
    const { error } = await supabase.from("folders").delete().eq("id", f.id);
    if (error) return alert(error.message ?? "Could not delete the folder.");
    setCurrentFolder(f.parent_id);
    reloadFolders();
  }

  async function getCachedBlobUrl(doc: Doc): Promise<string | null> {
    if (!("caches" in window)) return null;
    const cache = await caches.open(CACHE_NAME);
    const match = await cache.match(`/${doc.file_path}`);
    if (!match) return null;
    const blob = await match.blob();
    return URL.createObjectURL(blob);
  }

  function openDoc(doc: Doc) {
    router.push(`/read?doc=${doc.id}`);
  }

  async function acquireWakeLock() {
    try {
      const nav: any = navigator;
      if (nav.wakeLock) wakeLockRef.current = await nav.wakeLock.request("screen");
    } catch {}
  }

  function releaseWakeLock() {
    try {
      wakeLockRef.current?.release();
    } catch {}
    wakeLockRef.current = null;
  }

  function speakChunkAt(index: number) {
    if (index >= chunksRef.current.length) {
      activeRef.current = false;
      setSpeakingId(null);
      releaseWakeLock();
      return;
    }
    chunkIndexRef.current = index;
    const myToken = ++tokenRef.current;
    const utterance = new SpeechSynthesisUtterance(chunksRef.current[index]);
    utterance.onend = () => {
      if (myToken !== tokenRef.current) return;
      speakChunkAt(chunkIndexRef.current + 1);
    };
    utterance.onerror = (e: any) => {
      if (myToken !== tokenRef.current) return;
      if (e?.error === "canceled" || e?.error === "interrupted") return;
      speakChunkAt(chunkIndexRef.current + 1);
    };
    // Keep a reference, otherwise the phone can drop the voice partway through
    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }

  function skipForward() {
    speechSynthesis.cancel();
    speakChunkAt(chunkIndexRef.current + 1);
  }

  function skipBack() {
    speechSynthesis.cancel();
    speakChunkAt(Math.max(0, chunkIndexRef.current - 1));
  }

  function stopSpeaking() {
    activeRef.current = false;
    tokenRef.current++;
    speechSynthesis.cancel();
    setSpeakingId(null);
    releaseWakeLock();
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
        setTimeout(() => resolve(), 1000);
      }
    });

    if (speakingId === doc.id) {
      stopSpeaking();
      return;
    }

    // Starting a new document: stop whatever was playing
    activeRef.current = false;
    tokenRef.current++;
    speechSynthesis.cancel();
    chunksRef.current = [];

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

    // Short pieces, so the phone never gets one long block to read
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const pieces: string[] = [];
    for (const sentence of sentences) {
      let rest = sentence.trim();
      while (rest.length > 180) {
        let cut = rest.lastIndexOf(", ", 180);
        if (cut < 60) cut = rest.lastIndexOf(" ", 180);
        if (cut < 60) cut = 180;
        pieces.push(rest.slice(0, cut + 1).trim());
        rest = rest.slice(cut + 1).trim();
      }
      if (rest) pieces.push(rest);
    }

    const chunks: string[] = [];
    let current = "";
    for (const piece of pieces) {
      if ((current + " " + piece).length > 200) {
        if (current) chunks.push(current.trim());
        current = piece;
      } else {
        current = current ? current + " " + piece : piece;
      }
    }
    if (current) chunks.push(current.trim());

    chunksRef.current = chunks;
    activeRef.current = true;
    acquireWakeLock();
    speakChunkAt(0);
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
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => (selectMode ? endSelecting() : setSelectMode(true))}
              className="text-xs px-3 py-1.5 rounded border border-navy/30 text-navy/70 hover:border-gold"
            >
              {selectMode ? "Cancel selecting" : "Select files"}
            </button>
            <button
              onClick={createFolder}
              className="text-xs px-3 py-1.5 rounded bg-gold text-navy font-medium"
            >
              + New folder
            </button>
            <button
              onClick={downloadAll}
              disabled={downloadingAll}
              className="text-xs px-3 py-1.5 rounded border border-navy/30 text-navy/70 hover:border-gold disabled:opacity-50"
            >
              {downloadingAll ? "Downloading…" : "Download All for Offline"}
            </button>
          </div>
        )}
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

      {hasFolders ? (
        <div className="mb-6">
          {activeFolder && !q && (
            <div className="mb-4">
              <button
                onClick={() => setCurrentFolder(breadcrumb.length > 1 ? breadcrumb[breadcrumb.length - 2].id : null)}
                className="text-sm text-navy/70 underline hover:text-gold mb-2"
              >
                ← Back
              </button>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-serif text-xl text-navy">{breadcrumb.map((f) => f.name).join(" / ")}</h2>
                {isAdmin && (
                  <div className="flex items-center gap-3 text-xs">
                    <a href={`/upload?folder=${activeFolder}`} className="underline text-navy/70 hover:text-gold">
                      Upload here
                    </a>
                    <button
                      onClick={() => renameFolder(breadcrumb[breadcrumb.length - 1])}
                      className="underline text-navy/70 hover:text-gold"
                    >
                      Rename folder
                    </button>
                    <button
                      onClick={() => deleteFolder(breadcrumb[breadcrumb.length - 1])}
                      className="underline text-red-600 hover:text-red-800"
                    >
                      Delete folder
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {!q && sortedChildren(activeFolder).length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {sortedChildren(activeFolder).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setCurrentFolder(f.id)}
                  className="text-left border border-navy/15 rounded-lg p-4 bg-white hover:border-gold transition-colors"
                >
                  <svg viewBox="0 0 24 24" className="w-8 h-8 text-gold mb-2" fill="currentColor" aria-hidden>
                    <path d="M3 6a2 2 0 0 1 2-2h4.2a2 2 0 0 1 1.4.6L12 6h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z" />
                  </svg>
                  <span className="block font-serif text-navy leading-tight">{f.name}</span>
                  <span className="block text-xs text-navy/50 mt-1">
                    {countIn(f.id)} {countIn(f.id) === 1 ? "file" : "files"}
                  </span>
                </button>
              ))}
            </div>
          )}

          {!q && !activeFolder && filtered.length > 0 && (
            <p className="text-sm text-navy/60 mt-6">Not in a folder yet</p>
          )}
        </div>
      ) : (
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
      )}

      {loading ? (
        <p className="text-navy/50 text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-navy/50 text-sm">
          {hasFolders && activeFolder
            ? "No files in this folder yet."
            : hasFolders
            ? q
              ? "No files match your search."
              : ""
            : 'Nothing here yet. Use "Upload" to add your first guide.'}
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((doc) => {
            const isOffline = offlineIds.has(doc.id);
            const isDownloading = downloadingId === doc.id;
            const isSpeaking = speakingId === doc.id;
            const isNew = Date.now() - new Date(doc.created_at).getTime() < 7 * 24 * 60 * 60 * 1000;
            return (
              <div
                key={doc.id}
                className="text-left border border-navy/15 rounded-lg p-4 bg-white hover:border-gold transition-colors"
              >
                {selectMode && (
                  <label className="flex items-center gap-2 mb-2 text-sm text-navy cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.has(doc.id)}
                      onChange={() => toggleSelected(doc.id)}
                      className="h-5 w-5 accent-[#0B1F3A]"
                    />
                    Select this file
                  </label>
                )}
                <button onClick={() => openDoc(doc)} className="text-left w-full">
                  <span className="text-xs uppercase tracking-wide text-gold font-medium">
                    {doc.category}
                    {doc.specialty ? ` · ${doc.specialty}` : ""}
                    {isAdmin && isOffline ? " · Available offline" : ""}
                  </span>
                  {isNew && (
                    <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide bg-gold text-navy rounded-full px-2 py-0.5 align-middle">
                      New
                    </span>
                  )}
                  <h2 className="font-serif text-lg text-navy mt-1">{doc.title}</h2>
                  {doc.description && (
                    <p className="text-sm text-navy/60 mt-1">{doc.description}</p>
                  )}
                </button>

                <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-navy/10">
                  <button
                    onClick={() => listenToDoc(doc)}
                    className="text-xs text-navy/60 hover:text-gold underline"
                  >
                    {isSpeaking ? "Stop" : "Listen"}
                  </button>
                  <a
                    href={`/flashcards?doc=${doc.id}`}
                    className="text-xs text-navy/60 hover:text-gold underline"
                  >
                    Flashcards
                  </a>
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
                      {hasFolders && (
                        <button
                          onClick={() => setMovingDoc(doc)}
                          className="text-xs text-navy/60 hover:text-gold underline"
                        >
                          Put in folders
                        </button>
                      )}
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
                          {isDownloading ? "Downloading…" : "Download for offline"}
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
      {movingDoc && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-4">
            <p className="font-serif text-lg text-navy mb-3">{movingDoc.title}</p>
            <FolderPicker documentId={movingDoc.id} />
            <button
              onClick={() => {
                setMovingDoc(null);
                reloadFolders();
              }}
              className="mt-4 w-full rounded bg-navy px-4 py-2 text-sm font-medium text-white"
            >
              Done
            </button>
          </div>
        </div>
      )}
      {selectMode && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy/20 bg-white p-3 flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-navy">
            {selected.size} {selected.size === 1 ? "file" : "files"} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setSelected(
                  selected.size === filtered.length ? new Set() : new Set(filtered.map((d) => d.id))
                )
              }
              className="text-xs px-3 py-2 rounded border border-navy/30 text-navy/70"
            >
              {selected.size === filtered.length && filtered.length > 0 ? "Clear all" : "Select all shown"}
            </button>
            <button
              onClick={() => setBulkOpen(true)}
              disabled={selected.size === 0}
              className="text-sm px-4 py-2 rounded bg-navy text-white font-medium disabled:opacity-40"
            >
              Put in folders
            </button>
          </div>
        </div>
      )}

      {bulkOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-4">
            <p className="font-serif text-lg text-navy mb-3">
              Put {selected.size} {selected.size === 1 ? "file" : "files"} in
            </p>
            <FolderPicker value={bulkFolderIds} onChange={setBulkFolderIds} />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setBulkOpen(false)}
                className="flex-1 rounded border border-navy/30 px-4 py-2 text-sm text-navy"
              >
                Back
              </button>
              <button
                onClick={applyBulk}
                disabled={bulkBusy || bulkFolderIds.length === 0}
                className="flex-1 rounded bg-navy px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
              >
                {bulkBusy ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
