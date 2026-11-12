"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storageBlindado, marcarHidratado, estaHidratado } from "@/lib/storage-blindado";
import { useGameStore } from "@/lib/game-store";
import {
  CARTAS_UNIVERSALES,
  ITEMS_MARKETPLACE,
  RAREZAS_UNIVERSALES,
  type ItemMarketplace,
} from "@/lib/universo-diario-data";

export interface EstadoCartaUniversal {
  desbloqueadaEn: string;
  nivel: number; // 1..5
  estudiada: boolean;
}

export interface RegistroMovimientoVC {
  id: string;
  fecha: string;
  tipo: "GANANCIA" | "COMPRA" | "MEJORA";
  concepto: string;
  montoVC: number;
}

export interface EquipamientoPersonal {
  avatarId: string;
  insigniaId: string;
  temaCss: string;
  mundoId: string;
  musicaId: string;
  baseEstilo: string;
  baseIluminacion: string;
  nombreBase: string;
}

export interface UniversoState {
  // Cartas universales (8 colecciones)
  cartas: Record<string, EstadoCartaUniversal>;
  // Mejoras de nivel para las cartas del álbum clásico (frentes, líderes, historia)
  nivelesAlbumClasico: Record<string, number>;
  // Cartas fijadas en la Base Personal (hasta 6)
  vitrina: string[];
  // Marketplace poseído
  poseidos: Record<string, boolean>;
  // Equipado actualmente
  equipado: EquipamientoPersonal;
  // Progreso diario sin FOMO (clave = YYYY-MM-DD)
  misionesDia: Record<string, boolean>;
  desafiosDia: Record<string, boolean>;
  recompensasDia: Record<string, boolean>;
  competicionesDia: Record<string, boolean>;
  eventosSemanales: Record<string, boolean>;
  investigacionesCompletadas: number;
  contenidosCreados: number;
  historialVC: RegistroMovimientoVC[];

  // Acciones
  desbloquearCarta: (cartaId: string, gratisPorEvento?: boolean) => { ok: boolean; msg: string };
  mejorarCarta: (cartaId: string) => { ok: boolean; msg: string; nuevoNivel?: number };
  mejorarCartaClasica: (key: string, titulo: string) => { ok: boolean; msg: string; nuevoNivel?: number };
  verificarEstudioCarta: (cartaId: string, opcionElegida: number) => { ok: boolean; acierto: boolean; msg: string };
  alternarVitrina: (cartaId: string) => { ok: boolean; msg: string };
  comprarItemMarketplace: (itemId: string) => { ok: boolean; msg: string };
  equiparItem: (item: ItemMarketplace) => void;
  actualizarBasePersonal: (parcial: Partial<Pick<EquipamientoPersonal, "nombreBase" | "baseIluminacion">>) => void;
  completarMisionDia: (fechaKey: string, recompensaVC: number, titulo: string) => boolean;
  responderDesafioDia: (fechaKey: string, acierto: boolean, recompensaVC: number) => { ok: boolean; msg: string };
  reclamarCartaDia: (fechaKey: string, cartaId: string) => { ok: boolean; msg: string };
  completarCompeticionDia: (fechaKey: string, recompensaVC: number, titulo: string) => boolean;
  registrarInvestigacionOContenido: (tipo: "investigacion" | "contenido", concepto: string, vc: number) => void;
}

const CARTAS_INICIALES: Record<string, EstadoCartaUniversal> = {
  "col-pais-do":     { desbloqueadaEn: "Bienvenida VANGUARD", nivel: 1, estudiada: false },
  "col-civ-sumeria": { desbloqueadaEn: "Bienvenida VANGUARD", nivel: 1, estudiada: false },
  "col-esp-voyager1":{ desbloqueadaEn: "Bienvenida VANGUARD", nivel: 1, estudiada: false },
  "col-per-duarte":  { desbloqueadaEn: "Bienvenida VANGUARD", nivel: 1, estudiada: false },
  "col-aco-berlin":  { desbloqueadaEn: "Bienvenida VANGUARD", nivel: 1, estudiada: false },
};

const POSEIDOS_INICIALES: Record<string, boolean> = {
  "tem-oro": true,
  "bas-observatorio": true,
};

export function aplicarTemaEnDocumento(temaCss: string) {
  if (typeof document === "undefined") return;
  try {
    if (!temaCss || temaCss === "oro") {
      document.documentElement.removeAttribute("data-vg-theme");
    } else {
      document.documentElement.setAttribute("data-vg-theme", temaCss);
    }
  } catch { /* noop */ }
}

