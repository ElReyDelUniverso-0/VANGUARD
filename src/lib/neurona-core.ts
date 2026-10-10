// v99.0 MENTE VIVA — NÚCLEO NEURONAL v4 (motor compartido)
// La red neuronal de Vanguard ya no solo firma expedientes de cables (v89):
// ahora COMPUTA todo el planeta. Este motor determinista alimenta los índices
// del MONITOR GLOBAL, la confianza de los PRONÓSTICOS, las detecciones del
// OJO-GEOINT y el sentimiento de la REVISTA. Misma receta en todas partes:
// rasgos → pesos → sigmoide → veredicto. Reproducible, explicable, sin fin.
// v99: DOS NEURONAS NUEVAS (espacio, social) y PREDECIR() — la MENTE proyecta
// escenarios con horizonte y pasos de razonamiento para el panel MENTE VIVA.

// ---------- PRNG determinista (FNV-1a + mulberry32) ----------
export function fnvHash(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

// ---------- Rasgos temáticos (lexicón de escalada) ----------
const LEXICON: Record<string, string[]> = {
  militar: ["maniobras", "artillería", "convoy", "misiles", "batallón", "flota", "bombardeo", "frente", "mobilización", "militar", "francotirador", "cañón"],
  diplomacia: ["cumbre", "tratado", "embajada", "sanción", "nota diplomática", "mediación", "cedula", "acuerdo", "ministerio"],
  economia: ["petróleo", "gas", "trigo", "embargo", "arancel", "moneda", "inflación", "puerto", "gasoil", "cupo"],
  ciber: ["ransomware", "botnet", "phishing", "infiltración", "ciber", "servidor", "denegación", "malware"],
  humanitario: ["refugiados", "ayuda humanitaria", "hospital", "evacuación", "escasez", "cólera", "hambre"],
  nuclear: ["uranio", "enriquecimiento", "disuasión", "ogiva", "ensayo subterráneo", "silos"],
  // v99.0 — dos neuronas nuevas
  espacio: ["satélite", "órbita", "lanzamiento", "anti-satélite", "cohete", "constelación", "gps", "baja órbita", "estación espacial"],
  social: ["protestas", "movilización", "huelga general", "elecciones", "referéndum", "disturbios", "censura", "desinformación", "opinión pública"],
};

export type Rasgos = {
  militar: number;
  diplomacia: number;
  economia: number;
  ciber: number;
  humanitario: number;
  nuclear: number;
  espacio: number; // v99
  social: number; // v99
};

export function extraerRasgos(texto: string): Rasgos {
  const t = texto.toLowerCase();
  const out = {} as Rasgos;
  (Object.keys(LEXICON) as (keyof Rasgos)[]).forEach((k) => {
    let hits = 0;
    for (const w of LEXICON[k]) if (t.includes(w)) hits++;
    out[k] = hits;
  });
  return out;
}

// Pesos del núcleo (v3): cada neurona temática pesa distinto en el veredicto
export const PESOS_V3 = {
  riesgo: { militar: 14, diplomacia: -8, economia: 6, ciber: 9, humanitario: 10, nuclear: 22, espacio: 7, social: 11 },
  tension: { militar: 16, diplomacia: -10, economia: 7, ciber: 8, humanitario: 9, nuclear: 24, espacio: 6, social: 13 },
  // neurona de confianza: fuentes cruzadas suben, rumores bajan
  confianza: { militar: -3, diplomacia: 5, economia: 4, ciber: -6, humanitario: 2, nuclear: -8, espacio: 1, social: -7 },
} as const;

export type Sentimiento = "ESCALADA" | "TENSIÓN" | "ESTABLE" | "DÉTENTE";

export type Veredicto = {
  riesgo: number; // 0-100
  tension: number; // 0-100
  confianza: number; // 0-100
  sentimiento: Sentimiento;
  neuronasActivas: string[]; // nombre de las neuronas que dispararon
  interpolacion: number; // -1..1 (posición en el semáforo)
};

export function clasificarSentimiento(riesgo: number): Sentimiento {
  if (riesgo >= 75) return "ESCALADA";
  if (riesgo >= 55) return "TENSIÓN";
  if (riesgo >= 35) return "ESTABLE";
  return "DÉTENTE";
}

/** Núcleo neuronal v3: calcula veredicto de un escenario/cable/nota. */
export function evaluarNeuronal(texto: string, cruceFuentes = 2): Veredicto {
  const r = extraerRasgos(texto);
  const bias = fnvHash(texto) % 7; // pequeño sesgo determinista propio del texto
  const zRiesgo =
    Object.keys(r).reduce((acc, k) => acc + r[k as keyof Rasgos] * PESOS_V3.riesgo[k as keyof Rasgos], 0) + bias;
  const zTension =
    Object.keys(r).reduce((acc, k) => acc + r[k as keyof Rasgos] * PESOS_V3.tension[k as keyof Rasgos], 0) + bias * 0.5;
  const zConf =
    34 + cruceFuentes * 7 + Object.keys(r).reduce((acc, k) => acc + r[k as keyof Rasgos] * PESOS_V3.confianza[k as keyof Rasgos], 0);

  const riesgo = Math.round(clamp(sigmoid(zRiesgo / 18) * 100, 2, 98));
  const tension = Math.round(clamp(sigmoid(zTension / 16) * 100, 2, 98));
  const confianza = Math.round(clamp(zConf, 15, 96));
  const neuronasActivas = (Object.keys(r) as (keyof Rasgos)[]).filter((k) => r[k] > 0);

  return {
    riesgo,
    tension,
    confianza,
    sentimiento: clasificarSentimiento(riesgo),
    neuronasActivas,
    interpolacion: clamp(riesgo / 100 * 2 - 1, -1, 1),
  };
}

// ---------- v99.0 PREDECIR: la MENTE proyecta escenarios ----------
export type Prediccion = {
  horizonte: string; // "72 h" | "2 semanas" | "6 meses"
  escenarios: { nombre: string; probabilidad: number; señal: string }[]; // suman ~100
  pasos: string[]; // razonamiento explicable de la red
  confianzaRed: number; // 0-100
};

const HORIZONTES = ["72 h", "2 semanas", "6 meses"];
const NOMBRES_ESCENARIO = ["CONTENCIÓN", "ESCALADA CONTROLADA", "DÉTENTE", "RUPTURA", "CONGELACIÓN"];
const SEÑALES = [
  "movimiento de convoyes sin rotación", "cruce de notas diplomáticas en 48 h",
  "volumen anómalo en puertos clave", "tráfico de botnet apuntando a grids",
  "canales de desinformación calentando la plaza", "pases de satélite sobre el mismo punto",
  "cólera/carestía presionando la retaguardia", "silencio radio en ejercicios anunciados",
];

/** v99: proyección determinista de escenarios con razonamiento explicable. */
export function predecir(texto: string, bucket = bucketMinutos(5)): Prediccion {
  const v = evaluarNeuronal(texto);
  const rng = mulberry32(fnvHash(texto) ^ bucket);
  const hz = HORIZONTES[bucket % HORIZONTES.length];

  // pesos base según sentimiento + jitter determinista, normalizados a 100
  const base =
    v.sentimiento === "ESCALADA" ? [30, 38, 10, 16, 6]
    : v.sentimiento === "TENSIÓN" ? [36, 28, 14, 12, 10]
    : v.sentimiento === "ESTABLE" ? [44, 14, 20, 8, 14]
    : [52, 8, 24, 4, 12];
  const jitter = base.map((b) => Math.max(3, b + Math.floor(rng() * 9) - 4));
  const suma = jitter.reduce((a, b) => a + b, 0);
  const escenarios = NOMBRES_ESCENARIO.map((nombre, i) => ({
    nombre,
    probabilidad: Math.round((jitter[i] / suma) * 100),
    señal: SEÑALES[Math.floor(rng() * SEÑALES.length)],
  }));

  const pasos = [
    `8 neuronas lectores: ${v.neuronasActivas.length > 0 ? v.neuronasActivas.join(", ") : "sin señales fuertes"}.`,
    `riesgo ${v.riesgo}/100 · tensión ${v.tension}/100 · confianza ${v.confianza}/100.`,
    `sentimiento de la red: ${v.sentimiento} (interpolación ${v.interpolacion.toFixed(2)}).`,
    `proyección ${hz} con jitter determinista por pulso de 5 minutos.`,
  ];

  return {
    horizonte: hz,
    escenarios: escenarios.sort((a, b) => b.probabilidad - a.probabilidad),
    pasos,
    confianzaRed: v.confianza,
  };
}

// ---------- Utilidades de fecha/bucket (coherentes con el resto de espejos) ----------
export function bucketMinutos(min: number, base = Date.now()): number {
  return Math.floor(base / (min * 60_000));
}

export function fechaISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function diasAtras(n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    out.push(fechaISO(d));
  }
  return out;
}

export function fechaLargaISO(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const fecha = new Date(Date.UTC(y, m - 1, d));
  return fecha.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
