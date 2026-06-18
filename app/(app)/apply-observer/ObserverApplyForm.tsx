"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import CountrySelect from "@/app/components/CountrySelect";
import { applyObserver, type ObserverApplyState } from "./actions";

export default function ObserverApplyForm({
  prefillContactName,
  prefill,
}: {
  prefillContactName?: string;
  prefill?: {
    legalName: string;
    entityType: string | null;
    jurisdiction: string | null;
    registeredAddress: string | null;
    website: string | null;
  } | null;
}) {
  const [state, formAction, pending] = useActionState<ObserverApplyState, FormData>(
    applyObserver,
    {},
  );
  const [hasLogo, setHasLogo] = useState(false);

  return (
    <form action={formAction} className="grid gap-8 max-w-2xl">
      <div className="card">
        <p className="tag mb-2">Observer application</p>
        <p className="text-sm text-muted leading-relaxed">
          A <strong>non-binding</strong> application to participate as a{" "}
          <strong>Public-Sector Observer</strong> — attendance and voice, no vote,
          no seat. No document is signed and your organization is not committed.
          The Council reviews it; once accepted you&rsquo;re listed and your
          representatives can take part in the Council bodies.
        </p>
      </div>

      <fieldset className="grid gap-1">
        <SectionHeading tag="Your organization" title="Tell us who is applying" />
        <Field
          label="Organization legal name"
          name="legalName"
          required
          defaultValue={prefill?.legalName ?? ""}
          placeholder="Ministry of …"
        />
        <Field
          label="Entity type"
          name="entityType"
          placeholder="government agency / multilateral body / …"
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
          placeholder="https://example.gov"
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
        <Field label="Your role / title" name="contactRole" placeholder="Director of …" />
      </fieldset>

      <fieldset className="grid gap-3 border-t border-rule pt-8">
        <SectionHeading tag="Submit" title="Apply as Observer" />
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="logoDisplayConsent" className="mt-1" />
          <span>
            The logo may be displayed on veranacouncil.org once the organization
            is accepted and listed.
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="socialAnnouncementConsent" className="mt-1" />
          <span>
            The Council may announce this organization&rsquo;s participation on its
            social channels.
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="represent" required className="mt-1" />
          <span>
            I am authorized to submit this application on behalf of the
            organization, the information is accurate, and I will treat any
            non-public materials shared during review as confidential. I
            understand this is <strong>non-binding</strong>. <Req />
          </span>
        </label>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <div>
          <button type="submit" disabled={pending} className="btn btn-primary">
            {pending ? "Submitting…" : "Submit observer application"}
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

/** Optional org-logo upload with live preview. */
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

function Req() {
  return (
    <span className="text-indigo" aria-hidden="true">
      *
    </span>
  );
}

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
