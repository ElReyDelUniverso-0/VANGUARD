import type { Metadata } from "next";
import Link from "next/link";
import {
  ROSTROS,
  COLECCION_ROSTROS,
  CATEGORIAS_ROSTRO,
  PULSO_KEYWORDS_ROSTROS,
} from "@/lib/personas-data";
import { db } from "@/lib/db";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { PortadaSala } from "@/components/vanguard/portada-sala";
// v403.3 — el pilar 2 entra en la segunda sala más «de libro»: casi 50.000 letras
// y nueve visuales. Se añaden sus propias cifras dibujadas, sin tocar el texto.
import { GraficoBarras } from "@/components/vanguard/grafico-barras";
// v404.1 — el expediente de cada rostro, a un toque.
import { FichasRostros } from "@/components/vanguard/fichas-rostros";

// v286.0 LOS ROSTROS DEL PODER — la galería de los rostros sube a
// server (patrón /historia v274 · /servicios v281 · /armeria v283):
// personas-data.ts (ROSTROS, 34 fichas reales — TRONOS · DINERO ·
// TRIBUNAL · NUEVOS) solo vivía client-side (rostros-panel, el
// aparato), invisible para el SSR y para Google. Cada expediente
// viaja VERBATIM de la fuente (directiva v266): cargo, organización,
// sede, ciudad, alcance, poder, mandato, ruta, frase, señas, guardia,
// sucesión y notas — nada aquí es inventado: es el censo de poder de
// la casa, presentado como galería indexable. TODO derivado, nada a
// mano: censo por categoría con Set + filter en el ORDEN DE LA
// FUENTE, naciones con Set, leyendas e iconos desde
// CATEGORIAS_ROSTRO (directiva v266), la placa derivada del num real
// y las cifras servidas de COLECCION_ROSTROS (ya derivada en la
// fuente con Set + filter + reduce — la sala no escribe una cifra,
// herencia v282). Líneas compuestas COMPLETAS en JS (lección v256).
// Cero años a mano (guardia v234 + la guardia del arco v282/v283).
//
// v287.0 EL PULSO DEL ARCHIVO POR ROSTRO — LA TERCERA CAPA (la cola de
//    la v286 se paga): los PULSO_KEYWORDS_ROSTROS de la fuente cruzan
//    el archivo real (títulos de los cables no-curados de la BD) con EL
//    MISMO algoritmo del panel (minúsculas, includes en el título — el
//    canon del consumidor, rostros-panel v286). Una lectura pura de la
//    BD (la casa no escribe al servir — un solo escritor, leyes
//    v245/v246); la sala pasa a force-dynamic para que el pulso entre
//    al render, el mismo camino del tablero (v284). El vacío se declara
//    honesto: sin menciones en el archivo, el pulso duerme y la sala lo
//    dice — nunca un pulso fingido.

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "LOS ROSTROS DEL PODER — las 34 fichas reales del poder mundial",
  description:
    "Quién manda en el mundo: 34 fichas reales en 18 naciones — jefes de Estado, banqueros, organismos y gigantes de la IA — con su cargo y su ruta al poder.",
  alternates: { canonical: `${SITE_URL}/rostros` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/rostros`,
    title: "LOS ROSTROS DEL PODER — Vanguard",
    description:
      "34 fichas reales del poder mundial: los tronos, el dinero, el tribunal y los nuevos — cargo, sede, ruta, frase y guardia, verbatim de la fuente.",
    siteName: "VANGUARD — Conflictos Mundiales en Tiempo Real",
    locale: "es_ES",
    images: [{ url: `${SITE_URL}/api/og`, width: 1200, height: 630, alt: "Los rostros del poder — Vanguard" }],
  },
};

// ── TODO derivado de las fuentes, nada a mano ──
// el censo por categoría en el ORDEN DE LA FUENTE (el Set preserva la
// inserción: tronos · dinero · tribunal · nuevos)
const CATS_ROSTROS = [...new Set(ROSTROS.map((r) => r.categoria))];

// v403.3 — EL ÍNDICE DE PODER EN UNA ESCALA: los diez rostros que más pesan,
// ordenados por el campo `poder` de la ficha (0-100, mezcla de mando,
// presupuesto y alcance según la fuente). Se ordena y se corta; ni una cifra a mano.
const TOP_PODER_ROSTROS = [...ROSTROS]
  .sort((a, b) => b.poder - a.poder)
  .slice(0, 10)
  .map((x) => ({
    etiqueta: x.nombre,
    valor: x.poder,
    texto: `${x.poder}`,
    nota: x.cargo,
    href: "#rostros",
  }));

const censoRostros = CATS_ROSTROS.map((c) => ({
  cat: c,
  n: ROSTROS.filter((r) => r.categoria === c).length,
  etiqueta: CATEGORIAS_ROSTRO[c].etiqueta,
  icono: CATEGORIAS_ROSTRO[c].icono,
  color: CATEGORIAS_ROSTRO[c].color,
  leyenda: CATEGORIAS_ROSTRO[c].leyenda,
}));

// las naciones, derivadas de los países reales de la fuente
const NACIONES_ROSTROS = new Set(ROSTROS.map((r) => r.pais)).size;

// las líneas compuestas COMPLETAS en JS (lección v256) — cero cifras
// escritas a mano: los censos salen del filter, las naciones del Set
// y las cifras mayores de COLECCION_ROSTROS (ya derivada en la fuente)
const lineaRostros = `La galería de los rostros — ${ROSTROS.length} fichas reales del poder en ${NACIONES_ROSTROS} naciones, con su cargo, su sede, su ruta y su frase verbatim: ${censoRostros.map((c) => `${c.etiqueta} ×${c.n}`).join(" · ")}`;
const lineaCifras = `La colección en cifras — ${COLECCION_ROSTROS.total} fichas de ${COLECCION_ROSTROS.naciones} naciones; la ficha más poderosa: ${COLECCION_ROSTROS.masPoderoso.nombre} (${COLECCION_ROSTROS.masPoderoso.poder}), ${COLECCION_ROSTROS.masPoderoso.cargo}`;

// el número de expediente compuesto desde el num real de la fuente
const placa = (n: number): string => String(n).padStart(2, "0");

export const dynamic = "force-dynamic";

export default async function RostrosPage() {
  // v287.0 — EL PULSO DEL ARCHIVO: una lectura pura de los títulos del
  // archivo real (los curated- de respaldo quedan fuera, como en toda
  // la casa); si la BD duerme, el pulso duerme con ella y la sala lo
  // declara — el expediente de arriba no depende de la señal.
  const archivo: { id: string; title: string }[] = [];
  try {
    const rows = await db.newsItem.findMany({
      where: { externalId: { not: { startsWith: "curated-" } } },
      orderBy: { publishedAt: "desc" },
      select: { id: true, title: true },
    });
    archivo.push(...rows);
  } catch (e) {
    console.error("rostros page error", e);
  }

  // EL MISMO ALGORITMO DEL PANEL (rostros-panel v286): keywords en
  // minúsculas, includes en el título — el canon del consumidor; en el
  // ORDEN DE LA FUENTE y solo rostros con menciones (el vacío no se
  // rellena: se declara).
  const pulso: { id: string; nombre: string; n: number; ultimo: { id: string; title: string } | null }[] = [];
  for (const r of ROSTROS) {
    const kws = (PULSO_KEYWORDS_ROSTROS[r.id] ?? []).map((k) => k.toLowerCase());
    if (kws.length === 0) continue;
    const suyos = archivo.filter((c) => kws.some((k) => c.title.toLowerCase().includes(k)));
    if (suyos.length > 0) {
      pulso.push({ id: r.id, nombre: r.nombre, n: suyos.length, ultimo: suyos[0] });
    }
  }
  const totalMenciones = pulso.reduce((a, p) => a + p.n, 0);
  // LA LÍNEA DEL PULSO compuesta COMPLETA en JS (lección v256): si el
  // archivo cambia, la línea cambia sola.
  const lineaPulso = `El pulso del archivo por rostro — ${pulso.length} de ${ROSTROS.length} rostros citados por ${totalMenciones} titulares del archivo`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "LOS ROSTROS DEL PODER — el censo de poder de Vanguard",
    description:
      "34 fichas reales del poder mundial en 18 naciones: los tronos, el dinero, el tribunal y los nuevos — con cargo, sede, ruta al poder y frase.",
    url: `${SITE_URL}/rostros`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    inLanguage: "es",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: ROSTROS.length,
      itemListElement: ROSTROS.map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${r.nombre} — ${r.cargo}`,
      })),
    },
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
      />

      <PortadaSala
        imagen="/imagenes-reales/control.jpg"
        alt="Retrato en penumbra de un rostro iluminado de lado"
        volanta="LA CASA · ROSTROS"
        titulo="LAS CARAS DEL MANDO"
        acento="#38bdf8"
        sumario="Quién decide, quién ejecuta y quién responde: los rostros del poder con su cargo real, su país y su rastro en el archivo de la casa."
        cifras={[
          { valor: ROSTROS.length, etiqueta: "rostros", nota: "con ficha" },
          { valor: censoRostros.length, etiqueta: "categorías", nota: "de poder" },
          { valor: pulso.length, etiqueta: "citados", nota: "en el archivo" },
          { valor: totalMenciones, etiqueta: "titulares", nota: "reales" }
        ]}
        puntos={[
          { titulo: "QUIÉN ES QUIÉN", texto:
              "Un censo de las personas que ocupan el mando —jefes de Estado, ministros, mandos militares y responsables de inteligencia—, con su cargo verificado y su país." },
          { titulo: "EL RASTRO", texto:
              "Cada rostro se cruza con el archivo real de titulares: si aparece en las noticias que la casa guarda, se cuenta y se cita el último titular que lo nombra." },
          { titulo: "PARA QUÉ SIRVE", texto:
              "Poner cara a las decisiones: cuando una noticia dice «el gobierno», esta sala dice quién." }
        ]}
        anclas={[
          { etiqueta: "los que más pesan", href: "#rostros-por-poder" },
          ...censoRostros.map((c) => ({ etiqueta: c.etiqueta.toLowerCase(), href: `#rostro-${c.cat}` })),
          { etiqueta: "el pulso", href: "#pulso" },
        ]}
        nota="Portada y cifras servidas desde la propia casa: la ilustración viaja en el repositorio y cada número sale de la fuente de esta sala, calculado en el render. Cero cifras escritas a mano."
      />

