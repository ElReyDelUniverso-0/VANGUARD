// v92.0 OJO DEL MUNDO — ESTRATEGIA GLOBAL (espejo del hub de estrategia y
// wargames): escuela de doctrinas con árboles, escenarios de wargame con
// reglas, ciclo OODA animado, lecciones tácticas y ranking de generales.
// Todo ficticio; los "generales" mezclan leyendas del mundo Vanguard con el
// jugador (TU). Determinista por día.
// v313.0 LA ESCUELA QUE RESPIRA — el currículo se dobla (8 doctrinas en dos
// ciclos de contra-doctrina, 10 wargames, 10 lecciones, 10 leyendas) y la
// escuela respira: cada día el giro determinista trae una CLASE DISTINTA
// (6 de 10 wargames, 4 de 10 lecciones) — rotación por envoltura, nunca
// repetida dos días seguidos del mismo plato entero.

import { fechaISO, mulberry32, fnvHash } from "./neurona-core";

export type NodoDoctrina = { nombre: string; efecto: string; coste: number };

export type Doctrina = {
  id: string;
  nombre: string;
  principio: string;
  nodos: NodoDoctrina[];
  contra: string;
  rama: "ATAQUE" | "DEFENSA" | "MOVIMIENTO" | "INFORMACIÓN";
};

export type EscenarioWargame = {
  id: string;
  titulo: string;
  fuerzas: { azul: string; rojo: string };
  objetivoAzul: string;
  objetivoRojo: string;
  reglaEspecial: string;
  dificultad: 1 | 2 | 3 | 4 | 5;
  turns: number;
};

export type Leccion = { titulo: string; cuerpo: string };

export type General = { nombre: string; victorias: number; doctrinaFav: string; eres?: boolean };

export type EstrategiaHoy = {
  fecha: string;
  doctrinas: Doctrina[];
  escenarios: EscenarioWargame[];
  lecciones: Leccion[];
  generales: General[];
  ooda: { fase: string; texto: string }[];
};

