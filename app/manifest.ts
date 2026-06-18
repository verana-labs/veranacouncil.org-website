import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_DESCRIPTION } from "@/app/lib/site";

// Web app manifest — lets the site be installed/added to the home screen and
// gives Android/Chrome a name, theme color and icons. theme_color is the brand
// indigo (--color-indigo); background_color is the light surface token.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Verana",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf8",
    theme_color: "#2e2a8f",
    icons: [
      {
        src: "/assets/img/favicon.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
      {
        src: "/assets/img/favicon-32.png",
        type: "image/png",
        sizes: "32x32",
      },
    ],
  };
}
