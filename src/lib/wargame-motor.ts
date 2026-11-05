// v314.0 LA MESA VIVA — el MOTOR DE WARGAME POR DECISIONES (etapa 1 de la
// idea anotada en la v313: los escenarios de la escuela eran fichas, no
// juegos). El operador elige la jugada de cada turno; el motor resuelve con
// tiradas DETERMINISTAS por (escenario · día · turno · jugada): la misma
// partida con las mismas decisiones reproduce el mismo curso — sin
// Math.random, la ley de la casa. Todo ficticio y declarado: la mesa
// es una escuela de mando, no una predicción.
// Estado del frente: moral, reserva y objetivos de ambos bandos; cada
// jugada mueve agujas y deja su línea en la bitácora. La REGLA ESPECIAL de
// la mesa existe y dispara: un evento por regla puede torcer el turno.
// Al final: veredicto frente a los objetivos, y si el azul cumple, botín
// honesto por la tienda del juego (addCoins/addXp — progreso de verdad).

import { mulberry32, fnvHash } from "./neurona-core";
import type { EscenarioWargame } from "./estrategia-data";

export type TonoBitacora = "azul" | "rojo" | "regla";

export type LineaBitacora = { turno: number; texto: string; tono: TonoBitacora };

export type EstadoWargame = {
  turno: number; // 1..total; tras la última jugada queda total+1 (partida cerrada)
  total: number;
  moralAzul: number;
  moralRojo: number;
  reserva: number;
  objetivoAzul: number; // 0-100
  objetivoRojo: number;
  bitacora: LineaBitacora[];
  cerrada: boolean;
};

export type Riesgo = "bajo" | "medio" | "alto";

export type Jugada = { id: string; nombre: string; descripcion: string; riesgo: Riesgo };

// el arsenal del mando: cinco jugadas, tres en mesa cada turno (giro por anillo)
const ARSENAL: Jugada[] = [
  { id: "asalto", nombre: "Asalto frontal", descripcion: "Empujar por el centro con todo el peso: rápido si rompe, caro si rebota.", riesgo: "alto" },
  { id: "flanqueo", nombre: "Flanqueo", descripcion: "Rodear por el ala abierta: lento pero la defensa paga el descuido.", riesgo: "medio" },
  { id: "artilleria", nombre: "Presión de artillería", descripcion: "Golpe a distancia y sin exponer la infantería: gana metros, gasta reserva.", riesgo: "medio" },
  { id: "reagrupar", nombre: "Reagrupar y fortificar", descripcion: "Respirar: la reserva sube y la moral descansa, pero el reloj corre para el rival.", riesgo: "bajo" },
  { id: "senuelo", nombre: "Señuelo y desgaste", descripcion: "Vender al rival un mapa falso: si muerde, gasta sus golpes en vacío.", riesgo: "bajo" },
];

const UMBRAL: Record<Riesgo, number> = { bajo: 0.68, medio: 0.52, alto: 0.38 };
const BOTIN: Record<Riesgo, number> = { bajo: 12, medio: 20, alto: 30 };

// las tres jugadas de la mesa en el turno t: anillo determinista por el hash de la mesa
export function jugadasDeTurno(esc: EscenarioWargame, turno: number): Jugada[] {
  const n = ARSENAL.length;
  const s = fnvHash(esc.id + "-mesa") % n;
  return Array.from({ length: 3 }, (_, i) => ARSENAL[(s + turno - 1 + i * 2) % n]);
}

export function estadoInicial(esc: EscenarioWargame): EstadoWargame {
  return {
    turno: 1,
    total: esc.turns,
    moralAzul: 72 - (esc.dificultad - 1) * 4,
    moralRojo: 58 + esc.dificultad * 3,
    reserva: 82,
    objetivoAzul: 0,
    objetivoRojo: 0,
    bitacora: [
      { turno: 0, texto: `La mesa abre: ${esc.titulo}. Regla especial en vigor — ${esc.reglaEspecial}.`, tono: "regla" },
    ],
    cerrada: false,
  };
}

