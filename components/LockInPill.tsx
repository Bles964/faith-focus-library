"use client";

import { useLockIn } from "./LockInProvider";

const NAVY_DEEP = "#081729";
const GOLD = "#D4AF37";
const GOLD_SOFT = "#E8C766";
const PAPER = "#F4F1EA";

const fmt = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

export default function LockInPill() {
  const { locked, remaining, stopEarly } = useLockIn();
  if (!locked) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 16,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        background: NAVY_DEEP,
        border: `1px solid ${GOLD}55`,
        borderRadius: 999,
        padding: "8px 10px 8px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow: "0 6px 20px rgba(0,0,0,.35)",
        fontFamily: "Inter, system-ui, sans-serif",
        color: PAPER,
      }}
    >
      <span style={{ color: GOLD_SOFT, fontSize: ".78rem" }}>Locked in</span>
      <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600, fontSize: "1rem" }}>
        {fmt(remaining)}
      </span>
      <button
        onClick={stopEarly}
        style={{
          background: "transparent",
          border: `1px solid ${GOLD}44`,
          color: PAPER,
          borderRadius: 999,
          padding: "5px 12px",
          fontSize: ".75rem",
          cursor: "pointer",
        }}
      >
        End
      </button>
    </div>
  );
}
