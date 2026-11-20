// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · ENTREGABLE 10 — LISTAS GENERALES DE PREPARACIÓN
//
// Ocho listas. Criterio de diseño: una lista que no se puede completar en
// 20 minutos y con lo que ya hay en casa no se completa nunca. Por eso cada
// una declara su tiempo y su coste aproximado, y ninguna pide comprar nada
// que no sea estrictamente necesario.
// ═══════════════════════════════════════════════════════════════════

export interface Lista {
  id: string;
  titulo: string;
  paraQuien: string;
  lema: string;
  /** tiempo realista de hacerla, en texto */
  tiempo: string;
  items: { texto: string; nota?: string; critico?: boolean }[];
  fuente: string;
}

export const LISTAS: Lista[] = [
  {
    id: "mochila",
    titulo: "Mochila de 72 horas",
    paraQuien: "Cada miembro de la casa, incluida la persona mayor y los niños.",
    lema: "Lo que te permite salir de casa y aguantar tres días fuera sin depender de nadie.",
    tiempo: "Una tarde, con lo que ya tienes en casa",
    items: [
      { texto: "Agua: 4 litros por persona y día, o pastillas/gotas de desinfección", nota: "Se renueva dos veces al año; la fecha va escrita con rotulador.", critico: true },
      { texto: "Medicación crónica para 7 días + copia de la receta", critico: true },
      { texto: "Botiquín: gasas, esparadrapo, antiséptico, tijera, guantes, termómetro, analgésico", critico: true },
      { texto: "Linterna por persona + pilas de repuesto (o linterna de manivela)" },
      { texto: "Radio a pilas o de manivela", nota: "El móvil se agota; la radio no depende de la antena de tu barrio." },
      { texto: "Batería externa cargada y cable; adaptador de coche" },
      { texto: "Documentos en sobre impermeable + 200 €/$ de efectivo pequeño", critico: true },
      { texto: "Ropa de abrigo y un chubasquero por persona, calcetines de repuesto" },
      { texto: "Comida que no necesite frío ni cocción: barritas, frutos secos, conserva, chocolate" },
      { texto: "Abrelatas manual, cuchillo pequeño, cubiertos, vaso de metal" },
      { texto: "Silbato (para que te oigan bajo escombros) y pañuelo o mascarilla contra polvo" },
      { texto: "Bolsas de basura grandes, cinta adhesiva, toallitas, gel hidroalcohólico" },
      { texto: "Artículo de aseo personal y menstrual, papel higiénico" },
      { texto: "Encendedor/impermeable en bolsa hermética; fósforos" },
      { texto: "Mapa de papel de la zona y una libreta con lápiz, con los teléfonos escritos" },
      { texto: "Lo que calma: naipes, un juguete pequeño, auriculares, foto de familia" },
    ],
    fuente: "Ready.gov (FEMA) · «Build a Kit»; IFRC · mochila familiar",
  },
  {
    id: "casa",
    titulo: "Revisión de la vivienda (una mañana)",
    paraQuien: "Quien vive en una casa o un piso, en alquiler o en propiedad.",
    lema: "El riesgo se reduce atornillando, no comprando.",
    tiempo: "3-4 horas, dos veces al año",
    items: [
      { texto: "Fija estanterías, armarios altos y televisor a la pared o con una eslinga", critico: true },
      { texto: "Cuelga cuadros y espejos lejos de camas, sillones y de la puerta", nota: "En un temblor caen y cortan la salida." },
      { texto: "Guarda productos químicos, pinturas y líquidos inflamables fuera del alcance, en armario ventilado y cerrado" },
      { texto: "Limpia canalones, sumideros y terrazas; verifica que el agua se va hacia fuera, no hacia el muro" },
      { texto: "Revisa tejado y bajantes, y sella la entrada de agua en ventanas y claraboyas" },
      { texto: "Localiza y rotula las llaves de paso: agua, gas, electricidad; cambia las que gotean" },
      { texto: "Instala y prueba detector de humo en cada planta y detector de monóxido si hay combustión", critico: true },
      { texto: "Ten un extintor doméstico y sabe usarlo; una manta ignífuga en cocina si hay fuego abierto" },
      { texto: "Revisa la instalación eléctrica: enchufes cargados hasta el tope con ladrones, cables pelados, calientabaterías viejos" },
      { texto: "Retira del entorno de la casa lo que arde: leña pegada al muro, macetas de plástico en la terraza, hojas secas" },
      { texto: "Anota en la nevera, en grande: corte de luz general, llave de gas, punto de encuentro, contacto fuera" },
    ],
    fuente: "Ready.gov (FEMA) · «Make your home safer»; IFRC · seguridad del hogar",
  },
  {
    id: "documentos",
    titulo: "Documentos y datos que salvan después",
    paraQuien: "Toda persona adulta; en el plan familiar, también los menores.",
    lema: "El desastre se arregla con papeles: prepáralos antes de que hagan falta.",
    tiempo: "Dos horas una vez, y 15 minutos dos veces al año",
    items: [
      { texto: "Documento nacional de identidad y pasaporte de cada miembro (copia y original protegido)", critico: true },
      { texto: "Libro de familia / partida de nacimiento / custodia, si aplica" },
      { texto: "Escritura o contrato de alquiler, y último recibo del impuesto de la vivienda" },
      { texto: "Pólizas de seguro (hogar, coche, vida, salud) con teléfono de siniestros y número de póliza" },
      { texto: "Historial médico resumido: diagnóstico, medicación con dosis, alergias, grupo sanguíneo, médico de referencia", critico: true },
      { texto: "Cartilla de vacunación (propia, niños y animales de compañía)" },
      { texto: "Números de cuenta, tarjeta y banco con teléfono; copia de la declaración fiscal reciente" },
      { texto: "Fotos y vídeo de todas las habitaciones, del coche y de los objetos de valor, fechados" },
      { texto: "Copia digital cifrada en un correo o disco que no esté en la misma casa que los originales" },
      { texto: "Tarjeta con los teléfonos de emergencias y de la autoridad local, plastificada, en cada monedero" },
    ],
    fuente: "Cruz Roja/IFRC · registro familiar; Ready.gov (FEMA) · documentos",
  },
  {
    id: "escuela",
    titulo: "Lista de escuela y guardería segura",
    paraQuien: "Centros educativos, AMPA y familias.",
    lema: "Un centro que evacúa bien no improvisa: ensaya.",
    tiempo: "Un claustro y un simulacro por trimestre",
    items: [
      { texto: "Plan de emergencia escrito con rutas, punto de reunión y responsable por aula", critico: true },
      { texto: "Rutas señalizadas y despejadas; salida alternativa si la principal da a la calle principal" },
      { texto: "Dos simulacros al año como mínimo, uno con humo o de noche si el centro tiene internado" },
      { texto: "Lista viva de alumnado con medicación, alergias, discapacidad y necesidades de apoyo", critico: true },
      { texto: "Procedimiento de reunificación firmado: quién recoge, con qué documento, y qué se hace si nadie llega" },
      { texto: "Comunicación con familias por un canal que no sea el pasillo de la entrada (mensajería, radio, red social del centro)" },
      { texto: "Botiquín por edificio, y alguien con formación en primeros auxilios presente siempre que hay niños" },
      { texto: "Punto de encuentro para el alumnado en la calle y referencia del albergue de la comunidad" },
      { texto: "Rincón de calma para crisis: la mitad del trabajo tras un sismo es bajar la activación" },
      { texto: "Lista de «quién tiene qué» en el barrio: furgoneta, escalera, generador, cocina, aula accesible" },
    ],
    fuente: "IFRC/UNICEF · escuelas seguras; Ready.gov · «School and children»",
  },
  {
    id: "barrio",
    titulo: "Lista de barrio y comunidad",
    paraQuien: "Asociación de vecinos, comité comunitario, parroquia, junta de acciones comunales.",
    lema: "Los primeros treinta minutos son del barrio; los de después, de las autoridades.",
    tiempo: "Dos reuniones: una para mapear, otra para acordar",
    items: [
      { texto: "Mapa de personas que pueden necesitar ayuda para salir: quienes viven solos, con movilidad reducida, con aparato eléctrico, encamados (con su consentimiento)", critico: true },
      { texto: "Mapa de recursos del barrio: quien tiene generador, sierra, escalera, furgoneta, habitáculo grande, cocina industrial" },
      { texto: "Punto de encuentro acordado, con agua, sombra, baño y acceso para silla de ruedas" },
      { texto: "Red de contactos con turnos: quién avisa a qué calle, y quién no está el día del evento" },
      { texto: "Dos salidas distintas del barrio y un criterio para decidirlas (si corta la A, se va por la B)" },
      { texto: "Registro de riesgos del entorno: la casa con grieta, el árbol sobre el cable, el sumidero que se tapa, el local con gas" },
      { texto: "Acuerdo con la autoridad local: a qué número se reporta y qué puede pedir el barrio", critico: true },
      { texto: "Un responsable de información: la comunidad habla con una sola voz y un solo canal verificado" },
      { texto: "Dos actividades al año que no sean una emergencia: limpieza, simulacro, fiesta. Sin relación previa, la ayuda no llega a tiempo." },
    ],
    fuente: "IFRC · evaluación de vulnerabilidad y capacidad de la comunidad (VCA); UNDRR · «Making Cities Resilient»",
  },
  {
    id: "coche",
    titulo: "Coche y moto: kit y decisiones",
    paraQuien: "Quien depende del vehículo para trabajar o para vivir fuera del transporte público.",
    lema: "El coche es refugio, camilla y cocina: se prepara como tal.",
    tiempo: "Una hora",
    items: [
      { texto: "Depósito por encima de media en temporada de riesgo; no esperar a la alerta para cargar (las colas se forman antes)", critico: true },
      { texto: "Manta, agua, barritas, linterna, cables de arranque, triángulos o señal V-16, chaleco reflectante" },
      { texto: "Raspador de hielo, guantes, calcetines secos y un gorro en el cajón si vives donde hiela" },
      { texto: "Cargador de móvil, batería externa y cable de coche; papel y lápiz en la guantera" },
      { texto: "Botella de orina o plan para no tener que parar de noche en una zona inundada" },
      { texto: "Rueda de repuesto hinchada y herramienta: el desastre no perdona un pinchazo en un camino" },
      { texto: "Nunca cruces un vado o calzada con agua en movimiento: date la vuelta", critico: true },
      { texto: "Aparca fuera de árboles, vallas ligeras y taludes cuando se anuncia viento o nieve" },
      { texto: "Si te quedas bloqueado por nieve, quédate con el vehículo, señaliza, arranca el motor por ratos y despeja el tubo de escape" },
    ],
    fuente: "Ready.gov (FEMA) · «Vehicle and fuel»; NWS · seguridad en ventisca",
  },
  {
    id: "trabajo",
    titulo: "Lista de centro de trabajo y local",
    paraQuien: "Comercio, taller, oficina, cooperativa, empresa pequeña.",
    lema: "Continuidad no es un PowerPoint: es saber quién abre la puerta y a quién se llama.",
    tiempo: "Una mañana y un simulacro al año",
    items: [
      { texto: "Plan de evacuación con recorridos, punto de reunión y conteo de personal", critico: true },
      { texto: "Brigada interna: quien corta, quien guía, quien revisa baños, quien recibe a bomberos" },
      { texto: "Llaves y accesos: quién puede abrir el local si falta el dueño; copia en sobre cerrado con la autoridad local", critico: true },
      { texto: "Copias de seguridad: qué se pierde si el servidor y el papel arden a la vez, y dónde está la copia fuera del edificio" },
      { texto: "Protocolo con clientes y público: qué se hace con quien espera dentro cuando suena la alarma" },
      { texto: "Lista de personal con teléfono, contacto de emergencia y restricciones médicas declaradas voluntariamente" },
      { texto: "Sistema de aviso interno que funcione sin luz ni internet: megafonía, silbato, pizarra, mensaje de texto" },
      { texto: "Proveedores alternativos y un plan de arranque a 48 horas: qué se reanuda primero si el negocio para" },
      { texto: "Seguro que cubra la interrupción de actividad, y fotos fechadas del inventario" },
    ],
    fuente: "OIT/OMS · continuidad del negocio y seguridad laboral; FEMA · «Business preparedness»",
  },
  {
    id: "vulnerable",
    titulo: "Lista de necesidades de apoyo",
    paraQuien: "Personas con discapacidad, mayores, enfermos crónicos, embarazadas, cuidadoras, menores, personas sin hogar.",
    lema: "No es una lista de cuidados: es una lista de lo que hay que tener preparado para que nadie se quede atrás.",
    tiempo: "Media hora con quien corresponde",
    items: [
      { texto: "Medicación y consumibles para 14 días (sonda, sonda de gastrostomía, incontinencia, oxígeno, pilas del aparato auditivo)", critico: true },
      { texto: "Reserva de batería y plan B para aparato vital: respirador, oxígeno, bomba de insulina, cama articulada" },
      { texto: "Ayudas técnicas de repuesto: gafas y lentillas extra, bastón, audífono, silla plegable" },
      { texto: "Tarjeta de comunicación: quién no puede hablar, quién no oye, quién no puede explicar sus síntomas; qué preguntar y cómo", critico: true },
      { texto: "Adaptación sensorial: auriculares antirruido, gorra, objeto de calma, linterna con luz roja, alarma luminosa y vibratoria" },
      { texto: "Ruta accesible de evacuación y una persona asignada que acompañe, no un «ya veremos»" },
      { texto: "Registro en la compañía eléctrica y en el ayuntamiento como hogar que depende de electricidad o de asistencia domiciliaria" },
      { texto: "Intérprete de lengua de señas o canal de videollamada accesible, y materiales en lectura fácil" },
      { texto: "Transporte adaptado concertado ANTES: quién lo pone si hay que desalojar de madrugada" },
      { texto: "Animales de asistencia: su documentación, y la exigencia escrita de que el albergue los admita" },
    ],
    fuente: "OMS · salud en emergencias e inclusión; IFRC · inclusión de personas con discapacidad; FEMA/Ready.gov",
  },
];

export const LISTA_POR_ID: Record<string, Lista> = Object.fromEntries(
  LISTAS.map((l) => [l.id, l]),
);
