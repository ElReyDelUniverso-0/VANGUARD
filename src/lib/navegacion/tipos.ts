// ═══════════════════════════════════════════════════════════════════
// v405.10 · LOS TIPOS DE LA NAVEGACIÓN ADAPTATIVA
//
// La casa tenía seis navegaciones a la vez (la barra de pestañas del cuartel,
// el menú grande, la brújula de intenciones, los nueve módulos, las 20
// constelaciones y las puertas /sala/<clave>) y ninguna sabía en qué estaba
// trabajando el operador. Aquí se declara UNA cosa y solo una: qué es un
// destino, qué es una herramienta y qué es un espacio de trabajo.
//
// Nada de lo que había desaparece: los destinos se DERIVAN de las estructuras
// existentes (mapa-salas.ts, modulos.ts) y las herramientas se VALIDAN contra
// las rutas reales del repo (ver scripts de prueba).
// ═══════════════════════════════════════════════════════════════════

/** Los diez espacios de trabajo de la casa. Un espacio no es un menú: es el
 *  sitio donde viven las herramientas que sirven para lo que estás haciendo. */
export type ClaveEspacio =
  | "geo"        // geografía y territorio
  | "simular"    // teatros, escenarios, estrategia
  | "leer"       // la redacción y el archivo vivo
  | "investigar" // inteligencia y expedientes
  | "archivo"    // memoria: historia, catálogo, voz
  | "mercado"    // dinero: divisas, apuestas, colecciones
  | "crear"      // talleres y herramientas
  | "jugar"      // juego y progreso
  | "social"     // comunidad y perfil
  | "sistema"    // la casa por dentro
  | "miespacio"; // tu mesa: proyectos, sesiones e historial (v405.11)

/** De dónde sale cada destino: ninguna lista se escribe dos veces. */
export type OrigenDestino = "mapa-salas" | "modulos" | "constelaciones" | "rutas-vivas";

export type Destino = {
  /** identidad estable: "sala:mapa" · "ruta:/mapas" · "constelacion:geo" */
  id: string;
  tipo: "sala" | "ruta" | "constelacion";
  nombre: string;
  corto: string;
  /** de qué familia es: dos destinos con la misma familia son el mismo sitio */
  familia: string;
  sub: string;
  /** a dónde se va de verdad (href navegable, ya resuelto) */
  href: string;
  color?: string;
  espacio: ClaveEspacio;
  origen: OrigenDestino;
};

/** Una herramienta es un botón del espacio: siempre apunta a algo que existe. */
export type Herramienta = {
  id: string;
  nombre: string;
  /** href real; puede ser una ruta (/mapas) o una sala del cuartel (?sala=) */
  href: string;
  /** trazo del icono (lucide) — una sola palabra para no arrastrar el paquete */
  icono: string;
  desc: string;
  /** versión que la trajo, cuando la trajo una tanda concreta */
  desde?: string;
};

export type Espacio = {
  clave: ClaveEspacio;
  nombre: string;
  lema: string;
  /** hex de la casa para este espacio */
  color: string;
  icono: string;
  /** cómo se reconoce que el operador está en este espacio */
  detecta: {
    /** prefijos de ruta, sin barra final; "" solo vale para la portada */
    rutas: string[];
    /** claves de sala del cuartel (?sala=<clave>) y de sus puertas /sala/<clave> */
    salas: string[];
    /** ids de módulo (/modulo/<id>) que pertenecen a este espacio */
    modulos?: string[];
    /** claves de constelación (/constelacion/<clave>) de este espacio */
    constelaciones?: string[];
  };
  herramientas: Herramienta[];
  /** a dónde se puede saltar desde aquí sin perder el hilo */
  vecinos: ClaveEspacio[];
};

/** Una familia con más de una puerta: se declara el canónico y por qué. */
export type Fusion = {
  familia: string;
  canonico: Destino;
  alias: Destino[];
  motivo: string;
};

/** Cómo se detecta el contexto: ruta limpia + sala activa. */
export type Contexto = {
  ruta: string;
  sala: string | null;
  espacio: ClaveEspacio;
  /** espacios secundarios que también aplican (p. ej. /mapas es geo y datos) */
  secundarios: ClaveEspacio[];
  /** herramientas del espacio, ya ordenadas y filtradas por la configuración */
  herramientas: Herramienta[];
};
