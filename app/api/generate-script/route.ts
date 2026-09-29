import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const MODELS = [
  "gemini-flash-lite-latest",
  "gemini-flash-latest",
  "gemini-2.5-flash",
];

const TOTAL_BUDGET_MS = 55000;
const PER_TRY_MS = 20000;

function extractJson(raw: string) {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
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

  const prompt = `You are helping a medical student turn her clinical study notes into a short narrated teaching video, in the style of a whiteboard animation.

Here is an example of the tone to match, from an existing osteoarthritis script:

1. "Healthy joint" — "Osteoarthritis isn't just wear and tear. It's a disease of the whole joint, a battle between destruction and repair. Here's a healthy synovial joint. Smooth articular cartilage cushions the bone ends, wrapped in a capsule lined by synovium."
2. "Cartilage roughening" — "Mechanical stress or biochemical change injures the cartilage. The cells that maintain it, chondrocytes, get damaged and release enzymes that break the cartilage down further."

Now do the same for the source text below. Break it into a sequence of stages suitable for a short narrated animation. Each stage needs:
- "label": 2-5 words, naming that stage
- "narration": 1-3 sentences, spoken clinical tone, no markdown or bullet points
- "visual": a simple diagram spec that a program will draw for that stage

Choose the visual type that best fits each stage:
- "flow": a sequence or pathway. Example: {"type":"flow","items":["Trigger","Cell damage","Inflammation"]} with 3 to 5 items
- "cycle": a repeating loop. Example: {"type":"cycle","items":["Desire","Arousal","Orgasm","Resolution"]} with 3 to 6 items
- "compare": two things contrasted. Example: {"type":"compare","columns":[{"title":"Type 1","items":["Autoimmune","Young onset"]},{"title":"Type 2","items":["Insulin resistance","Adult onset"]}]} with exactly two columns of 2 or 3 items
- "venn": three interacting factors. Example: {"type":"venn","items":["Biological","Psychological","Social"],"center":"Illness"} with exactly three items
- "list": key points. Example: {"type":"list","items":["Point one","Point two","Point three"]} with 3 to 5 items

Every item and title must be very short: at most 4 words, about 24 characters. Use plain words only, no quotation marks. Vary the visual types across stages where the content allows.

Use as many stages as the content naturally supports, typically 4 to 7. Do not pad it out or force a fixed count.

Return ONLY valid JSON: an object with a "stages" key containing an array of objects, each with "label", "narration" and "visual". No markdown fences, no commentary, just the JSON.

Source text:
"""
${text.slice(0, 14000)}
"""`;

  const failures: string[] = [];

  for (const model of MODELS) {
    const remaining = TOTAL_BUDGET_MS - (Date.now() - started);
    if (remaining < 4000) {
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
              maxOutputTokens: 4096,
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
        parsed = extractJson(rawText);
      } catch {
        failures.push(`${model}: returned invalid JSON`);
        continue;
      }

      const stages = Array.isArray(parsed)
        ? parsed
        : parsed?.stages ?? Object.values(parsed ?? {})[0];

      if (!Array.isArray(stages) || stages.length === 0) {
        failures.push(`${model}: no stages in response`);
        continue;
      }

      return NextResponse.json({ stages });
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
