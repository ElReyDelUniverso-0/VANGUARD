"use client";

// ============================================================
// v401.0 LA FUSIÓN — LA CARCASA DE LOS MÓDULOS
// Orden del Dueño: «cada módulo de Vanguard hacerlo como la portada principal».
// Una sola pieza montada en el layout da a TODAS las salas la misma cabecera
// (marca Orbitron + navegación + reloj UTC/SDQ), el TELETIPO de cables y la
// barra inferior del móvil. Su presencia enciende además la «piel» de la casa
// (src/app/piel.css, selectores body:has(.vx-carcasa)) sobre el contenido viejo.
// Fuera: la portada y /lectura (ya traen la suya) y las salas inmersivas de
// pantalla completa, donde una cabecera estorbaría al lienzo.
// ============================================================
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Cabecera, BarraMovil } from "./cabecera";

const SIN_CARCASA = ["/lectura", "/cuartel", "/clasico", "/vanguard2", "/vertigo", "/teatro-3d", "/universo", "/offline", "/api"];

export function conCarcasa(ruta: string | null): boolean {
  if (!ruta || ruta === "/" || ruta === "/index") return false;
  return !SIN_CARCASA.some((r) => ruta === r || ruta.startsWith(r + "/"));
}

type Cable = { id: string; titulo: string; fecha: string };

function hora(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "America/Santo_Domingo" });
  } catch {
    return "";
  }
}

function TeletipoVivo() {
  const [cables, setCables] = useState<Cable[]>([]);
  useEffect(() => {
    let vivo = true;
    const t = window.setTimeout(() => {
      fetch("/api/portada")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (vivo && d && Array.isArray(d.tele)) setCables(d.tele);
        })
        .catch(() => {});
    }, 400);
    return () => {
      vivo = false;
      window.clearTimeout(t);
    };
  }, []);
  const pista = cables.length ? [...cables, ...cables] : [];
  return (
    <div className="vx-tele" aria-label="Teletipo de última hora">
      <span className="vx-tele-et">
        <span className="vx-punto" /> CABLES
      </span>
      <div className="vx-tele-pista" data-vacia={cables.length ? "0" : "1"}>
        {cables.length === 0 ? (
          <span className="vx-tele-espera">Conectando con la red de corresponsales…</span>
        ) : (
          pista.map((n, i) => (
            <Link
              key={n.id + i}
              href={`/lectura/${n.id}`}
              aria-hidden={i >= cables.length ? true : undefined}
              tabIndex={i >= cables.length ? -1 : undefined}
            >
              <time dateTime={n.fecha} suppressHydrationWarning>{hora(n.fecha)}</time>
              {n.titulo}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export function Carcasa() {
  const ruta = usePathname();
  if (!conCarcasa(ruta)) return null;
  return (
    <div className="vx vx-carcasa">
      <Cabecera />
      <TeletipoVivo />
      <BarraMovil />
    </div>
  );
}
