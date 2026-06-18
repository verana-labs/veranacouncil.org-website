import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@/app/lib/authz";
import { db } from "@/app/lib/db";
import ObserverApplyForm from "./ObserverApplyForm";

export const metadata: Metadata = { title: "Apply as a Public-Sector Observer" };

export default async function ApplyObserverPage() {
  // A person who already belongs to an org with a Council relationship (an
  // active membership, a pending/suspended application, or a live candidacy)
  // can't start a separate observer application.
  const user = await currentUser();
  const links = user
    ? await db.userMember.findMany({
        where: { userId: user.id },
        include: { member: { include: { membership: true, candidacies: true } } },
      })
    : [];
  const alreadyActive = links.find((l) => l.member.membership?.status === "active");
  const pendingApp = links.find(
    (l) =>
      l.member.membership &&
      ["pending", "suspended"].includes(l.member.membership.status),
  );
  const inFlight = links.find((l) =>
    l.member.candidacies.some((c) =>
      ["applied", "signed", "queued", "ballot_open"].includes(c.status),
    ),
  );
  const blocked = alreadyActive ?? pendingApp ?? inFlight ?? null;

  // Prefill from the org the user manages (re-application after an ended one).
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

  return (
    <>
      {/* Hero */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <p className="tag mb-4">Observer</p>
          <h1 className="display text-4xl sm:text-5xl leading-tight max-w-3xl">
            Apply as a Public-Sector Observer
          </h1>
          <div className="accent-line mt-6" />
          <p className="mt-8 text-lg text-muted max-w-2xl leading-relaxed">
            Membership is free. Observers are sovereigns and multilateral bodies
            that participate <strong>without a seat or vote</strong> — attendance
            and voice. Submit a <strong>non-binding application</strong>; the
            Council reviews and accepts it. There&rsquo;s no sector, region, or
            ballot.
          </p>
        </div>
      </section>

      {/* Application */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {blocked ? (
            <div className="card max-w-2xl">
              <h3>
                {alreadyActive
                  ? "Your organization already holds a Council membership"
                  : pendingApp
                    ? "Your organization already has an application under review"
                    : "Your organization already has a candidacy"}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                You belong to{" "}
                <strong className="text-ink">{blocked.member.legalName}</strong>.
                See it in your{" "}
                <Link href="/account" className="text-indigo hover:underline">
                  account
                </Link>
                .
              </p>
            </div>
          ) : (
            <ObserverApplyForm
              prefillContactName={user?.name ?? undefined}
              prefill={prefill}
            />
          )}
        </div>
      </section>
    </>
  );
}
