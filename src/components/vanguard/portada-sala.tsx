// ============================================================
// v367.10 LA PORTADA DE SALA (components/vanguard/portada-sala.tsx)
//
// Orden del Dueño, textual: «no debe sentirse como un libro, sino como un
// centro interactivo de información mundial» — «más imágenes y menos bloques
// interminables de texto, profundización opcional».
//
// El AGENTE 7 de la auditoría midió dónde dolía y lo dejó escrito: /servicios
// servía 55.490 letras con CERO imágenes, /rostros 48.303 con cero, /atlas
// 31.029 con cero… La mediana de la casa era de 1.768 letras por elemento
// visual. Estas salas no son malas: son «de libro».
//
// Esta pieza NO inventa imágenes ni datos. Reutiliza lo que la casa YA tiene
// (las 120 portadas de /public/ilustraciones, que viajan en el repositorio
// desde versiones atrás) y las cifras que cada sala ya calcula. Su único
// trabajo es poner arriba, en una sola banda:
//   ① una PORTADA grande (1408×704 reales, declarados: nunca se miente de
//      dimensiones — lección v247),
//   ② el título y un SUMARIO de dos líneas (el resto del texto queda debajo,
//      intacto: profundización opcional),
//   ③ las CIFRAS de la sala en tarjetas (resumen visual en vez de párrafo),
//   ④ un ÍNDICE rápido de anclas para brincar a lo que se quiera leer.
//
// Es un componente de SERVIDOR a propósito: cero JavaScript, cero hidratación,
// cero presupuesto de cliente. La portada se sirve en el HTML; las cifras se
// calculan en el render; nada de esto puede romper una sala que ya funciona
// (regla #1 del Dueño: reparar y mejorar sin destruir lo existente).
// ============================================================

import Link from "next/link";

export type CifraPortada = { valor: string | number; etiqueta: string; nota?: string };
export type PuntoPortada = { titulo: string; texto: string };
export type AnclaPortada = { etiqueta: string; href: string };

export interface PortadaSalaProps {
  /** ruta REAL de una imagen que ya vive en public/ (p. ej. /ilustraciones/mapa.jpg) */
  imagen: string;
  /** descripción de la imagen para quien no la ve (obligatoria, honestidad v239) */
  alt: string;
  /** línea pequeña de encima del título: «SERVICIOS · RED MUNDIAL» */
  volanta: string;
  /** el título grande de la sala (una línea, corto) */
  titulo: string;
  /** dos líneas de sumario: lo que un lector necesita para saber qué hay aquí */
  sumario: string;
  /** cifras ya calculadas por la sala (nunca escritas a mano aquí) */
  cifras?: CifraPortada[];
  /** resumen visual: 2-4 tarjetas cortas en lugar de párrafos */
  puntos?: PuntoPortada[];
  /** índice rápido: anclas a las secciones de la propia página */
  anclas?: AnclaPortada[];
  /** acento hex de la sala (regla de oro v73) */
  acento?: string;
  /** nota de fuente al pie de la portada */
  nota?: string;
  /** dimensiones reales del archivo — por defecto las de las ilustraciones de la casa */
  ancho?: number;
  alto?: number;
  /** true si la portada es el LCP de la página (carga prioritaria) */
  prioritaria?: boolean;
  /** "h1" cuando la sala no tiene título principal; "p" si ya lo tiene (una sola h1 por página) */
  nivel?: "h1" | "p";
}

const TITULO_CLASE =
  "font-mono text-3xl font-black uppercase leading-[0.95] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] sm:text-5xl";

export function PortadaSala({
  imagen,
  alt,
  volanta,
  titulo,
  sumario,
  cifras = [],
  puntos = [],
  anclas = [],
  acento = "#38bdf8",
  nota,
  ancho = 1408,
  alto = 704,
  prioritaria = true,
  nivel = "h1",
}: PortadaSalaProps) {
  const acc = /^#[0-9a-fA-F]{6}$/.test(acento) ? acento : "#38bdf8";

  return (
    <section className="relative border-b border-slate-800 bg-slate-950" aria-labelledby="portada-sala-titulo">
      {/* ── ① LA PORTADA: la imagen manda, el velo la hace legible ── */}
      <div className="relative h-[300px] w-full overflow-hidden sm:h-[380px] lg:h-[440px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imagen}
          alt={alt}
          width={ancho}
          height={alto}
          {...(prioritaria ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* dos velos: uno vertical para el texto y uno de color de la sala */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/10" />
        <div
          className="absolute inset-0 opacity-40 mix-blend-soft-light"
          style={{ background: `radial-gradient(120% 90% at 15% 100%, ${acc}66 0%, transparent 60%)` }}
        />

        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-end px-5 pb-8">
          <div
            className="mb-3 inline-flex w-fit items-center gap-2 self-start rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em]"
            style={{ borderColor: `${acc}66`, color: acc, backgroundColor: `${acc}14` }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: acc }} />
            {volanta}
          </div>

          {nivel === "h1" ? (
            <h1 id="portada-sala-titulo" className={TITULO_CLASE}>
              {titulo}
            </h1>
          ) : (
            <p id="portada-sala-titulo" className={TITULO_CLASE}>
              {titulo}
            </p>
          )}

          <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-slate-300 sm:text-[15px]">{sumario}</p>
        </div>
      </div>

      {/* ── ③ LAS CIFRAS: el resumen visual sustituye al párrafo de cifras ── */}
      {cifras.length > 0 && (
        <div className="border-t border-slate-800/70 bg-slate-900/60">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px bg-slate-800/60 px-0 sm:grid-cols-4">
            {cifras.slice(0, 4).map((c) => (
              <div key={c.etiqueta} className="bg-slate-950/70 px-4 py-3">
                <div className="font-mono text-2xl font-black leading-none" style={{ color: acc }}>
                  {c.valor}
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase leading-tight tracking-[0.15em] text-slate-400">
                  {c.etiqueta}
                </div>
                {c.nota && <div className="mt-0.5 text-[10px] leading-tight text-slate-600">{c.nota}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ④ EL ÍNDICE RÁPIDO: brincar a lo que se quiera, sin leerlo todo ── */}
      {anclas.length > 0 && (
        <nav aria-label="Índice de la sala" className="border-t border-slate-800/70 bg-slate-950">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-5 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">ir a</span>
            {anclas.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="rounded-md border border-slate-800 bg-slate-900/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
              >
                {a.etiqueta}
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* ── ② EL RESUMEN: tres tarjetas cortas en vez de tres párrafos ── */}
      {puntos.length > 0 && (
        <div className="border-t border-slate-800/70 bg-slate-950">
          <div className="mx-auto grid max-w-6xl gap-3 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
            {puntos.slice(0, 4).map((p, i) => (
              <article key={p.titulo} className="rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[11px] font-black" style={{ color: acc }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-200">{p.titulo}</h2>
                </div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-slate-400">{p.texto}</p>
              </article>
            ))}
          </div>
        </div>
      )}

      {nota && (
        <div className="border-t border-slate-800/70 bg-slate-950 px-5 py-2">
          <p className="mx-auto max-w-6xl text-[10.5px] leading-relaxed text-slate-600">{nota}</p>
        </div>
      )}
    </section>
  );
}
