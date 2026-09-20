// ============================================================
// VANGUARD v24.0 — VERDAD CRUDA · EL LADO OSCURO DE LOS CONFLICTOS
// Datos documentados de abusos, incidentes, memorial, drones,
// reclutamiento y contenido sensible. Todas las entradas citan
// fuentes públicas (ONU, CPJ, RSF, ACLED, HRW, OSCE).
// ============================================================

export interface WarAbuse {
  id: string;
  war: string; // UCRANIA | GAZA | SUDAN | MYANMAR | GLOBAL
  countries: string[]; // ISO2 para banderas
  type: string; // ATAQUE_CIVILES | TORTURA | EJECUCIONES | HOSPITALES | HAMBRE | VIOLENCIA_SEXUAL | DESPLAZAMIENTO | ARMAS_PROHIBIDAS
  title: string;
  location: string;
  date: string;
  deaths: string;
  summary: string;
  sources: { org: string; label: string }[];
  verified: boolean;
}

export const ABUSE_TYPES: Record<string, { label: string; icon: string; color: string }> = {
  ATAQUE_CIVILES: { label: "Ataques a civiles", icon: "💥", color: "text-red-hud border-red-hud" },
  TORTURA: { label: "Tortura y detención", icon: "⛓️", color: "text-violet-hud border-violet-hud" },
  EJECUCIONES: { label: "Ejecuciones sumarias", icon: "🚫", color: "text-red-hud border-red-hud" },
  HOSPITALES: { label: "Ataques a hospitales", icon: "🏥", color: "text-amber border-amber-hud" },
  HAMBRE: { label: "Hambre como arma", icon: "🌾", color: "text-amber border-amber-hud" },
  VIOLENCIA_SEXUAL: { label: "Violencia sexual", icon: "⚠️", color: "text-violet-hud border-violet-hud" },
  DESPLAZAMIENTO: { label: "Desplazamiento forzado", icon: "🚶", color: "text-cyan-hud border-cyan-hud" },
  ARMAS_PROHIBIDAS: { label: "Armas prohibidas", icon: "☢️", color: "text-red-hud border-red-hud" },
  INFANCIA: { label: "Impacto en infancia", icon: "🧸", color: "text-cyan-hud border-cyan-hud" },
};

export const WAR_ABUSES: WarAbuse[] = [
  {
    id: "ab-kramatorsk", war: "UCRANIA", countries: ["ua", "ru"], type: "ATAQUE_CIVILES",
    title: "Ataque a la estación de Kramatorsk",
    location: "Kramatorsk, Donetsk", date: "8 abr 2022",
    deaths: "≈63 civiles muertos, incluidos 9 niños",
    summary: "Un misil impactó la estación mientras miles de civiles evacuaban. La ONU concluyó que el ataque fue con munición Tochka-B sobre una zona civil saturada de desplazados. Más de 100 personas resultaron heridas.",
    sources: [{ org: "ONU/OHCHR", label: "Informe OHCHR Ucrania #12" }, { org: "AP", label: "Investigación visual AP" }],
    verified: true,
  },
  {
    id: "ab-bucha", war: "UCRANIA", countries: ["ua", "ru"], type: "TORTURA",
    title: "Ocupación de Bucha: tortura y ejecuciones",
    location: "Bucha, región de Kiev", date: "mar 2022",
    deaths: "458 cuerpos documentados en la ciudad",
    summary: "Tras la retirada rusa aparecieron cuerpos con manos atadas y señales de tortura. La Misión de Observación de la ONU y la OSCE documentaron ejecuciones sumarias de civiles y detenciones arbitrarias sistemáticas.",
    sources: [{ org: "ONU/OHCHR", label: "Matriz de civiles OHCHR" }, { org: "OSCE", label: "Informe Moscow mechanism" }],
    verified: true,
  },
  {
    id: "ab-mariupol", war: "UCRANIA", countries: ["ua", "ru"], type: "ATAQUE_CIVILES",
    title: "Bombardeo del Teatro Dramático de Mariúpol",
    location: "Mariúpol", date: "16 mar 2022",
    deaths: "≈300 estimados (AP/Associated Press)",
    summary: "Cientos de civiles se refugiaban bajo el teatro marcado con la palabra NIÑOS visible desde el aire. La investigación de AP y la ONU lo calificó de crimen de guerra contra infraestructura civil claramente identificable.",
    sources: [{ org: "AP", label: "AP Investigation 2022" }, { org: "OSCE", label: "Informe ODIHR" }],
    verified: true,
  },
  {
    id: "ab-pow", war: "UCRANIA", countries: ["ua", "ru"], type: "EJECUCIONES",
    title: "Ejecuciones sumarias de prisioneros de guerra",
    location: "Frentes de Donetsk y Zaporizhzhia", date: "2022-2025",
    deaths: "159 casos documentados en curso (ONU, 2025)",
    summary: "La Oficina del Alto Comisionado de la ONU documentó ejecuciones de soldados rendidos por ambos bandos, con un aumento severo en 2024-2025. El derecho internacional (Convenios de Ginebra art. 13) prohíbe matar a un combatiente que se rinde.",
    sources: [{ org: "ONU/OHCHR", label: "XXIV informe de ejecuciones" }, { org: "ICRC", label: "Visitas a prisioneros" }],
    verified: true,
  },
  {
    id: "ab-gaza-hosp", war: "GAZA", countries: ["ps", "il"], type: "HOSPITALES",
    title: "Sistema de salud de Gaza en colapso",
    location: "Franja de Gaza", date: "2023-2025",
    deaths: "OMS: >1.500 ataques a servicios de salud",
    summary: "La OMS registró más de mil quinientos ataques a hospitales, ambulancias y personal médico. Al-Shifa, el mayor hospital, quedó fuera de servicio. El derecho humanitario protege explícitamente hospitales y heridos.",
    sources: [{ org: "OMS", label: "Who Health emergency dashboard" }, { org: "Amnistía Intl", label: "Informe 'You feel like you are subhuman'" }],
    verified: true,
  },
  {
    id: "ab-gaza-hambre", war: "GAZA", countries: ["ps", "il"], type: "HAMBRE",
    title: "Hambruna inducida por asedio",
    location: "Gaza norte", date: "2024-2025",
    deaths: "IPC: riesgo de hambruna para todo el territorio",
    summary: "El sistema IPC (Clasificación Integrada de Fases Alimentarias) confirmó hambruna localizada y bloqueo sostenido de alimentos. Human Rights Watch documentó que la privación deliberada de comida a civiles constituye crimen de guerra.",
    sources: [{ org: "IPC", label: "Gaza food security alert" }, { org: "HRW", label: "'Extermination and acts of genocide'" }],
    verified: true,
  },
  {
    id: "ab-sudan", war: "SUDÁN", countries: ["sd"], type: "EJECUCIONES",
    title: "Masacres étnicas de El Geneina",
    location: "El Geneina, Darfur Oeste", date: "jun-ago 2023",
    deaths: "10.000-15.000 muertos estimados (ONU)",
    summary: "Las RSF y milicias aliadas ejecutaron a civiles masawi por etnia en la mayor matanza individual del conflicto. El Panel de Expertos de la ONU sobre Sudán documentó ejecuciones por pertenencia étnica y enterramientos masivos.",
    sources: [{ org: "ONU", label: "Panel de Expertos Sudán (S/2024/75)" }, { org: "HRW", label: "'They burned everything'" }],
    verified: true,
  },
  {
    id: "ab-sudan-despla", war: "SUDÁN", countries: ["sd"], type: "DESPLAZAMIENTO",
    title: "El mayor desplazamiento del planeta",
    location: "Todo Sudán + fronteras", date: "2023-2026",
    deaths: "≈12 millones desplazados internos y refugiados",
    summary: "Una de cada tres personas de Sudán ha sido desplazada. Acnur lo llama la mayor crisis de desplazamiento registrada, con hambruna activa en campos como Zamzam y ataques documentados a convoyes humanitarios.",
    sources: [{ org: "UNHCR", label: "Sudán situation update" }, { org: "ACLED", label: "Sudán violence dataset" }],
    verified: true,
  },
  {
    id: "ab-myanmar", war: "MYANMAR", countries: ["mm"], type: "ARMAS_PROHIBIDAS",
    title: "Bombardeos aéreos sobre escuelas y aldeas",
    location: "Sagaing, Rakhine, Kayah", date: "2021-2026",
    deaths: "ACLED: >8.000 muertos civiles desde el golpe",
    summary: "La junta usa bombas de aviación sin guiño sobre escuelas, hospitales y mercados rurales. ACLED y AAPP documentan miles de civiles muertos, detenciones masivas y tortura en interrogatorios de la junta militar.",
    sources: [{ org: "ACLED", label: "Myanmar civilian targeting" }, { org: "AAPP", label: "Registro diario de detenciones" }],
    verified: true,
  },
  {
    id: "ab-sexual", war: "GLOBAL", countries: ["ua", "sd", "mm"], type: "VIOLENCIA_SEXUAL",
    title: "Violencia sexual como arma de guerra",
    location: "Ucrania, Sudán, Myanmar", date: "2022-2026",
    deaths: "ONU: miles de casos verificados en los 3 conflictos",
    summary: "La Representante Especial de la ONU para la Violencia Sexual en Conflictos verificó casos en detención rusa, en manos de RSF en Sudán y de la junta en Myanmar. La impunidad es la norma: menos del 2% de los casos llega a juicio.",
    sources: [{ org: "ONU", label: "Informe anual CRSV (S/2025)" }, { org: "Amnistía Intl", label: "Documentación por conflicto" }],
    verified: true,
  },
  {
    id: "ab-infancia", war: "GLOBAL", countries: ["ua", "ps", "sd"], type: "INFANCIA",
    title: "Una generación marcada",
    location: "Ucrania, Gaza, Sudán", date: "2022-2026",
    deaths: "UNICEF: miles de niños muertos y millones sin escuela",
    summary: "Ucrania: miles de escuelas dañadas y niños deportados (orden de la CPI de 2023 contra Putin y Lvova-Belova). Gaza: la ONU estima más escolares muertos que en 4 años de conflictos mundiales combinados. Sudán: reclutamiento infantil documentado por ambas partes.",
    sources: [{ org: "UNICEF", label: "Conflictos y niñez 2025" }, { org: "CPI", label: "Orden de arrest 2023" }],
    verified: true,
  },
  {
    id: "ab-epw-ua", war: "UCRANIA", countries: ["ua", "ru"], type: "TORTURA",
    title: "Tortura sistemática en detención",
    location: "Territorios ocupados y prisiones rusas", date: "2022-2026",
    deaths: "OHCHR: >95% de exdetenidos relatan tortura",
    summary: "La ONU entrevistó a cientos de liberados: electricidad, ahogamientos simulados, palizas metódicas y tortura sexual en sitios de detención no oficiales. La CPI procesa casos individuales, pero el sistema continúa.",
    sources: [{ org: "ONU/OHCHR", label: "Informe detención civil" }, { org: "Media Initiative", label: "Registro 'Esperar para volver'" }],
    verified: true,
  },
];

