"use client";

// ============================================================
// v110.0 MATRIZ 2100 — PORTADA 3D DE NOTICIA
// "Las noticias no tienen portada" — RESUELTO DE RAÍZ: cada
// cable de Vanguard nace con una portada holográfica viva.
// Cero imágenes externas, cero enlaces, cero portadas vacías:
// la escena se deriva del propio cable (tag + id) y late con
// la casa. Funciona offline: no depende de GDELT ni de nada.
// ============================================================
import { Escena3D, hashDe, type VarianteEscena } from "./escenas-3d";
import { cn } from "@/lib/utils";

const TAG_A_ESCENA: Record<string, { v: VarianteEscena; acc: string }> = {
  MILITAR: { v: "guerra", acc: "#FF3B30" },
  ULTIMA_HORA: { v: "radar", acc: "#FF3B30" },
  FLASH: { v: "radar", acc: "#FF3B30" },
  ECONOMIA: { v: "moneda", acc: "#34C759" },
  MERCADOS: { v: "moneda", acc: "#34C759" },
  DIPLOMACIA: { v: "prisma", acc: "#5EEAD4" },
  CIENCIA: { v: "nucleo", acc: "#A8C7FF" },
  ESPACIO: { v: "orbita", acc: "#A8C7FF" },
  CIBER: { v: "red", acc: "#5EEAD4" },
  INFO: { v: "noticias", acc: "#FF8A2A" },
};

export function escenaDeNoticia(tag: string | null | undefined, id: string): { v: VarianteEscena; acc: string } {
  const t = (tag || "").toUpperCase();
  return TAG_A_ESCENA[t] ?? { v: "noticias", acc: "#FF8A2A" };
}

export function PortadaNoticia({
  id,
  tag,
  className,
  sello = false,
}: {
  id: string;
  tag: string | null | undefined;
  className?: string;
  sello?: boolean;
}) {
  const { v, acc } = escenaDeNoticia(tag, id);
  return (
    <Escena3D
      variante={v}
      acento={acc}
      semilla={hashDe(id)}
      className={cn(className)}
      hijos={sello ? undefined : undefined}
    />
  );
}
