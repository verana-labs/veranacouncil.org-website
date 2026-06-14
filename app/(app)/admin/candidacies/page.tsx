import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/app/lib/db";
import { currentUser, isAdmin } from "@/app/lib/authz";
import { PageHero, Section } from "@/app/components/PageHero";
import { seatLabel, COUNCIL_SEAT_CAP } from "@/app/lib/seats";
import { seatedCount as countSeated } from "@/app/lib/ballots";
import CandidacyRow from "./CandidacyRow";

export const metadata: Metadata = { title: "Candidacies · Admin" };

export default async function AdminCandidaciesPage() {
  const user = await currentUser();
  if (!user || !(await isAdmin(user.email))) notFound();

  const candidacies = await db.candidacy.findMany({
    where: { status: { in: ["applied", "signed", "queued", "ballot_open"] } },
    include: {
      member: { select: { id: true, legalName: true, primaryEmail: true } },
      ballot: true,
    },
    orderBy: { createdAt: "asc" },
  });
  const seated = await countSeated();
  const seedSlotsLeft = Math.max(0, 3 - seated);

  return (
    <>
      <PageHero back={{ href: "/admin", label: "Admin" }} title="Candidacies" />
      <Section bordered={false}>
        <p className="text-sm text-muted max-w-2xl">
          The candidacy pipeline: vetting (Membership &amp; Seats Committee — the
          steward pre-incorporation) → admission ballot (⅔ of {seated} seated
          member{seated === 1 ? "" : "s"}). {seated} of {COUNCIL_SEAT_CAP} seats
          filled.
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
                  seat: seatLabel(c.sector, c.region),
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
