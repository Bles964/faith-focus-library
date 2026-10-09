"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    async function check() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/library");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      if (profile?.is_admin === true) setAllowed(true);
      else router.replace("/library");
    }
    check();
  }, [router]);

  if (!allowed) return <p className="text-navy/50 text-sm">Checking access…</p>;
  return <>{children}</>;
}
