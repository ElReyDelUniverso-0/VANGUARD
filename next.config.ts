import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* v70.0 CLASICO PURO: la portada "/" vuelve a ser la app clasica completa.
     La experiencia nexo (v68/v69) fue eliminada por decision del comandante. */
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
