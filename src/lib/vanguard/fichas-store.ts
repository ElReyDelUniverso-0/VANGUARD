"use client";

// ============================================================
// VANGUARD v170.0 — STORE DE FICHAS COLECCIONABLES
// Inventario persistente (localStorage: vanguard.fichas.v170).
// Los sobres pagan con mon ◉ del store principal (useAgente).
// La fundición de duplicadas devuelve mon ◉ + XP.
// Las fichas SOBREVIVEN al borrado del expediente: la colección
// es para siempre.
// ============================================================

import { useCallback, useEffect, useRef, useState } from "react";
import type { AgenteApi } from "./agente-store";
import {
  type DefFicha,
  type EstadoFichas,
  type FichaInstancia,
  type Sobre,
  PIEDAD_LEGENDARIA,
  RAREZA_META,
  defDeFicha,
  duplicadasFundibles,
  esLeyenda,
  estadoInicialFichas,
  generarFichaUnica,
  tirarSobre,
} from "./fichas";
import { MISIONES, textoPresumir, textoPresumirCarta } from "./gloria";

const CLAVE = "vanguard.fichas.v170";

function hoyIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function leer(): EstadoFichas {
  if (typeof window === "undefined") return estadoInicialFichas();
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    if (!crudo) return estadoInicialFichas();
    const p = JSON.parse(crudo) as Partial<EstadoFichas>;
    const base = estadoInicialFichas();
    return {
      ...base,
      ...p,
      semilla: p.semilla ?? base.semilla,
      inventario: Array.isArray(p.inventario) ? p.inventario : [],
      seriales: p.seriales ?? {},
      vitrina: Array.isArray(p.vitrina) ? p.vitrina : [],
      misionesProgreso: p.misionesProgreso ?? {},
      misionesReclamadas: p.misionesReclamadas ?? {},
    };
  } catch {
    return estadoInicialFichas();
  }
}

function guardar(e: EstadoFichas): void {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(e));
  } catch {
    // cuota llena: la colección continúa en memoria
  }
}

