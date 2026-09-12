import { Syne, Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Cursor from "@/components/Cursor";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import Preloader from "@/components/Preloader";
import EmberCursorTrail from "@/components/EmberCursorTrail";
import CursorSpotlight from "@/components/CursorSpotlight";
import GhostParallax from "@/components/GhostParallax";
import ScrollRail from "@/components/ScrollRail";
import ThemeToggle from "@/components/ThemeToggle";
import MobileCTA from "@/components/MobileCTA";

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Saumya Mirajkar | Computer Engineering & IoT Student",
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
    title: "Saumya Mirajkar | Computer Engineering & IoT Student",
    description:
      "Sensor-driven hardware and the software that runs it. Open to software, web, Python and IoT internships.",
    images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: "Saumya Mirajkar — Computer Engineering & IoT Student" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Saumya Mirajkar | Computer Engineering & IoT Student",
    description:
      "Sensor-driven hardware and the software that runs it. Open to software, web, Python and IoT internships.",
    images: [`${SITE_URL}/opengraph-image`],
  },
  icons: { icon: "/favicon.svg", apple: "/favicon.svg" },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#0b0e12",
  colorScheme: "dark",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${syne.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        {/* Prevent flash of wrong theme */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}`
          }}
        />

        {/* Plausible analytics */}
        <Script
          id="plausible-analytics"
          strategy="afterInteractive"
          data-domain="saumyamirajkar.dev"
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
          {/* Ambient background */}
          <span className="orb orb--amber" aria-hidden="true" />
          <span className="orb orb--violet" aria-hidden="true" />

          {/* New premium effects */}
          <GhostParallax />
          <CursorSpotlight />
          <EmberCursorTrail />

          <ScrollProgress />
          <Cursor />
          <ScrollRail />
          <a className="skip-link" href="#main-content">
            Skip to content
          </a>

          <Navbar name="Saumya Mirajkar" />

          <main id="main-content" style={{ position: "relative", zIndex: 1 }}>
            {children}
          </main>

          <Footer />
          <ThemeToggle />
          <MobileCTA />
        </SmoothScrollProvider>

        {/* Preloader on top of everything */}
        <Preloader />
      </body>
    </html>
  );
}