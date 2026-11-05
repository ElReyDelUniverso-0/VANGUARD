// ============================================================
// VANGUARD v170.0 «FICHAS DEL LINAJE» — CATÁLOGO Y MOTOR
// 52 fichas base en 4 categorías (ARMAS · GUERRAS · PERSONAJES
// · SÍMBOLOS) + fichas ÚNICAS 1/1 generadas por la semilla del
// agente. Cada ejemplar acuñado lleva un número de serie
// irrepetible dentro de su tirada mundial.
// ============================================================

export type RarezaFicha = "COMUN" | "RARO" | "EPICO" | "LEGENDARIO" | "MITICO" | "UNICO";
export type CategoriaFicha = "ARMAS" | "GUERRAS" | "PERSONAJES" | "SIMBOLOS";

export type TipoArte =
  | { tipo: "arma"; sub: "espada" | "lanza" | "daga" | "hacha" | "martillo" | "arco" | "escudo" | "guadana" | "cetro" | "guante" | "ballesta" }
  | { tipo: "busto"; sub: "capucha" | "corona" | "casco" | "cuernos" | "lobo" | "ojodios"; adorno?: "luna" | "espejo" | "brujula" | "tridente" | "yunque" | "ola" | "balanza" | "llama" | "hacha" | "espada" }
  | { tipo: "escena"; sub: "ejercito" | "muralla" | "puente" | "estandarte" | "asalto"; clima: "ceniza" | "nieve" | "lluvia" | "brasas" | "viento" }
  | { tipo: "simbolo"; sub: "ojo" | "espiral" | "tridente" | "sello" | "balanza" | "faro" | "reloj" | "serpiente" | "corona" | "umbral" | "prisma" | "llave" };

export interface DefFicha {
  id: string;
  nombre: string;
  categoria: CategoriaFicha;
  rareza: RarezaFicha;
  poder: number;
  elemento: string;
  lore: string;
  arte: TipoArte;
  paleta: string;
  acunacion: number; // ejemplares que existen en el mundo
}

export interface PaletaFicha {
  cieloA: string;
  cieloB: string;
  luz: string;
  mid: string;
  sombra: string;
}

export const PALETAS: Record<string, PaletaFicha> = {
  acero: { cieloA: "#10151d", cieloB: "#1c2531", luz: "#d7e3f0", mid: "#7e93ab", sombra: "#242c38" },
  fuego: { cieloA: "#1d0d08", cieloB: "#331610", luz: "#ffb066", mid: "#e2543a", sombra: "#3d1a12" },
  hielo: { cieloA: "#0a1620", cieloB: "#122a38", luz: "#bfeaff", mid: "#5fb6d9", sombra: "#16323f" },
  bosque: { cieloA: "#0a170e", cieloB: "#14301c", luz: "#a8e6b0", mid: "#4a9e5f", sombra: "#183a24" },
  sombra: { cieloA: "#0b0a12", cieloB: "#161226", luz: "#9d8cff", mid: "#5a4aa8", sombra: "#1d1830" },
  sol: { cieloA: "#1a1406", cieloB: "#33280b", luz: "#ffd977", mid: "#d9a53a", sombra: "#3a2c10" },
  estela: { cieloA: "#0d0a1a", cieloB: "#1d1633", luz: "#ffe9a8", mid: "#b99cff", sombra: "#241b40" },
  tormenta: { cieloA: "#0a1116", cieloB: "#13222c", luz: "#d6f4ff", mid: "#58c8e8", sombra: "#182b36" },
  vacio: { cieloA: "#08080c", cieloB: "#121019", luz: "#e8e4f5", mid: "#6d6480", sombra: "#191622" },
  marea: { cieloA: "#061418", cieloB: "#0c2a30", luz: "#9ff0e0", mid: "#3aa898", sombra: "#10343a" },
  ceniza: { cieloA: "#141210", cieloB: "#241f1c", luz: "#e8d8c8", mid: "#8a7a6a", sombra: "#2c2622" },
  rosa: { cieloA: "#1a0812", cieloB: "#301024", luz: "#ff9ecf", mid: "#d34a8a", sombra: "#38142a" },
  oro: { cieloA: "#1a1206", cieloB: "#33240c", luz: "#ffe9a8", mid: "#e0b84a", sombra: "#3a2a10" },
  vidrio: { cieloA: "#0a1214", cieloB: "#16323a", luz: "#ccf6ff", mid: "#6fd4d4", sombra: "#1a3c42" },
};

// ── Metadatos de rareza: marco, glow, peso de drop, fundición ─
export const RAREZA_META: Record<
  RarezaFicha,
  { etiqueta: string; color: string; marco: string; texto: string; glow: string; peso: number; fundicion: number; xp: number }
