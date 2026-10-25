import { NextRequest, NextResponse } from "next/server";
import { EdgeTTS } from "edge-tts-universal";

export const runtime = "nodejs";
export const maxDuration = 60;

// Google's speech models, tried in order. Names can change, so a second one is listed.
const GEMINI_TTS_MODELS = ["gemini-3.1-flash-tts-preview", "gemini-2.5-flash-preview-tts"];
const GEMINI_VOICES = ["Kore", "Puck", "Charon", "Fenrir", "Aoede", "Leda", "Zephyr"];

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)} seconds`)), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

// Google returns raw audio, so wrap it as a WAV file that browsers and ffmpeg can play
function pcmToWav(pcm: Buffer, sampleRate: number): Buffer {
  const channels = 1;
  const bits = 16;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE((sampleRate * channels * bits) / 8, 28);
  header.writeUInt16LE((channels * bits) / 8, 32);
  header.writeUInt16LE(bits, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

async function geminiSpeech(text: string, voice: string | undefined, errors: string[]): Promise<Buffer | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    errors.push("Google voice: GEMINI_API_KEY is missing");
    return null;
  }
  const voiceName = voice && GEMINI_VOICES.includes(voice) ? voice : "Kore";

  for (const model of GEMINI_TTS_MODELS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-goog-api-key": apiKey },
          body: JSON.stringify({
            contents: [{ parts: [{ text }] }],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
            },
          }),
          signal: AbortSignal.timeout(35000),
        }
      );
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        errors.push(`${model}: HTTP ${res.status} ${t.slice(0, 80)}`);
        continue;
      }
      const data = await res.json();
      const part = data?.candidates?.[0]?.content?.parts?.find((p: any) => p?.inlineData?.data);
      if (!part) {
        errors.push(`${model}: no audio returned`);
        continue;
      }
      const mime: string = part.inlineData.mimeType || "";
      const rateMatch = mime.match(/rate=(\d+)/);
      const rate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
      const pcm = Buffer.from(part.inlineData.data, "base64");
      return pcmToWav(pcm, rate);
    } catch (e: any) {
      errors.push(`${model}: ${e?.name === "TimeoutError" ? "timed out" : e?.message || "failed"}`);
    }
  }
  return null;
}

async function edgeSpeech(text: string, voice: string | undefined, errors: string[]): Promise<ArrayBuffer | null> {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const tts = new EdgeTTS(text, voice && voice.includes("Neural") ? voice : "en-US-AriaNeural");
      const result = await withTimeout(tts.synthesize(), 25000, "Microsoft voice");
      const audioData: any = result.audio;
      return typeof audioData.arrayBuffer === "function" ? await audioData.arrayBuffer() : audioData;
    } catch (e: any) {
      errors.push(`Microsoft voice: ${e?.message || "failed"}`);
    }
  }
  return null;
}

async function speak(text: string, voice: string | undefined) {
  const errors: string[] = [];

  const wav = await geminiSpeech(text, voice, errors);
  if (wav) {
    return new NextResponse(new Uint8Array(wav), { headers: { "Content-Type": "audio/wav" } });
  }

  const mp3 = await edgeSpeech(text, voice, errors);
  if (mp3) {
    return new NextResponse(mp3, { headers: { "Content-Type": "audio/mpeg" } });
  }

  return NextResponse.json({ error: "No voice service answered. " + errors.join(" | ") }, { status: 500 });
}

// Open /api/narrate-free in a browser to test the voice. It plays a short sentence,
// or shows the exact reasons if no voice service answers.
export async function GET(req: NextRequest) {
  const text =
    new URL(req.url).searchParams.get("text") || "Testing the voice. One, two, three.";
  return speak(text.slice(0, 300), undefined);
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
  return speak(text, voice);
}
