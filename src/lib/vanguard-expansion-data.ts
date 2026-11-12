// ============================================================
// VANGUARD — CATÁLOGO MAESTRO DE LO NUEVO + EXPANSIÓN 10X
// Reúne en un solo módulo tipado:
//   1) NOVEDADES_VANGUARD: todo lo agregado recientemente a la plataforma con
//      ruta directa, enlace SPA y detalle técnico verificable.
//   2) FUNCIONES_EXPANSION_10: las 10 nuevas herramientas/funciones reales
//      que expanden y refrescan el ecosistema VANGUARD.
//   3) Datos estructurados reales para calculadoras, tratados y rutas.
// ============================================================

import type { TabKey } from "@/components/vanguard/tab-nav";

export type FuncionExpansionId =
  | "comparador-fuerzas"
  | "termometro-regiones"
  | "riesgo-viajero"
  | "impacto-suministros"
  | "radar-diplomatico"
  | "verificador-osint"
  | "duelo-relampago"
  | "vigia-planetario"
  | "generador-briefing"
  | "atlas-estrategico";

export interface NovedadItem {
  id: string;
  orden: number;
  titulo: string;
  etiqueta: string;
  fecha: string;
  categoria: "MOTOR 3D/2D" | "EXPANSIÓN 10X" | "MUNDO VIVO" | "ECOSISTEMA";
  resumen: string;
  destacado?: boolean;
  rutaDirecta: string;
  tabDestino?: TabKey;
}

export interface FuncionExpansionDef {
  id: FuncionExpansionId;
  numero: number;
  titulo: string;
  lema: string;
  categoria: "TÁCTICO" | "ANÁLISIS" | "ECONOMÍA" | "TELEMETRÍA" | "GEOPOLÍTICA";
  badge: string;
  descripcion: string;
  fuenteDatos: string;
  rutaDirecta: string;
  acento: string;
}

export interface DestinoViaje {
  id: string;
  nombre: string;
  region: "Europa" | "Oriente Medio" | "Asia-Pacífico" | "África" | "América";
  riesgoBase: number; // 0..100
  corredorAereo: "Abierto" | "Restricciones parciales" | "Espacio aéreo cerrado / desvío";
  corredorMaritimo: "Normal" | "Escolta recomendada" | "Alto riesgo / desvío";
  notaSeguridad: string;
  alternativaSegura: string;
  teatroRelacionadoId?: string;
}

export interface ChoqueSuministro {
  id: string;
  nombre: string;
  estrecho: string;
  participacionComercioPct: number;
  petroleoImpactoUsd: number; // impacto estimado USD/barril
  gnlImpactoPct: number;
  chipsImpactoPct: number;
  granosImpactoPct: number;
  diasDesvioMaritimo: number;
  descripcion: string;
}

export interface HitoDiplomatico {
  id: string;
  nombre: string;
  bloque: "OTAN / Europa" | "ONU / Tratados" | "Indo-Pacífico" | "BRICS / Sur Global";
  estado: "VIGENTE" | "EN RENEGOCIACIÓN" | "CRÍTICO / VENCIMIENTO" | "CUMBRE ACTIVA";
  ventanaTemporal: string;
  pesoEstrategico: number; // 1..10
  impacto: string;
  palabrasClave: string[];
}

