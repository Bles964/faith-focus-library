"use client";
// Save as: app/admin/payments/page.tsx   (replace the old one; only you, the admin, can use it)
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { PLANS } from "@/lib/plans";

type Req = {
  id: string;
  email: string | null;
  plan_id: string;
  days: number;
  amount_ngn: number;
  payer_name: string;
  note: string | null;
  created_at: string;
};
type Payment = { id: string; email: string | null; reference: string; amount_kobo: number | null; days: number | null; paid_at: string };

export default function PaymentsPage() {
  const supabase = createClient();
  const [pending, setPending] = useState<Req[]>([]);
  const [rows, setRows] = useState<Payment[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  async function load() {
    const { data: r } = await supabase
      .from("payment_requests")
      .select("id,email,plan_id,days,amount_ngn,payer_name,note,created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    setPending((r as Req[]) ?? []);
    const { data } = await supabase
      .from("payments")
      .select("id,email,reference,amount_kobo,days,paid_at")
      .order("paid_at", { ascending: false })
      .limit(200);
    setRows((data as Payment[]) ?? []);
  }

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return setIsAdmin(false);
      const { data: p } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
      if (!p?.is_admin) return setIsAdmin(false);
      setIsAdmin(true);
      await load();
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function decide(r: Req, approve: boolean) {
    const text = approve
      ? `Approve ${r.email}? Only do this after you see ₦${r.amount_ngn.toLocaleString("en-NG")} in your bank app.`
      : `Reject the notice from ${r.email}?`;
    if (!window.confirm(text)) return;
    setBusyId(r.id);
    setMsg("");
    const { error } = await supabase.rpc(approve ? "approve_payment_request" : "reject_payment_request", {
      p_id: r.id,
    });
    setBusyId(null);
    if (error) return setMsg(error.message || "Something went wrong.");
    await load();
  }

  if (isAdmin === null) return <p className="text-sm text-navy/50">Loading…</p>;
  if (!isAdmin) return <p className="text-navy/70">This page is for the admin only.</p>;

  const total = rows.reduce((n, r) => n + (r.amount_kobo ?? 0), 0) / 100;

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="font-serif text-2xl text-navy mb-4">Payments</h1>

      <h2 className="font-serif text-lg text-navy mb-2">Waiting for you ({pending.length})</h2>
      {msg && <p className="text-sm text-red-600 mb-2">{msg}</p>}
      {pending.length === 0 ? (
        <p className="text-sm text-navy/50 mb-6">Nothing waiting.</p>
      ) : (
        <div className="space-y-3 mb-8">
          {pending.map((r) => (
            <div key={r.id} className="border border-gold/60 bg-gold/10 rounded-lg p-4 text-sm">
              <p className="text-navy font-medium break-all">{r.email}</p>
              <p className="text-navy mt-1">
                ₦{r.amount_ngn.toLocaleString("en-NG")} for {PLANS.find((p) => p.id === r.plan_id)?.label ?? `${r.days} days`}
              </p>
              <p className="text-navy/70 mt-1">Paid from: {r.payer_name}</p>
              {r.note && <p className="text-navy/70">Note: {r.note}</p>}
              <p className="text-xs text-navy/50 mt-1">{new Date(r.created_at).toLocaleString("en-NG")}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => decide(r, true)}
                  disabled={busyId === r.id}
                  className="flex-1 rounded bg-navy text-paper py-2 disabled:opacity-50"
                >
                  {busyId === r.id ? "Working…" : "Approve"}
                </button>
                <button
                  onClick={() => decide(r, false)}
                  disabled={busyId === r.id}
                  className="rounded border border-navy/30 text-navy/70 px-4 py-2 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="font-serif text-lg text-navy mb-1">Confirmed payments</h2>
      <p className="text-sm text-navy/60 mb-3">
        {rows.length} {rows.length === 1 ? "payment" : "payments"} · ₦{total.toLocaleString("en-NG")} in total
      </p>
      {rows.length === 0 ? (
        <p className="text-sm text-navy/50">No confirmed payments yet.</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="border border-navy/15 rounded-lg bg-white p-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-navy font-medium break-all">{r.email ?? "Unknown"}</span>
                <span className="text-navy shrink-0">₦{((r.amount_kobo ?? 0) / 100).toLocaleString("en-NG")}</span>
              </div>
              <p className="text-xs text-navy/60 mt-1">
                {new Date(r.paid_at).toLocaleString("en-NG")} · {r.days} days of access
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
