// v85.0 EL MUNDO DENTRO — SISTEMA DE EMPLEOS DE VANGUARD
// ============================================================
// "Vanguard no es parte del mundo: el mundo está dentro de Vanguard."
// Los operadores NO juegan a Vanguard: TRABAJAN en Vanguard. Por sueldos.
// Flujo: entrevista de aptitud → departamento → nómina por minuto →
// turnos con tareas reales → ascensos → renuncia y cambio de carrera.
// ============================================================

export type Aptitud = "TACTICA" | "GEOGRAFIA" | "ANALISIS" | "DIPLOMACIA";

export const APTITUD_META: Record<Aptitud, { nombre: string; icono: string }> = {
  TACTICA: { nombre: "Táctica", icono: "⚔️" },
  GEOGRAFIA: { nombre: "Geografía", icono: "🗺️" },
  ANALISIS: { nombre: "Análisis", icono: "📡" },
  DIPLOMACIA: { nombre: "Diplomacia", icono: "🕊️" },
};

// ====== ENTREVISTA DE INGRESO — 8 preguntas, cada respuesta revela aptitud ======
export interface PreguntaEntrevista {
  q: string;
  opts: string[];
  best: number;
  apt: Aptitud;
  porQue: string;
}

export const ENTREVISTA: PreguntaEntrevista[] = [
  {
    q: "Un convoy aliado debe cruzar 300 km de territorio hostil esta noche. ¿Qué ordenas primero?",
    opts: [
      "Dividir la ruta en tramos con puntos de reabastecimiento ocultos",
      "Cruzar por el valle: el terreno llano es más rápido",
      "Interceptar las comunicaciones enemigas para saber dónde está el emboscado",
      "Pedir salvoconducto a la facción que controla la zona",
    ],
    best: 0,
    apt: "TACTICA",
    porQue: "Logística por tramos: clásico de estado mayor. Piensas como planificador.",
  },
  {
    q: "El satellite marca movimientos anómalos cerca de un estrecho. ¿Qué revisas antes que nada?",
    opts: [
      "La historia de esa frontera: quién la controló en las últimas 3 crisis",
      "Las corrientes marinas y la profundidad del canal",
      "El volumen de tráfico de datos de la zona en las últimas 24 h",
      "Qué países tienen tratados de libre navegación ahí",
    ],
    best: 1,
    apt: "GEOGRAFIA",
    porQue: "El terreno manda sobre la estrategia. Tienes ojo de cartógrafo.",
  },
  {
    q: "Recibes 400 mensajes interceptados y solo 3 horas. ¿Por dónde empiezas?",
    opts: [
      "Por los que citan posiciones: sin coordenadas no hay operación",
      "Ordenándolos por la región de origen del emisor",
      "Buscando patrones: los horarios repetidos delatan la jerarquía",
      "Traduciendo solo los que vienen de la cancillería enemiga",
    ],
    best: 2,
    apt: "ANALISIS",
    porQue: "Los patrones hablan más que los mensajes. Mente de criptoanalista.",
  },
  {
    q: "Dos aliados amenazan con romper la coalición por una disputa de frontera. ¿Tu movimiento?",
    opts: [
      "Proponer una operación conjunta que los obligue a cooperar",
      "Trazar una línea neutral basada en accidentes geográficos naturales",
      "Presentar a cada uno pruebas de que el tercero está manipulando la crisis",
      "Negociar en secreto con ambos por separado antes de la mesa",
    ],
    best: 3,
    apt: "DIPLOMACIA",
    porQue: "La mesa se gana antes de sentarse. Tienes pulso de canciller.",
  },
  {
    q: "El enemigo bombardea cada noche a las 02:10 desde el mismo corredor. ¿Qué propones?",
    opts: [
      "Emboscar el corredor de regreso, cuando los pilotos están fatigados",
      "Mapear el corredor: los valles bajos ocultan de los radares",
      "Correlacionar los ataques con el clima: despegan solo con nublado",
      "Filtrar a la prensa enemiga que movimos la base: que bombardeen vacío",
    ],
    best: 0,
    apt: "TACTICA",
    porQue: "Golpear la retirada es doctrina pura. Instinto de comandante.",
  },
  {
    q: "Una ciudad clave aparece en dos mapas con nombres distintos. ¿Cómo la verificas?",
    opts: [
      "Consultar qué fuerza la tomó históricamente y cuándo cambió de nombre",
      "Comparar coordenadas: el nombre sobra, la latitud no miente",
      "Cruzar las fotos satelitales de ambas fuentes píxel a píxel",
      "Preguntar a los observadores locales de cada lado",
    ],
    best: 1,
    apt: "GEOGRAFIA",
    porQue: "Las coordenadas no tienen nacionalidad. Rigor cartográfico absoluto.",
  },
  {
    q: "El informe del frente dice 'actividad inusual' sin cifras. ¿Qué haces?",
    opts: [
      "Exigir números: sin cifra no se planifica ni un pelotón",
      "Ver qué natural del lugar podría explicar el movimiento estacional",
      "Comparar con los 30 informes anteriores para medir qué es 'inusual'",
      "Llamar al enlace diplomático de la zona y preguntar con delicadeza",
    ],
    best: 2,
    apt: "ANALISIS",
    porQue: "'Inusual' solo existe contra una línea base. Método de analista senior.",
  },
  {
    q: "La coalición debe votar una expansión y van 4 a 4. Tienes el voto decisivo de un país neutral. ¿Qué le ofreces?",
    opts: [
      "Cotitular la operación: mando real a cambio del sí",
      "Cederle la zona disputada que en realidad no le sirve estratégicamente",
      "Dossier con lo que su vecino planea si la expansión fracasa",
      "Una cumbre bilateral antes de la votación, sin cámaras",
    ],
    best: 3,
    apt: "DIPLOMACIA",
    porQue: "Las cumbres sin cámaras deciden las guerras. Naciste para la cancillería.",
  },
];

