/**
 * Normalize a user-entered website: trim, prepend https:// to a bare host, and
 * validate it as an http(s) URL with a dotted hostname. Returns the canonical
 * URL string, null for empty input, or a user-safe error message.
 */
export function normalizeWebsite(raw: string): { url: string | null; error?: string } {
  const trimmed = raw.trim().slice(0, 300);
  if (!trimmed) return { url: null };
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const u = new URL(withScheme);
    if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error();
    if (!u.hostname.includes(".")) throw new Error();
    return { url: u.toString() };
  } catch {
    return { url: null, error: "Enter a valid website URL (e.g. https://example.org)." };
  }
}
