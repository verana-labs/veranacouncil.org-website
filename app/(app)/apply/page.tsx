import type { Metadata } from "next";
import Link from "next/link";
import { getActiveAgreement } from "@/app/lib/agreement";
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
  const agreement = await getActiveAgreement();
  const summary = await loadSeatSummary();
  const full = summary.remaining <= 0;

  const prefillSector =
    sector && (SECTORS as string[]).includes(sector) ? sector : undefined;

  // Re-application / successor candidacy: prefill the org the user manages.
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
            organization, e-sign the Candidate Agreement, and your candidacy
            enters vetting; admission is decided by a ⅔ vote of the seated
            members. {summary.seated} of {summary.cap} seats are filled.
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
              agreementVersion={agreement.version}
              sectors={sectorOptions}
              regions={regionOptions}
              prefillSector={prefillSector}
              prefill={prefill}
            />
          )}
        </div>
      </section>
    </>
  );
}
