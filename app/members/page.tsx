import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Members",
  description:
    "Founding Members and Public-Sector Observers of the Verana Council Association, and how the (sector × region) seat-diversity rule works.",
  alternates: { canonical: "/members" },
};

const REGIONS = ["Americas", "EMEA", "APAC", "LATAM", "Africa"];
const SECTORS = [
  "Government & public sector",
  "Standards & non-profit",
  "Financial services",
  "Telecom & connectivity",
  "Technology & enterprise",
  "Academia & research",
];

export default function MembersPage() {
  return (
    <>
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <nav className="text-sm text-muted mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-indigo-primary">
              Home
            </Link>{" "}
            · <span className="text-ink">Members</span>
          </nav>
          <p className="eyebrow mb-4">The ecosystem</p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight max-w-4xl">
            Members &amp; Observers.
          </h1>
          <p className="mt-6 text-lg text-muted max-w-3xl leading-relaxed">
            The Council brings together governments, standards bodies,
            enterprises, and academic institutions, with seat diversity enforced
            by rule. The roster is published as Members and Observers join
            through Q3 2026.
          </p>
        </div>
      </section>

      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-semibold mb-8">Founding Members</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="border border-rule rounded bg-white h-24 flex items-center justify-center text-muted text-sm"
              >
                Seat open
              </div>
            ))}
          </div>
          <p className="text-sm text-muted mt-4 italic">
            Members are listed here as Letters of Intent are signed and ratified
            at incorporation.
          </p>
        </div>
      </section>

      <section>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 prose-body">
          <h2>How seats work</h2>
          <p>
            Each voting seat is tied to a unique{" "}
            <strong>(sector × region)</strong> cell, so no single industry or
            geography can dominate the Council. A seat is a governance vote on
            the Council&apos;s frameworks; it does not by itself confer Issuer or
            Issuer-Grantor status. Public-Sector Observers hold non-voting status
            and do not count against the diversity rule, making the tier a
            working on-ramp to membership.
          </p>

          <h3>Seat diversity matrix</h3>
          <p>
            One voting seat per cell. Cells fill as Founding Members are
            confirmed through Q3 2026.
          </p>
          <div className="not-prose overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full border-collapse text-sm min-w-[640px]">
              <thead>
                <tr>
                  <th className="border border-rule bg-white p-2.5 text-left font-semibold">
                    Sector ＼ Region
                  </th>
                  {REGIONS.map((r) => (
                    <th
                      key={r}
                      className="border border-rule bg-white p-2.5 text-left font-semibold"
                    >
                      {r}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SECTORS.map((sector) => (
                  <tr key={sector}>
                    <th className="border border-rule bg-white p-2.5 text-left font-medium">
                      {sector}
                    </th>
                    {REGIONS.map((r) => (
                      <td
                        key={r}
                        className="border border-rule p-2.5 text-muted"
                      >
                        Open
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted italic">
            Sectors and regions shown are indicative; the final matrix is
            ratified with the Bylaws at incorporation.
          </p>

          <p className="not-prose mt-8 flex flex-wrap gap-4">
            <Link href="/join" className="btn btn-primary">
              Become a Member
            </Link>
            <Link href="/about" className="btn btn-secondary">
              About the Council
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
