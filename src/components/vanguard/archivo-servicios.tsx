"use client";

// ═══════════════════════════════════════════════════════════════════
// v405.4 · LOS 36 EXPEDIENTES DE INTELIGENCIA, EN FICHAS.
//
// LO QUE HABÍA (auditoría v405.2): /servicios era la sala con MÁS letras de la
// casa — 59.363 letras en 31 elementos visuales, **1.915 por visual**. Cada
// agencia y cada servicio extranjero volcaba el expediente entero: nombre
// oficial, nombre en español, sede, personal, especialidad, dominios, lema,
// misión y las viñetas de fichas. Un muro de 36 muros.
//
// LO QUE HAY: una ficha por servicio — su sigla como emblema, su país, su
// categoría y su año de fundación dibujado contra el más antiguo de la serie.
// El expediente completo sigue entero, a un toque.
//
// NADA SE BORRA: los campos viajan verbatim de agencias-data.ts (la Comunidad
// de EE. UU., 18 agencias) y agencias-mundo-data.ts (la Red Mundial, 18
// servicios). Cero fechas ni cifras escritas a mano.
// ═══════════════════════════════════════════════════════════════════
import { useState } from "react";
import { AGENCIAS, CATEGORIA_META } from "@/lib/agencias-data";
import { SERVICIOS, CATEGORIA_RED_META } from "@/lib/agencias-mundo-data";

type FichaServicio = {
  id: string;
  num: number;
  sigla: string;
  nombre: string;
  nombreEs: string;
  pais: string;
  bandera: string;
  categoria: string;
  categoriaEtiqueta: string;
  color: string;
  fundacion: number;
  linaje?: string;
  sede: string;
  personal: string;
  especialidad: string;
  dominio: string[];
  lema: string;
  mision: string;
  fichas: string[];
  red: "comunidad" | "mundo";
};

const TODAS: FichaServicio[] = [
  ...AGENCIAS.map((a) => ({
    id: a.id,
    num: a.num,
    sigla: a.sigla,
    nombre: a.nombre,
    nombreEs: a.nombreEs,
    pais: "Estados Unidos",
    bandera: "🇺🇸",
    categoria: a.categoria,
    categoriaEtiqueta: CATEGORIA_META[a.categoria].etiqueta,
    color: CATEGORIA_META[a.categoria].color,
    fundacion: a.fundacion,
    sede: a.sede,
    personal: a.personal,
    especialidad: a.especialidad,
    dominio: a.dominio,
    lema: a.lema,
    mision: a.mision,
    fichas: a.fichas,
    red: "comunidad" as const,
  })),
  ...SERVICIOS.map((s) => ({
    id: s.id,
    num: s.num,
    sigla: s.sigla,
    nombre: s.nombre,
    nombreEs: s.nombreEs,
    pais: s.pais,
    bandera: s.bandera,
    categoria: s.categoria,
    categoriaEtiqueta: CATEGORIA_RED_META[s.categoria].etiqueta,
    color: CATEGORIA_RED_META[s.categoria].color,
    fundacion: s.fundacion,
    linaje: s.linaje,
    sede: s.sede,
    personal: s.personal,
    especialidad: s.especialidad,
    dominio: s.dominio,
    lema: s.lema,
    mision: s.mision,
    fichas: s.fichas,
    red: "mundo" as const,
  })),
];

const MAS_ANTIGUO = Math.min(...TODAS.map((t) => t.fundacion));
const MAS_NUEVO = Math.max(...TODAS.map((t) => t.fundacion));
const RANGO = Math.max(1, MAS_NUEVO - MAS_ANTIGUO);

