"use client";

import { useActionState } from "react";
import { submitEcsInterest, type EoiState } from "./actions";

export default function EoiForm() {
  const [state, formAction, pending] = useActionState<EoiState, FormData>(
    submitEcsInterest,
    {},
  );

  if (state.ok) {
    return (
      <div className="card max-w-2xl">
        <h3>Interest recorded</h3>
        <p className="text-sm text-muted leading-relaxed">
          Thank you — your expression of interest is on the waitlist. The
          Council will reach out when ECS Ecosystem Participant recruitment
          opens (after the ECS-EGF is delivered).
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-4 max-w-2xl">
      {/* Honeypot — invisible to humans. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="label">Organization *</span>
          <input name="orgName" required className="input" />
        </label>
        <label className="block">
          <span className="label">Sector *</span>
          <input name="sector" required className="input" placeholder="e.g. IDV / KYC" />
        </label>
        <label className="block">
          <span className="label">Intended role *</span>
          <input
            name="intendedRole"
            required
            className="input"
            placeholder="issuer, grantor, orchestrator…"
          />
        </label>
        <label className="block">
          <span className="label">Contact name *</span>
          <input name="contactName" required className="input" />
        </label>
        <label className="block sm:col-span-2">
          <span className="label">Contact email *</span>
          <input name="contactEmail" type="email" required className="input" />
        </label>
      </div>
      <label className="block">
        <span className="label">Anything we should know (optional)</span>
        <textarea name="message" rows={4} className="input" />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Submitting…" : "Express interest"}
        </button>
      </div>
      <p className="text-xs text-muted">
        Non-binding. No agreement is signed at this stage; submissions are
        confidential.
      </p>
    </form>
  );
}
