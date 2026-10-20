import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* v70.0 CLASICO PURO: la portada "/" vuelve a ser la app clasica completa.
     La experiencia nexo (v68/v69) fue eliminada por decision del comandante. */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // v145.1 GUARDIA DE MEMORIA (dev): el realtime-status sondea /socket.io
  // cada pocos segundos; en DEV cada 404 dispara una compilacion de
  // not-found de Turbopack y la memoria del server crece hasta el OOM de
  // la caja (4GB). En dev, /socket.io responde 404 BARATO via rewrite a
  // una ruta API ya compilada — cero compiles repetidos. En produccion no
  // aplica (standalone no recompila nada).
  ...(process.env.NODE_ENV === "development"
    ? {
        async rewrites() {
          return { beforeFiles: [{ source: "/socket.io", destination: "/api/health" }] };
        },
      }
    : {}),
  allowedDevOrigins: [
    "*.space-z.ai",
    "*.chatglm.cn",
    "*.z.ai",
    "localhost",
    "127.0.0.1",
    "*.preview.chatglm.cn",
  ],
  // v102.0 LA CIUDADELA — CABECERAS DE ACERO: el muro invisible que rodea
  // toda la plataforma (el comandante pidió "seguridad de acero impenetrable").
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" }, // anti-clickjacking
          { key: "X-Content-Type-Options", value: "nosniff" }, // anti-MIME-sniff
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(self), microphone=(), payment=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      // v125.0 CORRECCIÓN TOTAL — LEY CONTRA LA PÁGINA VIEJA: el HTML de la app
      // SIEMPRE se revalida (el navegador y cualquier gateway nunca muestran una
      // versión caducada — la causa «a veces no se actualiza»). Los assets de
      // /_next/static conservan su caché inmutable de fábrica (no se tocan).
      {
        source: "/((?!_next/static|_next/image|favicon|assets/).*)",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
        ],
      },
    ];
  },
};

export default nextConfig;
