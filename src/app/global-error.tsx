'use client';

import { useEffect } from 'react';

// Catches errors in the root layout itself (Navbar, providers) — must render its own html/body
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <style>{`
          .global-error-ja {
            display: block;
            color: #993556;
            font-family: 'Noto Serif JP', serif;
            font-size: 0.78em;
            font-weight: 400;
            line-height: 1.4;
          }
          @media (prefers-color-scheme: dark) {
            .global-error-ja { color: #85b7eb; }
          }
        `}</style>
      </head>
      <body>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '2rem',
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            Something went wrong
            <span lang="ja" className="global-error-ja">
              エラーがはっせいしました
            </span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#666' }}>
            The app hit an unexpected error. Please try again.
            <span lang="ja" className="global-error-ja">
              よそうしないエラーがはっせいしました。もういちどためしてください。
            </span>
          </p>
          <button
            onClick={reset}
            style={{
              borderRadius: '0.375rem',
              border: '1px solid #ccc',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
