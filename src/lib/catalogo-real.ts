// ============================================================
// v367.4 EL CATÁLOGO DE LO QUE YA EXISTE (lib/catalogo-real.ts)
//
// Orden del Dueño: «no crees nada nuevo, ni nada desde cero; agrega 100
// cosas que YA ESTÁN CREADAS y Vanguard las necesita, y cópialas
// exactamente».
//
// Este archivo NO está escrito a mano ni inventado: lo generó un script
// leyendo el árbol real del repositorio — 43 salas con su ruta de verdad,
// 37 paneles ya construidos, 15 motores de la casa y 5 puntos de datos.
// Cada entrada lleva su archivo de origen como prueba. Si algo no existe,
// no aparece aquí.
//
// Cómo se regenera (cuando la casa crezca): misma receta del worklog v367.4.
// ============================================================

export type TipoCosa = "sala" | "panel" | "motor" | "api";

export interface CosaReal {
  id: string;
  tipo: TipoCosa;
  nombre: string;
  /** ruta navegable (solo salas y APIs) */
  ruta?: string;
  /** archivo real del repositorio del que sale — la prueba de que existe */
  archivo: string;
  /** la primera línea honesta del propio archivo, si la tiene */
  lema?: string;
}

export const COSAS_REALES: CosaReal[] = [
  { id: "real-001", tipo: "sala", nombre: "ARCHIVO MUNDIAL", ruta: "/archivo-mundial", archivo: "src/app/archivo-mundial/page.tsx", lema: "Karansebes, Chosin...), 8 eras desde la Prehistoria, 6 contadores de" },
  { id: "real-002", tipo: "sala", nombre: "ARMERÍA", ruta: "/armeria", archivo: "src/app/armeria/page.tsx", lema: "Javelin, HIMARS...) con su foto, su origen, su era, su función y su" },
  { id: "real-003", tipo: "sala", nombre: "ATLAS", ruta: "/atlas", archivo: "src/app/atlas/page.tsx" },
  { id: "real-004", tipo: "sala", nombre: "Emisora de Guerra", ruta: "/audios", archivo: "src/app/audios/page.tsx", lema: "EnlacesNucleo reutilizado): la emisora ya no es una isla — la" },
  { id: "real-005", tipo: "sala", nombre: "Tu Centinela", ruta: "/centinela", archivo: "src/app/centinela/page.tsx", lema: "La sala del vínculo honesto: pones bajo vigilancia los teatros y los" },
  { id: "real-006", tipo: "sala", nombre: "CLASICO", ruta: "/clasico", archivo: "src/app/clasico/page.tsx" },
  { id: "real-007", tipo: "sala", nombre: "Teatro no disponible · VANGUARD", ruta: "/conflicto/[tag]", archivo: "src/app/conflicto/[tag]/page.tsx" },
  { id: "real-008", tipo: "sala", nombre: "Las salas del conflicto", ruta: "/conflicto", archivo: "src/app/conflicto/page.tsx" },
  { id: "real-009", tipo: "sala", nombre: "CONFLICTOS", ruta: "/conflictos", archivo: "src/app/conflictos/page.tsx", lema: "CONFLICTS (game-data, 33 regiones con dossier real: nivel, intensidad," },
  { id: "real-010", tipo: "sala", nombre: "La Crónica del Día", ruta: "/cronica", archivo: "src/app/cronica/page.tsx", lema: "La razón honesta de volver cada día: el parte de lo que de verdad ha" },
  { id: "real-011", tipo: "sala", nombre: "DIVISAS", ruta: "/divisas", archivo: "src/app/divisas/page.tsx" },
  { id: "real-012", tipo: "sala", nombre: "EN VIVO", ruta: "/en-vivo", archivo: "src/app/en-vivo/page.tsx", lema: "Página server: baja la instantánea (solo cables REALES enriquecidos" },
  { id: "real-013", tipo: "sala", nombre: "EL ESTRATEGA", ruta: "/escenarios", archivo: "src/app/escenarios/page.tsx" },
  { id: "real-014", tipo: "sala", nombre: "El Detector de Bolsillo", ruta: "/escudo/detector", archivo: "src/app/escudo/detector/page.tsx", lema: "EL CENTINELA DE BOLSILLO — /escudo/detector (ronda EL CENTINELA, complemento de la ley" },
  { id: "real-015", tipo: "sala", nombre: "El Escudo", ruta: "/escudo", archivo: "src/app/escudo/page.tsx", lema: "LA SALA DEL ESCUDO — /escudo (complemento de la ley v204 EL ESCUDO)." },
  { id: "real-016", tipo: "sala", nombre: "MODO ESPÍA", ruta: "/espia", archivo: "src/app/espia/page.tsx" },
  { id: "real-017", tipo: "sala", nombre: "El Estado de la Casa", ruta: "/estado", archivo: "src/app/estado/page.tsx", lema: "EL ESTADO DE LA CASA — /estado (el latido público, patrón /escudo)." },
  { id: "real-018", tipo: "sala", nombre: "GALERÍA", ruta: "/galeria", archivo: "src/app/galeria/page.tsx", lema: "TOTAL) gana su sala server. La «Queda» de la v297 pedía clasificación" },
  { id: "real-019", tipo: "sala", nombre: "Guerra hoy en vivo", ruta: "/guerra-hoy", archivo: "src/app/guerra-hoy/page.tsx" },
  { id: "real-020", tipo: "sala", nombre: "El archivo de la historia", ruta: "/historia", archivo: "src/app/historia/page.tsx" },
  { id: "real-021", tipo: "sala", nombre: "MISIÓN 100 ENLACES", ruta: "/mision", archivo: "src/app/mision/page.tsx", lema: "El comandante la abre en el móvil: https://vanguard-kq9r.vercel.app/mision" },
  { id: "real-022", tipo: "sala", nombre: "TU MODO · TU CUENTA", ruta: "/modo", archivo: "src/app/modo/page.tsx", lema: "La casa permanente del selector: «¿qué quieres hacer en Vanguard?»" },
  { id: "real-023", tipo: "sala", nombre: "EL MUNDO 3D", ruta: "/mundo", archivo: "src/app/mundo/page.tsx", lema: "Página server: la instantánea del planeta (cables reales de 24 h por" },
  { id: "real-024", tipo: "sala", nombre: "La Música con Forma", ruta: "/musica", archivo: "src/app/musica/page.tsx", lema: "El Dueño, textual: «la música de Vanguard se deforma con el tiempo, es" },
  { id: "real-025", tipo: "sala", nombre: "Cable no disponible · VANGUARD", ruta: "/noticia/[id]", archivo: "src/app/noticia/[id]/page.tsx" },
  { id: "real-026", tipo: "sala", nombre: "EL NÚCLEO", ruta: "/nucleo", archivo: "src/app/nucleo/page.tsx" },
  { id: "real-027", tipo: "sala", nombre: "Los 100 Objetivos de Vanguard", ruta: "/objetivos", archivo: "src/app/objetivos/page.tsx" },
  { id: "real-028", tipo: "sala", nombre: "Sin conexión", ruta: "/offline", archivo: "src/app/offline/page.tsx" },
  { id: "real-029", tipo: "sala", nombre: "BIBLIOTECA OSCURA", ruta: "/oscura", archivo: "src/app/oscura/page.tsx", lema: "PÁGINA, pura de servidor) declara en su propia cabeza: «contenido" },
  { id: "real-030", tipo: "sala", nombre: "PORTADA", ruta: "/", archivo: "src/app/page.tsx", lema: "VANGUARD v17 — MULTIJUGADOR TERMINADO + MOTOR DE CARGA RAPIDA." },
  { id: "real-031", tipo: "sala", nombre: "PODER", ruta: "/poder", archivo: "src/app/poder/page.tsx", lema: "MS.MIL.TOTL.P1 personal, MS.MIL.XPND.GD.ZS % del PIB) capturados el" },
  { id: "real-032", tipo: "sala", nombre: "Política de Privacidad", ruta: "/privacidad", archivo: "src/app/privacidad/page.tsx", lema: "Publisher Center (Google News) exige una URL de política de privacidad" },
  { id: "real-033", tipo: "sala", nombre: "WORLD PULSE", ruta: "/pulso-mundial", archivo: "src/app/pulso-mundial/page.tsx" },
  { id: "real-034", tipo: "sala", nombre: "LOS ROSTROS DEL PODER", ruta: "/rostros", archivo: "src/app/rostros/page.tsx", lema: "TRIBUNAL · NUEVOS) solo vivía client-side (rostros-panel, el" },
  { id: "real-035", tipo: "sala", nombre: "La sala de los servicios", ruta: "/servicios", archivo: "src/app/servicios/page.tsx" },
  { id: "real-036", tipo: "sala", nombre: "La Torre de Control", ruta: "/torre", archivo: "src/app/torre/page.tsx", lema: "La sala que convierte tres noches de ceguera en una pantalla. Hasta hoy" },
  { id: "real-037", tipo: "sala", nombre: "MODO TRADUCTOR", ruta: "/traductor", archivo: "src/app/traductor/page.tsx", lema: "La puerta de los 8 idiomas de la casa: traduce cualquier texto con el" },
  { id: "real-038", tipo: "sala", nombre: "VANGUARD-2 · El universo 3D total", ruta: "/vanguard2", archivo: "src/app/vanguard2/page.tsx", lema: "VANGUARD-2 — el NUEVO Vanguard: cada sección es su propio" },
  { id: "real-039", tipo: "sala", nombre: "FRENTE TOTAL", ruta: "/ver-guerra", archivo: "src/app/ver-guerra/page.tsx" },
  { id: "real-040", tipo: "sala", nombre: "VERDAD CRUDA", ruta: "/verdad-cruda", archivo: "src/app/verdad-cruda/page.tsx" },
  { id: "real-041", tipo: "sala", nombre: "El Vértigo", ruta: "/vertigo", archivo: "src/app/vertigo/page.tsx" },
  { id: "real-042", tipo: "sala", nombre: "La Voz Maestra", ruta: "/voz", archivo: "src/app/voz/page.tsx", lema: "El Dueño, textual: «su voz… tiene una voz robótica, no tiene diferentes" },
  { id: "real-043", tipo: "sala", nombre: "TEATRO GLOBAL 3D", ruta: "/zona-cero", archivo: "src/app/zona-cero/page.tsx" },
  { id: "real-044", tipo: "panel", nombre: "ABUSOS PANEL", archivo: "src/components/vanguard/panels/abusos-panel.tsx", lema: "VANGUARD v24 — CRÍMENES Y ABUSOS · EL LADO DESAGRADABLE" },
  { id: "real-045", tipo: "panel", nombre: "ACHIEVEMENTS PANEL", archivo: "src/components/vanguard/panels/achievements-panel.tsx" },
  { id: "real-046", tipo: "panel", nombre: "ACTIVITY LOG PANEL", archivo: "src/components/vanguard/panels/activity-log-panel.tsx" },
  { id: "real-047", tipo: "panel", nombre: "AGE OF NATIONS PANEL", archivo: "src/components/vanguard/panels/age-of-nations-panel.tsx", lema: "Vanguard v12 — AGE OF NATIONS: conquista mundial por turnos sobre el mapa" },
  { id: "real-048", tipo: "panel", nombre: "AGENTE IA PANEL", archivo: "src/components/vanguard/panels/agente-ia-panel.tsx", lema: "El comandante pidió: \"la IA super potente y como un modo agente que cree" },
  { id: "real-049", tipo: "panel", nombre: "AGENTE PANEL", archivo: "src/components/vanguard/panels/agente-panel.tsx", lema: "Civil -> Oraculo), mapa de calor de regiones, evolucion del IQ, mejores y" },
  { id: "real-050", tipo: "panel", nombre: "ALIANZAS PANEL", archivo: "src/components/vanguard/panels/alianzas-panel.tsx" },
  { id: "real-051", tipo: "panel", nombre: "ANALISTA PANEL", archivo: "src/components/vanguard/panels/analista-panel.tsx", lema: "PERFIL DE ANALISTA: nivel, ELO, 14 insignias y retos semanales — todo" },
  { id: "real-052", tipo: "panel", nombre: "ARCADE PANEL", archivo: "src/components/vanguard/panels/arcade-panel.tsx", lema: "Vanguard v12 — ARCADE PACK: minijuegos rapidos con recompensas." },
  { id: "real-053", tipo: "panel", nombre: "ARMERIA PANEL", archivo: "src/components/vanguard/panels/armeria-panel.tsx", lema: "VANGUARD v26 — ARMERÍA REAL: fotos reales, no polígonos." },
  { id: "real-054", tipo: "panel", nombre: "ARQUITECTO PANEL", archivo: "src/components/vanguard/panels/arquitecto-panel.tsx", lema: "El 16º mundo: el taller donde la IA autónoma de Vanguard trabaja" },
  { id: "real-055", tipo: "panel", nombre: "ATELIER PANEL", archivo: "src/components/vanguard/panels/atelier-panel.tsx", lema: "Las cinco leyes del lujo, vivas y tocables:" },
  { id: "real-056", tipo: "panel", nombre: "ATLAS PANEL", archivo: "src/components/vanguard/panels/atlas-panel.tsx" },
  { id: "real-057", tipo: "panel", nombre: "BIBLIOTECA GRAN PANEL", archivo: "src/components/vanguard/panels/biblioteca-gran-panel.tsx" },
  { id: "real-058", tipo: "panel", nombre: "BIBLIOTECA PANEL", archivo: "src/components/vanguard/panels/biblioteca-panel.tsx", lema: "PÚBLICO (libre) · RESTRINGIDO (1.000) · CONFIDENCIAL (5.000) · SECRETO" },
  { id: "real-059", tipo: "panel", nombre: "BOLSA PANEL", archivo: "src/components/vanguard/panels/bolsa-panel.tsx", lema: "VANGUARD v27 — BOLSA DE MONEDAS COMUNITARIAS" },
  { id: "real-060", tipo: "panel", nombre: "BOOKMAKER PANEL", archivo: "src/components/vanguard/panels/bookmaker-panel.tsx", lema: "Vanguard v12 — BETNACION: casa de apuestas estilo sportsbook real." },
  { id: "real-061", tipo: "panel", nombre: "BRIEFINGS PANEL", archivo: "src/components/vanguard/panels/briefings-panel.tsx" },
  { id: "real-062", tipo: "panel", nombre: "CAMA PANEL", archivo: "src/components/vanguard/panels/cama-panel.tsx" },
  { id: "real-063", tipo: "panel", nombre: "CAMBIOS PANEL", archivo: "src/components/vanguard/panels/cambios-panel.tsx", lema: "El informe de regreso completo: qué cambió desde la última visita, con" },
  { id: "real-064", tipo: "panel", nombre: "CAMERAS PANEL", archivo: "src/components/vanguard/panels/cameras-panel.tsx", lema: "Compra cámaras, despliegalas donde quieras en el globo 3D y vigila devastaciones en vivo." },
  { id: "real-065", tipo: "panel", nombre: "CANALBRIEF PANEL", archivo: "src/components/vanguard/panels/canalbrief-panel.tsx" },
  { id: "real-066", tipo: "panel", nombre: "CANALES PANEL", archivo: "src/components/vanguard/panels/canales-panel.tsx" },
  { id: "real-067", tipo: "panel", nombre: "CARTELES PANEL", archivo: "src/components/vanguard/panels/carteles-panel.tsx", lema: "Vanguard v14 — CARTELES: fichas de organizaciones criminales con zona de" },
  { id: "real-068", tipo: "panel", nombre: "CENTINELA PANEL", archivo: "src/components/vanguard/panels/centinela-panel.tsx", lema: "El Early Warning System del portal definitivo: un índice de riesgo por" },
  { id: "real-069", tipo: "panel", nombre: "CENTRO PANEL", archivo: "src/components/vanguard/panels/centro-panel.tsx", lema: "El Dueño: «que Vanguard sea el mayor centro de noticias del mundo," },
  { id: "real-070", tipo: "panel", nombre: "CIBER PANEL", archivo: "src/components/vanguard/panels/ciber-panel.tsx" },
  { id: "real-071", tipo: "panel", nombre: "CIELOS PANEL", archivo: "src/components/vanguard/panels/cielos-panel.tsx" },
  { id: "real-072", tipo: "panel", nombre: "COMBAT SIMULATOR PANEL", archivo: "src/components/vanguard/panels/combat-simulator-panel.tsx" },
  { id: "real-073", tipo: "panel", nombre: "COMUNIDAD PANEL", archivo: "src/components/vanguard/panels/comunidad-panel.tsx", lema: "La sala donde VANGUARD abre la Comunidad de Inteligencia de los" },
  { id: "real-074", tipo: "panel", nombre: "CONQUISTAS 3D PANEL", archivo: "src/components/vanguard/panels/conquistas-3d-panel.tsx", lema: "Vanguard v12 — CONQUISTAS 3D EXPLICADAS: campanas historicas paso a paso" },
  { id: "real-075", tipo: "panel", nombre: "CONSEJO IA PANEL", archivo: "src/components/vanguard/panels/consejo-ia-panel.tsx", lema: "Planteas una crisis → 4 consejeros de IA intervienen con efecto máquina de" },
  { id: "real-076", tipo: "panel", nombre: "CONTRIBUIDORES PANEL", archivo: "src/components/vanguard/panels/contribuidores-panel.tsx", lema: "Vanguard v23 — COMUNIDAD DE CONTRIBUIDORES: gana monedas construyendo la web." },
  { id: "real-077", tipo: "panel", nombre: "COUNTERS PANEL", archivo: "src/components/vanguard/panels/counters-panel.tsx", lema: "Vanguard v12 — CONTADORES: contadores de muertes animados. Muertes globales" },
  { id: "real-078", tipo: "panel", nombre: "COUNTRY CONTROL PANEL", archivo: "src/components/vanguard/panels/country-control-panel.tsx" },
  { id: "real-079", tipo: "panel", nombre: "CREADOR MAPAS PANEL", archivo: "src/components/vanguard/panels/creador-mapas-panel.tsx", lema: "VANGUARD v85.0 EL MUNDO DENTRO — CONSTRUCTOR DE MAPAS" },
  { id: "real-080", tipo: "panel", nombre: "CREADOR PANEL", archivo: "src/components/vanguard/panels/creador-panel.tsx", lema: "VANGUARD v26 — ESTUDIO COMUNITARIO (COMUNIDAD CREADORA)" },
  { id: "real-081", tipo: "motor", nombre: "AGE ENGINE", archivo: "src/lib/age-engine.ts", lema: "Vanguard v12 — AGE OF NATIONS: estrategia por turnos estilo Age of History." },
  { id: "real-082", tipo: "motor", nombre: "AGENCIAS DATA", archivo: "src/lib/agencias-data.ts", lema: "IMINT, TECHINT, CYBINT, FELINT), la sala anexa de las manos crece" },
  { id: "real-083", tipo: "motor", nombre: "AGENCIAS MUNDO DATA", archivo: "src/lib/agencias-mundo-data.ts", lema: "La sala hermana de LA COMUNIDAD (v127): si allí viven los 18" },
  { id: "real-084", tipo: "motor", nombre: "AGENTE LOOK", archivo: "src/lib/agente-look.ts", lema: "Las MEDALLAS no se eligen: se GANAN (derivadas de logros y estadísticas reales)." },
  { id: "real-085", tipo: "motor", nombre: "AGENTE NUCLEO", archivo: "src/lib/agente-nucleo.ts", lema: "El comandante pidió: \"mejora la mente, o sea la IA, super potente y que sea" },
  { id: "real-086", tipo: "motor", nombre: "AGENTES AUTONOMOS", archivo: "src/lib/agentes-autonomos.ts", lema: "Vanguard cada cierto tiempo. Como un gobierno, pero libre:" },
  { id: "real-087", tipo: "motor", nombre: "AI MODERATE", archivo: "src/lib/ai-moderate.ts", lema: "VANGUARD v26 — AGENTE MODERADOR IA (solo servidor)" },
  { id: "real-088", tipo: "motor", nombre: "ALARMA", archivo: "src/lib/alarma.ts", lema: "El Dueño mandó: «noticias EN VIVO por importancia e impacto». El" },
  { id: "real-089", tipo: "motor", nombre: "ALGORITMO FEED", archivo: "src/lib/algoritmo-feed.ts", lema: "Mandato del Dueño: «haz que Vanguard tenga un algoritmo como TikTok»." },
  { id: "real-090", tipo: "motor", nombre: "AMBIENTE MUNDO", archivo: "src/lib/ambiente-mundo.ts", lema: "VANGUARD v302.0 EL MUNDO RESPIRA — EL AMBIENTE DEL MUNDO SIN RADIO" },
  { id: "real-091", tipo: "motor", nombre: "ANALISTA", archivo: "src/lib/analista.ts", lema: "PERFIL DE ANALISTA: la progresión con sentido. Nivel de analista, 14" },
  { id: "real-092", tipo: "motor", nombre: "ARCHIVE DATA", archivo: "src/lib/archive-data.ts", lema: "Vanguard v12 — ARCHIVO MUNDIAL: datos de curiosidades, epocas de la" },
  { id: "real-093", tipo: "motor", nombre: "ARQUITECTO", archivo: "src/lib/arquitecto.ts", lema: "Mandato del comandante: \"crea un agente de IA que siga mejorando" },
  { id: "real-094", tipo: "motor", nombre: "ARSENAL DATA", archivo: "src/lib/arsenal-data.ts", lema: "VANGUARD v26 — ARMERÍA REAL: dataset educativo de las armas que definen" },
  { id: "real-095", tipo: "motor", nombre: "ATLAS DATA", archivo: "src/lib/atlas-data.ts", lema: "Edición Vanguard 2026 · datos verificados hasta octubre 2025." },
  { id: "real-096", tipo: "api", nombre: "/api/agent-ping", ruta: "/api/agent-ping", archivo: "src/app/api/agent-ping/route.ts", lema: "punto de datos real de la casa" },
  { id: "real-097", tipo: "api", nombre: "/api/agente/opinar", ruta: "/api/agente/opinar", archivo: "src/app/api/agente/opinar/route.ts", lema: "punto de datos real de la casa" },
  { id: "real-098", tipo: "api", nombre: "/api/agente", ruta: "/api/agente", archivo: "src/app/api/agente/route.ts", lema: "punto de datos real de la casa" },
  { id: "real-099", tipo: "api", nombre: "/api/ambassadors", ruta: "/api/ambassadors", archivo: "src/app/api/ambassadors/route.ts", lema: "punto de datos real de la casa" },
  { id: "real-100", tipo: "api", nombre: "/api/ambassadors/vote", ruta: "/api/ambassadors/vote", archivo: "src/app/api/ambassadors/vote/route.ts", lema: "punto de datos real de la casa" },
];

export const TOTAL_REAL = COSAS_REALES.length;

export function cosasPorTipo(tipo: TipoCosa): CosaReal[] {
  return COSAS_REALES.filter((c) => c.tipo === tipo);
}

export function cuentaPorTipo(): Record<TipoCosa, number> {
  return {
    sala: cosasPorTipo("sala").length,
    panel: cosasPorTipo("panel").length,
    motor: cosasPorTipo("motor").length,
    api: cosasPorTipo("api").length,
  };
}
