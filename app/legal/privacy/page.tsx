import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy notice for veranacouncil.org.",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return (
    <section>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 prose-body">
        <nav className="text-sm text-muted mb-6 not-prose" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-indigo-primary">
            Home
          </Link>{" "}
          · <span className="text-ink">Privacy</span>
        </nav>
        <h1 className="text-4xl font-semibold mb-2">Privacy notice</h1>
        <p className="text-sm text-muted">
          Last updated: <span className="font-mono">2026-04-30</span>
        </p>

        <h2>What we collect</h2>
        <p>
          Application and contact-form submissions (the data you provide), and,
          with your consent, privacy-friendly analytics (self-hosted,
          IP-anonymized). We do not sell data and use no third-party marketing
          pixels.
        </p>

        <h2>Legal basis (GDPR Art. 6)</h2>
        <ul>
          <li>
            <strong>Applications and contact forms:</strong> Art. 6(1)(b):
            performance of a contract or pre-contractual steps at your request.
          </li>
          <li>
            <strong>Analytics:</strong> Art. 6(1)(a): consent (revocable at any
            time).
          </li>
        </ul>

        <h2>Your rights</h2>
        <p>
          Access, rectification, erasure, restriction, portability, and
          objection. Write to{" "}
          <a href="mailto:privacy@verana.io">privacy@verana.io</a>. You may also
          complain to the Swiss FDPIC or your local EU DPA.
        </p>

        <h2>Retention &amp; transfers</h2>
        <p>
          Application data is retained for the application process plus 24
          months for audit, then anonymized. Personal data is stored in
          Switzerland and the EEA.
        </p>
      </div>
    </section>
  );
}
