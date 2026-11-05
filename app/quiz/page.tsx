"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

type Doc = {
  id: string;
  title: string;
  category: string;
  specialty: string | null;
  file_path: string;
};

type Question = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

type Phase = "pick" | "loading" | "quiz" | "result";

const LETTERS = ["A", "B", "C", "D", "E"];

export default function QuizPage() {
  const supabase = createClient();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [phase, setPhase] = useState<Phase>("pick");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [current, setCurrent] = useState<Doc | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<(number | null)[]>([]);
  const [voice, setVoice] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setSignedIn(!!user);
      if (user) {
        const { data } = await supabase
          .from("documents")
          .select("id,title,category,specialty,file_path")
          .order("created_at", { ascending: false });
        if (data) setDocs(data as Doc[]);
      }
      setLoadingDocs(false);
    }
    load();
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        speechSynthesis.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function speakQuestion(q: Question) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const text =
      `${q.question}. ` + q.options.map((o, i) => `${LETTERS[i]}. ${o}.`).join(" ");
    speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }

  useEffect(() => {
    if (phase !== "quiz") return;
    if (voice) {
      speakQuestion(questions[idx]);
    } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
      speechSynthesis.cancel();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, idx, voice, questions]);

  async function startQuiz(doc: Doc) {
    setError("");
    setCurrent(doc);
    setPhase("loading");

    // Unlock speech on phones while the tap is still fresh
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      speechSynthesis.speak(new SpeechSynthesisUtterance(""));
    }

    try {
      let qs: Question[] | null = null;
      try {
        const cached = localStorage.getItem(`quiz-${doc.id}`);
        if (cached) qs = JSON.parse(cached);
      } catch {}

      if (!qs) {
        setStatus("Opening the PDF...");
        const { data, error: urlErr } = await supabase.storage
          .from("library-pdfs")
          .createSignedUrl(doc.file_path, 60 * 5);
        if (!data?.signedUrl) throw new Error(urlErr?.message ?? "Could not open this file");

        setStatus("Reading the PDF...");
        const { extractPdfText } = await import("@/lib/pdfText");
        const text = await extractPdfText(data.signedUrl);
        if (!text.trim()) throw new Error("Couldn't find any text in that PDF");

        setStatus("Finding the questions... this can take up to a minute");
        const res = await fetch("/api/extract-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        let json: any;
        try {
          json = await res.json();
        } catch {
          throw new Error(`Server didn't return JSON (status ${res.status})`);
        }
        if (!res.ok) throw new Error(json.error || "Could not get the questions");
        qs = json.questions as Question[];
        if (!Array.isArray(qs) || qs.length === 0) {
          throw new Error("No multiple-choice questions were found in this document");
        }
        try {
          localStorage.setItem(`quiz-${doc.id}`, JSON.stringify(qs));
        } catch {}
      }

      const final = qs as Question[];
      setQuestions(final);
      setPicked(final.map(() => null));
      setIdx(0);
      setPhase("quiz");
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
      setPhase("pick");
    }
  }

  function choose(i: number) {
    setPicked((prev) => {
      const next = [...prev];
      next[idx] = i;
      return next;
    });
  }

  function next() {
    if (idx < questions.length - 1) {
      setIdx(idx + 1);
    } else {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        speechSynthesis.cancel();
      }
      setPhase("result");
    }
  }

  function back() {
    if (idx > 0) setIdx(idx - 1);
  }

  function restart() {
    setPicked(questions.map(() => null));
    setIdx(0);
    setPhase("quiz");
  }

  function backToList() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      speechSynthesis.cancel();
    }
    setPhase("pick");
    setCurrent(null);
    setQuestions([]);
  }

  if (!signedIn && !loadingDocs) {
    return (
      <div className="text-center py-16">
        <p className="text-navy/70 mb-3">Sign in to take a quiz.</p>
        <a href="/login" className="text-gold underline">Go to sign in</a>
      </div>
    );
  }

  /* ---------- Pick a document ---------- */
  if (phase === "pick") {
    return (
      <div>
        <h1 className="font-serif text-2xl text-navy mb-1">Quiz</h1>
        <p className="text-sm text-navy/60 mb-5">
          Pick a document. The quiz uses the multiple-choice questions already inside it.
        </p>
        {error && (
          <p className="text-sm text-red-600 mb-4 border border-red-200 rounded p-3">{error}</p>
        )}
        {loadingDocs ? (
          <p className="text-navy/50 text-sm">Loading…</p>
        ) : docs.length === 0 ? (
          <p className="text-navy/50 text-sm">No documents yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {docs.map((d) => (
              <button
                key={d.id}
                onClick={() => startQuiz(d)}
                className="text-left border border-navy/15 rounded-lg p-4 bg-white hover:border-gold transition-colors"
              >
                <span className="text-xs uppercase tracking-wide text-gold font-medium">
                  {d.category}
                  {d.specialty ? ` · ${d.specialty}` : ""}
                </span>
                <h2 className="font-serif text-lg text-navy mt-1">{d.title}</h2>
                <span className="text-xs text-navy/50">Tap to start the quiz</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ---------- Loading ---------- */
  if (phase === "loading") {
    return (
      <div className="text-center py-16">
        <h1 className="font-serif text-xl text-navy mb-2">{current?.title}</h1>
        <p className="text-navy/60 text-sm">{status}</p>
      </div>
    );
  }

  /* ---------- Result ---------- */
  if (phase === "result") {
    const score = picked.filter((p, i) => p === questions[i].answer).length;
    const total = questions.length;
    const pct = Math.round((score / total) * 100);
    const msg =
      pct >= 80
        ? "Excellent work."
        : pct >= 50
        ? "Good effort. Review the ones below."
        : "Keep going. Re-read the guide and try again.";
    const wrong = questions
      .map((q, i) => ({ q, i, p: picked[i] }))
      .filter((x) => x.p !== x.q.answer);

    return (
      <div>
        <h1 className="font-serif text-2xl text-navy mb-1">Your score</h1>
        <p className="text-sm text-navy/60 mb-4">{current?.title}</p>
        <div className="border border-navy/15 rounded-lg bg-white p-6 text-center mb-6">
          <p className="font-serif text-4xl text-navy">
            {score} / {total}
          </p>
          <p className="text-gold font-medium mt-1">{pct}%</p>
          <p className="text-sm text-navy/70 mt-2">{msg}</p>
        </div>

        {wrong.length === 0 ? (
          <p className="text-sm text-navy/70 mb-6">You got every question right.</p>
        ) : (
          <div className="mb-6">
            <h2 className="font-serif text-lg text-navy mb-3">Review</h2>
            <div className="space-y-3">
              {wrong.map(({ q, i, p }) => (
                <div key={i} className="border border-navy/15 rounded-lg bg-white p-4 text-sm">
                  <p className="text-navy font-medium mb-2">
                    {i + 1}. {q.question}
                  </p>
                  <p className="text-red-600">
                    Your answer: {p === null ? "no answer" : `${LETTERS[p]}. ${q.options[p]}`}
                  </p>
                  <p className="text-green-700">
                    Correct: {LETTERS[q.answer]}. {q.options[q.answer]}
                  </p>
                  {q.explanation && <p className="text-navy/60 mt-1">{q.explanation}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={restart} className="px-4 py-2 rounded bg-navy text-paper text-sm">
            Retake quiz
          </button>
          <button
            onClick={backToList}
            className="px-4 py-2 rounded border border-navy/30 text-navy/70 text-sm"
          >
            Choose another document
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Quiz ---------- */
  const q = questions[idx];
  const selected = picked[idx];
  const progress = Math.round(((idx + 1) / questions.length) * 100);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-navy/60">
          Question {idx + 1} of {questions.length}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => speakQuestion(q)}
            className="text-xs text-navy/60 hover:text-gold underline"
          >
            Replay
          </button>
          <button
            onClick={() => setVoice((v) => !v)}
            className="text-xs text-navy/60 hover:text-gold underline"
          >
            {voice ? "Voice on" : "Voice off"}
          </button>
        </div>
      </div>
      <div className="h-1.5 bg-navy/10 rounded mb-5">
        <div className="h-1.5 bg-gold rounded" style={{ width: `${progress}%` }} />
      </div>

      <h2 className="font-serif text-lg text-navy mb-4">{q.question}</h2>

      <div className="space-y-2 mb-6">
        {q.options.map((o, i) => (
          <button
            key={i}
            onClick={() => choose(i)}
            className={`w-full text-left border rounded-lg px-4 py-3 text-sm transition-colors ${
              selected === i
                ? "bg-navy text-paper border-navy"
                : "bg-white text-navy border-navy/20 hover:border-gold"
            }`}
          >
            <span className="font-medium mr-2">{LETTERS[i]}.</span>
            {o}
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          onClick={back}
          disabled={idx === 0}
          className="px-4 py-2 rounded border border-navy/30 text-navy/70 text-sm disabled:opacity-40"
        >
          Back
        </button>
        <button
          onClick={next}
          disabled={selected === null}
          className="px-4 py-2 rounded bg-navy text-paper text-sm disabled:opacity-40"
        >
          {idx === questions.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}
