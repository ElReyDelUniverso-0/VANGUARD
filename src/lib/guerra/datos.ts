// ═══════════════════════════════════════════════════════════════════
// v437.0 · WAR & HUMANITY — la capa de datos
//
// Orden del Dueño: «Crea un centro mundial de información sobre guerras,
// conflictos y crisis humanitarias… No presentes estimaciones como cifras
// confirmadas».
//
// De ahí salen las tres reglas de este fichero:
//
//   1. NINGUNA CIFRA SE ESCRIBE A MANO. Todo sale de dos fuentes abiertas y
//      citables: UCDP/PRIO —muertes en combate— servido por el Banco Mundial, y
//      UNHCR —población desplazada—. Cada paquete lleva su fuente, su enlace, su
//      licencia y el año del dato.
//   2. HAY UNA INSTANTÁNEA GUARDADA (`instantanea.json`), con la fecha en que se
//      extrajo, para que la sala funcione aunque las APIs no contesten. Si la
//      consulta en vivo funciona, se usa la viva; si falla, se dice cuál se está
//      leyendo. Nunca se rellena un hueco con una suposición.
//   3. LO QUE NO HAY, SE DICE. Las muertes en combate no son víctimas civiles:
//      UCDP/PRIO no las desglosa y no existe una serie abierta de civiles
//      verificados a la que podamos llegar sin clave. Eso se explica en la sala,
//      no se disimula con una estimación.
// ═══════════════════════════════════════════════════════════════════
import instantanea from "./instantanea.json";

export type Fuente = {
  id: string;
  nombre: string;
  url: string;
  api?: string;
  ultimaActualizacionFuente?: string;
  licencia?: string;
  quéEs: string;
};

export type Instantanea = {
  meta: { titulo: string; generado: string; fuentes: Fuente[]; limitaciones: string[] };
  anios: { combate: number[]; desplazamiento: number[] };
  combate: Record<string, Record<string, number>>;
  desplazamiento: Record<string, { anio: number; refugiados: number; solicitantes: number; desplazadosInternos: number; apátridas: number }>;
  mundo: { anio: number; refugiados: number; solicitantes: number; desplazadosInternos: number; apátridas: number; retornados: number }[];
};

export const SNAP = instantanea as unknown as Instantanea;

export type Procedencia = {
  /** true si la cifra viene de la consulta en vivo, false si es la instantánea */
  vivo: boolean;
  /** fecha de la instantánea con la que se rellena lo que la API no traiga */
  instantanea: string;
  /** se explica en la ficha de fuentes, no se esconde */
  nota: string;
};

const WB = "https://api.worldbank.org/v2/country/all/indicator/VC.BTL.DETH?format=json&per_page=20000&date=2014:2024";
const UNHCR = "https://api.unhcr.org/population/v1/population/?limit=300&yearFrom=2024&yearTo=2024&coo_all=true&groupby=coo";
const UNHCR_MUNDO = "https://api.unhcr.org/population/v1/population/?yearFrom=2014&yearTo=2024";

