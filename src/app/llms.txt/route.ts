import { SITE_URL } from "@/lib/site";
import { CONSTELACIONES, TOTAL_SALAS } from "@/lib/vanguard/mapa-salas";
import { MODELOS, estadisticasLabs } from "@/lib/labs/registro"; // v411.0: el laboratorio
import CENSO from "@/lib/arquitectura/censo.json"; // v412.0: el censo real del árbol
import { TEMAS_INVESTIGACION } from "@/lib/investigacion"; // v413.0: investigación sistémica
import { ARTICULOS as ARTICULOS_ENC, CATEGORIAS as CATEGORIAS_ENC, rutaArticulo } from "@/lib/enciclopedia/indice"; // v417.0

// ============================================================
// v405.6 LA CARTA A LAS MÁQUINAS — /llms.txt — ia3 (Arena)
//
// QUÉ ES: el estándar llms.txt (llmstxt.org) es una carta breve, en texto plano,
// que un asistente de IA lee ANTES de decidir qué es un sitio. En 2026 la
// pregunta «¿qué juego de guerra gratis hay en el navegador?» se la hace la gente
// a un chat, no a Google — y el chat solo puede citar lo que entiende.
//
// POR QUÉ GENERADO Y NO ESCRITO A MANO: la lista de puertas sale de
// CONSTELACIONES (src/lib/vanguard/mapa-salas.ts), el MISMO archivo del que
// comen /modulos, el buscador ⌘K y las 20 rutas /constelacion/<clave>. Si mañana
// la casa añade una sala, este archivo la dice sin que nadie lo edite; si la
// quita, deja de mentir. Cero listas paralelas.
//
// QUÉ NO ES: no es publicidad ni una promesa. Cada línea describe lo que la casa
// ya tiene y enlaza a una ruta que existe (las 20 verificadas en el censo de
// v403.9: 20/20 responden 200).
//
// EL DOMINIO: sale de SITE_URL (src/lib/site.ts). Ni una URL escrita a mano.
// ============================================================
export const dynamic = "force-static";
export const revalidate = 3600;

export function GET() {
  const c = (ruta: string) => `${SITE_URL}${ruta}`;

  const lineas: string[] = [
    "# VANGUARD",
    "",
    "> VANGUARD es un universo digital en español sobre el mundo en tiempo real: " +
      "mapa vivo, frentes de guerra con datos públicos (GDELT y medios reales), " +
      "planeta 3D, salas de exploración y juego. Gratis, sin registro, sin " +
      "instalación: todo ocurre en el navegador.",
    "",
    `Idioma principal: español. La interfaz cubre 8 idiomas. La casa tiene ` +
      `${TOTAL_SALAS} salas repartidas en ${CONSTELACIONES.length} constelaciones, ` +
      "todas dentro del mismo producto (no hay subdominios ni micrositios).",
    "",
    "## Puertas principales",
    "",
  ];

  for (const k of CONSTELACIONES) {
    const nombre = k.nombre.replace(/\s+/g, " ").trim();
    const desc = k.desc.replace(/\s+/g, " ").trim();
    const cuantas = k.salas.length === 1 ? "1 sala" : `${k.salas.length} salas`;
    lineas.push(`- [${nombre}](${c(`/constelacion/${k.clave}`)}): ${desc} — ${cuantas}.`);
  }

  lineas.push(
    "",
    "## Laboratorio de sistemas (VANGUARD LABS)",
    "",
    `- [VANGUARD LABS](${c("/labs")}): ${MODELOS.length} simuladores de economía, sociedad, geografía, historia y ` +
      "sistemas complejos. Cada variable declara si es dato real, supuesto o decisión; cada modelo publica sus " +
      `supuestos y sus límites (${estadisticasLabs().limites} límites escritos, ${estadisticasLabs().datosReales} datos reales citados). ` +
      "Motor determinista: mismos mandos y misma semilla dan la misma corrida. No son predicciones.",
    ...MODELOS.map((m) => `- [${m.nombre}](${c(`/labs/${m.id}`)}): ${m.pregunta}`),
    "",
    "## Arquitectura y verificación",
    "",
    `- [La arquitectura](${c("/arquitectura")}): el censo real de la plataforma —${CENSO.paginas} páginas y ${CENSO.rutasApi} rutas de API, con sus ` +
      "referencias entrantes—, el motor de nexos entre países, datos, mapas, cronologías y simuladores, el estado honesto " +
      "de los veintidós departamentos del plan (cuáles están en pie, cuáles a medias y cuáles sin construir) y los ocho " +
      "contratos de integración. El censo se regenera con `node tools/arquitectura/censar.mjs` y se comprueba con " +
      "`node tools/arquitectura/probar.mjs`.",
    `- [Catálogo de datos](${c("/datos")}): procedencia, licencia, fecha de captura y límites de cada modelo de datos del sitio.`,
    `- [Sala de la calidad](${c("/calidad")}): las pruebas de la casa y qué mide cada una.`,
    "",
    "## Enciclopedia VANGUARD",
    "",
    `- [Enciclopedia VANGUARD](${c("/conocimiento/enciclopedia")}): ${ARTICULOS_ENC.length} artículos de fondo en ${CATEGORIAS_ENC.length} categorías ` +
      "(continentes, países, geografía física y humana, civilizaciones, culturas, ciencia, naturaleza, organismos internacionales y recursos). " +
      "Cada artículo trae datos anotados a su fuente, bibliografía, imágenes de Wikimedia Commons con licencia y fecha de revisión.",
    ...ARTICULOS_ENC.map((a) => `- [${a.titulo}](${c(rutaArticulo(a.slug))}): ${a.bajada}`),
    "",
    "## Investigación Sistémica (VANGUARD DOSSIERS)",
    "",
    `- [Investigación Sistémica](${c("/investigacion")}): ${TEMAS_INVESTIGACION.length} dossiers globales que ` +
      "integran teoría, indicadores auditados de la AIE, Banco Mundial y SIPRI, mapas geoestratégicos SVG, " +
      "comparativas asimétricas y conexión con simuladores matemáticos.",
    ...TEMAS_INVESTIGACION.map((t) => `- [${t.titulo}](${c(`/investigacion/${t.id}`)}): ${t.subtitulo}`),
    "",
    "## Datos y mapas del sitio",
    "",
    `- [Mapa del sitio](${c("/sitemap.xml")}): todas las URLs públicas, generadas en vivo.`,
    `- [Descubrimiento para máquinas](${c("/descubrimiento.json")}): qué existe, cuántas salas, cuántas URLs y qué se ha anunciado a los buscadores — en JSON.`,
    `- [Feed](${c("/feed.xml")}): el canal de noticias en RSS.`,
    `- [Estado del servicio](${c("/api/health")}): latido del servidor en JSON.`,
    "",
    "## Cómo se actualiza",
    "",
    "- Las noticias y los frentes se sirven en vivo desde fuentes públicas (GDELT y medios con RSS abierto).",
    "- Los buscadores que hablan IndexNow (Bing, Yandex, Seznam, Naver) reciben un aviso giratorio de URLs cada 6 horas: la casa no espera a que la rastreen.",
    "- Si una fuente no responde, la casa lo declara. No se rellenan huecos con datos inventados.",
    "",
    "## Fuera de alcance",
    "",
    "- No hay registro obligatorio ni muro de pago.",
    "- No se venden datos de visitantes.",
    "",
  );

  return new Response(lineas.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
