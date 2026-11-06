"use client";
// Save as: components/AccessGate.tsx
// Wrap your whole app with it (see layout.tsx): <AccessGate>{children}</AccessGate>
// Admin: never blocked. Others: free trial, then they must pay.

import { useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabaseClient";
import { PLANS } from "@/lib/plans";

type State =
  | { kind: "loading" }
  | { kind: "free" } // signed out, admin, or paid: show the app normally
  | { kind: "trial"; daysLeft: number }
  | { kind: "expired" };

const naira = (n: number) => "₦" + n.toLocaleString("en-NG");

export default function AccessGate({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [showPay, setShowPay] = useState(false);
  const [confirming, setConfirming] = useState(false);

  async function check(): Promise<State> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { kind: "free" };

    const { data: p, error } = await supabase
      .from("profiles")
      .select("is_admin,trial_ends_at,paid_until")
      .eq("id", user.id)
      .single();
    // If the profile can't be read, don't lock anyone out by mistake (the database still protects the files)
    if (error || !p) return { kind: "free" };

    if (p.is_admin) return { kind: "free" };
    const now = Date.now();
    if (p.paid_until && new Date(p.paid_until).getTime() > now) return { kind: "free" };
    if (p.trial_ends_at) {
      const end = new Date(p.trial_ends_at).getTime();
      if (end > now) return { kind: "trial", daysLeft: Math.ceil((end - now) / 86400000) };
    }
    return { kind: "expired" };
  }

  useEffect(() => {
    let stop = false;
    async function run() {
      const s = await check();
      if (stop) return;
      setState(s);

      // Just came back from paying: the confirmation can take a few seconds
      const justPaid =
        typeof window !== "undefined" && new URLSearchParams(window.location.search).get("paid") === "1";
      if (justPaid && s.kind === "expired") {
        setConfirming(true);
        for (let i = 0; i < 15 && !stop; i++) {
          await new Promise((r) => setTimeout(r, 3000));
          const again = await check();
          if (again.kind !== "expired") {
            setState(again);
            setConfirming(false);
            return;
          }
        }
        setConfirming(false);
      }
    }
    run();
    return () => {
      stop = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function pay(planId: string) {
    setMsg("");
    setBusy(planId);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const res = await fetch("/api/paystack/init", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${sess.session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ planId }),
      });
      const out = await res.json();
      if (!res.ok || !out.url) throw new Error(out.error || "Could not start the payment.");
      window.location.href = out.url;
    } catch (e: any) {
      setMsg(e?.message ?? "Something went wrong.");
      setBusy(null);
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const plans = (
    <div className="flex flex-col gap-2">
      {PLANS.map((p) => (
        <button
          key={p.id}
          onClick={() => pay(p.id)}
          disabled={busy !== null}
          className="w-full rounded bg-gold text-navy font-medium px-4 py-3 disabled:opacity-50"
        >
          {busy === p.id ? "Opening payment…" : `${p.label}: ${naira(p.amountNgn)}`}
        </button>
      ))}
      {msg && <p className="text-sm text-red-600">{msg}</p>}
    </div>
  );

  if (state.kind === "expired") {
    return (
      <div className="max-w-md mx-auto py-14 px-4 text-center">
        {confirming ? (
          <>
            <h1 className="font-serif text-2xl text-navy mb-2">Confirming your payment…</h1>
            <p className="text-sm text-navy/60">
              This usually takes a few seconds. Please keep this page open.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-2xl text-navy mb-2">Your free trial has ended</h1>
            <p className="text-sm text-navy/70 mb-6">
              Choose a plan to get back into the library. Your access opens as soon as the payment goes through.
            </p>
            {plans}
            <button onClick={signOut} className="mt-6 text-xs text-navy/50 underline">
              Sign out
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      {state.kind === "trial" && (
        <div className="bg-gold/20 border-b border-gold/40 px-4 py-2 text-center text-xs text-navy">
          Free trial: {state.daysLeft} {state.daysLeft === 1 ? "day" : "days"} left.{" "}
          <button onClick={() => setShowPay((v) => !v)} className="underline font-medium">
            {showPay ? "Hide plans" : "Subscribe now"}
          </button>
          {showPay && <div className="max-w-xs mx-auto mt-3">{plans}</div>}
        </div>
      )}
      {children}
    </>
  );
}
