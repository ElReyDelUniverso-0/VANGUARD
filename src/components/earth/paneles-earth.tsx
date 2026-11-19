"use client";

// ═══════════════════════════════════════════════════════════════════
// v416.0 VANGUARD EARTH SYSTEM — LOS PANELES DE LA SALA.
//
// Cuatro piezas que comparten una sola promesa: no duplican datos. Lugares
// bebe de tierra-data (LUGARES, CRONICAS), hitos de earth/hitos, guerras de
// mapas-capas y fichas de mundos/ficha. Cada panel solo ordena, filtra y
// vuela: el dato vive en su fuente, como en el resto de la casa.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState } from "react";
import { Play, Pause, ChevronLeft, ChevronRight, MapPin, Bookmark, Ruler, ArrowLeftRight } from "lucide-react";
import { LUGARES, CRONICAS, distanciaKm, lugarPorId } from "@/lib/tierra-data";
import { HITOS, COLOR_HITO, TIPOS_HITO, ETIQUETA_HITO, type TipoHito } from "@/lib/earth/hitos";
import { PUNTOS_HISTORICOS } from "@/lib/earth/guerra-puntos";
import { fichas, regionEnEspanol, type FichaPais } from "@/lib/mundos/ficha";

export interface Vuelo {
  (lat: number, lng: number, alt?: number): void;
}

// ─────────────────────────────────────────────────────────────────
// CATÁLOGO DE LUGARES — ciudades, estrechos, mares y hitos físicos
// ─────────────────────────────────────────────────────────────────
type TipoLugar = "ciudad" | "estrecho" | "mar" | "teatro" | "ficticio" | "base" | TipoHito;

interface ItemLugar {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  alt?: number;
  tipo: TipoLugar;
  color: string;
  nota: string;
}

const COLOR_LUGAR: Record<string, string> = {
  ciudad: "#FFD166",
  estrecho: "#FF7A52",
  mar: "#3DDCFF",
  teatro: "#FF4D5E",
  ficticio: "#B48CFF",
  base: "#3DDC97",
  rio: COLOR_HITO.rio,
  montana: COLOR_HITO.montana,
  oceano: COLOR_HITO.oceano,
  desierto: COLOR_HITO.desierto,
  isla: COLOR_HITO.isla,
  lago: COLOR_HITO.lago,
};

const ETIQUETA_LUGAR: Record<string, string> = {
  ciudad: "CIUDADES",
  estrecho: "ESTRECHOS",
  mar: "MARES",
  teatro: "TEATROS",
  ficticio: "MUNDO VANGUARD",
  base: "BASES",
  rio: "RÍOS",
  montana: "MONTAÑAS",
  oceano: "OCÉANOS",
  desierto: "DESIERTOS",
  isla: "ISLAS",
  lago: "LAGOS",
};

const TODOS_TIPOS: TipoLugar[] = ["ciudad", "estrecho", "mar", "teatro", "ficticio", "base", ...TIPOS_HITO];

