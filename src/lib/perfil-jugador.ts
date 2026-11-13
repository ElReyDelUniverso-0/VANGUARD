"use client";

// ============================================================
// v367.6 EL PERFIL DEL JUGADOR — EL CARNET, EL CÓDIGO Y LOS PERMISOS
// (src/lib/perfil-jugador.ts)
//
// Orden del Dueño: «haz un perfil que cada jugador debe tener, acceder bien a
// Vanguard, los permisos, código y un perfil con agregar una foto y una
// personalización amplia».
//
// ESTO NO ES UN MOTOR NUEVO: es un índice que junta lo que la casa YA tiene.
//   · el CÓDIGO del jugador sale de `huellaDe()` de `vanguard-id.ts` (la misma
//     huella anti-suplantación del carnet v359) — no se inventa otro hash;
//   · los PERMISOS salen del censo real del núcleo (`MODULOS_NUCLEO[].permiso`)
//     — no hay una lista de permisos escrita a mano aquí;
//   · la PERSONALIZACIÓN sale de `profile-store.ts` (banner, marco, bio,
//     facción, país, avatar, firma 3D) más la foto, que es lo único que se
//     agrega: y se agrega al mismo store, no en un sitio aparte.
//
// Leyes que respeta:
//  ① CERO CUENTA FINGIDA: el nivel de acceso se deriva de la sesión REAL
//     (`/api/auth/me`); si no hay sesión, el carnet dice «invitado» y ofrece
//     las puertas de verdad, no un botón que finge entrar.
//  ② CERO FOTO FUERA DEL APARATO: la foto se reduce aquí mismo (canvas del
//     navegador) y se guarda en el aparato. No viaja a ningún servidor y la
//     pantalla lo dice con esas palabras.
//  ③ CERO CIFRAS INVENTADAS: los números de permisos se cuentan del censo real
//     en el momento de pintar.
// ============================================================

import { huellaDe } from "@/lib/vanguard-id";
import { MODULOS_NUCLEO, type PermisoModulo } from "@/lib/nucleo/registro";

// ── NIVELES DE ACCESO ────────────────────────────────────────

export const NIVELES_ACCESO = ["invitado", "jugador", "jugador_verificado", "dueno"] as const;
export type NivelAcceso = (typeof NIVELES_ACCESO)[number];

export const ETIQUETA_NIVEL: Record<NivelAcceso, { nombre: string; lema: string; color: string }> = {
  invitado: {
    nombre: "INVITADO",
    lema: "Entras y miras. Todo lo público está abierto; lo que pide cuenta, no.",
    color: "text-zinc-400",
  },
  jugador: {
    nombre: "JUGADOR",
    lema: "Tienes cuenta en la casa: guardas tu partida y tu perfil viaja contigo.",
    color: "text-amber",
  },
  jugador_verificado: {
    nombre: "JUGADOR VERIFICADO",
    lema: "Cuenta + carnet completo: alias, foto, bio y código guardado.",
    color: "text-green-hud",
  },
  dueno: {
    nombre: "DUEÑO",
    lema: "La cuenta del propietario: abre también lo que es solo suyo.",
    color: "text-red-hud",
  },
};

/** Nivel real del jugador — derivado, nunca escrito a mano. */
export function nivelDeAcceso(datos: {
  haySesion: boolean;
  isOwner: boolean;
  carnetCompleto: boolean;
}): NivelAcceso {
  if (datos.isOwner && datos.haySesion) return "dueno";
  if (datos.haySesion && datos.carnetCompleto) return "jugador_verificado";
  if (datos.haySesion) return "jugador";
  return "invitado";
}

// ── PERMISOS: se LEEN del censo del núcleo ───────────────────

export const ETIQUETA_PERMISO: Record<PermisoModulo, { nombre: string; lema: string }> = {
  publico: { nombre: "PÚBLICO", lema: "cualquiera, sin cuenta" },
  cuenta: { nombre: "CON CUENTA", lema: "pide sesión iniciada" },
  dueno: { nombre: "DUEÑO", lema: "solo el propietario" },
};

/** ¿Este nivel puede abrir un módulo con este permiso? (lógica pura y corta) */
export function puedeAbrir(permiso: PermisoModulo, nivel: NivelAcceso): boolean {
  if (permiso === "publico") return true;
  if (permiso === "cuenta") return nivel !== "invitado";
  return nivel === "dueno";
}

