// v89.0 OPERACIÓN ESPEJO — MOTOR DE EVALUACIÓN DE CAMPAÑA (espejo del instituto
// de estudios de guerra más citado del planeta). Cada día produce una evaluación
// DETERMINISTA (misma fecha → mismo texto en cualquier dispositivo) con la
// estructura icónica: hallazgos clave numerados, secciones por teatro y
// evaluación del terreno controlado.

import { getTension } from "./tension";

function hash(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function pick<T>(arr: T[], seed: number, salt: number): T {
  return arr[(seed >>> (salt % 24)) % arr.length];
}

export interface HallazgoClave {
  titulo: string; // lead en negrita
  cuerpo: string;
}

export interface EvaluacionTeatro {
  nombre: string;
  lineas: string[];
  terreno: string; // línea "Evaluación del terreno controlado"
}

export interface EvaluacionDiaria {
  fecha: string; // ISO
  numero: number; // número de evaluación
  hallazgos: HallazgoClave[];
  teatros: EvaluacionTeatro[];
  notaMetodo: string;
}

const LEADS = [
  "Las fuerzas atacantes ampliaron su ganancia territorial",
  "El ritmo de las operaciones ofensivas se redujo marginalmente",
  "Los elementos de la coalición reforzaron su línea de suministros",
  "La propaganda estatal intensificó su narrativa de movilización",
  "Los ataques de largo alcance contra la retaguardia se duplicaron",
  "La actividad diplomática sugiere una apertura de negociación limitada",
  "La aviación táctica incrementó sus salidas sobre el corredor central",
  "Los drones de ataque alcanzaron infraestructura energética crítica",
];

const CUERPOS = [
  "en el eje principal tras 48 horas de bombardeo preparatorio sostenido, aunque los analistas advierten que la profundidad de la penetración sigue siendo táctica y no operativa.",
  "respecto al ciclo de 72 horas previo. La reducción es coherente con la rotación de unidades mecanizadas observada en imágenes satelitales del 14 al 18 del mes en curso.",
  "con convoyes confirmados por tres fuentes independientes. El movimiento sugiere preparación para una fase de contención más que para una nueva ofensiva.",
  "con enfoque en la moral de la retaguardia y en la legitimidad del mando militar, un patrón que históricamente antecede decisiones de escalada limitada.",
  "contra depósitos, nodos ferroviarios y estaciones de radar, en un patrón destinado a degradar la logística de refuerzo antes del cambio de estación.",
  "basada en canales de intermediarios. La ventana diplomática sigue siendo estrecha y condicionada a hechos en el terreno, no a declaraciones.",
  "con escolta de guerra electrónica, señal de que la supresión de defensas aéreas enemigas se ha vuelto prioridad del ciclo aéreo.",
  "en un radio de 120 km de la línea de contacto, la mayor concentración semanal desde el inicio de la campaña de invernada.",
];

const LINEAS_UCRANIA = [
  "Las fuerzas rusas continuaron sus operaciones ofensivas a lo largo del eje Kupiansk-Svatove-Kreminna y avanzaron posicionalmente en el área de Bilohorivka.",
  "Las fuerzas ucranianas ejecutaron golpes de precisión contra un almacén de municiones ruso en la zona de Tokmak; geolocalización confirmada por imaginería térmica.",
  "Las fuerzas rusas llevaron a cabo una serie de ataques con drones Shahed sobre infraestructura portuaria en Odesa; las defensas aéreas declararon 21 de 26 interceptados.",
  "La prensa milblogger rusa continuó quejándose de la falta de apoyo de artillería en el flanco sur de Bakhmut, lo que sugiere fricciones entre mandos de la 3.ª división.",
  "Se registró un incremento de actividad del grupo GUP CAS (mandos de drones) en la dirección de Zaporizhzhia, con patrón de reconocimiento-pasadas nocturnas.",
];

const LINEAS_ORIENTE_MEDIO = [
  "La coalición marítima reportó el séptimo incidente del mes en el corredor del Mar Rojo; el tráfico comercial por Bab el-Mandeb cayó un 12 % intersemanal.",
  "Irán continuó sus maniobras navales anuales en el estrecho de Ormuz con lanzamientos de misiles de crucero desde la costa de Bandar Abbas.",
  "Los intercambios de fuego transfronterizos entre la Línea Azul se mantuvieron por debajo del umbral de escalada según indicadores de Vanguard.",
  "El grupo hutí reivindicó un ataque con dron naval contra un mercante con bandera de Liberia; el buque continuó su ruta con daños menores.",
];

const LINEAS_INDO = [
  "La Fuerza de Autodefensa y la Marina Popular realizaron ejercicios simultáneos en el estrecho de Taiwán; el CRÍTICO de tensión regional se mantiene en 68.",
  "Filipinas y China volvieron a confrontar en el banco de Scarborough con cañones de agua contra botes de suministro; hay imaginería de la guardia costera.",
  "El patrón de patrullas aéreas de largo alcance sobre el Mar de China Meridional se mantuvo 14 % por encima de la media de los últimos 90 días.",
  "La patrulla de la flota del Norte rusa cruzó el canal de Tsushima rumbo a ejercicios conjuntos planificados en el Pacífico.",
];

const LINEAS_AFRICA = [
  "El Frente de la RSF avanzó sobre el tercer mayor mercado de granos del estado de Al Jazirah, agravando la crisis alimentaria estructural.",
  "Africa Corps continuó el despliegue rotado en el triángulo de frontiera entre Malí, Burkina y Níger, con confir­mación satelital de dos bases operativas nuevas.",
  "La violencia contra civiles en el este del Congo aumentó por cuarta semana consecutiva según el registro de incidentes de Vanguard.",
];

const LINEAS_CIBER = [
  "Un ataque de denegación de servicio distribuido contra el sistema de tránsito ferroviario del Báltico fue atribuido a la infraestructura SAME-7 por tres analistas independientes.",
  "El jamming de GPS en el espacio aéreo del Báltico alcanzó su sexto pico mensual; las tripulaciones civiles reportaron degradación de navegación en 9 % de los vuelos.",
  "Ciberactividad hostil dirigida a operadores energéticos europeos se duplicó en la ventana de 48 horas, en línea con el índice Centinela de Ciberespacio.",
];

const TERRENO = [
  "Las fuerzas rusas hicieron ganancias confirmadas cerca de (nombre del asentamiento) dentro del marco de las operaciones ofensivas continuas.",
  "La línea del frente se mantuvo esencialmente sin cambios en este teatro durante la ventana de evaluación de 24 horas.",
  "Los elementos de la coalición recuperaron posiciones elevadas con valor de observación artillera sobre el corredor logístico.",
  "Las condiciones meteorológicas limitaron el empleo de aviación y los avances posicionales se redujeron a fracciones de kilómetro.",
];

export function generarEvaluacion(fechaISO: string, tensionViva?: number): EvaluacionDiaria {
  const seed = hash("eval89:" + fechaISO);
  const tension = tensionViva ?? getTension();

  // fecha base para número de evaluación (contador desde el 1 de enero 2026)
  const base = new Date(fechaISO + "T12:00:00Z").getTime();
  const numero = Math.max(1, Math.floor((base - Date.UTC(2026, 0, 1)) / 86400000));

  const hallazgos: HallazgoClave[] = [];
  const usados = new Set<number>();
  for (let i = 0; i < 4; i++) {
    let idx = hash(fechaISO + "h" + i) % LEADS.length;
    let guard = 0;
    while (usados.has(idx) && guard < 8) {
      idx = (idx + 1) % LEADS.length;
      guard++;
    }
    usados.add(idx);
    const verbo = pick(CUERPOS, seed, i * 3 + 1);
    hallazgos.push({ titulo: LEADS[idx], cuerpo: verbo });
  }

  const marcar = (lineas: string[], n: number, sal: number) => {
    const out: string[] = [];
    for (let i = 0; i < n; i++) {
      out.push(lineas[(seed >>> (sal + i * 5)) % lineas.length]);
    }
    return [...new Set(out)];
  };

  const teatros: EvaluacionTeatro[] = [
    {
      nombre: "Ofensiva del Este — Frente Oriental",
      lineas: marcar(LINEAS_UCRANIA, 3, 2),
      terreno: TERRENO[seed % 4],
    },
    {
      nombre: "Medio Oriente y Corredores Marítimos",
      lineas: marcar(LINEAS_ORIENTE_MEDIO, 2, 7),
      terreno: TERRENO[(seed >> 3) % 4],
    },
    {
      nombre: "Indo-Pacífico",
      lineas: marcar(LINEAS_INDO, 2, 11),
      terreno: TERRENO[(seed >> 6) % 4],
    },
    {
      nombre: "África — Sahel y Cuerno",
      lineas: marcar(LINEAS_AFRICA, 2, 15),
      terreno: TERRENO[(seed >> 9) % 4],
    },
    {
      nombre: "Ciberespacio y Guerra Electrónica",
      lineas: marcar(LINEAS_CIBER, 2, 19),
      terreno: tension > 70 ? "El ciberespacio opera bajo el segundo nivel más alto de agresión desde el inicio del registro." : TERRENO[(seed >> 12) % 4],
    },
  ];

  return {
    fecha: fechaISO,
    numero,
    hallazgos,
    teatros,
    notaMetodo:
      "Vanguard evalúa el estado de la guerra con fuentes abiertas verificadas por la Mesa OSINT. Controlamos la información que seguimos y ponemos en duda lo que no podemos confirmar de forma independiente. Este espejo reproduce la metodología de los grandes institutos: hechos primero, interpretación después, incertidumbre declarada siempre.",
  };
}

export function ultimasFechas(n: number): string[] {
  const out: string[] = [];
  const hoy = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(hoy.getTime() - i * 86400000);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export function fechaLarga(fechaISO: string): string {
  const d = new Date(fechaISO + "T12:00:00Z");
  return d.toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}
