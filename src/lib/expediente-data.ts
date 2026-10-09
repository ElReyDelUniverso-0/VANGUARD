// v95.0 EXPEDIENTE TOTAL — EL CEREBRO CONECTOR DE VANGUARD
// "Busca el mundo. Comprende el conflicto. Explora sus escenarios."
// Unifica TODAS las entidades del mundo Vanguard (lugares, naciones, crisis,
// expedientes, teorías, armas, civilizaciones, documentos, papers y medios)
// en una sola red de conocimiento: GRAFO MUNDIAL (la red), EL ESPEJO (una
// crisis contada por seis salas: confirmado / omitido / en disputa) y
// MÁQUINA DEL TIEMPO (cronologías por fases + teatro del Karsk en vivo).
// 100% determinista, sin red y con contenido original de Vanguard. La capa
// REAL (archivo desclasificado + geografía real) va marcada como tal y la
// capa SIM (mundo Vanguard) se declara simulación en la interfaz.

import { LUGARES, type Lugar } from "./tierra-data";
import { EXPEDIENTES, type Expediente } from "./expedientes";
import { TEORIAS, ARMAS, CIVILIZACIONES, DOCS } from "./oscura-data";
import { PAPERS } from "./googles";
import { CANALES } from "./canales-data";

// ============================================================
// TIPOS
// ============================================================

export type TipoNodo =
  | "lugar" | "nacion" | "crisis" | "expediente" | "teoria"
  | "arma" | "civil" | "documento" | "paper" | "medio";

export type Capa = "SIM" | "REAL";

export interface NodoExp {
  id: string;
  tipo: TipoNodo;
  nombre: string;
  resumen: string;
  capa: Capa;
  region: string;
  lat?: number;
  lng?: number;
  acento: string;
  /** pestaña de Vanguard donde vive la versión completa */
  tab?: string;
  /** metadatos para la ficha de expediente */
  filas?: { etiqueta: string; valor: string }[];
}

export type TipoArista =
  | "conflicto" | "tension" | "alianza" | "tratado" | "comercio"
  | "ruta" | "cubren" | "estudia" | "misma-historia" | "sede" | "antecedente";

export const ARISTA_META: Record<TipoArista, { label: string; color: string }> = {
  conflicto:      { label: "conflicto",        color: "#FF3B30" },
  tension:        { label: "tensión",          color: "#FF8A3D" },
  alianza:        { label: "alianza",          color: "#3DDCFF" },
  tratado:        { label: "tratado",          color: "#FFD166" },
  comercio:       { label: "comercio",         color: "#9AE04D" },
  ruta:           { label: "ruta",             color: "#B48CFF" },
  cubren:         { label: "cubren",           color: "#4DFFC4" },
  estudia:        { label: "estudia",          color: "#7C8CFF" },
  "misma-historia": { label: "misma historia", color: "#FF6B4A" },
  sede:           { label: "sede / teatro",    color: "#FFC94D" },
  antecedente:    { label: "antecedente",      color: "#E8A54B" },
};

export interface AristaExp {
  a: string;
  b: string;
  tipo: TipoArista;
  nota?: string;
}

export const TIPO_META: Record<TipoNodo, { label: string; hex: string; tag: string }> = {
  lugar:      { label: "Lugar del planeta",        hex: "#FFB347", tag: "MAPA" },
  nacion:     { label: "Nación del dossier",       hex: "#3DDCFF", tag: "NACIÓN" },
  crisis:     { label: "Crisis en seguimiento",    hex: "#FF3B30", tag: "CRISIS" },
  expediente: { label: "Expediente desclasificado", hex: "#FF6B4A", tag: "ARCHIVO" },
  teoria:     { label: "Teoría con veredicto",     hex: "#B48CFF", tag: "OSCURO" },
  arma:       { label: "Arma que cambió todo",     hex: "#FFA24D", tag: "ARMAS" },
  civil:      { label: "Civilización perdida",     hex: "#FFD166", tag: "CIVIS" },
  documento:  { label: "Documento desclasificado", hex: "#E8A54B", tag: "DOCS" },
  paper:      { label: "Paper académico",          hex: "#F7E7C3", tag: "ACADÉMICO" },
  medio:      { label: "Medio / canal OSINT",      hex: "#4DFFC4", tag: "MEDIO" },
};

// helpers de id
export const lug = (id: string) => `lug:${id}`;
export const nac = (id: string) => `nac:${id}`;
export const cri = (id: string) => `cri:${id}`;
export const exp = (id: string) => `exp:${id}`;
export const teo = (id: string) => `teo:${id}`;
export const arm = (id: string) => `arm:${id}`;
export const civ = (id: string) => `civ:${id}`;
export const doc = (id: string) => `doc:${id}`;
export const arc = (id: string) => `arc:${id}`;
export const med = (id: string) => `med:${id}`;

// ============================================================
// NACIONES DEL DOSSIER MUNDIAL (10 — el mismo tablero de mundial-data)
// ============================================================

export interface NacionSeed {
  id: string; nombre: string; capital: string; region: string;
  poblacionM: number; lat: number; lng: number; acento: string; riesgo: number;
  resumen: string;
}

const NACIONES_SEED: NacionSeed[] = [
  { id: "nordica", nombre: "Federación Nórdica", capital: "Gradoval", region: "Europa Oriental / Báltico",
    poblacionM: 141.2, lat: 57.2, lng: 25.0, acento: "#FF6B4D", riesgo: 84,
    resumen: "Heredera de un imperio nuclear y primera potencia de escalada del tablero: doctrina de zonas tampón, economí­a de guerra y bases árticas que vigilan el Cabo Norte." },
  { id: "atlantica", nombre: "Unión Atlántica", capital: "Puerto Alba", region: "América del Norte / Atlántico",
    poblacionM: 335.4, lat: 40.0, lng: -77.0, acento: "#4DA6FF", riesgo: 58,
    resumen: "Liderazgo de la coalición occidental: once grupos de portaaviones, la red de bases más extensa del planeta y una doctrina que alterna contención y retirada cada comicio." },
  { id: "central", nombre: "Imperio Central", capital: "Ciudad Espejo", region: "Asia Oriental / Indo-Pacífico",
    poblacionM: 1410.0, lat: 32.0, lng: 110.0, acento: "#FFD23D", riesgo: 71,
    resumen: "La mayor población y el astillero que nadie iguala: reclama mares casi completos y teje un cinturón de puertos que rodea el Índico desafiando el orden atlántico." },
  { id: "donalto", nombre: "República del Donalto", capital: "Karskgrad", region: "Europa Oriental",
    poblacionM: 38.2, lat: 48.8, lng: 37.4, acento: "#3DDCFF", riesgo: 93,
    resumen: "El teatro principal de la guerra del Valle del Karsk: economí­a de trincheras, ferrocarriles militarizados y una diáspora que financia drones por suscripción." },
  { id: "ormuz", nombre: "Sultanato de Ormuz", capital: "Bandar Sable", region: "Medio Oriente",
    poblacionM: 89.6, lat: 30.0, lng: 53.0, acento: "#B48CFF", riesgo: 80,
    resumen: "Guardián del estrecho por el que pasa un quinto del crudo del planeta: lanchas enjambre, proxies costeros y poder de negociación que sube con la marea del Brent." },
  { id: "levante", nombre: "Confederación del Levante", capital: "Puerto Ceniza", region: "Medio Oriente",
    poblacionM: 12.4, lat: 33.9, lng: 35.5, acento: "#FF8A3D", riesgo: 88,
    resumen: "El país más pequeño del dossier y el más castigado: milicias, proxies externos y una población civil atrapada entre los tres. Cada alto el fuego se lee en cuatro capitales." },
  { id: "subcontinente", nombre: "Unión del Subcontinente", capital: "Yamunagar", region: "Asia Meridional",
    poblacionM: 1428.0, lat: 22.0, lng: 78.0, acento: "#9AE04D", riesgo: 63,
    resumen: "La democracia más poblada del mundo Vanguard compra a todos los bandos y no elige: su no alineamiento es doctrina y su marina crece para vigilar el Índico." },
  { id: "indus", nombre: "Estado del Indus", capital: "Raviabad", region: "Asia Meridional",
    poblacionM: 240.5, lat: 30.4, lng: 69.4, acento: "#4DFFC4", riesgo: 77,
    resumen: "Potencia nuclear de disuasión táctica: un estado dentro del estado y cada crisis que empieza en la Línea de Control y termina en la sala de crisis de Raviabad." },
  { id: "bosforo", nombre: "República del Bósforo", capital: "Estrecho Dorado", region: "Europa / Medio Oriente",
    poblacionM: 85.7, lat: 39.0, lng: 35.0, acento: "#FF6BC1", riesgo: 66,
    resumen: "Guardiana de los estrechos y mediadora oficial: vende drones a quien paga, cierra el paso a quien presiona y vive del equilibrio entre dos alianzas." },
  { id: "hermitano", nombre: "Reino Hermitano", capital: "Ciudad Juche", region: "Asia Oriental",
    poblacionM: 26.1, lat: 40.0, lng: 127.0, acento: "#FF4D4D", riesgo: 90,
    resumen: "El estado más cerrado del dossier prueba misiles como otros publican informes: ciclos de provocación y rebaja vigilados por seis señales orbitales." },
];

