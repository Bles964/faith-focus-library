"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

type Row = {
  id: number;
  created_at: string;
  email: string | null;
  event: string;
  path: string | null;
  doc_id: string | null;
  doc_title: string | null;
};

type Msg = {
  id: number;
  created_at: string;
  email: string | null;
  kind: string;
  message: string;
  page: string | null;
  handled: boolean;
};

const PAGE_NAMES: Record<string, string> = {
  "/library": "Browse",
  "/quiz": "Quiz",
  "/upload": "Upload",
  "/focus": "Focus",
  "/videos": "Videos",
  "/exam": "Clinical videos",
  "/login": "Account",
};

export default function ActivityPage() {
  const supabase = createClient();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("all");
  const [showDone, setShowDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [anns, setAnns] = useState<{ id: number; message: string; created_at: string }[]>([]);
  const [annText, setAnnText] = useState("");
  const [annBusy, setAnnBusy] = useState(false);

  async function loadRows() {
    const { data, error: err } = await supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (err) {
      setError(err.message);
    } else {
      setError("");
      setRows((data as Row[]) ?? []);
    }

    const { data: m } = await supabase
      .from("feedback_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (m) setMsgs(m as Msg[]);
  }

  async function markDone(id: number) {
    const { error: err } = await supabase.from("feedback_messages").update({ handled: true }).eq("id", id);
    if (err) {
      alert(err.message);
      return;
    }
    setMsgs((prev) => prev.map((x) => (x.id === id ? { ...x, handled: true } : x)));
  }

  async function loadAnns() {
    const { data } = await supabase
      .from("announcements")
      .select("id,message,created_at")
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (data) setAnns(data as any[]);
  }

  async function postAnn() {
    const text = annText.trim();
    if (!text) return;
    setAnnBusy(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      // Only one announcement shows at a time, so retire the old one first
      await supabase.from("announcements").update({ active: false }).eq("active", true);
      const { error: err } = await supabase
        .from("announcements")
        .insert({ message: text.slice(0, 300), active: true, created_by: user?.id ?? null });
      if (err) {
        alert(err.message);
      } else {
        setAnnText("");
      }
      await loadAnns();
    } finally {
      setAnnBusy(false);
    }
  }

  async function removeAnn(id: number) {
    const { error: err } = await supabase.from("announcements").update({ active: false }).eq("id", id);
    if (err) {
      alert(err.message);
      return;
    }
    await loadAnns();
  }

  useEffect(() => {
    let timer: any;
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      if (profile?.is_admin !== true) {
        router.replace("/library");
        return;
      }
      setAllowed(true);

      const { data: docs } = await supabase.from("documents").select("id,title");
      if (docs) {
        const m: Record<string, string> = {};
        for (const d of docs as any[]) m[String(d.id)] = d.title;
        setTitles(m);
      }

      await loadRows();
      await loadAnns();
      setLoading(false);
      timer = setInterval(loadRows, 30000);
    }
    init();
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!allowed) return <p className="text-navy/50 text-sm">Checking access…</p>;

  const now = Date.now();
  const fiveMin = 5 * 60 * 1000;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const online = Array.from(
    new Set(
      rows.filter((r) => now - new Date(r.created_at).getTime() < fiveMin && r.email).map((r) => r.email as string)
    )
  );
  const todayVisitors = Array.from(
    new Set(
      rows
        .filter((r) => r.event === "visit" && new Date(r.created_at) >= startOfToday && r.email)
        .map((r) => r.email as string)
    )
  );

  function titleOf(r: Row) {
    return r.doc_title || (r.doc_id ? titles[r.doc_id] : "") || "a document";
  }

  const readCounts: Record<string, number> = {};
  for (const r of rows) {
    if (r.event === "read") {
      const t = titleOf(r);
      readCounts[t] = (readCounts[t] || 0) + 1;
    }
  }
  const topRead = Object.entries(readCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const emails = Array.from(new Set(rows.map((r) => r.email).filter(Boolean) as string[])).sort();
  const shown = rows.filter((r) => filter === "all" || r.email === filter).slice(0, 120);

  const unhandled = msgs.filter((m) => !m.handled);
  const visibleMsgs = showDone ? msgs : unhandled;

  function describe(r: Row) {
    if (r.event === "visit") return "opened the site";
    if (r.event === "read") return `read "${titleOf(r)}"`;
    if (r.event === "watch") return `watched "${titleOf(r)}"`;
    if (r.event === "page_view") return `viewed ${PAGE_NAMES[r.path || ""] || r.path || "a page"}`;
    return r.event;
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-navy mb-1">Activity</h1>
      <p className="text-sm text-navy/60 mb-5">
        Who is using the library, what they are reading, and what they have asked. Updates every 30 seconds.
      </p>

      {error && <p className="text-sm text-red-600 border border-red-200 rounded p-3 mb-4">{error}</p>}

      <div className="mb-6 border border-navy/15 rounded-lg bg-white p-4">
        <h2 className="font-serif text-lg text-navy mb-1">Announcement</h2>
        <p className="text-xs text-navy/60 mb-3">
          Shows as a banner at the top for everyone. Posting a new one replaces the old one.
        </p>
        {anns.length > 0 && (
          <div className="mb-3 border border-gold rounded bg-gold/10 px-3 py-2 text-sm text-navy">
            <p>{anns[0].message}</p>
            <button onClick={() => removeAnn(anns[0].id)} className="text-xs text-red-600 underline mt-1">
              Remove this announcement
            </button>
          </div>
        )}
        <textarea
          value={annText}
          onChange={(e) => setAnnText(e.target.value)}
          rows={2}
          maxLength={300}
          placeholder="Type a short announcement, for example: A new guide on Cardiology has been added."
          className="w-full border border-navy/20 rounded px-3 py-2 text-sm mb-2"
        />
        <button
          onClick={postAnn}
          disabled={annBusy || annText.trim().length === 0}
          className="px-3 py-1.5 rounded bg-navy text-paper text-sm disabled:opacity-50"
        >
          {annBusy ? "Posting…" : "Post announcement"}
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-serif text-lg text-navy">
            Messages{" "}
            {unhandled.length > 0 && (
              <span className="text-xs bg-gold text-navy rounded-full px-2 py-0.5 align-middle">
                {unhandled.length} new
              </span>
            )}
          </h2>
          <button onClick={() => setShowDone((v) => !v)} className="text-xs text-navy/60 underline">
            {showDone ? "Hide done" : "Show done too"}
          </button>
        </div>
        {visibleMsgs.length === 0 ? (
          <p className="text-sm text-navy/50">No new messages.</p>
        ) : (
          <div className="space-y-2">
            {visibleMsgs.map((m) => (
              <div
                key={m.id}
                className={`border rounded bg-white px-3 py-2 text-sm ${
                  m.handled ? "border-navy/10 opacity-60" : "border-gold"
                }`}
              >
                <p className="text-xs text-navy/50 mb-1">
                  <span className="uppercase tracking-wide text-gold font-medium">{m.kind}</span> ·{" "}
                  {m.email || "someone"} · {new Date(m.created_at).toLocaleString()}
                </p>
                <p className="text-navy whitespace-pre-wrap">{m.message}</p>
                <div className="flex gap-4 mt-2">
                  {m.email && (
                    <a
                      href={`mailto:${m.email}?subject=${encodeURIComponent("Faith and Focus Library")}`}
                      className="text-xs text-navy/60 hover:text-gold underline"
                    >
                      Reply by email
                    </a>
                  )}
                  {!m.handled && (
                    <button onClick={() => markDone(m.id)} className="text-xs text-navy/60 hover:text-gold underline">
                      Mark done
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="border border-navy/15 rounded-lg bg-white p-4 text-center">
          <p className="font-serif text-3xl text-navy">{online.length}</p>
          <p className="text-xs text-navy/60">active in the last 5 minutes</p>
        </div>
        <div className="border border-navy/15 rounded-lg bg-white p-4 text-center">
          <p className="font-serif text-3xl text-navy">{todayVisitors.length}</p>
          <p className="text-xs text-navy/60">people today</p>
        </div>
      </div>

      {online.length > 0 && (
        <div className="mb-6">
          <h2 className="font-serif text-lg text-navy mb-2">Active now</h2>
          <ul className="text-sm text-navy/80 space-y-1">
            {online.map((e) => (
              <li key={e}>• {e}</li>
            ))}
          </ul>
        </div>
      )}

      {topRead.length > 0 && (
        <div className="mb-6">
          <h2 className="font-serif text-lg text-navy mb-2">Most read</h2>
          <ul className="text-sm text-navy/80 space-y-1">
            {topRead.map(([t, c]) => (
              <li key={t}>
                {t} <span className="text-navy/50">({c})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <h2 className="font-serif text-lg text-navy">Recent activity</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-navy/20 rounded px-2 py-1 text-sm bg-white"
        >
          <option value="all">Everyone</option>
          {emails.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-navy/50">Loading…</p>
      ) : shown.length === 0 ? (
        <p className="text-sm text-navy/50">Nothing recorded yet.</p>
      ) : (
        <div className="space-y-2">
          {shown.map((r) => (
            <div key={r.id} className="border border-navy/10 rounded bg-white px-3 py-2 text-sm">
              <p className="text-navy">
                <span className="font-medium">{r.email || "someone"}</span> {describe(r)}
              </p>
              <p className="text-xs text-navy/50">{new Date(r.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
