// Vanguard v11 — ARCHIVOS NACIÓN: datos de casos del DETECTIVE MULTIJUGADOR.
// 6 casos historicos (guerras y tratados), uno por pais, con 5 sospechosos
// arquetipicos + 4 ubicaciones de busqueda + recap real de la historia.
// El culpable se sortea por partida; las pistas se generan en el servidor.

export interface DetSuspect {
  arch: "DIPLOMATICO" | "GENERAL" | "INDUSTRIAL" | "PROPAGANDISTA" | "AGENTE";
  name: string;
  desc: string;
  motive: string;
}

export interface DetLocation {
  id: string;
  name: string;
  desc: string;
}

export interface DetCase {
  id: string;
  country: string; // codigo ISO para FlagBadge
  title: string;
  tagline: string;
  year: string;
  difficulty: 1 | 2 | 3;
  stake: number; // coste de entrada en monedas (se pierde si acusas mal)
  subject: string; // sintesis del caso, inyectada en las pistas
  briefing: string;
  recap: string; // lo que REALLY paso (pagado al final, valor educativo)
  suspects: DetSuspect[];
  locations: DetLocation[];
}

export const DET_CASES: DetCase[] = [
  {
    id: "DEU-WW2",
    country: "DE",
    title: "Quien armo la II Guerra Mundial",
    tagline: "BERLIN 1939",
    year: "1939",
    difficulty: 2,
    stake: 150,
    subject: "la invasión de Polonia",
    briefing:
      "Polonia arde desde el amanecer. Cinco figuras del Reich estaban en la cadena de mando y una de ellas movió los hilos esa noche. Encuentra al causante antes de que el siglo se pierda en la niebla.",
    recap:
      "LO REAL: la Segunda Guerra Mundial no fue un plan de una noche. El Tratado de Versalles dejó a Alemania humillada y endeudada; la Gran Depresión radicalizó a millones; la remilitarización de Renania y el apaciguamiento de Múnich enseñaron que la agresión salía gratis; el pacto Molotov-Ribbentrop (23-8-1939) abrió la puerta; y la invasión de Polonia el 1-9-1939 la cruzó. La culpa fue una cadena: resentimiento, crisis, miedo y ambición.",
    suspects: [
      { arch: "DIPLOMATICO", name: "El Diplomático de Múnich", desc: "Firma tratados de papel y vende apaciguamiento", motive: "Comprar la paz mientras se firma la guerra" },
      { arch: "GENERAL", name: "El General del Estado Mayor", desc: "Revancha de Versalles bajo el brazo", motive: "Borrar la humillación de 1919 con fuego" },
      { arch: "INDUSTRIAL", name: "El Industrial del Ruhr", desc: "Fábricas que respiran acero y pólvora", motive: "Beneficios colosales del rearme" },
      { arch: "PROPAGANDISTA", name: "El Ministro de la Mentira", desc: "Convierte el miedo en bandera y el odio en ley", motive: "Un país manipulado es un país militarizado" },
      { arch: "AGENTE", name: "El Agente Extranjero", desc: "Incendia fronteras con guantes de seda", motive: "Encender el este mientras mira al oeste" },
    ],
    locations: [
      { id: "archivo", name: "Archivo del Reich", desc: "Carpetas selladas, decretos y mapas" },
      { id: "frontera", name: "Frontera de Polonia", desc: "Movimientos de tropas y telegramas de aduana" },
      { id: "cafe", name: "Café Kaiserhof", desc: "Susurros de ministros y mozos con buena memoria" },
      { id: "radio", name: "Estación de radio", desc: "Discursos, censura y transmisiones captadas" },
    ],
  },
  {
    id: "AUT-WW1",
    country: "AT",
    title: "El disparo de Sarajevo",
    tagline: "SARAJEVO 1914",
    year: "1914",
    difficulty: 1,
    stake: 100,
    subject: "el asesinato de Sarajevo",
    briefing:
      "Un disparo en un puente y 16 millones de muertos después. Cinco figuras orbitaban al archiduque aquel junio: quién convirtió un crimen local en la Gran Guerra.",
    recap:
      "LO REAL: el 28-6-1914 Gavrilo Princip disparó al archiduque Francisco Fernando. Pero la guerra no vino del revólver: vino del ultimátum imposible de Viena, la 'carta blanca' alemana, la red Mano Negra, los tratados cruzados que arrastraron a cinco imperios en semanas y una seguridad fallida. Una cadena de tratados convirtió un asesinato en la Primera Guerra Mundial.",
    suspects: [
      { arch: "DIPLOMATICO", name: "El Ministro del Ultimátum", desc: "Escribe exigencias que nadie puede firmar", motive: "Un pretexto para la guerra preventiva" },
      { arch: "GENERAL", name: "El Jefe del Estado Mayor", desc: "Solo habla en planes de movilización", motive: "Movilizar antes que el enemigo, cueste lo que cueste" },
      { arch: "INDUSTRIAL", name: "El Fabricante de Cañones", desc: "Skoda trabaja día y noche", motive: "Pedidos militares sin fin" },
      { arch: "PROPAGANDISTA", name: "El Prensa Belicista", desc: "Titulares que encienden más que la pólvora", motive: "Ventas y patrioterismo" },
      { arch: "AGENTE", name: "El Hombre de la Mano Negra", desc: "Contrabandista de revólveres y juramentos", motive: "Una Bosnia libre a cualquier precio" },
    ],
    locations: [
      { id: "archivo", name: "Archivo imperial", desc: "Expedientes del ultimátum y correspondencia" },
      { id: "puente", name: "Puente de Sarajevo", desc: "Testigos del recorrido y del disparo" },
      { id: "embajada", name: "Embajada de Viena", desc: "Cables diplomáticos y carta blanca" },
      { id: "cafe", name: "Café Bosna", desc: "Donde los conspiradores esperaban su hora" },
    ],
  },
  {
    id: "USA-PH",
    country: "US",
    title: "El silencio de Pearl Harbor",
    tagline: "HAWAII 1941",
    year: "1941",
    difficulty: 2,
    stake: 200,
    subject: "el ataque a Pearl Harbor",
    briefing:
      "Domingo, 7 de diciembre. El radar vio algo, el código fue descifrado, el aviso nunca llegó. Cinco figuras sabían algo y una de ellas dejó que el silencio volara con los barcos.",
    recap:
      "LO REAL: Japón atacó Pearl Harbor el 7-12-1941 tras el embargo de petróleo de EE.UU. y presionado por la guerra en China. Washington había roto los códigos diplomáticos japoneses, pero el ultimátum llegó tarde y el aviso de guerra se transmitió por telegrama lento, no por teléfono. Desorganización, prejuicios sobre la capacidad japonesa y errores de comunicación dejaron la flota dormida. No fue una traición: fue una cadena de fallos, y luego unió a un país entero.",
    suspects: [
      { arch: "DIPLOMATICO", name: "El Embajador sin Reloj", desc: "Negociaba mientras los portaaviones zarpaban", motive: "Ganar tiempo para la primera oleada" },
      { arch: "GENERAL", name: "El Comandante de la Base", desc: "Preparado para sabotaje, no para aviación", motive: "Proteger aviones en lugar de dispersarlos" },
      { arch: "INDUSTRIAL", name: "El Rey del Petróleo", desc: "El embargo cortó el crudo japonés", motive: "Empujar a Tokio al gesto desesperado" },
      { arch: "PROPAGANDISTA", name: "El Editor Condescendiente", desc: "Titulares: 'no pueden volar hasta aquí'", motive: "Subestimar al enemigo vende periódicos" },
      { arch: "AGENTE", name: "El Espía del Consulado", desc: "Contaba barcos desde una colina", motive: "Mapa perfecto para el ataque" },
    ],
    locations: [
      { id: "cripto", name: "Sala de criptografía", desc: "Máquinas PURPLE y mensajes a medias" },
      { id: "puerto", name: "Puerto naval", desc: "Fila de acorazados y vigilias relajadas" },
      { id: "embajada", name: "Embajada de Tokio", desc: "Cables largos, mecanógrafos nervous" },
      { id: "radar", name: "Radar de Opana", desc: "Una mancha verde que alguien ignoró" },
    ],
  },
  {
    id: "RUS-PACT",
    country: "RU",
    title: "El pacto secreto",
    tagline: "MOSCU 1939",
    year: "1939",
    difficulty: 2,
    stake: 180,
    subject: "el pacto Molotov-Ribbentrop",
    briefing:
      "Enemigos íntimos firmaron un abrazo y Europa del Este desapareció de un mapa en una noche. Cinco figuras rodearon esa firma: quién escribió el protocolo secreto.",
    recap:
      "LO REAL: el 23-8-1939 la URSS y Alemania firmaron el pacto Molotov-Ribbentrop: no agresión, comercio... y un PROTOCOLO SECRETO que repartía Polonia, Finlandia, los bálticos y Besarabia entre ambos. Stalin ganó tiempo y territorio; Hitler tenía libre la espalda para invadir Polonia. El pacto duró hasta el 22-6-1941, cuando el invasor cruzó la frontera igualmente.",
    suspects: [
      { arch: "DIPLOMATICO", name: "El Ministro de Papeles", desc: "Firma tratados con dos plumas", motive: "Ganar tiempo a cualquier precio" },
      { arch: "GENERAL", name: "El Mariscal sin Fronteras", desc: "Sueña con territorios que nunca fueron suyos", motive: "Recuperar el imperio del zar" },
      { arch: "INDUSTRIAL", name: "El Comerciante de Grano", desc: "Trenes de trigo cruzan la frontera al revés", motive: "Materias primas por maquinaria de guerra" },
      { arch: "PROPAGANDISTA", name: "El Editor Prudente", desc: "El pacto no aparece en ningún periódico", motive: "Silenciar lo que no conviene" },
      { arch: "AGENTE", name: "El Cartógrafo Oscuro", desc: "Dibuja líneas donde no hay caminos", motive: "Un mapa nuevo es un imperio nuevo" },
    ],
    locations: [
      { id: "kremlin", name: "Archivo del Kremlin", desc: "Carpetas con candado doble" },
      { id: "frontera", name: "Estación de frontera", desc: "Manifiestos de trenes que no deberían existir" },
      { id: "hotel", name: "Hotel Astoria", desc: "Habitación 414: la delegación alemana" },
      { id: "exteriores", name: "Ministerio de Exteriores", desc: "Dos copias: una oficial, una real" },
    ],
  },
  {
    id: "FRA-VERS",
    country: "FR",
    title: "La trampa de Versalles",
    tagline: "PARIS 1919",
    year: "1919",
    difficulty: 1,
    stake: 120,
    subject: "el Tratado de Versalles",
    briefing:
      "Una paz para terminar con todas las guerras que engendró la peor de todas. Cinco plumas escribieron Versalles: quién escondió la trampa dentro del tratado.",
    recap:
      "LO REAL: el Tratado de Versalles (1919) impuso a Alemania el artículo 231 ('culpa de guerra'), reparaciones colosales, pérdida de territorios y un ejército de juguete. Clemenceau quería seguridad, Wilson quería un mundo razonable, y el resultado fue un tratado demasiado duro para convivir y demasiado blando para impedir el revanchismo. Veinte años después, alguien prometió borrarlo con fuego.",
    suspects: [
      { arch: "DIPLOMATICO", name: "El Tigre del Quai d'Orsay", desc: "Multó a un imperio entero", motive: "Seguridad de Francia a base de factura" },
      { arch: "GENERAL", name: "El Mariscal Vencedor", desc: "Quiere dejar a Alemania sin dientes", motive: "Nunca más una invasión desde el este" },
      { arch: "INDUSTRIAL", name: "El Tesorero de Reparaciones", desc: "Cuenta carbón, oro y locomotoras", motive: "Cobrar hasta el último marco" },
      { arch: "PROPAGANDISTA", name: "El Idealista Engañado", desc: "Llegó con 14 puntos, firmó con 448 artículos", motive: "Vender la paz en casa" },
      { arch: "AGENTE", name: "El Cartógrafo de Salones", desc: "Corta regiones con regla y compás", motive: "Redibujar Europa sin preguntar a Europa" },
    ],
    locations: [
      { id: "espejos", name: "Salón de los Espejos", desc: "Donde se firmó y se conspiró" },
      { id: "quai", name: "Quai d'Orsay", desc: "Memorandos y mapas de embajada" },
      { id: "crillon", name: "Hotel Crillon", desc: "Sede de la delegación: papeles por todos lados" },
      { id: "prensa", name: "Prensa de París", desc: "Filtraciones, titulares y opinión" },
    ],
  },
  {
    id: "JPN-PAC",
    country: "JP",
    title: "El combustible del Pacifico",
    tagline: "TOKIO 1941",
    year: "1941",
    difficulty: 3,
    stake: 220,
    subject: "la decisión de atacar Pearl Harbor",
    briefing:
      "Sin petróleo, la flota muere en el muelle; con petróleo, muere lejos de casa. Tokio apostó todo a un golpe de dados. Cinco figuras empujaron la apuesta: quién la cruzó primero.",
    recap:
      "LO REAL: en 1941 el embargo de EE.UU. dejó a Japón con reservas para dos años. El ejército (atascado en China) y la marina discutían: Norte contra URSS o Sur contra las Indias holandesas. La decisión del Sur implicaba guerra con EE.UU., y el almirante Yamamoto planeó el golpe preventivo a Pearl Harbor para comprar tiempo. La apuesta del 7-12-1941 ganó una batalla y perdió la guerra.",
    suspects: [
      { arch: "DIPLOMATICO", name: "El Negociador de Dos Agendas", desc: "Sonríe en Washington, firma en Tokio", motive: "Camuflar la decisión ya tomada" },
      { arch: "GENERAL", name: "El General del Ejército de Kwantung", desc: "La guerra en China no se puede parar", motive: "Ni un paso atrás en Manchuria" },
      { arch: "INDUSTRIAL", name: "El Banquero del Zaibatsu", desc: "Calcula meses de crudo restantes", motive: "Un imperio económico o la bancarrota" },
      { arch: "PROPAGANDISTA", name: "El Cantor de la Destino", desc: "'Hakko Ichiu': ocho mares bajo un techo", motive: "El imperio como destino sagrado" },
      { arch: "AGENTE", name: "El Almirante de los Dados", desc: "Estudia Hawaii desde maquetas", motive: "Un golpe perfecto que compre dos años" },
    ],
    locations: [
      { id: "cuartel", name: "Cuartel de Kwantung", desc: "Mapas de Manchuria y egos más grandes" },
      { id: "astillero", name: "Astillero de Yokosuka", desc: "Portaaviones cargando aviones de juguete" },
      { id: "embajada", name: "Embajada en Washington", desc: "14 partes de un memorando interminable" },
      { id: "bolsa", name: "Bolsa de Tokio", desc: "El crudo, el arroz y los rumores" },
    ],
  },
];

