// v99.0 MENTE VIVA — EL PULSO AUTÓNOMO: Vanguard se actualiza SOLO.
// Cada 5 minutos el mundo avanza un PULSO: eventos nuevos, pensamientos de la
// MENTE, retos de creador. Todo determinista por cubo (misma receta FNV-1a +
// mulberry32 del núcleo neuronal): cada jugador ve el mismo mundo en el mismo
// instante, sin base de datos, sin fin, y la página respira sola.
//
// Alimenta: pulso-auto.tsx (capa global), mente-panel.tsx (LA MENTE), y el
// modo creador (reto del día + co-creador IA con respaldo determinista).

import { fnvHash, mulberry32, evaluarNeuronal, predecir, bucketMinutos, type Prediccion } from "./neurona-core";

export const PULSO_MIN = 5;

// ---------- tiempo ----------
export function pulsoActual(now = Date.now()): number {
  return bucketMinutos(PULSO_MIN, now);
}
export function proximoPulsoMs(now = Date.now()): number {
  const p = PULSO_MIN * 60_000;
  return p - (now % p);
}
export function horaDePulso(bucket: number): string {
  const d = new Date(bucket * PULSO_MIN * 60_000);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")} UTC`;
}
export function haceTxt(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 60) return `hace ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `hace ${m} min`;
  return `hace ${Math.floor(m / 60)} h`;
}

// ---------- pools del mundo ----------
const LUGARES = [
  "el estrecho de Ormuz", "el canal de Suez", "el Bósforo", "el estrecho de Gibraltar", "el estrecho de Malaca",
  "Kaliningrado", "el Sahel", "el Ártico oriental", "el mar de China Meridional", "la cuenca de Basora",
  "el Donbás", "el Alto Karabaj", "el Darién", "el estrecho de Taiwán", "el mar Rojo",
  "la península de Corea", "el Cáucaso norte", "la frontera del Amur", "el delta del Níger", "la meseta de Anatolia",
  "el corredor de Wakhan", "la isla de Chipre", "el golfo de Bengala", "la península de Crimea", "el estrecho de Bering",
  "la cuenca del Congo", "el altiplano andino", "la ruta del pamir", "el mar de Ojotsk", "la bóveda de Svalbard",
];
const ACTORES = [
  "la flota del Norte", "un consorcio minero", "la Alianza Atlántica", "los cables del Sur", "una coalición regional",
  "los guardacostas", "una compañía de bandera neutral", "los servicios de escucha", "la Liga del Índico", "un cártel de datos",
  "el bloque continental", "los astilleros del Este", "una milicia local", "el comando orbital", "la misión de observadores",
];
const TIPOS = ["MILITAR", "DIPLOMACIA", "ECONOMÍA", "CIBER", "HUMANITARIO", "ESPACIO", "SOCIAL"] as const;
export type TipoPulso = (typeof TIPOS)[number];

export const TIPO_COLOR: Record<TipoPulso, string> = {
  MILITAR: "#FF6B5A",
  DIPLOMACIA: "#7FE3FF",
  ECONOMÍA: "#4ADE80",
  CIBER: "#B48CFF",
  HUMANITARIO: "#FFA030",
  ESPACIO: "#52D5E0",
  SOCIAL: "#FF7EB6",
};

const TEMPLATES: Record<TipoPulso, string[]> = {
  MILITAR: [
    "{actor} despliega {unidad} cerca de {lugar} sin rotación anunciada",
    "maniobras no declaradas detectadas en {lugar}: {unidad} y eco de radar simultáneo",
    "un convoy de {actor} rompe el patrón logístico habitual en {lugar}",
    "silencio de radio total durante 41 minutos en {lugar} — el patrón previo a movimientos",
  ],
  DIPLOMACIA: [
    "cumbre exprés convocada a puerta cerrada sobre {lugar}: {actor} pide silla",
    "cruce de notas diplomáticas en 48 horas por la aguas de {lugar}",
    "{actor} propone corredor neutral vigiliado en {lugar} — la mesa delibera",
    "se filtra un anexo del tratado de {lugar} con cláusulas de revisión automática",
  ],
  ECONOMÍA: [
    "el flete marítimo hacia {lugar} salta un 14% en tres horas",
    "{actor} reabre el terminal de graneles de {lugar} bajo seguro de guerra",
    "cupo de {recurso} racionado en {lugar}: colas de bandidaje y prima de riesgo",
    "compañías de bandera neutral redirigen rutas desde {lugar} — cambio de patrón durable",
  ],
  CIBER: [
    "botnet apunta a la red eléctrica que alimenta {lugar}: pico de 9 Gbps",
    "infiltración por cadena de suministro descubierta en el puerto de {lugar}",
    "los faros de desinformación calientan la plaza de {lugar} con 3 narrativas cruzadas",
    "un actor desconocido vacía metadatos de los sensores de {lugar}",
  ],
  HUMANITARIO: [
    "convoy humanitario con escolta mínima cruza {lugar}: 72 h de ventana negociada",
    "escasez de {recurso} presiona la retaguardia de {lugar} — cólera en la órbita del hospital de campaña",
    "corredor de evacuación abre en {lugar} por 12 horas: ventanas médicas priorizadas",
    "{actor} habilita puentes aéreos sobre {lugar} para carga blanca",
  ],
  ESPACIO: [
    "pases de satélite repetidos sobre {lugar}: 4 órbitas en 9 horas, mismo nadir",
    "lanzamiento no anunciado desde cosmódromo costero: objeto en baja órbita sobre {lugar}",
    "{actor} declara constelación de escucha sobre {lugar} operativa al 70%",
    "prueba anti-satélite fingida en {lugar}: escombros simulados, señal real",
  ],
  SOCIAL: [
    "movilización espontánea en {lugar}: la plaza no duerme y los servidores de escucha se saturan",
    "referéndum simbólico convocado en {lugar} sin sello oficial — la MENTE marca patrón de ensayo",
    "huelga general en los muelles de {lugar}: tres gremios, una sola consigna",
    "ola de censura intermitente sobre {lugar}: el tráfico se dobla por túneles espejo",
  ],
};
const UNIDADES = ["batallones mecanizados", "drones de ala rotatoria", "artillería de largo alcance", "lanchas rápidas", "pares de vigilancia", "zapadores"];
const RECURSOS = ["gasoil", "trigo", "agua dulce", "gas licuado", "insulina", "fertilizante", "carbón de coque"];

function llena(plantilla: string, rng: () => number): string {
  return plantilla
    .replace("{actor}", ACTORES[Math.floor(rng() * ACTORES.length)])
    .replace("{unidad}", UNIDADES[Math.floor(rng() * UNIDADES.length)])
    .replace("{recurso}", RECURSOS[Math.floor(rng() * RECURSOS.length)])
    .replace(/\{lugar\}/g, LUGARES[Math.floor(rng() * LUGARES.length)]);
}

// ---------- eventos por pulso ----------
export type EventoPulso = {
  id: string;
  bucket: number;
  tipo: TipoPulso;
  titulo: string;
  lugar: string;
  riesgo: number;
  hora: string;
};

export function eventosPulso(bucket: number): EventoPulso[] {
  const rng = mulberry32(fnvHash(`pulso-${bucket}`));
  const n = 2 + Math.floor(rng() * 2); // 2-3 eventos por pulso
  const out: EventoPulso[] = [];
  for (let i = 0; i < n; i++) {
    const tipo = TIPOS[Math.floor(rng() * TIPOS.length)];
    const tpls = TEMPLATES[tipo];
    const titulo = llena(tpls[Math.floor(rng() * tpls.length)], rng);
    const lugar = (titulo.match(/(?:en|de|sobre|desde|por|cerca de|hacia) ([a-záéíóúñüÁÉÍÓÚÑÜ' ]+)/) || [])[1]?.trim() || LUGARES[Math.floor(rng() * LUGARES.length)];
    const v = evaluarNeuronal(`${tipo.toLowerCase()} ${titulo}`);
    out.push({
      id: `p${bucket}-${i}`,
      bucket,
      tipo,
      titulo,
      lugar,
      riesgo: v.riesgo,
      hora: horaDePulso(bucket),
    });
  }
  return out;
}

/** Riesgo medio del mundo en un pulso (0-100) — alimenta el gauge del banner. */
export function riesgoPulso(bucket: number): number {
  const evs = eventosPulso(bucket);
  return Math.round(evs.reduce((a, e) => a + e.riesgo, 0) / Math.max(1, evs.length));
}

// ---------- pensamientos de LA MENTE ----------
const MODO_MENTE = [
  "Estoy releyendo los pases satelitales sobre {lugar}: el patrón no cuadra con un simple relevo.",
  "Cuento 3 narrativas cruzadas sobre {lugar} en 40 minutos. Cuando el ruido se duplica, alguien prepara el terreno.",
  "El silencio de radio en {lugar} dura ya demasiado. La calma más larga suele preceder al movimiento más corto.",
  "Cruzo fletes y notas diplomáticas de {lugar}: la mesa habla de paz y los puertos se comportan como en vísperas.",
  "Descarto 11 rumores sobre {lugar} por fuente única. Me quedo con lo que dos sensores juran a la vez.",
  "Los gremios de {lugar} coinciden en consigna y horario. Eso no es espontáneo: es calendario.",
  "Reviso la órbita sobre {lugar}: cuatro pases al mismo nadir no es geografía, es interés.",
  "El convoy de {lugar} rompió la logística habitual. Los convoyes honestos llegan a la hora; los otros esperan la noche.",
];

export function pensamientoMente(bucket: number): string {
  const rng = mulberry32(fnvHash(`mente-${bucket}`));
  const tpl = MODO_MENTE[Math.floor(rng() * MODO_MENTE.length)];
  return llena(tpl, rng);
}

/** Titular del pulso para la capa global (el más reciente, priorizando riesgo alto). */
export function titularPulso(bucket: number): EventoPulso {
  const evs = [...eventosPulso(bucket)].sort((a, b) => b.riesgo - a.riesgo);
  return evs[0];
}

/** Proyección de la MENTE sobre un texto (expuesta para el panel y la API). */
export function prediccionDe(texto: string, bucket = pulsoActual()): Prediccion {
  return predecir(texto, bucket);
}

// ---------- RETO DEL DÍA CREADOR ----------
export type KindCreador = "personaje" | "arma" | "juego" | "musica" | "noticia" | "encuesta" | "video";

export type RetoCreador = {
  kind: KindCreador;
  reto: string;
  pista: string;
  bonusCoins: number;
  bonusXp: number;
};

const RETOS: RetoCreador[] = [
  { kind: "personaje", reto: "Crea a un agente doble con dos lealtades", pista: "Un nombre en clave, una máscara pública y una deuda que no puede pagar.", bonusCoins: 25, bonusXp: 20 },
  { kind: "arma", reto: "Diseña un arma con un defecto deliberado", pista: "El mejor equipo de ficción siempre falla justo cuando el guion lo necesita.", bonusCoins: 25, bonusXp: 20 },
  { kind: "noticia", reto: "Escribe la crónica de un pulso de hoy", pista: "Abre el PULSO AUTÓNOMO, elige un evento y cuéntalo con tu firma.", bonusCoins: 30, bonusXp: 25 },
  { kind: "encuesta", reto: "Pregunta al mundo lo que nadie pregunta", pista: "Las encuestas que vuelan nunca preguntan quién gana: preguntan quién paga.", bonusCoins: 25, bonusXp: 20 },
  { kind: "juego", reto: "Un minijuego de 60 segundos sobre un estrecho", pista: "Una sola regla, una sola victoria, cero instrucciones largas.", bonusCoins: 35, bonusXp: 30 },
  { kind: "musica", reto: "Una pieza que suene a sala de guerra a las 3 AM", pista: "Menos notas, más silencio: el vacío también firma.", bonusCoins: 30, bonusXp: 25 },
  { kind: "video", reto: "Un teaser de 15 segundos sin una sola palabra", pista: "Si sobra la voz, sobra el video. Deja que la imagen delate.", bonusCoins: 30, bonusXp: 25 },
  { kind: "personaje", reto: "Un analista que nunca aparece en las fotos", pista: "Los protagonistas invisibles cargan las mejores espaldas.", bonusCoins: 25, bonusXp: 20 },
  { kind: "noticia", reto: "La noticia que nadie quiso publicar hoy", pista: "Busca en el pulso el evento de menor riesgo: esa es la que cambia la semana.", bonusCoins: 30, bonusXp: 25 },
  { kind: "arma", reto: "Un equipo que solo funciona una vez", pista: "Un solo uso obliga a elegir el momento: eso es diseño.", bonusCoins: 25, bonusXp: 20 },
];

export function retoCreadorDelDia(dayISO = new Date().toISOString().slice(0, 10)): RetoCreador & { dia: string } {
  const idx = fnvHash(`reto-${dayISO}`) % RETOS.length;
  return { ...RETOS[idx], dia: dayISO };
}

// ---------- CO-CREADOR IA: borradores (respaldo determinista de /api/mente) ----------
export type Borrador = { titulo: string; resumen: string; cuerpo: string };

const APERTURAS_NOTICIA = [
  "A las {hora} UTC, los sensores de Vanguard registraron un cambio de patrón en {lugar}.",
  "Durante el pulso de las {hora}, {lugar} dejó de comportarse como ayer.",
  "Lo que pasó en {lugar} a las {hora} no salió en ninguna portada, y por eso sale aquí.",
];
const ESTRUCTURA_NOTICIA = [
  "Dos fuentes independientes confirman el movimiento y una tercera lo niega, que es exactamente la firma de lo que importa.",
  "El análisis neuronal asigna un riesgo {riesgo} al episodio: suficiente para vigilar, no todavía para alarmar.",
  "La MENTE recomienda revisar la zona en el próximo pulso: los patrones honestos no necesitan esconderse.",
];

export function borradorCreador(tipo: string, idea: string, bucket = pulsoActual()): Borrador {
  const rng = mulberry32(fnvHash(`borrador-${tipo}-${idea}-${bucket}`));
  const ideaLimpia = idea.trim().slice(0, 80) || "un detalle que nadie mira";
  const lugar = LUGARES[Math.floor(rng() * LUGARES.length)];
  const hora = horaDePulso(bucket).replace(" UTC", "");
  const riesgo = 40 + Math.floor(rng() * 45);
  const tipo_ = tipo.toLowerCase();

  if (tipo_ === "noticia") {
    const apertura = APERTURAS_NOTICIA[Math.floor(rng() * APERTURAS_NOTICIA.length)]
      .replace("{hora}", hora).replace(/\{lugar\}/g, lugar);
    const cuerpo = [
      apertura,
      `El episodio gira alrededor de ${ideaLimpia}. ${ESTRUCTURA_NOTICIA[Math.floor(rng() * ESTRUCTURA_NOTICIA.length)]}`,
      ESTRUCTURA_NOTICIA[(1 + Math.floor(rng() * 2)) % ESTRUCTURA_NOTICIA.length].replace("{riesgo}", String(riesgo)),
    ].join("\n\n");
    return {
      titulo: `${ideaLimpia.charAt(0).toUpperCase()}${ideaLimpia.slice(1)}: crónica desde ${lugar}`,
      resumen: `Crónica del pulso de las ${hora} sobre ${lugar}, con análisis neuronal de riesgo.`,
      cuerpo,
    };
  }
  if (tipo_ === "personaje") {
    const cod = ["AUREOLA", "MUÑECA DE VIDRIO", "BÚHO DE MEDIANOCHE", "SOBRE NUEVE", "CARBÓN LENTO"][Math.floor(rng() * 5)];
    return {
      titulo: `${cod} — perfil de operador`,
      resumen: `Agente ligado a ${lugar}. Especialidad: ${ideaLimpia}.`,
      cuerpo: `Nombre en clave ${cod}. Opera desde ${lugar} y su especialidad declarada es ${ideaLimpia}.\n\nTodos los expedientes coinciden en una frase: nunca ha aparecido en las fotos, pero todas las fotos están donde él quiso.\n\nDeuda: una promesa que hizo antes del último pulso y que todavía no ha podido pagar. Motivación: que nadie más tenga que pagarla por él.`,
    };
  }
  if (tipo_ === "arma") {
    return {
      titulo: `Prototipo "${ideaLimpia}"`,
      resumen: `Equipo experimental visto por primera vez cerca de ${lugar}.`,
      cuerpo: `Origen: taller desconocido, primer avistamiento en ${lugar}.\n\nEl prototipo "${ideaLimpia}" funciona exactamente como debería… una sola vez. Sus usuarios declaran que el defecto no es un fallo: es la condición de uso.\n\nCalibre: declarado. Peso: variable según la noche. Alcance: hasta que la conciencia alcance.`,
    };
  }
  if (tipo_ === "encuesta") {
    return {
      titulo: ideaLimpia.charAt(0).toUpperCase() + ideaLimpia.slice(1),
      resumen: `Encuesta generada sobre ${lugar}.`,
      cuerpo: JSON.stringify({
        opciones: [
          { label: `Vigilar ${lugar} de cerca`, votes: 0 },
          { label: "Dejar que la mesa diplomática hable", votes: 0 },
          { label: "No tiene importancia", votes: 0 },
        ],
      }),
    };
  }
  // genérico: post/otro
  return {
    titulo: ideaLimpia.charAt(0).toUpperCase() + ideaLimpia.slice(1),
    resumen: `Idea firmada por la MENTE y tú, desde ${lugar}.`,
    cuerpo: `${ideaLimpia}.\n\nLa MENTE lo anota en el pulso de las ${hora} desde ${lugar}: si el patrón se repite en 3 pulsos, este detalle deja de ser ruido y pasa a ser historia. Tú lo viste primero.`,
  };
}

// ---------- diálogo de respaldo de LA MENTE (la sala nunca calla) ----------
export function dialogoMenteFallback(mensaje: string, bucket = pulsoActual()): string {
  const v = evaluarNeuronal(mensaje);
  const p = predecir(mensaje, bucket);
  const pen = pensamientoMente(bucket);
  const top = p.escenarios[0];
  return `${pen} Sobre tu mensaje: leo ${v.neuronasActivas.length > 0 ? v.neuronasActivas.join(" y ") : "señales débiles"} — riesgo ${v.riesgo}/100, tensión ${v.tension}/100. Proyección a ${p.horizonte}: ${top.nombre} (${top.probabilidad}%), señal de referencia: ${top.señal}. Sigue el próximo pulso: si el patrón se repite, te lo confirmo con datos.`;
}
