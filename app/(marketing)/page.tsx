import Link from "next/link";
import { latestRecord } from "@/app/lib/record";
import SeatBoard from "@/app/components/SeatBoard";
import HeroRing from "@/app/components/HeroRing";

// Live data (seat board / record) on every request — never prerender.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const record = await latestRecord(3);

  return (
    <>
      {/* Hero */}
      <section className="hero-glow relative overflow-hidden border-b border-rule">
        <HeroRing />
        {/* Surface wash above the canvas, below the copy, so the headline
            reads while the council ring stays full-bleed on the right. */}
        <div className="hero-vignette" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <p className="tag mb-4">Verana Council</p>
          <h1 className="display text-4xl sm:text-6xl leading-tight max-w-4xl">
            The governance body of the open public trust layer.
          </h1>
          <div className="accent-line mt-8" />
          <p className="mt-8 text-lg text-muted max-w-2xl leading-relaxed">
            The Verana Council Association authors and operates the governance
            frameworks of the Verana network, and is the sole body that governs
            and secures it.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/join" className="btn btn-primary">
              Apply for a Founding Council Seat
            </Link>
            <Link href="/council-bodies" className="btn btn-secondary">
              Read the frameworks
            </Link>
          </div>
        </div>
      </section>

      {/* What the Council is */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <p className="tag mb-3">What the Council is</p>
          <h2 className="display text-3xl">Four facts</h2>
          <div className="accent-line mt-4 mb-10" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <h3>Non-profit Swiss Verein</h3>
              <p className="text-sm text-muted leading-relaxed">
                Art. 60 ZGB, in formation — target incorporation Q3 2026.
                General Assembly, Board, committees. Membership is free.
              </p>
            </div>
            <div className="card">
              <h3>One member, one vote</h3>
              <p className="text-sm text-muted leading-relaxed">
                Seat-diversity rule — a broad spread across sectors and regions,
                capped at 25 members. A ⅔ supermajority for any
                protocol-governance change.
              </p>
            </div>
            <div className="card">
              <h3>Authors &amp; operates the frameworks</h3>
              <p className="text-sm text-muted leading-relaxed">
                The Network GF, the ECS-EGF covering the four Essential
                Credential Schemas, and the Template EGF for sector ecosystems.
              </p>
            </div>
            <div className="card">
              <h3>Sole securer of the network</h3>
              <p className="text-sm text-muted leading-relaxed">
                Only Council members may — and must — run a validator node.
                Everything else on the network is permissionless.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Seats */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <p className="tag mb-3">Seats</p>
          <h2 className="display text-3xl">Founding Council seats</h2>
          <div className="accent-line mt-4 mb-4" />
          <p className="text-muted text-sm max-w-2xl mb-8">
            A capped, diverse council — broad spread across sectors and regions.
            An open seat is an invitation.
          </p>
          <SeatBoard compact />
          <p className="text-sm mt-6">
            <Link href="/members" className="text-indigo hover:underline">
              Members &amp; how seats work →
            </Link>
          </p>
        </div>
      </section>

      {/* Latest record */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <p className="tag mb-3">Public record</p>
          <h2 className="display text-3xl">Latest entries</h2>
          <div className="accent-line mt-4 mb-10" />
          {record.length === 0 ? (
            <p className="text-muted text-sm">
              The record opens with the first candidacy.
            </p>
          ) : (
            <ul className="grid gap-3 max-w-3xl">
              {record.map((e) => (
                <li key={e.id} className="flex gap-4 text-sm">
                  <span className="font-mono text-muted whitespace-nowrap">
                    {e.publishedAt.toISOString().slice(0, 10)}
                  </span>
                  <span>{e.title}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-sm mt-6">
            <Link href="/news" className="text-indigo hover:underline">
              The full record →
            </Link>
          </p>
        </div>
      </section>

      {/* Provisional-governance note */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-sm text-muted max-w-3xl">
            Pre-mainnet, admissions are decided through this site&rsquo;s
            provisional voting mechanism; at mainnet launch all Council voting
            moves on-chain, exercised via validator nodes.{" "}
            <Link href="/about" className="text-indigo hover:underline">
              How the Council operates →
            </Link>
          </p>
        </div>
      </section>

      {/* Apply CTA */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="card p-10 text-center">
            <h2 className="display text-2xl sm:text-3xl">
              Founding Council recruitment is open through Q4 2026.
            </h2>
            <p className="text-muted mt-3 max-w-xl mx-auto">
              Governments, standards bodies, enterprises, and academic
              institutions. Membership is free; every member runs a validator.
            </p>
            <div className="mt-6">
              <Link href="/join" className="btn btn-primary">
                Apply for a Founding Council Seat
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
