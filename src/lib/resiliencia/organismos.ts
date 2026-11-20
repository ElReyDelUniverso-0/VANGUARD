// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · ENTREGABLES 6 y 15 — ORGANISMOS OFICIALES Y
// RECURSOS POR PAÍS
//
// El directorio conecta el centro con la geografía de la casa: cada país con
// recursos tiene su propia página (/resiliencia/recursos/<iso>) enlazada con
// su ficha (/mundos/<iso>) y con los datos vivos.
//
// TRES DISCIPLINAS DE ESTE ARCHIVO:
// ① Ningún teléfono inventado. El campo `numero` solo lleva números de
//   dominio público; donde no hay certeza, es `null` y se manda a la
//   autoridad local. Un número mal escrito en una emergencia es una vida.
// ② Ningún enlace exterior (regla de oro): las entidades se nombran y se
//   describen; cada lector las busca en su país.
// ③ Ninguna alerta emitida ni ninguna emergencia declarada: aquí se explica
//   quién lo hace y cómo se lee, nunca «qué está pasando ahora».
// ═══════════════════════════════════════════════════════════════════

export interface Organismo {
 nombre: string;
 siglas: string | null;
 /** qué hace, en una línea */
 rol: string;
 /** a qué se dedica cuando hay un evento */
 nivel: "nacional" | "regional" | "local" | "sociedad";
}

export interface PaisResiliencia {
 iso2: string;
 /** los peligros que la bibliografía pública asocia al territorio (educativo) */
 peligros: string[];
 /** número único de emergencias, o null si cada servicio tiene el suyo */
 numero: string | null;
 /** otros números conocidos, solo si son de dominio público y estables */
 otrosNumeros: { texto: string; nota: string }[];
 /** cómo llega el aviso oficial a la población */
 aviso: string;
 /** el marco o plan nacional, en texto */
 marco: string;
 organismos: Organismo[];
 /** notas de verificación honestas */
 notas: string[];
}

export const ORGANISMOS_GLOBALES: Organismo[] = [
 { nombre: "Federación Internacional de Sociedades de la Cruz Roja y de la Media Luna Roja", siglas: "FICR", rol: "Movimiento humanitario con redes locales en casi todos los países: preparación comunitaria, primera respuesta, apoyo psicosocial y evaluación de vulnerabilidad y capacidad (VCA).", nivel: "sociedad" },
 { nombre: "Plataforma para la Reducción del Riesgo de Desastres (ONU) — Marco de Sendai", siglas: "UNDRR", rol: "Define el marco mundial, publica los indicadores con los que los países reportan y mantiene la campaña de ciudades resilientes.", nivel: "regional" },
 { nombre: "Oficina de Coordinación de Asuntos Humanitarios (ONU)", siglas: "OCHA", rol: "Coordinación internacional de respuesta y datos operativos en emergencias grandes.", nivel: "regional" },
 { nombre: "Organización Mundial de la Salud", siglas: "OMS", rol: "Salud pública en emergencias: agua, calidad del aire, comunicación de riesgos, primeros auxilios psicológicos y gestión de la infodemia.", nivel: "regional" },
 { nombre: "Organización Panamericana de la Salud", siglas: "OPS", rol: "Brazo regional para las Américas: hospitales seguros, agua y saneamiento, epidemias y resiliencia del sistema de salud.", nivel: "regional" },
 { nombre: "Organización Meteorológica Mundial", siglas: "OMM", rol: "Coordina los servicios meteorológicos nacionales y los sistemas de alerta de Ciclones Tropicales y de crecidas.", nivel: "regional" },
 { nombre: "Servicio de Gestión de Emergencias de Copérnico", siglas: "Copernicus EMS", rol: "Cartografía de emergencia por satélite para inundación, incendio, sismo y conflictos, activada por la autoridad del país.", nivel: "regional" },
 { nombre: "Sistema de Alerta y Coordinación en Casos de Desastre (ONU)", siglas: "GDACS", rol: "Alertas automáticas mundiales de sismo, tsunami, ciclón e inundación, con una estimación de impacto para la cooperación.", nivel: "regional" },
 { nombre: "Dirección General de Protección Civil y Ayuda Humanitaria de la Comisión Europea", siglas: "ECHO / rescEU", rol: "Mecanismo de protección civil de la UE: medios compartidos y activación cuando un país europeo se ve desbordado.", nivel: "regional" },
 { nombre: "Agencia de Emergencias de Gestión de Desastres del Caribe", siglas: "CDEMA", rol: "Coordinación regional caribeña de preparación y respuesta ante ciclones, sismos y amenazas multi-peligro.", nivel: "regional" },
 { nombre: "Comité Internacional de la Cruz Roja", siglas: "CICR", rol: "Acción humanitaria en contextos de violencia y conflicto; restablecimiento del contacto entre familias.", nivel: "sociedad" },
];