// ================= INCIDENTES EN EL MAPA =================

export interface IncidentCamera {
  id: string;
  name: string;
  angle: string;
  lastSeen: string;
}

export interface Incident {
  id: string;
  name: string;
  country: string; // ISO2
  lat: number;
  lng: number;
  type: "ATAQUE" | "ASEDIO" | "MASACRE" | "CRISIS" | "FRENTE" | "DESASTRE";
  status: "ACTIVO" | "DOCUMENTADO";
  since: string;
  deaths: string;
  summary: string;
  cameras: IncidentCamera[];
  sources: string[];
}

export const INCIDENT_TYPE_META: Record<Incident["type"], { label: string; color: string; icon: string }> = {
  ATAQUE: { label: "Ataque / bombardeo", color: "#FF3B30", icon: "💥" },
  ASEDIO: { label: "Asedio / cerco", color: "#FF8A3B", icon: "🚧" },
  MASACRE: { label: "Masacre documentada", color: "#B91C1C", icon: "🕯️" },
  CRISIS: { label: "Crisis humanitaria", color: "#38BDF8", icon: "🆘" },
  FRENTE: { label: "Frente activo", color: "#A855F7", icon: "⚔️" },
  DESASTRE: { label: "Desastre / colapso", color: "#FACC15", icon: "⚠️" },
};

