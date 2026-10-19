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

const PAGE_NAMES: Record<string, string> = {
  "/library": "Browse",
  "/quiz": "Quiz",
  "/upload": "Upload",
  "/focus": "Focus",
  "/videos": "Videos",
  "/login": "Account",
};

export default function ActivityPage() {
  const supabase = createClient();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [titles, setTitles] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRows() {
    const { data, error: err } = await supabase
      .from("activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (err) {
      setError(err.message);
      return;
    }
    setError("");
    setRows((data as Row[]) ?? []);
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

  function describe(r: Row) {
    if (r.event === "visit") return "opened the site";
    if (r.event === "read") return `read "${titleOf(r)}"`;
    if (r.event === "page_view") return `viewed ${PAGE_NAMES[r.path || ""] || r.path || "a page"}`;
    return r.event;
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-navy mb-1">Activity</h1>
      <p className="text-sm text-navy/60 mb-5">Who is using the library and what they are reading. Updates every 30 seconds.</p>

      {error && <p className="text-sm text-red-600 border border-red-200 rounded p-3 mb-4">{error}</p>}

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
