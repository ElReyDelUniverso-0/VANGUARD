// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · ENTREGABLE 4 — GUÍAS DE CONTINUIDAD FAMILIAR
//
// «Continuidad» es la palabra adulta: no se trata de sobrevivir al evento,
// sino de que la vida de la casa siga funcionando durante y después. Se
// escribe para el caso aburrido y real (media hora sin luz, un día sin
// grifo, una noche fuera de casa) y para el caso duro (desalojo).
// ═══════════════════════════════════════════════════════════════════

export interface PasoPlan {
  n: number;
  titulo: string;
  texto: string;
  /** lo que hay que rellenar o decidir, en concreto */
  decision: string;
}

export interface FichaContacto {
  campo: string;
  paraQue: string;
  ejemplo: string;
}

export interface Continuidad {
  area: string;
  lema: string;
  antes: string[];
  durante: string[];
  despues: string[];
  fuente: string;
}

/** Los siete pasos del plan familiar, en el orden en que se hacen. */
export const PLAN_FAMILIAR: PasoPlan[] = [
  {
    n: 1,
    titulo: "Poner nombre a los peligros de tu sitio",
    texto:
      "Una familia no se prepara «para una emergencia»: se prepara para las tres o cuatro cosas que pueden pasarle a su casa. Cada miembro escribe de memoria lo que cree que es lo más probable en su barrio; la lista conjunta es el punto de partida del plan.",
    decision: "Nuestros tres peligros: ______ / ______ / ______",
  },
  {
    n: 2,
    titulo: "Decidir dos puntos de encuentro",
    texto:
      "Uno a la vuelta de la esquina, para el caso de «salgamos ya y no nos separemos» (incendio de cocina, fuga de gas, temblor). Uno fuera del barrio, para el caso de «no podemos volver a casa» (la puerta de la casa de una tía, la estación, el polideportivo del club).",
    decision: "Punto cercano: ______ · Punto lejano: ______",
  },
  {
    n: 3,
    titulo: "Elegir un contacto fuera de la zona",
    texto:
      "Tras un desastre, las llamadas locales se saturan y los mensajes internacionales o de larga distancia suelen pasar mejor. Se acuerda que todos llaman o escriben a esa persona, y ella reparte la información. Funciona solo si la persona conoce el plan y acepta el papel.",
    decision: "Contacto fuera: nombre ______ · teléfono ______ · cómo avisarle de que «todo bien» ______",
  },
  {
    n: 4,
    titulo: "Escribir quién recoge a quién",
    texto:
      "Quién saca a los niños de la escuela si tú no puedes, y quién se queda con ellos si los dos faltan; quién abre la puerta a la persona mayor que vive sola; qué hace cada uno si la otra persona está en el trabajo y hay que evacuar. Es el punto que más planes rompe porque nadie lo escribe.",
    decision: "Red de recogida: ______ · Persona suplente: ______",
  },
  {
    n: 5,
    titulo: "Preparar la mochila y los documentos",
    texto:
      "Bolsa para 72 horas fuera de casa, con la medicación de una semana, y los documentos en un sobre impermeable (original o copia certificada, según el país). Las listas concretas están en la sección de Listas de preparación.",
    decision: "Dónde está la mochila: ______ · Quién la coge al salir: ______",
  },
  {
    n: 6,
    titulo: "Hacer el plan accesible y ensayarlo",
    texto:
      "El plan se escribe en grande, se cuelga en la nevera, se guarda una foto en el móvil de cada adulto y se adapta a quien no lo puede leer o no oye la alarma. Un simulacro en casa por temporada (una vez con la luz apagada) revela los dos fallos que el papel no ve.",
    decision: "Cuándo ensayamos: ______ · Quién necesita una versión adaptada: ______",
  },
  {
    n: 7,
    titulo: "Revisarlo dos veces al año",
    texto:
      "Se revisa con el cambio de hora (dos veces al año, la fecha te la da gratis el calendario): caducidades de la mochila, agua embotellada, pilas, números que cambiaron, una familia que creció, una persona que ahora usa muletas, un teléfono de escuela nuevo.",
    decision: "Revisión: ______ y ______ · Qué cambió desde la última: ______",
  },
];

