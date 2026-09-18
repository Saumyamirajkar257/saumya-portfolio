import { Syne, Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import Preloader from "@/components/Preloader";
import CursorSpotlight from "@/components/CursorSpotlight";
import ScrollRail from "@/components/ScrollRail";
import MobileCTA from "@/components/MobileCTA";
import { SITE_URL, SITE_HOST } from "@/lib/site";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono-jb",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Saumya Mirajkar — sensor-driven hardware & the software that runs it",
    template: "%s | Saumya Mirajkar",
  },
  description:
    "Sensor-driven hardware and the software that runs it. Computer Engineering & IoT diploma student skilled in Python, C/C++, JavaScript, Arduino and embedded systems. Open to software development, web development, Python and IoT internships.",
  applicationName: "Saumya Mirajkar Portfolio",
  authors: [{ name: "Saumya Mirajkar" }],
  keywords: [
    "Saumya Mirajkar", "portfolio", "developer", "IoT", "embedded systems",
    "Python", "JavaScript", "web development", "internship", "Pune",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Saumya Mirajkar",
    title: "Saumya Mirajkar — sensor-driven hardware & the software that runs it",
    description:
      "Sensor-driven hardware and the software that runs it. Open to software, web, Python and IoT internships.",
    images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: "Saumya Mirajkar — sensor-driven hardware & the software that runs it" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saumya Mirajkar — sensor-driven hardware & the software that runs it",
    description:
      "Sensor-driven hardware and the software that runs it. Open to software, web, Python and IoT internships.",
    images: [`${SITE_URL}/opengraph-image`],
  },
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#030609",
  colorScheme: "dark",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${syne.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        {/* Plausible analytics */}
        <Script
          id="plausible-analytics"
          strategy="afterInteractive"
          data-domain={SITE_HOST}
          src="https://plausible.io/js/script.js"
        />

        {/* JSON-LD structured data */}
        <Script
          id="json-ld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              "name": "Saumya Mirajkar",
              "url": SITE_URL,
              "jobTitle": "Computer Engineering & IoT Student",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Pune",
                "addressRegion": "Maharashtra",
                "addressCountry": "IN"
              },
              "sameAs": [
                "https://github.com/saumyamirajkar",
                "https://linkedin.com/in/saumyamirajkar"
              ],
              "knowsAbout": ["Python", "JavaScript", "C", "C++", "IoT", "Embedded Systems", "Arduino"],
              "email": "saumyamir25@gmail.com"
            })
          }}
        />

        {/* Smooth scroll provider wraps everything */}
        <SmoothScrollProvider>
          {/* Subtle ambient lighting */}
          <span className="orb orb--blue" aria-hidden="true" />
          <span className="orb orb--cyan" aria-hidden="true" />

          <ScrollProgress />
          <CursorSpotlight />
          <ScrollRail />
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>

          <Navbar name="Saumya Mirajkar" />

          <main id="main-content" style={{ position: "relative", zIndex: 1 }}>
            {children}
          </main>

          <Footer />
          <MobileCTA />
        </SmoothScrollProvider>

        {/* Preloader on top of everything */}
        <Preloader />
      </body>
    </html>
  );
}