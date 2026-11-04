"use client";

// ══════════════════════════════════════════════════════════════════════
// v232.0 LA CENTRAL DE ALARMAS — la campana de la Agencia.
// El Dueño mandó: «noticias EN VIVO por importancia e impacto». El
// CENTRO (v173) ranquea; la CENTRAL AVISA: cuando aterriza un cable
// de alto impacto recién nacido, la campana del HUD suena — sin que
// el visitante esté mirando el rango.
//
// LA LEY DE LA ALARMA (determinista como el motor de impacto):
//   · UMBRAL — impacto ≥ CRÍTICO (64, el mismo escalón de TIERS).
//   · VENTANA — nacido hace < 120 min (la misma ventana EN VIVO que
//     lucen los marcadores del mapa 3D y el anillo de alarma).
// La misma entrada produce siempre las mismas alarmas: auditable.
//
// DISCIPLINA DE LA CASA: storage blindado (patrón v171/v172 — el store
// entra al REHIDRATADOR o su cerradura bloquea la persistencia),
// rehidratación post-montaje, cero parpadeo #418.
// ══════════════════════════════════════════════════════════════════════
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storageBlindado } from "@/lib/storage-blindado";
import { TIERS, type NoticiaRanqueada } from "@/lib/impacto";

export const UMBRAL_ALARMA = TIERS.critico.min; // 64 — CRÍTICO alcanza
export const VENTANA_MIN = 120; // la misma ventana EN VIVO del mundo

export interface AlarmaItem {
  id: string;
  titulo: string;
  url: string;
  fuente: string;
  tier: NoticiaRanqueada["tier"];
  impacto: number;
  pais: string;
  tag: string | null;
  country: string | null;
  nacido: number; // ms del publishedAt — la edad manda en el orden
  edadMin: number; // edad al momento del barrido
}

interface AlarmaState {
  /** ids ya escaneados por la Central — nada alarma dos veces (FIFO, techo) */
  vistos: string[];
  /** sin leer — la campana del HUD las cuenta; leer el CENTRO las revisa */
  pendientes: AlarmaItem[];
  ultimaRevision: number;
  /** el barrido: registra el lote ranqueado y devuelve cuántas alarmas NUEVAS nacieron */
  entrada: (lista: NoticiaRanqueada[]) => number;
  /** una alarma se leyó (abierta desde la campana) */
  leer: (id: string) => void;
  /** todo revisado — abrir el CENTRO o vaciar la campana */
  limpiar: () => void;
}

const MAX_VISTOS = 240;
const MAX_PENDIENTES = 9; // la campana no traga el archivo — el CENTRO lo sirve

function aItem(n: NoticiaRanqueada): AlarmaItem {
  const t = typeof n.publishedAt === "string" ? new Date(n.publishedAt).getTime() : (n.publishedAt as Date)?.getTime?.() ?? Date.now();
  return {
    id: n.id,
    titulo: n.title || "SIN TITULAR",
    url: n.url || "",
    fuente: (n.source || "AGENCIA").toUpperCase().slice(0, 18),
    tier: n.tier,
    impacto: n.impacto,
    pais: n.paisNombre,
    tag: (n.tacticalTag || null),
    country: n.sourceCountry || null,
    nacido: Number.isFinite(t) ? t : Date.now(),
    edadMin: n.edadMin,
  };
}

export const useAlarma = create<AlarmaState>()(
  persist(
    (set, get) => ({
      vistos: [],
      pendientes: [],
      ultimaRevision: 0,
      entrada: (lista) => {
        try {
          const st = get();
          const ahora = Date.now();
          const vistos = new Set(st.vistos);
          // la primera revisión de un visitante NO inunda: siembra silencio
          const primera = st.vistos.length === 0 && st.pendientes.length === 0 && st.ultimaRevision === 0;
          const nuevas: AlarmaItem[] = [];
          for (const n of lista || []) {
            if (!n?.id) continue;
            // el que ya estaba en vistos NO vuelve a alarma (escaneado, leído
            // o revisado — FIX de QA: leer() y limpiar() pliegan sus ids aquí)
            const ya = vistos.has(n.id);
            vistos.add(n.id);
            if (primera || ya) continue;
            if (n.impacto < UMBRAL_ALARMA || n.edadMin >= VENTANA_MIN) continue;
            nuevas.push(aItem(n));
          }
          // la siembra honesta: si un URGENTE sigue humeando (<15 min), una sola alarma
          if (primera) {
            const humeante = (lista || [])
              .filter((n) => n?.id && n.impacto >= TIERS.urgente.min && n.edadMin < 15)
              .sort((a, b) => b.impacto - a.impacto)[0];
            if (humeante) nuevas.push(aItem(humeante));
          }
          const pendientes = [...nuevas, ...st.pendientes]
            .sort((a, b) => b.impacto - a.impacto || b.nacido - a.nacido)
            .slice(0, MAX_PENDIENTES);
          set({
            vistos: [...vistos].slice(-MAX_VISTOS),
            pendientes,
            ultimaRevision: ahora,
          });
          return nuevas.length;
        } catch {
          return 0; // la alarma jamás tumba la Casa
        }
      },
      leer: (id) => {
        try {
          // FIX de QA: un cable LEÍDO queda en vistos — si sigue en la ventana
          // EN VIVO (<120 min), no vuelve a saltar en el próximo barrido
          set((st) => ({
            pendientes: st.pendientes.filter((p) => p.id !== id),
            vistos: st.vistos.includes(id) ? st.vistos : [...st.vistos, id].slice(-MAX_VISTOS),
          }));
        } catch { /* silencio honesto */ }
      },
      limpiar: () =>
        set((st) => ({
          // FIX de QA: todo lo revisado se pliega a vistos — abrir el CENTRO
          // revisa la campana para siempre (el cable no re-alarma al salir)
          vistos: [...new Set([...st.vistos, ...st.pendientes.map((p) => p.id)])].slice(-MAX_VISTOS),
          pendientes: [],
          ultimaRevision: Date.now(),
        })),
    }),
    {
      name: "vg232-alarma",
      storage: createJSONStorage(() => storageBlindado),
    },
  ),
);

/** helper no-reactivo para el barrido de la Central (patrón contarAccion v172) */
export function barrarAlarma(lista: NoticiaRanqueada[]): number {
  try {
    return useAlarma.getState().entrada(lista);
  } catch {
    return 0;
  }
}
