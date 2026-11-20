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
    href: "/cuartel",
    nombre: "Salas",
    detalle: "El Cuartel: todos los mundos de la casa",
    activa: (r: string) => r.startsWith("/cuartel"),
  },
];

const OCULTAS = ["/vanguard2"];

export function Caras() {
  const ruta = usePathname() || "/";
  if (OCULTAS.some((r) => ruta === r || ruta.startsWith(r + "/"))) return null;

  const enRadio = ruta === "/radio" || ruta.startsWith("/radio/");

  return (
    <nav className="vxc" aria-label="Las dos caras de la casa">
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
