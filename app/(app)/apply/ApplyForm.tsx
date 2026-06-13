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
  const [hasLogo, setHasLogo] = useState(false);
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
    if (!has("legalName")) return "Enter the organization's legal name.";
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
    <form ref={formRef} action={formAction} className="grid gap-8 max-w-2xl">
      <input type="hidden" name="seatId" value={seat.id} />

      {/* ── Step 1: your organization ────────────────────────────────── */}
      <div className={step === 1 ? "grid gap-8" : "hidden"}>
        <div className="card">
          <p className="tag mb-2">Candidacy for the open seat</p>
          <p className="display text-xl text-ink font-mono">{seat.label}</p>
          <p className="text-sm text-muted mt-3 leading-relaxed">
            One candidacy per organization. Membership is free — no dues, no
            capital contribution. Admission is decided by a ⅔ vote of the
            seated members, one ballot per candidate.
          </p>
        </div>

        <fieldset className="grid gap-1">
          <SectionHeading tag="Your organization" title="Tell us who is applying" />
          <Field
            label="Organization legal name"
            name="legalName"
            required
            defaultValue={prefill?.legalName ?? ""}
            placeholder="ACME Corp."
          />
          <Field
            label="Entity type"
            name="entityType"
            placeholder="corporation / university / agency / …"
            defaultValue={prefill?.entityType ?? ""}
          />
          <Labeled label="Country / jurisdiction" required>
            <CountrySelect name="jurisdiction" required defaultValue={prefill?.jurisdiction ?? ""} />
          </Labeled>
          <Field
            label="Registered address"
            name="registeredAddress"
            defaultValue={prefill?.registeredAddress ?? ""}
          />
          <LogoField hasLogo={hasLogo} onPick={setHasLogo} />
        </fieldset>

        <fieldset className="grid gap-1 border-t border-rule pt-8">
          <SectionHeading tag="Signatory" title="Who signs for the organization" />
          <Field label="Signed by (name)" name="signerName" required />
          <Field label="Title / role" name="signerTitle" placeholder="CEO, Director, …" />
        </fieldset>

        {previewError && <p className="text-sm text-red-600">{previewError}</p>}

        <button
          type="button"
          className="btn btn-primary w-fit"
          onClick={toReview}
          disabled={previewing}
        >
          {previewing ? "Preparing…" : "Next — review the agreement"}
        </button>
      </div>

      {/* ── Step 2: review & sign ────────────────────────────────────── */}
      <div className={step === 2 ? "grid gap-6" : "hidden"}>
        <fieldset ref={reviewRef} className="grid gap-3 scroll-mt-24">
          <SectionHeading
            tag={`Candidate Agreement (${agreementVersion})`}
            title="Review your agreement"
          />
          <p className="text-sm text-muted">
            Review the personalised agreement below, for the seat{" "}
            <strong className="text-ink">{seat.label}</strong>. A PDF copy will
            be emailed to you and is available any time from your account.
          </p>
          <div
            className="agreement-prose max-h-[28rem] overflow-y-auto rounded border border-rule bg-surface p-5"
            dangerouslySetInnerHTML={{ __html: preview }}
          />
        </fieldset>

        <fieldset className="grid gap-3 border-t border-rule pt-6">
          <SectionHeading tag="Sign" title="Open the candidacy" />
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="logoDisplayConsent"
              className="mt-1"
            />
            <span>
              The logo may be displayed on veranacouncil.org once the
              organization is seated and listed.
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="socialAnnouncementConsent"
              className="mt-1"
            />
            <span>
              The Council may announce the seating of this organization on its
              social channels.
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="accept"
              required
              className="mt-1"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span ref={acceptRef}>
              I am authorized to sign for this organization and I accept the
              Candidate Agreement shown above for the seat{" "}
              <strong>{seat.label}</strong>. <Req />
            </span>
          </label>

          {state.error && step === 2 && (
            <p className="text-sm text-red-600">{state.error}</p>
          )}

          <div className="flex items-center gap-3 mt-1">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStep(1)}
              disabled={pending}
            >
              ← Back
            </button>
            <button
              type="submit"
              className={`btn btn-primary ${!accepted ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={pending}
              aria-disabled={!accepted}
              onClick={(e) => {
                if (!accepted) {
                  e.preventDefault();
                  blinkAccept();
                }
              }}
            >
              {pending ? "Signing…" : "Sign & open the candidacy"}
            </button>
          </div>
        </fieldset>
      </div>
    </form>
  );
}

/** Section header (tag + display title), in a <legend> for the fieldset. */
function SectionHeading({ tag, title }: { tag: string; title: string }) {
  return (
    <legend className="grid gap-3 mb-5">
      <span className="tag">{tag}</span>
      <span className="display text-2xl text-ink">{title}</span>
    </legend>
  );
}

/** Optional org-logo upload with live preview + display-consent gating. */
function LogoField({
  hasLogo,
  onPick,
}: {
  hasLogo: boolean;
  onPick: (has: boolean) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  // Object URLs hold the file in memory — release the old one on replace/unmount.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <>
      <div className="form-field">
        <label htmlFor="logo">
          Organization logo <span className="opt">(optional)</span>
        </label>
        <input
          id="logo"
          type="file"
          name="logo"
          accept=".svg,.png,.webp,.jpg,.jpeg,image/svg+xml,image/png,image/webp,image/jpeg"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            onPick(!!file);
            setPreview(file ? URL.createObjectURL(file) : null);
          }}
        />
        <p className="hint">SVG, PNG, WebP or JPG — max 1 MB.</p>
      </div>
      {preview && (
        <div className="flex items-center gap-3">
          {/* Blob URL preview of the user's own pick — next/image can't help here. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Logo preview"
            className="h-16 w-16 object-contain rounded border border-rule bg-surface p-1"
          />
          <p className="text-xs text-muted">
            Preview — shown at small sizes, so check it stays legible.
          </p>
        </div>
      )}
    </>
  );
}

/** Required-field asterisk. */
function Req() {
  return (
    <span className="text-indigo" aria-hidden="true">
      *
    </span>
  );
}

/** Label wrapper for non-`<input>` controls (selects, CountrySelect). */
function Labeled({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="form-field">
      <label>
        {label} {required && <Req />}
      </label>
      {children}
    </div>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <div className="form-field">
      <label htmlFor={name}>
        {label} {required && <Req />}
      </label>
      <input
        id={name}
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
    </div>
  );
}
