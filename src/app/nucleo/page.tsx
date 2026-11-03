import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { TEATROS } from "@/lib/teatros";
import { PAISES_ATLAS } from "@/lib/atlas-data";
import { EXPEDIENTES } from "@/lib/expedientes-datos";
import { TEORIAS, ARMAS, CIVILIZACIONES, DOCS } from "@/lib/oscura-data";
import { jsonLdSeguro } from "@/lib/jsonld-seguro";
import { APP_VERSION_LABEL } from "@/lib/version";
import { MODULOS_NUCLEO, modulosPorCategoria, moduloPorId } from "@/lib/nucleo/registro";
import { FUENTES_PUBLICAS, FUENTES_PRIVADAS } from "@/lib/nucleo/fuentes";
import { TIPOS_ENTIDAD, ETIQUETA_TIPO, type TipoEntidad } from "@/lib/nucleo/tipos";
import { fichaEntidad, type FichaEntidad } from "@/lib/nucleo/relaciones";
import { NucleoBusqueda } from "@/components/vanguard/nucleo-busqueda";
import { EnlacesNucleo } from "@/components/vanguard/enlaces-nucleo";

// ============================================================
// v218.0 EL NÚCLEO — EL SALÓN CENTRAL DE VANGUARD (/nucleo)
// El mapa que conecta TODO sin aislar nada:
//   · el censo de módulos (categoría, ruta, permisos, estado,
//     dependencias) — descubrir funciones sin saturar la interfaz;
//   · las 8 entidades compartidas con ids estables y conteos
//     REALES de la BD (nada de datos ficticios);
//   · la búsqueda global sobre fuentes autorizadas;
//   · la ficha de entidad /nucleo?id=vg:<tipo>:<clave> con sus
//     enlaces contextuales;
//   · la frontera de datos: qué es público y qué JAMÁS sale.
// Server-rendered e indexable; la única pieza client es la isla
// de búsqueda (dieta de la casa).
// ============================================================

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vanguard-kq9r.vercel.app";

