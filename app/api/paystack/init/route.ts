// Save as: app/api/paystack/init/route.ts
import { NextResponse } from "next/server";
import { PLANS } from "@/lib/plans";

// .trim() removes stray spaces or line breaks that can sneak in when a key is pasted into Vercel
const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/+$/, "");
const SUPABASE_ANON = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

export async function POST(req: Request) {
  try {
    const secret = (process.env.PAYSTACK_SECRET_KEY || "").trim();
    if (!secret) return NextResponse.json({ error: "PAYSTACK_SECRET_KEY is not set." }, { status: 500 });

    const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
    if (!token) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

    // Who is paying
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` },
    });
    if (!userRes.ok) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
    const user = await userRes.json();

    const { planId } = await req.json();
    const plan = PLANS.find((p) => p.id === planId);
    if (!plan) return NextResponse.json({ error: "Unknown plan." }, { status: 400 });

    const origin = new URL(req.url).origin;
    const reference = `ff_${String(user.id).slice(0, 8)}_${Date.now()}`;

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "content-type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        amount: plan.amountNgn * 100, // Paystack counts in kobo
        currency: "NGN",
        reference,
        callback_url: `${origin}/?paid=1`,
        metadata: { user_id: user.id, plan_id: plan.id },
      }),
    });
    const data = await res.json();
    if (!res.ok || !data?.status) {
      return NextResponse.json({ error: data?.message || "Could not start the payment." }, { status: 502 });
    }
    return NextResponse.json({ url: data.data.authorization_url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Something went wrong." }, { status: 500 });
  }
}