// ====== DEPARTAMENTOS — cada aptitud abre una carrera con sueldo propio ======
export interface TareaTurno {
  q: string;
  opts: string[];
  best: number;
}

export interface Departamento {
  id: string;
  nombre: string;
  apt: Aptitud;
  sueldoBase: number; // monedas por minuto contratado
  color: "amber" | "cyan" | "green" | "violet";
  icono: string;
  desc: string;
  tareas: TareaTurno[];
}

export const DEPARTAMENTOS: Departamento[] = [
  {
    id: "estadomayor",
    nombre: "Estado Mayor",
    apt: "TACTICA",
    sueldoBase: 2.4,
    color: "amber",
    icono: "⚔️",
    desc: "Planteas las operaciones que el mundo entero verá en el mapa. Cada tramo de ruta, cada hora de ataque pasa por tu mesa.",
    tareas: [
      { q: "Un frente se abre en dos direcciones y solo tienes fuerza para una. ¿Cuál?", opts: ["La que corta al enemigo de su supply", "La más cercana a la costa", "La que más titulares genere", "La que evite todo combate"], best: 0 },
      { q: "La reserva debe dormir antes del asalto. ¿Cuándo la mueves?", opts: ["Al amanecer, con visibilidad", "De noche, por rutas secundarias", "Al mediodía, cuando el enemigo almuerza", "No se mueve: la sorpresa está sobrevalorada"], best: 1 },
      { q: "El enemigo fortifica una ciudad que no atacas hace semanas. ¿Qué interpretas?", opts: ["Que espera tu ataque ahí: buen señuelo", "Que la ciudad importa: atácala ya", "Que el clima obliga a guarecerse", "Que quiere negociar desde fuerza"], best: 0 },
      { q: "Tres objetivos, un solo helicóptero disponible. ¿Qué cargas?", opts: ["Municiones: sin fuego no hay operación", "Heridos: la moral pesa más que el acero", "Intel: información gana guerras", "Combustible para la retaguardia"], best: 0 },
      { q: "Tu ataque depende de alcanzar un puente antes de que lo vuelen. ¿Qué plan B ordenas?", opts: ["Puentes militares plegables en la vanguardia", "Rodear por el paso de montaña (2 días)", "Bombardear primero la ciudad", "Esperar a que el río baje"], best: 0 },
      { q: "La ofensiva avanza 40 km el primer día y se frena. ¿Causa más probable?", opts: ["El supply no siguió al blindado", "Las tropas están cansadas", "El enemigo huyó a propósito", "La niebla de la mañana"], best: 0 },
    ],
  },
  {
    id: "cartografia",
    nombre: "Cartografía",
    apt: "GEOGRAFIA",
    sueldoBase: 2.2,
    color: "cyan",
    icono: "🗺️",
    desc: "Ningún comando mueve una sola compañía sin tu trazo. Fronteras, pasos de montaña y estrechos son tu oficina.",
    tareas: [
      { q: "¿Qué relieve favorece defender más que atacar?", opts: ["Llanura aluvial", "Cordillera con pasos estrechos", "Meseta seca", "Delta fluvial ancho"], best: 1 },
      { q: "Un estrecho de 30 km conecta dos mares. ¿Qué vale más para el que lo controla?", opts: ["Pesca exclusiva", "Cerrar el paso a flotas enteras", "Turismo costero", "Cables submarinos solo"], best: 1 },
      { q: "¿Qué tipo de frontera genera MENOS disputas?", opts: ["Línea recta trazada por colonia", "Río navegable", "Cordillera clara y despoblada", "Frontera que parte una ciudad en dos"], best: 2 },
      { q: "Tu mapa marca un pantano 'impenetrable' de 1940. ¿Qué haces antes de descartarlo?", opts: ["Nada: los mapas viejos son sagrados", "Verificar con satélite: los pantanos se secan", "Avisar que no se puede cruzar", "Pintarlo de rojo por prudencia"], best: 1 },
      { q: "El enemigo avanza por un corredor costero estrechísimo. ¿Su punto débil?", opts: ["La flota ancla detrás", "Cortar el corredor en su cintura", "El sol de la tarde", "La arena de la playa"], best: 1 },
      { q: "Dos capitales están a 90 km con montaña de por medio. ¿Qué construye más miedo?", opts: ["Un túnel carretero", "Un ferrocarril de carga militar", "Un aeropuerto doble", "Antenas de radio grandes"], best: 1 },
    ],
  },
  {
    id: "sigint",
    nombre: "Escucha SIGINT",
    apt: "ANALISIS",
    sueldoBase: 2.6,
    color: "green",
    icono: "📡",
    desc: "Vives donde no se ve: en el ruido. Los patrones que nadie lee delatan ejércitos enteros antes de que disparen.",
    tareas: [
      { q: "Una base enemiga duplica su tráfico de radio los viernes. ¿Hipótesis más fuerte?", opts: ["Rotación semanal de personal", "Ejercicios programados", "Falla de la antena", "Fiesta de la unidad"], best: 0 },
      { q: "Aparece un código nuevo que nunca repite horario. ¿Qué es probablemente?", opts: ["Ruido atmosférico", "Tráfico de alto nivel cifrado", "Una radio de musica", "Transmisión de pesca"], best: 1 },
      { q: "El emisor deja de transmitir 48 h antes de cada ataque. ¿Qué construyes con eso?", opts: ["Un indicador de alerta temprana", "Una teoría de sabotaje", "Un mapa de antenas", "Un archivo de voces"], best: 0 },
      { q: "Tres interceptos citan 'el jardinero'. ¿Primera medida?", opts: ["Buscar jardineros reales en la zona", "Comparar contexto: qué orden sigue a cada mención", "Traducir a otro idioma", "Archivarlo como código sin más"], best: 1 },
      { q: "El volumen de mensajes cae 90% pero las llamadas de un solo satélite suben. ¿Lectura?", opts: ["La unidad se disolvió", "Migraron a satélite: mudanza de mando", "Las antenas se rompieron", "Vacaciones de invierno"], best: 1 },
      { q: "Detectas coordinación entre dos facciones que se odian públicamente. ¿Qué haces primero?", opts: ["Publicarlo: es un escándalo", "Confirmarlo con un tercer dato antes de escribir una línea", "Avisar solo a una facción", "Ignorarlo: los enemigos no coordinan"], best: 1 },
    ],
  },
  {
    id: "cancilleria",
    nombre: "Cancillería",
    apt: "DIPLOMACIA",
    sueldoBase: 2.3,
    color: "violet",
    icono: "🕊️",
    desc: "Las guerras se evitan (o se ganan) en salas sin cámaras. Tú redactas las líneas que los presidentes firman sin leer dos veces.",
    tareas: [
      { q: "Un país neutral oferta mediar. ¿Qué le pides primero?", opts: ["Que se marche de la zona", "Garantías de que no arma a ninguna parte", "Que vote contigo", "Que rompa relaciones con el enemigo"], best: 1 },
      { q: "El enemigo pide 'alto el fuego humanitario' el día antes de tu ofensiva. ¿Lectura?", opts: ["Humanismo sincero", "Ganar tiempo para reforzarse", "Se quedaron sin comida", "Quiere rendirse"], best: 1 },
      { q: "Tu aliado firma con el enemigo un acuerdo que te excluye. ¿Primera respuesta?", opts: ["Declarar la guerra a tu aliado", "Convocar consultas urgentes y revaluar tu posición", "Ignorarlo todo", "Filtrarlo a la prensa de inmediato"], best: 1 },
      { q: "¿Qué cláusula hace cumplir un tratado cuando nadie quiere guerrear por él?", opts: ["El preámbulo", "El mecanismo de verificación con inspectores", "La firma del embajador", "La fecha de aniversario"], best: 1 },
      { q: "Dos países disputan una isla deshabitada. ¿Salida diplomática clásica?", opts: ["Compartir la explotación, soberanía congelada", "Sorteo público", "Guerra limitada de 48 horas", "Venderla a un tercero"], best: 0 },
      { q: "La oposición del rival te invita a hablar. ¿Vas?", opts: ["No: solo se habla con gobiernos", "Sí, pero escuchando sin prometer nada", "Sí y prometes apoyo", "Sí y lo publicas todo"], best: 1 },
    ],
  },
];

