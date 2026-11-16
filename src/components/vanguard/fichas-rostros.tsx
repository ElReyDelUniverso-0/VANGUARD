"use client";

// ═══════════════════════════════════════════════════════════════════
// v404.1 · LOS 34 ROSTROS, EN FICHAS — mismo patrón que /oscura (v404.0).
//
// LO QUE HABÍA (medido en la auditoría): /rostros era la sala más «de libro»
// que quedaba: 50.784 letras de lectura en 19 elementos visuales — **2.673
// letras por visual**. Cada una de las 34 fichas volcaba el expediente entero
// de golpe: cargo, organización, sede, ciudad, país, mandato, alcance, ruta,
// frase, señas, guardia, sucesión y notas. Un muro.
//
// LO QUE HAY: la ficha visual primero — el nombre, su bandera, su cargo, su
// organización y **su peso dibujado** (el índice de poder de la casa en una
// barra). El expediente completo sigue ahí, entero, a un toque. Nada se ha
// borrado: son los mismos campos de la misma fuente (personas-data.ts).
//
// No hay retratos en el repositorio, así que no se inventa ninguno: el
// emblema de cada ficha es su monograma, y el peso del poder va dibujado.
// ═══════════════════════════════════════════════════════════════════
import { useState } from "react";
import { ROSTROS, CATEGORIAS_ROSTRO, type Rostro } from "@/lib/personas-data";

/** Iniciales del nombre, sin artículos ni cargos: «Luis Alberto Arce» → LA. */
function monograma(nombre: string): string {
  const partes = nombre
    .split(/\s+/)
    .filter((p) => p.length > 2 && !/^(de|del|la|el|los|las|van|von|bin|al)$/i.test(p));
  const letras = (partes.length >= 2 ? [partes[0], partes[partes.length - 1]] : partes).map((p) => p[0]);
  return letras.join("").toUpperCase().slice(0, 2) || "◈";
}

const MAYOR_PODER = Math.max(...ROSTROS.map((r) => r.poder));

function Ficha({ r, color }: { r: Rostro; color: string }) {
  const [abierto, setAbierto] = useState(false);
  const idDetalle = `rostro-det-${r.id}`;
  const ancho = Math.round((r.poder / MAYOR_PODER) * 100);

  return (
    <article className={`vx-ficha${abierto ? " vx-ficha-abierta" : ""}`} style={{ borderColor: `${color}33` }} id={r.id}>
      <div className="vx-ficha-cuerpo">
        <div className="vx-rostro-cab">
          <span className="vx-rostro-mono" style={{ color, borderColor: `${color}55`, background: `${color}12` }} aria-hidden>
            {monograma(r.nombre)}
          </span>
          <div className="vx-rostro-id">
            <span className="vx-rostro-num" style={{ color }}>
              {`${String(r.num).padStart(2, "0")} · ${r.bandera} ${r.pais}`}
            </span>
            <h3>{r.nombre}</h3>
            <p className="vx-rostro-cargo">{r.cargo}</p>
          </div>
        </div>

        <div className="vx-peso" role="img" aria-label={`Poder de ${r.nombre}: ${r.poder} de 100`}>
          <i style={{ width: `${ancho}%`, background: color }} />
          <b style={{ color }}>{r.poder}</b>
        </div>

        <button
          type="button"
          className="vx-ficha-abrir"
          aria-expanded={abierto}
          aria-controls={idDetalle}
          onClick={() => setAbierto((v) => !v)}
          style={{ color }}
        >
          {abierto ? "Cerrar ficha" : "Ver ficha completa"} <span aria-hidden>{abierto ? "▴" : "▾"}</span>
        </button>

        {abierto && (
          <div className="vx-ficha-detalle" id={idDetalle}>
            <p>
              <b>organización</b>
              {r.organizacion}
            </p>
            <p>
              <b>dónde se le encuentra</b>
              {`${r.sede} · ${r.ciudad} · ${r.pais}`}
            </p>
            <p>
              <b>mandato</b>
              {r.mandato}
            </p>
            <p>
              <b>alcance</b>
              {r.alcance}
            </p>
            <p>
              <b>la ruta al poder</b>
              {r.ruta}
            </p>
            <p>
              <b>la frase que manda</b>
              «{r.frase}»
            </p>
            <p>
              <b>rasgos de mando</b>
              {r.senas.join(" · ")}
            </p>
            <p>
              <b>guardia</b>
              {r.guardia}
            </p>
            <p>
              <b>sucesión</b>
              {r.sucesion}
            </p>
            <p>
              <b>fichas del expediente</b>
              {r.notas.join(" · ")}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

export function FichasRostros() {
  const categorias = [...new Set(ROSTROS.map((r) => r.categoria))];
  return (
    <div className="vx-archivo-oscuro">
      {categorias.map((cat) => {
        const { etiqueta, color, leyenda } = CATEGORIAS_ROSTRO[cat];
        const items = ROSTROS.filter((r) => r.categoria === cat);
        return (
          <section key={cat} id={`rostro-${cat}`} className="vx-tramo" aria-label={etiqueta}>
            <h2 className="vx-tramo-titulo">
              <i style={{ background: color }} aria-hidden />
              {etiqueta}
              <b>{items.length}</b>
            </h2>
            <p className="vx-tramo-leyenda">{leyenda}</p>
            <div className="vx-fichas">
              {items.map((r) => (
                <Ficha key={r.id} r={r} color={color} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
