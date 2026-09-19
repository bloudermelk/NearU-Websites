"use client";

/**
 * Catches errors thrown by the ROOT LAYOUT itself (e.g. Supabase totally
 * unreachable during `getSite()`), which regular error.tsx can't do — a
 * layout's own errors can only be caught by replacing the whole document.
 * Must render its own <html>/<body> and can't assume theme.css loaded
 * correctly (the failure may be upstream of it), so this is deliberately
 * plain/inline-styled rather than reusing theme classes.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en-US">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "4rem 1.5rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "1rem" }}>Something Went Wrong</h1>
        <p style={{ marginBottom: "1.5rem", color: "#555" }}>
          We&apos;re temporarily unable to load this site. Please try again in a moment.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
