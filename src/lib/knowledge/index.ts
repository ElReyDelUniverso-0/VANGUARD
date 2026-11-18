// VANGUARD v406.6 — EXPANSIÓN DEL CONOCIMIENTO GLOBAL & ENCICLOPEDIA MUNDIAL
// Exportación agregada de las 8 disciplinas solicitadas por la Misión de Expansión del Conocimiento.

export * from "./types";
export * from "./data-paises-historia";
export * from "./data-geografia";
export * from "./data-economia";
export * from "./data-civilizaciones";
export * from "./data-ciencia-tecnologia";
export * from "./data-organizaciones";
export * from "./data-energia-recursos";
export * from "./data-cultura-sociedad";

import type { WikiEntry } from "./types";
import { PAISES_HISTORIA_ENTRIES } from "./data-paises-historia";
import { GEOGRAFIA_ENTRIES } from "./data-geografia";
import { ECONOMIA_ENTRIES } from "./data-economia";
import { CIVILIZACIONES_ENTRIES } from "./data-civilizaciones";
import { CIENCIA_TECNOLOGIA_ENTRIES } from "./data-ciencia-tecnologia";
import { ORGANIZACIONES_ENTRIES } from "./data-organizaciones";
import { ENERGIA_RECURSOS_ENTRIES } from "./data-energia-recursos";
import { CULTURA_SOCIEDAD_ENTRIES } from "./data-cultura-sociedad";

export const EXPANDED_KNOWLEDGE_ENTRIES: WikiEntry[] = [
  ...PAISES_HISTORIA_ENTRIES,
  ...GEOGRAFIA_ENTRIES,
  ...ECONOMIA_ENTRIES,
  ...CIVILIZACIONES_ENTRIES,
  ...CIENCIA_TECNOLOGIA_ENTRIES,
  ...ORGANIZACIONES_ENTRIES,
  ...ENERGIA_RECURSOS_ENTRIES,
  ...CULTURA_SOCIEDAD_ENTRIES,
];
