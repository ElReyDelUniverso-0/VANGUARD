// ============================================================
// VANGUARD · MOTORES ANALÍTICOS GLOBALES (v423.0 - REVOLUCIÓN)
//
// Implementaciones matemáticas puras sin dependencias externas:
// 1. Lanchester: Ley cuadrática y lineal de combate y atrición
// 2. DBSCAN: Clustering espacial para geolocalización de frentes
// 3. Haversine: Distancia geodésica sobre el elipsoide terrestre
// 4. Nelson-Siegel: Modelado de estructura temporal y curvas de rendimiento
// 5. Lotka-Volterra: Dinámica de disuasión y carreras armamentistas
// 6. Modelo de Gravedad Geopolítica: Flujos bilaterales de comercio/influencia
// 7. Brier Score: Calibración y honestidad de pronósticos probabilísticos
// 8. Escala de Escalada de Herman Kahn: Índice de umbrales nucleares y DEFCON
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
      asignados.set(p.id, -1);
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
 */
export function curvaNelsonSiegel(
  madurezAnios: number,
  beta0: number,
  beta1: number,
  beta2: number,
  tau = 1.5
): number {
  if (madurezAnios <= 0) return beta0 + beta1;
  const m = madurezAnios / tau;
  const factor1 = (1 - Math.exp(-m)) / m;
  const factor2 = factor1 - Math.exp(-m);
  return beta0 + beta1 * factor1 + beta2 * factor2;
}

/**
 * Dinámica Lotka-Volterra de disuasión y equilibrio armamentista.
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
 * Modelo de gravedad para atracción geopolítica y flujo de influencia bilateral.
 */
export function gravedadGeopolitica(
  masaI: number,
  masaJ: number,
  distanciaKm: number,
  gamma = 1.15,
  G = 1.0
): number {
  const d = Math.max(10, distanciaKm);
  return (G * (masaI * masaJ)) / Math.pow(d, gamma);
}

/**
 * Cálculo del Brier Score para validación y honestidad de pronósticos probabilísticos.
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

/**
 * Modelo de Escalada Nuclear de Herman Kahn (44 peldaños comprimidos en 7 fases).
 */
export interface EstadoEscalada {
  fase: number; // 1 a 7
  nombreFase: string;
  nivelDefcon: 1 | 2 | 3 | 4 | 5;
  probabilidadUsoNuclear: number; // 0.0 - 1.0
  descripcionDoctrinal: string;
  indicadoresClave: string[];
}

export function evaluarEscaladaKahn(peldanioKahn: number): EstadoEscalada {
  const r = Math.max(1, Math.min(44, Math.round(peldanioKahn)));

  if (r <= 3) {
    return {
      fase: 1,
      nombreFase: "Desacuerdo Sub-crisis",
      nivelDefcon: 5,
      probabilidadUsoNuclear: 0.001,
      descripcionDoctrinal: "Disputas retóricas, notas diplomáticas formales y gestos políticos sin despliegue de fuerzas.",
      indicadoresClave: ["Declaraciones de cancillería", "Intercambio de embajadores", "Retórica en foros multilaterales"],
    };
  }
  if (r <= 9) {
    return {
      fase: 2,
      nombreFase: "Crisis Tradicional",
      nivelDefcon: 4,
      probabilidadUsoNuclear: 0.015,
      descripcionDoctrinal: "Movilización de reservas convencionales, ejercicios militares no anunciados cerca de fronteras.",
      indicadoresClave: ["Alerta en bases aéreas", "Aumento de vuelos SIGINT", "Embargos selectivos"],
    };
  }
  if (r <= 15) {
    return {
      fase: 3,
      nombreFase: "Enfrentamiento Armado Intenso",
      nivelDefcon: 3,
      probabilidadUsoNuclear: 0.08,
      descripcionDoctrinal: "Guerra convencional abierta sin uso de armas de destrucción masiva. Pérdidas significativas de material.",
      indicadoresClave: ["Dispersión de bombarderos", "Ciberataques a satélites militares", "Combate de alta intensidad en el frente"],
    };
  }
  if (r <= 21) {
    return {
      fase: 4,
      nombreFase: "Umbral Nuclear / Demostración",
      nivelDefcon: 2,
      probabilidadUsoNuclear: 0.28,
      descripcionDoctrinal: "Demostración nuclear táctica en zona deshabitada o detonación electromagnética (EMP) a gran altitud.",
      indicadoresClave: ["Salida de submarinos SSBN", "Carga de ojivas en silos ICBM", "Evacuación de centros de mando"],
    };
  }
  if (r <= 31) {
    return {
      fase: 5,
      nombreFase: "Guerra Nuclear Táctica de Campo",
      nivelDefcon: 1,
      probabilidadUsoNuclear: 0.65,
      descripcionDoctrinal: "Uso de armas nucleares de bajo rendimiento contra formaciones blindadas o bases logísticas avanzadas.",
      indicadoresClave: ["Ataques contra cuarteles generales de teatro", "Destrucción de puertos de reabastecimiento", "Iónosfera perturbada por radiación"],
    };
  }
  if (r <= 38) {
    return {
      fase: 6,
      nombreFase: "Ataque Contra-Fuerza Estratégico",
      nivelDefcon: 1,
      probabilidadUsoNuclear: 0.88,
      descripcionDoctrinal: "Ataque masivo contra silos de misiles y bases navales enemigas para neutralizar la segunda respuesta.",
      indicadoresClave: ["Lanzamiento de salvas ICBM", "Defensa antimisiles saturada", "Comando y control aerotransportado 'Doomsday' activo"],
    };
  }
  return {
    fase: 7,
    nombreFase: "Guerra Contra-Valor / Devastación Espasmódica",
    nivelDefcon: 1,
    probabilidadUsoNuclear: 0.999,
    descripcionDoctrinal: "Destrucción mutua asegurada (MAD) dirigida contra las grandes metrópolis y el tejido industrial global.",
    indicadoresClave: ["Impactos masivos en capitales y megalópolis", "Invierno nuclear y colapso de biosfera", "Fin de la gobernanza organizada"],
  };
}