> = {
  COMUN: { etiqueta: "COMÚN", color: "#9aa7b8", marco: "linear-gradient(135deg,#8b96a8,#3a4250 45%,#a8b2c2)", texto: "text-slate-300", glow: "rgba(154,167,184,0.35)", peso: 56, fundicion: 8, xp: 2 },
  RARO: { etiqueta: "RARO", color: "#5fd4e8", marco: "linear-gradient(135deg,#59c8de,#1f5f74 45%,#8fe8f8)", texto: "text-cyan-300", glow: "rgba(95,212,232,0.45)", peso: 26, fundicion: 22, xp: 5 },
  EPICO: { etiqueta: "ÉPICO", color: "#b48cff", marco: "linear-gradient(135deg,#a678ff,#4a2d8f 45%,#d0b0ff)", texto: "text-violet-300", glow: "rgba(180,140,255,0.5)", peso: 12, fundicion: 60, xp: 12 },
  LEGENDARIO: { etiqueta: "LEGENDARIO", color: "#ffc94d", marco: "linear-gradient(135deg,#ffce5c,#8f6414 45%,#ffe9a8)", texto: "text-amber-300", glow: "rgba(255,201,77,0.55)", peso: 5, fundicion: 160, xp: 30 },
  MITICO: { etiqueta: "MÍTICO", color: "#ff6fb5", marco: "linear-gradient(135deg,#ff7cc0,#8f1f5e 45%,#ffb8dd)", texto: "text-pink-300", glow: "rgba(255,111,181,0.6)", peso: 1, fundicion: 420, xp: 80 },
  UNICO: { etiqueta: "ÚNICO 1/1", color: "#f4f6ff", marco: "linear-gradient(135deg,#ffffff,#c8ccd8 30%,#ffd9f0 55%,#c8f0ff 78%,#ffffff)", texto: "text-white", glow: "rgba(255,255,255,0.7)", peso: 0, fundicion: 0, xp: 150 },
};

export const ORDEN_RAREZA: RarezaFicha[] = ["COMUN", "RARO", "EPICO", "LEGENDARIO", "MITICO"];

export const CATEGORIA_META: Record<CategoriaFicha, { etiqueta: string; icono: string; color: string }> = {
  ARMAS: { etiqueta: "ARMAS", icono: "⚔", color: "#e8b04d" },
  GUERRAS: { etiqueta: "GUERRAS", icono: "🔥", color: "#e2543a" },
  PERSONAJES: { etiqueta: "PERSONAJES", icono: "👑", color: "#b48cff" },
  SIMBOLOS: { etiqueta: "SÍMBOLOS", icono: "✶", color: "#5fd4e8" },
};

export const ORDEN_CATEGORIAS: CategoriaFicha[] = ["ARMAS", "GUERRAS", "PERSONAJES", "SIMBOLOS"];

const ACUNACION: Record<RarezaFicha, number> = {
  COMUN: 2500,
  RARO: 900,
  EPICO: 300,
  LEGENDARIO: 100,
  MITICO: 25,
  UNICO: 1,
};

