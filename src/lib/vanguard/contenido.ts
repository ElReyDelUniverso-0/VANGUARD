// ============================================================
// VANGUARD v170.0 — CONTENIDO DE ARCHIVO
// Salas de archivo y fuentes narrativas. Texto propio de la red,
// basado en historia de dominio público y fuentes abiertas.
// ============================================================

import type { Fila } from "./tipos";

// ── RED MUNDIAL: servicios de inteligencia (datos públicos) ──
const SERVICIOS: { nombre: string; pais: string; fundacion: string; sede: string; nota: string; color: string }[] = [
  { nombre: "CIA", pais: "Estados Unidos", fundacion: "1947", sede: "Langley, Virginia", nota: "Nació con la Ley de Seguridad Nacional de 1947, heredando la OSS de la Segunda Guerra Mundial.", color: "text-amber-300" },
  { nombre: "MI6 / SIS", pais: "Reino Unido", fundacion: "1909", sede: "Londres", nota: "Desciende del Servicio Secreto de Inteligencia creado antes de la Gran Guerra; su existencia fue reconocida oficialmente en 1994.", color: "text-emerald-300" },
  { nombre: "Mossad", pais: "Israel", fundacion: "1949", sede: "Tel Aviv", nota: "El Instituto de Inteligencia y Operaciones Especiales, famoso por operaciones de rescate y extracción a escala global.", color: "text-cyan-300" },
  { nombre: "FSB", pais: "Rusia", fundacion: "1995", sede: "Moscú (Lubyanka)", nota: "Sucesor directo del KGB doméstico; ocupa la misma silla que la Cheka de 1917.", color: "text-red-300" },
  { nombre: "DGSE", pais: "Francia", fundacion: "1982", sede: "París", nota: "Reorganizada por Mitterrand sobre la antigua SDECE; núcleo de la doctrina de autonomía europea.", color: "text-violet-300" },
  { nombre: "BND", pais: "Alemania", fundacion: "1956", sede: "Berlín", nota: "Refundada sobre la Gehlen Organization, la red norteamericana reclutada al final de la guerra.", color: "text-yellow-300" },
  { nombre: "MSS", pais: "China", fundacion: "1983", sede: "Pekín", nota: "El Ministerio de Seguridad del Estado unificó los servicios de inteligencia política y contraespionaje chinos.", color: "text-rose-300" },
  { nombre: "ISI", pais: "Pakistán", fundacion: "1948", sede: "Islamabad", nota: "Creada tras la primera guerra indo-pakistaní; actor central de la región de Asia del Sur.", color: "text-lime-300" },
  { nombre: "GCHQ", pais: "Reino Unido", fundacion: "1919", sede: "Cheltenham", nota: "La hermanita electrónica del MI6: señales, cifrados y la base del pacto UKUSA con EE.UU.", color: "text-teal-300" },
  { nombre: "ASIS", pais: "Australia", fundacion: "1952", sede: "Canberra", nota: "El ojo australiano del pacto Cinco Ojos, centrado en Asia-Pacífico.", color: "text-orange-300" },
];

export function filasRedMundial(): Fila[] {
  return [
    { tipo: "texto", titulo: "EL PACTO QUE NO FIRMA PERIÓDICOS", cuerpo: "En 1946, un acuerdo informal entre Reino Unido y Estados Unidos sentó la base de la mayor alianza de escucha del planeta: UKUSA. Hoy los «Cinco Ojos» comparten señales a escala global. Estos son los servicios que mueven el poder invisible." },
    ...SERVICIOS.map((s) => ({
      tipo: "lista" as const,
      titulo: `${s.nombre} — ${s.pais}`,
      items: [
        { principal: `Fundación ${s.fundacion} · Sede: ${s.sede}`, secundario: s.nota, color: s.color },
      ],
    })),
  ];
}

