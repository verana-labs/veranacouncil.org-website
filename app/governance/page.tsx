import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Governance",
  description:
    "The Verana Council authors and operates two governance frameworks: the Network GF and the ECS-EGF. The normative documents live in the verana-council-gov repository.",
  alternates: { canonical: "/governance" },
};

export default function GovernancePage() {
  return (
    <>
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <nav className="text-sm text-muted mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-indigo-primary">
              Home
            </Link>{" "}
            · <span className="text-ink">Governance</span>
          </nav>
          <p className="eyebrow mb-4">Two frameworks, one chain</p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight max-w-4xl">
            What the Council governs.
          </h1>
          <p className="mt-6 text-lg text-muted max-w-3xl leading-relaxed">
            The Council authors and operates two governance frameworks and
            secures the chain they run on. The normative text is maintained in
            the{" "}
            <a
              href="https://github.com/verana-labs/verana-council-gov"
              className="underline text-indigo-primary"
            >
              verana-council-gov
            </a>{" "}
            repository; this page summarizes and links to it.
          </p>
        </div>
      </section>

      <section>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 prose-body">
          <h2>Network Governance Framework</h2>
          <p>
            The constitutional layer of the network. Every Ecosystem Governance
            Framework (EGF) on Verana, including the Council&apos;s own ECS-EGF,
            MUST respect it. It defines the permission lifecycle, Trust Deposit
            rules, the graduated risk-management rubric, dispute resolution,
            validator standards, and the chain-evolution process.
          </p>
          <p>
            <a href="https://github.com/verana-labs/verana-council-gov/tree/main/network-gf">
              Read the Network GF →
            </a>
          </p>

          <h2>ECS Ecosystem Governance Framework</h2>
          <p>
            The Council&apos;s own ecosystem framework. It covers the four fixed
            Essential Credential Schemas and the rules under which the Council
            selects Issuer Grantors and Issuers per (schema × jurisdiction).
          </p>
          <table>
            <thead>
              <tr>
                <th>Schema</th>
                <th>Identifies</th>
                <th>Permission mode</th>
                <th>Definition</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <code>Service</code>
                </td>
                <td>Verifiable Services (incl. AI agents)</td>
                <td>
                  <code>ECOSYSTEM_VALIDATION_PROCESS</code>
                </td>
                <td>
                  <a href="https://verana-labs.github.io/verifiable-trust-spec/schemas/v4/service.json">
                    <code>service.json</code>
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <code>Organization</code>
                </td>
                <td>Legal entities controlling services</td>
                <td>
                  <code>GRANTOR_VALIDATION_PROCESS</code>
                </td>
                <td>
                  <a href="https://verana-labs.github.io/verifiable-trust-spec/schemas/v4/org.json">
                    <code>org.json</code>
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <code>Persona</code>
                </td>
                <td>Individuals controlling services</td>
                <td>
                  <code>GRANTOR_VALIDATION_PROCESS</code>
                </td>
                <td>
                  <a href="https://verana-labs.github.io/verifiable-trust-spec/schemas/v4/persona.json">
                    <code>persona.json</code>
                  </a>
                </td>
              </tr>
              <tr>
                <td>
                  <code>UserAgent</code>
                </td>
                <td>End-user wallets and applications</td>
                <td>
                  <code>OPEN</code>
                </td>
                <td>
                  <a href="https://verana-labs.github.io/verifiable-trust-spec/schemas/v4/ua.json">
                    <code>ua.json</code>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
          <p>
            <a href="https://github.com/verana-labs/verana-council-gov/tree/main/ecs-egf">
              Read the ECS-EGF →
            </a>
          </p>

          <h2>Template EGF</h2>
          <p>
            A scaffold, not a gate. Any ecosystem can author and operate its own
            EGF on Verana with no Council approval. The Template EGF makes
            authoring a sector EGF cheaper and more interoperable.
          </p>
          <p>
            <a href="https://github.com/verana-labs/verana-council-gov/tree/main/template-egf">
              Get the Template EGF →
            </a>
          </p>

          <h2>Bylaws &amp; Code of Conduct</h2>
          <ul>
            <li>
              <strong>Bylaws</strong> — the Verein statutes.{" "}
              <a href="https://github.com/verana-labs/verana-council-gov/tree/main/bylaws">
                Read →
              </a>
            </li>
            <li>
              <strong>Code of Conduct</strong> — binding on all participants.{" "}
              <a href="https://github.com/verana-labs/verana-council-gov/tree/main/code-of-conduct">
                Read →
              </a>
            </li>
          </ul>

          <h2>Risk management &amp; disputes</h2>
          <p>
            Participant conduct is enforced through a graduated-sanctions
            process (notice → remediation → suspension → slashing), applied
            uniformly across all EGFs. Every sanction is public record and
            appealable to the General Assembly.
          </p>

          <p className="not-prose mt-8 flex flex-wrap gap-4">
            <a
              href="https://github.com/verana-labs/verana-council-gov"
              className="btn btn-secondary"
            >
              All governance documents ↗
            </a>
            <Link href="/join" className="btn btn-primary">
              Join the Council
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
