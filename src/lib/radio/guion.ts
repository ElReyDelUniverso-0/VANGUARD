// ═══════════════════════════════════════════════════════════════════
// v422.3 RADIO VANGUARD · EL GUION — convertir los cables del día en un
// programa que se puede escuchar.
//
// QUÉ ES: una función PURA `construirPrograma(notas, opciones)` que ordena
// las noticias reales de la casa en bloques hablados: sintonía, titulares,
// desarrollo, puentes y cierre. Cada bloque sabe cuánto silencio dejar
// después (`pausaMs`) y de qué nota sale (`notaId`, `fuente`, `href`), así
// que la boca respira y la pantalla puede señalar lo que se está diciendo.
//
// REGLAS DE HONESTIDAD (las mismas de la casa):
//   · No se inventa ni un dato: el texto sale del titular, el resumen, la
//     fuente y la hora REALES de cada nota. Lo único escrito a mano son las
//     fórmulas de locución («Te lo cuento», «Seguimos»), que no afirman nada.
//   · Si un resumen es largo, se recorta por frase completa, nunca a mitad.
//   · Si no hay noticias, el programa lo DICE y no rellena con nada.
//
// Sin DOM, sin red, sin reloj: se puede probar en Node (scripts/pruebas-radio.mjs).
// ═══════════════════════════════════════════════════════════════════

import type { Nota } from "@/lib/portada/notas";

export type EstiloRadio = "serena" | "cercana" | "filosa";

export type TipoBloque =
  | "sintonia"
  | "titular"
  | "desarrollo"
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
  /** lo que se ve en pantalla mientras se dice (más corto que el audio) */
  rotulo?: string;
};

export type Programa = {
  titulo: string;
  estilo: EstiloRadio;
  bloques: BloqueGuion[];
  /** estimación honesta de duración (~14 caracteres por segundo) */
  duracionMs: number;
  /** las notas que entraron, en orden */
  notaIds: string[];
  generadoEn: string;
};

export type OpcionesPrograma = {
  estilo?: EstiloRadio;
  /** cuántas noticias desarrollo (sin contar titulares) */
  limite?: number;
  /** leer también el resumen, no solo el titular */
  conResumen?: boolean;
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
    titulares: ["Estos son los cables que abren el día.", "Tres asuntos para entender la jornada."],
    antes: ["Empezamos por", "Vamos con", "Primer asunto:"],
    despues: ["Seguimos.", "Siguiente.", "Otro frente."],
    puente: ["Cambiamos de región.", "Nos vamos a", "Ahora, en"],
    cierre: ["Hasta aquí el programa. Las fuentes quedan en pantalla.", "Esto es todo por ahora."],
    invitacion: ["Puedes preguntarme por cualquier frente. Te responderé con lo que hay en el archivo, y te diré cuándo no hay nada."],
  },
  cercana: {
    saludo: ["¡Hola! Soy la voz de la casa. Vamos a ver el día juntos.", "Buenas. Te cuento lo que está pasando, sin prisa."],
    titulares: ["Te cuento lo que hay hoy.", "Mira lo que tenemos en el archivo."],
    antes: ["Te cuento lo de", "Empecemos por", "Vamos con"],
    despues: ["Y ahora, otra cosa.", "Seguimos.", "Vamos a otro sitio."],
    puente: ["Nos vamos a", "Ahora te llevo a", "Cambiamos de escenario:"],
    cierre: ["Nada más por ahora. Todo lo que has oído tiene su fuente en pantalla.", "Y hasta aquí el paseo de hoy."],
    invitacion: ["Pregúntame lo que quieras: si está en el archivo te lo leo, y si no está, te lo digo claro."],
  },
  filosa: {
    saludo: ["Radio Vanguard. Sin adornos: los cables del día.", "Directo al grano."],
    titulares: ["Esto es lo que hay.", "Los titulares, sin relleno."],
    antes: ["Primero:", "Vamos con", "Empezamos por"],
    despues: ["Siguiente.", "Vamos a lo siguiente.", "Otro."],
    puente: ["Saltamos a", "Ahora:", "Nos vamos a"],
    cierre: ["Fin del programa. Las fuentes están en pantalla: compruébalas.", "Corto y claro: hasta aquí."],
    invitacion: ["Si quieres una explicación, pregunta. Si no lo sé, no me lo invento."],
  },
};

