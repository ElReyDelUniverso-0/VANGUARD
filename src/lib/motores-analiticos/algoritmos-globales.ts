// ============================================================
// VANGUARD · MOTORES ANALÍTICOS GLOBALES (v423.0)
//
// Implementaciones matemáticas puras sin dependencias externas:
// 1. Lanchester: Ley cuadrática y lineal de combate y atrición
// 2. DBSCAN: Clustering espacial para geolocalización de frentes
// 3. Haversine: Distancia geodésica sobre el elipsoide terrestre
// 4. Nelson-Siegel: Modelado de estructura temporal y curvas de rendimiento
// 5. Lotka-Volterra: Dinámica de disuasión y carreras armamentistas
// 6. Modelo de Gravedad Geopolítica: Flujos bilaterales de comercio/influencia
// 7. Brier Score: Calibración y honestidad de pronósticos probabilísticos
// ============================================================

export interface ResultadoLanchester {
  pasos: { t: number; fuerzaA: number; fuerzaB: number }[];
  ganador: "A" | "B" | "empate";
  tiempoHastaConclusion: number;
  bajasA: number;
  bajasB: number;
  ventajaFuerzaInicial: number;
}

/**
 * Simulación de leyes de Lanchester (combate moderno a distancia / atrición directa).
 * dA/dt = -beta * B^p * A^(1-p)
 * dB/dt = -alpha * A^p * B^(1-p)
 * p = 1: Ley cuadrática (fuego concentrado a distancia)
 * p = 0: Ley lineal (fuego no dirigido / escaramuza de área)
 */
export function simularLanchester(
  a0: number,
  b0: number,
  alpha: number,
  beta: number,
  tipo: "cuadratica" | "lineal" = "cuadratica",
  maxHoras = 120,
  dt = 0.1
): ResultadoLanchester {
  const p = tipo === "cuadratica" ? 1 : 0;
  let a = Math.max(0, a0);
  let b = Math.max(0, b0);
  let t = 0;
  const pasos: { t: number; fuerzaA: number; fuerzaB: number }[] = [
    { t: 0, fuerzaA: Math.round(a), fuerzaB: Math.round(b) },
  ];

  while (t < maxHoras && a > 0.05 * a0 && b > 0.05 * b0) {
    const perdidaA = p === 1 ? beta * b : beta * a * (b / (a + b || 1));
    const perdidaB = p === 1 ? alpha * a : alpha * b * (a / (a + b || 1));

    a = Math.max(0, a - perdidaA * dt);
    b = Math.max(0, b - perdidaB * dt);
    t += dt;

    if (Math.abs(t - Math.round(t)) < dt / 2) {
      pasos.push({
        t: Math.round(t * 10) / 10,
        fuerzaA: Math.round(a),
        fuerzaB: Math.round(b),
      });
    }
  }

  const ganador = a / a0 > b / b0 ? "A" : b / b0 > a / a0 ? "B" : "empate";
  const ventaja = (alpha * Math.pow(a0, 2)) / (beta * Math.pow(b0, 2) || 1e-6);

  return {
    pasos,
    ganador,
    tiempoHastaConclusion: Math.round(t * 10) / 10,
    bajasA: Math.round(a0 - a),
    bajasB: Math.round(b0 - b),
    ventajaFuerzaInicial: Math.round(ventaja * 100) / 100,
  };
}

export interface PuntoGeo {
  id: string;
  lat: number;
  lng: number;
  peso?: number;
  cluster?: number;
}

/**
 * Distancia ortodrómica Haversine en kilómetros.
 */
export function calcularHaversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio medio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Agrupamiento espacial DBSCAN para detección de frentes y conglomerados de calor.
 * epsKm: radio en km para vecindad
 * minPts: mínimo de puntos para considerarse núcleo
 */
