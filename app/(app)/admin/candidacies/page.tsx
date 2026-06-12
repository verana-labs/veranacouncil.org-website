import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/app/lib/db";
import { currentUser, isAdmin } from "@/app/lib/authz";
import { PageHero, Section } from "@/app/components/PageHero";
import { seatLabel } from "@/app/lib/seats";
import { seatedVoters } from "@/app/lib/ballots";
import CandidacyRow from "./CandidacyRow";

export const metadata: Metadata = { title: "Candidacies · Admin" };

export default async function AdminCandidaciesPage() {
  const user = await currentUser();
  if (!user || !(await isAdmin(user.email))) notFound();

  const candidacies = await db.candidacy.findMany({
    where: { status: { in: ["applied", "signed", "queued", "ballot_open"] } },
    include: {
      member: { select: { id: true, legalName: true, primaryEmail: true } },
      seat: true,
      ballot: true,
    },
    orderBy: { createdAt: "asc" },
  });
  const seatedCount = (await seatedVoters()).length;
  const seedSlotsLeft = Math.max(0, 3 - seatedCount);

  return (
    <>
      <PageHero back={{ href: "/admin", label: "Admin" }} title="Candidacies" />
      <Section bordered={false}>
        <p className="text-sm text-muted max-w-2xl">
          The candidacy pipeline: vetting (Membership &amp; Seats Committee — the
          steward pre-incorporation) → FIFO queue per seat → admission ballot
          (⅔ of {seatedCount} seated member{seatedCount === 1 ? "" : "s"}).
          {seedSlotsLeft > 0 && (
            <>
              {" "}
              <strong>{seedSlotsLeft}</strong> seed designation
              {seedSlotsLeft > 1 ? "s" : ""} remain
              {seedSlotsLeft === 1 ? "s" : ""} before the steward loses all
              admission power.
            </>
          )}
        </p>

        {candidacies.length === 0 ? (
          <p className="text-muted mt-6">No live candidacies.</p>
        ) : (
          <div className="mt-6 grid gap-4 max-w-3xl">
            {candidacies.map((c) => (
              <CandidacyRow
                key={c.id}
                candidacy={{
                  id: c.id,
                  status: c.status,
                  memberName: c.member.legalName,
                  memberId: c.member.id,
                  memberEmail: c.member.primaryEmail,
                  seatId: c.seatId,
                  seat: seatLabel(c.seat.sector, c.seat.region),
                  completedAt: c.completedAt?.toISOString() ?? null,
                  ballotCloses: c.ballot?.closesAt.toISOString() ?? null,
                }}
                seedAvailable={seedSlotsLeft > 0}
              />
            ))}
          </div>
        )}

        <p className="text-sm text-muted mt-8">
          <Link href="/admin/members" className="text-indigo hover:underline">
            All members →
          </Link>
        </p>
      </Section>
    </>
  );
}
