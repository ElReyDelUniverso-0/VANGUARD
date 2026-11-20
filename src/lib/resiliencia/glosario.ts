// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · ENTREGABLE 14 — GLOSARIO DE PROTECCIÓN CIVIL
//
// Treinta y cuatro términos, definidos como los usan los organismos
// (UNDRR, OMS, IFRC, protección civil nacional) y traducidos a lenguaje de
// casa. La diferencia entre «amenaza» y «riesgo» es la línea que separa a
// quien se prepara de quien se asusta.
// ═══════════════════════════════════════════════════════════════════

export interface Termino {
  t: string;
  d: string;
  /** para qué le sirve saber esto, en una línea */
  u: string;
  /** familia temática, para agrupar */
  tema: string;
}

export const GLOSARIO: Termino[] = [
  { t: "Amenaza (peligro, hazard)", d: "Un fenómeno natural o inducido que puede causar daño: el terremoto, la ladera inestable, la lluvia torrencial, la planta química.", u: "Sin amenaza no hay riesgo; con amenaza y sin gente expuesta tampoco.", tema: "conceptos" },
  { t: "Exposición", d: "Quién y qué está donde ocurre la amenaza: viviendas, escuelas, hospitales, cultivos, redes.", u: "Es la palanca urbanística: mover la exposición es más barato que frenar la amenaza.", tema: "conceptos" },
  { t: "Vulnerabilidad", d: "Cuánto daño puede recibir lo expuesto, según su fragilidad y su capacidad de respuesta: construcción, edad, salud, pobreza, idioma, movilidad.", u: "Explica por qué un mismo sismo mata en un barrio y no en el de al lado.", tema: "conceptos" },
  { t: "Capacidad", d: "Los recursos y saberes con los que una persona, un barrio o un país puede anticipar, absorber y recuperarse: organización vecinal, agua de reserva, experiencia, ahorros, instituciones que funcionan.", u: "Sin capacidad, el riesgo se calcula mal: el mapa de lo que hay que hacer es tan importante como el de lo que puede pasar.", tema: "conceptos" },
  { t: "Riesgo", d: "La combinación de amenaza, exposición y vulnerabilidad, expresada en probabilidades de pérdida. No es un suceso: es una probabilidad.", u: "La fórmula que lo resume: riesgo = amenaza × exposición × vulnerabilidad ÷ capacidad.", tema: "conceptos" },
  { t: "Riesgo residual", d: "El riesgo que queda después de todas las medidas de reducción. Nunca es cero.", u: "Por eso existe la preparación: la parte que no pudiste eliminar hay que poder afrontarla.", tema: "conceptos" },
  { t: "Desastre", d: "Una grave alteración del funcionamiento de una comunidad que excede su capacidad de afrontamiento con sus propios recursos, y que requiere ayuda exterior.", u: "El desastre no lo hace la naturaleza sola: lo hace el encuentro entre una amenaza y una sociedad desprotegida.", tema: "conceptos" },
  { t: "Emergencia", d: "Situación que requiere respuesta inmediata y que la comunidad puede resolver con sus medios y los del entorno cercano.", u: "La diferencia con el desastre es la capacidad, no el tamaño de la lluvia.", tema: "conceptos" },
  { t: "Catástrofe", d: "Término legal en muchos países para designar la situación que excede ampliamente los medios locales y obliga a movilizar recursos de ámbito nacional o internacional.", u: "Si lo oyes en un boletín oficial, significa que hay líneas de financiación abiertas.", tema: "conceptos" },
  { t: "Resiliencia", d: "La capacidad de un sistema, comunidad o sociedad para resistir, absorber, adaptarse y recuperarse de un peligro en el tiempo y la forma que necesite, conservando lo esencial: la vida, la salud, los medios de vida y el funcionamiento.", u: "No es «aguantar» sino recuperarse con aprendizaje: el concepto que el Marco de Sendai puso en el centro.", tema: "conceptos" },
  { t: "Gestión del riesgo de desastres (GRD)", d: "El conjunto de políticas y prácticas para analizar y reducir el riesgo: prevención, mitigación, preparación, respuesta y recuperación.", u: "Si tu comunidad solo tiene «respuesta», no tiene gestión del riesgo: tiene bomberos.", tema: "conceptos" },
  { t: "Prevención / mitigación", d: "Prevención: evitar que aparezcan nuevos riesgos (no construir en el cauce). Mitigación: reducir los existentes (reforzar, drenar, asegurar muebles).", u: "Cada euro aquí ahorra varios en reconstrucción y muchos en vidas.", tema: "conceptos" },
  { t: "Preparación", d: "Lo que se hace ANTES para que la respuesta funcione: planes, alertas, materiales, entrenamientos, simulacros, seguros, reservas.", u: "Es lo que este centro intenta que hagas en una tarde.", tema: "conceptos" },
  { t: "Alerta temprana", d: "Sistema que detecta el peligro, lo evalúa, emite un aviso comprensible y activa una capacidad de respuesta. Cuatro elementos: conocimiento del riesgo, monitoreo y aviso, difusión y comunicación, y capacidad de respuesta.", u: "La alarma sin plan y sin confianza no salva: la cuarta pata es la que falta en casi todos los sitios.", tema: "alertas" },
  { t: "«Alertas para todos»", d: "Iniciativa de la ONU para que en 2027 toda persona del planeta esté cubierta por sistemas de alerta temprana frente a múltiples peligros, con los países más expuestos primero.", u: "Da el marco para exigir a tu municipio el aviso que aún no existe.", tema: "alertas" },
  { t: "Vigilancia vs. aviso", d: "Vigilancia («watch»): el fenómeno es posible, prepárate. Aviso («warning»): es inminente o está ocurriendo, actúa ya.", u: "En inglés se confunden, en los planes en español también: la conducta esperada es distinta.", tema: "alertas" },
  { t: "Confinamiento (shelter-in-place)", d: "Quedarse dentro de un edificio, con puertas y ventanas cerradas y sin ventilación exterior, porque fuera hay un peligro inmediato.", u: "Es lo contrario de evacuar: saber cuál te toca evita correr hacia el peligro.", tema: "alertas" },
  { t: "Simulacro", d: "Ejercicio entrenado de activación del plan de emergencia, total o parcial, medido en tiempo y en fallos.", u: "Dos simulacros al año valen más que un plan precinto.", tema: "respuesta" },
  { t: "Punto de encuentro", d: "Lugar abierto, alejado de fachadas, cables y vías, donde se reúne la gente tras evacuar y donde se hace el conteo.", u: "Su valor no es la comodidad: es que la cuenta de personas cuadre.", tema: "respuesta" },
  { t: "Ruta de evacuación", d: "Camino señalizado, despejado y practicable que lleva del edificio al punto de encuentro o fuera de la zona de riesgo.", u: "Debe tener alternativa: la ruta buena se corta justo con el segundo evento.", tema: "respuesta" },
  { t: "Refugio / albergue", d: "Espacio que ofrece protección inmediata (refugio, dentro de la zona) o alojamiento temporal fuera del riesgo (albergue), con agua, saneamiento, sueño y seguridad.", u: "Un albergue sin privacidad, sin accesos y sin admisión de animales produce personas que no evacúan.", tema: "respuesta" },
  { t: "Primeros auxilios psicológicos (PAP)", d: "Método de apoyo humanitario a personas en situación aguda: MIRAR (seguridad y necesidades), ESCUCHAR (acercarse, preguntar, escuchar sin presionar), AYUDAR (cubrir lo básico, conectar con apoyos, informar). No es una sesión de terapia ni se pide que nadie narre el trauma.", u: "Es la intervención que más se necesita y la que menos se enseña.", tema: "respuesta" },
  { t: "Comunicación de riesgos", d: "El proceso previo, durante y posterior de construir confianza y compartir información veraz, oportuna y comprensible con la población expuesta (OMS).", u: "Cuando la comunicación falla, la comunidad decide por su cuenta y se equivoca con la mejor intención.", tema: "respuesta" },
  { t: "Infodemia", d: "Exceso de información, cierta y falsa, que dificulta distinguir qué hacer durante una emergencia.", u: "No se combate solo con hechos: se combate con la confianza en la fuente y con velocidad.", tema: "respuesta" },
  { t: "Evaluación rápida de daños", d: "La primera valoración estructurada tras un evento: víctimas, viviendas, servicios, accesos, necesidades urgentes; base de toda ayuda.", u: "Si el barrio la hace con fotos, lista y fecha, la ayuda llega antes y mejor orientada.", tema: "recuperacion" },
  { t: "Reconstruir mejor (build back better)", d: "Principio de Sendai: en la reconstrucción, mejorar la prevención y la mitigación para que la misma amenaza no vuelva a producir el mismo daño.", u: "Es la diferencia entre volver al mismo riesgo y salir de él.", tema: "recuperacion" },
  { t: "Recuperación temprana", d: "La fase que conecta la emergencia con la reconstrucción: servicios básicos, alojamiento transitorio, salud, educación, empleo y medio de vida.", u: "El error clásico es cortar la respuesta el día 15 y no abrir la recuperación hasta el mes 6.", tema: "recuperacion" },
  { t: "Marco de Sendai 2015-2030", d: "El acuerdo internacional de referencia para la reducción del riesgo: cuatro prioridades (conocimiento del riesgo; gobernanza; invertir en reducción; «reconstruir mejor»), siete metas mundiales y foco en evitar que el riesgo nuevo se cree.", u: "Casi todo el vocabulario serio de este centro viene de aquí.", tema: "marco" },
  { t: "Ciudades resilientes (MCR2030)", d: "Campaña de la ONU para que los gobiernos locales adopten una estrategia de resiliencia con enfoque de toda la administración y de toda la comunidad.", u: "Si tu municipio no tiene estrategia, es un derecho que puedes exigir.", tema: "marco" },
  { t: "Evaluación de vulnerabilidad y capacidad (VCA)", d: "Método participativo del Movimiento de la Cruz Roja y de la Media Luna Roja para que la propia comunidad analice sus riesgos y sus recursos antes de que nadie le traiga un plan hecho.", u: "Es el mejor punto de partida para una reunión de barrio: dos horas y sale un mapa accionable.", tema: "marco" },
  { t: "Periodo de retorno", d: "Intervalo medio estadístico con el que un evento de cierta magnitud ocurre en un lugar («inundación de 100 años»).", u: "No es un calendario: significa probabilidad anual, y que dos seguidas son posibles.", tema: "marco" },
  { t: "All clear / fin de la alerta", d: "La declaración oficial de que el peligro inmediato pasó y de qué restricciones quedan (acceso, agua, estructuras).", u: "El retorno se planea, no se intuye: la pregunta es «¿qué está declarado seguro ya?».", tema: "marco" },
  { t: "Crisis prolongada", d: "Situación en la que las necesidades duran semanas o meses y la ayuda de emergencia tiene que dar paso a servicios estables.", u: "Explica por qué la reserva personal es un bien público: los primeros tres días son tuyos.", tema: "marco" },
  { t: "Brigada / voluntariado de protección civil", d: "Grupo de personas de la comunidad, formadas y equipadas, que apoyan en alerta, evacuación, primeros auxilios y albergue dentro de un marco legal y con seguro.", u: "Si quieres hacer algo útil con tu tiempo: es el cauce, no el grupo de WhatsApp.", tema: "marco" },
];

/** Agrupación para pintar el glosario: el orden de aparición manda. */
export const TEMAS_GLOSARIO: string[] = (() => {
  const vistos: string[] = [];
  for (const g of GLOSARIO) if (!vistos.includes(g.tema)) vistos.push(g.tema);
  return vistos;
})();

export const ETIQUETAS_TEMA: Record<string, string> = {
  conceptos: "El lenguaje del riesgo",
  alertas: "Alertas y avisos",
  respuesta: "Durante la emergencia",
  recuperacion: "Después y reconstrucción",
  marco: "Marcos y herramientas",
};
