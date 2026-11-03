"use client";

// ============================================================
// VANGUARD v170.2 «GLORIA» — VISTA DE PRESUNCIÓN Y EXCLUSIVIDAD
// Títulos que se equipan, vitrina de 3 joyas, prestigio con
// desglose, ranking mundial diario, misiones diarias y el gran
// botón PRESUMIR. Todo local, todo del agente.
// ============================================================

import { useMemo, useState } from "react";
import {
  type DefFicha,
  type FichaInstancia,
  CATALOGO,
  ORDEN_RAREZA,
  RAREZA_META,
} from "@/lib/vanguard/fichas";
import {
  MISIONES,
  PRESTIGIO_RAREZA,
  TITULOS,
  calcularPrestigio,
  misionReclamada,
  progresoMision,
  rankingMundial,
  separarMiles,
  tituloPorId,
} from "@/lib/vanguard/gloria";
import { sfxClick, sfxExito, sfxFallo } from "@/lib/vanguard/sonido";
import { FichaCard } from "./fichas-arte";
import type { FichasApi } from "@/lib/vanguard/fichas-store";

const PAD = (n: number): string => (n < 10 ? `00${n}` : n < 100 ? `0${n}` : `${n}`);

// ── Modal de respaldo cuando el portapapeles está bloqueado ──
function ModalPresuncion({ texto, onCerrar }: { texto: string; onCerrar: () => void }) {
  return (
    <div className="fixed inset-0 z-[75] grid place-items-center bg-black/85 px-4 backdrop-blur-md" onClick={onCerrar}>
      <div className="w-full max-w-md rounded-2xl border border-amber-400/40 bg-[#0c0f16] p-4" onClick={(e) => e.stopPropagation()}>
        <div className="text-[10px] font-black tracking-[0.3em] text-amber-300">TU PRESUNCIÓN</div>
        <p className="mt-1 text-[10px] text-white/40">El navegador bloqueó el portapapeles. Copia a mano y presume.</p>
        <textarea
          readOnly
          value={texto}
          className="mt-2 h-44 w-full resize-none rounded-xl border border-white/15 bg-black/60 p-3 font-mono text-[10px] leading-relaxed text-emerald-200"
          onFocus={(e) => e.currentTarget.select()}
        />
        <button
          onClick={onCerrar}
          className="mt-2 w-full rounded-xl border border-white/25 bg-white/10 px-4 py-2 text-[10px] font-black tracking-widest text-white transition-all hover:bg-white/20 active:scale-95"
        >
          CERRAR
        </button>
      </div>
    </div>
  );
}

