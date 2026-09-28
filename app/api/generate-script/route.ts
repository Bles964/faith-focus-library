import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { text } = await req.json();
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
${text}
"""`;

  const MODELS = ["gemini-flash-latest", "gemini-2.5-flash", "gemini-2.5-flash-lite"];

  async function callGemini(model: string) {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey as string,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );
    return r;
  }

  let data: any = null;
  let lastError = "";
  outer: for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const r = await callGemini(model);
      if (r.ok) {
        data = await r.json();
        break outer;
      }
      lastError = await r.text();
      // Model name not available: skip straight to the next model
      if (r.status === 404 || r.status === 400) break;
      // Busy or rate limited: wait a moment, then try again
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }

  if (!data) {
    return NextResponse.json(
      { error: "Google's free AI is busy right now. Wait a minute and try again. " + lastError },
      { status: 503 }
    );
  }

  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return NextResponse.json(
      { error: "Model didn't return valid JSON", raw: rawText },
      { status: 500 }
    );
  }

  const stages = Array.isArray(parsed) ? parsed : parsed.stages ?? Object.values(parsed)[0];

  return NextResponse.json({ stages });
}
