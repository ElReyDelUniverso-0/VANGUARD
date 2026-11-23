// v443.0 LA MUDANZA A CLOUDFLARE — configuración de OpenNext.
// v443.3 LA CASA LIGERA — la caché incremental vive en D1 (cloudflare/cache-d1.ts),
// con lo prerenderizado del build como reserva. En *.workers.dev la Cache API no
// guarda nada, por eso no se usa.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import cacheD1 from "./cloudflare/cache-d1";

const config = defineCloudflareConfig({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  incrementalCache: cacheD1 as any,
  enableCacheInterception: true,
});

// El repo trae bun.lock y OpenNext elegiría «bun run build»; la casa se
// construye con npm (package-lock.json).
export default { ...config, buildCommand: "npm run build" };