// ============================================================
// CRISIS EN SEGUIMIENTO (capa SIM — mundo Vanguard)
// ============================================================

export type EstadoHecho = "confirmado" | "disputado" | "investigacion";

export interface HechoCrisis {
  texto: string;
  estado: EstadoHecho;
}

export interface PerspectivaMedio {
  /** id del canal (canales-data) */
  medio: string;
  titular: string;
  /** índices de hechos que esta sala pone en portada */
  destaca: number[];
  /** índices de hechos que esta sala no menciona */
  omite: number[];
  /** índices de hechos que esta sala cuestiona abiertamente */
  disputa: number[];
  /** nota editorial de la Mesa de Verificación sobre esta sala */
  nota: string;
}

export interface PinTeatro {
  x: number; y: number; // lienzo 0-100
  tipo: "capital" | "frente" | "puerto" | "recurso";
  nombre: string;
}

export interface FaseCrisis {
  titulo: string;
  rango: string;
  tension: number; // 0-100
  eventos: string[];
  pins?: PinTeatro[];
}

export interface CrisisVG {
  id: string;
  nombre: string;
  region: string;
  capa: "SIM";
  resumen: string;
  /** ids de nodos actores (lug:, nac:...) */
  actores: string[];
  /** "karsk-vivo" usa el teatro determinista de frente-zonas-data; "fases" usa las fases autorizadas */
  modo: "karsk-vivo" | "fases";
  hechos: HechoCrisis[];
  perspectivas: PerspectivaMedio[];
  fases?: FaseCrisis[];
}

const KARSK_HECHOS: HechoCrisis[] = [
  { texto: "El odómetro de campaña registró el mayor movimiento semanal del frente desde la apertura del teatro.", estado: "confirmado" },
  { texto: "Al menos dos localidades del eje central cambiaron de control durante la madrugada.", estado: "disputado" },
  { texto: "Convoys con logística civil transportan material militar por el corredor sur.", estado: "disputado" },
  { texto: "La diáspora financia drones por suscripción desde cuatro continentes.", estado: "confirmado" },
  { texto: "La aviación de patrulla superó el umbral de actividad de la semana en tres jornadas.", estado: "confirmado" },
  { texto: "Un carguero con bandera neutral habría sido retenido en el corredor fluvial.", estado: "investigacion" },
];

const KARSK_PERSPECTIVAS: PerspectivaMedio[] = [
  { medio: "archivo", titular: "Día 41 del Valle: el odómetro anota el mayor movimiento semanal desde la apertura del frente",
    destaca: [0, 4], omite: [5], disputa: [],
    nota: "Análisis apoyado en imaginería de archivo y series del propio odómetro. No proyecta la semana siguiente: su prudencia es su firma." },
  { medio: "vigia", titular: "La imaginería del mediodía muestra al menos dos banderas distintas donde ayer había una",
    destaca: [1, 4], omite: [3], disputa: [5],
    nota: "Geolocalización seria y sombras coherentes. Omite el capítulo financiero de la diáspora: su lente es táctica, no económica." },
  { medio: "puente", titular: "El frente resiste: la línea aguanta el empuje en el eje norte según fuentes del estado mayor",
    destaca: [0], omite: [1, 3], disputa: [2],
    nota: "Canal institucional de línea oriental: prioriza la resistencia. Sus cifras de movimiento coinciden a medias con el odómetro." },
  { medio: "frontline", titular: "¡El corredor sur está CORTADO y el carguero retenido lo confirma!",
    destaca: [5, 2], omite: [0], disputa: [1, 4],
    nota: "Canal sin verificar: ninguna agencia mayor recoge el corte del corredor. El carguero es real, el 'corte' es suyo." },
  { medio: "gaviota", titular: "Tres imágenes, una sombra: lo que sí puede confirmarse del Valle hoy",
    destaca: [1, 4], omite: [3], disputa: [0],
    nota: "Método impecable, alcance corto: solo afirma lo que sus lectores geolocalizaron. Duda del propio odómetro por muestreo." },
  { medio: "laberinto", titular: "El movimiento del frente es real; la batalla decisiva que anuncia la tarde, no",
    destaca: [0, 4], omite: [3], disputa: [2, 5],
    nota: "Contrainformación elegante: desmonta titulares ajenos más de lo que aporta hechos propios. Útil como filtro, no como fuente." },
];

const VAND_HECHOS: HechoCrisis[] = [
  { texto: "Las primas de seguro marítimo del Estrecho de Vand subieron un 18% en dos semanas.", estado: "confirmado" },
  { texto: "Dos escoltas de la Liga Tarquinia y del Emirato de Sarn rozaron cascos cerca del faro Bruma.", estado: "disputado" },
  { texto: "Ambas flotas ejercitan en el mismo cuadrante por primera vez desde el acuerdo de 2019.", estado: "confirmado" },
  { texto: "Sarn habría ofrecido un corredor neutral a cambio de levantar la subasta de fletes.", estado: "investigacion" },
  { texto: "Tres compañías desviaron sus rutas por el pasaje largo del Índico oriental.", estado: "confirmado" },
  { texto: "Se ordenó a los cargueros con bandera neutral navegar en convoy nocturno.", estado: "disputado" },
];

