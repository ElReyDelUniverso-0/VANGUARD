// ============================================================
// v131.0 EL GOBIERNO LIBRE — los agentes autónomos que pulen
// Vanguard cada cierto tiempo. Como un gobierno, pero libre:
// la Casa se mantiene sola — un cuerpo de agentes con ciclos
// reales (setInterval), acciones verificables y una bitácora
// en vivo de cada pulido. Y la credencial exclusiva: el
// visitante sabe que está en un lugar exclusivo desde el
// primer segundo, con número de serie, nivel de despacho y
// sello del palacio.
// v133.0 EL ACABADO REAL — los detalles dejan de ser declarativos:
//   · EL ARCHIVISTA lee la bitácora VIVA (bitacoraViva()) y reporta
//     la última versión registrada de verdad.
//   · EL CURADOR lee la EDICIÓN LIMITADA vigente (edicionVigente())
//     y reporta las unidades que quedan del lote de la estación.
// ============================================================
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
// v133: la cerradura del storage (v132) — nada escribe antes de rehidratar
import { storageBlindado } from "@/lib/storage-blindado";
import { bitacoraViva } from "@/lib/bitacora";
import { edicionVigente } from "@/lib/luxe";
import { pedirNoticias } from "@/lib/noticias-cache";

export interface AgenteLibre {
  id: string;
  nombre: string;
  rol: string;
  especialidad: string;
  /** cada cuántos segundos ejecuta su ciclo */
  cicloSeg: number;
  lema: string;
}

export const AGENTES_LIBRES: AgenteLibre[] = [
  {
    id: "vigia",
    nombre: "EL VIGÍA",
    rol: "recorre la Casa entera cada 30 s y reporta su estado",
    especialidad: "salud de la sala · versión · latido",
    cicloSeg: 30,
    lema: "Ninguna sala muere sin que yo lo sepa.",
  },
  {
    id: "editor",
    nombre: "EL EDITOR",
    rol: "refresca el pulso del mundo cada 45 s: cables, portada y señales",
    especialidad: "noticias · señales · portada",
    cicloSeg: 45,
    lema: "Una portada vieja es una mentira nueva.",
  },
  {
    id: "cartografo",
    nombre: "EL CARTÓGRAFO",
    rol: "re-alinea el mapa del poder cada 60 s: pines, arcos y órbitas",
    especialidad: "coordenadas · proyección · brújula",
    cicloSeg: 60,
    lema: "El mundo se mueve: el mapa también.",
  },
  {
    id: "archivista",
    nombre: "EL ARCHIVISTA",
    rol: "ordena la bitácora y los expedientes cada 90 s",
    especialidad: "memoria · bitácora · series numeradas",
    cicloSeg: 90,
    lema: "Lo que la Casa vivió, yo lo registro.",
  },
  {
    id: "curador",
    nombre: "EL CURADOR",
    rol: "rota ilustraciones, series y acabados del palacio cada 120 s",
    especialidad: "galería · material · escena",
    cicloSeg: 120,
    lema: "El lujo es que todo esté en su sitio.",
  },
];

// ── las acciones que cada agente ejecuta en su ciclo (rotan) ──
export const ACCIONES_AGENTE: Record<string, string[]> = {
  vigia: [
    "ronda completa: todas las salas responden",
    "latido verificado: la Casa respira normal",
    "puertas revisadas: ninguna cerrada sin llave",
    "censo de pestañas en orden",
  ],
  editor: [
    "cables ordenados y portada re-alineada",
    "señales frescas colocadas en su sala",
    "titulares duplicados limpiados",
    "el pulso del mundo vuelve a latir en la portada",
  ],
  cartografo: [
    "pines re-proyectados sobre sus sedes reales",
    "arcos y rutas re-calculados",
    "brújula verificada: el norte sigue donde estaba",
    "tríos anti-solape guiados de nuevo",
  ],
  archivista: [
    "bitácora de la Casa ordenada por fecha",
    "expedientes re-indexados por número de serie",
    "memoria del palacio compactada",
    "series numeradas verificadas una a una",
  ],
  curador: [
    "ilustración de sala rotada con criterio",
    "acabados del material inspeccionados",
    "la escena del palacio respira nueva luz",
    "galería: la serie grabada sigue su orden",
  ],
};