export function GloriaVista({
  fichasApi,
  onAviso,
}: {
  fichasApi: FichasApi;
  onAviso: (m: string) => void;
}) {
  const { fichas, resolverDef, equiparTitulo, alternarVitrina, reclamarMision, presumir } = fichasApi;
  const [textoModal, setTextoModal] = useState<string | null>(null);

  // ── datos derivados ──
  const desglose = useMemo(() => calcularPrestigio(fichas), [fichas]);
  const rank = useMemo(() => rankingMundial(fichas), [fichas]);
  const tituloEquipado = tituloPorId(fichas.tituloEquipado);

  const vitrinaPiezas = useMemo(() => {
    const salida: { def: DefFicha; instancia: FichaInstancia }[] = [];
    for (const uid of fichas.vitrina) {
      const inst = fichas.inventario.find((i) => i.uid === uid);
      if (!inst) continue;
      const def = resolverDef(inst.fichaId);
      if (def) salida.push({ def, instancia: inst });
    }
    return salida;
  }, [fichas.vitrina, fichas.inventario, resolverDef]);

  // primera instancia de cada ficha distinta poseída (incluye ÚNICAS)
  const poseidas = useMemo(() => {
    const vistas = new Set<string>();
    const salida: FichaInstancia[] = [];
    for (const inst of fichas.inventario) {
      if (vistas.has(inst.fichaId)) continue;
      vistas.add(inst.fichaId);
      salida.push(inst);
    }
    return salida;
  }, [fichas.inventario]);

  const desbloqueadasIds = useMemo(() => new Set(desglose.desbloqueados.map((t) => t.id)), [desglose.desbloqueados]);

  // ── acciones ──
  const presumirAhora = () => {
    sfxExito();
    const r = presumir();
    onAviso(
      r.copiado
        ? "COPIADO AL PORTAPAPELES · pégalo donde quieras presumir."
        : "Presunción lista: ábrela y cópiala a mano."
    );
    if (!r.copiado && r.texto) setTextoModal(r.texto);
  };

  const ponerVitrina = (uid: string) => {
    sfxClick();
    const yaEsta = fichas.vitrina.includes(uid);
    if (!yaEsta && fichas.vitrina.length >= 3) {
      sfxFallo();
      onAviso("La vitrina solo exhibe 3 joyas. Quita una para poner otra.");
      return;
    }
    alternarVitrina(uid);
  };

  return (
    <div className="mt-4 space-y-4">
      {/* ══ PRESUMIR — el gran botón ══ */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-br from-[#241a06] via-[#161006] to-[#0a0c12] p-5">
        <div className="fichas-holo pointer-events-none absolute inset-0 opacity-25" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="fichas-pase absolute inset-y-0 w-1/4 bg-white/10" />
        </div>
        <div className="relative flex flex-col items-center text-center">
          <div className="text-[9px] font-black tracking-[0.35em] text-amber-300/80">PRESUNCIÓN DEL LINAJE</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-4xl font-black text-amber-300">{separarMiles(desglose.total)}</span>
            <span className="text-[10px] font-black tracking-widest text-white/50">PRESTIGIO</span>
          </div>
          <div className="mt-0.5 text-[10px] font-bold text-white/50">
            TOP {rank.pctTop}% DEL MUNDO · {tituloEquipado ? `«${tituloEquipado.nombre}»` : "SIN TÍTULO"}
          </div>
          <button
            onClick={presumirAhora}
            className="mt-3 w-full max-w-xs rounded-xl border border-amber-300/70 bg-gradient-to-r from-amber-500/30 via-amber-300/40 to-amber-500/30 px-6 py-3 text-xs font-black tracking-[0.3em] text-amber-100 shadow-[0_0_30px_-6px_rgba(255,201,77,0.6)] transition-all hover:from-amber-500/50 hover:via-amber-300/60 hover:to-amber-500/50 active:scale-95"
          >
            ◈ PRESUMIR COLECCIÓN ◈
          </button>
          <div className="mt-1.5 font-mono text-[9px] text-white/35">
            {fichas.presumidas === 0
              ? "nadie sabe aún lo que tienes"
              : `${fichas.presumidas} presunción${fichas.presumidas > 1 ? "es" : ""} emitida${fichas.presumidas > 1 ? "s" : ""}`}
          </div>
        </div>
      </div>

      {/* ══ MISIONES DIARIAS — volver mañana ══ */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black tracking-[0.25em] text-white/50">MISIONES DE HOY</span>
          <span className="text-[8.5px] font-mono text-white/30">se renuevan a medianoche</span>
        </div>
        <div className="mt-3 space-y-2">
          {MISIONES.map((m) => {
            const progreso = Math.min(progresoMision(fichas, m), m.objetivo);
            const completa = progreso >= m.objetivo;
            const reclamada = misionReclamada(fichas, m);
            const pct = Math.round((progreso / m.objetivo) * 100);
            return (
              <div key={m.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-black tracking-wider ${reclamada ? "text-white/30 line-through" : "text-white"}`}>
                    {m.texto}
                  </span>
                  <span className="shrink-0 rounded-md border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[8.5px] font-black text-amber-300">
                    +{m.mon} ◉ +{m.xp} XP
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${completa ? "bg-emerald-400" : "bg-cyan-400/70"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-[9px] text-white/40">
                    {progreso}/{m.objetivo}
                  </span>
                  {reclamada ? (
                    <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-[9px] font-black tracking-widest text-white/30">
                      RECLAMADA ✓
                    </span>
                  ) : completa ? (
                    <button
                      onClick={() => {
                        if (reclamarMision(m.id)) {
                          sfxExito();
                          onAviso(`Misión cumplida: +${m.mon} ◉ +${m.xp} XP. La gloria tiene recompensa.`);
                        } else {
                          sfxFallo();
                        }
                      }}
                      className="rounded-lg border border-emerald-400/50 bg-emerald-400/15 px-3 py-1 text-[9px] font-black tracking-widest text-emerald-200 transition-all hover:bg-emerald-400/25 active:scale-95"
                    >
                      RECLAMAR
                    </button>
                  ) : (
                    <span className="text-[9px] font-bold text-white/25">en curso…</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ TÍTULOS — insignias que envidian ══ */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black tracking-[0.25em] text-white/50">TÍTULOS EXCLUSIVOS</span>
          <span className="text-[8.5px] font-mono text-white/30">
            {desglose.desbloqueados.length}/{TITULOS.length} desbloqueados
          </span>
        </div>
        <p className="mt-1 text-[10px] text-white/40">
          El título equipado se exhibe en tu HUD, tu perfil y tu presunción. Toca uno desbloqueado para llevarlo.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {TITULOS.map((t) => {
            const desbloqueado = desbloqueadasIds.has(t.id);
            const equipado = fichas.tituloEquipado === t.id;
            return (
              <button
                key={t.id}
                disabled={!desbloqueado}
                onClick={() => {
                  sfxClick();
                  equiparTitulo(equipado ? null : t.id);
                  onAviso(equipado ? "Título guardado en el cofre." : `Título equipado: «${t.nombre}». Que tiemble la red.`);
                }}
                className={`rounded-xl border p-3 text-left transition-all ${
                  equipado
                    ? "border-white/60 bg-white/15"
                    : desbloqueado
                      ? "border-white/15 bg-black/30 hover:border-white/40 active:scale-[0.98]"
                      : "cursor-not-allowed border-white/5 bg-black/20"
                }`}
                style={desbloqueado && !equipado ? { boxShadow: `inset 3px 0 0 ${t.color}` } : undefined}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-[10.5px] font-black tracking-wider"
                    style={{ color: desbloqueado ? t.color : "#4a5260" }}
                  >
                    {desbloqueado ? "" : "🔒 "}{t.nombre}
                  </span>
                  {equipado && (
                    <span className="shrink-0 rounded border border-white/50 px-1 py-0.5 text-[7px] font-black tracking-widest text-white">
                      EQUIPADO
                    </span>
                  )}
                </div>
                <div className={`mt-0.5 text-[9px] ${desbloqueado ? "text-white/45" : "text-white/25"}`}>
                  {desbloqueado ? `${t.descripcion} · +${t.bonus} prestigio` : t.descripcion}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══ VITRINA — las 3 joyas públicas ══ */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black tracking-[0.25em] text-white/50">VITRINA PÚBLICA</span>
          <span className="text-[8.5px] font-mono text-white/30">{vitrinaPiezas.length}/3 joyas · se exhibe en tu perfil</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[0, 1, 2].map((slot) => {
            const pieza = vitrinaPiezas[slot];
            if (!pieza) {
              return (
                <div
                  key={slot}
                  className="grid aspect-[3/4] place-items-center rounded-xl border border-dashed border-white/15 bg-black/20"
                >
                  <span className="text-center text-[8px] font-bold leading-relaxed text-white/25">
                    slot {slot + 1}
                    <br />
                    vacío
                  </span>
                </div>
              );
            }
            return (
              <FichaCard
                key={pieza.instancia.uid}
                def={pieza.def}
                instancia={pieza.instancia}
                tamaño="sm"
                onClick={() => {
                  sfxClick();
                  alternarVitrina(pieza.instancia.uid);
                }}
                className={fichas.vitrina.includes(pieza.instancia.uid) ? "" : "opacity-40"}
              />
            );
          })}
        </div>

        {/* selector de joyas */}
        {poseidas.length > 0 ? (
          <>
            <div className="mt-3 text-[8.5px] font-bold tracking-widest text-white/35">TOCA UNA JOYA PARA EXHIBIRLA O RETIRARLA</div>
            <div className="no-scrollbar mt-2 flex gap-2 overflow-x-auto pb-1">
              {poseidas.map((inst) => {
                const def = resolverDef(inst.fichaId);
                if (!def) return null;
                const enVitrina = fichas.vitrina.includes(inst.uid);
                return (
                  <div key={inst.uid} className={`w-20 shrink-0 ${enVitrina ? "ring-2 ring-amber-300 rounded-xl" : ""}`}>
                    <FichaCard
                      def={def}
                      instancia={inst}
                      tamaño="sm"
                      onClick={() => ponerVitrina(inst.uid)}
                    />
                    {enVitrina && (
                      <div className="mt-0.5 text-center text-[7px] font-black tracking-widest text-amber-300">EN VITRINA</div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="mt-3 text-[10px] text-white/30">
            Aún no tienes fichas que presumir. Abre el regalo diario en SOBRES: gratis.
          </p>
        )}
      </div>

      {/* ══ PRESTIGIO — desglose ══ */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-[9px] font-black tracking-[0.25em] text-white/50">DESGLOSE DE PRESTIGIO</div>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {ORDEN_RAREZA.map((r) => {
            const meta = RAREZA_META[r];
            const n = desglose.porRareza[r];
            return (
              <div key={r} className="rounded-xl border border-white/10 bg-black/30 px-2 py-2 text-center">
                <div className="text-[7.5px] font-black tracking-widest" style={{ color: meta.color }}>
                  {meta.etiqueta}
                </div>
                <div className="mt-0.5 text-sm font-black text-white">{n}</div>
                <div className="font-mono text-[7.5px] text-white/30">×{PRESTIGIO_RAREZA[r]}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 space-y-1 font-mono text-[10px]">
          <div className="flex justify-between text-white/50">
            <span>base de colección</span>
            <span>{separarMiles(desglose.base)}</span>
          </div>
          <div className="flex justify-between text-white/50">
            <span>bonus de títulos ({desglose.desbloqueados.length})</span>
            <span className="text-amber-300">+{separarMiles(desglose.bonusTitulos)}</span>
          </div>
          <div className="flex justify-between border-t border-white/10 pt-1 text-[11px] font-black text-white">
            <span>TOTAL</span>
            <span className="text-amber-300">{separarMiles(desglose.total)}</span>
          </div>
        </div>
      </div>

      {/* ══ RANKING MUNDIAL — rivalidad diaria ══ */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black tracking-[0.25em] text-white/50">RANKING MUNDIAL DE COLECCIONISTAS</span>
          <span className="text-[8.5px] font-mono text-white/30">nueva rivalidad cada día</span>
        </div>
        <p className="mt-1 text-[10px] text-white/40">
          Vas {rank.posicion}º de {rank.filas.length} en la rivalidad de hoy. Cada ficha MÍTICA o ÚNICA te sube en la tabla.
        </p>
        <div className="mt-3 space-y-1">
          {rank.filas.map((f, i) => (
            <div
              key={`${f.nombre}-${i}`}
              className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 ${
                f.tu ? "border-amber-400/50 bg-amber-400/10" : "border-white/5 bg-black/20"
              }`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className={`w-6 shrink-0 text-right font-mono text-[10px] ${i < 3 ? "text-amber-300" : "text-white/35"}`}>
                  {i === 0 ? "1º" : i === 1 ? "2º" : i === 2 ? "3º" : `${i + 1}º`}
                </span>
                <span className={`truncate text-[10.5px] font-bold ${f.tu ? "text-amber-200" : "text-white/70"}`}>
                  {f.tu ? "TÚ" : f.nombre}
                  {f.tu && f.titulo ? ` · «${f.titulo}»` : ""}
                </span>
              </span>
              <span className={`shrink-0 font-mono text-[10px] ${f.tu ? "text-amber-300" : "text-white/40"}`}>
                {separarMiles(f.prestigio)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ══ CATÁLOGO-PEGA — near-miss de categorías ══ */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="text-[9px] font-black tracking-[0.25em] text-white/50">A UN PASO DE LA GLORIA</div>
        <div className="mt-3 space-y-2">
          {[
            { id: "senor-armas", cat: "ARMAS" as const },
            { id: "cronista", cat: "GUERRAS" as const },
            { id: "maestro", cat: "PERSONAJES" as const },
            { id: "guardian", cat: "SIMBOLOS" as const },
          ].map(({ id, cat }) => {
            const titulo = TITULOS.find((t) => t.id === id);
            if (!titulo) return null;
            const tienen = desglose.desbloqueados.some((t) => t.id === id);
            if (tienen) return null;
            const total = cat === "ARMAS" || cat === "PERSONAJES" ? 14 : 12;
            const n = CATALOGO.filter((f) => f.categoria === cat).filter((f) => fichas.inventario.some((i) => i.fichaId === f.id)).length;
            const faltan = total - n;
            return (
              <div key={id} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-3 py-2">
                <span className="text-[10px] font-bold text-white/70">
                  {faltan <= 3 ? (
                    <>
                      A <span className="font-black text-amber-300">{faltan}</span> ficha{faltan === 1 ? "" : "s"} del título «
                      <span style={{ color: titulo.color }}>{titulo.nombre}</span>»
                    </>
                  ) : (
                    <>
                      «<span style={{ color: titulo.color }}>{titulo.nombre}</span>» · {n}/{total}
                    </>
                  )}
                </span>
                <span className="font-mono text-[9px] text-white/30">+{titulo.bonus} prestigio</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* modal de portapapeles */}
      {textoModal && <ModalPresuncion texto={textoModal} onCerrar={() => setTextoModal(null)} />}

      {/* pie de versión */}
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
        <span className="text-[9px] font-black tracking-widest text-white/40">
          {desglose.desbloqueados.length}/{TITULOS.length} TÍTULOS · {PAD(poseidas.length)} FICHAS DISTINTAS
        </span>
        <span className="font-mono text-[9px] text-white/25">v170.2 GLORIA</span>
      </div>
    </div>
  );
}
