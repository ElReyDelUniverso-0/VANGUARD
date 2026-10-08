// v92.0 OJO DEL MUNDO — MONITOR GLOBAL (espejo del tablero mundial en vivo):
// índices computados por el NÚCLEO NEURONAL (tensión global, teatros,
// energía, ciber, desinformación), cinta de precios de guerra y feed de
// alertas. Determinista por tramos de 5 minutos.

import { evaluarNeuronal, bucketMinutos, mulberry32, fnvHash } from "./neurona-core";

export type IndiceTeatro = { teatro: string; valor: number; delta: number };

export type Ticker = { simbolo: string; nombre: string; precio: number; deltaPct: number; unidad: string };

export type AlertaMonitor = {
  id: string;
  hora: string;
  severidad: "CRÍTICA" | "ALTA" | "MEDIA" | "INFORMATIVA";
  texto: string;
  fuente: string;
  neuronas: string[];
};

export type MonitorGlobal = {
  bucket: number;
  tensionGlobal: number;
  deltaGlobal: number;
  teatros: IndiceTeatro[];
  energia: number;
  ciber: number;
  desinformacion: number;
  maritimo: number;
  tickers: Ticker[];
  alertas: AlertaMonitor[];
  núcleoHistoria: number[]; // historia 24h del índice para el sparkline
};

const TEATROS = ["Europa del Este", "Levante", "Indo-Pacífico", "África", "Ciberespacio", "Ártico"];

const TICKERS_BASE = [
  { simbolo: "CRD", nombre: "Crudo Brent ficticio", precio: 84.2, unidad: "USD/bbl" },
  { simbolo: "GAS", nombre: "Gas TTF ficticio", precio: 31.6, unidad: "USD/MWh" },
  { simbolo: "TRG", nombre: "Trigo Euronext ficticio", precio: 212.4, unidad: "USD/t" },
  { simbolo: "ORO", nombre: "Oro spot ficticio", precio: 2412.0, unidad: "USD/oz" },
  { simbolo: "URN", nombre: "Uranio ficticio", precio: 91.5, unidad: "USD/lb" },
  { simbolo: "FLT", nombre: "Flete contenedor ficticio", precio: 3180.0, unidad: "USD/TEU" },
  { simbolo: "DEF", nombre: "Índice de defensa Vanguard", precio: 1542.7, unidad: "pts" },
  { simbolo: "DRN", nombre: "Basket de drones Vanguard", precio: 486.3, unidad: "pts" },
];

const ALERTAS_TXT = [
  { sev: "CRÍTICA" as const, txt: "Dos portaviones en la misma zona de operaciones por primera vez en 14 meses", f: "Radar de flotas Vanguard" },
  { sev: "ALTA" as const, txt: "Spoofing de GPS reportado por 11 aeronaves civiles sobre el corredor norte", f: "Red de pilotos" },
  { sev: "ALTA" as const, txt: "Corte submarino de fibra en el trayecto B—C: tráfico redirigido con +230 ms", f: "Operadores de cables" },
  { sev: "MEDIA" as const, txt: "Reserva estratégica de gasoil cae bajo el umbral de 40 días en tres países", f: "Telemetría de depósitos" },
  { sev: "MEDIA" as const, txt: "Campaña de desinformación clonando sellos oficiales: 340 cuentas nuevas en 6 h", f: "Colmena de bots Vanguard" },
  { sev: "INFORMATIVA" as const, txt: "Convoy humanitario cruza el cruce del Alba con escolta neutral", f: "Media Luna de los Vientos" },
  { sev: "ALTA" as const, txt: "Maniobras no anunciadas a 90 km de una zona desmilitarizada", f: "Observadores OSINT" },
  { sev: "MEDIA" as const, txt: "Precio del seguro de guerra sube 0,4 % para rutas del pasaje", f: "Sindical de Lloyd ficticia" },
  { sev: "INFORMATIVA" as const, txt: "Segundo pase SAR confirma que la pista 2 sigue sin huellas nuevas", f: "OJO-GEOINT" },
  { sev: "CRÍTICA" as const, txt: "Ensayo de misil de crucero con perfil de vuelo terrestre bajo", f: "Cadena de sensores Vanguard" },
];

function horaAtras(min: number): string {
  const d = new Date(Date.now() - min * 60_000);
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

export function generarMonitor(base = Date.now()): MonitorGlobal {
  const bucket = bucketMinutos(5, base);
  const rnd = mulberry32(fnvHash("monitor-" + bucket));

  // El núcleo neuronal computa la tensión con un resumen del estado del mundo
  const resumen = `estado del mundo bucket ${bucket}: maniobras, sancciones, ciberataques y refugiados en teatros`;
  const veredicto = evaluarNeuronal(resumen, 3 + (bucket % 3));
  const tensionGlobal = Math.max(8, Math.min(97, veredicto.tension + Math.round((rnd() - 0.45) * 10)));

  const teatros: IndiceTeatro[] = TEATROS.map((t, i) => ({
    teatro: t,
    valor: Math.max(4, Math.min(99, Math.round(tensionGlobal * (0.6 + rnd() * 0.9) + (i % 3) * 4))),
    delta: Math.round((rnd() - 0.45) * 14),
  }));

  // historia 24h: 24 puntos deterministas hacia atrás
  const núcleoHistoria = Array.from({ length: 24 }, (_, i) => {
    const b = bucket - (23 - i);
    const v = evaluarNeuronal(`estado del mundo bucket ${b}: maniobras, sancciones, ciberataques`, 2 + (b % 3));
    return Math.max(6, Math.min(97, v.tension + Math.round((mulberry32(fnvHash("h" + b))() - 0.45) * 10)));
  });
  const deltaGlobal = tensionGlobal - núcleoHistoria[22];

  const tickers: Ticker[] = TICKERS_BASE.map((t) => ({
    ...t,
    precio: Math.round(t.precio * (1 + (rnd() - 0.5) * 0.035) * 10) / 10,
    deltaPct: Math.round((rnd() - 0.42) * 420) / 100,
  }));

  const alertas: AlertaMonitor[] = ALERTAS_TXT.slice(0, 6 + Math.floor(rnd() * 3)).map((a, i) => {
    const v = evaluarNeuronal(a.txt, 2);
    return {
      id: `M-${bucket}-${i}`,
      hora: horaAtras(Math.floor(rnd() * 180)),
      severidad: a.sev,
      texto: a.txt,
      fuente: a.f,
      neuronas: v.neuronasActivas.slice(0, 2),
    };
  });

  return {
    bucket,
    tensionGlobal,
    deltaGlobal,
    teatros,
    energia: Math.max(5, Math.min(98, Math.round(tensionGlobal * 0.85 + (rnd() - 0.5) * 14))),
    ciber: Math.max(5, Math.min(98, Math.round(tensionGlobal * 0.7 + (rnd() - 0.5) * 20))),
    desinformacion: Math.max(5, Math.min(98, Math.round(tensionGlobal * 0.75 + (rnd() - 0.5) * 18))),
    maritimo: Math.max(5, Math.min(98, Math.round(tensionGlobal * 0.8 + (rnd() - 0.5) * 12))),
    tickers,
    alertas,
    núcleoHistoria,
  };
}
