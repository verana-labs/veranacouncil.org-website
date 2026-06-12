import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Governance" };

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

export default function GovernancePage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <p className="tag mb-4">Governance</p>
          <h1 className="display text-4xl sm:text-5xl leading-tight max-w-3xl">
            The frameworks
          </h1>
          <div className="accent-line mt-6" />
          <p className="mt-8 text-lg text-muted max-w-2xl leading-relaxed">
            The Council authors and operates three governance frameworks. The
            normative text lives in the public governance repository — this
            page only summarizes and links.
          </p>
        </div>
      </section>

      {/* Network GF */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="tag mb-3">Network GF</p>
          <h2 className="display text-3xl">The constitutional layer</h2>
          <div className="accent-line mt-4 mb-6" />
          <p className="max-w-3xl text-sm leading-relaxed">
            The Network Governance Framework is the constitutional layer that
            every Ecosystem Governance Framework (EGF) on Verana must respect.
          </p>
          <p className="text-sm mt-4">
            <a href={GOV_REPO} rel="noopener" className="text-indigo hover:underline">
              Read the Network GF ↗
            </a>
          </p>
        </div>
      </section>

      {/* ECS-EGF */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="tag mb-3">ECS-EGF</p>
          <h2 className="display text-3xl">The Essential Credential Schemas</h2>
          <div className="accent-line mt-4 mb-6" />
          <p className="max-w-3xl text-sm leading-relaxed mb-8">
            The Council&rsquo;s own ecosystem framework, covering the four
            Essential Credential Schemas that make the trust layer work.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm min-w-[640px] max-w-4xl">
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
        </div>
      </section>

      {/* ECS participants — forward note + waitlist */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="tag mb-3">ECS Ecosystem Participants</p>
          <h2 className="display text-3xl">A separate process — opening with the ECS-EGF</h2>
          <div className="accent-line mt-4 mb-6" />
          <p className="max-w-3xl text-sm leading-relaxed">
            ECS Ecosystem Participants are required for running Verifiable
            Services on Verana. Their selection is governed by the ECS-EGF, so
            recruitment opens as soon as the Council delivers the framework
            (target Q4 2026), with initial participants permissioned in time
            for mainnet. Until then, the Council collects non-binding
            expressions of interest.
          </p>
          <p className="text-sm mt-4">
            <Link href="/ecs-interest" className="text-indigo hover:underline">
              Express interest →
            </Link>
          </p>
        </div>
      </section>

      {/* Template EGF */}
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="tag mb-3">Template EGF</p>
          <h2 className="display text-3xl">A scaffold, not a gate</h2>
          <div className="accent-line mt-4 mb-6" />
          <p className="max-w-3xl text-sm leading-relaxed">
            A template for ecosystems authoring their own sector EGF. The
            Council provides the scaffold; it is not a sector-EGF authority.
          </p>
          <p className="text-sm mt-4">
            <a href={GOV_REPO} rel="noopener" className="text-indigo hover:underline">
              Read the Template EGF ↗
            </a>
          </p>
        </div>
      </section>

      {/* Bylaws & disputes */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="tag mb-3">Association documents</p>
          <h2 className="display text-3xl">Bylaws, conduct &amp; disputes</h2>
          <div className="accent-line mt-4 mb-6" />
          <ul className="grid gap-3 max-w-3xl text-sm leading-relaxed list-disc pl-5">
            <li>
              <a href={GOV_REPO} rel="noopener" className="text-indigo hover:underline">
                Bylaws ↗
              </a>{" "}
              — the Verein&rsquo;s statutes and operating rules.
            </li>
            <li>
              <a href={GOV_REPO} rel="noopener" className="text-indigo hover:underline">
                Code of Conduct ↗
              </a>{" "}
              — applies to all members, observers, and representatives.
            </li>
          </ul>
          <p className="max-w-3xl text-sm leading-relaxed text-muted mt-6">
            Risk management &amp; disputes: graduated sanctions, a public
            record of decisions, and appeal to the General Assembly.
          </p>
        </div>
      </section>
    </>
  );
}
