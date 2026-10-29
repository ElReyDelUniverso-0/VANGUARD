// v92.0 OJO DEL MUNDO — ESTRATEGIA GLOBAL (espejo del hub de estrategia y
// wargames): escuela de doctrinas con árboles, escenarios de wargame con
// reglas, ciclo OODA animado, lecciones tácticas y ranking de generales.
// Todo ficticio; los "generales" mezclan leyendas del mundo Vanguard con el
// jugador (TU). Determinista por día.

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
];

const LECCIONES_BASE: Leccion[] = [
  { titulo: "Nunca ataques con lo que no puedes reponer", cuerpo: "La reserva es la única verdad del frente. Un asalto brillante con la reserva al 15 % no es un asalto: es una promesa de pérdida doble. Antes de mover, pregúntate qué queda detrás si el golpe falla." },
  { titulo: "El terreno manda más que la moral", cuerpo: "Montaña, bosque y río existen para que el débil defienda. Atacar cuesta arriba sin supresión es pagar impuesto de sangre por cada celda. Rodéalo o muérete de paciencia." },
  { titulo: "La información es munición renovable", cuerpo: "Cada sensor que sobrevive un tick vale más que un cañón sin blanco. Escucha primero, dispara después: el que ve primero dispara dos veces." },
  { titulo: "Los frentes son respiración, no línea", cuerpo: "Mantener es inspirar; contraatacar es exhalar. Un frente que solo mantiene se muere de asfixia lenta, aunque no pierda metros." },
  { titulo: "El reloj es el único aliado neutral", cuerpo: "Toda victoria por puntos se juega contra el tiempo, no contra el rival. Cuando el reloj corre a tu favor, defender ES atacar." },
];

const LEYENDAS = [
  { nombre: "Mariscal Yeva Karn", victorias: 214, doctrinaFav: "Muro Elástico" },
  { nombre: "General Amadeo Riel", victorias: 198, doctrinaFav: "Marea Corta" },
  { nombre: "Almirante Suvi Okonkwo", victorias: 187, doctrinaFav: "Mano de Sombras" },
  { nombre: "Coronel Bastian Grau", victorias: 176, doctrinaFav: "Puño de Acero" },
  { nombre: "General Nadia Ferro", victorias: 152, doctrinaFav: "Marea Corta" },
  { nombre: "Capitán Lorin Vex", victorias: 131, doctrinaFav: "Mano de Sombras" },
  { nombre: "Comandante Petra Suárez", victorias: 118, doctrinaFav: "Muro Elástico" },
];

export function estrategiaDeHoy(): EstrategiaHoy {
  const fecha = fechaISO(new Date());
  const rnd = mulberry32(fnvHash("estrategia-" + fecha));

  const doctrinas: Doctrina[] = DOCTRINAS_BASE.map((d, i) => ({ ...d, id: `D${i + 1}` }));

  const escenarios: EscenarioWargame[] = ESCENARIOS_BASE.map((e, i) => ({
    ...e,
    id: `W${i + 1}`,
    dificultad: (1 + Math.floor(rnd() * e.dificultad)) as EscenarioWargame["dificultad"],
  }));

  const lecciones = LECCIONES_BASE.slice(0, 3 + Math.floor(rnd() * 3));

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
