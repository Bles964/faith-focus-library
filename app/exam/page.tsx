"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { logActivity } from "@/lib/activity";

type Video = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_path: string;
  created_at: string;
};

const CATEGORIES = [
  "General examination",
  "Cardiovascular",
  "Respiratory",
  "Abdominal",
  "Neurological",
  "Musculoskeletal",
  "Other",
];

const MAX_MB = 50;

export default function ExamVideosPage() {
  const supabase = createClient();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [playing, setPlaying] = useState<{ video: Video; url: string } | null>(null);
  const [playError, setPlayError] = useState("");

  // Admin upload form
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

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
        setIsAdmin(profile?.is_admin === true);

        const { data } = await supabase
          .from("exam_videos")
          .select("*")
          .order("created_at", { ascending: false });
        if (data) setVideos(data as Video[]);
      }
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function play(v: Video) {
    setPlayError("");
    const { data, error } = await supabase.storage.from("exam-videos").createSignedUrl(v.file_path, 60 * 60);
    if (!data?.signedUrl) {
      setPlayError(error?.message ?? "Could not open this video.");
      return;
    }
    setPlaying({ video: v, url: data.signedUrl });
    window.scrollTo({ top: 0, behavior: "smooth" });
    logActivity("watch", { path: "/exam", docId: v.id, docTitle: v.title });
  }

  async function upload() {
    if (!file || !title.trim()) {
      setMsg("Please add a title and choose a video.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setMsg(`This video is over ${MAX_MB} MB. Compress it, or cut it into shorter clips, and try again.`);
      return;
    }
    setUploading(true);
    setMsg("Uploading… keep this page open. On mobile data this can take a while.");

    const ext = (file.name.split(".").pop() || "mp4").toLowerCase();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("exam-videos")
      .upload(path, file, { contentType: file.type || "video/mp4", upsert: false });
    if (upErr) {
      setMsg("Upload failed: " + upErr.message);
      setUploading(false);
      return;
    }

    const { data, error: dbErr } = await supabase
      .from("exam_videos")
      .insert({
        title: title.trim(),
        description: description.trim() || null,
        category,
        file_path: path,
      })
      .select()
      .single();

    if (dbErr || !data) {
      await supabase.storage.from("exam-videos").remove([path]);
      setMsg("Could not save the video: " + (dbErr?.message ?? "unknown error"));
      setUploading(false);
      return;
    }

    setVideos((prev) => [data as Video, ...prev]);
    setTitle("");
    setDescription("");
    setFile(null);
    setMsg("Uploaded. Students can watch it now.");
    setUploading(false);
  }

  async function renameVideo(v: Video) {
    const newTitle = window.prompt("Rename video:", v.title);
    if (!newTitle || newTitle.trim() === "" || newTitle === v.title) return;
    const { error } = await supabase.from("exam_videos").update({ title: newTitle.trim() }).eq("id", v.id);
    if (error) {
      alert(error.message);
      return;
    }
    setVideos((prev) => prev.map((x) => (x.id === v.id ? { ...x, title: newTitle.trim() } : x)));
  }

  async function deleteVideo(v: Video) {
    if (!window.confirm(`Delete "${v.title}"? This cannot be undone.`)) return;
    const { error: sErr } = await supabase.storage.from("exam-videos").remove([v.file_path]);
    if (sErr) {
      alert(sErr.message);
      return;
    }
    const { error: dErr } = await supabase.from("exam_videos").delete().eq("id", v.id);
    if (dErr) {
      alert(dErr.message);
      return;
    }
    if (playing?.video.id === v.id) setPlaying(null);
    setVideos((prev) => prev.filter((x) => x.id !== v.id));
  }

  if (!signedIn && !loading) {
    return (
      <div className="text-center py-16">
        <p className="text-navy/70 mb-3">Sign in to watch the examination videos.</p>
        <a href="/login" className="text-gold underline">
          Go to sign in
        </a>
      </div>
    );
  }

  const categories = ["All", ...Array.from(new Set(videos.map((v) => v.category)))];
  const shown = videos.filter((v) => activeCategory === "All" || v.category === activeCategory);

  return (
    <div>
      <h1 className="font-serif text-2xl text-navy mb-1">Clinical examination videos</h1>
      <p className="text-sm text-navy/60 mb-5">Watch how each examination is done, step by step.</p>

      {playing && (
        <div className="mb-6 border border-gold rounded-lg bg-white p-3">
          <video
            key={playing.url}
            src={playing.url}
            controls
            autoPlay
            playsInline
            controlsList="nodownload"
            disablePictureInPicture
            onContextMenu={(e) => e.preventDefault()}
            className="w-full rounded bg-black"
          />
          <div className="flex items-start justify-between gap-3 mt-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-gold font-medium">{playing.video.category}</p>
              <h2 className="font-serif text-lg text-navy">{playing.video.title}</h2>
              {playing.video.description && (
                <p className="text-sm text-navy/70 mt-1">{playing.video.description}</p>
              )}
            </div>
            <button onClick={() => setPlaying(null)} className="text-xs text-navy/60 underline shrink-0">
              Close
            </button>
          </div>
        </div>
      )}

      {playError && <p className="text-sm text-red-600 border border-red-200 rounded p-3 mb-4">{playError}</p>}

      {isAdmin && (
        <div className="mb-6 border border-navy/15 rounded-lg bg-white p-4">
          <button onClick={() => setShowForm((v) => !v)} className="font-serif text-lg text-navy">
            {showForm ? "− Add a video" : "+ Add a video"}
          </button>
          {showForm && (
            <div className="mt-3 space-y-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title, for example: General examination: head to toe"
                className="w-full border border-navy/20 rounded px-3 py-2 text-sm"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-navy/20 rounded px-3 py-2 text-sm bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Short description (optional)"
                className="w-full border border-navy/20 rounded px-3 py-2 text-sm"
              />
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm"
              />
              <p className="text-xs text-navy/50">
                Up to {MAX_MB} MB per video. About 2 to 3 minutes at 720p fits.
              </p>
              <button
                onClick={upload}
                disabled={uploading}
                className="px-3 py-1.5 rounded bg-navy text-paper text-sm disabled:opacity-50"
              >
                {uploading ? "Uploading…" : "Upload video"}
              </button>
              {msg && <p className="text-xs text-navy/70">{msg}</p>}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-5">
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
        <p className="text-sm text-navy/50">Loading…</p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-navy/50">No videos yet. Check back soon.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {shown.map((v) => (
            <div key={v.id} className="border border-navy/15 rounded-lg p-4 bg-white hover:border-gold transition-colors">
              <button onClick={() => play(v)} className="text-left w-full">
                <span className="text-xs uppercase tracking-wide text-gold font-medium">{v.category}</span>
                <h2 className="font-serif text-lg text-navy mt-1">▶ {v.title}</h2>
                {v.description && <p className="text-sm text-navy/60 mt-1">{v.description}</p>}
              </button>
              {isAdmin && (
                <div className="flex gap-3 mt-3 pt-3 border-t border-navy/10">
                  <button onClick={() => renameVideo(v)} className="text-xs text-navy/60 hover:text-gold underline">
                    Rename
                  </button>
                  <button onClick={() => deleteVideo(v)} className="text-xs text-red-600 hover:text-red-800 underline">
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
