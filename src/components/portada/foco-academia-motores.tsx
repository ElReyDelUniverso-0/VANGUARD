// ============================================================
// v439.0 ORDEN · FOCO PÚBLICO: ACADEMY & MOTORES (reformulado)
// El bloque de antes llevaba Tailwind apilado y seis insignias y
// ocho botones en un espacio pequeño: denso y ajeno al estilo de la
// casa. Ahora: una sola tarjeta por pilar, sellos mínimos, una
// puerta principal y el mismo estilo oscuro-oro del resto.
// ============================================================
"use client";

import Link from "next/link";
import { PortadaHermosaModulo } from "./portadas-hermosas";

function Pilar({
  id,
  sello,
  titulo,
  texto,
  pestañas,
  enlaceHref,
  enlaceTexto,
}: {
  id: string;
  sello: string;
  titulo: string;
  texto: string;
  pestañas: { href: string; label: string }[];
  enlaceHref: string;
  enlaceTexto: string;
}) {
  return (
    <article className="vx-foco-pilar">
      <div className="vx-foco-pilar-img">
        <PortadaHermosaModulo id={id} />
        <span className="vx-foco-sello">{sello}</span>
      </div>
      <div className="vx-foco-pilar-c">
        <h3>{titulo}</h3>
        <p>{texto}</p>
        <div className="vx-foco-chips">
          {pestañas.map((p) => (
            <Link key={p.href} href={p.href}>
              {p.label}
            </Link>
          ))}
        </div>
        <Link href={enlaceHref} className="vx-foco-ir">
          {enlaceTexto} →
        </Link>
      </div>
    </article>
  );
}

export function FocoAcademiaMotores() {
  return (
    <section className="vx-wrap vx-foco" aria-label="La casa forma y calcula">
      {/* bloque principal: Información Perfecta */}
      <div className="vx-foco-banner">
        <div className="vx-foco-banner-c">
          <span className="vx-foco-banner-s">NUEVO · CENTRO DE INTELIGENCIA</span>
          <h2>Centro de Información Perfecta</h2>
          <p>
            Los datos dispersos de la casa, fusionados en una sola consola
            táctica: potencias, arsenales, crudo y ciencia de frontera. Sin
            módulos repetidos.
          </p>
        </div>
        <Link href="/informacion" className="vx-btn vx-foco-banner-btn">
          Abrir Información Perfecta →
        </Link>
      </div>

      <div className="vx-foco-grid">
        <Pilar
          id="academia"
          sello="CERTIFICACIÓN OFICIAL · 10 CURSOS"
          titulo="Vanguard Academy"
          texto="Análisis de inteligencia, lectura de mapas OSINT, doctrina militar y economía de guerra: rutas, ejercicios y certificados verificables."
          pestañas={[
            { href: "/academia/cursos", label: "Catálogo" },
            { href: "/academia/rutas", label: "Rutas" },
            { href: "/academia/ejercicios", label: "Ejercicios" },
            { href: "/academia/certificados", label: "Certificados" },
          ]}
          enlaceHref="/academia"
          enlaceTexto="Entrar a la Academia"
        />
        <Pilar
          id="motores"
          sello="LABORATORIO · 100 PLATAFORMAS"
          titulo="Motores & 100 Plataformas"
          texto="El censo de los 100 sistemas globales líderes y el simulador matemático en vivo: leyes de Lanchester, escalada DEFCON y puntuación Brier."
          pestañas={[
            { href: "/motores/censo", label: "Censo 100" },
            { href: "/motores/escalada", label: "DEFCON" },
            { href: "/motores/lanchester", label: "Lanchester" },
            { href: "/motores/disuasion", label: "Disuasión" },
          ]}
          enlaceHref="/motores"
          enlaceTexto="Abrir Laboratorio"
        />
      </div>
    </section>
  );
}
