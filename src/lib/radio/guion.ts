// ═══════════════════════════════════════════════════════════════════
// v431.2 RADIO VANGUARD · EL GUION (segunda versión) — convertir el archivo
// entero en un programa que se pueda escuchar sin que sobre nada.
//
// CAMBIOS SOBRE v422.3 (todos medibles):
//   ① NO REPITE LA MISMA NOTICIA: los cables que cuentan lo mismo se agrupan
//      (`agrupar`) y se cuenta el asunto una vez, diciendo cuántos medios lo
//      firman — dato real, no relleno.
//   ② NO ES CUATRO VECES EL MISMO SITIO: la selección exige diversidad de
//      región y de fuente antes de completar por relevancia (`seleccionar`).
//   ③ SABE CUÁNTO DURA: se le puede pedir un programa de 2, 5 o 10 minutos y
//      el número de asuntos sale de ahí (`objetivoMs`), no de un número fijo.
//   ④ DA CIFRAS DEL ARCHIVO, no adjetivos: «150 cables de 10 medios»,
//      «lo firman tres medios», «es el cuarto cable sobre este frente».
//   ⑤ NO REPITE SUS PROPIAS FÓRMULAS: los conectores rotan por índice; antes
//      un programa de seis bloques podía decir «Te cuento» tres veces.
//
// ── v437.0 · EL PROGRAMA EN TU IDIOMA ──────────────────────────────────────
// Las fórmulas de la casa (sintonía, cifras, puentes, cierre, invitación) ya no
// están escritas aquí dentro: viven en marcos.ts, un marco por idioma, y se
// eligen con `opciones.idioma`. En español los tres estilos dicen exactamente lo
// mismo que decían (los textos están copiados tal cual, uno por uno). Los cables
// —titular, resumen, fuente— NO se traducen: se leen como se publicaron, y la
// pantalla lo dice. Traducir a ojo sería inventar.
//
// LO QUE NO HA CAMBIADO (ley de la casa): no se inventa ni un dato. El texto
// sale del titular, el resumen, la fuente, la región y la hora REALES. Las
// fórmulas de locución no afirman nada. Si no hay cables, el programa lo dice.
// Sin DOM, sin red, sin reloj propio: se prueba en Node.
// ═══════════════════════════════════════════════════════════════════

import type { Nota } from "@/lib/portada/notas";
import { type Grupo, agrupar, asuntosPara, seleccionar, tokens } from "./agrupar";
import { marcoDe, type EstiloRadio as EstiloMarco } from "./marcos";
import type { IdiomaVozId } from "@/lib/voz/idiomas";

export type EstiloRadio = EstiloMarco;

export type TipoBloque =
  | "sintonia"
  | "cifras"
  | "titular"
  | "desarrollo"
  | "contexto"
  | "puente"
  | "cierre"
  | "invitacion";

export type BloqueGuion = {
  /** identidad estable dentro del programa (para señalar en pantalla) */
  id: string;
  tipo: TipoBloque;
  texto: string;
  /** silencio real que se deja DESPUÉS de este bloque, en ms */
  pausaMs: number;
  /** la nota de la que sale, si sale de una */
  notaId?: string;
  fuente?: string;
  href?: string;
  /** todas las fuentes que firman el asunto, si son varias */
  fuentes?: string[];
  /** lo que se ve en pantalla mientras se dice (más corto que el audio) */
  rotulo?: string;
};

export type Programa = {
  titulo: string;
  estilo: EstiloRadio;
  /** v437.0 · el idioma en que la casa DICE este programa (las fórmulas) */
  idioma: IdiomaVozId;
  bloques: BloqueGuion[];
  /** estimación honesta de duración (~14 caracteres por segundo + silencios) */
  duracionMs: number;
  /** las notas que entraron, en orden */
  notaIds: string[];
  /** cuántos asuntos distintos cubre */
  asuntos: number;
  /** cables que se agruparon por contar lo mismo */
  repetidos: number;
  generadoEn: string;
};

