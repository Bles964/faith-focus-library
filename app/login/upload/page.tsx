"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

const CATEGORIES = ["MCQs", "Medicine", "Surgery", "Obstetrics & Gynaecology", "Paediatrics", "Community Medicine", "Other"];

export default function UploadPage() {
  const supabase = createClient();
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [specialty, setSpecialty] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setStatus("Choose a PDF first.");
      return;
    }
    setBusy(true);
    setStatus("Uploading…");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setStatus("You need to sign in first.");
      setBusy(false);
      return;
    }

    // Store the file under a per-user folder inside the "library-pdfs" bucket.
    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from("library-pdfs")
      .upload(filePath, file);

    if (uploadError) {
      setStatus(`Upload failed: ${uploadError.message}`);
      setBusy(false);
      return;
    }

    // Now record it in the catalog (the "documents" table).
    const { error: dbError } = await supabase.from("documents").insert({
      title: title || file.name.replace(/\.pdf$/i, ""),
      category,
      specialty: specialty || null,
      description: description || null,
      file_path: filePath,
      file_size_bytes: file.size,
      uploaded_by: user.id,
    });

    if (dbError) {
      setStatus(`Saved the file, but couldn't file it into the catalog: ${dbError.message}`);
      setBusy(false);
      return;
    }

    setStatus("Uploaded.");
    setBusy(false);
    router.push("/library");
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="font-serif text-2xl text-navy mb-1">Upload a guide</h1>
      <p className="text-sm text-navy/60 mb-6">Add a PDF and file it into a catalog.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="text-sm text-navy/80">
          PDF file
          <input
            type="file"
            accept="application/pdf"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 w-full text-sm"
          />
        </label>

        <label className="text-sm text-navy/80">
          Title
          <input
            type="text"
            placeholder="e.g. Cardiology — Arrhythmias"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full border border-navy/20 rounded px-3 py-2"
          />
        </label>

        <label className="text-sm text-navy/80">
          Catalog
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full border border-navy/20 rounded px-3 py-2 bg-white"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="text-sm text-navy/80">
          Specialty tag (optional)
          <input
            type="text"
            placeholder="e.g. Cardiology, Dermatology"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="mt-1 w-full border border-navy/20 rounded px-3 py-2"
          />
        </label>

        <label className="text-sm text-navy/80">
          Notes (optional)
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 w-full border border-navy/20 rounded px-3 py-2"
          />
        </label>

        {status && <p className="text-sm text-navy">{status}</p>}

        <button
          type="submit"
          disabled={busy}
          className="bg-gold text-navy font-medium rounded px-4 py-2 hover:bg-gold-soft disabled:opacity-50"
        >
          {busy ? "Uploading…" : "Add to library"}
        </button>
      </form>
    </div>
  );
}
