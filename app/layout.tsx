import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";
import Footer from "./components/Footer";

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
    default:
      "Verana Council: the governance body of the open public trust layer",
    template: "%s · Verana Council",
  },
  description:
    "The Verana Council Association is a non-profit Swiss Verein that authors and operates the governance frameworks every ecosystem on the Verana network must respect, and secures the chain on which they run.",
  alternates: { canonical: "/" },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/assets/img/favicon.svg", type: "image/svg+xml" },
      { url: "/assets/img/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/assets/img/favicon-16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [
      { url: "/assets/img/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title:
      "Verana Council: the governance body of the open public trust layer",
    description:
      "Non-profit Swiss Verein. One-member-one-vote. Founding Members co-author the rules through Q3 2026.",
    images: ["/assets/img/og-default.svg"],
  },
  twitter: { card: "summary_large_image" },
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
    <html lang="en" className={`${inter.variable} ${ibmPlexMono.variable}`}>
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