// ============================================================
// CATÁLOGO — 52 fichas originales de VANGUARD
// ============================================================
export const CATALOGO: DefFicha[] = [
  // ── ARMAS (14) ──────────────────────────────────────────────
  { id: "arma-espada-alba", nombre: "ESPADA DEL ALBA", categoria: "ARMAS", rareza: "COMUN", poder: 34, elemento: "ACERO", lore: "Forjada al primer rayo de sol. No brilla: espera.", arte: { tipo: "arma", sub: "espada" }, paleta: "acero", acunacion: ACUNACION.COMUN },
  { id: "arma-lanza-obsidiana", nombre: "LANZA DE OBSIDIANA", categoria: "ARMAS", rareza: "COMUN", poder: 38, elemento: "OBSIDIANA", lore: "Tallada en vidrio volcánico. Corta lo que el acero perdona.", arte: { tipo: "arma", sub: "lanza" }, paleta: "vacio", acunacion: ACUNACION.COMUN },
  { id: "arma-hacha-norte", nombre: "HACHA DEL NORTE", categoria: "ARMAS", rareza: "COMUN", poder: 41, elemento: "HIELO", lore: "Su filo nunca se derrite. Su dueño tampoco sabe por qué.", arte: { tipo: "arma", sub: "hacha" }, paleta: "hielo", acunacion: ACUNACION.COMUN },
  { id: "arma-arco-sauce", nombre: "ARCO DE SAÚZ", categoria: "ARMAS", rareza: "COMUN", poder: 33, elemento: "BOSQUE", lore: "Hecho de madera viva. La cuerda canta antes de disparar.", arte: { tipo: "arma", sub: "arco" }, paleta: "bosque", acunacion: ACUNACION.COMUN },
  { id: "arma-daga-sombra", nombre: "DAGA DE SOMBRA", categoria: "ARMAS", rareza: "RARO", poder: 52, elemento: "SOMBRA", lore: "No se guarda: se esconde. Aparece cuando menos conviene.", arte: { tipo: "arma", sub: "daga" }, paleta: "sombra", acunacion: ACUNACION.RARO },
  { id: "arma-escudo-solar", nombre: "ESCUDO SOLAR", categoria: "ARMAS", rareza: "RARO", poder: 55, elemento: "SOL", lore: "Refleja el mediodía entero en una sola embestida.", arte: { tipo: "arma", sub: "escudo" }, paleta: "sol", acunacion: ACUNACION.RARO },
  { id: "arma-martillo-bronce", nombre: "MARTILLO DE BRONCE", categoria: "ARMAS", rareza: "RARO", poder: 58, elemento: "BRONCE", lore: "Cada golpe suena a puerta que no volverá a abrirse.", arte: { tipo: "arma", sub: "martillo" }, paleta: "ceniza", acunacion: ACUNACION.RARO },
  { id: "arma-ballesta-centinela", nombre: "BALLESTA DEL CENTINELA", categoria: "ARMAS", rareza: "RARO", poder: 57, elemento: "ACERO", lore: "Cargada desde hace cien años. Nunca falló el turno.", arte: { tipo: "arma", sub: "ballesta" }, paleta: "acero", acunacion: ACUNACION.RARO },
  { id: "arma-guadana-ceniza", nombre: "GUADAÑA DE CENIZA", categoria: "ARMAS", rareza: "EPICO", poder: 71, elemento: "CENIZA", lore: "Siega campos que ya no existen. Aún pide permiso.", arte: { tipo: "arma", sub: "guadana" }, paleta: "ceniza", acunacion: ACUNACION.EPICO },
  { id: "arma-cetro-mareas", nombre: "CETRO DE MAREAS", categoria: "ARMAS", rareza: "EPICO", poder: 68, elemento: "MAREA", lore: "Sube y baja con la luna. Ahogó a un rey sin mojarse.", arte: { tipo: "arma", sub: "cetro" }, paleta: "marea", acunacion: ACUNACION.EPICO },
  { id: "arma-guante-fuego", nombre: "GUANTE DE FUEGO", categoria: "ARMAS", rareza: "EPICO", poder: 66, elemento: "FUEGO", lore: "El puño se cierra y el invierno se disculpa.", arte: { tipo: "arma", sub: "guante" }, paleta: "fuego", acunacion: ACUNACION.EPICO },
  { id: "arma-filo-estelar", nombre: "FILO ESTELAR", categoria: "ARMAS", rareza: "LEGENDARIO", poder: 88, elemento: "ESTELA", lore: "Un fragmento de constelación con mango. Corta nombres, no cuerpos.", arte: { tipo: "arma", sub: "espada" }, paleta: "estela", acunacion: ACUNACION.LEGENDARIO },
  { id: "arma-lanza-cielos", nombre: "LA LANZA QUE PARTE CIELOS", categoria: "ARMAS", rareza: "MITICO", poder: 96, elemento: "TORMENTA", lore: "La única que partió el cielo en dos. Ambas mitades recuerdan.", arte: { tipo: "arma", sub: "lanza" }, paleta: "tormenta", acunacion: ACUNACION.MITICO },
  { id: "arma-espada-nadie", nombre: "LA ESPADA DE NADIE", categoria: "ARMAS", rareza: "MITICO", poder: 93, elemento: "VACÍO", lore: "Sin dueño, sin filo, sin historia. Y aun así, todos le temen.", arte: { tipo: "arma", sub: "espada" }, paleta: "vacio", acunacion: ACUNACION.MITICO },

  // ── GUERRAS (12) ────────────────────────────────────────────
  { id: "guerra-primera-piedra", nombre: "LA PRIMERA PIEDRA", categoria: "GUERRAS", rareza: "COMUN", poder: 32, elemento: "CENIZA", lore: "La primera que alguien lanzó. Todas las demás la imitan.", arte: { tipo: "escena", sub: "ejercito", clima: "ceniza" }, paleta: "ceniza", acunacion: ACUNACION.COMUN },
  { id: "guerra-puente-roto", nombre: "EL PUENTE ROTO", categoria: "GUERRAS", rareza: "COMUN", poder: 35, elemento: "MAREA", lore: "Se peleó por él veinte años. Nadie recuerda hacia dónde lleva.", arte: { tipo: "escena", sub: "puente", clima: "viento" }, paleta: "marea", acunacion: ACUNACION.COMUN },
  { id: "guerra-alba-rojo", nombre: "EL ALBA ROJO", categoria: "GUERRAS", rareza: "COMUN", poder: 36, elemento: "FUEGO", lore: "El amanecer que los veteranos todavía no miran de frente.", arte: { tipo: "escena", sub: "estandarte", clima: "brasas" }, paleta: "fuego", acunacion: ACUNACION.COMUN },
  { id: "guerra-sitio-bronce", nombre: "SITIO DE BRONCE", categoria: "GUERRAS", rareza: "COMUN", poder: 39, elemento: "BRONCE", lore: "Cien días de tambor. La ciudad se rindió por insomnio.", arte: { tipo: "escena", sub: "asalto", clima: "lluvia" }, paleta: "ceniza", acunacion: ACUNACION.COMUN },
  { id: "guerra-noche-larga", nombre: "LA NOCHE LARGA", categoria: "GUERRAS", rareza: "RARO", poder: 54, elemento: "SOMBRA", lore: "Duró lo que un invierno y pesó lo que tres.", arte: { tipo: "escena", sub: "muralla", clima: "lluvia" }, paleta: "sombra", acunacion: ACUNACION.RARO },
  { id: "guerra-sal", nombre: "LA GUERRA DE LA SAL", categoria: "GUERRAS", rareza: "RARO", poder: 57, elemento: "SAL", lore: "Se luchó por el agua y se perdió la sed.", arte: { tipo: "escena", sub: "puente", clima: "viento" }, paleta: "vidrio", acunacion: ACUNACION.RARO },
  { id: "guerra-hijos-tormenta", nombre: "LOS HIJOS DE LA TORMENTA", categoria: "GUERRAS", rareza: "EPICO", poder: 70, elemento: "TORMENTA", lore: "Llegaron con el rayo y se fueron con el trueno por bandera.", arte: { tipo: "escena", sub: "ejercito", clima: "lluvia" }, paleta: "tormenta", acunacion: ACUNACION.EPICO },
  { id: "guerra-ceniza-viva", nombre: "LA CENIZA VIVA", categoria: "GUERRAS", rareza: "EPICO", poder: 72, elemento: "CENIZA", lore: "El campo quedó tan caliente que la hierba aprendió a arder sola.", arte: { tipo: "escena", sub: "ejercito", clima: "brasas" }, paleta: "fuego", acunacion: ACUNACION.EPICO },
  { id: "guerra-mil-estandartes", nombre: "LOS MIL ESTANDARTES", categoria: "GUERRAS", rareza: "EPICO", poder: 75, elemento: "ORO", lore: "Cada estandarte prometía una victoria distinta. Todas mentían.", arte: { tipo: "escena", sub: "estandarte", clima: "viento" }, paleta: "oro", acunacion: ACUNACION.EPICO },
  { id: "guerra-invierno-sin-fin", nombre: "INVIERNO SIN FIN", categoria: "GUERRAS", rareza: "LEGENDARIO", poder: 86, elemento: "HIELO", lore: "La tregua se firmó en primavera. Nadie se atrevió a avisar.", arte: { tipo: "escena", sub: "muralla", clima: "nieve" }, paleta: "hielo", acunacion: ACUNACION.LEGENDARIO },
  { id: "guerra-ultima-muralia", nombre: "LA ÚLTIMA MURALLA", categoria: "GUERRAS", rareza: "LEGENDARIO", poder: 89, elemento: "HIERRO", lore: "La última pared entre todos y el ruido. Sigue en pie.", arte: { tipo: "escena", sub: "muralla", clima: "ceniza" }, paleta: "acero", acunacion: ACUNACION.LEGENDARIO },
  { id: "guerra-silencio", nombre: "LA GUERRA DEL SILENCIO", categoria: "GUERRAS", rareza: "MITICO", poder: 94, elemento: "VACÍO", lore: "La única guerra que se ganó sin pelearla. Nadie sabe quién cobró.", arte: { tipo: "escena", sub: "asalto", clima: "viento" }, paleta: "vacio", acunacion: ACUNACION.MITICO },

  // ── PERSONAJES (14) ─────────────────────────────────────────
  { id: "per-naufrago", nombre: "EL NÁUFRAGO", categoria: "PERSONAJES", rareza: "COMUN", poder: 31, elemento: "MAREA", lore: "Llega a la orilla de todas las historias. Nunca mojado del todo.", arte: { tipo: "busto", sub: "capucha", adorno: "ola" }, paleta: "marea", acunacion: ACUNACION.COMUN },
  { id: "per-herrera", nombre: "LA HERRERA", categoria: "PERSONAJES", rareza: "COMUN", poder: 34, elemento: "FUEGO", lore: "Pone el fuego del lado correcto de todas las espadas.", arte: { tipo: "busto", sub: "capucha", adorno: "yunque" }, paleta: "fuego", acunacion: ACUNACION.COMUN },
  { id: "per-centinela", nombre: "EL CENTINELA", categoria: "PERSONAJES", rareza: "COMUN", poder: 37, elemento: "ACERO", lore: "Vigila una puerta que ya no existe. Nadie le dijo.", arte: { tipo: "busto", sub: "casco", adorno: "espada" }, paleta: "acero", acunacion: ACUNACION.COMUN },
  { id: "per-general-ceniza", nombre: "LA GENERAL DE CENIZA", categoria: "PERSONAJES", rareza: "RARO", poder: 55, elemento: "CENIZA", lore: "Contó sus batallas con dedos ajenos. Le sobran.", arte: { tipo: "busto", sub: "casco", adorno: "hacha" }, paleta: "ceniza", acunacion: ACUNACION.RARO },
  { id: "per-cartografo", nombre: "EL CARTÓGRAFO", categoria: "PERSONAJES", rareza: "RARO", poder: 53, elemento: "NIEBLA", lore: "Dibuja mapas de lugares que piden ser encontrados.", arte: { tipo: "busto", sub: "capucha", adorno: "brujula" }, paleta: "estela", acunacion: ACUNACION.RARO },
  { id: "per-capitana-sal", nombre: "LA CAPITANA DE SAL", categoria: "PERSONAJES", rareza: "RARO", poder: 56, elemento: "SAL", lore: "Su nave le tiene miedo. Por eso obedece.", arte: { tipo: "busto", sub: "corona", adorno: "tridente" }, paleta: "vidrio", acunacion: ACUNACION.RARO },
  { id: "per-reina-cenizas", nombre: "REINA DE CENIZAS", categoria: "PERSONAJES", rareza: "EPICO", poder: 69, elemento: "CENIZA", lore: "Coronó con lo que quedó. Reinó con lo que sobró.", arte: { tipo: "busto", sub: "corona", adorno: "llama" }, paleta: "ceniza", acunacion: ACUNACION.EPICO },
  { id: "per-juez-hueso", nombre: "EL JUEZ DE HUESO", categoria: "PERSONAJES", rareza: "EPICO", poder: 66, elemento: "HUESO", lore: "Pesa las palabras con la balanza que no se mueve.", arte: { tipo: "busto", sub: "capucha", adorno: "balanza" }, paleta: "vidrio", acunacion: ACUNACION.EPICO },
  { id: "per-dama-espejos", nombre: "LA DAMA DE ESPEJOS", categoria: "PERSONAJES", rareza: "EPICO", poder: 67, elemento: "VIDRIO", lore: "Refleja a la gente mejor de lo que es. Nadie se queja.", arte: { tipo: "busto", sub: "corona", adorno: "espejo" }, paleta: "vidrio", acunacion: ACUNACION.EPICO },
  { id: "per-lobo-blanco", nombre: "LOBO BLANCO", categoria: "PERSONAJES", rareza: "EPICO", poder: 73, elemento: "HIELO", lore: "Aparece cuando la nieve decide quién vuelve a casa.", arte: { tipo: "busto", sub: "lobo" }, paleta: "hielo", acunacion: ACUNACION.EPICO },
  { id: "per-emperador-polvo", nombre: "EL EMPERADOR DE POLVO", categoria: "PERSONAJES", rareza: "LEGENDARIO", poder: 85, elemento: "ORO", lore: "Su imperio cabía en una mano. Todavía la cierra.", arte: { tipo: "busto", sub: "corona" }, paleta: "oro", acunacion: ACUNACION.LEGENDARIO },
  { id: "per-hermana-luna", nombre: "LA HERMANA DE LA LUNA", categoria: "PERSONAJES", rareza: "LEGENDARIO", poder: 84, elemento: "ESTELA", lore: "Cuenta a los que faltan. Nunca termina la lista.", arte: { tipo: "busto", sub: "capucha", adorno: "luna" }, paleta: "estela", acunacion: ACUNACION.LEGENDARIO },
  { id: "per-ojo-dios", nombre: "EL OJO DE DIOS", categoria: "PERSONAJES", rareza: "MITICO", poder: 97, elemento: "SOL", lore: "Todo lo vio. Por eso ya no mira.", arte: { tipo: "busto", sub: "ojodios" }, paleta: "sol", acunacion: ACUNACION.MITICO },
  { id: "per-nadie", nombre: "NADIE", categoria: "PERSONAJES", rareza: "MITICO", poder: 95, elemento: "VACÍO", lore: "Preguntaron por él en todas las puertas. Todas dijeron la verdad.", arte: { tipo: "busto", sub: "capucha" }, paleta: "vacio", acunacion: ACUNACION.MITICO },

  // ── SÍMBOLOS (12) ───────────────────────────────────────────
  { id: "sim-ojo", nombre: "EL OJO VIGILANTE", categoria: "SIMBOLOS", rareza: "COMUN", poder: 30, elemento: "SOL", lore: "Abre cuando alguien miente cerca.", arte: { tipo: "simbolo", sub: "ojo" }, paleta: "sol", acunacion: ACUNACION.COMUN },
  { id: "sim-espiral", nombre: "ESPIRAL ETERNA", categoria: "SIMBOLOS", rareza: "COMUN", poder: 33, elemento: "ESTELA", lore: "Gira desde antes del primer día. No molesta.", arte: { tipo: "simbolo", sub: "espiral" }, paleta: "estela", acunacion: ACUNACION.COMUN },
  { id: "sim-tridente", nombre: "EL TRIDENTE", categoria: "SIMBOLOS", rareza: "COMUN", poder: 36, elemento: "MAREA", lore: "Marca lo que la mar reclama. La mar no negocia.", arte: { tipo: "simbolo", sub: "tridente" }, paleta: "marea", acunacion: ACUNACION.COMUN },
  { id: "sim-sello", nombre: "EL SELLO ROTO", categoria: "SIMBOLOS", rareza: "RARO", poder: 51, elemento: "BRONCE", lore: "Romperlo fue fácil. Entender qué guardaba, no.", arte: { tipo: "simbolo", sub: "sello" }, paleta: "ceniza", acunacion: ACUNACION.RARO },
  { id: "sim-faro", nombre: "EL FARO CIEGO", categoria: "SIMBOLOS", rareza: "RARO", poder: 54, elemento: "NIEBLA", lore: "Guía a los que se pierden de propósito.", arte: { tipo: "simbolo", sub: "faro" }, paleta: "estela", acunacion: ACUNACION.RARO },
  { id: "sim-balanza", nombre: "LA BALANZA INVERTIDA", categoria: "SIMBOLOS", rareza: "RARO", poder: 58, elemento: "HUESO", lore: "Invertida desde siempre. Aun así, acierta.", arte: { tipo: "simbolo", sub: "balanza" }, paleta: "vacio", acunacion: ACUNACION.RARO },
  { id: "sim-reloj", nombre: "EL RELOJ DE HUESO", categoria: "SIMBOLOS", rareza: "EPICO", poder: 66, elemento: "HUESO", lore: "Marca la hora exacta en que algo termina. Nunca la misma dos veces.", arte: { tipo: "simbolo", sub: "reloj" }, paleta: "vidrio", acunacion: ACUNACION.EPICO },
  { id: "sim-serpiente", nombre: "LA SERPIENTE DE VIDRIO", categoria: "SIMBOLOS", rareza: "EPICO", poder: 70, elemento: "VIDRIO", lore: "Hecha de vidrio soplado. Muerde solo reflejos.", arte: { tipo: "simbolo", sub: "serpiente" }, paleta: "vidrio", acunacion: ACUNACION.EPICO },
  { id: "sim-corona-espinas", nombre: "CORONA DE ESPINAS", categoria: "SIMBOLOS", rareza: "EPICO", poder: 71, elemento: "BOSQUE", lore: "Creció sola alrededor de un trono vacío.", arte: { tipo: "simbolo", sub: "corona" }, paleta: "bosque", acunacion: ACUNACION.EPICO },
  { id: "sim-llave", nombre: "LA LLAVE DE TODAS LAS PUERTAS", categoria: "SIMBOLOS", rareza: "LEGENDARIO", poder: 83, elemento: "ACERO", lore: "Abre todas las puertas menos una. Está aprendiendo.", arte: { tipo: "simbolo", sub: "llave" }, paleta: "acero", acunacion: ACUNACION.LEGENDARIO },
  { id: "sim-umbral", nombre: "EL UMBRAL", categoria: "SIMBOLOS", rareza: "LEGENDARIO", poder: 87, elemento: "VACÍO", lore: "No se cruza: se acepta.", arte: { tipo: "simbolo", sub: "umbral" }, paleta: "vacio", acunacion: ACUNACION.LEGENDARIO },
  { id: "sim-prisma", nombre: "EL PRISMA MADRE", categoria: "SIMBOLOS", rareza: "MITICO", poder: 98, elemento: "ESTELA", lore: "Por él entra la luz. De él salen los colores que mandan.", arte: { tipo: "simbolo", sub: "prisma" }, paleta: "rosa", acunacion: ACUNACION.MITICO },
];

