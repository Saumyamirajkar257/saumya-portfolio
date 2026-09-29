import Link from "next/link";

export const metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Saumya Mirajkar's personal portfolio.",
};

export default function TermsPage() {
  return (
    <div className="wrap" style={{ paddingBlock: "calc(var(--header-h) + 40px) 80px", maxWidth: "800px" }}>
      <Link href="/" className="btn btn--secondary btn--sm" style={{ marginBottom: "32px", display: "inline-flex" }}>
        ← Back to Portfolio
      </Link>

      <h1 className="display-3" style={{ marginBottom: "16px", color: "#FFFFFF" }}>Terms of Service</h1>
      <p className="text-mono" style={{ fontSize: "12px", color: "var(--text-mute)", marginBottom: "32px" }}>
        Last updated: September 2026
      </p>

      <div className="prose" style={{ display: "grid", gap: "24px", color: "var(--text-dim)", lineHeight: 1.7 }}>
        <section>
          <h2 style={{ fontSize: "18px", color: "#FFFFFF", marginBottom: "8px" }}>1. Acceptance of Terms</h2>
          <p>
            By accessing and browsing this portfolio website, you agree to these Terms of Service. If you do not agree with any part of these terms, please do not use this site.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "18px", color: "#FFFFFF", marginBottom: "8px" }}>2. Intellectual Property</h2>
          <p>
            All original project designs, technical schematics, code snippets, and written documentation presented on this site are the intellectual property of Saumya Mirajkar unless explicitly credited otherwise (e.g. open-source third-party libraries).
          </p>
          <p>
            Open-source repositories linked on GitHub are governed by their respective repository licenses.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "18px", color: "#FFFFFF", marginBottom: "8px" }}>3. Acceptable Use</h2>
          <p>
            You agree not to misuse this website, including but not limited to attempting unauthorized access to admin interfaces, spamming the contact form, conducting automated denial-of-service attempts, or scraping private data.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "18px", color: "#FFFFFF", marginBottom: "8px" }}>4. Disclaimers &amp; Limitation of Liability</h2>
          <p>
            This portfolio is provided for informational, recruitment, and showcase purposes on an "as is" basis without warranties of any kind. While I strive for accuracy in all project descriptions and demos, I make no guarantees regarding uninterrupted availability.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "18px", color: "#FFFFFF", marginBottom: "8px" }}>5. Contact</h2>
          <p>
            For any questions regarding these terms, please reach out via <a href="mailto:saumyamir25@gmail.com" style={{ color: "#FFFFFF", textDecoration: "underline" }}>saumyamir25@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
