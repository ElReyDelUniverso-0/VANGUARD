// v443.0 LA MUDANZA A CLOUDFLARE — configuración de OpenNext.
// Las páginas prerenderizadas se sirven desde los archivos estáticos del Worker
// (gratis e ilimitados en Cloudflare).
// v443.2 LA CACHÉ QUE RESPIRA — encima va la Cache API de Cloudflare (gratis,
// sin límite de escrituras): las páginas ISR y los fetch con revalidate se
// regeneran como mucho una vez por ventana y se guardan ahí, en vez de
// re-renderizarse en CADA visita (que agotaba los 10 ms de CPU del plan gratis).
// shouldLazilyUpdateOnCacheHit=false: el almacén de abajo es de solo lectura
// (el build) y no debe pisar lo regenerado.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";

const config = defineCloudflareConfig({
  incrementalCache: withRegionalCache(staticAssetsIncrementalCache, {
    mode: "long-lived",
    shouldLazilyUpdateOnCacheHit: false,
    bypassTagCacheOnCacheHit: false,
    defaultLongLivedTtlSec: 86400,
  }),
  enableCacheInterception: true,
});

// El repo trae bun.lock y OpenNext elegiría «bun run build»; la casa se
// construye con npm (package-lock.json).
export default { ...config, buildCommand: "npm run build" };
