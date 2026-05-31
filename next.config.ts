import type { NextConfig } from "next";

// Biztonsági HTTP fejlécek — MIÉRT: ezek megvédik az alkalmazást a leggyakoribb
// böngésző-szintű támadásoktól (XSS, clickjacking, MIME sniffing stb.)
const securityHeaders = [
  {
    // Megakadályozza, hogy az oldalt iframe-ben jelenítsék meg (clickjacking védelem)
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    // Megakadályozza a böngészőt abban, hogy a MIME típust kitalálja (MIME sniffing)
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // HTTPS-re kényszerít 1 évre (csak éles környezetben hatásos)
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  {
    // Referrer adatot csak ugyanazon originra küldi
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Letiltja a böngésző egyes beépített funkcióit (pl. kamera, mikrofon)
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
