// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · ENTREGABLE 9 — BIBLIOTECA DE EDUCACIÓN SOBRE RIESGOS
//
// Doce lecciones de fondo. No son consejos: son las ideas que cambian cómo se
// mira un mapa de inundación, una alarma o un presupuesto municipal. Cada una
// con su procedencia y con lo que permite decidir.
// ═══════════════════════════════════════════════════════════════════

export interface Leccion {
  id: string;
  titulo: string;
  /** el núcleo, en dos o tres frases */
  idea: string;
  /** las claves que hay que quedarse */
  claves: string[];
  /** para qué sirve saberlo */
  sirve: string;
  nivel: "inicial" | "media" | "avanzada";
  fuente: string;
  /** enlaces internos reales del centro */
  ver: { ruta: string; etiqueta: string }[];
}

export const LECCIONES: Leccion[] = [
  {
    id: "riesgo-se-construye",
    titulo: "El riesgo se construye, no se hereda del cielo",
    idea:
      "Un peligro natural no es un desastre. El desastre es el resultado de decisiones humanas: dónde se construyó, con qué norma, con qué drenaje, con qué aviso y con cuánta desigualdad. Lo que se decide se puede volver a decidir.",
    claves: [
      "Riesgo = amenaza × exposición × vulnerabilidad ÷ capacidad.",
      "El peligro no cambia de sitio; la ciudad cambia alrededor del peligro.",
      "La mayor parte del riesgo futuro se está creando hoy con licencias, suelo y mantenimiento.",
    ],
    sirve: "Para dejar de preguntar «¿cuándo pasará?» y empezar a preguntar «¿por qué aquí duele tanto?».",
    nivel: "inicial",
    fuente: "UNDRR · Marco de Sendai 2015-2030 · IFRC · riesgo comunitario",
    ver: [
      { ruta: "/resiliencia/peligros", etiqueta: "Fichas de peligros" },
      { ruta: "/resiliencia/prevencion", etiqueta: "Prevención por ámbito" },
    ],
  },
  {
    id: "curva-dano",
    titulo: "La curva de daño: por qué el tamaño del evento no lo es todo",
    idea:
      "El daño crece mucho más rápido que la magnitud. Un evento de periodo de retorno mayor no causa un daño proporcional: causa un daño desproporcionado, porque la exposición y la vulnerabilidad ya estaban esperando.",
    claves: [
      "Duplicar la magnitud casi nunca duplica el daño: lo multiplica.",
      "La mayoría de pérdidas acumuladas de una década vienen de eventos medios, no de la gran catástrofe.",
      "Por eso el seguro y la prevención «de lo pequeño» rinden: cubren la parte frecuente.",
    ],
    sirve: "Para dimensionar el miedo (no negarlo) y para priorizar inversiones que protegen contra lo frecuente, no solo contra lo épico.",
    nivel: "media",
    fuente: "UNDRR · conocimiento del riesgo · FEMA · modelado de riesgo",
    ver: [{ ruta: "/resiliencia/peligros", etiqueta: "Cómo se mide cada peligro" }],
  },
  {
    id: "periodo-retorno",
    titulo: "«Inundación de 100 años» no significa lo que la gente cree",
    idea:
      "Es un lenguaje estadístico, no un calendario. Significa que en un año cualquiera hay una probabilidad de alrededor del 1 %; la probabilidad no tiene memoria, así que puede repetirse al año siguiente.",
    claves: [
      "Periodo de retorno 100 años ≈ 1 % de probabilidad anual (no «una vez cada siglo»).",
      "Con un 1 % anual, en 30 años la probabilidad de vivir al menos un evento así pasa del 25 %.",
      "Los mapas oficiales usan estas curvas para fijar restricciones de uso del suelo.",
    ],
    sirve: "Para no comprar ni alquilar con la idea equivocada de que «ya pasó en el 98, no toca».",
    nivel: "media",
    fuente: "FEMA/NOAA · mapas de inundación y riesgo · UNDRR · métricas de riesgo",
    ver: [{ ruta: "/resiliencia/glosario", etiqueta: "Glosario" }],
  },
  {
    id: "alerta-4-patas",
    titulo: "Una alerta temprana son cuatro sistemas, no una sirena",
    idea:
      "El modelo internacional de alerta temprana multi-riesgo tiene cuatro elementos que fallan por separado: conocer el riesgo, vigilar y avisar, difundir y comunicar, y tener capacidad de responder. La sirena es el segundo; la respuesta es el cuarto y el que casi nunca se financia.",
    claves: [
      "Un aviso perfecto que no se entiende o no se cree no mueve a nadie.",
      "La última milla es social: quién avisa a quien no tiene móvil, quién ayuda al vecino.",
      "La confianza se construye antes: las comunidades que participaron en el diseño del sistema le hacen caso.",
    ],
    sirve: "Para exigir y para diseñar, en tu municipio, un sistema que incluya la última pierna.",
    nivel: "media",
    fuente: "UNDRR/OMM · sistemas de alerta temprana multi-riesgo · iniciativa «Alertas para todos»",
    ver: [{ ruta: "/resiliencia/proteccion-civil", etiqueta: "Protección civil" }],
  },
  {
    id: "comunicacion-riesgo",
    titulo: "Comunicar riesgo es construir confianza, no emitir notas",
    idea:
      "La OMS define la comunicación de riesgos como la interacción en tiempo real de información y opinión entre personas y grupos, antes, durante y después de un suceso. Quien comunica bien escucha primero, admite la incertidumbre y dice qué puede hacer la audiencia.",
    claves: [
      "Responde a las tres preguntas que la gente tiene: ¿qué es?, ¿me afecta?, ¿qué hago?",
      "Decir «no lo sabemos todavía» es mejor que un dato que después hay que corregir tres veces.",
      "El mensaje sin acción asociada produce ansiedad; la acción produce adhesión.",
    ],
    sirve: "Para quien escribe el comunicado del municipio, de la escuela o de la comunidad de vecinos, y para quien lo lee.",
    nivel: "avanzada",
    fuente: "OMS · «Risk communication» · CDC · crisis y emergencias",
    ver: [{ ruta: "/resiliencia/comunicacion", etiqueta: "Comunicación comunitaria" }],
  },
  {
    id: "infodemia",
    titulo: "Infodemia: la información también es un vector",
    idea:
      "En un desastre circula a la vez información útil, rumor, desinformación intencionada y contenido antiguo reenviado como nuevo. El daño no es solo confusión: es gente que evacúa tarde, se mete en la zona de riesgo o agrede a un vecino por un bulo.",
    claves: [
      "Tres comprobaciones baratas: quién lo firma, cuándo se publicó, y si la imagen es de aquí y de hoy.",
      "La corrección debe ser más rápida y más visible que el bulo, y tiene que la misma audiencia, no otra.",
      "Quien difunde con buena intención pero sin verificar también contamina el canal; la regla de la comunidad vale más que la buena fe.",
    ],
    sirve: "Para el grupo de WhatsApp del barrio y para la rueda de prensa: el mismo método.",
    nivel: "media",
    fuente: "OMS · gestión de la infodemia · IFRC · verificación en emergencias",
    ver: [{ ruta: "/resiliencia/comunicacion", etiqueta: "Reglas contra el bulo" }],
  },
  {
    id: "vulnerabilidad",
    titulo: "Vulnerabilidad: por qué el mismo terremoto mata distinto",
    idea:
      "La vulnerabilidad tiene tres capas: la física (materialidad y estado de la vivienda), la social (edad, salud, ingreso, red, idioma, situación legal) y la económica (ahorro, seguro, margen para parar). Se superponen en el mismo cuerpo.",
    claves: [
      "Un barrio con casas viejas, gente mayor, alquiler informal y sin seguro no es «pobre»: es de alto riesgo.",
      "La exposición de la mujer al trabajo de cuidados en una emergencia es medible: más agua, más niños, menos horas de trabajo.",
      "La reducción de la vulnerabilidad es política pública: código de edificación, inspección, sanidad, ingresos.",
    ],
    sirve: "Para leer cualquier mapa de riesgo con la pregunta correcta: ¿quién vive aquí?",
    nivel: "media",
    fuente: "UNDRR · riesgo y desarrollo · IFRC · vulnerabilidad y capacidad",
    ver: [{ ruta: "/resiliencia/accesibilidad", etiqueta: "Accesibilidad" }],
  },
  {
    id: "capacidad-comunitaria",
    titulo: "Capacidad comunitaria: lo que ya tienes antes de que llegue la ayuda",
    idea:
      "Las comunidades no son receptoras pasivas de ayuda: tienen recursos materiales, organizativos y de conocimiento que deciden el resultado en las primeras horas. El método VCA de la Cruz Roja consiste en hacerlos visibles y convertirlos en un plan.",
    claves: [
      "Inventario: qué hay (agua, herramientas, vehículos, sala grande, generador, farmacia, cocinas) y quién sabe hacerlo.",
      "Organización: quién es la persona de referencia de cada calle y quién no está en temporada dura.",
      "Conocimiento local: por dónde subió el agua, qué calle se inunda primero, qué casa tiene grieta desde hace años.",
    ],
    sirve: "Para la primera reunión del barrio: dos horas de recorrido y sale un plano de capacidad que ningún consultor hace.",
    nivel: "inicial",
    fuente: "IFRC · Vulnerability and Capacity Assessment (VCA) · Cruz Roja · preparación comunitaria",
    ver: [{ ruta: "/resiliencia/listas", etiqueta: "Lista de barrio" }],
  },
  {
    id: "resiliencia-definicion",
    titulo: "Resiliencia: no es aguantar, es recuperarse aprendiendo",
    idea:
      "La definición de referencia (Sendai) habla de resistir, absorber, adaptar y recuperarse de forma oportuna y eficiente, preservando lo esencial: la vida, la salud, los medios de vida, los bienes, el funcionamiento social y ambiental, y la transformación cuando hace falta.",
    claves: [
      "Absorber, adaptar y transformar: tres respuestas distintas; la tercera es la que cambia el riesgo.",
      "La resiliencia no es individual: un vecino heroico no sustituye a un sistema que funciona.",
      "Puede medirse con criterios (los diez esenciales de «Ciudades resilientes»), y lo que se mide se presupuesta.",
    ],
    sirve: "Para entender por qué este centro no se llama «centro del apocalipsis».",
    nivel: "inicial",
    fuente: "UNDRR · Marco de Sendai · campaña «Making Cities Resilient 2030»",
    ver: [{ ruta: "/resiliencia/evaluacion", etiqueta: "Evalúa tu comunidad" }],
  },
  {
    id: "sendai",
    titulo: "El Marco de Sendai: cuatro prioridades y una idea",
    idea:
      "Sendai 2015-2030 es el acuerdo mundial sobre reducción del riesgo de desastres. Cuatro prioridades: entender el riesgo, fortalecer la gobernanza, invertir en reducción del riesgo, y «reconstruir mejor» en la recuperación. Con siete metas mundiales y foco en evitar el riesgo nuevo.",
    claves: [
      "Cambia el centro de gravedad: menos «responder mejor a la catástrofe», más «no fabricar la catástrofe».",
      "Obliga a los países a reportar avance con indicadores comunes: se puede exigir y comparar.",
      "Nombró los objetivos temáticos (vivienda, escuela, salud, agua, química…) para bajar el marco a la obra concreta.",
    ],
    sirve: "Para leer el plan de tu país con criterio y saber qué se le puede reclamar a la administración.",
    nivel: "avanzada",
    fuente: "UNDRR · sendai framework monitoring (informe mundial de reducción del riesgo)",
    ver: [{ ruta: "/resiliencia/biblioteca", etiqueta: "Glosario y conceptos" }],
  },
  {
    id: "pap",
    titulo: "Primeros auxilios psicológicos: mirar, escuchar, ayudar",
    idea:
      "Es el apoyo humanitario temprano a quien está en crisis tras un suceso grave. No es psicoterapia, no obliga a nadie a contar lo que pasó y no consiste en predecir quién «acabará mal»: consiste en cubrir necesidades básicas, calmar, conectar con la gente y pasar información útil.",
    claves: [
      "MIRAR: seguridad, necesidades urgentes, personas en angustia grave.",
      "ESCUCHAR: acercarse, preguntar por la necesidad, escuchar y ayudar a calmarse sin presionar.",
      "AYUDAR: cubrir lo básico, conectar con familia y servicios, dar información realista sobre qué viene.",
      "Lo que NO se hace: hacer narrar los detalles, minimizar («ya pasó»), prometer lo que no depende de ti, o dejar sola a una persona en crisis.",
    ],
    sirve: "Para el minuto siguiente al susto, en el portal o en el albergue: lo hace cualquier persona con voluntad y método.",
    nivel: "inicial",
    fuente: "OMS · «Guide for field workers: Psychological first aid (PFA)» · IFRC · apoyo psicosocial",
    ver: [{ ruta: "/resiliencia/recuperacion", etiqueta: "Salud después del evento" }],
  },
  {
    id: "hospitales-seguros",
    titulo: "Hospitales y escuelas seguros: infraestructura crítica",
    idea:
      "Un centro de salud que se cae en un terremoto no deja de funcionar: se convierte en el problema. La PAHO impulsa el modelo de «hospitales seguros» —evaluar estructura, no estructural y funcionalidad— y la regla de que la seguridad de un edificio público es una obligación, no un certificado decorativo.",
    claves: [
      "Tres dimensiones: que la estructura aguante, que el contenido (equipos, gases, medicamentos) no mate, y que el servicio siga (energía, agua, acceso).",
      "El plan de emergencia interno y los simulacros son parte de la seguridad estructural.",
      "Escuelas, centros de salud y guarderías son los edificios en los que hay más gente que no eligió estar ahí.",
    ],
    sirve: "Para leer con otra mirada la obra del ambulatorio y el refuerzo del colegio.",
    nivel: "avanzada",
    fuente: "OPS/PAHO · modelo de hospitales seguros · UNICEF/GCDRR · escuelas seguras",
    ver: [{ ruta: "/resiliencia/listas", etiqueta: "Lista de escuela" }],
  },
];

/** Rutas de lectura: el itinerario según de dónde partas. */
export const RUTAS = [
  { nombre: "Nunca me he preparado", pasos: ["empieza por casa", "haz la mochila", "escribe el plan familiar", "ensaya un simulacro"] },
  { nombre: "Soy de un barrio o asociación", pasos: ["mapa de capacidad", "registro de apoyos", "red de comunicación", "simulacro medido"] },
  { nombre: "Trabajo con personas mayores o con discapacidad", pasos: ["barreras y adaptaciones", "mochila de necesidades de apoyo", "sistema de compañeros", "alerta accesible"] },
  { nombre: "Quiero entender el riesgo de mi país", pasos: ["fichas de peligros", "protección civil", "organismos oficiales", "datos vivos de la casa"] },
];
