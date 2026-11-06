"use client";

// v358.0 WORLD PULSE — LA ISLA VIVA del centro de inteligencia mundial.
// Server-safe por construcción: los datos (instantánea del Banco
// Mundial + cronología de cables reales) VIAJAN CON EL PRIMER BYTE
// como props — la isla no hace fetch, no abre API, no se recarga
// (ley v190) y no tiene UN SOLO effect (ley v176 por construcción).
// Toda la interactividad (filtros, comparaciones, índice) se deriva
// en el render desde los selects — móvil primero, nativo de la casa.

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  type InstantaneaPulso,
  type CategoriaPulso,
  CATEGORIAS_PULSO,
  continentesDe,
  paisesDeContinente,
  serieDePais,
  ultimoDato,
  percentilIndicador,
  formatearValor,
  compararPeriodos,
  wpiDePais,
  wpiSerie,
  rankingWpi,
  enlaceIndicador,
  PESOS_WPI,
  METODOLOGIA_WPI,
} from "@/lib/pulso-mundial";
import { FlagBadge } from "@/components/vanguard/flag-badge";

export interface CableCronologia {
  id: string;
  titulo: string;
  fuente: string;
  fecha: string; // ISO
  categoria: string | null; // tacticalTag: ALERTA/DIPLOMACIA/ECONOMIA/HUMANITARIO/ANALISIS
  conflicto: string | null; // conflictTag → /conflicto/[tag]
  pais: string | null; // sourceCountry ISO-2
}

type Vista = "actividad" | "cronologia" | "indicadores" | "indice";

const VISTAS: { id: Vista; texto: string; clase: string }[] = [
  { id: "actividad", texto: "ACTIVIDAD", clase: "text-amber-400 border-amber-400" },
  { id: "cronologia", texto: "CRONOLOGÍA", clase: "text-cyan-400 border-cyan-400" },
  { id: "indicadores", texto: "INDICADORES", clase: "text-emerald-400 border-emerald-400" },
  { id: "indice", texto: "ÍNDICE WPI", clase: "text-violet-400 border-violet-400" },
];

const CLASE_CATEGORIA: Record<string, string> = {
  ALERTA: "text-red-300 border-red-500/50 bg-red-500/10",
  DIPLOMACIA: "text-sky-300 border-sky-500/50 bg-sky-500/10",
  ECONOMIA: "text-amber-300 border-amber-500/50 bg-amber-500/10",
  HUMANITARIO: "text-rose-300 border-rose-500/50 bg-rose-500/10",
  ANALISIS: "text-zinc-300 border-zinc-500/50 bg-zinc-500/10",
};

const PERIODOS: { dias: number | null; texto: string }[] = [
  { dias: 1, texto: "24 h" },
  { dias: 7, texto: "7 días" },
  { dias: 30, texto: "30 días" },
  { dias: 90, texto: "90 días" },
  { dias: 365, texto: "12 meses" },
  { dias: null, texto: "todo el archivo" },
];

function hace(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return "ahora";
  const min = Math.floor(ms / 60000);
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 48) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 60) return `hace ${d} días`;
  return `hace ${Math.floor(d / 30)} meses`;
}

