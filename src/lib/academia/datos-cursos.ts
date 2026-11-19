// ═══════════════════════════════════════════════════════════════════
// VANGUARD ACADEMY · CATÁLOGO COMPLETO DE CURSOS (10 CATEGORÍAS)
//
// Cursos estructurados por capítulos, lecciones con contenido analítico,
// ejercicios prácticos de resolución paso a paso y cuestionarios con
// comprobación inmediata y retroalimentación explicada.
// ═══════════════════════════════════════════════════════════════════

import type { Curso, CategoriaEducativa } from "./tipos";

export const CATEGORIAS_ACADEMIA: {
  id: CategoriaEducativa;
  nombre: string;
  descripcion: string;
  icono: string;
  color: string;
}[] = [
  {
    id: "geografia",
    nombre: "Geografía",
    descripcion: "Cartografía del poder, estrechos estratégicos, orografía y dinámica espacial de los estados.",
    icono: "Globe2",
    color: "emerald",
  },
  {
    id: "historia",
    nombre: "Historia",
    descripcion: "Evolución de los órdenes mundiales, tratados de paz, guerras hegemónicas y descolonización.",
    icono: "Hourglass",
    color: "amber",
  },
  {
    id: "ciencias_naturales",
    nombre: "Ciencias Naturales",
    descripcion: "Física del clima, termodinámica de la criosfera, biogeoquímica y ecología de sistemas.",
    icono: "Atom",
    color: "cyan",
  },
  {
    id: "tecnologia",
    nombre: "Tecnología",
    descripcion: "Cadenas de fotolitografía avanzada, semiconductores, telecomunicaciones y computación.",
    icono: "Cpu",
    color: "violet",
  },
  {
    id: "economia",
    nombre: "Economía",
    descripcion: "Macroeconomía monetaria, deuda soberana, curvas de rendimiento y arquitectura financiera.",
    icono: "TrendingUp",
    color: "blue",
  },
  {
    id: "medioambiente",
    nombre: "Medioambiente",
    descripcion: "Cuencas hídricas, degradación edáfica, balance forestal y límites planetarios cuantificados.",
    icono: "Trees",
    color: "teal",
  },
  {
    id: "cultura",
    nombre: "Cultura",
    descripcion: "Antropología del patrimonio, diversidad etnolingüística, memoria histórica y cohesión comunitaria.",
    icono: "Landmark",
    color: "rose",
  },
  {
    id: "relaciones_internacionales",
    nombre: "Relaciones Internacionales",
    descripcion: "Teoría de juegos, disuasión nuclear, dilemas de seguridad y arquitectura de alianzas.",
    icono: "Shield",
    color: "indigo",
  },
  {
    id: "matematicas",
    nombre: "Matemáticas",
    descripcion: "Sistemas dinámicos no lineales, ecuaciones diferenciales, teoría de grafos y redes complejas.",
    icono: "Binary",
    color: "orange",
  },
  {
    id: "idiomas",
    nombre: "Idiomas",
    descripcion: "Lingüística comparada, semántica de tratados internacionales, terminología jurídica y diplomática.",
    icono: "Languages",
    color: "fuchsia",
  },
];

