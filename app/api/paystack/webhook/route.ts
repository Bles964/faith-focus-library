// Save as: app/api/paystack/webhook/route.ts
import crypto from "crypto";
import { NextResponse } from "next/server";
import { PLANS } from "@/lib/plans";

export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

export async function POST(req: Request) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !service) return NextResponse.json({ error: "Server not set up." }, { status: 500 });

  // 1) Make sure this really came from Paystack
  const raw = await req.text();
  const sig = req.headers.get("x-paystack-signature") || "";
  const expected = crypto.createHmac("sha512", secret).update(raw).digest("hex");
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
    return NextResponse.json({ error: "Bad signature." }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad body." }, { status: 400 });
  }
  if (event?.event !== "charge.success") return NextResponse.json({ ok: true });

  const reference: string = event.data?.reference;
  if (!reference) return NextResponse.json({ ok: true });

  // 2) Double-check the payment with Paystack itself
  const vRes = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const v = await vRes.json();
  if (!vRes.ok || !v?.status || v.data?.status !== "success") return NextResponse.json({ ok: true });

  const meta = v.data.metadata || {};
  const plan = PLANS.find((p) => p.id === meta.plan_id);
  const userId: string | undefined = meta.user_id;
  if (!plan || !userId) return NextResponse.json({ ok: true });

  // The amount must match the plan price (stops someone paying less)
  if (v.data.currency !== "NGN" || Number(v.data.amount) < plan.amountNgn * 100) {
    return NextResponse.json({ ok: true });
  }

  // 3) Give the student access (safe if Paystack sends the same event twice)
  const email: string = v.data.customer?.email ?? "";
  const rpc = await fetch(`${SUPABASE_URL}/rest/v1/rpc/grant_access`, {
    method: "POST",
    headers: {
      apikey: service,
      // New-style secret keys (sb_secret_...) go in "apikey" only; the old service_role key is also sent as a Bearer token
      ...(service.startsWith("sb_") ? {} : { Authorization: `Bearer ${service}` }),
      "content-type": "application/json",
    },
    body: JSON.stringify({
      p_user: userId,
      p_email: email,
      p_reference: reference,
      p_amount: Number(v.data.amount),
      p_days: plan.days,
    }),
  });
  if (!rpc.ok) {
    // Tell Paystack to try again later
    return NextResponse.json({ error: "Could not save access." }, { status: 500 });
  }
  const isNew = await rpc.json();

  // 4) Notify you by email (optional: only if RESEND_API_KEY and ADMIN_NOTIFY_EMAIL are set)
  if (isNew === true && process.env.RESEND_API_KEY && process.env.ADMIN_NOTIFY_EMAIL) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({
          from: "Faith and Focus Library <onboarding@resend.dev>",
          to: [process.env.ADMIN_NOTIFY_EMAIL],
          subject: `Payment received: ${email}`,
          text: `${email} paid NGN ${Number(v.data.amount) / 100} for ${plan.label}. Their access is now open. Reference: ${reference}`,
        }),
      });
    } catch {}
  }

  return NextResponse.json({ ok: true });
}
