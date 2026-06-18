import type { MetadataRoute } from "next";
import { SITE_URL } from "@/app/lib/site";

// Crawl directives. The public marketing site is fully indexable; the
// authenticated/transactional surfaces (account, admin, the two apply flows,
// sign-in) and the internal API/asset routes carry no SEO value and are kept
// out of the index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/account",
        "/admin",
        "/apply",
        "/apply-observer",
        "/login",
        "/api/",
        "/logo/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