const VAND_PERSPECTIVAS: PerspectivaMedio[] = [
  { medio: "archivo", titular: "Vand encarece el paso: las primas marítimas marcan máximo de dos años",
    destaca: [0, 4], omite: [3], disputa: [1],
    nota: "Lee la crisis en clave económica y de series. Ni una línea sobre la negociación en curso." },
  { medio: "vigia", titular: "Cascos a 40 metros en Vand: la secuencia del faro Bruma frame a frame",
    destaca: [1, 2], omite: [5], disputa: [3],
    nota: "Su especialidad: video y AIS cruzados. El 'roce' existe, la intención de cada parte sigue sin probarse." },
  { medio: "puente", titular: "El acuerdo de 2019 sigue en pie: los ejercicios son rutina anunciada, dicen fuentes de Bandar Sable",
    destaca: [2], omite: [0, 1], disputa: [4],
    nota: "Versión oficialista del estrecho: minimiza el desvío de rutas que sus propios socios ya confirman." },
  { medio: "frontline", titular: "ÚLTIMA HORA: Sarn ofrece corredor neutral y la Liga lo rechaza en silencio",
    destaca: [3], omite: [0], disputa: [2, 5],
    nota: "La oferta del corredor es una investigación abierta; el 'rechazo en silencio' no aparece en ningún cable." },
  { medio: "gaviota", titular: "Los buques que ya no pasan por Vand: tres rutas desviadas verificadas por transpondedor",
    destaca: [4, 0], omite: [2], disputa: [1],
    nota: "Cada afirmación con su pista AIS. No entra en quién ganó el incidente: solo en quién ya no pasa por ahí." },
  { medio: "laberinto", titular: "Nadie quiere la guerra de Vand: todos quieren el precio del miedo",
    destaca: [0, 4], omite: [3], disputa: [2],
    nota: "Tesis editorial: la escalada conviene a los aseguradores. Brillante, especulativo y sin bando." },
];

const ZENIT_HECHOS: HechoCrisis[] = [
  { texto: "La red de hidrófonos de la Cuenca de Zenit registró un ping de baja frecuencia sin catálogo.", estado: "confirmado" },
  { texto: "El ping se repitió tres noches con intervalo casi idéntico.", estado: "confirmado" },
  { texto: "Un patrullero del Reino Hermitano navegó el cuadrante sin transmitir posición.", estado: "disputado" },
  { texto: "La Base Meridiana pidió refuerzo de sensores pasivos para la temporada.", estado: "confirmado" },
  { texto: "Científicos independientes atribuyen el ping a desgasificación de metano del fondo.", estado: "disputado" },
  { texto: "Un buque de investigación neutral fue invitado a verificar in situ.", estado: "investigacion" },
];

const ZENIT_PERSPECTIVAS: PerspectivaMedio[] = [
  { medio: "archivo", titular: "Zenit: el sonido sin catálogo entra al archivo de anomalías acústicas",
    destaca: [0, 1], omite: [4], disputa: [],
    nota: "Trata el ping como dato, no como drama. Su archivo es la referencia con la que todos comparan." },
  { medio: "vigia", titular: "Tres noches, un intervalo: la firma acústica de Zenit comparada con siete patrones conocidos",
    destaca: [1, 3], omite: [2], disputa: [4],
    nota: "Descarta hélice y sísmica en su análisis. La hipótesis del metano le parece cómoda y poco probada." },
  { medio: "puente", titular: "El Reino Hermitano niega patrullas en Zenit y califica la alerta de 'teatral'",
    destaca: [2], omite: [0], disputa: [1],
    nota: "Recoge la negación oficial sin contrastarla: la ausencia de transmisión no es una presencia probada." },
  { medio: "frontline", titular: "¿UN BUQUE FANTASMA BAJO EL HIELO? El ping que nadie reclama",
    destaca: [0], omite: [3, 5], disputa: [4],
    nota: "Del dato real (el ping) salta a un buque fantasma sin una sola prueba. La mesa lo clasifica como entretenimiento." },
  { medio: "gaviota", titular: "El invitado neutral: quién es el buque de investigación que verificará Zenit",
    destaca: [5, 3], omite: [2], disputa: [0],
    nota: "Periodismo de verificación en puro estado líquido: mientras llega el buque, todo es hipótesis." },
  { medio: "laberinto", titular: "Zenit es un espejo: cada país escucha lo que teme",
    destaca: [4], omite: [1], disputa: [2],
    nota: "Ensayo sonoro sobre proyección geopolítica. Menos hechos por línea que ninguna otra sala." },
];

const SARN_HECHOS: HechoCrisis[] = [
  { texto: "La sucesión del Emirato de Sarn sigue sin consejo convocado desde la convalecencia del príncipe.", estado: "confirmado" },
  { texto: "Dos comandos de la guardia fueron relevados sin explicación pública en una semana.", estado: "disputado" },
  { texto: "La banca privada de Sarn registró salidas de capital récord por tercer mes.", estado: "confirmado" },
  { texto: "Un lote de misiles de crucero habría cambiado de custodia entre ramas de la familia.", estado: "investigacion" },
  { texto: "El consejo de comerciantes pidió 'estabilidad auditable' en un comunicado inusual.", estado: "confirmado" },
  { texto: "Tarquinia habría ofrecido mediación con garantías de flete para el Estrecho de Vand.", estado: "disputado" },
];

const SARN_PERSPECTIVAS: PerspectivaMedio[] = [
  { medio: "archivo", titular: "Sarn sin calendario: 61 días sin consejo de sucesión convocado",
    destaca: [0, 2], omite: [3], disputa: [],
    nota: "Cuenta días como nadie. Su cronología de la casa real es la más citada de la región." },
  { medio: "vigia", titular: "Movimientos en tres palacios: qué muestran los convoyes nocturnos de Sarn",
    destaca: [1, 3], omite: [4], disputa: [5],
    nota: "Lectura de movimiento de tropas por luces y patrones. La custodia de los misiles sigue siendo una sombra." },
  { medio: "puente", titular: "Sarn goza de plena estabilidad y sus bancos de la mejor salud, según Bandar Sable",
    destaca: [], omite: [0, 1, 2], disputa: [2, 3],
    nota: "La sala oficialista niega hasta la convalecencia. Útil para medir la línea, no para medir la realidad." },
  { medio: "frontline", titular: "PURGA EN LA GUARDIA: los dos comandos relevados habrían jurado a otra rama",
    destaca: [1, 3], omite: [0], disputa: [4],
    nota: "El relevo es real; el juramento a 'otra rama' proviene de un único canal anónimo." },
  { medio: "gaviota", titular: "Capital que huye: los tres gráficos que resumen la fuga bancaria de Sarn",
    destaca: [2, 4], omite: [3], disputa: [5],
    nota: "Economía verificable con balances públicos. Cautela con el capítulo militar que no domina." },
  { medio: "laberinto", titular: "La cuestión de Sarn no es quién, sino cuánto dura el quién",
    destaca: [0, 4], omite: [3], disputa: [1],
    nota: "Lee la sucesión como relojería: el problema no es el nombre del príncipe sino el temporizador." },
];

// ---- CRISIS 2-4: fases autorizadas con teatro esquemático (0-100) ----

