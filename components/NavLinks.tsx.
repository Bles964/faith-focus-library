"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

export default function NavLinks() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function check() {
      try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;
        if (!user) {
          setIsAdmin(false);
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();
        setIsAdmin(profile?.is_admin === true);
      } catch {
        setIsAdmin(false);
      }
    }

    check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      check();
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <nav className="flex gap-5 text-sm">
      <Link href="/library" className="hover:text-gold">Browse</Link>
      {isAdmin && (
        <Link href="/upload" className="hover:text-gold">Upload</Link>
      )}
      <Link href="/focus" className="hover:text-gold">Focus</Link>
      <Link href="/videos" className="hover:text-gold">Videos</Link>
      <Link href="/login" className="hover:text-gold">Account</Link>
    </nav>
  );
}
