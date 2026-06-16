"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  designateMemberSignatories,
  previewAgreement,
  signAsSignatory,
  type SignState,
} from "@/app/(app)/account/membership-agreement/actions";

type Person = { email: string; name: string; role: string };

export type SignatoryView = {
  id: string;
  email: string;
  name: string;
  role: string;
  side: "member" | "council";
  status: "pending" | "signed";
  signedAt: string | null;
  hasPdf: boolean;
  mine: boolean;
};

/**
 * The binding Council Membership Agreement — a bilateral, multi-party signing
 * surface. A manager designates the org's signers (the configured council
 * signatories are added automatically); each designated person reviews and
 * e-signs their own slot; the agreement is fully executed once all have signed.
 */
export default function MembershipAgreementCard({
  memberId,
  memberName,
  signingEnabled,
  agreementVersion,
  signatories,
  total,
  signed,
  fullyExecuted,
  canDesignate,
  orgPeople,
}: {
  memberId: string;
  memberName: string;
  signingEnabled: boolean;
  agreementVersion: string | null;
  signatories: SignatoryView[];
  total: number;
  signed: number;
  fullyExecuted: boolean;
  /** Current user is a manager of this member (may set the signers). */
  canDesignate: boolean;
  /** The member's access-list people (managers + reps), for the designate picker. */
  orgPeople: Person[];
}) {
  const router = useRouter();
  const memberSigners = signatories.filter((s) => s.side === "member");
  const councilSigners = signatories.filter((s) => s.side === "council");
  const mySlot = signatories.find((s) => s.mine && s.status === "pending") ?? null;

  return (
    <div className="card">
      <div className="flex items-center gap-2 flex-wrap">
        {fullyExecuted ? (
          <span className="badge badge-green">Fully executed</span>
        ) : total > 0 ? (
          <span className="badge badge-amber">
            Awaiting {total - signed} of {total} signatures
          </span>
        ) : (
          <span className="badge">Draft — pending incorporation</span>
        )}
        {agreementVersion && <span className="text-xs text-muted">{agreementVersion}</span>}
      </div>
      <h3 className="mt-2">Council Membership Agreement — {memberName}</h3>
      <p className="text-sm text-muted mt-1 leading-relaxed">
        The binding instrument (validator duties, Code of Conduct, IP/licensing).
        It is executed by the organization&rsquo;s designated signers and the
        Council&rsquo;s signatories — each signs individually.
      </p>

      {!agreementVersion ? (
        <p className="text-sm text-muted mt-3">
          No agreement is published yet — you&rsquo;ll be notified when it&rsquo;s
          available to review.
        </p>
      ) : (
        <>
          {total > 0 && (
            <div className="mt-4 grid gap-4">
              <SignatoryList title="Organization signers" rows={memberSigners} memberId={memberId} />
              <SignatoryList title="Council signatories" rows={councilSigners} memberId={memberId} />
            </div>
          )}

          {mySlot && (
            <SignBlock signatory={mySlot} signingEnabled={signingEnabled} onSigned={() => router.refresh()} />
          )}

          {canDesignate && (
            <DesignateBlock
              memberId={memberId}
              signingEnabled={signingEnabled}
              orgPeople={orgPeople}
              current={memberSigners.map((s) => s.email.toLowerCase())}
              hasCouncil={councilSigners.length > 0}
              onSaved={() => router.refresh()}
            />
          )}
        </>
      )}
    </div>
  );
}