export interface PuertaPermiso {
  id: string;
  nombre: string;
  ruta: string;
  permiso: PermisoModulo;
  estado: string;
  categoria: string;
}

/** Todas las puertas del censo, con su permiso real — copiadas, no inventadas. */
export function puertasDelCenso(): PuertaPermiso[] {
  return MODULOS_NUCLEO.map((m) => ({
    id: m.id,
    nombre: m.nombre,
    ruta: m.ruta,
    permiso: m.permiso,
    estado: m.estado,
    categoria: m.categoria,
  }));
}

/** Recuento por permiso (cifras reales del censo, calculadas al pintar). */
export function cuentaPorPermiso(): Record<PermisoModulo, number> {
  const cuenta: Record<PermisoModulo, number> = { publico: 0, cuenta: 0, dueno: 0 };
  for (const m of MODULOS_NUCLEO) cuenta[m.permiso] += 1;
  return cuenta;
}

/** Las puertas que este nivel NO puede abrir todavía (honestidad útil). */
export function puertasCerradas(nivel: NivelAcceso): PuertaPermiso[] {
  return puertasDelCenso().filter((p) => !puedeAbrir(p.permiso, nivel));
}

// ── EL CÓDIGO DEL JUGADOR (misma huella que el carnet v359) ──

/**
 * Código estable y corto del jugador: `VG-XXXX-YYYY`.
 * Sale de `huellaDe()` de `vanguard-id.ts` — el mismo motor que usa el carnet
 * para la verificación humana entre agentes. Misma semilla → mismo código,
 * siempre; semilla distinta → código distinto. NO es un secreto: es una
 * matrícula para que dos personas puedan comprobar que hablan con la misma.
 */
export function codigoJugador(semilla: string): string {
  const h = huellaDe(semilla.trim().toUpperCase() || "VANGUARD");
  return `VG-${h}`;
}

/** Semilla honesta: la cuenta si hay; si no, el alias del aparato. */
export function semillaDeJugador(datos: { username: string | null; alias: string }): string {
  if (datos.username) return `cuenta:${datos.username}`;
  if (datos.alias) return `aparato:${datos.alias}`;
  return "aparato:sin-alias";
}

// ── EL CARNET: lo que cada jugador debe tener ────────────────

export interface PiezaCarnet {
  id: string;
  nombre: string;
  hecho: boolean;
  /** qué falta o qué ya está, en una línea */
  detalle: string;
  /** a dónde ir para completarlo (ruta real de la casa) */
  puerta: string;
}

export const PIEZAS_CARNET_TOTAL = 6;

export function carnetDe(datos: {
  alias: string;
  foto: string | null;
  bio: string;
  haySesion: boolean;
  modo: string;
  codigoCopiado: boolean;
}): PiezaCarnet[] {
  return [
    {
      id: "alias",
      nombre: "ALIAS FIRMADO",
      hecho: datos.alias.trim().length >= 3,
      detalle: datos.alias.trim().length >= 3 ? `firmas como ${datos.alias}` : "te falta un alias de 3 caracteres o más",
      puerta: "/perfil",
    },
    {
      id: "foto",
      nombre: "FOTO",
      hecho: !!datos.foto,
      detalle: datos.foto ? "tu foto está puesta (vive en tu aparato)" : "sin foto: se pone aquí abajo, desde tu aparato",
      puerta: "/perfil",
    },
    {
      id: "bio",
      nombre: "BIO",
      hecho: datos.bio.trim().length >= 8,
      detalle: datos.bio.trim().length >= 8 ? "tu frase está escrita" : "una frase de 8 caracteres o más",
      puerta: "/perfil",
    },
    {
      id: "cuenta",
      nombre: "CUENTA",
      hecho: datos.haySesion,
      detalle: datos.haySesion ? "sesión iniciada: tu partida se guarda" : "sin cuenta: lo tuyo vive solo en este aparato",
      puerta: "/modo",
    },
    {
      id: "modo",
      nombre: "MODO ELEGIDO",
      hecho: datos.modo.trim().length > 0,
      detalle: datos.modo ? `tu modo: ${datos.modo}` : "«¿qué quieres hacer en Vanguard?» sin responder",
      puerta: "/modo",
    },
    {
      id: "codigo",
      nombre: "CÓDIGO GUARDADO",
      hecho: datos.codigoCopiado,
      detalle: datos.codigoCopiado ? "ya lo copiaste: guárdalo fuera de aquí" : "copia tu código y guárdalo: sin él no hay forma de demostrar que eres tú",
      puerta: "/perfil",
    },
  ];
}