const FASES_VAND: FaseCrisis[] = [
  { titulo: "La subasta de fletes", rango: "Día 1-4", tension: 38,
    eventos: [
      "Las aseguradoras reetiquetan el Estrecho de Vand como 'zona de riesgo vigilado'.",
      "La Liga Tarquinia publica su calendario de ejercicios con inusual antelación.",
      "Sarn responde con un desfile de escoltas en Bandar Sable.",
      "Tres graneleros solicitan escolta voluntaria por primera vez en el año.",
    ],
    pins: [ { x: 50, y: 52, tipo: "frente", nombre: "Faro Bruma" }, { x: 30, y: 40, tipo: "puerto", nombre: "Tarquinia" }, { x: 70, y: 62, tipo: "puerto", nombre: "Bandar Sable" } ] },
  { titulo: "El incidente del faro Bruma", rango: "Día 5-8", tension: 61,
    eventos: [
      "Dos escoltas cruzan rumbos de colisión a 40 metros; grabaciones contradictorias.",
      "Cada parte publica su propia traza de AIS y ambas no cuadran.",
      "El faro Bruma deja de transmitir por 'mantenimiento' durante 31 horas.",
      "Las primas de seguro suben un 18% en una sola sesión.",
    ],
    pins: [ { x: 50, y: 52, tipo: "frente", nombre: "Faro Bruma" }, { x: 55, y: 48, tipo: "frente", nombre: "Contacto A" }, { x: 46, y: 55, tipo: "frente", nombre: "Contacto B" } ] },
  { titulo: "Flotas a la vista", rango: "Día 9-12", tension: 78,
    eventos: [
      "Ejercicios simultáneos en el mismo cuadrante: primera vez desde el acuerdo de 2019.",
      "Aviones de patrulla se sobrevuelan a media altura sin comunicación.",
      "Tres compañías desvían rutas por el pasaje largo del Índico oriental.",
      "Un submarino neutral se deja ver en superficie 'por accidente', según analistas.",
    ],
    pins: [ { x: 50, y: 52, tipo: "frente", nombre: "Cuadrante 7" }, { x: 38, y: 58, tipo: "frente", nombre: "Flota Oeste" }, { x: 62, y: 46, tipo: "frente", nombre: "Flota Este" }, { x: 50, y: 70, tipo: "recurso", nombre: "Pasaje largo" } ] },
  { titulo: "La mesa de Tarquinia", rango: "Día 13-16", tension: 55,
    eventos: [
      "Tarquinia ofrece la ciudad neutra de Estrela para una mesa de fletes y escoltas.",
      "Sarn pide levantar la subasta como precondición; la Liga pide el incidente por escrito.",
      "Los convoyes nocturnos con bandera neutral comienzan sin anuncio.",
      "El pulso baja, pero las aseguradoras mantienen la etiqueta de riesgo.",
    ],
    pins: [ { x: 50, y: 52, tipo: "frente", nombre: "Vand" }, { x: 22, y: 30, tipo: "capital", nombre: "Estrela" }, { x: 70, y: 62, tipo: "puerto", nombre: "Bandar Sable" } ] },
];

const FASES_ZENIT: FaseCrisis[] = [
  { titulo: "El ping sin catálogo", rango: "Noche 1-3", tension: 44,
    eventos: [
      "Los hidrófonos de la Cuenca de Zenit registran un pulso de baja frecuencia desconocido.",
      "El intervalo se repite tres noches con desviación menor a dos segundos.",
      "El archivo de anomalías abre expediente con etiqueta 'origen indeterminado'.",
    ],
    pins: [ { x: 50, y: 55, tipo: "recurso", nombre: "Epicentro acústico" }, { x: 24, y: 78, tipo: "capital", nombre: "Base Meridiana" } ] },
  { titulo: "Hidrófonos reforzados", rango: "Noche 4-8", tension: 52,
    eventos: [
      "La Base Meridiana pide refuerzo de sensores pasivos para la temporada polar.",
      "Un patrullero del Reino Hermitano navega el cuadrante sin transmitir posición.",
      "Los operadores descartan hélice, sísmica y biología conocida en un informe de 14 páginas.",
    ],
    pins: [ { x: 50, y: 55, tipo: "recurso", nombre: "Cuadrante 3" }, { x: 70, y: 38, tipo: "frente", nombre: "Patrullero sin señal" } ] },
  { titulo: "La teoría del metano", rango: "Noche 9-12", tension: 40,
    eventos: [
      "Científicos independientes atribuyen el ping a desgasificación de metano del fondo.",
      "El informe es sólido pero no explica el intervalo casi perfecto.",
      "La polémica metodológica llena tres hilos de la red OSINT en 48 horas.",
    ],
    pins: [ { x: 50, y: 55, tipo: "recurso", nombre: "Fondo abisal" }, { x: 50, y: 30, tipo: "capital", nombre: "Laboratorio austral" } ] },
  { titulo: "El verificador neutral", rango: "Noche 13+", tension: 47,
    eventos: [
      "Un buque de investigación neutral acepta verificar in situ con equipo propio.",
      "El Reino Hermitano declara el asunto 'teatral' y niega patrullas.",
      "La flota de la zona mantiene patrulla conjunta hasta que el buque llegue al epicentro.",
    ],
    pins: [ { x: 50, y: 55, tipo: "recurso", nombre: "Epicentro" }, { x: 40, y: 68, tipo: "puerto", nombre: "Buque neutral" } ] },
];

const FASES_SARN: FaseCrisis[] = [
  { titulo: "La sucesión abierta", rango: "Día 1-6", tension: 41,
    eventos: [
      "El príncipe heredero cancela su agenda por convalecencia; el consejo no se convoca.",
      "La corte publica una foto de archivo y nadie la verifica.",
      "Los analistas cuentan los días: 61 sin calendario de sucesión.",
    ],
    pins: [ { x: 50, y: 50, tipo: "capital", nombre: "Palacio de Sarn" }, { x: 30, y: 62, tipo: "recurso", nombre: "Banca privada" } ] },
  { titulo: "Relevos silenciosos", rango: "Día 7-12", tension: 63,
    eventos: [
      "Dos comandos de la guardia son relevados sin explicación pública.",
      "Un lote de misiles de crucero cambia de custodia entre ramas de la familia, según cables no confirmados.",
      "Los convoyes nocturnos entre palacios se triplican según la imaginería OSINT.",
    ],
    pins: [ { x: 50, y: 50, tipo: "capital", nombre: "Palacio" }, { x: 58, y: 42, tipo: "frente", nombre: "Cuartel 1" }, { x: 44, y: 58, tipo: "frente", nombre: "Cuartel 2" } ] },
  { titulo: "Fuga de capitales", rango: "Día 13-18", tension: 57,
    eventos: [
      "La banca privada registra salidas de capital récord por tercer mes consecutivo.",
      "El consejo de comerciantes publica un comunicado inusual: 'estabilidad auditable'.",
      "Dos familias mercantiles trasladan sedes a Tarquinia.",
    ],
    pins: [ { x: 50, y: 50, tipo: "capital", nombre: "Sarn" }, { x: 26, y: 34, tipo: "puerto", nombre: "Tarquinia" } ] },
  { titulo: "La mediación que no llega", rango: "Día 19+", tension: 49,
    eventos: [
      "Tarquinia ofrece mediación con garantías de flete para el Estrecho de Vand.",
      "Bandar Sable ni acepta ni rechaza: 'la familia delibera'.",
      "El temporizador sigue corriendo: cada semana sin consejo sube la prima de incertidumbre.",
    ],
    pins: [ { x: 50, y: 50, tipo: "capital", nombre: "Sarn" }, { x: 26, y: 34, tipo: "capital", nombre: "Estrela" } ] },
];

