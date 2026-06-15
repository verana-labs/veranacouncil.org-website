"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import {
  previewMembershipAgreement,
  signMembershipAgreement,
  type SignState,
} from "@/app/(app)/account/membership-agreement/actions";

/**
 * The binding Council Membership Agreement — a deliberate, post-acceptance
 * console step (distinct from the non-binding candidacy EOI). Draft pending
 * incorporation; the org's legal team reviews, an authorized signatory e-signs.
 */
export default function MembershipAgreementCard({
  memberId,
  memberName,
  canSign = true,
  agreementVersion,
  signed,
}: {
  memberId: string;
  memberName: string;
  /** Managers may execute the agreement; representatives get a read-only view. */
  canSign?: boolean;
  /** Active agreement version label, or null if none configured. */
  agreementVersion: string | null;
  /** Already executed? (a signature record exists) */
  signed: { version: string; at: string } | null;
}) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [previewing, startPreview] = useTransition();
  const [accepted, setAccepted] = useState(false);
  const [signerName, setSignerName] = useState("");
  const [signerTitle, setSignerTitle] = useState("");
  const [state, formAction, pending] = useActionState<SignState, FormData>(
    signMembershipAgreement,
    {},
  );

  function review() {
    setPreviewError("");
    startPreview(async () => {
      const res = await previewMembershipAgreement(memberId, signerName, signerTitle);
      if (res.error || !res.html) {
        setPreviewError(res.error ?? "Could not render the agreement.");
        return;
      }
      setPreview(res.html);
      setOpen(true);
    });
  }

  if (signed || state.ok) {
    return (
      <div className="card">
        <div className="flex items-center gap-2">
          <span className="badge badge-indigo">Signed</span>
          {signed && <span className="text-xs text-muted">{signed.version}</span>}
        </div>
        <h3 className="mt-2">Council Membership Agreement</h3>
        <p className="text-sm text-muted mt-1">
          Executed{signed ? ` on ${signed.at}` : ""} for {memberName}.
        </p>
        <a
          href={`/account/agreement/${memberId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-indigo hover:underline mt-2 inline-block"
        >
          Download signed agreement ↓
        </a>
      </div>
    );
  }

  // Representatives: read-only — they don't execute the agreement.
  if (!canSign) {
    return (
      <div className="card">
        <span className="badge">Draft — pending incorporation</span>
        <h3 className="mt-2">Council Membership Agreement</h3>
        <p className="text-sm text-muted mt-1 leading-relaxed">
          The binding agreement for {memberName} is a draft pending the
          Verein&rsquo;s incorporation. An organization manager (authorized
          signatory) executes it; once signed, it will be available to download
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <span className="badge">Draft — pending incorporation</span>
      <h3 className="mt-2">Council Membership Agreement</h3>
      <p className="text-sm text-muted mt-1 leading-relaxed">
        This is the binding instrument (validator duties, Code of Conduct,
        IP/licensing). It is a <strong>draft</strong> pending the Verein&rsquo;s
        incorporation — share it with your legal team for review; an authorized
        signatory e-signs here when it&rsquo;s finalized.
      </p>

      {!agreementVersion ? (
        <p className="text-sm text-muted mt-3">
          No agreement is published yet — you&rsquo;ll be notified when it&rsquo;s
          available to review.
        </p>
      ) : !open ? (
        <div className="mt-3">
          {previewError && <p className="text-sm text-red-600 mb-2">{previewError}</p>}
          <button
            type="button"
            className="btn btn-secondary text-sm"
            onClick={review}
            disabled={previewing}
          >
            {previewing ? "Preparing…" : "Review the draft"}
          </button>
        </div>
      ) : (
        <form action={formAction} className="mt-4 grid gap-3">
          <input type="hidden" name="memberId" value={memberId} />
          <div
            className="agreement-prose max-h-[24rem] overflow-y-auto rounded border border-rule bg-surface p-4 text-sm"
            dangerouslySetInnerHTML={{ __html: preview }}
          />
          <div className="form-field">
            <label htmlFor="signerName">Signatory — full name *</label>
            <input
              id="signerName"
              name="signerName"
              required
              value={signerName}
              onChange={(e) => setSignerName(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="signerTitle">Signatory — title / role</label>
            <input
              id="signerTitle"
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
            <span>
              I am an authorized signatory for {memberName} and I execute the
              Council Membership Agreement shown above.
            </span>
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
      )}
    </div>
  );
}
