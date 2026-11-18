// ============================================================
// v407.0 · LA IA CON HONESTIDAD — qué hay configurado y qué se hace sin IA
//
// Orden del Dueño, textual: «utiliza proveedores y modelos únicamente cuando
// exista acceso real y configuración válida. No simules conexiones».
//
// Este módulo NO llama a ningún modelo. Hace tres cosas, y solo tres:
//   ①  Comprueba si hay CREDENCIAL configurada en el entorno (presencia, nunca
//       el valor: aquí no se lee ni se registra la clave).
//   ②  Declara qué capacidades de la casa funcionan SIN proveedor, porque son
//       deterministas (reglas + catálogo + datos reales).
//   ③  Ofrece las funciones deterministas de verdad: explicar un dato del
//       catálogo y responder con la interpretación de una consulta.
//
// Si mañana hay clave de proveedor, el sitio donde se implementa la llamada es
// `PROVEEDORES[].implementado` — que hoy está en `false` a propósito. Un
// proveedor «disponible» con `implementado: false` se declara tal cual: existe
// la credencial, no existe el cliente.
// ============================================================

import { MODELOS_DATO, mapaDeModelos, vecinosDeModelo, coberturaCatalogo } from "@/lib/datos/catalogo";
import { interpretarConsulta, type Interpretacion } from "@/lib/nucleo/consulta";

/** Un proveedor posible: su variable de entorno y si su cliente está escrito. */
export interface ProveedorIA {
  id: string;
  nombre: string;
  /** nombre de la variable de entorno (jamás su valor) */
  variable: string;
  /** qué capacidades daría si estuviera configurado */
  capacidades: string[];
  /** ¿existe cliente implementado en la casa? Hoy, ninguno. */
  implementado: boolean;
}

export const PROVEEDORES: ProveedorIA[] = [
  {
    id: "openai",
    nombre: "OpenAI",
    variable: "OPENAI_API_KEY",
    capacidades: ["resumen de informes", "explicación de datos", "búsqueda semántica"],
    implementado: false,
  },
  {
    id: "anthropic",
    nombre: "Anthropic",
    variable: "ANTHROPIC_API_KEY",
    capacidades: ["asistente de investigación", "resumen de informes"],
    implementado: false,
  },
  {
    id: "google",
    nombre: "Google Generative AI",
    variable: "GOOGLE_GENERATIVE_AI_API_KEY",
    capacidades: ["búsqueda semántica", "explicación de datos"],
    implementado: false,
  },
  {
    id: "groq",
    nombre: "Groq",
    variable: "GROQ_API_KEY",
    capacidades: ["resumen rápido de cables"],
    implementado: false,
  },
  {
    id: "mistral",
    nombre: "Mistral",
    variable: "MISTRAL_API_KEY",
    capacidades: ["resumen", "clasificación"],
    implementado: false,
  },
];

/** ¿Está la variable puesta? Se comprueba la PRESENCIA, nunca se lee el valor. */
function configurado(variable: string): boolean {
  const v = process.env[variable];
  return typeof v === "string" && v.trim().length >= 8;
}

/** Estado real, sin adornos: configurado ≠ implementado. */
export function estadoProveedores() {
  const lista = PROVEEDORES.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    variable: p.variable,
    configurado: configurado(p.variable),
    implementado: p.implementado,
    capacidades: p.capacidades,
  }));
  const conCredencial = lista.filter((p) => p.configurado).length;
  return {
    proveedores: lista,
    conCredencial,
    implementados: lista.filter((p) => p.implementado).length,
    nota:
      conCredencial === 0
        ? "Ningún proveedor tiene credencial en este entorno. La casa NO llama a ningún modelo: todas sus capacidades de «IA» son deterministas y se declaran abajo."
        : "Hay credencial de proveedor, pero ningún cliente está implementado todavía: la credencial sola no hace ninguna llamada. La casa sigue respondiendo con sus capacidades deterministas.",
  };
}

