import {
  SITE_URL,
  SITE_NAME,
  LEGAL_NAME,
  SITE_DESCRIPTION,
  OG_IMAGE,
  SOCIAL_LINKS,
} from "@/app/lib/site";

// Schema.org structured data (JSON-LD) for the organization and the website.
// Helps search engines build a knowledge-panel entity and a sitelinks search
// box. The facts mirror the OpenGraph metadata and the footer so nothing can
// drift.
//
// The Council is a non-profit Swiss Verein "in formation, stewarded by 2060 OÜ",
// so we describe it as an NGO without asserting a registered legal form, and
// credit the steward via `parentOrganization`.
export default function JsonLd() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "NGO"],
        "@id": `${SITE_URL}/#organization`,
        name: LEGAL_NAME,
        alternateName: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/assets/img/verana-logo.svg`,
        image: `${SITE_URL}${OG_IMAGE}`,
        description: SITE_DESCRIPTION,
        foundingDate: "2025",
        slogan: "The governance body of the open public trust layer",
        sameAs: [...SOCIAL_LINKS],
        parentOrganization: {
          "@type": "Organization",
          name: "2060 OÜ",
          url: "https://2060.io",
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "en",
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // Trusted, build-time constant — no user input is interpolated.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
