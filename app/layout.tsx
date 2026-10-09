import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { LockInProvider } from "@/components/LockInProvider";
import LockInPill from "@/components/LockInPill";
import NavLinks from "@/components/NavLinks";

export const metadata: Metadata = {
  title: "Faith and Focus Library",
  description: "Your clinical study guide catalog",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans min-h-screen flex flex-col">
        <LockInProvider>
          <header className="bg-navy text-paper">
            <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
              <Link href="/library" className="font-serif text-lg tracking-wide">
                Faith &amp; Focus <span className="text-gold">Library</span>
              </Link>
              <NavLinks />
            </div>
          </header>
          <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-8">{children}</main>
          <footer className="text-center text-xs text-navy/50 py-6">
            Faith and Focus Academy
          </footer>
          <LockInPill />
        </LockInProvider>
      </body>
    </html>
  );
}
