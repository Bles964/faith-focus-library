"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { logActivity } from "@/lib/activity";

type View = { path: string; label: string };

type Case = {
  id: string;
  created_at: string;
  title: string;
  category: string;
  history: string | null;
  findings: string | null;
  diagnosis: string | null;
  notes: string | null;
  image_path: string;
  view_label: string | null;
  extra_images: View[] | null;
};

const CATEGORIES = ["ECG", "Radiograph", "CT / MRI", "Clinical picture"];
const VIEW_LABELS = ["PA", "AP", "Lateral", "Oblique", "Decubitus", "Axial", "Coronal", "Sagittal", "Other"];
const MAX_MB = 10;
const MAX_EXTRA = 5;

// Cut text into short pieces so the phone voice does not stop partway
function splitForSpeech(text: string): string[] {
  const sentences = text.replace(/\s+/g, " ").match(/[^.!?]+[.!?]*/g) || [text];
  const chunks: string[] = [];
  for (const sentence of sentences) {
    let rest = sentence.trim();
    while (rest.length > 180) {
      let cut = rest.lastIndexOf(", ", 180);
      if (cut < 60) cut = rest.lastIndexOf(" ", 180);
      if (cut < 60) cut = 180;
      chunks.push(rest.slice(0, cut + 1).trim());
      rest = rest.slice(cut + 1).trim();
    }
    if (rest) chunks.push(rest);
  }
  return chunks;
}

function viewsOf(c: Case): View[] {
  const first: View = { path: c.image_path, label: c.view_label || "Main" };
  const extras = Array.isArray(c.extra_images) ? c.extra_images : [];
  return [first, ...extras];
}

