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
import { NAV_PRIMARIO } from "@/lib/operacion/orden";
import {
  IcoInicio, IcoJuego, IcoMapa, IcoModulos, IcoVivo,
} from "./iconos";
// v442.0 · LOS SÍMBOLOS VIVOS — cada puerta del menú lleva su signo único
// y el signo tiene vida: respira, echa chispas de «?», tiembla de ira o
// despierta con energía y los ojos mirando a los lados.
import { SigiloVivo } from "@/components/vanguard/simbolos-vivos";
// v403.8 LA PUERTA: el buscador universal (⌘K) llega por fin a la cabecera
// viva. Busca las 155 salas del cuartel, las 46 puertas de los módulos y los
// cables en vivo. Antes el icono de lupa llevaba a /guerra-hoy: una lupa que
// no buscaba. Ahora busca.
import { BuscadorUniversal } from "@/components/vanguard/buscador-universal";
import { BotonMenuAdictivo } from "./menu-adictivo";
import { BotonCyberRadio } from "@/components/vanguard/cyber-radio-modal";
// v436.0 · el muelle de una sola fila: lo que no cabe, en una hoja
import { BotonMasMovil, BotonRadioMuelle } from "@/components/vanguard/muelle-movil";
import { BotonAjustes } from "@/components/config/panel-ajustes";
import { BotonGuiaVisual } from "@/components/vanguard/guia/GuiaVisualTactivaModal";

// v402.6 LOS NUEVE MÓDULOS — la cabecera lee los módulos de modulos.ts
// (la portada está en el logo: ocho módulos caben en una sola fila)
// v406.0 LA TRAVESÍA: «Explorar» abre la entrada inmersiva de toda la casa
// v432.0 EL ORDEN — el Dueño: «hay muchos botones en el menú y unos opacan a
// otros; ordena los módulos y los botones». La cabecera llevaba 13 módulos
// seguidos más 4 botones. Ahora lleva el ÍNDICE y cinco puertas de uso diario.
// Nada se pierde: los 14 módulos y sus salas viven ordenados en /orden.
//
// v439.10 · EL MENÚ ANIMADO CON SÍMBOLOS — el Dueño: «el menú está super
// feo; cámbialo, combínalo, animado, con los símbolos característicos, más
// cómodo y más llamativo, y que sea ROTADO (fijo): que siempre esté el
// mismo, que no sea diferente». Cada puerta del menú lleva su SÍMBOLO
// característico + su etiqueta, con animación al pasar y al activarse.
// El ORDEN del menú es FIJO y determinista: siempre el mismo, para todos,
// en todos los dispositivos — nunca se reordena ni se reshufflea.
export const NAV = NAV_PRIMARIO;

/** SÍMBOLO característico de cada puerta del menú (clave: href). */
const SIMBOLOS: Record<string, string> = {
  "/orden": "orden",
  "/buscar": "buscar",
  "/mercado": "mercado",
  "/guerra-hoy": "redaccion",
  "/mundos": "mundo",
  "/conocimiento": "saber",
  "/mi-universo": "casa",
};

function Simbolo({ href }: { href: string }) {
  return <SigiloVivo id={SIMBOLOS[href] ?? href} tam={21} ojos={false} className="vx-nav-ico" />;
}

/** la lista vieja (13 módulos) queda disponible por compatibilidad; ya no se pinta */
export const NAV_MODULOS = MODULOS_PUBLICOS.map((m) => ({ href: entradaDe(m), label: m.corto }));

// v402 — cada sala cuelga de uno de los cinco módulos (fuente única: modulos.ts)
function activo(ruta: string, href: string) {
  const m = moduloDe(ruta);
  if (href === "/") return !m && (ruta === "/" || ruta.startsWith("/lectura"));
  // la pestaña Módulos se enciende en /modulos y en los módulos nuevos (sin botón propio)
  if (href === "/modulos") return ruta === "/modulos" || (!!m && entradaDe(m).startsWith("/modulo/"));
  if (href === "/entrar") return ruta === "/entrar" || ruta === "/modulos" || (!!m && entradaDe(m).startsWith("/modulo/"));
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
            <Link key={n.href} href={n.href} data-on={activo(ruta, n.href) ? "1" : "0"} aria-current={activo(ruta, n.href) ? "page" : undefined}>
              <span className="vx-nav-icowrap"><Simbolo href={n.href} /></span>
              <span className="vx-nav-t">{n.label}</span>
            </Link>
          ))}
        </nav>
        <div className="vx-cab-der">
          <BotonAjustes />
          <BotonGuiaVisual />
          <BotonMenuAdictivo />
          <BotonCyberRadio />
          <Reloj />
          <BuscadorUniversal />
          {/* v432.0 ZONA CERO: el ojo de Vanguard, a un toque desde cualquier sala */}
          <Link href="/zona-cero" className="vx-zc-ojo" data-on={ruta.startsWith("/zona-cero") ? "1" : "0"} aria-label="Zona Cero: el ojo de Vanguard" title="Zona Cero">
            <svg viewBox="0 0 32 32" width="22" height="22" aria-hidden>
              <path d="M2 16Q16 4 30 16Q16 28 2 16Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <circle cx="16" cy="16" r="5.6" fill="currentColor" />
              <circle cx="16" cy="16" r="2.2" fill="#06080c" />
              <path d="M16 1.5v3M16 27.5v3M3.5 6l2 2M28.5 6l-2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </Link>
          <Link href="/en-vivo" className="vx-vivo" aria-label="EN VIVO">
            <span className="vx-punto" /> <span className="vx-vivo-t">EN VIVO</span>
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
  // v406.0 LA TRAVESÍA: la pestaña de módulos lleva ahora a la entrada que los
  // recorre todos (el índice /modulos sigue vivo dentro de ella: «El mapa de la casa»)
  { href: "/entrar", label: "Explorar", Ico: IcoModulos },
  { href: "/orden", label: "Orden", Ico: IcoJuego },
];

/** Barra inferior tipo app (solo móvil) */
export function BarraMovil({ ruta: rutaFija }: { ruta?: string } = {}) {
  const actual = usePathname();
  const ruta = rutaFija ?? (actual === "/index" ? "/" : actual) ?? "/";
  return (
    <nav className="vx-tabbar" aria-label="Navegación principal">
      {TABS.map(({ href, label, Ico, vivo }) => (
        <Link key={href} href={href} data-on={activo(ruta, href) ? "1" : "0"} data-vivo={vivo ? "1" : "0"} aria-current={activo(ruta, href) ? "page" : undefined}>
          <Ico />
          {label}
        </Link>
      ))}
      {/* v436.0 · el quinto sitio del muelle: todo lo demás, en una hoja.
          El ▶ de la radio se posa aquí al lado (lo pinta la emisora). */}
      <BotonMasMovil />
      {/* el ▶ de la radio: una sola voz, siempre a un toque */}
      <BotonRadioMuelle />
    </nav>
  );
}
