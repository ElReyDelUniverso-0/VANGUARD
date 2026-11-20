"use client";
// v432.0 EL TRÁILER — «Vanguard en 80 segundos»: el recorrido completo de la
// casa contado con sus propias pantallas (capturas reales de la web en vivo y
// de la Zona Cero, voz y banda propias). El vídeo no pesa nada hasta que
// alguien pulsa ▶ (preload="none" + póster) y los capítulos saltan al minuto
// exacto de cada sala.
import { useRef, useState } from "react";
import Link from "next/link";
import "./trailer.css";
import { TRAILER_POSTER, TRAILER_SRC } from "./trailer-datos";

const CAPITULOS: { t: number; titulo: string; ruta: string }[] = [
  { t: 0, titulo: "Qué es Vanguard", ruta: "/" },
  { t: 6, titulo: "Noticias en tiempo real", ruta: "/en-vivo" },
  { t: 15.7, titulo: "Guerra Hoy", ruta: "/guerra-hoy" },
  { t: 22.1, titulo: "El globo 3D", ruta: "/mundo" },
  { t: 28.6, titulo: "249 países", ruta: "/mundos" },
  { t: 38.7, titulo: "Lingua", ruta: "/lingua" },
  { t: 45.2, titulo: "Armería y Enciclopedia", ruta: "/armeria" },
  { t: 54.9, titulo: "El Cuartel", ruta: "/cuartel" },
  { t: 61.2, titulo: "Zona Cero", ruta: "/zona-cero" },
];

function mmss(t: number) {
  const s = Math.floor(t);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function TrailerVanguard({ compacto = false }: { compacto?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [actual, setActual] = useState(-1);
  const saltar = (t: number) => {
    const v = ref.current;
    if (!v) return;
    v.currentTime = t;
    void v.play().catch(() => {});
  };
  const alAvanzar = () => {
    const v = ref.current;
    if (!v) return;
    let i = -1;
    for (let k = 0; k < CAPITULOS.length; k++) if (v.currentTime >= CAPITULOS[k].t) i = k;
    if (i !== actual) setActual(i);
  };
  return (
    <div className={compacto ? "vt-trailer vt-compacto" : "vt-trailer"}>
      <div className="vt-pantalla">
        <video
          ref={ref}
          controls
          playsInline
          preload="none"
          poster={TRAILER_POSTER}
          width={1280}
          height={720}
          onTimeUpdate={alAvanzar}
          aria-label="Tráiler de VANGUARD: todo lo que hay en la web, explicado en 80 segundos"
        >
          <source src={TRAILER_SRC} type="video/mp4" />
        </video>
      </div>
      <div className="vt-lado">
        <span className="vt-sello">Tráiler · 1:21 · voz real</span>
        <p className="vt-lema">Todo Vanguard, explicado en ochenta segundos.</p>
        <ol className="vt-capitulos" aria-label="Capítulos del tráiler">
          {CAPITULOS.map((c, i) => (
            <li key={c.t} data-activo={i === actual ? "1" : "0"}>
              <button type="button" onClick={() => saltar(c.t)}>
                <span className="vt-t">{mmss(c.t)}</span>
                <span>{c.titulo}</span>
              </button>
              {!compacto && (
                <Link href={c.ruta} className="vt-ir" aria-label={`Ir a ${c.titulo}`}>
                  Entrar →
                </Link>
              )}
            </li>
          ))}
        </ol>
        <div className="vt-acc">
          {compacto ? (
            <Link href="/trailer" className="vt-btn">Ver con capítulos</Link>
          ) : (
            <Link href="/zona-cero" className="vt-btn">Abrir la Zona Cero</Link>
          )}
          <a className="vt-btn vt-sec" href={TRAILER_SRC} download="vanguard-trailer.mp4">
            Descargar
          </a>
        </div>
      </div>
    </div>
  );
}
