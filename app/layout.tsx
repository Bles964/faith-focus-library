import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Faith and Focus Library",
  description: "Your clinical study guide catalog",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans min-h-screen flex flex-col">
        <header className="bg-navy text-paper">
          <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
            <Link href="/library" className="font-serif text-lg tracking-wide">
              Faith &amp; Focus <span className="text-gold">Library</span>
            </Link>
            <nav className="flex gap-5 text-sm">
              <Link href="/library" className="hover:text-gold">Browse</Link>
              <Link href="/upload" className="hover:text-gold">Upload</Link>
              <Link href="/login" className="hover:text-gold">Account</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-8">{children}</main>
        <footer className="text-center text-xs text-navy/50 py-6">
          Faith and Focus Academy
        </footer>
      </body>
    </html>
  );
}

