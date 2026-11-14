"use client";

// v400.0 LA CABECERA ÚNICA — de 4 barras + cinta de contadores a UNA barra
// de 64 px. Se esconde al bajar y vuelve al subir (como BBC / The Verge).
// Las monedas, gemas, racha y nivel viven ahora dentro de Juego y Perfil.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoVanguard } from "./logo";
import { Reloj } from "./reloj";
import { IcoBuscar, IcoInicio, IcoJuego, IcoMapa, IcoPerfil, IcoVivo } from "./iconos";

export const NAV = [
  { href: "/", label: "Portada" },
  { href: "/mundo", label: "Mapa" },
  { href: "/guerra-hoy", label: "Conflictos" },
  { href: "/pulso-mundial", label: "Análisis" },
  { href: "/cuartel", label: "Juego" },
];

function activo(ruta: string, href: string) {
  if (href === "/") return ruta === "/";
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
          <Link href="/guerra-hoy" className="vx-ico" aria-label="Buscar noticias">
            <IcoBuscar />
          </Link>
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
  { href: "/cuartel", label: "Juego", Ico: IcoJuego },
  { href: "/perfil", label: "Perfil", Ico: IcoPerfil },
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
