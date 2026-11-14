"use client";

// v400.0 — la foto de cada nota. Si el medio no trae foto o falla al cargar,
// se pinta el color de su región con el nombre de la región: JAMÁS una foto
// de archivo que no casa con la noticia (adiós F-16 en unas elecciones).
import { useState } from "react";
import { REGIONES, type Region } from "@/lib/portada/clasificar";

export function Foto({
  src,
  alt,
  region,
  prioridad = false,
}: {
  src: string | null;
  alt: string;
  region: Region;
  prioridad?: boolean;
}) {
  const [fallo, setFallo] = useState(false);
  const reg = REGIONES[region] ?? REGIONES.mundo;
  if (!src || fallo) {
    return (
      <div className="vx-sinfoto" style={{ ["--vx-reg" as string]: reg.color }} aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
        <span>{reg.nombre}</span>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="vx-foto"
      src={src}
      alt={alt}
      loading={prioridad ? "eager" : "lazy"}
      fetchPriority={prioridad ? "high" : "auto"}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFallo(true)}
    />
  );
}