export const CURSOS_ACADEMIA: Curso[] = [
  // ── 1. GEOGRAFÍA ──────────────────────────────────────────────
  {
    id: "cur-geo-01",
    slug: "geografia-geopolitica-global",
    titulo: "Geografía y Geopolítica Global: Cartografía del Poder y Estrechos Estratégicos",
    subtitulo: "De los choke points marítimos a las fallas tectónicas del control territorial",
    categoria: "geografia",
    nivel: "intermedio",
    duracionHorasEstimadas: 6,
    totalLecciones: 3,
    perfilDocenteInstitucional: "Cátedra de Geografía Política y Cartografía Espacial Vanguard",
    institucionOReferencia: "Vanguard Geographic Research & IHO Hydrographic Standards",
    descripcionGeneral:
      "Este curso explora cómo la topografía física, los cuellos de botella marítimos y las delimitaciones de cuencas fluviales condicionan la seguridad nacional, el comercio de hidrocarburos y la proyección de poder militar.",
    competenciasAdquiridas: [
      "Identificar y analizar los 7 estrechos marítimos estratégicos del comercio global (choke points).",
      "Evaluar la vulnerabilidad de cadenas de suministro navales ante bloqueos costeros.",
      "Diferenciar fronteras fisiográficas de demarcaciones artificiales poscoloniales.",
    ],
    objetivosAprendizaje: [
      {
        id: "obj-geo-1",
        verboBloom: "comprender",
        descripcion: "Comprender la función geoeconómica del Estrecho de Malaca, Ormuz y Bab el-Mandeb.",
        habilidadClave: "Análisis de cuellos de botella marítimos",
      },
      {
        id: "obj-geo-2",
        verboBloom: "analizar",
        descripcion: "Analizar el impacto de la batimetría y las Zonas Económicas Exclusivas (ZEE) en litigios insulares.",
        habilidadClave: "Interpretación del Derecho del Mar (UNCLOS)",
      },
      {
        id: "obj-geo-3",
        verboBloom: "evaluar",
        descripcion: "Evaluar rutas árticas alternativas (Paso del Noroeste y Ruta del Mar del Norte) ante el retroceso del hielo.",
        habilidadClave: "Proyección de geopolítica polar",
      },
    ],
    capitulos: [
      {
        id: "cap-geo-1",
        numero: 1,
        titulo: "Cuellos de Botella y Arterias Marítimas",
        descripcion: "Los pasos estrechos por donde fluye más del 60% del crudo transportado por vía marítima.",
        lecciones: [
          {
            id: "lec-geo-1-1",
            slug: "estrechos-estrategicos-comercio",
            numero: 1,
            titulo: "Estrechos Estratégicos y Vulnerabilidad de Cadenas de Suministro",
            duracionEstimadaMinutos: 25,
            resumenEjecutivo:
              "El transporte marítimo depende de pasos angostos como Ormuz (21M bpd), Malaca (16M bpd), Bab el-Mandeb y los canales de Suez y Panamá. Un bloqueo en cualquiera de ellos genera disrupciones de flete inmediatas.",
            objetivosEspecificos: [
              "Calcular el tonelaje crítico que transita por el Estrecho de Ormuz frente a la producción mundial.",
              "Identificar rutas de desvío por el Cabo de Buena Esperanza y su coste en días de navegación.",
            ],
            conceptosClave: ["Choke point", "Estrecho de Ormuz", "Estrecho de Malaca", "Canal de Suez", "Bab el-Mandeb"],
            contenidoSecciones: [
              {
                subtitulo: "1. La Geometría de los Cuellos de Botella",
                parrafos: [
                  "El 80% del comercio de mercancías en volumen y más del 70% en valor se desplaza a través de los océanos. Sin embargo, la geografía terrestre canaliza estos flujos por pasos de apenas unas millas náuticas de anchura navegable.",
                  "En el Estrecho de Ormuz, la vía de navegación de entrada y la de salida tienen apenas dos millas náuticas de ancho cada una, separadas por una zona de separación de dos millas, todo dentro del alcance de baterías de misiles antibuque costeras y drones de superficie.",
                ],
                notaAlerta:
                  "El cierre hipotético de Ormuz no dispone de oleoductos de bypass con capacidad suficiente para compensar más del 25% del crudo retenido.",
                ejemploConcreto:
                  "En 2024, los ataques en Bab el-Mandeb obligaron al 60% de los portacontenedores de la ruta Asia-Europa a circunnavegar África por el Cabo de Buena Esperanza, añadiendo 10 a 14 días y duplicando las primas de riesgo marítimo.",
              },
              {
                subtitulo: "2. El Dilema de Malaca y la Seguridad Energética Asiática",
                parrafos: [
                  "El Estrecho de Malaca conecta el Océano Índico con el Mar de la China Meridional. Por él transita más del 75% del petróleo importado por China, Japón y Corea del Sur.",
                  "En su punto más angosto, el canal de Phillips en el estrecho de Singapur tiene solo 2.8 km de anchura, creando un embotellamiento natural que expone el suministro energético a cualquier interrupción naval.",
                ],
              },
            ],
            ejerciciosPractica: [
              {
                id: "ej-geo-1",
                titulo: "Cálculo de Desvío Logístico por el Cabo de Buena Esperanza",
                tipo: "calculo_diferencial",
                escenarioContexto:
                  "Un buque portacontenedores de 18.000 TEU viaja de Shanghái a Róterdam a una velocidad constante de 18 nudos náuticos (33.3 km/h). La ruta por Suez es de 10.500 millas náuticas; la ruta por el Cabo de Buena Esperanza es de 14.000 millas náuticas.",
                retoPrincipal:
                  "Determina el retraso en días de navegación y el incremento porcentual de combustible sabiendo que el buque consume 150 toneladas diarias de búnker IFO 380.",
                pasosGuiados: [
                  {
                    numero: 1,
                    instruccion: "Calcula los días de navegación en la ruta regular por Suez.",
                    datoOVariable: "Distancia: 10.500 mn / (18 nudos * 24 h/día) = 10.500 / 432",
                    preguntaComprobacion: "¿Cuántos días dura el trayecto por Suez?",
                    respuestaEsperada: "24.3 días",
                    explicacionPaso: "10.500 / 432 = 24.31 días de travesía.",
                  },
                  {
                    numero: 2,
                    instruccion: "Calcula los días de navegación rodeando el Cabo de Buena Esperanza.",
                    datoOVariable: "Distancia: 14.000 mn / 432 mn/día",
                    preguntaComprobacion: "¿Cuántos días dura el trayecto por África?",
                    respuestaEsperada: "32.4 días",
                    explicacionPaso: "14.000 / 432 = 32.41 días de travesía (+8.1 días de retraso neto).",
                  },
                  {
                    numero: 3,
                    instruccion: "Calcula el tonelaje de combustible adicional consumido.",
                    datoOVariable: "8.1 días adicionales * 150 t/día",
                    preguntaComprobacion: "¿Cuánto búnker extra consume la nave?",
                    respuestaEsperada: "1.215 toneladas",
                    explicacionPaso: "8.1 * 150 = 1.215 toneladas adicionales de combustible búnker.",
                  },
                ],
                criterioExito: "Comprender la inercia temporal y financiera de las decisiones geopolíticas sobre rutas marítimas.",
                explicacionPedagogica:
                  "Un incremento de 8 días por buque absorbe una fracción masiva de la flota mundial de contenedores en tránsito, elevando los fletes globales sin que cambie la demanda de bienes.",
                nexoLabRuta: "/labs/rutas",
                nexoLabNombre: "Simulador de Rutas Comerciales en Labs",
              },
            ],
            cuestionarioEvaluacion: [
              {
                id: "q-geo-1-1",
                tipo: "seleccion_multiple",
                enunciado: "¿Qué porcentaje aproximado del consumo mundial de petróleo por vía marítima cruza diariamente el Estrecho de Ormuz?",
                contextoPrevio: "Considera un consumo global de crudo de ~102 millones de barriles diarios en 2025-2026.",
                opciones: [
                  { id: "a", texto: "Aproximadamente el 5%", explicacion: "Incorrecto. 5% es una cifra insignificante que no califica a Ormuz como choke point crítico.", esCorrecta: false },
                  { id: "b", texto: "Entre el 20% y el 25% del crudo marítimo mundial (~20-21 millones de bpd)", explicacion: "¡Correcto! Es el cuello de botella energético más transitado del globo, canalizando el petróleo de Arabia Saudita, Irak, Kuwait, EAU e Irán.", esCorrecta: true },
                  { id: "c", texto: "Más del 60%", explicacion: "Incorrecto. 60% sobreestimaría la concentración en un solo estrecho; otros estrechos como Malaca absorben flujos secundarios.", esCorrecta: false },
                  { id: "d", texto: "Exactamente el 50%", explicacion: "Incorrecto.", esCorrecta: false },
                ],
                pistas: [
                  "El estrecho conecta el Golfo Pérsico con el Golfo de Omán.",
                  "El flujo diario oscila en torno a los 20-21 millones de barriles diarios.",
                ],
                explicacionDetallada:
                  "El Estrecho de Ormuz canaliza cerca de una quinta parte del petróleo líquido mundial. Su cierre genera un desbalance físico insustituible a corto plazo.",
                fuenteReferencia: "U.S. Energy Information Administration (EIA) World Oil Transit Chokepoints",
              },
              {
                id: "q-geo-1-2",
                tipo: "verdadero_falso",
                enunciado: "El Canal de Panamá permite el paso regular de buques superpetroleros VLCC (Very Large Crude Carriers) de 300.000 toneladas de peso muerto.",
                opciones: [
                  { id: "v", texto: "Verdadero", explicacion: "Incorrecto. Las esclusas Neo-Panamax tienen límites de calado (~15.2 m) y manga (49 m) muy inferiores a un VLCC.", esCorrecta: false },
                  { id: "f", texto: "Falso", explicacion: "¡Correcto! Los buques VLCC y ULCC superan con creces las dimensiones de las esclusas de Panamá y deben navegar por el Cabo de Hornos o el Estrecho de Magallanes.", esCorrecta: true },
                ],
                pistas: ["Revisa la clasificación Neopanamax frente a la clasificación Capesize/VLCC."],
                explicacionDetallada:
                  "Los petroleros VLCC requieren calados superiores a 20 metros, incompatibles con el lago Gatún y las esclusas de Panamá.",
              },
            ],
            recursosComplementarios: [
              {
                titulo: "Centro de Mapas Vanguard",
                ruta: "/mapas",
                tipo: "mapa",
                descripcion: "Capa de geografía física y estrechos marítimos sobre el globo terráqueo.",
              },
              {
                titulo: "Simulador de Redes y Rutas en Labs",
                ruta: "/labs/rutas",
                tipo: "simulador",
                descripcion: "Modela la resistencia de una red logística frente a la caída de nodos intermedios.",
              },
            ],
          },
          {
            id: "lec-geo-1-2",
            slug: "zonas-economicas-exclusivas-unclos",
            numero: 2,
            titulo: "Zonas Económicas Exclusivas y Soberanía Marítima bajo UNCLOS",
            duracionEstimadaMinutos: 20,
            resumenEjecutivo:
              "La Convención de las Naciones Unidas sobre el Derecho del Mar (1982) fija las 12 millas de mar territorial y las 200 millas de ZEE. Cómo los atolones e islas artificiales desatan disputas de soberanía.",
            objetivosEspecificos: [
              "Diferenciar aguas interiores, mar territorial, zona contigua y ZEE.",
              "Comprender el artículo 121 de UNCLOS sobre islas frente a rocas no aptas para la vida humana.",
            ],
            conceptosClave: ["UNCLOS", "Mar Territorial (12 mn)", "ZEE (200 mn)", "Plataforma Continental", "Línea de base"],
            contenidoSecciones: [
              {
                subtitulo: "1. La Estructura Jurídica del Espacio Marítimo",
                parrafos: [
                  "A partir de las líneas de base costeras, el derecho internacional reconoce cuatro franjas concéntricas: el mar territorial (hasta 12 mn) donde rige soberanía plena con derecho de paso inocente; la zona contigua (hasta 24 mn); y la Zona Económica Exclusiva (hasta 200 mn) donde el estado ribereño tiene derechos de explotación exclusiva sobre recursos de la columna de agua y lecho marino.",
                ],
              },
            ],
            ejerciciosPractica: [],
            cuestionarioEvaluacion: [
              {
                id: "q-geo-1-3",
                tipo: "seleccion_multiple",
                enunciado: "Bajo el Artículo 121(3) de UNCLOS, ¿qué condición excluye a una roca de generar una Zona Económica Exclusiva de 200 millas náuticas?",
                opciones: [
                  { id: "a", texto: "No poseer un faro de navegación civil operativo", explicacion: "Incorrecto.", esCorrecta: false },
                  { id: "b", texto: "Que las rocas no puedan sostener la habitación humana ni vida económica propia", explicacion: "¡Correcto! Solo generan mar territorial de 12 mn, sin derecho a ZEE de 200 mn.", esCorrecta: true },
                  { id: "c", texto: "Estar sumergida durante la marea baja", explicacion: "Eso define un bajo fondo marino que no genera ni mar territorial.", esCorrecta: false },
                ],
                pistas: ["Revisa el fallo del Tribunal Permanente de Arbitraje de 2016 sobre el Mar de la China Meridional."],
                explicacionDetallada: "Las elevaciones que no sustentan comunidades humanas autónomas no dan derecho a ZEE ni plataforma continental.",
              },
            ],
            recursosComplementarios: [],
          },
          {
            id: "lec-geo-1-3",
            slug: "rutas-polares-artico-cambio-climatico",
            numero: 3,
            titulo: "El Deshielo Ártico y la Reconfiguración del Transporte Marítimo",
            duracionEstimadaMinutos: 25,
            resumenEjecutivo:
              "La Ruta del Mar del Norte (NSR) y el Paso del Noroeste reducen la distancia entre Europa y Asia oriental hasta en un 40%. Desafíos de navegación en hielo, calados y soberanía.",
            objetivosEspecificos: [
              "Comparar la distancia de navegación Tokio-Róterdam vía Suez vs. Ruta del Mar del Norte.",
              "Evaluar las limitaciones técnicas: rompehielos nucleares, ventanas estivales y seguros marítimos.",
            ],
            conceptosClave: ["Ruta del Mar del Norte (NSR)", "Paso del Noroeste", "Estrecho de Bering", "Hielo marino estival"],
            contenidoSecciones: [
              {
                subtitulo: "1. La Geografía Acelerada por el Calentamiento Boreal",
                parrafos: [
                  "Con el retroceso del hielo marino ártico (medido por sensores NSIDC a un ritmo de -12.2% por década en septiembre), la Ruta del Mar del Norte a lo largo de las costas árticas de Rusia reduce el trayecto entre Yokohama y Róterdam de 11.200 mn (por Suez) a unas 6.500 mn.",
                  "Sin embargo, la ruta requiere escolta de rompehielos nucleares, sufre falta de infraestructura de búsqueda y rescate (SAR) y los calados en el estrecho de Sannikov limitan los buques de gran porte.",
                ],
              },
            ],
            ejerciciosPractica: [],
            cuestionarioEvaluacion: [
              {
                id: "q-geo-1-4",
                tipo: "verdadero_falso",
                enunciado: "La Ruta del Mar del Norte permite la navegación libre de buques portacontenedores comerciales sin asistencia de rompehielos los 365 días del año.",
                opciones: [
                  { id: "v", texto: "Verdadero", explicacion: "Incorrecto. En invierno el hielo ártico se consolida superando los 1.5 a 2 metros de espesor.", esCorrecta: false },
                  { id: "f", texto: "Falso", explicacion: "¡Correcto! Solo buques con clase de hielo reforzada (Arc7) y en ventanas estivales-otoñales pueden navegar con regularidad.", esCorrecta: true },
                ],
                pistas: ["El Ártico experimenta noche polar y temperaturas inferiores a -35 °C en invierno."],
                explicacionDetallada: "La NSR aún es estacional para el transporte comercial regular sin buques especializados de casco rompehielos polar.",
              },
            ],
            recursosComplementarios: [
              {
                titulo: "Comparador Climático de Criosfera Vanguard",
                ruta: "/planeta/clima-historico",
                tipo: "grafico",
                descripcion: "Serie temporal de extensión de hielo marino ártico 1979-2026 de NSIDC.",
              },
            ],
          },
        ],
      },
    ],
    evaluacionFinalCurso: [
      {
        id: "ev-geo-1",
        tipo: "seleccion_multiple",
        enunciado: "¿Qué estrecho separa la Península Arábiga del Cuerno de África, conectando el Mar Rojo con el Golfo de Adén?",
        opciones: [
          { id: "a", texto: "Estrecho de Malaca", explicacion: "Malaca está en el Sudeste Asiático.", esCorrecta: false },
          { id: "b", texto: "Bab el-Mandeb (La Puerta de las Lamentaciones)", explicacion: "¡Correcto! Es el acceso sur al Canal de Suez.", esCorrecta: true },
          { id: "c", texto: "Estrecho del Bósforo", explicacion: "El Bósforo conecta el Mar de Mármara con el Mar Negro en Turquía.", esCorrecta: false },
          { id: "d", texto: "Estrecho de Magallanes", explicacion: "Magallanes está en el extremo sur de Sudamérica.", esCorrecta: false },
        ],
        pistas: ["Yemen y Yibuti custodian sus costas."],
        explicacionDetallada: "Bab el-Mandeb es el cuello de botella que comunica el Océano Índico con el Canal de Suez a través del Mar Rojo.",
      },
    ],
    nexosVanguardRelacionados: [
      {
        nombre: "Módulo de Mapas 3D",
        ruta: "/mapas",
        tipo: "mapa",
        motivoPedagogico: "Visualizar el relieve continental y las capas de batimetría marina en 3D.",
      },
      {
        nombre: "Observatorio de Océanos",
        ruta: "/planeta/oceanos",
        tipo: "planeta",
        motivoPedagogico: "Analizar corrientes termohalinas y temperatura superficial marina en los estrechos.",
      },
    ],
    insigniaReconocimiento: "Especialista en Geografía y Rutas Estratégicas",
  },

  // ── 2. HISTORIA ───────────────────────────────────────────────
  {
    id: "cur-his-01",
    slug: "historia-grandes-conflictos",
    titulo: "Historia Contemporánea de los Grandes Conflictos: De Westfalia al Orden Bipolar",
    subtitulo: "Tratados de paz, equilibrios hegemónicos y desintegración imperial",
    categoria: "historia",
    nivel: "intermedio",
    duracionHorasEstimadas: 5,
    totalLecciones: 2,
    perfilDocenteInstitucional: "Instituto de Historia Diplomática y Conflictos Armados Vanguard",
    institucionOReferencia: "Vanguard Historical Archives & Diplomatic Treaty Registry",
    descripcionGeneral:
      "Una inmersión rigurosa en los momentos de ruptura del sistema internacional: la Paz de Westfalia (1648), el Concierto Europeo de 1815, el colapso de 1914 y la Guerra Fría.",
    competenciasAdquiridas: [
      "Comprender el principio de soberanía territorial e inmunidad estatal desde 1648.",
      "Analizar las cláusulas de seguridad colectiva y sus fallos en la Sociedad de Naciones.",
      "Identificar las fases de distensión y escalada de la Guerra Fría.",
    ],
    objetivosAprendizaje: [
      {
        id: "obj-his-1",
        verboBloom: "comprender",
        descripcion: "Comprender la génesis del estado westfaliano y el principio cuius regio, eius religio.",
        habilidadClave: "Análisis de sistemas de soberanía",
      },
      {
        id: "obj-his-2",
        verboBloom: "analizar",
        descripcion: "Analizar el colapso del equilibrio de poder en Europa entre 1871 y 1914.",
        habilidadClave: "Dinámica de sistemas de alianzas secretas",
      },
    ],
    capitulos: [
      {
        id: "cap-his-1",
        numero: 1,
        titulo: "La Soberanía Westfaliana y el Concierto de Naciones",
        descripcion: "De la Guerra de los Treinta Años a la Pax Britannica.",
        lecciones: [
          {
            id: "lec-his-1-1",
            slug: "paz-de-westfalia-origen-estado",
            numero: 1,
            titulo: "La Paz de Westfalia (1648) y el Nacimiento del Estado Soberano",
            duracionEstimadaMinutos: 25,
            resumenEjecutivo:
              "Los tratados de Münster y Osnabrück pusieron fin a la Guerra de los Treinta Años y consagraron la no injerencia en asuntos internos y la igualdad jurídica entre estados soberanos.",
            objetivosEspecificos: [
              "Explicar el impacto de la Paz de Westfalia en la secularización de las relaciones interestatales.",
              "Identificar los elementos constitutivos de la soberanía territorial moderna.",
            ],
            conceptosClave: ["Tratado de Münster", "Soberanía estatal", "No injerencia", "Cuius regio eius religio"],
            contenidoSecciones: [
              {
                subtitulo: "1. La Ruptura con la Autoridad Supranacional Medieval",
                parrafos: [
                  "Antes de 1648, Europa se concebía bajo la premisa de una autoridad universal compartida entre el Sacro Imperio Romano Germánico y el Papado. La Guerra de los Treinta Años (1618-1648) devastó los estados alemanes, causando la muerte de entre el 20% y el 40% de la población.",
                  "Westfalia reemplazó la jerarquía feudal por un orden de soberanía fragmentada: cada príncipe territorial determinaba su política religiosa, firmaba tratados y recaudaba impuestos sin sujeción a la Dieta Imperial.",
                ],
              },
            ],
            ejerciciosPractica: [],
            cuestionarioEvaluacion: [
              {
                id: "q-his-1-1",
                tipo: "seleccion_multiple",
                enunciado: "¿Cuál fue el principio nuclear establecido por la Paz de Westfalia para las relaciones internacionales modernas?",
                opciones: [
                  { id: "a", texto: "La creación de un parlamento supranacional con derecho a veto", explicacion: "Incorrecto.", esCorrecta: false },
                  { id: "b", texto: "La soberanía del estado sobre su territorio y la prohibición de injerencia externa en sus asuntos internos", explicacion: "¡Correcto! Es el cimiento del derecho internacional público.", esCorrecta: true },
                  { id: "c", texto: "La cesión del control fronterizo a la autoridad del Papado", explicacion: "Incorrecto; Westfalia limitó el poder temporal eclesiástico.", esCorrecta: false },
                ],
                pistas: ["Piensa en el concepto de soberanía nacional."],
                explicacionDetallada: "Westfalia estableció que ningún poder externo tiene jurisdicción sobre el territorio de un estado soberano reconocido.",
              },
            ],
            recursosComplementarios: [
              {
                titulo: "Archivo Histórico de Vanguard",
                ruta: "/historia",
                tipo: "dossier",
                descripcion: "Cronología de tratados y transformaciones de fronteras europeas.",
              },
            ],
          },
          {
            id: "lec-his-1-2",
            slug: "concierto-europeo-equilibrio-poder",
            numero: 2,
            titulo: "El Congreso de Viena (1815) y el Sistema de Equilibrio de Poder",
            duracionEstimadaMinutos: 25,
            resumenEjecutivo:
              "Metternich, Castlereagh y Talleyrand diseñaron una arquitectura de contrapeso para contener a Francia y preservar la estabilidad mediante conferencias diplomáticas periódicas.",
            objetivosEspecificos: [
              "Analizar la doctrina del 'Balance of Power' aplicada por Gran Bretaña.",
              "Explicar por qué el Concierto de Viena evitó una guerra generalizada en Europa durante casi un siglo.",
            ],
            conceptosClave: ["Congreso de Viena", "Equilibrio de Poder", "Metternich", "Santa Alianza"],
            contenidoSecciones: [
              {
                subtitulo: "1. La Geometría de la Contención",
                parrafos: [
                  "Tras la derrota de Napoleón, las potencias vencedoras no buscaron aniquilar a Francia, sino rodearla de estados tapón (Países Bajos unidos a Bélgica, Reino de Piamonte-Cerdeña reforzado) e integrar al derrotado en el concierto.",
                ],
              },
            ],
            ejerciciosPractica: [],
            cuestionarioEvaluacion: [
              {
                id: "q-his-1-2",
                tipo: "verdadero_falso",
                enunciado: "El Congreso de Viena impuso la desintegración territorial absoluta de Francia y su reparto colonial entre los vencedores.",
                opciones: [
                  { id: "v", texto: "Verdadero", explicacion: "Falso; Francia conservó sus fronteras de 1792.", esCorrecta: false },
                  { id: "f", texto: "Falso", explicacion: "¡Correcto! Los diplomáticos comprendieron que humillar a Francia crearía revanchismo y destruiría el equilibrio europeo.", esCorrecta: true },
                ],
                pistas: ["Revisa el papel de Talleyrand en las negociaciones."],
                explicacionDetallada: "Viena buscó un equilibrio dinámico restaurando a los Borbones y conservando una Francia fuerte pero contenida.",
              },
            ],
            recursosComplementarios: [],
          },
        ],
      },
    ],
    evaluacionFinalCurso: [],
    nexosVanguardRelacionados: [
      {
        nombre: "Línea de Tiempo Histórica Vanguard",
        ruta: "/historia",
        tipo: "investigacion",
        motivoPedagogico: "Examinar la cronología sincronizada de batallas y firmas diplomáticas.",
      },
    ],
    insigniaReconocimiento: "Especialista en Historia Diplomática y Tratados de Paz",
  },

  // ── 3. CIENCIAS NATURALES ─────────────────────────────────────
  {
    id: "cur-cie-01",
    slug: "ciencias-termodinamica-criosfera",
    titulo: "Termodinámica Planetaria y Física de la Criosfera",
    subtitulo: "Balance de radiación solar, retroalimentación del albedo y dinámica del hielo",
    categoria: "ciencias_naturales",
    nivel: "avanzado",
    duracionHorasEstimadas: 6,
    totalLecciones: 2,
    perfilDocenteInstitucional: "Laboratorio de Geofísica Planetaria y Criosfera Vanguard",
    institucionOReferencia: "NASA Earth Cryosphere & World Glacier Monitoring Service",
    descripcionGeneral:
      "Una exploración matemática y física del intercambio energético entre la atmósfera, los océanos y los mantos de hielo de Groenlandia y la Antártida. Ecuaciones de Stefan-Boltzmann, flujo glaciar y desestabilización marina.",
    competenciasAdquiridas: [
      "Calcular la temperatura radiativa de equilibrio de un planeta sin atmósfera.",
      "Modelar la retroalimentación positiva albedo-temperatura.",
      "Comprender la inestabilidad de la capa de hielo marina (Marine Ice Sheet Instability - MISI).",
    ],
    objetivosAprendizaje: [
      {
        id: "obj-cie-1",
        verboBloom: "aplicar",
        descripcion: "Aplicar la ley de Stefan-Boltzmann para deducir el forzamiento radiativo de los gases de efecto invernadero.",
        habilidadClave: "Cálculo de forzamiento radiativo (W/m²)",
      },
      {
        id: "obj-cie-2",
        verboBloom: "analizar",
        descripcion: "Analizar la mecánica de avance de la línea de apoyo (grounding line) en glaciares de lecho retrógrado.",
        habilidadClave: "Dinámica glaciológica de Thwaites y Pine Island",
      },
    ],
    capitulos: [
      {
        id: "cap-cie-1",
        numero: 1,
        titulo: "El Balance Radiativo Global",
        descripcion: "Flujos de energía solar incidente, albedo y emisión infrarroja terrestre.",
        lecciones: [
          {
            id: "lec-cie-1-1",
            slug: "balance-radiativo-stefan-boltzmann",
            numero: 1,
            titulo: "La Ecuación del Balance Energético Planetario",
            duracionEstimadaMinutos: 30,
            resumenEjecutivo:
              "La Tierra recibe una constante solar S0 = 1361 W/m². Con un albedo global α = 0.30, la temperatura de cuerpo negro sería -18 °C. El efecto invernadero natural de +33 °C eleva la media a +15 °C.",
            objetivosEspecificos: [
              "Deducir matemáticamente la emisión térmica usando la ley de Stefan-Boltzmann (E = σ T⁴).",
              "Calcular el desequilibrio energético de la Tierra actual (~+0.8 a +1.0 W/m²).",
            ],
            conceptosClave: ["Constante Solar", "Ley de Stefan-Boltzmann", "Albedo", "Forzamiento radiativo (ΔF)"],
            contenidoSecciones: [
              {
                subtitulo: "1. La Formulación Matemática del Equilibrio",
                parrafos: [
                  "La radiación solar total interceptada por el disco terrestre es S₀ × π R². Al repartirse sobre la superficie esférica completa (4 π R²), la irradiancia media incidente en el tope de la atmósfera es S₀ / 4 ≈ 340 W/m².",
                  "Aproximadamente el 30% es reflejado de inmediato al espacio por nubes, aerosoles y nieve (albedo α = 0.30), dejando 240 W/m² absorbidos por el sistema climático.",
                ],
              },
            ],
            ejerciciosPractica: [],
            cuestionarioEvaluacion: [
              {
                id: "q-cie-1-1",
                tipo: "calculo_practico",
                enunciado: "Si la constante de Stefan-Boltzmann es σ = 5.67 × 10⁻⁸ W/(m²·K⁴), ¿cuál sería la temperatura efectiva Te de la Tierra si absorbiera 240 W/m² en equilibrio radiativo?",
                opciones: [
                  { id: "a", texto: "255 K (-18 °C)", explicacion: "¡Correcto! Te = (240 / 5.67×10⁻⁸)^(1/4) = (4.233×10⁹)^(0.25) ≈ 255 Kelvin.", esCorrecta: true },
                  { id: "b", texto: "288 K (+15 °C)", explicacion: "Esa es la temperatura real superficial actual gracias a los gases de efecto invernadero, no la temperatura de emisión en el vacío.", esCorrecta: false },
                  { id: "c", texto: "273 K (0 °C)", explicacion: "Incorrecto.", esCorrecta: false },
                ],
                pistas: ["Despeja Te de la ecuación: 240 = σ * Te⁴."],
                explicacionDetallada: "Te = 255 K (-18 °C). La atmósfera retiene energía devolviendo radiación infrarroja hacia la superficie y elevándola a 288 K (+15 °C).",
              },
            ],
            recursosComplementarios: [
              {
                titulo: "Modelo Climático de Dos Cajas en Labs",
                ruta: "/labs/clima",
                tipo: "simulador",
                descripcion: "Simulación interactiva de balance energético oceánico y forzamiento radiativo.",
              },
            ],
          },
          {
            id: "lec-cie-1-2",
            slug: "inestabilidad-capa-hielo-marina",
            numero: 2,
            titulo: "Mecánica Glaciar y la Inestabilidad Marina de la Antártida",
            duracionEstimadaMinutos: 30,
            resumenEjecutivo:
              "Cuando el lecho de roca bajo un glaciar marino desciende hacia el interior del continente (lecho retrógrado), el retroceso de la línea de apoyo provoca un engrosamiento de la sección de salida y una aceleración exponencial del flujo de hielo.",
            objetivosEspecificos: [
              "Explicar por qué la topografía submarina retrógrada genera inestabilidad intrínseca.",
              "Identificar el papel de las corrientes de agua circumpolar profunda cálida (CDW).",
            ],
            conceptosClave: ["Línea de apoyo (grounding line)", "MISI", "Glaciar Thwaites", "Agua Circumpolar Profunda"],
            contenidoSecciones: [
              {
                subtitulo: "1. La Física del Colapso de Thwaites",
                parrafos: [
                  "En los glaciares de la Antártida Occidental, el lecho rocoso se encuentra cientos de metros por debajo del nivel del mar y se profundiza tierra adentro. La masa de hielo flota parcialmente formando plataformas de soporte.",
                  "Cuando el agua cálida oceánica funde la base de la plataforma, la línea de apoyo retrocede hacia zonas más profundas. En un lecho más profundo, el espesor de hielo en la línea de flotación aumenta, y según la ley de potencia del flujo de hielo de Glen, la descarga de hielo al océano se incrementa drásticamente.",
                ],
              },
            ],
            ejerciciosPractica: [],
            cuestionarioEvaluacion: [
              {
                id: "q-cie-1-2",
                tipo: "verdadero_falso",
                enunciado: "Una pendiente del lecho rocoso que desciende hacia el interior del continente favorece la estabilización natural del frente glaciar.",
                opciones: [
                  { id: "v", texto: "Verdadero", explicacion: "Falso; una pendiente descendente acelera el flujo al aumentar el grosor del hielo en flotación.", esCorrecta: false },
                  { id: "f", texto: "Falso", explicacion: "¡Correcto! Esta geometría retrógrada es la causa física de la 'Inestabilidad de la Capa de Hielo Marina' (MISI).", esCorrecta: true },
                ],
                pistas: ["Piensa en la ley de Glen del flujo glaciar."],
                explicacionDetallada: "A mayor profundidad del lecho, mayor es el espesor de hielo y mayor la tasa de descarga irreversible hacia el océano.",
              },
            ],
            recursosComplementarios: [
              {
                titulo: "Atlas Ambiental: Glaciar Thwaites",
                ruta: "/planeta/atlas",
                tipo: "mapa",
                descripcion: "Punto de inflexión de la Antártida Occidental y pérdida de masa GRACE-FO.",
              },
            ],
          },
        ],
      },
    ],
    evaluacionFinalCurso: [],
    nexosVanguardRelacionados: [
      {
        nombre: "Observatorio de Criosfera y Clima Vanguard",
        ruta: "/planeta/clima-historico",
        tipo: "planeta",
        motivoPedagogico: "Series temporales de anomalía de hielo de NSIDC y masa de Groenlandia.",
      },
      {
        nombre: "Modelo Numérico de Clima en Labs",
        ruta: "/labs/clima",
        tipo: "lab",
        motivoPedagogico: "Simular forzamiento radiativo y retardo térmico oceánico.",
      },
    ],
    insigniaReconocimiento: "Investigador en Termodinámica de la Criosfera",
  },

  // ── 4. TECNOLOGÍA ─────────────────────────────────────────────
  {
    id: "cur-tec-01",
    slug: "tecnologia-semiconductores-ia",
    titulo: "Soberanía Tecnológica y Semiconductores: Fotolitografía EUV y Nodos Avanzados",
    subtitulo: "De la óptica de espejos de Bragg a las tensiones geopolíticas en el Estrecho de Taiwán",
    categoria: "tecnologia",
    nivel: "avanzado",
    duracionHorasEstimadas: 5,
    totalLecciones: 2,
    perfilDocenteInstitucional: "Unidad de Análisis de Semiconductores y Hardware Estratégico",
    institucionOReferencia: "Vanguard Semiconductor Intelligence & SEMI Standards",
    descripcionGeneral:
      "Desglose técnico de la cadena de valor de los circuitos integrados: máquinas de luz ultravioleta extrema (EUV de 13.5 nm), diseño de transistores GAA (Gate-All-Around) y la concentración monopólica de empaquetado avanzado CoWoS.",
    competenciasAdquiridas: [
      "Comprender la ecuación de resolución de Rayleigh en litografía óptica.",
      "Identificar el monopolio de fuentes de luz láser Cymer y óptica Zeiss en sistemas ASML.",
      "Evaluar los impactos de controles de exportación en equipos DUV y EDA.",
    ],
    objetivosAprendizaje: [
      {
        id: "obj-tec-1",
        verboBloom: "comprender",
        descripcion: "Comprender la transición de transistores FinFET a nanosheets GAAFET para nodos sub-3nm.",
        habilidadClave: "Arquitectura de transistores de silicio",
      },
      {
        id: "obj-tec-2",
        verboBloom: "analizar",
        descripcion: "Analizar el cuello de botella del empaquetado avanzado TSMC CoWoS en aceleradores de IA.",
        habilidadClave: "Integración 2.5D/3D y memoria HBM",
      },
    ],
    capitulos: [
      {
        id: "cap-tec-1",
        numero: 1,
        titulo: "La Máquina más Compleja del Mundo: Fotolitografía EUV",
        descripcion: "Generación de plasma de estaño y longitud de onda de 13.5 nm.",
        lecciones: [
          {
            id: "lec-tec-1-1",
            slug: "fotolitografia-euv-asml-rayleigh",
            numero: 1,
            titulo: "Luz Ultravioleta Extrema y el Criterio de Rayleigh",
            duracionEstimadaMinutos: 30,
            resumenEjecutivo:
              "La resolución litográfica CD = k₁ × (λ / NA). Para grabar patrones de 2 nm, ASML sustituyó la luz DUV de 193 nm por luz EUV de 13.5 nm generada disparando pulsos láser CO2 a 50.000 gotas de estaño fundido por segundo.",
            objetivosEspecificos: [
              "Calcular la resolución mínima con la fórmula de Rayleigh.",
              "Explicar por qué las lentes refractivas son sustituidas por espejos multicapa de molibdeno y silicio.",
            ],
            conceptosClave: ["Criterio de Rayleigh", "EUV (13.5 nm)", "ASML Twinscan EXE", "Apertura Numérica (High-NA 0.55)"],
            contenidoSecciones: [
              {
                subtitulo: "1. La Física de la Longitud de Onda",
                parrafos: [
                  "El límite de difracción impone que el detalle más pequeño imprimible sobre una oblea de silicio depende de la longitud de onda de la fuente de luz. La fotolitografía de inmersión en agua llegó a su límite físico con 193 nm.",
                  "La radiación EUV (13.5 nm) se absorbe en prácticamente todos los medios, incluido el aire atmosférico y el vidrio de cuarzo óptico. Por ello, toda la máquina de litografía opera bajo ultra-alto vacío y la luz se dirige exclusivamente mediante espejos parabólicos de Bragg recubiertos con decenas de capas alternadas de molibdeno y silicio de espesor nanométrico.",
                ],
              },
            ],
            ejerciciosPractica: [],
            cuestionarioEvaluacion: [
              {
                id: "q-tec-1-1",
                tipo: "seleccion_multiple",
                enunciado: "¿Por qué las máquinas de fotolitografía EUV operan enteramente en cámaras de ultra-alto vacío?",
                opciones: [
                  { id: "a", texto: "Para evitar que el silicio se oxide a altas temperaturas", explicacion: "La oblea no se calienta en este paso.", esCorrecta: false },
                  { id: "b", texto: "Porque el aire y los gases atmosféricos absorben completamente los fotones de 13.5 nm de longitud de onda", explicacion: "¡Correcto! En aire libre la luz EUV se extingue en pocos centímetros.", esCorrecta: true },
                  { id: "c", texto: "Para reducir la fricción de los motores lineales magnéticos", explicacion: "Incorrecto.", esCorrecta: false },
                ],
                pistas: ["La radiación ultravioleta extrema interactúa fuertemente con las moléculas de oxígeno y nitrógeno."],
                explicacionDetallada: "Los fotones de 13.5 nm son absorbidos por cualquier gas atmosférico; sin vacío no hay haz de luz que llegue a la máscara ni a la oblea.",
              },
            ],
            recursosComplementarios: [
              {
                titulo: "Dossier Estratégico de Semiconductores Vanguard",
                ruta: "/investigacion/semiconductores",
                tipo: "dossier",
                descripcion: "Cadena de valor global: ASML, TSMC, NVIDIA, Zeiss y EDA.",
              },
            ],
          },
          {
            id: "lec-tec-1-2",
            slug: "transistores-gaafet-memoria-hbm",
            numero: 2,
            titulo: "Transistores Nanosheet GAA y Memoria de Alto Ancho de Banda (HBM)",
            duracionEstimadaMinutos: 25,
            resumenEjecutivo:
              "Cómo la arquitectura de compuerta envolvente (Gate-All-Around) mitiga la corriente de fuga por efecto túnel mecánico-cuántico y cómo el apilamiento 3D de DRAM vía TSV alimenta a las GPUs modernas.",
            objetivosEspecificos: [
              "Comparar la superficie de control electrostático de FinFET vs. GAAFET.",
              "Comprender la función del empaquetado interposer de silicio en la memoria HBM3e/HBM4.",
            ],
            conceptosClave: ["GAAFET", "Efecto túnel cuántico", "HBM3e", "TSV (Through-Silicon Via)", "CoWoS"],
            contenidoSecciones: [
              {
                subtitulo: "1. Venciendo la Fuga Cuántica",
                parrafos: [
                  "Por debajo de los 5 nanómetros, la separación entre fuente y drenador es tan reducida que los electrones atraviesan la barrera de potencial por efecto túnel, disipando energía en forma de calor parásito incluso con el transistor en estado apagado.",
                  "La tecnología Nanosheet envuelve completamente el canal de conducción en las cuatro direcciones con material dieléctrico de alta permitividad (high-k metal gate), recuperando el control electrostático total del canal.",
                ],
              },
            ],
            ejerciciosPractica: [],
            cuestionarioEvaluacion: [],
            recursosComplementarios: [],
          },
        ],
      },
    ],
    evaluacionFinalCurso: [],
    nexosVanguardRelacionados: [
      {
        nombre: "Investigación Sistémica: Guerra del Silicio",
        ruta: "/investigacion/semiconductores",
        tipo: "investigacion",
        motivoPedagogico: "Analizar el mapa de choke points de la cadena global de microchips.",
      },
    ],
    insigniaReconocimiento: "Especialista en Semiconductores y Hardware Estratégico",
  },

  // ── 5. ECONOMÍA ───────────────────────────────────────────────
  {
    id: "cur-eco-01",
    slug: "economia-deuda-bancos-centrales",
    titulo: "Macroeconomía de la Deuda Soberana y Arquitectura de Bancos Centrales",
    subtitulo: "De la emisión de moneda a la curva de rendimientos, swaps cambiarios e inflación",
    categoria: "economia",
    nivel: "intermedio",
    duracionHorasEstimadas: 5,
    totalLecciones: 2,
    perfilDocenteInstitucional: "Departamento de Macroeconomía y Deuda Soberana Vanguard",
    institucionOReferencia: "Bank for International Settlements (BIS) & IMF Public Debt Database",
    descripcionGeneral:
      "Una explicación rigurosa de los mecanismos que sostienen el dinero fiduciario contemporáneo: operaciones de mercado abierto, el balance del banco central, el spread de crédito soberano y la trampa de la deuda pública.",
    competenciasAdquiridas: [
      "Interpretar la inversión de la curva de tipos de interés soberana.",
      "Calcular la ecuación de sostenibilidad de la deuda pública (d = (r - g) / (1 + g) * b + p).",
      "Analizar las líneas de swap de liquidez en dólares de la Reserva Federal.",
    ],
    objetivosAprendizaje: [
      {
        id: "obj-eco-1",
        verboBloom: "aplicar",
        descripcion: "Aplicar la condición de sostenibilidad de la deuda pública (r < g).",
        habilidadClave: "Cálculo de superávit primario de equilibrio",
      },
    ],
    capitulos: [
      {
        id: "cap-eco-1",
        numero: 1,
        titulo: "Dinámica de la Deuda Soberana y Mercados de Bonos",
        descripcion: "Rendimientos de los bonos del tesoro, primas de riesgo y sostenibilidad fiscal.",
        lecciones: [
          {
            id: "lec-eco-1-1",
            slug: "sostenibilidad-deuda-publica-ecuacion",
            numero: 1,
            titulo: "La Ecuación de Sostenibilidad de la Deuda: La Carrera entre r y g",
            duracionEstimadaMinutos: 30,
            resumenEjecutivo:
              "La variación de la ratio deuda/PIB depende del diferencial entre el tipo de interés real de la deuda (r) y el crecimiento económico real (g), sumado al déficit primario fiscal.",
            objetivosEspecificos: [
              "Calcular el saldo primario necesario para estabilizar la deuda cuando r > g.",
              "Explicar el efecto bola de nieve en economías emergentes endeudadas en moneda extranjera.",
            ],
            conceptosClave: ["Ratio Deuda/PIB", "Tipo de interés real (r)", "Crecimiento real (g)", "Saldo primario", "Efecto bola de nieve"],
            contenidoSecciones: [
              {
                subtitulo: "1. La Fórmula Fundamental de las Finanzas Públicas",
                parrafos: [
                  "La variación en la ratio deuda pública sobre PIB (Δb) se define como: Δb = (r - g) × b + d_primario. Si la tasa de crecimiento económico g supera el tipo de interés r, el país puede mantener un déficit primario moderado sin que la deuda sobre PIB crezca.",
                  "Sin embargo, cuando r > g, la deuda crece por inercia matemática a menos que el gobierno genere un superávit primario suficiente para contrarrestar el servicio de intereses.",
                ],
              },
            ],
            ejerciciosPractica: [],
            cuestionarioEvaluacion: [
              {
                id: "q-eco-1-1",
                tipo: "seleccion_multiple",
                enunciado: "Si un país tiene una deuda del 100% del PIB, un tipo de interés real r = 4% y un crecimiento real g = 1%, ¿qué saldo primario necesita para mantener estable su ratio de deuda?",
                opciones: [
                  { id: "a", texto: "Un déficit primario del 3% del PIB", explicacion: "Incorrecto; eso aumentaría la deuda al 106% en un año.", esCorrecta: false },
                  { id: "b", texto: "Un superávit primario del 3% del PIB", explicacion: "¡Correcto! Δb = (0.04 - 0.01)*100 - Superávit = 3 - 3 = 0.", esCorrecta: true },
                  { id: "c", texto: "Equilibrio fiscal primario (0%)", explicacion: "Con primario 0%, la deuda crecería un 3% anual por el diferencial r - g.", esCorrecta: false },
                ],
                pistas: ["Aplica la fórmula Δb = (r - g)*b - superávit_primario = 0."],
                explicacionDetallada: "Para compensar el diferencial desfavorable de 3 puntos porcentuales (4% - 1%) sobre una base de 100% de deuda, el estado debe recaudar un superávit primario del 3% del PIB.",
              },
            ],
            recursosComplementarios: [
              {
                titulo: "Dossier de Deuda Soberana Vanguard",
                ruta: "/investigacion/deuda-soberana",
                tipo: "dossier",
                descripcion: "Indicadores de deuda/PIB del Banco Mundial y curvas soberanas.",
              },
            ],
          },
          {
            id: "lec-eco-1-2",
            slug: "curva-de-tipos-inversion-recesion",
            numero: 2,
            titulo: "La Curva de Tipos de Interés y la Señal de Inversión",
            duracionEstimadaMinutos: 20,
            resumenEjecutivo:
              "En condiciones normales, los bonos a largo plazo pagan un interés más alto que los bonos a corto plazo. Cuando la curva se invierte (el bono a 2 años rinde más que el bono a 10 años), los mercados anticipan recesión y recortes monetarios futuros.",
            objetivosEspecificos: [
              "Explicar el concepto de prima por plazo (term premium).",
              "Interpretar el diferencial US 10Y - 2Y como indicador adelantado macroeconómico.",
            ],
            conceptosClave: ["Curva de rendimientos", "Inversión de la curva", "Yield spread 10Y-2Y", "Term premium"],
            contenidoSecciones: [
              {
                subtitulo: "1. La Estructura Temporal de los Tipos de Interés",
                parrafos: [
                  "Los inversores exigen un rendimiento mayor para inmovilizar su capital a 10 o 30 años debido a la incertidumbre sobre la inflación futura. Cuando los bancos centrales suben los tipos oficiales para frenar la inflación, los tramos cortos se elevan; si los mercados prevén que esa política causará una contracción económica, los tipos a largo caen, invirtiendo la pendiente.",
                ],
              },
            ],
            ejerciciosPractica: [],
            cuestionarioEvaluacion: [],
            recursosComplementarios: [],
          },
        ],
      },
    ],
    evaluacionFinalCurso: [],
    nexosVanguardRelacionados: [
      {
        nombre: "Simulador Macroeconómico en Labs",
        ruta: "/labs/macro",
        tipo: "lab",
        motivoPedagogico: "Simular tipos de interés, regla de Taylor e inflación.",
      },
    ],
    insigniaReconocimiento: "Analista en Deuda Soberana y Macroeconomía Monetaria",
  },

  // ── 6. MEDIOAMBIENTE ──────────────────────────────────────────
  {
    id: "cur-amb-01",
    slug: "medioambiente-sistemas-hidricos",
    titulo: "Sistemas Terrestres y Cuencas Hídricas: Límites Planetarios y Estrés Hídrico",
    subtitulo: "Modelización de cuencas fluviales, recarga de acuíferos y desertificación",
    categoria: "medioambiente",
    nivel: "intermedio",
    duracionHorasEstimadas: 5,
    totalLecciones: 2,
    perfilDocenteInstitucional: "Cátedra de Hidrología y Ecología de Sistemas Vanguard",
    institucionOReferencia: "World Resources Institute (WRI Aqueduct) & UNEP Global Land Outlook",
    descripcionGeneral:
      "Una visión sistémica de los recursos hídricos mundiales. Cómo se calculan los balances de entrada/salida de una cuenca, la sobreexplotación de aguas subterráneas no renovables y la gestión transfronteriza del agua.",
    competenciasAdquiridas: [
      "Calcular el índice de estrés hídrico de cuenca (Extracción / Recarga disponible).",
      "Modelar el impacto de la degradación de suelos en la pérdida de retención hídrica.",
      "Analizar los conflictos hídricos en cuencas compartidas (Nilo, Tigris-Éufrates, Indo).",
    ],
    objetivosAprendizaje: [
      {
        id: "obj-amb-1",
        verboBloom: "evaluar",
        descripcion: "Evaluar el umbral de estrés hídrico extremo (>80% de extracción sobre recurso renovable).",
        habilidadClave: "Cálculo de estrés hídrico con estándares WRI",
      },
    ],
    capitulos: [
      {
        id: "cap-amb-1",
        numero: 1,
        titulo: "La Cuenca Fluvial como Unidad Sistémica",
        descripcion: "Dinámica hidrológica, extracción agrícola y caudales ecológicos mínimos.",
        lecciones: [
          {
            id: "lec-amb-1-1",
            slug: "balance-hidrico-cuenca-estres",
            numero: 1,
            titulo: "Balance Hídrico y el Índice de Estrés WRI Aqueduct",
            duracionEstimadaMinutos: 25,
            resumenEjecutivo:
              "El estrés hídrico mide la competencia humana por el agua dulce disponible. Cuando la ratio entre extracciones totales anuales y el suministro renovable disponible supera el 40%, la cuenca entra en alto estrés; por encima del 80%, el colapso del caudal ecológico es inminente.",
            objetivosEspecificos: [
              "Identificar los tres sectores de demanda de agua: agrícola (70%), industrial (19%) y doméstico (11%).",
              "Interpretar datos de agotamiento freático mediante satélites gravimétricos GRACE.",
            ],
            conceptosClave: ["Estrés hídrico", "WRI Aqueduct", "Caudal ecológico", "Acuíferos fósiles", "Satélites GRACE"],
            contenidoSecciones: [
              {
                subtitulo: "1. La Ecuación del Balance de Cuenca",
                parrafos: [
                  "El balance hídrico se rige por la conservación de la masa: Precipitación = Evapotranspiración + Escorrentía superficial + Infiltración subterránea + Variación del almacenamiento. Cuando las extracciones humanas para regadío superan la recarga natural, el déficit se extrae de los acuíferos subterráneos, reduciendo el nivel freático a ritmos de metros por año.",
                ],
              },
            ],
            ejerciciosPractica: [],
            cuestionarioEvaluacion: [
              {
                id: "q-amb-1-1",
                tipo: "seleccion_multiple",
                enunciado: "¿Qué porcentaje del consumo total de agua dulce del planeta se destina a la agricultura y el regadío de cultivos?",
                opciones: [
                  { id: "a", texto: "Aproximadamente el 20%", explicacion: "Incorrecto.", esCorrecta: false },
                  { id: "b", texto: "Aproximadamente el 70% a nivel mundial", explicacion: "¡Correcto! En regiones áridas puede superar el 85%.", esCorrecta: true },
                  { id: "c", texto: "Menos del 40%", explicacion: "Incorrecto.", esCorrecta: false },
                ],
                pistas: ["La producción de alimentos absorbe la gran mayoría de la huella hídrica."],
                explicacionDetallada: "La FAO certifica que el regadío consume cerca del 70% de las extracciones de agua dulce mundiales.",
              },
            ],
            recursosComplementarios: [
              {
                titulo: "Simulador de Estrés Hídrico en Labs",
                ruta: "/labs/agua",
                tipo: "simulador",
                descripcion: "Modela el caudal de una cuenca frente a regadío y sequías prolongadas.",
              },
              {
                titulo: "Atlas Ambiental: Capa de Estrés Hídrico",
                ruta: "/planeta/atlas",
                tipo: "mapa",
                descripcion: "Cartografía de cuencas críticas con datos WRI Aqueduct 4.0.",
              },
            ],
          },
          {
            id: "lec-amb-1-2",
            slug: "desertificacion-aralkum-leccion",
            numero: 2,
            titulo: "El Desastre Ecológico de Aralkum: Desecación y Salinización",
            duracionEstimadaMinutos: 25,
            resumenEjecutivo:
              "El desvío de los ríos Amu Darya y Syr Darya para regadío de algodón en la época soviética redujo el Mar de Aral en un 90% de su volumen, dando origen al desierto salino de Aralkum.",
            objetivosEspecificos: [
              "Explicar las consecuencias climáticas locales de la pérdida de un gran cuerpo de agua interior.",
              "Analizar la dispersión eólica de sales y plaguicidas tóxicos.",
            ],
            conceptosClave: ["Mar de Aral", "Desierto de Aralkum", "Salinización", "Amu Darya y Syr Darya"],
            contenidoSecciones: [
              {
                subtitulo: "1. La Pérdida de Capacidad Térmica",
                parrafos: [
                  "El Mar de Aral actuaba como un amortiguador térmico que suavizaba los inviernos siberianos y refrescaba los veranos en Asia Central. Tras su evaporación casi total, el clima local se continentalizó bruscamente, con veranos 3 °C más cálidos e inviernos más severos.",
                ],
              },
            ],
            ejerciciosPractica: [],
            cuestionarioEvaluacion: [],
            recursosComplementarios: [],
          },
        ],
      },
    ],
    evaluacionFinalCurso: [],
    nexosVanguardRelacionados: [
      {
        nombre: "Observatorio de Océanos y Cuencas",
        ruta: "/planeta/oceanos",
        tipo: "planeta",
        motivoPedagogico: "Monitoreo de química marina y masas de agua continentales.",
      },
      {
        nombre: "Simulador de Cuenca Hídrica en Labs",
        ruta: "/labs/agua",
        tipo: "lab",
        motivoPedagogico: "Experimentar con políticas de cuotas de extracción y recarga.",
      },
    ],
    insigniaReconocimiento: "Especialista en Hidrología y Gestión de Cuencas",
  },

  // ── 7. CULTURA ────────────────────────────────────────────────
  {
    id: "cur-cul-01",
    slug: "cultura-antropologia-patrimonio",
    titulo: "Antropología Cultural y Patrimonio Global: Sociedades y Resiliencia",
    subtitulo: "Estructuras de parentesco, patrimonio inmaterial UNESCO y transmisión comunitaria",
    categoria: "cultura",
    nivel: "introductorio",
    duracionHorasEstimadas: 4,
    totalLecciones: 2,
    perfilDocenteInstitucional: "Cátedra de Antropología y Patrimonio Cultural Vanguard",
    institucionOReferencia: "UNESCO World Heritage Centre & Intangible Cultural Heritage",
    descripcionGeneral:
      "Un examen antropológico de los sistemas de significado, ritos y memorias colectivas que permiten a las comunidades humanas organizarse, transmitir conocimiento y preservar su identidad en entornos cambiantes.",
    competenciasAdquiridas: [
      "Distinguir patrimonio material de patrimonio inmaterial según directrices UNESCO.",
      "Comprender la función adaptativa de los sistemas de parentesco y reciprocidad económica.",
    ],
    objetivosAprendizaje: [
      {
        id: "obj-cul-1",
        verboBloom: "comprender",
        descripcion: "Comprender los criterios de valor universal excepcional del patrimonio mundial.",
        habilidadClave: "Evaluación de patrimonio cultural",
      },
    ],
    capitulos: [
      {
        id: "cap-cul-1",
        numero: 1,
        titulo: "La Memoria Colectiva y el Patrimonio Vivo",
        descripcion: "Tradición oral, cosmologías indígenas y salvaguarda de saberes tradicionales.",
        lecciones: [
          {
            id: "lec-cul-1-1",
            slug: "patrimonio-inmaterial-unesco-convencion",
            numero: 1,
            titulo: "La Convención de la UNESCO de 2003 para la Salvaguardia del Patrimonio Inmaterial",
            duracionEstimadaMinutos: 20,
            resumenEjecutivo:
              "El patrimonio no son solo monumentos de piedra; reside en las lenguas vivas, las artes del espectáculo, los usos sociales, los rituales y los saberes artesanales tradicionales transmitidos de generación en generación.",
            objetivosEspecificos: [
              "Diferenciar la Convención de 1972 (sitios materiales) de la Convención de 2003 (inmaterial).",
              "Identificar el papel activo de los portadores comunitarios de la tradición.",
            ],
            conceptosClave: ["Patrimonio Inmaterial", "UNESCO 2003", "Tradición oral", "Salvaguardia comunitaria"],
            contenidoSecciones: [
              {
                subtitulo: "1. El Patrimonio como Proceso Vivo",
                parrafos: [
                  "A diferencia de un edificio que se congela o restaura, el patrimonio cultural inmaterial es recreado constantemente por las comunidades y grupos en función de su entorno, su interacción con la naturaleza y su historia, infundiéndoles un sentimiento de identidad y continuidad.",
                ],
              },
            ],
            ejerciciosPractica: [],
            cuestionarioEvaluacion: [
              {
                id: "q-cul-1-1",
                tipo: "verdadero_falso",
                enunciado: "Para que una manifestación cultural sea considerada patrimonio inmaterial por la UNESCO, debe conservarse exactamente inalterada durante más de 500 años sin ninguna evolución.",
                opciones: [
                  { id: "v", texto: "Verdadero", explicacion: "Falso. La UNESCO reconoce expresamente que el patrimonio inmaterial es dinámico y se recrea continuamente.", esCorrecta: false },
                  { id: "f", texto: "Falso", explicacion: "¡Correcto! El patrimonio inmaterial es un proceso vivo que evoluciona con cada generación.", esCorrecta: true },
                ],
                pistas: ["Revisa la definición del Artículo 2 de la Convención UNESCO 2003."],
                explicacionDetallada: "La Convención subraya que el patrimonio inmaterial es recreado constantemente por las comunidades, adaptándose a su tiempo sin perder su función identitaria.",
              },
            ],
            recursosComplementarios: [],
          },
          {
            id: "lec-cul-1-2",
            slug: "antropologia-reciprocidad-mauss",
            numero: 2,
            titulo: "El Ensayo sobre el Don de Marcel Mauss: La Triple Obligación",
            duracionEstimadaMinutos: 25,
            resumenEjecutivo:
              "Marcel Mauss demostró que el intercambio tradicional en sociedades humanas no es un simple trueque mercantil, sino un hecho social total basado en la triple obligación moral de dar, recibir y devolver.",
            objetivosEspecificos: [
              "Explicar los conceptos de kula y potlatch como mecanismos de prestigio y redistribución.",
              "Comprender la cohesión social como producto de la deuda social mutua.",
            ],
            conceptosClave: ["Marcel Mauss", "El Don", "Potlatch", "Kula", "Hecho social total"],
            contenidoSecciones: [
              {
                subtitulo: "1. La Estructura de la Alianza Humana",
                parrafos: [
                  "Rechazar un regalo equivale a declarar la guerra. Al aceptar el don, el receptor asume una deuda temporal que solo se salda devolviendo un contra-don en el futuro, manteniendo tejida la red de alianzas entre clanes y comunidades.",
                ],
              },
            ],
            ejerciciosPractica: [],
            cuestionarioEvaluacion: [],
            recursosComplementarios: [],
          },
        ],
      },
    ],
    evaluacionFinalCurso: [],
    nexosVanguardRelacionados: [
      {
        nombre: "Área de Cultura y Patrimonio en Conocimiento",
        ruta: "/conocimiento/area/cultura",
        tipo: "investigacion",
        motivoPedagogico: "Explorar fichas monográficas de pueblos y tradiciones mundiales.",
      },
    ],
    insigniaReconocimiento: "Diplomado en Antropología Cultural y Patrimonio Global",
  },

  // ── 8. RELACIONES INTERNACIONALES ─────────────────────────────
  {
    id: "cur-ri-01",
    slug: "relaciones-teoria-juegos-disuasion",
    titulo: "Teoría de Juegos y Disuasión Estratégica en Relaciones Internacionales",
    subtitulo: "Equilibrios de Nash, Destrucción Mutua Asegurada (MAD) y Dilemas de Seguridad",
    categoria: "relaciones_internacionales",
    nivel: "avanzado",
    duracionHorasEstimadas: 6,
    totalLecciones: 2,
    perfilDocenteInstitucional: "Centro de Estudios Estratégicos y Teoría de Juegos Vanguard",
    institucionOReferencia: "Vanguard Strategic Defense & RAND Game Theory Foundation",
    descripcionGeneral:
      "Una formalización matemática y estratégica de las decisiones interestatales bajo anarquía: el Dilema del Prisionero, juegos del gallina (chicken game), credibilidad del segundo golpe nuclear (second-strike capability) y la paradoja de la estabilidad-inestabilidad.",
    competenciasAdquiridas: [
      "Modelar una matriz de pagos de 2x2 para dilemas de seguridad y carreras de armamentos.",
      "Calcular equilibrios de Nash en estrategias puras y mixtas.",
      "Comprender la doctrina de Destrucción Mutua Asegurada y la tríada nuclear.",
    ],
    objetivosAprendizaje: [
      {
        id: "obj-ri-1",
        verboBloom: "analizar",
        descripcion: "Analizar el dilema del prisionero aplicado a la proliferación nuclear defensiva.",
        habilidadClave: "Teoría de juegos aplicada a defensa",
      },
    ],
    capitulos: [
      {
        id: "cap-ri-1",
        numero: 1,
        titulo: "Modelos Formales de Decisión y Crisis",
        descripcion: "Matrices de pago, equilibrios estratégicos y cálculo racional de disuasión.",
        lecciones: [
          {
            id: "lec-ri-1-1",
            slug: "dilema-prisionero-carrera-armamentos",
            numero: 1,
            titulo: "El Dilema del Prisionero y la Carrera de Armamentos",
            duracionEstimadaMinutos: 30,
            resumenEjecutivo:
              "En una situación de anarquía internacional sin un poder coercitivo central, armarse es la estrategia dominante individual para cada estado, conduciendo a un resultado Pareto-ineficiente donde ambos gastan recursos y reducen su seguridad relativa.",
            objetivosEspecificos: [
              "Construir la matriz de pagos entre Desarmar / Armar.",
              "Explicar el concepto de equilibrio de Nash y por qué la cooperación espontánea fracasa en juegos de un solo disparo.",
            ],
            conceptosClave: ["Equilibrio de Nash", "Estrategia dominante", "Dilema del Prisionero", "Eficiencia de Pareto"],
            contenidoSecciones: [
              {
                subtitulo: "1. La Estructura Formal del Conflicto",
                parrafos: [
                  "Supongamos dos estados rivales A y B. Si ambos cooperan (desarme), obtienen un beneficio neto de paz (3, 3). Si A se desarma y B se reexpande militarmente, B obtiene ventaja hegemónica (5) y A queda vulnerable (0).",
                  "Dado que 5 > 3 y 1 > 0, para cada estado la elección racional individual siempre es rearmarse sin importar lo que haga el otro. El equilibrio de Nash resultante es (Rearmarse, Rearmarse) con pagos (1, 1), un resultado estrictamente peor para ambos que el desarme mutuo.",
                ],
              },
            ],
            ejerciciosPractica: [],
            cuestionarioEvaluacion: [
              {
                id: "q-ri-1-1",
                tipo: "seleccion_multiple",
                enunciado: "¿Por qué en el Dilema del Prisionero estándar el equilibrio de Nash es Pareto-ineficiente?",
                opciones: [
                  { id: "a", texto: "Porque ambos jugadores alcanzan el máximo pago colectivo posible", explicacion: "Incorrecto; ese sería el óptimo cooperativo.", esCorrecta: false },
                  { id: "b", texto: "Porque existe otro resultado posible (cooperación mutua) que mejoraría el pago de ambos jugadores sin perjudicar a ninguno", explicacion: "¡Correcto! Es la definición exacta de ineficiencia paretiana.", esCorrecta: true },
                  { id: "c", texto: "Porque uno de los jugadores siempre pierde todo", explicacion: "Incorrecto.", esCorrecta: false },
                ],
                pistas: ["Un estado es Pareto-óptimo si no se puede mejorar la situación de nadie sin empeorar la de otro."],
                explicacionDetallada: "En el equilibrio (Defeccionar, Defeccionar) ambos obtienen 1, mientras que cooperando ambos obtendrían 3. Por ello la anarquía produce carreras armamentistas subóptimas.",
              },
            ],
            recursosComplementarios: [
              {
                titulo: "Simulador de Alianzas en Labs",
                ruta: "/labs/alianzas",
                tipo: "simulador",
                descripcion: "Simulación de teoría de redes de defensa y contagio de tratados mutuos.",
              },
            ],
          },
          {
            id: "lec-ri-1-2",
            slug: "destruccion-mutua-asegurada-triada",
            numero: 2,
            titulo: "La Destrucción Mutua Asegurada (MAD) y la Tríada Nuclear",
            duracionEstimadaMinutos: 25,
            resumenEjecutivo:
              "La disuasión nuclear estable descansa en la certeza de la capacidad de segundo golpe: silos terrestres (ICBM), bombarderos estratégicos y submarinos de propulsión nuclear armados con misiles balísticos (SSBN).",
            objetivosEspecificos: [
              "Explicar por qué los submarinos SSBN son el pilar más invulnerable de la disuasión.",
              "Analizar cómo los sistemas de defensa antimisiles pueden paradójicamente desestabilizar el equilibrio MAD.",
            ],
            conceptosClave: ["MAD (Mutual Assured Destruction)", "Capacidad de segundo golpe", "SSBN", "Tríada Nuclear"],
            contenidoSecciones: [
              {
                subtitulo: "1. La Lógica de la Represalia Inevitable",
                parrafos: [
                  "Si un estado cree que puede lanzar un primer ataque sorpresa y destruir todo el arsenal del adversario sin recibir represalias, la disuasión fracasa. La tríada nuclear garantiza que, incluso tras un ataque nuclear masivo sorpresa, los submarinos balísticos sumergidos y ocultos en patrulla continua conservarán suficientes cabezas nucleares para infligir un daño inaceptable al agresor.",
                ],
              },
            ],
            ejerciciosPractica: [],
            cuestionarioEvaluacion: [],
            recursosComplementarios: [],
          },
        ],
      },
    ],
    evaluacionFinalCurso: [],
    nexosVanguardRelacionados: [
      {
        nombre: "Módulo de Poder y Gasto Militar",
        ruta: "/poder",
        tipo: "investigacion",
        motivoPedagogico: "Comparar presupuestos de defensa y capacidad militar por nación.",
      },
      {
        nombre: "Simulador de Alianzas en Labs",
        ruta: "/labs/alianzas",
        tipo: "lab",
        motivoPedagogico: "Modelar cláusulas de defensa mutua tipo Artículo 5 de la OTAN.",
      },
    ],
    insigniaReconocimiento: "Especialista en Teoría de Juegos y Estrategia de Disuasión",
  },

  // ── 9. MATEMÁTICAS ───────────────────────────────────────────
  {
    id: "cur-mat-01",
    slug: "matematicas-sistemas-dinamicos",
    titulo: "Modelización de Sistemas Dinámicos y Ecuaciones Diferenciales para Sistemas Complejos",
    subtitulo: "De los modelos Lotka-Volterra a las bifurcaciones caóticas y el colapso de redes",
    categoria: "matematicas",
    nivel: "avanzado",
    duracionHorasEstimadas: 6,
    totalLecciones: 2,
    perfilDocenteInstitucional: "Cátedra de Matemática Aplicada y Complejidad Vanguard",
    institucionOReferencia: "Vanguard Mathematics Foundation & Santa Fe Institute Complexity Research",
    descripcionGeneral:
      "Una formación formal en modelado continuo y discreto de sistemas acoplados: ecuaciones diferenciales ordinarias, diagramas de fase, puntos fijos, estabilidad local mediante la matriz jacobiana y transiciones de fase críticas.",
    competenciasAdquiridas: [
      "Calcular puntos de equilibrio de un sistema no lineal 2D.",
      "Linealizar un sistema alrededor de un punto crítico calculando autovalores del jacobiano.",
      "Comprender la sensibilidad a las condiciones iniciales (Efecto Mariposa en atractores de Lorenz).",
    ],
    objetivosAprendizaje: [
      {
        id: "obj-mat-1",
        verboBloom: "aplicar",
        descripcion: "Determinar la estabilidad asintótica de un punto fijo usando el signo de la parte real de los autovalores.",
        habilidadClave: "Análisis de estabilidad en espacio de fases",
      },
    ],
    capitulos: [
      {
        id: "cap-mat-1",
        numero: 1,
        titulo: "Espacio de Fases y Puntos de Equilibrio",
        descripcion: "Campos vectoriales, trayectorias ortogonales y linealización de Taylor.",
        lecciones: [
          {
            id: "lec-mat-1-1",
            slug: "modelo-lotka-volterra-depredador-presa",
            numero: 1,
            titulo: "El Sistema Depredador-Presa de Lotka-Volterra",
            duracionEstimadaMinutos: 30,
            resumenEjecutivo:
              "El sistema acoplado dx/dt = α x - β x y, dy/dt = δ x y - γ y modela la interacción entre presas (x) y depredadores (y). Presenta órbitas periódicas cerradas en el espacio de fases.",
            objetivosEspecificos: [
              "Encontrar los dos puntos de equilibrio: el origen trivial (0, 0) y el punto interior (γ/δ, α/β).",
              "Deducir la integral primera o cantidad conservada del sistema.",
            ],
            conceptosClave: ["Lotka-Volterra", "Puntos de equilibrio", "Matriz Jacobiana", "Órbitas cerradas"],
            contenidoSecciones: [
              {
                subtitulo: "1. La Formulación de las Ecuaciones",
                parrafos: [
                  "En ausencia de depredadores (y = 0), las presas crecen exponencialmente a una tasa α. La tasa de depredación es proporcional al número de encuentros β x y. Para los depredadores, la reproducción depende del alimento ingerido δ x y, y en ausencia de presas mueren a una tasa natural γ.",
                  "En los puntos de equilibrio, las derivadas se anulan simultáneamente: dx/dt = 0 y dy/dt = 0.",
                ],
              },
            ],
            ejerciciosPractica: [],
            cuestionarioEvaluacion: [
              {
                id: "q-mat-1-1",
                tipo: "calculo_practico",
                enunciado: "Para el sistema dx/dt = x (2 - y) y dy/dt = y (x - 3), ¿cuál es el punto de equilibrio no nulo (coexistencia de especies)?",
                opciones: [
                  { id: "a", texto: "(x*, y*) = (2, 3)", explicacion: "Incorrecto: invertiste las coordenadas.", esCorrecta: false },
                  { id: "b", texto: "(x*, y*) = (3, 2)", explicacion: "¡Correcto! dx/dt = 0 cuando y = 2; dy/dt = 0 cuando x = 3.", esCorrecta: true },
                  { id: "c", texto: "(x*, y*) = (1, 1)", explicacion: "Incorrecto.", esCorrecta: false },
                ],
                pistas: ["Para que dx/dt = 0 con x ≠ 0, se requiere que (2 - y) = 0. Para dy/dt = 0 con y ≠ 0, se requiere (x - 3) = 0."],
                explicacionDetallada: "Al anular los factores entre paréntesis: y* = 2 y x* = 3. En el punto (3, 2) ambas poblaciones permanecen constantes a lo largo del tiempo.",
              },
            ],
            recursosComplementarios: [
              {
                titulo: "Simuladores Numéricos de Vanguard Labs",
                ruta: "/labs",
                tipo: "simulador",
                descripcion: "Quince laboratorios matemáticos basados en ecuaciones diferenciales acopladas.",
              },
            ],
          },
          {
            id: "lec-mat-1-2",
            slug: "redes-complejas-cascadas-falla",
            numero: 2,
            titulo: "Teoría de Grafos y Cascadas de Falla en Redes Complejas",
            duracionEstimadaMinutos: 25,
            resumenEjecutivo:
              "Cómo la topología libre de escala (redes de Barabási-Albert) confiere robustez frente a fallos aleatorios pero extrema fragilidad ante ataques selectivos a los hubs centrales.",
            objetivosEspecificos: [
              "Calcular la distribución de grado P(k) ~ k^(-γ).",
              "Comprender la percolación y el umbral crítico de desconexión de red.",
            ],
            conceptosClave: ["Red libre de escala", "Hubs", "Cascada de falla", "Centralidad de intermediación"],
            contenidoSecciones: [
              {
                subtitulo: "1. La Vulnerabilidad de los Nodos Críticos",
                parrafos: [
                  "En infraestructuras interconectadas (como la red eléctrica o el sistema financiero interbancario), la sobrecarga de un nodo que colapsa se redistribuye a sus vecinos más cercanos, empujándolos más allá de su capacidad máxima y desatando un apagón en cascada.",
                ],
              },
            ],
            ejerciciosPractica: [],
            cuestionarioEvaluacion: [],
            recursosComplementarios: [
              {
                titulo: "Simulador de Red en Labs",
                ruta: "/labs/red",
                tipo: "simulador",
                descripcion: "Modela la propagación de una falla en cascada en una red de nodos interconectados.",
              },
            ],
          },
        ],
      },
    ],
    evaluacionFinalCurso: [],
    nexosVanguardRelacionados: [
      {
        nombre: "Catálogo de Simuladores en Labs",
        ruta: "/labs",
        tipo: "lab",
        motivoPedagogico: "Todos los simuladores de Labs ejecutan modelos de ecuaciones diferenciales numéricas.",
      },
    ],
    insigniaReconocimiento: "Investigador en Sistemas Dinámicos y Redes Complejas",
  },

  // ── 10. IDIOMAS ───────────────────────────────────────────────
  {
    id: "cur-idi-01",
    slug: "idiomas-linguistica-diplomacia",
    titulo: "Lingüística Comparada y Diplomacia Multilingüe: Estructura del Lenguaje y Tratados",
    subtitulo: "Morfosintaxis, ambigüedad constructiva en tratados internacionales y familias lingüísticas",
    categoria: "idiomas",
    nivel: "intermedio",
    duracionHorasEstimadas: 5,
    totalLecciones: 2,
    perfilDocenteInstitucional: "Cátedra de Lingüística Aplicada y Lenguaje Diplomático Vanguard",
    institucionOReferencia: "Vanguard Multilingual Treaty Archive & United Nations Translation Standards",
    descripcionGeneral:
      "El lenguaje es la herramienta primaria de la política exterior. Este curso analiza cómo las discrepancias semánticas, las traducciones no equivalentes y la ambigüedad constructiva deliberada permiten firmar acuerdos de paz o desatar nuevas controversias jurídicas.",
    competenciasAdquiridas: [
      "Identificar casos históricos de ambigüedad diplomática por traducción (ej. Resolución 242 de la ONU).",
      "Clasificar familias lingüísticas y su relación con la demarcación de estados-nación.",
      "Analizar los seis idiomas oficiales de las Naciones Unidas y su valor legal paritario.",
    ],
    objetivosAprendizaje: [
      {
        id: "obj-idi-1",
        verboBloom: "analizar",
        descripcion: "Analizar cómo la omisión de un artículo definido en un texto diplomático altera obligaciones territoriales.",
        habilidadClave: "Análisis semántico de tratados de paz",
      },
    ],
    capitulos: [
      {
        id: "cap-idi-1",
        numero: 1,
        titulo: "La Semántica de la Negociación Internacional",
        descripcion: "Traducción diplomática, textos auténticos multilingües y cláusulas interpretativas.",
        lecciones: [
          {
            id: "lec-idi-1-1",
            slug: "resolucion-242-ambiguedad-constructiva",
            numero: 1,
            titulo: "La Resolución 242 de la ONU y la Ambigüedad del Artículo Definido",
            duracionEstimadaMinutos: 25,
            resumenEjecutivo:
              "El texto en inglés exigió la retirada de fuerzas de 'territories occupied' (sin artículo), mientras que la versión francesa igualmente auténtica rezó 'des territoires occupés' (de los territorios ocupados), generando seis décadas de interpretaciones opuestas.",
            objetivosEspecificos: [
              "Comprender el concepto diplomático de 'ambigüedad constructiva' formulado por Henry Kissinger.",
              "Analizar las reglas de interpretación del Artículo 33 de la Convención de Viena sobre el Derecho de los Tratados.",
            ],
            conceptosClave: ["Ambigüedad constructiva", "Resolución 242 ONU", "Convención de Viena 1969", "Textos auténticos"],
            contenidoSecciones: [
              {
                subtitulo: "1. Cuando una Palabra Decide la Paz",
                parrafos: [
                  "Tras la Guerra de los Seis Días en 1967, el Consejo de Seguridad de la ONU aprobó la Resolución 242. Los diplomáticos británicos redactaron conscientemente 'from territories occupied in the recent conflict' para permitir a Israel sostener que no se le exigía evacuar 'todos' los territorios.",
                  "En cambio, la delegación francesa insistió en 'retrait des forces armées israéliennes des territoires occupés', lo que denota la totalidad del conjunto territorial. Ambos textos son depositarios oficiales con igual validez jurídica.",
                ],
              },
            ],
            ejerciciosPractica: [],
            cuestionarioEvaluacion: [
              {
                id: "q-idi-1-1",
                tipo: "seleccion_multiple",
                enunciado: "Según el Artículo 33 de la Convención de Viena sobre el Derecho de los Tratados, cuando un tratado autenticado en varios idiomas revela una discrepancia de sentido que no se resuelve con las reglas generales, ¿cómo debe zanjarse?",
                opciones: [
                  { id: "a", texto: "Prevalece siempre la versión redactada en inglés", explicacion: "Incorrecto; todos los idiomas autenticados tienen el mismo valor jurídico a menos que el tratado disponga otra cosa.", esCorrecta: false },
                  { id: "b", texto: "Se adoptará el sentido que mejor concilie los textos habida cuenta del objeto y fin del tratado", explicacion: "¡Correcto! Es el mandato literal del Artículo 33(4) de la Convención de Viena de 1969.", esCorrecta: true },
                  { id: "c", texto: "El tratado queda automáticamente anulado sin efecto retroactivo", explicacion: "Incorrecto.", esCorrecta: false },
                ],
                pistas: ["Revisa el principio de teleología y conciliación de textos auténticos."],
                explicacionDetallada: "El derecho internacional busca la conciliación armónica que respete la intención común de las partes y el propósito del acuerdo.",
              },
            ],
            recursosComplementarios: [
              {
                titulo: "Traductor Multilingüe Vanguard",
                ruta: "/traductor",
                tipo: "dossier",
                descripcion: "Herramienta de análisis léxico y comparativo internacional.",
              },
            ],
          },
          {
            id: "lec-idi-1-2",
            slug: "familias-linguisticas-fronteras-nacion",
            numero: 2,
            titulo: "Familias Lingüísticas y la Invención de las Fronteras Estatales",
            duracionEstimadaMinutos: 25,
            resumenEjecutivo:
              "De la familia indoeuropea a las lenguas sinotibetanas y bantúes: cómo la política de estandarización lingüística del siglo XIX consolidó los estados-nación y marginó las continuidades dialectales.",
            objetivosEspecificos: [
              "Explicar el concepto de 'continuum dialectal' frente a fronteras políticas rígidas.",
              "Analizar la diglosia y el estatus de lenguas vehiculares (lingua franca) en organismos multilaterales.",
            ],
            conceptosClave: ["Continuum dialectal", "Familia indoeuropea", "Diglosia", "Lingua franca"],
            contenidoSecciones: [
              {
                subtitulo: "1. La Máxima de Max Weinreich",
                parrafos: [
                  "Como sentenció el lingüista Max Weinreich: 'Una lengua es un dialecto con un ejército y una marina'. La demarcación entre lo que se considera un idioma independiente o una variante dialectal suele ser una decisión política y militar, no una frontera biológica.",
                ],
              },
            ],
            ejerciciosPractica: [],
            cuestionarioEvaluacion: [],
            recursosComplementarios: [],
          },
        ],
      },
    ],
    evaluacionFinalCurso: [],
    nexosVanguardRelacionados: [
      {
        nombre: "Traductor y Glosario Multilingüe",
        ruta: "/traductor",
        tipo: "investigacion",
        motivoPedagogico: "Explorar la semántica en tiempo real de despachos de prensa internacionales.",
      },
    ],
    insigniaReconocimiento: "Especialista en Lingüística y Diplomacia Multilingüe",
  },
];
