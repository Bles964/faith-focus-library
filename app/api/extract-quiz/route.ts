import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const MODELS = [
  "gemini-flash-lite-latest",
  "gemini-flash-latest",
  "gemini-2.5-flash",
];

const TOTAL_BUDGET_MS = 55000;
const PER_TRY_MS = 25000;
const MAX_CHARS = 60000;
const MAX_QUESTIONS = 30;

function parseJson(raw: string) {
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}

function clean(parsed: any) {
  const list = Array.isArray(parsed) ? parsed : parsed?.questions;
  if (!Array.isArray(list)) return null;
  const out: { question: string; options: string[]; answer: number; explanation: string }[] = [];
  for (const q of list) {
    if (!q || typeof q.question !== "string" || !Array.isArray(q.options)) continue;
    const options = q.options
      .map((o: any) => String(o).replace(/^\s*[A-Ea-e][.)]\s*/, "").trim())
      .filter(Boolean);
    if (options.length < 2) continue;
    const letter = String(q.answer ?? "").trim().toUpperCase().charAt(0);
    const idx = "ABCDE".indexOf(letter);
    if (idx < 0 || idx >= options.length) continue;
    out.push({
      question: q.question.trim(),
      options,
      answer: idx,
      explanation: typeof q.explanation === "string" ? q.explanation.trim() : "",
    });
    if (out.length >= MAX_QUESTIONS) break;
  }
  return out;
}

export async function POST(req: NextRequest) {
  const started = Date.now();

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const text = body?.text;
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server missing GEMINI_API_KEY" }, { status: 500 });
  }

  // MCQs usually sit near the end of a study guide, so keep the last part if the text is long
  const source = text.length > MAX_CHARS ? text.slice(text.length - MAX_CHARS) : text;

  const prompt = `The text below is a medical study guide. It may contain multiple-choice questions (MCQs) with options A to E, and the answers may appear right after each question or in a separate answer key near the end.

Your job is to EXTRACT the multiple-choice questions that already exist in the text. Do NOT invent, rewrite or add any questions. If there are no multiple-choice questions, return an empty list.

For each question return:
- "question": the question text only, without its number
- "options": an array of the option texts in order (A first), without the letter prefixes
- "answer": the single letter of the correct option, taken from the text's own answer or answer key
- "explanation": the short reason given in the text for the answer, or an empty string if none is given

Skip any question whose answer cannot be found in the text. Return at most ${MAX_QUESTIONS} questions.

Return ONLY valid JSON in this shape, with no markdown fences and no commentary:
{"questions":[{"question":"...","options":["...","..."],"answer":"C","explanation":"..."}]}

Source text:
"""
${source}
"""`;

  const failures: string[] = [];

  for (const model of MODELS) {
    const remaining = TOTAL_BUDGET_MS - (Date.now() - started);
    if (remaining < 5000) {
      failures.push(`${model}: skipped, out of time`);
      break;
    }
    const timeout = Math.min(PER_TRY_MS, remaining - 1000);

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json",
              maxOutputTokens: 8192,
            },
          }),
          signal: AbortSignal.timeout(timeout),
        }
      );

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        failures.push(`${model}: HTTP ${res.status} ${errText.slice(0, 120)}`);
        continue;
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

      let parsed: any;
      try {
        parsed = parseJson(rawText);
      } catch {
        failures.push(`${model}: returned invalid JSON`);
        continue;
      }

      const questions = clean(parsed);
      if (questions === null) {
        failures.push(`${model}: unexpected response shape`);
        continue;
      }

      return NextResponse.json({ questions });
    } catch (e: any) {
      const timedOut = e?.name === "TimeoutError" || e?.name === "AbortError";
      failures.push(`${model}: ${timedOut ? "timed out" : e?.message || "network error"}`);
    }
  }

  return NextResponse.json(
    { error: "All models failed. " + failures.join(" | ") },
    { status: 503 }
  );
}
