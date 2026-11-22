// ═══════════════════════════════════════════════════════════════════
// v439.4 · EL ATLAS DE PORTADAS — una portada única para cada módulo
//
// Mandato del Dueño:
//   «hay muchos módulos que les falta portadas hermosas con estilo único de
//    Vanguard, están en todos los lugares o imágenes 4K» y, al preguntarle:
//    «todo depende del módulo, la verdad; sorprende con cada módulo, uno
//    único, o sea todos».
//
// Así que esto no es una plantilla repetida: es un CENSO. Cada ruta de la casa
// tiene aquí su ficha con SU nombre, SU lema, SU tono (color), SU técnica de
// dibujo y SU glifo. De ahí salen 12 técnicas × 28 glifos × 92 tonos: no hay
// dos portadas iguales, y ninguna es una imagen genérica repetida.
//
// Los datos son puros (cero DOM, cero red): la prueba del atlas los recorre
// uno a uno en node.
// ═══════════════════════════════════════════════════════════════════

/** Las doce maneras de dibujar el fondo de una portada (components/portada/escena.tsx). */
export type Tecnica =
  | "ojo"
  | "orbita"
  | "reticula"
  | "onda"
  | "barras"
  | "constelacion"
  | "diana"
  | "espiral"
  | "curvas"
  | "red"
  | "prisma"
  | "sello";

/** El símbolo pequeño de la esquina: la firma de la sala. */
export type Glifo =
  | "ojo"
  | "mapa"
  | "sello"
  | "atomo"
  | "barras"
  | "libro"
  | "orbe"
  | "onda"
  | "lupa"
  | "uve"
  | "brújula"
  | "balanza"
  | "llave"
  | "torre"
  | "escudo"
  | "daga"
  | "corona"
  | "reloj"
  | "radio"
  | "camara"
  | "nota"
  | "red"
  | "dado"
  | "estrella"
  | "ancla"
  | "llama"
  | "rayo"
  | "cruz";

export type FichaPortada = {
  /** la ruta de la casa, sin barra final */
  ruta: string;
  nombre: string;
  lema: string;
  /** el color de la sala: 0-360 */
  tono: number;
  tecnica: Tecnica;
  glifo: Glifo;
  /**
   * true = la carcasa le pone la portada sola, porque la página no traía
   * héroe propio. Las salas con portada hecha a mano quedan en false hasta
   * que se rehagan con este marco (van por tandas, para no romper nada).
   */
  auto: boolean;
  /** fotografía de fondo, si la tiene. Se sirve desde /public/portadas. */
  imagen?: string;
};

/**
 * El censo. 93 rutas con página, 93 fichas: ni una sala sin nombre ni sin
 * color. Las palabras de los lemas son las de la casa, no relleno.
 * (/visita no lleva portada: es un redirect a la experiencia estática.)
 */