const CRISIS_SEED: CrisisVG[] = [
  { id: "karsk", nombre: "Guerra del Valle del Karsk", region: "Europa Oriental · Vanguard",
    capa: "SIM",
    resumen: "El teatro principal del mundo Vanguard: un frente de once puntos que se mueve noche a noche, un odómetro de campaña que nadie discute y seis salas que cuentan la misma semana de seis maneras distintas.",
    actores: [lug("karsk"), nac("donalto"), nac("nordica"), nac("atlantica"), nac("bosforo")],
    modo: "karsk-vivo", hechos: KARSK_HECHOS, perspectivas: KARSK_PERSPECTIVAS },
  { id: "vand", nombre: "Crisis del Estrecho de Vand", region: "Índico · Vanguard",
    capa: "SIM",
    resumen: "La garganta donde la Liga Tarquinia y el Emirato de Sarn miden flotas sin declararse la guerra: seguros que suben, rutas que se desvían y una mesa de negociación que no llega.",
    actores: [lug("vand"), lug("tarquinia"), lug("sarn"), nac("ormuz")],
    modo: "fases", hechos: VAND_HECHOS, perspectivas: VAND_PERSPECTIVAS, fases: FASES_VAND },
  { id: "zenit", nombre: "Anomalía de la Cuenca de Zenit", region: "Índico austral · Vanguard",
    capa: "SIM",
    resumen: "Un ping de baja frecuencia sin catálogo, tres noches con el mismo intervalo y un buque neutral camino del epicentro: la crisis donde cada país escucha lo que teme.",
    actores: [lug("zenit"), lug("meridiana"), nac("hermitano")],
    modo: "fases", hechos: ZENIT_HECHOS, perspectivas: ZENIT_PERSPECTIVAS, fases: FASES_ZENIT },
  { id: "sarn", nombre: "La cuestión de Sarn", region: "Golfo · Vanguard",
    capa: "SIM",
    resumen: "Una sucesión sin calendario, guardias relevados en silencio y capitales que huyen: la relojería del Emirato donde el problema no es quién, sino cuánto dura el quién.",
    actores: [lug("sarn"), nac("ormuz"), lug("tarquinia"), lug("dubai")],
    modo: "fases", hechos: SARN_HECHOS, perspectivas: SARN_PERSPECTIVAS, fases: FASES_SARN },
];

// ============================================================
// ARCHIVO REAL (capa REAL — cronologías públicas verificables)
// ============================================================

export interface ArchivoReal {
  id: string;
  nombre: string;
  region: string;
  rango: string;
  resumen: string;
  fuente: string;
  /** nodos enlazados (teo:..., exp:...) */
  enlaces: string[];
  fases: FaseCrisis[];
}

const REAL_SEED: ArchivoReal[] = [
  { id: "mkultra", nombre: "MK-ULTRA: el programa que la CIA quiso borrar",
    region: "Estados Unidos · 1953-1977", rango: "1953-1977",
    resumen: "El programa de control mental de la CIA: 162 subcontratos con universidades, hospitales y prisiones, 20.000 páginas que sobrevivieron a su propia destrucción y un Senado que lo confirmó todo.",
    fuente: "CIA Reading Room · colección MK-ULTRA · Comisión Church (1975)",
    enlaces: [teo("t-mkultra"), teo("t-cointelpro")],
    fases: [
      { titulo: "Aprobación", rango: "Abril 1953", tension: 30,
        eventos: [
          "El director Allen Dulles aprueba el programa con presupuesto opaco y contabilidad clandestina.",
          "El operativo Sidney Gottlieb toma la dirección química del proyecto.",
        ] },
      { titulo: "Expansión", rango: "1955-1960", tension: 55,
        eventos: [
          "162 subcontratos con 80 instituciones: universidades, hospitales, prisiones y farmacéuticas.",
          "Experimentos con LSD a sujetos que ignoran que participan; front organizations canalizan fondos.",
        ] },
      { titulo: "La advertencia interna", rango: "1963", tension: 40,
        eventos: [
          "El Inspector General de la CIA advierte por escrito sobre la legalidad y el riesgo de exposición.",
          "El programa continúa con recortes y supervisión endebles.",
        ] },
      { titulo: "La destrucción", rango: "1973", tension: 70,
        eventos: [
          "El director Helms ordena destruir los archivos del programa.",
          "Sobreviven unas 20.000 páginas mal archivadas bajo otra caja: el error que lo destapa todo.",
        ] },
      { titulo: "El Senado confirma", rango: "1975-1977", tension: 85,
        eventos: [
          "La Comisión Church confirma ante el Senado los experimentos sobre ciudadanos sin su consentimiento.",
          "Las páginas supervivientes salen a la luz vía FOIA (1977); la colección completa es pública.",
        ] },
    ] },
  { id: "stargate", nombre: "STARGATE: 17 años de visores remotos",
    region: "Estados Unidos · 1978-1995", rango: "1978-1995",
    resumen: "El programa de 'percepción remota' del ejército y la CIA: 20 millones de dólares, 89.000 páginas desclasificadas y una evaluación final que lo clausuró por inútil.",
    fuente: "CIA Reading Room · colección STARGATE",
    enlaces: [teo("t-stargate"), exp("cia-stargate")],
    fases: [
      { titulo: "Scanate", rango: "1978", tension: 25,
        eventos: [
          "Primeras pruebas de 'scanate' (escaneo remoto) con físicos y artistas como visores.",
          "El informe inicial promete resultados; el método todavía no tiene control de calidad.",
        ] },
      { titulo: "Institucionalización", rango: "1984-1990", tension: 45,
        eventos: [
          "El programa se instala en Fort Meade con unidad operativa permanente.",
          "Los 'visores' trabajan objetivos de misiles y submarinos con codificación de sobre.",
        ] },
      { titulo: "La auditoría", rango: "1991-1994", tension: 60,
        eventos: [
          "El American Institutes for Research evalúa el programa con criterio estadístico.",
          "El veredicto: ninguna información utilizable que las vías convencionales no produzcan.",
        ] },
      { titulo: "Clausura y desclasificación", rango: "1995", tension: 75,
        eventos: [
          "La CIA clausura STARGATE y desclasifica 89.000 páginas: la colección completa es pública.",
          "El expediente se convierte en caso de estudio de escepticismo metodológico.",
        ] },
    ] },
  { id: "paperclip", nombre: "PAPERCLIP: los científicos del Reich en EE.UU.",
    region: "Alemania / EE.UU. · 1945-1975", rango: "1945-1975",
    resumen: "El programa que metió a 1.600 científicos alemanes en aviones hacia EE.UU. — incluido el padre del Saturno V — y tardó tres décadas en contar la verdad completa.",
    fuente: "NARA · Registros militares · RG 330",
    enlaces: [teo("t-paperclip"), arm("a-v2")],
    fases: [
      { titulo: "La caza", rango: "1945", tension: 50,
        eventos: [
          "Equipos técnicos rastrean Alemania rendida por ingenieros de cohetes y aerodinámica.",
          "La directiva JCS 1067 prohíbe formalmente traer 'nazis activos': la letra no coincide con la práctica.",
        ] },
      { titulo: "El traslado", rango: "1946-1949", tension: 65,
        eventos: [
          "Unos 1.600 especialistas llegan a EE.UU. con identidades laudadas y expedientes 'sanitizados'.",
          "Wernher von Braun y su equipo aterrizan en Fort Bliss para trabajar el programa de misiles.",
        ] },
      { titulo: "La era dorada", rango: "1958-1969", tension: 40,
        eventos: [
          "Von Braun entra en la NASA y lidera el Saturno V que lleva al hombre a la Luna.",
          "El pasado de SS del equipo queda bajo sello en los archivos militares.",
        ] },
      { titulo: "La revelación", rango: "1970s", tension: 80,
        eventos: [
          "Periodistas e investigadores reconstruyen la historia con expedientes del NARA.",
          "El expediente completo queda público: el mito del 'científico apolítico' se cae para siempre.",
        ] },
    ] },
];

