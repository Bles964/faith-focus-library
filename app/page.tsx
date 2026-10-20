"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabaseClient";
import { BUSINESS_NAME } from "@/lib/business";

const FEATURES = [
  {
    title: "Study guides",
    text: "Simplified notes, striking points, mnemonics, clinical scenarios and MCQs, written for medical students.",
  },
  {
    title: "Read and listen",
    text: "Read each guide in the library, or tap Listen and follow along while it reads aloud and turns the pages.",
  },
  {
    title: "Quizzes",
    text: "Test yourself on the multiple-choice questions inside each guide and see your score straight away.",
  },
];

export default function HomePage() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data?.user));
  }, []);

  return (
    <div>
      <section className="text-center py-10">
        <p className="text-xs uppercase tracking-widest text-gold font-medium mb-3">{BUSINESS_NAME}</p>
        <h1 className="font-serif text-3xl sm:text-4xl text-navy leading-tight mb-4">
          Exam preparation for medical students
        </h1>
        <p className="text-navy/70 max-w-xl mx-auto mb-6">
          Clinical study guides, read-aloud and quizzes for MBBS, USMLE and OSCE preparation, all in one library.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {signedIn ? (
            <Link href="/library" className="px-5 py-2.5 rounded bg-navy text-paper text-sm">
              Go to the library
            </Link>
          ) : (
            <Link href="/login" className="px-5 py-2.5 rounded bg-navy text-paper text-sm">
              Sign in or create an account
            </Link>
          )}
          <Link href="/about" className="px-5 py-2.5 rounded border border-navy/30 text-navy/80 text-sm">
            About us
          </Link>
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-4 mb-10">
        {FEATURES.map((f) => (
          <div key={f.title} className="border border-navy/15 rounded-lg bg-white p-5">
            <h2 className="font-serif text-lg text-navy mb-2">{f.title}</h2>
            <p className="text-sm text-navy/70">{f.text}</p>
          </div>
        ))}
      </section>

      <section className="text-center mb-6">
        <p className="text-xs uppercase tracking-widest text-navy/50 mb-2">Built for</p>
        <p className="font-serif text-xl text-navy">MBBS · USMLE · OSCE</p>
      </section>
    </div>
  );
}