function nuevoMov(
  tipo: RegistroMovimientoVC["tipo"],
  concepto: string,
  montoVC: number
): RegistroMovimientoVC {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fecha: new Date().toISOString().slice(0, 16).replace("T", " ") + " UTC",
    tipo,
    concepto,
    montoVC,
  };
}

export const useUniversoStore = create<UniversoState>()(
  persist(
    (set, get) => ({
      cartas: CARTAS_INICIALES,
      nivelesAlbumClasico: {},
      vitrina: ["col-pais-do", "col-esp-voyager1", "col-per-duarte"],
      poseidos: POSEIDOS_INICIALES,
      equipado: {
        avatarId: "",
        insigniaId: "",
        temaCss: "oro",
        mundoId: "",
        musicaId: "",
        baseEstilo: "observatorio",
        baseIluminacion: "#FFC94D",
        nombreBase: "Bóveda Polar #01",
      },
      misionesDia: {},
      desafiosDia: {},
      recompensasDia: {},
      competicionesDia: {},
      eventosSemanales: {},
      investigacionesCompletadas: 0,
      contenidosCreados: 0,
      historialVC: [
        {
          id: "init-welcome",
          fecha: "Bienvenida",
          tipo: "GANANCIA",
          concepto: "Paquete inicial: 5 Cartas Coleccionables + Bóveda Personal",
          montoVC: 0,
        },
      ],

      desbloquearCarta: (cartaId, gratisPorEvento = false) => {
        const s = get();
        if (s.cartas[cartaId]) {
          return { ok: true, msg: "Ya tienes esta carta en tu colección." };
        }
        const carta = CARTAS_UNIVERSALES.find((c) => c.id === cartaId);
        if (!carta) return { ok: false, msg: "Carta no encontrada." };

        const costo = gratisPorEvento ? 0 : carta.costoVC;
        if (costo > 0) {
          const pago = useGameStore.getState().spendCoins(costo, `Colección ${carta.serie}`);
          if (!pago) {
            return {
              ok: false,
              msg: `Necesitas ${costo} VC. Consigue más en el Desafío Diario o estudiando tus cartas actuales.`,
            };
          }
        }

        const fecha = new Date().toISOString().slice(0, 10);
        set((st) => ({
          cartas: {
            ...st.cartas,
            [cartaId]: { desbloqueadaEn: fecha, nivel: 1, estudiada: false },
          },
          historialVC: [
            nuevoMov(costo > 0 ? "COMPRA" : "GANANCIA", `Carta desbloqueada: ${carta.titulo}`, -costo),
            ...st.historialVC,
          ].slice(0, 40),
        }));
        return { ok: true, msg: `Carta ${carta.serie} (${carta.titulo}) añadida a tu álbum.` };
      },

      mejorarCarta: (cartaId) => {
        const s = get();
        const est = s.cartas[cartaId];
        const carta = CARTAS_UNIVERSALES.find((c) => c.id === cartaId);
        if (!est || !carta) {
          return { ok: false, msg: "Desbloquea la carta primero antes de mejorarla." };
        }
        if (est.nivel >= 5) {
          return { ok: false, msg: "Esta carta ya alcanzó el Nivel Máximo (Nv. 5 Prismática)." };
        }
        const costoMejora = est.nivel * 45;
        const pago = useGameStore.getState().spendCoins(costoMejora, `Mejora carta ${carta.serie}`);
        if (!pago) {
          return { ok: false, msg: `Necesitas ${costoMejora} VC para subir a Nv. ${est.nivel + 1}.` };
        }
        const nuevoNivel = est.nivel + 1;
        useGameStore.getState().addXp(25 * nuevoNivel);
        set((st) => ({
          cartas: {
            ...st.cartas,
            [cartaId]: { ...est, nivel: nuevoNivel },
          },
          historialVC: [
            nuevoMov("MEJORA", `Mejora ${carta.titulo} → Nv. ${nuevoNivel}`, -costoMejora),
            ...st.historialVC,
          ].slice(0, 40),
        }));
        return {
          ok: true,
          msg: `${carta.titulo} mejorada a Nivel ${nuevoNivel} (+${25 * nuevoNivel} XP).`,
          nuevoNivel,
        };
      },

      mejorarCartaClasica: (key, titulo) => {
        const s = get();
        const actual = s.nivelesAlbumClasico[key] ?? 1;
        if (actual >= 5) {
          return { ok: false, msg: "Esta carta ya alcanzó el Nivel 5 Prismática." };
        }
        const costo = actual * 40;
        const pago = useGameStore.getState().spendCoins(costo, `Mejora ficha ${key}`);
        if (!pago) {
          return { ok: false, msg: `Necesitas ${costo} VC para mejorar ${titulo} a Nv. ${actual + 1}.` };
        }
        const nuevoNivel = actual + 1;
        useGameStore.getState().addXp(20 * nuevoNivel);
        set((st) => ({
          nivelesAlbumClasico: { ...st.nivelesAlbumClasico, [key]: nuevoNivel },
          historialVC: [
            nuevoMov("MEJORA", `Carta mejorada: ${titulo} → Nv. ${nuevoNivel}`, -costo),
            ...st.historialVC,
          ].slice(0, 40),
        }));
        return {
          ok: true,
          msg: `${titulo} subió a Nv. ${nuevoNivel} (+${20 * nuevoNivel} XP).`,
          nuevoNivel,
        };
      },

      verificarEstudioCarta: (cartaId, opcionElegida) => {
        const s = get();
        const est = s.cartas[cartaId];
        const carta = CARTAS_UNIVERSALES.find((c) => c.id === cartaId);
        if (!est || !carta) {
          return { ok: false, acierto: false, msg: "Desbloquea la carta para certificar su estudio." };
        }
        if (est.estudiada) {
          return { ok: true, acierto: true, msg: "Esta investigación educativa ya fue certificada." };
        }
        if (opcionElegida !== carta.preguntaVerificacion.correcta) {
          return { ok: true, acierto: false, msg: "Respuesta incorrecta. Relee la ficha e inténtalo de nuevo." };
        }
        const bono =
          carta.preguntaVerificacion.recompensaVC + RAREZAS_UNIVERSALES[carta.rareza].bonoEstudioVC;
        useGameStore.getState().addCoins(bono, `Investigación ${carta.serie}`);
        useGameStore.getState().addXp(35);
        set((st) => ({
          cartas: {
            ...st.cartas,
            [cartaId]: { ...est, estudiada: true },
          },
          investigacionesCompletadas: st.investigacionesCompletadas + 1,
          historialVC: [
            nuevoMov("GANANCIA", `Investigación educativa: ${carta.titulo}`, bono),
            ...st.historialVC,
          ].slice(0, 40),
        }));
        return {
          ok: true,
          acierto: true,
          msg: `¡Correcto! Investigación certificada: +${bono} VC y +35 XP.`,
        };
      },

      alternarVitrina: (cartaId) => {
        const s = get();
        if (!s.cartas[cartaId]) {
          return { ok: false, msg: "Desbloquea la carta primero para exhibirla en tu Base Personal." };
        }
        if (s.vitrina.includes(cartaId)) {
          set({ vitrina: s.vitrina.filter((x) => x !== cartaId) });
          return { ok: true, msg: "Carta retirada de la vitrina." };
        }
        if (s.vitrina.length >= 6) {
          return { ok: false, msg: "Tu vitrina ya tiene el máximo de 6 cartas exhibidas." };
        }
        set({ vitrina: [...s.vitrina, cartaId] });
        return { ok: true, msg: "Carta fijada en tu Base Personal." };
      },

      comprarItemMarketplace: (itemId) => {
        const s = get();
        const item = ITEMS_MARKETPLACE.find((i) => i.id === itemId);
        if (!item) return { ok: false, msg: "Artículo no encontrado." };
        if (s.poseidos[itemId]) {
          get().equiparItem(item);
          return { ok: true, msg: `${item.nombre} equipado.` };
        }
        if (item.precioVC > 0) {
          const pago = useGameStore.getState().spendCoins(item.precioVC, `Marketplace: ${item.nombre}`);
          if (!pago) {
            return { ok: false, msg: `Necesitas ${item.precioVC} VC. Completa desafíos diarios o investigaciones.` };
          }
        }
        set((st) => ({
          poseidos: { ...st.poseidos, [itemId]: true },
          historialVC: [
            nuevoMov("COMPRA", `Marketplace: ${item.nombre}`, -item.precioVC),
            ...st.historialVC,
          ].slice(0, 40),
        }));
        get().equiparItem(item);
        return { ok: true, msg: `¡${item.nombre} desbloqueado y equipado!` };
      },

      equiparItem: (item) => {
        set((st) => {
          const eq = { ...st.equipado };
          if (item.categoria === "avatares") eq.avatarId = item.id;
          if (item.categoria === "insignias") eq.insigniaId = item.id;
          if (item.categoria === "temas" && item.temaCss) {
            eq.temaCss = item.temaCss;
            aplicarTemaEnDocumento(item.temaCss);
          }
          if (item.categoria === "mundos") eq.mundoId = item.id;
          if (item.categoria === "musica") eq.musicaId = item.id;
          if (item.categoria === "base" && item.estiloBase) eq.baseEstilo = item.estiloBase;
          return { equipado: eq };
        });
      },

      actualizarBasePersonal: (parcial) => {
        set((st) => ({
          equipado: { ...st.equipado, ...parcial },
        }));
      },

      completarMisionDia: (fechaKey, recompensaVC, titulo) => {
        if (get().misionesDia[fechaKey]) return false;
        useGameStore.getState().addCoins(recompensaVC, `Misión diaria ${fechaKey}`);
        useGameStore.getState().addXp(30);
        set((st) => ({
          misionesDia: { ...st.misionesDia, [fechaKey]: true },
          historialVC: [
            nuevoMov("GANANCIA", `Misión diaria (${fechaKey}): ${titulo}`, recompensaVC),
            ...st.historialVC,
          ].slice(0, 40),
        }));
        return true;
      },

      responderDesafioDia: (fechaKey, acierto, recompensaVC) => {
        if (get().desafiosDia[fechaKey]) {
          return { ok: false, msg: "El desafío de conocimientos de este día ya fue completado." };
        }
        if (!acierto) {
          return { ok: true, msg: "Esa no era la correcta. Revisa el acontecimiento explicado e inténtalo otra vez." };
        }
        useGameStore.getState().addCoins(recompensaVC, `Desafío diario ${fechaKey}`);
        useGameStore.getState().addXp(35);
        set((st) => ({
          desafiosDia: { ...st.desafiosDia, [fechaKey]: true },
          historialVC: [
            nuevoMov("GANANCIA", `Desafío de conocimientos (${fechaKey})`, recompensaVC),
            ...st.historialVC,
          ].slice(0, 40),
        }));
        return { ok: true, msg: `¡Desafío superado! +${recompensaVC} VC y +35 XP.` };
      },

      reclamarCartaDia: (fechaKey, cartaId) => {
        if (get().recompensasDia[fechaKey]) {
          return { ok: false, msg: "La recompensa coleccionable de esta jornada ya fue reclamada." };
        }
        const carta = CARTAS_UNIVERSALES.find((c) => c.id === cartaId);
        const yaTenia = !!get().cartas[cartaId];
        if (!yaTenia) {
          get().desbloquearCarta(cartaId, true);
        } else {
          useGameStore.getState().addCoins(30, `Bono carta repetida ${fechaKey}`);
        }
        set((st) => ({
          recompensasDia: { ...st.recompensasDia, [fechaKey]: true },
          historialVC: yaTenia
            ? [nuevoMov("GANANCIA", `Bono colección diaria (${fechaKey})`, 30), ...st.historialVC].slice(0, 40)
            : st.historialVC,
        }));
        return {
          ok: true,
          msg: yaTenia
            ? `Ya poseías ${carta?.titulo ?? "la carta"}: recibes +30 VC de bonificación.`
            : `¡Recompensa diaria desbloqueada: ${carta?.titulo ?? cartaId}!`,
        };
      },

      completarCompeticionDia: (fechaKey, recompensaVC, titulo) => {
        if (get().competicionesDia[fechaKey]) return false;
        useGameStore.getState().addCoins(recompensaVC, `Competición ${fechaKey}`);
        useGameStore.getState().addXp(40);
        set((st) => ({
          competicionesDia: { ...st.competicionesDia, [fechaKey]: true },
          historialVC: [
            nuevoMov("GANANCIA", `Competición (${fechaKey}): ${titulo}`, recompensaVC),
            ...st.historialVC,
          ].slice(0, 40),
        }));
        return true;
      },

      registrarInvestigacionOContenido: (tipo, concepto, vc) => {
        useGameStore.getState().addCoins(vc, concepto);
        useGameStore.getState().addXp(25);
        set((st) => ({
          investigacionesCompletadas:
            tipo === "investigacion" ? st.investigacionesCompletadas + 1 : st.investigacionesCompletadas,
          contenidosCreados: tipo === "contenido" ? st.contenidosCreados + 1 : st.contenidosCreados,
          historialVC: [nuevoMov("GANANCIA", concepto, vc), ...st.historialVC].slice(0, 40),
        }));
      },
    }),
    {
      name: "vg-daily-universe-v1",
      storage: createJSONStorage(() => storageBlindado),
      skipHydration: true,
    }
  )
);

/** Garantiza rehidratación segura tanto en / como en rutas directas (/universo, /fichas) */
export function asegurarUniversoHidratado() {
  if (typeof window === "undefined") return;
  if (estaHidratado("vg-daily-universe-v1")) return;
  Promise.resolve(useUniversoStore.persist.rehydrate())
    .then(() => {
      marcarHidratado("vg-daily-universe-v1");
      aplicarTemaEnDocumento(useUniversoStore.getState().equipado.temaCss);
    })
    .catch(() => marcarHidratado("vg-daily-universe-v1"));
}
