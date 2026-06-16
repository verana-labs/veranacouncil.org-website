"use client";

import { useState, useTransition } from "react";
import {
  setAgreementSigningEnabled,
  setCouncilSignatoryConfig,
} from "./actions";

type Person = { email: string; name: string; role: string };
type Org = { id: string; name: string };

/**
 * Admin controls for the Membership Agreement signing flow: the master on/off
 * toggle, and the council-side signatory configuration (which org signs on
 * behalf of the Council, and which of its representatives must sign).
 */
export default function AgreementSigningSettings({
  enabled,
  councilMemberId,
  councilEmails,
  orgs,
  peopleByOrg,
}: {
  enabled: boolean;
  councilMemberId: string | null;
  councilEmails: string[];
  orgs: Org[];
  peopleByOrg: Record<string, Person[]>;
}) {
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [orgId, setOrgId] = useState(councilMemberId ?? "");
  const [selected, setSelected] = useState<Set<string>>(new Set(councilEmails));
  const [savedMsg, setSavedMsg] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const people = orgId ? peopleByOrg[orgId] ?? [] : [];

  function toggleEnabled() {
    const next = !isEnabled;
    setIsEnabled(next);
    setError("");
    startTransition(async () => {
      const res = await setAgreementSigningEnabled(next);
      if (res.error) {
        setError(res.error);
        setIsEnabled(!next);
      }
    });
  }

  function onOrgChange(id: string) {
    setOrgId(id);
    setSelected(new Set());
    setSavedMsg("");
  }

  function toggleRep(email: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
    setSavedMsg("");
  }

  function saveCouncil() {
    setError("");
    setSavedMsg("");
    startTransition(async () => {
      const res = await setCouncilSignatoryConfig(orgId || null, [...selected]);
      if (res.error) setError(res.error);
      else setSavedMsg("Saved.");
    });
  }

  return (
    <div className="mt-4 grid gap-6 max-w-2xl">
      <label className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={toggleEnabled}
          disabled={pending}
          className="mt-1"
        />
        <span className="text-sm">
          <span className="font-medium text-ink">Enable agreement signing</span>
          <span className="block text-muted">
            When off, the &ldquo;Sign&rdquo; controls in members&rsquo; accounts are
            greyed out. Off by default until the agreement is final.
          </span>
        </span>
      </label>

      <div className="grid gap-3 border-t border-rule pt-5">
        <p className="text-sm font-medium text-ink">Council-side signatory</p>
        <p className="text-sm text-muted">
          The organization that signs on behalf of the Council, and which of its
          representatives must sign every membership agreement.
        </p>

        <div className="form-field">
          <label htmlFor="councilOrg">Organization</label>
          <select id="councilOrg" value={orgId} onChange={(e) => onOrgChange(e.target.value)}>
            <option value="">— none —</option>
            {orgs.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>

        {orgId && (
          <div>
            <p className="text-sm font-medium text-ink mb-1">Signatories</p>
            {people.length === 0 ? (
              <p className="text-sm text-muted">
                This organization has no people on its access list.
              </p>
            ) : (
              <ul className="grid gap-1">
                {people.map((p) => (
                  <li key={p.email}>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selected.has(p.email)}
                        onChange={() => toggleRep(p.email)}
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
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        {savedMsg && <p className="text-sm text-green-700">{savedMsg}</p>}

        <div>
          <button
            type="button"
            className="btn btn-primary text-sm"
            disabled={pending}
            onClick={saveCouncil}
          >
            {pending ? "Saving…" : "Save council signatory"}
          </button>
        </div>
      </div>
    </div>
  );
}