export const NOVEDADES_VANGUARD: NovedadItem[] = [
  {
    id: "nov-daily-universe",
    orden: 1,
    titulo: "VANGUARD — THE DAILY UNIVERSE · Credits, 8 Colecciones & Marketplace Ético",
    etiqueta: "ECONOMÍA VIVA",
    fecha: "2026-11-11",
    categoria: "EXPANSIÓN 10X",
    resumen:
      "Economía diaria y semanal sin FOMO, Vanguard Credits (VC), Cartas Mejoradas 3D Holo-Foil (Nv. 1→5), 8 colecciones educativas (Países, Civilizaciones, Monumentos, Espacio, Ciencia...), Marketplace de 7 categorías sin pay-to-win y Base Personal.",
    destacado: true,
    rutaDirecta: "/universo",
    tabDestino: "universo",
  },
  {
    id: "nov-cartas-3d",
    orden: 2,
    titulo: "Cartas Mejoradas 3D Holo-Foil + VANGUARD COLLECTIONS (40 Cartas)",
    etiqueta: "CARTAS 3D",
    fecha: "2026-11-11",
    categoria: "EXPANSIÓN 10X",
    resumen:
      "Inclinación 3D, reflejo holográfico, subida de nivel de Bronce a Prismática (Nv. 1→5), verificación educativa con recompensa VC y exhibición en tu Vitrina Personal.",
    destacado: true,
    rutaDirecta: "/universo?vista=colecciones",
    tabDestino: "universo",
  },
  {
    id: "nov-expansion-10x",
    orden: 3,
    titulo: "EXPANSIÓN 10X · 10 Funciones Nuevas + Menú VANGUARD",
    etiqueta: "NUEVO AHORA",
    fecha: "2026-11-11",
    categoria: "EXPANSIÓN 10X",
    resumen:
      "Diez herramientas interactivas nuevas (Comparador Cara a Cara, Termómetro Regional, Calculadora de Riesgo de Viaje, Impacto en Suministros, Radar de Tratados, Verificador OSINT, Duelo Relámpago, Vigía Sísmico/NASA, Generador de Briefings y Atlas de 32 Puntos → 3D) más el Menú Rápido de Novedades.",
    destacado: true,
    rutaDirecta: "/novedades",
    tabDestino: "novedades",
  },
  {
    id: "nov-teatro-3d",
    orden: 2,
    titulo: "#1 VANGUARD 3D · Teatro Total 2D / 3D",
    etiqueta: "#1 MOTOR GLOBAL",
    fecha: "2026-11-11",
    categoria: "MOTOR 3D/2D",
    resumen:
      "Motor táctico maestro en posición #1 en toda la plataforma: conmutador 3D VIVO / 2D TÁCTICO / 2D+3D simultáneo con paridad 1:1 y 5 sistemas integrados.",
    destacado: true,
    rutaDirecta: "/teatro-3d",
    tabDestino: "teatro3d",
  },
  {
    id: "nov-m1-planeta3d",
    orden: 3,
    titulo: "Módulo 1 · Conversor Mundial (Lat, Lng) → Terreno 3D / 2D",
    etiqueta: "3D / 2D EN VIVO",
    fecha: "2026-11-11",
    categoria: "MOTOR 3D/2D",
    resumen:
      "Convierte cualquier ciudad, coordenada o punto clicado del mapamundi SVG en terreno 3D con elevación procedural fBM, biomas, 4 sensores (Táctico/Satélite/NVG/FLIR) y combate por clic.",
    rutaDirecta: "/teatro-3d?modulo=mundial",
    tabDestino: "teatro3d",
  },
  {
    id: "nov-m2-frentes",
    orden: 4,
    titulo: "Módulo 2 · Globo 3D de Frentes Activos + Cables Reales",
    etiqueta: "OSINT EN DIRECTO",
    fecha: "2026-11-11",
    categoria: "MOTOR 3D/2D",
    resumen:
      "Balizas pulsantes en el globo 3D sincronizadas con la carta planetaria 2D, trazado local del frente, filtros de /api/news y botón 1-clic para simular cualquier frente en 3D.",
    rutaDirecta: "/teatro-3d?modulo=frentes",
    tabDestino: "teatro3d",
  },
  {
    id: "nov-m3-uniformes",
    orden: 5,
    titulo: "Módulo 3 · 8 Uniformes Tácticos 3D/2D por Capas y Despiece",
    etiqueta: "BLINDAJE 3D/2D",
    fecha: "2026-11-11",
    categoria: "MOTOR 3D/2D",
    resumen:
      "Inspecciona 8 equipamientos (abriendo con VANGUARD APEX-2100 #1) capa por capa, separa las piezas en 3D y aplica su bono de blindaje directamente en la simulación.",
    rutaDirecta: "/teatro-3d?modulo=uniformes",
    tabDestino: "teatro3d",
  },
  {
    id: "nov-m4-escuadrones",
    orden: 6,
    titulo: "Módulo 4 · 8 Escuadrones 3D/2D en Formación OTAN APP-6",
    etiqueta: "FORMACIONES",
    fecha: "2026-11-11",
    categoria: "MOTOR 3D/2D",
    resumen:
      "Vehículos, operadores, drones y radares en órbita táctica 3D acoplados al diagrama OTAN 2D y listos para desplegarse completos sobre el terreno.",
    rutaDirecta: "/teatro-3d?modulo=escuadrones",
    tabDestino: "teatro3d",
  },
  {
    id: "nov-m5-armas",
    orden: 7,
    titulo: "Módulo 5 · 10 Armas 3D/2D con Despiece CAD y Rayos X",
    etiqueta: "ARSENAL CAD",
    fecha: "2026-11-11",
    categoria: "MOTOR 3D/2D",
    resumen:
      "Despiece continuo 0%–100%, modo Rayos-X / malla wireframe, giro 360° y plano técnico CAD 2D pieza por pieza encabezado por VANGUARD X-1 (#1).",
    rutaDirecta: "/teatro-3d?modulo=armas",
    tabDestino: "teatro3d",
  },
  {
    id: "nov-mundo-vivo",
    orden: 8,
    titulo: "El Mundo 3D · Globo Multicapa y Modo Espía",
    etiqueta: "MUNDO 3D",
    fecha: "2026-11-10",
    categoria: "MUNDO VIVO",
    resumen:
      "Globo interactivo en tiempo real con teatros de operación, organismos internacionales, estrechos estratégicos y modo espía.",
    rutaDirecta: "/mundo",
    tabDestino: "mundo",
  },
  {
    id: "nov-pulso-vertigo",
    orden: 9,
    titulo: "El Pulso (En Vivo) + El Vértigo + La Emisora + El Núcleo",
    etiqueta: "ECOSISTEMA v367",
    fecha: "2026-11-10",
    categoria: "ECOSISTEMA",
    resumen:
      "Redacción 24h con cables ordenados por impacto, feed vertical infinito, partes de guerra por voz con grabación de audios y buscador central unificado.",
    rutaDirecta: "/en-vivo",
    tabDestino: "envivo",
  },
];

