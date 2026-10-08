// v92.0 OJO DEL MUNDO — PRONÓSTICOS (espejo del monitor de inteligencia
// geopolítica): notas de pronóstico con horizonte, escenarios con
// probabilidades, confianza del núcleo neuronal y rating de riesgo por país.
// Determinista por fecha: cada día nacen notas nuevas y el archivo crece.

import { evaluarNeuronal, fechaISO, fechaLargaISO, mulberry32, fnvHash } from "./neurona-core";

export type Horizonte = "3 MESES" | "6 MESES" | "12 MESES";

export type Escenario = {
  nombre: string;
  probabilidad: number; // %
  resumen: string;
};

export type NotaPronostico = {
  id: string;
  titulo: string;
  region: string;
  horizonte: Horizonte;
  confianza: number; // del núcleo neuronal
  sentimiento: string;
  riesgo: number;
  resumen: string;
  indicadores: string[];
  escenarios: Escenario[]; // base / alto / bajo
  analista: string;
};

export type RatingPais = {
  pais: string;
  riesgoTotal: number;
  armado: number;
  politico: number;
  economico: number;
  social: number;
  tendencia: "AL ALZA" | "ESTABLE" | "A LA BAJA";
};

const REGIONES = [
  "Europa del Este", "Mar Negro", "Levante Mediterráneo", "Golfo Pérsico",
  "Cuerno de África", "Sahel", "Indo-Pacífico", "Estrecho de Taiwán",
  "Mar de China Meridional", "Cáucaso", "Báltico", "Ártico",
  "Gran Magreb", "Cuenca del Congo", "Horn of Africa", "Andes del Sur",
];

const SUJETOS = [
  "escalada naval", "bloqueo comercial", "crisis de rehenes", "ensayo de misiles",
  "colapso de cese el fuego", "carrera armamentista", "crisis energética",
  "intervención por invitación", "guerra de drones", "ciberataque masivo",
  "golpe de estado frustrado", "disputa fronteriza", "crisis de refugiados",
  "cierre de estrecho", "sabotaje de infraestructura", "combate urbano",
];

const CONECTORES_A = [
  "podría desembocar en", "amenaza con provocar", "puede desencadenar",
  "encadena el riesgo de", "abre la puerta a",
];

const CONSECUENCIAS = [
  "una crisis multilateral sin precedente", "un rearme acelerado de la región",
  "la fragmentación del espacio aéreo", "un pacto defensivo improvisado",
  "sanciones en cascada", "la militarización de islas neutrales",
  "un éxodo civil por dos rutas fronterizas", "el despliegue de peacekeepers",
];

const INDICADORES = [
  "volumen de vuelos de reconocimiento (+18 %)",
  "reservas estratégicas de crudo (−3,4 %)",
  "discursos oficiales con léxico militar (+2 σ)",
  "tráfico ferroviario hacia la frontera (×1,6)",
  "compras de divisas refugio (+9 %)",
  "toneladas de ayuda humanitaria retenida (12.400 t)",
  "pings AIS apagados cerca del estrecho (37)",
  "alarmas de GPS spoofing (14 / semana)",
  "huelgas en astilleros clave (2 semanas)",
  "votos de abstención en la asamblea (21)",
];

const ANALISTAS = [
  "Mesa de Pronósticos Vanguard", "Célula de Indicadores, Base Alba",
  "Red de Observadores del Mar Negro", "Aula de Prospectiva, Ala Norte",
  "Escuadrón de Validación Cruzada", "Departamento de Horizontes Largos",
];

const PAISES = [
  "República de Volgaria", "Federación de Kastavia", "Unión del Maghreb Unido",
  "Sultanato de Qadira", "Confederación del Río Plata", "República de Sarnaland",
  "Estado de Nueva Corodia", "Reino de Estrela", "Mancomunidad de Ostmark",
  "República Árabe de Zandiria", "Dominio de Baikal", "República de Tarquinia",
];

const claves = ["FG", "KR", "MU", "QD", "RP", "SN", "NC", "ES", "OM", "ZD", "BK", "TQ"];