// ── BIBLIOTECA: expedientes desclasificados ──────────────────
const EXPEDIENTES: { codigo: string; titulo: string; nivel: string; resumen: string; color: string }[] = [
  { codigo: "EXP-001", titulo: "OPERACIÓN PAPERCLIP", nivel: "ABIERTO", resumen: "El programa secreto de EE.UU. que reclutó a más de 1.600 científicos alemanes tras 1945. Los cohetes que llegaron a la Luna despegaron de dos historias distintas.", color: "text-amber-300" },
  { codigo: "EXP-002", titulo: "LA CORTINA DE HIERRO Y EL TÚNEL DE BERLÍN", nivel: "ABIERTO", resumen: "Operation Gold (1955-56): la CIA y el MI6 cavaron un túnel bajo el Berlín dividido para interceptar cables soviéticos. Un espía doble lo vendió antes de empezar.", color: "text-emerald-300" },
  { codigo: "EXP-003", titulo: "DOCTRINA DE LA DISUASIÓN NUCLEAR", nivel: "NIVEL 2", resumen: "MAD: destrucción mutua asegurada. La lógica según la cual dos arsenales capaces de aniquilarse mantienen la paz por puro terror racional.", color: "text-red-300" },
  { codigo: "EXP-004", titulo: "BANDERA FALSA: MANUAL DE OPERACIÓN", nivel: "NIVEL 3", resumen: "Cómo funcionan las operaciones de atribución encubierta: financiar, acusar, desviar. El manual que todo verificador de CENTINELA debería memorizar.", color: "text-violet-300" },
  { codigo: "EXP-005", titulo: "EL INCIDENTE DEL GOLFO DE TONKÍN", nivel: "ABIERTO", resumen: "1964: dos presuntos ataques navales justificaron la escalada en Vietnam. El segundo probablemente nunca ocurrió. La desinformación puede declarar guerras.", color: "text-rose-300" },
  { codigo: "EXP-006", titulo: "ECHELON Y LA ESCUCHA GLOBAL", nivel: "NIVEL 2", resumen: "La red de intercepción de satélites de los Cinco Ojos, confirmada por el Parlamento Europeo en 2001. El antepasado directo de la vigilancia moderna.", color: "text-cyan-300" },
  { codigo: "EXP-007", titulo: "LA GUERRA DE LAS BANDAS HF", nivel: "ABIERTO", resumen: "Números en onda corta: estaciones fantasma que emiten listas de cifras para agentes dormidos. Los UVB-76 siguen emitiendo hoy, nadie reclama autoría.", color: "text-teal-300" },
  { codigo: "EXP-008", titulo: "STUXNET: EL PRIMER CIBERARMA", nivel: "NIVEL 3", resumen: "El gusano que sabotearó centrífugas iraníes en 2010 sin disparar un solo tiro: cuatro vulnerabilidades de día cero y un salto de fe en código.", color: "text-orange-300" },
  { codigo: "EXP-009", titulo: "OPERACIÓN MOFAR ARENA", nivel: "NIVEL 4", resumen: "El caso de los teléfonos trampa vendidos a gobiernos aliados y enemigos por igual. Cuando el hardware escucha, ningún software basta.", color: "text-yellow-300" },
  { codigo: "EXP-010", titulo: "LOS CINCO OJOS Y MÁS ALLÁ", nivel: "ABIERTO", resumen: "UKUSA creció: Nueve Ojos, Catorce Ojos. La alianza de escucha se expande por niveles de confianza como una hermandad con grados.", color: "text-lime-300" },
];

export function filasBiblioteca(): Fila[] {
  return EXPEDIENTES.map((e) => ({
    tipo: "lista" as const,
    titulo: `${e.codigo} · ${e.titulo}`,
    items: [
      { principal: `Nivel de acceso: ${e.nivel}`, secundario: e.resumen, color: e.color },
    ],
  }));
}

// ── ROSTROS: jerarquías del poder (perfiles ficticios-documentales) ──
const ROSTROS: { alias: string; rol: string; indice: number; cable: string }[] = [
  { alias: "EL CARTÓGRAFO", rol: "Arquitecto de alianzas", indice: 972, cable: "Nunca firma, siempre convoca. Su poder es la agenda de los demás." },
  { alias: "LA VIUDA GRIS", rol: "Maestra de la información", indice: 940, cable: "Sabe qué titular muere y cuál vive. Su archivo vale más que su ejército." },
  { alias: "BANQUERO NOCTURNO", rol: "Finanzas del underground", indice: 908, cable: "Mueve capital donde los bancos no llegan. Detesta las cámaras y las monedas con cara." },
  { alias: "EL TÉCNICO", rol: "Señales y criptografía", indice: 881, cable: "Si tu teléfono vibra dos veces seguidas, fue una prueba. La tercera es una orden." },
  { alias: "CÓNSUL DE SAL", rol: "Fronteras y contrabando", indice: 855, cable: "Todo paso fronterizo tiene un precio; él conoce la lista exacta desde 1998." },
  { alias: "LA ANALISTA", rol: "Verificación y verdad", indice: 812, cable: "La única que publica retractiones cuando se equivoca. Por eso su palabra pesa el doble." },
];

