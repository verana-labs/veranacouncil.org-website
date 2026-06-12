import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import "./globals.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

// We import the Font Awesome CSS ourselves (above); stop it auto-injecting.
config.autoAddCss = false;

// All-Inter: the Council has no display face (the absence is the signal vs.
// the Foundation's Space Grotesk).
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

const SITE_URL = "https://veranacouncil.org";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Verana Council: the governance body of the open public trust layer",
    template: "%s · Verana Council",
  },
  description:
    "The Verana Council Association authors and operates the governance frameworks of the Verana network and is the sole body that governs and secures it. Non-profit Swiss Verein, in formation, stewarded by 2060 OÜ. Founding Council recruitment open through Q4 2026.",
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/assets/img/favicon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Verana Council: the governance body of the open public trust layer",
    description:
      "One member, one vote. Authors and operates the frameworks. Sole securer of the network. Membership is free — apply for a Founding Council Seat.",
    images: [
      {
        url: "/assets/img/og-default.svg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/assets/img/og-default.svg"],
  },
};

// Set the theme before paint to avoid a flash of the wrong color scheme.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('vc-theme');
    var theme = stored
      || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      // The inline themeInitScript sets data-theme on <html> before React
      // hydrates, so the attribute intentionally differs from the server HTML.
      // Scope hydration-mismatch suppression to this element only.
      suppressHydrationWarning
      className={`${inter.variable} ${ibmPlexMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-surface text-ink">
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