// ============================================================
// CONSTRUCCIÓN DE ENTIDADES
// ============================================================

function regionDeLugar(l: Lugar): string {
  if (l.tipo === "ficticio") return "Mundo Vanguard";
  if (l.tipo === "base") return "Red Vanguard";
  return "Geografía real";
}

const LUG_NODOS: NodoExp[] = LUGARES.map((l) => ({
  id: lug(l.id),
  tipo: "lugar" as const,
  nombre: l.nombre,
  resumen: l.nota,
  capa: (l.tipo === "ficticio" ? "SIM" : "REAL") as Capa,
  region: regionDeLugar(l),
  lat: l.lat,
  lng: l.lng,
  acento: TIPO_META.lugar.hex,
  tab: "tierra",
  filas: [
    { etiqueta: "tipo de punto", valor: l.tipo },
    { etiqueta: "coordenadas", valor: `${l.lat.toFixed(1)}°, ${l.lng.toFixed(1)}°` },
    { etiqueta: "capa", valor: l.tipo === "ficticio" ? "mundo Vanguard (simulación)" : "geografía real" },
  ],
}));

const NAC_NODOS: NodoExp[] = NACIONES_SEED.map((n) => ({
  id: nac(n.id),
  tipo: "nacion" as const,
  nombre: n.nombre,
  resumen: n.resumen,
  capa: "SIM" as const,
  region: n.region,
  lat: n.lat,
  lng: n.lng,
  acento: n.acento,
  tab: "mundial",
  filas: [
    { etiqueta: "capital", valor: n.capital },
    { etiqueta: "población", valor: `${n.poblacionM.toLocaleString("es-ES")} M (est.)` },
    { etiqueta: "índice de riesgo Vanguard", valor: `${n.riesgo}/100` },
    { etiqueta: "capa", valor: "mundo Vanguard (simulación)" },
  ],
}));

const CRI_NODOS: NodoExp[] = [
  ...CRISIS_SEED.map<NodoExp>((c) => ({
    id: cri(c.id),
    tipo: "crisis",
    nombre: c.nombre,
    resumen: c.resumen,
    capa: "SIM",
    region: c.region,
    acento: TIPO_META.crisis.hex,
    tab: "maquina",
    filas: [
      { etiqueta: "salas que la cubren", valor: `${c.perspectivas.length} medios` },
      { etiqueta: "hechos en matriz", valor: `${c.hechos.length}` },
      { etiqueta: "capa", valor: "mundo Vanguard (simulación)" },
    ],
  })),
  ...REAL_SEED.map<NodoExp>((a) => ({
    id: arc(a.id),
    tipo: "crisis",
    nombre: a.nombre,
    resumen: a.resumen,
    capa: "REAL",
    region: a.region,
    acento: TIPO_META.crisis.hex,
    tab: "maquina",
    filas: [
      { etiqueta: "fases documentadas", valor: `${a.fases.length}` },
      { etiqueta: "fuente", valor: a.fuente },
      { etiqueta: "capa", valor: "REAL · archivo desclasificado" },
    ],
  })),
];

const EXP_NODOS: NodoExp[] = EXPEDIENTES.map((e: Expediente) => ({
  id: exp(e.id),
  tipo: "expediente" as const,
  nombre: e.titulo,
  resumen: e.desc,
  capa: "REAL" as const,
  region: `Archivo ${e.agencia}`,
  acento: TIPO_META.expediente.hex,
  tab: "expedientes",
  filas: [
    { etiqueta: "agencia", valor: e.agencia },
    { etiqueta: "época", valor: e.year },
    { etiqueta: "clasificación original", valor: e.clasificacion },
    { etiqueta: "rareza de colección", valor: e.rareza },
    { etiqueta: "capa", valor: "REAL · sala FOIA" },
  ],
}));

const TEO_NODOS: NodoExp[] = TEORIAS.map((x) => ({
  id: teo(x.id),
  tipo: "teoria" as const,
  nombre: x.titulo,
  resumen: `${x.creencia} — Veredicto de la mesa: ${x.veredicto}.`,
  capa: "REAL" as const,
  region: "Biblioteca Oscura",
  acento: TIPO_META.teoria.hex,
  tab: "oscura",
  filas: [
    { etiqueta: "veredicto", valor: x.veredicto },
    { etiqueta: "rareza", valor: x.rareza },
    { etiqueta: "origen", valor: x.origen },
    { etiqueta: "fuente real", valor: x.fuente },
    { etiqueta: "capa", valor: "REAL · historia documentada" },
  ],
}));

const ARM_NODOS: NodoExp[] = ARMAS.map((x) => ({
  id: arm(x.id),
  tipo: "arma" as const,
  nombre: x.titulo,
  resumen: x.idea,
  capa: "REAL" as const,
  region: "Biblioteca Oscura · armas",
  acento: TIPO_META.arma.hex,
  tab: "oscura",
  filas: [
    { etiqueta: "época", valor: x.epoca },
    { etiqueta: "legado", valor: x.legado },
    { etiqueta: "fuente", valor: x.fuente },
    { etiqueta: "capa", valor: "REAL · historia documentada" },
  ],
}));

const CIV_NODOS: NodoExp[] = CIVILIZACIONES.map((x) => ({
  id: civ(x.id),
  tipo: "civil" as const,
  nombre: x.titulo,
  resumen: x.misterio,
  capa: "REAL" as const,
  region: "Biblioteca Oscura · civilizaciones",
  acento: TIPO_META.civil.hex,
  tab: "oscura",
  filas: [
    { etiqueta: "época", valor: x.epoca },
    { etiqueta: "qué logró", valor: x.que },
    { etiqueta: "fuente", valor: x.fuente },
    { etiqueta: "capa", valor: "REAL · registro arqueológico" },
  ],
}));

const DOC_NODOS: NodoExp[] = DOCS.map((x) => ({
  id: doc(x.id),
  tipo: "documento" as const,
  nombre: x.titulo,
  resumen: x.desc,
  capa: "REAL" as const,
  region: "Biblioteca Oscura · documentos",
  acento: TIPO_META.documento.hex,
  tab: "oscura",
  filas: [
    { etiqueta: "tipo de material", valor: x.tag },
    { etiqueta: "fuente", valor: x.fuente },
    { etiqueta: "capa", valor: "REAL · sala FOIA" },
  ],
}));

const PAP_NODOS: NodoExp[] = PAPERS.map((p) => ({
  id: p.id, // los papers ya vienen con prefijo "pap:"
  tipo: "paper" as const,
  nombre: p.titulo,
  resumen: p.abstracto,
  capa: "SIM" as const,
  region: p.revista,
  acento: TIPO_META.paper.hex,
  tab: "googles",
  filas: [
    { etiqueta: "autores", valor: p.autores.join(", ") },
    { etiqueta: "revista", valor: p.revista },
    { etiqueta: "año", valor: String(p.year) },
    { etiqueta: "citas", valor: String(p.citas) },
    { etiqueta: "capa", valor: "mundo Vanguard (simulación)" },
  ],
}));

