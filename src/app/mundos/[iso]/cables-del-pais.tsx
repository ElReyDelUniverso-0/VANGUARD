"use client";

// ============================================================
// v405.16 · LOS CABLES DE ESTE PAÍS — la ficha escucha a la redacción
//
// El problema que cierra: /mundos/[iso] se prerenderiza para los 249 países
// (dynamicParams = false) y por eso NO puede consultar la base de datos en el
// servidor sin dejar de ser estática. Pero una ficha de país sin las noticias
// de ese país es media ficha.
//
// La solución respeta las dos cosas: el servidor sigue sirviendo la ficha desde
// el CDN, y este bloque pide al NÚCLEO (la API que ya existe, con su muro v211)
// los cables de la entidad `noticia` que mencionan el país. Mientras llega, dice
// que está buscando; si no hay, lo dice; si el núcleo no responde, lo dice con
// su palabra. Ningún cable se escribe a mano aquí.
// ============================================================

import { useEffect, useState } from "react";
import Link from "next/link";

interface Cable {
  titulo: string;
  subtitulo: string;
  ruta: string;
  fecha?: string;
  origen: string;
}

type Estado = "cargando" | "ok" | "vacio" | "error";

function cuando(iso?: string): string {
  if (!iso) return "";
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  return new Date(t).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CablesDelPais({ nombre }: { nombre: string; iso2?: string }) {
  const [estado, setEstado] = useState<Estado>("cargando");
  const [cables, setCables] = useState<Cable[]>([]);

  useEffect(() => {
    let vivo = true;
    const ac = new AbortController();
    const url = `/api/nucleo/busqueda?q=${encodeURIComponent(nombre)}&tipo=noticia`;
    fetch(url, { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { ok?: boolean; resultados?: Cable[] }) => {
        if (!vivo) return;
        const lista = (d.resultados ?? []).filter((c) => c.ruta?.startsWith("/noticia/")).slice(0, 5);
        setCables(lista);
        setEstado(lista.length > 0 ? "ok" : "vacio");
      })
      .catch(() => {
        if (vivo) setEstado("error");
      });
    return () => {
      vivo = false;
      ac.abort();
    };
  }, [nombre]);

  return (
    <div style={{ marginTop: 14 }}>
      <h3
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#a1a1aa",
          margin: "0 0 8px",
        }}
      >
        Lo que la redacción publica sobre {nombre}
      </h3>

      {estado === "cargando" ? (
        <p style={{ fontSize: 12.5, color: "#71717a", margin: 0 }}>
          Preguntando al núcleo por los cables de {nombre}…
        </p>
      ) : null}

      {estado === "vacio" ? (
        <p style={{ fontSize: 12.5, color: "#71717a", margin: 0 }}>
          Ningún cable del archivo menciona a {nombre} ahora mismo. La ficha sigue en pie: los datos de arriba no
          dependen de la última hora.
        </p>
      ) : null}

      {estado === "error" ? (
        <p style={{ fontSize: 12.5, color: "#f59e0b", margin: 0 }}>
          El núcleo no responde en este momento. Los cables de {nombre} puedes buscarlos a mano en{" "}
          <Link href={`/nucleo?q=${encodeURIComponent(nombre)}`} style={{ color: "#fbbf24" }}>
            el buscador global
          </Link>
          ; la ficha no se cae por eso.
        </p>
      ) : null}

      {estado === "ok" ? (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 }}>
          {cables.map((c) => (
            <li
              key={c.ruta}
              style={{
                border: "1px solid rgba(63,63,70,0.6)",
                borderRadius: 6,
                padding: "8px 10px",
                background: "rgba(24,24,27,0.5)",
              }}
            >
              <Link href={c.ruta} style={{ color: "#e4e4e7", fontSize: 13, textDecoration: "none" }}>
                {c.titulo}
              </Link>
              <div style={{ fontSize: 11, color: "#71717a", marginTop: 3 }}>
                {cuando(c.fecha)}
                {c.origen ? ` · ${c.origen.replace("fnt:", "")}` : ""}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <p style={{ fontSize: 11, color: "#52525b", margin: "8px 0 0" }}>
        Resultados del núcleo (fuente <code>fnt:cables</code>), sin filtrar a mano. Si un cable no aparece es porque el
        archivo no lo tiene, no porque se haya escondido.
      </p>
    </div>
  );
}
