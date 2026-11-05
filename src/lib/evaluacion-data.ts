// v89.0 OPERACIÓN ESPEJO — MOTOR DE EVALUACIÓN DE CAMPAÑA (espejo del instituto
// de estudios de guerra más citado del planeta). Cada día produce una evaluación
// DETERMINISTA (misma fecha → mismo texto en cualquier dispositivo) con la
// estructura icónica: hallazgos clave numerados, secciones por teatro y
// evaluación del terreno controlado.
// v318.0 EL INFORME QUE RESPIRA — el instituto se dobla (16 hallazgos/cuerpos,
// teatros doblados y un 6.º teatro: Ártico y el Gran Norte) y el informe
// respira: el giro del día marca 3 de 6 teatros EN PROFUNDIDAD y el resto
// queda EN CORTO. El anillo avanza UNA muesca por informe (el número de
// evaluación es el giro): el plato entero jamás se repite dos días seguidos.
// La rotación por envoltura es LA MISMA ley del anillo de la escuela
// (girar, exportada desde estrategia-data): un patrón del ecosistema, cero copias.

import { getTension } from "./tension";
import { girar } from "./estrategia-data";

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
  profundidad: boolean; // v318: el giro del día marca los teatros que van en profundidad
}

export interface EvaluacionDiaria {
  fecha: string; // ISO
  numero: number; // número de evaluación
  hallazgos: HallazgoClave[];
  teatros: EvaluacionTeatro[];
  notaMetodo: string;
  notaGiro: string; // v318: la ley del giro del día, declarada en el propio informe
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
  // v318: el pool de hallazgos se dobla — 16 leads para que el giro diario
  // traiga una ventana distinta de la guerra cada día
  "La rotación de unidades de primera línea se aceleró en el eje norte",
  "Las defensas antiaéreas declararon una tasa récord de intercepción frente a drones",
  "El contrabando de componentes de doble uso a través de terceros países aumentó",
  "La movilización encubierta se detectó en tres provincias del interior",
  "Las primas de seguro marítimo en la zona de conflicto marcaron máximo semanal",
  "Un cese el fuego de 72 horas se sostuvo con violaciones menores documentadas",
  "La producción de artillería del bando atacante parece haberse estabilizado",
  "El flujo de combatientes extranjeros hacia el teatro principal disminuyó",
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
  // v318: los cuerpos se doblan a la par del pool de leads
  "según registros ferroviarios y de satélite comercial. El patrón coincide con preparativos de relevo masivo antes del deshielo, no con una retirada.",
  "frente a enjambres de larga autonomía. Las tripulaciones reportan nuevas tácticas de lanzamiento en racimo desde plataformas civiles modificadas.",
  "por rutas de terceros países con documentación de origen falsificada. La red opera al menos desde dos puertos de bandera de conveniencia.",
  "según el cruce de manifiestos y de imaginería comercial. Los reclutas aparecen con uniformes sin insignia y exenciones médicas recién emitidas.",
  "para el tránsito por el corredor de riesgo, un 34 % por encima de la media trimestral. Los armadores desvían rutas hacia pasajes con escolta conjunta.",
  "monitoreadas por la misión de observación. Las dos partes usan la pausa para cavar líneas nuevas; los analistas no lo leen como preludio de negociación amplia.",
  "tras una caída sostenida de seis meses. La recuperación se explica por turnos triples en dos complejos industriales identificados por imaginería térmica nocturna.",
  "según fuentes de servicio y registros de visados. Los contratos privados se concentran ahora en protección de infraestructura, no en la línea de frente.",
];

