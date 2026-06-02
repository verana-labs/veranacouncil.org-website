import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for veranacouncil.org.",
  alternates: { canonical: "/legal/terms" },
};

export default function TermsPage() {
  return (
    <section>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 prose-body">
        <nav className="text-sm text-muted mb-6 not-prose" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-indigo-primary">
            Home
          </Link>{" "}
          · <span className="text-ink">Terms</span>
        </nav>
        <h1 className="text-4xl font-semibold mb-2">Terms of use</h1>
        <p className="text-sm text-muted">
          Last updated: <span className="font-mono">2026-04-30</span>
        </p>

        <h2>Scope</h2>
        <p>
          These terms govern use of <code>veranacouncil.org</code> and its
          content. They do not govern membership in the Verana Council
          Association; that is governed by the Bylaws and your Membership
          Agreement.
        </p>

        <h2>Content license</h2>
        <p>
          Unless otherwise noted, text content on this site is published under{" "}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/">
            CC-BY-SA 4.0
          </a>
          . Logos and brand assets are released under CC-BY 4.0.
        </p>

        <h2>No legal advice</h2>
        <p>
          Nothing on this site constitutes legal, financial, or regulatory
          advice. Institutional decisions must be made with your own qualified
          advisors.
        </p>

        <h2>Third-party links</h2>
        <p>
          Links to third-party sites (<code>verana.io</code>,{" "}
          <code>docs.verana.io</code>, <code>github.com/verana-labs</code>) are
          provided for reference. The Council is not responsible for third-party
          content.
        </p>
      </div>
    </section>
  );
}
