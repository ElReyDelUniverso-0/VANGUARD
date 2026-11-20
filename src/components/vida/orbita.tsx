"use client";

// ═══════════════════════════════════════════════════════════════════
// v421.9 · LA ÓRBITA — un menú que se siente como abrir una consola
//
// QUÉ ES: un botón flotante que despliega los módulos REALES de la casa
// (los mismos de modulos.ts) con su color y su entrada animada. No sustituye
// a la cabecera ni a la barra adaptativa del agente 03: convive con ellas y
// da una segunda puerta, siempre a un toque, en cualquier sala.
//
// REGLAS: los href salen del registro (ni una URL a mano); se cierra con Esc,
// con un toque fuera o al elegir; y no aparece en /vanguard2, que por mandato
// de la casa es un universo 3D sin capas 2D encima.
// ═══════════════════════════════════════════════════════════════════
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MODULOS } from "@/components/portada/modulos";

const PALETA = ["#7c5cff", "#22d3ee", "#ff4d8d", "#ffd166", "#34d399", "#f472b6", "#38bdf8", "#a78bfa", "#fb923c", "#4ade80"];

const EXTRAS = [
  { id: "mi-universo", nombre: "Mi universo", href: "/mi-universo" },
  { id: "arquitectura", nombre: "La arquitectura", href: "/navegacion" },
  { id: "mesa", nombre: "Mi mesa de trabajo", href: "/espacio" },
];

type Entrada = { id: string; nombre: string; href: string; acento: string };

const ENTRADAS: Entrada[] = [
  ...MODULOS.map((m, i) => ({ id: m.id, nombre: m.nombre, href: m.nav, acento: PALETA[i % PALETA.length] })),
  ...EXTRAS.map((e, i) => ({ ...e, acento: PALETA[(MODULOS.length + i) % PALETA.length] })),
];

export function Orbita() {
  const ruta = usePathname();
  const [abierto, setAbierto] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    const fuera = (e: PointerEvent) => {
      if (caja.current && !caja.current.contains(e.target as Node)) setAbierto(false);
    };
    window.addEventListener("keydown", tecla);
    window.addEventListener("pointerdown", fuera);
    return () => {
      window.removeEventListener("keydown", tecla);
      window.removeEventListener("pointerdown", fuera);
    };
  }, [abierto]);

  // la casa inmersiva no lleva capas 2D encima (mandato v151.0)
  if (ruta?.startsWith("/vanguard2")) return null;

  return (
    <div className="vida-orbita" data-abierta={abierto ? "1" : "0"} ref={caja}>
      {abierto && (
        <nav className="vida-orbita-anillo" aria-label="Módulos de Vanguard">
          {ENTRADAS.map((e, i) => (
            <Link
              key={e.id}
              href={e.href}
              onClick={() => setAbierto(false)}
              style={{ animationDelay: `${i * 22}ms` }}
            >
              <span className="vida-orbita-punto" style={{ background: e.acento, boxShadow: `0 0 16px -4px ${e.acento}` }}>
                {e.nombre.charAt(0)}
              </span>
              <span>{e.nombre}</span>
            </Link>
          ))}
        </nav>
      )}

      <button
        type="button"
        className="vida-orbita-boton"
        aria-expanded={abierto}
        aria-label={abierto ? "Cerrar el menú de módulos" : "Abrir el menú de módulos"}
        title={abierto ? "Cerrar" : "Todos los módulos"}
        onClick={() => setAbierto((v) => !v)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="none">
          <circle cx="12" cy="12" r="2.4" fill="currentColor" />
          <circle cx="12" cy="3.6" r="1.7" fill="currentColor" opacity=".95" />
          <circle cx="12" cy="20.4" r="1.7" fill="currentColor" opacity=".95" />
          <circle cx="3.6" cy="12" r="1.7" fill="currentColor" opacity=".7" />
          <circle cx="20.4" cy="12" r="1.7" fill="currentColor" opacity=".7" />
          <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeOpacity=".5" strokeWidth="1.1" strokeDasharray="2 3" />
        </svg>
      </button>
    </div>
  );
}
