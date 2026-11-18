// ============================================================
// v405.16 · LAS FAMILIAS DE MÓDULOS — lo que ya es UNA sola cosa
//
// EL DEFECTO, medido sobre el árbol real de la casa (main, 18-nov-2026):
// 73 rutas vivas, 434 componentes y 264 librerías. El censo del Núcleo conocía
// 39 módulos: la geografía entera (/mundos, /mapas, /mundo, /atlas, /poder,
// /divisas, /conflictos, /archivo-mundial…) no existía para el catálogo, y la
// misma función se ofrecía desde cuatro o cinco puertas sin que ninguna dijera
// cuál es la buena.
//
// Este archivo NO cierra nada (ley de la casa: la evolución es aditiva). Lo que
// hace es DECLARAR, con nombre y cifra, qué módulos son la misma cosa vista
// desde otro ángulo, cuál es la puerta canónica y qué papel cumple cada una.
// Con eso la casa deja de ser 73 herramientas sueltas y pasa a ser un mapa que
// se puede leer.
//
// Se pinta en /nucleo y se valida en scripts/pruebas-nucleo.mjs: cada ruta que
// aparezca aquí tiene que existir de verdad en src/app (la prueba lo vigila).
// ============================================================

/** Una pieza dentro de una familia: su ruta real y el papel que cumple. */
export interface PiezaFamilia {
  ruta: string;
  nombre: string;
  /** qué hace esta puerta y por qué no sobra */
  papel: string;
}

/** Una familia de módulos que responden a la misma pregunta. */
export interface FamiliaModulos {
  id: string;
  /** la pregunta que responde la familia, en palabras del lector */
  pregunta: string;
  /** la puerta canónica: por donde se entra primero */
  canonico: PiezaFamilia;
  /** las demás puertas: siguen abiertas, con su papel declarado */
  piezas: PiezaFamilia[];
  /** por qué es una sola cosa y no cinco herramientas */
  motivo: string;
  /** la cifra que lo demuestra (medida sobre la casa, no estimada) */
  cifra: string;
}

