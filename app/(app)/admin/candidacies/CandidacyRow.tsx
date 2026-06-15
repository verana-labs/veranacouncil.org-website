"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { vetCandidacy, openBallot, designateSeed, withdrawCandidacy } from "./actions";

export type AdminCandidacy = {
  id: string;
  status: string;
  memberName: string;
  memberId: string;
  memberEmail: string;
  seat: string;
  completedAt: string | null;
  ballotCloses: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  applied: "Applied (unsigned)",
  signed: "Awaiting vetting",
  queued: "Queued",
  ballot_open: "Ballot open",
};

export default function CandidacyRow({
  candidacy: c,
  seedAvailable,
}: {
  candidacy: AdminCandidacy;
  seedAvailable: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [seedOpen, setSeedOpen] = useState(false);
  const [rationale, setRationale] = useState("");

  function run(fn: () => Promise<void>) {
    startTransition(async () => {
      try {
        await fn();
        setError("");
        setSeedOpen(false);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Action failed.");
      }
    });
  }

  return (
    <div className="card">
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge">{STATUS_LABEL[c.status] ?? c.status}</span>
        {c.completedAt && (
          <span className="badge">queued {c.completedAt.slice(0, 10)}</span>
        )}
        {c.ballotCloses && (
          <span className="badge badge-indigo">closes {c.ballotCloses.slice(0, 10)}</span>
        )}
      </div>
      <h3 className="mt-2">
        <Link href={`/admin/members/${c.memberId}`} className="hover:underline">
          {c.memberName}
        </Link>
      </h3>
      <p className="text-sm font-mono">{c.seat}</p>
      <p className="text-sm text-muted">{c.memberEmail}</p>

      <div className="flex flex-wrap gap-3 mt-3">
        {c.status === "signed" && (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              window.confirm(`Mark vetting passed for ${c.memberName}? The candidacy becomes eligible for a ballot.`) &&
              run(() => vetCandidacy(c.id))
            }
            className="btn btn-primary text-sm"
          >
            Vetting passed
          </button>
        )}
        {c.status === "queued" && (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              window.confirm(
                `Open the admission ballot for ${c.memberName} (${c.seat})? The window and electorate snapshot start now.`,
              ) && run(() => openBallot(c.id))
            }
            className="btn btn-primary text-sm"
          >
            Open admission ballot
          </button>
        )}
        {seedAvailable && ["signed", "queued"].includes(c.status) && (
          <button
            type="button"
            disabled={pending}
            onClick={() => setSeedOpen((o) => !o)}
            className="btn btn-secondary text-sm"
          >
            Seed designation…
          </button>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            window.confirm(
              `Withdraw ${c.memberName}'s candidacy? It is removed from the seat board and the pipeline. Use this for abandoned or erroneous candidacies.`,
            ) && run(() => withdrawCandidacy(c.id))
          }
          className="text-sm text-red-600 hover:underline ml-auto self-center"
        >
          Withdraw
        </button>
      </div>

      {seedOpen && (
        <div className="mt-3 grid gap-2">
          <textarea
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            rows={3}
            placeholder="Published rationale for this steward designation (appears on the public record)"
            className="field w-full text-sm"
            disabled={pending}
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending || !rationale.trim()}
              onClick={() =>
                window.confirm(
                  `Directly seat ${c.memberName} as a seed-cohort member? The rationale is published on the public record.`,
                ) && run(() => designateSeed(c.id, rationale))
              }
              className="btn btn-primary text-sm"
            >
              Designate &amp; seat
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setSeedOpen(false)}
              className="btn btn-secondary text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
