// v406.1 · LA FORJA — MODERACIÓN (puro, sin BD).
//
// Estados de una obra (los mismos de UgcItem, más RETIRADA):
//   APROBADO   visible para todos
//   PENDIENTE  en cola: solo la ven su autor y la moderación
//   OCULTO     retirada por la moderación, reversible
//   ELIMINADO  rechazada (agente o moderación), reversible por el dueño/moderación
//   RETIRADA   la quitó su autor
//
// Tres puertas a la cola:
//   ① el agente moderador al publicar o versionar (SOSPECHOSO → PENDIENTE, INAPROPIADO → ELIMINADO)
//   ② REPORTES: N cuentas distintas reportan → la obra pasa a PENDIENTE sola
//   ③ la moderación humana, siempre con motivo escrito y bitácora

export const ESTADOS = ["APROBADO", "PENDIENTE", "OCULTO", "ELIMINADO", "RETIRADA"] as const;
export type Estado = (typeof ESTADOS)[number];

export const MOTIVOS_REPORTE = [
  { id: "falso", texto: "Información falsa o inventada" },
  { id: "sin-fuente", texto: "Afirma datos sin fuente" },
  { id: "odio", texto: "Odio o acoso" },
  { id: "violencia", texto: "Violencia gráfica sin contexto" },
  { id: "spam", texto: "Spam o publicidad" },
  { id: "copia", texto: "Copia el trabajo de otra persona" },
  { id: "otro", texto: "Otro motivo" },
] as const;
export type MotivoReporte = (typeof MOTIVOS_REPORTE)[number]["id"];
export const esMotivo = (x: unknown): x is MotivoReporte => MOTIVOS_REPORTE.some((m) => m.id === x);

/** reportes de cuentas distintas que mandan una obra a la cola */
export const UMBRAL_REPORTES = 3;
/** a un creador verificado le hace falta el doble (su historial responde por él) */
export const UMBRAL_REPORTES_VERIFICADO = 6;

export function debeIrACola(reportesDistintos: number, autorVerificado: boolean): boolean {
  return reportesDistintos >= (autorVerificado ? UMBRAL_REPORTES_VERIFICADO : UMBRAL_REPORTES);
}

/** lo que dice el agente moderador → estado inicial de la obra o versión */
export function estadoPorVeredicto(veredicto: string, autorVerificado = false): Estado {
  if (veredicto === "INAPROPIADO") return "ELIMINADO";
  if (veredicto === "SOSPECHOSO") return autorVerificado ? "APROBADO" : "PENDIENTE";
  return "APROBADO";
}

export const DECISIONES = ["aprobar", "ocultar", "eliminar", "restaurar", "destacar", "quitar-destacado"] as const;
export type Decision = (typeof DECISIONES)[number];
export const esDecision = (x: unknown): x is Decision => typeof x === "string" && (DECISIONES as readonly string[]).includes(x);

/** transición de estado por decisión humana; null = la decisión no aplica a ese estado */
export function transicion(actual: Estado, d: Decision): Estado | null {
  switch (d) {
    case "aprobar":
      return actual === "PENDIENTE" ? "APROBADO" : null;
    case "ocultar":
      return actual === "APROBADO" || actual === "PENDIENTE" ? "OCULTO" : null;
    case "eliminar":
      return actual === "RETIRADA" ? null : actual === "ELIMINADO" ? null : "ELIMINADO";
    case "restaurar":
      return actual === "OCULTO" || actual === "ELIMINADO" ? "APROBADO" : null;
    case "destacar":
    case "quitar-destacado":
      return actual === "APROBADO" ? "APROBADO" : null;
  }
}

/** ¿quién ve la obra? */
export function visiblePara(estado: Estado, opts: { esAutor: boolean; modera: boolean }): boolean {
  if (estado === "APROBADO") return true;
  if (opts.modera) return true;
  return opts.esAutor && estado !== "ELIMINADO";
}

export const TEXTO_ESTADO: Record<Estado, string> = {
  APROBADO: "Publicada",
  PENDIENTE: "En revisión",
  OCULTO: "Oculta por la moderación",
  ELIMINADO: "Rechazada",
  RETIRADA: "Retirada por su autor",
};

/** motivo obligatorio para cualquier decisión humana (2–200 caracteres útiles) */
export function motivoValido(m: unknown): string | null {
  if (typeof m !== "string") return null;
  const t = m.replace(/\s+/g, " ").trim().slice(0, 200);
  return t.length >= 4 ? t : null;
}