const LINEAS_UCRANIA = [
  "Las fuerzas rusas continuaron sus operaciones ofensivas a lo largo del eje Kupiansk-Svatove-Kreminna y avanzaron posicionalmente en el área de Bilohorivka.",
  "Las fuerzas ucranianas ejecutaron golpes de precisión contra un almacén de municiones ruso en la zona de Tokmak; geolocalización confirmada por imaginería térmica.",
  "Las fuerzas rusas llevaron a cabo una serie de ataques con drones Shahed sobre infraestructura portuaria en Odesa; las defensas aéreas declararon 21 de 26 interceptados.",
  "La prensa milblogger rusa continuó quejándose de la falta de apoyo de artillería en el flanco sur de Bakhmut, lo que sugiere fricciones entre mandos de la 3.ª división.",
  "Se registró un incremento de actividad del grupo GUP CAS (mandos de drones) en la dirección de Zaporizhzhia, con patrón de reconocimiento-pasadas nocturnas.",
  // v318: el frente oriental se dobla a la par del giro
  "Las fuerzas ucranianas ampliaron la campaña de minas navales en el noroeste del mar interior; dos canales de navegación quedaron cerrados al tránsito nocturno.",
  "Las fuerzas rusas desplegaron señuelos térmicos decimétricos en el eje sur, duplicando el gasto de misiles de precisión contrarios contra blancos falsos según la Mesa OSINT.",
  "Los ataques de saturación con drones contra la capital se concentraron entre la 1 y las 4 de la hora local, un patrón destinado a desgastar los relevos de las baterías de intercepción.",
  "La prensa milblogger ucraniana discute públicamente la rotación de mandos de brigada en el flanco este, señal de fricción institucional tras el ciclo invernal.",
  "Se confirmó el tránsito de un convoy ferroviario de municiones de largo alcance hacia la frontera oriental; la plataforma documentada coincide con la catalogada el mes pasado.",
];

const LINEAS_ORIENTE_MEDIO = [
  "La coalición marítima reportó el séptimo incidente del mes en el corredor del Mar Rojo; el tráfico comercial por Bab el-Mandeb cayó un 12 % intersemanal.",
  "Irán continuó sus maniobras navales anuales en el estrecho de Ormuz con lanzamientos de misiles de crucero desde la costa de Bandar Abbas.",
  "Los intercambios de fuego transfronterizos entre la Línea Azul se mantuvieron por debajo del umbral de escalada según indicadores de Vanguard.",
  "El grupo hutí reivindicó un ataque con dron naval contra un mercante con bandera de Liberia; el buque continuó su ruta con daños menores.",
  // v318: el corredor marítimo se dobla a la par del giro
  "El intercambio indirecto de fuego entre milicias aliadas y posiciones de la coalición se intensificó en el norte del teatro; los indicadores de Vanguard lo sitúan en el nivel más alto desde la tregua de primavera.",
  "Un portaviones de la coalición completó su relevo programado; la ventana de doble agrupación duró 96 horas y coincidió con ejercicios de intercepción integrada.",
  "El flujo de motores de drones hacia el enclave costero duplicó el estimado del trimestre anterior según la patrulla conjunta; el embargo informal se relaja de forma intermitente.",
  "La devaluación escalonada de la moneda local presionó el presupuesto de importaciones militares; el subsidio de combustible se recortó un 15 % en la semana.",
];

const LINEAS_INDO = [
  "La Fuerza de Autodefensa y la Marina Popular realizaron ejercicios simultáneos en el estrecho de Taiwán; el CRÍTICO de tensión regional se mantiene en 68.",
  "Filipinas y China volvieron a confrontar en el banco de Scarborough con cañones de agua contra botes de suministro; hay imaginería de la guardia costera.",
  "El patrón de patrullas aéreas de largo alcance sobre el Mar de China Meridional se mantuvo 14 % por encima de la media de los últimos 90 días.",
  "La patrulla de la flota del Norte rusa cruzó el canal de Tsushima rumbo a ejercicios conjuntos planificados en el Pacífico.",
  // v318: el Indo-Pacífico se dobla a la par del giro
  "La construcción de un nuevo muelle de doble uso en el arrecife disputado avanzó dos tramos según imaginería comercial; las estructuras sombreadas coinciden con hangares de drones.",
  "La flotilla de pesca civil operando como milicia marítima se concentró por sexta semana frente al cabo oriental; el patrón antecede en tres de cuatro casos a ejercicios de bloqueo.",
  "El estado mayor del norte anunció lanzamientos de prueba de un nuevo misil balístico lanzado desde el mar con video parcial; la Mesa OSINT verificó el cañón de agua caliente pero no el alcance declarado.",
  "El pacto de defensa trilateral amplió su ejercicio anual con dos buques de proyección anfibia y aterrizaje conjunto en islas disputadas; primera participación de un portaviones extranjero.",
];