// Pistas fuertes (fiabilidad ALTA) — {sus} sospechoso, {loc} ubicacion, {subj} asunto
export const DET_CLUE_STRONG: string[] = [
  "TELEGRAMA cifrado: {sus} ordenó ejecutar «{subj}» sin dejar registro escrito.",
  "ACTA de reunión secreta: {sus} firmó el plan operativo con fecha y sello del día previo.",
  "FOTO aérea desde {loc}: el convoy de {sus} se movió horas antes de los hechos.",
  "DIARIO personal: anotación de {sus} — «todo está listo. Que no queden testigos».",
  "REGISTRO bancario: 400.000 mon ingresadas a {sus} desde una cuenta fantasma del exterior.",
  "TESTIMONIO jurado: el ayudante de {sus} confirma su reunión de medianoche en {loc}.",
];

// Indicios (fiabilidad MEDIA)
export const DET_CLUE_WEAK: string[] = [
  "MEMO interno: {sus} pidió traslado justo después de «{subj}».",
  "TESTIMONIO: un portero vio a {sus} saliendo de {loc} a las 23:40.",
  "RECIBO: {sus} compró dos billetes con nombre falso el día previo.",
  "EXPEDIENTE: {sus} cambió su versión sobre el paradero tres veces.",
  "GUARDIA de turno: {sus} cruzó el control con un maletín 'diplomático'.",
  "CALENDARIO: la agenda de {sus} quedó borrada a mano para esa fecha.",
];