const MED_NODOS: NodoExp[] = CANALES.map((c) => ({
  id: med(c.id),
  tipo: "medio" as const,
  nombre: `${c.emoji} ${c.nombre}`,
  resumen: `Canal OSINT ${c.tipo.toLowerCase()} con ${c.subs.toLocaleString("es-ES")} suscriptores. En EL ESPEJO cubre las crisis con su propia línea editorial.`,
  capa: "SIM" as const,
  region: "Ecosistema OSINT",
  acento: c.color,
  tab: "canales",
  filas: [
    { etiqueta: "handle", valor: c.handle },
    { etiqueta: "tipo", valor: c.tipo },
    { etiqueta: "suscriptores", valor: c.subs.toLocaleString("es-ES") },
    { etiqueta: "verificado", valor: c.verificado ? "sí · con verificación de red" : "no · tómelo con pinzas" },
    { etiqueta: "capa", valor: "mundo Vanguard (simulación)" },
  ],
}));

export const NODOS_EXPEDIENTE: NodoExp[] = [
  ...LUG_NODOS, ...NAC_NODOS, ...CRI_NODOS, ...EXP_NODOS, ...TEO_NODOS,
  ...ARM_NODOS, ...CIV_NODOS, ...DOC_NODOS, ...PAP_NODOS, ...MED_NODOS,
];

// ============================================================
// ARISTAS — la red tipada del mundo
// ============================================================

function aristasCubren(crisisId: string): AristaExp[] {
  return CANALES.map((c) => ({ a: cri(crisisId), b: med(c.id), tipo: "cubren" as const }));
}

function semillasAristas(): AristaExp[] {
  const out: AristaExp[] = [];
  const push = (a: string, b: string, tipo: TipoArista, nota?: string) => out.push({ a, b, tipo, nota });

  // --- Karsk (teatro vivo) ---
  push(cri("karsk"), lug("karsk"), "sede", "el teatro del Valle");
  push(cri("karsk"), nac("donalto"), "conflicto", "teatro principal");
  push(nac("donalto"), nac("nordica"), "conflicto", "la guerra del Karsk");
  push(nac("donalto"), nac("atlantica"), "alianza", "coalición occidental");
  push(nac("donalto"), nac("bosforo"), "comercio", "drones por suscripción");
  push(nac("nordica"), nac("bosforo"), "tension", "estrechos y mediaciones");
  push(lug("karsk"), lug("karvath"), "tension", "frontera que dispara primero");
  push(lug("karvath"), nac("donalto"), "tension");
  push(cri("karsk"), nac("atlantica"), "alianza", "ayuda militar debatida cada trimestre");
  aristasCubren("karsk").forEach((e) => out.push(e));

  // --- Vand (garganta) ---
  push(cri("vand"), lug("vand"), "sede");
  push(cri("vand"), lug("tarquinia"), "conflicto", "la Liga y el flete");
  push(cri("vand"), lug("sarn"), "conflicto", "el Emirato y el corredor");
  push(lug("sarn"), lug("tarquinia"), "tension", "flotas sin guerra declarada");
  push(cri("vand"), nac("ormuz"), "comercio", "el crudo que cruza la garganta");
  aristasCubren("vand").forEach((e) => out.push(e));

  // --- Zenit (abismo) ---
  push(cri("zenit"), lug("zenit"), "sede");
  push(lug("zenit"), lug("meridiana"), "estudia", "hidrófonos polares");
  push(lug("zenit"), lug("aurora"), "estudia", "la red norte de escucha");
  push(cri("zenit"), nac("hermitano"), "tension", "patrullero sin señal");
  aristasCubren("zenit").forEach((e) => out.push(e));

  // --- Sarn (sucesión) ---
  push(cri("sarn"), lug("sarn"), "sede");
  push(cri("sarn"), nac("ormuz"), "tension", "petrodiplomacia del golfo");
  push(cri("sarn"), lug("dubai"), "comercio", "banca privada");
  push(cri("sarn"), lug("tarquinia"), "tratado", "mediación ofrecida");
  aristasCubren("sarn").forEach((e) => out.push(e));

  // --- naciones ↔ geografía ---
  push(nac("atlantica"), lug("losangeles"), "sede");
  push(nac("atlantica"), lug("panama"), "sede");
  push(nac("central"), lug("shanghai"), "sede");
  push(nac("central"), lug("mar_china"), "conflicto", "reclama casi todo el mar");
  push(nac("central"), lug("taiwan"), "conflicto", "la disputa central del siglo");
  push(nac("hermitano"), lug("tokio"), "tension", "misiles sobre el mar");
  push(nac("subcontinente"), lug("bombay"), "sede");
  push(nac("indus"), nac("subcontinente"), "conflicto", "Línea de Control");
  push(nac("levante"), lug("mediterraneo"), "sede");
  push(nac("ormuz"), lug("ormuz"), "sede");
  push(nac("bosforo"), lug("bosforo"), "sede");
  push(nac("nordica"), lug("baltico"), "conflicto", "cables que se rompen 'por accidente'");
  push(nac("nordica"), lug("estocolmo"), "tension");
  push(nac("donalto"), lug("karsk"), "sede", "capital Karskgrad");
  push(nac("hermitano"), nac("central"), "tension");
  push(nac("indus"), nac("hermitano"), "tension");
  push(nac("levante"), nac("bosforo"), "comercio", "mediaciones y remesas");

  // --- rutas marítimas principales ---
  push(lug("suez"), lug("mandeb"), "ruta");
  push(lug("mandeb"), lug("bombay"), "ruta");
  push(lug("bombay"), lug("malaca"), "ruta");
  push(lug("malaca"), lug("singapur"), "ruta");
  push(lug("singapur"), lug("shanghai"), "ruta");
  push(lug("gibraltar"), lug("mediterraneo"), "ruta");
  push(lug("mediterraneo"), lug("suez"), "ruta");
  push(lug("panama"), lug("caribe"), "ruta");
  push(lug("caribe"), lug("rotterdam"), "ruta");
  push(lug("magallanes"), lug("buenosaires"), "ruta");
  push(lug("ciudaddelcabo"), lug("nairobi"), "ruta");
  push(lug("reikiavik"), lug("estocolmo"), "ruta");
  push(lug("zenit"), lug("sydney"), "ruta");
  push(lug("vand"), lug("sarn"), "ruta");
  push(lug("vand"), lug("ormuz"), "ruta");
  push(lug("ormuz"), lug("malaca"), "ruta");
  push(lug("taiwan"), lug("malaca"), "ruta");
  push(lug("baltico"), lug("estocolmo"), "ruta");

  // --- capa REAL: misma historia / antecedentes ---
  push(exp("cia-stargate"), teo("t-stargate"), "misma-historia");
  push(exp("cia-gateway"), teo("t-gateway"), "misma-historia");
  push(exp("cia-ufo"), teo("t-uap"), "misma-historia");
  push(exp("fbi-ufo"), teo("t-uap"), "misma-historia");
  push(exp("nara-jfk"), teo("t-jfk"), "misma-historia");
  push(teo("t-mkultra"), teo("t-cointelpro"), "antecedente", "misma era, mismos archivos");
  push(teo("t-paperclip"), arm("a-v2"), "misma-historia", "von Braun y el cohete");
  push(arm("a-atomica"), doc("d-nuclear"), "misma-historia");
  push(teo("t-venona"), doc("d-coldwar"), "misma-historia");
  push(teo("t-doomsday"), exp("nsa-nuclear"), "antecedente");
  push(teo("t-area51"), exp("cia-ufo"), "misma-historia", "el lago seco y los 'platillos'");
  push(arm("a-enigma"), arm("a-radar"), "antecedente", "la guerra de la información");
  push(arm("a-gps"), arm("a-dron"), "antecedente");
  push(arm("a-radar"), lug("reikiavik"), "estudia", "la franja GIUK");
  push(doc("d-stargate"), exp("cia-stargate"), "misma-historia");
  push(doc("d-gateway"), exp("cia-gateway"), "misma-historia");
  push(doc("d-ufo"), teo("t-uap"), "misma-historia");
  push(doc("d-pdb"), exp("cia-pdb"), "misma-historia");
  push(doc("d-german"), exp("cia-german"), "misma-historia");
  push(doc("d-coldwar"), exp("cia-coldwar"), "misma-historia");
  push(arm("a-atomica"), exp("nsa-nuclear"), "antecedente");
  push(arm("a-tanque"), lug("karsk"), "estudia", "doctrina de frentes");
  push(arm("a-dron"), cri("karsk"), "estudia", "la guerra del dron");

  // --- el archivo real como crisis de capa REAL ---
  push(arc("mkultra"), teo("t-mkultra"), "misma-historia");
  push(arc("stargate"), exp("cia-stargate"), "misma-historia");
  push(arc("stargate"), teo("t-stargate"), "misma-historia");
  push(arc("paperclip"), teo("t-paperclip"), "misma-historia");
  push(arc("mkultra"), arc("paperclip"), "antecedente", "la era de los programas secretos");
  push(arc("stargate"), arc("mkultra"), "antecedente");

  // --- papers que estudian crisis (match determinista por título) ---
  PAPERS.forEach((p) => {
    if (/karsk/i.test(p.titulo)) push(p.id, cri("karsk"), "estudia");
    if (/vand/i.test(p.titulo)) push(p.id, cri("vand"), "estudia");
    if (/sarn/i.test(p.titulo)) push(p.id, cri("sarn"), "estudia");
    if (/índico|indico|austral/i.test(p.titulo)) push(p.id, cri("zenit"), "estudia");
  });

  return out;
}

