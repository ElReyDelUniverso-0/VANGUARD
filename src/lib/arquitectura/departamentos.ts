// ═══════════════════════════════════════════════════════════════════
// v412.0 · LOS 22 DEPARTAMENTOS — quién responde de qué y qué hay ya
//
// Este registro no es una lista de deseos: es una AUDITORÍA. Para cada
// departamento del plan se dice qué infraestructura existe HOY en el
// repositorio (con su ruta real), qué falta y cuál es la siguiente pieza
// concreta. Los estados son tres y no admiten interpretación:
//
//   · «en pie»        hay una función viva, con datos reales y puerta pública.
//   · «parcial»       hay piezas vivas, pero el departamento no se sostiene solo.
//   · «sin construir» no hay nada: ni ruta, ni motor, ni datos.
//
// Lo que NO se hace aquí: marcar como hecho lo que solo tiene interfaz. Si
// una pieza es una pantalla sin motor detrás, cuenta como «sin construir».
// Las rutas se comprueban contra el censo del árbol con
// tools/arquitectura/probar.mjs.
// ═══════════════════════════════════════════════════════════════════

export type EstadoDepartamento = "en pie" | "parcial" | "sin construir";

export interface PiezaExistente {
  etiqueta: string;
  ruta?: string;
  nota: string;
}

export interface Departamento {
  n: number;
  id: string;
  nombre: string;
  mision: string;
  estado: EstadoDepartamento;
  existe: PiezaExistente[];
  falta: string[];
  siguiente: string;
}

