// Single source of truth for site-wide identity used by metadata, the sitemap,
// robots, the web manifest and JSON-LD structured data. Keeping these here means
// the canonical URL, name and social links can never drift between, say, the
// OpenGraph tags in layout.tsx and the Organization schema.

export const SITE_URL = "https://veranacouncil.org";

export const SITE_NAME = "Verana Council";

// Legal entity name (used in JSON-LD; differs from the short brand name).
export const LEGAL_NAME = "Verana Council Association";

export const SITE_DESCRIPTION =
  "The Verana Council Association authors and operates the governance frameworks of the Verana network and is the sole body that governs and secures it. Non-profit Swiss Verein, in formation, stewarded by 2060 OÜ. Founding Council recruitment open through Q4 2026.";

// Default OpenGraph / Twitter image (1200×630, raster). Social scrapers ignore
// SVG, so this points at the rasterized JPG (built from og-default.svg).
export const OG_IMAGE = "/assets/img/og-default.jpg";

// Google Analytics 4 measurement ID. Shared with verana.io / the Foundation
// site. Overridable via the NEXT_PUBLIC_GA_ID build-time env var so a
// staging/preview deploy can point at a separate property (or disable analytics
// entirely by leaving it empty).
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_ID ?? "G-9H5406F02W";

// Brand presence elsewhere — drives JSON-LD `sameAs`. Keep in sync with the
// footer links (app/components/Footer.tsx). The Council does not yet maintain
// its own social accounts, so we list only the verified org presences.
export const SOCIAL_LINKS = [
  "https://github.com/verana-labs",
  "https://veranafoundation.org",
  "https://verana.io",
] as const;