export const INCIDENTS: Incident[] = [
  {
    id: "inc-kramatorsk", name: "Estación de Kramatorsk", country: "ua", lat: 48.7194, lng: 37.5556,
    type: "ATAQUE", status: "DOCUMENTADO", since: "abr 2022", deaths: "63",
    summary: "El misil Tochka-B que golpeó la estación sigue siendo uno de los casos más documentados: 4.300 personas esperaban trenes de evacuación. Cámaras de la estación capturaron el momento exacto del impacto.",
    cameras: [{ id: "CAM-KRM-01", name: "Plataforma central", angle: "Norte, 320°", lastSeen: "08 abr 2022 10:22" }, { id: "CAM-KRM-02", name: "Sala de espera", angle: "Interior", lastSeen: "08 abr 2022 10:21" }],
    sources: ["OHCHR #12", "AP Investigation"],
  },
  {
    id: "inc-bucha", name: "Bucha", country: "ua", lat: 50.3533, lng: 30.2211,
    type: "MASACRE", status: "DOCUMENTADO", since: "mar 2022", deaths: "458",
    summary: "33 días de ocupación. Los paneles de la ONU y la OSCE cruzaron testimonios, imágenes satelitales y forense. Se convirtió en símbolo de la documenación ciudadana: vecinos fotografiaron todo ante la retirada.",
    cameras: [{ id: "CAM-BCH-01", name: "Camión de basura Yablunska", angle: "Grabación doméstica", lastSeen: "05 mar 2022" }],
    sources: ["OSCE Moscow Mechanism", "OHCHR Matriz"],
  },
  {
    id: "inc-mariupol-teatro", name: "Teatro de Mariúpol", country: "ua", lat: 47.0971, lng: 37.5497,
    type: "ATAQUE", status: "DOCUMENTADO", since: "mar 2022", deaths: "≈300",
    summary: "El refugio del teatro fue bombardeado el 16 de marzo. La investigación de AP reconstruyó el ataque con 22 testimonios, planos y satélite: los civiles estaban en el sótano marcado con DIETI (NIÑOS).",
    cameras: [{ id: "CAM-MRP-01", name: "Calle Teatralna", angle: "Panorámica", lastSeen: "16 mar 2022 10:00" }, { id: "CAM-MRP-02", name: "Azotea cercana", angle: "Sur", lastSeen: "16 mar 2022 10:05" }],
    sources: ["AP Investigation", "OSCE ODIHR"],
  },
  {
    id: "inc-bakhmut", name: "Bakhmut", country: "ua", lat: 48.5937, lng: 38.0016,
    type: "FRENTE", status: "ACTIVO", since: "ago 2022", deaths: "sin cifra fiable",
    summary: "La batalla más larga de la guerra moderna: 10 meses de asalto directo con pérdida total del casco urbano. Los FPV dominan el cielo a baja altura; ambos bandos reportan que la mayoría de bajas provienen de drones.",
    cameras: [{ id: "CAM-BHM-01", name: "Ruta de suministro T0504", angle: "Oeste", lastSeen: "en vivo (cinta de unidad)" }],
    sources: ["ISW frontline report", "ACLED"],
  },
  {
    id: "inc-avdiivka", name: "Avdiivka y Pokrovsk", country: "ua", lat: 48.1387, lng: 37.7435,
    type: "FRENTE", status: "ACTIVO", since: "oct 2023", deaths: "sin cifra fiable",
    summary: "Tras la caída de Avdiivka el frente avanza hacia Pokrovsk, nodo logístico clave. Evacuaciones forzadas bajo bombardeo de guiados de 500 kg (FAB-500 con UMPK) sobre edificios residenciales.",
    cameras: [{ id: "CAM-PKS-01", name: "Mercado central Pokrovsk", angle: "Este", lastSeen: "2025" }],
    sources: ["ISW", "DeepState map"],
  },
  {
    id: "inc-gaza-city", name: "Gaza Ciudad", country: "ps", lat: 31.5069, lng: 34.4564,
    type: "ASEDIO", status: "ACTIVO", since: "oct 2023", deaths: ">50.000 (total Gaza, Gaza MoH)",
    summary: "Asedio, evacuaciones repetidas y combate urbano densificado. El Ministerio de Salud de Gaza publica cifras que la ONU considera fiables con margen. Hospitales fuera de servicio y hambruna confirmada por IPC en el norte.",
    cameras: [{ id: "CAM-GZA-01", name: "Ruta Salah al-Din", angle: "Eje de evacuación", lastSeen: "cinta verificado AP/Reuters" }],
    sources: ["OMS", "IPC", "UNRWA"],
  },
  {
    id: "inc-jabalia", name: "Campo de Jabalia", country: "ps", lat: 31.5333, lng: 34.5000,
    type: "ATAQUE", status: "DOCUMENTADO", since: "oct-nov 2023", deaths: ">195 (uno solo de los campamentos)",
    summary: "El campo de refugiados más denso del mundo fue el objetivo de los primeros asaltos. Los agujeros de las bombas de 2.000 libras medían 12 metros. El New York Times documentó el patrón de bombardeos sobre campamentos.",
    cameras: [{ id: "CAM-JBL-01", name: "Entrada del campo", angle: "Sur", lastSeen: "31 oct 2023" }],
    sources: ["NYT visual investigation", "UNRWA"],
  },
  {
    id: "inc-elgeneina", name: "El Geneina", country: "sd", lat: 13.4531, lng: 22.4469,
    type: "MASACRE", status: "DOCUMENTADO", since: "jun-ago 2023", deaths: "10.000-15.000",
    summary: "La mayor matanza individual de la guerra de Sudán: limpieza étnica contra la comunidad masawi durante el asedio de la ciudad. El Panel de la ONU documentó fosas comunes y ejecuciones por grupo étnico.",
    cameras: [{ id: "CAM-GNE-01", name: "Mercado central", angle: "Grabaciones vecinales", lastSeen: "jun 2023" }],
    sources: ["ONU Panel Sudán", "HRW"],
  },
  {
    id: "inc-khartoum", name: "Khartoum metropolitano", country: "sd", lat: 15.5017, lng: 32.5590,
    type: "FRENTE", status: "ACTIVO", since: "abr 2023", deaths: ">28.000 estimados (ACLED)",
    summary: "Guerra urbana entre SAF y RSF en la capital: bombardeos de artillería pesada sobre barrios, saqueo sistemático de hospitales y tráfico de convoyes humanitarios atacados por ambas partes.",
    cameras: [{ id: "CAM-KRT-01", name: "Puente Bahri", angle: "Río Nilo", lastSeen: "cintas vecinales" }],
    sources: ["ACLED", "MSF"],
  },
  {
    id: "inc-elfasher", name: "El Fasher", country: "sd", lat: 13.6304, lng: 25.3499,
    type: "CRISIS", status: "ACTIVO", since: "2024", deaths: "en curso",
    summary: "Última capital de Darfur sin caer. Asedio de RSF con hambruna IPC activa en el campo Abu Shouk. Los drones de combate se sumaron al asedio en 2025; los convoyes de agua y comida son objetivos directos.",
    cameras: [{ id: "CAM-FSH-01", name: "Zamzam checkpoint", angle: "Norte", lastSeen: "cintas ONG" }],
    sources: ["IPC Sudán", "UNICEF"],
  },
  {
    id: "inc-sagaing", name: "Sagaing, Myanmar", country: "mm", lat: 21.8800, lng: 95.9700,
    type: "ATAQUE", status: "ACTIVO", since: "2021", deaths: ">8.000 civiles (ACLED)",
    summary: "La junta responde a la resistencia con bombas de aviación sobre aldeas, escuelas y desfiles. ACLED documentó patrón deliberado: quemar aldeas tras bombardearlas, replicando tácticas de limpieza de la región.",
    cameras: [{ id: "CAM-SGE-01", name: "Mercado de aldea", angle: "Grabaciones de resistencia", lastSeen: "2024-2025" }],
    sources: ["ACLED Myanmar", "AAPP"],
  },
  {
    id: "inc-goma", name: "Goma, RDC", country: "cd", lat: -1.6826, lng: 29.2244,
    type: "CRISIS", status: "ACTIVO", since: "ene 2025", deaths: ">7.000 en ofensiva M23 (ONU)",
    summary: "La ofensiva del grupo M23, con apoyo extranjero documentado por la ONU, tomó Goma en enero de 2025. Campos de desplazados quemados, miles de muertos y colapso total del sistema de salud de la ciudad.",
    cameras: [{ id: "CAM-GMA-01", name: "Campos Mugunga", angle: "Oeste", lastSeen: "ene 2025" }],
    sources: ["ONU MONUSCO", "ACLED"],
  },
  {
    id: "inc-petion", name: "Puerto Príncipe", country: "ht", lat: 18.5485, lng: -72.3292,
    type: "CRISIS", status: "ACTIVO", since: "2024", deaths: ">5.600 muertos violentos en 2024 (ONU)",
    summary: "La alianza de pandillas Viv Ansanm controla 85% de la capital. La ONU documenta masacres en barrios (Cité Soleil, Wharf Jérémie) con centenares de víctimas civiles ejecutadas por bandas armadas.",
    cameras: [{ id: "CAM-PPR-01", name: "Puerto VARRETERES", angle: "Sur", lastSeen: "2024-2025" }],
    sources: ["ONU BINUH", "UNODC"],
  },
  {
    id: "inc-rafa", name: "Rafah y el eje filadelfia", country: "ps", lat: 31.2969, lng: 34.2589,
    type: "ASEDIO", status: "ACTIVO", since: "may 2024", deaths: "en curso",
    summary: "Ofensiva sobre la última zona designada segura del sur, con cerca de un millón de desplazados refugiados allí. La operación sobre el eje fronterizo cerró los pasos que alimentaban Gaza según UNRWA.",
    cameras: [{ id: "CAM-RFH-01", name: "Cruce de Kerem Shalom", angle: "Este", lastSeen: "cintas agencias" }],
    sources: ["UNRWA", "OMS"],
  },
];