export function progresoCarnet(piezas: PiezaCarnet[]): { hechos: number; total: number; porcentaje: number } {
  const hechos = piezas.filter((p) => p.hecho).length;
  const total = piezas.length;
  return { hechos, total, porcentaje: total === 0 ? 0 : Math.round((hechos / total) * 100) };
}

// ── LA FOTO: límites reales del aparato ──────────────────────

export const LIMITES_FOTO = {
  /** 320 px de lado: suficiente para un carnet y cabe de sobra en el aparato */
  ladoMax: 320,
  /** el data URL que se guarda nunca pasa de aquí (medido, no supuesto) */
  maxBytesDataUrl: 300 * 1024,
  tipos: ["image/jpeg", "image/png", "image/webp"] as string[],
  formatoSalida: "image/jpeg",
  calidadSalida: 0.82,
};

/** ¿Cabe esta foto en el aparato? (comprobación pura sobre el data URL) */
export function fotoCabe(dataUrl: string): boolean {
  // un data URL en base64 ocupa ~4/3 del binario; se compara el texto ya hecho
  return dataUrl.length <= Math.ceil((LIMITES_FOTO.maxBytesDataUrl * 4) / 3);
}

export function bytesDeDataUrl(dataUrl: string): number {
  const i = dataUrl.indexOf(",");
  if (i < 0) return 0;
  const b64 = dataUrl.slice(i + 1);
  return Math.round((b64.length * 3) / 4);
}

// ── LA PERSONALIZACIÓN: qué se puede tocar y dónde vive ──────

export interface PiezaPersonalizacion {
  id: string;
  nombre: string;
  detalle: string;
  /** el archivo real de la casa que ya lo guarda — la prueba de que existe */
  vive: string;
}

/**
 * Las nueve piezas de personalización de la casa. Ocho YA existían en
 * `profile-store.ts`; la novena (la foto) entra en el mismo store. Nada de
 * esto es una idea nueva: es el inventario del perfil para que el jugador vea
 * de un golpe todo lo que puede tocar.
 */
export const PERSONALIZACION: PiezaPersonalizacion[] = [
  { id: "foto", nombre: "FOTO", detalle: "tu cara, tu escudo o lo que quieras: se reduce en el aparato y se guarda en él", vive: "src/lib/profile-store.ts (campo foto, v367.6)" },
  { id: "cbAvatar", nombre: "COUNTRYBALL", detalle: "el avatar de la casa: los países con su bandera real y buscador", vive: "src/lib/profile-store.ts (cbAvatar)" },
  { id: "banner", nombre: "BANNER", detalle: "cinco degradados de cabecera", vive: "src/lib/profile-store.ts (BANNERS)" },
  { id: "frame", nombre: "MARCO", detalle: "cinco marcos alrededor del avatar", vive: "src/lib/profile-store.ts (FRAMES)" },
  { id: "bio", nombre: "BIO", detalle: "tu frase, la que se lee en el carnet", vive: "src/lib/profile-store.ts (bio)" },
  { id: "favCountry", nombre: "PAÍS FAVORITO", detalle: "con su bandera verdadera", vive: "src/lib/profile-store.ts (favCountry)" },
  { id: "favFaction", nombre: "FACCIÓN", detalle: "siete facciones declaradas de la casa", vive: "src/lib/profile-store.ts (FACTIONS)" },
  { id: "firma", nombre: "FIRMA 3D", detalle: "la que se forja en EXPERIMENTAL → FORJA", vive: "src/lib/profile-store.ts (firma)" },
  { id: "alias", nombre: "ALIAS", detalle: "tu nombre de agente, con historial anti-suplantación", vive: "src/lib/game-store.ts (setAlias + idAliasHistorial)" },
];

export const PERSONALIZACION_TOTAL = PERSONALIZACION.length;
