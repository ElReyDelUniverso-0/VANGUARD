"use client";
// ═══════════════════════════════════════════════════════════════════
// v431.5 · LAS DOS CARAS DE UNA SOLA CASA
//
// LO QUE DIJO EL DUEÑO, textual: «¿por qué no fusionas los dos mundos de
// Vanguard, el Cuartel y la portada, los demás, en uno solo, por qué no lo
// centralizas?».
//
// QUÉ ES ESTO: no es una navegación nueva (la casa tiene una y sólo una, la
// BarraAdaptativa) ni un menú de salas. Es el INTERRUPTOR DE CARA de la misma
// casa: «HOY» es la portada editorial y «SALAS» es el Cuartel. Están al mismo
// nivel, en el mismo sitio de la pantalla, y se cambia de una a otra sin
// sentir que has salido de Vanguard. Las dos caras siguen existiendo con sus
// URLs de siempre (nada se rompe, ningún enlace muerto).
//
// Se oculta en el lienzo puro (/vanguard2) y donde la casa monta su propia
// experiencia a pantalla completa.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import "./caras.css";

const CARAS = [
  {
    id: "hoy",
    href: "/",
    nombre: "Hoy",
    detalle: "La portada: lo que pasa ahora",
    activa: (r: string) => r === "/" || r.startsWith("/noticia") || r.startsWith("/lectura"),
  },
  {
    id: "salas",
    href: "/orden",
    nombre: "Salas",
    detalle: "El orden de batalla: las 156 salas, con su código",
    // v436.0 · la puerta vieja del Cuartel (/cuartel) redirige a /orden: la cara
    // se enciende en las dos, para que no quede apagada entrando por el enlace antiguo.
    activa: (r: string) => r === "/orden" || r.startsWith("/sala/") || r.startsWith("/cuartel"),
  },
];

const OCULTAS = ["/vanguard2"];

/** La ruta de la casa, sin barras de más y con la raíz bien dicha.
 *  En el servidor la raíz llega a veces como "" o "/index"; la portada es "/"
 *  y así se compara (si no, en producción la cara HOY salía apagada). */
function normalizarRuta(bruta: string | null | undefined): string {
  const limpia = (bruta || "/").split("?")[0].split("#")[0].replace(/\/+$/, "");
  if (limpia === "" || limpia === "/index" || /^https?:\/\/[^/]+$/.test(limpia)) return "/";
  return limpia.startsWith("/") ? limpia : `/${limpia}`;
}

export function Caras() {
  const delRouter = normalizarRuta(usePathname());
  // el marcador se corrige en el aparato: la ruta que ve el navegador manda
  // (en producción el servidor no siempre dice "/" para la portada)
  const [ruta, setRuta] = useState(delRouter);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const viva = normalizarRuta(window.location.pathname);
    if (viva !== ruta) setRuta(viva);
  }, [delRouter, ruta]);
  if (OCULTAS.some((r) => ruta === r || ruta.startsWith(r + "/"))) return null;

  const enRadio = ruta === "/radio" || ruta.startsWith("/radio/");

  return (
    <nav className="vxc" aria-label="Las dos caras de la casa" data-ruta={ruta}>
      <span className="vxc-sello" aria-hidden>LA CASA</span>
      {CARAS.map((c) => {
        const activa = c.activa(ruta);
        return (
          <a
            key={c.id}
            href={c.href}
            className={activa ? "vxc-cara vxc-cara--activa" : "vxc-cara"}
            aria-current={activa ? "page" : undefined}
            title={c.detalle}
          >
            {c.nombre}
          </a>
        );
      })}
      <a
        href="/radio"
        className={enRadio ? "vxc-cara vxc-cara--activa vxc-cara--radio" : "vxc-cara vxc-cara--radio"}
        aria-current={enRadio ? "page" : undefined}
        title="La radio: la casa en voz alta"
      >
        Radio
      </a>
    </nav>
  );
}
