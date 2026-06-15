"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { flagEmoji, countryName } from "@/app/lib/countries";
import {
  leaveOrganization,
  cancelMembership,
  updateOrgAddress,
  updateOrgWebsite,
  uploadOrgLogo,
  removeOrgLogo,
} from "@/app/(app)/account/actions";

export type MembershipMenu = {
  memberId: string;
  /** Manager-only — link to the access ("Manage Representatives") page. */
  manageHref?: string | null;
  /** Manager-only — offer inline editing of the registered address. */
  canEditAddress?: boolean;
  /** Manager-only — offer inline editing of the public website. */
  canEditWebsite?: boolean;
  /** Manager-only — offer logo upload/replace/remove. */
  canEditLogo?: boolean;
  /** Show "Leave Organization" (representatives, or a manager when not the last). */
  canLeave?: boolean;
  /** Show "Cancel membership" (individuals, or an org's sole manager w/ no reps). */
  canCancel?: boolean;
};

export type MembershipCardData = {
  name: string;
  type?: "organization";
  track?: "founding_member" | "observer" | null;
  status?: string | null;
  role?: string | null;
  country?: string | null;
  /** Organization's entity type (e.g. "corporation", "university"). */
  entityType?: string | null;
  /** Organization's registered address (shown + editable for managers). */
  address?: string | null;
  /** Organization's public website (shown + editable for managers). */
  website?: string | null;
  /** Serving URL of the uploaded logo (cache-busted), if any. */
  logoUrl?: string | null;
  /** Current display consent — preselects the checkbox when replacing. */
  logoConsent?: boolean;
  /** When set, a ⋮ actions menu is shown top-right. */
  menu?: MembershipMenu | null;
};

const STATUS_BADGE: Record<string, string> = {
  active: "badge-indigo",
  pending: "badge-amber",
  suspended: "badge-red",
  ended: "badge-red",
};

const TRACK_LABEL: Record<string, string> = {
  founding_member: "Founding Member",
  observer: "Observer",
};

