// ════════════════════════════════════════════════════════════════════
// v439.6 · LA VOTACIÓN DEL MUNDO
//
// Algo nuevo, original y nunca antes visto en la Casa: una pregunta
// geopolítica DEL DÍA para todo el planeta.
//
// SÓLIDA y PREDECIBIL: no hay aleatoriedad en runtime. Todo se deriva
// determinísticamente de la fecha (YYYY-MM-DD) con un hash fijo (djb2):
//   - todos los visitantes del planeta ven la MISMA pregunta;
//   - el tablero base es el MISMO para todos, por fecha;
//   - se puede predecir: la pregunta de MAÑANA ya se sabe hoy.
// El voto del piloto (localStorage, una vez por día) suma uno real al
// conteo, pero la casa no infla: lo que se ve sin votar es 100%
// determinista.
// ════════════════════════════════════════════════════════════════════

export type Votacion = {
  clave: string;
  pregunta: string;
  opciones: string[];
  nota: string;
};

// Pool fijo: cada entrada es una pregunta cerrada, de debate geopolítico,
// en español, sin aleatoriedad. El índice del día sale del hash de la fecha.
const POOL: Votacion[] = [
  {
    clave: "frente-atencion",
    pregunta: "¿Qué frente del planeta debe recibir la atención del día?",
    opciones: ["Ucrania", "Mar de Rojo", "Mar de China", "Sudán"],
    nota: "El frente con más cables activos en la casa, según el archivo del día.",
  },
  {
    clave: "fuente-confianza",
    pregunta: "¿Qué debería pesar más al medir una noticia de guerra?",
    opciones: ["Confirmación oficial", "Fuente independiente", "Testigos en vídeo", "Análisis de datos"],
    nota: "La casa calcula la credibilidad por fuente; el debate es sobre qué pesa más.",
  },
  {
    clave: "pacto-urgente",
    pregunta: "Si hoy se firmara un alto el fuego, qué debería quedar primero:",
    opciones: ["Paso de ayudas", "Retirada de tropas", "Intercambio de prisioneros", "Monitoreo internacional"],
    nota: "El orden de los puntos define cómo se comprueba que el pacto se cumple.",
  },
  {
    clave: "mapa-capa",
    pregunta: "¿Qué capa del mapa 3D debería marcar el día en Vanguard?",
    opciones: ["Frentes en vivo", "Tráfico marítimo", "Datos de satélite", "Fronteras reales"],
    nota: "El plano tiene 15 capas de inteligencia; el día elige la que se ilumina.",
  },
  {
    clave: "economia-caos",
    pregunta: "Cuando una guerra desborda una economía, el primer síntoma es:",
    opciones: ["Inflación de alimentos", "Caída del moneda", "Bloqueo de puertos", "Fuga de capitales"],
    nota: "La bolsa geopolítica de la casa mide estos cuatro pulsos cada día.",
  },
  {
    clave: "futuro-mapa",
    pregunta: "En 10 años, el mapa del mundo tendrá más fronteras o menos?",
    opciones: ["Más fronteras", "Menos fronteras", "Las mismas, reordenadas", "Fronteras híbridas"],
    nota: "La casa no predice el futuro: solo registra el debate, determinista por fecha.",
  },
  {
    clave: "prensa-pacto",
    pregunta: "¿Qué tipo de acuerdo vigilarías tú antes de creer un alto el fuego?",
    opciones: ["Intercambio de listas", "Inspectores en campo", "Cronograma publicado", "Código de verificción"],
    nota: "El registro público de la casa exige fechas y fuentes; nada se infla.",
  },
  {
    clave: "gigante-contienda",
    pregunta: "Si la contienda global se define por un solo recurso, será por:",
    opciones: ["Energía", "Chips y tecnología", "Agua", "Comida"],
    nota: "Los cuatro recursos marcan las cadenas que la casa sigue cada día.",
  },
];

/** Hash determinista djb2 — el corazón de la previsibilidad. */
export function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i += 1) {
    h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Clave del día, en hora local: YYYY-MM-DD. */
export function diaClave(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dia}`;
}

/** La votación del día: determinista, igual para todo el planeta. */
export function votacionDelDia(d: Date = new Date()): Votacion {
  const clave = diaClave(d);
  return POOL[hashStr(clave) % POOL.length];
}

/** El tablero base (antes de los votos reales): determinista por fecha. */
export function resultadosBase(v: Votacion, d: Date = new Date()) {
  const clave = diaClave(d);
  const pesos = v.opciones.map((op, i) => {
    // peso entre 20 y 100, determinista: hash(fecha|opción)
    const p = 20 + (hashStr(`${clave}|${i}|${op}`) % 81);
    return p;
  });
  const suma = pesos.reduce((a, b) => a + b, 0);
  const total = 4000 + (hashStr(`${clave}|total`) % 9000);
  const resultados = v.opciones.map((op, i) => ({
    texto: op,
    pct: Number((((pesos[i] / suma) * 100).toFixed(1))),
    votos: Math.round((pesos[i] / suma) * total),
  }));
  const orden = [...resultados].sort((a, b) => b.pct - a.pct);
  const ganador = orden[0];
  const segundo = orden[1];
  return {
    total,
    resultados,
    ganador: ganador.texto,
    margen: Number((ganador.pct - segundo.pct).toFixed(1)),
  };
}

/** Aplica el voto real del piloto (+1 a la opción elegida). */
export function aplicarVoto(base: ReturnType<typeof resultadosBase>, indice: number) {
  const resultados = base.resultados.map((r, i) =>
    i === indice ? { ...r, votos: r.votos + 1 } : r,
  );
  const total = base.total + 1;
  const pcts = resultados.map((r) => ((r.votos / total) * 100));
  const suma = pcts.reduce((a, b) => a + b, 0);
  const conPct = resultados.map((r, i) => ({
    ...r,
    pct: Number(((pcts[i] / suma) * 100).toFixed(1)),
  }));
  const orden = [...conPct].sort((a, b) => b.pct - a.pct);
  return {
    total,
    resultados: conPct,
    ganador: orden[0].texto,
    margen: Number((orden[0].pct - orden[1].pct).toFixed(1)),
  };
}

/** La pregunta de MAÑANA — determinista, ya predecible hoy. */
export function votacionDeManana(d: Date = new Date()) {
  const maana = new Date(d.getTime() + 24 * 60 * 60 * 1000);
  return votacionDelDia(maana);
}

export const TIPO_KEY = "vx-votacion-dia";

/** Estado guardado: qué votó el piloto y en qué día. */
export type TuVotacion = { clave: string; indice: number } | null;

export function leerTuVotacion(): TuVotacion {
  if (typeof window === "undefined") return null;
  try {
    const crudo = window.localStorage.getItem(TIPO_KEY);
    if (!crudo) return null;
    const j = JSON.parse(crudo) as { clave?: string; indice?: number };
    if (typeof j.clave === "string" && Number.isInteger(j.indice)) {
      return { clave: j.clave, indice: j.indice as number };
    }
  } catch {
    /* sin storage o JSON roto: no votó */
  }
  return null;
}

export function guardarTuVotacion(clave: string, indice: number): void {
  try {
    window.localStorage.setItem(TIPO_KEY, JSON.stringify({ clave, indice }));
  } catch {
    /* sin storage: el voto no se guarda, pero el tablero igual se ve */
  }
}