function SignatoryList({
  title,
  rows,
  memberId,
}: {
  title: string;
  rows: SignatoryView[];
  memberId: string;
}) {
  if (rows.length === 0) return null;
  return (
    <div>
      <p className="text-xs font-medium text-ink mb-1">{title}</p>
      <ul className="grid gap-1 text-sm">
        {rows.map((s) => (
          <li key={s.id} className="flex flex-wrap items-center gap-2">
            <span className="text-ink">{s.name}</span>
            <span className="text-xs text-muted">({s.role})</span>
            {s.status === "signed" ? (
              <span className="badge badge-green">Signed{s.signedAt ? ` ${s.signedAt}` : ""}</span>
            ) : (
              <span className="badge badge-amber">Pending</span>
            )}
            {s.status === "signed" && s.hasPdf && (
              <a
                href={`/account/agreement/${memberId}?s=${s.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo hover:underline"
              >
                PDF ↓
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SignBlock({
  signatory,
  signingEnabled,
  onSigned,
}: {
  signatory: SignatoryView;
  signingEnabled: boolean;
  onSigned: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [previewing, startPreview] = useTransition();
  const [signerName, setSignerName] = useState(signatory.name);
  const [signerTitle, setSignerTitle] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [state, formAction, pending] = useActionState<SignState, FormData>(signAsSignatory, {});

  if (state.ok) {
    onSigned();
    return <p className="text-sm text-green-700 mt-4">Signed — thank you.</p>;
  }

  if (!signingEnabled) {
    return (
      <div className="mt-4">
        <button type="button" className="btn btn-primary text-sm" disabled>
          Sign the agreement
        </button>
        <p className="text-xs text-muted mt-1">Signing isn&rsquo;t enabled yet.</p>
      </div>
    );
  }

  function review() {
    setPreviewError("");
    startPreview(async () => {
      const res = await previewAgreement(signatory.id, signerName, signerTitle);
      if (res.error || !res.html) {
        setPreviewError(res.error ?? "Could not render the agreement.");
        return;
      }
      setPreview(res.html);
      setOpen(true);
    });
  }

  if (!open) {
    return (
      <div className="mt-4">
        {previewError && <p className="text-sm text-red-600 mb-2">{previewError}</p>}
        <button
          type="button"
          className="btn btn-primary text-sm"
          onClick={review}
          disabled={previewing}
        >
          {previewing ? "Preparing…" : "Review & sign"}
        </button>
        <p className="text-xs text-muted mt-1">You are a designated signer on this agreement.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-4 grid gap-3">
      <input type="hidden" name="signatoryId" value={signatory.id} />
      <div
        className="agreement-prose max-h-[24rem] overflow-y-auto rounded border border-rule bg-surface p-4 text-sm"
        dangerouslySetInnerHTML={{ __html: preview }}
      />
      <div className="form-field">
        <label htmlFor={`signerName-${signatory.id}`}>Signatory — full name *</label>
        <input
          id={`signerName-${signatory.id}`}
          name="signerName"
          required
          value={signerName}
          onChange={(e) => setSignerName(e.target.value)}
        />
      </div>
      <div className="form-field">
        <label htmlFor={`signerTitle-${signatory.id}`}>Signatory — title / role</label>
        <input
          id={`signerTitle-${signatory.id}`}
          name="signerTitle"
          value={signerTitle}
          onChange={(e) => setSignerTitle(e.target.value)}
        />
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          name="accept"
          required
          className="mt-1"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
        />
        <span>I am this signatory and I execute the Council Membership Agreement shown above.</span>
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex gap-3">
        <button type="button" className="btn btn-secondary text-sm" onClick={() => setOpen(false)}>
          Back
        </button>
        <button
          type="submit"
          className="btn btn-primary text-sm"
          disabled={pending || !accepted || !signerName.trim()}
        >
          {pending ? "Signing…" : "Sign the agreement"}
        </button>
      </div>
    </form>
  );
}

function DesignateBlock({
  memberId,
  signingEnabled,
  orgPeople,
  current,
  hasCouncil,
  onSaved,
}: {
  memberId: string;
  signingEnabled: boolean;
  orgPeople: Person[];
  current: string[];
  hasCouncil: boolean;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set(current));
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function toggle(email: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      const k = email.toLowerCase();
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }

  function save() {
    setError("");
    startTransition(async () => {
      const res = await designateMemberSignatories(memberId, [...selected]);
      if (res.error) setError(res.error);
      else {
        setOpen(false);
        onSaved();
      }
    });
  }

  if (!open) {
    return (
      <div className="mt-4 border-t border-rule pt-4">
        <button
          type="button"
          className="btn btn-secondary text-sm"
          onClick={() => setOpen(true)}
          disabled={!signingEnabled}
        >
          {current.length > 0 ? "Edit organization signers" : "Designate signers"}
        </button>
        {!signingEnabled && (
          <p className="text-xs text-muted mt-1">Signing isn&rsquo;t enabled yet.</p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 border-t border-rule pt-4 grid gap-3">
      <p className="text-sm font-medium text-ink">
        Who from your organization signs the agreement?
      </p>
      {orgPeople.length === 0 ? (
        <p className="text-sm text-muted">
          No people on the access list yet — add representatives first.
        </p>
      ) : (
        <ul className="grid gap-1">
          {orgPeople.map((p) => (
            <li key={p.email}>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selected.has(p.email.toLowerCase())}
                  onChange={() => toggle(p.email)}
                />
                <span className="text-ink">{p.name}</span>
                <span className="text-xs text-muted">
                  {p.email} · {p.role}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted">
        {hasCouncil
          ? "The Council's signatories are added automatically (configured by the Council)."
          : "The Council's signatories (configured in admin settings) are added automatically."}
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button type="button" className="btn btn-primary text-sm" disabled={pending} onClick={save}>
          {pending ? "Saving…" : "Save signers"}
        </button>
        <button
          type="button"
          className="btn btn-secondary text-sm"
          disabled={pending}
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
