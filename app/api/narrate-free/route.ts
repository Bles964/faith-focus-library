import { NextRequest, NextResponse } from "next/server";
import { EdgeTTS } from "edge-tts-universal";

export const runtime = "nodejs";
export const maxDuration = 60;

// Google's speech models, tried in order. Names can change, so a second one is listed.
const GEMINI_TTS_MODELS = ["gemini-3.1-flash-tts-preview", "gemini-2.5-flash-preview-tts"];
const GEMINI_VOICES = ["Kore", "Puck", "Charon", "Fenrir", "Aoede", "Leda", "Zephyr"];
const CHUNK_CHARS = 350;
const TOTAL_BUDGET_MS = 55000;

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

// Long narration is cut into shorter pieces, which are faster and less likely to time out
function splitText(text: string, max: number): string[] {
  const sentences = text.replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]*/g) || [text];
  const chunks: string[] = [];
  let current = "";
  for (const raw of sentences) {
    let s = raw.trim();
    if (!s) continue;
    while (s.length > max) {
      let cut = s.lastIndexOf(", ", max);
      if (cut < 80) cut = s.lastIndexOf(" ", max);
      if (cut < 80) cut = max;
      const head = s.slice(0, cut + 1).trim();
      if (current && (current + " " + head).length > max) {
        chunks.push(current);
        current = "";
      }
      chunks.push(current ? current + " " + head : head);
      current = "";
      s = s.slice(cut + 1).trim();
    }
    if (!s) continue;
    if (current && (current + " " + s).length > max) {
      chunks.push(current);
      current = s;
    } else {
      current = current ? current + " " + s : s;
    }
  }
  if (current) chunks.push(current);
  return chunks.length ? chunks : [text];
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

async function geminiPcm(
  text: string,
  voiceName: string,
  errors: string[],
  deadline: number
): Promise<{ pcm: Buffer; rate: number } | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    errors.push("Google voice: GEMINI_API_KEY is missing");
    return null;
  }

  for (const model of GEMINI_TTS_MODELS) {
    const left = deadline - Date.now();
    if (left < 4000) {
      errors.push(`${model}: skipped, out of time`);
      return null;
    }
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
          signal: AbortSignal.timeout(Math.min(25000, left - 1000)),
        }
      );
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        errors.push(`${model}: HTTP ${res.status} ${t.slice(0, 80)}`);
        if (res.status === 429) return null; // busy: let the other voice take over
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
      return {
        pcm: Buffer.from(part.inlineData.data, "base64"),
        rate: rateMatch ? parseInt(rateMatch[1], 10) : 24000,
      };
    } catch (e: any) {
      errors.push(`${model}: ${e?.name === "TimeoutError" ? "timed out" : e?.message || "failed"}`);
    }
  }
  return null;
}

async function geminiSpeech(chunks: string[], voice: string | undefined, errors: string[], deadline: number) {
  const voiceName = voice && GEMINI_VOICES.includes(voice) ? voice : "Kore";
  const parts: Buffer[] = [];
  let rate = 24000;
  for (const c of chunks) {
    const r = await geminiPcm(c, voiceName, errors, deadline);
    if (!r) return null;
    rate = r.rate;
    parts.push(r.pcm);
  }
  return pcmToWav(Buffer.concat(parts), rate);
}

async function edgeSpeech(chunks: string[], voice: string | undefined, errors: string[], deadline: number) {
  const voiceName = voice && voice.includes("Neural") ? voice : "en-US-AriaNeural";
  const parts: Buffer[] = [];
  for (const c of chunks) {
    let ok = false;
    for (let attempt = 1; attempt <= 2 && !ok; attempt++) {
      const left = deadline - Date.now();
      if (left < 4000) {
        errors.push("Microsoft voice: out of time");
        return null;
      }
      try {
        const tts = new EdgeTTS(c, voiceName);
        const result = await withTimeout(tts.synthesize(), Math.min(20000, left - 1000), "Microsoft voice");
        const audioData: any = result.audio;
        const ab: ArrayBuffer =
          typeof audioData.arrayBuffer === "function" ? await audioData.arrayBuffer() : audioData;
        parts.push(Buffer.from(ab));
        ok = true;
      } catch (e: any) {
        errors.push(`Microsoft voice: ${e?.message || "failed"}`);
      }
    }
    if (!ok) return null;
  }
  return Buffer.concat(parts);
}

async function speak(text: string, voice: string | undefined) {
  const errors: string[] = [];
  const deadline = Date.now() + TOTAL_BUDGET_MS;
  const chunks = splitText(text, CHUNK_CHARS);

  const wav = await geminiSpeech(chunks, voice, errors, deadline);
  if (wav) {
    return new NextResponse(new Uint8Array(wav), { headers: { "Content-Type": "audio/wav" } });
  }

  const mp3 = await edgeSpeech(chunks, voice, errors, deadline);
  if (mp3) {
    return new NextResponse(new Uint8Array(mp3), { headers: { "Content-Type": "audio/mpeg" } });
  }

  return NextResponse.json({ error: "No voice service answered. " + errors.join(" | ") }, { status: 500 });
}

// Open /api/narrate-free in a browser to test the voice. It plays a short sentence,
// or shows the exact reasons if no voice service answers.
export async function GET(req: NextRequest) {
  const text =
    new URL(req.url).searchParams.get("text") || "Testing the voice. One, two, three.";
  return speak(text.slice(0, 600), undefined);
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