export const FUNCIONES_EXPANSION_10: FuncionExpansionDef[] = [
  {
    id: "comparador-fuerzas",
    numero: 1,
    titulo: "Comparador Táctico Cara a Cara",
    lema: "Enfrenta cualquier par de armas, uniformes o escuadrones en tiempo real",
    categoria: "TÁCTICO",
    badge: "NUEVA #01",
    descripcion:
      "Compara 1v1 dos sistemas reales de VANGUARD (10 armas, 8 uniformes o 8 escuadrones) con diferencias métricas exactas, barras dobles y veredicto automático de superioridad.",
    fuenteDatos: "Catálogos ARMAS_3D, UNIFORMES_3D y ESCUADRONES_3D",
    rutaDirecta: "/novedades?funcion=comparador-fuerzas",
    acento: "#FFC94D",
  },
  {
    id: "termometro-regiones",
    numero: 2,
    titulo: "Termómetro Global por Regiones",
    lema: "Escalada agregada en Europa, Oriente Medio, Asia-Pacífico, África y América",
    categoria: "GEOPOLÍTICA",
    badge: "NUEVA #02",
    descripcion:
      "Agrupa los conflictos activos de CONFLICTS por macro-región, calcula la intensidad media y máxima y enlaza cada foco directo al simulador 3D.",
    fuenteDatos: "CONFLICTS + LUGARES_MUNDO (32 sectores)",
    rutaDirecta: "/novedades?funcion=termometro-regiones",
    acento: "#FF3B30",
  },
  {
    id: "riesgo-viajero",
    numero: 3,
    titulo: "Calculadora de Riesgo de Viaje y Rutas",
    lema: "Evalúa corredores aéreos, marítimos y desvíos antes de transitar",
    categoria: "ANÁLISIS",
    badge: "NUEVA #03",
    descripcion:
      "Selecciona un país o corredor estratégico y verifica nivel de riesgo compuesto, estado del espacio aéreo/marítimo, cables recientes relacionados y rutas alternas recomendadas.",
    fuenteDatos: "CORREDORES_VIAJE + CONFLICTS + /api/news",
    rutaDirecta: "/novedades?funcion=riesgo-viajero",
    acento: "#38BDF8",
  },
  {
    id: "impacto-suministros",
    numero: 4,
    titulo: "Simulador de Impacto en Suministros",
    lema: "Mide el golpe en petróleo, GNL, semiconductores y granos si cierra un estrecho",
    categoria: "ECONOMÍA",
    badge: "NUEVA #04",
    descripcion:
      "Activa bloqueos simultáneos en Ormuz, Bab el-Mandeb, Suez, Taiwán, Bósforo o Panamá y observa al instante el impacto estimado en energía, chips, carga y cotizaciones cripto/mercado.",
    fuenteDatos: "CHOQUES_SUMINISTRO + /api/datos/cripto",
    rutaDirecta: "/novedades?funcion=impacto-suministros",
    acento: "#3DDC97",
  },
  {
    id: "radar-diplomatico",
    numero: 5,
    titulo: "Radar de Tratados y Cumbres",
    lema: "Vencimientos nucleares, cumbres OTAN/BRICS y acuerdos clave filtrables",
    categoria: "GEOPOLÍTICA",
    badge: "NUEVA #05",
    descripcion:
      "Supervisa acuerdos estratégicos vigentes, tratados en crisis o renegociación y ventanas diplomáticas críticas con filtro por bloque y peso geopolítico.",
    fuenteDatos: "TRATADOS_RADAR + búsqueda en /nucleo",
    rutaDirecta: "/novedades?funcion=radar-diplomatico",
    acento: "#A855F7",
  },
  {
    id: "verificador-osint",
    numero: 6,
    titulo: "Verificador Rápido OSINT",
    lema: "Analiza cualquier titular o cable real frente a sesgo, urgencia y entidades",
    categoria: "ANÁLISIS",
    badge: "NUEVA #06",
    descripcion:
      "Pega un titular (o carga cables reales desde /api/news): detecta palabras de alarma, entidades geopolíticas reconocidas, puntaje de objetividad y búsqueda directa en el Núcleo.",
    fuenteDatos: "/api/news + análisis sintáctico + /nucleo",
    rutaDirecta: "/novedades?funcion=verificador-osint",
    acento: "#38BDF8",
  },
  {
    id: "duelo-relampago",
    numero: 7,
    titulo: "Duelo Táctico Relámpago (3 Turnos)",
    lema: "Wargame exprés sobre cualquier teatro real con transferencia al motor 3D",
    categoria: "TÁCTICO",
    badge: "NUEVA #07",
    descripcion:
      "Juega una batalla rápida en 3 fases (Reconocimiento, Maniobra y Asalto) contra la IA táctica sobre cualquiera de los 32 sectores del mundo y exporta el escenario al Teatro 3D completo.",
    fuenteDatos: "LUGARES_MUNDO + motor táctico de turnos",
    rutaDirecta: "/novedades?funcion=duelo-relampago",
    acento: "#FFC94D",
  },
  {
    id: "vigia-planetario",
    numero: 8,
    titulo: "Vigía Planetario (Sismos + NASA EONET)",
    lema: "Telemetría ambiental y sísmica real en vivo con salto directo al terreno 3D",
    categoria: "TELEMETRÍA",
    badge: "NUEVA #08",
    descripcion:
      "Consulta los sismos globales reales desde /api/datos/sismos (USGS) y eventos naturales de /api/datos/planeta (NASA EONET) en una sola consola en vivo.",
    fuenteDatos: "/api/datos/sismos + /api/datos/planeta",
    rutaDirecta: "/novedades?funcion=vigia-planetario",
    acento: "#3DDC97",
  },
  {
    id: "generador-briefing",
    numero: 9,
    titulo: "Generador de Parte Ejecutivo 1-Minuto",
    lema: "Compila un informe táctico real listo para copiar o descargar en .txt",
    categoria: "ANÁLISIS",
    badge: "NUEVA #09",
    descripcion:
      "Reúne automáticamente los frentes de mayor intensidad, los últimos titulares verificados de /api/news y el enfoque regional elegido en un briefing exportable.",
    fuenteDatos: "CONFLICTS + /api/news + selector regional",
    rutaDirecta: "/novedades?funcion=generador-briefing",
    acento: "#E8C56A",
  },
  {
    id: "atlas-estrategico",
    numero: 10,
    titulo: "Explorador de Estrechos y Puntos Clave → 3D",
    lema: "Filtra 32 plazas estratégicas por bioma y ábrelas directo en Teatro 3D",
    categoria: "GEOPOLÍTICA",
    badge: "NUEVA #10",
    descripcion:
      "Explora estrechos marítimos, capitales y teatros de operación por bioma o nombre, consulta sus coordenadas exactas y ábrelos con un clic en /teatro-3d?lat=...&lng=....",
    fuenteDatos: "LUGARES_MUNDO (32 coordenadas reales)",
    rutaDirecta: "/novedades?funcion=atlas-estrategico",
    acento: "#FFC94D",
  },
];

