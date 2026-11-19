// ═══════════════════════════════════════════════════════════════════
// v420.3 · VANGUARD INFRASTRUCTURE ATLAS — FORMATO
// Presentación del Atlas: fechas, ubicación, nombres de país y países
// validados contra geo-paises. Falla suave: nada inventado.
// ═══════════════════════════════════════════════════════════════════

import { POR_ISO2, type PaisGeo } from "@/lib/geo-paises";
import { META_CATEGORIA, type CategoriaInfra, type EstadoVerificacion } from "./tipos";

/** Nombre del país por ISO-2. Si no existe en geo-paises, devuelve el ISO. */
export function nombrePais(iso2: string): string {
  const pais: PaisGeo | undefined = POR_ISO2.get(iso2);
  return pais ? pais.nombre : iso2;
}

/** Nombre completo de una categoría. */
export function nombreCategoria(categoria: CategoriaInfra): string {
  return META_CATEGORIA[categoria].nombre;
}

/** Fecha conocida o «sin dato documentado». */
export function formatoFecha(fecha: string | null): string {
  return fecha && fecha.trim() ? fecha : "sin dato documentado";
}

/** Ubicación completa: «Ciudad – País». */
export function formatoUbicacion(ciudad: string, iso2: string): string {
  const pais = nombrePais(iso2);
  return `${ciudad} — ${pais}`;
}

/** Marca visual del estado de verificación. */
export function claseVerificacion(estado: EstadoVerificacion): string {
  if (estado === "confirmado") return "vx-ok";
  if (estado === "documentado") return "vx-info";
  return "vx-aviso";
}

export function etiquetaVerificacion(estado: EstadoVerificacion): string {
  if (estado === "confirmado") return "Verificado";
  if (estado === "documentado") return "Documentado";
  return "Por verificar";
}

/** Coordenadas para el mapa o el gráfico: «33.64, -84.43». */
export function formatoCoordenadas(lat: number, lng: number): string {
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

/** Enlace seguro a la fuente (se abre en pestaña nueva, sin referer). */
export function enlaceFuente(url: string): string {
  return url;
}

/** Construye el título de la ficha: «Nombre — Categoría». */
export function tituloFicha(nombre: string, categoria: CategoriaInfra): string {
  return `${nombre} · ${nombreCategoria(categoria)}`;
}
