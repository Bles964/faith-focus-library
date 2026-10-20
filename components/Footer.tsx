import Link from "next/link";
import { BUSINESS_NAME } from "@/lib/business";

export default function Footer() {
  return (
    <footer className="py-8 px-5 text-center text-xs text-navy/60">
      <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1 mb-3">
        <Link href="/about" className="hover:text-gold">About</Link>
        <Link href="/contact" className="hover:text-gold">Contact</Link>
        <Link href="/privacy" className="hover:text-gold">Privacy</Link>
        <Link href="/terms" className="hover:text-gold">Terms</Link>
      </nav>
      <p>© {new Date().getFullYear()} {BUSINESS_NAME}. All rights reserved.</p>
    </footer>
  );
}
