// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · ENTREGABLE 13 — COMUNICACIÓN COMUNITARIA
//
// En un desastre la infraestructura crítica no es el puente: es el canal por
// el que la comunidad sabe qué hacer y dónde está la gente. Aquí está el
// diseño de ese canal con reglas que se pueden aplicar mañana.
// ═══════════════════════════════════════════════════════════════════

export interface HerramientaComunicacion {
  canal: string;
  sirve: string;
  falla: string;
  regla: string;
}

export const CANALES: HerramientaComunicacion[] = [
  {
    canal: "Llamada de voz",
    sirve: "Confirmar en 15 segundos que una persona está bien y qué necesita.",
    falla: "Se satura la red en las primeras horas de un evento grande; cuesta que conecte justo cuando todos llaman.",
    regla: "Si la llamada no va a los dos intentos, pasa a SMS o mensaje de datos: ocupan menos red y llegan después.",
  },
  {
    canal: "SMS",
    sirve: "El mensaje corto llega cuando la voz no conecta, y funciona con cobertura mínima.",
    falla: "No admite adjuntos ni ubicación precisa; se pierde si la gente escribe novelas.",
    regla: "Formato de tres campos: QUÉ + DÓNDE + QUÉ NECESITO. «Estoy bien, en casa de Ana, calle Mayor 4, no hace falta que vengas».",
  },
  {
    canal: "Mensajería (grupo de barrio)",
    sirve: "Coordinar ayuda, compartir fotos de la calle, organizar quien baja a por agua.",
    falla: "Se convierte en altavoz de bulos y en un canal donde se difunden direcciones y datos de personas.",
    regla: "Un solo canal oficial del barrio, dos administradores, reglas escritas fijadas, y prohibido publicar datos personales de afectados o fotos de víctimas.",
  },
  {
    canal: "Radio (analógica y de emergencias)",
    sirve: "No depende de tu operador ni de tu batería: es el último canal vivo cuando todo lo demás cayó.",
    falla: "Nadie sabe sintonizar la frecuencia y nadie tiene pilas en la radio.",
    regla: "Anota en la nevera la frecuencia oficial de avisos de tu país y deja una radio de manivela con pilas de repuesto junto a la mochila.",
  },
  {
    canal: "Puerta a puerta / voz",
    sirve: "Es el único canal que llega a quien no tiene móvil, no oye, no lee o está desconectado del mundo.",
    falla: "Se omite porque «ya lo verá en el grupo», y no lo ve.",
    regla: "Turnos de avisadores por tramo de portal, con hoja de firma: quién avisó a quién y a qué hora.",
  },
  {
    canal: "Pizarra / cartel del portal",
    sirve: "Información pública, sin pantalla, para todo el edificio, legible a las tres de la mañana.",
    falla: "Se desactualiza y la gente sigue las instrucciones viejas.",
    regla: "Siempre con hora escrita y una línea de «esto caduca el…»; si no la tiene, se borra.",
  },
  {
    canal: "Canal de la autoridad",
    sirve: "Es la única fuente de nivel de alerta, orden de evacuación y fin de alerta.",
    falla: "Se mezcla con cuentas paródicas y con «periodistas ciudadanos» que reenvían sin comprobar.",
    regla: "Guarda en favoritos el perfil verificado de la protección civil de tu país y de tu municipio; si no lo tienes, búscalo ahora, no después.",
  },
];

export const ARBOL_LLAMADAS = {
  titulo: "El árbol de llamadas, en 4 niveles",
  texto:
    "Una sola persona no llama a cuarenta vecinos: llama a tres, y cada una de esas tres llama a tres más. Se escribe en papel, se prueba una vez al año y se actualiza cuando alguien se muda. En un evento real, el árbol se activa con un mensaje-semilla de una línea y cada nodo responde «hecho» al que le llamó.",
  niveles: [
    "Nivel 0 · el coordinador del barrio: decide y lanza el mensaje-semilla.",
    "Nivel 1 · tres responsables de zona (calle par, calle impar, portal alto).",
    "Nivel 2 · cada responsable llama a cinco casas y confirma las tres vulnerables.",
    "Nivel 3 · cada casa responde con QUÉ/DÓNDE/QUÉ NECESITO, y avisa a quien tenía apuntado.",
  ],
  nota: "Regla de oro del árbol: quien llama no improvisa el guion. El guion está escrito, y dice qué NO hay que decir.",
};

export const REGLAS_BULOS = {
  titulo: "Cómo se corta un bulo en el canal del barrio",
  reglas: [
    "Antes de reenviar: ¿quién lo dice, cuándo, y dónde lo publicó la autoridad?",
    "Tres comprobaciones que cuestan dos minutos: la fecha de la imagen (búsqueda inversa), el lugar real (¿hay un elemento que lo delate?), y si el mismo texto corre desde hace años.",
    "Una vez lanzado el bulo, la rectificación tiene que ser más rápida que el bulo: misma sala, mismo formato, sin discutir con nadie por escrito.",
    "Quien difunde sin querer se corrige en privado; quien difunde para sembrar pánico se le retira el canal, se anota y se informa a la autoridad.",
    "No se comparte información sobre víctimas, menores, direcciones de personas desalojadas ni fotos del daño de un vecino sin su permiso.",
    "La regla de oro: si una información útil no está en el canal oficial, se PREGUNTA al canal oficial; no se la inventa nadie «para ayudar».",
  ],
  fuente: "OMS · gestión de la infodemia en emergencias; IFRC · comunicación comunitaria y confianza",
};

export const COMUNICACION_ACCESIBLE = {
  titulo: "Que el aviso llegue a todas las cabezas",
  puntos: [
    "Lenguaje llano: frases de sujeto-verbo-objeto, una instrucción por frase, sin acrónimos internos.",
    "Doble canal siempre: lo que suena (sirena, megafonía) tiene que estar escrito (cartel, mensaje, pantalla); lo que se escribe tiene que poder oírse o leerse en voz alta.",
    "Subtítulos y transcripción en cualquier audio que se difunda; intérprete de lengua de señas o vídeo en lengua de señas en la rueda de prensa local si hay comunidad sorda.",
    "Lectura fácil y pictogramas para quien tiene discapacidad intelectual; la tarjeta con la instrucción debe poder entenderla un niño de ocho años.",
    "Idiomas: en un barrio con población migrante, el aviso se traduce a las lenguas que se hablan allí, aunque sea con la comunidad: no es un lujo, es la diferencia entre evacuación y víctima.",
    "Formato grande, alto contraste y sin parpadeos rápidos para quien tenga baja visión o epilepsia fotosensible.",
    "Nada de «mira el PDF»: en una emergencia el dato tiene que estar en el cuerpo del mensaje.",
  ],
  fuente: "OMS · comunicación de riesgos accesible; IFRC · comunicación comunitaria inclusiva",
};

export const QUE_SE_COMUNICA = {
  titulo: "El mensaje que sirve: cuatro campos",
  campos: [
    { campo: "QUÉ pasa", texto: "«Corte de agua en el barrio alto por rotura en la avenida.»" },
    { campo: "DÓNDE y hasta cuándo", texto: "«De la calle 12 a la 30, previsiblemente hasta las 20 h.»" },
    { campo: "QUÉ hago", texto: "«Llena un bidón ahora; no abras la llave general sin necesidad.»" },
    { campo: "DÓNDE se actualiza", texto: "«Este canal y la web municipal; no hagáis caso de audios de WhatsApp.»" },
  ],
  nota: "Un mensaje sin «qué hago» genera ansiedad y llamadas inútiles; un mensaje sin «dónde se actualiza» genera bulos.",
};
