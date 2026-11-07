// ══════════════════════════════════════════════════════════════════════
// v365.0 LA CARTA DEL DEBER — la carta obligatoria de la escuela
// Mandato del Dueño: «la carta así que obligatoriamente se vea, y que se
// vea feo si uno se va incompleto».
//
//   · OBLIGATORIA — al entrar a la biblioteca, si el deber del día está
//     incompleto y la carta aún no se firmó, la carta SE ABRE SOLA y solo
//     cierra con un toque explícito («A ESTUDIAR»): sin X, sin fondo.
//   · FEA SI SE VA INCOMPLETO — cerrar la carta con misiones a medias
//     deja el sello INCOMPLETO del día: la próxima vez la carta viste rojo,
//     lleva el sello estampado y no se va sin el gesto. El deber hecho la
//     viste verde («CUMPLIDA»).
//   · CERO EFECTOS (ley v335): la apertura se decide en el estado inicial
//     del panel (debeAbrirLaCarta() — función pura sobre los stores); el
//     gesto del usuario firma; nada reloja solo.
//   · PERSISTENCIA vg365-carta con storageBlindado + registro en
//     rehidratador.tsx (ley v171/v172/v176 — sin registro, la cerradura
//     bloquea la escritura). El store de UI (abierta) NO se persiste: la
//     carta se juzga cada vez que la casa se enciende.
// ══════════════════════════════════════════════════════════════════════

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storageBlindado } from "@/lib/storage-blindado";
// el reloj es el CENTRAL de la escuela (ley v324: un solo reloj, cero copias)
import { diaDelAnillo } from "@/lib/estrategia-data";
import { misionesDeHoy, useEstudioBiblioteca, diaDeHoy } from "@/lib/biblioteca-data";

// ── EL ESTADO DE LA CARTA (persistido) ──────────────────────────────
interface CartaDeberState {
  dia: string;           // firma es-ES del último día firmado
  visto: boolean;        // la carta de ese día ya recibió su toque explícito
  dejoAMedias: boolean;  // se fue con el deber incompleto
  firmarVisto: (completa: boolean) => void; // el ÚNICO cierre posible
  reiniciar: () => void;
}

export const useCartaDeber = create<CartaDeberState>()(
  persist(
    (set) => ({
      dia: "",
      visto: false,
      dejoAMedias: false,

      firmarVisto: (completa) => {
        try {
          set({
            dia: diaDeHoy(),
            visto: true,
            // el sello feo se estampa solo si se fue con deberes a medias;
            // si el deber está hecho, la carta queda limpia para mañana
            dejoAMedias: completa ? false : true,
          });
        } catch { /* la carta jamás tumba la biblioteca */ }
      },

      reiniciar: () => set({ dia: "", visto: false, dejoAMedias: false }),
    }),
    {
      name: "vg365-carta",
      storage: createJSONStorage(() => storageBlindado),
    },
  ),
);

// ── EL CANAL DE UI (NO persistido): quién pinta el modal ────────────
interface CartaUIState {
  abierta: boolean;
  abrir: () => void;
  cerrar: () => void;
}

export const useCartaAbierta = create<CartaUIState>()(() => ({
  abierta: false,
  abrir: () => {},
  cerrar: () => {},
}));

// los creadores se inyectan fuera de la fábrica para mantener la pureza
export function montarCanalCarta() {
  useCartaAbierta.setState({
    abrir: () => useCartaAbierta.setState({ abierta: true }),
    cerrar: () => useCartaAbierta.setState({ abierta: false }),
  });
}
montarCanalCarta();

// ── EL ESTADO DEL DEBER DE HOY (función pura, cero efectos) ─────────
export type EstadoDeber = "CUMPLIDA" | "A MEDIAS" | "PENDIENTE";

export function misionesPendientesDeHoy(): string[] {
  try {
    const hoy = diaDeHoy();
    const e = useEstudioBiblioteca.getState();
    const progreso = e.misiones.dia === hoy ? e.misiones.progreso : {};
    return misionesDeHoy(diaDelAnillo())
      .filter((m) => (progreso[m.codigo] ?? 0) < m.meta)
      .map((m) => m.codigo);
  } catch { return misionesDeHoy(0).map((m) => m.codigo); }
}

export function estadoDeberDeHoy(): EstadoDeber {
  try {
    const pendientes = misionesPendientesDeHoy();
    if (pendientes.length === 0) return "CUMPLIDA";
    const c = useCartaDeber.getState();
    return c.dejoAMedias ? "A MEDIAS" : "PENDIENTE";
  } catch { return "PENDIENTE"; }
}

// ¿la carta se abre sola? — OBLIGATORIA mientras el deber esté a medias:
// primera entrada del día sin firmar → sí; se fue a medias → sí (y fea).
export function debeAbrirLaCarta(): boolean {
  try {
    const pendientes = misionesPendientesDeHoy();
    if (pendientes.length === 0) return false; // deber hecho: la carta espera su turno
    const c = useCartaDeber.getState();
    const hoy = diaDeHoy();
    if (c.dia !== hoy || !c.visto) return true; // la escuela abre la carta al entrar
    return c.dejoAMedias;                       // se fue a medias: la carta fea lo espera
  } catch { return false; }
}