const key = (e: AristaExp) => `${e.a}|${e.b}|${e.tipo}`;
const reverse = (e: AristaExp): AristaExp => ({ a: e.b, b: e.a, tipo: e.tipo, nota: e.nota });

export const ARISTAS_EXPEDIENTE: AristaExp[] = (() => {
  const semillas = semillasAristas();
  const vistas = new Set<string>();
  const out: AristaExp[] = [];
  for (const e of semillas) {
    const k = key(e);
    const kr = `${e.b}|${e.a}|${e.tipo}`;
    if (vistas.has(k) || vistas.has(kr)) continue;
    vistas.add(k);
    // la red se recorre en ambos sentidos: guardamos el par una sola vez
    out.push(e);
  }
  return out;
})();

// ============================================================
// HELPERS DE LA RED
// ============================================================

const INDICE_NODOS = new Map<string, NodoExp>(NODOS_EXPEDIENTE.map((n) => [n.id, n]));

export function nodoPorId(id: string): NodoExp | undefined {
  return INDICE_NODOS.get(id);
}

const ADYACENCIA = new Map<string, { nodo: string; arista: AristaExp }[]>();
for (const e of ARISTAS_EXPEDIENTE) {
  if (!ADYACENCIA.has(e.a)) ADYACENCIA.set(e.a, []);
  if (!ADYACENCIA.has(e.b)) ADYACENCIA.set(e.b, []);
  ADYACENCIA.get(e.a)!.push({ nodo: e.b, arista: e });
  ADYACENCIA.get(e.b)!.push({ nodo: e.a, arista: reverse(e) });
}

export function vecinosDe(id: string): { nodo: NodoExp; arista: AristaExp }[] {
  const lista = ADYACENCIA.get(id) ?? [];
  const vistos = new Set<string>();
  const out: { nodo: NodoExp; arista: AristaExp }[] = [];
  for (const ref of lista) {
    if (vistos.has(ref.nodo)) continue;
    const n = INDICE_NODOS.get(ref.nodo);
    if (!n) continue;
    vistos.add(ref.nodo);
    out.push({ nodo: n, arista: ref.arista });
  }
  return out.sort((a, b) => a.nodo.tipo.localeCompare(b.nodo.tipo));
}

export function grados(): Map<string, number> {
  const m = new Map<string, number>();
  for (const n of NODOS_EXPEDIENTE) m.set(n.id, (ADYACENCIA.get(n.id) ?? []).length);
  return m;
}

/** El "núcleo" del grafo: crisis, naciones y medios siempre + todo lo muy conectado. */
export function nucleo(): Set<string> {
  const g = grados();
  const out = new Set<string>();
  for (const n of NODOS_EXPEDIENTE) {
    const deg = g.get(n.id) ?? 0;
    if (n.tipo === "crisis" || n.tipo === "nacion" || n.tipo === "medio") out.add(n.id);
    else if (deg >= 4) out.add(n.id);
  }
  return out;
}

function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export function buscarNodosExp(q: string, max = 14): NodoExp[] {
  const t = norm(q.trim());
  if (t.length < 2) return [];
  const SCORE_TIPO: Record<string, number> = { crisis: 2.2, nacion: 1.6, medio: 1.3, lugar: 1.1 };
  const out: { n: NodoExp; s: number }[] = [];
  for (const n of NODOS_EXPEDIENTE) {
    const nb = norm(n.nombre);
    let s = 0;
    if (nb === t) s = 10;
    else if (nb.startsWith(t)) s = 6 + SCORE_TIPO[n.tipo];
    else if (nb.includes(t)) s = 3 + SCORE_TIPO[n.tipo];
    else if (norm(n.resumen).includes(t)) s = 1.2;
    else if (norm(n.region).includes(t)) s = 1;
    if (s > 0) out.push({ n, s });
  }
  return out.sort((a, b) => b.s - a.s).slice(0, max).map((x) => x.n);
}

/** Crisis SIM cuya lista de actores incluye al nodo dado. */
export function crisisDeActores(id: string): CrisisVG[] {
  return CRISIS.filter((c) => c.actores.includes(id));
}

export interface Convergencia {
  menciona: number;
  disputan: number;
  total: number;
}

/** Cuántas salas mencionan / disputan cada hecho de una crisis. */
export function convergenciaDe(c: CrisisVG): Convergencia[] {
  return c.hechos.map((_, i) => ({
    menciona: c.perspectivas.filter((p) => p.destaca.includes(i) || p.disputa.includes(i)).length,
    disputan: c.perspectivas.filter((p) => p.disputa.includes(i)).length,
    total: c.perspectivas.length,
  }));
}

export function medioPorId(id: string) {
  return CANALES.find((c) => c.id === id) ?? CANALES[0];
}

export function estadisticasExpediente() {
  const porTipo: Record<string, number> = {};
  for (const n of NODOS_EXPEDIENTE) porTipo[n.tipo] = (porTipo[n.tipo] ?? 0) + 1;
  return {
    entidades: NODOS_EXPEDIENTE.length,
    aristas: ARISTAS_EXPEDIENTE.length,
    crisis: CRISIS.length,
    archivo: ARCHIVO.length,
    medios: CANALES.length,
    porTipo,
  };
}

export const CRISIS: CrisisVG[] = CRISIS_SEED;
export const ARCHIVO: ArchivoReal[] = REAL_SEED;
export const NACIONES_EXPEDIENTE: NacionSeed[] = NACIONES_SEED;