/** Lo que la casa resuelve HOY sin proveedor, con la pieza que lo hace. */
export function capacidadesDeterministas() {
  return [
    {
      id: "consulta-estructurada",
      nombre: "Consulta de información estructurada",
      que: "Interpreta una pregunta en español: país, tipo de entidad, teatro y ventana temporal.",
      donde: "/api/consulta · src/lib/nucleo/consulta.ts",
      limite: "Reglas y diccionarios: no entiende preguntas largas ni ambigüedades finas.",
    },
    {
      id: "explicacion-datos",
      nombre: "Explicación de datos",
      que: "Cuenta qué es cada modelo, de dónde sale, con qué licencia, de qué fecha y qué NO dice.",
      donde: "/datos · explicarDato()",
      limite: "Explica el catálogo, no interpreta una cifra concreta.",
    },
    {
      id: "relaciones",
      nombre: "Análisis de relaciones entre datos",
      que: "Une modelos por su clave real (ISO, teatro, fecha) y dice por dónde se unen.",
      donde: "src/lib/nucleo/recomendaciones.ts · src/lib/datos/catalogo.ts",
      limite: "Relaciones declaradas por la casa, no descubiertas estadísticamente.",
    },
    {
      id: "busqueda",
      nombre: "Búsqueda global",
      que: "Todos los proveedores públicos en paralelo, con normalización sin tildes y puntuación por términos.",
      donde: "/api/nucleo/busqueda · src/lib/nucleo/busqueda.ts",
      limite: "Búsqueda léxica, no semántica: no encuentra sinónimos que no estén en el nexo.",
    },
    {
      id: "resumen",
      nombre: "Resumen de informes",
      que: "Resume lo que sabe con datos reales: cobertura del catálogo, señales de 24 h y estado del sistema.",
      donde: "resumirEstado()",
      limite: "Resume cifras y estados, no redacta informes largos.",
    },
    {
      id: "ayuda-simuladores",
      nombre: "Ayuda contextual en simuladores",
      que: "Del teatro y sus puntos a su ficha, su mapa y su país — la ayuda es navegación verificada.",
      donde: "recomendar() · /nucleo",
      limite: "No explica tácticas ni predice resultados.",
    },
  ];
}

/** Explica un modelo del catálogo como lo haría un analista, con datos reales. */
export function explicarDato(idModelo: string): { ok: boolean; texto: string; modelo?: string } {
  const m = mapaDeModelos().get(idModelo);
  if (!m) {
    return {
      ok: false,
      texto: `No hay ningún modelo «${idModelo}» en el catálogo. Los que existen: ${MODELOS_DATO.map((x) => x.id).join(", ")}.`,
    };
  }
  const fuentes = m.procedencia
    .map((p) => `${p.quien} (${p.licencia}${p.captura ? `, capturado ${p.captura}` : ""})`)
    .join("; ");
  const relaciones = vecinosDeModelo(m.id)
    .map((r) => `${r.con} por ${r.por}`)
    .join(", ");
  const texto = [
    `${m.nombre}: ${m.descripcion}`,
    `Vive en ${m.vive} y reúne ${m.volumen}.`,
    `Procedencia: ${fuentes}.`,
    `Se actualiza: ${m.actualizacion}`,
    m.cache === null ? "No se debe cachear." : `Caché recomendada: ${m.cache} s.`,
    relaciones ? `Se une con: ${relaciones}.` : "No declara relaciones.",
    `Lo que NO dice: ${m.limites.join(" ")}`,
  ].join(" ");
  return { ok: true, texto, modelo: m.id };
}

/** Resumen del estado del sistema con datos reales (sin proveedor). */
export function resumirEstado(): string {
  const c = coberturaCatalogo();
  return `La casa declara ${c.modelos} modelos de datos: ${c.conProcedencia} con procedencia, ${c.conFechaDeCaptura} con fecha de captura y ${c.conLimites} con límites escritos. ` +
    `Hay ${c.relaciones} relaciones declaradas entre modelos. ` +
    `${estadoProveedores().conCredencial === 0 ? "Ningún proveedor de IA tiene credencial configurada" : "Hay credencial de proveedor sin cliente implementado"}: ` +
    `las respuestas se construyen con reglas, catálogo y datos reales.`;
}

/** Conveniencia: interpretar + explicar en una sola llamada (asistente básico). */
export function asistenteDeterminista(pregunta: string): {
  interpretacion: Interpretacion;
  explicacion: string | null;
  resumen: string;
} {
  const interpretacion = interpretarConsulta(pregunta);
  const esPreguntaDeDatos = /dato|catalogo|catálogo|fuente|procedencia|licencia/.test(interpretacion.normalizada);
  const modelo = interpretacion.normalizada.match(/dato:[a-z-]+/)?.[0] ?? null;
  return {
    interpretacion,
    explicacion: esPreguntaDeDatos && modelo ? explicarDato(modelo).texto : null,
    resumen: resumirEstado(),
  };
}
