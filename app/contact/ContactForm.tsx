"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const TOPICS = [
  { value: "founding-member", label: "Founding Council seat" },
  { value: "observer", label: "Public-Sector Observer" },
  { value: "governance", label: "Governance / framework question" },
  { value: "press", label: "Press or analyst" },
  { value: "general", label: "General inquiry" },
];

const MIN_MESSAGE = 50;
const MAX_MESSAGE = 4000;

const VALIDATION_MSG = `Please complete the required fields — a valid email and a message of at least ${MIN_MESSAGE} characters — then try again.`;
const SUBMIT_MSG =
  "Sorry, we couldn't send your message just now. Please try again in a moment.";

export default function ContactForm() {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [renderedAt, setRenderedAt] = useState("");
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRenderedAt(String(Date.now()));
    const params = new URLSearchParams(window.location.search);
    const t = params.get("topic");
    if (t && TOPICS.some((o) => o.value === t)) setTopic(t);
  }, []);

  // Make the outcome visible (especially on mobile) by scrolling the banner
  // into view on success/error.
  useEffect(() => {
    if (status === "success" || status === "error") {
      bannerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [status]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;

    const honeypot = (form.elements.namedItem("website_hp") as HTMLInputElement)
      ?.value;
    if (honeypot) {
      setStatus("success");
      return;
    }

    if (!form.checkValidity() || message.trim().length < MIN_MESSAGE) {
      form.reportValidity();
      setErrorMsg(VALIDATION_MSG);
      setStatus("error");
      return;
    }

    const fd = new FormData(form);
    const payload = {
      topic: fd.get("topic"),
      name: fd.get("name"),
      email: fd.get("email"),
      organization: fd.get("organization"),
      role: fd.get("role"),
      linkedin: fd.get("linkedin"),
      company_website: fd.get("company_website"),
      message: fd.get("message"),
      source: fd.get("source"),
      consent: (form.elements.namedItem("consent") as HTMLInputElement)?.checked,
      website_hp: honeypot ?? "",
      rendered_at: renderedAt,
    };

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("success");
      form.reset();
      setTopic("");
      setMessage("");
    } catch {
      setErrorMsg(SUBMIT_MSG);
      setStatus("error");
    }
  }

  // Success — replace the form with a prominent confirmation banner.
  if (status === "success") {
    return (
      <div
        ref={bannerRef}
        role="status"
        aria-live="polite"
        className="card"
        style={{ borderLeft: "4px solid #1FB57A" }}
      >
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span aria-hidden="true" style={{ color: "#1FB57A" }}>
            ✓
          </span>
          Message sent
        </h3>
        <p className="text-muted mt-2">
          Thank you — we received your message and will reply within 5 business
          days.
        </p>
        <button
          type="button"
          className="btn btn-secondary mt-4 self-start"
          onClick={() => setStatus("idle")}
        >
          Send another message
        </button>
      </div>
    );
  }

  const submitting = status === "submitting";
  const errored = status === "error";

  return (
    <form className="space-y-1" onSubmit={handleSubmit} noValidate>
      {/* Error banner — keeps the form so it can be re-submitted. */}
      {errored && (
        <div
          ref={bannerRef}
          role="alert"
          aria-live="assertive"
          className="card mb-4"
          style={{
            borderLeft: "4px solid #e5484d",
            background: "rgba(229, 72, 77, 0.08)",
          }}
        >
          <h3 className="text-lg font-semibold" style={{ color: "#e5484d" }}>
            Couldn&rsquo;t send your message
          </h3>
          <p className="text-muted mt-2 text-sm">{errorMsg}</p>
          <button
            type="submit"
            className="btn btn-primary mt-4 self-start"
            disabled={submitting}
          >
            {submitting ? "Sending…" : "Try again"}
          </button>
        </div>
      )}

      {/* Honeypot — hidden from users */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        <label>
          Leave this field empty
          <input name="website_hp" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input type="hidden" name="rendered_at" value={renderedAt} readOnly />

      <div className="form-field">
        <label htmlFor="topic">
          Inquiry type <span className="req">*</span>
        </label>
        <select
          id="topic"
          name="topic"
          required
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        >
          <option value="">Select one</option>
          {TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-5">
        <div className="form-field">
          <label htmlFor="name">
            Name <span className="req">*</span>
          </label>
          <input id="name" name="name" type="text" required autoComplete="name" />
        </div>
        <div className="form-field">
          <label htmlFor="email">
            Email <span className="req">*</span>
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="linkedin">
          Your LinkedIn{" "}
          <span className="text-xs text-muted font-normal">(optional)</span>
        </label>
        <input
          id="linkedin"
          name="linkedin"
          type="url"
          autoComplete="url"
          placeholder="https://www.linkedin.com/in/…"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-x-5">
        <div className="form-field">
          <label htmlFor="organization">
            Organization{" "}
            <span className="text-xs text-muted font-normal">
              (required for membership / press)
            </span>
          </label>
          <input
            id="organization"
            name="organization"
            type="text"
            autoComplete="organization"
          />
        </div>
        <div className="form-field">
          <label htmlFor="role">
            Role or title{" "}
            <span className="text-xs text-muted font-normal">(optional)</span>
          </label>
          <input id="role" name="role" type="text" />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="company_website">
          Organization website{" "}
          <span className="text-xs text-muted font-normal">(optional)</span>
        </label>
        <input
          id="company_website"
          name="company_website"
          type="url"
          placeholder="https://…"
        />
      </div>

      <div className="form-field">
        <label htmlFor="message">
          Message <span className="req">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          minLength={MIN_MESSAGE}
          maxLength={MAX_MESSAGE}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Who you represent, what you're asking, and any timeline."
        />
        <p className="hint">
          {message.length} / {MAX_MESSAGE} (min {MIN_MESSAGE})
        </p>
      </div>

      <div className="form-field">
        <label htmlFor="source">
          How did you hear about us{" "}
          <span className="text-xs text-muted font-normal">(optional)</span>
        </label>
        <select id="source" name="source">
          <option value="">(none)</option>
          <option>GitHub</option>
          <option>IIW or standards venue</option>
          <option>Verana</option>
          <option>Referral</option>
          <option>Search</option>
          <option>Other</option>
        </select>
      </div>

      <div className="flex items-start gap-3 py-2">
        <input id="consent" name="consent" type="checkbox" required className="mt-1" />
        <label htmlFor="consent" className="text-sm text-muted">
          I consent to the Verana Council Association storing this inquiry to
          respond to me. See the{" "}
          <Link href="/legal/privacy" className="text-indigo-primary underline">
            Privacy Policy
          </Link>
          . <span className="req">*</span>
        </label>
      </div>

      <div className="pt-2 flex flex-wrap items-center gap-4">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Sending…" : "Send message"}
        </button>
        <span className="text-xs text-muted">
          We do not publish email addresses; messages are routed internally.
        </span>
      </div>
    </form>
  );
}