export const PORTADAS: FichaPortada[] = [
  { ruta: "academia", nombre: "La Academia", lema: "Lo que la casa enseña, ordenado para aprenderse", tono: 268, tecnica: "espiral", glifo: "corona", auto: true },
  { ruta: "archivo-mundial", nombre: "Archivo mundial", lema: "El papel de cada país, con su fecha y su fuente", tono: 34, tecnica: "reticula", glifo: "libro", auto: false },
  { ruta: "armeria", nombre: "La Armería", lema: "Qué se dispara, cuánto alcanza y quién lo tiene", tono: 6, tecnica: "prisma", glifo: "daga", auto: true },
  { ruta: "arquitectura", nombre: "Arquitectura", lema: "Cómo está hecha la casa por dentro", tono: 198, tecnica: "reticula", glifo: "torre", auto: true },
  { ruta: "atlas", nombre: "El Atlas", lema: "El mundo dibujado, capa por capa", tono: 168, tecnica: "curvas", glifo: "mapa", auto: false },
  { ruta: "audios", nombre: "Audios", lema: "La voz de la casa, para escuchar sin mirar", tono: 288, tecnica: "onda", glifo: "nota", auto: false },
  { ruta: "buscar", nombre: "Buscar", lema: "Una sola puerta para todo lo que guarda Vanguard", tono: 46, tecnica: "diana", glifo: "lupa", auto: true },
  { ruta: "calidad", nombre: "Calidad", lema: "Cuántas pruebas pasan, dichas sin adorno", tono: 152, tecnica: "barras", glifo: "balanza", auto: true },
  { ruta: "catalogo", nombre: "El Catálogo", lema: "Todo lo que la casa sabe hacer, en fichas", tono: 24, tecnica: "red", glifo: "libro", auto: false },
  { ruta: "centinela", nombre: "Centinela", lema: "Lo que se mueve en el mundo y no debe pasar inadvertido", tono: 12, tecnica: "ojo", glifo: "ojo", auto: false },
  { ruta: "ciencia", nombre: "Ciencia", lema: "Del paper al dato: lo comprobado y lo que aún no", tono: 186, tecnica: "orbita", glifo: "atomo", auto: true, imagen: "/portadas/ciencia.jpg" },
  { ruta: "clasico", nombre: "El Clásico", lema: "La casa de siempre, para quien llega con prisa", tono: 38, tecnica: "sello", glifo: "corona", auto: false },
  { ruta: "colecciones", nombre: "Colecciones", lema: "Lo que has guardado, ordenado como tú quieras", tono: 318, tecnica: "red", glifo: "llave", auto: true },
  { ruta: "comparador", nombre: "El Comparador", lema: "Dos países, cara a cara, sin opinión de nadie", tono: 206, tecnica: "barras", glifo: "balanza", auto: true },
  { ruta: "config", nombre: "Configuración", lema: "La casa como tú la quieres: voz, luz y movimiento", tono: 224, tecnica: "reticula", glifo: "llave", auto: true },
  { ruta: "conflicto", nombre: "El Conflicto", lema: "Un frente abierto, contado entero", tono: 356, tecnica: "curvas", glifo: "llama", auto: true },
  { ruta: "conflictos", nombre: "Conflictos", lema: "Todos los frentes del mundo, en una mesa", tono: 348, tecnica: "red", glifo: "escudo", auto: false },
  { ruta: "conocimiento", nombre: "El Conocimiento", lema: "La enciclopedia de la casa, con su procedencia", tono: 276, tecnica: "constelacion", glifo: "libro", auto: true },
  { ruta: "creadores", nombre: "Creadores", lema: "Quien construye Vanguard y qué dejó escrito", tono: 306, tecnica: "prisma", glifo: "corona", auto: true },
  { ruta: "cronica", nombre: "La Crónica", lema: "Lo que pasó, en orden y con memoria", tono: 30, tecnica: "curvas", glifo: "reloj", auto: false },
  { ruta: "cruce", nombre: "El Cruce", lema: "Dos hechos que nadie había puesto juntos", tono: 172, tecnica: "constelacion", glifo: "red", auto: false },
  { ruta: "cuaderno", nombre: "El Cuaderno", lema: "Tu libreta de campaña, guardada aquí", tono: 48, tecnica: "reticula", glifo: "libro", auto: false },
  { ruta: "cuartel", nombre: "El Cuartel", lema: "El juego de guerra de la casa, sin trampas", tono: 96, tecnica: "diana", glifo: "escudo", auto: false },
  { ruta: "datos", nombre: "Datos", lema: "Las cifras del mundo, con su fuente al lado", tono: 190, tecnica: "barras", glifo: "barras", auto: true, imagen: "/portadas/datos.jpg" },
  { ruta: "datos-mundiales", nombre: "Datos mundiales", lema: "Población, economía y territorio país por país", tono: 158, tecnica: "barras", glifo: "orbe", auto: true },
  { ruta: "demografia", nombre: "Demografía", lema: "Cuántos somos, dónde y hacia dónde vamos", tono: 262, tecnica: "curvas", glifo: "orbe", auto: true, imagen: "/portadas/demografia.jpg" },
  { ruta: "descubrir", nombre: "Descubrir", lema: "La sorpresa del día, elegida por la casa", tono: 44, tecnica: "constelacion", glifo: "estrella", auto: false },
  { ruta: "directorio", nombre: "El Directorio", lema: "Instituciones, bloques y quién responde de qué", tono: 212, tecnica: "red", glifo: "torre", auto: true },
  { ruta: "divisas", nombre: "Divisas", lema: "El dinero del mundo, cambio a cambio", tono: 138, tecnica: "barras", glifo: "balanza", auto: false },
  { ruta: "ecosistema", nombre: "Ecosistema", lema: "Cómo respira el planeta que habitamos", tono: 108, tecnica: "curvas", glifo: "llama", auto: true },
  { ruta: "editorial", nombre: "Editorial", lema: "Lo que la casa opina, y por qué se moja", tono: 342, tecnica: "sello", glifo: "libro", auto: false },
  { ruta: "en-vivo", nombre: "En vivo", lema: "Cables entrando ahora, con hora y fuente", tono: 8, tecnica: "onda", glifo: "rayo", auto: false },
  { ruta: "entrar", nombre: "Entrar", lema: "La puerta: tu nombre y tu llave", tono: 40, tecnica: "sello", glifo: "llave", auto: false },
  { ruta: "escenarios", nombre: "Escenarios", lema: "Qué pasaría si…, calculado y no soñado", tono: 232, tecnica: "orbita", glifo: "dado", auto: false },
  { ruta: "escudo", nombre: "El Escudo", lema: "Tu defensa en la casa: lo que te protege", tono: 84, tecnica: "diana", glifo: "escudo", auto: false },
  { ruta: "espacio", nombre: "El Espacio", lema: "Lo que hay ahí fuera, medido de verdad", tono: 246, tecnica: "constelacion", glifo: "estrella", auto: false },
  { ruta: "espia", nombre: "El Espía", lema: "La información que no se publica, ordenada", tono: 176, tecnica: "ojo", glifo: "ojo", auto: false },
  { ruta: "estado", nombre: "El Estado", lema: "Cómo está la casa ahora mismo, sin adornos", tono: 146, tecnica: "diana", glifo: "reloj", auto: false },
  { ruta: "galeria", nombre: "Galería", lema: "La fotografía real de lo que contamos", tono: 20, tecnica: "prisma", glifo: "camara", auto: true, imagen: "/portadas/galeria.jpg" },
  { ruta: "guerra-hoy", nombre: "Hoy", lema: "El parte de todos los frentes abiertos", tono: 0, tecnica: "curvas", glifo: "escudo", auto: false },
  { ruta: "herramientas", nombre: "Herramientas", lema: "Instrumentos de la casa para trabajar un dato", tono: 200, tecnica: "reticula", glifo: "rayo", auto: false },
  { ruta: "historia", nombre: "Historia", lema: "De dónde viene lo que pasa hoy", tono: 36, tecnica: "curvas", glifo: "sello", auto: false },
  { ruta: "informacion", nombre: "Información", lema: "Quién hace esto, con qué dinero y con qué reglas", tono: 218, tecnica: "reticula", glifo: "libro", auto: true },
  { ruta: "infraestructura", nombre: "Infraestructura", lema: "Puertos, cables, presas y carreteras del mundo", tono: 164, tecnica: "reticula", glifo: "torre", auto: true },
  { ruta: "inteligencia", nombre: "Inteligencia", lema: "Quién manda, qué mueve y qué esconde", tono: 190, tecnica: "ojo", glifo: "ojo", auto: true, imagen: "/portadas/inteligencia.jpg" },
  { ruta: "investigacion", nombre: "Investigación", lema: "De la pregunta al expediente, con pruebas", tono: 204, tecnica: "diana", glifo: "lupa", auto: true, imagen: "/portadas/investigacion.jpg" },
  { ruta: "labs", nombre: "Laboratorios", lema: "Lo que la casa prueba antes de enseñarlo", tono: 282, tecnica: "orbita", glifo: "atomo", auto: true },
  { ruta: "lingua", nombre: "Lingua", lema: "Las lenguas del mundo y cómo se cruzan", tono: 254, tecnica: "constelacion", glifo: "libro", auto: true },
  { ruta: "mapas", nombre: "Mapas", lema: "El terreno leído como se lee un plano", tono: 156, tecnica: "curvas", glifo: "mapa", auto: false },
  { ruta: "memoria", nombre: "Memoria", lema: "El archivo de la casa: lo dicho y lo hecho", tono: 40, tecnica: "espiral", glifo: "reloj", auto: true },
  { ruta: "mercado", nombre: "La feria de los agentes", lema: "Diez puestos, diez emblemas y todo lo que guarda la casa", tono: 42, tecnica: "sello", glifo: "uve", auto: false },
  { ruta: "mi-universo", nombre: "Mi universo", lema: "Tu rincón: lo que sigues y lo que te sigue", tono: 292, tecnica: "constelacion", glifo: "estrella", auto: false },
  { ruta: "mision", nombre: "La Misión", lema: "Para qué existe Vanguard, dicho en corto", tono: 46, tecnica: "diana", glifo: "estrella", auto: false },
  { ruta: "modo", nombre: "El Modo", lema: "Cómo quieres mirar: quieto, ligero o entero", tono: 226, tecnica: "reticula", glifo: "ojo", auto: false },
  { ruta: "modulos", nombre: "Los módulos", lema: "El índice de la casa: cuatro mundos y sus salas", tono: 254, tecnica: "red", glifo: "uve", auto: true },
  { ruta: "motores", nombre: "Motores", lema: "Lo que calcula la casa por detrás", tono: 174, tecnica: "espiral", glifo: "rayo", auto: true },
  { ruta: "mundo", nombre: "El Mundo", lema: "Dónde pasa y quién manda ahí", tono: 150, tecnica: "curvas", glifo: "orbe", auto: true },
  { ruta: "mundos", nombre: "Mundos", lema: "Tierras que no existen, con sus reglas escritas", tono: 312, tecnica: "orbita", glifo: "orbe", auto: false },
  { ruta: "musica", nombre: "Música", lema: "La casa que suena: piezas hechas aquí", tono: 296, tecnica: "onda", glifo: "nota", auto: false },
  { ruta: "navegacion", nombre: "Navegación", lema: "Cómo moverte por la casa sin perderte", tono: 194, tecnica: "red", glifo: "brújula", auto: false },
  { ruta: "novedades", nombre: "Novedades", lema: "Lo último que se encendió en Vanguard", tono: 52, tecnica: "constelacion", glifo: "estrella", auto: false },
  { ruta: "nucleo", nombre: "El Núcleo", lema: "El centro de la casa y sus contadores vivos", tono: 232, tecnica: "diana", glifo: "uve", auto: false },
  { ruta: "objetivos", nombre: "Objetivos", lema: "Lo que la casa se propuso y en qué va", tono: 132, tecnica: "diana", glifo: "estrella", auto: false },
  { ruta: "offline", nombre: "Sin conexión", lema: "La casa cuando se cae la red, sin disimular", tono: 216, tecnica: "onda", glifo: "rayo", auto: false },
  { ruta: "oportunidades", nombre: "Oportunidades", lema: "Lo que el mundo ofrece ahora y quién lo ofrece", tono: 122, tecnica: "red", glifo: "llave", auto: true },
  { ruta: "orden", nombre: "El Orden", lema: "Las reglas de la casa, escritas y aplicadas", tono: 44, tecnica: "sello", glifo: "balanza", auto: false },
  { ruta: "organizaciones", nombre: "Organizaciones", lema: "Bloques, alianzas y quién firma por ellos", tono: 208, tecnica: "red", glifo: "torre", auto: true },
  { ruta: "oscura", nombre: "La Sala Oscura", lema: "Lo que no se cuenta a la luz del día", tono: 268, tecnica: "ojo", glifo: "ojo", auto: false },
  { ruta: "perfil", nombre: "Tu perfil", lema: "Quién eres dentro de la casa", tono: 286, tecnica: "sello", glifo: "corona", auto: false },
  { ruta: "poder", nombre: "El Poder", lema: "Quién puede qué, medido y no opinado", tono: 348, tecnica: "diana", glifo: "corona", auto: false },
  { ruta: "privacidad", nombre: "Privacidad", lema: "Qué guardamos de ti (y qué no guardamos)", tono: 200, tecnica: "reticula", glifo: "llave", auto: false },
  { ruta: "pulso-mundial", nombre: "Pulso mundial", lema: "El latido del planeta, minuto a minuto", tono: 358, tecnica: "onda", glifo: "reloj", auto: false },
  { ruta: "radio", nombre: "Radio", lema: "La casa que habla: emisión y archivo de voz", tono: 292, tecnica: "onda", glifo: "radio", auto: true },
  { ruta: "rankings", nombre: "Rankings", lema: "Quién va delante y con qué se mide", tono: 48, tecnica: "barras", glifo: "barras", auto: true },
  { ruta: "regiones", nombre: "Regiones", lema: "El mundo en bloques que tienen sentido", tono: 160, tecnica: "curvas", glifo: "mapa", auto: true },
  { ruta: "resiliencia", nombre: "Resiliencia", lema: "Cómo aguanta cada país lo que le cae", tono: 100, tecnica: "red", glifo: "ancla", auto: false },
  { ruta: "rostros", nombre: "Rostros", lema: "Las caras que están detrás de las decisiones", tono: 26, tecnica: "prisma", glifo: "camara", auto: false },
  { ruta: "servicios", nombre: "Servicios", lema: "Lo que la casa te hace, dicho en claro", tono: 186, tecnica: "red", glifo: "llave", auto: false },
  { ruta: "sistema", nombre: "El Sistema", lema: "Las máquinas de la casa y cómo respiran", tono: 168, tecnica: "reticula", glifo: "rayo", auto: true },
  { ruta: "teatro-3d", nombre: "Teatro 3D", lema: "El mundo en tres dimensiones, para recorrerlo", tono: 240, tecnica: "orbita", glifo: "orbe", auto: false },
  { ruta: "tierra", nombre: "La Tierra", lema: "El planeta entero, con su terminador y su noche", tono: 148, tecnica: "orbita", glifo: "orbe", auto: false },
  { ruta: "torre", nombre: "La Torre", lema: "Sube y mira el mundo desde arriba", tono: 220, tecnica: "espiral", glifo: "torre", auto: false },
  { ruta: "traductor", nombre: "Traductor", lema: "Lo que dice el mundo en tu lengua", tono: 258, tecnica: "constelacion", glifo: "libro", auto: false },
  { ruta: "trailer", nombre: "El Tráiler", lema: "La casa en dos minutos, sin palabras de más", tono: 18, tecnica: "prisma", glifo: "camara", auto: true },
  { ruta: "universo", nombre: "El Universo", lema: "Todo lo que la casa abarca, de una mirada", tono: 248, tecnica: "constelacion", glifo: "estrella", auto: false },
  { ruta: "vanguard2", nombre: "Vanguard 2", lema: "El otro cuerpo de la casa", tono: 46, tecnica: "sello", glifo: "uve", auto: false },
  { ruta: "ver-guerra", nombre: "Ver la guerra", lema: "El frente como es, sin música de fondo", tono: 4, tecnica: "prisma", glifo: "llama", auto: false },
  { ruta: "verdad-cruda", nombre: "Verdad cruda", lema: "Lo que no conviene adornar, sin adornarlo", tono: 330, tecnica: "ojo", glifo: "ojo", auto: false },
  { ruta: "vertigo", nombre: "Vértigo", lema: "El torrente de la casa, en piezas cortas", tono: 300, tecnica: "onda", glifo: "rayo", auto: false },
  { ruta: "visita", nombre: "La Visita", lema: "El recorrido guiado que se abre en su propia ventana", tono: 66, tecnica: "sello", glifo: "brújula", auto: false },
  { ruta: "voz", nombre: "La Voz", lema: "La boca de la casa: personas, tonos y pausas", tono: 272, tecnica: "onda", glifo: "radio", auto: false },
  { ruta: "worlds", nombre: "Worlds", lema: "Los mundos, en su nombre de fuera", tono: 316, tecnica: "orbita", glifo: "orbe", auto: false },
  { ruta: "zona-cero", nombre: "Zona cero", lema: "El punto donde empezó todo", tono: 350, tecnica: "diana", glifo: "llama", auto: false },
];

