import { NextRequest, NextResponse } from "next/server";
import { EdgeTTS } from "edge-tts-universal";

export const runtime = "nodejs";
export const maxDuration = 60;

async function synth(text: string, voice: string) {
  const tts = new EdgeTTS(text, voice);
  const result = await tts.synthesize();

  const audioData: any = result.audio;
  const arrayBuffer =
    typeof audioData.arrayBuffer === "function"
      ? await audioData.arrayBuffer()
      : audioData;

  return arrayBuffer;
}

// Open /api/narrate-free in a browser to test the voice. It plays a short sentence,
// or shows the exact error if the voice service is not working.
export async function GET(req: NextRequest) {
  const text =
    new URL(req.url).searchParams.get("text") || "Testing the voice. One, two, three.";
  try {
    const arrayBuffer = await synth(text.slice(0, 300), "en-US-AriaNeural");
    return new NextResponse(arrayBuffer, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "TTS failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { text, voice } = body ?? {};
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  let lastErr = "TTS failed";
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const arrayBuffer = await synth(text, voice || "en-US-AriaNeural");
      return new NextResponse(arrayBuffer, {
        headers: { "Content-Type": "audio/mpeg" },
      });
    } catch (e: any) {
      lastErr = e?.message || "TTS failed";
    }
  }

  return NextResponse.json({ error: lastErr }, { status: 500 });
}
