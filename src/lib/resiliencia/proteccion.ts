// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · ENTREGABLE 5 — INFORMACIÓN DE PROTECCIÓN CIVIL
//
// Cómo funciona de verdad la protección civil, explicada a quien la va a
// recibir por la emisora a las tres de la mañana. Nada de esta página emite
// alertas: los niveles, avisos y órdenes los declara la autoridad oficial de
// cada país, y la casa los respeta y los enlaza.
//
// LÍNEA ROJA CUMPLIDA: no se publican instrucciones de violencia, ataques ni
// sabotaje, ni nada que se parezca. Esto es organización civil de cuidados.
// ═══════════════════════════════════════════════════════════════════

export interface ConceptoPC {
  titulo: string;
  texto: string;
}

export interface CadenaPaso {
  quien: string;
  queHace: string;
  cuandoEmpieza: string;
}

export const QUE_ES_PC: ConceptoPC[] = [
  {
    titulo: "Protección civil es organización, no heroísmo",
    texto:
      "En cualquier país, la protección civil es el sistema que organiza la prevención, la preparación, la alerta, la evacuación y la atención de emergencias. Su base no son los profesionales: son la ciudadanía organizada, los bomberos, la sanidad, las fuerzas y cuerpos de seguridad, las Fuerzas Armadas cuando se les pide apoyo y las organizaciones de socorro. En español, «protección civil» también designa al servicio público concreto que coordina todo eso; en inglés se llama «civil protection» o «emergency management».",
  },
  {
    titulo: "Ciclo completo: cuatro fases que se solapan",
    texto:
      "Prevención (que el peligro no se convierta en daño: construir fuera de la llanura inundable, fijar la estantería), Preparación (planes, mochilas, simulacros, sistemas de alerta), Respuesta (lo primero: aviso, evacuación, rescate, socorro, albergue) y Recuperación (volver, reparar, aprender y dejar el sitio más seguro que antes). Los países que solo invierten en respuesta pagan el doble en la fase siguiente.",
  },
  {
    titulo: "Quién manda durante una emergencia",
    texto:
      "En el lugar de los hechos manda el incidente una autoridad designada (jefe de bomberos, coordinador de emergencias municipal, delegación del gobierno, según el país), y la cadena es única: la comunidad reporta, el municipio activa, la región o nación refuerza. Lo que NO es la cadena: un cargo electo dando instrucciones operativas por redes sociales. Si hay dos órdenes distintas, gana la que emite el centro de emergencias.",
  },
  {
    titulo: "El número único de emergencias",
    texto:
      "112 en la Unión Europea y en otros muchos países, 911 en gran parte de América, y números propios en otros. Se marca para peligro vital, incendio, colapso, accidente o persona que necesita ayuda urgente. Se usa SIN miedo a molestar y se dice, por este orden: qué pasa, dónde, cuántos afectados, tu teléfono. Se cuelga cuando lo digan: la operadora puede necesitar preguntar de nuevo.",
  },
  {
    titulo: "Una orden de evacuación no es una sugerencia",
    texto:
      "Las autoridades suelen usar dos registros: «prepararse/advertencia» (puede que tengas que irte: cierra el gas, carga el coche, llama a tu contacto) y «orden/evacuación obligatoria» (te vas ya). Las órdenes se dan con tiempo suficiente para salir andando y suelen apoyarse en puerta a puerta en los barrios con gente vulnerable. La policía puede cerrar el acceso después; en ese caso, no se entra «a por el pasaporte».",
  },
  {
    titulo: "El estado de emergencia es una figura jurídica",
    texto:
      "Lo declara una autoridad con una duración y unos efectos concretos (movilizar recursos, limitar circulación, requisar medios, habilitar gastos). Esta casa no declara, no anticipa ni opina sobre si «debería» declararse: solo explica para qué sirve y dónde se anuncia, que es el boletín oficial y el canal de la autoridad del país.",
  },
];

