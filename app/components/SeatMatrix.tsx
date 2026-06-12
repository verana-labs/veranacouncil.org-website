import Link from "next/link";
import {
  loadMatrix,
  SECTORS,
  REGIONS,
  SECTOR_LABELS,
  REGION_LABELS,
  type MatrixCell,
} from "@/app/lib/seats";

/**
 * The live seat matrix (sector × region) — the Council's signature element.
 * Absent cells are n/a; open cells link to /join with the seat pre-selected.
 */
export default async function SeatMatrix({ compact = false }: { compact?: boolean }) {
  const cells = await loadMatrix();
  const byKey = new Map<string, MatrixCell>(
    cells.map((c) => [`${c.sector}:${c.region}`, c]),
  );

  return (
    <div className="overflow-x-auto">
      <table className={`w-full border-collapse ${compact ? "text-xs" : "text-sm"} min-w-[640px]`}>
        <thead>
          <tr className="text-left text-muted">
            <th className="p-2 font-medium">Sector \ Region</th>
            {REGIONS.map((r) => (
              <th key={r} className="p-2 font-mono font-medium">
                {REGION_LABELS[r]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SECTORS.map((s) => (
            <tr key={s} className="border-t border-rule">
              <td className="p-2">{SECTOR_LABELS[s]}</td>
              {REGIONS.map((r) => {
                const cell = byKey.get(`${s}:${r}`);
                if (!cell) {
                  return (
                    <td key={r} className="p-2 font-mono text-muted/50">
                      —
                    </td>
                  );
                }
                if (cell.state === "seated") {
                  return (
                    <td key={r} className="p-2 font-mono">
                      <span className="badge badge-indigo" title={cell.seatedMemberName ?? "Seated"}>
                        {cell.seatedMemberName ?? "seated"}
                      </span>
                    </td>
                  );
                }
                return (
                  <td key={r} className="p-2 font-mono">
                    <Link
                      href={`/apply?seat=${cell.id}`}
                      className="badge hover:border-indigo hover:text-indigo"
                      title={
                        cell.state === "pending"
                          ? `${cell.pendingCount} candidacy(ies) pending — still open to new candidacies`
                          : "Open seat — apply"
                      }
                    >
                      {cell.state === "pending" ? "candidate pending" : "[open]"}
                    </Link>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {!compact && (
        <p className="text-xs text-muted mt-3">
          <span className="font-mono">[open]</span> — accepting candidacies (a
          seat stays open until someone is seated) ·{" "}
          <span className="font-mono">candidate pending</span> — candidacies in
          the queue; still open to new ones ·{" "}
          <span className="font-mono">seated</span> — taken. Opening a new cell
          is itself a Council decision.
        </p>
      )}
    </div>
  );
}