export const DEPARTAMENTOS: Departamento[] = [
  {
    n: 1,
    id: "arquitectura",
    nombre: "Arquitectura maestra",
    mision: "Que la casa sea un ecosistema conectado y no una colección de módulos.",
    estado: "en pie",
    existe: [
      { etiqueta: "El censo del árbol", ruta: "/arquitectura", nota: "Las páginas y las rutas de API contadas recorriendo src/app, con sus referencias entrantes." },
      { etiqueta: "El censo del Núcleo", ruta: "/nucleo", nota: "Los módulos registrados con ruta, permiso, estado y dependencias." },
      { etiqueta: "El catálogo de destinos", ruta: "/directorio", nota: "Los destinos de la casa cruzados por ruta, con sus temas y las fusiones declaradas." },
      { etiqueta: "Los espacios de trabajo", ruta: "/navegacion", nota: "Diez espacios con las herramientas de cada oficio, sin inventar ninguna ruta." },
      { etiqueta: "El motor de nexos", nota: "src/lib/arquitectura/nexos.ts: las salidas de cada laboratorio y de cada país, con su motivo." },
    ],
    falta: [
      "Un grafo persistente de dependencias entre librerías (hoy se declaran a mano en el Núcleo).",
      "Detección automática de funciones duplicadas por comportamiento, no solo por ruta.",
    ],
    siguiente: "Cruzar el censo con el Núcleo para que ninguna página pública quede fuera del registro y ninguna ruta registrada deje de existir.",
  },
  {
    n: 2,
    id: "editorial",
    nombre: "Redacción global",
    mision: "Producir contenido original con método, autoría y fecha.",
    estado: "parcial",
    existe: [
      { etiqueta: "La redacción", ruta: "/editorial", nota: "Biblioteca de artículos con áreas temáticas." },
      { etiqueta: "El calendario", nota: "src/lib/editorial/calendario.ts: la planificación conectada con las áreas." },
      { etiqueta: "La bitácora", ruta: "/novedades", nota: "Registro público de versiones con sus hitos." },
    ],
    falta: [
      "Páginas de autoría con metodología y fuentes por artículo.",
      "Flujo de revisión: hoy no hay estados de borrador, revisión y publicado.",
      "Contenido de actualidad propio: la casa publica cables, no reportajes.",
    ],
    siguiente: "Ficha de autor y metodología por artículo, con la fuente de cada afirmación y su fecha de actualización.",
  },
  {
    n: 3,
    id: "enciclopedia",
    nombre: "Enciclopedia mundial",
    mision: "Perfiles completos de países, regiones y territorios.",
    estado: "parcial",
    existe: [
      { etiqueta: "Conocimiento conectado por país", ruta: "/conocimiento?modo=paises", nota: "Comparador del mismo año y lecturas relacionadas. 249 identidades reutilizadas; historia específica aún parcial." },
      { etiqueta: "249 fichas de país", ruta: "/mundos", nota: "Geografía, población, economía, vecinos, bloques y puestos mundiales, con el año de cada cifra." },
      { etiqueta: "El comparador", ruta: "/comparador", nota: "De dos a cuatro países en ocho indicadores." },
      { etiqueta: "El atlas", ruta: "/atlas", nota: "Naciones con capital, población, moneda y dirigente real." },
      { etiqueta: "Las regiones", ruta: "/regiones", nota: "Veinticuatro subregiones con sus cifras sumadas." },
    ],
    falta: [
      "Cultura, patrimonio, historia e instituciones explicadas por país (hoy la ficha es fundamentalmente cuantitativa).",
      "Imágenes con derechos y atribución por país.",
      "Cronología propia en cada ficha.",
    ],
    siguiente: "Añadir a la ficha un bloque de historia y cultura con fuente citada, empezando por los seis países del patrón.",
  },
  {
    n: 4,
    id: "historia",
    nombre: "Atlas de historia y civilizaciones",
    mision: "Convertir la historia humana en un espacio navegable.",
    estado: "parcial",
    existe: [
      { etiqueta: "Cronología y civilizaciones documentadas", ruta: "/conocimiento?modo=cronologia", nota: "39 acontecimientos y 16 civilizaciones; puntos de referencia, no fronteras históricas." },
      { etiqueta: "El archivo de la historia", ruta: "/historia", nota: "Las guerras del archivo con fecha y resultado." },
      { etiqueta: "Archivo mundial", ruta: "/archivo-mundial", nota: "Eras, carteles y curiosidades verificadas." },
      { etiqueta: "Rutas históricas simuladas", ruta: "/labs/rutas", nota: "El modelo de rutas entre Asia y Europa, con mapa." },
      { etiqueta: "Imperios simulados", ruta: "/labs/imperios", nota: "El coste de administrar un territorio que crece." },
    ],
    falta: [
      "Mapas históricos con fronteras por período (hoy el mapa es siempre el actual).",
      "Biografías de personajes históricos más allá de los dirigentes en activo.",
      "Comparación entre épocas y civilizaciones.",
    ],
    siguiente: "Fronteras por período sobre la misma retícula del mapa actual, con la fuente de cada trazado.",
  },
  {
    n: 5,
    id: "ciencia",
    nombre: "Ciencia y descubrimiento",
    mision: "Abrir la casa al conocimiento científico.",
    estado: "sin construir",
    existe: [
      { etiqueta: "Centro de investigación científica", ruta: "/conocimiento/centro/cientifica", nota: "Conceptos con mecanismos, límites y referencias; no incluye biblioteca médica revisada." },{ etiqueta: "El cielo y el espacio", ruta: "/pulso-mundial", nota: "Clima espacial y sismos observados: es observación, no divulgación científica." }],
    falta: [
      "Física, química, biología y matemáticas: no hay ni una ficha.",
      "Astronomía, evolución, ecosistemas y biodiversidad explicados.",
      "Medicina y salud pública con enfoque educativo y basado en evidencia.",
      "Glosarios y experimentos virtuales.",
    ],
    siguiente: "Una familia de fichas científicas con glosario y fuente, empezando por cinco temas que ya tengan datos en la casa (clima, agua, suelo, población, energía).",
  },
  {
    n: 6,
    id: "tecnologia",
    nombre: "Tecnología y futuro",
    mision: "El centro de tecnología e innovación.",
    estado: "sin construir",
    existe: [
      { etiqueta: "Tecnología en contexto", ruta: "/conocimiento/area/tecnologia", nota: "Expedientes de semiconductores e infraestructura digital conectados a fuentes y conceptos." },{ etiqueta: "La energía simulada", ruta: "/labs/energia", nota: "Mezcla energética: el único contenido técnico con motor detrás." }],
    falta: [
      "Enciclopedia de tecnologías y cronología de inventos.",
      "Comparadores de generaciones tecnológicas.",
      "Mapas de centros de innovación.",
      "Escenarios futuros claramente etiquetados como proyección.",
    ],
    siguiente: "Comparador de tecnologías (por ejemplo, generaciones de batería) con la misma disciplina de origen de dato que el laboratorio.",
  },
  {
    n: 7,
    id: "economia",
    nombre: "Economía global y datos",
    mision: "Un observatorio de economía mundial conectado a los perfiles de país.",
    estado: "parcial",
    existe: [
      { etiqueta: "Indicadores y CSV", ruta: "/conocimiento?modo=indicadores", nota: "35.463 observaciones, 12 series recuperadas y seis fallidas declaradas; instantánea, no datos en tiempo real." },
      { etiqueta: "El catálogo de datos", ruta: "/datos", nota: "Doce modelos de datos con procedencia, licencia, fecha y límites." },
      { etiqueta: "Los rankings", ruta: "/rankings", nota: "Ocho listas mundiales completas con peso y acumulado." },
      { etiqueta: "Los bloques", ruta: "/organizaciones", nota: "Dieciséis organizaciones con miembros y peso conjunto." },
      { etiqueta: "Divisas", ruta: "/divisas", nota: "El mercado y el tipo de cambio." },
      { etiqueta: "Simuladores económicos", ruta: "/labs", nota: "Cuatro modelos: economía nacional, presupuesto, comercio y producción." },
    ],
    falta: [
      "Series históricas seleccionables por período (hoy cada indicador llega con un año de captura).",
      "Empleo e inflación por país con su fuente.",
      "Flujos comerciales con datos fiables: la casa no los tiene y no los dibuja.",
    ],
    siguiente: "Serie temporal por indicador donde la fuente la publique, con la fecha de cada punto.",
  },
  {
    n: 8,
    id: "sociedad",
    nombre: "Sociedad y cultura",
    mision: "Representar la diversidad de las sociedades humanas.",
    estado: "parcial",
    existe: [
      { etiqueta: "Sociedad y cultura", ruta: "/conocimiento/area/cultura", nota: "Patrimonio y diversidad con fuentes; cobertura inicial breve, no inventario cultural exhaustivo." },
      { etiqueta: "Centro de población", ruta: "/demografia", nota: "Estructura por edades, esperanza de vida y concentración de población." },
      { etiqueta: "Regiones", ruta: "/regiones", nota: "Veinticuatro subregiones con sus totales." },
      { etiqueta: "Urbanización simulada", ruta: "/labs/urbanizacion", nota: "El mecanismo de la ciudad que crece más rápido de lo que puede." },
    ],
    falta: [
      "Idiomas, patrimonio, tradiciones, arquitectura y gastronomía: nada de eso tiene ficha.",
      "Migraciones con fuente.",
      "Colecciones visuales con derechos.",
    ],
    siguiente: "Ficha de idioma y patrimonio por país, con fuente oficial y fecha.",
  },
  {
    n: 9,
    id: "planeta",
    nombre: "Planeta y medio ambiente",
    mision: "El observatorio del planeta.",
    estado: "parcial",
    existe: [
      { etiqueta: "Clima, agua y ecosistemas", ruta: "/conocimiento/area/medioambiente", nota: "Conceptos, fuentes y aprendizaje sobre sistemas ambientales; proyecciones no equivalen a predicciones." },
      { etiqueta: "Datos vivos", ruta: "/pulso-mundial", nota: "Sismos, clima espacial y señales, observados en vivo." },
      { etiqueta: "Clima simulado", ruta: "/labs/clima", nota: "Caja de carbono con límites declarados." },
      { etiqueta: "Agua simulada", ruta: "/labs/agua", nota: "La cuenca que se vacía." },
      { etiqueta: "El globo por capas", ruta: "/mapas", nota: "Capas de población, economía y clima sobre el planeta." },
    ],
    falta: [
      "Series históricas ambientales (temperatura, emisiones, hielo) con fuente y período.",
      "Biodiversidad y ecosistemas explicados.",
      "Escenarios climáticos con supuestos explícitos más allá del modelo educativo.",
    ],
    siguiente: "Serie histórica de un indicador ambiental con fuente, fecha de captura y límites, integrada en /datos.",
  },
  {
    n: 10,
    id: "cartografia",
    nombre: "Cartografía global",
    mision: "Hacer de los mapas la fortaleza de la casa.",
    estado: "en pie",
    existe: [
      { etiqueta: "Centro de mapas", ruta: "/mapas", nota: "El globo con ocho capas, leyenda y fuentes." },
      { etiqueta: "Mundo 3D", ruta: "/mundo", nota: "El planeta con las zonas de control y los cables del día." },
      { etiqueta: "El atlas", ruta: "/atlas", nota: "Naciones con sus datos reales." },
      { etiqueta: "Teatros tácticos", ruta: "/teatro-3d", nota: "Cualquier lugar convertido en teatro 2D/3D." },
      { etiqueta: "Mapas de laboratorio", ruta: "/labs/comercio", nota: "Dos modelos dibujan sobre retícula propia, con el grosor del trazo como dato." },
    ],
    falta: [
      "Comparación de mapas por período histórico.",
      "Búsqueda de lugares por nombre dentro del mapa.",
      "Fichas laterales conectadas al mapa (hoy el mapa y la ficha son páginas distintas).",
    ],
    siguiente: "Buscador de lugar dentro de /mapas que abra la ficha del país sin salir del globo.",
  },
  {
    n: 11,
    id: "simulaciones",
    nombre: "Aprendizaje interactivo y simulaciones",
    mision: "Aprender explorando, con límites declarados.",
    estado: "en pie",
    existe: [
      { etiqueta: "VANGUARD LABS", ruta: "/labs", nota: "Quince simuladores en cinco familias, deterministas, con origen de cada variable y exportación." },
      { etiqueta: "El Estratega", ruta: "/escenarios", nota: "Escenarios de presión por teatro, nunca predicciones." },
      { etiqueta: "El Cruce", ruta: "/cruce", nota: "Dos teatros comparados por sus rasgos." },
      { etiqueta: "Teatro táctico", ruta: "/teatro-3d", nota: "Simulación espacial sobre terreno real." },
    ],
    falta: [
      "Simuladores de ecosistemas y cadenas alimenticias.",
      "Laboratorio de planificación urbana más allá del modelo agregado.",
      "Progreso de aprendizaje: la casa no recuerda lo que has explorado.",
    ],
    siguiente: "Un simulador de cadena trófica con la misma disciplina del laboratorio, conectado a /labs y a los datos del planeta.",
  },
  {
    n: 12,
    id: "visualizacion",
    nombre: "Estudio de visualización",
    mision: "Convertir datos complejos en experiencias comprensibles.",
    estado: "parcial",
    existe: [
      { etiqueta: "Observatorio visual", ruta: "/conocimiento?modo=estadisticas", nota: "SVG, tablas accesibles, selección de año y exportación CSV. No es todavía un sistema visual compartido para todo el producto." },
      { etiqueta: "Gráficos de series", nota: "src/components/labs/grafico-series.tsx: SVG propio con lectura al pasar el cursor, sin dependencias nuevas." },
      { etiqueta: "Mapa de laboratorio", nota: "src/components/labs/mapa-lab.tsx: retícula con trazo proporcional al dato." },
      { etiqueta: "Mapa de bloques", nota: "src/components/planeta/mapa-miembros.tsx: los miembros de cada organización sobre el mundo." },
      { etiqueta: "Comparador visual", ruta: "/comparador", nota: "Cuatro países y ocho indicadores en una sola tabla con puestos." },
    ],
    falta: [
      "Plantillas reutilizables fuera del laboratorio: cada gráfico nuevo se escribe desde cero.",
      "Exportación de la visualización como imagen o SVG suelto.",
      "Paneles con filtros temporales.",
    ],
    siguiente: "Extraer el gráfico de series a un componente compartido con exportación SVG, usado por el laboratorio y por las fichas de país.",
  },
  {
    n: 13,
    id: "multimedia",
    nombre: "Documental y multimedia",
    mision: "Que la casa no dependa solo del texto.",
    estado: "parcial",
    existe: [
      { etiqueta: "Galería", ruta: "/galeria", nota: "Fotografías reales del planeta con su crédito." },
      { etiqueta: "Audios", ruta: "/audios", nota: "Piezas sonoras de la casa." },
      { etiqueta: "Música", ruta: "/musica", nota: "La banda sonora propia." },
      { etiqueta: "La voz", ruta: "/voz", nota: "Lectura en voz alta del contenido." },
    ],
    falta: [
      "Reportajes multimedia con guion y estructura de historia.",
      "Colecciones audiovisuales con derechos y atribución explícita.",
      "Reproductores accesibles con subtítulos.",
    ],
    siguiente: "Un reportaje de contexto en formato largo con imágenes, mapa y gráfico en la misma página, y su crédito por pieza.",
  },
  {
    n: 14,
    id: "academia",
    nombre: "Academia",
    mision: "Transformar la información en aprendizaje organizado.",
    estado: "parcial",
    existe: [{ etiqueta: "Vanguard Academy", ruta: "/conocimiento/aprender", nota: "Cuatro rutas y doce actividades sobre expedientes existentes, corrección explicada, progreso local persistente y borrable. No emite certificados ni sincroniza cuentas." }],
    falta: ["Revisión pedagógica y ampliación de rutas y actividades.", "Sincronización optativa con cuenta, accesibilidad auditada y colecciones docentes."],
    siguiente: "Ampliar las actividades y probarlas con estudiantes y docentes antes de acreditar aprendizaje.",
  },
  {
    n: 15,
    id: "explicador",
    nombre: "Motor de explicaciones",
    mision: "Explicar temas complejos en varios niveles sin inventar.",
    estado: "parcial",
    existe: [{ etiqueta: "Explicador basado en expedientes", ruta: "/conocimiento/tema/pib", nota: "API /api/conocimiento/explicar?tema=pib&nivel=rapido o completo. Selecciona texto existente y conserva fuentes y límites; devuelve 404 sin inventar para un tema ausente." }],
    falta: ["Preguntas frecuentes y ejemplos curados por tema.", "Selector de nivel en todas las fichas y glosario contextual."],
    siguiente: "Añadir ejemplos revisados y selector de explicación a las fichas sin duplicar los artículos originales.",
  },
  {
    n: 16,
    id: "actualidad",
    nombre: "Investigación y actualidad",
    mision: "Mantener la casa conectada con lo que pasa.",
    estado: "en pie",
    existe: [
      { etiqueta: "En vivo", ruta: "/en-vivo", nota: "Cables entrando con hora y fuente." },
      { etiqueta: "Crónica del día", ruta: "/cronica", nota: "Qué pasó en las últimas 24 horas, teatro por teatro." },
      { etiqueta: "Conflictos", ruta: "/conflictos", nota: "Las regiones en seguimiento con su intensidad medida." },
      { etiqueta: "Guerra hoy", ruta: "/guerra-hoy", nota: "El resumen de los frentes abiertos." },
      { etiqueta: "El nexo titular→país", nota: "src/lib/nucleo/nexo.ts: de un titular a su ficha, su mapa y su simulador." },
    ],
    falta: [
      "Fichas de contexto por acontecimiento más allá del cable.",
      "Comparación de versiones y fuentes de una misma noticia.",
      "Registro público de correcciones.",
    ],
    siguiente: "Ficha de contexto por acontecimiento con comparación de fuentes y enlace a su antecedente histórico.",
  },
  {
    n: 17,
    id: "verificacion",
    nombre: "Fuentes y verificación",
    mision: "Que la confianza sea una característica de la plataforma.",
    estado: "parcial",
    existe: [
      { etiqueta: "Fuentes y límites del conocimiento", ruta: "/conocimiento?modo=fuentes", nota: "28 referencias seleccionadas, revisión editorial fechada y fallos de importación. No todas las referencias fueron verificadas individualmente." },
      { etiqueta: "La sala de la calidad", ruta: "/calidad", nota: "La casa auditada de punta a punta." },
      { etiqueta: "El catálogo de datos", ruta: "/datos", nota: "Procedencia, licencia y fecha de cada modelo de datos." },
      { etiqueta: "El sistema", ruta: "/sistema", nota: "Contratos, diagnóstico y estado de los servicios." },
      { etiqueta: "Los orígenes del laboratorio", ruta: "/labs", nota: "Cada variable declara si es dato real, supuesto o decisión del visitante." },
    ],
    falta: [
      "Registro de fuentes por publicación con historial de correcciones.",
      "Detección de contradicciones entre fichas.",
      "Política editorial y metodología pública en una sola página.",
    ],
    siguiente: "Una página de metodología pública que reúna las reglas ya escritas en el laboratorio y en el catálogo de datos.",
  },
  {
    n: 18,
    id: "descubrimiento",
    nombre: "Búsqueda, SEO y descubrimiento",
    mision: "Que el conocimiento se encuentre dentro y fuera.",
    estado: "en pie",
    existe: [
      { etiqueta: "Enciclopedia en el Núcleo", ruta: "/conocimiento", nota: "63 expedientes con rutas indexables, canonical, JSON-LD, sitemap y proveedor de búsqueda central." },
      { etiqueta: "El Núcleo", ruta: "/nucleo", nota: "Búsqueda global por módulo, ruta y tema." },
      { etiqueta: "El directorio", ruta: "/directorio", nota: "217 destinos con temas, favoritos y recientes." },
      { etiqueta: "Sitemap y llms.txt", nota: "Mapa para rastreadores y fichero de contexto para modelos, generados desde los registros." },
      { etiqueta: "La arquitectura", ruta: "/arquitectura", nota: "El mapa que dice qué existe, cómo se conecta y qué falta." },
    ],
    falta: [
      "Búsqueda por fecha y por persona dentro del archivo.",
      "Datos estructurados por ficha de país (hoy hay JSON-LD de sitio y de colección).",
      "Análisis de consultas reales: la casa no recibe datos de Search Console por API.",
    ],
    siguiente: "JSON-LD de tipo Place en las 249 fichas de país, con la misma cifra que muestra la página.",
  },
  {
    n: 19,
    id: "distribucion",
    nombre: "Contenido social y distribución",
    mision: "Convertir la investigación en piezas que viajen.",
    estado: "sin construir",
    existe: [],
    falta: [
      "Transformación de artículo en guion, carrusel y resumen.",
      "Plantillas gráficas propias.",
      "Calendario de publicaciones y archivo de campañas.",
    ],
    siguiente: "Una plantilla de resumen de artículo que genere un texto corto verificable, sin inventar métricas ni tendencias.",
  },
  {
    n: 20,
    id: "comunidad",
    nombre: "Comunidad y participación",
    mision: "Que la gente participe en el conocimiento con seguridad.",
    estado: "parcial",
    existe: [
      { etiqueta: "Lecturas y progreso local", ruta: "/conocimiento/aprender", nota: "Guardado de lecturas y progreso educativo en este navegador. Sin sincronización de cuenta ni datos enviados al servidor." },
      { etiqueta: "El perfil", ruta: "/perfil", nota: "Carnet, permisos y preferencias." },
      { etiqueta: "La Forja", ruta: "/creadores", nota: "Publicar mapas, escenarios e investigaciones." },
      { etiqueta: "Guardar en el espacio", nota: "Favoritos y colecciones en el navegador, sin enviar nada al servidor." },
      { etiqueta: "Los audios", ruta: "/audios", nota: "Piezas de la comunidad." },
    ],
    falta: [
      "Comentarios con moderación y aportaciones verificables.",
      "Reporte de errores con seguimiento.",
      "Normas comunitarias en una página pública.",
    ],
    siguiente: "Reporte de errores por página, con el dato señalado y sin salir de la ficha.",
  },
  {
    n: 21,
    id: "crecimiento",
    nombre: "Auditoría de crecimiento",
    mision: "Que la casa conozca su crecimiento real, sin inventarlo.",
    estado: "sin construir",
    existe: [{ etiqueta: "El diagnóstico técnico", ruta: "/sistema", nota: "Estado de servicios y endpoints: es salud del sistema, no audiencia." }],
    falta: [
      "Medición de visitantes, sesiones y recurrencia.",
      "Procedencia del tráfico y datos de Search Console.",
      "Persistencia, deduplicación y política de identificadores.",
    ],
    siguiente: "Un panel que declare «no disponible» cada métrica que la casa no mide, en vez de mostrar un número sin origen.",
  },
  {
    n: 22,
    id: "experiencia",
    nombre: "Experiencia e integración",
    mision: "Que la plataforma se sienta como una sola.",
    estado: "parcial",
    existe: [
      { etiqueta: "Navegación adaptativa", ruta: "/navegacion", nota: "Diez espacios de trabajo con las herramientas de cada oficio." },
      { etiqueta: "El directorio", ruta: "/directorio", nota: "Un solo índice buscable de todas las puertas." },
      { etiqueta: "La identidad", nota: "Zinc, ámbar y Orbitron en toda la casa; SVG propio y cero dependencias nuevas de interfaz." },
      { etiqueta: "El censo de puertas", ruta: "/arquitectura", nota: "Todas las páginas con sus referencias entrantes: la lista de lo que se descubre y lo que no." },
    ],
    falta: [
      "Pruebas de regresión visual entre versiones.",
      "Estados de carga y error unificados en todas las salas.",
      "Auditoría de accesibilidad sistemática (hoy se revisa a mano).",
    ],
    siguiente: "Un componente único de estado vacío y de error, usado por las salas nuevas y por el laboratorio.",
  },
];

