// ============================================================
// v218.0 EL NÚCLEO — REGISTRO DE FUENTES DE DATOS COMPARTIDAS
// Toda información que un módulo publica o consulta pasa por
// AQUÍ. Dos listas separadas por una frontera que las pruebas
// vigilan:
//   · FUENTES_PUBLICAS  → pueden alimentar la búsqueda global.
//   · FUENTES_PRIVADAS  → JAMÁS se consultan en búsqueda ni se
//     exponen por API (cuentas, jugadores, telemetría, chat…).
// La regla de oro (mandato del Dueño): «No expongas información
// privada en resultados de búsqueda» y «no generes datos
// ficticios»: una fuente solo se registra si los datos EXISTEN.
// ============================================================

import type { TipoEntidad, EntidadRef } from "./tipos";

export interface FuenteNucleo {
  id: string; // fnt:<slug>
  nombre: string;
  descripcion: string;
  /** Tipo de entidad que publica (para el mapa de entidades de /nucleo). */
  publica_tipo: TipoEntidad;
}

/** ── PÚBLICAS: únicas autorizadas para la búsqueda global ── */
export const FUENTES_PUBLICAS: FuenteNucleo[] = [
  {
    id: "fnt:cables",
    nombre: "Archivo de cables",
    descripcion:
      "NewsItem en la BD: GDELT + 18 medios RSS, con sourceCountry, conflictTag y fecha. La materia prima de la redacción.",
    publica_tipo: "noticia",
  },
  {
    id: "fnt:acontecimientos",
    nombre: "Registro de acontecimientos",
    descripcion:
      "Acontecimiento en la BD: hechos reales (fecha histórica pública) que reúnen varias noticias, sembrados desde los teatros con enlaces regla:teatro.",
    publica_tipo: "acontecimiento",
  },
  {
    id: "fnt:teatros",
    nombre: "Catálogo de teatros",
    descripcion:
      "Los 9 teatros de guerra de src/lib/teatros.ts con nombre y resumen editorial propio.",
    publica_tipo: "region",
  },
  {
    id: "fnt:atlas",
    nombre: "Atlas de naciones",
    descripcion:
      "PAISES_ATLAS: 84 países con capital, líder, gobierno y dato estratégico verificado.",
    publica_tipo: "pais",
  },
  {
    id: "fnt:indicadores",
    nombre: "Barómetro del Banco Mundial",
    descripcion:
      "Indicadores REALES del Banco Mundial (población, PIB, gasto militar, migración) para las naciones de los teatros: resumen propio de la casa, año del dato y enlace al original. Licencia CC BY 4.0 — atribución preservada. Sirve en la ficha vg:pais (v223 EL BARÓMETRO).",
    publica_tipo: "pais",
  },
  {
    id: "fnt:fuentes",
    nombre: "Medios y agencias",
    descripcion:
      "Los medios reales que firman los cables (campo source del archivo) y los catálogos de agencias de la casa.",
    publica_tipo: "fuente",
  },
  {
    id: "fnt:documentos",
    nombre: "Archivo secreto y oscura",
    descripcion:
      "EXPEDIENTES y ALEJANDRÍA OSCURA: teorías, armas, civilizaciones y documentos del catálogo editorial.",
    publica_tipo: "documento",
  },
  {
    id: "fnt:audios",
    nombre: "Muro de la emisora",
    descripcion:
      "AudioComandante: los audios que la comunidad mandó a Vanguard (título y autor públicos, ≤90 s).",
    publica_tipo: "documento",
  },
  {
    id: "fnt:verificaciones",
    nombre: "La verdad cruda",
    descripcion:
      "NewsVerify: titulares puestos a prueba por la comunidad con veredicto real | falsa | dudosa.",
    publica_tipo: "analisis",
  },
  {
    id: "fnt:escuchas",
    nombre: "Escuchas oficiales",
    descripcion:
      "RSS públicos de gobiernos y organismos (ONU, OMS, ReliefWeb, OPCW) que el MODO ESPÍA ya verifica antes de mostrar.",
    publica_tipo: "documento",
  },
  {
    id: "fnt:modulos",
    nombre: "Censo de módulos",
    descripcion: "El propio registro central: MODULOS_NUCLEO en src/lib/nucleo/registro.ts.",
    publica_tipo: "mapa",
  },
];

/** ── PRIVADAS: existen, se declaran, JAMÁS se buscan ── */
export const FUENTES_PRIVADAS: FuenteNucleo[] = [
  {
    id: "fnt:cuentas",
    nombre: "Cuentas",
    descripcion:
      "Account: alias, hash de clave, saveJson. Nunca sale por búsqueda ni por API pública.",
    publica_tipo: "pais", // obligatorio por el tipo; irrelevante: nunca se publica
  },
  {
    id: "fnt:jugadores",
    nombre: "Perfiles de juego",
    descripcion:
      "Player, MpProfile, ContributorProfile: progreso individual. Solo rankings agregados que ya tenía la casa.",
    publica_tipo: "pais",
  },
  {
    id: "fnt:telemetria",
    nombre: "Telemetría",
    descripcion: "Visitas, latidos y señales técnicas del aparato. Interno del sistema.",
    publica_tipo: "pais",
  },
  {
    id: "fnt:conversacion",
    nombre: "Chat y donaciones",
    descripcion:
      "LiveChatMessage, StreamDonation, ContribNotification: lo que la gente dice en directo no es material de búsqueda.",
    publica_tipo: "pais",
  },
];

export const TODAS_LAS_FUENTES: FuenteNucleo[] = [...FUENTES_PUBLICAS, ...FUENTES_PRIVADAS];

export function fuentePorId(id: string): FuenteNucleo | null {
  return TODAS_LAS_FUENTES.find((f) => f.id === id) ?? null;
}

/** ── LA INTERFAZ COMÚN: cómo publica un módulo en el Núcleo ──
 *
 * Un proveedor de búsqueda sabe responder UNA pregunta sobre SU
 * fuente. No importa cómo vive por dentro (Prisma, catálogo en
 * código, RSS cacheado): devuelve ResultadoNucleo y el Núcleo los
 * unifica. Así los módulos se conectan entre sí SIN conocer sus
 * componentes internos — solo el contrato.
 */
export interface ResultadoNucleo {
  /** Presente cuando el resultado ES una entidad con id estable. */
  entidad?: EntidadRef; // id estable + tipo + nombre
  /** Presente cuando el resultado es un módulo del censo (navegación pura). */
  moduloId?: string;
  titulo: string;
  subtitulo: string;
  ruta: string; // destino navegable REAL (página que existe)
  fecha?: string; // ISO si el asunto tiene fecha
  origen: string; // fnt:<id> — qué fuente respondió
}

export interface ProveedorBusqueda {
  fuente: FuenteNucleo; // debe estar en FUENTES_PUBLICAS (lo juzga busqueda.ts)
  /** q ya llega normalizado (minúsculas, sin acentos) y saneado. */
  buscar(q: string, limite: number): Promise<ResultadoNucleo[]>;
}

/** Guarda de la frontera: un proveedor solo entra si su fuente es pública. */
export function esFuentePublica(id: string): boolean {
  return FUENTES_PUBLICAS.some((f) => f.id === id);
}