function titleize(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function MembershipCard({
  name,
  track,
  status,
  role,
  country,
  entityType,
  address,
  website,
  logoUrl,
  logoConsent,
  menu,
}: MembershipCardData) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [draftAddress, setDraftAddress] = useState("");
  const [editingWebsite, setEditingWebsite] = useState(false);
  const [draftWebsite, setDraftWebsite] = useState("");
  const [websiteError, setWebsiteError] = useState("");
  const [editingLogo, setEditingLogo] = useState(false);
  const [logoError, setLogoError] = useState("");
  const logoFormRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [menuOpen]);

  const flag = flagEmoji(country);
  const label = countryName(country);

  function act(confirmMsg: string, fn: () => Promise<void>) {
    if (!window.confirm(confirmMsg)) return;
    startTransition(async () => {
      await fn();
      setMenuOpen(false);
    });
  }

  const hasMenu =
    !!menu &&
    (menu.canLeave ||
      menu.canCancel ||
      menu.canEditAddress ||
      menu.canEditWebsite ||
      menu.canEditLogo ||
      !!menu.manageHref);

  function saveAddress() {
    startTransition(async () => {
      await updateOrgAddress(menu!.memberId, draftAddress);
      setEditingAddress(false);
    });
  }

  function saveWebsite() {
    startTransition(async () => {
      const res = await updateOrgWebsite(menu!.memberId, draftWebsite);
      if (res.error) setWebsiteError(res.error);
      else {
        setWebsiteError("");
        setEditingWebsite(false);
      }
    });
  }

  function saveLogo() {
    const form = logoFormRef.current;
    if (!form) return;
    const fd = new FormData(form);
    startTransition(async () => {
      const res = await uploadOrgLogo(fd);
      if (res.error) setLogoError(res.error);
      else {
        setLogoError("");
        setEditingLogo(false);
      }
    });
  }

  return (
    <div ref={rootRef} className="card relative">
      <div className="flex items-start justify-between gap-2">
        {/* Up to three pills, each only as wide as its content. */}
        <div className="flex flex-wrap items-center gap-2">
          {track && (
            <span className="badge badge-purple">
              {TRACK_LABEL[track] ?? titleize(track)}
            </span>
          )}
          {status && (
            <span className={`badge ${STATUS_BADGE[status] ?? ""}`}>
              {titleize(status)}
            </span>
          )}
          {role && <span className="badge">{titleize(role)}</span>}
        </div>

        {hasMenu && (
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
                className="absolute right-3 top-10 z-20 w-56 rounded-lg border border-rule bg-elevated py-1 shadow-lg text-sm"
              >
                {menu!.canLeave && (
                  <button
                    type="button"
                    role="menuitem"
                    disabled={pending}
                    className="block w-full px-3 py-2 text-left hover:bg-rule/40"
                    onClick={() =>
                      act(
                        `Leave ${name}? You'll lose access to this organization.`,
                        () => leaveOrganization(menu!.memberId),
                      )
                    }
                  >
                    Leave Organization
                  </button>
                )}
                {menu!.canCancel && (
                  <button
                    type="button"
                    role="menuitem"
                    disabled={pending}
                    className="block w-full px-3 py-2 text-left hover:bg-rule/40 text-red-600"
                    onClick={() =>
                      act(
                        track
                          ? "Cancel this membership? This ends it and can't be undone here."
                          : "Withdraw this candidacy? It will no longer be under review.",
                        () => cancelMembership(menu!.memberId),
                      )
                    }
                  >
                    {track ? "Cancel membership" : "Cancel candidacy"}
                  </button>
                )}
                {menu!.canEditAddress && (
                  <button
                    type="button"
                    role="menuitem"
                    disabled={pending}
                    className="block w-full px-3 py-2 text-left hover:bg-rule/40"
                    onClick={() => {
                      setDraftAddress(address ?? "");
                      setEditingAddress(true);
                      setMenuOpen(false);
                    }}
                  >
                    Update address
                  </button>
                )}
                {menu!.canEditWebsite && (
                  <button
                    type="button"
                    role="menuitem"
                    disabled={pending}
                    className="block w-full px-3 py-2 text-left hover:bg-rule/40"
                    onClick={() => {
                      setDraftWebsite(website ?? "");
                      setWebsiteError("");
                      setEditingWebsite(true);
                      setMenuOpen(false);
                    }}
                  >
                    {website ? "Update website" : "Add website"}
                  </button>
                )}
                {menu!.canEditLogo && (
                  <button
                    type="button"
                    role="menuitem"
                    disabled={pending}
                    className="block w-full px-3 py-2 text-left hover:bg-rule/40"
                    onClick={() => {
                      setLogoError("");
                      setEditingLogo(true);
                      setMenuOpen(false);
                    }}
                  >
                    {logoUrl ? "Replace logo" : "Upload logo"}
                  </button>
                )}
                {menu!.canEditLogo && logoUrl && (
                  <button
                    type="button"
                    role="menuitem"
                    disabled={pending}
                    className="block w-full px-3 py-2 text-left hover:bg-rule/40"
                    onClick={() =>
                      act("Remove the organization's logo?", () =>
                        removeOrgLogo(menu!.memberId),
                      )
                    }
                  >
                    Remove logo
                  </button>
                )}
                {menu!.manageHref && (
                  <Link
                    role="menuitem"
                    href={menu!.manageHref}
                    className="block w-full px-3 py-2 text-left hover:bg-rule/40"
                    onClick={() => setMenuOpen(false)}
                  >
                    Manage representatives
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 mt-1">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- served by our
          // own /logo route; next/image can't optimize SVGs anyway.
          <img
            src={logoUrl}
            alt=""
            className="h-12 w-12 object-contain rounded border border-rule bg-surface p-1 flex-shrink-0"
          />
        ) : (
          <div className="h-12 w-12 rounded border border-rule bg-surface flex items-center justify-center text-muted text-lg flex-shrink-0">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <h3 className="flex items-center gap-2 mt-1">
          <span>{name}</span>
          {flag ? (
            <span aria-label={label ?? undefined} title={label ?? undefined}>
              {flag}
            </span>
          ) : null}
        </h3>
      </div>

      <dl className="mt-3 grid gap-1 text-sm text-muted">
        {entityType && (
          <div>
            <dt className="inline font-medium text-ink">Entity type: </dt>
            <dd className="inline">{entityType}</dd>
          </div>
        )}
        {label && (
          <div>
            <dt className="inline font-medium text-ink">Country: </dt>
            <dd className="inline">{label}</dd>
          </div>
        )}
        <div>
          <dt className="font-medium text-ink">Registered address</dt>
          {editingAddress ? (
            <dd className="mt-1 grid gap-2">
              <textarea
                value={draftAddress}
                onChange={(e) => setDraftAddress(e.target.value)}
                rows={3}
                placeholder="Registered address"
                className="field w-full text-sm"
                disabled={pending}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary text-xs"
                  disabled={pending}
                  onClick={saveAddress}
                >
                  {pending ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary text-xs"
                  disabled={pending}
                  onClick={() => setEditingAddress(false)}
                >
                  Cancel
                </button>
              </div>
            </dd>
          ) : (
            <dd className="whitespace-pre-line">
              {address || <span className="italic">Not set</span>}
            </dd>
          )}
        </div>
        <div>
          <dt className="font-medium text-ink">Website</dt>
          {editingWebsite ? (
            <dd className="mt-1 grid gap-2">
              <input
                type="url"
                inputMode="url"
                value={draftWebsite}
                onChange={(e) => setDraftWebsite(e.target.value)}
                placeholder="https://example.org"
                className="field w-full text-sm"
                disabled={pending}
              />
              {websiteError && (
                <p className="text-xs text-red-600">{websiteError}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary text-xs"
                  disabled={pending}
                  onClick={saveWebsite}
                >
                  {pending ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary text-xs"
                  disabled={pending}
                  onClick={() => {
                    setEditingWebsite(false);
                    setWebsiteError("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </dd>
          ) : (
            <dd>
              {website ? (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo hover:underline break-all"
                >
                  {website.replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗
                </a>
              ) : (
                <span className="italic">Not set</span>
              )}
            </dd>
          )}
        </div>
      </dl>

      {editingLogo && menu && (
        <form ref={logoFormRef} className="mt-2 grid gap-2 text-sm">
          <input type="hidden" name="memberId" value={menu.memberId} />
          <input
            type="file"
            name="logo"
            accept=".svg,.png,.webp,.jpg,.jpeg,image/svg+xml,image/png,image/webp,image/jpeg"
            className="text-xs"
            disabled={pending}
          />
          <p className="text-xs text-muted">SVG, PNG, WebP or JPG — max 1 MB.</p>
          <label className="flex items-start gap-2 text-xs">
            <input
              type="checkbox"
              name="logoDisplayConsent"
              // Checked by default. The stored flag only takes over when a
              // logo already exists — i.e. the member made an actual choice
              // before; the DB default `false` of a logo-less org must not
              // present a first upload as opted-out.
              defaultChecked={logoUrl ? (logoConsent ?? true) : true}
              className="mt-0.5"
            />
            <span>We may display this logo on veranacouncil.org.</span>
          </label>
          {logoError && <p className="text-xs text-red-600">{logoError}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-primary text-xs"
              disabled={pending}
              onClick={saveLogo}
            >
              {pending ? "Uploading…" : "Save"}
            </button>
            <button
              type="button"
              className="btn btn-secondary text-xs"
              disabled={pending}
              onClick={() => setEditingLogo(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