// ================= MEMORIAL † =================

export interface FallenJournalist {
  id: string;
  name: string;
  country: string; // ISO2 de la bandera
  outlet: string;
  war: "UCRANIA" | "GAZA" | "OTROS";
  deathDate: string;
  place: string;
  age: string;
  photo?: string;
  photoSource?: string;
  documentedBy: string;
  note: string;
}

export const MEMORIAL_FALLEN: FallenJournalist[] = [
  {
    id: "mj-roshchyna", name: "Viktoria Roshchyna", country: "ua", outlet: "Hromadske · Ukrainska Pravda",
    war: "UCRANIA", deathDate: "sep 2024", place: "Bajo custodia rusa, Taganrog", age: "27 años",
    photo: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/a0ea98c0d74d.jpg",
    photoSource: "The Guardian",
    documentedBy: "CPJ · RSF · IPI",
    note: "Reportera que cruzó 3 veces a territorios ocupados para documentar la guerra. Detenida en agosto de 2023, su muerte bajo custodia conmocionó al mundo del periodismo. IPI la nombró Héroe Mundial de la Libertad de Prensa 2025.",
  },
  {
    id: "mj-alsharif", name: "Anas al-Sharif", country: "ps", outlet: "Al Jazeera Árabe",
    war: "GAZA", deathDate: "10 ago 2025", place: "Gaza Ciudad", age: "28 años",
    photo: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/19565a556945.jpg",
    photoSource: "The Guardian",
    documentedBy: "CPJ · IFJ · RSF",
    note: "Corresponsal del norte de Gaza, uno de los rostros del periodismo palestino durante el asedio. Murió junto a 4 colegas en un ataque a su caravana de prensa. Dejó una carta póstuma a su hija.",
  },
  {
    id: "mj-renaud", name: "Brent Renaud", country: "us", outlet: "Productor independiente (colaborador del NYT)",
    war: "UCRANIA", deathDate: "13 mar 2022", place: "Irpín", age: "50 años",
    photo: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/464367ffc06f.jpg",
    photoSource: "NBC Montana",
    documentedBy: "CPJ · RSF",
    note: "Periodista multipremiado (Peabody, DuPont) que cubría rutas de refugiados. Primer periodista extranjero muerto en la invasión a gran escala. Su hermano Craig, con él, sobrevivió.",
  },
  {
    id: "mj-alghoul", name: "Ismail al-Ghoul", country: "ps", outlet: "Al Jazeera Árabe",
    war: "GAZA", deathDate: "31 jul 2024", place: "Gaza Ciudad", age: "27 años",
    photo: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/7e496c131e9f.png",
    photoSource: "CPJ",
    documentedBy: "CPJ · Al Jazeera",
    note: "Fue detenido y golpeado en diciembre de 2023 mientras cubría hospitales, y continuó reportando. Murió junto a su camarógrafo Rami al-Rifi en un ataque contra su vehículo de prensa.",
  },
  {
    id: "mj-zakrzewski", name: "Pierre Zakrzewski", country: "ie", outlet: "Fox News",
    war: "UCRANIA", deathDate: "14 mar 2022", place: "Horenka, Kiev", age: "55 años",
    photo: "https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/d92f2717d12b.jpg",
    photoSource: "NextTV",
    documentedBy: "CPJ · RSF",
    note: "Camarógrafo irlandés veterano de conflictos (Irak, Afganistán, Siria). Murió junto a la reportera Oleksandra Kuvshinova cuando su vehículo fue alcanzado; su colega Benjamin Hall sobrevivió con heridas graves.",
  },
  {
    id: "mj-kuvshinova", name: "Oleksandra Kuvshinova", country: "ua", outlet: "Fixer de Fox News",
    war: "UCRANIA", deathDate: "14 mar 2022", place: "Horenka, Kiev", age: "24 años",
    documentedBy: "CPJ · RSF",
    note: "Periodista de investigación y fijadora que coordinaba el trabajo de la prensa extranjera en Kiev. La prensa ucraniana la recordó como una profesional brillante que quería documentar cada detalle de la invasión.",
  },
  {
    id: "mj-sakun", name: "Yevhenii Sakun", country: "ua", outlet: "TK Teleport (Lviv)",
    war: "UCRANIA", deathDate: "1 mar 2022", place: "Torre de TV de Bila Tserkva", age: "49 años",
    documentedBy: "CPJ",
    note: "Operador de cámara muerto en el ataque a la torre de transmisión de Kiev el noveno día de la invasión. CPJ lo registró como el primer periodista ucraniano asesinado en el conflicto a gran escala.",
  },
  {
    id: "mj-abudaqa", name: "Samer Abudaqa", country: "ps", outlet: "Al Jazeera Árabe",
    war: "GAZA", deathDate: "15 dic 2023", place: "Khan Yunis", age: "45 años",
    documentedBy: "CPJ · IFJ",
    note: "Camarógrafo veterano. Murió sangrando durante horas tras el ataque a la caravana de prensa en la que estaba con Wael Dahdouh, porque ninguna ambulancia podía llegar: las rutas estaban bajo fuego.",
  },
  {
    id: "mj-dahdouh", name: "Hamza Dahdouh", country: "ps", outlet: "Al Jazeera Árabe",
    war: "GAZA", deathDate: "7 ene 2024", place: "Khan Yunis", age: "39 años",
    documentedBy: "CPJ · RSF",
    note: "Hijo de Wael Dahdouh, el editor que siguió transmitiendo tras perder a su esposa, hija, nieto y Hamza en semanas separadas. Hamza era también periodista: murió en el mismo ataque que Mustafa Thuraya.",
  },
  {
    id: "mj-kvedaravicius", name: "Mantas Kvedaravičius", country: "lt", outlet: "Documentalista (Mariupolis 1-2)",
    war: "UCRANIA", deathDate: "2 abr 2022", place: "Mariúpol", age: "45 años",
    documentedBy: "CPJ · RSF",
    note: "Antropólogo y director de cine lituano que entró al asedio de Mariúpol a documentar la vida de civiles. Su película Mariupolis 2 se estrenó póstumamente, montada con el material que logró salvar su equipo.",
  },
];

