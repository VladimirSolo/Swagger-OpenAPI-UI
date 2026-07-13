'use client';

import { useEffect } from 'react';

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
      <body>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: '1rem',
            fontFamily: 'sans-serif',
            padding: '1.5rem',
            textAlign: 'center',
          }}
        >
          <h1>Something went wrong</h1>
          <p>An unexpected error occurred. Please try again.</p>
          <button type="button" onClick={reset} style={{ padding: '0.5rem 1rem' }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