export type OpcionesPrograma = {
  estilo?: EstiloRadio;
  /** cuántas noticias desarrollo (sin contar titulares). Manda sobre objetivoMs. */
  limite?: number;
  /** duración buscada del programa (ms): decide cuántos asuntos entran */
  objetivoMs?: number;
  /** leer también el resumen, no solo el titular */
  conResumen?: boolean;
  /** decir cuántos medios firman cada asunto cuando son varios */
  conFuentes?: boolean;
  /** dar las cifras del archivo al principio */
  conCifras?: boolean;
  /** cerrar invitando a preguntar */
  conInvitacion?: boolean;
  /** hora local para el saludo (0–23); si falta, no se saluda con hora */
  hora?: number;
  /** fecha de referencia para decir «hace X» */
  ahora?: number;
  /**
   * v437.0 · el idioma de las fórmulas. Si falta, español. Los cables NO se
   * traducen: viajan en el idioma en que el medio los publicó.
   */
  idioma?: IdiomaVozId;
};

const PAUSA: Record<TipoBloque, number> = {
  sintonia: 420,
  cifras: 380,
  titular: 300,
  desarrollo: 620,
  contexto: 340,
  puente: 300,
  cierre: 700,
  invitacion: 500,
};

/** Rota por índice: el mismo conector no sale dos veces seguidas. */
function turno<T>(lista: T[], i: number): T {
  return lista[((i % lista.length) + lista.length) % lista.length];
}

/** Recorta por frase completa: nunca corta una palabra ni una idea a la mitad. */
export function recortarPorFrase(texto: string, max: number): string {
  const limpio = (texto || "").replace(/\s+/g, " ").trim();
  if (limpio.length <= max) return limpio;
  const corte = limpio.slice(0, max);
  const punto = Math.max(corte.lastIndexOf(". "), corte.lastIndexOf("; "), corte.lastIndexOf(", "));
  if (punto > max * 0.45) return limpio.slice(0, punto + 1).trim();
  const espacio = corte.lastIndexOf(" ");
  return `${limpio.slice(0, espacio > 0 ? espacio : max).trim()}…`;
}

/**
 * «Hace 12 minutos», en palabras que se puedan decir.
 * v437.0 · con idioma: la frase la pone el marco del idioma (marcos.ts).
 */
export function haceLegible(iso: string, ahora: number, idioma: IdiomaVozId = "es"): string {
  return marcoDe("cercana", idioma).hace(iso, ahora);
}

function enlace(nota: Nota): string {
  return `/lectura/${nota.id}`;
}