export const DESTINOS_VIAJE: DestinoViaje[] = [
  {
    id: "mar-negro",
    nombre: "Mar Negro / Europa Oriental",
    region: "Europa",
    riesgoBase: 88,
    corredorAereo: "Espacio aéreo cerrado / desvío",
    corredorMaritimo: "Escolta recomendada",
    notaSeguridad: "Rutas aéreas civiles desviadas fuera de Ucrania y zonas fronterizas. Corredor marítimo costero oeste operativo con primas de seguro elevadas.",
    alternativaSegura: "Eje terrestre Polonia / Rumanía + espacio aéreo Balcanes",
    teatroRelacionadoId: "ukraine",
  },
  {
    id: "mar-rojo",
    nombre: "Mar Rojo · Bab el-Mandeb",
    region: "Oriente Medio",
    riesgoBase: 82,
    corredorAereo: "Restricciones parciales",
    corredorMaritimo: "Alto riesgo / desvío",
    notaSeguridad: "Ataques recurrentes con drones navales y misiles antibuque obligan a navieras comerciales a rodear África por el Cabo de Buena Esperanza (+12 a +15 días).",
    alternativaSegura: "Ruta Cabo de Buena Esperanza o puente terrestre Golfo-Mediterráneo",
    teatroRelacionadoId: "redsea",
  },
  {
    id: "levante",
    nombre: "Levante · Mediterráneo Oriental",
    region: "Oriente Medio",
    riesgoBase: 84,
    corredorAereo: "Restricciones parciales",
    corredorMaritimo: "Escolta recomendada",
    notaSeguridad: "Avisos NOTAM intermitentes por lanzamientos balísticos e interceptaciones en altura; escalas portuarias sujetas a verificación previa.",
    alternativaSegura: "Hubs de Chipre / Grecia / Amán según ventana NOTAM",
    teatroRelacionadoId: "gaza",
  },
  {
    id: "estrecho-ormuz",
    nombre: "Estrecho de Ormuz · Golfo Pérsico",
    region: "Oriente Medio",
    riesgoBase: 71,
    corredorAereo: "Restricciones parciales",
    corredorMaritimo: "Escolta recomendada",
    notaSeguridad: "Corredor de 21% del petróleo marítimo mundial bajo patrullaje naval intensivo e interferencia GPS ocasional.",
    alternativaSegura: "Oleoductos hacia Yanbu (Mar Rojo) y Fujairah (Omán)",
    teatroRelacionadoId: "iran",
  },
  {
    id: "taiwan-mar-china",
    nombre: "Estrecho de Taiwán · Mar de China Meridional",
    region: "Asia-Pacífico",
    riesgoBase: 64,
    corredorAereo: "Restricciones parciales",
    corredorMaritimo: "Escolta recomendada",
    notaSeguridad: "Ejercicios aeronavales periódicos con zonas de exclusión temporal; tráfico comercial intenso requiere seguimiento AIS continuo.",
    alternativaSegura: "Ruta oriental por Filipinas / Mar de Filipinas",
    teatroRelacionadoId: "taiwan",
  },
  {
    id: "sahel-africa",
    nombre: "Sahel Central y Sudán",
    region: "África",
    riesgoBase: 86,
    corredorAereo: "Espacio aéreo cerrado / desvío",
    corredorMaritimo: "Normal",
    notaSeguridad: "Cierre de rutas terrestres transaharianas por insurgencia armada; sobrevuelos civiles evitan corredores de Mali, Níger y Sudán.",
    alternativaSegura: "Eje costero Atlántico Norte / África Oriental (Nairobi-Addis)",
    teatroRelacionadoId: "sudan",
  },
  {
    id: "atlantico-norte",
    nombre: "Atlántico Norte / Europa Occidental",
    region: "Europa",
    riesgoBase: 22,
    corredorAereo: "Abierto",
    corredorMaritimo: "Normal",
    notaSeguridad: "Tránsito comercial normalizado; vigilancia submarina incrementada sobre cables transatlánticos e infraestructura energética del Mar del Norte.",
    alternativaSegura: "Corredor comercial estándar con monitoreo de cables submarinos",
  },
  {
    id: "caribe-panama",
    nombre: "Caribe · Canal de Panamá",
    region: "América",
    riesgoBase: 29,
    corredorAereo: "Abierto",
    corredorMaritimo: "Normal",
    notaSeguridad: "Estabilidad operativa general; cuellos de botella ocasionales por calado/clima en el Canal de Panamá y patrullaje marítimo regional.",
    alternativaSegura: "Programación anticipada de esclusas o enlace interoceánico",
  },
];

