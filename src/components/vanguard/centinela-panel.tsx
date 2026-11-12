"use client";

// ============================================================
// v367.1 EL OJO DEL DUEÑO — EL PANEL DEL CENTINELA (client)
//
// Cruza TU lista (local, sin servidor) con el parte REAL del día que sirve
// /api/cronica. La regla es una sola: lo que la casa te cuenta de tu lista
// es siempre lo que el archivo registró — con su fuente y su fecha — o un
// «SIN SEÑAL EN 24 H» honesto. Nunca un aviso inventado para que vuelvas.
//
// Se espera a la hidratación con useIsHydrated() (patrón v327): la lista
// vive en el aparato y el servidor no puede conocerla, así que pintarla
// antes de hidratar sería un desajuste garantizado.
// ============================================================

import { useCallback, useEffect, useState } from "react";
import { useIsHydrated } from "@/lib/hidratacion";
import { estaSeguido, useCentinela, type TipoSeguido } from "@/lib/centinela";
import { fechaHora } from "@/lib/procedencia";
import type { ParteCronica } from "@/lib/cronica";

export function CentinelaPanel({ inicial }: { inicial: ParteCronica }) {
  const hidratado = useIsHydrated();
  const seguidos = useCentinela((s) => s.seguidos);
  const seguir = useCentinela((s) => s.seguir);
  const soltar = useCentinela((s) => s.soltar);
  const limpiar = useCentinela((s) => s.limpiar);

  const [parte, setParte] = useState<ParteCronica>(inicial);
  const [refrescando, setRefrescando] = useState(false);

  const refrescar = useCallback(async () => {
    setRefrescando(true);
    try {
      const r = await fetch("/api/cronica", { cache: "no-store" });
      const datos = (await r.json()) as ParteCronica;
      if (datos && typeof datos.ok === "boolean") setParte(datos);
    } catch {
      /* se queda el parte anterior: viejo y verdadero antes que nuevo e inventado */
    } finally {
      setRefrescando(false);
    }
  }, []);

  // una lectura fresca al entrar: el parte del servidor puede tener minutos
  useEffect(() => {
    void refrescar();
  }, [refrescar]);

  const alternar = useCallback(
    (tipo: TipoSeguido, clave: string) => {
      if (estaSeguido(seguidos, tipo, clave)) soltar(tipo, clave);
      else seguir(tipo, clave);
    },
    [seguidos, seguir, soltar],
  );

  const teatrosSeguidos = seguidos.filter((s) => s.tipo === "teatro");
  const mediosSeguidos = seguidos.filter((s) => s.tipo === "medio");

  return (
    <div className="flex flex-col gap-6">
      {/* ── TU LISTA ── */}
      <section className="rounded-md border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400">
            TU CENTINELA · {hidratado ? `${seguidos.length} bajo vigilancia` : "leyendo tu lista…"}
          </p>
          {hidratado && seguidos.length > 0 ? (
            <button
              type="button"
              onClick={() => limpiar()}
              className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 hover:text-red-300"
            >
              soltar todo
            </button>
          ) : null}
        </div>

        {!hidratado ? (
          <p className="mt-2 text-sm text-zinc-500">Un momento: la lista vive en tu aparato.</p>
        ) : seguidos.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-400">
            Nada bajo vigilancia todavía. Toca un teatro o un medio de las listas de abajo y esta
            sala te dirá — cada vez que entres — cuánto ha hablado, con la fecha de su última
            señal. Sin avisos inventados y sin permiso de notificaciones.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {[...teatrosSeguidos, ...mediosSeguidos].map((s) => {
              const enParte =
                s.tipo === "teatro"
                  ? parte.teatros.find((t) => t.tag === s.clave)
                  : undefined;
              const medioEnParte =
                s.tipo === "medio" ? parte.medios.find((m) => m.medio === s.clave) : undefined;
              const hoy = s.tipo === "teatro" ? (enParte?.hoy ?? 0) : (medioEnParte?.hoy ?? 0);
              const semana =
                s.tipo === "teatro" ? (enParte?.semana ?? 0) : (medioEnParte?.enVentana ?? 0);
              const ultimo =
                s.tipo === "teatro" ? enParte?.ultimo?.publicado ?? null : medioEnParte?.ultimo ?? null;
              return (
                <div
                  key={`${s.tipo}-${s.clave}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-zinc-800 bg-zinc-950/60 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-zinc-200">
                      <span className="text-zinc-600">{s.tipo === "teatro" ? "TEATRO" : "MEDIO"} · </span>
                      {s.clave}
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-500">
                      {parte.ok
                        ? hoy === 0 && semana === 0
                          ? "SIN SEÑAL EN 24 H — silencio de verdad, no un aviso inventado"
                          : `${hoy} hoy · ${semana} en la ventana${ultimo ? ` · último ${fechaHora(ultimo)}` : ""}`
                        : "SIN SEÑAL — el archivo no respondió"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => alternar(s.tipo, s.clave)}
                    className="rounded-sm border border-zinc-700 px-2 py-1 font-mono text-[9px] uppercase tracking-widest text-zinc-400 hover:border-red-400/60 hover:text-red-300"
                  >
                    soltar
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-600">
          Tu lista vive en este aparato (localStorage, clave vg367-centinela). No viaja a ningún
          servidor: nadie sabe a quién sigues.
        </p>
      </section>

      {/* ── LO QUE HAY PARA SEGUIR HOY (datos reales) ── */}
      {!parte.ok ? (
        <div className="rounded-md border border-red-500/30 bg-red-500/5 p-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-red-300">SIN SEÑAL</p>
          <p className="mt-2 text-sm text-zinc-400">{parte.nota}</p>
        </div>
      ) : (
        <>
          <section>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-amber-300">Teatros con señal hoy</h2>
              <button
                type="button"
                onClick={() => void refrescar()}
                disabled={refrescando}
                className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 hover:text-amber disabled:opacity-40"
              >
                {refrescando ? "LEYENDO…" : "ACTUALIZAR"}
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {parte.teatros.length === 0 ? (
                <p className="text-sm text-zinc-500">Ningún teatro con señal en la ventana.</p>
              ) : (
                parte.teatros.map((t) => {
                  const activo = hidratado && estaSeguido(seguidos, "teatro", t.tag);
                  return (
                    <button
                      key={t.tag}
                      type="button"
                      onClick={() => alternar("teatro", t.tag)}
                      className={`rounded-sm border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                        activo
                          ? "border-amber-500/60 bg-amber-500/15 text-amber-300"
                          : "border-zinc-700 bg-zinc-900/70 text-zinc-300 hover:border-amber-hud hover:text-amber"
                      }`}
                      title={`${t.hoy} cables hoy · ${t.semana} en 7 días`}
                    >
                      {activo ? "◉" : "○"} {t.tag}{" "}
                      <span className="text-amber">{t.hoy}</span>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-bold text-amber-300">Medios que firmaron hoy</h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {parte.medios.length === 0 ? (
                <p className="text-sm text-zinc-500">Ningún medio en la ventana.</p>
              ) : (
                parte.medios.map((m) => {
                  const activo = hidratado && estaSeguido(seguidos, "medio", m.medio);
                  return (
                    <button
                      key={m.medio}
                      type="button"
                      onClick={() => alternar("medio", m.medio)}
                      className={`rounded-sm border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                        activo
                          ? "border-amber-500/60 bg-amber-500/15 text-amber-300"
                          : "border-zinc-700 bg-zinc-900/70 text-zinc-300 hover:border-amber-hud hover:text-amber"
                      }`}
                      title={`${m.hoy} cables hoy · ${m.enVentana} en la ventana`}
                    >
                      {activo ? "◉" : "○"} {m.medio}{" "}
                      <span className="text-amber">{m.hoy}</span>
                    </button>
                  );
                })
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
