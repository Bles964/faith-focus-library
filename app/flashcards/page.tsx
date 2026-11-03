"use client";
// Save as: app/flashcards/page.tsx   (opened as /flashcards?doc=<document id>)

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { parsePasted, parseMcqs, NewCard } from "@/lib/flashcardParse";

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
  const [tool, setTool] = useState<null | "paste" | "pdf">(null);
  const [pasteText, setPasteText] = useState("");
  const [preview, setPreview] = useState<NewCard[] | null>(null);
  const [busy, setBusy] = useState(false);
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

  function showPreviewFromPaste() {
    const found = parsePasted(pasteText);
    setPreview(found);
    setStatus(found.length ? null : "No cards found. Check the format shown above the box.");
  }

  async function readPdf() {
    if (!docId) return;
    setBusy(true);
    setStatus("Reading the PDF…");
    setPreview(null);
    try {
      const { data: d } = await supabase.from("documents").select("file_path").eq("id", docId).single();
      const { data: signed } = await supabase.storage
        .from("library-pdfs")
        .createSignedUrl(d!.file_path, 60 * 5);
      if (!signed?.signedUrl) throw new Error("Could not open the PDF.");
      const { extractPdfText } = await import("@/lib/pdfText");
      const text = await extractPdfText(signed.signedUrl);
      const found = parseMcqs(text);
      setPreview(found);
      setStatus(
        found.length
          ? null
          : "No MCQs with marked answers were found in this PDF. For notes, use Paste cards instead."
      );
    } catch (e: any) {
      setStatus(e?.message ?? "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function saveCards(replace: boolean) {
    if (!docId || !preview || preview.length === 0) return;
    setBusy(true);
    if (replace) {
      const { error: delErr } = await supabase.from("flashcards").delete().eq("document_id", docId);
      if (delErr) {
        setBusy(false);
        return setStatus(delErr.message ?? "Could not clear the old cards.");
      }
    }
    const { error } = await supabase
      .from("flashcards")
      .insert(preview.map((c) => ({ document_id: docId, question: c.question, answer: c.answer })));
    setBusy(false);
    if (error) return setStatus(error.message ?? "Could not save the cards.");
    setStatus(`Saved ${preview.length} cards.`);
    setPreview(null);
    setPasteText("");
    setTool(null);
    await loadCards(docId);
  }

  async function deleteAllCards() {
    if (!docId || !window.confirm("Delete all flashcards for this file?")) return;
    const { error } = await supabase.from("flashcards").delete().eq("document_id", docId);
    if (error) return setStatus(error.message ?? "Could not delete.");
    setStatus(null);
    await loadCards(docId);
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
            <p className="text-xs text-navy/50">Add cards below.</p>
          ) : (
            <p className="text-xs text-navy/50">They will appear here once they are made.</p>
          )}
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
                  minHeight: 340,
                  transformStyle: "preserve-3d",
                  transition: "transform 0.45s",
                  transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto rounded-xl border border-navy/15 bg-white p-6 text-center"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className="text-[10px] uppercase tracking-wide text-gold mb-3">Question</span>
                  <p className="font-serif text-lg text-navy whitespace-pre-line">{current?.question}</p>
                  <span className="text-xs text-navy/40 mt-4">Tap to see the answer</span>
                </div>
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto rounded-xl bg-navy p-6 text-center"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <span className="text-[10px] uppercase tracking-wide text-gold mb-3">Answer</span>
                  <p className="text-white text-base whitespace-pre-line">{current?.answer}</p>
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

          {status && <p className="text-xs text-navy/60 mt-2">{status}</p>}
        </>
      )}

      {isAdmin && (
        <div className="mt-8 border-t border-navy/10 pt-4">
          <p className="text-sm font-medium text-navy mb-2">Add or change cards (admin)</p>
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => { setTool("paste"); setPreview(null); setStatus(null); }}
              className="text-xs px-3 py-1.5 rounded border border-navy/30 text-navy"
            >
              Paste cards
            </button>
            <button
              onClick={() => { setTool("pdf"); setPreview(null); setStatus(null); readPdf(); }}
              disabled={busy}
              className="text-xs px-3 py-1.5 rounded border border-navy/30 text-navy disabled:opacity-50"
            >
              Pull MCQs from the PDF
            </button>
            {cards.length > 0 && (
              <button onClick={deleteAllCards} className="text-xs px-3 py-1.5 rounded text-red-700 underline">
                Delete all cards
              </button>
            )}
          </div>

          {tool === "paste" && (
            <div className="mb-3">
              <p className="text-xs text-navy/60 mb-2">
                Write each card as two lines, a blank line between cards:<br />
                <span className="font-mono">Q: What is the triad of Horner syndrome?</span><br />
                <span className="font-mono">A: Ptosis, miosis, anhidrosis</span><br />
                Or one per line: <span className="font-mono">question | answer</span>
              </p>
              <textarea
                value={pasteText}
                onChange={(e) => { setPasteText(e.target.value); setPreview(null); }}
                rows={8}
                className="w-full border border-navy/20 rounded px-3 py-2 text-sm"
                placeholder="Paste your cards here"
              />
              <button
                onClick={showPreviewFromPaste}
                disabled={!pasteText.trim()}
                className="mt-2 text-sm px-4 py-2 rounded bg-navy text-white disabled:opacity-40"
              >
                Check cards
              </button>
            </div>
          )}

          {busy && tool === "pdf" && <p className="text-sm text-navy/60 mb-2">Reading the PDF…</p>}

          {preview && preview.length > 0 && (
            <div className="rounded-lg border border-gold/50 bg-gold/10 p-3 mb-3">
              <p className="text-sm text-navy font-medium mb-2">
                Found {preview.length} {preview.length === 1 ? "card" : "cards"}. Here are the first {Math.min(3, preview.length)}:
              </p>
              {preview.slice(0, 3).map((c, i) => (
                <div key={i} className="mb-2 rounded bg-white p-2 text-xs text-navy">
                  <p className="whitespace-pre-line font-medium">{c.question}</p>
                  <p className="whitespace-pre-line mt-1 text-navy/70">→ {c.answer}</p>
                </div>
              ))}
              <div className="flex flex-wrap gap-2 mt-2">
                {cards.length > 0 && (
                  <button
                    onClick={() => saveCards(false)}
                    disabled={busy}
                    className="text-sm px-4 py-2 rounded bg-navy text-white disabled:opacity-40"
                  >
                    Add to existing cards
                  </button>
                )}
                <button
                  onClick={() => saveCards(true)}
                  disabled={busy}
                  className="text-sm px-4 py-2 rounded bg-gold text-navy font-medium disabled:opacity-40"
                >
                  {cards.length > 0 ? "Replace existing cards" : "Save cards"}
                </button>
              </div>
            </div>
          )}

          {status && <p className="text-sm text-navy">{status}</p>}
        </div>
      )}
    </div>
  );
}
