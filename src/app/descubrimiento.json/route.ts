import { NextResponse } from "next/server";
// v421.0 — el sitemap dejó de ser una ruta y es una función (el mapa se sirve
// dividido). Esta llamada devuelve el mapa COMPLETO, igual que antes.
import { construirMapa } from "@/lib/seo/mapa";
import { SITE_URL } from "@/lib/site";
import { LLAVE_INDEXNOW, HORAS_TANDA, TAMANO_TANDA, MOTORES, tandaDe, vueltaCompletaDias } from "@/lib/faro";
import { CONSTELACIONES, TOTAL_SALAS } from "@/lib/vanguard/mapa-salas";

// ============================================================
// v405.6 LA CARTA A LAS MÁQUINAS — /descubrimiento.json — ia3 (Arena)
//
// QUÉ ES: la misma carta que /llms.txt, pero para una máquina que quiere
// números y no prosa. Una sola llamada devuelve TODO lo que un rastreador o un
// agente necesita saber para entender la casa sin adivinar:
//   · qué puertas hay (las constelaciones reales y cuántas salas tiene cada una)
//   · dónde están los mapas (sitemap, feed, llms.txt, estado)
//   · qué se ha anunciado a los buscadores y cuándo gira el faro otra vez
//
// POR QUÉ VIVE AQUÍ Y NO EN /api/: `robots.txt` prohíbe /api/ a los rastreadores
// (v204, las cocinas). Publicar el mapa en una ruta prohibida sería una broma.
// Va en la raíz, como llms.txt y como security.txt.
//
// QUÉ NO HACE: no escribe, no envía avisos, no expone datos privados. La
// frontera de la casa (COORDINACION.md) deja fuera cuentas, jugadores,
// telemetría y conversación — aquí no aparece ninguna de esas fuentes.
//
// EL CACHÉ: contar las URLs de verdad obliga a llamar al sitemap (que consulta
// la base). Se cachea 10 minutos POR INSTANCIA y se declara cuándo se contó: si
// el número tiene 9 minutos, se dice. Nada de números sin fecha.
// ============================================================
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Conteo = { urls: number; cuando: number } | null;
let conteo: Conteo = null;
const CACHE_MS = 10 * 60_000;

async function contarUrls(): Promise<Conteo> {
  if (conteo && Date.now() - conteo.cuando < CACHE_MS) return conteo;
  try {
    const mapa = await construirMapa();
    conteo = { urls: mapa.length, cuando: Date.now() };
    return conteo;
  } catch {
    return null; // se declara la ausencia; no se inventa un número
  }
}

export async function GET() {
  const host = new URL(SITE_URL).hostname;
  const c = await contarUrls();
  const total = c?.urls ?? 0;
  const t = tandaDe(Date.now(), total);

  return NextResponse.json(
    {
      sitio: {
        nombre: "VANGUARD",
        casa: SITE_URL,
        host,
        idioma: "es",
        idiomas: 8,
        registro: "no obligatorio",
        precio: "gratis",
      },
      puertas: {
        constelaciones: CONSTELACIONES.length,
        salas: TOTAL_SALAS,
        lista: CONSTELACIONES.map((k) => ({
          clave: k.clave,
          nombre: k.nombre,
          descripcion: k.desc,
          salas: k.salas.length,
          url: `${SITE_URL}/constelacion/${k.clave}`,
        })),
      },
      mapas: {
        sitemap: `${SITE_URL}/sitemap.xml`,
        llms: `${SITE_URL}/llms.txt`,
        robots: `${SITE_URL}/robots.txt`,
        feed: `${SITE_URL}/feed.xml`,
        estado: `${SITE_URL}/api/health`,
      },
      sitemap: {
        urls: c ? c.urls : null,
        contadoHaceSegundos: c ? Math.round((Date.now() - c.cuando) / 1000) : null,
        estado: c ? "contado" : "no disponible en este instante (se declara, no se rellena)",
      },
      faro: {
        que: "aviso giratorio de URLs a los buscadores que hablan IndexNow",
        llave: LLAVE_INDEXNOW,
        llavePublicada: `${SITE_URL}/${LLAVE_INDEXNOW}.txt`,
        ritmo: `una tanda de ${TAMANO_TANDA} URLs cada ${HORAS_TANDA} h`,
        tandaAhora: t,
        vueltaCompletaDias: total > 0 ? vueltaCompletaDias(total) : null,
        motores: MOTORES.map((m) => m.nombre),
        google: "Google no habla IndexNow: entra por sitemap + Search Console y por enlaces reales entrantes.",
        auditoria: `${SITE_URL}/api/indexnow`,
      },
      generado: new Date().toISOString(),
    },
    {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    }
  );
}