/** Las cuatro fases, con el papel de cada agente. */
export const CADENA: CadenaPaso[] = [
  { quien: "Tú y tu casa", queHace: "Primeros auxilios, apagar un conato, cortar gas si huele, avisar al 112/911, sacar a los vecinos del rellano si pueden salir.", cuandoEmpieza: "Segundo 0" },
  { quien: "Vecindario y comunidad organizada", queHace: "Bomberos voluntarios, brigadas vecinales, Protección Civil local, radios de apoyo, guías locales: saben quién vive solo y por dónde se sale.", cuandoEmpieza: "Primeros minutos" },
  { quien: "Servicios de emergencia municipales", queHace: "Bomberos, ambulancias, policía local, protección civil municipal: control del incidente, corte de viales, albergue, conteo de personas.", cuandoEmpieza: "Minutos a media hora" },
  { quien: "Autoridad regional y nacional", queHace: "Activa el plan territorial, pide apoyo de otras regiones, moviliza medios aéreos y unidades militares de emergencias si se solicitan, informa a la población.", cuandoEmpieza: "Cuando el municipio se desborda" },
  { quien: "Cooperación internacional", queHace: "Si el país lo pide, entran los mecanismos regionales (en Europa, el mecanismo de protección civil de la UE), la Federación Internacional y el coordinador de la ONU en el país.", cuandoEmpieza: "Horas o días, según el tamaño del evento" },
];

/** Vocabulario de avisos: qué significa cada palabra que vas a oír. */
export const AVISOS: { palabra: string; significa: string; tuHaces: string }[] = [
  { palabra: "Información preventiva / boletín", significa: "Hay condiciones que conviene vigilar; no hay obligación de hacer nada.", tuHaces: "Lee, entérate y guarda el número de la autoridad. Es el momento de revisar tu plan." },
  { palabra: "Vigilancia (watch)", significa: "El fenómeno es posible en la zona en las próximas 24-48 horas.", tuHaces: "Prepara: llena agua, carga baterías, limpia canalones, revisa dónde dormirías si tu casa no aguanta." },
  { palabra: "Aviso / alerta (warning)", significa: "El fenómeno es inminente o está ocurriendo.", tuHaces: "Actúa ya: refúgiate, corta suministros si te lo dicen, aléjate de ventanas y de la costa." },
  { palabra: "Advertencia de evacuación", significa: "Puede que tengas que irte en horas.", tuHaces: "Mochila preparada, vehículo listo, personas vulnerables avisadas, decides con la autoridad si te vas ya." },
  { palabra: "Orden de evacuación", significa: "Debes abandonar la zona de forma inmediata.", tuHaces: "Te vas con lo puesto y la mochila, por la ruta indicada, al punto señalado. Avisas a tu contacto fuera." },
  { palabra: "Confinamiento (shelter-in-place)", significa: "Quédate dentro, no salgas a la calle; hay un peligro fuera (humo, sustancia, viento, tiroteo ajeno a ti).", tuHaces: "Cierra puertas y ventanas, apaga la ventilación que toma aire exterior, tapa rendijas con paño húmedo, ponte en la habitación interior con la radio encendida." },
  { palabra: "Fin de la alerta / «all clear»", significa: "La autoridad declara que el peligro inmediato pasó; puede quedar restricción de acceso.", tuHaces: "Vuelve solo cuando lo diga, y revisa casa, suministros y personas antes de llamar a nadie más." },
];

/** Los simulacros: por qué y cómo se hacen bien. */
export const SIMULACROS: { titulo: string; texto: string }[] = [
  { titulo: "Un simulacro vale por diez folletos", texto: "Lo que salva en una emergencia es lo que el cuerpo hace sin pensarlo, y eso solo se consigue ensayando. Un centro, una fábrica o un barrio que hace dos simulacros al año evacúa en la mitad de tiempo, y el tiempo es la variable que más pesa en los primeros minutos." },
  { titulo: "Cómo se diseña uno que no sea teatro", texto: "Se avisa a la comunidad, no a las personas concretas; se introduce una condición (de noche, con una salida cortada, con una persona que no puede caminar); se cronometra; se apunta todo lo que falló; y se corrige antes del siguiente. Sin medición, el simulacro es una foto." },
  { titulo: "Qué se mide", texto: "Tiempo total, tiempo de las personas más lentas, cuántas salieron por la ruta equivocada, cuántos no oyeron la alarma, si el punto de reunión permite el conteo, si los vehículos de emergencia caben, y si alguien se quedó dentro." },
  { titulo: "Qué NO se hace en un simulacro", texto: "No se finge una tragedia para escarmentar a nadie, no se excluye a quien necesita apoyo «porque molesta», y no se publica un vídeo que asuste al vecindario. La confianza de la comunidad es el recurso más valioso y el primero que se pierde." },
];

export const PC_FUENTE =
  "Fuentes citadas: UNDRR · Marco de Sendai 2015-2030 · OCHA · coordinación de asistencia humanitaria · IFRC · Protección civil y comunidades seguras · directrices nacionales de protección civil de cada país.";