function nuevoUid(fichaId: string): string {
  return `${fichaId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useFichas(agenteApi: AgenteApi) {
  const [fichas, setFichas] = useState<EstadoFichas>(estadoInicialFichas);
  const [montado, setMontado] = useState(false);
  const ref = useRef<EstadoFichas>(fichas);

  useEffect(() => {
    ref.current = fichas;
  }, [fichas]);

  useEffect(() => {
    queueMicrotask(() => {
      setFichas(leer());
      setMontado(true);
    });
  }, []);

  const mutar = useCallback((fn: (e: EstadoFichas) => EstadoFichas) => {
    setFichas((prev) => {
      const nuevo = fn(structuredClone(prev));
      guardar(nuevo);
      return nuevo;
    });
  }, []);

  // reinicio perezoso de misiones: si el día cambió, la vista ve cero
  const enDia = useCallback((e: EstadoFichas): EstadoFichas => {
    const hoy = hoyIso();
    if (e.misionesDia !== hoy) {
      e.misionesDia = hoy;
      e.misionesProgreso = {};
      e.misionesReclamadas = {};
    }
    return e;
  }, []);

  const avanzarMision = useCallback(
    (id: string, n = 1) => {
      mutar((e) => {
        enDia(e);
        e.misionesProgreso[id] = (e.misionesProgreso[id] ?? 0) + n;
        return e;
      });
    },
    [mutar, enDia]
  );

  // ── Abrir un sobre: paga, tira y acuña con serie única ─────
  const abrirSobre = useCallback(
    (sobre: Sobre): FichaInstancia[] | null => {
      if (sobre.precio > 0 && !agenteApi.pagar(sobre.precio)) return null;
      if (sobre.diario && ref.current.regaloDia === hoyIso()) return null;

      const forzarPiso = !sobre.unico && ref.current.pity >= PIEDAD_LEGENDARIA - 1 ? "LEGENDARIO" : undefined;
      const tirada = tirarSobre(sobre, forzarPiso);
      const nuevas: FichaInstancia[] = [];

      mutar((e) => {
        if (sobre.diario) {
          // racha de sobres: regalo reclamado ayer → +1; día distinto → reinicia
          if (e.regaloDia) {
            const ayer = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
            e.rachaSobres = e.regaloDia === ayer ? e.rachaSobres + 1 : 1;
          } else {
            e.rachaSobres = 1;
          }
          e.regaloDia = hoyIso();
        }
        e.sobresAbiertos += 1;
        let huboLeyenda = Boolean(forzarPiso);
        for (let i = 0; i < tirada.length; i++) {
          if (sobre.unico) {
            // ficha ÚNICA 1/1: determinista por semilla del agente
            e.unicas += 1;
            const def = generarFichaUnica(e.semilla, e.unicas);
            const inst: FichaInstancia = { uid: nuevoUid(def.id), fichaId: def.id, serial: 1, ts: Date.now(), origen: sobre.id };
            e.inventario.push(inst);
            nuevas.push(inst);
            huboLeyenda = true;
            continue;
          }
          const def = tirada[i];
          if (!def) continue;
          if (esLeyenda(def.rareza)) huboLeyenda = true;
          const usados = e.seriales[def.id] ?? [];
          const serial = reservar(usados, def.acunacion);
          e.seriales[def.id] = [...usados, serial];
          const inst: FichaInstancia = { uid: nuevoUid(def.id), fichaId: def.id, serial, ts: Date.now(), origen: sobre.id };
          e.inventario.push(inst);
          nuevas.push(inst);
        }
        // piedad: leyenda → reset; sin leyenda → acumula (la garantía se acerca)
        e.pity = huboLeyenda ? 0 : Math.min(e.pity + 1, PIEDAD_LEGENDARIA - 1);
        enDia(e);
        e.misionesProgreso.sobres = (e.misionesProgreso.sobres ?? 0) + 1;
        return e;
      });

      return nuevas;
    },
    [agenteApi, mutar, enDia]
  );

  // ── Regalo diario disponible ────────────────────────────────
  const regaloDisponible = useCallback((): boolean => {
    return ref.current.regaloDia !== hoyIso();
  }, []);

  // ── Fundir una duplicada concreta ───────────────────────────
  const fundir = useCallback(
    (uid: string): boolean => {
      const inst = ref.current.inventario.find((i) => i.uid === uid);
      if (!inst) return false;
      const def = defDeFicha(inst.fichaId, ref.current);
      if (!def) return false;
      const meta = RAREZA_META[def.rareza];
      if (meta.fundicion <= 0) return false;
      const copias = ref.current.inventario.filter((i) => i.fichaId === inst.fichaId).length;
      if (copias <= 1) return false;
      agenteApi.recompensar(meta.fundicion, meta.xp, "fundicion");
      mutar((e) => {
        e.inventario = e.inventario.filter((i) => i.uid !== uid);
        e.vitrina = e.vitrina.filter((v) => v !== uid);
        enDia(e);
        e.misionesProgreso.fundir = (e.misionesProgreso.fundir ?? 0) + 1;
        return e;
      });
      return true;
    },
    [agenteApi, mutar, enDia]
  );

  // ── Fundir TODAS las duplicadas de golpe ────────────────────
  const fundirTodas = useCallback((): { mon: number; xp: number; piezas: number } => {
    const lista = duplicadasFundibles(ref.current.inventario, ref.current);
    if (lista.length === 0) return { mon: 0, xp: 0, piezas: 0 };
    const mon = lista.reduce((s, d) => s + d.mon, 0);
    const xp = lista.reduce((s, d) => s + d.xp, 0);
    const uids = new Set(lista.map((d) => d.uid));
    agenteApi.recompensar(mon, xp, "fundicion-total");
    mutar((e) => {
      e.inventario = e.inventario.filter((i) => !uids.has(i.uid));
      e.vitrina = e.vitrina.filter((v) => !uids.has(v));
      enDia(e);
      e.misionesProgreso.fundir = (e.misionesProgreso.fundir ?? 0) + lista.length;
      return e;
    });
    return { mon, xp, piezas: lista.length };
  }, [agenteApi, mutar, enDia]);

  // ── Resolver la definición de una ficha (base o ÚNICA) ──────
  const resolverDef = useCallback(
    (fichaId: string): DefFicha | undefined => defDeFicha(fichaId, ref.current),
    []
  );

  // ============================================================
  // v170.2 «GLORIA» — presunción, exclusividad, adicción
  // ============================================================

  // ── Equipar / quitar título ─────────────────────────────────
  const equiparTitulo = useCallback(
    (id: string | null) => {
      mutar((e) => {
        e.tituloEquipado = id;
        return e;
      });
    },
    [mutar]
  );

  // ── Vitrina: exhibir hasta 3 ejemplares ─────────────────────
  const MAX_VITRINA = 3;
  const alternarVitrina = useCallback(
    (uid: string): boolean => {
      const existe = ref.current.inventario.some((i) => i.uid === uid);
      if (!existe) return false;
      let añadido = false;
      mutar((e) => {
        if (e.vitrina.includes(uid)) {
          e.vitrina = e.vitrina.filter((v) => v !== uid);
        } else if (e.vitrina.length < MAX_VITRINA) {
          e.vitrina = [...e.vitrina, uid];
          añadido = true;
        }
        return e;
      });
      return añadido || ref.current.vitrina.includes(uid);
    },
    [mutar]
  );

  // ── Reclamar misión diaria ──────────────────────────────────
  const reclamarMision = useCallback(
    (id: string): boolean => {
      const mision = MISIONES.find((m) => m.id === id);
      if (!mision) return false;
      const e0 = ref.current;
      if (e0.misionesDia !== hoyIso()) return false;
      if (e0.misionesReclamadas[id]) return false;
      if ((e0.misionesProgreso[id] ?? 0) < mision.objetivo) return false;
      agenteApi.recompensar(mision.mon, mision.xp, "mision-fichas");
      mutar((e) => {
        e.misionesReclamadas[id] = true;
        return e;
      });
      return true;
    },
    [agenteApi, mutar]
  );

  // ── PRESUMIR: copia el texto de flex y contabiliza ─────────
  const presumir = useCallback((): { texto: string | null; copiado: boolean } => {
    const e0 = ref.current;
    const vitrinaPiezas = e0.vitrina
      .map((uid) => e0.inventario.find((i) => i.uid === uid))
      .filter((i): i is FichaInstancia => Boolean(i))
      .map((i) => ({ def: defDeFicha(i.fichaId, e0), instancia: i }))
      .filter((p): p is { def: DefFicha; instancia: FichaInstancia } => Boolean(p.def));
    const texto = textoPresumir(e0, vitrinaPiezas);
    let copiado = false;
    try {
      copiado = typeof navigator !== "undefined" && Boolean(navigator.clipboard?.writeText);
      if (copiado && navigator.clipboard) void navigator.clipboard.writeText(texto).catch(() => {});
    } catch {
      copiado = false;
    }
    mutar((e) => {
      enDia(e);
      e.presumidas += 1;
      e.misionesProgreso.presumir = (e.misionesProgreso.presumir ?? 0) + 1;
      return e;
    });
    return { texto, copiado };
  }, [mutar, enDia]);

  // ── Presunción de una carta concreta (celebración) ──────────
  const presumirCarta = useCallback(
    (def: DefFicha, instancia?: FichaInstancia): string => {
      const texto = textoPresumirCarta(def, instancia);
      try {
        void navigator.clipboard?.writeText(texto).catch(() => {});
      } catch {
        // sin portapapeles: el texto se muestra igualmente
      }
      mutar((e) => {
        enDia(e);
        e.presumidas += 1;
        e.misionesProgreso.presumir = (e.misionesProgreso.presumir ?? 0) + 1;
        return e;
      });
      return texto;
    },
    [mutar, enDia]
  );

  return {
    fichas,
    montado,
    abrirSobre,
    regaloDisponible,
    fundir,
    fundirTodas,
    resolverDef,
    equiparTitulo,
    alternarVitrina,
    reclamarMision,
    presumir,
    presumirCarta,
    avanzarMision,
  };
}

// re-export local para claridad del módulo
function reservar(usados: number[], acunacion: number): number {
  const techo = Math.min(acunacion, 300);
  if (usados.length >= techo) return 1 + Math.floor(Math.random() * acunacion);
  for (let i = 0; i < 12; i++) {
    const s = 1 + Math.floor(Math.random() * acunacion);
    if (!usados.includes(s)) return s;
  }
  return 1 + Math.floor(Math.random() * acunacion);
}

export type FichasApi = ReturnType<typeof useFichas>;
