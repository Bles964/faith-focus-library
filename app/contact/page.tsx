import { BUSINESS_NAME, CONTACT_EMAIL, WHATSAPP_NUMBER } from "@/lib/business";

export const metadata = {
  title: `Contact | ${BUSINESS_NAME}`,
  description: "Get in touch with us.",
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-3xl text-navy mb-4">Contact us</h1>
      <p className="text-navy/80 mb-6">
        Questions, feedback, a mistake you have spotted in a guide, or a topic you would like us to cover? We would
        love to hear from you.
      </p>

      <div className="space-y-3">
        {CONTACT_EMAIL && (
          <div className="border border-navy/15 rounded-lg bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-gold font-medium mb-1">Email</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-navy underline">
              {CONTACT_EMAIL}
            </a>
          </div>
        )}

        {WHATSAPP_NUMBER && (
          <div className="border border-navy/15 rounded-lg bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-gold font-medium mb-1">WhatsApp</p>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy underline"
            >
              Message us on WhatsApp
            </a>
          </div>
        )}

        <div className="border border-navy/15 rounded-lg bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-gold font-medium mb-1">In the library</p>
          <p className="text-navy/80 text-sm">
            Sign in, then tap the 🤖 button at the bottom left. You can ask a question or send feedback, and we will
            reply.
          </p>
        </div>
      </div>
    </div>
  );
}
