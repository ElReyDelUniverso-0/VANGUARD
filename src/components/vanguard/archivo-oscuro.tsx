"use client";

// ═══════════════════════════════════════════════════════════════════
// v404.0 · EL ARCHIVO OSCURO, EN FICHAS — pilar 2 del Dueño: más imagen,
// menos bloque de texto, profundización OPCIONAL.
//
// LO QUE HABÍA (medido en v403.9): /oscura eran 24.108 letras en 9 elementos
// visuales — 2.679 letras por visual, la sala más «de libro» de la casa. Cada
// una de las 43 entradas volcaba tres párrafos seguidos (origen · creencia ·
// documentos) y el visitante se comía el archivo entero de una sentada.
//
// LO QUE HAY AHORA: una ficha por entrada. Foto real de la casa (rotulada
// «imagen de archivo») cuando el tema coincide, veredicto, rareza y título.
// Los tres párrafos NO se han borrado: están a un toque, en «el expediente».
// El texto sigue completo en la carga de la página (viaja con la ficha), así
// que abrirlo es instantáneo y sin red.
//
// NADA DE LA FUENTE SE HA TOCADO: los 43 expedientes llevan los mismos
// campos y las mismas fuentes (CIA, National Archives, NSA, FBI Vault…).
// ═══════════════════════════════════════════════════════════════════
import { useState } from "react";
import { TEORIAS, ARMAS, CIVILIZACIONES, DOCS } from "@/lib/oscura-data";
import { fotoDe } from "@/lib/oscura-fotos";

type Clase = "teoria" | "arma" | "civilizacion" | "documento";

function colorVeredicto(v: string): string {
  if (v === "REAL") return "#3ddc97";
  if (v === "MITO") return "#ff4d5e";
  return "#f5a623";
}

const ACENTO: Record<Clase, string> = {
  teoria: "#ef4444",
  arma: "#fb923c",
  civilizacion: "#38bdf8",
  documento: "#b48cff",
};

type Ficha = {
  clave: string;
  clase: Clase;
  titulo: string;
  etiqueta: string;
  color: string;
  lineas: { rotulo: string; texto: string }[];
  url: string;
  fuente: string;
};

const FICHAS: Ficha[] = [
  ...TEORIAS.map<Ficha>((t) => ({
    clave: t.id,
    clase: "teoria",
    titulo: t.titulo,
    etiqueta: `${t.veredicto} · ${t.rareza}`,
    color: colorVeredicto(t.veredicto),
    lineas: [
      { rotulo: "dónde nació", texto: t.origen },
      { rotulo: "lo que se cuenta", texto: t.creencia },
      { rotulo: "lo que dicen los documentos", texto: t.realidad },
    ],
    url: t.url,
    fuente: t.fuente,
  })),
  ...ARMAS.map<Ficha>((a) => ({
    clave: a.id,
    clase: "arma",
    titulo: a.titulo,
    etiqueta: `Arma-idea · ${a.epoca}`,
    color: ACENTO.arma,
    lineas: [
      { rotulo: "la idea que la creó", texto: a.idea },
      { rotulo: "qué cambió en el mundo", texto: a.legado },
    ],
    url: a.url,
    fuente: a.fuente,
  })),
  ...CIVILIZACIONES.map<Ficha>((c) => ({
    clave: c.id,
    clase: "civilizacion",
    titulo: c.titulo,
    etiqueta: `Civilización perdida · ${c.epoca}`,
    color: ACENTO.civilizacion,
    lineas: [
      { rotulo: "qué logró", texto: c.que },
      { rotulo: "cómo aterró y desapareció", texto: c.misterio },
    ],
    url: c.url,
    fuente: c.fuente,
  })),
  ...DOCS.map<Ficha>((d) => ({
    clave: d.id,
    clase: "documento",
    titulo: d.titulo,
    etiqueta: d.tag,
    color: ACENTO.documento,
    lineas: [{ rotulo: "qué contiene", texto: d.desc }],
    url: d.url,
    fuente: d.fuente,
  })),
];

const TRAMOS: { clase: Clase; titulo: string; href: string }[] = [
  { clase: "teoria", titulo: "LAS TEORÍAS CON VEREDICTO", href: "teorias" },
  { clase: "arma", titulo: "LAS ARMAS-IDEA", href: "armas" },
  { clase: "civilizacion", titulo: "LAS CIVILIZACIONES QUE DESAPARECIERON", href: "civilizaciones" },
  { clase: "documento", titulo: "LOS DOCUMENTOS DESCLASIFICADOS", href: "documentos" },
];

function Tarjeta({ f }: { f: Ficha }) {
  const [abierto, setAbierto] = useState(false);
  const foto = fotoDe(f.clave);
  const idDetalle = `exp-${f.clave}`;

  return (
    <article className={`vx-ficha${abierto ? " vx-ficha-abierta" : ""}`} style={{ borderColor: `${f.color}33` }}>
      <div className="vx-ficha-foto">
        {foto ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={foto.src} alt={foto.label} loading="lazy" decoding="async" width={640} height={360} />
            <span className="vx-ficha-sello">imagen de archivo · {foto.label}</span>
          </>
        ) : (
          <span className="vx-ficha-emblema" style={{ color: f.color, borderColor: `${f.color}44` }} aria-hidden>
            ◈
          </span>
        )}
      </div>

      <div className="vx-ficha-cuerpo">
        <span className="vx-ficha-badge" style={{ color: f.color, borderColor: `${f.color}55`, background: `${f.color}14` }}>
          {f.etiqueta}
        </span>
        <h3>{f.titulo}</h3>
        <button
          type="button"
          className="vx-ficha-abrir"
          aria-expanded={abierto}
          aria-controls={idDetalle}
          onClick={() => setAbierto((v) => !v)}
          style={{ color: f.color }}
        >
          {abierto ? "Cerrar expediente" : "Abrir expediente"} <span aria-hidden>{abierto ? "▴" : "▾"}</span>
        </button>
        {abierto && (
          <div className="vx-ficha-detalle" id={idDetalle}>
            {f.lineas.map((l) => (
              <p key={l.rotulo}>
                <b>{l.rotulo}</b>
                {l.texto}
              </p>
            ))}
            <a href={f.url} target="_blank" rel="noopener noreferrer" className="vx-ficha-fuente">
              fuente: {f.fuente} ↗
            </a>
          </div>
        )}
      </div>
    </article>
  );
}

export function ArchivoOscuro() {
  return (
    <div className="vx-archivo-oscuro">
      {TRAMOS.map((t) => {
        const fichas = FICHAS.filter((f) => f.clase === t.clase);
        return (
          <section key={t.clase} id={t.href} className="vx-tramo" aria-label={t.titulo}>
            <h2 className="vx-tramo-titulo">
              <i style={{ background: ACENTO[t.clase] }} aria-hidden />
              {t.titulo}
              <b>{fichas.length}</b>
            </h2>
            <div className="vx-fichas">
              {fichas.map((f) => (
                <Tarjeta key={f.clave} f={f} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