export const FICHA_POR_ID: Record<string, DefFicha> = Object.fromEntries(CATALOGO.map((f) => [f.id, f]));

// ============================================================
// SOBRES — precio en mon ◉, piso de rareza garantizada
// ============================================================
export interface Sobre {
  id: string;
  nombre: string;
  precio: number;
  fichas: number;
  piso: RarezaFicha;
  color: string;
  borde: string;
  descripcion: string;
  diario?: boolean;
  unico?: boolean;
}

export const SOBRES: Sobre[] = [
  { id: "regalo", nombre: "REGALO DIARIO", precio: 0, fichas: 2, piso: "COMUN", color: "#4ade80", borde: "border-emerald-400/40", descripcion: "2 fichas gratis cada día. La lealtad se paga en ◉.", diario: true },
  { id: "recluta", nombre: "SOBRE RECLUTA", precio: 120, fichas: 3, piso: "RARO", color: "#5fd4e8", borde: "border-cyan-400/40", descripcion: "3 fichas · la última garantizada RARO o mejor." },
  { id: "noble", nombre: "SOBRE NOBLE", precio: 300, fichas: 3, piso: "EPICO", color: "#b48cff", borde: "border-violet-400/40", descripcion: "3 fichas · la última garantizada ÉPICO o mejor." },
  { id: "linaje", nombre: "SOBRE LINAJE", precio: 750, fichas: 4, piso: "LEGENDARIO", color: "#ffc94d", borde: "border-amber-400/40", descripcion: "4 fichas · la última garantizada LEGENDARIA o mejor." },
  { id: "unico", nombre: "SOBRE ÚNICO", precio: 2000, fichas: 1, piso: "UNICO", color: "#f4f6ff", borde: "border-white/50", descripcion: "1 ficha 1/1: única en el mundo. No hay segunda copia.", unico: true },
];