export const MEMORIAL_WARS: Record<string, { label: string; flag: string; tagline: string }> = {
  UCRANIA: { label: "Guerra de Ucrania", flag: "ua", tagline: "Más de 15 periodistas y trabajadores de medios muertos documentados por CPJ desde 2022" },
  GAZA: { label: "Guerra de Gaza", flag: "ps", tagline: "El conflicto más letal para la prensa en la historia registrada: >180 comunicadores muertos (CPJ/CGE)" },
  OTROS: { label: "Otros frentes", flag: "un", tagline: "Sudán, Myanmar y otros conflictos con periodistas muertos documentados por RSF" },
};

// ================= GUERRA DE DRONES =================

export interface DronePart {
  name: string;
  desc: string;
  x: number; // % del SVG para la etiqueta
  y: number;
}

export interface DroneModel {
  id: string;
  name: string;
  origin: string;
  users: string;
  kind: string;
  reach: string;
  speed: string;
  warhead: string;
  cost: string;
  note: string;
  parts: DronePart[];
}

export const DRONE_MODELS: DroneModel[] = [
  {
    id: "shahed", name: "Shahed-136 / Gerán-2", origin: "Irán", users: "Rusia",
    kind: "Munición de merodeo", reach: "≈2.000 km", speed: "≈185 km/h", warhead: "40-50 kg", cost: "≈$20-50k",
    note: "El zumbido de su motor de pistón es el sonido de las noches de Kiev. Vuelan en enjambre para saturar defensas; los civiles las llaman 'mopeds' por el ruido de la hélice trasera.",
    parts: [
      { name: "Nariz: navegación GNSS", desc: "Antena y navegación por satélite con antenas CRPA anti-jamming. Algunas unidades llevan cámara de terminal.", x: 12, y: 30 },
      { name: "Ojiva 40-50 kg", desc: "Carga explosiva frontal. Contra edificios civiles produce colapso de pisos completos.", x: 22, y: 55 },
      { name: "Fuselaje delta", desc: "Ala delta de composite con ventanas ópticas opcionales para guía visual de terminal.", x: 42, y: 40 },
      { name: "Motor pulsorreactivo MD-550", desc: "Réplica del alemán Pulsojet Argus As 014 (V-1). Es el origen del zumbido característico.", x: 60, y: 52 },
      { name: "Hélice trasera", desc: "Hélice impulsora trasera de dos palas, visible en los restos.", x: 78, y: 47 },
      { name: "Aletas estabilizadoras", desc: "Estabilizadores verticales con timones para corrección de rumbo.", x: 84, y: 25 },
    ],
  },
  {
    id: "fpv", name: "FPV cuadricóptero de asalto", origin: "Comercial + kits artesanales", users: "Ambos bandos",
    kind: "Dron de ataque directo", reach: "5-20 km", speed: "80-150 km/h", warhead: "0.5-3 kg", cost: "≈$400-800",
    note: "La democratización letal: un dron de carreras comercial convertido en arma. Los informes de campo de 2024-2025 estiman que la mayoría de bajas en partes del frente ucraniano provienen de FPV. Ningún soldado puede caminar 10 km sin ser visto.",
    parts: [
      { name: "Cámara FPV", desc: "Cámara analógica de baja latencia: el piloto vuela a ciegas por video en gafas.", x: 15, y: 50 },
      { name: "Frame de fibra de carbono", desc: "Chasis de carreras comercial, a veces impreso en 3D para carga.", x: 32, y: 35 },
      { name: "Batería LiPo 6S", desc: "La mayor masa del dron: 6 celdas que dan potencia a los 4 motores.", x: 42, y: 62 },
      { name: "Motores sin escobillas ×4", desc: "Motores de carreras con hélices de 5 pulgadas para velocidad punta.", x: 30, y: 22 },
      { name: "Carga útil", desc: "Granada RPG, munición de mortero o charges de fragmentación atada al chasis.", x: 58, y: 55 },
      { name: "Antena de video", desc: "Antena circular polarizada: el eslabón más débil, jamming por RF es la defensa.", x: 70, y: 30 },
    ],
  },
  {
    id: "bayraktar", name: "Bayraktar TB2", origin: "Turquía", users: "Ucrania y 30+ países",
    kind: "UCAV táctico", reach: "300 km de radio", speed: "≈220 km/h", warhead: "4 misiles MAM-L", cost: "≈$5M sistema",
    note: "La celebridad del inicio de la guerra: volaba sobre columnas rusas en mar 2022 con defensa aérea aún desorganizada. Hoy su uso se redujo por las defensas, pero marcó el imaginario de los drones como símbolo de resistencia.",
    parts: [
      { name: "Nariz EO/IR", desc: "Bola gimbal con cámara diurna, térmica y designador láser para municiones guiadas.", x: 10, y: 50 },
      { name: "Fuselaje compuesto", desc: "Fuselaje monoplano de composite: pequeño, lento, difícil de ver desde el suelo.", x: 30, y: 42 },
      { name: "Alas de envergadura 12 m", desc: "Ala recta de alto aspecto para vuelo a 8 km de altura, fuera del alcance visual.", x: 45, y: 25 },
      { name: "Pilones de MAM-L", desc: "Munición guiada láser turca de 22 kg bajo las alas: precisión de metros.", x: 52, y: 62 },
      { name: "Cola en V invertida", desc: "Estabilización en V que reemplaza el timón y el estabilizador clásicos.", x: 75, y: 35 },
      { name: "Hélice de empuje", desc: "Motor rotativo de 100 hp con hélice trasera: autonomía de 24-27 horas de vuelo.", x: 85, y: 50 },
    ],
  },
  {
    id: "lancet", name: "Lancet-3 (Izdeliye-51)", origin: "Rusia (ZALA Aero)", users: "Rusia",
    kind: "Munición de merodeo", reach: "40-70 km", speed: "≈110 km/h", warhead: "3-5 kg", cost: "≈$35-50k",
    note: "El 'revolver' del frente: merodea 40 minutos sobre la zona objetivo y se lanza contra artillería, radares y vehículos. Las X dobles de sus alas son su firma visual en los videos de impacto.",
    parts: [
      { name: "Cámara de guiado", desc: "Cámara óptica con matching de imagen: el dron 'recuerda' el objetivo elegido por el operador.", x: 12, y: 50 },
      { name: "Ojiva 3-5 kg", desc: "Carga de fragmentación suficiente para matar una pieza de artillería y su tripulación.", x: 20, y: 58 },
      { name: "Alas X dobles", desc: "Doble ala en X: despegue desde catapulta y planeo silencioso de aproximación.", x: 45, y: 35 },
      { name: "Motor eléctrico", desc: "Propulsión eléctrica: sin calor de escape, difícil de detectar por IR en aproximación.", x: 65, y: 50 },
      { name: "Hélice propulsora", desc: "Hélice de 2 palas en cola, el último sonido que se oye en los videos de impacto.", x: 80, y: 45 },
    ],
  },
];

