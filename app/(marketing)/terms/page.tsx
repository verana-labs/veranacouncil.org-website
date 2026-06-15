import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "Terms of use for veranacouncil.org — the Verana Council's website, member accounts, candidacy application, and admission ballots.",
};

export default function TermsPage() {
  return (
    <>
      <section className="border-b border-rule">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="tag mb-4">Legal</p>
          <h1 className="display text-4xl sm:text-5xl">Terms of Use</h1>
          <div className="accent-line mt-6" />
          <p className="text-xs tracking-wider uppercase text-muted mt-8">
            <strong className="text-ink">Last updated.</strong> 2026-06-12
          </p>
        </div>
      </section>

      <article className="prose-body max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p>
          This website (<strong>veranacouncil.org</strong>) is operated by the{" "}
          <strong>Verana Council Association (in formation)</strong>,
          represented by <strong>2060 OÜ</strong> as steward pre-incorporation.
          Beyond institutional information, it provides{" "}
          <strong>member accounts</strong>, the{" "}
          <strong>candidacy application and e-signature flow</strong>, the{" "}
          <strong>provisional admission-ballot mechanism</strong>, and a{" "}
          <strong>public member directory and record</strong>. By using the
          site you accept these terms.
        </p>

        <h2>Candidacy is non-binding; membership is governed separately</h2>
        <p>
          These terms govern your use of the website and its account features.
          Submitting a candidacy is a <strong>non-binding expression of
          interest</strong> — no document is signed and your organization is not
          committed. <strong>Membership itself</strong> — rights, obligations,
          validator duties — is governed only by the binding{" "}
          <strong>Council Membership Agreement</strong>, executed from your
          account upon admission and incorporation, together with the
          Verein&rsquo;s statutes. If these terms conflict with those
          instruments, those instruments prevail for membership matters.
          Membership is free: no dues or capital contributions are collected on
          or off this site.
        </p>

        <h2>Accounts</h2>
        <p>
          Accounts are keyed to a <strong>verified email address</strong>;
          sign-in is passwordless (Google, GitHub, or a one-time emailed code).
          You are responsible for the security of your email and sign-in
          providers, and for the accuracy of the information you submit — in
          particular the organization details and the authority-to-bind
          attestation made when signing on behalf of an organization.
          Organization managers are responsible for the access they grant to
          colleagues, including the designation of the voting representative.
          We may suspend accounts used to abuse, disrupt, or attempt
          unauthorized access to the service.
        </p>

        <h2>Candidacy submission, and signing the Membership Agreement</h2>
        <p>
          At candidacy you submit a non-binding expression of interest with a
          representation that you are authorized to submit it and that the
          information is accurate — no agreement is signed. <strong>Only later,
          if your organization is admitted</strong>, an authorized signatory
          executes the binding Council Membership Agreement from your account by
          typing their name (an <strong>electronic signature</strong>); we then
          retain the executed agreement and technical evidence of signing (see
          the <a href="/privacy">privacy policy</a>), available from your
          account.
        </p>

        <h2>Admission ballots and the public record</h2>
        <p>
          Pre-mainnet admissions are decided through this site&rsquo;s
          provisional ballot mechanism: one ballot per candidate, accept or
          refuse, by a ⅔ supermajority of seated members. Votes are final once
          cast. Candidacies, ballot outcomes, seatings, and published minutes
          appear on the <a href="/news">public record</a> by design; this
          mechanism sunsets at mainnet launch, when Council voting moves
          on-chain.
        </p>

        <h2>Member content and the directory</h2>
        <p>
          Uploading an organization logo grants the Council a non-exclusive,
          revocable license to display it on veranacouncil.org, subject to the
          display consent you give at upload. You warrant you hold the rights
          to any logo you upload and that it contains nothing unlawful or
          misleading. The <a href="/members">member directory</a> is curated by
          the Council; you may request unlisting at any time (the public record
          of admissions remains).
        </p>

        <h2>No offer or advice</h2>
        <p>
          Nothing on this site is an offer, solicitation, or investment advice
          regarding the VNA token or any equity. The Council does{" "}
          <strong>not</strong> issue or own the VNA token. Token issuance and
          economics are matters for the Verana Foundation&rsquo;s
          documentation and the protocol specifications, not this site.
        </p>

        <h2>Governance frameworks &amp; specifications</h2>
        <p>
          The governance frameworks (Network GF, ECS-EGF, Template EGF) live in
          the public governance repository; the specifications are owned and
          hosted by the Verana Foundation. Your use of those artifacts is
          governed by their respective licenses, available in their
          repositories, not by these terms.
        </p>

        <h2>Content license</h2>
        <p>
          Unless otherwise noted, text on this site is licensed{" "}
          <strong>CC-BY-SA 4.0</strong> and brand assets <strong>CC-BY 4.0</strong>.
          Member logos remain the property of their owners and are not covered
          by these licenses.
        </p>

        <h2>No warranty; liability</h2>
        <p>
          The site and its account features are provided &ldquo;as is&rdquo;,
          without warranties of any kind to the fullest extent permitted by
          law. Links to third-party sites are provided for convenience and are
          not endorsements. For members, liability is governed by the
          applicable membership instruments; for all other use of the site, our
          aggregate liability is limited to the fullest extent permitted by
          law.
        </p>

        <h2>Governing law</h2>
        <p>
          While the Council is in formation (stewarded by 2060 OÜ), these terms
          are governed by the laws of <strong>Estonia</strong> and the courts
          of Tallinn have jurisdiction; upon incorporation, by{" "}
          <strong>Swiss law</strong> and the courts of the Verein&rsquo;s seat
          — in both cases without prejudice to mandatory protections of your
          country of residence.
        </p>

        <h2>Changes</h2>
        <p>
          These terms may be updated as the Council is incorporated and the
          service evolves. The <em>Last updated</em> date reflects the most
          recent change; material changes affecting member accounts are
          announced by email.
        </p>
      </article>
    </>
  );
}
