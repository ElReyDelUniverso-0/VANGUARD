"use client";

// ═══════════════════════════════════════════════════════════════════
// v403.7 LA FOTO DEL CABLE — tanda 2 del diagnóstico de noticias.
//
// EL PROBLEMA MEDIDO: en el panel de noticias cada cable traía su escena
// 3D (v110.0) y NADA MÁS. Foto del medio: 0 de 48. Resumen: 0 de 48.
// La casa sabía de qué hablaba el cable, pero el visitante no veía ni la
// cara de la noticia ni una línea que se la contara.
//
// LO QUE SE AÑADE (no se sustituye):
//   ① la foto REAL del medio, servida por /api/foto (redimensionada a
//      320 px y en WebP: la fuente pesa de 34 KB a 3,2 MB, medida hoy);
//   ② el resumen del medio, dos líneas, siempre debajo del titular;
//   ③ el sello «IMAGEN DE ARCHIVO» cuando la foto no es del medio sino
//      del repositorio — la casa no presume de lo que no es suyo;
//   ④ la ESCENA 3D no se pierde: sigue ahí, a un toque, en el botón 3D
//      de la esquina. Y sigue siendo la única imagen cuando el medio no
//      trae foto (cero honesto, no foto de relleno).
// La regla de la casa se cumple en los dos sentidos: se nota que es
// VANGUARD, y ninguna foto miente sobre de dónde viene.
// ═══════════════════════════════════════════════════════════════════
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * La URL de la foto que se pinta. Las del repositorio se sirven tal cual
 * (son locales y ya pesan poco); las del medio pasan por el afinador de
 * /api/foto, que las deja en WebP de 320 px.
 */
export function urlFoto(u: string | null | undefined, w = 320): string | null {
  if (!u) return null;
  if (!/^https?:\/\//i.test(u)) return u;
  return `/api/foto?w=${w}&u=${encodeURIComponent(u)}`;
}

export function PortadaCable({
  foto,
  alt,
  archivo = false,
  escena,
  marco = true,
  className,
}: {
  /** URL original de la foto (del medio o del repositorio). */
  foto: string | null | undefined;
  alt: string;
  /** true = la foto es del repositorio, no del medio: se rotula. */
  archivo?: boolean;
  /** La escena 3D de la casa (v110.0). Solo se monta si hace falta. */
  escena: ReactNode;
  /** false = ya vive dentro de un marco ajeno (no se pinta el suyo). */
  marco?: boolean;
  className?: string;
}) {
  const afinada = urlFoto(foto, 320);
  // ① el afinador (320 px WebP, mediana 8,5 KB) → ② la foto original del
  // medio en el navegador → ③ la escena 3D. Tres puertas, ninguna mentira:
  // si el medio no tiene foto, no se inventa ninguna.
  const [etapa, setEtapa] = useState<"afinada" | "original" | "escena">(afinada ? "afinada" : "escena");
  const [ver, setVer] = useState<"foto" | "escena">(afinada ? "foto" : "escena");

  const src = etapa === "afinada" ? afinada : etapa === "original" ? (foto ?? null) : null;
  const hayFoto = Boolean(src) && ver === "foto";

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-black/60",
        marco && "hud-corner border border-amber-hud/40",
        className
      )}
    >
      {ver === "foto" && hayFoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src as string}
          alt={alt}
          width={320}
          height={320}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => {
            if (etapa === "afinada" && foto) setEtapa("original");
            else setVer("escena");
          }}
        />
      ) : (
        <div className="absolute inset-0">{escena}</div>
      )}

      {archivo && hayFoto && ver === "foto" && (
        <span className="absolute left-0 top-0 bg-black/70 px-1 py-[1px] font-mono text-[7px] uppercase tracking-wide text-white/80">
          imagen de archivo
        </span>
      )}

      {hayFoto && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setVer((v) => (v === "foto" ? "escena" : "foto"));
          }}
          title={ver === "foto" ? "Ver la escena 3D de este cable" : "Volver a la foto del medio"}
          className={cn(
            "absolute bottom-0 right-0 px-1 py-[1px] font-mono text-[7px] uppercase tracking-wide",
            ver === "foto"
              ? "bg-black/70 text-amber hover:bg-amber-hud/40"
              : "bg-amber-hud/70 text-black hover:bg-amber"
          )}
        >
          {ver === "foto" ? "3d" : "foto"}
        </button>
      )}
    </div>
  );
}

/**
 * El resumen del medio, dos líneas. Si el medio no lo trae, no se pinta
 * nada: la casa no rellena con texto inventado.
 */
export function ResumenCable({ texto }: { texto: string | null | undefined }) {
  const t = (texto ?? "").trim();
  if (!t) return null;
  return (
    <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground" title={t}>
      {t}
    </p>
  );
}