// la resolución de una jugada: pura, determinista, narrada
export function resolverJugada(esc: EscenarioWargame, estado: EstadoWargame, jugada: Jugada): EstadoWargame {
  if (estado.cerrada || estado.turno > estado.total) return estado;
  const turno = estado.turno;
  const rnd = mulberry32(fnvHash(`${esc.id}|t${turno}|${jugada.id}`));
  const tirada = rnd();

  let { moralAzul, moralRojo, reserva, objetivoAzul, objetivoRojo } = estado;
  const bitacora: LineaBitacora[] = [...estado.bitacora];
  const acierta = tirada < UMBRAL[jugada.riesgo] + (reserva - 60) / 400;

  if (jugada.id === "asalto") {
    if (acierta) {
      objetivoAzul = Math.min(100, objetivoAzul + BOTIN.alto);
      moralRojo = Math.max(0, moralRojo - 9);
      bitacora.push({ turno, texto: `Asalto frontal: la línea roja cede — objetivo azul +${BOTIN.alto}.`, tono: "azul" });
    } else {
      moralAzul = Math.max(0, moralAzul - 11);
      reserva = Math.max(0, reserva - 14);
      objetivoRojo = Math.min(100, objetivoRojo + 8);
      bitacora.push({ turno, texto: "El asalto rebota contra el granito: bajas, reserva perdida y el rojo aprovecha para avanzar.", tono: "rojo" });
    }
  } else if (jugada.id === "flanqueo") {
    if (acierta) {
      objetivoAzul = Math.min(100, objetivoAzul + BOTIN.medio);
      moralRojo = Math.max(0, moralRojo - 6);
      bitacora.push({ turno, texto: `El ala abierta era real: flanqueo limpio — objetivo azul +${BOTIN.medio}.`, tono: "azul" });
    } else {
      moralAzul = Math.max(0, moralAzul - 6);
      reserva = Math.max(0, reserva - 7);
      bitacora.push({ turno, texto: "La columna del flanqueo choca con un contraataque sorpresa: se replega con heridas.", tono: "rojo" });
    }
  } else if (jugada.id === "artilleria") {
    if (acierta) {
      objetivoAzul = Math.min(100, objetivoAzul + BOTIN.medio);
      reserva = Math.max(0, reserva - 10);
      bitacora.push({ turno, texto: `La artillería martilla sin exponer a nadie — metros ganados (+${BOTIN.medio}) al precio de la reserva.`, tono: "azul" });
    } else {
      reserva = Math.max(0, reserva - 12);
      moralRojo = Math.max(0, moralRojo - 3);
      bitacora.push({ turno, texto: "El bombardeo se come la reserva y apenas muerde: el rojo cavó más profundo de lo que los informes decían.", tono: "rojo" });
    }
  } else if (jugada.id === "reagrupar") {
    reserva = Math.min(100, reserva + 16);
    moralAzul = Math.min(100, moralAzul + 6);
    objetivoRojo = Math.min(100, objetivoRojo + 7);
    bitacora.push({ turno, texto: "Noche de talleres y cañas calientes: la reserva respira (+16), pero el reloj del rival también.", tono: "azul" });
  } else {
    // señuelo
    if (acierta) {
      objetivoRojo = Math.max(0, objetivoRojo - 10);
      moralRojo = Math.max(0, moralRojo - 5);
      bitacora.push({ turno, texto: "El rival muerde el mapa falso y gasta su golpe en vacío: objetivo rojo retrocede.", tono: "azul" });
    } else {
      moralAzul = Math.max(0, moralAzul - 4);
      objetivoRojo = Math.min(100, objetivoRojo + 5);
      bitacora.push({ turno, texto: "El espía enemigo no muerde el señuelo: la maniobra deja el flanco descubierto un tick.", tono: "rojo" });
    }
  }

  // LA REGLA ESPECIAL EXISTE Y DISPARA: 1 de cada 4 turnos tuerce el curso
  const dadoRegla = mulberry32(fnvHash(`${esc.id}-regla|t${turno}`))();
  if (dadoRegla < 0.25) {
    const favorable = dadoRegla < 0.13;
    if (favorable) {
      objetivoAzul = Math.min(100, objetivoAzul + 8);
      bitacora.push({ turno, texto: `Regla de la mesa a favor del azul: ${esc.reglaEspecial} — el azar de la regla sonríe (+8 objetivo).`, tono: "regla" });
    } else {
      moralAzul = Math.max(0, moralAzul - 7);
      bitacora.push({ turno, texto: `Regla de la mesa contra el azul: ${esc.reglaEspecial} — el giro cobra su peaje (−7 moral).`, tono: "regla" });
    }
  }

  const cerrada = turno >= estado.total;
  if (cerrada) {
    const ganaAzul = objetivoAzul >= 70 && moralAzul > 20;
    const ganaRojo = objetivoRojo >= 70 || moralAzul <= 20;
    bitacora.push({
      turno,
      texto: ganaAzul
        ? `La mesa cierra: OBJETIVO AZUL CUMPLIDO (${objetivoAzul}/100) — ${esc.objetivoAzul}.`
        : ganaRojo
          ? `La mesa cierra: el ROJO impone su objetivo (${objetivoRojo}/100) — ${esc.objetivoRojo}.`
          : `La mesa cierra en EMPATE: ninguno de los dos objetivos se cumple (${objetivoAzul} vs ${objetivoRojo}).`,
      tono: ganaAzul ? "azul" : ganaRojo ? "rojo" : "regla",
    });
  }

  return {
    turno: turno + 1,
    total: estado.total,
    moralAzul,
    moralRojo,
    reserva,
    objetivoAzul,
    objetivoRojo,
    bitacora,
    cerrada,
  };
}

export type Veredicto = { ganaAzul: boolean; ganaRojo: boolean; botinCoins: number; botinXp: number };

export function veredictoDe(esc: EscenarioWargame, estado: EstadoWargame): Veredicto {
  const ganaAzul = estado.objetivoAzul >= 70 && estado.moralAzul > 20;
  const ganaRojo = estado.objetivoRojo >= 70 || estado.moralAzul <= 20;
  // botín honesto y escalado por dificultad: progreso de verdad, no carteles
  const botinCoins = ganaAzul ? 20 + esc.dificultad * 10 : 5;
  const botinXp = ganaAzul ? 15 + esc.dificultad * 5 : 4;
  return { ganaAzul, ganaRojo, botinCoins, botinXp };
}
