// v95.0 EXPEDIENTE TOTAL — estado compartido del cerebro conector
// (grafo + espejo + máquina del tiempo). Guarda qué expedientes visitó el
// operador, qué nodo está enfocado y qué crisis tiene seleccionada, más la
// cuota diaria de la recompensa ANALISTA DE ARCHIVO.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { dayKeyUtc } from "./googles";

export const ARCHIVO_REWARD = { coins: 6, xp: 4 };
export const ARCHIVO_MAX_DIA = 5;

interface EstadoExpediente {
  /** ids de nodos cuya ficha abrió al menos una vez */
  visitados: string[];
  /** nodo enfocado (drawer de expediente) */
  enfoque: string | null;
  /** crisis activa en EL ESPEJO y la MÁQUINA DEL TIEMPO */
  crisisSel: string;
  /** vigilados propios del expediente (integrables con alertas) */
  vigilados: string[];
  /** cuota diaria de recompensa por abrir fichas nuevas */
  archivoDia: string;
  archivoN: number;
  marcarVisitado: (id: string) => void;
  setEnfoque: (id: string | null) => void;
  setCrisis: (id: string) => void;
  toggleVigilado: (nombre: string) => boolean;
  registrarArchivo: (id: string) => boolean;
}

export const useExpediente = create<EstadoExpediente>()(
  persist(
    (set, get) => ({
      visitados: [],
      enfoque: null,
      crisisSel: "karsk",
      vigilados: [],
      archivoDia: "",
      archivoN: 0,
      marcarVisitado: (id) => {
        if (get().visitados.includes(id)) return;
        set((s) => ({ visitados: [...s.visitados, id].slice(-160) }));
      },
      setEnfoque: (id) => set({ enfoque: id }),
      setCrisis: (id) => set({ crisisSel: id }),
      toggleVigilado: (nombre) => {
        const v = nombre.trim().slice(0, 48);
        if (!v) return false;
        const tiene = get().vigilados.some((x) => x.toLowerCase() === v.toLowerCase());
        if (tiene) {
          set((s) => ({ vigilados: s.vigilados.filter((x) => x.toLowerCase() !== v.toLowerCase()) }));
          return false;
        }
        set((s) => ({ vigilados: [v, ...s.vigilados].slice(0, 16) }));
        return true;
      },
      registrarArchivo: (id) => {
        const st = get();
        const nuevo = !st.visitados.includes(id);
        const hoy = dayKeyUtc();
        if (st.archivoDia !== hoy) {
          set({ archivoDia: hoy, archivoN: nuevo ? 1 : 0 });
          return nuevo;
        }
        if (nuevo && st.archivoN >= ARCHIVO_MAX_DIA) return false;
        if (nuevo) set({ archivoN: st.archivoN + 1 });
        return nuevo;
      },
    }),
    { name: "vg-expediente-v95", storage: createJSONStorage(() => localStorage) },
  ),
);
