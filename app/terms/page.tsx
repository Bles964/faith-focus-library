import { BUSINESS_NAME, POLICY_UPDATED } from "@/lib/business";

export const metadata = {
  title: `Terms of Use | ${BUSINESS_NAME}`,
  description: "The rules for using the library, and an important note about medical information.",
};

export default function TermsPage() {
  const h2 = "font-serif text-xl text-navy mt-8 mb-2";
  const p = "text-navy/80 mb-3";
  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-3xl text-navy mb-1">Terms of Use</h1>
      <p className="text-xs text-navy/50 mb-6">Last updated: {POLICY_UPDATED}</p>

      <div className="border border-gold bg-gold/10 rounded-lg p-4 mb-6">
        <p className="text-sm text-navy">
          <strong>Important:</strong> our guides are for exam preparation and education. They are not medical advice
          and must not be used to diagnose or treat patients.
        </p>
      </div>

      <p className={p}>
        By creating an account or using the library, you agree to these terms. If you do not agree, please do not use
        it.
      </p>

      <h2 className={h2}>Your account</h2>
      <p className={p}>
        You are responsible for your account and for keeping your sign-in details private. Please do not share your
        account with other people. We may suspend an account that is misused.
      </p>

      <h2 className={h2}>What you may do</h2>
      <p className={p}>
        You may read the guides, listen to them, and take the quizzes for your own personal study.
      </p>

      <h2 className={h2}>What you may not do</h2>
      <ul className="space-y-2 text-navy/80 mb-3">
        <li>• Copy, download, redistribute, publish or sell our guides, videos or quizzes.</li>
        <li>• Share your account, or give access to people who have not signed up.</li>
        <li>• Try to get around the library&apos;s protections, or interfere with how it works.</li>
      </ul>

      <h2 className={h2}>Our content</h2>
      <p className={p}>
        The study guides, quizzes, videos, design and branding belong to {BUSINESS_NAME}. Some guides are based on
        lecturers&apos; teaching, and we acknowledge this on their covers. Those sources remain the property of their
        authors.
      </p>

      <h2 className={h2}>Medical information</h2>
      <p className={p}>
        We work hard to keep our guides accurate, but medicine changes and mistakes can happen. Always check current
        guidelines and your lecturers&apos; instructions. Never rely on these guides for decisions about a patient&apos;s
        care. If you find an error, please tell us through the 🤖 helper so we can correct it.
      </p>

      <h2 className={h2}>Availability</h2>
      <p className={p}>
        We aim to keep the library available, but we cannot promise it will always work without interruption. We may
        change, add or remove features and guides.
      </p>

      <h2 className={h2}>Limits of our responsibility</h2>
      <p className={p}>
        The library is provided as it is. To the extent the law allows, {BUSINESS_NAME} is not responsible for losses
        that result from using it, including examination results.
      </p>

      <h2 className={h2}>Changes to these terms</h2>
      <p className={p}>
        We may update these terms. The date at the top shows when they last changed. If you keep using the library
        after a change, you accept the new terms.
      </p>

      <h2 className={h2}>Governing law</h2>
      <p className={p}>These terms are governed by the laws of the Federal Republic of Nigeria.</p>
    </div>
  );
}
