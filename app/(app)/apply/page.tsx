import type { Metadata } from "next";
import Link from "next/link";
import { getActiveAgreement } from "@/app/lib/agreement";
import { currentUser } from "@/app/lib/authz";
import { db } from "@/app/lib/db";
import { seatLabel } from "@/app/lib/seats";
import ApplyForm from "./ApplyForm";

export const metadata: Metadata = { title: "Apply for a Founding Council Seat" };

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ seat?: string }>;
}) {
  const { seat: seatId } = await searchParams;
  const agreement = await getActiveAgreement();

  const seat = seatId
    ? await db.seatCell.findUnique({ where: { id: seatId } })
    : null;
  const seatOpen = !!seat && !seat.seatedMemberId;

  // Seat-switch / successor candidacy: prefill the org the user manages.
  const user = await currentUser();
  const link = user
    ? await db.userMember.findFirst({
        where: { userId: user.id, role: "manager" },
        include: { member: true },
      })
    : null;
  const prefill = link
    ? {
        legalName: link.member.legalName,
        entityType: link.member.entityType,
        jurisdiction: link.member.jurisdiction,
        registeredAddress: link.member.registeredAddress,
      }
    : null;

  return (
    <>
      {/* Hero */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <p className="tag mb-4">Apply</p>
          <h1 className="display text-4xl sm:text-5xl leading-tight max-w-3xl">
            Apply for a Founding Council Seat
          </h1>
          <div className="accent-line mt-6" />
          <p className="mt-8 text-lg text-muted max-w-2xl leading-relaxed">
            Membership is free. Select an open seat, e-sign the Candidate
            Agreement, and your candidacy enters vetting; admission is decided
            by a ⅔ vote of the seated members, one ballot per candidate.
          </p>
        </div>
      </section>

      {/* Candidacy */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {!agreement ? (
            <p className="text-muted">
              Candidacies aren&rsquo;t open yet — no Candidate Agreement is
              configured.
            </p>
          ) : !seat ? (
            <p className="text-muted">
              Choose an open seat from the{" "}
              <Link href="/members" className="underline">
                seat matrix
              </Link>{" "}
              to start a candidacy.
            </p>
          ) : !seatOpen ? (
            <p className="text-muted">
              This seat has been taken. Choose another open seat from the{" "}
              <Link href="/members" className="underline">
                seat matrix
              </Link>
              .
            </p>
          ) : (
            <ApplyForm
              agreementVersion={agreement.version}
              seat={{ id: seat.id, label: seatLabel(seat.sector, seat.region) }}
              prefill={prefill}
            />
          )}
        </div>
      </section>
    </>
  );
}
