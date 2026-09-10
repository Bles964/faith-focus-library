"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else router.push("/library");
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else setMessage("Account created — check your email to confirm, then sign in.");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="font-serif text-2xl text-navy mb-1">
        {mode === "signin" ? "Sign in" : "Create your account"}
      </h1>
      <p className="text-sm text-navy/60 mb-6">
        {mode === "signin"
          ? "Welcome back to your library."
          : "The first account created should be made an admin — see SETUP.md."}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="text-sm text-navy/80">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border border-navy/20 rounded px-3 py-2"
          />
        </label>
        <label className="text-sm text-navy/80">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border border-navy/20 rounded px-3 py-2"
          />
        </label>

        {message && <p className="text-sm text-red-700">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-navy text-paper rounded px-4 py-2 mt-2 hover:bg-navy-light disabled:opacity-50"
        >
          {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Sign up"}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
        className="text-sm text-gold underline mt-4"
      >
        {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
      </button>
    </div>
  );
}