const DOCTRINAS_BASE: Omit<Doctrina, "id">[] = [
  {
    nombre: "Marea Corta",
    principio: "Golpes breves y profundos que buscan el almacén, no la trinchera: gana quien rompe la caja, no quien la rodea.",
    nodos: [
      { nombre: "Spearhead ligero", efecto: "+15 % velocidad de avance, −10 % guarnición", coste: 2 },
      { nombre: "Fogonazo de mando", efecto: "primer asalto del día ignora fortalezas", coste: 3 },
      { nombre: "Reabastecimiento exprés", efecto: "las reservas caen más lento durante el avance", coste: 2 },
    ],
    contra: "Muro Elástico",
    rama: "ATAQUE",
  },
  {
    nombre: "Muro Elástico",
    principio: "Ceder metros para vender cada uno al precio más alto: el terreno se recupera; la reserva enemiga, no.",
    nodos: [
      { nombre: "Profundidad escalonada", efecto: "−20 % daño de asalto en tus celdas", coste: 2 },
      { nombre: "Contragolpe nocturno", efecto: "+25 % al contraatacar desde fortaleza", coste: 3 },
      { nombre: "Camuflaje de depósitos", efecto: "los cañones enemigos fallan el 30 %", coste: 2 },
    ],
    contra: "Marea Corta",
    rama: "DEFENSA",
  },
  {
    nombre: "Mano de Sombras",
    principio: "El mapa que ve el enemigo es parte del arma: sensores falsos, flotas fantasma y un silencio perfecto.",
    nodos: [
      { nombre: "Señuelos térmicos", efecto: "el radar enemigo marca tus depósitos mal 1 de 2 veces", coste: 2 },
      { nombre: "Escucha activa", efecto: "verás el % de reserva del rival antes de atacar", coste: 3 },
      { nombre: "Cifrado de frentes", efecto: "los bots dudan 2 ticks antes de asaltarte", coste: 2 },
    ],
    contra: "Puño de Acero",
    rama: "INFORMACIÓN",
  },
  {
    nombre: "Puño de Acero",
    principio: "Concentrarlo todo en un solo golpe visible: la disuasión que aplasta discursos antes de que se pronuncien.",
    nodos: [
      { nombre: "Batería unificada", efecto: "los cañones disparan a un solo objetivo +40 % daño", coste: 3 },
      { nombre: "Marcha forzada", efecto: "+10 % recluta mientras haya un frente activo", coste: 2 },
      { nombre: "Tormenta de hierro", efecto: "primer asalto con reserva ≥60 % vuelve a intentar si falla", coste: 3 },
    ],
    contra: "Mano de Sombras",
    rama: "MOVIMIENTO",
  },
  // v313: el SEGUNDO CICLO de contra-doctrina — la escuela ya no tiene dos
  // ciclos cerrados sino un currículo que se muerde la cola: ola nueva contra
  // coraza, velocidad contra silencio.
  {
    nombre: "Diente de Sierra",
    principio: "No un golpe sino una sierra: olas escalonadas que muerden el frente metros por metros, turno tras turno, sin darle al defensor ni una noche de reposo.",
    nodos: [
      { nombre: "Ola escalonada", efecto: "cada asalto fallido deja −5 % defensa en la celda", coste: 2 },
      { nombre: "Relevo de líneas", efecto: "las tropas descansadas atacan +10 % en la tercera ola", coste: 3 },
      { nombre: "Artillería rodante", efecto: "el supresión dura 1 tick más tras cada asalto", coste: 2 },
    ],
    contra: "Coraza de Sal",
    rama: "ATAQUE",
  },
  {
    nombre: "Coraza de Sal",
    principio: "La defensa que no cede ni vende: fortificar hasta que el atacante gaste su sierra contra el granito y su propia reserva.",
    nodos: [
      { nombre: "Bastión de granito", efecto: "las celdas fortificadas restauran 5 % defensa por noche", coste: 3 },
      { nombre: "Campos de sal", efecto: "el atacante paga +1 reserva por cada celda tomada", coste: 2 },
      { nombre: "Ojos del faro", efecto: "las olas enemigas se ven 1 tick antes de llegar", coste: 2 },
    ],
    contra: "Diente de Sierra",
    rama: "DEFENSA",
  },
  {
    nombre: "Jinete Fantasma",
    principio: "No estar donde el enemigo golpea, estar donde acaba de mirar: columnas ligeras que cruzan el mapa más rápido de lo que los informes llegan.",
    nodos: [
      { nombre: "Columna ligera", efecto: "+25 % movimiento, −20 % carga de asalto", coste: 2 },
      { nombre: "Sombra de polvo", efecto: "el rival ve tu posición con 1 tick de retraso", coste: 3 },
      { nombre: "Golpe y vuelo", efecto: "retirada gratuita tras cada saqueo exitoso", coste: 2 },
    ],
    contra: "Cámara Lenta",
    rama: "MOVIMIENTO",
  },
  {
    nombre: "Cámara Lenta",
    principio: "Ganar el tiempo que el rival cree poseer: negar informes, envenenar mapas y dejar que el jinete corra hacia una trampa que ya está tendida.",
    nodos: [
      { nombre: "Niebla firmada", efecto: "los informes enemigos llegan con 1 tick de mentira", coste: 3 },
      { nombre: "Emboscada anunciada", efecto: "+30 % primera emboscada contra tropas en movimiento", coste: 2 },
      { nombre: "Archivo cruzado", efecto: "cada sensor propio sobrevivido revela 1 nodo rival", coste: 2 },
    ],
    contra: "Jinete Fantasma",
    rama: "INFORMACIÓN",
  },
];