function Ficha({ s }: { s: FichaServicio }) {
  const [abierto, setAbierto] = useState(false);
  const id = `svc-${s.red}-${s.id}`;
  // barra = cuánto lleva existiendo el oficio (del más antiguo al más nuevo)
  const ancho = Math.max(4, Math.round(((MAS_NUEVO - s.fundacion) / RANGO) * 100));
  const edad = MAS_NUEVO - s.fundacion;

  return (
    <article className={`vx-pais${abierto ? " vx-pais-abierto" : ""}`}>
      <div className="vx-pais-cab">
        <span className="vx-svc-sigla" style={{ color: s.color, borderColor: `${s.color}55` }}>
          {s.sigla}
        </span>
        <h3>{s.nombreEs}</h3>
      </div>
      <p className="vx-cat-ruta">{`${s.bandera} ${s.pais} · ${s.categoriaEtiqueta} · fundada en ${s.fundacion}`}</p>
      <div
        className="vx-peso"
        role="img"
        aria-label={`${s.sigla}: ${edad} años de oficio, fundada en ${s.fundacion}`}
      >
        <i style={{ width: `${ancho}%`, background: s.color }} />
        <b>{s.fundacion}</b>
      </div>
      <button
        type="button"
        className="vx-ficha-abrir"
        aria-expanded={abierto}
        aria-controls={id}
        onClick={() => setAbierto((v) => !v)}
        style={{ color: s.color }}
      >
        {abierto ? "Cerrar expediente" : "Abrir expediente"} <span aria-hidden>{abierto ? "▴" : "▾"}</span>
      </button>
      {abierto && (
        <div className="vx-ficha-detalle" id={id}>
          <p>
            <b>nombre oficial</b>
            {s.nombre}
          </p>
          {s.linaje ? (
            <p>
              <b>linaje</b>
              {s.linaje}
            </p>
          ) : null}
          <p>
            <b>sede</b>
            {`${s.sede} · ${s.pais}`}
          </p>
          <p>
            <b>personal</b>
            {s.personal}
          </p>
          <p>
            <b>especialidad</b>
            {s.especialidad}
          </p>
          <p>
            <b>dominios</b>
            {s.dominio.join(" · ")}
          </p>
          <p>
            <b>lema</b>
            «{s.lema}»
          </p>
          <p>
            <b>la misión</b>
            {s.mision}
          </p>
          <p>
            <b>el expediente</b>
            {s.fichas.join(" · ")}
          </p>
        </div>
      )}
    </article>
  );
}

function Tramo({
  titulo,
  color,
  nota,
  lista,
}: {
  titulo: string;
  color: string;
  nota?: string;
  lista: FichaServicio[];
}) {
  return (
    <section className="vx-tramo" aria-label={titulo}>
      <h2 className="vx-tramo-titulo">
        <i style={{ background: color }} aria-hidden />
        {titulo}
        <b>{lista.length}</b>
      </h2>
      {nota ? <p className="vx-tramo-leyenda">{nota}</p> : null}
      <div className="vx-paises">
        {lista.map((s) => (
          <Ficha key={`${s.red}-${s.id}`} s={s} />
        ))}
      </div>
    </section>
  );
}

/** Las 18 agencias de EE. UU., agrupadas por categoría como en la fuente. */
export function FichasComunidad() {
  const cats: string[] = [];
  for (const a of TODAS) if (a.red === "comunidad" && !cats.includes(a.categoria)) cats.push(a.categoria);
  return (
    <div className="vx-archivo-oscuro">
      {cats.map((cat) => {
        const lista = TODAS.filter((s) => s.red === "comunidad" && s.categoria === cat);
        return (
          <Tramo
            key={cat}
            titulo={lista[0].categoriaEtiqueta}
            color={lista[0].color}
            lista={lista}
          />
        );
      })}
    </div>
  );
}

/** Los 18 servicios extranjeros, agrupados por categoría como en la fuente. */
export function FichasRed() {
  const cats: string[] = [];
  for (const a of TODAS) if (a.red === "mundo" && !cats.includes(a.categoria)) cats.push(a.categoria);
  return (
    <div className="vx-archivo-oscuro">
      {cats.map((cat) => {
        const lista = TODAS.filter((s) => s.red === "mundo" && s.categoria === cat);
        return (
          <Tramo
            key={cat}
            titulo={lista[0].categoriaEtiqueta}
            color={lista[0].color}
            lista={lista}
          />
        );
      })}
    </div>
  );
}
