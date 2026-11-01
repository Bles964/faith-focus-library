"use client";
// Use on your Upload / Edit-file screen (admin only).
// Shows your folder tree with tick boxes; a file can be ticked into several folders.
//
// <FolderPicker documentId={doc.id} />          -> edits an existing file's folders and saves on tap
// <FolderPicker value={ids} onChange={setIds} /> -> controlled mode, for a new upload:
//      after the file row is created, call saveDocumentFolders(supabase, newDocId, ids)
//

import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

type Folder = { id: string; parent_id: string | null; name: string; sort_order: number };

const kidsOf = (all: Folder[], p: string | null) =>
  all.filter((f) => f.parent_id === p).sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));

export async function saveDocumentFolders(supabase: ReturnType<typeof createClient>, documentId: string, folderIds: string[]) {
  const del = await supabase.from("document_folders").delete().eq("document_id", documentId);
  if (del.error) return del.error;
  if (!folderIds.length) return null;
  const ins = await supabase
    .from("document_folders")
    .insert(folderIds.map((folder_id) => ({ document_id: documentId, folder_id })));
  return ins.error ?? null;
}

export default function FolderPicker({
  documentId,
  value,
  onChange,
}: {
  documentId?: string;
  value?: string[];
  onChange?: (ids: string[]) => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [internal, setInternal] = useState<string[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const selected = value ?? internal;

  useEffect(() => {
    supabase
      .from("folders")
      .select("id,parent_id,name,sort_order")
      .then(({ data }) => setFolders((data as Folder[]) ?? []));
    if (documentId && value === undefined) {
      supabase
        .from("document_folders")
        .select("folder_id")
        .eq("document_id", documentId)
        .then(({ data }) => setInternal((data ?? []).map((r: any) => r.folder_id)));
    }
  }, [supabase, documentId, value]);

  async function toggle(id: string) {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
    if (onChange) onChange(next);
    else setInternal(next);
    if (documentId && value === undefined) {
      const err = await saveDocumentFolders(supabase, documentId, next);
      setMsg(err ? "Could not save. " + err.message : "Saved");
    }
  }

  // "Medicine > Cardiology" style path, shown for ticked folders
  const pathOf = (id: string): string => {
    const f = folders.find((x) => x.id === id);
    if (!f) return "";
    return f.parent_id ? pathOf(f.parent_id) + " > " + f.name : f.name;
  };

  function render(parent: string | null, depth: number): JSX.Element[] {
    return kidsOf(folders, parent).map((f) => (
      <li key={f.id}>
        <label
          className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-[#0B1F3A]/5"
          style={{ paddingLeft: 8 + depth * 18 }}
        >
          <input
            type="checkbox"
            checked={selected.includes(f.id)}
            onChange={() => toggle(f.id)}
            className="h-4 w-4 accent-[#0B1F3A]"
          />
          <span className="text-sm text-[#0B1F3A]">{f.name}</span>
        </label>
        {kidsOf(folders, f.id).length > 0 && <ul>{render(f.id, depth + 1)}</ul>}
      </li>
    ));
  }

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-[#0B1F3A]">Put this file in</p>
      {selected.length > 0 && (
        <p className="mb-2 text-xs text-[#0B1F3A]/70">{selected.map(pathOf).filter(Boolean).join("  |  ")}</p>
      )}
      <ul className="max-h-72 overflow-y-auto rounded-lg border border-[#0B1F3A]/20 p-1">{render(null, 0)}</ul>
      {folders.length === 0 && (
        <p className="mt-2 text-sm">No folders yet. Create them in Manage catalogue first.</p>
      )}
      {msg && <p role="status" className="mt-2 text-xs">{msg}</p>}
    </div>
  );
}
