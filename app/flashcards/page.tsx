"use client";
// Save as: app/flashcards/page.tsx   (opened as /flashcards?doc=<document id>)

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

type Card = { id: string; question: string; answer: string };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardsPage() {
  const supabase = createClient();
  const [docId, setDocId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Study state
  const [queue, setQueue] = useState<Card[]>([]);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [gotIt, setGotIt] = useState(0);
  const [missed, setMissed] = useState<Card[]>([]);

  // Drag state
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const moved = useRef(false);

  async function loadCards(id: string) {
    const { data } = await supabase
      .from("flashcards")
      .select("id,question,answer")
      .eq("document_id", id)
      .order("created_at");
    const list = (data as Card[]) ?? [];
    setCards(list);
    startRound(list);
  }

  function startRound(list: Card[]) {
    setQueue(shuffle(list));
    setPos(0);
    setFlipped(false);
    setGotIt(0);
    setMissed([]);
    setDx(0);
  }

  useEffect(() => {
    async function init() {
      const id = new URLSearchParams(window.location.search).get("doc");
      setDocId(id);
      if (!id) return setLoading(false);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: p } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
        setIsAdmin(p?.is_admin ?? false);
      }
      const { data: d } = await supabase.from("documents").select("title").eq("id", id).single();
      setTitle(d?.title ?? "");
      await loadCards(id);
      setLoading(false);
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate(replace: boolean) {
    if (!docId) return;
    setGenerating(true);
    setStatus("Reading the PDF…");
    try {
      const { data: d } = await supabase.from("documents").select("file_path").eq("id", docId).single();
      const { data: signed } = await supabase.storage
        .from("library-pdfs")
        .createSignedUrl(d!.file_path, 60 * 5);
      if (!signed?.signedUrl) throw new Error("Could not open the PDF.");
      const { extractPdfText } = await import("@/lib/pdfText");
      const text = await extractPdfText(signed.signedUrl);

      setStatus("Writing flashcards… this can take up to a minute.");
      const { data: sess } = await supabase.auth.getSession();
      const res = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${sess.session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ documentId: docId, text, replace }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error ?? "Failed.");
      setStatus(`Made ${out.count} flashcards.`);
      await loadCards(docId);
    } catch (e: any) {
      setStatus(e?.message ?? "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  }

  const current = queue[pos];
  const finished = queue.length > 0 && pos >= queue.length;

  function decide(known: boolean) {
    if (!current) return;
    if (known) setGotIt((n) => n + 1);
    else setMissed((m) => [...m, current]);
    setFlipped(false);
    setDx(0);
    setPos((p) => p + 1);
  }

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
    moved.current = false;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const d = e.clientX - startX.current;
    if (Math.abs(d) > 6) moved.current = true;
    setDx(d);
  }
  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (dx > 110) decide(true);
    else if (dx < -110) decide(false);
    else {
      setDx(0);
      if (!moved.current) setFlipped((f) => !f);
    }
  }

  if (loading) return <p className="text-navy/50 text-sm">Loading…</p>;
  if (!docId) return <p className="text-navy/70">Open flashcards from a file on the Browse page.</p>;

  return (
    <div className="max-w-md mx-auto">
      <a href="/library" className="text-sm text-navy/70 underline hover:text-gold">← Back to Browse</a>
      <h1 className="font-serif text-xl text-navy mt-2 mb-4">{title || "Flashcards"}</h1>

      {cards.length === 0 ? (
        <div className="border border-dashed border-navy/30 rounded-lg p-6 text-center">
          <p className="text-navy/70 text-sm mb-3">No flashcards for this file yet.</p>
          {isAdmin ? (
            <button
              onClick={() => generate(false)}
              disabled={generating}
              className="rounded bg-gold text-navy font-medium px-4 py-2 disabled:opacity-50"
            >
              {generating ? "Working…" : "Make flashcards from this PDF"}
            </button>
          ) : (
            <p className="text-xs text-navy/50">They will appear here once they are made.</p>
          )}
          {status && <p className="text-sm text-navy mt-3">{status}</p>}
        </div>
      ) : finished ? (
        <div className="border border-navy/15 rounded-lg p-6 text-center bg-white">
          <p className="font-serif text-xl text-navy mb-1">Round complete</p>
          <p className="text-sm text-navy/70 mb-4">
            You knew {gotIt} of {queue.length}.
          </p>
          <div className="flex flex-col gap-2">
            {missed.length > 0 && (
              <button
                onClick={() => {
                  setQueue(shuffle(missed));
                  setPos(0);
                  setGotIt(0);
                  setMissed([]);
                  setFlipped(false);
                }}
                className="rounded bg-gold text-navy font-medium px-4 py-2"
              >
                Review the {missed.length} you missed
              </button>
            )}
            <button onClick={() => startRound(cards)} className="rounded border border-navy/30 px-4 py-2 text-navy">
              Start again
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs text-navy/60 mb-2">
            <span>
              Card {pos + 1} of {queue.length}
            </span>
            <span>Swipe right: got it · Swipe left: still learning</span>
          </div>
          <div className="h-1.5 w-full rounded bg-navy/10 mb-4">
            <div className="h-1.5 rounded bg-gold" style={{ width: `${(pos / queue.length) * 100}%` }} />
          </div>

          <div style={{ perspective: 1000 }}>
            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              style={{
                touchAction: "pan-y",
                transform: `translateX(${dx}px) rotate(${dx / 25}deg)`,
                transition: dragging ? "none" : "transform 0.25s ease",
                cursor: "grab",
                userSelect: "none",
              }}
            >
              <div
                style={{
                  position: "relative",
                  minHeight: 280,
                  transformStyle: "preserve-3d",
                  transition: "transform 0.45s",
                  transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-xl border border-navy/15 bg-white p-6 text-center"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className="text-[10px] uppercase tracking-wide text-gold mb-3">Question</span>
                  <p className="font-serif text-lg text-navy">{current?.question}</p>
                  <span className="text-xs text-navy/40 mt-4">Tap to see the answer</span>
                </div>
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-navy p-6 text-center"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <span className="text-[10px] uppercase tracking-wide text-gold mb-3">Answer</span>
                  <p className="text-white text-base">{current?.answer}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => decide(false)}
              className="flex-1 rounded border border-red-300 text-red-700 py-2.5 text-sm font-medium"
            >
              Still learning
            </button>
            <button onClick={() => decide(true)} className="flex-1 rounded bg-navy text-white py-2.5 text-sm font-medium">
              Got it
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={() => generate(true)}
              disabled={generating}
              className="mt-6 text-xs text-navy/50 underline disabled:opacity-50"
            >
              {generating ? "Working…" : "Remake these flashcards"}
            </button>
          )}
          {status && <p className="text-xs text-navy/60 mt-2">{status}</p>}
        </>
      )}
    </div>
  );
}
