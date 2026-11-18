// ═══════════════════════════════════════════════════════════════════
// VANGUARD INVESTIGACIÓN SISTÉMICA — DATASET DE TEMAS GLOBALES
// 10 dossiers exhaustivos, rigurosamente referenciados con fuentes
// oficiales (AIE, Banco Mundial, SIPRI, UNCTAD, IMO, USGS, FAO, etc.).
// ═══════════════════════════════════════════════════════════════════

import type { TemaInvestigacion } from "./tipos";

export const TEMAS_INVESTIGACION: TemaInvestigacion[] = [
  {
    id: "semiconductores-litografia",
    titulo: "La Cadena de Suministro de Semiconductores y Litografía Ultravioleta Extrema (EUV)",
    subtitulo: "El cuello de botella tecnológico más estrecho de la historia humana: silicio, espejos Zeiss y la soberanía de Taiwán",
    categoria: "TECNOLOGIA_CIBER",
    etiquetas: ["Semiconductores", "Litografía EUV", "Taiwán", "ASML", "TSMC", "Geopolítica Tecnológica"],
    urgenciaSistemica: "CRITICA",
    fechaActualizacion: "2026-10-15",
    tiempoLecturaMin: 8,
    resumenEjecutivo:
      "La economía digital mundial, la inteligencia artificial y los sistemas de defensa avanzados dependen de nodos lógicos inferiores a 3 nanómetros fabricados en una sola isla (Taiwán) mediante maquinaria de una sola compañía europea (ASML en Veldhoven, Países Bajos). Una interrupción en el Estrecho de Taiwán congelaría más del 90% de la producción mundial de chips lógicos de frontera en 72 horas.",
    preguntasClave: [
      "¿Por qué ninguna otra empresa en el planeta ha podido replicar las máquinas de litografía EUV de ASML?",
      "¿Hasta qué punto las leyes CHIPS de EE. UU. y Europa pueden mitigar la dependencia absoluta de TSMC para 2030?",
      "¿Qué impacto macroeconómico tendría un bloqueo marítimo sobre los puertos de Kaohsiung y Taichung?",
    ],
    conceptosEsenciales: [
      {
        termino: "Litografía Ultravioleta Extrema (EUV)",
        definicion: "Tecnología óptica que utiliza luz con longitud de onda de 13.5 nm, generada disparando pulsos de láser CO2 sobre 50.000 microgotas de estaño fundido por segundo en el vacío.",
        contexto: "Solo ASML fabrica estas máquinas, cada una compuesta por más de 100.000 piezas y valorada en más de 350 millones de dólares.",
      },
      {
        termino: "Escudo de Silicio (Silicon Shield)",
        definicion: "Doctrina estratégica que postula que la importancia crítica de Taiwán para las economías tanto de EE. UU. como de China disuade una invasión armada convencional.",
        contexto: "Planteada originalmente por Craig Addison; hoy reevaluada ante las crecientes capacidades militares del EPL.",
      },
      {
        termino: "Empaquetado Avanzado (CoWoS)",
        definicion: "Chip-on-Wafer-on-Substrate: técnica de interconexión tridimensional de múltiples matrices de silicio y memoria HBM en un solo encapsulado.",
        contexto: "Principal cuello de botella para la producción masiva de procesadores de IA como las series Blackwell y Hopper.",
      },
    ],
    actoresClave: [
      { nombre: "TSMC (Taiwan Semiconductor Manufacturing Co.)", rol: "Fabricante dominante (Foundry)", postura: "Defensa de la neutralidad comercial y expansión calculada en Arizona, Kumamoto y Dresde.", influencia: "Fabrica >90% de chips avanzados globales", codigoIso: "TW" },
      { nombre: "ASML Holding N.V.", rol: "Monopolio en Litografía EUV", postura: "Cumplimiento estricto de controles de exportación neerlandeses y estadounidenses.", influencia: "100% del mercado de litografía EUV", codigoIso: "NL" },
      { nombre: "Gobierno de EE. UU. (Bureau of Industry and Security)", rol: "Regulador hegemónico", postura: "Restricción de exportaciones de herramientas avanzadas y chips de IA hacia China.", influencia: "Control de propiedad intelectual y software EDA", codigoIso: "US" },
      { nombre: "SMIC / Huawei (China)", rol: "Competidor emergente bajo sanciones", postura: "Desarrollo acelerado de litografía DUV multiboceto y sustitución nacional de componentes.", influencia: "Producción de nodos de 7nm sin EUV", codigoIso: "CN" },
    ],
    cronologia: [
      { fecha: "2019-11", hito: "Primera prohibición de exportación de máquinas EUV hacia China por presión diplomática de EE. UU.", impacto: "Freno tecnológico temporal al avance de fundiciones chinas por debajo de 10nm." },
      { fecha: "2022-10", hito: "EE. UU. promulga los controles de exportación más amplios sobre chips lógicos y equipos de fabricación.", impacto: "Prohibición a ciudadanos estadounidenses de trabajar en fundiciones chinas sin licencia." },
      { fecha: "2024-03", hito: "TSMC inicia producción de prueba del nodo N2 (2nm) con transistores nanosheet GAA en Hsinchu.", impacto: "Consolidación de la ventaja de Taiwán en eficiencia energética y densidad de transistores." },
      { fecha: "2025-09", hito: "ASML entrega las primeras unidades de High-NA EUV (0.55 NA) a clientes selectos.", impacto: "Comienza la transición a nodos sub-1.4nm con resolución óptica mejorada." },
    ],
    indicadoresEmpiricos: [
      {
        nombre: "Participación de Taiwán en manufactura de chips <10nm",
        valor: "92%",
        unidad: "porcentaje del total mundial",
        periodo: "2025/2026",
        fuenteOficial: "Semiconductor Industry Association (SIA) / Boston Consulting Group",
        tendencia: "estable",
        interpretacion: "Concentración geográfica extrema inigualada en ninguna otra industria estratégica.",
      },
      {
        nombre: "Facturación anual de ASML en sistemas litográficos",
        valor: "28.300",
        unidad: "millones de euros",
        periodo: "2025",
        fuenteOficial: "ASML Annual Financial Report 2025",
        tendencia: "sube",
        interpretacion: "La cartera de pedidos supera los 38.000 millones de euros impulsada por la demanda de IA.",
      },
      {
        nombre: "Tiempo medio de construcción de una mega-fab de semiconductores",
        valor: "4.5",
        unidad: "años",
        periodo: "2024-2026",
        fuenteOficial: "SEMI World Fab Forecast",
        tendencia: "sube",
        interpretacion: "La inercia temporal impide una relocalización rápida de la producción en caso de emergencia.",
      },
    ],
    puntosCiegos: [
      "Vulnerabilidad de las plantas desalinizadoras y el suministro eléctrico en Taiwán ante eventos climáticos o sabotajes.",
      "Dependencia de gas neón purificado (históricamente refinado en Mariúpol y Odesa) y fotoquímicos ultraespecializados japoneses.",
      "Déficit global de ingenieros de sala limpia certificados para operar fundiciones en suelo estadounidense y europeo.",
    ],
    nodosGeograficos: [
      { id: "hsinchu-science-park", nombre: "Parque Científico de Hsinchu (TSMC Fab 12/20)", lat: 24.773, lng: 121.011, tipo: "produccion", relevancia: "Epicentro de I+D y manufactura de vanguardia mundial." },
      { id: "asml-veldhoven", nombre: "ASML Campus Global Veldhoven", lat: 51.405, lng: 5.418, tipo: "produccion", relevancia: "Único sitio de ensamblaje e integración de fuentes EUV y espejos Zeiss." },
      { id: "tsmc-arizona-fab21", nombre: "TSMC Fab 21 (Phoenix, Arizona)", lat: 33.729, lng: -112.183, tipo: "produccion", relevancia: "Principal esfuerzo de diversificación geográfica bajo la Ley CHIPS de EE. UU." },
      { id: "strait-taiwan-choke", nombre: "Estrecho de Taiwán (Canal Central)", lat: 24.0, lng: 119.5, tipo: "chokepoint", relevancia: "Paso del 48% de la flota global de portacontenedores en 2025." },
    ],
    comparativa: {
      eje: "Capacidad de Manufactura de Frontera (<5nm): Taiwán vs. Bloque Occidental Relocalizado",
      descripcion: "Comparación de cuota de volumen y coste por oblea entre la concentración asiática y las nuevas instalaciones en Occidente.",
      actorA: {
        nombre: "TSMC Taiwán (Instalaciones nativas)",
        iso: "TW",
        metricas: [
          { k: "Cuota volumen <5nm", v: "88%", barra: 88 },
          { k: "Rendimiento oblea (Yield)", v: "82%", barra: 82 },
          { k: "Coste relativo oblea", v: "Base (100)", barra: 50 },
          { k: "Densidad clúster proveedores", v: "Extrema (10 km)", barra: 95 },
        ],
      },
      actorB: {
        nombre: "EE. UU. & UE (Fabs CHIPS Act 2026)",
        iso: "US",
        metricas: [
          { k: "Cuota volumen <5nm", v: "12%", barra: 12 },
          { k: "Rendimiento oblea (Yield)", v: "65%", barra: 65 },
          { k: "Coste relativo oblea", v: "+40% sobre base", barra: 78 },
          { k: "Densidad clúster proveedores", v: "Dispersa (>500 km)", barra: 40 },
        ],
      },
      veredictoAnalitico: "La diversificación territorial añade redundancia defensiva pero a un sobrecoste operativo del 35-45% y con un rezago tecnológico de al menos 18 meses frente a las fabs matrices de Taiwán.",
    },
    conexionesVanguard: {
      labsModelos: [
        { id: "comercio-red", titulo: "Comercio en Red y Aranceles", razon: "Simula el impacto de un arancel del 60% o un bloqueo de rutas sobre el flujo de manufacturas de alta tecnología." },
        { id: "red-cascada", titulo: "Red en Cascada y Fallos Sistémicos", razon: "Modela la caída en dominó de sectores industriales ante la falta de un nodo crítico en la red de suministro." },
      ],
      toolsAnalisis: [
        { id: "simulador-cascada", titulo: "Simulador de Cascada", razon: "Evalúa cómo una interrupción en el Estrecho de Taiwán impacta la automoción y la electrónica de consumo en Europa y América." },
        { id: "matriz-riesgo", titulo: "Matriz de Riesgo Geopolítico", razon: "Mide probabilidad e impacto del escenario de cerco aeronaval." },
      ],
      modulosRelacionados: [
        { href: "/mundos/TW", label: "Dossier Taiwán", desc: "Indicadores demográficos, PIB per cápita y fronteras marítimas." },
        { href: "/mundos/NL", label: "Dossier Países Bajos", desc: "Ficha del centro de innovación europea y sede de ASML." },
        { href: "/cuartel?tab=tools", label: "Vanguard Tools", desc: "Espacio de trabajo multivariable para calcular dependencias de importación." },
      ],
      temasHermanos: ["estrecho-malaca-chokepoints", "ciberdefensa-infraestructura-critica", "inteligencia-artificial-frontera"],
    },
    fuentesMetodologicas: [
      { institucion: "Semiconductor Industry Association (SIA)", publicacion: "State of the U.S. Semiconductor Industry", anio: 2025, tipo: "THINK_TANK" },
      { institucion: "ASML Holding N.V.", publicacion: "Annual Report on Form 20-F", anio: 2025, tipo: "AGENCIA_OFICIAL" },
      { institucion: "Center for Strategic and International Studies (CSIS)", publicacion: "Mapping the Semiconductor Supply Chain", anio: 2024, tipo: "INSTITUTO_INVESTIGACION" },
    ],
  },
  {
    id: "estrecho-malaca-chokepoints",
    titulo: "El Estrecho de Malaca y los Cuellos de Botella del Comercio Marítimo Mundial",
    subtitulo: "La arteria de 800 kilómetros que transporta el 40% del comercio marítimo mundial y el 80% del crudo hacia Asia Oriental",
    categoria: "GEOPOLITICA",
    etiquetas: ["Malaca", "Chokepoints", "Comercio Marítimo", "Seguridad Energética", "Singapur", "Ormuz"],
    urgenciaSistemica: "CRITICA",
    fechaActualizacion: "2026-10-12",
    tiempoLecturaMin: 7,
    resumenEjecutivo:
      "El Estrecho de Malaca, con solo 2.8 kilómetros de ancho navegable en su punto más angosto (Canal de Phillips), es el punto de estrangulamiento comercial más vulnerable del planeta. Une el Océano Índico con el Mar de la China Meridional. Un cierre forzoso obligaría a desviar el tráfico por los estrechos indonesios de Sunda o Lombok, elevando fletes un 300% y saturando las cadenas globales de suministro en días.",
    preguntasClave: [
      "¿Cómo influye el 'Dilema de Malaca' en la doctrina naval de China y su despliegue en Yibuti y Gwadar?",
      "¿Cuáles son las limitaciones físicas reales del Estrecho de Sunda como alternativa de navegación?",
      "¿Qué impacto tiene la piratería moderna y la guerra electrónica en el tránsito del Canal de Singapur?",
    ],
    conceptosEsenciales: [
      {
        termino: "El Dilema de Malaca",
        definicion: "Expresión formulada en 2003 por el presidente chino Hu Jintao que describe la vulnerabilidad existencial de China ante un potencial bloqueo naval liderado por EE. UU. en el estrecho.",
        contexto: "Motivó la construcción de oleoductos terrestres a través de Myanmar y Pakistán dentro de la Iniciativa de la Franja y la Ruta.",
      },
      {
        termino: "Canal de Phillips (Estrecho de Singapur)",
        definicion: "El tramo más angosto de la ruta marítima, de apenas 1.5 millas náuticas de ancho y 23 metros de profundidad mínima permitida (Malaccamax).",
        contexto: "Cualquier colisión o encallamiento mayor genera congestión instantánea en más de 200 buques en espera.",
      },
      {
        termino: "Límite Malaccamax",
        definicion: "Parámetro técnico naval para buques con calado máximo de 20.5 metros; cualquier buque de mayor tamaño no puede cruzar el estrecho y debe rodear por Lombok.",
        contexto: "Define las dimensiones de los mayores superpetroleros (VLCC) del mundo.",
      },
    ],
    actoresClave: [
      { nombre: "República de Singapur", rol: "Hub logístico y guardián del paso", postura: "Mantenimiento estricto de la libertad de navegación y puerto franco neutral.", influencia: "Puerto transbordo #1 del mundo", codigoIso: "SG" },
      { nombre: "República Popular China", rol: "Consumidor más dependiente de la ruta", postura: "Diversificación por ferrocarril transasiático y expansión naval de aguas azules.", influencia: "Importa 80% de su crudo por Malaca", codigoIso: "CN" },
      { nombre: "Indonesia y Malasia", rol: "Estados ribereños de soberanía territorial", postura: "Coordinación de patrullas marítimas conjuntas (MALSINDO) y soberanía sobre aguas archipelágicas.", influencia: "Control de cartas náuticas y seguridad local", codigoIso: "ID" },
      { nombre: "Armada de los Estados Unidos (Séptima Flota)", rol: "Garante de la seguridad de las líneas marítimas (SLOC)", postura: "Presencia constante con base de apoyo logístico en Changi (Singapur).", influencia: "Capacidad de proyección aeronaval hegemónica", codigoIso: "US" },
    ],
    cronologia: [
      { fecha: "2004-07", hito: "Indonesia, Malasia y Singapur inician las patrullas marítimas coordinadas MALSINDO.", impacto: "Reducción de incidentes de piratería en un 70% en el canal principal." },
      { fecha: "2017-05", hito: "Puesta en servicio comercial del oleoducto China-Myanmar de 770 km (Kyaukpyu a Kunming).", impacto: "Primera ruta de desvío de hidrocarburos de Medio Oriente hacia China sin tocar Malaca." },
      { fecha: "2024-11", hito: "El tráfico por Malaca alcanza el récord histórico de 94.000 buques anuales registrados.", impacto: "Saturación del sistema de gestión de tráfico de buques (VTIS) de Singapur." },
      { fecha: "2026-02", hito: "Reevaluación de riesgos tras los ataques en el Mar Rojo: buques que evitan Suez aumentan congestión en rutas asiáticas.", impacto: "Los fletes marítimos entre Asia y Europa baten marcas de volatilidad." },
    ],
    indicadoresEmpiricos: [
      {
        nombre: "Tráfico anual de buques comerciales por Malaca",
        valor: "94.500",
        unidad: "buques / año",
        periodo: "2025",
        fuenteOficial: "Autoridad Marítima y Portuaria de Singapur (MPA)",
        tendencia: "sube",
        interpretacion: "Representa cerca de una cuarta parte de todo el comercio de petróleo transportado por mar.",
      },
      {
        nombre: "Flujo de crudo diario a través del estrecho",
        valor: "16.8",
        unidad: "millones de barriles diarios (mb/d)",
        periodo: "2025",
        fuenteOficial: "U.S. Energy Information Administration (EIA) Chokepoint Analysis",
        tendencia: "sube",
        interpretacion: "Segundo chokepoint petrolero mundial después del Estrecho de Ormuz (21 mb/d).",
      },
      {
        nombre: "Sobrecoste en días de navegación si se desvía por Lombok",
        valor: "+3.5",
        unidad: "días adicionales de tránsito",
        periodo: "2026",
        fuenteOficial: "UNCTAD Review of Maritime Transport",
        tendencia: "estable",
        interpretacion: "Supone un gasto adicional de $180.000 a $300.000 en combustible bunker por viaje para un buque portacontenedores de 20.000 TEU.",
      },
    ],
    puntosCiegos: [
      "Vulnerabilidad ante cables submarinos cortados en el fondo del estrecho que concentran el 60% de los datos de telecomunicación entre Europa, India y Extremo Oriente.",
      "Profundidad decreciente en ciertas barras de arena por sedimentación monzónica y riesgo de encallamiento.",
      "Interferencia de señales AIS y spoofing GPS en zonas de fondeo exterior de Singapur.",
    ],
    nodosGeograficos: [
      { id: "phillips-channel", nombre: "Canal de Phillips (Punto crítico)", lat: 1.071, lng: 103.605, tipo: "chokepoint", relevancia: "Garganta de 2.8 km donde el tráfico bidireccional se comprime al límite." },
      { id: "port-of-singapore", nombre: "Puerto de Singapur (Terminal Pasir Panjang / Tuas)", lat: 1.264, lng: 103.746, tipo: "infraestructura", relevancia: "Mayor puerto de transbordo del mundo con capacidad proyectada de 65M TEUs." },
      { id: "malacca-strait-north", nombre: "Boca Norte (Mar de Andamán)", lat: 5.5, lng: 97.5, tipo: "chokepoint", relevancia: "Punto de entrada de superpetroleros provenientes del Golfo Pérsico." },
      { id: "sunda-strait-alt", nombre: "Estrecho de Sunda (Ruta alternativa)", lat: -5.92, lng: 105.85, tipo: "chokepoint", relevancia: "Alternativa meridional entre Java y Sumatra, no apta para calados profundos." },
    ],
    comparativa: {
      eje: "Ruta de Tránsito: Estrecho de Malaca vs. Desvío por Estrecho de Lombok",
      descripcion: "Comparación de seguridad náutica, calado disponible y coste operativo por trayecto intercontinental.",
      actorA: {
        nombre: "Estrecho de Malaca / Singapur",
        metricas: [
          { k: "Distancia relativa", v: "100% (Directa)", barra: 60 },
          { k: "Calado máximo", v: "20.5 m (Límite)", barra: 70 },
          { k: "Capacidad de bunkering", v: "Líder global (#1)", barra: 98 },
          { k: "Congestión náutica", v: "Crítica (>90k barcos)", barra: 95 },
        ],
      },
      actorB: {
        nombre: "Paso de Lombok / Macasar",
        metricas: [
          { k: "Distancia relativa", v: "125% (+1.200 mn)", barra: 85 },
          { k: "Calado máximo", v: ">250 m (Sin límite)", barra: 100 },
          { k: "Capacidad de bunkering", v: "Muy limitada", barra: 25 },
          { k: "Congestión náutica", v: "Baja / Fluida", barra: 20 },
        ],
      },
      veredictoAnalitico: "Lombok permite el paso de supertanqueros gigantescos imposibilitados en Malaca, pero carece de la infraestructura de repostaje, avituallamiento y arbitraje aduanero que convierten a Singapur en el centro neural de Asia.",
    },
    conexionesVanguard: {
      labsModelos: [
        { id: "rutas-historicas", titulo: "Rutas Comerciales Históricas", razon: "Compara cómo las antiguas rutas de la seda y las especias moldearon la geografía del estrecho de Malaca." },
        { id: "comercio-red", titulo: "Comercio en Red y Aranceles", razon: "Simula el encarecimiento de los fletes globales cuando una ruta clave sufre una reducción de capacidad del 50%." },
      ],
      toolsAnalisis: [
        { id: "calculadora-dependencia", titulo: "Calculadora de Dependencia", razon: "Calcula el grado de exposición de las economías japonesa y surcoreana al flujo de petróleo de Malaca." },
        { id: "linea-tiempo-causal", titulo: "Línea de Tiempo Causal", razon: "Conecta incidentes en el Mar Rojo y Bab el-Mandeb con el efecto acumulativo de retrasos en Malaca." },
      ],
      modulosRelacionados: [
        { href: "/mapas", label: "Centro de Mapas", desc: "Capa temática con rutas de transporte marítimo global en el globo 3D." },
        { href: "/mundos/SG", label: "Dossier Singapur", desc: "Métricas económicas de la ciudad-estado y su puerto." },
      ],
      temasHermanos: ["semiconductores-litografia", "minerales-criticos-energia", "cuenca-artica-deshielo"],
    },
    fuentesMetodologicas: [
      { institucion: "International Maritime Organization (IMO)", publicacion: "Reports on Acts of Piracy and Armed Robbery Against Ships", anio: 2025, tipo: "ORGANISMO_MULTILATERAL" },
      { institucion: "U.S. Energy Information Administration (EIA)", publicacion: "World Oil Transit Chokepoints Analysis", anio: 2024, tipo: "AGENCIA_OFICIAL" },
      { institucion: "UNCTAD", publicacion: "Review of Maritime Transport 2025", anio: 2025, tipo: "ORGANISMO_MULTILATERAL" },
    ],
  },
  {
    id: "minerales-criticos-energia",
    titulo: "Minerales Críticos, Tierras Raras y el Trilema de la Transición Energética",
    subtitulo: "De la dependencia de los combustibles fósiles a la concentración geográfica del litio, cobalto, níquel y elementos de tierras raras",
    categoria: "ENERGIA_RECURSOS",
    etiquetas: ["Minerales Críticos", "Litio", "Tierras Raras", "Transición Energética", "Baterías", "China"],
    urgenciaSistemica: "ALTA",
    fechaActualizacion: "2026-10-10",
    tiempoLecturaMin: 8,
    resumenEjecutivo:
      "La descarbonización de la economía mundial no reduce la geopolítica de los recursos: cambia los hidrocarburos por minerales. Un vehículo eléctrico requiere seis veces más insumos minerales que uno de combustión interna, y un parque eólico terrestre nueve veces más que una central de gas. Más del 70% del procesamiento y refinado de litio, cobalto, grafito y tierras raras está concentrado en un solo país: la República Popular China.",
    preguntasClave: [
      "¿Es factible construir cadenas de valor de refinado mineral independientes de China antes de 2035?",
      "¿Cómo impacta el 'Triángulo del Litio' sudamericano en la soberanía económica de Chile, Argentina y Bolivia?",
      "¿Cuáles son las barreras ambientales y químicas para la extracción de tierras raras pesadas en Occidente?",
    ],
    conceptosEsenciales: [
      {
        termino: "Concentración en la Etapa de Refinado",
        definicion: "Diferencia crítica entre dónde se extrae el mineral en bruto (mina) y dónde se transforma químicamente en compuesto apto para baterías o imanes permanentes.",
        contexto: "Por ejemplo: la República Democrática del Congo extrae el 74% del cobalto, pero China procesa más del 75% del producto refinado mundial.",
      },
      {
        termino: "Tierras Raras Pesadas (HREE)",
        definicion: "Grupo de elementos lantánidos (disprosio, terbio, holmio) indispensables para los imanes de neodimio-hierro-boro (NdFeB) que operan a altas temperaturas en motores de vehículos y turbinas eólicas.",
        contexto: "La extracción y separación química de HREE está dominada en más de un 95% por refinerías chinas.",
      },
      {
        termino: "Ley Minera Decreciente",
        definicion: "Disminución porcentual del mineral útil presente en cada tonelada de roca extraída a medida que los yacimientos maduran.",
        contexto: "La ley del cobre ha caído del 1.6% en 1990 a menos del 0.6% en 2025 en las principales minas chilenas.",
      },
    ],
    actoresClave: [
      { nombre: "República Popular China", rol: "Procesador y refinador hegemónico", postura: "Restricción estratégica de tecnologías de procesamiento de tierras raras e inversiones en África.", influencia: "Refina >65% del litio y >85% de tierras raras", codigoIso: "CN" },
      { nombre: "Australia", rol: "Mayor productor minero de litio (espodumena)", postura: "Alianzas con EE. UU. (AUKUS / Minerals Security Partnership) para construir refinerías locales.", influencia: "Produce el 47% del litio bruto mundial", codigoIso: "AU" },
      { nombre: "República Democrática del Congo", rol: "Fuente primaria del cobalto mundial", postura: "Revisión de contratos mineros con consorcios extranjeros y lucha contra el trabajo infantil.", influencia: "Extrae el 74% del cobalto global", codigoIso: "CD" },
      { nombre: "Unión Europea (Ley de Materias Primas Críticas)", rol: "Consumidor vulnerable", postura: "Metas obligatorias para 2030: 10% extracción local, 40% procesamiento y 25% reciclaje.", influencia: "Dependencia de importación superior al 90%", codigoIso: "EU" },
    ],
    cronologia: [
      { fecha: "2023-08", hito: "China impone controles de exportación sobre galio y germanio, insumos clave en chips y radares.", impacto: "Subida inmediata de precios y alerta en las industrias de defensa de la OTAN." },
      { fecha: "2023-12", hito: "Pekín prohíbe la exportación de tecnología para fabricar imanes de tierras raras.", impacto: "Bloqueo tecnológico directo a los esfuerzos de Occidente por crear cadenas paralelas." },
      { fecha: "2024-05", hito: "Aprobación definitiva de la European Critical Raw Materials Act.", impacto: "Establecimiento de listas de minerales estratégicos y agilización de permisos de explotación." },
      { fecha: "2025-11", hito: "Descubrimiento y evaluación comercial de depósitos masivos de fosfatos y tierras raras en Noruega y Suecia.", impacto: "Horizonte de alivio parcial para Europa hacia la década de 2035." },
    ],
    indicadoresEmpiricos: [
      {
        nombre: "Cuota de China en la refinación global de litio para baterías",
        valor: "68%",
        unidad: "porcentaje del total",
        periodo: "2025",
        fuenteOficial: "International Energy Agency (IEA) Critical Minerals Market Review",
        tendencia: "estable",
        interpretacion: "A pesar de las inversiones en Australia y EE. UU., China mantiene el control técnico y de costes.",
      },
      {
        nombre: "Demanda proyectada de litio para la transición a 2040",
        valor: "8.5x",
        unidad: "veces la demanda de 2020",
        periodo: "Escenario NZE 2050",
        fuenteOficial: "IEA World Energy Outlook / Critical Minerals Model",
        tendencia: "sube",
        interpretacion: "Ritmo de demanda sin precedentes en la historia de la minería extractiva moderna.",
      },
      {
        nombre: "Tiempo promedio de desarrollo de una nueva mina desde el descubrimiento",
        valor: "15.7",
        unidad: "años",
        periodo: "Promedio global 2010-2025",
        fuenteOficial: "S&P Global Market Intelligence",
        tendencia: "sube",
        interpretacion: "Desfase estructural entre la velocidad de instalación de renovables y la apertura de minas.",
      },
    ],
    puntosCiegos: [
      "Intensidad de uso hídrico en la evaporación de salares en el Desierto de Atacama y Altiplano Boliviano.",
      "Residuos radiactivos (torio y uranio) generados de manera inherente en la separación de minerales de tierras raras.",
      "Vulnerabilidad del reciclaje de baterías ante la química cambiante (baterías LFP sin níquel ni cobalto).",
    ],
    nodosGeograficos: [
      { id: "atacama-salt-flat", nombre: "Salar de Atacama (SQM / Albemarle)", lat: -23.5, lng: -68.3, tipo: "produccion", relevancia: "Mayor reserva en explotación de litio de bajo coste por salmuera del planeta." },
      { id: "baotou-rare-earths", nombre: "Baotou (Mongolia Interior, China)", lat: 40.65, lng: 109.84, tipo: "produccion", relevancia: "Capital mundial de tierras raras y complejo minero de Bayan Obo." },
      { id: "kolwezi-cobalt", nombre: "Kolwezi (Cinturón de Cobre/Cobalto de Katanga)", lat: -10.72, lng: 25.47, tipo: "produccion", relevancia: "Epicentro de la extracción mundial de cobalto en la R.D. del Congo." },
      { id: "greenbushes-mine", nombre: "Mina Greenbushes (Australia Occidental)", lat: -33.86, lng: 116.02, tipo: "produccion", relevancia: "Mayor mina a cielo abierto de roca dura de litio (espodumena)." },
    ],
    comparativa: {
      eje: "Modelos de Extracción de Litio: Salmuera Sudamericana vs. Roca Dura Australiana",
      descripcion: "Comparativa técnica, huella ambiental y tiempo de procesamiento químico.",
      actorA: {
        nombre: "Salmuera Altiplánica (Chile/Argentina)",
        metricas: [
          { k: "Coste de extracción por tonelada", v: "$3.800 USD (Bajo)", barra: 35 },
          { k: "Consumo de agua por evaporación", v: "Muy elevado", barra: 90 },
          { k: "Tiempo de proceso (bombeo a producto)", v: "12 a 18 meses", barra: 85 },
          { k: "Pureza inicial de grado batería", v: "Alta (99.5%)", barra: 92 },
        ],
      },
      actorB: {
        nombre: "Roca Dura / Espodumena (Australia)",
        metricas: [
          { k: "Coste de extracción por tonelada", v: "$7.200 USD (Medio)", barra: 65 },
          { k: "Consumo de agua relativo", v: "Moderado", barra: 40 },
          { k: "Tiempo de proceso (molienda a concentrado)", v: "Días / Semanas", barra: 20 },
          { k: "Pureza inicial sin refinar", v: "Requiere calcinación pesada", barra: 55 },
        ],
      },
      veredictoAnalitico: "La roca dura ofrece velocidad y menor huella hídrica local pero requiere exportar millones de toneladas de concentrado a China para su calcinación a alta temperatura, mientras que la salmuera tiene menor coste energético pero enfrenta fuertes resistencias hidroecológicas locales.",
    },
    conexionesVanguard: {
      labsModelos: [
        { id: "mezcla-energetica", titulo: "Mezcla Energética y Descarbonización", razon: "Comprueba cómo el porcentaje de renovables exige un crecimiento exponencial en la demanda de insumos minerales." },
        { id: "recursos-eroi", titulo: "Agotamiento de Recursos y EROI", razon: "Simula el balance energético neto al disminuir la ley mineral de los yacimientos existentes." },
      ],
      toolsAnalisis: [
        { id: "comparador-paises", titulo: "Comparador Asimétrico", razon: "Compara el perfil exportador de Australia y Chile frente a la capacidad manufacturera de China." },
        { id: "visualizador-multivariable", titulo: "Visualizador Multivariable", razon: "Cruza indicadores de PIB per cápita con reservas de recursos críticos declarados." },
      ],
      modulosRelacionados: [
        { href: "/mundos/CL", label: "Dossier Chile", desc: "Producción de cobre y litio, balances fiscales e indicadores." },
        { href: "/mundos/AU", label: "Dossier Australia", desc: "Perfil de exportación minera y tratados de seguridad energética." },
      ],
      temasHermanos: ["semiconductores-litografia", "desdolarizacion-deuda-global", "cuenca-artica-deshielo"],
    },
    fuentesMetodologicas: [
      { institucion: "International Energy Agency (IEA)", publicacion: "The Role of Critical Minerals in Clean Energy Transitions", anio: 2025, tipo: "ORGANISMO_MULTILATERAL" },
      { institucion: "U.S. Geological Survey (USGS)", publicacion: "Mineral Commodity Summaries 2026", anio: 2026, tipo: "AGENCIA_OFICIAL" },
      { institucion: "World Bank", publicacion: "Minerals for Climate Action: The Mineral Intensity of the Clean Energy Transition", anio: 2024, tipo: "ORGANISMO_MULTILATERAL" },
    ],
  },
  {
    id: "estres-hidrico-nilo-renacimiento",
    titulo: "Geopolítica del Agua: La Presa del Renacimiento (GERD) y la Cuenca del Nilo",
    subtitulo: "El choque hidropolítico entre la soberanía energética de Etiopía y la supervivencia existencial de Egipto en el río más largo del mundo",
    categoria: "CLIMA_AGUA",
    etiquetas: ["Estrés Hídrico", "Cuenca del Nilo", "Presa GERD", "Etiopía", "Egipto", "Hidropolítica"],
    urgenciaSistemica: "ALTA",
    fechaActualizacion: "2026-10-08",
    tiempoLecturaMin: 7,
    resumenEjecutivo:
      "La Gran Presa del Renacimiento Etíope (GERD), con una capacidad de embalse de 74.000 millones de metros cúbicos en el Nilo Azul, representa la mayor obra hidroeléctrica de África. Para Etiopía simboliza la salida de la pobreza energética; para Egipto, que depende en un 97% del río Nilo para su agua potable y agricultura, representa una potencial amenaza a su seguridad nacional en años de sequía multianual.",
    preguntasClave: [
      "¿Qué mecanismos legales pueden reemplazar los tratados coloniales de 1929 y 1959 sobre las aguas del Nilo?",
      "¿Cómo afectará una sequía prolongada similar a la de 1979-1984 a la gestión del embalse de la GERD?",
      "¿Qué papel juegan las tecnologías de desalinización nuclear y reúso agrícola en la adaptación egipcia?",
    ],
    conceptosEsenciales: [
      {
        termino: "Nilo Azul vs. Nilo Blanco",
        definicion: "El Nilo Azul, nacido en el lago Tana (Etiopía), aporta el 85% del caudal del Nilo en época de crecidas, mientras que el Nilo Blanco proporciona un flujo base más regular pero menor.",
        contexto: "Cualquier infraestructura en las tierras altas etíopes condiciona directamente el régimen de crecidas de Sudán y Egipto.",
      },
      {
        termino: "Doctrina de Derechos Históricos (Tratados de 1929/1959)",
        definicion: "Acuerdos de la era colonial que asignaron a Egipto 55.500 millones de m³ anuales y a Sudán 18.500 millones, concediendo a El Cairo derecho de veto sobre cualquier obra aguas arriba.",
        contexto: "Etiopía nunca formó parte de esos tratados y los desconoce bajo la doctrina de soberanía territorial equitativa.",
      },
      {
        termino: "Línea de Pobreza Hídrica de la ONU",
        definicion: "Umbral fijado en 1.000 metros cúbicos de agua dulce per cápita al año; por debajo de 500 m³ se considera escasez absoluta.",
        contexto: "Egipto dispone hoy de apenas 550 m³ por habitante al año, cayendo rápidamente por crecimiento demográfico.",
      },
    ],
    actoresClave: [
      { nombre: "República Democrática Federal de Etiopía", rol: "País aguas arriba / Constructor", postura: "Derecho soberano inalienable a generar 5.150 MW para electrificar a su población.", influencia: "Controla las fuentes del 85% del caudal", codigoIso: "ET" },
      { nombre: "República Árabe de Egipto", rol: "País aguas abajo / Afectado crítico", postura: "Exigencia de un acuerdo vinculante que garantice un caudal mínimo de descarga en sequías.", influencia: "Poder militar y diplomático líder regional", codigoIso: "EG" },
      { nombre: "República del Sudán", rol: "País intermedio", postura: "Posición oscilante: beneficia por control de inundaciones pero teme por la seguridad de sus propias presas (Roseires).", influencia: "Espacio geográfico de confluencia en Jartum", codigoIso: "SD" },
    ],
    cronologia: [
      { fecha: "2011-04", hito: "Etiopía coloca la primera piedra del proyecto GERD durante las convulsiones de la Primavera Árabe en Egipto.", impacto: "Aprovechamiento de la ventana geopolítica para iniciar obras sin veto militar." },
      { fecha: "2015-03", hito: "Firma de la Declaración de Principios de Jartum entre Egipto, Etiopía y Sudán.", impacto: "Compromiso de uso equitativo sin causar daño significativo, pero sin reglas operativas numéricas." },
      { fecha: "2020-07", hito: "Etiopía culmina el primer llenado del embalse a pesar de las protestas formales egipcias.", impacto: "Consolidación de hechos consumados sobre el terreno." },
      { fecha: "2024-09", hito: "Etiopía anuncia la finalización del quinto llenado y el funcionamiento de cuatro turbinas comerciales.", impacto: "El embalse supera los 50.000 millones de m³ almacenados sin incidentes graves en año húmedo." },
    ],
    indicadoresEmpiricos: [
      {
        nombre: "Dependencia de Egipto del río Nilo para agua dulce",
        valor: "97%",
        unidad: "porcentaje del consumo total",
        periodo: "2025",
        fuenteOficial: "Ministerio de Recursos Hídricos e Irrigación de Egipto / FAO AQUASTAT",
        tendencia: "estable",
        interpretacion: "Uno de los índices de dependencia fluvial externa más altos del mundo.",
      },
      {
        nombre: "Capacidad nominal de generación eléctrica de la GERD",
        valor: "5.150",
        unidad: "megavatios (MW)",
        periodo: "Finalización 2026",
        fuenteOficial: "Ethiopian Electric Power (EEP)",
        tendencia: "sube",
        interpretacion: "Duplica la capacidad de generación eléctrica total de Etiopía.",
      },
      {
        nombre: "Déficit anual de agua proyectado en Egipto para 2030",
        valor: "21.000",
        unidad: "millones de m³ / año",
        periodo: "Proyección 2030",
        fuenteOficial: "UNICEF / World Resources Institute (Aqueduct 4.0)",
        tendencia: "sube",
        interpretacion: "Exige inversiones multimillonarias en plantas de tratamiento y desalinización costera.",
      },
    ],
    puntosCiegos: [
      "Falta de protocolos coordinados de simulación para un ciclo de sequía de más de cinco años consecutivos.",
      "Impacto de la salinización por intrusión marina en el delta del Nilo al reducirse el caudal de descarga al Mediterráneo.",
      "Inestabilidad interna y conflictos armados en las regiones etíopes de Amhara y Tigray que rodean la cuenca.",
    ],
    nodosGeograficos: [
      { id: "gerd-dam-site", nombre: "Presa GERD (Región de Benishangul-Gumuz)", lat: 11.216, lng: 35.093, tipo: "infraestructura", relevancia: "Mayor presa de gravedad de hormigón compactado con rodillo (RCC) de África." },
      { id: "lake-tana-source", nombre: "Lago Tana (Nacimiento del Nilo Azul)", lat: 12.0, lng: 37.3, tipo: "infraestructura", relevancia: "Fuente hidrológica originaria de las aguas de montaña etíopes." },
      { id: "aswan-high-dam", nombre: "Presa Alta de Asuán (Lago Nasser)", lat: 23.97, lng: 32.88, tipo: "infraestructura", relevancia: "Columna vertebral del almacenamiento y regadío del Egipto moderno." },
      { id: "cairo-delta-barrage", nombre: "Bifurcación del Delta del Nilo (Norte de El Cairo)", lat: 30.19, lng: 31.12, tipo: "infraestructura", relevancia: "Alimenta los canales que sostienen a más de 60 millones de agricultores." },
    ],
    comparativa: {
      eje: "Prioridades Nacionales en Conflicto: Egipto vs. Etiopía",
      descripcion: "Comparativa entre seguridad alimentaria y supervivencia frente a erradicación de pobreza y soberanía energética.",
      actorA: {
        nombre: "Egipto (Aguas abajo)",
        iso: "EG",
        metricas: [
          { k: "Dependencia fluvial externa", v: "97%", barra: 97 },
          { k: "Población total", v: "112 Millones", barra: 75 },
          { k: "Tasa de electrificación", v: "100%", barra: 100 },
          { k: "Disponibilidad agua per cápita", v: "550 m³/año (Crítica)", barra: 30 },
        ],
      },
      actorB: {
        nombre: "Etiopía (Aguas arriba)",
        iso: "ET",
        metricas: [
          { k: "Dependencia fluvial externa", v: "0% (Origen)", barra: 0 },
          { k: "Población total", v: "128 Millones", barra: 85 },
          { k: "Tasa de electrificación", v: "54% (Déficit severo)", barra: 54 },
          { k: "Disponibilidad agua per cápita", v: "1.450 m³/año (Suficiente)", barra: 80 },
        ],
      },
      veredictoAnalitico: "El conflicto no es de volumen neto absoluto de agua, sino de regulación temporal: Etiopía puede generar energía sin consumir el agua permanentemente, pero el protocolo de descarga durante los años secos sigue sin un tratado de cumplimiento obligatorio.",
    },
    conexionesVanguard: {
      labsModelos: [
        { id: "agua-estres", titulo: "Estrés Hídrico y Repartición de Cuencas", razon: "Modela la oferta y demanda de agua en una cuenca compartida con embalses encadenados y variabilidad climática." },
        { id: "suelo-alimentos", titulo: "Suelo Agrícola y Capacidad de Carga", razon: "Calcula la pérdida de rendimiento agrícola al reducirse la superficie de riego irrigada por el Nilo." },
      ],
      toolsAnalisis: [
        { id: "matriz-riesgo", titulo: "Matriz de Riesgo Geopolítico", razon: "Evalúa escenarios de escalada militar o acuerdos diplomáticos tripartitos." },
        { id: "comparador-paises", titulo: "Comparador de Países", razon: "Contrasta demografía, gasto militar y balances hídricos entre Egipto y Etiopía." },
      ],
      modulosRelacionados: [
        { href: "/mundos/EG", label: "Dossier Egipto", desc: "Datos de población, geografía del Delta y deuda externa." },
        { href: "/mundos/ET", label: "Dossier Etiopía", desc: "Indicadores de desarrollo humano, relieve y mapa fluvial." },
      ],
      temasHermanos: ["seguridad-alimentaria-fertilizantes", "cuenca-artica-deshielo", "minerales-criticos-energia"],
    },
    fuentesMetodologicas: [
      { institucion: "Food and Agriculture Organization (FAO)", publicacion: "AQUASTAT Nile Basin Geography and Water Resources", anio: 2025, tipo: "ORGANISMO_MULTILATERAL" },
      { institucion: "World Resources Institute (WRI)", publicacion: "Aqueduct Water Risk Atlas 4.0", anio: 2024, tipo: "INSTITUTO_INVESTIGACION" },
      { institucion: "Eastern Nile Technical Regional Office (ENTRO)", publicacion: "Joint Dam Operations and Safety Reports", anio: 2024, tipo: "ORGANISMO_MULTILATERAL" },
    ],
  },
  {
    id: "desdolarizacion-deuda-global",
    titulo: "Arquitectura Financiera Internacional, Deuda Soberana y Desdolarización",
    subtitulo: "La fragmentación del sistema de pagos de Bretton Woods: sanciones de reservas, acumulación récord de oro y acuerdos bilaterales en divisas locales",
    categoria: "FINANZAS_COMERCIO",
    etiquetas: ["Desdolarización", "Deuda Soberana", "SWIFT", "Reservas de Oro", "Bancos Centrales", "BRICS"],
    urgenciaSistemica: "ALTA",
    fechaActualizacion: "2026-10-05",
    tiempoLecturaMin: 8,
    resumenEjecutivo:
      "La congelación de más de 300.000 millones de dólares en reservas soberanas rusas en 2022 marcó un punto de inflexión en la historia monetaria moderna. Los bancos centrales de economías emergentes iniciaron la mayor compra de oro en siete décadas para desvincularse de la jurisdicción del dólar. Aunque el billete verde retiene el 58% de las reservas oficiales y el 85% de las transacciones de divisas, el comercio bilateral en monedas nacionales dentro del bloque BRICS se ha triplicado.",
    preguntasClave: [
      "¿Puede el yuan chino (RMB) ser una moneda de reserva global sin abrir plenamente su cuenta de capitales?",
      "¿Cuál es el umbral de insostenibilidad de la deuda soberana de EE. UU. (>$36 billones) ante tipos de interés elevados?",
      "¿Cómo operan los sistemas de mensajería alternativa como el CIPS chino y el SPFS ruso frente a SWIFT?",
    ],
    conceptosEsenciales: [
      {
        termino: "El Dilema de Triffin",
        definicion: "Paradoja económica que postula que el emisor de la moneda de reserva global debe incurrir de forma continua en déficits comerciales para proveer liquidez al resto del mundo, erosionando con el tiempo la confianza a largo plazo en su solvencia.",
        contexto: "Planteado por Robert Triffin en 1960; describe la trayectoria estructural de la balanza de pagos estadounidense.",
      },
      {
        termino: "Armamento del Dólar (Weaponization)",
        definicion: "Uso de la primacía del sistema financiero estadounidense (SWIFT, corresponsalía bancaria en Nueva York) como herramienta de política exterior y sanción económica unilateral.",
        contexto: "El incentivo central para que potencias medias busquen canales de compensación alternativos al dólar.",
      },
      {
        termino: "Moneda de Liquidación vs. Moneda de Reserva",
        definicion: "Distinción entre usar una divisa para facturar un intercambio comercial concreto y mantenerla en un balance bancario durante décadas como depósito de valor seguro.",
        contexto: "El yuan crece como moneda de liquidación comercial, pero su papel como reserva a largo plazo sigue contenido por el control de capitales de Pekín.",
      },
    ],
    actoresClave: [
      { nombre: "Reserva Federal de EE. UU. (Fed)", rol: "Emisor de la moneda de reserva hegemónica", postura: "Mantenimiento de la estabilidad financiera interna y defensa del estatus de reserva del dólar.", influencia: "Emite el 58% de las reservas mundiales", codigoIso: "US" },
      { nombre: "Banco Popular de China (PBOC)", rol: "Promotor de la internacionalización del yuan", postura: "Ampliación de acuerdos de swap bilateral (más de 40 bancos centrales) y liquidación de crudo en RMB.", influencia: "Segundo PIB mundial y líder exportador", codigoIso: "CN" },
      { nombre: "Bancos Centrales Globales (Especialmente Global South)", rol: "Compradores masivos de activos tangibles", postura: "Diversificación activa hacia reservas físicas de oro en cámaras propias.", influencia: "Compras netas de >1.000 t de oro anuales", codigoIso: "GL" },
      { nombre: "Banco de Pagos Internacionales (BIS)", rol: "Foro de coordinación y banca central", postura: "Desarrollo de proyectos como mBridge para pagos transfronterizos con monedas digitales de banco central (CBDC).", influencia: "Nodo técnico de compensación global", codigoIso: "CH" },
    ],
    cronologia: [
      { fecha: "2022-03", hito: "Congelación por el G7 de las reservas del Banco Central de la Federación Rusa depositadas en Occidente.", impacto: "Ruptura del principio de inmunidad soberana de reservas exteriores." },
      { fecha: "2023-08", hito: "Cumbre BRICS en Johannesburgo anuncia la adhesión de nuevos miembros exportadores de petróleo (EAU, Irán, etc.).", impacto: "El bloque pasa a representar más del 40% de la producción de crudo global." },
      { fecha: "2024-10", hito: "El Banco Popular de China completa 18 meses consecutivos de compras oficiales netas de oro para sus reservas.", impacto: "El precio del oro supera máximos históricos consecutivos en los mercados de Londres y Shanghái." },
      { fecha: "2026-01", hito: "El comercio no petrolero entre Rusia, China e India supera el 90% de liquidación en rublos, yuanes y rupias.", impacto: "Desaparición casi total del dólar como moneda de intermediación directa en el eje euroasiático." },
    ],
    indicadoresEmpiricos: [
      {
        nombre: "Participación del dólar en las reservas de divisas asignadas (COFER)",
        valor: "57.8%",
        unidad: "porcentaje del total",
        periodo: "2025/2026",
        fuenteOficial: "Fondo Monetario Internacional (FMI) COFER Database",
        tendencia: "baja",
        interpretacion: "Ha descendido paulatinamente desde más del 71% registrado a principios de la década del 2000.",
      },
      {
        nombre: "Deuda pública federal bruta de los Estados Unidos",
        valor: "36.2",
        unidad: "billones de dólares ($ Trillion)",
        periodo: "2026",
        fuenteOficial: "U.S. Department of the Treasury / Fiscal Data",
        tendencia: "sube",
        interpretacion: "Supera el 122% del PIB estadounidense; los pagos por intereses rebasan el presupuesto total de defensa.",
      },
      {
        nombre: "Compras anuales netas de oro por bancos centrales",
        valor: "1.045",
        unidad: "toneladas métricas / año",
        periodo: "2024-2025",
        fuenteOficial: "World Gold Council (WGC) Central Bank Statistics",
        tendencia: "sube",
        interpretacion: "Nivel más alto de compras oficiales de oro desde el fin del patrón oro de Bretton Woods en 1971.",
      },
    ],
    puntosCiegos: [
      "Inconvertibilidad libre de la mayoría de las divisas alternativas: las empresas indias acumulan rupias que los exportadores rusos no pueden repatriar con facilidad.",
      "Vulnerabilidad de los mercados de deuda de economías en desarrollo denominados en dólares ante subidas prolongadas de los tipos de la Fed.",
      "Falta de un mercado de bonos líquidos y transparentes de tamaño comparable a los Bonos del Tesoro de EE. UU. (Treasuries).",
    ],
    nodosGeograficos: [
      { id: "new-york-fed-vault", nombre: "Bóveda de la Reserva Federal de Nueva York (Manhattan)", lat: 40.708, lng: -74.009, tipo: "financiero", relevancia: "Mayor custodia subterránea de oro monetario soberano de gobiernos extranjeros." },
      { id: "shanghai-gold-exchange", nombre: "Bolsa de Oro de Shanghái (SGE)", lat: 31.238, lng: 121.492, tipo: "financiero", relevancia: "Mayor mercado físico de oro del mundo y plataforma de contratos en yuanes." },
      { id: "swift-headquarters", nombre: "Sede de SWIFT (La Hulpe, Bélgica)", lat: 50.735, lng: 4.478, tipo: "infraestructura", relevancia: "Cooperativa de mensajería financiera que conecta más de 11.000 instituciones en 200 países." },
      { id: "bis-basel", nombre: "Banco de Pagos Internacionales (Torre de Basilea)", lat: 47.548, lng: 7.591, tipo: "financiero", relevancia: "El banco central de los bancos centrales y custodio de la normativa de Basilea III." },
    ],
    comparativa: {
      eje: "Papel de Reserva: Dólar Estadounidense vs. Oro Físico vs. Yuan Chino",
      descripcion: "Comparación de liquidez, riesgo de sanción, convertibilidad y estabilidad de reserva.",
      actorA: {
        nombre: "Dólar Estadounidense (USD)",
        iso: "US",
        metricas: [
          { k: "Cuota de reservas mundiales", v: "57.8%", barra: 58 },
          { k: "Liquidez en mercado secundario", v: "Máxima (Profundidad absoluta)", barra: 98 },
          { k: "Riesgo de congelación / sanción", v: "Elevado (Jurisdicción de EE. UU.)", barra: 75 },
          { k: "Facilidad de transbordo y custodia", v: "Electrónica instantánea", barra: 95 },
        ],
      },
      actorB: {
        nombre: "Oro Monetario Físico (Au)",
        metricas: [
          { k: "Cuota de reservas mundiales", v: "18.5% (Creciente)", barra: 19 },
          { k: "Liquidez en mercado secundario", v: "Alta pero física", barra: 65 },
          { k: "Riesgo de congelación / sanción", v: "Nulo (Si está repatriado)", barra: 0 },
          { k: "Facilidad de transbordo y custodia", v: "Compleja / Bóvedas de alta seguridad", barra: 30 },
        ],
      },
      veredictoAnalitico: "El dólar sigue siendo insustituible a corto plazo para la operativa diaria del comercio global por su inigualable liquidez, pero el oro se consolida como el refugio neutral definitivo para proteger patrimonios soberanos frente a la fragmentación geopolítica.",
    },
    conexionesVanguard: {
      labsModelos: [
        { id: "economia-nacional", titulo: "Economía Nacional y Flujos Macroeconómicos", razon: "Simula el balance entre déficit fiscal, tipos de interés y deuda pública en economías avanzadas." },
        { id: "presupuesto-publico", titulo: "Presupuesto Público y Cargas de Intereses", razon: "Calcula qué porcentaje del gasto del Estado se destina a pagar intereses de la deuda ante tipos elevados." },
      ],
      toolsAnalisis: [
        { id: "calculadora-dependencia", titulo: "Calculadora de Dependencia", razon: "Mide la exposición de reservas soberanas a jurisdicciones extranjeras." },
        { id: "linea-tiempo-causal", titulo: "Línea de Tiempo Causal", razon: "Mapea las decisiones de política de sanciones de 2014 a 2026 y la reacción de los bancos centrales." },
      ],
      modulosRelacionados: [
        { href: "/divisas", label: "Centro de Divisas", desc: "Monedas oficiales, tipos de cambio frente al dólar y paridades de compra." },
        { href: "/mundos/US", label: "Dossier Estados Unidos", desc: "Métricas de deuda federal, inflación y balanza comercial." },
      ],
      temasHermanos: ["semiconductores-litografia", "minerales-criticos-energia", "ciberdefensa-infraestructura-critica"],
    },
    fuentesMetodologicas: [
      { institucion: "International Monetary Fund (IMF)", publicacion: "Currency Composition of Official Foreign Exchange Reserves (COFER)", anio: 2025, tipo: "ORGANISMO_MULTILATERAL" },
      { institucion: "Bank for International Settlements (BIS)", publicacion: "Triennial Central Bank Survey of Foreign Exchange and OTC Derivatives Markets", anio: 2025, tipo: "ORGANISMO_MULTILATERAL" },
      { institucion: "World Gold Council", publicacion: "Gold Demand Trends & Central Bank Net Purchases", anio: 2026, tipo: "INSTITUTO_INVESTIGACION" },
    ],
  },
  {
    id: "ciberdefensa-infraestructura-critica",
    titulo: "Cables Submarinos, Nubes Soberanas y la Defensa de Infraestructuras Críticas",
    subtitulo: "El 99% de las comunicaciones intercontinentales viaja por el lecho oceánico: vulnerabilidad física de la fibra óptica y guerra cibernética de denegación",
    categoria: "TECNOLOGIA_CIBER",
    etiquetas: ["Cables Submarinos", "Ciberdefensa", "Infraestructura Crítica", "Guerra Híbrida", "OTAN", "Telecomunicaciones"],
    urgenciaSistemica: "CRITICA",
    fechaActualizacion: "2026-10-04",
    tiempoLecturaMin: 7,
    resumenEjecutivo:
      "A pesar del imaginario popular de los satélites, el 99% del tráfico de Internet y de las transferencias financieras internacionales (más de 10 billones de dólares diarios) viaja por unos 550 sistemas de cables submarinos de fibra óptica tendidos en el fondo del mar. Su concentración en puntos de amarre específicos y aguas poco profundas los convierte en objetivos primarios de sabotaje submarino, corte intencionado de anclas y espionaje de señales por vehículos no tripulados.",
    preguntasClave: [
      "¿Qué capacidad de respuesta naval existe para reparar un cable cortado a 3.000 metros de profundidad en aguas disputadas?",
      "¿Cómo operan buques de investigación como el 'Yantar' ruso en proximidad de la infraestructura submarina europea?",
      "¿En qué medida el 'Cloud Act' de EE. UU. impulsa la demanda de nubes soberanas en Europa y Asia?",
    ],
    conceptosEsenciales: [
      {
        termino: "Estaciones de Amarre (Cable Landing Stations)",
        definicion: "Instalaciones costeras donde el cable submarino emerge del océano y se conecta a la red troncal terrestre mediante equipos de alimentación eléctrica y amplificación óptica.",
        contexto: "Puntos de estrangulamiento terrestre de alta vulnerabilidad física; sitios como Bude (Reino Unido), Fortaleza (Brasil) o Marsella (Francia) concentran docenas de cables en pocos kilómetros.",
      },
      {
        termino: "Guerra Híbrida en el Fondo Marino (Seabed Warfare)",
        definicion: "Operaciones militares destinadas a mapear, intervenir, sabotear o defender la infraestructura instalada en el lecho oceánico (cables de datos, oleoductos, sensores acústicos).",
        contexto: "Área de máxima prioridad estratégica para la OTAN tras el sabotaje de los gasoductos Nord Stream y los cortes en el Báltico.",
      },
      {
        termino: "Barcos Cableros (Cable Repair Ships)",
        definicion: "Flota comercial altamente especializada de menos de 60 buques en todo el mundo capaces de recuperar un cable roto del fondo, empalmar fibras microscópicas en cubierta y volverlo a tender.",
        contexto: "Déficit severo de buques de reparación; reparar un corte puede demorarse entre dos semanas y tres meses.",
      },
    ],
    actoresClave: [
      { nombre: "Compañías Tecnológicas Gigantes (Meta, Google, Microsoft, Amazon)", rol: "Propietarios mayoritarios de los nuevos cables", postura: "Financiación de consorcios privados para asegurar ancho de banda inter-data centers.", influencia: "Financian >70% de las nuevas rutas submarinas", codigoIso: "US" },
      { nombre: "GUGI (Dirección Principal de Investigación de Aguas Profundas de Rusia)", rol: "Fuerza submarina especializada en fondos marinos", postura: "Mapeo exhaustivo y capacidad de intervención con minisubmarinos de propulsión nuclear.", influencia: "Capacidad de corte en aguas profundas", codigoIso: "RU" },
      { nombre: "Alianza Atlántica (Centro de Seguridad Submarina de la OTAN)", rol: "Coordinador defensivo", postura: "Vigilancia marítima conjunta y uso de sensores autónomos para disuadir ataques a infraestructuras.", influencia: "Monitoreo del Mar del Norte y Báltico", codigoIso: "EU" },
    ],
    cronologia: [
      { fecha: "2022-09", hito: "Sabotaje de los gasoductos Nord Stream 1 y 2 en el Mar Báltico con cargas explosivas.", impacto: "Punto de inflexión que alerta a Occidente sobre la vulnerabilidad de todas las tuberías y cables en el lecho marino." },
      { fecha: "2023-10", hito: "Daños en el gasoducto Balticconnector y cables de telecomunicaciones entre Finlandia y Estonia provocados por anclas arrastradas.", impacto: "Activación de protocolos de patrullaje intensivo de la OTAN en el Báltico." },
      { fecha: "2024-03", hito: "Corte de cuatro cables de telecomunicaciones submarinos en el Mar Rojo frente a las costas de Yemen.", impacto: "Interrupción del 25% del tráfico de datos entre Asia y Europa que debió ser redirigido por el Cabo de Buena Esperanza." },
      { fecha: "2025-10", hito: "La OTAN pone en marcha el sistema digital de monitoreo acústico del lecho marino con drones submarinos no tripulados (UUV).", impacto: "Primera red defensiva automatizada de protección de cables en el Atlántico Norte." },
    ],
    indicadoresEmpiricos: [
      {
        nombre: "Porcentaje del tráfico intercontinental que viaja por cables submarinos",
        valor: "99.2%",
        unidad: "porcentaje del tráfico total",
        periodo: "2025",
        fuenteOficial: "TeleGeography Submarine Cable Map Research",
        tendencia: "estable",
        interpretacion: "Contrasta con la creencia de que las constelaciones satelitales pueden absorber el volumen global de Internet.",
      },
      {
        nombre: "Valor diario estimado de transacciones financieras procesadas por cables",
        valor: "10.5",
        unidad: "billones de dólares ($ Trillion / día)",
        periodo: "2025",
        fuenteOficial: "Bank for International Settlements / NATO Intelligence Division",
        tendencia: "sube",
        interpretacion: "Un corte múltiple paraliza de inmediato la liquidación de divisas interbancarias.",
      },
      {
        nombre: "Flota mundial operativa de barcos especializados en reparación de cables",
        valor: "58",
        unidad: "buques cableros en servicio",
        periodo: "2026",
        fuenteOficial: "International Cable Protection Committee (ICPC)",
        tendencia: "baja",
        interpretacion: "La edad media de la flota supera los 21 años, provocando cuellos de botella ante incidentes múltiples simultáneos.",
      },
    ],
    puntosCiegos: [
      "Falta de buques de bandera de la OTAN con capacidad de reparación urgente en caso de conflicto armado abierto.",
      "El estrecho de Luzón (entre Taiwán y Filipinas), zona sísmica de alto riesgo donde convergen decenas de cables transpacíficos.",
      "Ciberataques directos a los sistemas SCADA de control remoto de las estaciones de amarre que alimentan los repetidores submarinos.",
    ],
    nodosGeograficos: [
      { id: "bude-landing-station", nombre: "Estación de Bude (Cornualles, Reino Unido)", lat: 50.83, lng: -4.54, tipo: "infraestructura", relevancia: "Principal punto de llegada británico para cables transatlánticos procedentes de EE. UU." },
      { id: "marseille-hub", nombre: "Hub de Marsella (Francia)", lat: 43.3, lng: 5.37, tipo: "infraestructura", relevancia: "Nodo clave donde confluyen más de 16 cables que conectan Europa con Oriente Medio, Asia y África." },
      { id: "red-sea-bottleneck", nombre: "Garganta del Mar Rojo (Bab el-Mandeb)", lat: 12.58, lng: 43.33, tipo: "chokepoint", relevancia: "Aguas someras donde se agrupan los cables que unen Europa y Asia, expuestos a anclas y sabotajes." },
      { id: "luzon-strait-cables", nombre: "Estrecho de Luzón (Fosa de Manila)", lat: 20.5, lng: 121.5, tipo: "chokepoint", relevancia: "Paso sísmico crítico para cables que enlazan Hong Kong, Taiwán, Japón y EE. UU." },
    ],
    comparativa: {
      eje: "Transmisión de Datos: Cables Submarinos de Fibra Óptica vs. Constelaciones Satelitales LEO (Starlink/Kuiper)",
      descripcion: "Comparativa de capacidad de ancho de banda, latencia física y resistencia a la guerra electrónica.",
      actorA: {
        nombre: "Cables Submarinos de Fibra Óptica",
        metricas: [
          { k: "Capacidad de transmisión por enlace", v: ">250 Terabits/s", barra: 100 },
          { k: "Latencia transatlántica (NY-Londres)", v: "~58 ms (Física óptica)", barra: 90 },
          { k: "Inmunidad a inhibición de radiofrecuencia (Jamming)", v: "Total (Luz confinada)", barra: 98 },
          { k: "Vulnerabilidad a corte físico", v: "Alta (Fácil de cortar en plataforma somera)", barra: 80 },
        ],
      },
      actorB: {
        nombre: "Satélites en Órbita Baja (LEO)",
        metricas: [
          { k: "Capacidad de transmisión por satélite", v: "0.2 a 0.5 Terabits/s", barra: 10 },
          { k: "Latencia transatlántica relativa", v: "~70 ms (Con enlaces láser)", barra: 75 },
          { k: "Inmunidad a inhibición de radiofrecuencia (Jamming)", v: "Vulnerable a guerra electrónica", barra: 35 },
          { k: "Vulnerabilidad a corte físico", v: "Baja (Dispersión orbital)", barra: 20 },
        ],
      },
      veredictoAnalitico: "Los satélites LEO son formidables para resiliencia táctica de emergencia y zonas remotas, pero carecen de la capacidad física de transporte (terabits) para reemplazar a los cables submarinos, que siguen siendo la infraestructura crítica insustituible de la economía moderna.",
    },
    conexionesVanguard: {
      labsModelos: [
        { id: "red-cascada", titulo: "Red en Cascada y Fallos Sistémicos", razon: "Simula cómo la pérdida de un porcentaje de nodos de amarre interrumpe el tráfico financiero global en dominó." },
        { id: "movilidad-urbana", titulo: "Redes y Flujos de Transporte", razon: "Modela la saturación de redes alternativas cuando las vías principales sufren una caída súbita." },
      ],
      toolsAnalisis: [
        { id: "simulador-cascada", titulo: "Simulador de Cascada", razon: "Evalúa el impacto de la desconexión de Marsella o Bude en las transacciones interbancarias europeas." },
        { id: "matriz-riesgo", titulo: "Matriz de Riesgo Geopolítico", razon: "Registra la vulnerabilidad de las infraestructuras submarinas de los países ribereños del Báltico." },
      ],
      modulosRelacionados: [
        { href: "/espia", label: "Modo Espía", desc: "Radar de vigilancia y boletines de ciberseguridad." },
        { href: "/servicios", label: "Servicios Secretos", desc: "Dossier de agencias de inteligencia cibernética y de señales (NSA, GCHQ, BND)." },
      ],
      temasHermanos: ["semiconductores-litografia", "desdolarizacion-deuda-global", "inteligencia-artificial-frontera"],
    },
    fuentesMetodologicas: [
      { institucion: "TeleGeography", publicacion: "Global Bandwidth Research & Submarine Cable Map Report", anio: 2025, tipo: "INSTITUTO_INVESTIGACION" },
      { institucion: "NATO CCDCOE", publicacion: "Strategic Assessment of Subsea Infrastructure Resilience", anio: 2025, tipo: "THINK_TANK" },
      { institucion: "International Cable Protection Committee (ICPC)", publicacion: "Submarine Cables and the Oceans: Connecting the World", anio: 2024, tipo: "ORGANISMO_MULTILATERAL" },
    ],
  },
  {
    id: "disuasion-nuclear-hipersonicos",
    titulo: "Sistemas Hipersónicos, Proliferación Estratégica y la Erosión de la Disuasión Nuclear",
    subtitulo: "Velocidades superiores a Mach 5 y maniobrabilidad impredecible: el colapso del tiempo de preaviso y la crisis de la estabilidad estratégica",
    categoria: "DEFENSA_ESTRATEGIA",
    etiquetas: ["Armas Hipersónicas", "Disuasión Nuclear", "Estabilidad Estratégica", "Defensa Antimisil", "MAD", "Sistemas HGV"],
    urgenciaSistemica: "CRITICA",
    fechaActualizacion: "2026-10-02",
    tiempoLecturaMin: 8,
    resumenEjecutivo:
      "Durante la Guerra Fría, la disuasión nuclear descansó sobre la Destrucción Mutua Asegurada (MAD), regida por trayectorias balísticas predecibles que otorgaban de 25 a 30 minutos de tiempo de decisión a los líderes de las superpotencias. Los vehículos de planeo hipersónico (HGV) y los misiles de crucero hipersónicos (HCM), que vuelan en la atmósfera superior a más de Mach 5 maniobrando en curso, reducen los tiempos de respuesta a menos de seis minutos y ciegan los radares de alerta temprana basados en arcos balísticos parabólicos.",
    preguntasClave: [
      "¿Cómo altera la ambigüedad de ojiva (nuclear vs. convencional) en misiles hipersónicos el cálculo de represalia nuclear?",
      "¿Son viables los sistemas de interceptación en fase de planeo como el Glide Phase Interceptor (GPI) antes de 2030?",
      "¿Qué impacto tiene el fin del tratado New START en el despliegue no verificado de ojivas por Rusia y EE. UU.?",
    ],
    conceptosEsenciales: [
      {
        termino: "Vehículo de Planeo Hipersónico (HGV)",
        definicion: "Ojiva lanzada por un cohete propulsor que se desprende en la atmósfera superior (40-100 km de altitud) y planea hacia su objetivo maniobrando aerodinámicamente a velocidades de Mach 5 a Mach 20.",
        contexto: "Ejemplos operativos: Avangard (Rusia), DF-17 (China). Imposibilita el cálculo predictivo del punto de impacto a los sistemas Patriot, THAAD o Aegis.",
      },
      {
        termino: "Ambigüedad de Ojiva (Warhead Ambiguity)",
        definicion: "Imposibilidad para los sistemas de radar y satélite de advertir si un misil entrante a alta velocidad transporta una cabeza explosiva convencional o un arma termonuclear.",
        contexto: "Obliga a la doctrina defensiva atacada a asumir el peor escenario (ataque nuclear preventivo), elevando exponencialmente el riesgo de escalada accidental.",
      },
      {
        termino: "Fase de Planeo (Glide Phase)",
        definicion: "El tramo intermedio de vuelo donde el misil ya no está en el espacio exterior (fuerza de interceptores exoatmosféricos como SM-3) ni ha descendido a la fase terminal baja, volando en un vacío de cobertura defensiva.",
        contexto: "La zona donde EE. UU. y Japón desarrollan conjuntamente el futuro misil interceptor GPI.",
      },
    ],
    actoresClave: [
      { nombre: "República Popular China (Fuerza de Cohetes del EPL)", rol: "Líder en despliegue operativo regional", postura: "Desarrollo masivo de misiles hipersónicos antibuque (DF-21D, DF-17) para negar el acceso aeronaval en el Pacífico.", influencia: "Mayor inventario mundial de HGVs de alcance medio", codigoIso: "CN" },
      { nombre: "Federación Rusa", rol: "Pionero en sistemas estratégicos intercontinentales", postura: "Despliegue de sistemas Avangard y Kinzhal/Tsirkon para garantizar la penetración ante defensas de EE. UU.", influencia: "Capacidad hipersónica intercontinental activa", codigoIso: "RU" },
      { nombre: "Departamento de Defensa de EE. UU.", rol: "Desarrollo acelerado y defensa en capas", postura: "Priorización de sensores espaciales de seguimiento de calor (PWSA de la SDA) e interceptores GPI.", influencia: "Mayor presupuesto global de I+D militar", codigoIso: "US" },
    ],
    cronologia: [
      { fecha: "2019-12", hito: "Rusia declara operativo el primer regimiento equipado con el vehículo de planeo hipersónico Avangard.", impacto: "Primera ojiva hipersónica estratégica intercontinental en servicio activo." },
      { fecha: "2021-08", hito: "China realiza una prueba de sistema de bombardeo orbital fraccional (FOBS) con planeador hipersónico que da la vuelta al globo.", impacto: "Sorpresa estratégica en el Pentágono al demostrar capacidad de ataque polar sur eludiendo radares del Ártico." },
      { fecha: "2023-02", hito: "Rusia suspende su participación formal en el tratado de control de armas nucleares New START.", impacto: "Cese de inspecciones recíprocas sobre el terreno y fin de la transparencia verificable de arsenales." },
      { fecha: "2025-06", hito: "EE. UU. y Japón formalizan el acuerdo industrial para el desarrollo del misil interceptor Glide Phase Interceptor (GPI).", impacto: "Esfuerzo conjunto para desplegar capacidad de defensa antimisil hipersónico para la década de 2030." },
    ],
    indicadoresEmpiricos: [
      {
        nombre: "Tiempo de reacción ante un ataque hipersónico a corta distancia",
        valor: "5 a 8",
        unidad: "minutos totales",
        periodo: "2026",
        fuenteOficial: "Congressional Research Service (CRS) Hypersonic Weapons Report",
        tendencia: "baja",
        interpretacion: "Reduce drásticamente el margen humano de consulta y presiona para automatizar la orden de respuesta con IA.",
      },
      {
        nombre: "Velocidad terminal de un HGV intercontinental (Avangard)",
        valor: "Mach 20+",
        unidad: "Mach (~24.000 km/h)",
        periodo: "2025",
        fuenteOficial: "SIPRI Yearbook / Russian Strategic Rocket Forces Disclosure",
        tendencia: "estable",
        interpretacion: "Genera una capa de plasma ionizado alrededor del vehículo que absorbe y distorsiona las ondas de radar.",
      },
      {
        nombre: "Número total de ojivas nucleares operativas en el mundo",
        valor: "12.121",
        unidad: "ojivas nucleares",
        periodo: "2025",
        fuenteOficial: "Stockholm International Peace Research Institute (SIPRI)",
        tendencia: "sube",
        interpretacion: "Primera década en 35 años donde los arsenales nucleares globales vuelven a expandirse numéricamente.",
      },
    ],
    puntosCiegos: [
      "Falta de acuerdos bilaterales o multilaterales sobre límites a armas hipersónicas en el derecho internacional.",
      "Vulnerabilidad de las constelaciones de satélites de alerta temprana ante armas antisatélite de ascenso directo y pulsos electromagnéticos (EMP).",
      "El riesgo de delegación de comando de lanzamiento a algoritmos autónomos ante la incapacidad humana de reaccionar en 300 segundos.",
    ],
    nodosGeograficos: [
      { id: "cheyenne-mountain-norad", nombre: "Complejo de Cheyenne Mountain (NORAD, Colorado)", lat: 38.744, lng: -104.846, tipo: "infraestructura", relevancia: "Búnker de comando endurecido de alerta temprana y vigilancia aeroespacial." },
      { id: "jiuquan-missile-range", nombre: "Polígono Espacial y Militar de Jiuquan (Gobi, China)", lat: 40.96, lng: 100.28, tipo: "infraestructura", relevancia: "Centro de pruebas de la Fuerza de Cohetes del EPL para vectores hipersónicos DF-17." },
      { id: "kapustin-yar-range", nombre: "Polígono Militar de Kapustin Yar (Astracán, Rusia)", lat: 48.58, lng: 45.74, tipo: "infraestructura", relevancia: "Histórico polígono ruso de ensayos de misiles balísticos y armas de nueva generación." },
      { id: "guam-andersen-afb", nombre: "Base Aérea Andersen (Isla de Guam)", lat: 13.58, lng: 144.93, tipo: "conflicto", relevancia: "Puesto de avanzada estadounidense en la Segunda Cadena de Islas, objetivo prioritario de misiles hipersónicos." },
    ],
    comparativa: {
      eje: "Trayectoria Estratégica: Misil Balístico Intercontinental Tradicional (ICBM) vs. Planeador Hipersónico (HGV)",
      descripcion: "Comparativa de altitud máxima, detectabilidad y margen de cálculo para sistemas de intercepción.",
      actorA: {
        nombre: "ICBM Tradicional (Trayectoria Kepleriana)",
        metricas: [
          { k: "Altitud máxima de apogeo", v: "1.200 km (Espacio profundo)", barra: 95 },
          { k: "Previsibilidad de impacto", v: "Inmediata tras combustión", barra: 95 },
          { k: "Tiempo de preaviso intercontinental", v: "25 a 30 minutos", barra: 80 },
          { k: "Vulnerabilidad a intercepción", v: "Intermediaria (SM-3 / GMD)", barra: 60 },
        ],
      },
      actorB: {
        nombre: "HGV Hipersónico (Vuelo Atmosférico)",
        metricas: [
          { k: "Altitud de crucero en planeo", v: "40 a 80 km (Mesosfera)", barra: 25 },
          { k: "Previsibilidad de impacto", v: "Impredecible (Maniobras laterales)", barra: 10 },
          { k: "Tiempo de preaviso intercontinental", v: "12 a 15 min (Menor a corta dist.)", barra: 35 },
          { k: "Vulnerabilidad a intercepción", v: "Casi invulnerable hoy", barra: 10 },
        ],
      },
      veredictoAnalitico: "El HGV hipersónico invalida la arquitectura multimillonaria de defensas antimisiles desplegada en las últimas tres décadas, reactivando la lógica de la ofensiva pura y forzando a las potencias a replantearse la disuasión desde la incertidumbre extrema.",
    },
    conexionesVanguard: {
      labsModelos: [
        { id: "imperios-expansion", titulo: "Expansión y Límites Imperiales", razon: "Analiza cómo la asimetría tecnológica armamentística altera las fronteras de influencia de las superpotencias." },
        { id: "red-cascada", titulo: "Red en Cascada y Fallos Sistémicos", razon: "Simula el colapso de infraestructuras nacionales ante ataques de decapitación de mando." },
      ],
      toolsAnalisis: [
        { id: "matriz-riesgo", titulo: "Matriz de Riesgo Geopolítico", razon: "Evalúa la probabilidad y el impacto catastrófico de un error de cálculo nuclear." },
        { id: "comparador-paises", titulo: "Comparador de Países", razon: "Contrasta el arsenal y los presupuestos militares de EE. UU., Rusia y China." },
      ],
      modulosRelacionados: [
        { href: "/armeria", label: "Armería Vanguard", desc: "Fichas técnicas de sistemas de misiles, cabezas nucleares y defensas antiaéreas." },
        { href: "/poder", label: "Poder Militar", desc: "Gasto de defensa y efectivos militares mundiales contrastados." },
        { href: "/sala/warsim", label: "Simulador de Guerra", desc: "Simulador táctico y estratégico país contra país." },
      ],
      temasHermanos: ["ciberdefensa-infraestructura-critica", "semiconductores-litografia", "inteligencia-artificial-frontera"],
    },
    fuentesMetodologicas: [
      { institucion: "Stockholm International Peace Research Institute (SIPRI)", publicacion: "SIPRI Yearbook 2025: Armaments, Disarmament and International Security", anio: 2025, tipo: "THINK_TANK" },
      { institucion: "Congressional Research Service (CRS)", publicacion: "Hypersonic Weapons: Background and Issues for Congress", anio: 2025, tipo: "AGENCIA_OFICIAL" },
      { institucion: "Bulletin of the Atomic Scientists", publicacion: "Nuclear Notebook: Global Nuclear Weapons Inventories", anio: 2026, tipo: "INSTITUTO_INVESTIGACION" },
    ],
  },
  {
    id: "cuenca-artica-deshielo",
    titulo: "La Cuenca Ártica: Deshielo Glaciar, Ruta Marítima del Norte y Soberanía Polar",
    subtitulo: "El calentamiento del Océano Ártico abre un nuevo océano comercial y reactiva la competencia militar por recursos hidrocarburíferos y minerales",
    categoria: "CLIMA_AGUA",
    etiquetas: ["Ártico", "Ruta Marítima del Norte", "Deshielo", "Cambio Climático", "Soberanía Polar", "Paso del Noreste"],
    urgenciaSistemica: "MODERADA",
    fechaActualizacion: "2026-09-28",
    tiempoLecturaMin: 7,
    resumenEjecutivo:
      "El Ártico se está calentando cuatro veces más rápido que la media mundial. La reducción estival de la banquisa polar está transformando una barrera infranqueable de hielo en un corredor de navegación comercial viable: la Ruta Marítima del Norte (NSR), que recorta la distancia entre Róterdam y Shanghái en un 40% frente al Canal de Suez. La carrera por reclamar la plataforma continental bajo la CONVEMAR de la ONU y la remilitarización de bases soviéticas abren un nuevo tablero geopolítico.",
    preguntasClave: [
      "¿Es económicamente competitivo el tránsito comercial ártico dados los costes de rompehielos nucleares y seguros navales?",
      "¿Cómo afectará el solapamiento de reclamos sobre la Dorsal de Lomonósov entre Rusia, Dinamarca (Groenlandia) y Canadá?",
      "¿Qué consecuencias tiene la parálisis diplomática del Consejo Ártico tras el aislamiento internacional de Moscú?",
    ],
    conceptosEsenciales: [
      {
        termino: "Ruta Marítima del Norte (NSR / Northern Sea Route)",
        definicion: "Vía de navegación a lo largo de la costa ártica rusa, desde el Mar de Barents (Murmansk) hasta el Estrecho de Bering.",
        contexto: "Rusia la considera una vía navegable interior bajo su control de practicaje y tarifa obligatoria de escolta de rompehielos de Rosatom.",
      },
      {
        termino: "Dorsal de Lomonósov",
        definicion: "Cadena montañosa submarina de 1.800 km que cruza el fondo del Océano Ártico desde las islas de Nueva Siberia hasta Groenlandia.",
        contexto: "Rusia, Dinamarca y Canadá reclaman que es una extensión geológica natural de su plataforma continental para adjudicarse los derechos de los fondos marinos.",
      },
      {
        termino: "Amplificación Ártica",
        definicion: "Fenómeno por el cual la pérdida de hielo blanco (que refleja el 80% de la luz solar) expone aguas oscuras (que absorben el 90% del calor), acelerando el calentamiento del polo en un ciclo de retroalimentación positiva.",
        contexto: "Explica por qué los modelos climáticos proyectan veranos prácticamente libres de hielo marino antes de 2040.",
      },
    ],
    actoresClave: [
      { nombre: "Federación Rusa (Rosatom / Flota Ártica)", rol: "Potencia territorial dominante del litoral ártico", postura: "Monopolio de escolta con la única flota mundial de rompehielos nucleares (Proyecto 22220).", influencia: "Controla el 53% del litoral del Océano Ártico", codigoIso: "RU" },
      { nombre: "Estados Ribereños de la OTAN (EE. UU., Canadá, Noruega, Dinamarca)", rol: "Bloque de contención polar", postura: "Reafirmación de la libertad de navegación internacional en aguas árticas e interoperabilidad militar.", influencia: "Control de las salidas atlánticas del Ártico", codigoIso: "NO" },
      { nombre: "República Popular China", rol: "Estado 'cercano al Ártico' autodeclarado", postura: "Promoción de la 'Ruta de la Seda Polar' e inversiones en gas natural licuado (Yamal LNG / Arctic LNG 2).", influencia: "Capacidad de financiación y construcción naval", codigoIso: "CN" },
    ],
    cronologia: [
      { fecha: "2007-08", hito: "La expedición rusa Arktika 2007 clava una bandera de titanio en el lecho marino del Polo Norte a 4.261 m de profundidad.", impacto: "Simbolismo geopolítico que desata la carrera legal por la plataforma continental." },
      { fecha: "2017-12", hito: "Inauguración de la planta de gas natural licuado Yamal LNG en la península de Yamal.", impacto: "Demostración de que la exportación de hidrocarburos árticos con metaneros rompehielos ARC7 es comercialmente viable." },
      { fecha: "2022-03", hito: "Siete de los ocho países del Consejo Ártico suspenden la cooperación oficial con Rusia.", impacto: "Parálisis del principal foro de gobernanza ambiental y rescate en el polo." },
      { fecha: "2025-08", hito: "El tráfico estival por la Ruta Marítima del Norte supera los 36 millones de toneladas transportadas.", impacto: "Récord histórico de carga impulsado por metaneros y petroleros hacia puertos chinos." },
    ],
    indicadoresEmpiricos: [
      {
        nombre: "Extensión mínima del hielo marino ártico en septiembre",
        valor: "4.28",
        unidad: "millones de km²",
        periodo: "Mínimo 2025",
        fuenteOficial: "National Snow and Ice Data Center (NSIDC) / NASA",
        tendencia: "baja",
        interpretacion: "Representa una reducción de más del 40% respecto a los promedios observados entre 1979 y 2000.",
      },
      {
        nombre: "Ahorro de distancia Shanghái - Róterdam por la Ruta del Norte frente a Suez",
        valor: "7.000",
        unidad: "kilómetros de ahorro (~40%)",
        periodo: "2025",
        fuenteOficial: "International Maritime Organization / Rosatomflot Logistics",
        tendencia: "estable",
        interpretacion: "Reduce de 33 a unos 21 días de navegación en temporada estival libre de hielo denso.",
      },
      {
        nombre: "Flota operativa de rompehielos pesados: Rusia vs. Estados Unidos",
        valor: "41 frente a 2",
        unidad: "buques rompehielos en servicio",
        periodo: "2026",
        fuenteOficial: "U.S. Coast Guard Polar Security Cutter Assessment / Rosatom",
        tendencia: "estable",
        interpretacion: "Asimetría material abrumadora en capacidad de intervención física en aguas polares.",
      },
    ],
    puntosCiegos: [
      "Escasez de infraestructura de búsqueda y rescate (SAR) en miles de kilómetros de costa desolada ante naufragios en aguas gélidas.",
      "Comportamiento de derrames petroleros bajo el hielo: no existe tecnología demostrada para limpiar un derrame masivo de crudo en la banquisa polar.",
      "Emisiones de carbono negro (hollín) de los buques de carga, que depositan partículas oscuras en el hielo acelerando su fusión.",
    ],
    nodosGeograficos: [
      { id: "bering-strait-polar", nombre: "Estrecho de Bering (Garganta Polar)", lat: 65.8, lng: -168.9, tipo: "chokepoint", relevancia: "Paso de 85 km que separa Alaska de Siberia y controla la salida hacia el Pacífico." },
      { id: "yamal-sabetta-port", nombre: "Puerto de Sabetta (Península de Yamal)", lat: 71.27, lng: 72.07, tipo: "infraestructura", relevancia: "Terminal de exportación de GNL ártico más septentrional del mundo." },
      { id: "murmansk-nuclear-base", nombre: "Murmansk (Sede de Atomflot)", lat: 68.97, lng: 33.08, tipo: "infraestructura", relevancia: "Único puerto ártico ruso libre de hielos todo el año y base de los rompehielos atómicos." },
      { id: "svalbard-archipelago", nombre: "Archipiélago de Svalbard (Longyearbyen)", lat: 78.22, lng: 15.63, tipo: "conflicto", relevancia: "Territorio de soberanía noruega bajo tratado especial de 1920 desmilitarizado y con presencia minera rusa." },
    ],
    comparativa: {
      eje: "Ruta Comercial Europa - Asia: Canal de Suez vs. Ruta Marítima del Norte (NSR)",
      descripcion: "Comparativa de distancia, limitaciones estacionales y costes de operación por travesía.",
      actorA: {
        nombre: "Ruta del Canal de Suez (Tradicional)",
        metricas: [
          { k: "Distancia Róterdam - Shanghái", v: "~19.800 km", barra: 100 },
          { k: "Operatividad anual", v: "365 días al año", barra: 100 },
          { k: "Riesgos geopolíticos", v: "Chokepoints volátiles (Suez / Bab el-Mandeb)", barra: 75 },
          { k: "Requerimiento de casco reforzado", v: "Estándar convencional", barra: 10 },
        ],
      },
      actorB: {
        nombre: "Ruta Marítima del Norte (Ártico)",
        metricas: [
          { k: "Distancia Róterdam - Shanghái", v: "~12.800 km (-35%)", barra: 65 },
          { k: "Operatividad anual", v: "4 a 5 meses (Verano/Otoño)", barra: 40 },
          { k: "Riesgos geopolíticos", v: "Control exclusivo ruso de paso", barra: 65 },
          { k: "Requerimiento de casco reforzado", v: "Obligatorio Polar Class / Rompehielos", barra: 95 },
        ],
      },
      veredictoAnalitico: "La NSR es un complemento estacional formidable para el transporte de materias primas a granel hacia China, pero difícilmente sustituirá a Suez para el transporte regular 'just-in-time' de bienes de consumo mientras el hielo invernal siga cerrando el paso la mitad del año.",
    },
    conexionesVanguard: {
      labsModelos: [
        { id: "clima-emisiones", titulo: "Clima, Emisiones y Efecto Invernadero", razon: "Simula el ritmo de calentamiento y la correlación con la pérdida de superficie de albedo en latitudes altas." },
        { id: "rutas-historicas", titulo: "Rutas Comerciales Históricas", razon: "Contrasta la apertura del paso del Noreste con las rutas de circunnavegación clásicas." },
      ],
      toolsAnalisis: [
        { id: "comparador-paises", titulo: "Comparador de Países", razon: "Compara el potencial ártico de Noruega, Canadá, Rusia y EE. UU." },
        { id: "linea-tiempo-causal", titulo: "Línea de Tiempo Causal", razon: "Mapea el deshielo decadal y las reclamaciones territoriales ante la ONU." },
      ],
      modulosRelacionados: [
        { href: "/mundos/NO", label: "Dossier Noruega", desc: "Soberanía sobre Svalbard, fondo soberano y fronteras árticas." },
        { href: "/mundos/RU", label: "Dossier Rusia", desc: "Extensión territorial polar, recursos de gas y flota naval del norte." },
      ],
      temasHermanos: ["estrecho-malaca-chokepoints", "minerales-criticos-energia", "estres-hidrico-nilo-renacimiento"],
    },
    fuentesMetodologicas: [
      { institucion: "National Snow and Ice Data Center (NSIDC)", publicacion: "Arctic Sea Ice News and Analysis", anio: 2025, tipo: "AGENCIA_OFICIAL" },
      { institucion: "Arctic Council (AMAP)", publicacion: "Arctic Climate Change Update 2025", anio: 2025, tipo: "ORGANISMO_MULTILATERAL" },
      { institucion: "U.S. Navy", publicacion: "Strategic Blueprint for the Arctic", anio: 2024, tipo: "AGENCIA_OFICIAL" },
    ],
  },
  {
    id: "seguridad-alimentaria-fertilizantes",
    titulo: "Seguridad Alimentaria Global, Fósforo y la Cadena de Fertilizantes Químicos",
    subtitulo: "Sin gas natural, fosfatos y potasa no hay cosechas: el soporte químico invisible que alimenta a 8.000 millones de personas",
    categoria: "ENERGIA_RECURSOS",
    etiquetas: ["Seguridad Alimentaria", "Fertilizantes", "Fósforo", "Haber-Bosch", "Agricultura Global", "Potasa"],
    urgenciaSistemica: "ALTA",
    fechaActualizacion: "2026-09-22",
    tiempoLecturaMin: 7,
    resumenEjecutivo:
      "Aproximadamente la mitad de los átomos de nitrógeno en el cuerpo de la población mundial actual proceden del proceso industrial Haber-Bosch de fijación de amoníaco mediante gas natural. Sumado al fósforo (cuyo 70% de reservas mundiales se encuentra en un solo país: Marruecos) y la potasa (dominada por Canadá, Rusia y Bielorrusia), la agricultura moderna es una rama de la industria petroquímica y minera. Cualquier perturbación en estos tres insumos desata crisis de hambre y convulsiones sociales en el Sur Global en una sola temporada agrícola.",
    preguntasClave: [
      "¿Cuándo se alcanzará el 'Pico del Fósforo' y qué alternativas existen para reciclar nutrientes en la agricultura a gran escala?",
      "¿Cómo influye el precio del gas natural licuado en el coste del pan y los alimentos básicos en África y América Latina?",
      "¿Qué grado de resiliencia tienen los cultivos ante la reducción forzada del uso de fertilizantes químicos?",
    ],
    conceptosEsenciales: [
      {
        termino: "Tríada NPK (Nitrógeno, Fósforo, Potasio)",
        definicion: "Los tres macronutrientes esenciales para el crecimiento vegetal que no tienen sustituto biológico a escala de producción masiva.",
        contexto: "El nitrógeno proviene del aire y gas natural; el fósforo y el potasio son minerales finitos extraídos de rocas fosfáticas y evaporitas.",
      },
      {
        termino: "El 'Monopolio Geológico' del Fósforo en Marruecos",
        definicion: "Concentración del 70% de las reservas probadas de roca fosfórica del planeta bajo control de la empresa estatal marroquí OCP Group.",
        contexto: "Convierte a Rabat en el actor de seguridad alimentaria más determinante del siglo XXI, por encima de los mayores productores de grano.",
      },
      {
        termino: "Proceso Haber-Bosch",
        definicion: "Reacción química que combina nitrógeno atmosférico con hidrógeno obtenido de hidrocarburos a altas presiones y temperaturas para sintetizar amoníaco.",
        contexto: "Consume cerca del 1.5% del suministro total de energía primaria mundial y es el cimiento de la demografía del siglo XX y XXI.",
      },
    ],
    actoresClave: [
      { nombre: "Reino de Marruecos (OCP Group)", rol: "Custodio de las reservas de fosfato", postura: "Inversión en plantas de fertilizantes a medida en África subsahariana y diplomacia de nutrientes.", influencia: "Posee >70% de las reservas mundiales de fósforo", codigoIso: "MA" },
      { nombre: "Canadá (Nutrien / Saskatchewan)", rol: "Mayor exportador mundial de potasa", postura: "Compensación del déficit generado por las sanciones a Bielorrusia y Rusia.", influencia: "32% de la producción global de potasa", codigoIso: "CA" },
      { nombre: "Federación Rusa", rol: "Exportador global integrado (NPK completo)", postura: "Uso estratégico de cuotas de exportación de fertilizantes como palanca de política exterior.", influencia: "Líder en exportación de fertilizantes nitrogenados", codigoIso: "RU" },
      { nombre: "Organización de las Naciones Unidas para la Alimentación (FAO)", rol: "Monitor de seguridad alimentaria y alerta temprana", postura: "Llamamiento a la diversificación y subsidios específicos para pequeños agricultores en países vulnerables.", influencia: "Coordinación de ayuda humanitaria alimentaria", codigoIso: "UN" },
    ],
    cronologia: [
      { fecha: "2021-09", hito: "Crisis del gas natural en Europa obliga a parar temporalmente el 50% de las plantas de fertilizantes de amoníaco.", impacto: "Multiplicación por cuatro del precio internacional de la urea en pocos meses." },
      { fecha: "2022-03", hito: "Rusia impone restricciones temporales a la exportación de fertilizantes a países no amigos.", impacto: "Subida récord del índice de precios de los alimentos de la FAO (159.7 puntos)." },
      { fecha: "2024-05", hito: "Marruecos firma acuerdos de suministro de fosfatos a largo plazo con Brasil, India y Nigeria.", impacto: "Consolidación de alianzas estratégicas Sur-Sur al margen de las bolsas occidentales." },
      { fecha: "2025-11", hito: "El informe SOFI de la FAO registra más de 730 millones de personas en situación de hambre crónica.", impacto: "La persistencia de altos costes de insumos agrícolas impide recuperar los niveles previos a 2020." },
    ],
    indicadoresEmpiricos: [
      {
        nombre: "Población humana alimentada gracias al nitrógeno sintético (Haber-Bosch)",
        valor: "48%",
        unidad: "porcentaje de la población mundial",
        periodo: "2025",
        fuenteOficial: "Our World in Data / Erisman et al. Nature Geoscience",
        tendencia: "estable",
        interpretacion: "Sin síntesis química de nitrógeno, la agricultura orgánica actual solo podría sostener a unos 4.200 millones de personas.",
      },
      {
        nombre: "Reservas mundiales de fosfatos localizadas en Marruecos",
        valor: "70.2%",
        unidad: "porcentaje del total global",
        periodo: "2026",
        fuenteOficial: "U.S. Geological Survey (USGS) Mineral Commodity Summaries",
        tendencia: "sube",
        interpretacion: "La mayor concentración geográfica de un recurso mineral indispensable en un solo Estado.",
      },
      {
        nombre: "Cuota de Rusia en la exportación mundial de fertilizantes combinados",
        valor: "15.8%",
        unidad: "porcentaje del comercio global",
        periodo: "2025",
        fuenteOficial: "International Fertilizer Association (IFA) Trade Statistics",
        tendencia: "estable",
        interpretacion: "Rusia es el único país con presencia masiva y simultánea en nitrógeno, fósforo y potasio.",
      },
    ],
    puntosCiegos: [
      "Eutrofización y zonas muertas en costas y desembocaduras fluviales provocadas por el escurrimiento de nitratos no absorbidos.",
      "Contaminación por cadmio en ciertas rocas fosfóricas y las estrictas normativas ambientales impuestas por la Unión Europea.",
      "Vulnerabilidad extrema de países de África Occidental ante la apreciación del dólar frente a monedas locales para comprar urea.",
    ],
    nodosGeograficos: [
      { id: "ocp-khouribga-mine", nombre: "Mina de Fosfato de Khouribga (Marruecos)", lat: 32.88, lng: -6.9, tipo: "produccion", relevancia: "Mayor yacimiento de roca fosfórica a cielo abierto del mundo." },
      { id: "jorf-lasfar-complex", nombre: "Complejo Industrial de Jorf Lasfar (Marruecos)", lat: 33.12, lng: -8.63, tipo: "infraestructura", relevancia: "Mayor centro integrado de transformación de fosfatos y ácido fosfórico del planeta." },
      { id: "saskatchewan-potash-basin", nombre: "Cuenca de Potasa de Saskatchewan (Canadá)", lat: 51.5, lng: -105.0, tipo: "produccion", relevancia: "Mayor reserva subterránea de potasa (cloruro de potasio) del hemisferio occidental." },
      { id: "togliatti-ammonia-plant", nombre: "TogliattiAzot (Samara, Rusia)", lat: 53.53, lng: 49.42, tipo: "produccion", relevancia: "Una de las mayores plantas de amoníaco sintético y punto de inicio del histórico oleoducto de amoníaco hacia el Mar Negro." },
    ],
    comparativa: {
      eje: "Agricultura Intensiva Industrial (NPK Químico) vs. Enfoques Agroecológicos Regenerativos",
      descripcion: "Comparación de rendimiento calórico por hectárea, resiliencia ante shocks de insumos y coste energético.",
      actorA: {
        nombre: "Modelo NPK Químico Intensivo",
        metricas: [
          { k: "Rendimiento calórico por hectárea", v: "Máximo (Trigo >7 t/ha)", barra: 95 },
          { k: "Dependencia de cadenas globales de suministro", v: "Crítica (Gas/Fósforo/Potasa)", barra: 95 },
          { k: "Huella energética por tonelada producida", v: "Elevada (Insumos fósiles)", barra: 80 },
          { k: "Capacidad de alimentar megalópolis", v: "Indispensable hoy", barra: 98 },
        ],
      },
      actorB: {
        nombre: "Modelo Regenerativo / Rotación Biológica",
        metricas: [
          { k: "Rendimiento calórico por hectárea", v: "Moderado (-25% a -40%)", barra: 60 },
          { k: "Dependencia de cadenas globales de suministro", v: "Baja (Nutrientes locales)", barra: 20 },
          { k: "Huella energética por tonelada producida", v: "Muy reducida", barra: 25 },
          { k: "Capacidad de alimentar megalópolis", v: "Insuficiente a corto plazo", barra: 40 },
        ],
      },
      veredictoAnalitico: "La agroecología es vital para restaurar suelos agotados y mitigar la dependencia química, pero abandonar súbitamente los fertilizantes sintéticos sin una transición de décadas desata caídas catastróficas en la producción de granos básicos, como demostró la crisis de Sri Lanka en 2022.",
    },
    conexionesVanguard: {
      labsModelos: [
        { id: "suelo-alimentos", titulo: "Suelo Agrícola y Capacidad de Carga", razon: "Calcula cuántas calorías per cápita produce un territorio en función de la dotación de fertilizantes y la fertilidad del suelo." },
        { id: "poblacion-edades", titulo: "Población y Transición Demográfica", razon: "Modela la demanda de alimentos proyectada según el crecimiento demográfico y la urbanización." },
      ],
      toolsAnalisis: [
        { id: "simulador-cascada", titulo: "Simulador de Cascada", razon: "Mide cómo una subida del 50% en el precio de la urea encarece la cesta de la compra básica en 60 países." },
        { id: "matriz-riesgo", titulo: "Matriz de Riesgo Geopolítico", razon: "Evalúa la vulnerabilidad de países netamente importadores de alimentos en el Cuerno de África." },
      ],
      modulosRelacionados: [
        { href: "/mundos/MA", label: "Dossier Marruecos", desc: "Economía minera, reservas de fosfatos y relaciones estratégicas." },
        { href: "/mundos/CA", label: "Dossier Canadá", desc: "Exportaciones de trigo, potasa y recursos agrícolas." },
      ],
      temasHermanos: ["estres-hidrico-nilo-renacimiento", "minerales-criticos-energia", "cuenca-artica-deshielo"],
    },
    fuentesMetodologicas: [
      { institucion: "Food and Agriculture Organization (FAO)", publicacion: "The State of Food Security and Nutrition in the World (SOFI)", anio: 2025, tipo: "ORGANISMO_MULTILATERAL" },
      { institucion: "International Fertilizer Association (IFA)", publicacion: "Fertilizer Outlook 2025-2029", anio: 2025, tipo: "THINK_TANK" },
      { institucion: "U.S. Geological Survey (USGS)", publicacion: "Phosphate Rock Statistics and Information", anio: 2026, tipo: "AGENCIA_OFICIAL" },
    ],
  },
  {
    id: "inteligencia-artificial-frontera",
    titulo: "Gobernanza de la IA de Frontera: Capacidad de Cómputo, Consumo Eléctrico y Soberanía Algorítmica",
    subtitulo: "El choque entre modelos de frontera de billones de parámetros, redes eléctricas sobrecargadas y la concentración monopolística del hardware",
    categoria: "TECNOLOGIA_CIBER",
    etiquetas: ["Inteligencia Artificial", "Centros de Cómputo", "Consumo Eléctrico", "Soberanía Algorítmica", "NVIDIA", "Energía Nuclear"],
    urgenciaSistemica: "CRITICA",
    fechaActualizacion: "2026-10-14",
    tiempoLecturaMin: 8,
    resumenEjecutivo:
      "El entrenamiento y la inferencia de modelos de inteligencia artificial de frontera han dejado de ser un problema puramente de software para convertirse en una cuestión de megavatios y soberanía de datos. Un solo gran centro de datos de IA consume hoy más de 1 gigavatio de potencia eléctrica continua —el equivalente a un reactor nuclear completo o a una ciudad de 800.000 habitantes. La competencia entre EE. UU. y China por asegurar reactores modulares pequeños (SMR), chips especializados y derechos sobre el talento reconfigura el mapa del poder tecnológico mundial.",
    preguntasClave: [
      "¿Pueden las redes eléctricas de Virginia, Irlanda o Singapur sostener el crecimiento de centros de cómputo sin frenar la descarbonización?",
      "¿En qué medida el software de código abierto y los modelos compactos pueden erosionar la ventaja de los modelos propietarios cerrados?",
      "¿Qué mecanismos de control de exportación son efectivos frente al contrabando de clústeres de GPUs a través de terceros países?",
    ],
    conceptosEsenciales: [
      {
        termino: "Centros de Datos de Gigavatios (Gigawatt Data Centers)",
        definicion: "Complejos masivos de servidores de IA con consumo eléctrico sostenido superior a 1 GW (1.000 megavatios) acoplados directamente a centrales nucleares o renovables dedicadas.",
        contexto: "Acuerdos como los de Microsoft con Constellation Energy para reactivar Three Mile Island o los de Google con reactores Kairos Power ejemplifican la tendencia.",
      },
      {
        termino: "Soberanía Algorítmica y de Datos",
        definicion: "Doctrina por la cual un Estado exige que los modelos fundacionales de IA entrenados con sus lenguas y datos culturales sean operados y alojados dentro de sus fronteras jurídicas.",
        contexto: "Impulsada por Francia, Emiratos Árabes Unidos, Japón y la Unión Europea mediante el Reglamento de Inteligencia Artificial (EU AI Act).",
      },
      {
        termino: "Leyes de Escala (Scaling Laws)",
        definicion: "Relación empírica según la cual el rendimiento de los modelos de lenguaje mejora predeciblemente con el aumento simultáneo de parámetros, datos de entrenamiento y potencia de cómputo (FLOPs).",
        contexto: "El motor teórico que justifica inversiones de más de 100.000 millones de dólares en clústeres computacionales.",
      },
    ],
    actoresClave: [
      { nombre: "Consorcios Hiperscalares de EE. UU. (Microsoft, Google, Amazon, Meta)", rol: "Financiadores de los mayores clústeres de cómputo", postura: "Aseguramiento de suministro energético 24/7 libre de carbono y liderazgo en modelos de frontera.", influencia: "Acumulan >75% del capex global en infraestructura de IA", codigoIso: "US" },
      { nombre: "Ecosistema Tecnológico Chino (Huawei, Alibaba, Baidu, BAAI)", rol: "Desarrollador bajo restricciones de chips", postura: "Optimización algorítmica, clústeres de chips Ascend nacionales y uso extensivo de modelos abiertos.", influencia: "Despliegue masivo en industria, visión y robótica", codigoIso: "CN" },
      { nombre: "NVIDIA Corporation", rol: "Arquitecto de silicio e interconexión", postura: "Venta de arquitecturas completas llave en mano (GPU, NVLink, switches InfiniBand, CUDA).", influencia: "Controla >85% del mercado de aceleradores de IA", codigoIso: "US" },
      { nombre: "Unión Europea (Oficina de IA / AI Act)", rol: "Primer regulador comprehensivo supranacional", postura: "Imposición de obligaciones estrictas de transparencia y auditoría de riesgos sistémicos para modelos de propósito general.", influencia: "Efecto Bruselas en estándares globales", codigoIso: "EU" },
    ],
    cronologia: [
      { fecha: "2023-11", hito: "Cumbre de Seguridad de la IA en Bletchley Park: 28 naciones firman la Declaración sobre riesgos de frontera.", impacto: "Primer reconocimiento diplomático global de los riesgos catastróficos potenciales de la IA avanzada." },
      { fecha: "2024-05", hito: "Aprobación definitiva del Reglamento Europeo de Inteligencia Artificial (AI Act).", impacto: "Entrada en vigor del primer marco normativo vinculante clasificado por niveles de riesgo." },
      { fecha: "2024-09", hito: "Acuerdos históricos de compra de energía nuclear a largo plazo por parte de gigantes tecnológicos.", impacto: "Reactivación de la industria de fisión nuclear civil impulsada por la demanda insaciable de los centros de cómputo." },
      { fecha: "2026-03", hito: "La potencia de cómputo utilizada en los entrenamientos de vanguardia supera los 10^27 FLOPs.", impacto: "El coste de entrenamiento de un solo modelo fundacional rebasa los 1.000 millones de dólares." },
    ],
    indicadoresEmpiricos: [
      {
        nombre: "Demanda eléctrica global estimada de centros de datos para 2026",
        valor: "1.050",
        unidad: "teravatios-hora (TWh / año)",
        periodo: "Proyección 2026",
        fuenteOficial: "International Energy Agency (IEA) Electricity 2024/2026 Report",
        tendencia: "sube",
        interpretacion: "Equivale aproximadamente al consumo eléctrico anual total de Japón.",
      },
      {
        nombre: "Inversión global de capital (Capex) en infraestructura y servidores de IA",
        valor: "220.000",
        unidad: "millones de dólares ($ M)",
        periodo: "2025/2026",
        fuenteOficial: "Stanford University AI Index Report 2025",
        tendencia: "sube",
        interpretacion: "Uno de los mayores ciclos de inversión de capital en infraestructura de la historia corporativa.",
      },
      {
        nombre: "Eficiencia de refrigeración en centros de datos de IA (PUE promedio)",
        valor: "1.15",
        unidad: "ratio PUE (Power Usage Effectiveness)",
        periodo: "2025",
        fuenteOficial: "Uptime Institute Global Data Center Survey",
        tendencia: "estable",
        interpretacion: "La refrigeración líquida directa al chip se vuelve obligatoria ante densidades de más de 100 kW por rack.",
      },
    ],
    puntosCiegos: [
      "Concentración física de los centros de datos en pocas subestaciones eléctricas (ej. Condado de Loudoun en Virginia canaliza el 70% del tráfico web mundial).",
      "Consumo de agua para torres de enfriamiento evaporativo en regiones ya afectadas por estrés hídrico.",
      "El agotamiento proyectado de datos de texto humano de alta calidad para entrenar nuevas generaciones de modelos sin colapso de datos sintéticos.",
    ],
    nodosGeograficos: [
      { id: "loudoun-data-alley", nombre: "Data Center Alley (Condado de Loudoun, Virginia)", lat: 39.04, lng: -77.48, tipo: "infraestructura", relevancia: "Mayor concentración de centros de datos y potencia instalada del mundo." },
      { id: "dublin-data-cluster", nombre: "Clúster Tecnológico de Dublín (Irlanda)", lat: 53.33, lng: -6.26, tipo: "infraestructura", relevancia: "Nodo europeo donde los centros de datos ya consumen más del 20% de la electricidad nacional." },
      { id: "singapore-jurong", nombre: "Parque de Centros de Datos de Jurong (Singapur)", lat: 1.32, lng: 103.7, tipo: "infraestructura", relevancia: "Hub de IA del Sudeste Asiático regulado por estándares de eficiencia térmica tropical." },
      { id: "guian-new-area", nombre: "Guian New Area (Guizhou, China)", lat: 26.39, lng: 106.52, tipo: "infraestructura", relevancia: "Epicentro del proyecto chino 'Cómputo del Este en el Oeste' aprovechando hidroelectricidad y cuevas kársticas frías." },
    ],
    comparativa: {
      eje: "Estrategias de IA: Modelo Propietario Fronterizo (EE. UU.) vs. Modelo Abierto / Estado (China / Europa)",
      descripcion: "Comparativa de barrera de entrada, adaptabilidad industrial y control regulatorio.",
      actorA: {
        nombre: "Modelo Propietario Privado (EE. UU.)",
        iso: "US",
        metricas: [
          { k: "Capacidad de cómputo en clústeres", v: "Líder mundial (>100k GPUs)", barra: 98 },
          { k: "Inversión privada de capital", v: ">$150B anuales", barra: 95 },
          { k: "Acceso al código fuente y pesos", v: "Cerrado / API comercial", barra: 20 },
          { k: "Agilidad de monetización", v: "Extrema", barra: 90 },
        ],
      },
      actorB: {
        nombre: "Modelo Abierto / Dirigido (China / UE / EAU)",
        metricas: [
          { k: "Capacidad de cómputo en clústeres", v: "Fragmentada / Chips nacionales", barra: 65 },
          { k: "Inversión privada de capital", v: "Moderada / Subsidio estatal", barra: 55 },
          { k: "Acceso al código fuente y pesos", v: "Abierto / Pesos públicos", barra: 90 },
          { k: "Agilidad de monetización", v: "Enfocada en soberanía y aplicaciones", barra: 70 },
        ],
      },
      veredictoAnalitico: "El modelo estadounidense lidera la frontera absoluta gracias a la concentración de capital y chips, pero los modelos abiertos y eficientes permiten a otras potencias reducir la brecha de aplicación práctica en manufactura, defensa y soberanía administrativa a una fracción del coste.",
    },
    conexionesVanguard: {
      labsModelos: [
        { id: "mezcla-energetica", titulo: "Mezcla Energética y Descarbonización", razon: "Simula cómo una demanda eléctrica adicional del 15% procedente de centros de datos obliga a replantear el cierre de térmicas o acelerar la energía nuclear." },
        { id: "red-cascada", titulo: "Red en Cascada y Fallos Sistémicos", razon: "Modela la vulnerabilidad de las redes eléctricas ante consumos basales extremos y picos de cómputo." },
      ],
      toolsAnalisis: [
        { id: "calculadora-dependencia", titulo: "Calculadora de Dependencia", razon: "Mide el grado de exposición de países europeos al software y chips de proveedores estadounidenses." },
        { id: "matriz-riesgo", titulo: "Matriz de Riesgo Geopolítico", razon: "Evalúa los riesgos de seguridad nacional derivados de la adopción de IA extranjera en infraestructuras críticas." },
      ],
      modulosRelacionados: [
        { href: "/mundos/US", label: "Dossier Estados Unidos", desc: "Datos de inversión en I+D, empresas tecnológicas y balance energético." },
        { href: "/centinela", label: "Mi Centinela", desc: "Sistema de alarmas y monitoreo de novedades en tiempo real." },
      ],
      temasHermanos: ["semiconductores-litografia", "ciberdefensa-infraestructura-critica", "minerales-criticos-energia"],
    },
    fuentesMetodologicas: [
      { institucion: "Stanford Institute for Human-Centered Artificial Intelligence (HAI)", publicacion: "Artificial Intelligence Index Report 2025", anio: 2025, tipo: "INSTITUTO_INVESTIGACION" },
      { institucion: "International Energy Agency (IEA)", publicacion: "Electricity 2024: Analysis and Forecast to 2026 (Data Centres Focus)", anio: 2024, tipo: "ORGANISMO_MULTILATERAL" },
      { institucion: "OECD", publicacion: "OECD Artificial Intelligence Policy Observatory (AIGO)", anio: 2025, tipo: "ORGANISMO_MULTILATERAL" },
    ],
  },
];