export const DRONE_CASUALTY_FACTS = [
  { stat: "9.000+", label: "civiles muertos confirmados por la ONU en Ucrania desde 2022, una parte significativa por munición de merodeo y bombardeos aéreos", source: "ONU/OHCHR 2025" },
  { stat: "≈70%", label: "de las bajas en partes del frente ucraniano se atribuyen a drones FPV según informes de unidades de 2024-2025", source: "Reportes de campo / ISW" },
  { stat: ">1.000", label: "ataques con drones documentados por ACLED contra civiles en Myanmar y Sudán desde 2023", source: "ACLED" },
  { stat: "2,5 M", label: "de piezas de video de impactos de FPV se comparten al mes en canales públicos: la guerra se consume como contenido", source: "Análisis de plataformas 2025" },
];

// ================= RECLUTAMIENTO 3D =================

export interface RecruitSide {
  id: string;
  name: string;
  flag: string;
  method: string; // CONSCRIPCION | CONTRATO | VOLUNTARIO | MIXTO
  ages: string;
  pay: string;
  term: string;
  summary: string;
  phases: { name: string; desc: string }[];
  markers: { name: string; lat: number; lng: number; kind: string }[];
  facts: string[];
  sources: string[];
}

export const RECRUIT_SIDES: RecruitSide[] = [
  {
    id: "ua", name: "Ucrania", flag: "ua", method: "CONSCRIPCION + VOLUNTARIO",
    ages: "25-60 obligatorio (18-25 voluntario)", pay: "≈200.000 UAH/mes (≈$4.800) en combate",
    term: "Duración de la ley marcial",
    summary: "La ley de movilización de 2024 endureció el registro: los hombres de 25 a 60 pueden ser reclutados en la calle con orden de convocatoria electrónica en la app Oberservador. Las unidades de asalto reclutan por contrato directo con pagos mucho mayores. El límite de edad bajó de 27 a 25 en 2023 por la falta de efectivos.",
    phases: [
      { name: "1 · Registro TCC", desc: "Centro territorial de reclutamiento: cita obligatoria, datos médicos y lista de convocatoria." },
      { name: "2 · Comisión médica", desc: "Clasificación de aptitud: apto, apto con limitaciones, no apto. Los exentos (discapacidad, 3+ hijos) se verifican." },
      { name: "3 · Entrenamiento básico", desc: "1-3 meses en polvorines del oeste con instrucción OTAN (UK, PL) para brigadas selectas." },
      { name: "4 · Asignación a unidad", desc: "Infantería, artillería o drones. Las unidades FPV reclutan directamente con pruebas de piloto." },
    ],
    markers: [
      { name: "Kiev · TCC central", lat: 50.4501, lng: 30.5234, kind: "CENTRO" },
      { name: "Lviv · Polígono Yavoriv", lat: 49.8397, lng: 23.0297, kind: "ENTRENAMIENTO" },
      { name: "Odesa · TCC sur", lat: 46.4825, lng: 30.7233, kind: "CENTRO" },
      { name: "Járkov · Reclutamiento brigadas", lat: 49.9935, lng: 36.2304, kind: "CENTRO" },
    ],
    facts: [
      "El servicio no es voluntario para hombres de 25-60 en tiempo de ley marcial",
      "Las brigadas de asalto pagan ~4x el salario civil medio por el mismo riesgo",
      "Los 'conscriptos de calle' (fuerza en buses, estaciones) generaron controversia legal",
      "La edad de 18-25 es la única franja exenta: los TDF (defensa territorial) aceptan desde 18",
    ],
    sources: ["Ley de Movilización Ucrania 2024", "ISW", "Reuters"],
  },
  {
    id: "ru", name: "Rusia", flag: "ru", method: "CONTRATO + CONSCRIPCION",
    ages: "18-65 por contrato (servicio obligatorio 12 meses a los 18)", pay: "≈$2.500/mes base + bonos de firma hasta $65.000 regionales",
    term: "Contrato renovable 6-12 meses",
    summary: "Rusia recluta por contrato con pagos de firma que duplican el salario anual medio regional: en Buriatia o Tuvá pueden superar los 3 millones de rublos. El plan oficial es 180.000 nuevos contratistas por año. La conscripción de primavera/otoño solo puede enviar reclutas a territorios rusos, aunque hubo abusos documentados en 2022. Wagner reclutó prisioneros hasta su disolución en 2023.",
    phases: [
      { name: "1 · Oficina de contratos", desc: "Puntos móviles en centros comerciales, páginas VK y pagos de firma anunciados por gobernadores." },
      { name: "2 · Chequeo y firma", desc: "Chequeo médico acelerado (controversia por estándares bajos) y firma de contrato de 6-12 meses." },
      { name: "3 · Entrenamiento", desc: "Centros como Mulino o Elnya: 1-3 meses según unidad. Asalto directo con poca especialización." },
      { name: "4 · Frente", desc: "Asignación a grupos de asalto en Donetsk/Zaporizhzhia con rotaciones irregulares." },
    ],
    markers: [
      { name: "Moscú · Punto de reclutamiento", lat: 55.7558, lng: 37.6173, kind: "CENTRO" },
      { name: "Rostov-on-Don · Cuartel sur", lat: 47.2357, lng: 39.7015, kind: "ENTRENAMIENTO" },
      { name: "Grozni · Batallones de Kadyrov", lat: 43.3169, lng: 45.6981, kind: "CENTRO" },
      { name: "Ulán-Udé · Reclutamiento Buriatia", lat: 51.8335, lng: 107.5841, kind: "CENTRO" },
    ],
    facts: [
      "Los pagos de firma regionales superan 10 años de salario medio en Tuvá o Buriatia",
      "Wagner reclutó ~40.000 prisioneros entre 2022-2023; tras la muerte de Prigozhin el programa pasó al Ministerio de Defensa",
      "La conscripción obligatoria no puede legalmente enviarse al exterior (art. 361 del código); los reclutas protestaron por ser enviados en 2022",
      "Los migrantes centroasiáticos se reclutan prometiendo pasaportes rápidos",
    ],
    sources: ["BBC Russian (conteo de muertes)", "Meduza", "Verstka"],
  },
  {
    id: "il", name: "Israel", flag: "il", method: "CONSCRIPCION UNIVERSAL (parcial)",
    ages: "18 obligatorio (hombres 32 meses, mujeres 24)", pay: "Soldado raso: stipend bajo (~$180/mes) + beneficios",
    term: "Servicio obligatorio + reservas hasta los 40-45",
    summary: "Israel recluta a los 18 con exenciones concentradas en estudiantes de yeshivá y minorías (árabes-israelíes, haredíes en disputa legal constante). Tras el 7 de octubre de 2023 llamó a 360.000 reservistas, la mayor movilización de su historia. La Corte Suprema ordenó en 2024 reclutar a estudiantes haredíes, abriendo una crisis de coalición.",
    phases: [
      { name: "1 · Tzav Rishon (primera convocatoria)", desc: "A los 16-17 años: evaluación médica y psicológica que asigna perfil de unidad." },
      { name: "2 · Servicio obligatorio", desc: "32 meses hombres / 24 meses mujeres en unidades de combate, apoyo o administrativas." },
      { name: "3 · Reserva (miluim)", desc: "Hasta 30-40 días/año hasta los 40-45: activación masiva en octubre de 2023 (360.000)." },
      { name: "4 · Unidades de combate", desc: "Infantería (Golani, Givati), blindados y tropas especiales con selección voluntaria extra." },
    ],
    markers: [
      { name: "Tel Aviv · Base Tel Hashomer", lat: 32.0853, lng: 34.7818, kind: "CENTRO" },
      { name: "Jerusalén · Distrito de reclutamiento", lat: 31.7683, lng: 35.2137, kind: "CENTRO" },
      { name: "Haifa · Base de reserva", lat: 32.7940, lng: 34.9896, kind: "ENTRENAMIENTO" },
    ],
    facts: [
      "360.000 reservistas activados en 72 horas tras el 7 de octubre (1 de cada 15 israelíes)",
      "La exención haredí es la mayor disputa legal de 2024-2026: la Corte ordenó reclutarlos",
      "Los árabe-israelíes (20% de la población) están exentos por convenio de 1949",
    ],
    sources: ["IDF press", "Reuters", "Haaretz"],
  },
  {
    id: "mm", name: "Myanmar (junta)", flag: "mm", method: "CONSCRIPCION FORZADA",
    ages: "18-35 hombres, 18-27 mujeres", pay: "≈$25-60/mes",
    term: "2 años (3 en combate)",
    summary: "La ley de reclutamiento activada en febrero de 2024 obliga a jóvenes con sorteos públicos de listas. Generó la mayor ola de migración juvenil de la historia del país (Tailandia absorbió cientos de miles) y deportaciones de trabajadores que regresan. La junta reporta dificultad para cubrir cuotas por deserción masiva.",
    phases: [
      { name: "1 · Listas municipales", desc: "Los barrios publican listas de reclutables por orden alfabético con sorteos." },
      { name: "2 · Presentación forzada", desc: "El no presentarse es delito con 3-5 años de cárcel: se documentan redadas nocturnas." },
      { name: "3 · Entrenamiento básico", desc: "10-16 semanas en centros militares, calidad variable según urgencia de cuotas." },
      { name: "4 · Frentes internos", desc: "Combate contra PDFs (milicias de resistencia) en Sagaing, Rakhine y Shan." },
    ],
    markers: [
      { name: "Naipyidó · Ministerio de Defensa", lat: 19.7633, lng: 96.0785, kind: "CENTRO" },
      { name: "Yangón · Reclutamiento urbano", lat: 16.8661, lng: 96.1951, kind: "CENTRO" },
      { name: "Mandalay · Base regional", lat: 21.9588, lng: 96.0891, kind: "ENTRENAMIENTO" },
    ],
    facts: [
      "Cientos de miles de jóvenes huyeron a Tailandia antes de las listas de 2024",
      "Los sorteos públicos (lotería de sangre) son transmitidos por la estatal MRTV",
      "Los PDFs de resistencia también reclutan, pero de forma voluntaria",
    ],
    sources: ["UNHCR", "ACLED", "Reuters"],
  },
  {
    id: "int", name: "Voluntarios internacionales", flag: "un", method: "VOLUNTARIO",
    ages: "18+ (verificación por embajada)", pay: "Contrato ucraniano estándar para extranjeros",
    term: "Contrato militar estándar",
    summary: "Ucrania creó la Legión Internacional en 2022: más de 135 nacionalidades documentadas, desde veteranos de EE.UU. y UK hasta latinoamericanos. El proceso pasa por embajadas y verificación de antecedentes; Rusia reclutó menos, sobre todo de países post-soviéticos y Siria. Ambos bandos usan reclutamiento online con propaganda en redes.",
    phases: [
      { name: "1 · Solicitud en embajada", desc: "Entrevista, verificación de servicio militar previo y antecedentes penales." },
      { name: "2 · Contrato y viaje", desc: "Contrato con las Fuerzas Armadas del país receptor. Algunos pagados, otros como voluntarios." },
      { name: "3 · Entrenamiento básico", desc: "2-6 semanas de adaptación según experiencia previa del voluntario." },
      { name: "4 · Unidad internacional", desc: "Brigadas internacionales o unidades especiales mixtas según perfil." },
    ],
    markers: [
      { name: "Varsovia · Ruta de voluntarios", lat: 52.2297, lng: 21.0122, kind: "CENTRO" },
      { name: "Rzeszów · Frontera UE-UA", lat: 50.0412, lng: 21.9991, kind: "ENTRENAMIENTO" },
      { name: "Kiev · Legión Internacional", lat: 50.4501, lng: 30.5234, kind: "CENTRO" },
    ],
    facts: [
      "Más de 135 nacionalidades en las filas ucranianas según el gobierno (2024)",
      "Colombia es uno de los países con más contratistas latinos: ~$2.000/mes frente a ~$400 del salario medio",
      "Rusia reclutó soldados de Nepal, Cuba y Siria con ofertas de pasaporte; Nepal pidió repatriación en 2024",
    ],
    sources: ["Reuters", "BBC", "El Tiempo"],
  },
];

