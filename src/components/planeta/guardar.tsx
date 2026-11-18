"use client";

// ═══════════════════════════════════════════════════════════════════
// v406.5 · GUARDAR CUALQUIER COSA EN TU ESPACIO — la versión genérica del
// botón de /mundos (guardar-espacio.tsx, que solo sabe de países). Escribe
// una pieza en el proyecto activo del almacén vx405.11-espacio.
// ═══════════════════════════════════════════════════════════════════
import { useState } from "react";
import Link from "next/link";
import { añadirElemento, cargar, guardar, proyectoActivo, type ClaseElemento } from "@/lib/espacio/almacen";

export function GuardarPieza({
  titulo,
  href,
  nota,
  clase = "investigacion",
  etiquetas = [],
  etiqueta = "Guardar en mi espacio",
  compacto = false,
}: {
  titulo: string;
  href: string;
  nota: string;
  clase?: ClaseElemento;
  etiquetas?: string[];
  etiqueta?: string;
  compacto?: boolean;
}) {
  const [estado, setEstado] = useState<"listo" | "guardado" | "error">("listo");
  const [proyecto, setProyecto] = useState("");

  function guardarla() {
    try {
      const e = cargar();
      const p = proyectoActivo(e);
      guardar(añadirElemento(e, p.id, { clase, titulo, href, nota, etiquetas: ["planeta", ...etiquetas], origen: "manual" }));
      setProyecto(p.nombre);
      setEstado("guardado");
    } catch {
      setEstado("error");
    }
  }

  if (estado === "guardado") {
    return (
      <span className="vx-pl-ok" role="status">
        Guardado en «{proyecto}» · <Link href="/espacio" style={{ color: "inherit" }}>abrir mi espacio →</Link>
      </span>
    );
  }
  return (
    <span>
      {compacto ? (
        <button type="button" onClick={guardarla}>＋ espacio</button>
      ) : (
        <button type="button" onClick={guardarla} className="vx-pl-btn vx-pl-btn--oro">
          ＋ {etiqueta}
        </button>
      )}
      {estado === "error" ? <span className="vx-pl-ok" style={{ color: "#ff6b7a" }}> No se pudo guardar en este navegador</span> : null}
    </span>
  );
}
