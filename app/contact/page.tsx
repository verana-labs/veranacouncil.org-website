import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact the Verana Council Association. General inquiries, intro calls, and press.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
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
        </div>
      </section>

      <section className="border-b border-rule">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="card">
              <h3>General &amp; membership</h3>
              <p className="text-sm text-muted">
                Questions about the Council or a Founding seat. We respond
                within 5 business days.
              </p>
              <a
                href="mailto:council@verana.io"
                className="text-indigo-primary text-sm font-medium"
              >
                council@verana.io →
              </a>
              <a
                href="mailto:council@verana.io?subject=Intro%20call%20request"
                className="text-indigo-primary text-sm font-medium"
              >
                Book a 20-minute intro call →
              </a>
            </div>
            <div className="card">
              <h3>Press</h3>
              <p className="text-sm text-muted">
                48-hour response for credentialed press. Logos and boilerplate
                below.
              </p>
              <a
                href="mailto:press@verana.io"
                className="text-indigo-primary text-sm font-medium"
              >
                press@verana.io →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-semibold mb-6" id="press">
            Press inquiries
          </h2>
          <form
            className="card"
            action="mailto:press@verana.io"
            method="post"
            encType="text/plain"
          >
            <div className="form-field">
              <label htmlFor="press-name">Your name</label>
              <input id="press-name" name="name" type="text" required />
            </div>
            <div className="form-field">
              <label htmlFor="press-outlet">Outlet</label>
              <input id="press-outlet" name="outlet" type="text" required />
            </div>
            <div className="form-field">
              <label htmlFor="press-email">Email</label>
              <input id="press-email" name="email" type="email" required />
            </div>
            <div className="form-field">
              <label htmlFor="press-message">Message</label>
              <textarea id="press-message" name="message" rows={5} />
            </div>
            <button type="submit" className="btn btn-primary mt-2">
              Send
            </button>
          </form>
          <div className="mt-8 prose-body text-sm">
            <p>
              <strong>Boilerplate.</strong> The Verana Council Association is a
              non-profit Swiss Verein that governs the Verana public trust
              network. It authors and operates the Network Governance Framework
              and the ECS Ecosystem Governance Framework under
              one-member-one-vote rules, and secures the chain on which they
              run. Incorporates Q3 2026.
            </p>
            <p>
              <strong>Logos &amp; brand assets:</strong> released under CC-BY
              4.0 on request via{" "}
              <a href="mailto:press@verana.io">press@verana.io</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
