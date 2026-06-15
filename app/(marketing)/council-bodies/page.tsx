import type { Metadata } from "next";
import Link from "next/link";
import { currentUser } from "@/app/lib/authz";
import {
  listWorkingGroupsWithAccess,
  userActiveClasses,
  type WgClass,
} from "@/app/lib/council-bodies";
import WorkingGroupCards from "@/app/components/WorkingGroupCards";

export const metadata: Metadata = {
  title: "Governance",
  description:
    "The Verana Council's governance frameworks (Network GF, ECS-EGF, Template EGF) and the bodies & committees that author them. Council Members and Observers join a body to take part in its meetings.",
};

// Per-user content (body join state, membership notice) makes this page dynamic.
export const dynamic = "force-dynamic";

const GOV_REPO = "https://github.com/verana-labs/verana-council-gov";
const SCHEMAS = "https://verana-labs.github.io/verifiable-trust-spec/schemas/v4";

const ECS_ROWS = [
  {
    schema: "Service",
    identifies: "Verifiable Services (incl. AI agents)",
    mode: "ECOSYSTEM_VALIDATION_PROCESS",
    file: "service.json",
  },
  {
    schema: "Organization",
    identifies: "Legal entities controlling services",
    mode: "GRANTOR_VALIDATION_PROCESS",
    file: "org.json",
  },
  {
    schema: "Persona",
    identifies: "Individuals controlling services",
    mode: "GRANTOR_VALIDATION_PROCESS",
    file: "persona.json",
  },
  {
    schema: "UserAgent",
    identifies: "End-user wallets and applications",
    mode: "OPEN",
    file: "ua.json",
  },
];

