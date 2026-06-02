"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function JoinPage() {
  const selectRef = useRef<HTMLSelectElement>(null);

  // Prefill the track from a ?track= query parameter, if present.
  useEffect(() => {
    const track = new URLSearchParams(window.location.search).get("track");
    if (track && selectRef.current) {
      const options = Array.from(selectRef.current.options);
      const match = options.find((o) => o.value === track);
      if (match) selectRef.current.value = track;
    }
  }, []);

  function setTrack(value: string) {
    if (selectRef.current) selectRef.current.value = value;
  }

  return (
    <>
      <section className="border-b border-rule">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <nav className="text-sm text-muted mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-indigo-primary">
              Home
            </Link>{" "}
            · <span className="text-ink">Join</span>
          </nav>
          <p className="eyebrow mb-4">Founding Council recruitment</p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-tight max-w-4xl">
            Founding Members write the rules.
          </h1>
          <p className="mt-6 text-lg text-muted max-w-3xl leading-relaxed">
            The Council incorporates in Q3 2026. Until then, Founding Members
            sign non-binding Letters of Intent and co-author the Bylaws, the
            Network GF, and the ECS-EGF. At incorporation, LOIs ratify to
            Membership Agreements.
          </p>
        </div>
      </section>

      <section className="border-b border-rule">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="card">
              <h3>
                Founding Member{" "}
                <span className="text-xs font-normal text-muted">(voting)</span>
              </h3>
              <p className="text-sm text-muted">
                For governments, standards bodies, enterprises, and academic
                institutions. Co-authors the bylaws and frameworks through Q3
                2026, holds a voting seat at the General Assembly, and operates
                a validator node after mainnet.
              </p>
              <a
                href="#apply"
                onClick={() => setTrack("founding-member")}
                className="text-indigo-primary text-sm font-medium"
              >
                Apply as a Founding Member →
              </a>
            </div>
            <div className="card">
              <h3>
                Public-Sector Observer{" "}
                <span className="text-xs font-normal text-muted">
                  (non-voting)
                </span>
              </h3>
              <p className="text-sm text-muted">
                For sovereigns, multilateral bodies, and state-chartered
                agencies that cannot sign Verein agreements under procurement or
                sovereign-immunity rules. Compatible with public-sector
                constraints; convertible to membership later.
              </p>
              <a
                href="#apply"
                onClick={() => setTrack("observer")}
                className="text-indigo-primary text-sm font-medium"
              >
                Apply as an Observer →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-semibold mb-6" id="apply">
            Apply
          </h2>
          <form
            className="card"
            action="mailto:council@verana.io"
            method="post"
            encType="text/plain"
          >
            <div className="form-field">
              <label htmlFor="track">
                Track <span className="req">*</span>
              </label>
              <select id="track" name="track" ref={selectRef} required>
                <option value="founding-member">
                  Founding Member (voting)
                </option>
                <option value="observer">
                  Public-Sector Observer (non-voting)
                </option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="org">
                Organization / body name <span className="req">*</span>
              </label>
              <input id="org" name="organization" type="text" required />
            </div>
            <div className="form-field">
              <label htmlFor="sector">
                Sector <span className="req">*</span>
              </label>
              <input id="sector" name="sector" type="text" required />
              <p className="hint">
                If you operate across several, nominate the one you most
                strongly represent.
              </p>
            </div>
            <div className="form-field">
              <label htmlFor="region">
                Region <span className="req">*</span>
              </label>
              <select id="region" name="region" required defaultValue="">
                <option value="">Select…</option>
                <option>Americas</option>
                <option>EMEA</option>
                <option>APAC</option>
                <option>LATAM</option>
                <option>Africa</option>
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="contact">
                Primary contact (name, title, email){" "}
                <span className="req">*</span>
              </label>
              <input id="contact" name="contact" type="text" required />
            </div>
            <div className="form-field">
              <label htmlFor="rationale">Brief rationale or scope</label>
              <textarea
                id="rationale"
                name="rationale"
                rows={4}
                maxLength={500}
              />
            </div>
            <button type="submit" className="btn btn-primary mt-2">
              Submit application
            </button>
          </form>
          <p className="text-sm text-muted mt-4 italic">
            All submissions are strictly confidential pre-incorporation. The{" "}
            <code>mailto:</code> submit is a placeholder; production wires this
            to the Council&apos;s intake endpoint.
          </p>
        </div>
      </section>
    </>
  );
}