const ESCENARIOS_BASE: Omit<EscenarioWargame, "id">[] = [
  {
    titulo: "El pasaje de Karvath en 96 horas",
    fuerzas: { azul: "Flota de la Liga (6 buques, 2 batallones anfibios)", rojo: "Guardia Costera Zandiria (misiles costeros, minas)" },
    objetivoAzul: "Mantener abierto el pasaje 96 h con menos de 2 buques dañados",
    objetivoRojo: "Cerrar el pasaje al menos 24 h seguidas",
    reglaEspecial: "Cada mina no detectada añade +1 tick de cierre",
    dificultad: 3,
    turns: 12,
  },
  {
    titulo: "Ponte de Bruma: retirada bajo fuego",
    fuerzas: { azul: "División V (retirada, 60 % munición)", rojo: "Cuerpo de Volgaria (3 brigadas, puente objetivo)" },
    objetivoAzul: "Cruzar 4 de 5 unidades antes del turno 8",
    objetivoRojo: "Cortar el puente antes del turno 6",
    reglaEspecial: "El puente aguanta 2 impactos de artillería",
    dificultad: 4,
    turns: 8,
  },
  {
    titulo: "La cosecha de Tarquinia",
    fuerzas: { azul: "Fuerza de protección (países vecinos)", rojo: "Militias de la planicie (movilización rápida)" },
    objetivoAzul: "Escoltar 3 convoyes de grano a puerto sin pérdida",
    objetivoRojo: "Interceptar 1 convoy o capturar el silo central",
    reglaEspecial: "Cada convoy escoltado resta 1 turno al reloj azul",
    dificultad: 2,
    turns: 10,
  },
  {
    titulo: "Apagón en Ostmark",
    fuerzas: { azul: "Equipo de respuesta cibernética", rojo: "Botnet del Frente de Unificación" },
    objetivoAzul: "Restaurar 5 de 6 subestaciones antes del turno 9",
    objetivoRojo: "Mantener el apagón 4 ticks acumulados",
    reglaEspecial: "Cada subestación restaurada revela un nodo de la botnet",
    dificultad: 3,
    turns: 9,
  },
  {
    titulo: "Convoy del Alba (tutorial clásico)",
    fuerzas: { azul: "Pelotón de escolta", rojo: "Embuscada improvisada" },
    objetivoAzul: "Llegar al cruce con el 80 % del personal",
    objetivoRojo: "Inmovilizar el vehículo cabecilla",
    reglaEspecial: "El terreno urbano duplica la defensa del defensor",
    dificultad: 1,
    turns: 6,
  },
  // v313: la mesa se dobla — cinco escenarios nuevos para que el giro diario
  // traiga una clase distinta cada día (6 de 10 en el tablero).
  {
    titulo: "Los puentes de Novy Sad en invierno",
    fuerzas: { azul: "Grupo de ingenieros + ala de cazas", rojo: "Regimiento antiaéreo de Volgaria" },
    objetivoAzul: "Botar 3 puentes de pontones antes del turno 10",
    objetivoRojo: "Denegar el río: 40 impactos de artillería acumulados",
    reglaEspecial: "El hielo aguanta 1 cruce; el segundo lo rompe",
    dificultad: 4,
    turns: 10,
  },
  {
    titulo: "La ballena de hierro",
    fuerzas: { azul: "Submarino S-9 «Ballena» (torpedos 6)", rojo: "Convoy mercante + 2 destructores de escolta" },
    objetivoAzul: "Hundir 4 de 7 mercantes sin ser detectado 2 ticks seguidos",
    objetivoRojo: "Entregar el convoy a puerto con 5 mercantes",
    reglaEspecial: "Cada torpedo fallado revela la posición del S-9",
    dificultad: 5,
    turns: 12,
  },
  {
    titulo: "Órbita Kestrel-7",
    fuerzas: { azul: "Red de 4 satélites de observación", rojo: "Batería antisatélite del Frente de Unificación" },
    objetivoAzul: "Mantener 3 satélites en órbita hasta el turno 8",
    objetivoRojo: "Cegar la red: derribar 2 satélites en 24 h",
    reglaEspecial: "Cada satélite perdido degrada la puntería azul 15 %",
    dificultad: 3,
    turns: 8,
  },
  {
    titulo: "La ciudad que cierra",
    fuerzas: { azul: "Batallón mecanizado (orden de asalto limitado)", rojo: "Milicia urbana + 200.000 civiles" },
    objetivoAzul: "Tomar el ayuntamiento con menos de 5 bajas civiles",
    objetivoRojo: "Que la ciudad resista hasta el turno 12",
    reglaEspecial: "Cada bloque bombardeado suma 1 baja civil y resta 2 de moral azul",
    dificultad: 4,
    turns: 12,
  },
  {
    titulo: "El silo de granito",
    fuerzas: { azul: "Guardia de silo (2 escuadrones, sensores fijos)", rojo: "Comando de sabotaje «Aguja» (infiltración)" },
    objetivoAzul: "Cero brechas en el perímetro durante 9 turnos",
    objetivoRojo: "Alcanzar la tapa del silo 1 vez",
    reglaEspecial: "La patrulla que descubre una brecha gana el turno inmediato",
    dificultad: 5,
    turns: 9,
  },
];

