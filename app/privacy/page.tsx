import { BUSINESS_NAME, CONTACT_EMAIL, POLICY_UPDATED } from "@/lib/business";

export const metadata = {
  title: `Privacy Policy | ${BUSINESS_NAME}`,
  description: "How we collect, use and protect your information.",
};

export default function PrivacyPage() {
  const h2 = "font-serif text-xl text-navy mt-8 mb-2";
  const p = "text-navy/80 mb-3";
  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-3xl text-navy mb-1">Privacy Policy</h1>
      <p className="text-xs text-navy/50 mb-6">Last updated: {POLICY_UPDATED}</p>

      <p className={p}>
        This policy explains what information {BUSINESS_NAME} collects when you use the library, why we collect it,
        and the choices you have. We have written it in plain language.
      </p>

      <h2 className={h2}>What we collect</h2>
      <ul className="space-y-2 text-navy/80 mb-3">
        <li>• <strong>Account details:</strong> your email address. Your password is handled by our sign-in provider, and we never see it.</li>
        <li>• <strong>Activity:</strong> when you open the site, which pages you view, and which guides you open.</li>
        <li>• <strong>Messages:</strong> questions and feedback you send through the helper in the library.</li>
        <li>• <strong>On your device:</strong> small settings stored in your browser, such as whether you have closed the welcome note, which announcement you dismissed, and the quiz questions already prepared for a guide.</li>
      </ul>

      <h2 className={h2}>Why we collect it</h2>
      <ul className="space-y-2 text-navy/80 mb-3">
        <li>• To create your account and let you use the library.</li>
        <li>• To understand which guides are useful, so we can improve them and decide what to write next.</li>
        <li>• To answer your questions and read your feedback.</li>
        <li>• To keep the library secure and stop misuse.</li>
      </ul>

      <h2 className={h2}>Who can see it</h2>
      <p className={p}>
        Only the administrators of {BUSINESS_NAME} can see activity records and messages. We do not sell your
        information and we do not use it for advertising.
      </p>

      <h2 className={h2}>Services we use</h2>
      <p className={p}>
        We use trusted providers to run the library: Supabase for accounts, the database and file storage, and Vercel
        for hosting. We also use Google&apos;s AI service to prepare quiz questions from the text of our study guides.
        Only the guide text is sent for this, not your personal information.
      </p>

      <h2 className={h2}>How long we keep it</h2>
      <p className={p}>
        We keep records only as long as they are useful to run and improve the library, and we delete them when they
        are no longer needed. If you ask us to delete your account, we will delete your records too.
      </p>

      <h2 className={h2}>Your rights</h2>
      <p className={p}>
        Under the Nigeria Data Protection Act 2023 you can ask to see the information we hold about you, ask us to
        correct it, or ask us to delete it. You can also complain to the Nigeria Data Protection Commission if you
        believe your information has been mishandled. To make a request, contact us using the details below.
      </p>

      <h2 className={h2}>Security</h2>
      <p className={p}>
        Access to records is restricted to administrators and protected by account sign-in. No system is completely
        secure, but we take care to protect your information.
      </p>

      <h2 className={h2}>Children</h2>
      <p className={p}>The library is for students and professionals in medicine. It is not intended for children.</p>

      <h2 className={h2}>Changes to this policy</h2>
      <p className={p}>
        If we change this policy, we will update the date at the top of this page. If the changes are important, we
        will tell you in the library.
      </p>

      <h2 className={h2}>Contact us</h2>
      <p className={p}>
        {CONTACT_EMAIL ? (
          <>
            Email us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-gold underline">
              {CONTACT_EMAIL}
            </a>
            , or use the 🤖 helper in the library.
          </>
        ) : (
          <>Sign in and use the 🤖 helper in the library to send us a message.</>
        )}
      </p>
    </div>
  );
}
