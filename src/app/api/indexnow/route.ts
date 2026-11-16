import { NextResponse } from "next/server";
import sitemap from "@/app/sitemap";
import { SITE_URL } from "@/lib/site";
import { LLAVE_INDEXNOW, HORAS_TANDA, TAMANO_TANDA, MOTORES, tandaDe, vueltaCompletaDias } from "@/lib/faro";

// v405.5 EL FARO QUE GIRA — ia3 (Arena)
// v405.6 LA CARTA A LAS MÁQUINAS — la cuenta se muda a src/lib/faro.ts para que
// el faro, esta ruta y /descubrimiento.json digan SIEMPRE lo mismo. El JSON que
// devuelve esta ruta no cambia ni un campo (los consumidores viejos intactos).
//
// QUÉ ES ESTO: la cara legible de un mecanismo que ya está trabajando.
// El aviso a los buscadores (IndexNow) lo hace `.github/workflows/faro-indexnow.yml`
// cada 6 horas — gratis, sin llaves secretas y sin tocar los dos crons que el plan
// Hobby de Vercel ya tiene ocupados (un tercero puede tumbar el despliegue).
//
// POR QUÉ NO ESCRIBE NADA: un endpoint público que dispara avisos a buscadores es
// un grifo que cualquiera puede abrir para hacer que la casa parezca spam. Esto es
// SOLO LECTURA: dice qué tanda le toca a esta hora, con qué URLs y sobre qué
// sitemap — para que el Dueño compruebe que el faro gira sin creerse la palabra
// de una IA. Cero escrituras, cero peticiones salientes.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const host = new URL(SITE_URL).hostname;

  let urls: string[] = [];
  let mapaCaido = false;
  try {
    const mapa = await sitemap();
    urls = mapa.map((u) => u.url).filter((u): u is string => typeof u === "string");
  } catch {
    // el mapa del sitio es del núcleo y puede caerse con la base: se declara,
    // no se inventa un número
    mapaCaido = true;
  }

  const total = urls.length;
  const t = tandaDe(Date.now(), total);
  const desdeCero = (t.numero - 1) * TAMANO_TANDA;
  const lote = urls.slice(desdeCero, desdeCero + TAMANO_TANDA);

  return NextResponse.json(
    {
      ok: !mapaCaido,
      faro: "gira",
      // lo que se sabe de verdad
      casa: SITE_URL,
      host,
      llave: LLAVE_INDEXNOW,
      llavePublicada: `${SITE_URL}/${LLAVE_INDEXNOW}.txt`,
      motor: "IndexNow",
      // el mapa: la fuente única de las URLs (el mismo sitemap que leen los buscadores)
      sitemap: {
        url: `${SITE_URL}/sitemap.xml`,
        urls: total,
        estado: mapaCaido ? "caído en este instante (se declara, no se rellena)" : "leído",
      },
      // la tanda de esta hora — la misma que anuncia el workflow
      tandaActual: {
        numero: t.numero,
        de: t.de,
        desde: t.desde,
        hasta: t.hasta,
        tamano: t.tamano,
        primera: lote[0] ?? null,
        ultima: lote[lote.length - 1] ?? null,
      },
      vueltaCompletaDias: vueltaCompletaDias(total),
      ritmo: `una tanda de ${TAMANO_TANDA} URLs cada ${HORAS_TANDA} h`,
      motores: MOTORES.map((m) => m.nombre),
      // honestidad sobre lo que este endpoint es
      escribe: false,
      nota:
        "Esta ruta no envía nada a ningún buscador: enseña lo que el faro va a anunciar en esta hora. El aviso real lo hace el workflow .github/workflows/faro-indexnow.yml.",
      google:
        "Google NO habla IndexNow: a Google se le entra con sitemap + Search Console (cuenta del Dueño) y con enlaces reales entrantes.",
    },
    { headers: { "cache-control": "no-store" } }
  );
}