{/* v403.3 — EL PODER EN UNA ESCALA (pilar 2: ver, no leer) */}
      <GraficoBarras
        id="rostros-por-poder"
        volanta="LOS ROSTROS · EL PESO"
        titulo="LOS DIEZ QUE MÁS PESAN"
        nota={`El índice de poder de la Casa (0-100: mando, presupuesto y alcance) aplicado a las ${ROSTROS.length} fichas, medido contra el mayor de la serie. Debajo de cada nombre, su cargo real.`}
        unidad="índice de poder (0-100)"
        acento="#38bdf8"
        etiquetaMaximo="el rostro con más poder de la serie"
        barras={TOP_PODER_ROSTROS}
      />

            <div className="border-b border-zinc-800 bg-zinc-900/60">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber">
            LOS ROSTROS DEL PODER · el censo de la casa
          </div>
          <h2 className="vx-h-sala mt-3 text-2xl font-bold text-zinc-100 sm:text-3xl">
            Los rostros que mueven el mundo
          </h2>
          <p className="mt-3 text-sm text-zinc-400 leading-relaxed">
            {`${lineaRostros}.`}
          </p>
          {/* los censos por categoría — derivados de la fuente, cero cifras a mano */}
          <div className="mt-4 flex flex-wrap gap-2">
            {censoRostros.map((c) => (
              <span
                key={`censo-${c.cat}`}
                className="border border-zinc-700 rounded px-2 py-1 font-mono text-[10px] uppercase tracking-widest bg-zinc-900"
              >
                <span style={{ color: c.color }}>{`${c.icono} ${c.etiqueta} ×${c.n}`}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* la colección en cifras (v286) — COLECCION_ROSTROS ya vive derivada en la fuente */}
        <p className="text-xs text-zinc-500 leading-relaxed">
          {`${lineaCifras}.`}
        </p>
        <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
          {`Cada expediente viaja con SUS datos de la fuente (personas-data.ts): el nombre, el cargo, la sede, la ruta, la frase y las notas tal como la fuente los declara — nada aquí es inventado. El expediente vive en la fuente, no en esta sala.`}
        </p>

        {/* v404.1 — LAS 34 FICHAS, EN TARJETAS (pilar 2): el nombre, el cargo y el
            peso del poder dibujado; el expediente completo sigue entero, a un toque.
            Antes esta sala eran 50.784 letras en 19 visuales: 2.673 por visual. */}
        <FichasRostros />

        {/* v287.0 — EL PULSO DEL ARCHIVO POR ROSTRO: los keywords de la
            fuente cruzan el archivo real con el algoritmo del panel
            (v286); lectura pura de la BD, en el orden de la fuente. */}
        {pulso.length > 0 ? (
          <section id="pulso" className="mt-10" aria-label={lineaPulso}>
            <h2 className="text-lg font-bold text-zinc-100">EL PULSO DEL ARCHIVO POR ROSTRO</h2>
            <p className="mt-1 text-sm text-zinc-400">{lineaPulso}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {pulso.map((p) => (
                <div
                  key={p.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3"
                  aria-label={p.nombre}
                >
                  <p className="font-mono text-[10px] uppercase tracking-widest text-amber">
                    {p.nombre} · {p.n} {p.n === 1 ? "mención" : "menciones"}
                  </p>
                  {p.ultimo && (
                    <Link
                      href={`/noticia/${p.ultimo.id}`}
                      className="mt-1 block text-xs leading-snug text-zinc-300 hover:text-amber"
                    >
                      {p.ultimo.title}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : (
          <p className="mt-10 font-mono text-[11px] uppercase tracking-wider text-zinc-600">
            el archivo no cita a ningún rostro todavía — el pulso duerme honesto
          </p>
        )}

        {/* la puerta honesta al aparato (patrón v275/v276) */}
        <p className="mt-8 text-xs text-zinc-500 leading-relaxed">
          El salón interactivo de los rostros — el mapa de señales vivas, los filtros por poder y el pulso por palabras clave — vive en el aparato ({" "}
          <Link href="/" className="text-amber underline">
            la primera página de la casa
          </Link>
          ); esta sala es el expediente completo, servido sin JavaScript. Las fichas viven en la fuente (personas-data.ts), no en esta sala — si el censo crece, la galería crece sola.
        </p>

        <noscript>
          <p className="mt-6 text-xs text-zinc-500 leading-relaxed">
            {`Esta sala funciona sin JavaScript: las ${ROSTROS.length} fichas —${censoRostros.map((c) => `${c.n} ${c.etiqueta.toLowerCase()}`).join(", ")}— de ${NACIONES_ROSTROS} naciones están arriba, servidas en el HTML, con su cargo, su sede, su ruta y su frase. El mapa de señales vive en el aparato y pide JavaScript.`}
          </p>
        </noscript>
      </div>
    </main>
  );
}
