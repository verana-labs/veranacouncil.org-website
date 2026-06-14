import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/app/lib/db";
import { seatLabel } from "@/app/lib/seats";
import SeatBoard from "@/app/components/SeatBoard";

export const metadata: Metadata = { title: "Members" };

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  // Admin-curated (`listed`) active members & observers.
  const members = await db.member.findMany({
    where: { membership: { status: "active", listed: true } },
    include: { membership: true },
    orderBy: { createdAt: "asc" },
  });
  const founding = members.filter((m) => m.membership?.track === "founding_member");
  const observers = members.filter((m) => m.membership?.track === "observer");

  return (
    <>
      {/* Hero */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <p className="tag mb-4">Members</p>
          <h1 className="display text-4xl sm:text-5xl leading-tight max-w-3xl">
            Members &amp; seats
          </h1>
          <div className="accent-line mt-6" />
          <p className="mt-8 text-lg text-muted max-w-2xl leading-relaxed">
            A capped, diverse council — broad spread across sectors and regions.
            An open seat is an invitation.
          </p>
        </div>
      </section>

      {/* The seat board */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="tag mb-3">Seats</p>
          <h2 className="display text-3xl">The seat board</h2>
          <div className="accent-line mt-4 mb-8" />
          <SeatBoard />
        </div>
      </section>

      {/* How seats work */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="tag mb-3">How seats work</p>
          <h2 className="display text-3xl">One ballot per candidate</h2>
          <div className="accent-line mt-4 mb-6" />
          <p className="max-w-3xl text-sm leading-relaxed">
            A candidate applies under one sector and declares its region.
            Admission is decided by a ⅔ supermajority of seated members —
            accept or refuse, one ballot per candidate, never head-to-head.
            Up to 25 Founding Member seats; the Membership &amp; Seats Committee
            keeps a broad spread across sectors and regions. Validator terms are
            fixed, with formal renewal.
          </p>
        </div>
      </section>

      {/* Directory */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="tag mb-3">Directory</p>
          <h2 className="display text-3xl">Members &amp; Observers</h2>
          <div className="accent-line mt-4 mb-10" />
          {members.length === 0 ? (
            <p className="text-muted text-sm">
              The directory opens with the first seating. Founding Council
              recruitment is open through Q4 2026.
            </p>
          ) : (
            <>
              {founding.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {founding.map((m) => (
                    <div key={m.id} className="card">
                      <div className="flex items-center gap-3">
                        {m.logoUri && m.logoDisplayConsent && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`/logo/${m.id}?v=${m.updatedAt.getTime()}`}
                            alt=""
                            className="h-9 w-9 object-contain rounded"
                          />
                        )}
                        <h3>{m.legalName}</h3>
                      </div>
                      {m.membership?.sector && m.membership?.region && (
                        <p className="text-sm font-mono mt-1">
                          {seatLabel(m.membership.sector, m.membership.region)}
                        </p>
                      )}
                      <p className="text-xs text-muted mt-1">
                        Seated{" "}
                        {m.membership?.seatedAt?.toISOString().slice(0, 10) ?? "—"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {observers.length > 0 && (
                <>
                  <h3 className="display text-xl mt-10 mb-4">
                    Public-Sector Observers
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {observers.map((m) => (
                      <div key={m.id} className="card">
                        <h3>{m.legalName}</h3>
                        <p className="text-xs text-muted mt-1">
                          Observer (non-voting)
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* Become a member */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="card p-10 text-center">
            <h2 className="display text-2xl">Become a Member</h2>
            <p className="text-muted mt-3 max-w-xl mx-auto text-sm">
              Membership is free. Pick your sector and region, and apply.
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
