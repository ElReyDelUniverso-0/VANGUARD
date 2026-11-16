"use client";

// v400.0 LA CABECERA ÚNICA — de 4 barras + cinta de contadores a UNA barra
// de 64 px. Se esconde al bajar y vuelve al subir (como BBC / The Verge).
// Las monedas, gemas, racha y nivel viven ahora dentro de Juego y Perfil.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoVanguard } from "./logo";
import { Reloj } from "./reloj";
import { MODULOS_PUBLICOS, entradaDe, moduloDe } from "./modulos";
import { IcoInicio, IcoJuego, IcoMapa, IcoModulos, IcoVivo } from "./iconos";
// v403.8 LA PUERTA: el buscador universal (⌘K) llega por fin a la cabecera
// viva. Busca las 155 salas del cuartel, las 46 puertas de los módulos y los
// cables en vivo. Antes el icono de lupa llevaba a /guerra-hoy: una lupa que
// no buscaba. Ahora busca.
import { BuscadorUniversal } from "@/components/vanguard/buscador-universal";

// v402.6 LOS NUEVE MÓDULOS — la cabecera lee los módulos de modulos.ts
// (la portada está en el logo: ocho módulos caben en una sola fila)
export const NAV = [
  ...MODULOS_PUBLICOS.map((m) => ({ href: entradaDe(m), label: m.corto })),
];

// v402 — cada sala cuelga de uno de los cinco módulos (fuente única: modulos.ts)
function activo(ruta: string, href: string) {
  const m = moduloDe(ruta);
  if (href === "/") return !m && (ruta === "/" || ruta.startsWith("/lectura"));
  // la pestaña Módulos se enciende en /modulos y en los módulos nuevos (sin botón propio)
  if (href === "/modulos") return ruta === "/modulos" || (!!m && entradaDe(m).startsWith("/modulo/"));
  if (m) return entradaDe(m) === href;
  return ruta === href || ruta.startsWith(href + "/");
}

export function Cabecera({ ruta: rutaFija }: { ruta?: string } = {}) {
  const actual = usePathname();
  const ruta = rutaFija ?? (actual === "/index" ? "/" : actual) ?? "/";
  const [oculta, setOculta] = useState(false);
  const ultimo = useRef(0);

  // la casa nueva respira: señal de vida para la cortina/vigía del layout
  useEffect(() => {
    (window as unknown as { __vgvivo?: boolean }).__vgvivo = true;
  }, []);

  useEffect(() => {
    const alMover = () => {
      const y = window.scrollY;
      const d = y - ultimo.current;
      if (Math.abs(d) < 6) return;
      setOculta(d > 0 && y > 140);
      ultimo.current = y;
    };
    window.addEventListener("scroll", alMover, { passive: true });
    return () => window.removeEventListener("scroll", alMover);
  }, []);

  return (
    <header className="vx-cab" data-oculta={oculta ? "1" : "0"}>
      <div className="vx-wrap vx-cab-in">
        <Link href="/" aria-label="VANGUARD — portada">
          <LogoVanguard />
        </Link>
        <nav className="vx-nav" aria-label="Secciones">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} data-on={activo(ruta, n.href) ? "1" : "0"}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="vx-cab-der">
          <Reloj />
          <BuscadorUniversal />
          <Link href="/en-vivo" className="vx-vivo">
            <span className="vx-punto" /> EN VIVO
          </Link>
        </div>
      </div>
    </header>
  );
}

const TABS = [
  { href: "/", label: "Inicio", Ico: IcoInicio },
  { href: "/mundo", label: "Mapa", Ico: IcoMapa },
  { href: "/en-vivo", label: "En vivo", Ico: IcoVivo, vivo: true },
  { href: "/modulos", label: "Módulos", Ico: IcoModulos },
  { href: "/cuartel", label: "Juego", Ico: IcoJuego },
];

/** Barra inferior tipo app (solo móvil) */
export function BarraMovil({ ruta: rutaFija }: { ruta?: string } = {}) {
  const actual = usePathname();
  const ruta = rutaFija ?? (actual === "/index" ? "/" : actual) ?? "/";
  return (
    <nav className="vx-tabbar" aria-label="Navegación principal">
      {TABS.map(({ href, label, Ico, vivo }) => (
        <Link key={href} href={href} data-on={activo(ruta, href) ? "1" : "0"} data-vivo={vivo ? "1" : "0"}>
          <Ico />
          {label}
        </Link>
      ))}
    </nav>
  );
}
