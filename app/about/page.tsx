import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "The Verana Council Association is a non-profit Swiss Verein that authors and operates the governance frameworks of the open public trust layer and secures the chain they run on.",
  alternates: { canonical: "/about" },
};

const STEWARDS = [
  {
    name: "Fabrice Rochette",
    img: "/assets/img/team/fabrice.jpeg",
    role: "Founding Steward",
    org: "Co-founder & CEO, 2060.io",
    linkedin: "https://www.linkedin.com/in/fabricerochette/",
  },
  {
    name: "Ariel Gentile",
    img: "/assets/img/team/ariel.jpeg",
    role: "Secretariat — Technical",
    org: "Co-founder & CTO, 2060.io",
    linkedin: "https://www.linkedin.com/in/aogentile/",
  },
  {
    name: "Gerard William Burion",
    img: "/assets/img/team/gerard.jpeg",
    role: "Secretariat — Programs",
    org: "Chief Product Officer, 2060.io",
    linkedin: "https://www.linkedin.com/in/gerard-william-burion/",
  },
  {
    name: "Philip A. Bildner",
    img: "/assets/img/team/philip.jpeg",
    role: "Strategic Advisor",
    org: null,
    linkedin: "https://www.linkedin.com/in/pbildner/",
  },
  {
    name: "David Rennie",
    img: "/assets/img/team/david.jpeg",
    role: "Strategic Advisor",
    org: null,
    linkedin: "https://www.linkedin.com/in/david-rennie-b736541/",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <nav className="text-sm text-muted mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-indigo-primary">
              Home
            </Link>{" "}
            · <span className="text-ink">About</span>
          </nav>
          <p className="eyebrow mb-4">About the Council</p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight max-w-4xl">
            Who we are and how we run.
          </h1>
          <p className="mt-6 text-lg text-muted max-w-3xl leading-relaxed">
            The Verana Council Association is a non-profit Swiss Verein that
            authors and operates the governance frameworks of the open public
            trust layer, and secures the chain on which they run.
          </p>
        </div>
      </section>

      <section>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 prose-body">
          <h2>Mission</h2>
          <p>
            To author, operate, and evolve, transparently and under
            one-member-one-vote rules, the two governance frameworks that make
            the Verana network a neutral public trust infrastructure: the{" "}
            <Link href="/governance">
              Network Governance Framework and the ECS Ecosystem Governance
              Framework
            </Link>
            .
          </p>

          <h2>Structure</h2>
          <p>
            The Council is being established as a non-profit Swiss Verein under
            Art. 60 ZGB, with target incorporation <strong>Q3 2026</strong>. Its
            organs are the General Assembly (all Members, one vote each), an
            elected Board, and standing committees. The draft statutes are
            maintained in the{" "}
            <a href="https://github.com/verana-labs/verana-council-gov/tree/main/bylaws">
              Bylaws
            </a>
            .
          </p>

          <h2>Stewardship (pre-incorporation)</h2>
          <p>
            Until incorporation, a transitional{" "}
            <strong>Founding Steward and Secretariat</strong> carry out the
            formation work. Their mandate is deliberately narrow and temporary:
          </p>
          <ul>
            <li>
              <strong>Draft, don&apos;t decide.</strong> They prepare the
              Bylaws, the Network GF, and the ECS-EGF for Founding Members to
              co-author and ratify. They hold no governance vote of their own.
            </li>
            <li>
              <strong>Onboard Founding Members.</strong> They run intro calls,
              align seats against the (sector × region) diversity rule, and
              countersign Letters of Intent on behalf of the
              consortium-in-formation.
            </li>
            <li>
              <strong>Hand over and dissolve.</strong> At the Q3 2026
              Incorporation General Assembly, authority transfers to the elected
              Board and the General Assembly, and the transitional role ends.
            </li>
          </ul>
          <p className="not-prose my-6">
            <span className="inline-flex flex-wrap items-center gap-2 text-sm font-medium">
              <span className="px-3 py-1 rounded-full bg-indigo-primary/10 text-indigo-primary">
                Founding Steward &amp; Secretariat
              </span>
              <span className="text-muted">→</span>
              <span className="px-3 py-1 rounded-full bg-indigo-primary/10 text-indigo-primary">
                Incorporation GA · Q3 2026
              </span>
              <span className="text-muted">→</span>
              <span className="px-3 py-1 rounded-full bg-indigo-primary text-white">
                Elected Board &amp; General Assembly
              </span>
            </span>
          </p>
          <p>
            This separation is intentional: a small team can move fast to stand
            the Council up, but it never becomes the authority. Member control
            is the destination, not a later upgrade.
          </p>

          <p className="text-sm text-muted">
            The transitional team is drawn from{" "}
            <a href="https://2060.io" rel="noopener">
              2060.io
            </a>
            , the company that builds and operates the Verana infrastructure,
            together with independent strategic advisors.
          </p>

          <div className="not-prose grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {STEWARDS.map((s) => (
              <article key={s.name} className="card flex items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.img}
                  alt={s.name}
                  width={56}
                  height={56}
                  className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                  loading="lazy"
                />
                <div>
                  <h3 className="font-semibold leading-tight">{s.name}</h3>
                  <p className="text-xs uppercase tracking-wider text-indigo-primary mt-1">
                    {s.role}
                  </p>
                  {s.org && (
                    <p className="text-sm text-muted mt-1">{s.org}</p>
                  )}
                  <a
                    href={s.linkedin}
                    rel="noopener"
                    className="text-sm text-indigo-primary hover:underline mt-1 inline-block"
                  >
                    LinkedIn ↗
                  </a>
                </div>
              </article>
            ))}
          </div>

          <h2>How we operate</h2>
          <ul>
            <li>
              <strong>One-member-one-vote.</strong> Equal voice regardless of
              size.
            </li>
            <li>
              <strong>Seat diversity.</strong> One voice per (sector × region),
              a hard constraint.
            </li>
            <li>
              <strong>Validator obligation.</strong> Every Member operates a
              validator node on the Verana chain, directly or via a qualified
              delegated operator. The validator set is restricted to Council
              Members.
            </li>
            <li>
              <strong>Code of Conduct.</strong> Binding on all participants,
              including the conflict-of-interest cooldown. See the{" "}
              <a href="https://github.com/verana-labs/verana-council-gov/tree/main/code-of-conduct">
                Code of Conduct
              </a>
              .
            </li>
          </ul>

          <h2>Transparency</h2>
          <p>
            The Council meets quarterly. Agendas, minutes, voting records, and
            sanctions decisions are published as public record. See{" "}
            <Link href="/news">News</Link>.
          </p>

          <h2>What the Council is not</h2>
          <ul>
            <li>
              <strong>Not a chartered standards body.</strong> It composes open
              standards; it does not author them.
            </li>
            <li>
              <strong>Not a product vendor.</strong> Wallets, agents, and
              services run on Verana but are not built by the Council.
            </li>
            <li>
              <strong>Not a sector-EGF authority.</strong> Any ecosystem can
              author its own EGF; the Council publishes a Template EGF, not an
              approval gate.
            </li>
            <li>
              <strong>Not a grant-making body.</strong> Treasury and grants are
              the remit of the Verana Foundation (separate entity).
            </li>
            <li>
              <strong>Not single-company controlled.</strong>{" "}
              One-member-one-vote, seat-diversity enforced.
            </li>
          </ul>

          <p className="not-prose mt-8 flex flex-wrap gap-4">
            <Link href="/governance" className="btn btn-secondary">
              Governance
            </Link>
            <Link href="/join" className="btn btn-primary">
              Join the Council
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