// Pistas falsas (fiabilidad BAJA — el ENGAÑO del instigador)
export const DET_CLUE_FAKE: string[] = [
  "'PRUEBA' sin fuente: un papel sin firmar señala a {sus}. La tinta está reciente.",
  "FOTO borrosa: alguien que se parece a {sus}, al 30% de parecido.",
  "RUMOR de pasillo: «dicen que fue {sus}». Nadie sabe quién lo dijo primero.",
  "TELEGRAMA recortado: solo se lee «...{sus}...» en una frase incompleta.",
  "ANÓNIMO mal escrito: acusa a {sus} y pide dinero a cambio de 'más pruebas'.",
];

// Respuestas de interrogatorio: inocentes (verdad parcial) y culpable (engaño)
export const DET_ANSWER_INNOCENT: string[] = [
  "Yo esa noche estaba en {loc}. Pero vi a {other} revisando papeles después de medianoche.",
  "Pregúntale a {other}: lo vi salir con una maleta doble el día previo.",
  "No sé nada de eso. Aunque {other} me pareció nervioso en la última reunión.",
  "Mi conciencia está limpia. Si buscas algo, registra {loc}: ahí se movía gente rara.",
  "Estuve con el ayudante de {other} toda la velada. Que lo confirme el registro.",
];

export const DET_ANSWER_GUILTY: string[] = [
  "¿Interrogarme a MÍ? Todos saben que {other} tenía más motivos que nadie.",
  "Yo jamás tocaría eso. Sospecha de {other}: su comportamiento fue... extraño.",
  "Qué pérdida de tiempo. Si buscas culpables, mira el pasado de {other}.",
  "Esa noche trabajaba por la paz. Lo que hizo {other} es otro asunto.",
];

// Bots detectives para llenar la sala
export const DET_BOT_NAMES: string[] = [
  "FOXTROT", "NAJERA", "VON DANZIG", "MARLOWE", "KOBAYASHI", "ROJAS", "COLUMBO", "RENARD",
];

export const DET_BOT_LINES: string[] = [
  "Ese indicio no convence. Fiabilidad baja.",
  "El telegrama apunta a otro sitio. Sigo mi línea.",
  "Tres pruebas fuertes y ninguna casualidad.",
  "A ver si el instigador no nos planta otra falsa.",
  "Yo me fío de los registros bancarios. Siempre.",
  "Nadie borra una agenda a mano por casualidad.",
  "Cuidado con los rumores de pasillo.",
  "Mi apuesta está hecha. Reconsideren.",
];
