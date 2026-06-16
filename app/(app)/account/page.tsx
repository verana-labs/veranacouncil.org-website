import type { Metadata } from "next";
import Link from "next/link";
import { currentUser, effectiveMemberships } from "@/app/lib/authz";
import { db } from "@/app/lib/db";
import { seatLabel } from "@/app/lib/seats";
import { isAgreementSigningEnabled } from "@/app/lib/settings";
import {
  loadAgreementSigning,
  loadOrgPeople,
  councilCountersignaturesFor,
  userAccessIds,
} from "@/app/lib/agreement-signing";
import MembershipCard from "@/app/components/MembershipCard";
import MembershipAgreementCard from "@/app/components/MembershipAgreementCard";

export const metadata: Metadata = { title: "Your account" };

const CANDIDACY_LABEL: Record<string, string> = {
  applied: "Submitted — awaiting vetting",
  signed: "Submitted — vetting underway",
  queued: "Queued — awaiting an admission ballot",
  ballot_open: "Admission ballot open",
  accepted: "Accepted — seated",
  refused: "Refused",
  lapsed: "Lapsed — the seat was taken",
  withdrawn: "Withdrawn",
};

// Colour the status: in-flight = amber, live ballot = indigo, success = green,
// terminal-negative = red, neutral exits = plain.
const CANDIDACY_BADGE: Record<string, string> = {
  applied: "badge-amber",
  signed: "badge-amber",
  queued: "badge-amber",
  ballot_open: "badge-indigo",
  accepted: "badge-green",
  refused: "badge-red",
  lapsed: "",
  withdrawn: "",
};

const VALIDATOR_LABEL: Record<string, string> = {
  none: "not started",
  in_progress: "in progress",
  online: "online",
};

