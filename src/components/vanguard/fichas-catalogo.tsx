"use client";

// ═══════════════════════════════════════════════════════════════════
// v405.4 · EL CATÁLOGO EN FICHAS — 184 piezas ya construidas.
//
// LO QUE HABÍA (auditoría v405.2): /catalogo medía 22.985 letras en 11
// elementos visuales — 2.090 por visual. Cada pieza llevaba su lema completo
// impreso en la lista, así que el índice se leía como un libro de 184 párrafos.
//
// LO QUE HAY: cada pieza es una ficha con su nombre (y su puerta si la tiene),
// su tipo y su ruta. El lema —qué es y por qué existe— sigue ahí, entero, a un
// toque. Ni una pieza se ha quitado: son las mismas de catalogo-real.ts.
// ═══════════════════════════════════════════════════════════════════
import { useState } from "react";
import Link from "next/link";
import { cosasPorTipo, type CosaReal, type TipoCosa } from "@/lib/catalogo-real";

const COLOR: Record<TipoCosa, string> = {
  sala: "#3ddc97",
  panel: "#f5a623",
  motor: "#5eead4",
  api: "#b48cff",
};

const TITULO: Record<TipoCosa, string> = {
  sala: "SALAS NAVEGABLES",
  panel: "PANELES YA CONSTRUIDOS",
  motor: "MOTORES DE LA CASA",
  api: "PUNTOS DE DATOS",
};

const NOTA: Record<TipoCosa, string> = {
  sala: "puertas que ya existen: se abren con un clic",
  panel: "piezas ya escritas que viven dentro de las salas",
  motor: "código de la casa que hace el trabajo pesado",
  api: "endpoints reales que sirven datos a la casa",
};


// Un emblema por tipo (v405.4): la pieza deja de ser solo texto. Cuatro
// trazos, reutilizados 184 veces, con su descripción para lectores de pantalla.
const TRAZO: Record<TipoCosa, string> = {
  sala: "M4 14V3h8v11M2 14h12", // una puerta
  panel: "M2 3h12v8H2zM4 13h8", // un panel
  motor: "M3 6h3l2-2h4v3h2v5H3z", // un motor
  api: "M3 8h10M6 4v3M10 9v3", // un punto de datos
};

function Emblema({ tipo, color }: { tipo: TipoCosa; color: string }) {
  return (
    <svg
      className="vx-cat-emblema"
      viewBox="0 0 16 16"
      role="img"
      aria-label={`tipo: ${TITULO[tipo].toLowerCase()}`}
      fill="none"
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
    >
      <path d={TRAZO[tipo]} />
    </svg>
  );
}

const navegable = (c: CosaReal) =>
  Boolean(c.ruta && !c.ruta.includes("[") && !c.ruta.startsWith("/api/"));

function Ficha({ c }: { c: CosaReal }) {
  const [abierto, setAbierto] = useState(false);
  const id = `cat-${c.id}`;
  const color = COLOR[c.tipo];
  return (
    <article className={`vx-pais${abierto ? " vx-pais-abierto" : ""}`}>
      <div className="vx-pais-cab">
        <span className="vx-pais-puesto" style={{ color }}>
          {c.tipo.slice(0, 3).toUpperCase()}
        </span>
        <Emblema tipo={c.tipo} color={color} />
        <h3>
          {navegable(c) ? (
            <Link href={c.ruta as string} style={{ color: "inherit" }}>
              {c.nombre}
            </Link>
          ) : (
            c.nombre
          )}
        </h3>
      </div>
      <p className="vx-cat-ruta">{c.ruta ?? c.archivo}</p>
      <button
        type="button"
        className="vx-ficha-abrir"
        aria-expanded={abierto}
        aria-controls={id}
        onClick={() => setAbierto((v) => !v)}
        style={{ color }}
      >
        {abierto ? "Cerrar" : "Qué es"} <span aria-hidden>{abierto ? "▴" : "▾"}</span>
      </button>
      {abierto && (
        <div className="vx-ficha-detalle" id={id}>
          <p>
            <b>qué es</b>
            {c.lema ?? "pieza del catálogo sin lema declarado en la fuente"}
          </p>
          <p>
            <b>dónde vive</b>
            {`${c.ruta ?? "sin ruta navegable"} · ${c.archivo}`}
          </p>
        </div>
      )}
    </article>
  );
}

export function FichasCatalogo() {
  const tipos: TipoCosa[] = ["sala", "panel", "motor", "api"];
  return (
    <div className="vx-archivo-oscuro">
      {tipos.map((tipo) => {
        const lista = cosasPorTipo(tipo);
        if (lista.length === 0) return null;
        return (
          <section key={tipo} className="vx-tramo" aria-label={TITULO[tipo]}>
            <h2 className="vx-tramo-titulo">
              <i style={{ background: COLOR[tipo] }} aria-hidden />
              {TITULO[tipo]}
              <b>{lista.length}</b>
            </h2>
            <p className="vx-tramo-leyenda">{NOTA[tipo]}</p>
            <div className="vx-paises">
              {lista.map((c) => (
                <Ficha key={c.id} c={c} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
