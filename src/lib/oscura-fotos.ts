// ═══════════════════════════════════════════════════════════════════
// v404.0 · LA FOTO DEL EXPEDIENTE — qué foto real ilustra cada entrada.
//
// REGLA EDITORIAL (la del Dueño, sin excepciones): solo fotos que YA ESTÁN
// en el repositorio (`public/imagenes-reales/`, la capa real de la casa) y
// solo cuando el tema de la foto COINCIDE con el tema de la entrada. Nada
// descargado, nada generado, ninguna pareja inventada para rellenar: si no
// hay foto honesta, la ficha va sin foto y se sostiene con su emblema.
//
// La etiqueta que se enseña debajo de cada foto es SIEMPRE la de la foto
// (`IMAGENES_REALES[].label`), no la de la entrada, y va rotulada
// «imagen de archivo». Así el visitante ve qué está mirando, aunque el
// expediente hable de otra cosa.
// ═══════════════════════════════════════════════════════════════════
import { IMAGENES_REALES } from "./imagenes-data";

/** entrada de la biblioteca oscura → id de la foto real de la casa */
export const FOTO_DE: Record<string, string> = {
  // ── teorías ──────────────────────────────────────────────────────
  "t-mkultra": "cia", //            Langley: la agencia del proyecto
  "t-area51": "area51", //          la base del expediente
  "t-haarp": "haarp", //            la matriz de antenas
  "t-bermudas": "bermudas", //      el triángulo
  "t-now": "onu", //                la asamblea que la teoría señala
  "t-doomsday": "svalbard", //      la bóveda de semillas del fin del mundo
  "t-uap": "pentagono", //          quien confirmó los vídeos
  "t-stargate": "control", //       sala de control: el programa psíquico
  "t-venona": "kremlin", //         el espía vive al otro lado
  // ── armas-idea ───────────────────────────────────────────────────
  "a-arco": "arco",
  "a-falange": "falange",
  "a-polvora": "polvora",
  "a-enigma": "enigma",
  "a-v2": "v2",
  "a-atomica": "nuclear",
  "a-gps": "gps",
  "a-dron": "dronmq9",
  // ── civilizaciones ───────────────────────────────────────────────
  "c-sumeria": "sumeria",
  "c-indus": "indus",
  "c-tartessos": "tartessos",
  "c-minoica": "minoica",
  "c-nabateos": "nabatea",
  "c-khmer": "khmer",
  "c-mali": "mali",
  "c-rapanui": "rapanui",
  // ── documentos desclasificados ───────────────────────────────────
  "d-german": "muroberlin", //      la red Gehlen, en la Alemania partida
  "d-coldwar": "u2", //             el avión espía de la era del borde del abismo
  "d-nuclear": "chernobyl", //      el accidente que enseñó lo que era un minuto
};

export type FotoExpediente = { src: string; label: string; nota: string };

const POR_ID = new Map(IMAGENES_REALES.map((i) => [i.id, i]));

/** La foto de una entrada, o null si no hay ninguna honesta. */
export function fotoDe(entrada: string): FotoExpediente | null {
  const id = FOTO_DE[entrada];
  if (!id) return null;
  const img = POR_ID.get(id);
  if (!img) return null; // si la capa real cambia, la ficha no miente: se queda sin foto
  return { src: img.src, label: img.label, nota: img.nota };
}

/** Cuántas entradas tienen foto — cifra derivada, nunca escrita a mano. */
export const CON_FOTO = Object.keys(FOTO_DE).length;
