import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <p className="eyebrow mb-4">Verana Council Association</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight max-w-4xl">
            The governance body of the open public trust layer.
          </h1>
          <p className="mt-6 text-lg text-muted max-w-2xl leading-relaxed">
            A non-profit Swiss Verein that authors and operates the two
            frameworks governing verifiable trust on the Verana network, and
            secures the chain on which they run. One-member-one-vote. Founding
            Members co-author the rules through Q3 2026.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/join" className="btn btn-primary">
              Apply for a Founding Council Seat
            </Link>
            <Link href="/governance" className="btn btn-secondary">
              Read the frameworks
            </Link>
          </div>
        </div>
      </section>

      {/* What the Council is */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="w-10 h-10 rounded-full bg-indigo-primary/10 flex items-center justify-center mb-4">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2E2A8F"
                  strokeWidth="1.75"
                  aria-hidden="true"
                >
                  <path d="M4 21V8l8-5 8 5v13M9 21v-8h6v8" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Non-profit Swiss Verein</h3>
              <p className="text-sm text-muted leading-relaxed">
                Art. 60 ZGB. No commercial ownership, no single controller.
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-indigo-primary/10 flex items-center justify-center mb-4">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2E2A8F"
                  strokeWidth="1.75"
                  aria-hidden="true"
                >
                  <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M21 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  <circle cx="10" cy="7" r="4" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">One-member-one-vote</h3>
              <p className="text-sm text-muted leading-relaxed">
                Equal voice across sectors and regions, enforced by a
                seat-diversity rule.
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-indigo-primary/10 flex items-center justify-center mb-4">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2E2A8F"
                  strokeWidth="1.75"
                  aria-hidden="true"
                >
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20v-5M4 19.5V5a2 2 0 012-2h14v14" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Two frameworks</h3>
              <p className="text-sm text-muted leading-relaxed">
                The Network GF and the ECS-EGF, authored and operated
                transparently.
              </p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-indigo-primary/10 flex items-center justify-center mb-4">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#2E2A8F"
                  strokeWidth="1.75"
                  aria-hidden="true"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Operates the chain</h3>
              <p className="text-sm text-muted leading-relaxed">
                Every Member runs a validator node. The Council secures the
                chain it governs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest news */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl font-semibold">Latest news</h2>
            <Link
              href="/news"
              className="text-sm text-indigo-primary hover:underline"
            >
              All news →
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            <article className="card">
              <p className="text-xs uppercase tracking-wider text-muted">
                Governance · 2026-04
              </p>
              <h3 className="mt-1">Founding Council recruitment opens</h3>
              <p className="text-sm text-muted">
                The consortium-in-formation begins signing Letters of Intent
                with prospective Founding Members.
              </p>
            </article>
            <article className="card">
              <p className="text-xs uppercase tracking-wider text-muted">
                Frameworks · 2026-03
              </p>
              <h3 className="mt-1">Draft frameworks published</h3>
              <p className="text-sm text-muted">
                Network GF and ECS-EGF v_DRAFT_0.9 published for Founding Member
                review.
              </p>
            </article>
            <article className="card">
              <p className="text-xs uppercase tracking-wider text-muted">
                Network · 2025-Q4
              </p>
              <h3 className="mt-1">Testnet live</h3>
              <p className="text-sm text-muted">
                Layer-1 chain, indexer, resolver, visualizer, and faucet are
                operational on testnet.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Join CTA */}
      <section className="bg-indigo-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold">
              Founding Members write the rules.
            </h2>
            <p className="mt-2 text-white/80 max-w-2xl">
              Co-author the bylaws and frameworks before incorporation in Q3
              2026.
            </p>
          </div>
          <Link href="/join" className="btn btn-inverse flex-shrink-0">
            Join the Council
          </Link>
        </div>
      </section>
    </>
  );
}
