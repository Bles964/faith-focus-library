"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

const KEY = "ffl-announcement-dismissed";

type Ann = { id: number; message: string };

export default function AnnouncementBanner() {
  const pathname = usePathname();
  const [supabase] = useState(() => createClient());
  const [ann, setAnn] = useState<Ann | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data } = await supabase
          .from("announcements")
          .select("id,message")
          .eq("active", true)
          .order("created_at", { ascending: false })
          .limit(1);
        if (cancelled) return;
        const row = data && data.length > 0 ? (data[0] as Ann) : null;
        if (!row) {
          setAnn(null);
          return;
        }
        let dismissed = "";
        try {
          dismissed = localStorage.getItem(KEY) || "";
        } catch {}
        setAnn(dismissed === String(row.id) ? null : row);
      } catch {
        if (!cancelled) setAnn(null);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!ann) return null;

  function dismiss() {
    try {
      localStorage.setItem(KEY, String(ann!.id));
    } catch {}
    setAnn(null);
  }

  return (
    <div className="bg-gold/20 border-b border-gold">
      <div className="max-w-5xl mx-auto px-5 py-2 flex items-start gap-3">
        <span className="text-lg leading-none mt-0.5">📢</span>
        <p className="flex-1 text-sm text-navy">{ann.message}</p>
        <button onClick={dismiss} aria-label="Dismiss" className="text-navy/60 text-lg leading-none px-1">
          ×
        </button>
      </div>
    </div>
  );
}