/** La ficha de contacto: lo único que hace falta rellenar y tener a mano. */
export const FICHA_CONTACTO: FichaContacto[] = [
  { campo: "Membresía de la casa", paraQue: "Nombres, apellidos, fecha de nacimiento, documento de identidad, talla y tipo de gafas/lentillas, alergias, medicación crónica, grupo sanguíneo si se sabe.", ejemplo: "Una hoja por persona, plastificada, en la mochila y en el móvil." },
  { campo: "Contacto fuera de la zona", paraQue: "El nodo que reúne la información de todos cuando la red local está saturada.", ejemplo: "Nombre + teléfono + un mensaje convenido que signifique «estoy bien»." },
  { campo: "Puntos de encuentro", paraQue: "El lugar donde se reencuentra la familia sin depender del teléfono.", ejemplo: "Cerca de casa / fuera del barrio, con una foto del sitio para quien no lo conoce." },
  { campo: "Escuela y trabajo", paraQue: "Teléfono del centro, nombre del procedimiento de reunificación y quién está autorizado a recoger a un menor.", ejemplo: "Pregunta concreta: «¿a quién le entregan a mi hijo si yo no llego?»" },
  { campo: "Salud", paraQue: "Médico o pediatra, farmacia de guardia, seguro, centro de referencia en caso de evacuación y la medicación que no se puede interrumpir.", ejemplo: "Foto del envase con la dosis escrita: evita el error cuando no se puede leer la letra." },
  { campo: "Vivienda y servicios", paraQue: "Dónde está el corte de agua, luz y gas; compañía eléctrica y de agua con su número de averías; seguro del hogar y su póliza.", ejemplo: "Una línea: «gas: llave junto al contador, vuelta a la izquierda»." },
  { campo: "Dependencias y apoyos", paraQue: "Personas mayores, menores, mujeres embarazadas, personas con discapacidad, aparatos que necesitan electricidad, animales de compañía y asistencia.", ejemplo: "«Necesito oxígeno: 3 h de batería» y «mi perro no admite que lo carguen»." },
  { campo: "Vecindario", paraQue: "Teléfonos de los vecinos del rellano y del de al lado, quién tiene sierra, generador, escalera o un cuarto libre.", ejemplo: "Una lista de portal con 8 números basta para un edificio." },
];

