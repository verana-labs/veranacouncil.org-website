import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <p className="tag mb-4">About</p>
          <h1 className="display text-4xl sm:text-5xl leading-tight max-w-3xl">
            Who the Council is and how it runs
          </h1>
          <div className="accent-line mt-6" />
          <p className="mt-8 text-lg text-muted max-w-2xl leading-relaxed">
            The non-profit governance body of Verana&rsquo;s open public trust
            layer — structurally uncapturable, fully separate from the Verana
            Foundation.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="tag mb-3">Mission</p>
          <h2 className="display text-3xl">What the Council does</h2>
          <div className="accent-line mt-4 mb-6" />
          <p className="max-w-3xl leading-relaxed">
            The Verana Council Association authors and operates the governance
            frameworks of the Verana network and is the <strong>sole</strong>{" "}
            body that governs and secures the live network. Only Council
            members may — and must — run a validator node; all other network
            modules are permissionless, since their data is derived from the
            ledger.
          </p>
        </div>
      </section>

      {/* Structure */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="tag mb-3">Structure</p>
          <h2 className="display text-3xl">A non-profit Swiss Verein</h2>
          <div className="accent-line mt-4 mb-6" />
          <p className="max-w-3xl leading-relaxed text-sm text-muted mb-8">
            Art. 60 ZGB, in formation; target incorporation Q4 2026. Statutes
            and bylaws live in the public governance repository.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="card">
              <h3>General Assembly</h3>
              <p className="text-sm text-muted leading-relaxed">
                The supreme organ: statutes, Board election, accounts &amp;
                budget, admissions and expulsions, dissolution. All seated
                Founding Members, one vote each; Observers attend and speak, no
                vote.
              </p>
            </div>
            <div className="card">
              <h3>Board</h3>
              <p className="text-sm text-muted leading-relaxed">
                Small, elected by the General Assembly on fixed, staggered
                terms; runs and legally represents the association. A Board
                seat carries <strong>zero network authority</strong> — a
                capture-resistance feature.
              </p>
            </div>
            <div className="card">
              <h3>Committees</h3>
              <p className="text-sm text-muted leading-relaxed">
                Created by statute as needed — e.g. Membership &amp; Seats
                (vets candidates, keeps the sector/region balance) and Technical / Validator
                (readiness, terms, renewals).
              </p>
            </div>
          </div>
          <p className="text-sm mt-6">
            <a
              href="https://github.com/verana-labs/verana-council-gov"
              rel="noopener"
              className="text-indigo hover:underline"
            >
              Bylaws &amp; governance documents ↗
            </a>
          </p>
        </div>
      </section>

      {/* Two layers */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="tag mb-3">Two governance layers, one membership</p>
          <h2 className="display text-3xl">Association vs. network</h2>
          <div className="accent-line mt-4 mb-8" />
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl">
            <div className="card">
              <h3>Association governance</h3>
              <p className="text-sm text-muted leading-relaxed">
                The Verein itself — statutes, budget, admissions: General
                Assembly + Board, under Swiss law and the statutes.
              </p>
            </div>
            <div className="card">
              <h3>Network governance</h3>
              <p className="text-sm text-muted leading-relaxed">
                The protocol — frameworks and parameters: exercised on-chain
                via validator nodes after mainnet (provisional mechanism
                before), with a ⅔ supermajority for any protocol-governance
                change.
              </p>
            </div>
          </div>
          <p className="max-w-3xl leading-relaxed text-sm text-muted mt-6">
            The statutes are the hinge: the association recognizes on-chain
            outcomes — the General Assembly gets no second vote on what the
            chain decided, and the chain does not manage the association.
          </p>
        </div>
      </section>

      {/* How we operate */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="tag mb-3">How we operate</p>
          <h2 className="display text-3xl">Rules of the Council</h2>
          <div className="accent-line mt-4 mb-6" />
          <ul className="grid gap-3 max-w-3xl text-sm leading-relaxed list-disc pl-5">
            <li>One member, one vote.</li>
            <li>Seat-diversity rule: broad spread across sectors and regions, capped at 25 members.</li>
            <li>⅔ supermajority for any protocol-governance change.</li>
            <li>Fixed validator terms, with formal renewal.</li>
            <li>
              Membership is free — no dues, no capital contribution; the
              statutes exclude personal financial liability of members
              (Art. 75a ZGB).
            </li>
            <li>
              Founding Member = Verein member = General Assembly voter =
              validator operator: one status.
            </li>
          </ul>
        </div>
      </section>

      {/* Funding */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="tag mb-3">Funding</p>
          <h2 className="display text-3xl">Who pays for the Council</h2>
          <div className="accent-line mt-4 mb-6" />
          <p className="max-w-3xl leading-relaxed text-sm">
            Membership is free. Before network launch, the association&rsquo;s
            costs are covered by 2060 OÜ as steward. After launch, the network
            funds its own governance through a protocol-defined on-chain
            allocation. The Council does not issue or own the VNA token.
            Members bear their own validator running costs, offset after launch
            by on-chain validator rewards.
          </p>
        </div>
      </section>

      {/* Status */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="tag mb-3">Status</p>
          <h2 className="display text-3xl">In formation</h2>
          <div className="accent-line mt-4 mb-6" />
          <p className="max-w-3xl leading-relaxed text-sm">
            The Verana Council Association is in formation; 2060 OÜ acts as
            steward pre-incorporation. Pre-incorporation seatings are ratified
            en bloc at the constitutive General Assembly. Pre-mainnet,
            admissions run through this site&rsquo;s provisional ballot
            mechanism; at mainnet launch all Council voting moves on-chain.
          </p>
        </div>
      </section>

      {/* What the Council is not */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="tag mb-3">Hard limits</p>
          <h2 className="display text-3xl">What the Council is not</h2>
          <div className="accent-line mt-4 mb-6" />
          <ul className="grid gap-3 max-w-3xl text-sm leading-relaxed list-disc pl-5">
            <li>
              Not a standards body — the specifications are owned and hosted by
              the{" "}
              <a
                href="https://veranafoundation.org"
                rel="noopener"
                className="text-indigo hover:underline"
              >
                Verana Foundation ↗
              </a>
              .
            </li>
            <li>Not a product vendor.</li>
            <li>Not a sector-EGF authority.</li>
            <li>Not a grant-making body.</li>
            <li>Not the issuer or owner of the VNA token.</li>
            <li>Not single-company controlled.</li>
          </ul>
          <p className="text-sm text-muted mt-6 max-w-3xl">
            Specifications, open-source software, token issuance, and ecosystem
            growth are the Foundation&rsquo;s domain. The Council and the
            Foundation are fully separate.
          </p>
          <div className="mt-6">
            <Link href="/join" className="btn btn-primary">
              Apply for a Founding Council Seat →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
