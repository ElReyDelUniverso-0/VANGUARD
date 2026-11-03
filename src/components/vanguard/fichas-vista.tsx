"use client";

// ============================================================
// VANGUARD v170.2 «GLORIA» — VISTA «FICHAS DEL LINAJE»
// Tienda de sobres con apertura cinematográfica, álbum con
// progreso por categoría, detalle con número de serie y
// fundición de duplicadas. v170.2 añade: sobre RELÁMPAGO por
// hora, fortuna garantizada (piedad), ticker de la red, racha
// de regalos y la sub-pestaña GLORIA (presunción).
// ============================================================

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AgenteApi } from "@/lib/vanguard/agente-store";
import type { FichasApi } from "@/lib/vanguard/fichas-store";
import {
  type CategoriaFicha,
  type DefFicha,
  type FichaInstancia,
  type Sobre,
  CATALOGO,
  CATEGORIA_META,
  ORDEN_CATEGORIAS,
  PIEDAD_LEGENDARIA,
  RAREZA_META,
  SOBRES,
  duplicadasFundibles,
} from "@/lib/vanguard/fichas";
import {
  calcularPrestigio,
  mensajeTicker,
  paqueteRelampago,
  separarMiles,
  tituloPorId,
} from "@/lib/vanguard/gloria";
import { sfxClick, sfxExito, sfxFallo, sfxRevelar, sfxSobre } from "@/lib/vanguard/sonido";
import { ArteSobre, FichaCard, FichaReverso, esRarezaAlta } from "./fichas-arte";
import { GloriaVista } from "./gloria-vista";

const PAD = (n: number): string => (n < 10 ? `00${n}` : n < 100 ? `0${n}` : `${n}`);

