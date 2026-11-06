"use client";
// Save as: components/AccessGate.tsx   (replace the old one)
// Admin: never blocked. Others: free trial, then they must pay (bank transfer or Paystack).

import { useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabaseClient";
import { PLANS, BANK, PAYMENT_MODE } from "@/lib/plans";

type State =
  | { kind: "loading" }
  | { kind: "free" } // signed out, admin, or paid: show the app normally
  | { kind: "trial"; daysLeft: number }
  | { kind: "expired" };

type Supa = ReturnType<typeof createClient>;

const naira = (n: number) => "₦" + n.toLocaleString("en-NG");

/* ---------- Bank transfer: choose plan, see details, tell us you paid ---------- */
function TransferPanel({
  supabase,
  alreadyPending,
  onSubmitted,
}: {
  supabase: Supa;
  alreadyPending: boolean;
  onSubmitted: () => void;
}) {
  const [planId, setPlanId] = useState(PLANS[0].id);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const plan = PLANS.find((p) => p.id === planId) ?? PLANS[0];

  if (alreadyPending) {
    return (
      <div className="rounded-lg border border-gold/50 bg-gold/10 p-4 text-sm text-navy text-left">
        <p className="font-medium mb-1">We received your payment notice.</p>
        <p className="text-navy/70">
          We are checking it now. Your access will open on its own once it is confirmed. You can keep this page
          open.
        </p>
      </div>
    );
  }

  async function submit() {
    setMsg("");
    if (!name.trim()) {
      setMsg("Please type the name on the account you paid from.");
      return;
    }
    setBusy(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setBusy(false);
      setMsg("Please sign in again.");
      return;
    }
    const { error } = await supabase.from("payment_requests").insert({
      user_id: user.id,
      email: user.email,
      plan_id: plan.id,
      days: plan.days,
      amount_ngn: plan.amountNgn,
      payer_name: name.trim().slice(0, 80),
      note: note.trim() ? note.trim().slice(0, 200) : null,
    });
    if (error) {
      setBusy(false);
      setMsg(
        error.code === "23505"
          ? "You already have a payment waiting to be confirmed."
          : error.message || "Could not send your notice."
      );
      return;
    }
    // Tell the admin by email (does nothing if email is not set up)
    try {
      const { data: sess } = await supabase.auth.getSession();
      fetch("/api/notify-payment", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${sess.session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ planId: plan.id, payerName: name.trim() }),
      }).catch(() => {});
    } catch {}
    setBusy(false);
    onSubmitted();
  }

  return (
    <div className="text-left">
      <p className="text-sm font-medium text-navy mb-2">1. Choose a plan</p>
      <div className="flex flex-col gap-2 mb-5">
        {PLANS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPlanId(p.id)}
            className={`w-full rounded border px-4 py-3 text-sm text-left ${
              planId === p.id ? "bg-navy text-paper border-navy" : "bg-white text-navy border-navy/20"
            }`}
          >
            {p.label}: {naira(p.amountNgn)}
          </button>
        ))}
      </div>

      <p className="text-sm font-medium text-navy mb-2">2. Send {naira(plan.amountNgn)} to this account</p>
      <div className="rounded-lg border border-navy/15 bg-white p-4 mb-1 text-sm text-navy">
        <p className="text-navy/60 text-xs">Bank</p>
        <p className="font-medium mb-2">{BANK.bankName}</p>
        <p className="text-navy/60 text-xs">Account number</p>
        <p className="font-medium text-lg tracking-wide mb-1">{BANK.accountNumber}</p>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(BANK.accountNumber).then(() => setCopied(true)).catch(() => {});
          }}
          className="text-xs underline text-navy/70 mb-2"
        >
          {copied ? "Copied" : "Copy account number"}
        </button>
        <p className="text-navy/60 text-xs">Account name</p>
        <p className="font-medium">{BANK.accountName}</p>
      </div>
      <p className="text-xs text-navy/50 mb-5">Use any bank app. Put your email in the transfer note if you can.</p>

      <p className="text-sm font-medium text-navy mb-2">3. Tell us you have paid</p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name on the account you paid from"
        className="w-full border border-navy/20 rounded px-3 py-2 text-sm mb-2"
      />
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Transfer time or reference (optional)"
        className="w-full border border-navy/20 rounded px-3 py-2 text-sm mb-3"
      />
      <button
        onClick={submit}
        disabled={busy}
        className="w-full rounded bg-gold text-navy font-medium px-4 py-3 disabled:opacity-50"
      >
        {busy ? "Sending…" : "I have paid"}
      </button>
      {msg && <p className="text-sm text-red-600 mt-2">{msg}</p>}
    </div>
  );
}

/* ---------- The gate ---------- */
export default function AccessGate({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [state, setState] = useState<State>({ kind: "loading" });
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [showPay, setShowPay] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [myPending, setMyPending] = useState(false);
  const [adminPending, setAdminPending] = useState(0);

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

    if (p.is_admin) {
      const { count } = await supabase
        .from("payment_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      setAdminPending(count ?? 0);
      return { kind: "free" };
    }
    const now = Date.now();
    if (p.paid_until && new Date(p.paid_until).getTime() > now) return { kind: "free" };

    // Has this student already told us they paid?
    const { count: mine } = await supabase
      .from("payment_requests")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "pending");
    setMyPending((mine ?? 0) > 0);

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

      // Just came back from paying with Paystack: the confirmation can take a few seconds
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

  // Keep checking in the background: opens access by itself once you approve, and tells you about new notices
  useEffect(() => {
    if (state.kind === "loading") return;
    const t = setInterval(async () => {
      const s = await check();
      setState((prev) => (prev.kind === s.kind ? prev : s));
    }, 20000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.kind]);

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

  const paystackPlans = (
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

  const payPanel =
    PAYMENT_MODE === "transfer" ? (
      <TransferPanel supabase={supabase} alreadyPending={myPending} onSubmitted={() => setMyPending(true)} />
    ) : (
      paystackPlans
    );

  if (state.kind === "expired") {
    return (
      <div className="max-w-md mx-auto py-10 px-4 text-center">
        {confirming ? (
          <>
            <h1 className="font-serif text-2xl text-navy mb-2">Confirming your payment…</h1>
            <p className="text-sm text-navy/60">This usually takes a few seconds. Please keep this page open.</p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-2xl text-navy mb-2">Your free trial has ended</h1>
            <p className="text-sm text-navy/70 mb-6">
              Choose a plan to get back into the library.
              {PAYMENT_MODE === "transfer" ? " Your access opens as soon as we confirm your transfer." : ""}
            </p>
            {payPanel}
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
      {adminPending > 0 && (
        <div className="bg-gold border-b border-gold px-4 py-2 text-center text-sm text-navy font-medium">
          {adminPending} {adminPending === 1 ? "payment is" : "payments are"} waiting for you.{" "}
          <a href="/admin/payments" className="underline">
            Review now
          </a>
        </div>
      )}
      {state.kind === "trial" && (
        <div className="bg-gold/20 border-b border-gold/40 px-4 py-2 text-center text-xs text-navy">
          Free trial: {state.daysLeft} {state.daysLeft === 1 ? "day" : "days"} left.{" "}
          <button onClick={() => setShowPay((v) => !v)} className="underline font-medium">
            {showPay ? "Hide plans" : "Subscribe now"}
          </button>
          {showPay && <div className="max-w-sm mx-auto mt-3 text-left">{payPanel}</div>}
        </div>
      )}
      {children}
    </>
  );
}
