// Favicon generátor — Next.js App Router ImageResponse
// MIÉRT így: az App Routerben az app/icon.tsx fájl automatikusan
// favicon-ná válik; az ImageResponse egy Edge-kompatibilis képet generál belőle.
// Ez pontosan ugyanaz a logó, mint ami a navigációs sávban szerepel.
import { ImageResponse } from 'next/og';

// A generált ikon mérete és típusa
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      // Külső keret: lekerekített négyzet, fekete háttérrel (primary szín)
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          backgroundColor: '#0a0a0a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* FileText ikon SVG — ugyanaz, mint a Lucide FileText icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Dokumentum körvonala */}
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          {/* Hajtás jobb felső sarokban */}
          <polyline points="14 2 14 8 20 8" />
          {/* Sorok a dokumentumban */}
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