export default function CasesPage() {
  const supabase = createClient();
  const [cases, setCases] = useState<Case[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  // Open case
  const [current, setCurrent] = useState<Case | null>(null);
  const [viewIdx, setViewIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  // Admin form
  const [showForm, setShowForm] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [history, setHistory] = useState("");
  const [findings, setFindings] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [mainLabel, setMainLabel] = useState("");
  const [extras, setExtras] = useState<{ file: File | null; label: string }[]>([]);
  const [consent, setConsent] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  // Reading a case aloud
  const [speaking, setSpeaking] = useState(false);
  const speakTokenRef = useRef(0);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  function stopSpeech() {
    speakTokenRef.current++;
    try {
      speechSynthesis.cancel();
    } catch {}
    setSpeaking(false);
  }

  function speakText(text: string) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("This browser cannot read aloud.");
      return;
    }
    if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
    const chunks = splitForSpeech(text);
    const token = ++speakTokenRef.current;
    setSpeaking(true);

    const speakAt = (i: number) => {
      if (token !== speakTokenRef.current) return;
      if (i >= chunks.length) {
        setSpeaking(false);
        return;
      }
      const u = new SpeechSynthesisUtterance(chunks[i]);
      u.onend = () => speakAt(i + 1);
      u.onerror = (e: any) => {
        if (token !== speakTokenRef.current) return;
        if (e?.error === "canceled" || e?.error === "interrupted") return;
        speakAt(i + 1);
      };
      utterRef.current = u; // keep a reference so the phone does not drop the voice
      speechSynthesis.speak(u);
    };
    speakAt(0);
  }

  function toggleSpeech() {
    if (speaking) {
      stopSpeech();
      return;
    }
    if (!current) return;
    const end = (t: string | null) => (t ? (/[.!?]$/.test(t.trim()) ? t.trim() : t.trim() + ".") : "");
    let text: string;
    if (!revealed) {
      text =
        `${end(current.title)} ` +
        (current.history ? `Clinical scenario. ${end(current.history)} ` : "") +
        "Think first. What do you see, and what is your diagnosis?";
    } else {
      text =
        (current.findings ? `What you should see. ${end(current.findings)} ` : "") +
        (current.diagnosis ? `The diagnosis is ${end(current.diagnosis)} ` : "") +
        (current.notes ? `Teaching points. ${end(current.notes)}` : "");
      if (!text.trim()) text = "There is no interpretation written for this case yet.";
    }
    speakText(text);
  }

  useEffect(() => {
    return () => {
      try {
        speechSynthesis.cancel();
      } catch {}
    };
  }, []);

  async function signPaths(paths: string[]) {
    if (paths.length === 0) return;
    const { data: signed } = await supabase.storage.from("case-images").createSignedUrls(paths, 60 * 60);
    if (signed) {
      const m: Record<string, string> = {};
      for (const s of signed) if (s.path && s.signedUrl) m[s.path] = s.signedUrl;
      setUrls((prev) => ({ ...prev, ...m }));
    }
  }

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
          .from("case_images")
          .select("*")
          .order("created_at", { ascending: false });
        if (data && data.length > 0) {
          setCases(data as Case[]);
          const paths: string[] = [];
          for (const c of data as Case[]) for (const v of viewsOf(c)) paths.push(v.path);
          await signPaths(paths);
        }
      }
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shown = cases.filter((c) => activeCategory === "All" || c.category === activeCategory);

  function openCase(c: Case) {
    stopSpeech();
    setCurrent(c);
    setViewIdx(0);
    setRevealed(false);
    setZoomed(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    logActivity("view_case", { path: "/cases", docId: c.id, docTitle: c.title });
  }

  function randomCase() {
    const pool = shown.filter((c) => c.id !== current?.id);
    const list = pool.length > 0 ? pool : shown;
    if (list.length === 0) return;
    openCase(list[Math.floor(Math.random() * list.length)]);
  }

  async function addCase() {
    if (!title.trim()) {
      setMsg("Please add a title.");
      return;
    }
    if (!file) {
      setMsg("Please choose the main image.");
      return;
    }
    if (!consent) {
      setMsg("Please confirm the images are anonymous and that you may use them.");
      return;
    }
    const extraFiles = extras.filter((x) => x.file);
    const all = [file, ...extraFiles.map((x) => x.file as File)];
    for (const f of all) {
      if (f.size > MAX_MB * 1024 * 1024) {
        setMsg(`"${f.name}" is over ${MAX_MB} MB. Please use a smaller image.`);
        return;
      }
    }

    setUploading(true);
    setMsg("Uploading…");

    const uploaded: string[] = [];
    async function uploadOne(f: File): Promise<string | null> {
      const ext = (f.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from("case-images")
        .upload(path, f, { contentType: f.type || "image/jpeg", upsert: false });
      if (error) {
        setMsg("Upload failed: " + error.message);
        return null;
      }
      uploaded.push(path);
      return path;
    }

    const mainPath = await uploadOne(file);
    if (!mainPath) {
      setUploading(false);
      return;
    }

    const extraViews: View[] = [];
    for (let i = 0; i < extraFiles.length; i++) {
      const p = await uploadOne(extraFiles[i].file as File);
      if (!p) {
        await supabase.storage.from("case-images").remove(uploaded);
        setUploading(false);
        return;
      }
      extraViews.push({ path: p, label: extraFiles[i].label || `View ${i + 2}` });
    }

    const { data, error: dbErr } = await supabase
      .from("case_images")
      .insert({
        title: title.trim(),
        category,
        history: history.trim() || null,
        findings: findings.trim() || null,
        diagnosis: diagnosis.trim() || null,
        notes: notes.trim() || null,
        image_path: mainPath,
        view_label: mainLabel || null,
        extra_images: extraViews,
      })
      .select()
      .single();

    if (dbErr || !data) {
      await supabase.storage.from("case-images").remove(uploaded);
      setMsg("Could not save the case: " + (dbErr?.message ?? "unknown error"));
      setUploading(false);
      return;
    }

    await signPaths(uploaded);
    setCases((prev) => [data as Case, ...prev]);
    setTitle("");
    setHistory("");
    setFindings("");
    setDiagnosis("");
    setNotes("");
    setFile(null);
    setMainLabel("");
    setExtras([]);
    setConsent(false);
    setFormKey((k) => k + 1);
    setMsg("Added. Students can practise it now.");
    setUploading(false);
  }

  async function renameCase(c: Case) {
    const newTitle = window.prompt("Rename case:", c.title);
    if (!newTitle || newTitle.trim() === "" || newTitle === c.title) return;
    const { error } = await supabase.from("case_images").update({ title: newTitle.trim() }).eq("id", c.id);
    if (error) {
      alert(error.message);
      return;
    }
    setCases((prev) => prev.map((x) => (x.id === c.id ? { ...x, title: newTitle.trim() } : x)));
  }

  async function deleteCase(c: Case) {
    if (!window.confirm(`Delete "${c.title}" and all its views? This cannot be undone.`)) return;
    const paths = viewsOf(c).map((v) => v.path);
    const { error: sErr } = await supabase.storage.from("case-images").remove(paths);
    if (sErr) {
      alert(sErr.message);
      return;
    }
    const { error: dErr } = await supabase.from("case_images").delete().eq("id", c.id);
    if (dErr) {
      alert(dErr.message);
      return;
    }
    if (current?.id === c.id) setCurrent(null);
    setCases((prev) => prev.filter((x) => x.id !== c.id));
  }

  if (!signedIn && !loading) {
    return (
      <div className="text-center py-16">
        <p className="text-navy/70 mb-3">Sign in to practise reading ECGs, radiographs and clinical pictures.</p>
        <a href="/login" className="text-gold underline">
          Go to sign in
        </a>
      </div>
    );
  }

  const input = "w-full border border-navy/20 rounded px-3 py-2 text-sm";
  const views = current ? viewsOf(current) : [];
  const activeView = views[Math.min(viewIdx, Math.max(views.length - 1, 0))];

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-serif text-2xl text-navy">Cases</h1>
        {shown.length > 0 && (
          <button
            onClick={randomCase}
            className="text-xs px-3 py-1.5 rounded border border-navy/30 text-navy/70 hover:border-gold"
          >
            🎲 Random case
          </button>
        )}
      </div>
      <p className="text-sm text-navy/60 mb-5">
        Practise reading ECGs, radiographs, scans and clinical pictures. Look first, then reveal the interpretation.
      </p>

      {current && activeView && (
        <div className="mb-6 border border-gold rounded-lg bg-white p-3">
          <p className="text-xs uppercase tracking-wide text-gold font-medium">{current.category}</p>
          <h2 className="font-serif text-lg text-navy mb-2">{current.title}</h2>

          {views.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {views.map((v, i) => (
                <button
                  key={v.path}
                  onClick={() => {
                    setViewIdx(i);
                    setZoomed(false);
                  }}
                  className={`text-xs px-3 py-1 rounded-full border ${
                    i === viewIdx ? "bg-navy text-paper border-navy" : "border-navy/30 text-navy/70"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}

          <div
            className="overflow-auto rounded bg-black/5 border border-navy/10"
            style={{ maxHeight: zoomed ? "70vh" : undefined }}
            onContextMenu={(e) => e.preventDefault()}
          >
            {urls[activeView.path] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={urls[activeView.path]}
                alt={`${current.title} (${activeView.label})`}
                draggable={false}
                style={{
                  width: zoomed ? "220%" : "100%",
                  maxWidth: "none",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  WebkitTouchCallout: "none",
                }}
              />
            ) : (
              <p className="p-6 text-sm text-navy/50">Image could not be loaded.</p>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <button onClick={() => setZoomed((z) => !z)} className="text-xs text-navy/60 underline">
              {zoomed ? "Zoom out" : "🔍 Zoom in"}
            </button>
            {activeView.label !== "Main" && <span className="text-xs text-navy/50">View: {activeView.label}</span>}
          </div>

          <button
            onClick={toggleSpeech}
            className="mt-3 px-3 py-1.5 rounded border border-navy/30 text-sm text-navy/80 hover:border-gold"
          >
            {speaking ? "⏹ Stop" : revealed ? "🔊 Read the interpretation" : "🔊 Read the scenario"}
          </button>

          {current.history && (
            <div className="mt-3">
              <p className="text-xs uppercase tracking-wide text-navy/50 mb-1">Clinical scenario</p>
              <p className="text-sm text-navy">{current.history}</p>
            </div>
          )}

          {!revealed ? (
            <div className="mt-4 border border-navy/15 rounded p-3 bg-paper">
              <p className="text-sm text-navy mb-2">Think first: what do you see, and what is your diagnosis?</p>
              <button
                onClick={() => {
                  stopSpeech();
                  setRevealed(true);
                }}
                className="px-3 py-1.5 rounded bg-navy text-paper text-sm"
              >
                Show interpretation
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {current.findings && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-gold font-medium mb-1">What you should see</p>
                  <p className="text-sm text-navy whitespace-pre-wrap">{current.findings}</p>
                </div>
              )}
              {current.diagnosis && (
                <div className="border border-gold bg-gold/10 rounded p-3">
                  <p className="text-xs uppercase tracking-wide text-gold font-medium mb-1">Diagnosis</p>
                  <p className="text-sm text-navy font-medium whitespace-pre-wrap">{current.diagnosis}</p>
                </div>
              )}
              {current.notes && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-navy/50 mb-1">Teaching points</p>
                  <p className="text-sm text-navy/80 whitespace-pre-wrap">{current.notes}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-4 pt-3 border-t border-navy/10">
            <button onClick={randomCase} className="text-xs text-navy/60 hover:text-gold underline">
              Next case
            </button>
            <button
              onClick={() => {
                stopSpeech();
                setCurrent(null);
              }}
              className="text-xs text-navy/60 hover:text-gold underline"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="mb-6 border border-navy/15 rounded-lg bg-white p-4">
          <button onClick={() => setShowForm((v) => !v)} className="font-serif text-lg text-navy">
            {showForm ? "− Add a case" : "+ Add a case"}
          </button>
          {showForm && (
            <div className="mt-3 space-y-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title, for example: Chest pain in a 55-year-old man"
                className={input}
              />
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${input} bg-white`}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <textarea
                value={history}
                onChange={(e) => setHistory(e.target.value)}
                rows={2}
                placeholder="Clinical scenario (optional), shown with the image"
                className={input}
              />
              <textarea
                value={findings}
                onChange={(e) => setFindings(e.target.value)}
                rows={3}
                placeholder="What you should see (hidden until the student taps Show interpretation)"
                className={input}
              />
              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                rows={2}
                placeholder="Diagnosis"
                className={input}
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Teaching points (optional)"
                className={input}
              />

              <div className="border border-navy/10 rounded p-2 space-y-2">
                <p className="text-xs text-navy/60">Main image</p>
                <select value={mainLabel} onChange={(e) => setMainLabel(e.target.value)} className={`${input} bg-white`}>
                  <option value="">View (optional), for example PA</option>
                  {VIEW_LABELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                <input
                  key={`main-${formKey}`}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm"
                />
              </div>

              {extras.map((x, i) => (
                <div key={`${formKey}-${i}`} className="border border-navy/10 rounded p-2 space-y-2">
                  <div className="flex gap-2 items-center">
                    <select
                      value={x.label}
                      onChange={(e) =>
                        setExtras((prev) => prev.map((p, j) => (j === i ? { ...p, label: e.target.value } : p)))
                      }
                      className={`${input} bg-white`}
                    >
                      <option value="">View (optional)</option>
                      {VIEW_LABELS.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setExtras((prev) => prev.filter((_, j) => j !== i))}
                      className="text-xs text-red-600 underline shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setExtras((prev) => prev.map((p, j) => (j === i ? { ...p, file: f } : p)));
                    }}
                    className="w-full text-sm"
                  />
                </div>
              ))}

              {extras.length < MAX_EXTRA && (
                <button
                  onClick={() => setExtras((prev) => [...prev, { file: null, label: "" }])}
                  className="text-xs text-navy/70 underline"
                >
                  + Add another view
                </button>
              )}
              <p className="text-xs text-navy/50">JPEG, PNG or WebP, up to {MAX_MB} MB each.</p>

              <label className="flex items-start gap-2 text-xs text-navy/70">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  I confirm the images have no name, hospital number, date of birth, face or other identifying
                  detail, and I have permission to use them.
                </span>
              </label>
              <button
                onClick={addCase}
                disabled={uploading}
                className="px-3 py-1.5 rounded bg-navy text-paper text-sm disabled:opacity-50"
              >
                {uploading ? "Uploading…" : "Add case"}
              </button>
              {msg && <p className="text-xs text-navy/70">{msg}</p>}
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-5">
        {["All", ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`text-sm px-3 py-1 rounded-full border ${
              activeCategory === c ? "bg-navy text-paper border-navy" : "border-navy/30 text-navy/70 hover:border-navy"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-navy/50">Loading…</p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-navy/50">No cases yet. Check back soon.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {shown.map((c) => {
            const count = viewsOf(c).length;
            return (
              <div
                key={c.id}
                className="border border-navy/15 rounded-lg bg-white overflow-hidden hover:border-gold transition-colors"
              >
                <button onClick={() => openCase(c)} className="text-left w-full">
                  <div className="relative">
                    {urls[c.image_path] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={urls[c.image_path]}
                        alt=""
                        loading="lazy"
                        draggable={false}
                        onContextMenu={(e) => e.preventDefault()}
                        className="w-full aspect-square object-cover bg-navy/10"
                        style={{ WebkitTouchCallout: "none" }}
                      />
                    ) : (
                      <div className="w-full aspect-square bg-navy/10" />
                    )}
                    {count > 1 && (
                      <span className="absolute bottom-2 right-2 text-[10px] bg-navy text-paper rounded-full px-2 py-0.5">
                        {count} views
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] uppercase tracking-wide text-gold font-medium">{c.category}</span>
                    <h2 className="font-serif text-sm text-navy mt-0.5">{c.title}</h2>
                  </div>
                </button>
                {isAdmin && (
                  <div className="flex gap-3 px-3 pb-3">
                    <button onClick={() => renameCase(c)} className="text-xs text-navy/60 hover:text-gold underline">
                      Rename
                    </button>
                    <button onClick={() => deleteCase(c)} className="text-xs text-red-600 hover:text-red-800 underline">
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