const LINEAS_AFRICA = [
  "El Frente de la RSF avanzó sobre el tercer mayor mercado de granos del estado de Al Jazirah, agravando la crisis alimentaria estructural.",
  "Africa Corps continuó el despliegue rotado en el triángulo de frontiera entre Malí, Burkina y Níger, con confir­mación satelital de dos bases operativas nuevas.",
  "La violencia contra civiles en el este del Congo aumentó por cuarta semana consecutiva según el registro de incidentes de Vanguard.",
  // v318: el Sahel y el Cuerno se doblan a la par del giro
  "El acuerdo de seguridad regional incorporó instructores adicionales y un componente aéreo de drones de vigilancia; las primeras salidas se registraron sobre el corredor fronterizo.",
  "La junta local expulsó a la misión de observadores internacionales; los informes de abusos quedarán sin verificación independiente por primera vez en cinco años.",
  "Los combates por la segunda ciudad del norte desplazaron a 80.000 civiles según el registro de incidentes; los mercados de granos cerraron por cuarta jornada.",
  "Una ofensiva coordinada de tres frentes rebeldes amenaza la capital regional; el gobierno pidió asistencia aérea urgente a sus dos socios principales.",
];

const LINEAS_CIBER = [
  "Un ataque de denegación de servicio distribuido contra el sistema de tránsito ferroviario del Báltico fue atribuido a la infraestructura SAME-7 por tres analistas independientes.",
  "El jamming de GPS en el espacio aéreo del Báltico alcanzó su sexto pico mensual; las tripulaciones civiles reportaron degradación de navegación en 9 % de los vuelos.",
  "Ciberactividad hostil dirigida a operadores energéticos europeos se duplicó en la ventana de 48 horas, en línea con el índice Centinela de Ciberespacio.",
  // v318: el ciberespacio se dobla a la par del giro
  "Un malware de borrado dirigido a operadores logísticos del teatro oriental fue atribuido por dos fabricantes al mismo clúster del apagón ferroviario del trimestre pasado.",
  "El registro de dominios falsificados de agencias de reclutamiento creció un 210 % intermensual, campaña de robo de identidad dirigida a personal militar en activo.",
  "La interferencia intencional contra sistemas de navegación civil se extendió del espacio aéreo al corredor marítimo; 14 aeronaves reportaron pérdida de GPS en una sola jornada.",
  "Una filtración de planos de instalaciones defensivas circula en foros de contratación; la Mesa OSINT verificó dos documentos como auténticos y tres como mezcla.",
];

// v318: EL SEXTO TEATRO — Ártico y el Gran Norte. La militarización del
// ártico, la ruta del nordeste y las reclamaciones de plataforma continental
// son teatro diario en el espejo del instituto: el informe ya no deja fuera
// el cuarto de mapa más frío.
const LINEAS_ARTICO = [
  "La reapertura de la base aérea del ártico oriental fue confirmada por imaginería comercial: 14 cazas desplegados y dos radares de alerta temprana activos por primera vez desde la guerra fría según evaluación de la Mesa.",
  "El convoy de escolta combinado cruzó la ruta del nordeste con dos rompehielos civiles; la temporada de navegación comercial se adelantó tres semanas por el mínimo histórico de hielo.",
  "La patrulla conjunta de submarinos reportó el paso de un buque de misiles de crucero por el estrecho ártico occidental; el tránsito coincide con el ejercicio anual de la flota del norte.",
  "Las reclamaciones de plataforma continental ampliada en el polo sumaron tres presentaciones nuevas ante el organismo de la ONU; la disputa por la cresta de Lomonosov sigue sin arbitraje.",
  "El cable de fibra entre dos aliados árticos quedó cortado por segunda vez en el trimestre; la reparación tardará tres semanas y la investigación apunta a anclas de arrastre sospechosas.",
  "La ciudad-militar del ártico alcanzó su fase final con capacidad para 4.500 efectivos según imaginería de la Mesa; los almacenes de combustible duplicaron su huella desde el invierno.",
];

