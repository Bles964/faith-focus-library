import { NextRequest, NextResponse } from "next/server";
import { EdgeTTS } from "edge-tts-universal";
export const runtime = "nodejs";
export const maxDuration = 60;
const DEFAULT_VOICE = "en-US-AriaNeural";
const MAX_TEXT_LENGTH = 12000;
const CHUNK_CHARS = 700;
const TOTAL_BUDGET_MS = 50000;
const CHUNK_TIMEOUT_MS = 12000;
function splitText(text: string, maxLength: number): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  const chunks: string[] = [];
  let remaining = normalized;
  while (remaining.length > maxLength) {
    let cut = remaining.lastIndexOf(". ", maxLength);
    if (cut < maxLength * 0.4) cut = remaining.lastIndexOf("? ", maxLength);
    if (cut < maxLength * 0.4) cut = remaining.lastIndexOf("! ", maxLength);
    if (cut < maxLength * 0.4) cut = remaining.lastIndexOf(", ", maxLength);
    if (cut < maxLength * 0.4) cut = remaining.lastIndexOf(" ", maxLength);
    if (cut < 1) cut = maxLength;
    chunks.push(remaining.slice(0, cut + 1).trim());
    remaining = remaining.slice(cut + 1).trim();
  }
  if (remaining) chunks.push(remaining);
  return chunks;
}
function withTimeout<T>(
  promise: Promise<T>,
  milliseconds: number,
  label: string
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${milliseconds} ms`));
    }, milliseconds);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}
function getAudioBuffer(audio: any): Promise<Buffer> | Buffer {
  if (Buffer.isBuffer(audio)) return audio;
  if (audio instanceof Uint8Array) {
    return Buffer.from(audio);
  }
  if (audio && typeof audio.arrayBuffer === "function") {
    return audio.arrayBuffer().then((data: ArrayBuffer) =>
      Buffer.from(data)
    );
  }
  if (audio instanceof ArrayBuffer) {
    return Buffer.from(audio);
  }
  throw new Error("The voice service returned an unsupported audio format.");
}
async function generateSpeech(
  text: string,
  requestedVoice?: string
): Promise<Buffer> {
  const voice =
    requestedVoice &&
    /^[a-z]{2}-[A-Z]{2}-[A-Za-z]+Neural$/.test(requestedVoice)
      ? requestedVoice
      : DEFAULT_VOICE;
  const chunks = splitText(text, CHUNK_CHARS);
  if (!chunks.length) {
    throw new Error("The narration text is empty.");
  }
  const deadline = Date.now() + TOTAL_BUDGET_MS;
  const audioParts: Buffer[] = [];
  for (let index = 0; index < chunks.length; index++) {
    const remainingTime = deadline - Date.now();
    if (remainingTime < 1000) {
      throw new Error(
        `Voice generation exceeded its time limit at section ${index + 1} of ${chunks.length}. Try a shorter narration.`
      );
    }
    const timeout = Math.min(CHUNK_TIMEOUT_MS, remainingTime - 250);
    try {
      const tts = new EdgeTTS(chunks[index], voice);
      const result = await withTimeout(
        tts.synthesize(),
        timeout,
        `Voice generation, section ${index + 1} of ${chunks.length}`
      );
      const audio = await getAudioBuffer(result.audio);
      if (!audio.length) {
        throw new Error("The voice service returned empty audio.");
      }
      audioParts.push(audio);
    } catch (error: any) {
      const message =
        error?.message || "Unknown text-to-speech error";
      throw new Error(
        `Microsoft voice failed at section ${index + 1} of ${chunks.length}: ${message}`
      );
    }
  }
  // Edge TTS produces MP3 audio. Concatenate the MP3 streams for delivery.
  const combined = Buffer.concat(audioParts);
  if (!combined.length) {
    throw new Error("No audio was generated.");
  }
  return combined;
}
async function handleSpeech(
  text: string,
  voice?: string
): Promise<NextResponse> {
  if (!text.trim()) {
    return NextResponse.json(
      { error: "Please provide narration text." },
      { status: 400 }
    );
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      {
        error: `Narration is too long (${text.length} characters). Please keep it below ${MAX_TEXT_LENGTH} characters per request.`,
      },
      { status: 413 }
    );
  }
  try {
    const audio = await generateSpeech(text, voice);
    return new NextResponse(new Uint8Array(audio), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audio.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (error: any) {
    const message = error?.message || "Voice generation failed.";
    console.error("[narrate-free]", message);
    return NextResponse.json(
      {
        error: message,
        hint: "Check the server logs and network connection. You can retry the narration.",
      },
      { status: 502 }
    );
  }
}
export async function GET(req: NextRequest) {
  const text =
    new URL(req.url).searchParams.get("text") ||
    "Testing the computer voice. One, two, three. This is Faith and Focus Academy.";
  return handleSpeech(text.slice(0, 600));
}
export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }
  const text = body?.text;
  const voice = body?.voice;
  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json(
      { error: "Missing narration text." },
      { status: 400 }
    );
  }
  return handleSpeech(text, voice);
}