export function filasRostros(): Fila[] {
  return [
    { tipo: "texto", titulo: "LA JERARQUÍA INVISIBLE", cuerpo: "Perfiles compilados por la red a partir de fuentes abiertas, patrones y rumores verificados. El índice de influencia (0-1000) mide capacidad real de mover el mundo, no fama." },
    ...ROSTROS.map((r) => ({
      tipo: "lista" as const,
      titulo: `${r.alias} · ÍNDICE ${r.indice}`,
      items: [
        { principal: r.rol, secundario: r.cable, color: "text-violet-300" },
      ],
    })),
  ];
}

// ── ESPECTRO: doctrina de escucha ────────────────────────────
export function filasEspectro(): Fila[] {
  return [
    { tipo: "texto", titulo: "DOCTRINA DE ESCUCHA", cuerpo: "El espectro electromagnético es el segundo mapa del mundo. Quien escucha bien,anticipa. Estas son las bandas y protocolos que todo operador debe reconocer." },
    { tipo: "lista", titulo: "CANAL 16 MARÍTIMO (156.8 MHz)", items: [{ principal: "Emergencia y llamada", secundario: "VHF marítimo mundial. Guardado por guardacostas de todas las naciones; todo bote lo escucha.", color: "text-cyan-300" }] },
    { tipo: "lista", titulo: "BANDA HF 3-30 MHz", items: [{ principal: "Larga distancia sin satélites", secundario: "Rebota en la ionosfera: cruza océanos con watts. Aquí viven los números en onda corta y las emisoras clandestinas.", color: "text-teal-300" }] },
    { tipo: "lista", titulo: "ADS-B (1090 MHz)", items: [{ principal: "Rastreo aéreo civil", secundario: "Cada avión transmite posición, velocidad y altitud en abierto. Cualquier antena de 20 $ escucha el cielo entero.", color: "text-emerald-300" }] },
    { tipo: "lista", titulo: "AIS (161.975 MHz)", items: [{ principal: "Identificación de buques", secundario: "El ADS-B del mar: nombre, rumbo y destino de cada cargo, tanquer y buque que declara su carga.", color: "text-blue-300" }] },
    { tipo: "lista", titulo: "UVB-76 · 4625 kHz", items: [{ principal: "El zumbador ruso", secundario: "Emite un zumbido desde los años 70. Voces ocasionales leen códigos. Nadie ha reclamado nunca su propiedad.", color: "text-red-300" }] },
  ];
}

// ── CARTELES: organizaciones (historia documental) ───────────
const ORGANIZACIONES: { nombre: string; origen: string; nota: string }[] = [
  { nombre: "LA CÓRSA CANALLA", origen: "Caribe, siglo XVII", nota: "Hermandad de corsarios con código propio: reparto por acción, seguro de mutilación. El primer modelo corporativo criminal documentado." },
  { nombre: "LA TRIADA DEL LOTUS", origen: "Cantón, 1760s", nota: "Redes comerciales que sobrevivieron a tres imperios cambiando de nombre, ruta y mercancía cada generación." },
  { nombre: "LOS CORREDORES DE SAL", origen: "Ruta de la Seda oriental", nota: "Contrabando de sal en era imperial: la sal era moneda, y su rastro clandestino dibujó las primeras fronteras fiscales." },
  { nombre: "LA FEDERACIÓN ATLÁNTICA", origen: "Años 1920", nota: "Destilado de la prohibición: cuando un bien legal se vuelve ilegal, el mercado no desaparece — se organiza." },
  { nombre: "LOS INGENIEROS DEL PÁNAMO", origen: "América Central, siglo XX", nota: "Rutas de tránsito que convirtieron un canal en un cuello de botella económico y en un tablero de poder." },
  { nombre: "EL SINDICATO DE LAS NUBES", origen: "Dorado de los años 70", nota: "Blanqueo moderno: primero casinos, luego inmobiliarias, hoy cripto. El método cambia; el principio, nunca." },
  { nombre: "LA RED KARSK", origen: "Archivos desclasificados", nota: "Operación de cobertura comercial que mantuvo activa una red de influencia durante tres décadas sin un solo registro contable público." },
];

export function filasCarteles(): Fila[] {
  return ORGANIZACIONES.map((o) => ({
    tipo: "lista" as const,
    titulo: o.nombre,
    items: [{ principal: `Origen: ${o.origen}`, secundario: o.nota, color: "text-amber-300" }],
  }));
}