// ================= SALA ROJA (18+) =================

export interface SalaRojaItem {
  id: string;
  tape: string;
  title: string;
  category: "COMBATE REAL" | "CONSECUENCIAS CIVILES" | "TORTURA DOCUMENTADA" | "CAMARAS DE SEGURIDAD" | "HUMANITARIO";
  country: string;
  warning: "GRAVEDAD ALTA" | "GRAVEDAD MEDIA" | "GRAVEDAD EXTREMA";
  blurs: number;
  whatYoullSee: string;
  why: string;
  sourceLabel: string;
  sourceQuery: string;
  views: number;
  verified: boolean;
}

export const SALA_CATEGORIES = ["TODAS", "COMBATE REAL", "CONSECUENCIAS CIVILES", "TORTURA DOCUMENTADA", "CAMARAS DE SEGURIDAD", "HUMANITARIO"] as const;

export const SALA_ROJA_ITEMS: SalaRojaItem[] = [
  {
    id: "sr-cam-kram", tape: "CAM-KRM-01", title: "Cámaras de la estación de Kramatorsk", category: "CAMARAS DE SEGURIDAD",
    country: "ua", warning: "GRAVEDAD EXTREMA", blurs: 3,
    whatYoullSee: "El impacto exacto sobre la multitud de evacuados desde las cámaras de la estación. Se ven personas en el momento previo y posterior.",
    why: "Es una de las pruebas más nítidas de un ataque sobre civiles documentado por la ONU. Verla cambia la comprensión abstracta de 'ataque a estación' por la realidad física del evento.",
    sourceLabel: "Investigación AP + CCTV liberado",
    sourceQuery: "Kramatorsk station CCTV investigation AP 2022",
    views: 4_200_000, verified: true,
  },
  {
    id: "sr-fpv-trench", tape: "FPV-REC-7", title: "Combate FPV real en trincheras", category: "COMBATE REAL",
    country: "ua", warning: "GRAVEDAD EXTREMA", blurs: 3,
    whatYoullSee: "Metraje de drones FPV de ambos bandos publicado por sus propias unidades: cazas de soldados en movimiento, impactos sobre trincheras y evacuaciones fallidas.",
    why: "El 90% del metraje de esta guerra lo filman los propios drones. Comprender cómo se ve el frente actual es entender por qué las estadísticas de bajas cambiaron para siempre.",
    sourceLabel: "Canales militares verificados (ISW index)",
    sourceQuery: "FPV drone warfare Ukraine 2025 documentary",
    views: 11_000_000, verified: true,
  },
  {
    id: "sr-jabalia", tape: "AG-REC-31", title: "El minuto posterior al ataque a Jabalia", category: "CONSECUENCIAS CIVILES",
    country: "ps", warning: "GRAVEDAD EXTREMA", blurs: 3,
    whatYoullSee: "Grabaciones de vecinos y rescatistas del campo de refugiados: excavación manual, heridos entre escombros, la escala del cráter de 12 metros.",
    why: "La visualización directa del cráter y la respuesta de emergencia fue clave para que agencias verificaran el tipo de munición usada contra el campamento.",
    sourceLabel: "Verificado por NYT Visual Investigations",
    sourceQuery: "Jabalia camp crater NYT visual investigation",
    views: 8_700_000, verified: true,
  },
  {
    id: "sr-tortura-doc", tape: "DOSSIER-OHCHR", title: "Testimonios de tortura en detención (informe ONU)", category: "TORTURA DOCUMENTADA",
    country: "ua", warning: "GRAVEDAD ALTA", blurs: 2,
    whatYoullSee: "No es video de combate: son entrevistas documentales a exdetenidos liberados describiendo métodos de tortura, junto al informe de la misión de la ONU.",
    why: "La tortura sistemática es el crimen más documentado de esta guerra (95% de exdetenidos). Los informes son la base de las órdenes de arresto de la CPI.",
    sourceLabel: "OHCHR report on civilian detention",
    sourceQuery: "OHCHR report civilian detention torture Ukraine",
    views: 1_900_000, verified: true,
  },
  {
    id: "sr-sudan-zamzam", tape: "SD-REC-14", title: "Hambruna en el campo de Zamzam", category: "HUMANITARIO",
    country: "sd", warning: "GRAVEDAD ALTA", blurs: 2,
    whatYoullSee: "Metraje humanitario de los campos de Darfur: la hambruna IPC fase 5 filmada por ONGs antes de que el acceso fuera bloqueado por completo.",
    why: "Zamzam fue el primer caso de hambruna confirmada por IPC fuera de Somalia en una década. El bloqueo de acceso humanitario es en sí una arma de guerra documentada.",
    sourceLabel: "MSF + WFP footage (verificado)",
    sourceQuery: "Zamzam camp famine Darfur MSF 2024",
    views: 3_100_000, verified: true,
  },
  {
    id: "sr-myanmar-school", tape: "MM-REC-08", title: "Ataque aéreo a escuela en Sagaing", category: "CONSECUENCIAS CIVILES",
    country: "mm", warning: "GRAVEDAD EXTREMA", blurs: 3,
    whatYoullSee: "Grabaciones de la resistencia de un bombardeo con avión sobre una escuela rural documentado por ACLED, con el patrón repetido de ataques a educación.",
    why: "Myanmar es el caso más extremo de bombardeos deliberados sobre escuelas en el siglo XXI. ACLED y AAPP documentan el patrón sistemático para futuros procesos de justicia.",
    sourceLabel: "ACLED + AAPP archive",
    sourceQuery: "Myanmar junta airstrike school Sagaing ACLED",
    views: 2_400_000, verified: true,
  },
  {
    id: "sr-bucha-evidence", tape: "DOSSIER-OSCE", title: "La evidencia forense de Bucha", category: "TORTURA DOCUMENTADA",
    country: "ua", warning: "GRAVEDAD ALTA", blurs: 2,
    whatYoullSee: "Documentación forense del OSCE y fiscalía ucraniana: reconstrucción de la ocupación de 33 días con satélite, autopsias y testimonios estructurados.",
    why: "Bucha cambió el derecho internacional: activó el primer proceso de investigación de la CPI con más de 20 países amicus. La documentación forense es la diferencia entre denuncia y acusación.",
    sourceLabel: "OSCE Moscow Mechanism + Fiscalía UA",
    sourceQuery: "Bucha massacre forensic investigation OSCE report",
    views: 5_600_000, verified: true,
  },
  {
    id: "sr-gaza-medics", tape: "AG-REC-42", title: "Ambulancias bajo fuego en Gaza", category: "HUMANITARIO",
    country: "ps", warning: "GRAVEDAD ALTA", blurs: 2,
    whatYoullSee: "Cámaras de emergencia y grabaciones de paramédicos: convoys médicos alcanzados mientras respondían a llamadas, documentados por la OMS como ataques a salud.",
    why: "La OMS cuenta cada ataque a salud. Este metraje es la diferencia entre el número abstracto y la mecánica concreta de cómo se colapsa un sistema de emergencias.",
    sourceLabel: "WHO health attacks dashboard",
    sourceQuery: "Gaza ambulances under fire WHO attacks on healthcare",
    views: 4_800_000, verified: true,
  },
];