export const CHOQUES_SUMINISTRO: ChoqueSuministro[] = [
  {
    id: "ormuz",
    nombre: "Cierre parcial en Estrecho de Ormuz",
    estrecho: "Golfo Pérsico — Omán",
    participacionComercioPct: 21,
    petroleoImpactoUsd: 26,
    gnlImpactoPct: 24,
    chipsImpactoPct: 4,
    granosImpactoPct: 6,
    diasDesvioMaritimo: 11,
    descripcion: "Interrumpe ~20M de barriles/día y exportaciones clave de GNL hacia Europa y Asia.",
  },
  {
    id: "babelmandeb",
    nombre: "Bloqueo en Bab el-Mandeb / Mar Rojo",
    estrecho: "Yemen — Yibuti",
    participacionComercioPct: 12,
    petroleoImpactoUsd: 9,
    gnlImpactoPct: 11,
    chipsImpactoPct: 9,
    granosImpactoPct: 12,
    diasDesvioMaritimo: 14,
    descripcion: "Fuerza desvío de portacontenedores Asia-Europa por el Cabo de Buena Esperanza.",
  },
  {
    id: "taiwan",
    nombre: "Cuarentena naval en Estrecho de Taiwán",
    estrecho: "Taiwán — Mar de China Oriental",
    participacionComercioPct: 18,
    petroleoImpactoUsd: 7,
    gnlImpactoPct: 10,
    chipsImpactoPct: 48,
    granosImpactoPct: 7,
    diasDesvioMaritimo: 8,
    descripcion: "Impacto crítico directo sobre semiconductores avanzados (<5nm) y cadenas electrónicas.",
  },
  {
    id: "mar-negro",
    nombre: "Restricción de grano en Mar Negro",
    estrecho: "Ucrania — Bósforo",
    participacionComercioPct: 8,
    petroleoImpactoUsd: 6,
    gnlImpactoPct: 5,
    chipsImpactoPct: 2,
    granosImpactoPct: 29,
    diasDesvioMaritimo: 9,
    descripcion: "Encarece trigo, maíz, fertilizantes y primas de flete hacia Oriente Medio y África.",
  },
  {
    id: "panama",
    nombre: "Restricción severa Canal de Panamá",
    estrecho: "América Central",
    participacionComercioPct: 5,
    petroleoImpactoUsd: 4,
    gnlImpactoPct: 8,
    chipsImpactoPct: 6,
    granosImpactoPct: 11,
    diasDesvioMaritimo: 13,
    descripcion: "Desvía GNL estadounidense y granos hacia el Estrecho de Magallanes o Suez.",
  },
];