/** La lista de técnicas que el dibujante sabe hacer, para la prueba. */
export const TECNICAS: Tecnica[] = [
  "ojo",
  "orbita",
  "reticula",
  "onda",
  "barras",
  "constelacion",
  "diana",
  "espiral",
  "curvas",
  "red",
  "prisma",
  "sello",
];

/** Los glifos que el dibujante sabe hacer. */
export const GLIFOS: Glifo[] = [
  "ojo",
  "mapa",
  "sello",
  "atomo",
  "barras",
  "libro",
  "orbe",
  "onda",
  "lupa",
  "uve",
  "brújula",
  "balanza",
  "llave",
  "torre",
  "escudo",
  "daga",
  "corona",
  "reloj",
  "radio",
  "camara",
  "nota",
  "red",
  "dado",
  "estrella",
  "ancla",
  "llama",
  "rayo",
  "cruz",
];

/**
 * La paleta de una sala, sacada de su tono. Tres colores y una tinta: la luz
 * de la portada, su sombra, el brillo de los filos y el fondo.
 */
export type Paleta = { luz: string; sombra: string; filo: string; fondo: string };

export function paleta(tono: number): Paleta {
  const t = ((Math.round(tono) % 360) + 360) % 360;
  return {
    luz: `hsl(${t} 82% 62%)`,
    sombra: `hsl(${(t + 26) % 360} 68% 34%)`,
    filo: `hsl(${(t + 12) % 360} 90% 82%)`,
    fondo: `hsl(${t} 42% 7%)`,
  };
}

/** Suma de caracteres con desplazamiento: la semilla estable de cada ruta. */
export function huella(texto: string): number {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** La ficha de una ruta (acepta rutas profundas: /regiones/europa → regiones). */
export function portadaDeRuta(ruta: string | null | undefined): FichaPortada | null {
  if (!ruta) return null;
  const limpia = ruta.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  if (limpia === "/") return null;
  const trozos = limpia.split("/").filter(Boolean);
  for (let i = trozos.length; i > 0; i--) {
    const clave = trozos.slice(0, i).join("/");
    const ficha = PORTADAS.find((p) => p.ruta === clave);
    if (ficha) return ficha;
  }
  return null;
}

/** Solo las que la carcasa pinta sola, por orden de censo. */
export function portadasAuto(): FichaPortada[] {
  return PORTADAS.filter((p) => p.auto);
}
