// v92.0 OJO DEL MUNDO — CANAL BRIEF (espejo del canal de análisis en vídeo):
// episodios de briefing con capítulos, transcripción sincronizada, miniatura
// procedural, comentarios del cinturón y "siguiente". Player simulado con
// osciloscopio. Todo ficticio, determinista por día.

import { evaluarNeuronal, fechaISO, mulberry32, fnvHash } from "./neurona-core";

export type Capitulo = { seg: number; titulo: string };

export type Comentario = { usuario: string; texto: string; likes: number; haceH: number };

export type Episodio = {
  id: string;
  titulo: string;
  duracionSeg: number;
  vistas: number;
  haceH: number;
  capítulos: Capitulo[];
  transcripcion: { seg: number; linea: string }[];
  comentarios: Comentario[];
  veredicto: { riesgo: number; sentimiento: string };
  hue: number; // tinte procedural de la miniatura
};

const SERIES = [
  { canal: "Mesa de Análisis Vanguard", prefijos: ["Briefing", "Sala de crisis", "Expediente abierto", "Línea de frente", "Perspectiva"] },
  { canal: "Escuela de Guerra", prefijos: ["Lección", "Caso de estudio", "Autopsia de batalla", "Doctrina"] },
];

const TEMAS = [
  { t: "Cómo se cierra un estrecho sin declarar la guerra", trans: [
    "Hoy no hablaremos de misiles: hablaremos de seguro marítimo y de paciencia.",
    "El primer movimiento no es un buque: es una primas de seguro que sube un cero.",
    "Cuando el traficante de fletes prefiere dar la vuelta, el estrecho ya está cerrado.",
    "Tres días de deriva equivalen a un bloqueo sin una sola detonación.",
  ]},
  { t: "Anatomía de un alto el fuego que no aguanta 72 horas", trans: [
    "Todo alto el fuego tiene tres relojes: el político, el táctico y el de la esperanza.",
    "El táctico siempre gana: cada comandante local consolida antes de la fecha límite.",
    "El informe de la delegación se escribe para el archivo, no para el terreno.",
  ]},
  { t: "Por qué la artillería sigue siendo la diosa de la guerra", trans: [
    "Desde 1914, dos tercios de las bajas de frente llevan la misma firma: el cañón.",
    "Los drones cambiaron la observación, no la respuesta: sigue siendo acero por tonelada.",
    "La contra-batería es un duelo de matemáticos con despeje de 90 segundos.",
  ]},
  { t: "La guerra de cables: fibra, satélites y cuellos de botella", trans: [
    "El 99 % del tráfico intercontinental viaja por cables que caben en un pulgar.",
    "Cortar un cable es una declaración con la voz bajada: nadie reclama, todos entienden.",
    "La redundancia existe, pero el mapa de la redundancia también es un mapa militar.",
  ]},
  { t: "Logística: el arte aburrido que decide todas las guerras", trans: [
    "Un batallón bebe 12.000 litros de agua al día. Pregunta: ¿de dónde?",
    "La historia de las derrotas rápidas es la historia de camiones con poco combustible.",
    "Nadie gana una guerra de veinte días con un plan de cinco: gana quien trae balas en el día doce.",
  ]},
  { t: "Desinformación: cómo se fabrica un casus belli de plástico", trans: [
    "El primer disparo de una guerra moderna suele ser un vídeo con fecha falsa.",
    "La verificación cruzada mata la narrativa en 48 horas — si alguien sigue mirando.",
    "El objetivo no es que creas la mentira: es que dudes de la verdad.",
  ]},
];

const USUARIOS = ["Halcón del Sur", "Cartógrafa_77", "Vigía del Báltico", "SargentoKilo", "Aula Norte", "Compass ROSE", "Analista de los Vientos", "OjoBruma", "Teniente Cuervo", "Recon4"];

const COMENTARIOS_TXT = [
  "El punto de los relojes del alto el fuego es oro puro: lo vivimos tal cual.",
  "Faltó mencionar el rol de los ferrocarriles en el capítulo de logística.",
  "Vine por la miniatura, me quedé por la transcripción. Qué nivel.",
  "Este episodio debería verse en la primera clase de cualquier academia.",
  "Datos contrastados y sin gritos: así se hace un briefing.",
  "La frase 'la paciencia también es un arma' va directa al cuaderno.",
  "Pregunta seria: ¿sabéis si habrá segunda parte del episodio de cables?",
  "A las 12:40 se explica en 40 segundos lo que me costó un semestre entero.",
];

function generarEpisodio(dia: number, idx: number): Episodio {
  const rnd = mulberry32(fnvHash(`brief-${dia}-${idx}`));
  const serie = SERIES[idx % SERIES.length];
  const tema = TEMAS[(dia + idx) % TEMAS.length];
  const titulo = `${serie.prefijos[idx % serie.prefijos.length]} #${100 + dia * 2 + idx}: ${tema.t}`;

  const duracionSeg = 480 + Math.floor(rnd() * 900);
  const capítulos: Capitulo[] = tema.trans.map((t, i) => ({
    seg: Math.floor((duracionSeg / tema.trans.length) * i),
    titulo: t.split(":")[0].slice(0, 38),
  }));

  const transcripcion = tema.trans.map((linea, i) => ({
    seg: Math.floor((duracionSeg / tema.trans.length) * i + 4),
    linea,
  }));

  const comentarios: Comentario[] = Array.from({ length: 3 + Math.floor(rnd() * 4) }, (_, i) => ({
    usuario: USUARIOS[(dia + idx + i) % USUARIOS.length],
    texto: COMENTARIOS_TXT[(dia + i * 2) % COMENTARIOS_TXT.length],
    likes: Math.floor(rnd() * 480),
    haceH: Math.floor(rnd() * 40) + 1,
  }));

  const veredicto = evaluarNeuronal(titulo + " " + tema.trans.join(" "));

  return {
    id: `CB-${dia}-${idx}`,
    titulo,
    duracionSeg,
    vistas: 1800 + Math.floor(rnd() * 48000),
    haceH: 2 + Math.floor(rnd() * 60),
    capítulos,
    transcripcion,
    comentarios,
    veredicto: { riesgo: veredicto.riesgo, sentimiento: veredicto.sentimiento },
    hue: Math.floor(rnd() * 60) + 18, // atardecer: 18-78 (ámbar a rojo)
  };
}

export function episodiosDeHoy(n = 6): Episodio[] {
  const dia = Math.floor(Date.now() / 86_400_000);
  return Array.from({ length: n }, (_, i) => generarEpisodio(dia, i));
}

export function episodiosSiguientes(excluir: string, n = 3): Episodio[] {
  const dia = Math.floor(Date.now() / 86_400_000);
  return Array.from({ length: n + 1 }, (_, i) => generarEpisodio(dia - 1, i))
    .filter((e) => e.id !== excluir)
    .slice(0, n);
}

export function fechaLargaHoy(): string {
  const d = new Date();
  return d.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
}

export function hoyISO(): string {
  return fechaISO(new Date());
}
