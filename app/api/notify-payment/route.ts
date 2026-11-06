// Save as: app/api/notify-payment/route.ts
// Emails you when a student says they have paid. Optional: does nothing unless
// RESEND_API_KEY and ADMIN_NOTIFY_EMAIL are set in Vercel.
import { NextResponse } from "next/server";
import { PLANS } from "@/lib/plans";

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/+$/, "");
const SUPABASE_ANON = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

export async function POST(req: Request) {
  try {
    const key = (process.env.RESEND_API_KEY || "").trim();
    const to = (process.env.ADMIN_NOTIFY_EMAIL || "").trim();
    if (!key || !to) return NextResponse.json({ ok: true, emailed: false });

    const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
    if (!token) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` },
    });
    if (!userRes.ok) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
    const user = await userRes.json();

    const { planId, payerName } = await req.json();
    const plan = PLANS.find((p) => p.id === planId);
    const clean = (v: unknown) => String(v ?? "").replace(/[\r\n]+/g, " ").slice(0, 80);

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: "Faith and Focus Library <onboarding@resend.dev>",
        to: [to],
        subject: `Payment notice: ${clean(user.email)}`,
        text: `${clean(user.email)} says they paid NGN ${plan?.amountNgn ?? "?"} for ${plan?.label ?? "a plan"}. Name on the account: ${clean(payerName)}. Check your bank app, then open the site and go to /admin/payments to approve.`,
      }),
    });
    return NextResponse.json({ ok: true, emailed: true });
  } catch (e: any) {
    return NextResponse.json({ ok: true, emailed: false });
  }
}