const TERRENO = [
  "Las fuerzas rusas hicieron ganancias confirmadas cerca de (nombre del asentamiento) dentro del marco de las operaciones ofensivas continuas.",
  "La línea del frente se mantuvo esencialmente sin cambios en este teatro durante la ventana de evaluación de 24 horas.",
  "Los elementos de la coalición recuperaron posiciones elevadas con valor de observación artillera sobre el corredor logístico.",
  "Las condiciones meteorológicas limitaron el empleo de aviación y los avances posicionales se redujeron a fracciones de kilómetro.",
  // v318: la lectura del terreno se dobla a la par del giro
  "Los indicadores de artillería muestran una ventaja de 4:1 en el eje central; el asentamiento clave cambió de manos dos veces en la semana y ambas partes reclaman control parcial.",
  "La ofensiva local ganó entre 300 y 900 metros de profundidad táctica según el cruce de geolocalizaciones; la consolidación sigue sin confirmarse.",
  "Los elementos defensores volaron dos puentes de su propia retaguardia durante la retirada, señal de repliegue planeado y no de colapso.",
  "El frente permanece congelado en este teatro pero la actividad logística nocturna se triplicó, indicador clásico de preparación de ruptura.",
];

// v318: LOS SEIS TEATROS DEL INFORME — configuración del anillo: nombre,
// pool de líneas, sal de selección y sal de terreno para el giro diario.
const TEATROS_BASE: { nombre: string; lineas: string[]; sal: number; salTerreno: number }[] = [
  { nombre: "Ofensiva del Este — Frente Oriental", lineas: LINEAS_UCRANIA, sal: 2, salTerreno: 0 },
  { nombre: "Medio Oriente y Corredores Marítimos", lineas: LINEAS_ORIENTE_MEDIO, sal: 7, salTerreno: 3 },
  { nombre: "Indo-Pacífico", lineas: LINEAS_INDO, sal: 11, salTerreno: 6 },
  { nombre: "Ártico y el Gran Norte", lineas: LINEAS_ARTICO, sal: 13, salTerreno: 9 },
  { nombre: "África — Sahel y Cuerno", lineas: LINEAS_AFRICA, sal: 15, salTerreno: 12 },
  { nombre: "Ciberespacio y Guerra Electrónica", lineas: LINEAS_CIBER, sal: 19, salTerreno: 15 },
];

const EN_PROFUNDIDAD = 3; // teatros que el giro del día marca en profundidad

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

  // v318: EL GIRO DEL DÍA — el anillo de teatros avanza UNA muesca por
  // informe (el número de evaluación es el giro): 3 de 6 van EN PROFUNDIDAD
  // y el resto queda EN CORTO. Dos días consecutivos jamás comparten el
  // plato entero: el anillo no puede estar dos veces en la misma muesca.
  const giro = numero % TEATROS_BASE.length;
  const foco = new Set(girar(TEATROS_BASE.map((_, i) => i), EN_PROFUNDIDAD, giro));

  const teatros: EvaluacionTeatro[] = TEATROS_BASE.map((cfg, i) => {
    const enFoco = foco.has(i);
    return {
      nombre: cfg.nombre,
      lineas: enFoco ? marcar(cfg.lineas, 3, cfg.sal) : marcar(cfg.lineas, 1, cfg.sal + 2),
      terreno: cfg.nombre === "Ciberespacio y Guerra Electrónica" && tension > 70
        ? "El ciberespacio opera bajo el segundo nivel más alto de agresión desde el inicio del registro."
        : TERRENO[(seed >>> cfg.salTerreno) % TERRENO.length],
      profundidad: enFoco,
    };
  });

  return {
    fecha: fechaISO,
    numero,
    hallazgos,
    teatros,
    notaMetodo:
      "Vanguard evalúa el estado de la guerra con fuentes abiertas verificadas por la Mesa OSINT. Controlamos la información que seguimos y ponemos en duda lo que no podemos confirmar de forma independiente. Este espejo reproduce la metodología de los grandes institutos: hechos primero, interpretación después, incertidumbre declarada siempre.",
    notaGiro:
      "El giro del día marca tres teatros en profundidad y deja el resto en corto; el anillo de teatros avanza una muesca por informe, de modo que el plato entero nunca se repite dos días seguidos.",
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