const PAUSA = {
  sintonia: 420,
  titular: 340,
  desarrollo: 620,
  puente: 480,
  cierre: 700,
  invitacion: 500,
};

function elegir<T>(lista: T[], semilla: number): T {
  return lista[Math.abs(semilla) % lista.length];
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

/**
 * EL PROGRAMA. Orden: sintonía → titulares (3) → desarrollo (N) → cierre.
 * Si dos notas seguidas son de la misma región, no se anuncia el cambio.
 */
export function construirPrograma(notas: Nota[], opciones: OpcionesPrograma = {}): Programa {
  // Un estilo que no existe (ajuste viejo guardado en el aparato, o llamada
  // desde fuera) NO puede tumbar el programa: se cae al de por defecto.
  const estilo: EstiloRadio =
    opciones.estilo && Object.prototype.hasOwnProperty.call(VOCES, opciones.estilo)
      ? opciones.estilo
      : "cercana";
  const limite = Math.max(1, Math.min(8, opciones.limite ?? 4));
  const conResumen = opciones.conResumen !== false;
  const conInvitacion = opciones.conInvitacion !== false;
  const ahora = opciones.ahora ?? Date.now();
  const v = VOCES[estilo];

  const utiles = notas.filter((n) => n && n.titulo).slice(0, Math.max(limite, 6));
  const bloques: BloqueGuion[] = [];

  // ① sintonía
  const saludoBase = elegir(v.saludo, utiles.length + ahora);
  const saludo = saludoBase.replace("{hora}", opciones.hora !== undefined ? `${opciones.hora}:00` : "");
  bloques.push({
    id: "sintonia",
    tipo: "sintonia",
    texto: utiles.length === 0
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
      generadoEn: new Date(ahora).toISOString(),
    };
  }

  // ② titulares
  const cuantosTitulares = Math.min(3, utiles.length);
  bloques.push({
    id: "titulares",
    tipo: "titular",
    texto: elegir(v.titulares, utiles.length),
    pausaMs: 260,
    rotulo: "Titulares",
  });
  for (let i = 0; i < cuantosTitulares; i++) {
    const n = utiles[i];
    bloques.push({
      id: `titular-${i}`,
      tipo: "titular",
      texto: `${i + 1}. ${n.titulo}. ${n.fuente}.`,
      pausaMs: 300,
      notaId: n.id,
      fuente: n.fuente,
      href: enlace(n),
      rotulo: n.titulo,
    });
  }

  // ③ desarrollo
  let regionPrevia = "";
  for (let i = 0; i < Math.min(limite, utiles.length); i++) {
    const n = utiles[i];
    const region = regionDe(n);
    if (i === 0) {
      bloques.push({
        id: `antes-${i}`,
        tipo: "puente",
        texto: `${elegir(v.antes, i)} ${region}:`,
        pausaMs: 240,
        rotulo: region,
      });
    } else if (region !== regionPrevia) {
      bloques.push({
        id: `puente-${i}`,
        tipo: "puente",
        texto: `${elegir(v.puente, i + n.titulo.length)} ${region}.`,
        pausaMs: PAUSA.puente,
        rotulo: region,
      });
    } else {
      bloques.push({
        id: `despues-${i}`,
        tipo: "puente",
        texto: elegir(v.despues, i),
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
      texto: `${n.titulo}.${cuerpo ? ` ${cuerpo}` : ""} Fuente: ${n.fuente}${cuando ? `, ${cuando}` : ""}.`,
      pausaMs: PAUSA.desarrollo,
      notaId: n.id,
      fuente: n.fuente,
      href: enlace(n),
      rotulo: n.titulo,
    });
  }

  // ④ cierre (+ invitación)
  bloques.push({
    id: "cierre",
    tipo: "cierre",
    texto: elegir(v.cierre, utiles.length * 7 + limite),
    pausaMs: PAUSA.cierre,
    rotulo: "Cierre",
  });
  if (conInvitacion) {
    bloques.push({
      id: "invitacion",
      tipo: "invitacion",
      texto: elegir(v.invitacion, limite),
      pausaMs: PAUSA.invitacion,
      rotulo: "Puedes preguntar",
    });
  }

  return {
    titulo: `Radio Vanguard · ${cuantosTitulares} titulares, ${Math.min(limite, utiles.length)} desarrollos`,
    estilo,
    bloques,
    duracionMs: estimarDuracion(bloques),
    notaIds: utiles.slice(0, Math.min(limite, utiles.length)).map((n) => n.id),
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