// ====== RANGOS LABORALES ======
export const RANGOS: { nombre: string; xp: number; mult: number }[] = [
  { nombre: "RECLUTA", xp: 0, mult: 1.0 },
  { nombre: "OPERATIVO", xp: 120, mult: 1.18 },
  { nombre: "ESPECIALISTA", xp: 320, mult: 1.42 },
  { nombre: "JEFE DE SECCIÓN", xp: 700, mult: 1.75 },
  { nombre: "DIRECTOR", xp: 1300, mult: 2.2 },
];

export function rangoDe(xp: number) {
  let idx = 0;
  for (let i = 0; i < RANGOS.length; i++) if (xp >= RANGOS[i].xp) idx = i;
  const actual = RANGOS[idx];
  const siguiente = RANGOS[idx + 1] ?? null;
  const progreso = siguiente
    ? Math.min(1, (xp - actual.xp) / (siguiente.xp - actual.xp))
    : 1;
  return { idx, actual, siguiente, progreso };
}

export function sueldoPorMin(depto: Departamento, xp: number): number {
  const { actual } = rangoDe(xp);
  return depto.sueldoBase * actual.mult;
}

// ====== ESTADO PERSISTENTE ======
export interface EmpleosState {
  depto: string | null;
  xpLaboral: number;
  nominaPendiente: number;
  lastAccrueTs: number;
  lastShiftTs: number; // cooldown turnos (8 min)
  shiftsHoy: number;
  diaActual: string; // YYYY-MM-DD de shiftsHoy
  turnosTotales: number;
  aciertosTotales: number;
  cobradoTotal: number;
  diasTrabajados: number; // días distintos con ≥1 turno
  lastDiaTurno: string;
  entrevistas: number;
}