// ============================================================
// INSTANCIAS Y ESTADO — cada ejemplar es irrepetible
// ============================================================
export interface FichaInstancia {
  uid: string;
  fichaId: string;
  serial: number; // Nº dentro de la tirada mundial
  ts: number;
  origen: string; // id del sobre que la acuñó
}

export interface EstadoFichas {
  version: string;
  semilla: string; // semilla del agente: genera sus fichas ÚNICAS 1/1
  inventario: FichaInstancia[];
  seriales: Record<string, number[]>;
  sobresAbiertos: number;
  regaloDia: string;
  unicas: number;
  // ── v170.2 «GLORIA» — presunción, exclusividad, adicción ──
  vitrina: string[]; // uids de hasta 3 fichas exhibidas
  tituloEquipado: string | null;
  pity: number; // sobres sin LEGENDARIA+ consecutivos
  rachaSobres: number; // días consecutivos reclamando el regalo
  misionesDia: string;
  misionesProgreso: Record<string, number>;
  misionesReclamadas: Record<string, boolean>;
  presumidas: number;
}

// piedad: a la PIEDAD_LEGENDARIA.ª tirada sin leyenda, la siguiente la garantiza
export const PIEDAD_LEGENDARIA = 6;

export function estadoInicialFichas(): EstadoFichas {
  return {
    version: "v170.2",
    semilla: Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10),
    inventario: [],
    seriales: {},
    sobresAbiertos: 0,
    regaloDia: "",
    unicas: 0,
    vitrina: [],
    tituloEquipado: null,
    pity: 0,
    rachaSobres: 0,
    misionesDia: "",
    misionesProgreso: {},
    misionesReclamadas: {},
    presumidas: 0,
  };
}

