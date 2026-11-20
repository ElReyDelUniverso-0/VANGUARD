// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · ENTREGABLE 7 — RECOMENDACIONES DE PREVENCIÓN
//
// Recomendaciones organizadas por donde se vive, no por peligro. La razón:
// nadie hace una lista de «prevención de sismo»; se hacen cosas en casa, en
// el portal, en la escuela y en el ayuntamiento, y esas cosas cubren ocho
// peligros a la vez.
// ═══════════════════════════════════════════════════════════════════

export interface Recomendacion {
  titulo: string;
  texto: string;
  /** esfuerzo: 1 tarde, 1 fin de semana, 1 obra */
  coste: "gratis" | "una tarde" | "un fin de semana" | "con obra o proyecto";
}

export interface Ambito {
  id: string;
  nombre: string;
  lema: string;
  rec: Recomendacion[];
}

export const AMBITOS: Ambito[] = [
  {
    id: "hogar",
    nombre: "En casa",
    lema: "El 80 % de las lesiones evitables en un sismo o una explosión de gas se arreglan con dos tardes.",
    rec: [
      { titulo: "Fija lo que cae", texto: "Estanterías altas, armarios, televisor, calentador y cuadros sobre camas y sillones: eslingas, escuadras, anclajes. Lo que no está anclado viaja por la habitación en cuanto la casa se sacude.", coste: "una tarde" },
      { titulo: "Separa lo que arde de lo que respira", texto: "Velas, braseros y estufas de combustión a un metro de cortinas y ropa; detector de humo en cada planta y detector de monóxido junto a cualquier llama. Se prueban una vez al mes: un detector sin pila es un adorno.", coste: "gratis" },
      { titulo: "Rota la despensa y la medicación", texto: "Lo que compras para la semana es lo que tienes para la emergencia: tres días de comida que no necesita cocina, agua, y siete días de medicación crónica. Revisa fechas al cambiar la hora.", coste: "gratis" },
      { titulo: "Conoce los cortes de tu casa", texto: "Llave de paso del agua, llave del gas, interruptor general, y el vecino que sabe dónde están. Se practica una vez al año con las luces apagadas.", coste: "gratis" },
      { titulo: "No almacenes en la salida", texto: "Carritos, bicis, trasteros en el rellano y en la escalera: son la trampa en la oscuridad con humo. La evacuación accesible empieza en el portal.", coste: "gratis" },
      { titulo: "Seguro y mantenimiento", texto: "La póliza de hogar que cubra inundación o viento (no todas lo hacen) y un técnico que mire tejado, instalación eléctrica y chimenea cada pocos años. Prevenimos con póliza y con revisión, no con suerte.", coste: "una tarde" },
    ],
  },
  {
    id: "portal",
    nombre: "En el edificio y el portal",
    lema: "Las decisiones de comunidad valen más que las individuales: se comparten, se financian entre todos y no dependen de quién estaba en casa.",
    rec: [
      { titulo: "Un solo lugar para el plan", texto: "El plan de emergencia del edificio, colgado en el portal, con rutas, punto de encuentro, llaves de paso generales, cuadro eléctrico, personas que necesitan ayuda para salir (consentido) y teléfono de la empresa de mantenimiento.", coste: "una tarde" },
      { titulo: "Registro de apoyos", texto: "Quién usa bombona de oxígeno, quién tiene un bebé, quién vive solo, quién tiene movilidad reducida, quién tiene perro de asistencia. Con su permiso, actualizado cada año, y útil solo para ayudar.", coste: "gratis" },
      { titulo: "Mantenimiento preventivo de lo que mata", texto: "Bajantes y sumideros limpios antes del otoño, revisión de fachadas y cornisas cada pocos años, retirada de amianto en buen estado, y puerta del garaje con apertura manual conocida por todos.", coste: "con obra o proyecto" },
      { titulo: "Comunidad con generador o con agua", texto: "Si hay ascensor, bomba de agua o puerta eléctrica, resolver qué se hace sin luz: llave manual, escalera alternativa y un listado de quién puede bajar a ayudar.", coste: "una tarde" },
      { titulo: "Un simulacro al año con conteo", texto: "Se cronometra, se apunta quien no salió, quien bajó por la ruta equivocada y quien no oyó la alarma. Sin medición, el simulacro es un photocall.", coste: "una tarde" },
    ],
  },
  {
    id: "escuela",
    nombre: "En la escuela y la universidad",
    lema: "Los centros educativos son la infraestructura de resiliencia más barata del planeta: ya tienen las personas, el espacio y el horario.",
    rec: [
      { titulo: "Plan escrito y ensayado", texto: "Rutas, punto de reunión, responsable por aula, procedimiento de reunificación con las familias, y dos simulacros al año con medición y con condiciones adversas.", coste: "una tarde" },
      { titulo: "Contenido curricular, no folleto", texto: "El riesgo se enseña como parte de ciencias sociales y naturales: mapas del barrio, historia de las inundaciones locales, por qué se inunda aquí. Un niño que conoce el cauce de su calle es un adulto que no lo urbaniza.", coste: "con obra o proyecto" },
      { titulo: "Lista viva de necesidades", texto: "Medicación, alergias, movilidad, audífonos, necesidades sensoriales, con qué adulto de referencia se queda cada alumno si hay que evacuar sin la maestra.", coste: "una tarde" },
      { titulo: "Infraestructura segura", texto: "Vidrios y falsos techos en pasillos, estanterías del gimnasio y del laboratorio, cubiertas ligeras en zonas de nieve, y los patios con sombra y con agua potable.", coste: "con obra o proyecto" },
      { titulo: "Protocolo de comunicación con familias", texto: "Canal oficial, un solo mensaje de cuatro campos, y un lugar y horario de entrega de menores que no sea el caos de la puerta.", coste: "una tarde" },
    ],
  },
  {
    id: "trabajo",
    nombre: "En el trabajo y el comercio",
    lema: "Continuidad de la actividad es protección civil: un tejido económico que aguanta evita que la recuperación dure un año más.",
    rec: [
      { titulo: "Brigada y roles", texto: "Quien corta suministros, quien guía, quien revisa baños y sótanos, quien recibe a los bomberos, quien hace el conteo. Con nombre, suplente y formación anual.", coste: "una tarde" },
      { titulo: "Copia de seguridad que no depende del edificio", texto: "El plan de continuidad empieza por saber qué se puede perder y qué no: caja, cliente, contabilidad, plano, llaves, y una copia de todo fuera del local.", coste: "una tarde" },
      { titulo: "Proveedores y alternativas", texto: "Si la carretera se corta, ¿quién repone? Si la luz se va, ¿quién cobra? Dos alternativas escritas por cada dependencia crítica.", coste: "una tarde" },
      { titulo: "Plan de arranque a 48 horas", texto: "Qué se reanuda primero, quién decide, cómo se avisa al personal y a los clientes, y cómo se gestiona el día que la gente vuelve a un local dañado.", coste: "un fin de semana" },
      { titulo: "Seguro de interrupción y fotos fechadas", texto: "La cobertura de lucro cesante y el inventario documentado son la diferencia entre cerrar y reabrir.", coste: "una tarde" },
    ],
  },
  {
    id: "comunidad",
    nombre: "En el barrio y el municipio",
    lema: "Aquí es donde el riesgo nuevo se crea o se evita: con una licencia, con un drenaje, con un árbol y con un dato.",
    rec: [
      { titulo: "Conocer el riesgo propio, con la comunidad", texto: "Un recorrido de dos horas con vecinos (método VCA de la Cruz Roja) produce un mapa más útil que un informe comprado: grietas, puntos negros de agua, árboles sobre cables, casas vacías con gente dentro.", coste: "una tarde" },
      { titulo: "Sombra, agua y drenaje", texto: "Arbolado en las plazas, fuentes públicas que funcionen, imbornales limpios, pavimentos permeables y cauces sin entubar ni ocupar. Calor e inundación se combaten con el mismo proyecto.", coste: "con obra o proyecto" },
      { titulo: "Cumplir el planeamiento y no pedir excepciones", texto: "La casa en el cauce, el local en la ladera y la planta en el suelo inundable generan el desastre de dentro de veinte años. La licencia es la herramienta de prevención más poderosa de un municipio.", coste: "gratis" },
      { titulo: "Alerta que llegue a todos", texto: "Cobertura real: sirena + mensaje al móvil + puerta a puerta para quien no tiene móvil + lengua de señas + idiomas del barrio. Y un ejercicio público anual de todo el sistema.", coste: "con obra o proyecto" },
      { titulo: "Brigadas vecinales formadas y aseguradas", texto: "Voluntariado con formación básica, equipo, seguro y un marco legal: es la capacidad que multiplica el alcance de los servicios profesionales en la primera hora.", coste: "un fin de semana" },
      { titulo: "Datos abiertos y memoria del lugar", texto: "Publicar dónde llovió más, dónde se cortó la carretera, qué calle se inundó y en qué año. La memoria institucional es infraestructura: se pierde cuando nadie la escribe.", coste: "una tarde" },
    ],
  },
];

