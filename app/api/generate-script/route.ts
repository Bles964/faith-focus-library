import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server missing GEMINI_API_KEY" }, { status: 500 });
  }

  const prompt = `You are helping a medical student turn her clinical study notes into a short narrated teaching video script, in the style of a whiteboard animation.

Here is an example of the tone and structure to match, from an existing osteoarthritis script:

1. "Healthy joint" — "Osteoarthritis isn't just wear and tear. It's a disease of the whole joint, a battle between destruction and repair. Here's a healthy synovial joint. Smooth articular cartilage cushions the bone ends, wrapped in a capsule lined by synovium."
2. "Cartilage roughening" — "Mechanical stress or biochemical change injures the cartilage. The cells that maintain it, chondrocytes, get damaged and release enzymes that break the cartilage down further."

Now do the same for the source text below. Break it into a sequence of stages suitable for a short narrated animation. Each stage needs:
- "label": 2-5 words, naming that stage
- "narration": 1-3 sentences, spoken clinical tone, no markdown or bullet points

Use as many stages as the content naturally supports — typically 4 to 7 — don't pad it out or force a fixed count.

Return ONLY valid JSON: an object with a "stages" key containing an array of objects, each with "label" and "narration". No markdown fences, no commentary, just the JSON.

Source text:
"""
${text}
"""`;

  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
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
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  const data = await res.json();
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
