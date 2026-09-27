import { NextRequest, NextResponse } from "next/server";
import { EdgeTTS } from "edge-tts-universal";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { text, voice } = await req.json();
  if (!text || typeof text !== "string") {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  try {
    const tts = new EdgeTTS(text, voice || "en-US-AriaNeural");
    const result = await tts.synthesize();

    const audioData: any = result.audio;
    const arrayBuffer =
      typeof audioData.arrayBuffer === "function"
        ? await audioData.arrayBuffer()
        : audioData;

    return new NextResponse(arrayBuffer, {
      headers: { "Content-Type": "audio/mpeg" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "TTS failed" }, { status: 500 });
  }
}
