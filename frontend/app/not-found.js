import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="wrap" style={{ minHeight: "72vh", display: "grid", placeItems: "center", textAlign: "center", paddingTop: "80px" }}>
      <div>
        <p className="eyebrow eyebrow--dot" style={{ justifyContent: "center" }}>error 404</p>
        <h1 className="display-1" style={{ marginTop: 18 }}>
          Lost in <span className="gradient-text">space</span>
        </h1>
        <p className="prose" style={{ margin: "20px auto 30px" }}>
          This page drifted out of orbit. Let's get you back on track.
        </p>
        <Link href="/" className="btn btn--primary">
          Back home <span className="btn-arrow">→</span>
        </Link>
      </div>
    </div>
  );
}