// ── Apertura cinematográfica del sobre ───────────────────────
function AperturaSobre({
  sobre,
  instancias,
  resolver,
  copiaDe,
  onPresumir,
  onCerrar,
}: {
  sobre: Sobre;
  instancias: FichaInstancia[];
  resolver: (fichaId: string) => DefFicha | undefined;
  copiaDe: (fichaId: string) => number;
  onPresumir: (def: DefFicha, instancia?: FichaInstancia) => void;
  onCerrar: () => void;
}) {
  const [fase, setFase] = useState<"paquete" | "revelando">("paquete");
  const [idx, setIdx] = useState(0);
  const total = instancias.length;
  const actual = instancias[Math.min(idx, total - 1)];
  const defActual = actual ? resolver(actual.fichaId) : undefined;
  const metaActual = defActual ? RAREZA_META[defActual.rareza] : null;

  const romper = useCallback(() => {
    if (fase !== "paquete") return;
    sfxSobre();
    setFase("revelando");
    const primera = resolver(instancias[0].fichaId);
    window.setTimeout(() => sfxRevelar(primera?.rareza ?? "COMUN"), 340);
  }, [fase, instancias, resolver]);

  const revelarSiguiente = useCallback(() => {
    if (idx >= total - 1) return;
    const n = idx + 1;
    setIdx(n);
    sfxClick();
    const def = resolver(instancias[n].fichaId);
    window.setTimeout(() => sfxRevelar(def?.rareza ?? "COMUN"), 240);
  }, [idx, total, instancias, resolver]);

  return (
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center overflow-y-auto bg-black/90 px-4 py-8 backdrop-blur-md">
      <div className="mb-2 text-center">
        <div className="text-[10px] font-black tracking-[0.3em]" style={{ color: sobre.color }}>
          {sobre.nombre}
        </div>
        <div className="mt-0.5 font-mono text-[9px] text-white/40">
          {fase === "paquete" ? "TOCA EL SOBRE PARA ABRIRLO" : `FICHA ${idx + 1} DE ${total}`}
        </div>
        {fase === "revelando" && defActual && esRarezaAlta(defActual.rareza) && (
          <div
            key={`grito-${idx}`}
            className="fichas-voltear mt-2 text-xl font-black tracking-[0.3em]"
            style={{ color: defActual.rareza === "UNICO" ? "#ffffff" : RAREZA_META[defActual.rareza].color, textShadow: `0 0 24px ${defActual.rareza === "UNICO" ? "rgba(255,255,255,0.8)" : RAREZA_META[defActual.rareza].glow}` }}
          >
            {defActual.rareza === "UNICO" ? "¡ÚNICA EN EL MUNDO!" : defActual.rareza === "MITICO" ? "¡MÍTICA!" : "¡LEGENDARIA!"}
          </div>
        )}
      </div>

      {fase === "paquete" ? (
        <button
          onClick={romper}
          aria-label="Abrir sobre"
          className="fichas-flotar w-64 max-w-[70vw] cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <ArteSobre sobre={sobre} />
          <div className="mt-3 text-center text-[10px] font-bold text-white/50">◉ {sobre.precio > 0 ? `${sobre.precio} PAGADOS` : "REGALO DE LA RED"}</div>
        </button>
      ) : (
        <div className="flex w-full max-w-md flex-col items-center">
          {/* tarjetas aún sin revelar, apiladas detrás */}
          <div className="relative flex h-[330px] w-full items-center justify-center">
            {instancias.slice(idx + 1, idx + 3).map((inst, i) => (
              <div
                key={inst.uid}
                className="absolute w-40 rotate-3 opacity-60"
                style={{ transform: `translate(${14 * (i + 1)}px, ${10 * (i + 1)}px) rotate(${4 * (i + 1)}deg)`, zIndex: -i - 1 }}
              >
                <FichaReverso tono={sobre.color} />
              </div>
            ))}

            {/* estallido por rareza */}
            {defActual && (
              <div
                key={`burst-${idx}`}
                className="fichas-estallido pointer-events-none absolute h-72 w-72 rounded-full"
                style={{ background: `radial-gradient(circle, ${metaActual?.glow ?? "rgba(255,255,255,0.4)"} 0%, transparent 62%)` }}
              />
            )}
            {defActual && esRarezaAlta(defActual.rareza) && (
              <>
                {["12%", "80%", "24%", "70%"].map((l, i) => (
                  <span
                    key={`${idx}-${l}`}
                    className="fichas-chispa pointer-events-none absolute text-lg"
                    style={{ left: l, top: i % 2 ? "22%" : "56%", animationDelay: `${i * 0.18}s`, color: metaActual?.color }}
                  >
                    ✦
                  </span>
                ))}
              </>
            )}

            {/* la ficha actual */}
            {defActual && (
              <div key={`card-${idx}`} className="fichas-voltear relative w-52">
                <FichaCard def={defActual} instancia={actual} tamaño="md" />
              </div>
            )}

            {defActual?.rareza === "UNICO" && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/50 bg-black/85 px-3 py-1 text-[9px] font-black tracking-[0.25em] text-white">
                1 DE 1 EN EL MUNDO
              </div>
            )}
            {defActual && copiaDe(defActual.id) > 1 && defActual.rareza !== "UNICO" && (
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/20 bg-black/85 px-3 py-1 text-[9px] font-bold text-white/70">
                REPETIDA · FUNDIBLE EN EL ÁLBUM
              </div>
            )}
          </div>

          {/* tirada revelada */}
          <div className="mt-4 flex items-center justify-center gap-1.5">
            {instancias.map((inst, i) => {
              const def = resolver(inst.fichaId);
              return (
                <span
                  key={inst.uid}
                  className="h-1.5 w-6 rounded-full transition-all"
                  style={{ background: i <= idx ? (def ? RAREZA_META[def.rareza].color : "#888") : "rgba(255,255,255,0.12)" }}
                />
              );
            })}
          </div>

          {idx < total - 1 ? (
            <button
              onClick={revelarSiguiente}
              className="mt-5 rounded-xl border border-white/25 bg-white/10 px-6 py-2.5 text-[11px] font-black tracking-[0.2em] text-white transition-all hover:border-white/60 hover:bg-white/20 active:scale-95"
            >
              REVELAR ({idx + 2}/{total})
            </button>
          ) : (
            <button
              onClick={() => {
                sfxExito();
                onCerrar();
              }}
              className="mt-5 rounded-xl border border-emerald-400/50 bg-emerald-400/15 px-6 py-2.5 text-[11px] font-black tracking-[0.2em] text-emerald-200 transition-all hover:bg-emerald-400/25 active:scale-95"
            >
              GUARDAR EN EL ÁLBUM
            </button>
          )}

          {/* presunción instantánea de la joya revelada */}
          {defActual && esRarezaAlta(defActual.rareza) && fase === "revelando" && (
            <button
              onClick={() => onPresumir(defActual, actual)}
              className="mt-2 rounded-xl border border-amber-300/60 bg-gradient-to-r from-amber-500/25 via-amber-300/35 to-amber-500/25 px-5 py-2 text-[10px] font-black tracking-[0.25em] text-amber-100 transition-all hover:from-amber-500/45 hover:via-amber-300/55 hover:to-amber-500/45 active:scale-95"
            >
              ◈ PRESUMIR ESTA JOYA ◈
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Modal de detalle con serie y fundición ───────────────────
function DetalleFicha({
  fichaId,
  resolver,
  inventario,
  onFundir,
  onCerrar,
}: {
  fichaId: string;
  resolver: (fichaId: string) => DefFicha | undefined;
  inventario: FichaInstancia[];
  onFundir: (uid: string) => void;
  onCerrar: () => void;
}) {
  const def = resolver(fichaId);
  if (!def) return null;
  const meta = RAREZA_META[def.rareza];
  const ejemplares = inventario.filter((i) => i.fichaId === fichaId);
  const duplicada = ejemplares.length > 1 && meta.fundicion > 0;
  const uidAFundir = duplicada ? ejemplares[1].uid : null;

  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center overflow-y-auto bg-black/85 px-4 py-8 backdrop-blur-md" onClick={onCerrar}>
      <div className="flex w-full max-w-3xl flex-col items-center gap-6 sm:flex-row sm:items-start" onClick={(e) => e.stopPropagation()}>
        <div className="w-52 shrink-0">
          <FichaCard def={def} instancia={ejemplares[0]} tamaño="lg" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full border px-2 py-0.5 text-[8px] font-black tracking-[0.2em]" style={{ borderColor: meta.color, color: meta.color }}>
              {meta.etiqueta}
            </span>
            <span className="text-[8px] font-black tracking-[0.2em]" style={{ color: CATEGORIA_META[def.categoria].color }}>
              {CATEGORIA_META[def.categoria].icono} {CATEGORIA_META[def.categoria].etiqueta}
            </span>
          </div>
          <h3 className="mt-2 text-xl font-black leading-tight tracking-wide text-white">{def.nombre}</h3>
          <p className="mt-2 text-xs italic leading-relaxed text-white/60">«{def.lore}»</p>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-2">
              <div className="text-base font-black" style={{ color: meta.color }}>{def.poder}</div>
              <div className="text-[7.5px] font-bold tracking-widest text-white/40">PODER</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-2">
              <div className="text-base font-black text-white">{def.elemento}</div>
              <div className="text-[7.5px] font-bold tracking-widest text-white/40">ELEMENTO</div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-2 py-2">
              <div className="text-base font-black text-white">{def.acunacion === 1 ? "1/1" : PAD(def.acunacion)}</div>
              <div className="text-[7.5px] font-bold tracking-widest text-white/40">TIRADA MUNDIAL</div>
            </div>
          </div>

          <div className="mt-3">
            <div className="text-[8px] font-black tracking-[0.25em] text-white/40">TUS EJEMPLARES · {ejemplares.length}</div>
            <div className="mt-1.5 max-h-28 space-y-1 overflow-y-auto pr-1">
              {ejemplares.map((e) => (
                <div key={e.uid} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 font-mono text-[9px]">
                  <span style={{ color: meta.color }}>Nº {PAD(e.serial)}/{def.acunacion}</span>
                  <span className="text-white/35">{new Date(e.ts).toLocaleDateString("es", { day: "2-digit", month: "short", year: "2-digit" })} · {e.origen.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            {duplicada && uidAFundir ? (
              <button
                onClick={() => {
                  sfxExito();
                  onFundir(uidAFundir);
                }}
                className="rounded-xl border border-amber-400/50 bg-amber-400/15 px-4 py-2 text-[10px] font-black tracking-widest text-amber-200 transition-all hover:bg-amber-400/25 active:scale-95"
              >
                FUNDIR DUPLICADA · +{meta.fundicion} ◉ +{meta.xp} XP
              </button>
            ) : (
              <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold tracking-widest text-white/40">
                {def.rareza === "UNICO" ? "LAS ÚNICAS NO SE FUNDEN" : "SIN DUPLICADAS QUE FUNDIR"}
              </span>
            )}
            <button
              onClick={onCerrar}
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-[10px] font-black tracking-widest text-white/70 transition-all hover:bg-white/15 active:scale-95"
            >
              CERRAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// VISTA PRINCIPAL
// ============================================================
export function FichasVista({
  agenteApi,
  fichasApi,
  montado,
  onAviso,
}: {
  agenteApi: AgenteApi;
  fichasApi: FichasApi;
  montado: boolean;
  onAviso: (m: string) => void;
}) {
  const { fichas, montado: fichasListas, abrirSobre, regaloDisponible, fundir, fundirTodas, resolverDef, presumirCarta } = fichasApi;
  const [sub, setSub] = useState<"sobres" | "coleccion" | "gloria">("sobres");
  const [filtro, setFiltro] = useState<CategoriaFicha | "TODAS">("TODAS");
  const [detalle, setDetalle] = useState<string | null>(null);
  const [apertura, setApertura] = useState<{ sobre: Sobre; instancias: FichaInstancia[] } | null>(null);
  const listo = montado && fichasListas;

  // reloj para el relámpago y el ticker de la red
  const [ahora, setAhora] = useState<number>(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setAhora(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const oferta = useMemo(() => paqueteRelampago(new Date(ahora)), [ahora]);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => setTick((v) => v + 1), 6000);
    return () => window.clearInterval(t);
  }, []);
  const tic = useMemo(() => mensajeTicker(fichas, tick), [fichas, tick]);
  const mensajeReloj = useCallback((ms: number) => {
    const m = Math.floor(ms / 60);
    const s = ms % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, []);

  const prestigio = useMemo(() => calcularPrestigio(fichas), [fichas]);
  const tituloE = tituloPorId(fichas.tituloEquipado);

  const stats = useMemo(() => {
    const ids = new Set(fichas.inventario.map((i) => i.fichaId));
    let descubiertas = 0;
    const porCategoria: Record<string, { tienen: number; total: number }> = {};
    for (const cat of ORDEN_CATEGORIAS) porCategoria[cat] = { tienen: 0, total: 0 };
    for (const def of CATALOGO) {
      porCategoria[def.categoria].total += 1;
      if (ids.has(def.id)) {
        descubiertas += 1;
        porCategoria[def.categoria].tienen += 1;
      }
    }
    const unicas = fichas.inventario.filter((i) => i.fichaId.startsWith("unica-"));
    return { descubiertas, total: CATALOGO.length, porCategoria, unicas: unicas.length, ejemplares: fichas.inventario.length };
  }, [fichas.inventario]);

  const duplicadas = useMemo(
    () => (listo ? duplicadasFundibles(fichas.inventario, fichas) : []),
    [listo, fichas]
  );
  const totalFundicion = duplicadas.reduce((s, d) => s + d.mon, 0);
  const copiaDe = useCallback((fichaId: string) => fichas.inventario.filter((i) => i.fichaId === fichaId).length, [fichas.inventario]);

  const comprar = useCallback(
    (sobre: Sobre) => {
      sfxClick();
      if (sobre.diario && !regaloDisponible()) {
        onAviso("El regalo diario ya fue reclamado. Vuelve mañana.");
        sfxFallo();
        return;
      }
      if (sobre.precio > agenteApi.agente.mon) {
        onAviso(`MON insuficiente: cuesta ${sobre.precio} ◉ y tienes ${agenteApi.agente.mon} ◉.`);
        sfxFallo();
        return;
      }
      const instancias = abrirSobre(sobre);
      if (!instancias) {
        onAviso("La red rechazó la transacción. Inténtalo de nuevo.");
        sfxFallo();
        return;
      }
      setApertura({ sobre, instancias });
    },
    [abrirSobre, agenteApi.agente.mon, regaloDisponible, onAviso]
  );

  const fichasFiltradas = useMemo(
    () => (filtro === "TODAS" ? CATALOGO : CATALOGO.filter((f) => f.categoria === filtro)),
    [filtro]
  );
  const unicasDelAgente = useMemo(
    () => fichas.inventario.filter((i) => i.fichaId.startsWith("unica-")).map((i) => resolverDef(i.fichaId)).filter((d): d is DefFicha => Boolean(d)),
    [fichas.inventario, resolverDef]
  );

  // restantes para la LEGENDARIA garantizada (piedad visible)
  const restantesFortuna = Math.max(0, PIEDAD_LEGENDARIA - fichas.pity);

  if (!listo) {
    return (
      <div className="h-full overflow-y-auto no-scrollbar px-4 pb-24 pt-6">
        <div className="mx-auto max-w-3xl">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-white/10" />
          <div className="mt-4 h-24 animate-pulse rounded-2xl bg-white/5" />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar px-4 pb-24 pt-5">
      <div className="mx-auto max-w-3xl">
        {/* ── HÉROE ── */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#141a26] via-[#10151f] to-[#0a0c12] p-5">
          <div className="fichas-holo pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative">
            <div className="text-[9px] font-black tracking-[0.35em] text-amber-300/80">COLECCIÓN ÚNICA EN EL MUNDO</div>
            <h2 className="mt-1 text-2xl font-black tracking-wide text-white">
              FICHAS DEL <span className="text-amber-300">LINAJE</span>
            </h2>
            <p className="mt-1 max-w-md text-[11px] leading-relaxed text-white/50">
              Cada ejemplar está sellado con un número de serie irrepetible dentro de su tirada mundial. Nadie en la red tiene tus mismas fichas. Las ÚNICAS existen una sola vez: 1 de 1.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {tituloE && (
                <div className="rounded-xl border px-3 py-1.5" style={{ borderColor: tituloE.color, background: `${tituloE.color}14` }}>
                  <span className="text-[10px] font-black tracking-wider" style={{ color: tituloE.color }}>«{tituloE.nombre}»</span>
                </div>
              )}
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-1.5">
                <span className="text-sm font-black text-amber-300">{stats.descubiertas}</span>
                <span className="text-[9px] font-bold text-amber-300/60">/{stats.total} CATÁLOGO</span>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-1.5">
                <span className="text-sm font-black text-white">{separarMiles(prestigio.total)}</span>
                <span className="text-[9px] font-bold text-white/40"> PRESTIGIO</span>
              </div>
              <div className="rounded-xl border border-white/40 bg-white/10 px-3 py-1.5">
                <span className="text-sm font-black text-white">{stats.unicas}</span>
                <span className="text-[9px] font-bold text-white/50"> ÚNICAS 1/1</span>
              </div>
              <div className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-1.5">
                <span className="text-sm font-black text-rose-300">{fichas.rachaSobres}d</span>
                <span className="text-[9px] font-bold text-rose-300/60"> RACHA DE REGALOS</span>
              </div>
            </div>
            {/* progreso por categoría */}
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ORDEN_CATEGORIAS.map((cat) => {
                const m = CATEGORIA_META[cat];
                const pc = stats.porCategoria[cat];
                const pct = Math.round((pc.tienen / pc.total) * 100);
                return (
                  <div key={cat} className="rounded-lg border border-white/10 bg-black/30 px-2 py-1.5">
                    <div className="flex items-center justify-between text-[7.5px] font-black tracking-widest" style={{ color: m.color }}>
                      <span>{m.icono} {m.etiqueta}</span>
                      <span className="text-white/40">{pc.tienen}/{pc.total}</span>
                    </div>
                    <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: m.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── SUB-PESTAÑAS ── */}
        <div className="mt-4 flex gap-2">
          {(["sobres", "coleccion", "gloria"] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                sfxClick();
                setSub(s);
              }}
              className={`flex-1 rounded-xl border px-2 py-2 text-[10px] font-black tracking-[0.2em] transition-all active:scale-95 ${
                sub === s ? "border-white/60 bg-white/15 text-white" : "border-white/10 bg-white/5 text-white/40 hover:text-white/70"
              }`}
            >
              {s === "sobres" ? "◈ SOBRES" : s === "coleccion" ? "▦ COLECCIÓN" : "✦ GLORIA"}
            </button>
          ))}
        </div>

        {/* ── SOBRES ── */}
        {sub === "sobres" && (
          <div className="mt-4">
            {/* ticker de la red — la ambencia de FOMO noble */}
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-emerald-400" />
              <span key={tick} className="fichas-ticker truncate font-mono text-[9.5px] text-white/55">
                {tic}
              </span>
            </div>

            {/* sobre relámpago — urgencia honesta por hora */}
            {oferta && (
              <button
                onClick={() => comprar(oferta.sobre)}
                className="group relative mb-3 w-full overflow-hidden rounded-2xl border border-amber-400/50 bg-gradient-to-r from-[#241a06] via-[#2c2008] to-[#0a0c12] p-3 text-left transition-all hover:border-amber-300 active:scale-[0.99]"
              >
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="fichas-pase absolute inset-y-0 w-1/4 bg-white/10" />
                </div>
                <div className="relative flex items-center gap-3">
                  <div className="w-16 shrink-0">
                    <ArteSobre sobre={oferta.sobre} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded-md bg-amber-400 px-1.5 py-0.5 text-[8px] font-black tracking-widest text-black">RELÁMPAGO</span>
                      <span className="text-[11px] font-black text-white">{oferta.sobre.nombre}</span>
                      <span className="rounded-md border border-amber-300/60 px-1 text-[8px] font-black text-amber-300">−{oferta.pct}%</span>
                    </div>
                    <div className="mt-0.5 text-[9.5px] font-bold text-amber-200/80">
                      {oferta.precio} ◉ en vez de <span className="line-through opacity-60">{oferta.precioOriginal} ◉</span>
                    </div>
                    <div className="font-mono text-[9px] text-white/45">expira en {mensajeReloj(oferta.segundosRestantes)} · una oferta distinta cada hora</div>
                  </div>
                  <span className="shrink-0 rounded-xl border border-amber-300/70 bg-amber-400/20 px-3 py-2 text-[10px] font-black tracking-widest text-amber-100 transition-all group-hover:bg-amber-400/35">CAZAR</span>
                </div>
              </button>
            )}

            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-[9px] font-black tracking-[0.25em] text-white/40">TIENDA DE SOBRES</span>
              <span className="text-[10px] font-black text-amber-300">{agenteApi.agente.mon} ◉</span>
            </div>

            {/* fortuna acumulada — la garantía visible que hace volver */}
            <div className="mb-3 rounded-2xl border border-cyan-400/25 bg-cyan-400/5 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black tracking-[0.25em] text-cyan-200">FORTUNA DE LA RED</span>
                <span className="font-mono text-[9px] text-white/40">
                  {fichas.pity}/{PIEDAD_LEGENDARIA}
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-amber-300 transition-all duration-700"
                  style={{ width: `${(fichas.pity / PIEDAD_LEGENDARIA) * 100}%` }}
                />
              </div>
              <div className="mt-1.5 text-[9.5px] font-bold text-white/50">
                {restantesFortuna <= 1 ? (
                  <span className="text-amber-300">EL PRÓXIMO SOBRE CAZA LEGENDARIA GARANTIZADA. Ábrelo.</span>
                ) : (
                  <>Cada sobre sin LEGENDARIA acerca la garantía: faltan {restantesFortuna} para la tirada bendecida.</>
                )}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {SOBRES.map((sobre) => {
                const alcanza = sobre.precio === 0 || agenteApi.agente.mon >= sobre.precio;
                const regaloHecho = Boolean(sobre.diario) && !regaloDisponible();
                return (
                  <div key={sobre.id} className={`relative overflow-hidden rounded-2xl border ${sobre.borde} bg-[#0c0f16] p-4`}>
                    {sobre.unico && <div className="fichas-holo pointer-events-none absolute inset-0 opacity-30" />}
                    <div className="relative flex gap-3">
                      <div className="w-28 shrink-0 self-center">
                        <ArteSobre sobre={sobre} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-black tracking-wider text-white">{sobre.nombre}</span>
                          {sobre.unico && <span className="rounded border border-white/50 px-1 text-[7px] font-black text-white">1/1</span>}
                        </div>
                        <p className="mt-1 text-[10px] leading-snug text-white/45">{sobre.descripcion}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 text-[7.5px] font-bold text-white/60">
                            {sobre.fichas} FICHA{sobre.fichas > 1 ? "S" : ""}
                          </span>
                          {sobre.piso !== "COMUN" && (
                            <span className="rounded-md border px-1.5 py-0.5 text-[7.5px] font-bold" style={{ borderColor: RAREZA_META[sobre.piso].color, color: RAREZA_META[sobre.piso].color }}>
                              ≥ {RAREZA_META[sobre.piso].etiqueta}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => comprar(sobre)}
                          disabled={regaloHecho || (!sobre.diario && !alcanza)}
                          className={`mt-2.5 w-full rounded-xl border px-3 py-2 text-[10px] font-black tracking-widest transition-all active:scale-95 ${
                            regaloHecho || (!sobre.diario && !alcanza)
                              ? "cursor-not-allowed border-white/10 bg-white/5 text-white/25"
                              : "border-white/30 bg-white/10 text-white hover:border-white/70 hover:bg-white/20"
                          }`}
                        >
                          {regaloHecho ? "RECLAMADO HOY ✓" : sobre.precio === 0 ? "RECLAMAR GRATIS" : `ABRIR · ${sobre.precio} ◉`}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {duplicadas.length > 0 && (
              <button
                onClick={() => {
                  const r = fundirTodas();
                  if (r.piezas > 0) {
                    sfxExito();
                    onAviso(`Fundición: ${r.piezas} ${r.piezas === 1 ? "duplicada" : "duplicadas"} → +${r.mon} ◉ +${r.xp} XP.`);
                  }
                }}
                className="mt-3 w-full rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-2.5 text-[10px] font-black tracking-widest text-amber-200 transition-all hover:bg-amber-400/20 active:scale-95"
              >
                ⚗ FUNDIR {duplicadas.length} DUPLICADA{duplicadas.length > 1 ? "S" : ""} · +{totalFundicion} ◉
              </button>
            )}
            <p className="mt-3 px-1 text-center text-[8.5px] text-white/30">
              Las fichas sobreviven al borrado del expediente: la colección es para siempre.
            </p>
          </div>
        )}

        {/* ── COLECCIÓN ── */}
        {sub === "coleccion" && (
          <div className="mt-4">
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1">
              {(["TODAS", ...ORDEN_CATEGORIAS] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => {
                    sfxClick();
                    setFiltro(f);
                  }}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-[8.5px] font-black tracking-widest transition-all active:scale-95 ${
                    filtro === f ? "border-white/60 bg-white/15 text-white" : "border-white/10 bg-white/5 text-white/40 hover:text-white/70"
                  }`}
                  style={filtro === f && f !== "TODAS" ? { borderColor: CATEGORIA_META[f].color, color: CATEGORIA_META[f].color } : undefined}
                >
                  {f === "TODAS" ? "TODAS" : `${CATEGORIA_META[f].icono} ${CATEGORIA_META[f].etiqueta}`}
                </button>
              ))}
            </div>

            {stats.ejemplares === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-10 text-center">
                <div className="text-3xl opacity-30">◈</div>
                <div className="mt-2 text-sm font-black tracking-widest text-white/60">ÁLBUM VACÍO</div>
                <p className="mx-auto mt-1 max-w-xs text-[11px] leading-relaxed text-white/35">
                  Abre tu primer sobre — el regalo diario es gratis. Cada ficha que acuñes será tuya para siempre, con su propio número de serie.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {fichasFiltradas.map((def) => {
                    const copias = copiaDe(def.id);
                    const instancia = fichas.inventario.find((i) => i.fichaId === def.id);
                    return (
                      <FichaCard
                        key={def.id}
                        def={def}
                        instancia={instancia}
                        copias={copias}
                        bloqueada={copias === 0}
                        onClick={copias > 0 ? () => {
                          sfxClick();
                          setDetalle(def.id);
                        } : undefined}
                      />
                    );
                  })}
                  {filtro === "TODAS" &&
                    unicasDelAgente.map((def) => (
                      <FichaCard
                        key={def.id}
                        def={def}
                        instancia={fichas.inventario.find((i) => i.fichaId === def.id)}
                        onClick={() => {
                          sfxClick();
                          setDetalle(def.id);
                        }}
                      />
                    ))}
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <span className="text-[9px] font-black tracking-widest text-white/40">
                    {stats.descubiertas}/{stats.total} DEL CATÁLOGO{stats.unicas > 0 ? ` · ${stats.unicas} ÚNICA${stats.unicas > 1 ? "S" : ""} 1/1` : ""}
                  </span>
                  <span className="font-mono text-[9px] text-white/25">v170.2 GLORIA</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── GLORIA — presunción, títulos, vitrina, ranking, misiones ── */}
        {sub === "gloria" && <GloriaVista fichasApi={fichasApi} onAviso={onAviso} />}
      </div>

      {/* ── OVERLAYS ── */}
      {apertura && (
        <AperturaSobre
          sobre={apertura.sobre}
          instancias={apertura.instancias}
          resolver={resolverDef}
          copiaDe={copiaDe}
          onPresumir={(def, inst) => {
            presumirCarta(def, inst);
            sfxExito();
            onAviso("Presunción emitida: tu joya ya brilla en el portapapeles de la red.");
          }}
          onCerrar={() => {
            setApertura(null);
            setSub("coleccion");
          }}
        />
      )}
      {detalle && (
        <DetalleFicha
          fichaId={detalle}
          resolver={resolverDef}
          inventario={fichas.inventario}
          onFundir={(uid) => {
            fundir(uid);
            if (copiaDe(detalle) <= 1) setDetalle(null);
          }}
          onCerrar={() => setDetalle(null)}
        />
      )}
    </div>
  );
}