const LECCIONES_BASE: Leccion[] = [
  { titulo: "Nunca ataques con lo que no puedes reponer", cuerpo: "La reserva es la única verdad del frente. Un asalto brillante con la reserva al 15 % no es un asalto: es una promesa de pérdida doble. Antes de mover, pregúntate qué queda detrás si el golpe falla." },
  { titulo: "El terreno manda más que la moral", cuerpo: "Montaña, bosque y río existen para que el débil defienda. Atacar cuesta arriba sin supresión es pagar impuesto de sangre por cada celda. Rodéalo o muérete de paciencia." },
  { titulo: "La información es munición renovable", cuerpo: "Cada sensor que sobrevive un tick vale más que un cañón sin blanco. Escucha primero, dispara después: el que ve primero dispara dos veces." },
  { titulo: "Los frentes son respiración, no línea", cuerpo: "Mantener es inspirar; contraatacar es exhalar. Un frente que solo mantiene se muere de asfixia lenta, aunque no pierda metros." },
  { titulo: "El reloj es el único aliado neutral", cuerpo: "Toda victoria por puntos se juega contra el tiempo, no contra el rival. Cuando el reloj corre a tu favor, defender ES atacar." },
  // v313: cinco lecciones nuevas — la aula también respira con el giro diario
  { titulo: "La logística es la estrategia vestida de números", cuerpo: "Un plan sin columnas de suministro es un poema, no una orden. Cuenta camiones antes que batallones: el ejército que come primero pelea segundo y gana tercero." },
  { titulo: "El clima es el tercer ejército", cuerpo: "Lluvia, barro y nieve no toman partido, pero cobran peaje al que se mueve. El que planifica contra el almanaque pelea con un aliado que nunca falla ni traiciona." },
  { titulo: "Decepciona al que espía, no al que mira", cuerpo: "El sensor enemigo copia lo que le muestras. El espía interpreta lo que le dejas encontrar. Construye la primera mentira para el cristal y la segunda para el que lo lee." },
  { titulo: "La ciudad se gana calle a calle y se pierde de un bombardeo", cuerpo: "En lo urbano, cada esquina es una fortaleza y cada vecino un testigo. La fuerza que arrasa el bloque donde luchaba, pierde la guerra que estaba ganando." },
  { titulo: "El silencio también es una posición", cuerpo: "Hay noches en las que la mejor orden es no dar ninguna. El frente que calla obliga al rival a gastar sensores adivinando — y cada ping suyo es un mapa que tú ya tienes." },
];

