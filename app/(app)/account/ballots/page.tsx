import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/app/lib/authz";
import { db } from "@/app/lib/db";
import { acceptThreshold } from "@/app/lib/ballots";
import { seatLabel } from "@/app/lib/seats";
import { votableMemberIds } from "@/app/lib/voting";
import VoteButtons from "./VoteButtons";

export const metadata: Metadata = { title: "Admission ballots" };

export default async function BallotsPage() {
  const user = await currentUser();
  if (!user?.id || !user.email) redirect("/login?callbackUrl=/account/ballots");

  const voterIds = await votableMemberIds(user.id, user.email);

  const ballots = await db.ballot.findMany({
    orderBy: [{ status: "asc" }, { opensAt: "desc" }],
    take: 50,
    include: {
      votes: true,
      candidacy: { include: { member: { select: { legalName: true, id: true } } } },
    },
  });

  return (
    <>
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <p className="tag mb-4">Console</p>
          <h1 className="display text-4xl sm:text-5xl leading-tight max-w-3xl">
            Admission ballots
          </h1>
          <div className="accent-line mt-6" />
          <p className="mt-8 text-lg text-muted max-w-2xl leading-relaxed">
            One ballot per candidate, accept or refuse — a ⅔ supermajority of
            seated members admits. This provisional mechanism assembles the
            initial Council before mainnet; at mainnet launch all Council voting
            moves on-chain.
          </p>
        </div>
      </section>

      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid gap-6 max-w-3xl">
          {ballots.length === 0 && (
            <p className="text-muted">No admission ballots yet.</p>
          )}
          {ballots.map((b) => {
            const accepts = b.votes.filter((v) => v.choice === "accept").length;
            const refuses = b.votes.filter((v) => v.choice === "refuse").length;
            const threshold = acceptThreshold(b.electorate);
            const open = b.status === "open";
            const myPending = voterIds.filter(
              (id) =>
                id !== b.candidacy.member.id &&
                !b.votes.some((v) => v.memberId === id),
            );
            return (
              <div key={b.id} className="card">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`badge ${open ? "badge-indigo" : ""}`}>
                    {open ? "Open" : `Closed — ${b.outcome}`}
                  </span>
                  <span className="badge">
                    {accepts} accept · {refuses} refuse · threshold {threshold}/{b.electorate}
                  </span>
                </div>
                <h3 className="mt-2">{b.candidacy.member.legalName}</h3>
                <p className="text-sm font-mono">
                  {seatLabel(b.candidacy.sector, b.candidacy.region)}
                </p>
                <p className="text-sm text-muted mt-1">
                  {open
                    ? `Window closes ${b.closesAt.toISOString().slice(0, 10)}`
                    : `Closed ${b.closedAt?.toISOString().slice(0, 10) ?? ""}`}
                </p>
                {open && myPending.length > 0 && (
                  <VoteButtons ballotId={b.id} memberIds={myPending} />
                )}
                {open && voterIds.length > 0 && myPending.length === 0 && (
                  <p className="text-sm text-muted mt-2">
                    Your organization&rsquo;s vote has been cast (votes are final).
                  </p>
                )}
              </div>
            );
          })}
          {voterIds.length === 0 && ballots.length > 0 && (
            <p className="text-sm text-muted">
              Ballots are decided by the voting representatives of seated
              members; this view is read-only for you.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