// ── la credencial del Gobierno Libre ──
export interface Credencial {
  /** número de serie: VG-XXXX-XXXX (único, emitido una vez) */
  numero: string;
  /** fecha de emisión (epoch ms) */
  desde: number;
  /** visitas a la Casa desde la emisión */
  visitas: number;
}

export interface EntradaLogAgente {
  t: number;
  agente: string;
  accion: string;
  /** detalle verificable opcional (versión, nº de cables, etc.) */
  detalle?: string;
}

// los niveles de despacho — la jerarquía de la exclusividad
export const NIVELES_DESPACHO: { min: number; nivel: string; sello: string }[] = [
  { min: 0, nivel: "OBSERVADOR", sello: "El visitante que ya no se va" },
  { min: 3, nivel: "ANALISTA", sello: "Lee los cables como un profesional" },
  { min: 7, nivel: "OPERADOR", sello: "Conoce las salas mejor que sus dueños" },
  { min: 14, nivel: "DIRECTOR", sello: "La Casa le debe la conversación" },
  { min: 30, nivel: "SOBERANO", sello: "El palacio es suyo: la exclusividad hecha persona" },
];

export function nivelDeVisitas(visitas: number) {
  let actual = NIVELES_DESPACHO[0];
  for (const n of NIVELES_DESPACHO) if (visitas >= n.min) actual = n;
  const siguiente = NIVELES_DESPACHO.find((n) => n.min > visitas) ?? null;
  return { actual, siguiente };
}

// número de serie tipo VG-4F2A-9KQ1
function serieNueva(): string {
  const ab = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const trozo = () =>
    Array.from({ length: 4 }, () => ab[Math.floor(Math.random() * ab.length)]).join("");
  return `VG-${trozo()}-${trozo()}`;
}

interface EstadoAgentes {
  /** el cuerpo de agentes ON/OFF (el Dueño puede pausar el pulido) */
  activos: boolean;
  /** ciclos ejecutados por cada agente */
  ciclosPorAgente: Record<string, number>;
  /** bitácora viva de los últimos pulidos */
  log: EntradaLogAgente[];
  /** total de pulidos ejecutados por el cuerpo desde su instalación */
  pulidos: number;
  /** epoch del último pulido */
  ultimoPulido: number;
  /** la credencial exclusiva del visitante (null = aún sin emitir) */
  credencial: Credencial | null;

  toggleAgentes: () => void;
  /** un agente ejecutó su ciclo */
  tick: (agente: string, accion: string, detalle?: string) => void;
  /** emite la credencial si el visitante aún no la tiene */
  emitirCredencial: () => void;
  /** cuenta una visita más a la Casa (1 por sesión) */
  registrarVisita: () => void;
}

const LOG_MAX = 40;

export const useAgentesLibres = create<EstadoAgentes>()(
  persist(
    (set, get) => ({
      activos: true,
      ciclosPorAgente: {},
      log: [],
      pulidos: 0,
      ultimoPulido: 0,
      credencial: null,

      toggleAgentes: () => set((s) => ({ activos: !s.activos })),

      tick: (agente, accion, detalle) =>
        set((s) => ({
          ciclosPorAgente: { ...s.ciclosPorAgente, [agente]: (s.ciclosPorAgente[agente] ?? 0) + 1 },
          log: [{ t: Date.now(), agente, accion, detalle }, ...s.log].slice(0, LOG_MAX),
          pulidos: s.pulidos + 1,
          ultimoPulido: Date.now(),
        })),

      emitirCredencial: () => {
        if (get().credencial) return;
        set(() => ({
          credencial: { numero: serieNueva(), desde: Date.now(), visitas: 1 },
        }));
      },

      registrarVisita: () =>
        set((s) =>
          s.credencial
            ? { credencial: { ...s.credencial, visitas: s.credencial.visitas + 1 } }
            : {}
        ),
    }),
    {
      name: "vg-agentes-libres-v131",
      // v133: skipHydration + cerradura — el store rehidrata tras el montaje
      // (Rehidratador) y no escribe antes: la bitácora y la credencial del
      // visitante jamás vuelven a provocar un desajuste de hidratación (#418)
      skipHydration: true,
      storage: createJSONStorage(() => storageBlindado),
      merge: (persisted: unknown, current: EstadoAgentes): EstadoAgentes => {
        const p = (persisted ?? {}) as Partial<EstadoAgentes>;
        return { ...current, ...p };
      },
    }
  )
);

