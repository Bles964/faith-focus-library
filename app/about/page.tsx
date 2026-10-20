import Link from "next/link";
import { BUSINESS_NAME } from "@/lib/business";

export const metadata = {
  title: `About | ${BUSINESS_NAME}`,
  description: "Who we are and what we offer: clinical study guides and exam preparation for medical students.",
};

export default function AboutPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-3xl text-navy mb-4">About {BUSINESS_NAME}</h1>

      <p className="text-navy/80 mb-4">
        {BUSINESS_NAME} is a virtual exam preparation platform for medical students. We turn lecture material into
        clear, branded clinical study guides, so that students can revise faster and walk into exams with confidence.
      </p>

      <h2 className="font-serif text-xl text-navy mt-8 mb-2">What we offer</h2>
      <ul className="space-y-2 text-navy/80 mb-4">
        <li>• Study guides with simplified notes, striking points, mnemonics, clinical scenarios and MCQs.</li>
        <li>• A library where you read each guide on screen, or listen to it while you follow along.</li>
        <li>• Quizzes built from the questions inside each guide, with your score at the end.</li>
      </ul>

      <h2 className="font-serif text-xl text-navy mt-8 mb-2">Who it is for</h2>
      <p className="text-navy/80 mb-4">
        Students preparing for MBBS examinations, USMLE and OSCE, and anyone who wants a short, structured way to
        revise clinical topics.
      </p>

      <h2 className="font-serif text-xl text-navy mt-8 mb-2">Our founder</h2>
      <p className="text-navy/80 mb-4">
        {BUSINESS_NAME} was founded by Blessing Opara, a final-year MBBS student, who leads the writing and design of
        the study guides.
      </p>

      <h2 className="font-serif text-xl text-navy mt-8 mb-2">How we work</h2>
      <p className="text-navy/80 mb-4">
        Every guide is written for exam preparation. Where a guide is based on a lecturer&apos;s teaching, we say so on
        its cover. Our guides support your studies and do not replace your lecturers, textbooks or current clinical
        guidelines.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/login" className="px-4 py-2 rounded bg-navy text-paper text-sm">
          Sign in or create an account
        </Link>
        <Link href="/contact" className="px-4 py-2 rounded border border-navy/30 text-navy/80 text-sm">
          Contact us
        </Link>
      </div>
    </div>
  );
}
