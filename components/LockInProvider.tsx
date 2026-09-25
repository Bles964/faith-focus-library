"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabaseClient";

type Ctx = {
  locked: boolean;
  remaining: number;
  pledges: string;
  start: (mins: number, pledges: string, userId?: string) => void;
  stopEarly: () => void;
};

const LockInContext = createContext<Ctx | null>(null);

export function useLockIn() {
  const ctx = useContext(LockInContext);
  if (!ctx) throw new Error("useLockIn must be used inside LockInProvider");
  return ctx;
}

export function LockInProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const [locked, setLocked] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [pledges, setPledges] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userIdRef = useRef<string | undefined>(undefined);
  const totalMinsRef = useRef(25);

  useEffect(() => {
    const end = localStorage.getItem("lockin_end");
    const p = localStorage.getItem("lockin_pledges");
    if (end) {
      const r = Math.round((parseInt(end, 10) - Date.now()) / 1000);
      if (r > 0) {
        setLocked(true);
        setRemaining(r);
        setPledges(p ?? "");
        tick(parseInt(end, 10));
      } else {
        localStorage.removeItem("lockin_end");
      }
    }
  }, []);

  const saveSession = useCallback(async (loggedMins: number) => {
    if (userIdRef.current) {
      await supabase.from("lockin_sessions").insert({ user_id: userIdRef.current, minutes: loggedMins });
    } else {
      try {
        const raw = localStorage.getItem("lockin_history");
        const h = raw ? JSON.parse(raw) : [];
        h.unshift({ date: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" }), mins: loggedMins });
        localStorage.setItem("lockin_history", JSON.stringify(h.slice(0, 8)));
      } catch {}
    }
  }, [supabase]);

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

  const finish = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    localStorage.removeItem("lockin_end");
    localStorage.removeItem("lockin_pledges");
    playChime();
    saveSession(totalMinsRef.current);
    setRemaining(0);
    setTimeout(() => setLocked(false), 1200);
  }, [saveSession]);

  function tick(endTime: number) {
    const run = () => {
      const r = Math.max(0, Math.round((endTime - Date.now()) / 1000));
      setRemaining(r);
      if (r <= 0) finish();
    };
    run();
    intervalRef.current = setInterval(run, 250);
  }

  const start = (mins: number, pledgeText: string, userId?: string) => {
    const total = Math.max(1, Math.min(180, mins));
    totalMinsRef.current = total;
    userIdRef.current = userId;
    const endTime = Date.now() + total * 60 * 1000;
    localStorage.setItem("lockin_end", String(endTime));
    localStorage.setItem("lockin_pledges", pledgeText);
    setPledges(pledgeText);
    setLocked(true);
    tick(endTime);
  };

  const stopEarly = () => {
    if (intervalRef.current) clearInterval(