export const LS_EMPLEOS = "vanguard-empleos-v85";

export const EMPLEOS_INICIAL: EmpleosState = {
  depto: null,
  xpLaboral: 0,
  nominaPendiente: 0,
  lastAccrueTs: 0,
  lastShiftTs: 0,
  shiftsHoy: 0,
  diaActual: "",
  turnosTotales: 0,
  aciertosTotales: 0,
  cobradoTotal: 0,
  diasTrabajados: 0,
  lastDiaTurno: "",
  entrevistas: 0,
};

export function loadEmpleos(): EmpleosState {
  const base = { ...EMPLEOS_INICIAL };
  if (typeof window === "undefined") return base;
  try {
    const raw = localStorage.getItem(LS_EMPLEOS);
    if (raw) return { ...base, ...JSON.parse(raw) };
  } catch { /* noop */ }
  return base;
}

export function saveEmpleos(s: EmpleosState): void {
  try { localStorage.setItem(LS_EMPLEOS, JSON.stringify(s)); } catch { /* noop */ }
}

// TECTÓNICA DE NÓMINA: acumula sueldo por minuto transcurrido, tope 6 h (360 min).
// Funciona offline: al volver, la nómina esperó en la mesa.
export const TOPE_NOMINA_MIN = 360;
export const COOLDOWN_TURNO_MS = 8 * 60 * 1000;

