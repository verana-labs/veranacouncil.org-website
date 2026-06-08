import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact the Verana Council Association through one internally-routed form. Founding Council seats, Public-Sector Observers, governance questions, and press.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <nav className="text-sm text-muted mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-indigo-primary">
              Home
            </Link>{" "}
            · <span className="text-ink">Contact</span>
          </nav>
          <p className="eyebrow mb-4">Get in touch</p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight max-w-4xl">
            Contact the Council.
          </h1>
          <p className="mt-6 text-muted max-w-2xl leading-relaxed">
            The form below is the way to reach us. We do not publish email
            addresses — every inquiry is handled internally, without exposing a
            contact endpoint. We respond within 5 business days.
          </p>
        </div>
      </section>

      {/* Form + aside */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-12 gap-10">
            <aside className="md:col-span-4 order-2 md:order-1">
              <p className="eyebrow mb-3">Why this form</p>
              <h2 className="text-2xl font-semibold tracking-tight">
                Routed internally.
              </h2>
              <ul className="mt-6 space-y-4 text-muted text-sm">
                <li>No email addresses exposed — nothing in HTML or metadata.</li>
                <li>
                  Self-hosted anti-abuse (honeypot + time-to-submit). No
                  Turnstile, hCaptcha, or reCAPTCHA.
                </li>
                <li>
                  Inquiries are stored in our self-hosted CRM so the Council can
                  follow up.
                </li>
                <li>No cookies set by this form.</li>
              </ul>
              <p className="text-xs text-muted mt-8">
                Full details in the{" "}
                <Link href="/legal/privacy" className="text-indigo-primary underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </aside>

            <div className="md:col-span-8 order-1 md:order-2">
              <p className="eyebrow mb-3">Send a message</p>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-6">
                Talk to the Council
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Other ways */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="eyebrow mb-3">Other ways to reach us</p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-8">
            If the form isn&rsquo;t your preference
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl">
            <div className="card">
              <h3 className="font-semibold">Governance documents</h3>
              <p className="text-sm text-muted">
                The frameworks, bylaws, and code of conduct are public.
              </p>
              <a
                href="https://github.com/verana-labs/verana-council-gov"
                rel="noopener"
                className="text-indigo-primary text-sm font-medium"
              >
                verana-council-gov ↗
              </a>
            </div>
            <div className="card">
              <h3 className="font-semibold">In person</h3>
              <p className="text-sm text-muted">
                Members and stewards present at the Internet Identity Workshop
                and adjacent standards venues.
              </p>
            </div>
            <div className="card">
              <h3 className="font-semibold">Press kit</h3>
              <p className="text-sm text-muted">
                Logos and boilerplate (CC-BY 4.0) on request — use inquiry type{" "}
                <em>Press or analyst</em> on the form.
              </p>
            </div>
            <div className="card">
              <h3 className="font-semibold">Become a Member</h3>
              <p className="text-sm text-muted">
                Founding Council seats and Public-Sector Observer applications.
              </p>
              <Link
                href="/join"
                className="text-indigo-primary text-sm font-medium"
              >
                How to join →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Office & legal */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-4">
            <p className="eyebrow mb-3">Office &amp; legal</p>
            <h2 className="text-2xl font-semibold tracking-tight">
              Who you&rsquo;re talking to
            </h2>
          </div>
          <div className="md:col-span-8">
            <address className="not-italic text-muted leading-relaxed">
              <strong className="text-ink block text-lg">
                Verana Council Association
              </strong>
              Non-profit Swiss Verein (Art. 60 ZGB), in formation; target
              incorporation Q3 2026.
            </address>
            <div className="mt-8 prose-body text-sm">
              <p>
                <strong>Boilerplate.</strong> The Verana Council Association is a
                non-profit Swiss Verein that governs the Verana public trust
                network. It authors and operates the Network Governance Framework
                and the ECS Ecosystem Governance Framework under
                one-member-one-vote rules, and secures the chain on which they
                run.
              </p>
              <p>
                For legal service, GDPR requests, or anything touching the{" "}
                <Link href="/legal/privacy">Privacy Policy</Link>, use inquiry
                type <em>General inquiry</em> on the form above and begin the
                message with <em>&ldquo;Legal:&rdquo;</em>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
