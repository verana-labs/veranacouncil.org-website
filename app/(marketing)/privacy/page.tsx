import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How the Verana Council Association (in formation, represented by 2060 OÜ) collects, uses, and retains personal data on veranacouncil.org — accounts, candidacies, ballots — and your rights under the GDPR.",
};

export default function PrivacyPage() {
  return (
    <>
      <section className="border-b border-rule">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="tag mb-4">Legal</p>
          <h1 className="display text-4xl sm:text-5xl">Privacy Policy</h1>
          <div className="accent-line mt-6" />
          <p className="text-xs tracking-wider uppercase text-muted mt-8">
            <strong className="text-ink">Last updated.</strong> 2026-06-19
          </p>
        </div>
      </section>

      <article className="prose-body max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p>
          This page explains what personal data the{" "}
          <strong>Verana Council Association (in formation)</strong>,
          represented by <strong>2060 OÜ</strong>, collects through{" "}
          <strong>veranacouncil.org</strong>, why we collect it, how long we
          keep it, and your rights under the EU General Data Protection
          Regulation (GDPR). The site is more than an informational website: it
          hosts <strong>member accounts</strong>, the{" "}
          <strong>candidacy application and e-signature flow</strong>, the{" "}
          <strong>provisional admission-ballot mechanism</strong>, and a{" "}
          <strong>public member directory and record</strong> — this policy
          covers all of them, plus the contact form and cookies. Membership is
          free: the site collects no payments.
        </p>
        <p>
          We do not sell data and do not run ad targeting or remarketing. We
          collect what you give us to operate your candidacy or membership,
          what sign-in providers necessarily share with us, and — with your
          consent — aggregate usage measurements.
        </p>

        <h2>Data controller</h2>
        <p>
          The Verana Council Association is in formation. Until incorporation,
          the data controller is <strong>2060 OÜ</strong>, Ahtri tn 12, 10151
          Tallinn, Estonia (registry 16853041), acting as the Council&rsquo;s
          steward; thereafter the incorporated Verein (at which point the Swiss
          FADP applies alongside the GDPR and the Swiss FDPIC becomes a
          competent authority). For privacy matters, use the{" "}
          <a href="/contact">contact form</a> with inquiry type{" "}
          <em>General inquiry</em> and begin the message with{" "}
          <em>&ldquo;Legal:&rdquo;</em>.
        </p>

        <h2>What we collect and why</h2>

        <h3>Accounts and sign-in</h3>
        <ul>
          <li>
            <strong>Identity.</strong> Your verified email address is your
            account key, with your name and avatar if provided by a sign-in
            provider. Sign-in works via Google, GitHub, or a one-time code we
            email you; with OAuth we receive only your basic profile and
            verified email — never your password.
          </li>
          <li>
            <strong>Session.</strong> A strictly necessary, encrypted session
            cookie keeps you signed in. One-time sign-in codes are stored
            hashed and expire after 10 minutes.
          </li>
        </ul>
        <p>
          <strong>Legal basis.</strong> Performance of a contract (GDPR Art.
          6(1)(b)) — operating your account.
        </p>

        <h3>Candidacies, membership agreements, and e-signatures</h3>
        <ul>
          <li>
            <strong>Candidacy (expression of interest).</strong> The
            organization&rsquo;s legal name, entity type, country, registered
            address, optional logo, the sector and region applied for, and the
            contact&rsquo;s name and role. No agreement is signed at this stage.
          </li>
          <li>
            <strong>Signature record (Membership Agreement).</strong> Only if
            your organization is admitted and an authorized signatory executes
            the binding Council Membership Agreement, we record the
            signer&rsquo;s name and title, timestamp, agreement version and
            document hash, and the <strong>IP address and browser user-agent</strong>{" "}
            at signing — kept as evidence that the agreement was validly
            executed — plus the personalised signed PDF.
          </li>
          <li>
            <strong>Organization access lists.</strong> Org managers may add
            colleagues&rsquo; email addresses to grant them access (including
            designating the voting representative); those people are notified
            by email and linked to the organization when they sign in.
          </li>
        </ul>
        <p>
          <strong>Legal basis.</strong> Our legitimate interest in assessing
          candidacies (Art. 6(1)(f)); and, for the Membership Agreement,
          performance of that agreement (Art. 6(1)(b)) plus our legitimate
          interest in evidencing contracts (Art. 6(1)(f)).
        </p>

        <h3>Admission ballots and the public record</h3>
        <ul>
          <li>
            <strong>Ballots.</strong> For each admission ballot we record which
            member organization voted, the choice, the time of the vote, and
            the representative who cast it (for internal accountability).
          </li>
          <li>
            <strong>The public record.</strong> Candidacies, ballot outcomes
            (counts, not per-member choices), seatings, observer acceptances,
            seed-designation rationales, and published minutes appear on{" "}
            <a href="/news">/news</a> by design — transparency is part of how
            the Council works. Personal data of representatives is not
            published; meeting minutes name attendees as institutional
            representatives.
          </li>
        </ul>
        <p>
          <strong>Legal basis.</strong> Performance of the membership
          instruments (Art. 6(1)(b)) and our legitimate interest in transparent
          governance (Art. 6(1)(f)).
        </p>

        <h3>Public member directory</h3>
        <p>
          The <a href="/members">/members</a> page lists members and observers
          of the Council. Listing is curated by Council administrators, and an
          organization&rsquo;s logo appears only with the{" "}
          <strong>explicit consent</strong> given at upload (&ldquo;We may
          display this logo on veranacouncil.org&rdquo;). You can withdraw at
          any time: remove the logo from your membership card, or ask us to
          unlist the membership entirely (the public record of admissions
          remains). <strong>Legal basis.</strong> Consent (Art. 6(1)(a)) and
          legitimate interest in presenting the Council&rsquo;s membership
          (Art. 6(1)(f)).
        </p>

        <h3>Transactional email</h3>
        <p>
          We send operational email tied to your candidacy or membership:
          sign-in codes, candidacy and membership-agreement confirmations,
          vetting and ballot
          notifications, and access notifications. These are part of operating
          the service, not marketing; we send no newsletters without separate
          consent.
        </p>

        <h3>Contact form</h3>
        <p>
          Submissions on <code>/contact</code> (inquiry type, name, email,
          message, optional organization/role/links) are stored in our{" "}
          <strong>self-hosted Relaticle CRM</strong> (<code>crm.2060.io</code>)
          so we can respond. IP address and user-agent are used only for rate
          limiting and abuse detection.
        </p>

        <h3>Administration and security</h3>
        <p>
          Administrative actions on member records (e.g. vetting a candidacy,
          opening a ballot, listing a member) are written to an{" "}
          <strong>audit log</strong> recording who did what and when. Hosting
          logs (IP, user-agent) serve security and rate limiting only.
        </p>

        <h2>Cookies and analytics</h2>
        <p>
          The only cookie required by the site is the{" "}
          <strong>strictly necessary session cookie</strong> for signed-in
          users. For analytics we use <strong>Google Analytics 4</strong>{" "}
          (Google Ireland Ltd.) to measure aggregate page traffic. It is
          consent-gated: a banner offers <strong>Accept all</strong> or{" "}
          <strong>Essential only</strong>, and the Google Analytics tag loads —
          and its cookies are set — <strong>only after you select &ldquo;Accept
          all&rdquo;</strong>; choosing &ldquo;Essential only&rdquo; (or making
          no choice) loads nothing. The lawful basis is your{" "}
          <strong>consent</strong> (GDPR Art. 6(1)(a)), which you can withdraw
          at any time by clearing the choice stored in <code>localStorage</code>{" "}
          or via the banner&rsquo;s preferences. IP addresses are anonymized; no
          ad networks, no cross-site trackers, no selling of data. See the{" "}
          <a href="/cookies">cookie policy</a>.
        </p>

        <h2>Processors and where data goes</h2>
        <ul>
          <li>
            <strong>Google (Analytics)</strong> — Google Analytics 4, only after
            you consent to analytics. Aggregate traffic measurement; no profile
            data is shared.
          </li>
          <li>
            <strong>Google / GitHub</strong> — only if you choose them for
            sign-in.
          </li>
          <li>
            <strong>Our email provider</strong> — delivery of transactional
            email.
          </li>
          <li>
            <strong>Our hosting provider (EU)</strong> and our self-hosted CRM,
            operated by 2060 OÜ.
          </li>
        </ul>
        <p>
          Cross-border transfers rely on an EC adequacy decision, the EU-US Data
          Privacy Framework, or Standard Contractual Clauses as applicable. No
          third-party marketing platform receives your data.
        </p>

        <h2>How long we keep it</h2>
        <ul>
          <li>
            <strong>Account and member records</strong> — for the life of the
            candidacy/membership and up to 24 months after it ends, then
            deleted or anonymized except where retention below applies.
          </li>
          <li>
            <strong>Signed agreements and ballot records</strong> — up to{" "}
            <strong>10 years</strong>, to evidence the contract and the
            association&rsquo;s decisions (the public record itself is
            permanent by design).
          </li>
          <li>
            <strong>Signature evidence</strong> (IP, user-agent at signing) —
            kept with the signed agreement.
          </li>
          <li>
            <strong>One-time sign-in codes</strong> — 10 minutes;{" "}
            <strong>spam/abuse logs</strong> — up to 30 days.
          </li>
          <li>
            <strong>Contact-form correspondence</strong> — up to 24 months from
            the last interaction.
          </li>
          <li>
            <strong>Analytics</strong> — minimum provider retention; aggregate
            reports contain no identifiers.
          </li>
        </ul>

        <h2>Your rights</h2>
        <p>Under the GDPR, you may:</p>
        <ul>
          <li>access the personal data we hold about you;</li>
          <li>rectify inaccurate data (organization managers can correct the
            registered address directly from the membership card);</li>
          <li>erase your data where we have no lawful basis to keep it;</li>
          <li>restrict or object to processing;</li>
          <li>receive a portable copy of the data you gave us;</li>
          <li>
            withdraw consent at any time (e.g. remove your logo or ask to be
            unlisted from <a href="/members">/members</a>) — without affecting
            prior processing;
          </li>
          <li>
            lodge a complaint with a supervisory authority — while stewarded by
            2060 OÜ, the{" "}
            <a href="https://www.aki.ee/en" rel="noopener">
              Estonian Data Protection Inspectorate
            </a>
            .
          </li>
        </ul>
        <p>
          Note that executed agreements and the association&rsquo;s decision
          records are retained despite erasure requests while a legal
          obligation or the contract-evidence interest applies. To exercise any right, use the{" "}
          <a href="/contact">contact form</a> (inquiry type <em>General</em>,
          message prefixed <em>&ldquo;Legal:&rdquo;</em>). We respond within 30
          days.
        </p>

        <h2>Changes</h2>
        <p>
          We update this page when our practices change. The{" "}
          <em>Last updated</em> date reflects the most recent change; prior
          submissions remain governed by the version in force when they were
          sent.
        </p>
      </article>
    </>
  );
}
