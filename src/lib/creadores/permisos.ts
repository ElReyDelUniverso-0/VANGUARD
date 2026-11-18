// v406.1 · LA FORJA — PERMISOS (puro, sin BD).
//
// Seis roles, una sola tabla de verdad. El servidor decide SIEMPRE con esta
// función; el cliente solo la usa para no enseñar botones que fallarían.
//
//   visitante   sin sesión firmada: lee todo lo aprobado
//   creador     cuenta firmada: publica, versiona, comenta, valora, reporta, colecciona
//   verificado  creador reconocido por la moderación: sus obras no esperan cola por reportes leves
//   moderador   revisa la cola, oculta/aprueba/destaca y suspende — siempre con motivo y bitácora
//   dueno       todo lo anterior + nombra y retira moderadores y verificados
//   suspendido  cuenta firmada que perdió la palabra: solo lee
//
// SEGURO POR DEFECTO: los poderes de moderación exigen que la casa tenga su
// propio secreto de sesión (AUTH_SECRET). Con la clave de reserva —pública en
// el repositorio— cualquiera podría fabricar una sesión, así que en producción
// sin AUTH_SECRET nadie modera (fallo cerrado), ni siquiera el DUEÑO.

export const ROLES = ["visitante", "creador", "verificado", "moderador", "dueno", "suspendido"] as const;
export type Rol = (typeof ROLES)[number];
export const esRol = (x: unknown): x is Rol => typeof x === "string" && (ROLES as readonly string[]).includes(x);

export type Accion =
  | "leer"
  | "publicar"
  | "versionar" // solo sobre lo propio (se comprueba aparte con esAutor)
  | "retirar" // retirar lo propio
  | "comentar"
  | "valorar" // nunca lo propio
  | "reportar"
  | "coleccionar"
  | "moderar" // aprobar / ocultar / eliminar / restaurar / destacar
  | "suspender"
  | "nombrar"; // dar o quitar verificado / moderador

const TABLA: Record<Rol, readonly Accion[]> = {
  visitante: ["leer"],
  suspendido: ["leer"],
  creador: ["leer", "publicar", "versionar", "retirar", "comentar", "valorar", "reportar", "coleccionar"],
  verificado: ["leer", "publicar", "versionar", "retirar", "comentar", "valorar", "reportar", "coleccionar"],
  moderador: ["leer", "publicar", "versionar", "retirar", "comentar", "valorar", "reportar", "coleccionar", "moderar", "suspender"],
  dueno: ["leer", "publicar", "versionar", "retirar", "comentar", "valorar", "reportar", "coleccionar", "moderar", "suspender", "nombrar"],
};

const ELEVADAS: readonly Accion[] = ["moderar", "suspender", "nombrar"];

/** ¿puede este rol hacer esta acción? `secretoPropio` = la casa tiene AUTH_SECRET (o no es producción) */
export function puede(rol: Rol, accion: Accion, secretoPropio = true): boolean {
  if (ELEVADAS.includes(accion) && !secretoPropio) return false;
  return TABLA[rol].includes(accion);
}

/** el rol efectivo: sesión + rol guardado + ¿es el dueño? */
export function rolEfectivo(alias: string | null, guardado: string | null | undefined, esDueno: boolean): Rol {
  if (!alias) return "visitante";
  if (esDueno) return "dueno";
  if (guardado === "suspendido") return "suspendido";
  if (guardado === "moderador" || guardado === "verificado") return guardado;
  return "creador";
}

/** ¿quién puede actuar sobre quién? un moderador nunca suspende a otro moderador ni al dueño */
export function puedeActuarSobre(actor: Rol, objetivo: Rol): boolean {
  if (actor === "dueno") return objetivo !== "dueno";
  if (actor === "moderador") return objetivo === "creador" || objetivo === "verificado" || objetivo === "suspendido";
  return false;
}

/** los roles que el dueño puede asignar (el rol dueño no se asigna: es la cuenta DUENO) */
export const ROLES_ASIGNABLES: readonly Rol[] = ["creador", "verificado", "moderador", "suspendido"];

/** lista legible de lo que puedes hacer (para «tus permisos» en la página del creador) */
export function permisosDe(rol: Rol, secretoPropio = true): Accion[] {
  return (TABLA[rol] as Accion[]).filter((a) => puede(rol, a, secretoPropio));
}

export const NOMBRE_ROL: Record<Rol, string> = {
  visitante: "Visitante",
  creador: "Creador",
  verificado: "Creador verificado",
  moderador: "Moderador",
  dueno: "Dueño",
  suspendido: "Suspendido",
};