// ── Utilidades de azar determinista ─────────────────────────
export function hashSemilla(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rngDesde(semilla: number): () => number {
  let a = semilla;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const azar = (n: number): number => Math.floor(Math.random() * n);

function elegirRaridad(piso?: RarezaFicha): RarezaFicha {
  const desde = piso && piso !== "UNICO" ? ORDEN_RAREZA.indexOf(piso) : 0;
  const lista = ORDEN_RAREZA.slice(Math.max(desde, 0));
  const total = lista.reduce((s, r) => s + RAREZA_META[r].peso, 0);
  let x = Math.random() * total;
  for (const r of lista) {
    x -= RAREZA_META[r].peso;
    if (x <= 0) return r;
  }
  return lista[0];
}

export function tirarSobre(sobre: Sobre, forzarPiso?: RarezaFicha): DefFicha[] {
  const salida: DefFicha[] = [];
  for (let i = 0; i < sobre.fichas; i++) {
    const pisoForzado = forzarPiso && i === sobre.fichas - 1 ? forzarPiso : undefined;
    const piso = pisoForzado ?? (i === sobre.fichas - 1 ? sobre.piso : undefined);
    const rareza = sobre.unico ? "UNICO" : elegirRaridad(piso);
    if (rareza === "UNICO") {
      salida.push(FICHA_POR_ID["sim-prisma"]); // marcador: el store genera la ÚNICA real
      continue;
    }
    const candidatos = CATALOGO.filter((f) => f.rareza === rareza);
    salida.push(candidatos[azar(candidatos.length)]);
  }
  return salida;
}

// ============================================================
// FICHAS ÚNICAS 1/1 — deterministas por semilla del agente
// ============================================================
const ROMANOS = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX"];

const UNICA_FORMA: { palabra: string; arte: TipoArte }[] = [
  { palabra: "CETRO", arte: { tipo: "arma", sub: "cetro" } },
  { palabra: "FILO", arte: { tipo: "arma", sub: "espada" } },
  { palabra: "EMBLEMA", arte: { tipo: "simbolo", sub: "sello" } },
  { palabra: "SIGNO", arte: { tipo: "simbolo", sub: "ojo" } },
  { palabra: "ESTANDARTE", arte: { tipo: "escena", sub: "estandarte", clima: "viento" } },
  { palabra: "LLAVE", arte: { tipo: "simbolo", sub: "llave" } },
  { palabra: "ESPADA", arte: { tipo: "arma", sub: "espada" } },
  { palabra: "CORONA", arte: { tipo: "simbolo", sub: "corona" } },
  { palabra: "OJO", arte: { tipo: "simbolo", sub: "ojo" } },
  { palabra: "UMBRAL", arte: { tipo: "simbolo", sub: "umbral" } },
  { palabra: "BALLESTA", arte: { tipo: "arma", sub: "ballesta" } },
  { palabra: "PRISMA", arte: { tipo: "simbolo", sub: "prisma" } },
];

const UNICA_EPITETO = [
  "DEL UMBRAL", "DE LA NIEBLA", "DEL VACÍO", "DE SAL", "DEL ALBA", "DE CENIZA", "DE LA TORMENTA",
  "DE HUESO", "DE VIDRIO", "DEL SILENCIO", "DE LA AURORA", "DEL ABISMO", "DE BRONCE", "DE LA MAR",
  "DE LA CENIZA VIVA", "DEL NOVENO DÍA", "DE LA ÚLTIMA MURALLA", "DE LAS MIL LUNAS",
];

const UNICA_ELEMENTO = ["SOMBRA", "ESTELA", "TORMENTA", "VACÍO", "AURORA", "ORO", "CENIZA", "VIDRIO", "SAL", "NIEBLA"];
const UNICA_PALETA = ["estela", "vacio", "rosa", "oro", "tormenta", "sombra", "sol", "vidrio", "marea", "ceniza"];

export function generarFichaUnica(semillaJugador: string, indice: number): DefFicha {
  const rng = rngDesde(hashSemilla(`${semillaJugador}:unica:${indice}`));
  const forma = UNICA_FORMA[Math.floor(rng() * UNICA_FORMA.length)];
  const epiteto = UNICA_EPITETO[Math.floor(rng() * UNICA_EPITETO.length)];
  const elemento = UNICA_ELEMENTO[Math.floor(rng() * UNICA_ELEMENTO.length)];
  const paleta = UNICA_PALETA[Math.floor(rng() * UNICA_PALETA.length)];
  const romano = ROMANOS[Math.min(indice, ROMANOS.length - 1)] || `X${indice}`;
  const poder = 91 + Math.floor(rng() * 9);
  return {
    id: `unica-${indice}`,
    nombre: `${romano} · ${forma.palabra} ${epiteto}`,
    categoria: "SIMBOLOS",
    rareza: "UNICO",
    poder,
    elemento,
    lore: "Ejemplar ÚNICO: acuñado una sola vez para este agente. No existe segunda copia en ningún lugar del mundo.",
    arte: forma.arte,
    paleta,
    acunacion: 1,
  };
}

export function defDeFicha(fichaId: string, estado: Pick<EstadoFichas, "semilla">): DefFicha | undefined {
  if (fichaId.startsWith("unica-")) {
    const indice = parseInt(fichaId.slice(6), 10);
    return Number.isFinite(indice) ? generarFichaUnica(estado.semilla, indice) : undefined;
  }
  return FICHA_POR_ID[fichaId];
}

// ── Conteo de ejemplares por ficha (para duplicadas y álbum) ─
export function conteoInventario(inventario: FichaInstancia[]): Record<string, number> {
  const c: Record<string, number> = {};
  for (const i of inventario) c[i.fichaId] = (c[i.fichaId] ?? 0) + 1;
  return c;
}

// ── rareza LEGENDARIO o superior (para pity y celebraciones) ──
export function esLeyenda(r: RarezaFicha): boolean {
  return r === "LEGENDARIO" || r === "MITICO" || r === "UNICO";
}

// duplicadas fundibles: copias más allá de la primera; las ÚNICAS nunca se funden
export function duplicadasFundibles(inventario: FichaInstancia[], estado: Pick<EstadoFichas, "semilla">): { uid: string; mon: number; xp: number }[] {
  const gastadas: Record<string, number> = {};
  const salida: { uid: string; mon: number; xp: number }[] = [];
  for (const inst of inventario) {
    gastadas[inst.fichaId] = (gastadas[inst.fichaId] ?? 0) + 1;
    if (gastadas[inst.fichaId] <= 1) continue;
    const def = defDeFicha(inst.fichaId, estado);
    if (!def) continue;
    const meta = RAREZA_META[def.rareza];
    if (meta.fundicion <= 0) continue;
    salida.push({ uid: inst.uid, mon: meta.fundicion, xp: meta.xp });
  }
  return salida;
}