function num(x: unknown): number {
  const n = typeof x === "number" ? x : parseInt(String(x ?? "0").replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

async function pideJSON(url: string): Promise<unknown | null> {
  try {
    const r = await fetch(url, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(9000),
      headers: { accept: "application/json" },
    });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

/** Muertes en combate por país y año. Devuelve también de dónde salieron. */
export async function cargarCombate(): Promise<{ datos: Record<string, Record<string, number>>; procedencia: Procedencia }> {
  const j = (await pideJSON(WB)) as [unknown, { countryiso3code?: string; date?: string; value?: number | null }[]] | null;
  if (!Array.isArray(j) || !Array.isArray(j[1])) {
    return {
      datos: SNAP.combate,
      procedencia: { vivo: false, instantanea: SNAP.meta.generado, nota: "La API del Banco Mundial no contestó: se está leyendo la instantánea guardada." },
    };
  }
  const datos: Record<string, Record<string, number>> = {};
  for (const f of j[1]) {
    const iso = f.countryiso3code;
    const v = f.value;
    if (!iso || v === null || v === undefined || !f.date) continue;
    if (!datos[iso]) datos[iso] = {};
    datos[iso][f.date] = v;
  }
  if (Object.keys(datos).length < 20) {
    return {
      datos: SNAP.combate,
      procedencia: { vivo: false, instantanea: SNAP.meta.generado, nota: "La API devolvió muy pocos países: se está leyendo la instantánea guardada." },
    };
  }
  return { datos, procedencia: { vivo: true, instantanea: SNAP.meta.generado, nota: "Leído en vivo de la API del Banco Mundial (UCDP/PRIO)." } };
}

/** Población desplazada por país de origen y año. */
export async function cargarDesplazamiento(): Promise<{
  datos: Instantanea["desplazamiento"];
  mundo: Instantanea["mundo"];
  procedencia: Procedencia;
}> {
  const [coo, glob] = await Promise.all([pideJSON(UNHCR), pideJSON(UNHCR_MUNDO)]);

  let datos = SNAP.desplazamiento;
  let mundo = SNAP.mundo;
  let vivo = false;

  const items = (coo as { items?: Record<string, unknown>[] } | null)?.items;
  if (Array.isArray(items) && items.length > 50) {
    const nuevo: Instantanea["desplazamiento"] = {};
    for (const it of items) {
      const iso = String(it.coo_iso ?? "");
      if (!iso || iso === "-" || iso === "unk") continue;
      nuevo[iso] = {
        anio: num(it.year),
        refugiados: num(it.refugees),
        solicitantes: num(it.asylum_seekers),
        desplazadosInternos: num(it.idps),
        apátridas: num(it.stateless),
      };
    }
    if (Object.keys(nuevo).length > 50) {
      datos = nuevo;
      vivo = true;
    }
  }

  const itemsGlob = (glob as { items?: Record<string, unknown>[] } | null)?.items;
  if (Array.isArray(itemsGlob) && itemsGlob.length > 5) {
    const nuevo = itemsGlob
      .map((it) => ({
        anio: num(it.year),
        refugiados: num(it.refugees),
        solicitantes: num(it.asylum_seekers),
        desplazadosInternos: num(it.idps),
        apátridas: num(it.stateless),
        retornados: num(it.returned_refugees),
      }))
      .filter((x) => x.anio > 2000)
      .sort((a, b) => a.anio - b.anio);
    if (nuevo.length > 5) mundo = nuevo;
  }

  return {
    datos,
    mundo,
    procedencia: vivo
      ? { vivo: true, instantanea: SNAP.meta.generado, nota: "Leído en vivo de la API de UNHCR." }
      : { vivo: false, instantanea: SNAP.meta.generado, nota: "La API de UNHCR no contestó: se está leyendo la instantánea guardada." },
  };
}

// ── utilidades de lectura ─────────────────────────────────────────────

export type Intensidad = "alta" | "media" | "baja" | "sin-dato";

export function claseDeIntensidad(v: number | undefined): Intensidad {
  if (v === undefined) return "sin-dato";
  if (v >= 10000) return "alta";
  if (v >= 1000) return "media";
  if (v > 0) return "baja";
  return "sin-dato";
}

export const ETIQUETA_INTENSIDAD: Record<Intensidad, string> = {
  alta: "Alta · 10.000 o más",
  media: "Media · de 1.000 a 9.999",
  baja: "Baja · de 1 a 999",
  "sin-dato": "Sin dato declarado",
};

export function valorDe(combate: Record<string, Record<string, number>>, iso3: string, anio: number): number | undefined {
  const v = combate[iso3]?.[String(anio)];
  return typeof v === "number" ? v : undefined;
}

export function totalAnio(combate: Record<string, Record<string, number>>, anio: number): { total: number; paises: number } {
  let total = 0;
  let paises = 0;
  for (const serie of Object.values(combate)) {
    const v = serie[String(anio)];
    if (typeof v === "number" && v > 0) {
      total += v;
      paises += 1;
    }
  }
  return { total, paises };
}

export function ranking(combate: Record<string, Record<string, number>>, anio: number): { iso3: string; valor: number }[] {
  return Object.entries(combate)
    .map(([iso3, serie]) => ({ iso3, valor: typeof serie[String(anio)] === "number" ? (serie[String(anio)] as number) : 0 }))
    .filter((x) => x.valor > 0)
    .sort((a, b) => b.valor - a.valor);
}

export function serieDe(combate: Record<string, Record<string, number>>, iso3: string, anios: number[]): { anio: number; valor: number | undefined }[] {
  return anios.map((anio) => ({ anio, valor: valorDe(combate, iso3, anio) }));
}

export function cifra(n: number | undefined): string {
  if (n === undefined) return "sin dato";
  return n.toLocaleString("es-ES");
}

export function porcentaje(parte: number, total: number): string {
  if (!total) return "—";
  return `${((parte / total) * 100).toFixed(1)} %`;
}
