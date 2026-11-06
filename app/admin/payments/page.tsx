"use client";
// Save as: app/admin/payments/page.tsx   (only you, the admin, can see it)
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

type Payment = { id: string; email: string | null; reference: string; amount_kobo: number | null; days: number | null; paid_at: string };

export default function PaymentsPage() {
  const supabase = createClient();
  const [rows, setRows] = useState<Payment[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return setIsAdmin(false);
      const { data: p } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
      if (!p?.is_admin) return setIsAdmin(false);
      setIsAdmin(true);
      const { data } = await supabase
        .from("payments")
        .select("id,email,reference,amount_kobo,days,paid_at")
        .order("paid_at", { ascending: false })
        .limit(200);
      setRows((data as Payment[]) ?? []);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isAdmin === null) return <p className="text-sm text-navy/50">Loading…</p>;
  if (!isAdmin) return <p className="text-navy/70">This page is for the admin only.</p>;

  const total = rows.reduce((n, r) => n + (r.amount_kobo ?? 0), 0) / 100;

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="font-serif text-2xl text-navy mb-1">Payments</h1>
      <p className="text-sm text-navy/60 mb-4">
        {rows.length} {rows.length === 1 ? "payment" : "payments"} · ₦{total.toLocaleString("en-NG")} in total
      </p>
      {rows.length === 0 ? (
        <p className="text-sm text-navy/50">No payments yet.</p>
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
