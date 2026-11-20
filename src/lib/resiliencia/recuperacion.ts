// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · ENTREGABLE 8 — GUÍAS DE RECUPERACIÓN COMUNITARIA
//
// La recuperación es la fase que nadie filma y la que decide cuántos años
// tarda una comunidad en volver a ser ella misma. Ordenada por tiempo real
// (horas, días, semanas, meses) y con lo que hay que pedir a quien.
// ═══════════════════════════════════════════════════════════════════

export interface GuiaRecuperacion {
  id: string;
  titulo: string;
  fase: string;
  lema: string;
  pasos: string[];
  derechos: string[];
  noHagas: string[];
  fuente: string;
}

export const RECUPERACION: GuiaRecuperacion[] = [
  {
    id: "primeras-horas",
    titulo: "Las primeras 72 horas: seguridad, personas y servicios",
    fase: "0 – 72 horas",
    lema: "Nada se arregla hoy que pueda romperte mañana; todo se registra hoy que pueda salvarte mañana.",
    pasos: [
      "Cuenta a las personas: familia, vecinos del portal, quienes faltan. Los nombres primero; los bienes después.",
      "Corta suministros si hay daño o sospecha: gas, electricidad y agua en la vivienda afectada, y avisa a la compañía con la dirección exacta.",
      "No entres en edificios con grietas nuevas, chimeneas partidas, suelos hundidos o esquinas desplomadas. La inspección es previa a la curiosidad.",
      "Haz la primera evaluación del barrio con lo que se puede ver sin riesgo: quién está sin agua, quién sin medicación, quién sin techo, quién sin luz y con un aparato vital.",
      "Monta el punto de apoyo comunitario: agua potable, un lugar cargador de móviles, una mesa con papel y lápiz, y una lista de «qué falta y quién lo puede traer».",
      "Documenta con fotos y vídeo fechados: fachadas, interior, calles, el nivel del agua, el coche, el árbol caído. Sin foto, no hay expediente.",
    ],
    derechos: [
      "Atención sanitaria urgente y continuada de la medicación crónica: si la farmacia está cerrada, la autoridad sanitaria habilita el suministro.",
      "Alojamiento de emergencia si la vivienda no es segura; se solicita por los servicios sociales municipales.",
      "Prioridad en restablecimiento de servicios para hogares con dependencia de aparatos eléctricos o de asistencia domiciliaria.",
      "Atención psicológica de primeros auxilios: se pide, no hace falta estar «muy mal» para pedirla.",
    ],
    noHagas: [
      "No entres solo en una vivienda con olor a gas ni enciendas nada.",
      "No tires escombros ni enseres antes de que se haga la valoración: es la prueba del seguro y de las ayudas.",
      "No dejes que los niños jueguen en zona afectada: el clavo y el vidrio siguen ahí cuando la adrenalina baja.",
    ],
    fuente: "OCHA · coordinación de respuesta · IFRC · apoyo comunitario · PAHO · evaluación rápida de daños",
  },
  {
    id: "volver-casa",
    titulo: "Volver a casa (cuando la autoridad lo autorice)",
    fase: "1 – 14 días",
    lema: "El retorno es una maniobra, no una emoción.",
    pasos: [
      "Entra con luz de día, calzado cerrado, guantes, mascarilla contra moho y polvo, y con alguien más contigo.",
      "Recorre y huele: gas, agua, electricistas. Fotografía antes de mover nada y anota la hora.",
      "Ventila y deshumidifica desde el primer día; el moho empieza en 24-48 horas y es el daño de salud que llega tarde.",
      "Retira agua y materiales empapados no recuperables (yeso, lana de roca, moqueta, cartón, colchón) y guarda lo que se puede secar.",
      "No conectes la instalación hasta que un técnico la revise. No uses la chimenea ni la caldera si quedaron anegadas o con grietas.",
      "Si hubo ceniza, polvo fino o agua contaminada, limpia con paño húmedo y aspirador con filtro fino; no barras en seco.",
    ],
    derechos: [
      "Parte de siniestro al seguro en el plazo que fija la póliza (normalmente días, no semanas): el incumplimiento de plazo es la causa nº 1 de rechazo.",
      "Certificado o informe de los bomberos o de la autoridad local sobre el suceso: es el documento que abre trámites.",
      "Ayudas de emergencia municipal para enseres, alojamiento y realojo, y exenciones temporales de impuestos locales en muchos países.",
    ],
    noHagas: [
      "No te pongas a reparar «para que quede como antes» si la estructura está afectada: es la obra que se paga dos veces.",
      "No duermas en una casa con humedades y polvo en suspensión la primera semana.",
      "No aceptes «un adelantamiento» de un desconocido que ofrece arreglar el tejada: las estafas post-desastre tienen nombre y apellidos.",
    ],
    fuente: "FEMA/Ready.gov · «After a disaster» · IFRC · recuperación comunitaria",
  },
  {
    id: "salud-despues",
    titulo: "Salud física y mental después del evento",
    fase: "1 semana – 6 meses",
    lema: "La mitad de los problemas de salud de un desastre aparecen cuando ya no salen en las noticias.",
    pasos: [
      "Reanuda las consultas cortadas: crónicos, embarazadas, niños, salud mental, vacunas. El retraso de un mes se paga un año.",
      "Agua y alimentos: sigue el criterio oficial de aptitud; lava con agua segura, y no comas lo que estuvo sin frío.",
      "Moho y polvo: si aparece tos, pitos, irritación o crisis de asma, consulta y ventila. La casa no es segura si hay que contener la respiración para entrar.",
      "Sueño, alcohol, irritabilidad, llanto, recuerdos intrusivos, evitar el sitio del suceso: son respuestas frecuentes las primeras semanas. Se nombra, se comparte y se sostiene con rutina.",
      "Busca ayuda profesional si: no puedes funcionar, el malestar empeora pasadas las semanas, aparece consumo como anestesia, o hay ideas de dañarte. Esto último se dice a quien tienes delante, hoy.",
      "Apoya a los niños con hechos y con rutina: volver al colegio, dormir a su hora, poder preguntar y recibir una respuesta honesta y corta.",
      "Cuida a quien cuida: voluntariado, sanitarios, maestros, bomberos y madres y padres agotados necesitan relevo y descanso, no felicitaciones.",
    ],
    derechos: [
      "Atención de salud mental en el sistema público y en los equipos de emergencia: se solicita por los canales ordinarios y por los servicios sociales.",
      "Bajas y protección laboral en situaciones de duelo, realojo o atención a familiares, según la legislación de tu país.",
      "Continuidad del tratamiento y de la prestación farmacéutica cuando la farmacia o el centro de referencia están dañados.",
    ],
    noHagas: [
      "No esperes «a ver si se me pasa» con un insomnio que dura semanas o con una angustia que te impide trabajar.",
      "No dejes la medicación psiquiátrica «porque ahora estoy bien» sin decírselo a tu médico.",
      "No tomes sedantes ni alcohol para dormir después de un siniestro: es la receta del problema siguiente.",
    ],
    fuente: "OMS · primeros auxilios psicológicos y salud mental en emergencias · UNICEF · niños y desastres",
  },
  {
    id: "ayuda-mutua",
    titulo: "Ayuda mutua y organización comunitaria",
    fase: "días – meses",
    lema: "La comunidad no se recupera por solidaridad espontánea: se recupera porque alguien organiza la solidaridad.",
    pasos: [
      "Un solo punto de coordinación con lista de necesidades y de recursos, visible y actualizada a diario, y una persona responsable por semana.",
      "Reparto por tareas reales: cocina, compras, cuidado de niños, acompañamiento a mayores, traducción, transporte, gestión de trámites, reparación de viviendas.",
      "Cuaderno de acuerdos: qué se prometió, a quién, con qué plazo y con qué firma. La memoria del grupo es su capital.",
      "Convierte el «quién ayuda» en un turno: sin relevo, el voluntariado se agota en tres semanas y la gente se va a su casa con culpa.",
      "Coordina con la autoridad y con las organizaciones de socorro para no duplicar: pregunta qué necesitan ellos (a menudo: agua, traductores, listas fiables, no ropa usada).",
      "Cierra círculos: una reunión al final de cada mes, con lo conseguido, lo que no y quién se queda fuera.",
      "Recuerda a las personas que no pertenecen a ningún grupo: mayores solteros, recién llegados, familias sin red. Es la gente que la ayuda mutua no encuentra sola.",
    ],
    derechos: [
      "Participación: los planes municipales de emergencia y de recuperación se pueden consultar y alegar, y las asociaciones tienen cauce para hacerlo.",
      "Acceso a la información sobre ayudas, expedientes y criterios, con la tutela que la ley del país prevea.",
      "Uso de espacios públicos (local, polideportivo, parroquia) como punto de apoyo si se solicita formalmente y hay acuerdo.",
    ],
    noHagas: [
      "No aceptes ni reparta donaciones en especie que no se pidieron: ropa usada y comida no apta pueden bloquear la logística.",
      "No conviertas el grupo de mensajería en una cadena de peticiones sin filtro: el ruido apaga al que de verdad necesita.",
      "No grabes ni publiques a víctimas y personas mayores en su peor momento «para concienciar».",
    ],
    fuente: "IFRC · comunidad que responde · OCHA · coordinación civil-militar y de clusters",
  },
  {
    id: "escombros",
    titulo: "Escombros, limpieza y rehabilitación",
    fase: "1 semana – 6 meses",
    lema: "El orden del retiro importa tanto como la retirada.",
    pasos: [
      "Primero se separa lo peligroso: amianto, residuos químicos, baterías de litio, medicamentos, bombonas, neveras, neumáticos. Se avisa y se deja señalizado.",
      "Antes de retirar el yeso, la madera y el enlucido empapados, que un técnico valore estructura, humedades y aislamiento: se abre la pared para cerrarla bien, no para «dejarla como estaba».",
      "Acopio en un punto único por calle, con horas y con permiso, para que la recogida sea rentable y las aceras no desaparezcan. Un barrio con escombros no evacúa ni accede.",
      "Documenta el origen y el volumen: es lo que la administración necesita para el coste del servicio y lo que tú necesitas para la reclamación.",
      "Reutiliza lo que se puede (ladrillo, madera, puerta, vigas) antes de tirarlo: la gestión de residuos en desastre es cara, lenta y a veces inexistente.",
      "En obra: secar antes de cerrar, rehabilitar instalaciones, y no reconstruir la misma ventana en el mismo sitio si el agua volvió a entrar por ahí.",
      "Contrata con presupuesto cerrado, plazos y licencia; exige seguro de responsabilidad civil y un responsable identificado. Desconfía del que cobra en efectivo sin recibo el día después.",
    ],
    derechos: [
      "Gestión municipal de residuos de demolición y puntos limpios con recogida extraordinaria en situaciones declaradas.",
      "Licencias ambientales y de obra aceleradas en muchos países tras una emergencia: se pueden pedir por vía de urgencia.",
      "Ayudas a la rehabilitación con criterio de mejora de seguridad (no solo de estética): en muchas convocatorias la mejora sísmica, energética o de inundación puntúa.",
    ],
    noHagas: [
      "No quemes restos en el solar: es una infracción y, con viento, un incendio.",
      "No mezcles amianto ni vidrio con el resto: el trabajador de la recogida paga tu prisa.",
      "No dejes una escalera o un hueco abierto «un momento»: el barrio está lleno de niños curiosos y de personas mayores.",
    ],
    fuente: "UNDRR · reconstruir mejor · OMS · saneamiento y residuos en emergencias",
  },
  {
    id: "economia",
    titulo: "Recuperación económica del barrio",
    fase: "1 mes – 2 años",
    lema: "Si el comercio cierra, la comunidad se va. Si el comercio abre, la comunidad vuelve.",
    pasos: [
      "Censo de daño del pequeño comercio y de la hostelería, con fecha de apertura prevista: la administración prioriza por evidencia, no por queja.",
      "Recuperar la calle antes que el local: luz, agua, acceso, limpieza, señalización de obras. La gente pasea donde puede pasear.",
      "Compra local en la fase de arranque: la caja del primer mes decide qué negocios siguen abiertos.",
      "Revisa tu seguro y tu financiación: la póliza de lucro cesante, el aplazamiento fiscal, la línea de reactivación y la garantía de aval público. Se pide pronto y por escrito.",
      "Adapta el negocio al riesgo que lo paró: elevación de cuadros, barreras, puerta de agua, generador, copia de datos, y un horario de cierre y arranque ensayado.",
      "Si el turismo o el sector dominante cayó, negocia un plan conjunto con el municipio: un barrio sin clientes no se levanta con subvenciones de un día.",
      "Vuelve a asegurar. Sin póliza nueva, la siguiente tormenta es la última vez que existes.",
    ],
    derechos: [
      "Líneas de financiación blanda y moratorias fiscales y de seguros sociales, según el país y la declaración del evento.",
      "Bonificaciones de terrazas, ocupación de vía pública y licencias de obra menor en zonas declaradas afectadas.",
      "Aplazamiento o fraccionamiento de recibos de suministros y de comunidad en caso de fuerza mayor.",
    ],
    noHagas: [
      "No despidas «porque no hay caja» sin mirar antes las ayudas de suspensión y los expedientes: es la decisión más cara a largo plazo.",
      "No vuelvas a abrir en un local que no pasó inspección estructural ni eléctrica.",
      "No fíes la reapertura a un solo cliente: la recuperación local necesita que la comunidad compre aquí.",
    ],
    fuente: "OCHA · recuperación temprana y medios de vida · Banco Mundial / BID · evaluación de necesidades posdesastre (PDNA)",
  },
  {
    id: "aprender",
    titulo: "Aprender y no volver a construir el mismo riesgo",
    fase: "3 meses – siempre",
    lema: "El peor desastre es el que se repite con el mismo plano.",
    pasos: [
      "Informe del barrio con fecha, cifras, lo que funcionó y lo que no, hecho por quien estaba allí, no solo por quien vino de fuera.",
      "Lecciones concretas y asignadas: qué se cambia, quién, cuándo y con qué presupuesto. «Reflexionar» no es una medida.",
      "Traslada el aprendizaje al planeamiento: ordenanzas, cotas de inundación, retiro de cauce, refuerzo de cubierta, sombra, drenaje, mantenimiento de laderas.",
      "Memoria pública: una placa, un archivo, un mapa de inundaciones en la pared del ayuntamiento o de la escuela. El riesgo se olvida en una generación; el olvido se paga.",
      "Actualiza el plan familiar, el del edificio y el escolar con lo aprendido, y enséñalo al vecino nuevo.",
      "Compárate con otra comunidad que pasó por lo mismo: la red entre municipios es el atajo más barato que existe.",
    ],
    derechos: [
      "Acceso al informe oficial de la emergencia y a las conclusiones de la comisión de investigación cuando la haya.",
      "Participación en la revisión del planeamiento y del plan territorial de protección civil.",
      "Que la evaluación de riesgo esté disponible para cualquier persona que vaya a comprar o alquilar en la zona.",
    ],
    noHagas: [
      "No dejes la reconstrucción sin vigilancia ciudadana: la fase de obra es cuando más se relaja la norma.",
      "No te conformes con «ya no pasará» : las mismas condiciones meteorológicas y geológicas siguen ahí.",
      "No permitas que el olvido sea la política: el archivo del barrio es un bien común.",
    ],
    fuente: "UNDRR · Marco de Sendai, prioridad 4 (reconstruir mejor) · IDPEM · lecciones de desastres",
  },
];

export const FASES_RECUPERACION = [
  { nombre: "Emergencia", cuando: "0 – 72 h", foco: "Vida, seguridad, aviso, evacuación, albergue, primer conteo." },
  { nombre: "Estabilización", cuando: "3 – 14 días", foco: "Servicios básicos, alojamiento, agua potable, salud, registro de daños, información diaria." },
  { nombre: "Recuperación temprana", cuando: "2 semanas – 6 meses", foco: "Volver a la actividad, comercios, escuelas, limpieza y escombros, apoyo psicosocial, trámites." },
  { nombre: "Reconstrucción", cuando: "6 meses – años", foco: "Reconstruir mejor, revisar normas, reasegurar, memoria y aprendizaje, devolver la comunidad a sí misma." },
];