export function acumularNomina(s: EmpleosState, depto: Departamento, now = Date.now()): EmpleosState {
  if (!s.lastAccrueTs) return { ...s, lastAccrueTs: now };
  const mins = Math.floor((now - s.lastAccrueTs) / 60000);
  if (mins <= 0) return s;
  const yaAcumuladoMin = s.nominaPendiente / sueldoPorMin(depto, s.xpLaboral);
  const minutosPagables = Math.min(mins, Math.max(0, TOPE_NOMINA_MIN - yaAcumuladoMin));
  if (minutosPagables <= 0) return { ...s, lastAccrueTs: now };
  return {
    ...s,
    nominaPendiente: s.nominaPendiente + minutosPagables * sueldoPorMin(depto, s.xpLaboral),
    lastAccrueTs: s.lastAccrueTs + mins * 60000,
  };
}

// Tarea del turno: 3 preguntas del banco del departamento, deterministas por (día, turno n)
export function tareasDelTurno(depto: Departamento, diaKey: string, n: number): TareaTurno[] {
  const seed = `${depto.id}:${diaKey}:${n}`;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const bank = depto.tareas;
  const picks: TareaTurno[] = [];
  const usados = new Set<number>();
  let cursor = (h >>> 0) % bank.length;
  while (picks.length < Math.min(3, bank.length)) {
    if (!usados.has(cursor)) {
      usados.add(cursor);
      picks.push(bank[cursor]);
    }
    cursor = (cursor + 1) % bank.length;
  }
  return picks;
}

// Bono del turno: base × sueldo + propina por acierto. Fallar no te deja sin nada:
// la nómina corre igual (por algo te contrataron), pero el ascenso espera.
export function pagoTurno(depto: Departamento, xp: number, aciertos: number, total: number) {
  const sueldo = sueldoPorMin(depto, xp);
  const base = Math.round(sueldo * 10);
  const propina = aciertos * 9;
  const perfecta = aciertos === total;
  const bonoPerfecta = perfecta ? Math.round(base * 0.5) : 0;
  const xpGanada = 24 + aciertos * 12 + (perfecta ? 20 : 0);
  return { base, propina, bonoPerfecta, total: base + propina + bonoPerfecta, xpGanada, perfecta };
}

export function hoyKey(now = Date.now()): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