/** Seis frentes de continuidad, en el mismo formato para poder compararlos. */
export const CONTINUIDAD: Continuidad[] = [
  {
    area: "Agua",
    lema: "Cuatro litros por persona y día, y una forma de hacerla segura",
    antes: [
      "Guarda agua embotellada o en bidones de uso alimentario; la norma práctica es un mínimo de tres días por persona, y más si hace calor o hay enfermos.",
      "Llena la bañera y cubos limpios el día que se anuncia un corte o una tormenta larga: esa agua no es para beber, pero sí para el inodoro y la limpieza.",
      "Aprende dónde está la llave de paso de tu casa y cómo se purifica agua (hervor o desinfección): la ficha está en la sección Agua y luz.",
    ],
    durante: [
      "Bebe poco y a menudo; no uses agua de pozo o cisterna sin confirmación si hubo inundación o rotura.",
      "Prioriza: bebida y cocina, después higiene de manos, después el resto.",
      "Si el grifo escupe aire o agua turbia, deja correr un rato por un desagüe y no la uses para cocinar hasta que salga limpia.",
    ],
    despues: [
      "Cuando la autoridad diga «no es apta para consumo», la norma sigue siendo hervir o desinfectar aunque el agua parezca clara.",
      "Vacía y seca los recipientes que estuvieron llenos mucho tiempo: el mosquito del dengue cría en agua quieta.",
      "Repara la fuga que descubriste: el corte deja ver la instalación que nadie mira.",
    ],
    fuente: "Ready.gov (FEMA) · «Water»; OMS/UNICEF · agua en emergencias",
  },
  {
    area: "Energía",
    lema: "La nevera, la bombas de agua y el oxígeno dependen del enchufe",
    antes: [
      "Saca una linterna por persona (no velas), carga baterías externas y ten una radio a pilas o de manivela.",
      "Anota qué aparatos de tu casa son críticos (nevera, bomba de agua, oxígeno, CPAP, bomba de insulina, ascensor) y cuánto aguantan sin luz.",
      "Si un miembro de la casa depende de un aparato eléctrico, regístrate en la compañía como cliente con necesidad asistencial y ten baterías para 24-48 horas.",
    ],
    durante: [
      "Deja encendida una sola luz para saber cuándo vuelve; apaga el resto para no cargar la red al reconectar.",
      "No abras la nevera sin necesidad: un frigorífico cerrado aguanta unas 4 horas; un congelador lleno, mucho más.",
      "Grupo electrógeno SOLO fuera, lejos de ventanas y puertas, y nunca en el garaje: el monóxido de carbono no huele y no se ve.",
    ],
    despues: [
      "Reconecta los aparatos de uno en uno, no todos a la vez; revisa si algo quedó apagado cuando se fue la luz (horno, plancha).",
      "Tira lo del frigorífico que superó 2 horas por encima de 4-5 °C; si tienes duda, tíralo.",
      "Si el reloj parpadea, ya sabes la hora que llevaba sin luz: apúntala para el parte del seguro.",
    ],
    fuente: "Ready.gov (FEMA) · «Power outages»; OSHA/OMS · monóxido de carbono",
  },
  {
    area: "Alimentación",
    lema: "Tres días de comida que no hace falta cocinar",
    antes: [
      "Rota la despensa: lo que compras para la semana se guarda para el imprevisto. Comida en conserva, alimento no perecedero, abrelatas manual, algo que guste de verdad.",
      "Piensa en quien tiene dieta especial: bebé, diabético, celíaco, disfagia, diálisis.",
      "Guarda un hornillo de camping y cartuchos, o resuelve cómo calentar agua sin gas ni luz.",
    ],
    durante: [
      "Con calor y sin frío, lo peligroso no es el hambre: es lo que se multiplica en la comida preparada. Frío, tapado y rápido.",
      "Antes de cocinar con agua de dudosa calidad, hiérvela o desinfecta.",
    ],
    despues: [
      "Tira todo lo que tocó agua de inundación, incluida la comida en envase no hermético, y los envases de latas abolladas o oxidadas.",
      "No vuelvas a congelar lo que se descongeló y estuvo rato a temperatura ambiente.",
      "Lava platos y cubiertos con agua potable; si la red está contaminada, usa desechables o desinfecta.",
    ],
    fuente: "USDA/FDA · seguridad alimentaria; OMS · inocuidad en emergencias",
  },
  {
    area: "Documentos y dinero",
    lema: "Lo que no se puede reemplazar, se duplica y se protege",
    antes: [
      "Identidad, propiedad, seguros, salud y banca: un sobre impermeable con originales o copias, y una copia digital cifrada en un correo o disco que no dependa de tu casa.",
      "Haz fotos de cada habitación y de los objetos valiosos con la fecha: así se reclama un seguro que no se discute.",
      "Guarda algo de efectivo pequeño; con los cajeros sin luz, el cambio manda.",
    ],
    durante: [
      "El sobre va en la mochila, no en el cajón del escritorio: si solo puedes coger dos cosas, ese es uno de los dos.",
    ],
    despues: [
      "Si se perdieron, denuncia y pide duplicados antes de que te los pidan para una ayuda: la burocracia posterior es parte del desastre.",
      "Reclama por escrito, con fecha, y guarda copia de todo. Nadie recuerda un expediente sin papel.",
    ],
    fuente: "Ready.gov (FEMA) · documentos · Cruz Roja/IFRC · registro de familiares",
  },
  {
    area: "Escuela y cuidados",
    lema: "El plan de los niños es el que más se olvida y el que menos puede fallar",
    antes: [
      "Pregunta a la escuela o guardería: ¿dónde evacuáis?, ¿a quién entregáis a los niños?, ¿qué necesito para autorizar a otra persona?",
      "Acuerda en la familia la «persona suplente»: dos adultos que no vivan en la misma casa ni trabajen en el mismo sitio.",
      "Prepara una tarjeta en la mochila del niño con nombre, contacto y alergias, y enséñale a decir el teléfono de memoria.",
    ],
    durante: [
      "El centro gestiona la reunificación: no corras a la escuela antes de que lo digan, porque estorbas la ruta de emergencia y te quedas fuera.",
      "Si los niños están contigo, diles qué pasa con frases cortas y qué van a hacer ellos: el miedo baja cuando hay tarea.",
    ],
    despues: [
      "Reanuda la rutina escolar cuanto antes: es la intervención psicosocial más eficaz y más barata que existe.",
      "Vigila cambios de sueño, regresión, enfado o miedo a dormirse solos: son respuestas normales tras un suceso, y si duran semanas, se consulta.",
      "Deja que ayuden: repartir mantas o poner la mesa es parte de la recuperación, no un extra.",
    ],
    fuente: "IFRC · apoyo psicosocial; UNICEF · escuelas y emergencias; OMS · primeros auxilios psicológicos",
  },
  {
    area: "Animales de compañía",
    lema: "Si no van con la familia, la familia no se va",
    antes: [
      "Kit del animal: correa o transportín, comida y agua, bozal si puede morderte el miedo, cartilla veterinaria, una foto reciente para acreditar la propiedad.",
      "Resuelve dónde: ¿qué albergue de tu zona admite animales?, ¿qué familiar o pensión?, ¿y si es un caballo o una granja?",
      "Microchip y señas actualizados: es lo que hace que un animal perdido vuelva.",
    ],
    durante: [
      "Animal suelto asustado muerde y se pierde: transportín, correa y bozal aunque «el mío nunca».",
      "Si no puedes llevarte a un animal grande, abre la puerta del recinto y deja agua y comida: encerrarlo con el riesgo es peor.",
    ],
    despues: [
      "El animal puede no reconocerse entre sí tras el estrés y la casa huele distinto: reintroduce despacio y con correa.",
      "Revisa patas y piel con ceniza o agua contaminada, y no le des agua de un charco.",
      "Si se perdió, avisa al servicio de captura, al refugio y a la red de vecinos con la foto.",
    ],
    fuente: "IFRC · animales en emergencias; FEMA/Ready.gov · «Pets and service animals»",
  },
];