const LEYENDAS = [
  { nombre: "Mariscal Yeva Karn", victorias: 214, doctrinaFav: "Muro Elástico" },
  { nombre: "General Amadeo Riel", victorias: 198, doctrinaFav: "Marea Corta" },
  { nombre: "Almirante Suvi Okonkwo", victorias: 187, doctrinaFav: "Mano de Sombras" },
  { nombre: "Coronel Bastian Grau", victorias: 176, doctrinaFav: "Puño de Acero" },
  { nombre: "General Nadia Ferro", victorias: 152, doctrinaFav: "Marea Corta" },
  { nombre: "Comodoro Halia Voss", victorias: 143, doctrinaFav: "Coraza de Sal" },
  { nombre: "Capitán Lorin Vex", victorias: 131, doctrinaFav: "Mano de Sombras" },
  { nombre: "Comandante Petra Suárez", victorias: 118, doctrinaFav: "Muro Elástico" },
  { nombre: "Brigadier Tor Mendoza", victorias: 109, doctrinaFav: "Diente de Sierra" },
  { nombre: "Tiniente Orel Mora", victorias: 97, doctrinaFav: "Jinete Fantasma" },
];

// v315.0 LA MESA CON MEMORIA — resolver un id «W#» del catálogo base fuera
// de la rotación diaria: el revivir de la memoria necesita la mesa ORIGINAL
// aunque hoy no toque en clase, y la dificultad GUARDADA de la partida (la
// v313 re-tira la dificultad cada día; sin ella el replay no sería exacto).
export function escenarioPorId(id: string, dificultad?: EscenarioWargame["dificultad"]): EscenarioWargame | null {
  if (!id.startsWith("W")) return null;
  const i = Number(id.slice(1)) - 1;
  const base = ESCENARIOS_BASE[i];
  if (!base) return null;
  return { ...base, id, dificultad: dificultad ?? base.dificultad };
}

// v313: LA ROTACIÓN POR ENVOLTURA — la escuela respira: del currículo
// completo, cada día toca una clase distinta (6 de 10 wargames, 4 de 10
// lecciones), determinista por fecha: el giro parte del hash del día y
// recorre el anillo sin cortar el orden de los originales.
// v318: la rotación deja de ser doméstica — se EXPORTA y sirve al instituto
// de evaluación (el informe respira con la misma ley del anillo): un solo
// patrón del ecosistema, cero copias.
export function girar<T>(base: T[], cuantos: number, inicio: number): T[] {
  if (base.length <= cuantos) return base.slice();
  const n = base.length;
  const s = ((inicio % n) + n) % n;
  return Array.from({ length: cuantos }, (_, i) => base[(s + i) % n]);
}

export function estrategiaDeHoy(): EstrategiaHoy {
  const fecha = fechaISO(new Date());
  const rnd = mulberry32(fnvHash("estrategia-" + fecha));

  const doctrinas: Doctrina[] = DOCTRINAS_BASE.map((d, i) => ({ ...d, id: `D${i + 1}` }));

  const inicioWargames = Math.floor(rnd() * ESCENARIOS_BASE.length);
  const escenarios: EscenarioWargame[] = girar(ESCENARIOS_BASE, 6, inicioWargames).map((e, i) => ({
    ...e,
    id: `W${ESCENARIOS_BASE.indexOf(e) + 1}`,
    dificultad: (1 + Math.floor(rnd() * e.dificultad)) as EscenarioWargame["dificultad"],
  }));

  const lecciones = girar(LECCIONES_BASE, 4, Math.floor(rnd() * LECCIONES_BASE.length));

  const generales: General[] = LEYENDAS.map((g) => ({ ...g }));

  return {
    fecha,
    doctrinas,
    escenarios,
    lecciones,
    generales,
    ooda: [
      { fase: "OBSERVAR", texto: "Sensores en vivo: qué se mueve y qué calla en tu tablero" },
      { fase: "ORIENTAR", texto: "Doctrina + terreno + reserva: la foto real de tu situación" },
      { fase: "DECIDIR", texto: "Elige el golpe que tu logística puede pagar dos veces" },
      { fase: "ACTUAR", texto: "Orden corta, resultado medible, y vuelta a observar" },
    ],
  };
}
