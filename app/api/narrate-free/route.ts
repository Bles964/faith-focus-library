import { NextRequest, NextResponse } from "next/server";
import { EdgeTTS } from "edge-tts-universal";

export const runtime = "nodejs";
export const maxDuration = 60;

const DEFAULT_VOICE = "en-US-AriaNeural";
const TIMEOUT_MS = 15000;

async function synth(text: string, voice: string): Promise<ArrayBuffer> {
  const tts = new EdgeTTS(text, voice);

  const result = await Promise.race([
    tts.synthesize(),
    new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error("Voice service timed out after 15 seconds")),
        TIMEOUT_MS
      );
    }),
  ]);

  if (!result?.audio) {
    throw new Error("Voice service returned no audio");
  }

  const arrayBuffer = await result.audio.arrayBuffer();

  if (arrayBuffer.byteLength === 0) {
    throw new Error("Voice service returned empty audio");
  }

  return arrayBuffer;
}

function errorResponse(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Voice generation failed";

  return NextResponse.json(
    { error: message },
    {
      status: 500,
      headers: { "Cache-Control": "no-store" },
    }
  );
}

// GET: Test the voice service in your browser.
export async function GET(req: NextRequest) {
  const text =
    new URL(req.url).searchParams.get("text") ||
    "Testing the voice. One, two, three.";

  try {
    const audio = await synth(text.slice(0, 300), DEFAULT_VOICE);

    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audio.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

// POST: Generate narration for the PDF reader and videos.
export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { text, voice } = (body ?? {}) as {
    text?: string;
    voice?: string;
  };

  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json(
      { error: "Missing text to narrate" },
      { status: 400 }
    );
  }

  if (text.length > 10000) {
    return NextResponse.json(
      { error: "Text is too long. Please narrate a smaller section." },
      { status: 413 }
    );
  }

  try {
    const audio = await synth(
      text,
      typeof voice === "string" && voice.trim()
        ? voice
        : DEFAULT_VOICE
    );

    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audio.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
