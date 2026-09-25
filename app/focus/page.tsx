"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useLockIn } from "@/components/LockInProvider";

const NAVY = "#0B1F3A";
const NAVY_DEEP = "#081729";
const GOLD = "#D4AF37";
const GOLD_SOFT = "#E8C766";
const PAPER = "#F4F1EA";
const MUTED = "#9AA6B8";

type Session = { date: string; mins: number };

export default function FocusPage() {
  const supabase = useMemo(() => createClient(), []);
  const { start } = useLockIn();
  const [userId, setUserId] = useState<string | undefined>();
  const [mins, setMins] = useState(25);
  const [pledges, setPledges] = useState(
    "Phone in another room\nNo checking messages\nOne tab only, this task"
  );
  const [history, setHistory] = useState<Session[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user?.id));
  }, [supabase]);

  useEffect(() => {
    async function loadHistory() {
      if (userId) {
        const { data } = await supabase
          .from("lockin_sessions")
          .select("minutes, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(8);
        if (data) {
          setHistory(
            data.map((d) => ({
              date: new Date(d.created_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              }),
              mins: d.minutes,
            }))
          );
          return;
        }
      }
      try {
        const raw = localStorage.getItem("lockin_history");
        setHistory(raw ? JSON.parse(raw) : []);
      } catch {
        setHistory([]);
      }
    }
    loadHistory();
  }, [userId, supabase]);

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "0 auto",
        background: NAVY,
        border: `1px solid ${GOLD}33`,
        borderRadius: 14,
        padding: "32px 28px",
        color: PAPER,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <h2
        style={{
          fontFamily: "'Source Serif 4', Georgia, serif",
          fontWeight: 600,
          fontSize: "1.5rem",
          margin: "0 0 4px",
          color: GOLD_SOFT,
        }}
      >
        Lock in
      </h2>
      <p style={{ color: MUTED, fontSize: ".9rem", lineHeight: 1.5, margin: "0 0 24px" }}>
        A committed block of study time. Set the length, name what you won&apos;t touch, and go.
      </p>

      <label style={{ display: "block", fontSize: ".85rem", color: MUTED, margin: "18px 0 6px" }}>
        Session length (minutes)
      </label>
      <div style={{ display: "flex", gap: 10 }}>
        <input
          type="number"
          value={mins}
          min={1}
          max={180}
          onChange={(e) => setMins(parseInt(e.target.value, 10) || 25)}
          style={{
            width: 90,
            background: NAVY_DEEP,
            border: `1px solid ${GOLD}33`,
            color: PAPER,
            borderRadius: 8,
            padding: "10px 12px",
          }}
        />
        {[25, 50].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMins(m)}
            style={{
              background: "transparent",
              border: `1px solid ${GOLD}33`,
              color: MUTED,
              borderRadius: 8,
              padding: "10px 14px",
              cursor: "pointer",
            }}
          >
            {m}
          </button>
        ))}
      </div>

      <label style={{ display: "block", fontSize: ".85rem", color: MUTED, margin: "18px 0 6px" }}>
        What you&apos;re avoiding this session
      </label>
      <textarea
        value={pledges}
        onChange={(e) => setPledges(e.target.value)}
        style={{
          width: "100%",
          minHeight: 64,
          background: NAVY_DEEP,
          border: `1px solid ${GOLD}33`,
          color: PAPER,
          borderRadius: 8,
          padding: "10px 12px",
          lineHeight: 1.5,
          resize: "vertical",
        }}
      />

      <button
        onClick={() => start(mins, pledges, userId)}
        style={{
          width: "100%",
          marginTop: 22,
          background: GOLD,
          color: NAVY_DEEP,
          border: "none",
          borderRadius: 8,
          padding: "12px 16px",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Start lock-in
      </button>

      <div style={{ marginTop: 22, borderTop: `1px solid ${GOLD}33`, paddingTop: 14 }}>
        <h3 style={{ fontSize: ".85rem", color: MUTED, fontWeight: 500, margin: "0 0 8px" }}>
          Recent sessions
        </h3>
        {history.length === 0 ? (
          <p style={{ color: MUTED, fontSize: ".85rem", margin: 0 }}>No sessions logged yet.</p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, fontSize: ".88rem", color: MUTED }}>
            {history.map((s, i) => (
              <li key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
                <span>{s.date}</span>
                <span style={{ color: PAPER }}>{s.mins} min</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p style={{ color: MUTED, fontSize: ".78rem", marginTop: 20, lineHeight: 1.5 }}>
        Once started, a small countdown pill stays with you across the app — you can keep browsing the library while it runs.
      </p>
    </div>
  );
}
