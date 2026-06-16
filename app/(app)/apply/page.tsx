import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@/app/lib/authz";
import { db } from "@/app/lib/db";
import { SECTORS, REGIONS, SECTOR_LABELS, REGION_LABELS, loadSeatSummary } from "@/app/lib/seats";
import ApplyForm from "./ApplyForm";

export const metadata: Metadata = { title: "Apply for a Founding Council Seat" };

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string }>;
}) {
  const { sector } = await searchParams;
  const summary = await loadSeatSummary();
  const full = summary.remaining <= 0;

  const prefillSector =
    sector && (SECTORS as string[]).includes(sector) ? sector : undefined;

  // A person who already belongs to a seated member — or to an org with a
  // candidacy in flight (any role) — can't start a separate candidacy.
  const user = await currentUser();
  const links = user
    ? await db.userMember.findMany({
        where: { userId: user.id },
        include: { member: { include: { membership: true, candidacies: true } } },
      })
    : [];
  const alreadyMember = links.find((l) => l.member.membership?.status === "active");
  const inFlight = links.find((l) =>
    l.member.candidacies.some((c) =>
      ["applied", "signed", "queued", "ballot_open"].includes(c.status),
    ),
  );
  const blocked = alreadyMember ?? inFlight ?? null;

  // Re-application (e.g. after a refusal): prefill the org the user manages.
  const link = links.find((l) => l.role === "manager") ?? null;
  const prefill = link
    ? {
        legalName: link.member.legalName,
        entityType: link.member.entityType,
        jurisdiction: link.member.jurisdiction,
        registeredAddress: link.member.registeredAddress,
        website: link.member.website,
      }
    : null;

  const sectorOptions = SECTORS.map((s) => ({ value: s, label: SECTOR_LABELS[s] }));
  const regionOptions = REGIONS.map((r) => ({ value: r, label: REGION_LABELS[r] }));

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
            Membership is free. Pick the sector and region that fit your
            organization and submit a <strong>non-binding expression of
            interest</strong> — no document to sign, nothing for legal to clear.
            Admission is decided by a ⅔ vote of the seated members.
            {" "}
            {summary.seated} of {summary.cap} seats are filled.
          </p>
        </div>
      </section>

      {/* Candidacy */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {blocked ? (
            <div className="card max-w-2xl">
              <h3>
                {alreadyMember
                  ? "Your organization already holds a seat"
                  : "Your organization already has a candidacy"}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                You belong to{" "}
                <strong className="text-ink">{blocked.member.legalName}</strong>
                {alreadyMember
                  ? ", a seated Council member — an organization holds a single seat, so there's no separate seat to apply for."
                  : ", whose candidacy is under review — one candidacy per organization at a time."}{" "}
                See it in your{" "}
                <Link href="/account" className="text-indigo hover:underline">
                  account
                </Link>
                .
              </p>
            </div>
          ) : full ? (
            <div className="card max-w-2xl">
              <h3>All {summary.cap} seats are filled</h3>
              <p className="text-sm text-muted leading-relaxed">
                The Founding Council has reached its cap. You can still register
                interest as a successor candidate via the{" "}
                <Link href="/contact" className="text-indigo hover:underline">
                  contact form
                </Link>{" "}
                (inquiry type <em>Council membership</em>); a seat may reopen on
                term non-renewal or departure.
              </p>
            </div>
          ) : (
            <ApplyForm
              sectors={sectorOptions}
              regions={regionOptions}
              prefillSector={prefillSector}
              prefillContactName={user?.name ?? undefined}
              prefill={prefill}
            />
          )}
        </div>
      </section>
    </>
  );
}
