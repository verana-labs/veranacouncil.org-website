import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookies",
  description: "Cookie notice for veranacouncil.org.",
  alternates: { canonical: "/legal/cookies" },
};

export default function CookiesPage() {
  return (
    <section>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 prose-body">
        <nav className="text-sm text-muted mb-6 not-prose" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-indigo-primary">
            Home
          </Link>{" "}
          · <span className="text-ink">Cookies</span>
        </nav>
        <h1 className="text-4xl font-semibold mb-2">Cookie notice</h1>
        <p className="text-sm text-muted">
          Last updated: <span className="font-mono">2026-04-30</span>
        </p>

        <h2>What we use</h2>
        <ul>
          <li>
            <strong>Essential</strong> — required to run the site (e.g.
            remembering your theme and consent choices). Always on.
          </li>
          <li>
            <strong>Analytics</strong> — privacy-friendly, self-hosted,
            IP-anonymized. Off until you consent.
          </li>
        </ul>
        <p>
          We use no advertising cookies, no third-party marketing pixels, and no
          social-media tracking on this site.
        </p>

        <h2>Your choice</h2>
        <p>
          You can accept all or essential-only via the consent banner. To change
          your choice, clear this site&apos;s storage in your browser and
          reload. Questions:{" "}
          <a href="mailto:privacy@verana.io">privacy@verana.io</a>.
        </p>
      </div>
    </section>
  );
}
