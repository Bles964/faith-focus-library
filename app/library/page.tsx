"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

type Doc = {
  id: string;
  title: string;
  category: string;
  specialty: string | null;
  description: string | null;
  file_path: string;
  created_at: string;
};

export default function LibraryPage() {
  const supabase = createClient();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | "All">("All");
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setSignedIn(!!user);

      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) setDocs(data as Doc[]);
      setLoading(false);
    }
    load();
  }, []);

  const categories = ["All", ...Array.from(new Set(docs.map((d) => d.category)))];

  const filtered = docs.filter((d) => {
    const matchesCategory = activeCategory === "All" || d.category === activeCategory;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      d.title.toLowerCase().includes(q) ||
      (d.specialty ?? "").toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  async function openDoc(doc: Doc) {
    const { data, error } = await supabase.storage
      .from("library-pdfs")
      .createSignedUrl(doc.file_path, 60 * 5); // link valid 5 minutes
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    else alert(error?.message ?? "Could not open this file.");
  }

  if (!signedIn && !loading) {
    return (
      <div className="text-center py-16">
        <p className="text-navy/70 mb-3">Sign in to browse your library.</p>
        <a href="/login" className="text-gold underline">Go to sign in</a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-navy mb-4">Browse</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="Search by title or specialty…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-navy/20 rounded px-3 py-2"
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`text-sm px-3 py-1 rounded-full border ${
              activeCategory === c
                ? "bg-navy text-paper border-navy"
                : "border-navy/30 text-navy/70 hover:border-navy"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-navy/50 text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-navy/50 text-sm">
          Nothing here yet. Use "Upload" to add your first guide.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map((doc) => (
            <button
              key={doc.id}
              onClick={() => openDoc(doc)}
              className="text-left border border-navy/15 rounded-lg p-4 bg-white hover:border-gold transition-colors"
            >
              <span className="text-xs uppercase tracking-wide text-gold font-medium">
                {doc.category}
                {doc.specialty ? ` · ${doc.specialty}` : ""}
              </span>
              <h2 className="font-serif text-lg text-navy mt-1">{doc.title}</h2>
              {doc.description && (
                <p className="text-sm text-navy/60 mt-1">{doc.description}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