/** Resumen honesto para la portada de /arquitectura. */
export function resumenDepartamentos() {
  const cuenta = { "en pie": 0, parcial: 0, "sin construir": 0 } as Record<EstadoDepartamento, number>;
  for (const d of DEPARTAMENTOS) cuenta[d.estado] += 1;
  return {
    total: DEPARTAMENTOS.length,
    ...cuenta,
    piezas: DEPARTAMENTOS.reduce((t, d) => t + d.existe.length, 0),
    faltantes: DEPARTAMENTOS.reduce((t, d) => t + d.falta.length, 0),
  };
}

// ───────────────────────────────────────────────────────────────────
// LOS CONTRATOS DE INTEGRACIÓN
//
// Las reglas que cualquier área nueva (de estos 22 departamentos o de los
// que vengan) tiene que cumplir para entrar en la casa sin romperla. No son
// recomendaciones: tools/arquitectura/probar.mjs comprueba las que se pueden
// comprobar desde el árbol.
// ───────────────────────────────────────────────────────────────────

export interface Contrato {
  n: number;
  titulo: string;
  regla: string;
  /** cómo se comprueba, si se puede comprobar desde el código */
  comprobacion: string;
}

export const CONTRATOS: Contrato[] = [
  {
    n: 1,
    titulo: "Una ruta por concepto",
    regla: "Un área nueva declara su puerta canónica y sus alias. Los alias siguen vivos, pero no compiten en el índice ni en el sitemap.",
    comprobacion: "El alias se registra en la tabla de fusiones de src/lib/navegacion/destinos.ts.",
  },
  {
    n: 2,
    titulo: "Registro antes que página",
    regla: "Ninguna ruta pública existe sin entrada en un registro (Núcleo, catálogo o el registro del área). La página lee del registro; el registro no se escribe a mano en la página.",
    comprobacion: "tools/arquitectura/probar.mjs cruza las rutas de los registros nuevos con el censo real de src/app.",
  },
  {
    n: 3,
    titulo: "Cada número, con su origen",
    regla: "Todo dato lleva fuente, fecha y sala donde comprobarlo. Si no existe, se escribe «sin dato»: no se estima para rellenar.",
    comprobacion: "Revisión por el contrato de datos del laboratorio (origen real, supuesto o elección) y por el catálogo de /datos.",
  },
  {
    n: 4,
    titulo: "Ningún modelo se presenta como predicción",
    regla: "El contenido que proyecta declara supuestos y límites antes de que el visitante toque un mando.",
    comprobacion: "Cada modelo de /labs se carga con sus listas de supuestos y límites no vacías.",
  },
  {
    n: 5,
    titulo: "Enlaces de ida y vuelta",
    regla: "Un área nueva enlaza a las que ya existían y pide a las existentes el enlace de vuelta. Sin callejones: toda página es alcanzable y toda página lleva a algo.",
    comprobacion: "El censo cuenta las referencias entrantes de cada página; /arquitectura publica las que tienen una sola.",
  },
  {
    n: 6,
    titulo: "El sitemap no se rellena",
    regla: "Solo entra en el sitemap lo que tiene contenido propio. Nada de páginas vacías, ni URLs por combinación de filtros, ni texto duplicado.",
    comprobacion: "Auditoría SEO de las rutas nuevas antes de cada envío: 0 con problemas, 0 con noindex.",
  },
  {
    n: 7,
    titulo: "Sin dependencias de interfaz nuevas",
    regla: "Gráficos, mapas e iconos se dibujan con SVG propio sobre las piezas que ya existen. Zinc, ámbar, Orbitron y mono son la identidad.",
    comprobacion: "Revisión de package.json: sin altas de dependencia para una función nueva.",
  },
  {
    n: 8,
    titulo: "Lo que no funciona, se dice",
    regla: "Una función con interfaz y sin motor no se marca como hecha: se marca «sin construir» hasta que devuelve un resultado real.",
    comprobacion: "Este registro: cada uno de los 22 departamentos declara su estado y sus piezas con ruta real.",
  },
];