export const metadata: Metadata = {
  title: "EL NÚCLEO — el mapa que conecta todo Vanguard",
  description:
    "El censo completo de módulos de Vanguard: redacción, mundo, simulación, comunidad y sistema. Búsqueda global sobre fuentes autorizadas, entidades conectadas y enlaces contextuales entre páginas.",
  alternates: { canonical: `${SITE_URL}/nucleo` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/nucleo`,
    title: "EL NÚCLEO — el mapa que conecta todo Vanguard",
    description:
      "Cada módulo, cada entidad, cada conexión de la casa: búsqueda global, fichas de entidad y enlaces contextuales. Nada privado, nada inventado.",
    siteName: "VANGUARD — Conflictos Mundiales en Tiempo Real",
    locale: "es_ES",
    images: [{ url: `${SITE_URL}/api/og`, width: 1200, height: 630, alt: "EL NÚCLEO de Vanguard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EL NÚCLEO — el mapa que conecta todo Vanguard",
    description: "El censo de módulos, las entidades compartidas y la búsqueda global de la casa.",
  },
};

const NOMBRE_CATEGORIA: Record<string, string> = {
  REDACCION: "LA REDACCIÓN — leer la guerra",
  MUNDO: "EL MUNDO — el planeta vigilado",
  SIMULACION: "LA SIMULACIÓN — vivir la guerra",
  COMUNIDAD: "LA COMUNIDAD — la gente manda",
  SISTEMA: "EL SISTEMA — la casa",
};

const SELLO_PERMISO: Record<string, string> = {
  cuenta: "CON CUENTA",
  dueno: "DUEÑO",
};

async function conteosReales() {
  const desde = new Date(Date.now() - 24 * 3600_000);
  const vacio = {
    cablesTotal: 0,
    cables24h: 0,
    paisesConCables: 0,
    mediosUnicos: 0,
    audiosTotal: 0,
    verifTotal: 0,
  };
  try {
    const [cablesTotal, cables24h, paisesRows, mediosRows, audiosTotal, verifTotal] =
      await Promise.all([
        db.newsItem.count(),
        db.newsItem.count({
          where: { publishedAt: { gte: desde }, externalId: { not: { startsWith: "curated-" } } },
        }),
        db.newsItem.findMany({ distinct: ["sourceCountry"], select: { sourceCountry: true }, take: 600 }),
        db.newsItem.findMany({ distinct: ["source"], select: { source: true }, take: 800 }),
        db.audioComandante.count(),
        db.newsVerify.count(),
      ]);
    return {
      cablesTotal,
      cables24h,
      paisesConCables: paisesRows.filter((r) => r.sourceCountry).length,
      mediosUnicos: mediosRows.length,
      audiosTotal,
      verifTotal,
    };
  } catch {
    return vacio;
  }
}

function TarjetaEntidad({
  tipo,
  cifra,
  detalle,
  ejemplo,
}: {
  tipo: TipoEntidad;
  cifra: string;
  detalle: string;
  ejemplo?: { href: string; etiqueta: string };
}) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900/50 p-4 flex flex-col gap-1">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber/80">
        {ETIQUETA_TIPO[tipo]}
      </p>
      <p className="font-orbitron text-2xl font-black text-zinc-100">{cifra}</p>
      <p className="text-xs text-zinc-400 leading-relaxed flex-1">{detalle}</p>
      {ejemplo && (
        <Link
          href={ejemplo.href}
          className="mt-1 font-mono text-[10px] uppercase tracking-widest text-cyan-hud hover:text-amber"
        >
          {ejemplo.etiqueta} ▸
        </Link>
      )}
    </div>
  );
}

/** La ficha de entidad renderizada (server). */
function Ficha({ ficha }: { ficha: FichaEntidad }) {
  if (!ficha.ok || !ficha.entidad) {
    return (
      <section className="mt-8 rounded-md border border-red-hud/40 bg-red-hud/5 p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-red-hud">
          ENTIDAD NO ENCONTRADA
        </p>
        <p className="mt-2 text-sm text-zinc-300">{ficha.error}</p>
        <p className="mt-1 font-mono text-[10px] text-zinc-500">
          Fórmula estable: vg:&lt;tipo&gt;:&lt;clave&gt; — tipos: {TIPOS_ENTIDAD.join(" · ")}
        </p>
      </section>
    );
  }
  const ent = ficha.entidad;
  const f = ficha;
  return (
    <section className="mt-8 rounded-md border border-amber-hud/50 bg-zinc-900/60 p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber/80">
        FICHA DE ENTIDAD · {ETIQUETA_TIPO[ent.tipo]}
      </p>
      <h2 className="mt-1 font-orbitron text-xl sm:text-2xl font-black text-zinc-100 break-words">
        {ent.nombre}
      </h2>
      {f.descripcion && (
        <p className="mt-2 text-sm text-zinc-300 leading-relaxed">{f.descripcion}</p>
      )}
      {f.meta && f.meta.length > 0 && (
        <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
          {f.meta.map((m) => (
            <div key={m.k} className="flex gap-2 text-xs">
              <dt className="font-mono uppercase tracking-widest text-zinc-500 shrink-0">{m.k}</dt>
              <dd className="text-zinc-200">{m.v}</dd>
            </div>
          ))}
        </dl>
      )}
      {f.cables && f.cables.length > 0 && (
        <div className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-cyan-hud/80">
            CABLES REALES RELACIONADOS
          </p>
          <ul className="mt-1.5 space-y-1.5">
            {f.cables.map((c) => (
              <li key={c.ruta}>
                <Link href={c.ruta} className="text-xs text-zinc-300 hover:text-amber leading-snug">
                  <span className="text-zinc-500 font-mono text-[10px] mr-1.5">
                    {c.fecha.slice(0, 10)}
                  </span>
                  {c.titulo}
                  <span className="text-zinc-500 font-mono text-[10px] ml-1.5">· {c.fuente}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {f.enlaces && <EnlacesNucleo enlaces={f.enlaces} titulo="CONECTA CON EL NÚCLEO" />}
      {f.vive && (
        <p className="mt-3 font-mono text-[9px] uppercase tracking-widest text-zinc-600">
          vive en: {f.vive}
        </p>
      )}
    </section>
  );
}

export default async function NucleoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; id?: string }>;
}) {
  const sp = await searchParams;
  const qInicial = typeof sp.q === "string" ? sp.q.slice(0, 64) : "";
  const idEnt = typeof sp.id === "string" ? sp.id.slice(0, 80) : "";

  const [conteos, ficha] = await Promise.all([
    conteosReales(),
    idEnt ? fichaEntidad(idEnt) : Promise.resolve(null),
  ]);

  const docsCatalogo =
    EXPEDIENTES.length + TEORIAS.length + ARMAS.length + CIVILIZACIONES.length + DOCS.length;
  const mapas = MODULOS_NUCLEO.filter((m) => m.idEntidadComo?.startsWith("vg:mapa:")).length;
  const simulaciones = MODULOS_NUCLEO.filter((m) => m.idEntidadComo?.startsWith("vg:simulacion:")).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "EL NÚCLEO — el mapa que conecta todo Vanguard",
    description:
      "Censo de módulos, entidades compartidas y búsqueda global de Vanguard sobre fuentes autorizadas.",
    url: `${SITE_URL}/nucleo`,
    isPartOf: { "@type": "WebSite", name: "VANGUARD", url: SITE_URL },
    about: `${MODULOS_NUCLEO.length} módulos registrados en ${FUENTES_PUBLICAS.length} fuentes públicas`,
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSeguro(jsonLd) }}
      />

      <div className="border-b border-zinc-800 bg-zinc-900/60">
        <div className="max-w-5xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="font-mono text-[11px] uppercase tracking-widest text-amber-400 hover:text-amber-300"
          >
            ◉ VANGUARD
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-600 truncate">
            {APP_VERSION_LABEL}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-10">
        {/* HERO */}
        <header className="text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-red-300">
            Todo conectado — nada aislado
          </div>
          <h1 className="mt-3 font-orbitron text-3xl sm:text-5xl font-black tracking-wide text-zinc-100">
            EL <span className="text-amber">NÚCLEO</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            El salón central de la casa: {MODULOS_NUCLEO.length} módulos registrados,
            {" "}{TIPOS_ENTIDAD.length} tipos de entidad con identificadores estables y una
            búsqueda que solo pregunta a fuentes autorizadas. Cada página conecta con las
            demás — <strong className="text-zinc-200">nadie queda aislado</strong>.
          </p>
        </header>

        {/* FICHA DE ENTIDAD (?id=) */}
        {ficha && <Ficha ficha={ficha} />}

        {/* BÚSQUEDA GLOBAL */}
        <section className="mt-10" aria-label="Búsqueda global">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber/70">
            LA BÚSQUEDA GLOBAL
          </p>
          <p className="mt-1 text-xs text-zinc-500 mb-3">
            Pregunta a las {FUENTES_PUBLICAS.length} fuentes públicas a la vez. Las fuentes
            privadas (cuentas, perfiles, telemetría, chat) no existen para la búsqueda.
          </p>
          <NucleoBusqueda consultaInicial={qInicial} />
        </section>

        {/* MAPA DE ENTIDADES */}
        <section className="mt-10" aria-label="Mapa de entidades">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber/70">
            EL MAPA DE ENTIDADES — conteos reales, cero decoración
          </p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <TarjetaEntidad
              tipo="pais"
              cifra={`${PAISES_ATLAS.length + conteos.paisesConCables}`}
              detalle={`${PAISES_ATLAS.length} fichas del atlas + ${conteos.paisesConCables} países detectados en los cables`}
              ejemplo={{ href: "/nucleo?id=vg:pais:ua", etiqueta: "ficha de Ucrania" }}
            />
            <TarjetaEntidad
              tipo="region"
              cifra={`${Object.keys(TEATROS).length}`}
              detalle="Teatros de guerra con página propia y cables en vivo"
              ejemplo={{ href: "/nucleo?id=vg:region:ukraine", etiqueta: "ficha del frente" }}
            />
            <TarjetaEntidad
              tipo="acontecimiento"
              cifra={conteos.cablesTotal.toLocaleString("es")}
              detalle={`${conteos.cables24h} cables reales en las últimas 24 h — cada uno con su página`}
              ejemplo={{ href: "/en-vivo", etiqueta: "la sala en vivo" }}
            />
            <TarjetaEntidad
              tipo="documento"
              cifra={`${docsCatalogo + conteos.audiosTotal}`}
              detalle={`${docsCatalogo} piezas del archivo y la oscura + ${conteos.audiosTotal} audios de la emisora`}
            />
            <TarjetaEntidad
              tipo="fuente"
              cifra={`${conteos.mediosUnicos}`}
              detalle="Medios reales que firman los cables del archivo"
            />
            <TarjetaEntidad
              tipo="mapa"
              cifra={`${mapas}`}
              detalle="Mapas del sistema: el globo en vivo y el planeta vigilado"
              ejemplo={{ href: "/nucleo?id=vg:mapa:mundo", etiqueta: "ficha del mapa" }}
            />
            <TarjetaEntidad
              tipo="analisis"
              cifra={`${conteos.verifTotal}`}
              detalle="Titulares puestos a prueba en la verdad cruda"
            />
            <TarjetaEntidad
              tipo="simulacion"
              cifra={`${simulaciones}`}
              detalle="Simulaciones registradas: frentes 3D y la ciudad en directo"
              ejemplo={{ href: "/nucleo?id=vg:simulacion:ver-guerra", etiqueta: "ficha de la sim" }}
            />
          </div>
        </section>

        {/* CENSO DE MÓDULOS */}
        <section className="mt-12" aria-label="Censo de módulos">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber/70">
            EL CENSO DE MÓDULOS — {MODULOS_NUCLEO.length} puertas vivas
          </p>
          <div className="mt-3 space-y-6">
            {modulosPorCategoria().map((grupo) => (
              <div key={grupo.categoria}>
                <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-800 pb-1.5">
                  {NOMBRE_CATEGORIA[grupo.categoria] ?? grupo.categoria}
                </h2>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {grupo.modulos.map((m) => (
                    <article
                      key={m.id}
                      className="rounded-md border border-zinc-800 bg-zinc-900/50 p-4 flex flex-col"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-zinc-100">{m.nombre}</h3>
                        <span className="shrink-0 flex gap-1">
                          <span className="rounded-sm border border-emerald-500/40 text-emerald-400 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest">
                            {m.estado}
                          </span>
                          <span
                            className={`rounded-sm border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest ${
                              m.permiso === "publico"
                                ? "border-zinc-600 text-zinc-400"
                                : "border-amber-500/40 text-amber"
                            }`}
                          >
                            {m.permiso === "publico" ? "LIBRE" : SELLO_PERMISO[m.permiso]}
                          </span>
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-amber/70">
                        {m.lema}
                      </p>
                      <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed flex-1">
                        {m.descripcion}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Link
                          href={m.ruta}
                          className="font-mono text-[10px] uppercase tracking-widest text-cyan-hud hover:text-amber"
                        >
                          {m.ruta} ▸
                        </Link>
                        {m.dependencias.map((d) =>
                          d.startsWith("mod:") && moduloPorId(d) ? (
                            <Link
                              key={d}
                              href={moduloPorId(d)!.ruta}
                              title={`depende de ${d}`}
                              className="rounded-sm border border-zinc-700 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-zinc-500 hover:text-amber hover:border-amber-hud"
                            >
                              {moduloPorId(d)!.nombre}
                            </Link>
                          ) : (
                            <span
                              key={d}
                              title={`fuente de datos: ${d}`}
                              className="rounded-sm border border-zinc-800 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-zinc-600"
                            >
                              {d}
                            </span>
                          )
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LA FRONTERA DE DATOS */}
        <section className="mt-12" aria-label="Frontera de datos">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber/70">
            LA FRONTERA DE DATOS — declarada, no escondida
          </p>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">
                FUENTES PÚBLICAS — alimentan la búsqueda
              </p>
              <ul className="mt-2 space-y-1">
                {FUENTES_PUBLICAS.map((f) => (
                  <li key={f.id} className="text-xs text-zinc-300">
                    <span className="font-mono text-[10px] text-zinc-500">{f.id}</span> · {f.nombre}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border border-red-hud/30 bg-red-hud/5 p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-red-hud">
                FUENTES PRIVADAS — jamás salen por búsqueda ni API
              </p>
              <ul className="mt-2 space-y-1">
                {FUENTES_PRIVADAS.map((f) => (
                  <li key={f.id} className="text-xs text-zinc-400">
                    <span className="font-mono text-[10px] text-zinc-600">{f.id}</span> · {f.nombre}
                    <span className="block text-[11px] text-zinc-600">{f.descripcion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CÓMO EXTENDER */}
        <section className="mt-12 mb-4" aria-label="Cómo extender">
          <div className="rounded-md border border-zinc-800 bg-zinc-900/50 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber/70">
              AÑADIR UN MÓDULO NUEVO — sin tocar todo el sistema
            </p>
            <ol className="mt-2 space-y-1.5 text-xs text-zinc-300 list-decimal list-inside">
              <li>
                Regístralo en el censo: <code className="text-amber">src/lib/nucleo/registro.ts</code>{" "}
                (id, nombre, categoría, ruta, permiso, estado, dependencias).
              </li>
              <li>
                Si publica datos, declara su fuente en{" "}
                <code className="text-amber">src/lib/nucleo/fuentes.ts</code> y añade un proveedor
                en <code className="text-amber">busqueda.ts</code> — la frontera lo admite si es pública.
              </li>
              <li>
                Si produce entidades, úsalas con{" "}
                <code className="text-amber">idEntidad(tipo, clave)</code> y, si conecta, añade sus
                enlaces en <code className="text-amber">relaciones.ts</code>.
              </li>
              <li>
                Añade su caso a <code className="text-amber">scripts/pruebas-nucleo.mjs</code> y
                pásalo: el censo se verifica solo (rutas, ids, dependencias).
              </li>
            </ol>
            <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-zinc-600">
              guía completa: src/lib/nucleo/README.md
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
