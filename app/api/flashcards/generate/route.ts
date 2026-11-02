// Save as: app/api/flashcards/generate/route.ts
// Needs ANTHROPIC_API_KEY set in Vercel (Settings > Environment Variables).
import { NextResponse } from "next/server";

export const maxDuration = 60;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(req: Request) {
  try {
    const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
    if (!token) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    if (!process.env.ANTHROPIC_API_KEY)
      return NextResponse.json({ error: "ANTHROPIC_API_KEY is not set in Vercel." }, { status: 500 });

    const authHeaders = { apikey: SUPABASE_ANON, Authorization: `Bearer ${token}` };

    // Who is asking?
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: authHeaders });
    if (!userRes.ok) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
    const user = await userRes.json();

    // Only the admin can generate
    const profRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=is_admin`, {
      headers: authHeaders,
    });
    const prof = await profRes.json();
    if (!prof?.[0]?.is_admin) return NextResponse.json({ error: "Admin only." }, { status: 403 });

    const { documentId, text, replace } = await req.json();
    if (!documentId || !text || String(text).trim().length < 200)
      return NextResponse.json({ error: "Could not read enough text from this PDF." }, { status: 400 });

    const source = String(text).slice(0, 60000);

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 3000,
        messages: [
          {
            role: "user",
            content:
              "You are making flashcards for final-year medical students preparing for MBBS, USMLE and OSCE exams. " +
              "From the study material below, write up to 25 flashcards covering the most exam-relevant facts. " +
              "Each card has a short, clear question and a concise answer (one to three sentences). " +
              "Use only what is in the material. Do not invent facts. " +
              'Reply with ONLY a JSON array like [{"q":"...","a":"..."}] and nothing else.\n\nMATERIAL:\n' +
              source,
          },
        ],
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      return NextResponse.json({ error: "AI request failed: " + t.slice(0, 200) }, { status: 502 });
    }
    const ai = await aiRes.json();
    const raw: string = (ai.content || []).map((c: any) => c.text || "").join("");
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const start = cleaned.indexOf("[");
    const end = cleaned.lastIndexOf("]");
    let cards: { q: string; a: string }[] = [];
    try {
      cards = JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      return NextResponse.json({ error: "The AI reply could not be read. Try again." }, { status: 502 });
    }
    cards = cards.filter((c) => c && c.q && c.a).slice(0, 40);
    if (cards.length === 0) return NextResponse.json({ error: "No cards were produced." }, { status: 502 });

    if (replace) {
      await fetch(`${SUPABASE_URL}/rest/v1/flashcards?document_id=eq.${documentId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
    }

    const insRes = await fetch(`${SUPABASE_URL}/rest/v1/flashcards`, {
      method: "POST",
      headers: { ...authHeaders, "content-type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(cards.map((c) => ({ document_id: documentId, question: c.q, answer: c.a }))),
    });
    if (!insRes.ok) {
      const t = await insRes.text();
      return NextResponse.json({ error: "Could not save the cards: " + t.slice(0, 200) }, { status: 500 });
    }
    return NextResponse.json({ count: cards.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Something went wrong." }, { status: 500 });
  }
}
