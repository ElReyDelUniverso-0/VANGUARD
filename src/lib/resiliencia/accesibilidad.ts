// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · ENTREGABLE 11 — ACCESIBILIDAD EN EMERGENCIAS
//
// La regla que lo ordena todo: una evacuación es tan rápida como la persona
// más lenta del edificio. La preparación inclusiva no es una sección
// solidaria: es el cálculo del tiempo real de salida.
// ═══════════════════════════════════════════════════════════════════

export interface Barrera {
  perfil: string;
  barrera: string;
  solucionAntes: string;
  solucionDurante: string;
}

export const BARRERAS: Barrera[] = [
  {
    perfil: "Movilidad reducida, silla de ruedas, andador, prótesis",
    barrera: "Escaleras, rampas con pendiente dura, ascensor que se bloquea sin luz, rutas con bordes y puertas estrechas, autobuses de evacuación sin plataforma.",
    solucionAntes: "Ruta alternativa sin escaleras ensayada con cronómetro; silla de ruedas con neumáticos revisados y kit de reparación; plan de «quién ayuda y con qué técnica» firmado por la persona afectada (no se carga sin consentimiento).",
    solucionDurante: "Refugio en su propia planta si la planta es segura; zona de rescate priorizada con ubicación exacta escrita en el registro del edificio; andador y silla como equipo, no como moblaje: se llevan.",
  },
  {
    perfil: "Persona sorda o con discapacidad auditiva",
    barrera: "La alarma sonora, la sirena, la megafonía y la radio no son canales para ella; los vídeos oficiales sin subtítulos tampoco.",
    solucionAntes: "Alarma con luz estroboscópica y vibrador de almohada en casa; móvil con notificaciones de alerta activas y en modo vibración; vecino designado con la llave; lista de contactos de emergencia por mensaje, no por voz.",
    solucionDurante: "Aviso escrito en el canal del barrio con lengua de señas si existe; luz que se enciende y apaga para llamar la atención; instrucciones en mensajes cortos; intérprete en la rueda de prensa local cuando la situación dure días.",
  },
  {
    perfil: "Persona ciega o con baja visión",
    barrera: "Rutas señalizadas solo visualmente, señalética sin relieve ni sonido, información en PDF escaneado ilegible para el lector de pantalla, el bastón o el perro perdidos en la prisa.",
    solucionAntes: "Ruta recorrida y memorizada con un guía vidente; planos en relieve o audio; lista de teléfonos en braile o en el móvil con acceso por voz; mascota de asistencia identificada con su tarjeta.",
    solucionDurante: "Guía humano nombrado y estable (no «cualquiera»); descripción verbal continua del terreno y de los obstáculos; que la persona lleve sus propios auriculares para orientarse por el sonido ambiente; el perro va con su arnés y su agua.",
  },
  {
    perfil: "Discapacidad intelectual o del desarrollo, autismo",
    barrera: "La sirena y la multitud provocan crisis sensorial; las instrucciones abstractas no se entienden; el albergue es un sitio extraño, ruidoso y sin rutina.",
    solucionAntes: "Historia social con fotos: «así suena la alarma, así es el albergue, así se hace la fila»; kit sensorial (auriculares, gorra, manta de peso, objeto de calma) dentro de la mochila; tarjeta plastificada con nombre, diagnóstico funcional y teléfonos.",
    solucionDurante: "Un adulto de referencia que la acompañe; anticipar cada paso con frases cortas y literales; espacio de calma apartado del ruido; no separarla del objeto de calma «porque no es momento».",
  },
  {
    perfil: "Persona mayor que vive sola, con deterioro cognitivo o con miedo a dejar la casa",
    barrera: "No oye, no ve, no se mueve, no usa el móvil, no confía en una orden dada por megafonía y se niega a irse con «unos papeles».",
    solucionAntes: "Red de acompañamiento con turno de visita diaria; números en letra grande pegados en la nevera; acuerdo con la familia y con la autoridad de qué se hace si se niega a evacuar; copia de llave de acceso en el registro del municipio.",
    solucionDurante: "Aviso en persona, con tiempo, con calma, con su objeto de referencia (fotos, medicación, su gato); la medicación se coge con la ropa, no al revés; no discutir: ofrecer una opción concreta y reversible.",
  },
  {
    perfil: "Persona con enfermedad crónica o que depende de tecnología (oxígeno, diálisis, bomba de insulina, respirador)",
    barrera: "El corte de luz es una emergencia médica; la medicación refrigerada se echa a perder; la diálisis se pierde y se paga con la vida.",
    solucionAntes: "Registro en la compañía eléctrica como cliente con necesidad asistencial; batería y reserva para 48 horas; lista de medicación con dosis y nombre comercial; contacto del centro sanitario que provee el tratamiento y su plan alternativo.",
    solucionDurante: "Traslada el tratamiento antes de la evacuación, no después; en el albergue, pide la nevera para medicación y la toma de corriente para el aparato: son derechos, no favores.",
  },
  {
    perfil: "Embarazadas, madres lactantes, bebés y niños pequeños",
    barrera: "Pañales y leche que no caben en la mochila, cunas imposibles de evacuar, refugios sin agua limpia ni privacidad, la lactancia interrumpida por el ruido y la mirada.",
    solucionAntes: "Kit de 72 horas con pañales, toallitas, leche adaptada si se usa, biberón esterilizable, ropa de abrigo y un objeto de calma por niño; la cuna se cambia por un capazo que se pueda llevar.",
    solucionDurante: "Los niños se visten primero y se les da tarea (la linterna, la mochila pequeña); se busca un rincón con privacidad para amamantar; se les explica qué pasa con frases cortas y verdaderas, sin prometer lo que no depende de ti.",
  },
  {
    perfil: "Personas sin hogar, migrantes sin documentos, minorías perseguidas, víctimas de violencia",
    barrera: "No hay dirección a la que avisar, no hay confianza en la autoridad, hay miedo a un registro o a un control migratorio en el albergue, y no hay documentación que presentar.",
    solucionAntes: "Canales a través de organizaciones de referencia (albergues, parroquias, ONG, casa de acogida); red de confianza con nombre y teléfono; documentos custodiados por la entidad, no por la persona.",
    solucionDurante: "Refugio donde no se pida documento ni se avise a nadie fuera; admisión de mascotas y de pareja; acceso sin cita ni formulario; información clara de qué datos se registran y con qué fin.",
  },
];

