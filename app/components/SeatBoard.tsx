import Link from "next/link";
import { loadSeatSummary } from "@/app/lib/seats";

/**
 * The Council's public seat picture — seats filled of the cap, plus the spread
 * across sectors and regions. Anonymous by design (no org names); an inviting,
 * legible recruitment surface, not a sector × region grid.
 */
export default async function SeatBoard({
  compact = false,
  cta = true,
}: {
  compact?: boolean;
  /** Render the "Apply for a seat" button (suppress where the page has its own). */
  cta?: boolean;
}) {
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
        <p className="text-sm mt-2 flex flex-wrap items-center gap-2">
          <span className="badge badge-green">{s.remaining} open</span>
          {s.pending > 0 && (
            <span className="badge badge-amber">
              {s.pending} under review
            </span>
          )}
        </p>
        {cta && (
          <div className="mt-4">
            <Link href="/apply" className="btn btn-primary text-sm">
              Apply for a seat →
            </Link>
          </div>
        )}
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
                  <StatusBadge seated={row.seated} open={s.remaining > 0} />
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
                  <StatusBadge seated={row.seated} open={s.remaining > 0} />
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

/**
 * Always show the green "open" badge while seats remain (no per-sector cap),
 * plus an indigo "N seated" badge when the sector/region already has members.
 */
function StatusBadge({ seated, open }: { seated: number; open: boolean }) {
  return (
    <span className="flex items-center justify-end gap-1.5 flex-wrap">
      {seated > 0 && <span className="badge badge-indigo">{seated} seated</span>}
      {open && <span className="badge badge-green">open</span>}
      {!open && seated === 0 && <span className="text-muted">—</span>}
    </span>
  );
}