export function clusterizarDBSCAN(
  puntos: PuntoGeo[],
  epsKm = 50,
  minPts = 3
): { clusters: PuntoGeo[][]; ruido: PuntoGeo[] } {
  let clusterId = 0;
  const visitados = new Set<string>();
  const asignados = new Map<string, number>();

  function regionQuery(p: PuntoGeo): PuntoGeo[] {
    return puntos.filter(
      (q) => calcularHaversineKm(p.lat, p.lng, q.lat, q.lng) <= epsKm
    );
  }

  for (const p of puntos) {
    if (visitados.has(p.id)) continue;
    visitados.add(p.id);

    const vecinos = regionQuery(p);
    if (vecinos.length < minPts) {
      asignados.set(p.id, -1); // Ruido provisional
    } else {
      clusterId++;
      asignados.set(p.id, clusterId);

      const cola = [...vecinos.filter((v) => v.id !== p.id)];
      while (cola.length > 0) {
        const q = cola.shift()!;
        if (!visitados.has(q.id)) {
          visitados.add(q.id);
          const qVecinos = regionQuery(q);
          if (qVecinos.length >= minPts) {
            cola.push(...qVecinos.filter((qv) => !visitados.has(qv.id)));
          }
        }
        if (!asignados.has(q.id) || asignados.get(q.id) === -1) {
          asignados.set(q.id, clusterId);
        }
      }
    }
  }

  const clustersMap = new Map<number, PuntoGeo[]>();
  const ruido: PuntoGeo[] = [];

  for (const p of puntos) {
    const c = asignados.get(p.id) ?? -1;
    const puntoConCluster = { ...p, cluster: c };
    if (c === -1) {
      ruido.push(puntoConCluster);
    } else {
      if (!clustersMap.has(c)) clustersMap.set(c, []);
      clustersMap.get(c)!.push(puntoConCluster);
    }
  }

  return {
    clusters: Array.from(clustersMap.values()),
    ruido,
  };
}

/**
 * Modelo Nelson-Siegel para curvas de rendimiento de deuda soberana y estrés financiero.
 * y(m) = beta0 + beta1 * ((1 - exp(-m/tau))/(m/tau)) + beta2 * (((1 - exp(-m/tau))/(m/tau)) - exp(-m/tau))
 */
export function curvaNelsonSiegel(
  madurezAnios: number,
  beta0: number, // Nivel a largo plazo
  beta1: number, // Pendiente (corto - largo)
  beta2: number, // Curvatura (joroba a medio plazo)
  tau = 1.5 // Parámetro de decaimiento temporal
): number {
  if (madurezAnios <= 0) return beta0 + beta1;
  const m = madurezAnios / tau;
  const factor1 = (1 - Math.exp(-m)) / m;
  const factor2 = factor1 - Math.exp(-m);
  return beta0 + beta1 * factor1 + beta2 * factor2;
}

/**
 * Dinámica Lotka-Volterra de disuasión y equilibrio armamentista.
 * dx/dt = x * (alpha - beta * y)
 * dy/dt = -y * (gamma - delta * x)
 */
export function simularDisuasionLotkaVolterra(
  x0: number,
  y0: number,
  alpha = 0.1,
  beta = 0.002,
  gamma = 0.1,
  delta = 0.002,
  pasosTotales = 100,
  dt = 0.5
): { paso: number; arsenalA: number; arsenalB: number }[] {
  let x = Math.max(1, x0);
  let y = Math.max(1, y0);
  const resultado = [{ paso: 0, arsenalA: Math.round(x), arsenalB: Math.round(y) }];

  for (let i = 1; i <= pasosTotales; i++) {
    const dx = (alpha * x - beta * x * y) * dt;
    const dy = (-gamma * y + delta * x * y) * dt;
    x = Math.max(1, x + dx);
    y = Math.max(1, y + dy);
    if (i % 2 === 0) {
      resultado.push({
        paso: i,
        arsenalA: Math.round(x),
        arsenalB: Math.round(y),
      });
    }
  }

  return resultado;
}

/**
 * Modelo de gravedad para atracción geopolítica y flujo de influencia:
 * F_ij = G * (M_i * M_j) / (D_ij ^ gamma)
 */
export function gravedadGeopolitica(
  masaI: number, // PIB o poder nacional compuesto
  masaJ: number,
  distanciaKm: number,
  gamma = 1.15,
  G = 1.0
): number {
  const d = Math.max(10, distanciaKm);
  return (G * (masaI * masaJ)) / Math.pow(d, gamma);
}

/**
 * Cálculo del Brier Score para validación y honestidad de pronósticos.
 * BS = (1/N) * sum((prob - resultadoReal)^2)
 * Rango [0, 1]: 0 es calibración perfecta, 0.25 es adivinanza aleatoria al 50%.
 */
export function calcularBrierScore(
  pronosticos: { probabilidad: number; ocurrio: boolean }[]
): { score: number; interpretacion: string } {
  if (pronosticos.length === 0) {
    return { score: 0, interpretacion: "Sin datos" };
  }

  const suma = pronosticos.reduce((acc, p) => {
    const o = p.ocurrio ? 1 : 0;
    return acc + Math.pow(p.probabilidad - o, 2);
  }, 0);

  const score = Math.round((suma / pronosticos.length) * 1000) / 1000;
  let interpretacion = "Excelente calibración probabilística";
  if (score > 0.35) interpretacion = "Calibración deficiente o sesgo sistemático";
  else if (score > 0.22) interpretacion = "Alineado con azar o incertidumbre alta";
  else if (score > 0.12) interpretacion = "Buena discriminación de señales";

  return { score, interpretacion };
}