/** Los países con recursos propios: la lista se deriva de este objeto. */
export const PAISES: Record<string, PaisResiliencia> = {
 do: {
  iso2: "do",
  peligros: ["ciclon", "inundacion", "deslizamiento", "sismo", "sequia", "calor", "aire"],
  numero: "911",
  otrosNumeros: [
   { texto: "9-1-1 (CRES)", nota: "Centro de Regulación de Emergencias y Seguridad 9-1-1: emergencias médicas, bomberos, policía y seguridad ciudadana en el mismo número." },
   { texto: "Cuerpo de Bomberos (municipal)", nota: "En Santo Domingo y en los municipios principales hay cuerpo de bomberos propio: el número varía por municipio, confírmalo con tu ayuntamiento." },
  ],
  aviso:
   "El COE emite los boletines y las alertas (verde/amarilla/roja según el nivel) y los traslada a alcaldías, medios y redes oficiales; ONAMET y el Centro de Pronósticos anuncian la evolución de ciclones y los acumulados de lluvia. No existe una única alarma pública general para todo el país: el canal es el boletín oficial y la radio.",
  marco:
   "La Ley 147-02 sobre la Gestión del Riesgo de Desastres crea el Sistema Nacional de Gestión del Riesgo (SNGR), con el COE como órgano ejecutivo y las alcaldías con su ámbito propio. Los planes locales se llaman PEMGRE (planes municipales de gestión del riesgo) en muchos municipios.",
  organismos: [
   { nombre: "Centro de Operaciones de Emergencias", siglas: "COE", rol: "Órgano rector del sistema nacional: coordina la alerta, la evacuación preventiva y la respuesta, y emite los boletines oficiales.", nivel: "nacional" },
   { nombre: "Oficina Nacional de Meteorología", siglas: "ONAMET", rol: "Pronóstico, avisos de ciclón tropical, lluvia, oleadas y polvo del Sahara (calima).", nivel: "nacional" },
   { nombre: "Defensa Civil", siglas: null, rol: "Institución de socorro con voluntariado y centros operativos locales; apoyo en evacuación y albergues.", nivel: "nacional" },
   { nombre: "Ministerio de Salud Pública", siglas: null, rol: "Vigilancia epidemiológica, agua segura, hospitales y respuesta sanitaria; el vector del dengue tras inundaciones.", nivel: "nacional" },
   { nombre: "Liga Municipal Dominicana", siglas: "LMD", rol: "Apoyo técnico a los ayuntamientos, incluidos los planes municipales de gestión del riesgo.", nivel: "regional" },
   { nombre: "Cuerpos de Bomberos municipales", siglas: null, rol: "Primera respuesta, rescate urbano, incendios forestales y asistencia en accidentes.", nivel: "local" },
   { nombre: "Cruz Roja Dominicana", siglas: null, rol: "Primeros auxilios, apoyo psicosocial, distribución y voluntariado comunitario.", nivel: "sociedad" },
  ],
  notas: [
   "Exposición sísmica real: la isla está entre la placa del Caribe y la Norteamericana, con las fallas Enriquillo–Plantain Garden (sur) y Septentrional (norte). La sismología la siguen centros universitarios y redes internacionales.",
   "Temporada de ciclones: junio a noviembre, con el pico entre agosto y octubre; el nombre de la temporada y los avisos los emiten el NHC y ONAMET.",
   "Polvo del Sahara (calima): episodios de aire cargado de polvo entre primavera y verano, con efecto respiratorio medible: no es un peligro declarado, es un patrón climático documentado.",
  ],
 },
 es: {
  iso2: "es",
  peligros: ["calor", "incendio-forestal", "inundacion", "frio", "sequia", "deslizamiento"],
  numero: "112",
  otrosNumeros: [
   { texto: "091 Policía Nacional · 062 Guardia Civil · 080 bomberos (en muchas localidades)", nota: "El 112 es el número único que deriva a cualquiera de ellos; los específicos siguen operativos." },
   { texto: "116 000 niños y niñas desaparecidos", nota: "Línea europea para la desaparición de menores, activa en España y en la mayoría de países de la UE." },
  ],
  aviso:
   "AEMET emite los avisos meteorológicos (naranja y rojo, por provincia) y la Dirección General de Protección Civil y Emergencias traslada la información y las recomendaciones a las comunidades autónomas y a la población; los ayuntamientos y las comunidades autónomas activan sus planes territoriales.",
  marco:
   "El Sistema Nacional de Protección Civil, con planes estatales por riesgo (químico, nuclear, sísmico, inundación, incendios forestales) y los planes autonómicos y locales; la Ley del Gobierno abre la vía de la declaración de zona de especial atención.",
  organismos: [
   { nombre: "Dirección General de Protección Civil y Emergencias", siglas: "DGPCE", rol: "Ministerio del Interior: coordinación, información a la ciudadanía y activación de medios estatales.", nivel: "nacional" },
   { nombre: "Agencia Estatal de Meteorología", siglas: "AEMET", rol: "Predicción, avisos naranja y rojo, y fenómenos costeros.", nivel: "nacional" },
   { nombre: "Unidad Militar de Emergencias", siglas: "UME", rol: "Apoyo en incendios forestales, inundaciones, nevadas, terremotos y emergencias NBQ.", nivel: "nacional" },
   { nombre: "Bomberos de la Generalitat, de la Comunidad de Madrid, Ayuntamientos y Consorcios provinciales", siglas: null, rol: "Extinción, rescate y asistencia según el territorio.", nivel: "local" },
   { nombre: "Cruz Roja Española", siglas: null, rol: "Atención psicosocial, unidades de apoyo logístico y social, personas mayores y colectivos vulnerables.", nivel: "sociedad" },
  ],
  notas: [
   "La transferencia de competencias a las comunidades autónomas hace que el nombre del plan y el canal de aviso cambien según el territorio: consulta siempre el de tu comunidad y tu ayuntamiento.",
   "El calor es la causa de mortalidad asociada a meteorología más alta del país, y el incendio forestal concentra la campaña de verano.",
  ],
 },
 mx: {
  iso2: "mx",
  peligros: ["sismo", "ciclon", "inundacion", "volcan", "deslizamiento", "sequia", "calor"],
  numero: "911",
  otrosNumeros: [{ texto: "065 Cruz Roja · 068 Protección Civil (aún se usan en algunos municipios)", nota: "El 911 los integra; los números locales pueden seguir activos." }],
  aviso:
   "La Coordinación Nacional de Protección Civil emite alertas y fases (azul, verde, amarilla, naranja, roja) para los fenómenos que monitorea el CENAPRED (volcanes) y el Servicio Meteorológico Nacional (ciclones); los estados y municipios activan sus planes y las alertas sísmicas operan en las zonas con cobertura del sistema de avisos (la CDMX con su altavoz y sirenas).",
  marco:
   "Ley General de Protección Civil y el Sistema Nacional de Protección Civil, con el Centro Nacional de Prevención de Desastres (CENAPRED) como órgano técnico de investigación y capacitación, y los consejos estatales y municipales.",
  organismos: [
   { nombre: "Coordinación Nacional de Protección Civil", siglas: "CNPC", rol: "Cabeza del sistema nacional: alerta, coordinación, ayuda y reconstrucción, adscrita a la Secretaría de Seguridad y Protección Ciudadana.", nivel: "nacional" },
   { nombre: "Centro Nacional de Prevención de Desastres", siglas: "CENAPRED", rol: "Monitoreo de volcanes y sismicidad, alertas por color y evaluación de riesgos.", nivel: "nacional" },
   { nombre: "Servicio Meteorológico Nacional", siglas: "SMN/CONAGUA", rol: "Pronóstico, avisos de ciclón tropical y lluvias.", nivel: "nacional" },
   { nombre: "Sistema Sismológico Nacional (UNAM)", siglas: "SSN", rol: "Registro y localización de sismos; no predice: mide.", nivel: "nacional" },
   { nombre: "Cruz Roja Mexicana · Bomberos · Secretaría de Marina y Sedena (Plan DN-III-E y GN-A)", siglas: null, rol: "Respuesta, apoyo a la población y logística en desastres mayores.", nivel: "nacional" },
  ],
  notas: [
   "El simulacro nacional del 19 de septiembre y el del 19 de mayo son ejercicios públicos de referencia; los avisos reales solo los emite la autoridad.",
   "La alerta sísmica da segundos, no minutos, y solo funciona donde hay red de acelerómetros.",
  ],
 },
 us: {
  iso2: "us",
  peligros: ["ciclon", "tornado", "inundacion", "incendio-forestal", "sismo", "calor", "frio", "tsunami"],
  numero: "911",
  otrosNumeros: [{ texto: "FEMA Helpline 1-800-621-3362", nota: "Línea federal de ayuda tras un desastre declarado; se usa después, no durante la emergencia." }],
  aviso:
   "El Sistema Integrado de Alerta Pública y Advertencias (IPAWS) difunde avisos por Wireless Emergency Alerts (mensajes al móvil), radio (EAS) y NOAA Weather Radio; los Servicios Meteorológicos Nacionales (NWS) emiten vigilancia y aviso, y los Centros Nacionales de Huracanes, Tsunamis y Tormentas, los específicos.",
  marco:
   "La ley Robert T. Stafford ( Stafford Act ) rige la declaración federal de desastre, coordinada por FEMA, con las agencias estatales de manejo de emergencias y las autoridades locales como primer escalón.",
  organismos: [
   { nombre: "Federal Emergency Management Agency", siglas: "FEMA", rol: "Prevención, preparación, respuesta y ayudas individuales y públicas tras un desastre declarado.", nivel: "nacional" },
   { nombre: "National Weather Service (NOAA)", siglas: "NWS", rol: "Vigilancia y aviso de tormentas, inundaciones, calor, frío y aire.", nivel: "nacional" },
   { nombre: "National Hurricane Center · National Tsunami Warning Center", siglas: "NHC/NTWC", rol: "Rutas de ciclón, avisos de marejada y alertas de tsunami por cuenca.", nivel: "nacional" },
   { nombre: "USGS Earthquake Hazards Program", siglas: "USGS", rol: "Registro y mapa de sismos en tiempo real (la fuente con la que trabaja /pulso-mundial de esta casa).", nivel: "nacional" },
   { nombre: "Agencias estatales de manejo de emergencias · National Guard", siglas: null, rol: "Activación de medios estatales y apoyo militar bajo autoridad del gobernador.", nivel: "regional" },
   { nombre: "American Red Cross", siglas: null, rol: "Alojamiento, comida, apoyo emocional y restablecimiento familiar.", nivel: "sociedad" },
  ],
  notas: [
   "Las alertas WEA al móvil son geográficas: si te llegan, son para tu zona, no para el país.",
   "«Watch» = posible, «Warning» = ocurre o es inminente: el estándar de todo el sistema.",
  ],
 },
 co: {
  iso2: "co",
  peligros: ["sismo", "deslizamiento", "inundacion", "volcan", "tsunami", "sequia"],
  numero: "123",
  otrosNumeros: [{ texto: "132 Bomberos · 123 ambulancia y policía", nota: "El 123 unifica la atención en la mayoría de ciudades." }],
  aviso:
   "La UNGRD articula con el IDEAM (meteorología y alertas por cuenca), el Servicio Geológico Colombiano (volcanes y sismicidad) y las gobernaciones y alcaldías, que declaran y activan la calamidad pública de su territorio.",
  marco:
   "La Ley 1523 de 2012 crea la Política Nacional de Gestión del Riesgo y la UNGRD; los consejos locales y regionales (municipales y departamentales) son la base del sistema.",
  organismos: [
   { nombre: "Unidad Nacional para la Gestión del Riesgo de Desastres", siglas: "UNGRD", rol: "Rector de la política: dirección, coordinación y ejecución, con enfoque de no generar nuevo riesgo.", nivel: "nacional" },
   { nombre: "Instituto de Hidrología, Meteorología y Estudios Ambientales", siglas: "IDEAM", rol: "Pronóstico, alertas hidrometeorológicas y seguimiento de La Niña/El Niño.", nivel: "nacional" },
   { nombre: "Servicio Geológico Colombiano", siglas: "SGC", rol: "Vigilancia volcánica (niveles de actividad), sismicidad y estudios de amenaza.", nivel: "nacional" },
   { nombre: "Cruz Roja Colombiana · Defensa Civil · Cuerpos de Bomberos", siglas: null, rol: "Primeros auxilios, evacuación y atención humanitaria con presencia territorial.", nivel: "sociedad" },
  ],
  notas: [
   "La declaratoria de calamidad pública es municipal o departamental: la ayuda se activa por esa vía, no por un anuncio nacional genérico.",
   "Los niveles de actividad volcánica (verde, amarillo, rojo) los define el Servicio Geológico y son de obligado respeto.",
  ],
 },
 cl: {
  iso2: "cl",
  peligros: ["sismo", "tsunami", "volcan", "incendio-forestal", "sequia", "inundacion"],
  numero: "133",
  otrosNumeros: [
   { texto: "131 SAMU · 132 Bomberos · 133 Carabineros · 134 Investigaciones", nota: "Cada servicio mantiene su línea propia; el 133 de Carabineros es la puerta general." },
  ],
  aviso:
   "SENAPRED emite la «Alerta por Evento» por celular (cell broadcast), radio, TV y sus cuentas oficiales; el SHOA (Armada) decide la alerta de tsunami, y el SERNAGEOMIN la actividad volcánica. El Simulacro Multiamenaza Nacional (abril) se realiza en varias regiones.",
  marco:
   "Tras la ley 21.364 (2021) el Sistema Nacional de Prevención y Respuesta ante Desastres reemplazó a la antigua ONEMI, con SENAPRED a la cabeza, y con el «Día Nacional del Simulacro» y la educación obligatoria en gestión del riesgo.",
  organismos: [
   { nombre: "Servicio Nacional de Prevención y Respuesta ante Desastres", siglas: "SENAPRED", rol: "Coordinación, alerta y declaración de emergencia; mantiene el sistema de alertas por celular.", nivel: "nacional" },
   { nombre: "Servicio Hidrográfico y Oceanográfico de la Armada", siglas: "SHOA", rol: "Único emisor de la alerta de tsunami en el país.", nivel: "nacional" },
   { nombre: "Servicio Nacional de Geología y Minería", siglas: "SERNAGEOMIN", rol: "Vigilancia de volcanes y niveles de alerta técnica.", nivel: "nacional" },
   { nombre: "Dirección Meteorológica de Chile", siglas: "DMG", rol: "Avisos y alertas por viento, lluvia, nieve, calor y frío.", nivel: "nacional" },
   { nombre: "Bomberos de Chile · Carabineros · SAMU · Cruz Roja Chilena", siglas: null, rol: "Respuesta en el territorio, con voluntariado masivo y capacitación continua.", nivel: "local" },
  ],
  notas: [
   "La cultura sísmica chilena es el mejor material educativo del cono sur: evacuaciones ensayadas, simulacros con conteo y edificación con norma antisísmica.",
   "«Alerta Amarilla» en un volcán significa evacuar el área que se indica; el área la fija SERNAGEOMIN y SENAPRED.",
  ],
 },
 ar: {
  iso2: "ar",
  peligros: ["inundacion", "deslizamiento", "sequia", "calor", "incendio-forestal", "volcan"],
  numero: "911",
  otrosNumeros: [{ texto: "100 bomberos · 103 SAME", nota: "Cada provincia conserva números propios: verifícalos en tu municipio." }],
  aviso:
   "El SMN (Servicio Meteorológico Nacional) emite alertas por color y nivel (amarillo, naranja, rojo); la Secretaría de Protección Civil coordina con provincias y municipios, y el INA (Instituto Nacional del Agua) monitorea ríos y cuencas.",
  marco:
   "El Sistema Federal de Medida y Respuesta para Emergencias y Desastres (SFMyRED), en el Ministerio del Interior, coordina la asistencia cuando la provincia se ve desbordada.",
  organismos: [
   { nombre: "Secretaría de Protección Civil", siglas: null, rol: "Asistencia y coordinación federal con las provincias.", nivel: "nacional" },
   { nombre: "Servicio Meteorológico Nacional", siglas: "SMN", rol: "Alertas por color, viento zonda, sudestada y frío.", nivel: "nacional" },
   { nombre: "Instituto Nacional de Prevención Sísmica", siglas: "INPRES", rol: "Red sísmica y norma INPRECOT para el centro y norte del país.", nivel: "nacional" },
   { nombre: "Bomberos voluntarios de cada municipio · Cruz Roja Argentina", siglas: null, rol: "El cuerpo de bomberos voluntarios es la primera respuesta en la mayor parte del territorio.", nivel: "local" },
  ],
  notas: [
   "Las inundaciones del Litoral y del área metropolitana de Buenos Aires son el riesgo más repetido: los planes barriales de agua importan más que la catástrofe del titular.",
   "Los bomberos voluntarios argentinos son una de las redes comunitarias de respuesta más grandes de la región.",
  ],
 },
 pe: {
  iso2: "pe",
  peligros: ["sismo", "tsunami", "inundacion", "deslizamiento", "volcan", "sequia", "frio"],
  numero: "105",
  otrosNumeros: [{ texto: "116 bomberos · 110 policía", nota: "Líneas clásicas todavía operativas junto al 105 de la Policía." }],
  aviso:
   "INDECI articula las alertas con el IGP (sismos y volcanes), la SENAMHI (lluvias, friaje y heladas) y la Marina (DHNP/SHI, alerta de tsunami); los gobiernos regionales y locales emiten las alertas operativas y las evacuaciones.",
  marco:
   "El Sistema Nacional de Gestión del Riesgo de Desastres (SINAGERD), con INDECI como ente rector, y los COE (centros de operaciones de emergencia) en los tres niveles de gobierno.",
  organismos: [
   { nombre: "Instituto Nacional de Defensa Civil", siglas: "INDECI", rol: "Rector de la gestión del riesgo: preparación, respuesta y rehabilitación.", nivel: "nacional" },
   { nombre: "Instituto Geofísico del Perú", siglas: "IGP", rol: "Red sísmica, vigilancia volcánica y alerta de tsunami por sismo.", nivel: "nacional" },
   { nombre: "Servicio Nacional de Meteorología e Hidrología", siglas: "SENAMHI", rol: "Avisos de lluvia, huaicos, friaje y heladas.", nivel: "nacional" },
   { nombre: "Sistema de Hidrografía y Navegación de la Marina de Guerra", siglas: "SHN", rol: "Emite la alerta de tsunami para el litoral.", nivel: "nacional" },
   { nombre: "Cruz Roja Peruana · bomberos · serenazgo municipal", siglas: null, rol: "Respuesta local y apoyo humanitario.", nivel: "sociedad" },
  ],
  notas: [
   "«Huaico» es el término local para el flujo de detritos: un fenómeno real y recurrente en la costa, con nombre propio.",
   "Lima está expuesta a un sismo de referencia histórico; el simulacro multisectorial «Shakto» son el ejercicio público anual.",
  ],
 },
 ec: {
  iso2: "ec",
  peligros: ["volcan", "sismo", "tsunami", "deslizamiento", "inundacion", "sequia"],
  numero: "911",
  otrosNumeros: [{ texto: "100 bomberos · 1800-SALUD", nota: "Líneas de cada servicio y del ECU-911 integrado." }],
  aviso:
   "La Secretaría de Gestión de Riesgos articula con el INAMHI (meteorología), el Instituto Geofísico (volcanes, con niveles de alerta) y la Marina (alerta de tsunami); los GAD municipales activan el COE cantonal.",
  marco:
   "La Ley de Sistema Nacional Descentralizado de Gestión de Riesgos y los planes de contingencia por amenaza (Cotopaxi, Guayaquil sísmico, El Niño).",
  organismos: [
   { nombre: "Secretaría de Gestión de Riesgos", siglas: "SGR", rol: "Rector nacional de la gestión reactiva y preventiva, y de la respuesta.", nivel: "nacional" },
   { nombre: "Instituto Nacional de Meteorología e Hidrología", siglas: "INAMHI", rol: "Avisos de lluvia, sequía y Fenómeno El Niño.", nivel: "nacional" },
   { nombre: "Instituto Geofísico de la Escuela Politécnica Nacional", siglas: "IG-EPN", rol: "Vigilancia volcánica (Cotopaxi, Sangay...) y sísmica.", nivel: "nacional" },
   { nombre: "Cuerpo de Bomberos de Quito y Guayaquil · Cruz Roja Ecuatoriana", siglas: null, rol: "Primera respuesta, rescate y atención prehospitalaria.", nivel: "local" },
  ],
  notas: ["El nivel de alerta naranja en un volcán implica disposición de evacuación preventiva decidida por la autoridad."],
 },
 br: {
  iso2: "br",
  peligros: ["inundacion", "deslizamiento", "sequia", "calor", "incendio-forestal", "frio"],
  numero: "193",
  otrosNumeros: [{ texto: "190 policía militar · 192 SAMU · 193 bomberos", nota: "Números de dominio público, usados en todo el país." }],
  aviso:
   "El INMET emite avisos meteorológicos; el CEMADEN, los alertamientos de riesgo de movimientos de massa y de inundación por lluvia, y la Defesa Civil estatal y municipal, las órdenes de evacuación; en muchas ciudades hay apps y SMS propios (por ejemplo, AlertaRio).",
  marco:
   "A Política Nacional de Proteção e Defesa Civil e o Sistema Nacional de Proteção e Defesa Civil (PNPDEC/SINPDEC).",
  organismos: [
   { nombre: "Secretaria Nacional de Proteção e Defesa Civil", siglas: "SEDEC/MDR", rol: "Reconhecimento de situações de emergência e de calamidade pública, assistência humanitária e reconstrução.", nivel: "nacional" },
   { nombre: "Centro Nacional de Monitoramento e Alertas de Desastres Naturais", siglas: "CEMADEN", rol: "Alerta de deslizamentos e enxurradas por nível de chuva; modelo de referencia regional.", nivel: "nacional" },
   { nombre: "Instituto Nacional de Meteorologia", siglas: "INMET", rol: "Avisos de calor, vendaval, chuva intensa y friagem.", nivel: "nacional" },
   { nombre: "Corpo de Bombeiros Militar · Defesa Civil estadual e municipal · Cruz Vermelha Brasileira", siglas: null, rol: "Resposta, salvamento y abrigos; os bombeiros estaduais acumulam defesa civil em muitos estados.", nivel: "local" },
  ],
  notas: [
   "La ocupación de laderas y de la orilla de los ríos es el factor que convierte la lluvia en tragedia: la prevención es urbanística.",
   "El mapa de riesgo por «nível de chuva» (leve/moderado/alto/muito alto) es una herramienta que cualquier comunidad puede leer.",
  ],
 },
 pt: {
  iso2: "pt",
  peligros: ["incendio-forestal", "calor", "inundacion", "sequia", "frio", "deslizamiento"],
  numero: "112",
  otrosNumeros: [{ texto: "117 bombeiros · linha SOS Floresta 117", nota: "El 117 de bomberos y la línea de incendios forestales conviven con el 112." }],
  aviso:
   "El IPMA emite avisos meteorológicos (verde, amarillo, naranja, rojo); la ANEPC y los comandos subregionales de bomberos activan los planes municipales de emergencia. Para calor, la DGS emite avisos y el sistema de vigilancia.",
  marco:
   "Lei de Bases da Proteção Civil, con la ANEPC a la cabeza, los planes municipales y el voluntariado de bomberos.",
  organismos: [
   { nombre: "Autoridade Nacional de Emergência e Proteção Civil", siglas: "ANEPC", rol: "Coordina la respuesta, los planes y el dispositivo operacional.", nivel: "nacional" },
   { nombre: "Instituto Português do Mar e da Atmosfera", siglas: "IPMA", rol: "Avisos meteorológicos por color, riesgo de incendio y sismicidad.", nivel: "nacional" },
   { nombre: "GNR · PSP · INEM", siglas: null, rol: "Guardia Nacional Republicana, Policía de Seguridad Pública e Instituto Nacional de Emergência Médica.", nivel: "nacional" },
   { nombre: "Bombeiros (voluntarios y municipales) · Cruz Vermelha Portuguesa", siglas: null, rol: "Red de voluntariado masiva: es la columna de la primera hora portuguesa.", nivel: "local" },
  ],
  notas: ["La campaña rural de verano (fogo rural) y la gestión del combustible son la prevención portuguesa por excelencia."],
 },
 fr: {
  iso2: "fr",
  peligros: ["calor", "inundacion", "incendio-forestal", "frio", "sequia", "deslizamiento"],
  numero: "112",
  otrosNumeros: [{ texto: "15 SAMU · 18 pompiers · 17 police", nota: "Números históricos todavía operativos; el 112 los unifica." }],
  aviso:
   "Météo-France emite la «vigilance» por colores y departamentos (verte, jaune, orange, rouge) con mapa público; la sécurité civile difunde «FR-Alert» a los móviles de la zona afectada.",
  marco:
   "Les plans ORSEC (organisation des secours), le plan canicule (con niveles de acción) et les PCS communaux (plan communal de sauvegarde).",
  organismos: [
   { nombre: "Direction générale de la Sécurité civile et de la gestion des crises", siglas: "DGSCGC", rol: "Medios aéreos, coordinación y sistema FR-Alert.", nivel: "nacional" },
   { nombre: "Météo-France", siglas: null, rol: "Vigilance por colores y pronóstico.", nivel: "nacional" },
   { nombre: "SDIS (services départementaux d'incendie et de secours)", siglas: null, rol: "Bomberos por departamento: la red territorial de respuesta.", nivel: "regional" },
   { nombre: "Croix-Rouge française · Sécurité Civile – Association", siglas: null, rol: "Postes de secours, apoyo psicosocial y voluntariado.", nivel: "sociedad" },
  ],
  notas: ["El registro de personas vulnerables (Registro nominativo) del ayuntamiento es obligatorio desde la ola de calor de 2003: pídele a tu mairie que te inscriba."],
 },
 de: {
  iso2: "de",
  peligros: ["inundacion", "calor", "frio", "sequia", "deslizamiento"],
  numero: "112",
  otrosNumeros: [{ texto: "110 policía", nota: "Emergencia médica y bomberos: 112; policía: 110." }],
  aviso:
   "El DWD emite avisos por niveles (información de peligro, aviso por viento/lluvia, aviso de peligro significativo, alerta extrema) difundidos por apps (NINA, BBK-WarnWetter), radio, TV y Cell Broadcast; las autoridades estatales y municipales emiten las órdenes de evacuación (altavoz, sirenas, apps y KATWARN).",
  marco:
   "Protección civil repartida entre la Federación (BBK) y los Länder (que tienen su propia ley y sus cuerpos de bomberos voluntarios, Feuerwehr).",
  organismos: [
   { nombre: "Bundesamt für Bevölkerungsschutz und Katastrophenhilfe", siglas: "BBK", rol: "Estrategia, advertencia a la población (WARNCELL/Cell Broadcast) y capacitación.", nivel: "nacional" },
   { nombre: "Deutscher Wetterdienst", siglas: "DWD", rol: "Avisos meteorológicos por niveles; la base de casi todas las alertas.", nivel: "nacional" },
   { nombre: "THW (Technisches Hilfswerk)", siglas: "THW", rol: "Organización federal de ayuda técnica con voluntariado local: rescate, infraestructura, pontones, energía.", nivel: "nacional" },
   { nombre: "Freiwillige Feuerwehr · DRK · ASB · Johanna", siglas: null, rol: "La red voluntaria de bomberos y socorro sobre la que se apoya el país.", nivel: "local" },
  ],
  notas: ["Las inundaciones de 2021 dejaron escrita la lección de que la alerta llegó: la evacuación falló en la última milla."],
 },
 it: {
  iso2: "it",
  peligros: ["sismo", "volcan", "inundacion", "deslizamiento", "calor", "incendio-forestal"],
  numero: "112",
  otrosNumeros: [{ texto: "115 vigili del fuoco · 118 emergencia sanitaria", nota: "Número único europeo 112 y los históricos activos." }],
  aviso:
   "El Departamento de Protección Civil coordina con el INGV (vulcanes y sismos), el servicio meteorológico de Aeronáutica (avisos por color) y las regiones; IT-ALERT es el sistema de alerta a la población por celular.",
  marco:
   "Il Codice della Protezione Civile (d.lgs. 1/2018), con el Servizio Nazionale articolado en Estado, regiones, provincias autónomas, municipios y voluntariado.",
  organismos: [
   { nombre: "Dipartimento della Protezione Civile", siglas: null, rol: "Coordinación nacional de previsione, prevenzione y gestione dell'emergenza.", nivel: "nacional" },
   { nombre: "Istituto Nazionale di Geofisica e Vulcanologia", siglas: "INGV", rol: "Sismos, volcanes (Etna, Vesuvio, Campi Flegrei) y alerta de tsunami.", nivel: "nacional" },
   { nombre: "Corpo Nazionale dei Vigili del Fuoco", siglas: null, rol: "Rescate, incendio y asistencia técnica.", nivel: "nacional" },
   { nombre: "Protección Civil regional y nacional de voluntariado (ANA · Misericordie · Croce Rossa)", siglas: null, rol: "Casi un millón de voluntarios: el brazo operativo territorial.", nivel: "sociedad" },
  ],
  notas: ["La zona roja volcánica y el plan de evacuación del Vesubio son uno de los ejercicios de resiliencia más grandes de Europa."],
 },
 gb: {
  iso2: "gb",
  peligros: ["inundacion", "calor", "frio", "sequia", "deslizamiento"],
  numero: "999",
  otrosNumeros: [{ texto: "112 desde móvil · Flood Line 0345 988 1188", nota: "999 y 112 valen igual; la línea del ambiente para inundaciones es informativa." }],
  aviso:
   "El Met Office emite avisos de tiempo severo (Yellow, Amber, Red) y el Environment Agency / Natural Resources Wales / SEPA emiten alertas y avisos de inundación; las autoridades locales y las compañías de agua envían alertas por email, SMS y teléfono a los registrados.",
  marco:
   "Civil Contingencies Act 2004, con los foros locales de resiliencia y los servicios obligados a tener plan (ayuntamiento, bomberos, sanidad, ambiente).",
  organismos: [
   { nombre: "Met Office Severe Weather Warning", siglas: null, rol: "Avisos por color de viento, lluvia, nieve, calor y hielo.", nivel: "nacional" },
   { nombre: "Environment Agency / Natural Resources Wales / SEPA", siglas: null, rol: "Alertas de inundación de ríos y mar, y gestión de defensas.", nivel: "regional" },
   { nombre: "Fire and Rescue Services · equipos de resiliencia de los ayuntamientos", siglas: null, rol: "Respuesta y planes locales, con los voluntarios de barrio contra inundaciones.", nivel: "local" },
   { nombre: "British Red Cross · Mountain Rescue England and Wales", siglas: null, rol: "Apoyo humanitario y rescate en terreno.", nivel: "sociedad" },
  ],
  notas: ["Regístrate en las alertas de inundación de tu autoridad: el aviso por SMS es gratuito y es lo que hace la diferencia."],
 },
 jp: {
  iso2: "jp",
  peligros: ["sismo", "tsunami", "volcan", "tornado", "inundacion", "deslizamiento", "calor", "ciclon"],
  numero: "119",
  otrosNumeros: [{ texto: "110 policía · 119 bomberos y ambulancia", nota: "Además, la línea de información de desastres de cada prefectura." }],
  aviso:
   "JMA emite alertas sísmicas (early earthquake warning) y avisos especiales; el sistema J-Alert llega por satélite a los móviles (cell broadcast), la TV y los altavoces de barrio, con sirenas automáticas de tsunami. Las escuelas ensayan el «ShakeOut» y el día de la prevención (1 de septiembre).",
  marco:
   "Basic Act on Disaster Management, con la Oficina del Gabinete como cabeza, planes nacionales y prefecturales y la obligación municipal de mantener el listado de personas que necesitan apoyo para evacuar.",
  organismos: [
   { nombre: "Japan Meteorological Agency", siglas: "JMA", rol: "Terremoto, tsunami, tifón y avisos especiales.", nivel: "nacional" },
   { nombre: "Cabinet Office (disaster management)", siglas: null, rol: "Coordinación central, presupuesto y planes nacionales.", nivel: "nacional" },
   { nombre: "Fire departments · Self-Defense Forces", siglas: null, rol: "Rescate, socorro y movilización a petición de la prefectura.", nivel: "local" },
   { nombre: "Japanese Red Cross Society · asociaciones vecinales", siglas: null, rol: "La célula de la preparación japonesa: los ejercicios de barrio, con conteo y con lista de personas vulnerables.", nivel: "sociedad" },
  ],
  notas: [
   "El modelo japonés enseña que la alerta temprana sin ejercicio comunitario no salva: la sirena se combina con drills de barrio desde la escuela.",
   "En un aviso de tsunami por sismo largo: evacúa a la altura sin esperar a confirmar nada.",
  ],
 },
 ph: {
  iso2: "ph",
  peligros: ["ciclon", "sismo", "volcan", "tsunami", "inundacion", "deslizamiento"],
  numero: "911",
  otrosNumeros: [{ texto: "NDRRMC hotline y números de cada ciudad", nota: "Muchos ayuntamientos mantienen líneas propias; verifica la tuya." }],
  aviso:
   "PAGASA emite señales de alerta de ciclón tropical por nivel de viento previsto (TS no. 1 a 5) y el Phivolcs, los niveles de alerta volcánica (1 a 5); NDRRMC y los consejos locales ordenan la evacuación preventiva obligatoria en las zonas costeras.",
  marco:
   "Republic Act 10121 (Philippine Disaster Risk Reduction and Management Act), con el NDRRMC y los LDRRMC locales, y los «zero casualty» plans.",
  organismos: [
   { nombre: "National Disaster Risk Reduction and Management Council", siglas: "NDRRMC", rol: "Política nacional, coordinación y preparación de la ayuda.", nivel: "nacional" },
   { nombre: "PAGASA", siglas: null, rol: "Avisos de tifón y lluvias; numera los ciclones y emite las señales.", nivel: "nacional" },
   { nombre: "PHIVOLCS", siglas: null, rol: "Sismos, tsunami y niveles de alerta volcánica.", nivel: "nacional" },
   { nombre: "Philippine Red Cross · OCHA", siglas: null, rol: "Respuesta humanitaria con una de las redes nacionales más grandes del mundo.", nivel: "sociedad" },
  ],
  notas: ["«Signal #5» significa vientos de más de 220 km/h: evacuación obligatoria y suspensión de todo servicio."],
 },
 id: {
  iso2: "id",
  peligros: ["sismo", "tsunami", "volcan", "inundacion", "deslizamiento", "incendio-forestal"],
  numero: "112",
  otrosNumeros: [{ texto: "113 bomberos · 119 ambulancia · 110 policía", nota: "El 112 es el número único nacional; algunos operadores y regiones mantienen los otros." }],
  aviso:
   "BMKG emite las alertas de sismo y tsunami (con el sistema InaTEWS y sirenas en costas seleccionadas) y el PVMBG los niveles de alerta volcánica (Normal → Awas); BNPB y BPBD locales ordenan evacuaciones.",
  marco: "Undang-Undang No. 24/2007 sobre gestión de desastres, con BNPB/ BPBD y la política de «pengurangan risiko».",
  organismos: [
   { nombre: "Badan Nasional Penanggulangan Bencana", siglas: "BNPB", rol: "Coordinación nacional de respuesta, logística y rehabilitación.", nivel: "nacional" },
   { nombre: "Badan Meteorologi, Klimatologi, dan Geofisika", siglas: "BMKG", rol: "Sismicidad, tsunami, clima y avisos tempranos.", nivel: "nacional" },
   { nombre: "Pusat Vulkanologi dan Mitigasi Bencana Geologi", siglas: "PVMBG", rol: "Niveles de alerta de los volcanes.", nivel: "nacional" },
   { nombre: "Indonesian Red Cross · Taruna Siaga Bencana (Tagana)", siglas: null, rol: "Voluntariado comunitario y dapur umum (cocinas comunitarias).", nivel: "sociedad" },
  ],
  notas: ["Los «tsunami shelter» verticales y las sirenas son la solución de Indonesia donde no hay altura a la que subir."],
 },
 in: {
  iso2: "in",
  peligros: ["ciclon", "inundacion", "sismo", "deslizamiento", "calor", "sequia", "aire"],
  numero: "112",
  otrosNumeros: [{ texto: "101 bomberos · 102 ambulancia · 108 policía", nota: "El 112 es el número único nacional; los números históricos siguen sonando." }],
  aviso:
   "El IMD emite alertas por color (verde, amarillo, naranja, rojo) de ciclón, calor, lluvia y niebla; la alerta de calor se difunde por radio, TV y campañas locales, y los SDMA estatales y los distritos ordenan el cierre de escuelas y el trabajo al aire libre.",
  marco: "Disaster Management Act 2005, con NDMA, SDMA estatales y DDMAs de distrito, y los «guidelines» por amenaza.",
  organismos: [
   { nombre: "National Disaster Management Authority", siglas: "NDMA", rol: "Política, estándares y capacitación; preside el primer ministro.", nivel: "nacional" },
   { nombre: "India Meteorological Department", siglas: "IMD", rol: "Alertas de ciclón, calor, lluvia y niebla.", nivel: "nacional" },
   { nombre: "National Institute of Disaster Management", siglas: "NIDM", rol: "Capacitación, investigación y material educativo.", nivel: "nacional" },
   { nombre: "NDRF · State Disaster Response Force · Army and Air Force", siglas: null, rol: "Equipos de respuesta rápida, bomberos y apoyo militar.", nivel: "nacional" },
   { nombre: "Indian Red Cross Society", siglas: null, rol: "Primeros auxilios, sangre, refugio y ayuda comunitaria.", nivel: "sociedad" },
  ],
  notas: ["India redujo drásticamente la mortalidad por ciclón con una sola combinación: evacuación masiva temprana + refugios de cemento + mensajes repetidos por altavoz."],
 },
 ca: {
  iso2: "ca",
  peligros: ["incendio-forestal", "inundacion", "calor", "frio", "aire"],
  numero: "911",
  otrosNumeros: [{ texto: "Líneas no urgentes de cada provincia", nota: "Cada provincia mantiene su propia línea de informes y de daños: verifica la tuya." }],
  aviso:
   "Environment and Climate Change Canada emite alertas y avisos, difundidos por Alert Ready (wireless public alert) a todos los móviles conectados a LTE/5G, radio y TV; las provincias y municipios gestionan la evacuación.",
  marco: "Emergency Management Act (federal), con las organizaciones provinciales/territoriales de gestión de emergencias (por ejemplo, OMEP en Ontario) y los municipios.",
  organismos: [
   { nombre: "Public Safety Canada — Emergency Management", siglas: null, rol: "Coordinación federal, apoyo financiero y el sistema Alert Ready.", nivel: "nacional" },
   { nombre: "Environment and Climate Change Canada — Meteorological Service", siglas: "MSC", rol: "Alertas de tormenta, calor, hielo, humo y aire.", nivel: "nacional" },
   { nombre: "Provincial/territorial emergency management organizations", siglas: null, rol: "Planes provinciales, recursos y activación.", nivel: "regional" },
   { nombre: "Canadian Red Cross · Volunteer fire departments", siglas: null, rol: "Alojamiento, apoyo psicosocial y respuesta comunitaria.", nivel: "sociedad" },
  ],
  notas: ["«Evacuation alert» (puede que tengas que irte) y «evacuation order» (tienes que irte) son los dos niveles canadienses estándar."],
 },
 au: {
  iso2: "au",
  peligros: ["incendio-forestal", "inundacion", "ciclon", "calor", "tsunami"],
  numero: "000",
  otrosNumeros: [{ texto: "112 desde móvil", nota: "El 000 es el número de emergencia; 112 funciona desde cualquier móvil y los servicios estatales publican sus propios avisos." }],
  aviso:
   "Cada estado y territorio tiene su servicio de emergencias (RFS en NSW, CFA en Victoria, SES...) y usa el sistema de aviso a la población por radio, apps y, para grandes eventos, emisoras nacionales; el Bureau of Meteorology publica avisos y el «fire weather» con niveles de peligro.",
  marco: "Emergency Management Act en cada estado, con el National Emergency Management Agency (NEMA) como coordinación federal desde 2023.",
  organismos: [
   { nombre: "National Emergency Management Agency", siglas: "NEMA", rol: "Preparación nacional y coordinación interestatal.", nivel: "nacional" },
   { nombre: "Bureau of Meteorology", siglas: "BoM", rol: "Avisos de tormenta, ciclón, calor, inundación y peligro de fuego.", nivel: "nacional" },
   { nombre: "State emergency services (RFS, CFA, SES, State Emergency Service)", siglas: null, rol: "Respuesta con base voluntaria masiva.", nivel: "regional" },
   { nombre: "Australian Red Cross", siglas: null, rol: "Apoyo financiero de emergencia, alojamiento y recuperación.", nivel: "sociedad" },
  ],
  notas: ["La regla australiana «si el fuego está aquí, tú deberías haberte ido ya» resume la lección de la temporada negra: irse antes."],
 },
 nz: {
  iso2: "nz",
  peligros: ["sismo", "tsunami", "volcan", "inundacion", "sequia", "deslizamiento"],
  numero: "111",
  otrosNumeros: [{ texto: "111 · *555 en algunas regiones", nota: "El 111 es la emergencia; hay líneas no urgentes por región para daños e inundaciones." }],
  aviso:
   "El sistema nacional de alerta (NZ National Civil Defence Emergency Management) usa cell broadcast, el número 111, la radio y la aplicación de civil defence; GeoNet y MetService emiten los avisos técnicos (tsunami por sismo, marejada, clima severo).",
  marco: "Civil Defence Emergency Management Act 2002, con los grupos regionales de gestión de emergencias y la evacuación «con aviso o sin aviso».",
  organismos: [
   { nombre: "National Emergency Management Agency", siglas: "NEMA", rol: "Política nacional, preparación y respuesta.", nivel: "nacional" },
   { nombre: "MetService", siglas: null, rol: "Avisos y advertencias de tiempo severo por región.", nivel: "nacional" },
   { nombre: "GNS Science — GeoNet", siglas: null, rol: "Sismos, volcanes y landslides, y la alerta de tsunami.", nivel: "nacional" },
   { nombre: "Civil Defence groups · local emergency management · Red Cross", siglas: null, rol: "La respuesta territorial, con los «welfare hubs» como base.", nivel: "local" },
  ],
  notas: ["«Long or short notice evacuation» es un concepto único de Nueva Zelanda: planifica para irte sin aviso."],
 },
 za: {
  iso2: "za",
  peligros: ["incendio-forestal", "inundacion", "sequia", "calor", "aire"],
  numero: "10111",
  otrosNumeros: [{ texto: "10177 ambulancia · 112 desde móvil · 10111 policía", nota: "Números de dominio público; el 112 funciona desde móvil en todo el país." }],
  aviso:
   "La National Disaster Management Centre (DDG) coordina con las provincias y municipios; SAWS emite avisos meteorológicos y alertas por SMS a registrados; las alertas de incendio las gestionan los municipios y los fire brigades locales.",
  marco: "Disaster Management Act 57 of 2002, con el National Disaster Management Framework y los planes provinciales y municipales.",
  organismos: [
   { nombre: "National Disaster Management Centre", siglas: "NDMC", rol: "Coordinación nacional, nivel de alerta y asistencia a municipios.", nivel: "nacional" },
   { nombre: "South African Weather Service", siglas: "SAWS", rol: "Avisos y alertas por SMS y radio.", nivel: "nacional" },
   { nombre: "Fire and Rescue, EMS, SANDF y provincial disaster management", siglas: null, rol: "Respuesta operativa y apoyo militar en desastres.", nivel: "regional" },
   { nombre: "South African Red Cross Society", siglas: null, rol: "Primeros auxilios, refugio y apoyo psicosocial.", nivel: "sociedad" },
  ],
  notas: ["En un país con desigualdad alta, la preparación más útil es la comunitaria: la calle se organiza sola cuando el estado no llega."],
 },
 gh: {
  iso2: "gh",
  peligros: ["inundacion", "sequia", "calor", "incendio-forestal"],
  numero: "193",
  otrosNumeros: [{ texto: "112 · 191 policía · 193 bomberos · 192 ambulancia", nota: "Números de dominio público ampliamente divulgados." }],
  aviso: "La National Emergency Management Agency (NEMA) coordina y emite los comunicados; el Ghana Meteorological Agency (GMet) emite avisos de lluvia y de calor.",
  marco: "National Disaster Management Organisation Act (Act 517), reemplazada por la NEMA Act 2016 (Act 927), con comités distritales.",
  organismos: [
   { nombre: "National Emergency Management Agency", siglas: "NEMA", rol: "Coordinación, preparación y respuesta nacional y distrital.", nivel: "nacional" },
   { nombre: "Ghana Meteorological Agency", siglas: "GMet", rol: "Pronóstico y avisos de lluvia intensa y calor.", nivel: "nacional" },
   { nombre: "Ghana National Fire and Rescue Service · Police · Health", siglas: null, rol: "Respuesta y atención prehospitalaria.", nivel: "nacional" },
   { nombre: "Ghana Red Cross Society · churches y asociaciones locales", siglas: null, rol: "El tejido comunitario que sostiene la primera respuesta.", nivel: "sociedad" },
  ],
  notas: ["Las inundaciones urbanas de Accra se repiten cada temporada de lluvias: la prevención es drenaje, basura y ordenación."],
 },
 ke: {
  iso2: "ke",
  peligros: ["sequia", "inundacion", "deslizamiento", "calor"],
  numero: "999",
  otrosNumeros: [{ texto: "112 · 911 · 999 (los tres activan)", nota: "Kenia usa varios números de emergencia; 999 es el histórico." }],
  aviso: "La National Government Administration Officers y el Ministry of Interior (National Disaster Management Unit) coordinan; el Kenya Meteorological Department emite avisos estacionales; Kenya Red Cross manda SMS a registrados.",
  marco: "Disaster Risk Management Act 2013, con el National Disaster Management Authority y estructuras de condado.",
  organismos: [
   { nombre: "National Disaster Management Authority", siglas: "NDMA", rol: "Política nacional de gestión del riesgo y coordinación.", nivel: "nacional" },
   { nombre: "Kenya Meteorological Department", siglas: "KMD", rol: "Pronóstico estacional de lluvias, avisos de crecida.", nivel: "nacional" },
   { nombre: "Kenya Red Cross Society", siglas: "KRCS", rol: "Primera respuesta, SMS de alerta, apoyo psicosocial y comunidades resilientes.", nivel: "sociedad" },
   { nombre: "County Disaster Management Committees", siglas: null, rol: "La respuesta de condado, con su propio comité y su propio plan.", nivel: "local" },
  ],
  notas: ["Para la sequía del Cuerno de África, el «early action» (actuar antes de la hambruna, con el pronóstico) es el modelo que la región exportó al mundo."],
 },
};

/** Los países con ficha propia, en orden alfabético por nombre derivado. */
export const PAISES_CON_RECURSOS = Object.keys(PAISES);

export function recursoDePais(iso2: string | undefined | null): PaisResiliencia | null {
 if (!iso2) return null;
 return PAISES[iso2.toLowerCase()] ?? null;
}

export const NOTA_VERIFICACION =
 "Los números de emergencia y los canales de aviso cambian y varían por municipio: verifícalos en tu autoridad local antes de necesitarlos, y anótalos en la nevera y en la mochila. Esta página es material educativo y no emite alertas.";
