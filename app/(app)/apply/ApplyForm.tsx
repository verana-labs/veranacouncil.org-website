"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import CountrySelect from "@/app/components/CountrySelect";
import { applyCandidacy, type ApplyState } from "./actions";

type Option = { value: string; label: string };

export default function ApplyForm({
  sectors,
  regions,
  prefillSector,
  prefillContactName,
  prefill,
}: {
  sectors: Option[];
  regions: Option[];
  /** Sector pre-selected from ?sector= on the link. */
  prefillSector?: string;
  /** The signed-in user's name, pre-filled as the contact. */
  prefillContactName?: string;
  /** Org details when the user already manages an organization. */
  prefill?: {
    legalName: string;
    entityType: string | null;
    jurisdiction: string | null;
    registeredAddress: string | null;
    website: string | null;
  } | null;
}) {
  const [state, formAction, pending] = useActionState<ApplyState, FormData>(
    applyCandidacy,
    {},
  );
  const [hasLogo, setHasLogo] = useState(false);

  return (
    <form action={formAction} className="grid gap-8 max-w-2xl">
      <div className="card">
        <p className="tag mb-2">Expression of interest</p>
        <p className="text-sm text-muted leading-relaxed">
          This is a <strong>non-binding</strong> expression of interest — no
          document is signed and your organization is not committed. Any
          authorized representative can submit it. If your candidacy proceeds and
          is accepted, the binding Council Membership Agreement is executed later,
          with time for your legal team to review.
        </p>
      </div>

      <fieldset className="grid gap-1">
        <SectionHeading tag="Your seat" title="Where does your organization fit?" />
        <Labeled label="Sector" required>
          <select name="sector" required defaultValue={prefillSector ?? ""}>
            <option value="" disabled>
              Choose a sector…
            </option>
            {sectors.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Labeled>
        <Labeled label="Region" required>
          <select name="region" required defaultValue="">
            <option value="" disabled>
              Choose a region…
            </option>
            {regions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Labeled>
      </fieldset>

      <fieldset className="grid gap-1 border-t border-rule pt-8">
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
        <Field
          label="Website"
          name="website"
          type="url"
          placeholder="https://example.org"
          defaultValue={prefill?.website ?? ""}
        />
        <LogoField hasLogo={hasLogo} onPick={setHasLogo} />
      </fieldset>

      <fieldset className="grid gap-1 border-t border-rule pt-8">
        <SectionHeading tag="Contact" title="Who should we talk to?" />
        <Field
          label="Your name"
          name="contactName"
          required
          defaultValue={prefillContactName ?? ""}
        />
        <Field label="Your role / title" name="contactRole" placeholder="Head of Partnerships, …" />
      </fieldset>

      <fieldset className="grid gap-3 border-t border-rule pt-8">
        <SectionHeading tag="Submit" title="Express interest" />
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
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="represent" required className="mt-1" />
          <span>
            I am authorized to submit this expression of interest on behalf of
            the organization, the information is accurate, and I will treat any
            non-public materials shared during vetting as confidential. I
            understand this is <strong>non-binding</strong> and does not commit
            the organization to membership. <Req />
          </span>
        </label>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <div>
          <button type="submit" disabled={pending} className="btn btn-primary">
            {pending ? "Submitting…" : "Submit expression of interest"}
          </button>
        </div>
        <p className="text-xs text-muted">
          Pre-incorporation submissions are confidential.
        </p>
      </fieldset>
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
      {hasLogo && null}
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
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <div className="form-field">
      <label htmlFor={name}>
        {label} {required && <Req />}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
    </div>
  );
}