export const FAMILIAS_MODULO: FamiliaModulos[] = [
  {
    id: "familia-planeta",
    pregunta: "¿Cómo es este país y dónde queda?",
    canonico: {
      ruta: "/mundos",
      nombre: "El mapa de los mundos",
      papel: "El índice: 177 países con polígono real, doce medidas, fronteras y los 24 macroterritorios de la casa.",
    },
    piezas: [
      {
        ruta: "/mundos/[iso]",
        nombre: "La ficha del país",
        papel: "La ficha única de los 249 países: geografía, economía, política, cultura, historia y vecinos.",
      },
      {
        ruta: "/mapas",
        nombre: "El globo por capas",
        papel: "El mismo planeta en 3D con capas conmutables (población, PIB, renta, esperanza de vida…).",
      },
      {
        ruta: "/mundo",
        nombre: "El mundo vivo",
        papel: "El globo que respira: los nueve teatros con su peso de 24 h y su último cable.",
      },
      {
        ruta: "/atlas",
        nombre: "El atlas",
        papel: "La lectura larga: capital, gobierno, líder y el dato estratégico de cada nación.",
      },
      {
        ruta: "/poder",
        nombre: "El poder",
        papel: "La misma geografía medida en poder militar y gasto (Banco Mundial, con su año).",
      },
      {
        ruta: "/divisas",
        nombre: "Las divisas",
        papel: "La moneda de cada país frente al tablero: la cara económica del mismo censo.",
      },
    ],
    motivo:
      "Seis puertas abiertas sobre el mismo planeta y ninguna decía cuál abrir. No se cierra ninguna: se declara que /mundos es el índice y que las otras cinco son lecturas de la misma tabla (geo-paises une las cinco por identidad ISO).",
    cifra: "6 puertas · 1 planeta · 249 fichas",
  },
  {
    id: "familia-redaccion",
    pregunta: "¿Qué está pasando ahora?",
    canonico: {
      ruta: "/en-vivo",
      nombre: "El pulso · en vivo",
      papel: "La redacción abierta 24 h: cables reales con hora, fuente y sello de exactitud.",
    },
    piezas: [
      {
        ruta: "/vertigo",
        nombre: "El vértigo",
        papel: "El mismo archivo, en feed infinito a pantalla completa: otra forma de leer, no otra redacción.",
      },
      {
        ruta: "/guerra-hoy",
        nombre: "Guerra hoy",
        papel: "El mismo archivo filtrado por el Ojo de Dios: el planeta vigilado, no un archivo distinto.",
      },
      {
        ruta: "/archivo-mundial",
        nombre: "El archivo mundial",
        papel: "El mismo archivo ordenado por geografía, para quien busca un país y no una hora.",
      },
      {
        ruta: "/noticia/[id]",
        nombre: "La puerta del cable",
        papel: "Cada cable con su propia página (JSON-LD NewsArticle): la entrada desde Google.",
      },
      {
        ruta: "/oscura",
        nombre: "El expediente oscuro",
        papel: "La otra redacción: archivo de expedientes documentados, no cables del día.",
      },
    ],
    motivo:
      "Cinco puertas que sirven la MISMA tabla NewsItem con distinto orden. Un cable que entra por /noticia aparece en /en-vivo, /vertigo y /archivo-mundial; antes no había ni un enlace entre ellas.",
    cifra: "5 puertas · 1 archivo · 1 tabla (NewsItem)",
  },
  {
    id: "familia-simulacion",
    pregunta: "¿Qué pasaría si…?",
    canonico: {
      ruta: "/teatro-3d",
      nombre: "El teatro global 3D",
      papel: "La mesa de guerra: teatros reales, arcos de misiles y aeronaves; el simulador con coordenadas de la casa.",
    },
    piezas: [
      {
        ruta: "/ver-guerra",
        nombre: "La sala de guerra",
        papel: "El parque militar: las unidades y modelos reales que alimentan la simulación.",
      },
      {
        ruta: "/zona-cero",
        nombre: "Zona cero",
        papel: "El asedio: cuatro frentes simultáneos con la simulación de unidades (zc3d-engine).",
      },
      {
        ruta: "/escenarios",
        nombre: "Los escenarios",
        papel: "El «qué pasa si» con piezas reales: el escenario, no la batalla.",
      },
      {
        ruta: "/objetivos",
        nombre: "Los objetivos",
        papel: "La capa de misión: qué se juega y qué se cumple, sobre el mismo estado de juego.",
      },
      {
        ruta: "/armeria",
        nombre: "La armería",
        papel: "El catálogo de material: la munición de la simulación, con sus fichas.",
      },
    ],
    motivo:
      "Cinco salas que parecían cinco juegos distintos. Comparten estado (game-store) y ahora comparten puerta: desde la ficha de cualquier país se entra al simulador con sus coordenadas reales (v405.12) y desde aquí se vuelve al país.",
    cifra: "5 salas · 1 estado de juego · 249 países simulables",
  },
  {
    id: "familia-personas",
    pregunta: "¿Quién manda y quién lo cuenta?",
    canonico: {
      ruta: "/rostros",
      nombre: "Rostros del poder",
      papel: "Quién manda en cada país y desde qué sede, con la fuente a la vista.",
    },
    piezas: [
      {
        ruta: "/espia",
        nombre: "El espía",
        papel: "El mismo censo de personas leído como tablero de inteligencia.",
      },
      {
        ruta: "/creadores",
        nombre: "Los creadores",
        papel: "La otra cara: la comunidad que produce, no los gobernantes.",
      },
      {
        ruta: "/perfil",
        nombre: "El perfil",
        papel: "Tu ficha como jugador: el mismo sistema de identidad, del lado de casa.",
      },
    ],
    motivo:
      "Tres miradas sobre «quién es quién»: las personas del planeta, tu agente y la comunidad. Comparten la identidad de la casa; no se fusionan porque una es dato público y otra es cuenta.",
    cifra: "3 puertas · 1 censo de personas",
  },
  {
    id: "familia-conocimiento",
    pregunta: "¿Dónde encuentro todo lo que hay?",
    canonico: {
      ruta: "/nucleo",
      nombre: "El núcleo",
      papel: "El salón central: censo de módulos, búsqueda global, fichas de entidad y frontera de datos.",
    },
    piezas: [
      {
        ruta: "/catalogo",
        nombre: "El catálogo real",
        papel: "El inventario contado: cuántos destinos, herramientas y fusiones tiene la casa.",
      },
      {
        ruta: "/modulos",
        nombre: "Los módulos",
        papel: "La puerta rápida al censo, sin la búsqueda.",
      },
      {
        ruta: "/herramientas",
        nombre: "Las herramientas",
        papel: "Lo que se puede HACER (calculadoras, traductores, tableros), no lo que se puede leer.",
      },
      {
        ruta: "/espacio",
        nombre: "Mi espacio",
        papel: "Donde lo encontrado se convierte en proyecto: la mesa de trabajo.",
      },
      {
        ruta: "/navegacion",
        nombre: "La navegación",
        papel: "El mapa de las salas y sus transiciones: cómo se mueve uno por la casa.",
      },
      {
        ruta: "/editorial",
        nombre: "La editorial",
        papel: "Lo que la casa escribe de sí misma: artículos con fecha y área.",
      },
    ],
    motivo:
      "Seis puertas para «¿qué hay aquí?». El núcleo es el índice (censo + búsqueda + fichas); las otras cinco son vistas del mismo inventario y ahora se enlazan entre sí por los chips contextuales.",
    cifra: "6 puertas · 1 censo · búsqueda global única",
  },
  {
    id: "familia-cuartel",
    pregunta: "¿Dónde está todo dentro de la app?",
    canonico: {
      ruta: "/cuartel",
      nombre: "El cuartel",
      papel: "La casa entera en una pantalla: las 155 salas, con paneles y estado en vivo.",
    },
    piezas: [
      {
        ruta: "/",
        nombre: "La portada",
        papel: "La puerta de calle: la portada editorial con lo más caliente del planeta.",
      },
      {
        ruta: "/vanguard2",
        nombre: "Vanguard 2",
        papel: "La vista espejo de la app (147 secciones) para quien quiere el árbol completo.",
      },
      {
        ruta: "/clasico",
        nombre: "El clásico",
        papel: "La casa de siempre, sin capas nuevas: lo que ya funcionaba no se tira.",
      },
      {
        ruta: "/sala/[clave]",
        nombre: "La puerta de cada sala",
        papel: "Cada sala con su página de servidor (sin JS) y su enlace canónico.",
      },
    ],
    motivo:
      "Cuatro formas de entrar a la misma casa. El cuartel es la app; la portada es el escaparate; /vanguard2 y /clasico son las dos vistas históricas que la casa conserva por ley. Ninguna se cierra.",
    cifra: "4 puertas · 1 casa · 155 salas",
  },
];

/** Todas las rutas declaradas en las familias (para las pruebas). */
export function rutasDeFamilias(): string[] {
  const rutas: string[] = [];
  for (const f of FAMILIAS_MODULO) {
    rutas.push(f.canonico.ruta);
    for (const p of f.piezas) rutas.push(p.ruta);
  }
  return [...new Set(rutas)];
}

/** La familia a la que pertenece una ruta (o null si vive sola). */
export function familiaDeRuta(ruta: string): FamiliaModulos | null {
  return (
    FAMILIAS_MODULO.find(
      (f) => f.canonico.ruta === ruta || f.piezas.some((p) => p.ruta === ruta)
    ) ?? null
  );
}

/** Las familias de las que forma parte un módulo del censo (por su ruta). */
export function familiasDeModulo(ruta: string): FamiliaModulos[] {
  return FAMILIAS_MODULO.filter(
    (f) => f.canonico.ruta === ruta || f.piezas.some((p) => p.ruta === ruta)
  );
}