function enumerar(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

/**
 * EL PROGRAMA. Orden: sintonía → cifras (opcional) → titulares (3) →
 * desarrollo por asunto (N) → cierre → invitación.
 */
export function construirPrograma(notas: Nota[], opciones: OpcionesPrograma = {}): Programa {
  // Un estilo que no existe (ajuste viejo guardado en el aparato, o llamada
  // desde fuera) NO puede tumbar el programa: se cae al de por defecto.
  const ESTILOS_VALIDOS: EstiloRadio[] = ["serena", "cercana", "filosa"];
  const estilo: EstiloRadio =
    opciones.estilo && ESTILOS_VALIDOS.includes(opciones.estilo) ? opciones.estilo : "cercana";
  const limite = Math.max(
    1,
    Math.min(8, opciones.limite ?? (opciones.objetivoMs ? asuntosPara(opciones.objetivoMs) : 4))
  );
  const conResumen = opciones.conResumen !== false;
  const conFuentes = opciones.conFuentes !== false;
  const conCifras = opciones.conCifras !== false;
  const conInvitacion = opciones.conInvitacion !== false;
  const ahora = opciones.ahora ?? Date.now();
  const idioma: IdiomaVozId = opciones.idioma ?? "es";
  // el marco del idioma: aquí están las palabras que la casa dice (marcos.ts)
  const v = marcoDe(estilo, idioma);

  const utiles = notas.filter((n) => n && n.titulo);
  const grupos = seleccionar(utiles, { maximo: Math.max(limite, 1), ahora, objetivoMs: opciones.objetivoMs });
  const bloques: BloqueGuion[] = [];
  let giro = 0; // contador de fórmulas: evita repetir la misma dos veces

  // ① sintonía
  const saludoBase = turno(v.saludo, utiles.length);
  const saludo = saludoBase.replace("{hora}", opciones.hora !== undefined ? `${opciones.hora}:00` : "");
  const todasAgrupadas = agrupar(utiles);
  bloques.push({
    id: "sintonia",
    tipo: "sintonia",
    // el separador y el punto final son del idioma (en chino: ninguno y «。」)
    texto: utiles.length === 0 ? v.sinCables : `${saludo}${v.sep}${v.archivo(utiles.length)}${v.punto}`,
    pausaMs: PAUSA.sintonia,
    rotulo: v.rot.sintonia,
  });

  if (utiles.length === 0) {
    return {
      titulo: "Radio Vanguard",
      estilo,
      idioma,
      bloques,
      duracionMs: estimarDuracion(bloques),
      notaIds: [],
      asuntos: 0,
      repetidos: 0,
      generadoEn: new Date(ahora).toISOString(),
    };
  }

  // ② cifras del archivo (dato, no adorno)
  if (conCifras) {
    const medios = new Set(utiles.map((n) => n.fuente)).size;
    const regiones = new Set(utiles.map((n) => n.region)).size;
    const repetidos = todasAgrupadas.reduce((s, g) => s + g.duplicados.length, 0);
    bloques.push({
      id: "cifras",
      tipo: "cifras",
      texto:
        repetidos > 0
          ? `${v.cifras({ cables: utiles.length, medios, regiones })} ${v.repetidos(repetidos)}`
          : v.cifras({ cables: utiles.length, medios, regiones }),
      pausaMs: PAUSA.cifras,
      rotulo: v.rot.cifras,
    });
  }

  // ③ titulares
  const cuantosTitulares = Math.min(3, grupos.length);
  bloques.push({
    id: "titulares",
    tipo: "titular",
    texto: turno(v.titulares, grupos.length),
    pausaMs: 240,
    rotulo: v.rot.titulares,
  });
  for (let i = 0; i < cuantosTitulares; i++) {
    const g = grupos[i];
    const n = g.principal;
    const extra = conFuentes && g.fuentes.length > 1 ? v.tambienEn(g.fuentes.length - 1) : "";
    bloques.push({
      id: `titular-${i}`,
      tipo: "titular",
      texto: `${i + 1}. ${recortarPorFrase(n.titulo, 130)}. ${n.fuente}${extra}.`,
      pausaMs: PAUSA.titular,
      notaId: n.id,
      fuente: n.fuente,
      href: enlace(n),
      fuentes: g.fuentes,
      rotulo: n.titulo,
    });
  }

  // ④ desarrollo
  let regionPrevia = "";
  const cuantos = Math.min(limite, grupos.length);
  for (let i = 0; i < cuantos; i++) {
    const g = grupos[i];
    const n = g.principal;
    const region = v.region(n.region);

    if (i === 0) {
      bloques.push({
        id: `antes-${i}`,
        tipo: "puente",
        texto: `${turno(v.antes, giro++)} ${region}:`,
        pausaMs: 240,
        rotulo: region,
      });
    } else if (region !== regionPrevia) {
      bloques.push({
        id: `puente-${i}`,
        tipo: "puente",
        texto: `${turno(v.puente, giro++)} ${region}.`,
        pausaMs: PAUSA.puente,
        rotulo: region,
      });
    } else {
      bloques.push({
        id: `despues-${i}`,
        tipo: "puente",
        texto: turno(v.despues, giro++),
        pausaMs: 200,
        rotulo: v.rot.seguimos,
      });
    }
    regionPrevia = region;

    const cuerpo = conResumen && n.resumen ? recortarPorFrase(n.resumen, 260) : "";
    const cuando = v.hace(n.fecha, ahora);
    bloques.push({
      id: `desarrollo-${i}`,
      tipo: "desarrollo",
      texto: v.desarrollo(recortarPorFrase(n.titulo, 160), cuerpo, n.fuente, cuando),
      pausaMs: PAUSA.desarrollo,
      notaId: n.id,
      fuente: n.fuente,
      href: enlace(n),
      fuentes: g.fuentes,
      rotulo: n.titulo,
    });

    // ⑤ contexto: lo que el archivo SABE del asunto (medios y repetición)
    if (conFuentes && g.fuentes.length > 1) {
      const otros = g.fuentes.filter((f) => f !== n.fuente);
      bloques.push({
        id: `contexto-${i}`,
        tipo: "contexto",
        texto: v.firma(g.fuentes.length, enumerar(g.fuentes), n.fuente, otros.length),
        pausaMs: PAUSA.contexto,
        notaId: n.id,
        fuente: n.fuente,
        href: enlace(n),
        fuentes: g.fuentes,
        rotulo: v.rot.firma,
      });
    }
  }

  // ⑥ cierre (+ invitación)
  bloques.push({
    id: "cierre",
    tipo: "cierre",
    texto: turno(v.cierre, cuantos),
    pausaMs: PAUSA.cierre,
    rotulo: v.rot.cierre,
  });
  if (conInvitacion) {
    bloques.push({
      id: "invitacion",
      tipo: "invitacion",
      texto: turno(v.invitacion, 0),
      pausaMs: PAUSA.invitacion,
      rotulo: v.rot.invitacion,
    });
  }

  const repetidos = grupos
    .slice(0, cuantos)
    .reduce((s, g) => s + g.duplicados.length, 0);

  return {
    titulo: v.titulo(cuantosTitulares, cuantos),
    estilo,
    idioma,
    bloques,
    duracionMs: estimarDuracion(bloques),
    notaIds: grupos.slice(0, cuantos).map((g) => g.principal.id),
    asuntos: cuantos,
    repetidos,
    generadoEn: new Date(ahora).toISOString(),
  };
}

/** Duración estimada: caracteres hablados a ~14 por segundo + los silencios. */
export function estimarDuracion(bloques: BloqueGuion[]): number {
  const voz = bloques.reduce((ms, b) => ms + (b.texto.length / 14) * 1000, 0);
  const pausas = bloques.reduce((ms, b) => ms + b.pausaMs, 0);
  return Math.round(voz + pausas);
}

/** El programa entero como texto (para copiar, para lectores de pantalla). */
export function programaATexto(p: Programa): string {
  return p.bloques.map((b) => b.texto).join("\n\n");
}

/** El programa como guion de trabajo: con su fuente y su pausa a la vista. */
export function programaAGuion(p: Programa): string {
  const cabecera = [
    `# ${p.titulo}`,
    ``,
    `- estilo: ${p.estilo}`,
    `- idioma: ${p.idioma}`,
    `- bloques: ${p.bloques.length}`,
    `- duración estimada: ${Math.round(p.duracionMs / 1000)} s`,
    `- asuntos: ${p.asuntos} · cables agrupados por repetirse: ${p.repetidos}`,
    `- generado: ${p.generadoEn}`,
    ``,
  ].join("\n");
  const cuerpo = p.bloques
    .map(
      (b, i) =>
        `${String(i + 1).padStart(2, "0")} [${b.tipo}·${b.pausaMs}ms] ${b.texto}${b.href ? `\n    ↳ ${b.href}${b.fuentes && b.fuentes.length > 1 ? ` · ${b.fuentes.join(" · ")}` : ""}` : ""}`
    )
    .join("\n");
  return `${cabecera}${cuerpo}\n`;
}

/** Las palabras clave del programa (para buscadores y para la pantalla). */
export function etiquetasDe(p: Programa, max = 8): string[] {
  const cuenta = new Map<string, number>();
  for (const b of p.bloques) {
    for (const t of new Set(tokens(b.texto))) cuenta.set(t, (cuenta.get(t) ?? 0) + 1);
  }
  return [...cuenta.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, max)
    .map(([t]) => t);
}

export type { Grupo };
