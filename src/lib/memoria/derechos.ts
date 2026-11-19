// ═══════════════════════════════════════════════════════════════════
// v419.0 · MEMORY ARCHIVE — la política de derechos
//
// La regla de la casa es una sola: **si la fuente no dice que se puede, el
// archivo no enseña la imagen**. Se puede enlazar, se puede citar y se puede
// leer la ficha; no se puede publicar lo que la fuente no ha autorizado.
//
// Por eso este módulo traduce el texto literal de derechos de cada fuente
// (que se conserva y se enseña tal cual) a una de cinco clases, y de ahí sale
// una decisión booleana: `imagenPermitida`.
//
// Lo que NO hace: interpretar licencias dudosas a favor del archivo. Un
// «Rights status not evaluated» del Library of Congress no es un permiso.
// ═══════════════════════════════════════════════════════════════════

import type { EstadoDerechos } from "./tipos";

export interface Veredicto {
  estado: EstadoDerechos;
  /** nombre corto para la ficha */
  etiqueta: string;
  /** qué significa, sin jerga */
  explicacion: string;
  /** ¿puede el archivo mostrar la imagen en su visor? */
  imagenPermitida: boolean;
}

const VEREDICTOS: Record<EstadoDerechos, Veredicto> = {
  "dominio-publico": {
    estado: "dominio-publico",
    etiqueta: "Dominio público",
    explicacion:
      "La fuente declara que la obra está en dominio público: se puede ver, citar y reutilizar sin pedir permiso.",
    imagenPermitida: true,
  },
  "licencia-abierta": {
    estado: "licencia-abierta",
    etiqueta: "Licencia abierta",
    explicacion:
      "La fuente publica la obra con una licencia que permite reutilizarla citando autor y licencia. El archivo la enseña con esa atribución y enlaza a la licencia.",
    imagenPermitida: true,
  },
  "sin-restricciones-conocidas": {
    estado: "sin-restricciones-conocidas",
    etiqueta: "Sin restricciones conocidas",
    explicacion:
      "La institución que custodia el original no conoce restricciones de uso sobre esta copia. No es una promesa jurídica: si vas a reutilizarla, comprueba el estado en la fuente.",
    imagenPermitida: true,
  },
  "uso-condicionado": {
    estado: "uso-condicionado",
    etiqueta: "Uso condicionado",
    explicacion:
      "La fuente avisa de que la publicación puede estar restringida o sujeta a permisos. El archivo solo enlaza el registro: no publica la imagen.",
    imagenPermitida: false,
  },
  "sin-declarar": {
    estado: "sin-declarar",
    etiqueta: "Derechos sin declarar",
    explicacion:
      "La fuente no dice nada sobre los derechos de esta pieza. El archivo no supone nada: enlaza el registro y no publica la imagen.",
    imagenPermitida: false,
  },
};

export function veredicto(estado: EstadoDerechos): Veredicto {
  return VEREDICTOS[estado];
}

/** Una clase desconocida cae en el lado prudente: sin declarar. */
export function veredictoPrudente(estado: string | null | undefined): Veredicto {
  const conocido = estado && estado in VEREDICTOS ? (estado as EstadoDerechos) : "sin-declarar";
  return VEREDICTOS[conocido];
}

// ── Library of Congress ─────────────────────────────────────────────
// `rights_advisory` es una frase libre. Se clasifica por lo que dice, y la
// frase original se conserva para enseñarla junto al documento.
export function derechosLoc(rightsAdvisory: string | null | undefined): EstadoDerechos {
  const t = (rightsAdvisory ?? "").toLowerCase();
  if (!t) return "sin-declarar";
  if (t.includes("no known restriction")) return "sin-restricciones-conocidas";
  if (t.includes("public domain")) return "dominio-publico";
  if (t.includes("may be restricted") || t.includes("permission") || t.includes("restricted"))
    return "uso-condicionado";
  if (t.includes("not evaluated") || t.includes("status not evaluated")) return "sin-declarar";
  // cualquier otro aviso se trata como condicionado, nunca como libre
  return "uso-condicionado";
}

// ── Wikimedia Commons ───────────────────────────────────────────────
// `LicenseShortName` viene en inglés y con formato variable.
export function derechosCommons(licencia: string | null | undefined): EstadoDerechos {
  const t = (licencia ?? "").toLowerCase();
  if (!t) return "sin-declarar";
  if (t.includes("public domain") || t === "pd" || t.startsWith("pd-")) return "dominio-publico";
  if (t.includes("cc0")) return "dominio-publico";
  if (t.includes("no restrictions")) return "sin-restricciones-conocidas";
  if (t.includes("cc by") || t.includes("cc-by") || t.includes("attribution")) return "licencia-abierta";
  if (t.includes("fair use") || t.includes("non-free") || t.includes("copyright")) return "uso-condicionado";
  return "sin-declarar";
}

// ── Internet Archive ────────────────────────────────────────────────
// El campo `licenseurl` es una URL de Creative Commons o vacío. Si está
// vacío, la pieza queda sin declarar: hay colecciones enteras de dominio
// público ahí, pero la ficha no lo prueba y el archivo no lo supone.
export function derechosIa(licenseurl: string | null | undefined): EstadoDerechos {
  const t = (licenseurl ?? "").toLowerCase();
  if (!t) return "sin-declarar";
  if (t.includes("publicdomain/zero") || t.includes("publicdomain/mark")) return "dominio-publico";
  if (t.includes("creativecommons.org/licenses/")) return "licencia-abierta";
  if (t.includes("creativecommons.org")) return "licencia-abierta";
  return "sin-declarar";
}

/** Nombre corto legible de una licencia de Creative Commons a partir de su URL. */
export function nombreLicencia(url: string | null | undefined): string | null {
  if (!url) return null;
  const u = url.toLowerCase();
  if (u.includes("publicdomain/zero")) return "CC0 1.0";
  if (u.includes("publicdomain/mark")) return "Marca de dominio público";
  const m = u.match(/licenses\/([a-z-]+)\/(\d\.\d)/);
  if (m) return `${m[1].toUpperCase().replace("-", " ")} ${m[2]} — ${u.includes("/deed") ? "" : "Creative Commons"}`.trim();
  return url;
}
