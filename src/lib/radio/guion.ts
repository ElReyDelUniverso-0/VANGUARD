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
// LO QUE NO HA CAMBIADO (ley de la casa): no se inventa ni un dato. El texto
// sale del titular, el resumen, la fuente, la región y la hora REALES. Las
// fórmulas de locución no afirman nada. Si no hay cables, el programa lo dice.
// Sin DOM, sin red, sin reloj propio: se prueba en Node.
// ═══════════════════════════════════════════════════════════════════

import type { Nota } from "@/lib/portada/notas";
import { type Grupo, agrupar, asuntosPara, seleccionar, tokens } from "./agrupar";

export type EstiloRadio = "serena" | "cercana" | "filosa";

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
};

const REGION_NOMBRE: Record<string, string> = {
  europa: "Europa",
  oriente: "Oriente Medio",
  americas: "América",
  africa: "África",
  asia: "Asia",
  mundo: "el mundo",
};

/** Fórmulas de locución por estilo. No afirman hechos: son cuerpo, no datos. */
const VOCES: Record<
  EstiloRadio,
  {
    saludo: string[];
    titulares: string[];
    antes: string[];
    despues: string[];
    puente: string[];
    cierre: string[];
    invitacion: string[];
  }
> = {
  serena: {
    saludo: ["Radio Vanguard. La casa te cuenta el día.", "Son las {hora}. Esto es Radio Vanguard."],
    titulares: ["Estos son los cables que abren el día.", "Los asuntos para entender la jornada.", "Lo que hay, en orden."],
    antes: ["Empezamos por", "Vamos con", "Primer asunto:"],
    despues: ["Seguimos.", "Siguiente.", "Otro frente."],
    puente: ["Cambiamos de región.", "Nos vamos a", "Ahora, en"],
    cierre: ["Hasta aquí el programa. Las fuentes quedan en pantalla.", "Esto es todo por ahora.", "Cerramos aquí. Todo lo dicho tiene su fuente."],
    invitacion: ["Puedes preguntarme por cualquier frente. Te responderé con lo que hay en el archivo, y te diré cuándo no hay nada."],
  },
  cercana: {
    saludo: ["¡Hola! Soy la voz de la casa. Vamos a ver el día juntos.", "Buenas. Te cuento lo que está pasando, sin prisa.", "Aquí la radio de la casa. Vamos allá."],
    titulares: ["Te cuento lo que hay hoy.", "Mira lo que tenemos en el archivo.", "Esto es lo que ha entrado."],
    antes: ["Te cuento lo de", "Empecemos por", "Vamos con"],
    despues: ["Y ahora, otra cosa.", "Seguimos.", "Vamos a otro sitio."],
    puente: ["Nos vamos a", "Ahora te llevo a", "Cambiamos de escenario:"],
    cierre: ["Nada más por ahora. Todo lo que has oído tiene su fuente en pantalla.", "Y hasta aquí el paseo de hoy.", "Lo dejamos aquí, que el día sigue."],
    invitacion: ["Pregúntame lo que quieras: si está en el archivo te lo leo, y si no está, te lo digo claro."],
  },
  filosa: {
    saludo: ["Radio Vanguard. Sin adornos: los cables del día.", "Directo al grano.", "Lo que hay, sin relleno."],
    titulares: ["Esto es lo que hay.", "Los titulares, sin relleno.", "Los hechos, uno detrás de otro."],
    antes: ["Primero:", "Vamos con", "Empezamos por"],
    despues: ["Siguiente.", "Vamos a lo siguiente.", "Otro."],
    puente: ["Saltamos a", "Ahora:", "Nos vamos a"],
    cierre: ["Fin del programa. Las fuentes están en pantalla: compruébalas.", "Corto y claro: hasta aquí.", "Se acabó. Los datos, a la vista."],
    invitacion: ["Si quieres una explicación, pregunta. Si no lo sé, no me lo invento."],
  },
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

/** «Hace 12 minutos», en palabras que se puedan decir. */
export function haceLegible(iso: string, ahora: number): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const min = Math.round((ahora - t) / 60000);
  if (min < 2) return "hace un momento";
  if (min < 60) return `hace ${min} minutos`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} ${h === 1 ? "hora" : "horas"}`;
  const d = Math.round(h / 24);
  return `hace ${d} ${d === 1 ? "día" : "días"}`;
}

function regionDe(nota: Nota): string {
  return REGION_NOMBRE[nota.region] ?? "el mundo";
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
  const estilo: EstiloRadio =
    opciones.estilo && Object.prototype.hasOwnProperty.call(VOCES, opciones.estilo)
      ? opciones.estilo
      : "cercana";
  const limite = Math.max(
    1,
    Math.min(8, opciones.limite ?? (opciones.objetivoMs ? asuntosPara(opciones.objetivoMs) : 4))
  );
  const conResumen = opciones.conResumen !== false;
  const conFuentes = opciones.conFuentes !== false;
  const conCifras = opciones.conCifras !== false;
  const conInvitacion = opciones.conInvitacion !== false;
  const ahora = opciones.ahora ?? Date.now();
  const v = VOCES[estilo];

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
    texto:
      utiles.length === 0
        ? "Radio Vanguard. Ahora mismo el archivo no tiene cables nuevos: cuando lleguen, aquí estarán."
        : `${saludo} ${utiles.length} ${utiles.length === 1 ? "cable abierto" : "cables abiertos"} en el archivo.`,
    pausaMs: PAUSA.sintonia,
    rotulo: "Sintonía",
  });

  if (utiles.length === 0) {
    return {
      titulo: "Radio Vanguard",
      estilo,
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
    const partes = [
      `${utiles.length} ${utiles.length === 1 ? "cable" : "cables"}`,
      `${medios} ${medios === 1 ? "medio" : "medios"}`,
      `${regiones} ${regiones === 1 ? "región" : "regiones"}`,
    ];
    bloques.push({
      id: "cifras",
      tipo: "cifras",
      texto: repetidos > 0
        ? `Hoy: ${partes.join(", ")}. ${repetidos} ${repetidos === 1 ? "cable cuenta" : "cables cuentan"} lo mismo que otro, así que los junto en un solo asunto.`
        : `Hoy: ${partes.join(", ")}.`,
      pausaMs: PAUSA.cifras,
      rotulo: "El archivo en cifras",
    });
  }

  // ③ titulares
  const cuantosTitulares = Math.min(3, grupos.length);
  bloques.push({
    id: "titulares",
    tipo: "titular",
    texto: turno(v.titulares, grupos.length),
    pausaMs: 240,
    rotulo: "Titulares",
  });
  for (let i = 0; i < cuantosTitulares; i++) {
    const g = grupos[i];
    const n = g.principal;
    const extra = conFuentes && g.fuentes.length > 1 ? `, también en ${g.fuentes.length - 1} ${g.fuentes.length - 1 === 1 ? "medio" : "medios"}` : "";
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
    const region = regionDe(n);

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
        rotulo: "Seguimos",
      });
    }
    regionPrevia = region;

    const cuerpo = conResumen && n.resumen ? recortarPorFrase(n.resumen, 260) : "";
    const cuando = haceLegible(n.fecha, ahora);
    bloques.push({
      id: `desarrollo-${i}`,
      tipo: "desarrollo",
      texto: `${recortarPorFrase(n.titulo, 160)}.${cuerpo ? ` ${cuerpo}` : ""} Fuente: ${n.fuente}${cuando ? `, ${cuando}` : ""}.`,
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
        texto: `Este asunto lo ${g.fuentes.length === 2 ? "firman dos medios" : `firman ${g.fuentes.length} medios`}: ${enumerar(g.fuentes)}. Te he leído la versión de ${n.fuente}${otros.length ? `; las otras ${otros.length === 1 ? "está" : "están"} enlazadas en pantalla` : ""}.`,
        pausaMs: PAUSA.contexto,
        notaId: n.id,
        fuente: n.fuente,
        href: enlace(n),
        fuentes: g.fuentes,
        rotulo: "Quién lo firma",
      });
    }
  }

  // ⑥ cierre (+ invitación)
  bloques.push({
    id: "cierre",
    tipo: "cierre",
    texto: turno(v.cierre, cuantos),
    pausaMs: PAUSA.cierre,
    rotulo: "Cierre",
  });
  if (conInvitacion) {
    bloques.push({
      id: "invitacion",
      tipo: "invitacion",
      texto: turno(v.invitacion, 0),
      pausaMs: PAUSA.invitacion,
      rotulo: "Puedes preguntar",
    });
  }

  const repetidos = grupos
    .slice(0, cuantos)
    .reduce((s, g) => s + g.duplicados.length, 0);

  return {
    titulo: `Radio Vanguard · ${cuantosTitulares} titulares, ${cuantos} ${cuantos === 1 ? "asunto" : "asuntos"}`,
    estilo,
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
