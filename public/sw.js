// v210.0 EL REFUGIO — SERVICE WORKER CONSERVADOR DE VANGUARD.
// Contrato con las leyes de la Casa:
//  · LEY v125 (HTML NUNCA se cachea): toda navegación pasa SIEMPRE por la
//    red; el visitante ve la versión nueva en cada llegada. El worker jamás
//    responde HTML guardado salvo cuando NO HAY RED — ahí entrega una sola
//    página: /offline (el refugio). Es la excepción que no traiciona la ley:
//    sin red no hay «versión nueva» que ver.
//  · LEY v190 (NADA SE RECARGA SOLO): el worker jamás recarga pestañas,
//    jamás llama reload, jamás muestra avisos. Solo guarda activos mudos
//    (_next/static con hash inmutable, iconos, vendor) para que la segunda
//    visita vuele. La recarga la decide siempre el usuario.
//  · LEY v199 (media con caché larga): los activos inmutables quedan en el
//    worker con cache-first; todo lo demás pasa intacto a la caché HTTP.
//  · APIs: JAMÁS se cachean — /api/ pasa siempre por la red (datos vivos).

const CACHE = "vg-refugio-v210";
const REFUGIO = "/offline";

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.add(REFUGIO))
      .catch(() => {}) // si /offline no baja aún, el fallback de emergencia cubre
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((llaves) =>
        Promise.all(
          llaves.filter((l) => l !== CACHE).map((l) => caches.delete(l))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (evento) => {
  const req = evento.request;
  // Solo GET del mismo origen pasa por el worker; el resto ni nos miramos.
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // NAVEGACIÓN (HTML): red siempre. Sin red → el refugio.
  if (req.mode === "navigate") {
    evento.respondWith(
      fetch(req).catch(() =>
        caches
          .match(REFUGIO)
          .then((r) => r || refugioDeEmergencia())
      )
    );
    return;
  }

  // APIs y datos vivos: red siempre, sin caché, sin sustitutos.
  if (url.pathname.startsWith("/api/")) return;

  // Activos mudos inmutables: cache-first (el hash cambia con cada build,
  // así que una entrada vieja nunca miente sobre la versión).
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/vendor/") ||
    url.pathname === "/icon.svg" ||
    url.pathname === "/favicon.ico"
  ) {
    evento.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res && res.ok && res.type === "basic") {
              const copia = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copia));
            }
            return res;
          })
      )
    );
    return;
  }

  // Todo lo demás: pasa intacto (caché HTTP del navegador, leyes v125/v199).
});

// Última trinchera: si hasta /offline falta (primer visita y red caída a la
// vez), un cuerpo mínimo honesto sin dependencias.
function refugioDeEmergencia() {
  return new Response(
    "<!doctype html><html lang='es'><head><meta charset='utf-8'>" +
      "<meta name='viewport' content='width=device-width,initial-scale=1'>" +
      "<title>Sin conexión | VANGUARD</title>" +
      "<style>body{background:#09090b;color:#d4d4d8;font-family:monospace;" +
      "display:flex;min-height:100vh;align-items:center;justify-content:center;" +
      "text-align:center;padding:24px}b{color:#fbbf24}</style></head>" +
      "<body><div><p><b>◉ VANGUARD · REFUGIO</b></p>" +
      "<h1 style='font-size:20px'>No hay conexión</h1>" +
      "<p style='max-width:420px'>La Casa no puede llegar hasta aquí. " +
      "Cuando la red vuelva, la portada en vivo aparecerá al instante.</p></div></body></html>",
    {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    }
  );
}