export default async function AccountPage() {
  const user = await currentUser();
  const links = user ? await effectiveMemberships(user.id) : [];
  const memberIds = links.map((l) => l.memberId);

  // Candidacies + seated memberships of the orgs this user belongs to.
  const candidacies = memberIds.length
    ? await db.candidacy.findMany({
        where: { memberId: { in: memberIds } },
        include: { ballot: true, member: { select: { legalName: true } } },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const seats = memberIds.length
    ? await db.membership.findMany({
        where: {
          memberId: { in: memberIds },
          track: "founding_member",
          status: "active",
        },
        include: { member: { select: { legalName: true } } },
      })
    : [];

  // Voting member? (seated founding membership)
  const isVoter = seats.length > 0;
  const openBallots = isVoter
    ? await db.ballot.count({ where: { status: "open" } })
    : 0;

  // Membership Agreement (binding, post-seating) — bilateral multi-party signing.
  const seatedIds = seats.map((m) => m.memberId);
  const signingEnabled = await isAgreementSigningEnabled();
  const viewerAccessIds = user ? await userAccessIds(user.email) : new Set<string>();

  // One signing card per seated org the user belongs to.
  const agreementCards = await Promise.all(
    seats.map(async (m) => ({
      memberId: m.memberId,
      memberName: m.member.legalName,
      view: await loadAgreementSigning(m.memberId, viewerAccessIds),
      orgPeople: await loadOrgPeople(m.memberId),
      canDesignate:
        links.find((l) => l.memberId === m.memberId)?.role === "manager",
    })),
  );

  // Council countersignatures: other members' agreements with a slot for this
  // user (e.g. they're a rep of the configured council org). Exclude own seats.
  const counters = user ? await councilCountersignaturesFor(user.email) : [];
  const counterMemberIds = [
    ...new Set(counters.map((c) => c.memberId).filter((id) => !seatedIds.includes(id))),
  ];
  const counterCards = await Promise.all(
    counterMemberIds.map(async (id) => {
      const view = await loadAgreementSigning(id, viewerAccessIds);
      const name = counters.find((c) => c.memberId === id)?.memberName ?? "Member";
      return { memberId: id, memberName: name, view };
    }),
  );

  // Active manager / representative counts per org, to decide which menu actions
  // are offered (the actions re-check server-side before mutating).
  const accessCounts = memberIds.length
    ? await db.memberAccess.groupBy({
        by: ["memberId", "role"],
        where: { memberId: { in: memberIds }, status: { not: "removed" } },
        _count: { _all: true },
      })
    : [];
  const countOf = (memberId: string, role: "manager" | "representative") =>
    accessCounts.find((c) => c.memberId === memberId && c.role === role)?._count._all ?? 0;

  return (
    <>
      {/* Hero */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <p className="tag mb-4">Console</p>
          <h1 className="display text-4xl sm:text-5xl leading-tight max-w-3xl">
            Your account
          </h1>
          <div className="accent-line mt-6" />
          <p className="mt-8 text-lg text-muted max-w-2xl leading-relaxed">
            {user?.name || user?.email ? (
              <>
                Signed in as{" "}
                <strong className="text-ink">{user.name ?? user.email}</strong>.{" "}
              </>
            ) : null}
            Your candidacies, seat, and the organizations you act for.
          </p>
        </div>
      </section>

      {isVoter && (
        <section className="border-b border-rule">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="card max-w-2xl">
              <h3>Admission ballots</h3>
              <p className="text-sm text-muted leading-relaxed">
                {openBallots > 0
                  ? `${openBallots} admission ballot${openBallots > 1 ? "s" : ""} open — your organization's vote is part of the ⅔ threshold.`
                  : "No admission ballots are open right now."}
              </p>
              <Link href="/account/ballots" className="text-indigo hover:underline text-sm">
                Open the ballot list →
              </Link>
            </div>
          </div>
        </section>
      )}

      {links.length === 0 ? (
        <section>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="card max-w-2xl">
              <h3>No candidacy yet</h3>
              <p className="text-sm text-muted leading-relaxed">
                You&rsquo;re not part of any organization yet. Ask your
                organization&rsquo;s admin to add your email, or{" "}
                <Link href="/members" className="text-indigo hover:underline">
                  pick an open seat and apply →
                </Link>
              </p>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Seat record */}
          {seats.length > 0 && (
            <section className="border-b border-rule">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <p className="tag mb-3">Seat</p>
                <h2 className="display text-3xl">Your Council seat</h2>
                <div className="accent-line mt-4 mb-8" />
                <div className="grid sm:grid-cols-2 gap-6 max-w-4xl">
                  {seats.map((m) => (
                    <div key={m.id} className="card">
                      <h3>{m.member.legalName}</h3>
                      <dl className="text-sm text-muted grid gap-1 mt-2">
                        <div>
                          <dt className="inline font-medium text-ink">Seat: </dt>
                          <dd className="inline font-mono">
                            {m.sector && m.region ? seatLabel(m.sector, m.region) : "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="inline font-medium text-ink">Seated: </dt>
                          <dd className="inline">
                            {m.seatedAt?.toISOString().slice(0, 10) ?? "—"}
                          </dd>
                        </div>
                        <div>
                          <dt className="inline font-medium text-ink">
                            Testnet validator:{" "}
                          </dt>
                          <dd className="inline">
                            {VALIDATOR_LABEL[m.testnetValidator ?? "none"]}{" "}
                            <span className="text-xs">
                              (expected during the formation period — the
                              readiness step for the genesis validator set)
                            </span>
                          </dd>
                        </div>
                        <div>
                          <dt className="inline font-medium text-ink">Validator term: </dt>
                          <dd className="inline">
                            {m.termStart
                              ? `${m.termStart.toISOString().slice(0, 10)} → ${m.termEnd?.toISOString().slice(0, 10) ?? "…"}`
                              : "activates at mainnet"}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Membership Agreement (binding) — bilateral, multi-party signing.
              A manager designates the org's signers; each designated person and
              each council signatory signs their own slot. */}
          {agreementCards.length > 0 && (
            <section className="border-b border-rule">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <p className="tag mb-3">Membership Agreement</p>
                <h2 className="display text-3xl">The binding agreement</h2>
                <div className="accent-line mt-4 mb-8" />
                <div className="grid gap-6">
                  {agreementCards.map((a) => (
                    <MembershipAgreementCard
                      key={a.memberId}
                      memberId={a.memberId}
                      memberName={a.memberName}
                      signingEnabled={signingEnabled}
                      agreementVersion={a.view.version}
                      signatories={a.view.signatories}
                      total={a.view.total}
                      signed={a.view.signed}
                      fullyExecuted={a.view.fullyExecuted}
                      canDesignate={a.canDesignate}
                      orgPeople={a.orgPeople}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Council countersignatures — other members' agreements awaiting this
              user's council-side signature. */}
          {counterCards.length > 0 && (
            <section className="border-b border-rule">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <p className="tag mb-3">Council countersignatures</p>
                <h2 className="display text-3xl">Agreements awaiting your signature</h2>
                <div className="accent-line mt-4 mb-8" />
                <div className="grid gap-6">
                  {counterCards.map((a) => (
                    <MembershipAgreementCard
                      key={a.memberId}
                      memberId={a.memberId}
                      memberName={a.memberName}
                      signingEnabled={signingEnabled}
                      agreementVersion={a.view.version}
                      signatories={a.view.signatories}
                      total={a.view.total}
                      signed={a.view.signed}
                      fullyExecuted={a.view.fullyExecuted}
                      canDesignate={false}
                      orgPeople={[]}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Candidacies */}
          {candidacies.length > 0 && (
            <section className="border-b border-rule">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <p className="tag mb-3">Candidacy</p>
                <h2 className="display text-3xl">Your candidacies</h2>
                <div className="accent-line mt-4 mb-8" />
                <div className="grid sm:grid-cols-2 gap-6 max-w-4xl">
                  {candidacies.map((c) => (
                    <div key={c.id} className="card">
                      <h3>{c.member.legalName}</h3>
                      <p className="text-sm font-mono mt-1">
                        {seatLabel(c.sector, c.region)}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={`badge ${CANDIDACY_BADGE[c.status] ?? ""}`}>
                          {CANDIDACY_LABEL[c.status] ?? c.status}
                        </span>
                        {c.status === "ballot_open" && c.ballot && (
                          <span className="text-xs text-muted">
                            closes {c.ballot.closesAt.toISOString().slice(0, 10)}
                          </span>
                        )}
                      </div>
                      {(c.status === "lapsed" || c.status === "refused") && (
                        <p className="text-sm mt-2">
                          <Link href="/apply" className="text-indigo hover:underline">
                            Re-apply →
                          </Link>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Organizations */}
          <section>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <p className="tag mb-3">Organizations</p>
              <h2 className="display text-3xl">Organizations you belong to</h2>
              <div className="accent-line mt-4 mb-10" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {links.map((l) => (
                  <MembershipCard
                    key={l.id}
                    name={l.member.legalName}
                    track={l.member.membership?.track}
                    status={l.member.membership?.status}
                    role={l.role}
                    country={l.member.jurisdiction}
                    entityType={l.member.entityType}
                    address={l.member.registeredAddress}
                    website={l.member.website}
                    logoUrl={
                      l.member.logoUri
                        ? `/logo/${l.memberId}?v=${l.member.updatedAt.getTime()}`
                        : null
                    }
                    logoConsent={l.member.logoDisplayConsent}
                    menu={(() => {
                      const isManager = l.role === "manager";
                      const mgr = countOf(l.memberId, "manager");
                      const rep = countOf(l.memberId, "representative");
                      return {
                        memberId: l.memberId,
                        canEditAddress: isManager,
                        canEditWebsite: isManager,
                        canEditLogo: isManager,
                        manageHref: isManager ? `/account/org/${l.memberId}/access` : null,
                        // Managers may leave only if another manager remains;
                        // representatives may always leave.
                        canLeave: isManager ? mgr > 1 : true,
                        // Only the sole manager with no representatives can cancel.
                        canCancel: isManager && mgr === 1 && rep === 0,
                      };
                    })()}
                  />
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </>
  );
}