/** La revisión estacional: seis comprobaciones, dos veces al año. */
export const REVISION_ANUAL: { cuando: string; comprobaciones: string[] }[] = [
  {
    cuando: "Al entrar el verano (calor, tormenta, incendio)",
    comprobaciones: [
      "Agua de reserva y mochila: pilas, fechas, ropa de abrigo que ya no hace falta y botiquín que sí.",
      "Detector de humo y de monóxico: prueba, pila, y extintor con revisión al día.",
      "Canalones, sumideros y terrazas limpios; el jardín con el espacio defendible despejado.",
      "Ventilación y sombra en la habitación más fresca; botellas reutilizables para cada miembro.",
      "Lista de vecinos que pasan solos el verano, con turno de llamada.",
      "Revisión del plan familiar con los niños: dónde está el punto de encuentro y el teléfono del contacto fuera.",
    ],
  },
  {
    cuando: "Al entrar el invierno (frío, viento, lluvia, nieve)",
    comprobaciones: [
      "Aislamiento, burletes, condensación y moho; tubos expuestos protegidos y llave de paso marcada.",
      "Combustible, leña seca o reserva eléctrica para varios días; y el detector de monóxido funciona.",
      "Seguro del hogar: qué cubre de verdad en ventisca, inundación o daño eléctrico.",
      "Linternas, baterías, radio y una manta térmica en el coche.",
      "Personas mayores y enfermas crónicas del entorno: visita y llamada acordadas para las noches duras.",
      "Revisión de tejado, anclajes de andamios y cierres: la primera borrasca no es el momento de descubrir la teja suelta.",
    ],
  },
];

export const PREVEN_FUENTE =
  "Fuentes citadas: Ready.gov (FEMA) · «Make a plan, get a kit, be informed» · IFRC · comunidad resiliente · UNDRR · Marco de Sendai 2015-2030 · OMS · salud planetaria y entornos seguros · PAHO · hospitales seguros.";
