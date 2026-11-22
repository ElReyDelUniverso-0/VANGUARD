"use client";

// ═══════════════════════════════════════════════════════════════════
// v439.4 · LA PORTADA DE CADA SALA
//
// Se monta UNA vez en el layout y no pinta nada donde no debe: lee la ruta,
// busca su ficha en el atlas y, si esa sala aún no tenía portada propia, le
// pone la suya — la de su color, su técnica, su glifo y su lema.
//
// No hay dos iguales: el dibujo sale de la semilla de la ruta (huella FNV) y
// los doce dibujos del escena.tsx son doce maneras distintas de mirar.
// Si la ficha trae fotografía, la foto va detrás como atmósfera y el dibujo
// encima como estructura (el «mixto» que pidió el Dueño).
// ═══════════════════════════════════════════════════════════════════

import { usePathname } from "next/navigation";
import { PORTADAS, huella, paleta, portadaDeRuta, type FichaPortada } from "@/lib/portadas/atlas";
import { Escena } from "./escena";

/**
 * La portada de UNA sala, ya dibujada. Vive separada de la que lee la ruta
 * para poder montarla también en la portada de los módulos, en una entrega
 * impresa o en la prueba, sin depender del navegador.
 */
export function PortadaSala({ ficha }: { ficha: FichaPortada }) {
  const pal = paleta(ficha.tono);
  const semilla = huella(ficha.ruta);
  const numero = String(PORTADAS.findIndex((p) => p.ruta === ficha.ruta) + 1).padStart(2, "0");

  return (
    <section
      className="vp-portada"
      data-tecnica={ficha.tecnica}
      data-foto={ficha.imagen ? "1" : "0"}
      style={
        {
          "--vp-luz": pal.luz,
          "--vp-sombra": pal.sombra,
          "--vp-filo": pal.filo,
          "--vp-fondo": pal.fondo,
        } as React.CSSProperties
      }
      aria-label={`Portada del módulo ${ficha.nombre}`}
    >
      {ficha.imagen ? (
        <div className="vp-foto" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ficha.imagen} alt="" loading="lazy" decoding="async" />
        </div>
      ) : null}

      <Escena tecnica={ficha.tecnica} paleta={pal} semilla={semilla} glifo={ficha.glifo} conFoto={Boolean(ficha.imagen)} />

      {/* el marco de la casa: esquinas, filetes y numeración */}
      <svg className="vp-marco" viewBox="0 0 1200 520" preserveAspectRatio="none" aria-hidden focusable="false">
        <path d="M18 52V18h34M1148 18h34v34M1182 468v34h-34M52 502H18v-34" fill="none" stroke={pal.filo} strokeWidth="1.6" opacity="0.75" />
        <path d="M18 260h22M1160 260h22" stroke={pal.filo} strokeWidth="1.2" opacity="0.5" />
      </svg>

      <div className="vp-txt">
        <p className="vp-et">
          <span className="vp-v" aria-hidden>
            V
          </span>
          <span>VANGUARD</span>
          <i aria-hidden>·</i>
          <span className="vp-num">SALA {numero} / {PORTADAS.length}</span>
        </p>
        <h2 className="vp-titulo">{ficha.nombre}</h2>
        <p className="vp-lema">{ficha.lema}</p>
        <p className="vp-sello">
          <span className="vp-raya" aria-hidden />
          {ficha.tecnica} · {ficha.glifo} · la casa lo dibuja, nadie lo descarga
        </p>
      </div>
    </section>
  );
}

/** La que se monta en el layout: busca la ficha de la ruta y, si toca, la pinta. */
export function PortadaRuta() {
  const ruta = usePathname();
  const ficha = portadaDeRuta(ruta);
  if (!ficha || !ficha.auto) return null;
  return <PortadaSala ficha={ficha} />;
}
