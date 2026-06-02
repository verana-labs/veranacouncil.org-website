import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "News",
  description:
    "The Verana Council's public record: new Members, framework votes, sanctions decisions, and meeting summaries, in chronological order.",
  alternates: { canonical: "/news" },
};

const ITEMS = [
  {
    date: "2026-04",
    tag: "Governance",
    title: "Founding Council recruitment opens through Q3 2026.",
  },
  {
    date: "2026-03",
    tag: "Frameworks",
    title:
      "Network GF and ECS-EGF v_DRAFT_0.9 published for Founding Member review.",
  },
  {
    date: "2025-Q4",
    tag: "Network",
    title:
      "Testnet live: Layer-1 chain, indexer, resolver, visualizer, and faucet.",
  },
];

export default function NewsPage() {
  return (
    <>
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <nav className="text-sm text-muted mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-indigo-primary">
              Home
            </Link>{" "}
            · <span className="text-ink">News</span>
          </nav>
          <p className="eyebrow mb-4">Public record</p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight max-w-4xl">
            The Council in public.
          </h1>
          <p className="mt-6 text-lg text-muted max-w-3xl leading-relaxed">
            Every new Member, framework vote, sanctions decision, and meeting
            summary is published here in chronological order.
          </p>
        </div>
      </section>

      <section>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <ul className="divide-y divide-rule">
            {ITEMS.map((item) => (
              <li key={item.date + item.title} className="py-5 flex gap-6">
                <span className="font-mono text-sm text-muted w-24 flex-shrink-0">
                  {item.date}
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted">
                    {item.tag}
                  </p>
                  <p className="font-medium">{item.title}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted mt-8 italic">
            Meeting minutes and voting records are added here once the Council
            holds its first General Assembly (Q3 2026).
          </p>
        </div>
      </section>
    </>
  );
}
