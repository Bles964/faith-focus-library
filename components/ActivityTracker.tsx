"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { logActivity } from "@/lib/activity";

export default function ActivityTracker() {
  const pathname = usePathname();
  const last = useRef("");

  useEffect(() => {
    if (!pathname || pathname === last.current) return;
    last.current = pathname;

    // The reader and the activity page log themselves, or are not worth logging
    if (pathname.startsWith("/read") || pathname.startsWith("/activity")) return;

    (async () => {
      const ok = await logActivity("page_view", { path: pathname });
      if (!ok) return;
      try {
        if (!sessionStorage.getItem("ffl-visit-logged")) {
          sessionStorage.setItem("ffl-visit-logged", "1");
          await logActivity("visit", { path: pathname });
        }
      } catch {}
    })();
  }, [pathname]);

  return null;
}