function diaEs(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function horaEs(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

interface Punto {
  anio: number;
  valor: number;
}

/** El gráfico de serie de la casa: SVG puro escalable (móvil sin desbordes). */
function SerieChart({ puntos, unidad, color }: { puntos: Punto[]; unidad: string; color: string }) {
  if (puntos.length < 2) {
    return (
      <p className="text-xs text-zinc-500 py-6 text-center">
        Serie insuficiente para trazar — el hueco se declara, no se finge.
      </p>
    );
  }
  const vals = puntos.map((p) => p.valor);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || Math.abs(max) || 1;
  const W = 300;
  const H = 90;
  const cy = (v: number) => H - 12 - ((v - min) / span) * (H - 24);
  const cx = (i: number) => (i / (puntos.length - 1)) * (W - 8) + 4;
  const pts = puntos.map((p, i) => `${cx(i)},${cy(p.valor)}`).join(" ");
  const primero = puntos[0];
  const ultimo = puntos[puntos.length - 1];
  return (
    <figure className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-24"
        role="img"
        aria-label={`Serie ${primero.anio}–${ultimo.anio}`}
      >
        <polyline
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {puntos.map((p, i) => (
          <circle key={p.anio} cx={cx(i)} cy={cy(p.valor)} r="2.2" fill={color} />
        ))}
      </svg>
      <figcaption className="flex justify-between font-mono text-[10px] text-zinc-500">
        <span>
          {primero.anio}: {formatearValor(primero.valor, unidad)}
        </span>
        <span>
          {ultimo.anio}: {formatearValor(ultimo.valor, unidad)}
        </span>
      </figcaption>
    </figure>
  );
}

interface Props {
  snap: InstantaneaPulso;
  cables: CableCronologia[];
  anioWpi: number;
}

export function WorldPulseVivo({ snap, cables, anioWpi }: Props) {
  const [vista, setVista] = useState<Vista>("actividad");
  // filtros compartidos de ACTIVIDAD y CRONOLOGÍA
  const [continente, setContinente] = useState<string>("");
  const [iso3, setIso3] = useState<string>("");
  const [categoria, setCategoria] = useState<string>("");
  const [periodo, setPeriodo] = useState<number | null>(null);
  // INDICADORES
  const [iso3Ind, setIso3Ind] = useState<string>("WLD");
  const [indCat, setIndCat] = useState<CategoriaPulso>("ECONOMIA");
  const [indCodigo, setIndCodigo] = useState<string>("NY.GDP.MKTP.KD.ZG");
  // ÍNDICE
  const [wpiAnio, setWpiAnio] = useState<number>(anioWpi);
  const [wpiIso3, setWpiIso3] = useState<string>("ESP");

  const continentes = useMemo(() => continentesDe(snap).filter((c) => c !== "MUNDO"), [snap]);
  const indicadoresDeCategoria = useMemo(
    () => snap.indicadores.filter((i) => i.categoria === indCat),
    [snap.indicadores, indCat]
  );

  const limite = periodo === null ? null : Date.now() - periodo * 24 * 60 * 60 * 1000;
  const cablesFiltrados = useMemo(() => {
    const paisElegido = iso3 ? snap.paises.find((x) => x.iso3 === iso3) : null;
    return cables.filter((c) => {
      if (limite !== null && new Date(c.fecha).getTime() < limite) return false;
      if (categoria && c.categoria !== categoria) return false;
      if (paisElegido) {
        // el cable pertenece al país por su ISO de fuente o por el nombre en el titular
        const porIso = c.pais?.toUpperCase() === paisElegido.iso3.slice(0, 2);
        const porNombre = c.titulo.toUpperCase().includes(paisElegido.nombre.toUpperCase());
        if (!porIso && !porNombre) return false;
      }
      return true;
    });
  }, [cables, limite, categoria, iso3, snap.paises]);

  const destacados = useMemo(() => {
    const orden = ["DIPLOMACIA", "ECONOMIA", "HUMANITARIO", "ALERTA"];
    const vistos = new Set<string>();
    const salen: CableCronologia[] = [];
    for (const cat of orden) {
      const c = cablesFiltrados.find((x) => x.categoria === cat);
      if (c && !vistos.has(c.id)) {
        vistos.add(c.id);
        salen.push(c);
      }
    }
    for (const c of cablesFiltrados) {
      if (salen.length >= 6) break;
      if (!vistos.has(c.id)) {
        vistos.add(c.id);
        salen.push(c);
      }
    }
    return salen;
  }, [cablesFiltrados]);

  const cronologia = useMemo(() => {
    const grupos = new Map<string, CableCronologia[]>();
    for (const c of cablesFiltrados.slice(0, 150)) {
      const d = diaEs(c.fecha);
      const lista = grupos.get(d) ?? [];
      lista.push(c);
      grupos.set(d, lista);
    }
    return Array.from(grupos.entries());
  }, [cablesFiltrados]);

  // ── INDICADORES (derivado puro del render) ──
  const serie = useMemo(() => serieDePais(snap, iso3Ind, indCodigo), [snap, iso3Ind, indCodigo]);
  const ind = snap.indicadores.find((i) => i.codigo === indCodigo) ?? snap.indicadores[0];
  const ultimo = ultimoDato(snap, iso3Ind, indCodigo);
  const anioSerie = serie.length > 0 ? serie[serie.length - 1].anio : new Date().getFullYear() - 1;
  const aniosSerie = serie.map((p) => p.anio);
  const [anioA, setAnioA] = useState<number | null>(null);
  const [anioB, setAnioB] = useState<number | null>(null);
  const anioAReal = anioA ?? (serie.length > 1 ? serie[0].anio : anioSerie);
  const anioBReal = anioB ?? anioSerie;
  const comparacion = compararPeriodos(snap, iso3Ind, indCodigo, anioAReal, anioBReal);
  const percentil = percentilIndicador(snap, indCodigo, anioSerie, iso3Ind);
  const refMundo = ultimoDato(snap, "WLD", indCodigo);
  const paisInd = snap.paises.find((p) => p.iso3 === iso3Ind);
  const hayInd = indicadoresDeCategoria.some((i) => i.codigo === indCodigo);

  // ── ÍNDICE WPI (derivado puro del render) ──
  const ranking = useMemo(() => rankingWpi(snap, wpiAnio), [snap, wpiAnio]);
  const wpiDetalle = wpiDePais(snap, wpiIso3, wpiAnio);
  const serieWpi = useMemo(() => wpiSerie(snap, wpiIso3), [snap, wpiIso3]);
  const paisWpi = snap.paises.find((p) => p.iso3 === wpiIso3);
  const totalPesos = Object.keys(PESOS_WPI).length;

  const selectorPais = (valor: string, setter: (v: string) => void) => (
    <select
      value={valor}
      onChange={(e) => setter(e.target.value)}
      className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 max-w-full focus:outline-none focus:border-amber-500"
      aria-label="País"
    >
      <option value="">Todos los países</option>
      <option value="WLD">Mundo (agregado)</option>
      {continentes.map((c) => (
        <optgroup key={c} label={c}>
          {paisesDeContinente(snap, c).map((p) => (
            <option key={p.iso3} value={p.iso3}>
              {p.nombre}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );

  return (
    <div>
      {/* ── las pestañas del pulso ── */}
      <nav className="flex gap-1 sm:gap-2 overflow-x-auto pb-1" aria-label="Vistas de WORLD PULSE">
        {VISTAS.map((v) => (
          <button
            key={v.id}
            onClick={() => setVista(v.id)}
            className={`font-mono text-[10px] sm:text-[11px] tracking-widest uppercase px-3 py-1.5 rounded border whitespace-nowrap transition-colors ${
              vista === v.id ? `${v.clase} bg-zinc-900` : "text-zinc-500 border-zinc-800 hover:text-zinc-300"
            }`}
          >
            {v.texto}
          </button>
        ))}
      </nav>

      {/* ── filtros compartidos ── */}
      {(vista === "actividad" || vista === "cronologia") && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
          <select
            value={continente}
            onChange={(e) => {
              setContinente(e.target.value);
              setIso3("");
            }}
            className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            aria-label="Continente"
          >
            <option value="">Todos los continentes</option>
            {continentes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {selectorPais(iso3, setIso3)}
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            aria-label="Categoría del cable"
          >
            <option value="">Todas las categorías</option>
            {["ALERTA", "DIPLOMACIA", "ECONOMIA", "HUMANITARIO", "ANALISIS"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={periodo === null ? "" : String(periodo)}
            onChange={(e) => setPeriodo(e.target.value === "" ? null : Number(e.target.value))}
            className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
            aria-label="Período histórico"
          >
            {PERIODOS.map((p) => (
              <option key={p.texto} value={p.dias === null ? "" : String(p.dias)}>
                {p.texto}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* ═══ ACTIVIDAD ═══ */}
      {vista === "actividad" && (
        <div className="mt-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="border border-zinc-800 rounded-lg p-3 bg-zinc-900/40">
              <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Cables en el filtro</p>
              <p className="text-2xl font-bold text-amber-300">{cablesFiltrados.length}</p>
            </div>
            <div className="border border-zinc-800 rounded-lg p-3 bg-zinc-900/40">
              <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Con país identificado</p>
              <p className="text-2xl font-bold text-cyan-300">{cablesFiltrados.filter((c) => c.pais).length}</p>
            </div>
            <div className="border border-zinc-800 rounded-lg p-3 bg-zinc-900/40">
              <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Última señal</p>
              <p className="text-sm font-bold text-zinc-200 pt-1.5">
                {cablesFiltrados.length > 0 ? hace(cablesFiltrados[0].fecha) : "SIN SEÑAL en el filtro"}
              </p>
            </div>
            <div className="border border-zinc-800 rounded-lg p-3 bg-zinc-900/40">
              <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Naciones vigiladas</p>
              <p className="text-2xl font-bold text-emerald-300">{snap.meta.paisesCubiertos}</p>
            </div>
          </div>

          <h3 className="font-mono text-[11px] uppercase tracking-widest text-amber-300 mt-6 mb-2">
            Acontecimientos destacados — los últimos cables de cada categoría
          </h3>
          {destacados.length === 0 ? (
            <p className="text-sm text-zinc-500 border border-zinc-800 rounded-lg p-4">
              Sin señal con estos filtros — la casa no inventa cables. Amplía el período o cambia la categoría.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-2">
              {destacados.map((c) => (
                <article
                  key={c.id}
                  className="border border-zinc-800 rounded-lg p-3 bg-zinc-900/40 hover:border-zinc-600 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    {c.categoria && (
                      <span
                        className={`font-mono text-[8px] tracking-widest border rounded px-1.5 py-0.5 ${
                          CLASE_CATEGORIA[c.categoria] ?? "text-zinc-400 border-zinc-700"
                        }`}
                      >
                        {c.categoria}
                      </span>
                    )}
                    <FlagBadge code={c.pais ?? undefined} />
                    <span className="font-mono text-[9px] text-zinc-500">{hace(c.fecha)}</span>
                  </div>
                  <Link
                    href={`/noticia/${c.id}`}
                    className="text-sm text-zinc-100 hover:text-amber-300 line-clamp-2 mt-1.5 block"
                  >
                    {c.titulo}
                  </Link>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="font-mono text-[9px] text-zinc-500">{c.fuente}</span>
                    {c.conflicto && (
                      <Link
                        href={`/conflicto/${c.conflicto}`}
                        className="font-mono text-[9px] text-red-400/90 hover:text-red-300"
                      >
                        SALA ▸
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="flex gap-2 flex-wrap mt-5">
            <Link
              href="/mundo"
              className="font-mono text-[10px] uppercase tracking-widest text-amber-400 hover:text-amber-300 border border-amber-500/40 rounded px-3 py-1.5"
            >
              VER EN EL MUNDO 3D ▸
            </Link>
            <Link
              href="/espia"
              className="font-mono text-[10px] uppercase tracking-widest text-cyan-400/90 hover:text-cyan-300 border border-cyan-500/40 rounded px-3 py-1.5"
            >
              RADAR DE GOBIERNOS ▸
            </Link>
            <Link
              href="/en-vivo"
              className="font-mono text-[10px] uppercase tracking-widest text-red-400/90 hover:text-red-300 border border-red-500/40 rounded px-3 py-1.5"
            >
              LA REDACCIÓN EN VIVO ▸
            </Link>
          </div>
        </div>
      )}

      {/* ═══ CRONOLOGÍA ═══ */}
      {vista === "cronologia" && (
        <div className="mt-4">
          {cronologia.length === 0 ? (
            <p className="text-sm text-zinc-500 border border-zinc-800 rounded-lg p-4">
              Cronología vacía con estos filtros — hueco declarado, no fingido.
            </p>
          ) : (
            <>
              <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mb-3">
                {cablesFiltrados.length} cables · mostrando los {Math.min(150, cablesFiltrados.length)} más recientes
              </p>
              <div className="space-y-4">
                {cronologia.map(([dia, lista]) => (
                  <section key={dia}>
                    <h4 className="font-mono text-[10px] uppercase tracking-widest text-cyan-300 border-b border-zinc-800 pb-1 mb-2">
                      {dia} · {lista.length} cables
                    </h4>
                    <ul className="space-y-1.5">
                      {lista.map((c) => (
                        <li key={c.id} className="flex items-start gap-2 text-sm">
                          <span className="font-mono text-[10px] text-zinc-600 pt-0.5 shrink-0">
                            {horaEs(c.fecha)}
                          </span>
                          <FlagBadge code={c.pais ?? undefined} />
                          <Link href={`/noticia/${c.id}`} className="text-zinc-300 hover:text-amber-300 line-clamp-1">
                            {c.titulo}
                          </Link>
                          {c.categoria && (
                            <span
                              className={`font-mono text-[8px] tracking-widest border rounded px-1 py-0.5 shrink-0 ${
                                CLASE_CATEGORIA[c.categoria] ?? "text-zinc-400 border-zinc-700"
                              }`}
                            >
                              {c.categoria}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ═══ INDICADORES ═══ */}
      {vista === "indicadores" && (
        <div className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              value={iso3Ind}
              onChange={(e) => setIso3Ind(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
              aria-label="País del indicador"
            >
              <option value="WLD">Mundo (agregado)</option>
              {continentes.map((c) => (
                <optgroup key={c} label={c}>
                  {paisesDeContinente(snap, c).map((p) => (
                    <option key={p.iso3} value={p.iso3}>
                      {p.nombre}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <select
              value={indCat}
              onChange={(e) => {
                const cat = e.target.value as CategoriaPulso;
                setIndCat(cat);
                const primero = snap.indicadores.find((i) => i.categoria === cat);
                if (primero) setIndCodigo(primero.codigo);
              }}
              className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
              aria-label="Categoría del indicador"
            >
              {CATEGORIAS_PULSO.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={indCodigo}
              onChange={(e) => setIndCodigo(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
              aria-label="Indicador"
            >
              {!hayInd && <option value={indCodigo}>{ind.nombre}</option>}
              {indicadoresDeCategoria.map((i) => (
                <option key={i.codigo} value={i.codigo}>
                  {i.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="border border-zinc-800 rounded-lg p-4 mt-3 bg-zinc-900/40">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h3 className="text-base font-bold text-zinc-100">{ind.nombre}</h3>
                <p className="text-xs text-zinc-500 max-w-xl">{ind.descripcion}</p>
              </div>
              <a
                href={enlaceIndicador(ind.codigo)}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[9px] uppercase tracking-widest text-emerald-400 hover:text-emerald-300 border border-emerald-500/40 rounded px-2 py-1"
              >
                ORIGINAL ▸
              </a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Último dato</p>
                <p className="text-lg font-bold text-emerald-300">
                  {ultimo ? formatearValor(ultimo.valor, ind.unidad) : "—"}
                </p>
                <p className="font-mono text-[9px] text-zinc-500">
                  {ultimo ? `${paisInd?.nombre ?? iso3Ind} · ${ultimo.anio}` : "sin cobertura aquí"}
                </p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Percentil real</p>
                <p className="text-lg font-bold text-cyan-300">{percentil !== null ? `${percentil}` : "—"}</p>
                <p className="font-mono text-[9px] text-zinc-500">
                  {percentil !== null ? `entre ${snap.meta.paisesCubiertos - 1} naciones · ${anioSerie}` : "sin comparación ese año"}
                </p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Mundo (referencia)</p>
                <p className="text-lg font-bold text-zinc-300">
                  {refMundo ? formatearValor(refMundo.valor, ind.unidad) : "—"}
                </p>
                <p className="font-mono text-[9px] text-zinc-500">{refMundo ? `agregado WLD · ${refMundo.anio}` : "sin dato"}</p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Dirección</p>
                <p className="text-lg font-bold text-zinc-300">{ind.direccion === 1 ? "↑ mejor" : "↓ mejor"}</p>
                <p className="font-mono text-[9px] text-zinc-500">
                  {ind.papel === "indice" ? "entra al WPI" : "contexto, no indexa"}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <SerieChart puntos={serie} unidad={ind.unidad} color="#34d399" />
            </div>
          </div>

          {/* comparar períodos */}
          <div className="border border-zinc-800 rounded-lg p-4 mt-3 bg-zinc-900/40">
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-amber-300 mb-2">Comparar períodos</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={String(anioAReal)}
                onChange={(e) => setAnioA(Number(e.target.value))}
                className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200"
                aria-label="Año inicial"
              >
                {aniosSerie.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <span className="text-zinc-500 text-xs">→</span>
              <select
                value={String(anioBReal)}
                onChange={(e) => setAnioB(Number(e.target.value))}
                className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200"
                aria-label="Año final"
              >
                {aniosSerie.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">{anioAReal}</p>
                <p className="text-base font-bold text-zinc-200">
                  {comparacion.a !== null ? formatearValor(comparacion.a, ind.unidad) : "sin dato"}
                </p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">{anioBReal}</p>
                <p className="text-base font-bold text-zinc-200">
                  {comparacion.b !== null ? formatearValor(comparacion.b, ind.unidad) : "sin dato"}
                </p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Delta real</p>
                <p
                  className={`text-base font-bold ${
                    comparacion.delta === null
                      ? "text-zinc-500"
                      : comparacion.delta >= 0
                        ? "text-emerald-300"
                        : "text-red-300"
                  }`}
                >
                  {comparacion.delta === null
                    ? "—"
                    : `${comparacion.delta >= 0 ? "+" : ""}${formatearValor(comparacion.delta, ind.unidad)}`}
                </p>
                {comparacion.deltaPct !== null && (
                  <p className="font-mono text-[9px] text-zinc-500">
                    {comparacion.deltaPct >= 0 ? "+" : ""}
                    {comparacion.deltaPct.toLocaleString("es-ES", { maximumFractionDigits: 2 })} %
                  </p>
                )}
              </div>
            </div>
            <p className="font-mono text-[9px] text-zinc-600 mt-2">
              Deltas calculados sobre los valores REALES del Banco Mundial — un año sin dato se declara, jamás interpolado.
            </p>
          </div>
        </div>
      )}

      {/* ═══ ÍNDICE WPI ═══ */}
      {vista === "indice" && (
        <div className="mt-4">
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={String(wpiAnio)}
              onChange={(e) => setWpiAnio(Number(e.target.value))}
              className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200"
              aria-label="Año del índice"
            >
              {Array.from({ length: 14 }, (_, i) => 2025 - i).map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
              {ranking.length} naciones con índice · cobertura mínima {5}/{totalPesos} indicadores
            </span>
          </div>

          <div className="border border-zinc-800 rounded-lg p-4 mt-3 bg-zinc-900/40">
            <h3 className="font-mono text-[11px] uppercase tracking-widest text-violet-300 mb-3">
              Ranking WORLD PULSE INDEX · {wpiAnio}
            </h3>
            {ranking.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Sin índice para {wpiAnio} — la cobertura no alcanza y se declara.
              </p>
            ) : (
              <ol className="space-y-1.5">
                {ranking.slice(0, 15).map((r, idx) => {
                  const p = snap.paises.find((x) => x.iso3 === r.iso3);
                  return (
                    <li key={r.iso3} className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-zinc-600 w-6 text-right">{idx + 1}</span>
                      <span className="text-sm text-zinc-200 w-32 sm:w-44 truncate">{p?.nombre ?? r.iso3}</span>
                      <div className="flex-1 h-2.5 bg-zinc-800 rounded overflow-hidden min-w-16">
                        <div className="h-full rounded" style={{ width: `${r.wpi}%`, backgroundColor: "#a78bfa" }} />
                      </div>
                      <span className="font-mono text-xs text-violet-300 w-10 text-right">{r.wpi.toFixed(1)}</span>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          {/* ficha por país */}
          <div className="border border-zinc-800 rounded-lg p-4 mt-3 bg-zinc-900/40">
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={wpiIso3}
                onChange={(e) => setWpiIso3(e.target.value)}
                className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-200 max-w-full"
                aria-label="País del índice"
              >
                {snap.paises
                  .filter((p) => p.iso3 !== "WLD")
                  .map((p) => (
                    <option key={p.iso3} value={p.iso3}>
                      {p.nombre}
                    </option>
                  ))}
              </select>
              {paisWpi && <span className="font-mono text-[9px] text-zinc-500">{paisWpi.continente}</span>}
            </div>
            <div className="flex items-baseline gap-3 mt-3 flex-wrap">
              <p className="text-4xl font-bold text-violet-300">
                {wpiDetalle.valor !== null ? wpiDetalle.valor.toFixed(1) : "—"}
              </p>
              <p className="font-mono text-[10px] text-zinc-500">
                WPI {wpiAnio} · cobertura {wpiDetalle.cobertura}/{totalPesos} indicadores
                {wpiDetalle.valor === null && " · por debajo del mínimo: el índice se declara ausente"}
              </p>
            </div>
            <div className="mt-4">
              <SerieChart puntos={serieWpi} unidad="puntos WPI" color="#a78bfa" />
            </div>
            <ul className="mt-3 space-y-1.5">
              {wpiDetalle.componentes.map((c) => {
                const ic = snap.indicadores.find((i) => i.codigo === c.codigo);
                return (
                  <li key={c.codigo} className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 w-32 sm:w-44 truncate">{ic?.nombre ?? c.codigo}</span>
                    {c.percentil !== null ? (
                      <>
                        <div className="flex-1 h-2 bg-zinc-800 rounded overflow-hidden min-w-12">
                          <div
                            className="h-full rounded"
                            style={{
                              width: `${c.percentil}%`,
                              backgroundColor: ic?.direccion === -1 ? "#fbbf24" : "#34d399",
                            }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-zinc-400 w-10 text-right">{c.percentil}</span>
                      </>
                    ) : (
                      <span className="font-mono text-[10px] text-zinc-600">sin dato ese año — declarado</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* metodología — details/summary: honestidad sin JS */}
          <details className="border border-zinc-800 rounded-lg p-4 mt-3 bg-zinc-900/40">
            <summary className="font-mono text-[11px] uppercase tracking-widest text-amber-300 cursor-pointer">
              {METODOLOGIA_WPI.titulo} — transparencia completa
            </summary>
            <div className="mt-3 space-y-2 text-sm text-zinc-300">
              <p>
                <strong className="text-zinc-100">Qué es:</strong> {METODOLOGIA_WPI.que}
              </p>
              <p>
                <strong className="text-zinc-100">Cómo se calcula:</strong> {METODOLOGIA_WPI.como}
              </p>
              <p>
                <strong className="text-zinc-100">Cobertura mínima:</strong> {METODOLOGIA_WPI.cobertura}
              </p>
              <p>
                <strong className="text-zinc-100">Limitaciones:</strong> {METODOLOGIA_WPI.limitaciones}
              </p>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
                  Pesos publicados (estables)
                </p>
                <ul className="space-y-1">
                  {Object.entries(PESOS_WPI).map(([codigo, peso]) => {
                    const ic = snap.indicadores.find((i) => i.codigo === codigo);
                    return (
                      <li key={codigo} className="flex items-center gap-2 text-xs">
                        <span className="text-zinc-400">{ic?.nombre ?? codigo}</span>
                        <span className="font-mono text-amber-300">{Math.round(peso * 100)} %</span>
                        <a
                          href={enlaceIndicador(codigo)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[9px] text-emerald-400 hover:text-emerald-300"
                        >
                          VERIFICAR ▸
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
