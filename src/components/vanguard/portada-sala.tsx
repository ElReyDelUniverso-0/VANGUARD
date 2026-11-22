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
// v440.0 LA MISMA PORTADA EN TODAS LAS SALAS — el marco nuevo del atlas
import { PORTADAS, fichaDeReserva, fichaPorNombre, huella, paleta, portadaDeRuta } from "@/lib/portadas/atlas";
import { Escena } from "@/components/portada/escena";

export type CifraPortada = { valor: string | number; etiqueta: string; nota?: string };
export type PuntoPortada = { titulo: string; texto: string };
export type AnclaPortada = { etiqueta: string; href: string };

export interface PortadaSalaProps {
  /** ruta REAL de una imagen que ya vive en public/ (p. ej. /imagenes-reales/satelite.jpg) */
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
  /**
   * v440.0 · la ruta de la sala («/historia»). Con ella la portada coge SU ficha
   * del atlas —su color, su técnica y su glifo— y no una de reserva. Si falta,
   * se busca por el título y, en el peor caso, se saca una estable del nombre.
   */
  ruta?: string;
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
  ruta,
}: PortadaSalaProps) {
  const acc = /^#[0-9a-fA-F]{6}$/.test(acento) ? acento : "#e8c56a";
  const exp = coordsDe(titulo);
  // v440.0: la ficha de esta sala en el atlas (por su título, con reserva estable)
  const ficha = (ruta ? portadaDeRuta(ruta) : null) ?? fichaPorNombre(titulo) ?? fichaDeReserva(titulo);
  const pal = paleta(ficha.tono);
  const semilla = huella(ficha.ruta);
  const numero = String(PORTADAS.findIndex((p) => p.ruta === ficha.ruta) + 1).padStart(2, "0");

  return (
    <section className="vx-ps" aria-labelledby="portada-sala-titulo" style={{ ["--ps-acc" as string]: acc }}>
      {/* v440.0 · el marco del atlas: el mismo de las salas nuevas, para que la
          casa entera hable el mismo idioma. La ficha sale del TÍTULO de la
          sala (sin tocar una sola página): su color, su técnica y su glifo. */}
      <div
        className="vp-portada vp-portada--sala"
        data-ficha={ficha.ruta}
        data-tecnica={ficha.tecnica}
        data-foto="1"
        style={
          {
            "--vp-luz": pal.luz,
            "--vp-sombra": pal.sombra,
            "--vp-filo": pal.filo,
            "--vp-fondo": pal.fondo,
          } as React.CSSProperties
        }
      >
        <div className="vp-foto" aria-hidden>
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
        </div>

        <Escena tecnica={ficha.tecnica} paleta={pal} semilla={semilla} glifo={ficha.glifo} conFoto />

        <svg className="vp-marco" viewBox="0 0 1200 520" preserveAspectRatio="none" aria-hidden focusable="false">
          <path d="M18 52V18h34M1148 18h34v34M1182 468v34h-34M52 502H18v-34" fill="none" stroke={pal.filo} strokeWidth="1.6" opacity="0.75" />
          <path d="M18 260h22M1160 260h22" stroke={pal.filo} strokeWidth="1.2" opacity="0.5" />
        </svg>

        <div className="vp-txt">
          <p className="vp-et">
            <span className="vp-v" aria-hidden>V</span>
            <span>VANGUARD</span>
            <i aria-hidden>·</i>
            <span className="vp-num">{volanta || "SALA"}</span>
          </p>
          {nivel === "h1" ? (
            <h1 id="portada-sala-titulo" className="vp-titulo">
              {titulo}
            </h1>
          ) : (
            <p id="portada-sala-titulo" className="vp-titulo">
              {titulo}
            </p>
          )}
          <p className="vp-lema">{sumario}</p>
          <p className="vp-sello">
            <span className="vp-raya" aria-hidden />
            expediente {exp} · {ficha.tecnica} · {ficha.glifo} · sala {numero} de {PORTADAS.length}
          </p>
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
