"use client";

import { useActionState } from "react";
import CountrySelect from "@/app/components/CountrySelect";
import { addObserver, type AddObserverState } from "../actions";

/**
 * Admin form to onboard a Public-Sector Observer from scratch. On success the
 * action redirects to the new member's admin page.
 */
export default function AddObserverForm() {
  const [state, formAction, pending] = useActionState<AddObserverState, FormData>(
    addObserver,
    {},
  );

  return (
    <form action={formAction} className="grid gap-5 max-w-xl mt-6">
      <div className="form-field">
        <label htmlFor="legalName">Organization legal name *</label>
        <input id="legalName" name="legalName" required placeholder="Ministry of …" />
      </div>

      <div className="form-field">
        <label htmlFor="entityType">Entity type <span className="opt">(optional)</span></label>
        <input id="entityType" name="entityType" placeholder="government agency / multilateral body / …" />
      </div>

      <div className="form-field">
        <label>Country / jurisdiction <span className="opt">(optional)</span></label>
        <CountrySelect name="jurisdiction" defaultValue="" />
      </div>

      <div className="form-field">
        <label htmlFor="website">Website <span className="opt">(optional)</span></label>
        <input id="website" name="website" type="url" placeholder="https://example.gov" />
      </div>

      <div className="form-field">
        <label htmlFor="contactEmail">Contact email (becomes the org manager) *</label>
        <input id="contactEmail" name="contactEmail" type="email" required placeholder="rep@example.gov" />
        <p className="hint">
          We invite this address as the organization&rsquo;s manager; they can sign in
          (passwordless) to act for it. Observers are non-voting.
        </p>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div>
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Adding…" : "Add observer"}
        </button>
      </div>
    </form>
  );
}
