"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { setMembershipStatus } from "./actions";
import {
  MEMBERSHIP_TRANSITIONS,
  MEMBERSHIP_STATUS_LABEL,
  type MembershipStatus,
} from "./transitions";
import {
  DEPARTURE_REASONS,
  DEPARTURE_REASON_LABEL,
  type DepartureReason,
} from "@/app/lib/exits";

export type AdminMembership = {
  id: string;
  memberId: string;
  track: "founding_member" | "observer";
  status: MembershipStatus;
  admission: string | null;
  seatedAt: string | null;
  ratifiedAt: string | null;
};

const STATUS_BADGE: Record<string, string> = {
  active: "badge-indigo",
  pending: "badge-amber",
  suspended: "badge-red",
  ended: "badge-red",
};

const titleize = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
const day = (iso: string | null) => (iso ? iso.slice(0, 10) : "—");

export default function MembershipAdminCard({ membership: m }: { membership: AdminMembership }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  // When a transition needs published reasoning (a departure, or an optional
  // note on suspension), we collect it in an inline panel before committing.
  const [panel, setPanel] = useState<null | "ended" | "suspended">(null);
  const [reason, setReason] = useState<DepartureReason>("term_not_renewed");
  const [rationale, setRationale] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!menuOpen) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  const targets = MEMBERSHIP_TRANSITIONS[m.status] ?? [];
  // Exiting a seated member (active/suspended → ended) is the one that asks for
  // a reason; suspending offers an optional published note.
  const isSeated = m.status === "active" || m.status === "suspended";

  function commit(status: MembershipStatus, opts?: { reason?: DepartureReason; rationale?: string }) {
    setError("");
    startTransition(async () => {
      try {
        await setMembershipStatus(m.id, m.memberId, status, opts);
        setMenuOpen(false);
        setPanel(null);
        setRationale("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  }

  function choose(t: MembershipStatus) {
    setMenuOpen(false);
    setError("");
    if (t === "ended" && isSeated) {
      setReason("term_not_renewed");
      setRationale("");
      setPanel("ended");
    } else if (t === "suspended") {
      setRationale("");
      setPanel("suspended");
    } else {
      commit(t);
    }
  }

  return (
    <div ref={rootRef} className="card relative mt-2 max-w-md">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge badge-purple">{titleize(m.track)}</span>
          <span className={`badge ${STATUS_BADGE[m.status] ?? ""}`}>{titleize(m.status)}</span>
        </div>

        {targets.length > 0 && (
          <div className="flex-shrink-0">
            <button
              type="button"
              aria-label="Membership actions"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
              className="px-1.5 py-1 rounded hover:bg-rule/50 text-muted"
            >
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-3 top-10 z-20 w-48 rounded-lg border border-rule bg-elevated py-1 shadow-lg text-sm"
              >
                {targets.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="menuitem"
                    disabled={pending}
                    onClick={() => choose(t)}
                    className={`block w-full px-3 py-2 text-left hover:bg-rule/40 ${
                      t === "ended" || t === "suspended" ? "text-red-600" : ""
                    }`}
                  >
                    {MEMBERSHIP_STATUS_LABEL[t]}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inline panel: reason + published rationale before committing an exit. */}
      {panel && (
        <div className="mt-3 grid gap-2 rounded-lg border border-rule p-3 text-sm">
          {panel === "ended" && (
            <label className="grid gap-1">
              <span className="font-medium text-ink">Reason</span>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as DepartureReason)}
                className="field text-sm"
                disabled={pending}
              >
                {DEPARTURE_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {titleize(DEPARTURE_REASON_LABEL[r])}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="grid gap-1">
            <span className="font-medium text-ink">
              {panel === "ended" && reason === "removal_for_cause"
                ? "Rationale (published, required)"
                : "Rationale (published, optional)"}
            </span>
            <textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={3}
              placeholder="Shown on the public record"
              className="field text-sm w-full"
              disabled={pending}
            />
          </label>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-primary text-xs"
              disabled={pending}
              onClick={() =>
                commit(panel, {
                  reason: panel === "ended" ? reason : undefined,
                  rationale,
                })
              }
            >
              {pending ? "Saving…" : panel === "ended" ? "End membership" : "Suspend"}
            </button>
            <button
              type="button"
              className="btn btn-secondary text-xs"
              disabled={pending}
              onClick={() => {
                setPanel(null);
                setError("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && !panel && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        {m.admission && (
          <>
            <dt className="text-muted">Admission</dt>
            <dd>{titleize(m.admission)}</dd>
          </>
        )}
        <dt className="text-muted">Seated</dt>
        <dd>{day(m.seatedAt)}</dd>
        <dt className="text-muted">Ratified</dt>
        <dd>{day(m.ratifiedAt)}</dd>
      </dl>
    </div>
  );
}
