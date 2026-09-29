import Link from "next/link";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Saumya Mirajkar's portfolio website.",
};

export default function PrivacyPage() {
  return (
    <div className="wrap" style={{ paddingBlock: "calc(var(--header-h) + 40px) 80px", maxWidth: "800px" }}>
      <Link href="/" className="btn btn--secondary btn--sm" style={{ marginBottom: "32px", display: "inline-flex" }}>
        ← Back to Portfolio
      </Link>

      <h1 className="display-3" style={{ marginBottom: "16px", color: "#FFFFFF" }}>Privacy Policy</h1>
      <p className="text-mono" style={{ fontSize: "12px", color: "var(--text-mute)", marginBottom: "32px" }}>
        Last updated: September 2026
      </p>

      <div className="prose" style={{ display: "grid", gap: "24px", color: "var(--text-dim)", lineHeight: 1.7 }}>
        <section>
          <h2 style={{ fontSize: "18px", color: "#FFFFFF", marginBottom: "8px" }}>1. Overview</h2>
          <p>
            This personal portfolio website (saumya-portfolio-acv.pages.dev) is operated by Saumya Mirajkar. I respect your privacy and am committed to protecting any personal data you provide when visiting this site or reaching out.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "18px", color: "#FFFFFF", marginBottom: "8px" }}>2. Data Collection & Contact Form</h2>
          <p>
            When you submit a message through the contact form, the information you provide (your name, email address, and message content) is securely stored in Firebase Firestore solely for the purpose of reading and responding to your inquiry.
          </p>
          <p>
            I do not sell, rent, or share your contact details with any third parties or advertisers.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "18px", color: "#FFFFFF", marginBottom: "8px" }}>3. Analytics & Cookies</h2>
          <p>
            This website uses privacy-friendly analytics (Plausible) to understand general traffic trends (such as page views and referral sources). Plausible does not use cookies, does not track individual IP addresses across websites, and does not collect personal identifiers.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "18px", color: "#FFFFFF", marginBottom: "8px" }}>4. Data Security</h2>
          <p>
            All network communication is strictly enforced over HTTPS (TLS 1.3). Access to stored contact messages is restricted to authorized authentication credentials governed by strict database security rules.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "18px", color: "#FFFFFF", marginBottom: "8px" }}>5. Contact Information</h2>
          <p>
            If you have questions regarding this privacy policy or wish to request the deletion of a message you submitted, please contact me directly at <a href="mailto:saumyamir25@gmail.com" style={{ color: "#FFFFFF", textDecoration: "underline" }}>saumyamir25@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