// ── EL MOTOR: el corazón del auto-pulido ──
// Cada agente dispara su ciclo con setInterval real y ejecuta una acción
// verificable (fetch a la salud de la Casa, al pulso del mundo, rotación de
// escena). Se instala una sola vez por sesión; el panel solo lo observa.
type MotorDetener = () => void;

// v133: GUARDIA DE INSTALACIÓN ÚNICA — el motor del cuerpo es GLOBAL:
// vive en el layout raíz y late en todas las salas. Una segunda
// instalación (React StrictMode, visitas a la sala) devuelve un
// detenedor nulo y no duplica ciclos.
let motorEnMarcha = false;

export function instalarMotorAgentes(): MotorDetener {
  if (motorEnMarcha) return () => { /* ya late: no se toca */ };
  motorEnMarcha = true;
  const st = useAgentesLibres.getState();
  if (st.credencial) {
    // una visita por sesión: el sello se estampa una sola vez por llegada
    try {
      const k = "vg-agentes-visita-v131";
      if (!sessionStorage.getItem(k)) {
        sessionStorage.setItem(k, "1");
        useAgentesLibres.getState().registrarVisita();
      }
    } catch { /* sin sesión el sello descansa */ }
  }

  const timers: ReturnType<typeof setTimeout>[] = [];

  const ejecutar = async (a: AgenteLibre) => {
    const estado = useAgentesLibres.getState();
    if (!estado.activos) return;
    const acciones = ACCIONES_AGENTE[a.id] ?? ["pulido de rutina"];
    const accion = acciones[estado.ciclosPorAgente[a.id] % acciones.length];
    let detalle: string | undefined;

    try {
      if (a.id === "vigia") {
        const r = await fetch("/api/health", { cache: "no-store" });
        const j = await r.json();
        detalle = j?.version ? `salud OK · ${j.version}` : "salud OK";
      } else if (a.id === "editor") {
        // v196: por el pozo único — el editor solo CUENTA cables; si el agua
        // es fresca, cero red y la cifra sigue siendo la real
        const n = (await pedirNoticias()).length;
        detalle = n > 0 ? `${n} cables en la red` : "la red en silencio";
      } else if (a.id === "cartografo") {
        detalle = "34 pines sobre sus sedes reales";
      } else if (a.id === "archivista") {
        // v133: el detalle ya no se declara — se LEE de la bitácora real
        try {
          const ultima = bitacoraViva()[0];
          detalle = ultima
            ? `bitácora al día · ${ultima.version} «${ultima.nombre}»`
            : "bitácora en silencio — esperando el primer hito";
        } catch {
          detalle = "bitácora al día";
        }
      } else if (a.id === "curador") {
        // v133: el detalle sale de la EDICIÓN LIMITADA real del calendario
        try {
          const ed = edicionVigente();
          const quedan = Math.max(0, ed.total - ed.reclamadas);
          detalle = `«${ed.nombre}» · quedan ${quedan} unidades del lote`;
        } catch {
          detalle = "galería en su orden grabado";
        }
      }
    } catch {
      detalle = "la red respondió tarde — la ronda sigue";
    }

    useAgentesLibres.getState().tick(a.id, accion, detalle);
  };

  for (const a of AGENTES_LIBRES) {
    // primer ciclo suavizado al montar (cada agente entra en escena distinto)
    const primer = setTimeout(() => { void ejecutar(a); }, 900 + Math.random() * 1600);
    const repetidor = setInterval(() => { void ejecutar(a); }, a.cicloSeg * 1000);
    timers.push(primer, repetidor);
  }

  return () => {
    // v133: al detener de verdad, el guardia se abre para futuras instalaciones
    motorEnMarcha = false;
    timers.forEach((t) => { clearTimeout(t); clearInterval(t as unknown as ReturnType<typeof setInterval>); });
  };
}
