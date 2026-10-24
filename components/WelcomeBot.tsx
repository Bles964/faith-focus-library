"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

const KEY = "ffl-welcome-seen-v1";

type Tab = "guide" | "ask" | "feedback";

const FAQ: { q: string; a: string }[] = [
  {
    q: "How do I read a guide?",
    a: "Tap Browse, then tap the guide. It opens in the reader. Use Prev and Next to turn pages.",
  },
  {
    q: "How do I listen to a guide?",
    a: "Open the guide, then tap Listen from this page at the bottom. It reads aloud and turns the pages for you.",
  },
  {
    q: "How do I take a quiz?",
    a: "Tap Quiz, pick a guide and answer the questions. You see your score at the end. The first time can take up to a minute.",
  },
  {
    q: "Can I download the guides?",
    a: "The guides are for reading inside the library and cannot be downloaded.",
  },
  {
    q: "How do I switch to another guide?",
    a: "In the reader, use the drop-down at the top to choose another guide.",
  },
  {
    q: "Something is not working",
    a: "Refresh the page and try again. If it still fails, tap Feedback and tell me what happened.",
  },
];

export default function WelcomeBot() {
  const pathname = usePathname();
  const [supabase] = useState(() => createClient());
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("guide");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState("");
  const onLogin = !!pathname && pathname.startsWith("/login");

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch {
      setOpen(true);
    }
    return () => {
      try {
        speechSynthesis.cancel();
      } catch {}
    };
  }, []);

  const steps: string[] = onLogin
    ? [
        "Sign in, or create an account, to open the library.",
        "Once you are in, tap Browse to read a study guide.",
        "Tap Quiz to test yourself on a guide and see your score.",
      ]
    : [
        "Browse: pick a study guide and tap it to read it right here.",
        "Listen: inside a guide, tap Listen from this page. It reads aloud and turns the pages for you.",
        "Quiz: pick a guide and answer its questions, then see your score.",
        "Clinical: watch examination videos, step by step.",
        "Cases: practise reading ECGs, radiographs and clinical pictures.",
        "Account: sign in or sign out.",
      ];

  const spoken =
    "Welcome to the Faith and Focus Library. Here is how to use it. " + steps.join(" ");

  function speak() {
    try {
      if (speaking) {
        speechSynthesis.cancel();
        setSpeaking(false);
        return;
      }
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(spoken);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      setSpeaking(true);
      speechSynthesis.speak(u);
    } catch {
      setSpeaking(false);
    }
  }

  function close() {
    try {
      speechSynthesis.cancel();
    } catch {}
    setSpeaking(false);
    setOpen(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
  }

  function switchTab(t: Tab) {
    setTab(t);
    setMessage("");
    setNote("");
    try {
      speechSynthesis.cancel();
    } catch {}
    setSpeaking(false);
  }

  async function send(kind: "question" | "feedback") {
    const text = message.trim();
    if (text.length < 3) {
      setNote("Please type a few words first.");
      return;
    }
    setSending(true);
    setNote("");
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setNote("Please sign in first, then send your message.");
        return;
      }
      const { error } = await supabase.from("feedback_messages").insert({
        user_id: user.id,
        email: user.email ?? null,
        kind,
        message: text.slice(0, 1500),
        page: window.location.pathname,
      });
      if (error) throw error;
      setMessage("");
      setNote(
        kind === "question"
          ? "Thank you. Your question has been sent and I will reply."
          : "Thank you for your feedback. It has been sent."
      );
    } catch (e: any) {
      setNote("Could not send: " + (e?.message || "please try again"));
    } finally {
      setSending(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Help"
        className="fixed bottom-4 left-4 z-50 w-12 h-12 rounded-full bg-navy text-2xl shadow-lg border-2 border-gold"
      >
        🤖
      </button>
    );
  }

  const tabBtn = (t: Tab, label: string) => (
    <button
      onClick={() => switchTab(t)}
      className={`px-3 py-1 rounded-full text-xs border ${
        tab === t ? "bg-navy text-paper border-navy" : "border-navy/30 text-navy/70"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed bottom-4 left-4 z-50 w-[calc(100vw-2rem)] max-w-sm max-h-[80vh] overflow-y-auto bg-white border border-gold rounded-xl shadow-xl p-4">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl">🤖</span>
        <div>
          <p className="font-serif text-lg text-navy leading-tight">Faith &amp; Focus Library</p>
          <p className="text-xs text-navy/60 mt-0.5">Your study helper</p>
        </div>
      </div>

      <div className="flex gap-2 mb-3">
        {tabBtn("guide", "How to use")}
        {tabBtn("ask", "Ask a question")}
        {tabBtn("feedback", "Feedback")}
      </div>

      {tab === "guide" && (
        <div>
          <p className="text-sm font-medium text-navy mb-2">Welcome! Here is how to use it:</p>
          <ul className="space-y-2 mb-3">
            {steps.map((t) => (
              <li key={t} className="text-sm text-navy/80 flex gap-2">
                <span className="text-gold">•</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-navy/50 mb-3">
            Your reading activity is recorded to help improve the library.
          </p>
          <button
            onClick={speak}
            className="px-3 py-1.5 rounded border border-navy/30 text-sm text-navy/80 hover:border-gold"
          >
            {speaking ? "⏹ Stop" : "🔊 Hear it"}
          </button>
        </div>
      )}

      {tab === "ask" && (
        <div>
          <p className="text-xs text-navy/60 mb-2">Common questions:</p>
          <div className="space-y-1 mb-3">
            {FAQ.map((f, i) => (
              <div key={f.q} className="border border-navy/10 rounded">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-3 py-2 text-sm text-navy"
                >
                  {f.q}
                </button>
                {openFaq === i && <p className="px-3 pb-2 text-sm text-navy/70">{f.a}</p>}
              </div>
            ))}
          </div>
          <p className="text-xs text-navy/60 mb-1">Still need help? Ask me:</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Type your question about the website…"
            className="w-full border border-navy/20 rounded px-3 py-2 text-sm mb-2"
          />
          <button
            onClick={() => send("question")}
            disabled={sending}
            className="px-3 py-1.5 rounded bg-navy text-paper text-sm disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send question"}
          </button>
          {note && <p className="text-xs text-navy/70 mt-2">{note}</p>}
        </div>
      )}

      {tab === "feedback" && (
        <div>
          <p className="text-xs text-navy/60 mb-1">
            Tell me what works, what does not, or what you would like me to add:
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Type your feedback…"
            className="w-full border border-navy/20 rounded px-3 py-2 text-sm mb-2"
          />
          <button
            onClick={() => send("feedback")}
            disabled={sending}
            className="px-3 py-1.5 rounded bg-navy text-paper text-sm disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send feedback"}
          </button>
          {note && <p className="text-xs text-navy/70 mt-2">{note}</p>}
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-navy/10 flex justify-end">
        <button onClick={close} className="px-3 py-1.5 rounded border border-navy/30 text-sm text-navy/80">
          Close
        </button>
      </div>
    </div>
  );
}
