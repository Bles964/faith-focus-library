"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabaseClient";

const NAVY = "#0B1F3A";
const NAVY_DEEP = "#081729";
const GOLD = "#D4AF37";
const GOLD_SOFT = "#E8C766";
const PAPER = "#F4F1EA";
const MUTED = "#9AA6B8";

type Session = { date: string; mins: number };

export default function LockInTimer({ userId }: { userId?: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [mins, setMins] = useState(25);
  const [pledges, setPledges] = useState(
    "Phone in another room\nNo checking messages\nOne tab only, this task"
  );
  const [locked, setLocked] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [phase, setPhase] = useState("Locked in");
  const [history, setHistory] = useState<Session[]>([]);
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const loadHistory = useCallback(async () => {
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
  }, [userId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const saveSession = useCallback(
    async (loggedMins: number) => {
      if (userId) {
        await supabase
          .from("lockin_sessions")
          .insert({ user_id: userId, minutes: loggedMins });
      } else {
        try {
          const raw = localStorage.getItem("lockin_history");
          const h: Session[] = raw ? JSON.parse(raw) : [];
          h.unshift({
            date: new Date().toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            }),
            mins: loggedMins,
          });
          localStorage.setItem("lockin_history", JSON.stringify(h.slice(0, 8)));
        } catch {}
      }
      loadHistory();
    },
    [userId, loadHistory]
  );

  const playChime = () => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new Ctx();
      [523.25, 659.25, 783.99].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.frequency.value = f;
        o.type = "sine";
        o.connect(g);
        g.connect(ctx.destination);
        const t = ctx.currentTime + i * 0.18;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        o.start(t);
        o.stop(t + 0.55);
      });
    } catch {}
  };

  const beforeUnload = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = "";
  };

  const finish = useCallback(
    (loggedMins: number) => {
      window.removeEventListener("beforeunload", beforeUnload);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      playChime();
      setPhase("Session complete");
      setRemaining(0);
      saveSession(loggedMins);
      setTimeout(() => setLocked(false), 1400);
    },
    [saveSession]
  );

  const start = () => {
    const total = Math.max(1, Math.min(180, mins)) * 60;
    endTimeRef.current = Date.now() + total * 1000;
    setPhase("Locked in");
    setLocked(true);
    window.addEventListener("beforeunload", beforeUnload);
    wrapRef.current?.requestFullscreen?.().catch(() => {});

    const tick = () => {
      const r = Math.max(0, Math.round(((endTimeRef.current ?? 0) - Date.now()) / 1000));
      setRemaining(r);
      if (r <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        finish(mins);
      }
    };
    tick();
    intervalRef.current = setInterval(tick, 250);
  };

  const stopEarly = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    window.removeEventListener("beforeunload", beforeUnload);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    setLocked(false);
  };

  return (
    <div ref={wrapRef}>
      {!locked && (
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
            A committed block of study time. Set the length, name what you won&apos;t touch, and go fullscreen.
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
            onClick={start}
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
            This locks the screen and warns before you leave the tab — a nudge, not a hard block. Pair it with your phone&apos;s focus mode for real app blocking.
          </p>
        </div>
      )}

      {locked && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: NAVY_DEEP,
            color: PAPER,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            textAlign: "center",
            zIndex: 50,
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        >
          <div style={{ color: GOLD_SOFT, fontSize: ".9rem", letterSpacing: ".02em" }}>{phase}</div>
          <div
            style={{
              fontFamily: "'Source Serif 4', Georgia, serif",
              fontVariantNumeric: "tabular-nums",
              fontSize: "clamp(3.5rem, 18vw, 6.5rem)",
              fontWeight: 600,
              letterSpacing: "-.02em",
              lineHeight: 1,
            }}
          >
            {fmt(remaining)}
          </div>
          {pledges.trim() && (
            <div style={{ marginTop: 28, maxWidth: 340, textAlign: "left", color: MUTED, fontSize: ".9rem", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              <b style={{ color: PAPER, display: "block", marginBottom: 4, fontWeight: 500 }}>
                You committed to:
              </b>
              {pledges.trim()}
            </div>
          )}
          <button
            onClick={stopEarly}
            style={{
              marginTop: 36,
              background: "transparent",
              border: `1px solid ${GOLD}33`,
              color: MUTED,
              padding: "10px 20px",
              fontSize: ".85rem",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            End session early
          </button>
        </div>
      )}
    </div>
  );
}
