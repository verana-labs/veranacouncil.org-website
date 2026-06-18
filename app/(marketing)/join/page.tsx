import type { Metadata } from "next";
import Link from "next/link";
import SeatBoard from "@/app/components/SeatBoard";

// Live data (seat board / record) on every request — never prerender.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Apply for a Founding Council Seat" };

export default function JoinPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <p className="tag mb-4">Join</p>
          <h1 className="display text-4xl sm:text-5xl leading-tight max-w-3xl">
            Apply for a Founding Council Seat
          </h1>
          <div className="accent-line mt-6" />
          <p className="mt-8 text-lg text-muted max-w-2xl leading-relaxed">
            Two tracks; membership is free — no dues, no capital contribution.
            Recruitment is open through Q4 2026. One status: Founding Member =
            Verein member = General Assembly voter = validator operator. Seated
            members also receive a complimentary Verana Foundation Associate
            Membership (dues waived).
          </p>
        </div>
      </section>

      {/* Two tracks */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="tag mb-3">Tracks</p>
          <h2 className="display text-3xl">Two ways to participate</h2>
          <div className="accent-line mt-4 mb-10" />
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl">
            <div className="card">
              <div className="flex gap-2">
                <span className="badge badge-purple">Founding Member</span>
                <span className="badge badge-indigo">voting</span>
                <span className="badge">free</span>
              </div>
              <p className="text-sm text-muted leading-relaxed mt-3">
                Governments, standards bodies, enterprises, academic
                institutions. Co-authors the frameworks through the formation
                period; <strong>should run a validator node on the Verana
                testnet during formation</strong> (the readiness step for the
                genesis validator set), and <strong>operates a mainnet
                validator from launch</strong> — mandatory, since voting is
                exercised on-chain via the validator. Admission by ⅔ vote of
                seated members.
              </p>
            </div>
            <div className="card">
              <div className="flex gap-2">
                <span className="badge badge-purple">Public-Sector Observer</span>
                <span className="badge">non-voting</span>
                <span className="badge">free</span>
              </div>
              <p className="text-sm text-muted leading-relaxed mt-3">
                Sovereigns and multilateral bodies that cannot join a Swiss
                Verein under procurement or sovereign-immunity rules.
                Contractual participation: attendance and voice, no vote, no
                seat. Submit a non-binding application — no sector, region, or
                ballot; the Council reviews and accepts it (steward
                pre-incorporation, Board thereafter). Convertible to membership.{" "}
                <Link href="/apply-observer" className="text-indigo hover:underline">
                  Apply as Observer →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How admission works */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="tag mb-3">Admission</p>
          <h2 className="display text-3xl">How admission works</h2>
          <div className="accent-line mt-4 mb-6" />
          <ol className="grid gap-4 max-w-3xl text-sm leading-relaxed list-decimal pl-5">
            <li>
              <strong>Apply</strong> — sign in (Google, GitHub, or an email
              code), pick the sector and region that fit your organization, and
              submit a <strong>non-binding expression of interest</strong>. No
              document is signed; any authorized representative can do this
              without legal review.
            </li>
            <li>
              <strong>Vetting</strong> — the Membership &amp; Seats Committee
              (the steward, pre-incorporation) runs due diligence. No
              Foundation membership or other third-party status is required.
            </li>
            <li>
              <strong>Ballot</strong> — one vote per candidate, accept or
              refuse, by a ⅔ supermajority of seated members, in an async
              14-day window. Admissions stop at the 25-seat cap.
            </li>
            <li>
              <strong>Seated &amp; bound</strong> — once accepted, your
              organization is named on the public record, and the binding
              <strong> Council Membership Agreement</strong> is executed from
              your account — reviewed by your legal team, signed by an
              authorized signatory. A refused candidate may re-apply under
              another sector/region.
            </li>
          </ol>
          <p className="max-w-3xl text-sm text-muted leading-relaxed mt-6">
            Bootstrap transparency: the first 3 members (2060 plus the first 2
            vetted candidates) are designated by the steward with a published
            rationale; from candidate #4 onward, every admission goes through
            the peer vote. All pre-incorporation seatings are ratified at the
            constitutive General Assembly. This admission mechanism is
            provisional and sunsets at mainnet launch, when all Council voting
            moves on-chain.
          </p>
        </div>
      </section>

      {/* Pick a seat */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="tag mb-3">Open seats</p>
          <h2 className="display text-3xl">Seats at a glance</h2>
          <div className="accent-line mt-4 mb-8" />
          <SeatBoard compact cta={false} />
          <div className="mt-6">
            <Link href="/apply" className="btn btn-primary">
              Start a candidacy →
            </Link>
            <p className="text-sm text-muted mt-3">
              Pick your sector and region in the form. Pre-incorporation
              submissions are confidential.
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-sm text-muted">
            Questions? Use the{" "}
            <Link href="/contact" className="text-indigo hover:underline">
              contact form
            </Link>{" "}
            (inquiry type <em>Council membership</em>).
          </p>
        </div>
      </section>
    </>
  );
}