export default async function GovernancePage() {
  const user = await currentUser();
  const [bodies, classes] = await Promise.all([
    listWorkingGroupsWithAccess(user?.id ?? null),
    user?.id ? userActiveClasses(user.id) : Promise.resolve(new Set<WgClass>()),
  ]);
  // Signed-out visitors and signed-in users without an active membership get
  // the "membership required" explainer; members/observers don't need it.
  const showMembershipNotice = !user || classes.size === 0;

  return (
    <>
      {/* Hero */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <p className="tag mb-4">Governance</p>
          <h1 className="display text-4xl sm:text-5xl leading-tight max-w-3xl">
            How the Council governs
          </h1>
          <div className="accent-line mt-6" />
          <p className="mt-8 text-lg text-muted max-w-2xl leading-relaxed">
            The Council governs the Verana network on two fronts: the{" "}
            <strong className="text-ink">frameworks</strong> it authors and
            operates, and the <strong className="text-ink">bodies</strong> that
            do the work. Normative text lives in the public governance
            repository — this page summarizes and links.
          </p>
        </div>
      </section>

      {/* What the Council governs — one summary of all the frameworks */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="tag mb-3">Frameworks</p>
          <h2 className="display text-3xl">What the Council governs</h2>
          <div className="accent-line mt-4 mb-6" />
          <p className="max-w-3xl text-sm leading-relaxed mb-8">
            The Council authors and operates a small set of governance
            frameworks. Every Ecosystem Governance Framework on Verana must
            respect the constitutional Network GF. The normative text lives in
            the public{" "}
            <a href={GOV_REPO} rel="noopener" className="text-indigo hover:underline">
              governance repository ↗
            </a>{" "}
            — this is the summary.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 max-w-4xl">
            <div className="card">
              <h3>Network GF</h3>
              <p className="text-sm text-muted leading-relaxed mt-1">
                The constitutional layer that every Ecosystem Governance
                Framework (EGF) on Verana must respect.
              </p>
              <p className="text-sm mt-3">
                <a href={GOV_REPO} rel="noopener" className="text-indigo hover:underline">
                  Read the Network GF ↗
                </a>
              </p>
            </div>

            <div className="card">
              <h3>ECS-EGF</h3>
              <p className="text-sm text-muted leading-relaxed mt-1">
                The Council&rsquo;s own ecosystem framework, covering the four
                Essential Credential Schemas that make the trust layer work.
              </p>
              <p className="text-sm mt-3">
                <a href={GOV_REPO} rel="noopener" className="text-indigo hover:underline">
                  Read the ECS-EGF ↗
                </a>
              </p>
            </div>

            <div className="card">
              <h3>Template EGF</h3>
              <p className="text-sm text-muted leading-relaxed mt-1">
                A scaffold for ecosystems authoring their own sector EGF. The
                Council provides the template; it is not a sector-EGF authority.
              </p>
              <p className="text-sm mt-3">
                <a href={GOV_REPO} rel="noopener" className="text-indigo hover:underline">
                  Read the Template EGF ↗
                </a>
              </p>
            </div>

            <div className="card">
              <h3>Bylaws &amp; Code of Conduct</h3>
              <p className="text-sm text-muted leading-relaxed mt-1">
                The Verein&rsquo;s statutes and operating rules, plus the conduct
                rules for all members, observers and representatives. Disputes:
                graduated sanctions, a public record, and appeal to the General
                Assembly.
              </p>
              <p className="text-sm mt-3">
                <a href={GOV_REPO} rel="noopener" className="text-indigo hover:underline">
                  Bylaws ↗
                </a>{" "}
                ·{" "}
                <a href={GOV_REPO} rel="noopener" className="text-indigo hover:underline">
                  Code of Conduct ↗
                </a>
              </p>
            </div>
          </div>

          {/* The ECS schemas, tucked under the summary as compact reference */}
          <details className="mt-6 max-w-4xl">
            <summary className="cursor-pointer text-sm text-indigo hover:underline">
              The four Essential Credential Schemas
            </summary>
            <div className="overflow-x-auto mt-4">
              <table className="w-full border-collapse text-sm min-w-[640px]">
                <thead>
                  <tr className="text-left text-muted">
                    <th className="p-2">Schema</th>
                    <th className="p-2">Identifies</th>
                    <th className="p-2">Permission mode</th>
                    <th className="p-2">Definition</th>
                  </tr>
                </thead>
                <tbody>
                  {ECS_ROWS.map((r) => (
                    <tr key={r.schema} className="border-t border-rule">
                      <td className="p-2 font-mono">{r.schema}</td>
                      <td className="p-2">{r.identifies}</td>
                      <td className="p-2 font-mono text-xs">{r.mode}</td>
                      <td className="p-2">
                        <a
                          href={`${SCHEMAS}/${r.file}`}
                          rel="noopener"
                          className="text-indigo hover:underline font-mono text-xs"
                        >
                          {r.file} ↗
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>

          {/* ECS participants — separate recruitment, kept as a one-line note */}
          <p className="text-sm text-muted max-w-3xl mt-8 leading-relaxed">
            <strong className="text-ink">ECS Ecosystem Participants</strong> —
            required for running Verifiable Services on Verana — are a separate
            recruitment governed by the ECS-EGF, opening as the framework ships
            (target Q4 2026), with initial participants permissioned in time for
            mainnet.{" "}
            <Link href="/ecs-interest" className="text-indigo hover:underline">
              Express interest →
            </Link>
          </p>
        </div>
      </section>

      {/* Council Bodies — the point of action */}
      <section className="border-b border-rule reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="tag mb-3">Council Bodies</p>
          <h2 className="display text-3xl">The bodies &amp; committees</h2>
          <div className="accent-line mt-4 mb-6" />
          <p className="max-w-3xl text-sm leading-relaxed mb-8">
            The General Assembly and committees that author and operate the
            frameworks above. Any Council Member or Observer can join a body —
            across every organization you belong to — and its meetings land
            straight in your calendar.
          </p>

          {showMembershipNotice && (
            <div
              className="card border-l-[3px] mb-8"
              style={{ borderLeftColor: "var(--color-indigo)" }}
            >
              <h3>Participation requires membership</h3>
              <p className="text-sm text-muted leading-relaxed">
                Council bodies are open to any{" "}
                <strong className="text-ink">Council Member</strong> or{" "}
                <strong className="text-ink">Observer</strong> — a Council
                account is all that&rsquo;s required.{" "}
                <Link href="/join" className="text-indigo hover:underline">
                  Apply for a seat →
                </Link>
              </p>
            </div>
          )}

          <WorkingGroupCards groups={bodies} />
          <p className="text-xs text-muted mt-4">
            Each body&rsquo;s page shows its leads, meeting schedule and
            published minutes; members and observers join and are invited to the
            meetings in their own calendar.
          </p>
        </div>
      </section>

      {/* Build on Verana */}
      <section className="reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="card">
            <h3>Building an app or agent on Verana?</h3>
            <p className="text-sm text-muted leading-relaxed">
              Governance lives here; the builder docs live elsewhere. Start at{" "}
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
