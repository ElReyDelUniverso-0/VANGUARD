// v92.0 OJO DEL MUNDO — EN CLAVE (espejo del gran explicador geopolítico):
// cada caso se entiende en 5 claves, con mapa esquemático del área, actores,
// escenarios y "un minuto" de resumen. Determinista por día.

import { evaluarNeuronal, fechaISO, mulberry32, fnvHash } from "./neurona-core";

export type Clave = { numero: number; titulo: string; cuerpo: string };

export type DossierEnClave = {
  id: string;
  tema: string;
  region: string;
  unMinuto: string;
  claves: Clave[]; // 5
  actores: { nombre: string; rol: string; alineacion: "azul" | "rojo" | "neutral" }[];
  escenarios: { nombre: string; prob: number }[];
  mapa: { puntos: { x: number; y: number; tipo: "capital" | "frente" | "puerto" | "recurso"; nombre: string }[]; ancho: number; alto: number };
  veredicto: { riesgo: number; sentimiento: string; confianza: number };
};

const CASOS = [
  { tema: "El estrecho que estrangula", region: "Paso de Karvath", base: "marítima" },
  { tema: "La frontera que nadie dibujó", region: "Altiplano de Sarn", base: "terrestre" },
  { tema: "El lago que se apaga", region: "Cuenca de Odal", base: "recursos" },
  { tema: "Dos cumbres, un mismo trono", region: "Liga de Estrela", base: "política" },
  { tema: "El gas que divide al continente", region: "Cordillera de Bruma", base: "energética" },
  { tema: "La república sin puerto", region: "Litoral de Corodia", base: "marítima" },
  { tema: "El ciberataque que nadie reclama", region: "Red de Ostmark", base: "ciber" },
  { tema: "La cosecha que sube precios", region: "Planicie de Tarquinia", base: "alimentaria" },
];

const ACTORES_AZUL = ["Fuerza de Protección Conjunta", "Liga Marítima del Norte", "Mandato de Paz de las Cuenca", "Autoridad del Pasaje"];
const ACTORES_ROJO = ["Frente de Unificación Zandiria", "Pacto de Hierro Volgario", "Consejo Militar de Sarn", "Guardia Roja de Bruma"];
const ACTORES_NEUTRO = ["Media Luna de los Vientos", "Oficina de Refugiados de la Liga", "Observatorio Neutral de Karvath", "Comisión de Fronteras de 1974"];

const CLAVE_TITULOS = [
  "Cómo empezó todo", "Por qué importa fuera de la región", "Quién tiene poder real sobre el terreno",
  "Qué papel juega la economía", "Hasta dónde puede llegar la escalada",
];

const CLAVE_CUERPOS = [
  "Todo arranca décadas atrás: un tratado firmado a las prisas dejó la demarcación 'para después'. Después llegó el mapa imperial, luego el depósito de armas del siglo pasado y, con él, la cuenta pendiente que hoy marca todos los manuales de negociación.",
  "La región concentra un pasaje que el 34 % del comercio de tres continentes no puede evitar. Cualquier noche de tensión se traduce en sobrecoste de fletes, retrasos en cadenas de suministro y un mercado de seguros que reescribe sus primas cada lunes.",
  "En el terreno el poder no es de quien firma: es de quien sostiene la logística. Caravanas de combustible, torres de retransmisión y un puente ferroviario de doble vía deciden más que cualquier comunicado conjunto.",
  "La moneda local perdió un tercio de su valor en un trimestre; el gasoil se raciona por días alternos. Cuando la economía grita, la política exterior calla: cada ministerio juega a dos barajas distintas y se contradicen.",
  "Hay tres umbrales escritos en papeles que pocos leen: el cierre del pasaje, un ataque a un buque con bandera aliada y el movimiento de tropas hacia la zona desmilitarizada. Cruzar cualquiera reordena el tablero en 72 horas.",
];

function generarDossier(fecha: string, idx: number): DossierEnClave {
  const rnd = mulberry32(fnvHash(`clave-${fecha}-${idx}`));
  const caso = CASOS[idx % CASOS.length];

  const veredicto = evaluarNeuronal(`${caso.tema} ${caso.region} ${CLAVE_CUERPOS.join(" ")}`);

  const claves: Clave[] = CLAVE_TITULOS.map((titulo, i) => ({
    numero: i + 1,
    titulo,
    // variación determinista: reordena ligeramente los cuerpos por caso
    cuerpo: CLAVE_CUERPOS[(i + idx) % CLAVE_CUERPOS.length],
  }));

  const nombresPuntos = ["Karvath Norte", "Isla Centinela", "Depósito Oriente", "Punta Ferro", "Puerto Viejo", "Zona Desmilitarizada", "Torre 9", "Cruce del Alba"];
  const tipos = ["capital", "frente", "puerto", "recurso"] as const;
  const puntos = Array.from({ length: 6 + Math.floor(rnd() * 3) }, (_, i) => ({
    x: 12 + rnd() * 76,
    y: 16 + rnd() * 68,
    tipo: tipos[Math.floor(rnd() * tipos.length)],
    nombre: nombresPuntos[i % nombresPuntos.length],
  }));

  const base = 50 + Math.floor(rnd() * 20);
  const escenarios = [
    { nombre: "Negociación técnica", prob: base },
    { nombre: "Incidente limitado", prob: Math.round((100 - base) * 0.55) },
    { nombre: "Escalada abierta", prob: 100 - base - Math.round((100 - base) * 0.55) },
  ];

  return {
    id: `EC-${idx + 1}-${fecha.slice(5)}`,
    tema: caso.tema,
    region: caso.region,
    unMinuto: `En un minuto: ${caso.tema} es el caso que define a ${caso.region} este trimestre. Hay cinco claves, tres actores con veto y dos líneas rojas escritas. Si el pasaje se cierra 48 horas, el precio de la guerra se paga en tres continentes el mismo lunes.`,
    claves,
    actores: [
      { nombre: ACTORES_AZUL[idx % ACTORES_AZUL.length], rol: "Garante del orden vigente", alineacion: "azul" },
      { nombre: ACTORES_ROJO[idx % ACTORES_ROJO.length], rol: "Impulsor del cambio forzado", alineacion: "rojo" },
      { nombre: ACTORES_NEUTRO[idx % ACTORES_NEUTRO.length], rol: "Colchón humanitario", alineacion: "neutral" },
    ],
    escenarios,
    mapa: { puntos, ancho: 100, alto: 100 },
    veredicto: { riesgo: veredicto.riesgo, sentimiento: veredicto.sentimiento, confianza: veredicto.confianza },
  };
}

export function generarEnClave(fecha: string, n = 4): DossierEnClave[] {
  return Array.from({ length: n }, (_, i) => generarDossier(fecha, i));
}

export function fechaHoy(): string {
  return fechaISO(new Date());
}
