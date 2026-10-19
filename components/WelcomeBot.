"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const KEY = "ffl-welcome-seen-v1";

export default function WelcomeBot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
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

  return (
    <div className="fixed bottom-4 left-4 z-50 w-[calc(100vw-2rem)] max-w-sm bg-white border border-gold rounded-xl shadow-xl p-4">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl">🤖</span>
        <div>
          <p className="font-serif text-lg text-navy leading-tight">Welcome to the Faith &amp; Focus Library</p>
          <p className="text-xs text-navy/60 mt-0.5">Here is how to use it</p>
        </div>
      </div>

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

      <div className="flex gap-2">
        <button
          onClick={speak}
          className="px-3 py-1.5 rounded border border-navy/30 text-sm text-navy/80 hover:border-gold"
        >
          {speaking ? "⏹ Stop" : "🔊 Hear it"}
        </button>
        <button onClick={close} className="px-3 py-1.5 rounded bg-navy text-paper text-sm">
          Got it
        </button>
      </div>
    </div>
  );
}
