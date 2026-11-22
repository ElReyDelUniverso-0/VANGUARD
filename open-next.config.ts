// v443.0 LA MUDANZA A CLOUDFLARE — configuración de OpenNext.
// Las páginas prerenderizadas se sirven desde los archivos estáticos del Worker
// (gratis e ilimitados en Cloudflare): no gastan CPU ni cuentan como peticiones
// del Worker. Sin R2 ni KV: cero servicios de pago.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
