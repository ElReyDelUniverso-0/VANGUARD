import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* v68.0 CONTROL DIRECTO: la experiencia nueva (un solo archivo HTML) vive en
     public/nexo.html y toma la ruta "/" con un rewrite beforeFiles.
     La app clasica completa sigue viva en /clasico (app/clasico/page.tsx). */
  rewrites: {
    beforeFiles: [
      { source: "/", destination: "/nexo.html" },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "*.space-z.ai",
    "*.chatglm.cn",
    "*.z.ai",
    "localhost",
    "127.0.0.1",
    "*.preview.chatglm.cn",
  ],
};

export default nextConfig;
