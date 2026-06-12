import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@/app/lib/authz";
import {
  listWorkingGroupsWithAccess,
  userActiveClasses,
  type WgClass,
} from "@/app/lib/working-groups";
import WorkingGroupCards from "@/app/components/WorkingGroupCards";

export const metadata: Metadata = {
  title: "Working groups",
  description:
    "The Verana Council's bodies and committees — the General Assembly, Membership & Seats, Technical / Validator. Participation requires Council membership (Founding Member or Observer).",
};

// Per-user content (join state, membership notice) makes this page dynamic.
export const dynamic = "force-dynamic";

export default async function WorkingGroupsPage() {
  const user = await currentUser();
  const [workingGroups, classes] = await Promise.all([
    listWorkingGroupsWithAccess(user?.id ?? null),
    user?.id
      ? userActiveClasses(user.id)
      : Promise.resolve(new Set<WgClass>()),
  ]);
  // Signed-out visitors and signed-in users without an active membership get
  // the "membership required" explainer; members don't need it.
  const showMembershipNotice = !user || classes.size === 0;

  return (
    <>
      {/* Hero */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <p className="tag mb-4">Working groups</p>
          <h1 className="display text-4xl sm:text-5xl leading-tight max-w-3xl">
            Where the work happens
          </h1>
          <div className="accent-line mt-6" />
          <p className="mt-8 text-lg text-muted max-w-2xl leading-relaxed">
            The working groups author the specifications, build and maintain the
            open-source software, and shape the open trust layer. Join the ones
            your membership grants — across every organization you belong to —
            and the meetings land straight in your calendar.
          </p>
        </div>
      </section>

      {/* Membership-required notice — only for visitors who can't join yet */}
      {showMembershipNotice && (
        <section className="border-b border-rule reveal">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="card border-l-[3px]" style={{ borderLeftColor: "var(--color-purple)" }}>
              <h2 className="display text-xl">
                Working-group participation requires membership
              </h2>
              <p className="text-sm text-muted leading-relaxed">
                Joining a body requires Council membership. Most are open
                to <strong className="text-ink">Associate</strong> or{" "}
                <strong className="text-ink">Contributor</strong> members; the{" "}
                <strong className="text-ink">Business Cases WG</strong> requires{" "}
                <strong className="text-ink">Associate</strong> membership.{" "}
                <Link href="/join" className="text-indigo hover:underline">
                  Compare &amp; join →
                </Link>{" "}
                Anyone may still use, fork, read, and file issues against the public
                open-source code and specifications; working-group participation and
                formal contributions are members-only.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Working-group board */}
      <section className="border-b border-rule reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <WorkingGroupCards groups={workingGroups} />
          <p className="text-xs text-muted mt-4">
            Each group's page shows its leads, meeting schedule and published
            minutes; members join and are invited to the meetings in their own
            calendar.
          </p>
        </div>
      </section>

      {/* Ways to contribute */}
      <section className="border-b border-rule reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card">
              <span className="badge">no membership needed</span>
              <h3>Use the open-source software</h3>
              <p className="text-sm text-muted leading-relaxed">
                Public repos, issue trackers, and releases. Apache 2.0
                (AGPL-3.0 for the Verifiable Public Registry); copyright held by
                contributors.
              </p>
              <a
                href="https://github.com/verana-labs"
                rel="noopener"
                className="text-sm text-indigo hover:underline mt-auto self-end"
              >
                github.com/verana-labs ↗
              </a>
            </div>
            <div className="card">
              <span className="badge">no membership needed</span>
              <h3>Implement the specifications</h3>
              <p className="text-sm text-muted leading-relaxed">
                Build to Verifiable Trust and VPR. Both specs are published for
                implementers.
              </p>
              <a
                href="https://verana-labs.github.io/verifiable-trust-spec/"
                rel="noopener"
                className="text-sm text-indigo hover:underline mt-auto self-end"
              >
                Read the specs ↗
              </a>
            </div>
            <div className="card">
              <span className="badge badge-indigo">members</span>
              <h3>Join to contribute</h3>
              <p className="text-sm text-muted leading-relaxed">
                Participate in a working group and submit formal contributions.
                Recurring technical work joins as a{" "}
                <strong className="text-ink">Contributor Member</strong> (free).
              </p>
              <Link
                href="/join"
                className="text-sm text-indigo hover:underline mt-auto self-end"
              >
                Apply for a Council seat →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Build on Verana */}
      <section className="reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="card">
            <h3>Building an app or agent on Verana?</h3>
            <p className="text-sm text-muted leading-relaxed">
              The Foundation stewards the standards; the builder docs live
              elsewhere. Start at{" "}
              <a href="https://verana.io" rel="noopener" className="text-indigo hover:underline">
                verana.io
              </a>{" "}
              and{" "}
              <a href="https://docs.verana.io" rel="noopener" className="text-indigo hover:underline">
                docs.verana.io
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