export const TRATADOS_RADAR: HitoDiplomatico[] = [
  {
    id: "new-start",
    nombre: "Marco de Control Estratégico Nuclear (Post-New START)",
    bloque: "ONU / Tratados",
    estado: "CRÍTICO / VENCIMIENTO",
    ventanaTemporal: "2026 — Ventana crítica sin verificaciones activas",
    pesoEstrategico: 10,
    impacto: "Sin inspecciones bilaterales vigentes ni topes renovados sobre ojivas desplegadas EE. UU.–Rusia.",
    palabrasClave: ["nuclear", "tratado", "misil", "start"],
  },
  {
    id: "otan-flanco",
    nombre: "Disposición Operativa Flanco Oriental OTAN (Defensa 360°)",
    bloque: "OTAN / Europa",
    estado: "VIGENTE",
    ventanaTemporal: "Despliegue rotatorio continuo 2026",
    pesoEstrategico: 9,
    impacto: "Brigadas multinacionales en Polonia, Bálticos y Rumanía con mando integrado de defensa aérea.",
    palabrasClave: ["otan", "polonia", "ucrania", "europa"],
  },
  {
    id: "aukus-pilar",
    nombre: "Alianza AUKUS — Pilar Submarinos y Capacidades Cuánticas",
    bloque: "Indo-Pacífico",
    estado: "EN RENEGOCIACIÓN",
    ventanaTemporal: "Hitos de transferencia 2026–2027",
    pesoEstrategico: 8,
    impacto: "Acelera infraestructura naval y cooperación tecnológica de EE. UU., Reino Unido y Australia en el Pacífico.",
    palabrasClave: ["aukus", "submarino", "pacifico", "australia"],
  },
  {
    id: "brics-pagos",
    nombre: "Cumbre BRICS+ — Sistemas Alternativos de Liquidación",
    bloque: "BRICS / Sur Global",
    estado: "CUMBRE ACTIVA",
    ventanaTemporal: "Ciclo anual 2026",
    pesoEstrategico: 8,
    impacto: "Expansión de comercio bilateral en divisas locales y reserva energética paralela al dólar.",
    palabrasClave: ["brics", "divisas", "comercio", "china"],
  },
  {
    id: "mar-rojo-aspides",
    nombre: "Misiones Navales de Escolta en Mar Rojo y Golfo de Adén",
    bloque: "ONU / Tratados",
    estado: "CUMBRE ACTIVA",
    ventanaTemporal: "Operación marítima permanente",
    pesoEstrategico: 9,
    impacto: "Protección antimisil de convoyes mercantes entre Suez y el Océano Índico.",
    palabrasClave: ["mar rojo", "suez", "hormuz", "naval"],
  },
  {
    id: "ia-militar",
    nombre: "Declaración Internacional sobre IA Militar Responsable (REAIM)",
    bloque: "ONU / Tratados",
    estado: "EN RENEGOCIACIÓN",
    ventanaTemporal: "Rondas multilaterales 2026",
    pesoEstrategico: 7,
    impacto: "Debate vinculante sobre control humano significativo en sistemas autónomos y enjambres FPV.",
    palabrasClave: ["ia", "dron", "autonomo", "onu"],
  },
];
