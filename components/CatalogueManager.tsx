"use client";
// Admin-only screen: build your own catalogue (folders inside folders).
// Put it on a page such as app/admin/catalogue/page.tsx and only show the link to admins.

import { useCallback, useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export type Folder = {
  id: string;
  parent_id: string | null;
  name: string;
  sort_order: number;
};

export function childrenOf(all: Folder[], parentId: string | null) {
  return all
    .filter((f) => f.parent_id === parentId)
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
}

export default function CatalogueManager() {
  const supabase = useMemo(() => createClient(), []);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [adding, setAdding] = useState<string | "root" | null>(null);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("folders")
      .select("id,parent_id,name,sort_order")
      .order("sort_order");
    if (error) setError("Could not load the catalogue. " + error.message);
    else setFolders(data as Folder[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function addFolder(parentId: string | null) {
    const name = newName.trim();
    if (!name) return;
    const siblings = childrenOf(folders, parentId);
    const next = siblings.length ? Math.max(...siblings.map((s) => s.sort_order)) + 1 : 1;
    const { error } = await supabase
      .from("folders")
      .insert({ name, parent_id: parentId, sort_order: next });
    if (error) return setError("Could not add the folder. " + error.message);
    setNewName("");
    setAdding(null);
    if (parentId) setOpen((o) => ({ ...o, [parentId]: true }));
    load();
  }

  async function rename(id: string) {
    const name = draft.trim();
    if (!name) return;
    const { error } = await supabase.from("folders").update({ name }).eq("id", id);
    if (error) return setError("Could not rename. " + error.message);
    setEditing(null);
    load();
  }

  async function remove(f: Folder) {
    const kids = childrenOf(folders, f.id).length;
    const msg = kids
      ? `Delete "${f.name}" and the ${kids} folder(s) inside it? Your files are kept; they just leave these folders.`
      : `Delete "${f.name}"? Your files are kept; they just leave this folder.`;
    if (!window.confirm(msg)) return;
    const { error } = await supabase.from("folders").delete().eq("id", f.id);
    if (error) return setError("Could not delete. " + error.message);
    load();
  }

  async function move(f: Folder, dir: -1 | 1) {
    const sibs = childrenOf(folders, f.parent_id);
    const i = sibs.findIndex((s) => s.id === f.id);
    const j = i + dir;
    if (j < 0 || j >= sibs.length) return;
    const other = sibs[j];
    // swap positions; use index-based values so ties never get stuck
    const a = supabase.from("folders").update({ sort_order: j + 1 }).eq("id", f.id);
    const b = supabase.from("folders").update({ sort_order: i + 1 }).eq("id", other.id);
    const [ra, rb] = await Promise.all([a, b]);
    if (ra.error || rb.error) return setError("Could not reorder.");
    load();
  }

  function renderRow(f: Folder, depth: number): JSX.Element {
    const kids = childrenOf(folders, f.id);
    const isOpen = open[f.id] ?? depth === 0;
    return (
      <li key={f.id}>
        <div
          className="group flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-[#0B1F3A]/5"
          style={{ paddingLeft: 8 + depth * 18 }}
        >
          <button
            aria-label={isOpen ? "Collapse" : "Expand"}
            onClick={() => setOpen((o) => ({ ...o, [f.id]: !isOpen }))}
            className="h-6 w-6 shrink-0 rounded text-[#0B1F3A]/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
          >
            {kids.length ? (isOpen ? "▾" : "▸") : "•"}
          </button>

          {editing === f.id ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") rename(f.id);
                if (e.key === "Escape") setEditing(null);
              }}
              className="min-w-0 flex-1 rounded border border-[#0B1F3A]/30 px-2 py-1 text-sm"
            />
          ) : (
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#0B1F3A]">{f.name}</span>
          )}

          <div className="flex shrink-0 items-center gap-1 text-xs">
            {editing === f.id ? (
              <>
                <button onClick={() => rename(f.id)} className="rounded bg-[#0B1F3A] px-2 py-1 text-white">Save</button>
                <button onClick={() => setEditing(null)} className="rounded px-2 py-1">Cancel</button>
              </>
            ) : (
              <>
                <button onClick={() => move(f, -1)} aria-label="Move up" className="rounded px-1.5 py-1">↑</button>
                <button onClick={() => move(f, 1)} aria-label="Move down" className="rounded px-1.5 py-1">↓</button>
                <button onClick={() => { setAdding(f.id); setNewName(""); setOpen((o) => ({ ...o, [f.id]: true })); }} className="rounded px-2 py-1 text-[#0B1F3A]">Add inside</button>
                <button onClick={() => { setEditing(f.id); setDraft(f.name); }} className="rounded px-2 py-1">Rename</button>
                <button onClick={() => remove(f)} className="rounded px-2 py-1 text-red-700">Delete</button>
              </>
            )}
          </div>
        </div>

        {isOpen && (
          <ul>
            {adding === f.id && renderAddBox(f.id, depth + 1)}
            {kids.map((k) => renderRow(k, depth + 1))}
          </ul>
        )}
      </li>
    );
  }

  function renderAddBox(parentId: string | null, depth: number): JSX.Element {
    return (
      <li key={"add-" + (parentId ?? "root")} style={{ paddingLeft: 8 + depth * 18 }} className="flex items-center gap-2 py-1">
        <input
          autoFocus
          placeholder={parentId ? "Name of the new folder, e.g. Cardiology" : "Name of the new top folder"}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addFolder(parentId);
            if (e.key === "Escape") setAdding(null);
          }}
          className="min-w-0 flex-1 rounded border border-[#0B1F3A]/30 px-2 py-1.5 text-sm"
        />
        <button onClick={() => addFolder(parentId)} className="rounded bg-[#C9A227] px-3 py-1.5 text-sm font-semibold text-[#0B1F3A]">Add folder</button>
        <button onClick={() => setAdding(null)} className="px-2 py-1.5 text-sm">Cancel</button>
      </li>
    );
  }

  const roots = childrenOf(folders, null);

  return (
    <section className="mx-auto max-w-2xl p-4">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-[#0B1F3A]">Manage catalogue</h1>
          <p className="text-sm text-[#0B1F3A]/70">Build the folders your students will browse. A file can sit in more than one folder.</p>
        </div>
        <button
          onClick={() => { setAdding("root"); setNewName(""); }}
          className="shrink-0 rounded-lg bg-[#0B1F3A] px-3 py-2 text-sm font-semibold text-white"
        >
          New top folder
        </button>
      </header>

      {error && (
        <p role="alert" className="mb-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error} <button className="underline" onClick={() => setError(null)}>Dismiss</button>
        </p>
      )}

      {loading ? (
        <p className="text-sm">Loading your catalogue…</p>
      ) : roots.length === 0 && adding !== "root" ? (
        <p className="rounded border border-dashed border-[#0B1F3A]/30 p-6 text-center text-sm">
          No folders yet. Tap “New top folder” and start with Medicine.
        </p>
      ) : (
        <ul>
          {adding === "root" && renderAddBox(null, 0)}
          {roots.map((f) => renderRow(f, 0))}
        </ul>
      )}
    </section>
  );
}