export function riesgoPaises(fecha: string): RatingPais[] {
  const rnd = mulberry32(fnvHash("riesgo-" + fecha));
  return PAISES.map((pais) => {
    const armado = Math.round(18 + rnd() * 74);
    const politico = Math.round(15 + rnd() * 70);
    const economico = Math.round(12 + rnd() * 66);
    const social = Math.round(14 + rnd() * 62);
    const riesgoTotal = Math.round(armado * 0.4 + politico * 0.25 + economico * 0.2 + social * 0.15);
    const r = rnd();
    return {
      pais,
      riesgoTotal,
      armado,
      politico,
      economico,
      social,
      tendencia: r > 0.66 ? "AL ALZA" : r > 0.33 ? "ESTABLE" : "A LA BAJA",
    } satisfies RatingPais;
  });
}

export function clavesPaises(): Record<string, string> {
  const out: Record<string, string> = {};
  PAISES.forEach((p, i) => (out[p] = claves[i % claves.length]));
  return out;
}

function generarNota(fecha: string, idx: number): NotaPronostico {
  const rnd = mulberry32(fnvHash(`nota-${fecha}-${idx}`));
  const region = REGIONES[Math.floor(rnd() * REGIONES.length)];
  const sujeto = SUJETOS[Math.floor(rnd() * SUJETOS.length)];
  const titulo = `${region}: el ${sujeto} domina el horizonte`;

  const veredicto = evaluarNeuronal(`${titulo} ${CONSECUENCIAS[idx % CONSECUENCIAS.length]} ${INDICADORES[idx % INDICADORES.length]}`);

  // escenarios: base/alto/bajo con suma 100 ± ruido
  const base = 52 + Math.floor(rnd() * 18);
  const alto = Math.round((100 - base) * (0.45 + rnd() * 0.25));
  const bajo = 100 - base - alto;
  const escenarios: Escenario[] = [
    {
      nombre: "Escenario base",
      probabilidad: base,
      resumen: `El ${sujeto} persiste sin cruce de umbrales; la disuasión aguanta y las líneas diplomáticas siguen abiertas.`,
    },
    {
      nombre: "Escenario de escalada",
      probabilidad: alto,
      resumen: `Un incidente no reclamado ${CONECTORES_A[idx % CONECTORES_A.length]} ${CONSECUENCIAS[(idx + 2) % CONSECUENCIAS.length]}.`,
    },
    {
      nombre: "Escenario de distensión",
      probabilidad: bajo,
      resumen: "Una mediación sorpresiva congela la escalada y devuelve el tema a la mesa técnica durante el trimestre.",
    },
  ];

  const horizontes: Horizonte[] = ["3 MESES", "6 MESES", "12 MESES"];

  return {
    id: `P-${fecha.slice(0, 7).replace("-", "")}-${String(idx + 1).padStart(2, "0")}`,
    titulo,
    region,
    horizonte: horizontes[Math.floor(rnd() * horizontes.length)],
    confianza: veredicto.confianza,
    sentimiento: veredicto.sentimiento,
    riesgo: veredicto.riesgo,
    resumen: `Nuestra mesa evalúa que el ${sujeto} en ${region} define el trimestre. ${escenarios[0].resumen} Los indicadores${" "}
      ${INDICADORES[(idx + 3) % INDICADORES.length]} y ${INDICADORES[(idx + 6) % INDICADORES.length]} sostienen la lectura.`,
    indicadores: [
      INDICADORES[idx % INDICADORES.length],
      INDICADORES[(idx + 3) % INDICADORES.length],
      INDICADORES[(idx + 6) % INDICADORES.length],
    ],
    escenarios,
    analista: ANALISTAS[idx % ANALISTAS.length],
  };
}

export function generarPronosticos(fecha: string, n = 6): NotaPronostico[] {
  return Array.from({ length: n }, (_, i) => generarNota(fecha, i));
}

export function fechasPronosticos(n = 14): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    out.push(fechaISO(d));
  }
  return out;
}

export function fechaLarga(fecha: string): string {
  return fechaLargaISO(fecha);
}
