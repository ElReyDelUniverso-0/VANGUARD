"use client";

// ═══════════════════════════════════════════════════════════════════
// v405.12 · GUARDAR UN MUNDO EN TU ESPACIO — el puente con la mesa
//
// La misión lo pedía con estas palabras: «no construyas un mundo aislado».
// Este botón es la prueba de que /mundos habla con la mesa de trabajo de
// v405.11: escribe una PIEZA (clase «mapa») en el proyecto activo del
// almacén `vx405.11-espacio` y deja el enlace para saltar a /espacio.
// No escribe en ningún almacén viejo (regla del Dueño).
// ═══════════════════════════════════════════════════════════════════

import { useState } from "react";
import Link from "next/link";
import { añadirElemento, cargar, guardar, proyectoActivo, type ClaseElemento } from "@/lib/espacio/almacen";

export interface GuardarEnEspacioProps {
  iso2: string;
  nombre: string;
  /** clase de pieza de la mesa a la que corresponde lo guardado */
  clase?: ClaseElemento;
  /** a dónde lleva la pieza dentro de la casa (por defecto, su ficha) */
  href?: string;
  /** una línea de contexto que se guarda con la pieza */
  nota?: string;
  /** texto del botón */
  etiqueta?: string;
}

export function GuardarEnEspacio({
  iso2,
  nombre,
  clase = "mapa",
  href,
  nota,
  etiqueta = "Guardar en mi espacio",
}: GuardarEnEspacioProps) {
  const [estado, setEstado] = useState<"listo" | "guardado" | "error">("listo");
  const [proyecto, setProyecto] = useState<string>("");

  function guardarPieza() {
    try {
      const e = cargar();
      const p = proyectoActivo(e);
      const con = añadirElemento(e, p.id, {
        clase,
        titulo: nombre,
        href: href ?? `/mundos/${iso2}`,
        nota: nota ?? `Ficha del país ${nombre} · mapa de los mundos`,
        etiquetas: ["mundos", iso2],
        origen: "manual",
      });
      guardar(con);
      setProyecto(p.nombre);
      setEstado("guardado");
    } catch {
      setEstado("error");
    }
  }

  if (estado === "guardado") {
    return (
      <p className="vx-mm-guardado" role="status">
        Guardado en «{proyecto}» · <Link href="/espacio">abrir mi espacio →</Link>
      </p>
    );
  }
  return (
    <span className="vx-mm-guardar">
      <button type="button" onClick={guardarPieza} className="vx-mm-btn vx-mm-btn--oro">
        ＋ {etiqueta}
      </button>
      {estado === "error" ? <span className="vx-mm-error">No se pudo guardar en este navegador</span> : null}
    </span>
  );
}
