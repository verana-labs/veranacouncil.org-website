import Link from "next/link";
import { loadSeatSummary } from "@/app/lib/seats";

/**
 * The Council's public seat picture — seats filled of the cap, plus the spread
 * across sectors and regions. Anonymous by design (no org names); an inviting,
 * legible recruitment surface, not a sector × region grid.
 */
export default async function SeatBoard({ compact = false }: { compact?: boolean }) {
  const s = await loadSeatSummary();
  const pct = s.cap > 0 ? Math.round((s.seated / s.cap) * 100) : 0;

  return (
    <div className="grid gap-8">
      {/* Filled / cap */}
      <div>
        <div className="flex items-baseline gap-3">
          <span className="display text-4xl">{s.seated}</span>
          <span className="text-muted">of {s.cap} Founding Member seats filled</span>
        </div>
        <div className="mt-3 h-2 w-full max-w-md rounded-full bg-rule overflow-hidden">
          <div className="h-full bg-indigo" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-sm text-muted mt-2">
          {s.remaining} open
          {s.pending > 0 && ` · ${s.pending} candidacy(ies) under review`}
          {" · "}
          <Link href="/join" className="text-indigo hover:underline">
            apply for a seat →
          </Link>
        </p>
      </div>

      {!compact && (
        <div className="grid sm:grid-cols-2 gap-8">
          {/* Sector spread */}
          <div>
            <p className="tag mb-3">Sectors</p>
            <ul className="grid gap-1.5 text-sm">
              {s.bySector.map((row) => (
                <li key={row.sector} className="flex items-center justify-between gap-3">
                  <span>{row.label}</span>
                  <span className="font-mono text-muted">
                    {row.seated > 0 ? `${row.seated} seated` : "open"}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Region spread */}
          <div>
            <p className="tag mb-3">Regions</p>
            <ul className="grid gap-1.5 text-sm">
              {s.byRegion.map((row) => (
                <li key={row.region} className="flex items-center justify-between gap-3">
                  <span>{row.label}</span>
                  <span className="font-mono text-muted">
                    {row.seated > 0 ? `${row.seated} seated` : "—"}
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted mt-3">
              Region is a soft balancing guardrail — the Council aims for broad
              representation, not a fixed quota per region.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