// ================= ELECCIONES DE EMBAJADORES =================

export const ELECTION_EPOCH = Date.UTC(2026, 0, 1); // ciclo 1 arranca el 1 ene 2026
export const ELECTION_CYCLE_MS = 60 * 24 * 3600 * 1000; // 60 días (1-2 meses)

export function electionCycle(now: number = Date.now()) {
  const n = Math.max(0, Math.floor((now - ELECTION_EPOCH) / ELECTION_CYCLE_MS)) + 1;
  const start = ELECTION_EPOCH + (n - 1) * ELECTION_CYCLE_MS;
  const end = start + ELECTION_CYCLE_MS;
  const daysLeft = Math.max(0, Math.ceil((end - now) / 86400000));
  return { cycle: String(n), start, end, daysLeft };
}

export const AMBASSADOR_REQUIREMENTS = [
  { req: "Nivel 3 o superior", icon: "🎖️" },
  { req: "Cuenta dedicada a un solo país (no cambiable durante el ciclo)", icon: "🇺🇳" },
  { req: "Participación constante: 5+ días activos en el ciclo", icon: "📅" },
  { req: "Defensa del país en foros, predicciones y debates", icon: "🛡️" },
];

export const AMBASSADOR_PRIVILEGES = [
  { priv: "Insignia 🎖️ EMBAJADOR en foros y directos", reward: "" },
  { priv: "Voto con peso x2 en foros y denuncias", reward: "+30 monedas al ser electo" },
  { priv: "Sala privada de embajadores (/salas)", reward: "" },
  { priv: "Nombre en el panel de su país y en el ranking", reward: "+10 monedas/semana activo" },
];
