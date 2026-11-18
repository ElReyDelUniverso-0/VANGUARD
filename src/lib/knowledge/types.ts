// VANGUARD v406.6 — TIPOS DEL CENTRO DE CONOCIMIENTO GLOBAL & ENCICLOPEDIA MUNDIAL
// Definiciones estructuradas con soporte para geolocalización, estadísticas verificadas,
// cronologías y conexiones intermodulares nativas (vanguard:navigate).

export type WikiCat =
  | "GUERRAS"
  | "POLITICA"
  | "LIDERES"
  | "PARTIDOS"
  | "RELIGIONES"
  | "PAISES_HISTORIA"
  | "GEOGRAFIA"
  | "ECONOMIA"
  | "CIVILIZACIONES"
  | "CIENCIA_TECNOLOGIA"
  | "ORGANIZACIONES"
  | "ENERGIA_RECURSOS"
  | "CULTURA_SOCIEDAD";

export interface ModuloConexion {
  modulo: "atlas" | "paises" | "wikiguerra" | "salaguerra" | "geoint" | "biblioteca" | "mercados" | "ciber";
  label: string;
  targetId?: string;
  explicacion: string;
}

export interface DatoClave {
  indicador: string;
  valor: string;
  impactoGlobal: string;
}

export interface WikiEntry {
  id: string;
  cat: WikiCat;
  title: string;
  subtitle: string;
  dates: string;
  region: string;
  img?: string;
  stats: { label: string; value: string }[];
  desc: string;
  facts: string[];
  timeline: { year: string; text: string }[];
  wiki: string;
  coordenadas?: { lat: number; lng: number };
  mapaContexto?: string;
  conexionesModulos?: ModuloConexion[];
  datosClave?: DatoClave[];
  tratadosClave?: string[];
}