export const INCLUSION = {
  principios: [
    { titulo: "«Nada sobre nosotros sin nosotros»", texto: "Quien necesita el plan lo escribe. Un plan diseñado sin las personas con discapacidad y sin las personas mayores deja fuera justo lo que no se puede improvisar." },
    { titulo: "Capacidad, no déficit", texto: "La pregunta útil no es «qué le pasa a esta persona» sino «qué puede hacer y con qué apoyo». Un usuario de silla de ruedas sabe exactamente qué necesita; un bombero no siempre lo sabe." },
    { titulo: "Registro con consentimiento", texto: "La lista de hogares que necesitan ayuda para evacuar funciona si la gente se apunta y si puede borrar sus datos. Es un registro de apoyo, no de vigilancia: la autoridad local lo explica por escrito." },
    { titulo: "Sistema de compañeros (buddy system)", texto: "Dos o tres casas que se comprometen a avisarse y a ayudarse, con nombre y con un plan B si una de las partes no está. Es el mecanismo más eficaz y más barato que existe en todo el mundo." },
    { titulo: "Accesibilidad = tiempo", texto: "Todo lo que se añade a la ruta de una persona se suma al total del edificio. La pregunta de diseño no es «¿es correcto?» sino «¿cuántos segundos menos tarda la última persona en salir?»." },
  ],
  checklist: [
    "¿La alarma suena Y se ve y se vibra?",
    "¿Hay una ruta sin escaleras ensayada con cronómetro?",
    "¿Sabemos quién acompaña a quién y qué hacer si esa persona no está?",
    "¿La medicación y el aparato crítico están en la mochila, no en el cajón?",
    "¿El albergue admite animales de asistencia, nevera para medicación, toma de corriente y un rincón de calma?",
    "¿La información existe en texto grande, lengua de señas, audio y lectura fácil?",
    "¿Hay un canal directo con el centro de emergencias del municipio para avisos priorizados?",
  ],
  fuente: "OMS · salud en emergencias e inclusión · IFRC · inclusión de personas con discapacidad y de edad · Marco de Sendai (no dejar a nadie atrás) · Convención sobre los Derechos de las Personas con Discapacidad (artículo 11).",
};
