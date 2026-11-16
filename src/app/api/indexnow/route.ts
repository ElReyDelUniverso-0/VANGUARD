import { NextResponse } from "next/server";
import sitemap from "@/app/sitemap";
import { SITE_URL } from "@/lib/site";

// v405.5 EL FARO QUE GIRA — ia3 (Arena)
//
// QUÉ ES ESTO: la cara legible de un mecanismo que ya está trabajando.
// El aviso a los buscadores (IndexNow) lo hace `.github/workflows/faro-indexnow.yml`
// cada 6 horas — gratis, sin llaves secretas y sin tocar los dos crons que el plan
// Hobby de Vercel ya tiene ocupados (un tercero puede tumbar el despliegue).
//
// POR QUÉ ESTA RUTA EXISTE Y POR QUÉ NO ESCRIBE NADA:
// un endpoint público que dispara avisos a buscadores es un grifo que cualquiera
// puede abrir para hacer que la casa parezca spam. Así que esto es SOLO LECTURA:
// dice qué tanda le toca a esta hora, con qué URLs, sobre qué sitemap y con qué
// llave — para que el Dueño pueda comprobar que el faro gira sin tener que
// creerse la palabra de una IA. Cero escrituras, cero peticiones salientes.
//
// LA CUENTA ES LA MISMA QUE LA DEL WORKFLOW (una sola ley, dos lectores):
//   tanda  = floor(segundos_desde_1970 / 6 h) % total_de_tandas
//   desde  = tanda * 200
// Si esa fórmula cambia en un sitio y no en el otro, esta ruta lo delataría:
// enseña la tanda que cree tocar y la lista de URLs que le corresponden.
//
// LA LLAVE: NO es un secreto. IndexNow funciona al contrario que una API key:
// el dueño publica un archivo `public/<llave>.txt` cuyo NOMBRE es la llave, y el
// buscador lo descarga para comprobar que quien avisa es el dueño del sitio. Por
// eso puede viajar en el JSON y en el repositorio sin riesgo. Se usa la llave que
// los cuatro motores YA tienen verificada (medida): la otra llave del repo
// devuelve 403 porque Bing cacheó el 404 de su primera comprobación.
export const dynamic = "force-dynamic";
export const revalidate = 0;

const LLAVE = process.env.INDEXNOW_KEY || "074b8db50cc83f0689a2211e3ff94db1";
const TAMANO_TANDA = 200;
const HORAS_TANDA = 6;
const MOTORES = [
  { nombre: "IndexNow (redirección a todos los participantes)", endpoint: "https://api.indexnow.org/indexnow" },
  { nombre: "Bing (y Copilot / ChatGPT Search)", endpoint: "https://www.bing.com/indexnow" },
  { nombre: "Yandex", endpoint: "https://yandex.com/indexnow" },
  { nombre: "Seznam (Chequia)", endpoint: "https://search.seznam.cz/indexnow" },
];

function errorLimpio(e: unknown): string {
  return e instanceof Error ? e.message : "error desconocido";
}

export async function GET() {
  const host = new URL(SITE_URL).hostname;

  let urls: string[] = [];
  let mapaCaido = false;
  try {
    const mapa = await sitemap();
    urls = mapa.map((u) => u.url).filter((u): u is string => typeof u === "string");
  } catch (e) {
    // el mapa del sitio es del núcleo y puede caerse con la base: se declara,
    // no se inventa un número
    mapaCaido = true;
    void errorLimpio(e);
  }

  const total = urls.length;
  const tandas = Math.max(1, Math.ceil(total / TAMANO_TANDA));
  const tanda = Math.floor(Date.now() / (HORAS_TANDA * 3_600_000)) % tandas;
  const desde = tanda * TAMANO_TANDA;
  const lote = urls.slice(desde, desde + TAMANO_TANDA);

  return NextResponse.json(
    {
      ok: !mapaCaido,
      faro: "gira",
      // lo que se sabe de verdad
      casa: SITE_URL,
      host,
      llave: LLAVE,
      llavePublicada: `${SITE_URL}/${LLAVE}.txt`,
      motor: "IndexNow",
      // el mapa: la fuente única de las URLs (el mismo sitemap que leen los buscadores)
      sitemap: {
        url: `${SITE_URL}/sitemap.xml`,
        urls: total,
        estado: mapaCaido ? "caído en este instante (se declara, no se rellena)" : "leído",
      },
      // la tanda de esta hora — la misma que anuncia el workflow
      tandaActual: {
        numero: tanda + 1,
        de: tandas,
        desde: total === 0 ? 0 : desde + 1,
        hasta: desde + lote.length,
        tamano: lote.length,
        primera: lote[0] ?? null,
        ultima: lote[lote.length - 1] ?? null,
      },
      vueltaCompletaDias: Number(((tandas * HORAS_TANDA) / 24).toFixed(2)),
      ritmo: `una tanda de ${TAMANO_TANDA} URLs cada ${HORAS_TANDA} h`,
      motores: MOTORES.map((m) => m.nombre),
      // honestidad sobre lo que este endpoint es
      escribe: false,
      nota:
        "Esta ruta no envía nada a ningún buscador: enseña lo que el faro va a anunciar en esta hora. El aviso real lo hace el workflow .github/workflows/faro-indexnow.yml.",
      google: "Google NO habla IndexNow: a Google se le entra con sitemap + Search Console (cuenta del Dueño) y con enlaces reales entrantes.",
    },
    { headers: { "cache-control": "no-store" } }
  );
}
