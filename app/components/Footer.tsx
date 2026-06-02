"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CONSENT_KEY = "vc-cookie-consent";

export default function Footer() {
  const [showBanner, setShowBanner] = useState(false);
  const year = new Date().getFullYear();

  useEffect(() => {
    setShowBanner(localStorage.getItem(CONSENT_KEY) === null);
  }, []);

  function setConsent(value: "all" | "essential") {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {}
    setShowBanner(false);
  }

  return (
    <>
      <footer className="site-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
            <div>
              <h3>Council</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about">About</Link>
                </li>
                <li>
                  <Link href="/governance">Governance</Link>
                </li>
                <li>
                  <Link href="/members">Members</Link>
                </li>
                <li>
                  <Link href="/news">News</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3>Participate</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/join">Join the Council</Link>
                </li>
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3>Documents</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://github.com/verana-labs/verana-council-gov"
                    rel="noopener"
                  >
                    Governance docs ↗
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/verana-labs/verana-council-gov/tree/main/bylaws"
                    rel="noopener"
                  >
                    Bylaws ↗
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/verana-labs/verana-council-gov/tree/main/code-of-conduct"
                    rel="noopener"
                  >
                    Code of Conduct ↗
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3>Related sites</h3>
              <ul className="space-y-2">
                <li>
                  <a href="https://verana.io" rel="noopener">
                    Verana network ↗
                  </a>
                </li>
                <li>
                  <a href="https://docs.verana.io" rel="noopener">
                    Verana docs ↗
                  </a>
                </li>
                <li>
                  <a
                    href="https://verana-labs.github.io/verifiable-trust-spec/"
                    rel="noopener"
                  >
                    Verifiable Trust spec ↗
                  </a>
                </li>
                <li>
                  <a
                    href="https://verana-labs.github.io/verifiable-trust-vpr-spec/"
                    rel="noopener"
                  >
                    VPR spec ↗
                  </a>
                </li>
                <li>
                  <a href="https://github.com/verana-labs" rel="noopener">
                    GitHub ↗
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-14 pt-8 border-t border-rule flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-muted">
            <p>
              © {year} Verana Council Association (consortium-in-formation)
            </p>
            <ul className="flex flex-wrap gap-4">
              <li>
                <Link href="/legal/privacy">Privacy</Link>
              </li>
              <li>
                <Link href="/legal/terms">Terms</Link>
              </li>
              <li>
                <Link href="/legal/cookies">Cookies</Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>

      {showBanner && (
        <div
          className="cookie-banner"
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
        >
          <p className="mb-3 text-ink text-sm">
            We use essential cookies to run this site and, with your consent,
            analytics cookies to improve it. We do not sell data.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setConsent("all")}
              className="btn btn-primary text-sm px-4 py-2"
            >
              Accept all
            </button>
            <button
              type="button"
              onClick={() => setConsent("essential")}
              className="btn btn-secondary text-sm px-4 py-2"
            >
              Essential only
            </button>
            <Link href="/legal/cookies" className="btn btn-ghost text-sm">
              Preferences
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