export function PanelLugares({ onVolar, onGuardar }: { onVolar: Vuelo; onGuardar?: (lat: number, lng: number, nombre: string) => void }) {
  const [tipo, setTipo] = useState<TipoLugar | "todos">("todos");
  const [abierto, setAbierto] = useState<string | null>(null);

  const items = useMemo<ItemLugar[]>(() => {
    const base: ItemLugar[] = LUGARES.map((l) => ({
      id: l.id,
      nombre: l.nombre,
      lat: l.lat,
      lng: l.lng,
      alt: l.alt,
      tipo: l.tipo,
      color: COLOR_LUGAR[l.tipo] ?? "#FFD166",
      nota: l.nota,
    }));
    for (const h of HITOS) {
      base.push({ id: `h-${h.id}`, nombre: h.nombre, lat: h.lat, lng: h.lng, alt: 1.2, tipo: h.tipo, color: COLOR_HITO[h.tipo], nota: h.nota });
    }
    return base;
  }, []);

  const filtrados = tipo === "todos" ? items : items.filter((i) => i.tipo === tipo);

  return (
    <div className="earth-panel">
      <div className="earth-filtros" role="group" aria-label="Tipos de lugar">
        <button type="button" className={tipo === "todos" ? "on" : ""} onClick={() => setTipo("todos")}>
          todos · {items.length}
        </button>
        {TODOS_TIPOS.map((t) => {
          const n = items.filter((i) => i.tipo === t).length;
          if (n === 0) return null;
          return (
            <button key={t} type="button" className={tipo === t ? "on" : ""} onClick={() => setTipo(t)}>
              {ETIQUETA_LUGAR[t] ?? t} · {n}
            </button>
          );
        })}
      </div>

      <ul className="earth-lista">
        {filtrados.map((i) => (
          <li key={i.id}>
            <button
              type="button"
              className="earth-punto"
              onClick={() => {
                setAbierto(abierto === i.id ? null : i.id);
                onVolar(i.lat, i.lng, i.alt ?? 0.9);
              }}
            >
              <i style={{ background: i.color }} aria-hidden />
              <b>{i.nombre}</b>
              <span>{`${ETIQUETA_LUGAR[i.tipo] ?? i.tipo} · ${i.lat.toFixed(2)}°, ${i.lng.toFixed(2)}°`}</span>
            </button>
            {abierto === i.id && (
              <div className="earth-nota">
                <p>{i.nota}</p>
                <div className="earth-nota-acciones">
                  <button type="button" onClick={() => onVolar(i.lat, i.lng, Math.max(0.4, (i.alt ?? 0.9) * 0.5))}>
                    acercar
                  </button>
                  {onGuardar && (
                    <button type="button" onClick={() => onGuardar(i.lat, i.lng, i.nombre)}>
                      <Bookmark className="w-3 h-3" /> guardar
                    </button>
                  )}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// RECORRIDOS INTERACTIVOS — las crónicas guiadas de la casa, en autosucursal
// ─────────────────────────────────────────────────────────────────
export function Recorridos({ onVolar }: { onVolar: Vuelo }) {
  const [cronicaId, setCronicaId] = useState(CRONICAS[0].id);
  const [idx, setIdx] = useState(0);
  const [jugando, setJugando] = useState(false);
  const cronica = CRONICAS.find((c) => c.id === cronicaId) ?? CRONICAS[0];
  const parada = cronica.paradas[idx];
  const lugar = lugarPorId(parada.lugarId);

  useEffect(() => {
    if (!lugar) return;
    onVolar(lugar.lat, lugar.lng, Math.max(0.6, lugar.alt));
    // al cambiar de parada, el planeta vuela a ella
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cronicaId, idx]);

  useEffect(() => {
    if (!jugando) return;
    if (idx >= cronica.paradas.length - 1) {
      setJugando(false);
      return;
    }
    const t = window.setTimeout(() => setIdx((i) => Math.min(i + 1, cronica.paradas.length - 1)), 6500);
    return () => window.clearTimeout(t);
  }, [jugando, idx, cronica.paradas.length]);

  return (
    <div className="earth-panel">
      <div className="earth-recorridos">
        {CRONICAS.map((c) => (
          <button
            key={c.id}
            type="button"
            className={c.id === cronicaId ? "on" : ""}
            onClick={() => {
              setCronicaId(c.id);
              setIdx(0);
              setJugando(false);
            }}
          >
            <b>{c.titulo}</b>
            <span>{c.lema}</span>
          </button>
        ))}
      </div>

      <article className="earth-parada" aria-live="polite">
        <header>
          <span className="mono">
            {`PARADA ${idx + 1}/${cronica.paradas.length}`}
          </span>
          <h3>{lugar?.nombre ?? parada.lugarId}</h3>
          <p className="mono">
            {lugar ? `${lugar.lat.toFixed(2)}°, ${lugar.lng.toFixed(2)}°` : ""}
          </p>
        </header>
        <p className="earth-parada-texto">{parada.texto}</p>
        <div className="earth-parada-mandos">
          <button type="button" disabled={idx === 0} onClick={() => setIdx((i) => Math.max(0, i - 1))} aria-label="Parada anterior">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            className="earth-play"
            onClick={() => {
              if (idx >= cronica.paradas.length - 1) setIdx(0);
              setJugando((j) => !j);
            }}
            aria-label={jugando ? "Pausar el recorrido" : "Reproducir el recorrido"}
          >
            {jugando ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {jugando ? "pausar" : "recorrer"}
          </button>
          <button
            type="button"
            disabled={idx >= cronica.paradas.length - 1}
            onClick={() => setIdx((i) => Math.min(cronica.paradas.length - 1, i + 1))}
            aria-label="Parada siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <ol className="earth-paradas">
          {cronica.paradas.map((p, i) => {
            const l = lugarPorId(p.lugarId);
            return (
              <li key={`${p.lugarId}-${i}`}>
                <button
                  type="button"
                  className={i === idx ? "on" : ""}
                  onClick={() => {
                    setIdx(i);
                    setJugando(false);
                  }}
                >
                  {l?.nombre ?? p.lugarId}
                </button>
              </li>
            );
          })}
        </ol>
      </article>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// COMPARADOR TERRITORIAL — dos naciones cara a cara con la misma tabla
// ─────────────────────────────────────────────────────────────────
const F = fichas();

interface FilaComparacion {
  etiqueta: string;
  a: string;
  b: string;
  gana?: "a" | "b" | null;
}

function fila(etiqueta: string, a: string, b: string, gana?: "a" | "b" | null): FilaComparacion {
  return { etiqueta, a, b, gana };
}

export function ComparadorTerritorial({
  onVolar,
  inicialA,
  inicialB,
}: {
  onVolar: Vuelo;
  inicialA?: string | null;
  inicialB?: string | null;
}) {
  const [a, setA] = useState<string | null>(inicialA ?? "ESP");
  const [b, setB] = useState<string | null>(inicialB ?? "FRA");

  const fa = F.find((f) => f.iso3 === a) ?? null;
  const fb = F.find((f) => f.iso3 === b) ?? null;

  const filas = useMemo(() => {
    if (!fa || !fb) return [];
    const km = distanciaKm(fa.lat, fa.lng, fb.lat, fb.lng);
    const pobA = fa.poblacion ?? 0;
    const pobB = fb.poblacion ?? 0;
    const supA = fa.superficie ?? 0;
    const supB = fb.superficie ?? 0;
    return [
      fila("región", regionEnEspanol(fa.region), regionEnEspanol(fb.region)),
      fila("capital", fa.atlas?.capital ?? "sin dato", fb.atlas?.capital ?? "sin dato"),
      fila(
        "población",
        fa.poblacion === null ? "sin dato" : fa.poblacion.toLocaleString("es-ES"),
        fb.poblacion === null ? "sin dato" : fb.poblacion.toLocaleString("es-ES"),
        pobA > pobB ? "a" : pobB > pobA ? "b" : null,
      ),
      fila(
        "superficie (km²)",
        fa.superficie === null ? "sin dato" : fa.superficie.toLocaleString("es-ES"),
        fb.superficie === null ? "sin dato" : fb.superficie.toLocaleString("es-ES"),
        supA > supB ? "a" : supB > supA ? "b" : null,
      ),
      fila(
        "densidad",
        fa.densidad === null ? "sin dato" : `${fa.densidad.toLocaleString("es-ES", { maximumFractionDigits: 1 })} hab/km²`,
        fb.densidad === null ? "sin dato" : `${fb.densidad.toLocaleString("es-ES", { maximumFractionDigits: 1 })} hab/km²`,
      ),
      fila(
        "moneda",
        fa.moneda ? `${fa.moneda.nombre} (${fa.moneda.codigo})` : "sin dato",
        fb.moneda ? `${fb.moneda.nombre} (${fb.moneda.codigo})` : "sin dato",
      ),
      fila(
        "gasto militar",
        fa.militar ? `US$ ${(fa.militar.gasto / 1e9).toLocaleString("es-ES", { maximumFractionDigits: 1 })} mil M` : "sin dato",
        fb.militar ? `US$ ${(fb.militar.gasto / 1e9).toLocaleString("es-ES", { maximumFractionDigits: 1 })} mil M` : "sin dato",
      ),
      fila(
        "posición centro",
        `${fa.lat.toFixed(2)}°, ${fa.lng.toFixed(2)}°`,
        `${fb.lat.toFixed(2)}°, ${fb.lng.toFixed(2)}°`,
      ),
      fila(
        "distancia entre centros",
        `${km.toLocaleString("es-ES", { maximumFractionDigits: 0 })} km`,
        `${km.toLocaleString("es-ES", { maximumFractionDigits: 0 })} km`,
      ),
    ];
  }, [fa, fb]);

  return (
    <div className="earth-panel">
      <div className="earth-comparador">
        <label>
          <span>A</span>
          <select
            value={a ?? ""}
            onChange={(e) => setA(e.target.value || null)}
            aria-label="Primer país a comparar"
          >
            {F.map((f) => (
              <option key={f.iso3} value={f.iso3}>
                {f.nombre}
              </option>
            ))}
          </select>
        </label>
        <ArrowLeftRight className="w-4 h-4 earth-vs" aria-hidden />
        <label>
          <span>B</span>
          <select
            value={b ?? ""}
            onChange={(e) => setB(e.target.value || null)}
            aria-label="Segundo país a comparar"
          >
            {F.map((f) => (
              <option key={f.iso3} value={f.iso3}>
                {f.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      {fa && fb && (
        <>
          <div className="earth-comparador-cabezas">
            <button type="button" onClick={() => onVolar(fa.lat, fa.lng, 0.9)}>
              <MapPin className="w-3.5 h-3.5" /> {fa.nombre}
            </button>
            <button type="button" onClick={() => onVolar(fb.lat, fb.lng, 0.9)}>
              <MapPin className="w-3.5 h-3.5" /> {fb.nombre}
            </button>
          </div>
          <table className="earth-tabla">
            <tbody>
              {filas.map((r) => (
                <tr key={r.etiqueta}>
                  <th scope="row">{r.etiqueta}</th>
                  <td className={r.gana === "a" ? "gana" : ""}>{r.a}</td>
                  <td className={r.gana === "b" ? "gana" : ""}>{r.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="earth-pie">
            {`fichas: atlas de la casa + Banco Mundial (población, superficie, gasto) · distancia: haversine entre los centros geográficos del censo ISO · la cifra que una fuente no cubre se dice «sin dato», nunca se inventa`}
          </p>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAPA HISTÓRICO — las guerras del archivo, por época
// ─────────────────────────────────────────────────────────────────
export function HistoriaCapa({ onVolar }: { onVolar: Vuelo }) {
  const [era, setEra] = useState<string | null>(null);
  const eras = useMemo(() => [...new Set(PUNTOS_HISTORICOS.map((p) => p.epoca).filter(Boolean))] as string[], []);
  const puntos = era ? PUNTOS_HISTORICOS.filter((p) => p.epoca === era) : PUNTOS_HISTORICOS;
  const [sel, setSel] = useState<string | null>(null);

  return (
    <div className="earth-panel">
      <div className="earth-filtros" role="group" aria-label="Época de la guerra">
        <button type="button" className={era === null ? "on" : ""} onClick={() => setEra(null)}>
          todas · {PUNTOS_HISTORICOS.length}
        </button>
        {eras.map((e) => (
          <button key={e} type="button" className={era === e ? "on" : ""} onClick={() => setEra(e)}>
            {e.toLowerCase()} · {PUNTOS_HISTORICOS.filter((p) => p.epoca === e).length}
          </button>
        ))}
      </div>

      <ul className="earth-lista earth-lista-historia">
        {puntos.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className={`earth-punto ${sel === p.id ? "sel" : ""}`}
              onClick={() => {
                setSel(p.id);
                onVolar(p.lat, p.lng, 0.9);
              }}
            >
              <i style={{ background: p.color }} aria-hidden />
              <b>{p.nombre}</b>
              <span>{p.etiqueta}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="earth-pie">
        <Ruler className="w-3 h-3" /> {`las coordenadas son las documentadas en el archivo de la casa (game-data.ts) · toca una guerra para volar a ella`}
      </p>
    </div>
  );
}
