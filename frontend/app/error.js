"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "40px 20px",
        color: "#FFFFFF",
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.08)",
          display: "grid",
          placeItems: "center",
          fontSize: "20px",
          marginBottom: "20px",
        }}
      >
        !
      </div>
      <h1 style={{ fontSize: "28px", fontWeight: "800", marginBottom: "12px" }}>
        Something went wrong
      </h1>
      <p style={{ color: "var(--text-dim)", maxWidth: "460px", marginBottom: "28px", lineHeight: "1.6" }}>
        An unexpected error occurred while rendering this page. You can try reloading the section or returning to the home page.
      </p>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={() => reset()}
          className="btn btn--primary btn--sm"
        >
          Try again
        </button>
        <a href="/" className="btn btn--secondary btn--sm">
          Return home
        </a>
      </div>
    </div>
  );
}
