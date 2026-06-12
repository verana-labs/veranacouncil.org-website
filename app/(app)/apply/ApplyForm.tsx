"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useActionState } from "react";
import CountrySelect from "@/app/components/CountrySelect";
import { applyCandidacy, previewAgreement, type ApplyState } from "./actions";

export default function ApplyForm({
  agreementVersion,
  seat,
  prefill,
}: {
  agreementVersion: string;
  /** The open seat this candidacy targets. */
  seat: { id: string; label: string };
  /** Org details when the user already manages an organization (seat switch). */
  prefill?: {
    legalName: string;
    entityType: string | null;
    jurisdiction: string | null;
    registeredAddress: string | null;
  } | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [step, setStep] = useState<1 | 2>(1);
  const [accepted, setAccepted] = useState(false);
  const [preview, setPreview] = useState<string>("");
  const [previewError, setPreviewError] = useState<string>("");
  const [previewing, startPreview] = useTransition();
  const [state, formAction, pending] = useActionState<ApplyState, FormData>(
    applyCandidacy,
    {},
  );
  const reviewRef = useRef<HTMLFieldSetElement>(null);
  const acceptRef = useRef<HTMLSpanElement>(null);

  /** Scroll so `el` sits just below the sticky site header. */
  function scrollBelowHeader(el: HTMLElement) {
    const headerH =
      document.querySelector(".site-header")?.getBoundingClientRect().height ?? 0;
    const y = el.getBoundingClientRect().top + window.scrollY - headerH - 12;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  useEffect(() => {
    if (step === 2 && reviewRef.current) scrollBelowHeader(reviewRef.current);
  }, [step]);

  /** Flash the acceptance text twice (when the disabled Sign button is clicked). */
  function blinkAccept() {
    acceptRef.current?.animate(
      [{ opacity: 1 }, { opacity: 0.15 }, { opacity: 1 }],
      { duration: 220, iterations: 2 },
    );
  }

  function step1Error(fd: FormData): string | null {
    const has = (k: string) => !!(fd.get(k) as string)?.trim();
    if (!has("legalName")) return "Enter the legal name.";
    if (!has("jurisdiction")) return "Select the country.";
    if (!has("signerName")) return "Enter the signatory's name.";
    return null;
  }

  function toReview() {
    const form = formRef.current;
    if (!form) return;
    const fd = new FormData(form);
    const err = step1Error(fd);
    if (err) {
      setPreviewError(err);
      return;
    }
    setPreviewError("");
    const get = (k: string) => (fd.get(k) as string) || undefined;
    startPreview(async () => {
      const res = await previewAgreement({
        seatId: seat.id,
        legalName: get("legalName"),
        entityType: get("entityType"),
        jurisdiction: get("jurisdiction"),
        registeredAddress: get("registeredAddress"),
        signerName: get("signerName"),
        signerTitle: get("signerTitle"),
      });
      if (res.error || !res.html) {
        setPreviewError(res.error ?? "Could not render the agreement.");
        return;
      }
      setPreview(res.html);
      setStep(2);
    });
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-8">
      <input type="hidden" name="seatId" value={seat.id} />

      {/* ── Step 1 — organization & signatory ───────────────────────────── */}
      <fieldset className={step === 1 ? "space-y-6" : "hidden"}>
        <div className="card p-5 space-y-1">
          <div className="text-xs uppercase tracking-wide text-[var(--muted)]">
            Candidacy for the open seat
          </div>
          <div className="font-mono text-sm">{seat.label}</div>
          <p className="text-sm text-[var(--muted)]">
            One candidacy per organization. Membership is free — no dues, no
            capital contribution. Admission is by a ⅔ vote of the seated
            members.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="label">Legal name of the organization *</span>
            <input
              name="legalName"
              required
              defaultValue={prefill?.legalName ?? ""}
              className="input"
              placeholder="ACME Corp."
            />
          </label>
          <label className="block">
            <span className="label">Entity type</span>
            <input
              name="entityType"
              defaultValue={prefill?.entityType ?? ""}
              className="input"
              placeholder="corporation, university, agency…"
            />
          </label>
          <label className="block">
            <span className="label">Country / jurisdiction *</span>
            <CountrySelect name="jurisdiction" defaultValue={prefill?.jurisdiction ?? ""} />
          </label>
          <label className="block">
            <span className="label">Registered address</span>
            <input
              name="registeredAddress"
              defaultValue={prefill?.registeredAddress ?? ""}
              className="input"
            />
          </label>
          <label className="block">
            <span className="label">Signatory — full name *</span>
            <input name="signerName" required className="input" />
          </label>
          <label className="block">
            <span className="label">Signatory — role / title</span>
            <input name="signerTitle" className="input" placeholder="CEO, Director…" />
          </label>
        </div>

        <label className="block">
          <span className="label">Organization logo (optional)</span>
          <input type="file" name="logo" accept="image/*" className="input" />
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="logoDisplayConsent" className="mt-1" />
          <span>
            The logo may be displayed on veranacouncil.org once the organization
            is seated and listed.
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="socialAnnouncementConsent" className="mt-1" />
          <span>
            The Council may announce the seating of this organization on its
            social channels.
          </span>
        </label>

        {previewError && <p className="text-sm text-red-700">{previewError}</p>}

        <button
          type="button"
          onClick={toReview}
          disabled={previewing}
          className="btn-primary"
        >
          {previewing ? "Preparing the agreement…" : "Review the Candidate Agreement"}
        </button>
      </fieldset>

      {/* ── Step 2 — review & sign ──────────────────────────────────────── */}
      <fieldset ref={reviewRef} className={step === 2 ? "space-y-6" : "hidden"}>
        <h2 className="text-xl font-semibold">Candidate Agreement ({agreementVersion})</h2>
        <div
          className="agreement-preview card max-h-[28rem] overflow-y-auto p-6 text-sm"
          dangerouslySetInnerHTML={{ __html: preview }}
        />
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            name="accept"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1"
          />
          <span ref={acceptRef}>
            I am authorized to sign for this organization and I accept the
            Candidate Agreement for the seat <strong>{seat.label}</strong>.
          </span>
        </label>

        {state.error && <p className="text-sm text-red-700">{state.error}</p>}

        <div className="flex gap-3">
          <button type="button" onClick={() => setStep(1)} className="btn-secondary">
            Back
          </button>
          <span onClick={() => !accepted && blinkAccept()}>
            <button type="submit" disabled={!accepted || pending} className="btn-primary">
              {pending ? "Signing…" : "Sign & open the candidacy"}
            </button>
          </span>
        </div>
      </fieldset>
    </form>
  );
}
