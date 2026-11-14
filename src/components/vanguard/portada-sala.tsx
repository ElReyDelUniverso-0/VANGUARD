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

// v401.0 LA FUSIÓN — la portada de sala viste el mismo uniforme que la portada
// principal: héroe con esquinas de mira, líneas de barrido y sellos de cable;
// título en Orbitron de oro; cifras como instrumentos con rombo; índice en
// chips tácticos; resumen en tarjetas de frente. Clases .vx-ps-* en piel.css.
// La API (props) no cambia: todas las salas que ya la usan se visten solas.

function coordsDe(texto: string): string {
  // un número de expediente estable por sala (no es un dato: es una firma)
  let h = 0;
  for (let i = 0; i < texto.length; i++) h = (h * 31 + texto.charCodeAt(i)) >>> 0;
  return String(h % 10000).padStart(4, "0");
}

export function PortadaSala({
  imagen,
  alt,
  volanta,
  titulo,
  sumario,
  cifras = [],
  puntos = [],
  anclas = [],
  acento = "#e8c56a",
  nota,
  ancho = 1408,
  alto = 704,
  prioritaria = true,
  nivel = "h1",
}: PortadaSalaProps) {
  const acc = /^#[0-9a-fA-F]{6}$/.test(acento) ? acento : "#e8c56a";
  const exp = coordsDe(titulo);

  return (
    <section className="vx-ps" aria-labelledby="portada-sala-titulo" style={{ ["--ps-acc" as string]: acc }}>
      <div className="vx-ps-heroe vx-mira">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imagen}
          alt={alt}
          width={ancho}
          height={alto}
          {...(prioritaria ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
          decoding="async"
          className="vx-ps-img"
        />
        <div className="vx-ps-velo" aria-hidden />
        <div className="vx-ps-sellos" aria-hidden>
          <span>
            <b>◆ EXPEDIENTE {exp}</b> · CLASIFICACIÓN ABIERTA
          </span>
          <span>VANGUARD · SALA</span>
        </div>
        <div className="vx-ps-txt">
          <span className="vx-ps-volanta">
            <i aria-hidden /> {volanta}
          </span>
          {nivel === "h1" ? (
            <h1 id="portada-sala-titulo" className="vx-ps-titulo">
              {titulo}
            </h1>
          ) : (
            <p id="portada-sala-titulo" className="vx-ps-titulo">
              {titulo}
            </p>
          )}
          <p className="vx-ps-sumario">{sumario}</p>
        </div>
      </div>

      {cifras.length > 0 && (
        <div className="vx-ps-cifras">
          {cifras.slice(0, 4).map((c) => (
            <div key={c.etiqueta} className="vx-ps-cifra">
              <b>{c.valor}</b>
              <span>{c.etiqueta}</span>
              {c.nota && <small>{c.nota}</small>}
            </div>
          ))}
        </div>
      )}

      {anclas.length > 0 && (
        <nav aria-label="Índice de la sala" className="vx-ps-anclas">
          <span>Ir a</span>
          {anclas.map((a) => (
            <Link key={a.href} href={a.href}>
              {a.etiqueta}
            </Link>
          ))}
        </nav>
      )}

      {puntos.length > 0 && (
        <div className="vx-ps-puntos">
          {puntos.slice(0, 4).map((p, i) => (
            <article key={p.titulo} className="vx-ps-punto vx-mira">
              <div>
                <b>{String(i + 1).padStart(2, "0")}</b>
                <h2>{p.titulo}</h2>
              </div>
              <p>{p.texto}</p>
            </article>
          ))}
        </div>
      )}

      {nota && <p className="vx-ps-nota">{nota}</p>}
    </section>
  );
}
