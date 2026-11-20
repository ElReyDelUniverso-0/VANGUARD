// ═══════════════════════════════════════════════════════════════════
// v420.1 · MISIÓN 09 · EL REGISTRO DE LAS QUINCE SECCIONES
//
// Fuente única del centro. La página /resiliencia/<id> no conoce el contenido
// de ninguna sección: lee de aquí. Y el índice de la portada, el sitemap, la
// API /api/resiliencia y el buscador de la casa salen del mismo array, así que
// una sección nueva es una entrada más, no una página que se olvida.
//
//   1 · el centro ………………… /resiliencia            (la portada)
//   2-15 · las catorce secciones … /resiliencia/<id>
//   + la herramienta ……………… /resiliencia/evaluacion   (COMMUNITY RESILIENCE)
//   + los países ………………… /resiliencia/recursos/<iso>
// ═══════════════════════════════════════════════════════════════════

import type { Bloque, CifraCentro, Seccion } from "./tipos";
import { PELIGROS } from "./peligros";
import { GUIAS } from "./guias";
import { PLAN_FAMILIAR, FICHA_CONTACTO, CONTINUIDAD } from "./familias";
import { QUE_ES_PC, CADENA, AVISOS, SIMULACROS, PC_FUENTE } from "./proteccion";
import { ORGANISMOS_GLOBALES, PAISES, NOTA_VERIFICACION } from "./organismos";
import { AMBITOS, REVISION_ANUAL, PREVEN_FUENTE } from "./prevencion";
import { RECUPERACION, FASES_RECUPERACION } from "./recuperacion";
import { LECCIONES, RUTAS } from "./biblioteca";
import { LISTAS } from "./listas";
import { INCLUSION, BARRERAS } from "./accesibilidad";
import { CORTES } from "./servicios";
import { CANALES, ARBOL_LLAMADAS, REGLAS_BULOS, COMUNICACION_ACCESIBLE, QUE_SE_COMUNICA } from "./comunicacion";
import { GLOSARIO } from "./glosario";

/** El encuadre que la casa repite en cada página del centro. No es un
 *  adorno legal: es la línea roja de la MISIÓN 09 hecha texto. */
export const ENCUADRE = {
  titulo: "Qué es y qué no es este centro",
  texto:
    "Es material educativo de prevención, preparación y recuperación comunitaria. NO emite alertas, NO declara emergencias, NO valora la situación real de ningún territorio y NO certifica a nadie: eso solo lo hace la autoridad oficial de protección civil de tu país. Aquí no hay instrucciones de violencia, ataques ni sabotaje: este centro existe para que la gente cuide a la gente.",
  datosVivos:
    "¿Quieres saber qué está pasando de verdad? La casa tiene los datos observados, con su hora y su fuente: terremotos del USGS en /pulso-mundial, y el monitor de alerta temprana en /centinela.",
};

export const FUENTES_CENTRO = [
  "Ready.gov (FEMA) · «Get a Kit, Make a Plan, Be Informed» y guías por peligro",
  "IFRC · Federación Internacional: preparación comunitaria, VCA, apoyo psicosocial",
  "UNDRR · Marco de Sendai para la Reducción del Riesgo de Desastres 2015-2030 y «Making Cities Resilient 2030»",
  "OMS · comunicación de riesgos, calidad del aire, agua y saneamiento, primeros auxilios psicológicos",
  "OCHA · coordinación de asistencia humanitaria y evaluación de necesidades",
  "Servicios meteorológicos y geológicos nacionales (AEMET, ONAMET, SMN, SHOA, IDEAM, JMA, IMD, DWD, Met Office…)",
];

// ─────────────────────────────────────────────────────────────── bloques
const bloquePeligrosIntro: Bloque[] = [
  {
    tipo: "prosa",
    items: [
      "Doce fichas de peligro natural. Cada una dice qué es el fenómeno, cómo lo mide la ciencia, qué señales enseña el propio terreno, qué cifras lo dimensionan y qué mitos hay que quitar de en medio para no morir de una creencia.",
      "Ninguna ficha habla de lo que está pasando hoy: un centro educativo que imita a un boletín de alerta es exactamente lo que la MISIÓN 09 prohibió construir.",
    ],
  },
];

const bloquesGuias: Bloque[] = [
  {
    tipo: "prosa",
    items: [
      "Doce guías por tipo de emergencia, todas con el mismo esqueleto: qué hacer ANTES (lo único que se puede hacer bien), DURANTE (lo que salva) y DESPUÉS (lo que evita el segundo desastre), más lo que no se hace y la mirada de inclusión.",
    ],
  },
  {
    tipo: "columnas",
    items: GUIAS.map((g) => ({
      area: g.nombre,
      lema: g.lema,
      columnas: [
        { titulo: "Antes", items: g.antes },
        { titulo: "Durante", items: g.durante },
        { titulo: "Después", items: g.despues },
        { titulo: "Nunca se hace", items: g.noHagas },
      ],
      nota: g.inclusion,
      fuente: g.fuente,
    })),
  },
];

const bloquesFamilia: Bloque[] = [
  {
    tipo: "prosa",
    items: [
      "Continuidad familiar es la palabra adulta: que la vida de tu casa siga funcionando cuando se corta la luz, cuando hay que salir en cinco minutos o cuando hay que volver a una casa dañada.",
    ],
  },
  {
    tipo: "pasos",
    titulo: "El plan familiar en siete pasos",
    items: PLAN_FAMILIAR.map((p) => ({ titulo: `${p.n}. ${p.titulo}`, texto: `${p.texto}\n\nPara rellenar: ${p.decision}` })),
  },
  {
    tipo: "tabla",
    titulo: "La ficha de contacto: lo único que hay que rellenar",
    cabeceras: ["Campo", "Para qué sirve", "Cómo se rellena bien"],
    filas: FICHA_CONTACTO.map((f) => [f.campo, f.paraQue, f.ejemplo]),
  },
  {
    tipo: "columnas",
    titulo: "Seis frentes de continuidad",
    items: CONTINUIDAD.map((c) => ({
      area: c.area,
      lema: c.lema,
      columnas: [
        { titulo: "Antes", items: c.antes },
        { titulo: "Durante", items: c.durante },
        { titulo: "Después", items: c.despues },
      ],
      fuente: c.fuente,
    })),
  },
];

const bloquesProteccion: Bloque[] = [
  {
    tipo: "conceptos",
    items: QUE_ES_PC.map((c) => ({ titulo: c.titulo, texto: c.texto })),
  },
  {
    tipo: "tabla",
    titulo: "Quién responde en cada minuto",
    cabeceras: ["Quién", "Qué hace", "Cuándo empieza"],
    filas: CADENA.map((c) => [c.quien, c.queHace, c.cuandoEmpieza]),
  },
  {
    tipo: "tabla",
    titulo: "El vocabulario de los avisos, traducido a conducta",
    cabeceras: ["Palabra", "Qué significa", "Qué haces tú"],
    filas: AVISOS.map((a) => [a.palabra, a.significa, a.tuHaces]),
  },
  {
    tipo: "conceptos",
    titulo: "Los simulacros, bien hechos",
    items: SIMULACROS.map((s) => ({ titulo: s.titulo, texto: s.texto })),
  },
  { tipo: "aviso", titulo: "Nadie de esta casa declara nada", texto: ENCUADRE.texto },
  { tipo: "fuente", texto: PC_FUENTE },
];

const bloquesPrevencion: Bloque[] = [
  {
    tipo: "prosa",
    items: [
      "Recomendaciones organizadas por donde se vive, no por peligro: nadie hace una «lista de prevención de sismo», se hacen cosas en casa, en el portal, en la escuela, en el trabajo y en el ayuntamiento. Esas cosas cubren ocho peligros a la vez.",
    ],
  },
  ...AMBITOS.map<Bloque>((a) => ({
    tipo: "conceptos",
    titulo: `${a.nombre} · ${a.lema}`,
    items: a.rec.map((r) => ({ titulo: r.titulo, texto: r.texto, etiqueta: r.coste })),
  })),
  ...REVISION_ANUAL.map<Bloque>((r) => ({
    tipo: "lista",
    titulo: `Revisión de ${r.cuando}`,
    items: r.comprobaciones,
  })),
  { tipo: "fuente", texto: PREVEN_FUENTE },
];

const bloquesRecuperacion: Bloque[] = [
  {
    tipo: "prosa",
    items: [
      "La recuperación es la fase que nadie filma y la que decide cuántos años tarda una comunidad en volver a ser ella misma. Estas siete guías van por tiempo real, de las primeras setenta y dos horas a los años.",
    ],
  },
  {
    tipo: "tabla",
    titulo: "Las cuatro fases, con su foco",
    cabeceras: ["Fase", "Cuándo", "De qué se ocupa"],
    filas: FASES_RECUPERACION.map((f) => [f.nombre, f.cuando, f.foco]),
  },
  {
    tipo: "columnas",
    items: RECUPERACION.map((g) => ({
      area: g.titulo,
      lema: g.lema,
      columnas: [
        { titulo: "Qué hacer", items: g.pasos },
        { titulo: "Qué puedes exigir", items: g.derechos },
        { titulo: "No hagas", items: g.noHagas },
      ],
      nota: g.fase,
      fuente: g.fuente,
    })),
  },
  {
    tipo: "aviso",
    titulo: "Antes de reclamar, registra",
    texto:
      "La parte del desastre que se gana con papel se pierde por no haberla escrito: fotos fechadas, parte al seguro en plazo, informe de la autoridad y copia de todo. Un barrio con expediente se recupera; un barrio con fotos sueltas, no.",
  },
];

const bloquesBiblioteca: Bloque[] = [
  {
    tipo: "prosa",
    items: [
      "Doce lecciones de fondo. No son consejos: son las ideas que cambian cómo se mira un mapa de inundación, una alarma o un presupuesto municipal.",
    ],
  },
  {
    tipo: "lecciones",
    items: LECCIONES.map((l) => ({
      titulo: l.titulo,
      idea: l.idea,
      claves: l.claves,
      sirve: l.sirve,
      nivel: l.nivel,
      fuente: l.fuente,
      ver: l.ver,
    })),
  },
  {
    tipo: "conceptos",
    titulo: "Rutas de lectura según de dónde partas",
    items: RUTAS.map((r) => ({ titulo: r.nombre, texto: r.pasos.join(" → ") })),
  },
];

const bloquesAccesibilidad: Bloque[] = [
  {
    tipo: "prosa",
    items: [
      "La regla que ordena esta sección: una evacuación es tan rápida como la persona más lenta del edificio. La preparación inclusiva no es un capítulo solidario, es el cálculo del tiempo real de salida.",
    ],
  },
  {
    tipo: "conceptos",
    titulo: "Cinco principios",
    items: INCLUSION.principios.map((p) => ({ titulo: p.titulo, texto: p.texto })),
  },
  {
    tipo: "columnas",
    titulo: "Barrera y solución, perfil por perfil",
    items: BARRERAS.map((b) => ({
      area: b.perfil,
      lema: b.barrera,
      columnas: [
        { titulo: "Se resuelve antes", items: [b.solucionAntes] },
        { titulo: "Se resuelve durante", items: [b.solucionDurante] },
      ],
    })),
  },
  { tipo: "lista", titulo: "La comprobación de siete preguntas", items: INCLUSION.checklist },
  { tipo: "fuente", texto: INCLUSION.fuente },
];

const bloquesServicios: Bloque[] = [
  {
    tipo: "prosa",
    items: [
      "El caso más frecuente y el peor tratado: se corta el agua o la luz, la gente se queda sin nevera, sin bomba de agua y sin ascensor, y improvisa a las once de la noche. Aquí está ese manual, con las cifras frías.",
    ],
  },
  {
    tipo: "columnas",
    items: CORTES.map((c) => ({
      area: c.titulo,
      lema: c.lema,
      nota: c.señales[0],
      columnas: [
        { titulo: "Cómo se anuncia", items: c.señales },
        { titulo: "Antes", items: c.antes },
        { titulo: "Durante", items: c.durante },
        { titulo: "Después", items: c.despues },
      ],
      fuente: c.fuente,
    })),
  },
  {
    tipo: "tabla",
    titulo: "Las cifras que hay que tener en la cabeza",
    cabeceras: ["Qué", "Cuánto", "De dónde sale y qué significa"],
    filas: CORTES.flatMap((c) => c.cifras.map((x) => [x.etiqueta, x.valor, x.nota])),
  },
  {
    tipo: "aviso",
    titulo: "El riesgo silencioso del corte largo",
    texto:
      "Velas, braseros, barbacoas y grupos electrógenos dentro de la casa matan por monóxido de carbono: un gas sin olor, sin color y sin gracia. Un detector cuesta menos que una habitación; el generador va fuera, siempre fuera, aunque llueva.",
  },
];

const bloquesComunicacion: Bloque[] = [
  {
    tipo: "prosa",
    items: [
      "En un desastre, la infraestructura crítica no es el puente: es el canal por el que la comunidad sabe qué hacer y dónde está la gente. Estas son las reglas que se pueden aplicar mañana.",
    ],
  },
  {
    tipo: "tabla",
    titulo: "Cada canal, con su fuerza y su fracaso",
    cabeceras: ["Canal", "Para qué sirve", "En qué falla", "La regla que lo hace funcionar"],
    filas: CANALES.map((c) => [c.canal, c.sirve, c.falla, c.regla]),
  },
  {
    tipo: "conceptos",
    titulo: ARBOL_LLAMADAS.titulo,
    items: [
      { titulo: "Los cuatro niveles", texto: ARBOL_LLAMADAS.niveles.join("\n") },
      { titulo: "Por qué funciona", texto: ARBOL_LLAMADAS.texto },
      { titulo: "La regla de oro", texto: ARBOL_LLAMADAS.nota },
    ],
  },
  {
    tipo: "tabla",
    titulo: QUE_SE_COMUNICA.titulo,
    cabeceras: ["Campo", "Cómo se escribe"],
    filas: QUE_SE_COMUNICA.campos.map((c) => [c.campo, `${c.texto}`]),
  },
  {
    tipo: "lista",
    titulo: REGLAS_BULOS.titulo,
    items: REGLAS_BULOS.reglas,
  },
  {
    tipo: "lista",
    titulo: COMUNICACION_ACCESIBLE.titulo,
    items: COMUNICACION_ACCESIBLE.puntos,
  },
  { tipo: "fuente", texto: `${REGLAS_BULOS.fuente} · ${COMUNICACION_ACCESIBLE.fuente}` },
];

const bloquesRecursos: Bloque[] = [
  {
    tipo: "prosa",
    items: [
      "Los recursos oficiales de cada país están en la ficha de ese país: /resiliencia/recursos/<país>. Cada ficha dice a quién llamar, cómo llega el aviso, qué marco rige y qué organismos responden en el territorio. Lo que aquí se añade es el criterio para leer esa ficha y la capa internacional que sostiene todo lo demás.",
    ],
  },
  {
    tipo: "conceptos",
    titulo: "Qué contiene una ficha de país y por qué está redactada así",
    items: [
      { titulo: "El número, con su nota", texto: "Solo se publican números de dominio público y estables. Donde no hay certeza, la ficha no inventa: manda a la autoridad local. Un número mal escrito en una emergencia cuesta vidas, así que la honestidad vale más que el detalle." },
      { titulo: "Cómo llega el aviso", texto: "Cell broadcast, sirena, radio, boletín, puerta a puerta: saber cuál usa tu país es lo que decide si el aviso te encuentra despierto. Y si tu país no tiene un sistema público, la última milla la tienes que construir tú con el barrio." },
      { titulo: "Qué peligros son los tuyos", texto: "La ficha enlaza con las fichas de peligro por exposición habitual según la bibliografía pública de los organismos. No es un ranking ni una predicción: es un índice de por dónde empezar a leer." },
      { titulo: "El marco y quién manda", texto: "El plan nacional, la ley y la cadena de mando determinan qué se te puede exigir y qué puedes exigir tú. Un derecho que no se conoce no se reclama." },
    ],
  },
  {
    tipo: "tabla",
    titulo: "La capa internacional: qué hace cada uno y a quién se le pide cuenta",
    cabeceras: ["Organismo", "Siglas", "Qué hace por ti"],
    filas: ORGANISMOS_GLOBALES.map((o) => [o.nombre, o.siglas ?? "—", o.rol]),
  },
  {
    tipo: "lista",
    titulo: "Cómo usar la ficha de tu país (diez minutos)",
    items: [
      "Anota el número de emergencias y el de tu ayuntamiento en la nevera y en la mochila.",
      "Busca quién emite la alerta en tu zona y actívala en el móvil si existe (cell broadcast o app oficial).",
      "Guarda el enlace o el nombre del canal oficial y decide con quién lo compartes en el grupo del barrio.",
      "Mira tu ficha de país en /mundos: ahí está la geografía que explica por qué te toca lo que te toca.",
      "Si tu país no está en el directorio, usa la capa internacional y reclama a tu municipio el plan que falta.",
      "Actualiza la ficha una vez al año, con la revisión de la mochila.",
    ],
  },
  { tipo: "aviso", titulo: "Verificación antes de confiar", texto: NOTA_VERIFICACION },
];

const introListas: Bloque[] = [
  {
    tipo: "prosa",
    items: [
      "Ocho listas de preparación. Criterio de diseño: una lista que no se puede completar en una tarde con lo que ya hay en casa no se completa nunca. Cada una declara su tiempo real y ninguna obliga a comprar nada prescindible.",
    ],
  },
];

const introGlosario: Bloque[] = [
  {
    tipo: "prosa",
    items: [
      "Treinta y cinco términos de protección civil y gestión del riesgo, definidos como los usan los organismos y traducidos a lenguaje de casa. La diferencia entre «amenaza» y «riesgo» es la línea que separa a quien se prepara de quien se asusta.",
    ],
  },
];

// ─────────────────────────────────────────────────────────── el registro
export const SECCIONES: Seccion[] = [
  {
    n: 2,
    id: "guias",
    titulo: "Guías por tipo de emergencia",
    lema: "Antes, durante y después de lo que puede pasarle a tu casa.",
    resumen: `Doce guías educativas por tipo de emergencia (${GUIAS.length} fichas), con lo que se hace antes, durante y después, lo que nunca se hace y la mirada de inclusión para quien necesita más tiempo o más apoyo.`,
    icono: "book-open",
    vista: "bloques",
    bloques: bloquesGuias,
    saleA: [
      { ruta: "/resiliencia/peligros", etiqueta: "La ficha del peligro", porque: "Antes de la conducta viene la comprensión: cómo se mide y qué señales enseña." },
      { ruta: "/pulso-mundial", etiqueta: "Los datos vivos", porque: "Sismos y señales observadas de verdad, con su hora y su fuente." },
      { ruta: "/mundos", etiqueta: "El país donde ocurre", porque: "La exposición es geográfica: la ficha del país explica por qué te toca lo que te toca." },
    ],
  },
  {
    n: 3,
    id: "peligros",
    titulo: "Fichas de peligros naturales",
    lema: "Qué es cada peligro, cómo se mide y qué señales enseña el terreno.",
    resumen: `${PELIGROS.length} fichas de peligro natural: qué es, cómo lo mide la ciencia, qué señales da el propio terreno, cifras para dimensionarlo, mitos desmontados y qué lo reduce. Ninguna ficha emite alertas.`,
    icono: "mountain",
    vista: "fichas",
    bloques: bloquePeligrosIntro,
    saleA: [
      { ruta: "/resiliencia/guias", etiqueta: "La guía de conducta", porque: "Cada ficha termina en un «qué hago»; aquí está el detalle por emergencia." },
      { ruta: "/mapas", etiqueta: "Verlo en el globo", porque: "El territorio donde el peligro vive, con las capas de la casa encima." },
      { ruta: "/pulso-mundial", etiqueta: "El planeta medido ahora", porque: "Si buscas lo que está pasando, eso lo dicen los datos observados, no una guía." },
    ],
  },
  {
    n: 4,
    id: "familia",
    titulo: "Guías de continuidad familiar",
    lema: "Que la vida de tu casa siga funcionando cuando algo se corta.",
    resumen: "El plan familiar en siete pasos, la ficha de contacto para rellenar y seis frentes de continuidad (agua, energía, alimentación, documentos, escuela y cuidados, animales) con su antes, durante y después.",
    icono: "home",
    vista: "bloques",
    bloques: bloquesFamilia,
    saleA: [
      { ruta: "/resiliencia/listas", etiqueta: "La mochila y las listas", porque: "El plan se sostiene en cosas concretas que hay que tener preparadas." },
      { ruta: "/resiliencia/evaluacion", etiqueta: "Evaluar la preparación", porque: "La primera categoría del evaluador empieza por lo que sabes y lo que tienes en casa." },
      { ruta: "/regiones", etiqueta: "Tu región", porque: "El peligro y el plan son locales: la región dice con quién compartes el riesgo." },
    ],
  },
  {
    n: 5,
    id: "proteccion-civil",
    titulo: "Protección civil, explicada",
    lema: "Quién organiza la emergencia, cómo se lee un aviso y qué te obliga.",
    resumen: "Qué es la protección civil y qué no, las cuatro fases del ciclo, la cadena de mando minuto a minuto, el vocabulario de los avisos traducido a conducta y cómo se hace un simulacro que sirva.",
    icono: "shield",
    vista: "bloques",
    bloques: bloquesProteccion,
    saleA: [
      { ruta: "/resiliencia/organismos", etiqueta: "El directorio por país", porque: "La cadena es real en instituciones concretas: aquí están las de tu país." },
      { ruta: "/resiliencia/glosario", etiqueta: "El glosario", porque: "Vigilancia, aviso, alerta, confinamiento: las palabras que no se pueden confundir." },
      { ruta: "/datos", etiqueta: "Qué datos tiene la casa", porque: "Para no confundir un centro educativo con un sistema de alerta." },
    ],
  },
  {
    n: 6,
    id: "organismos",
    titulo: "Directorio de organismos oficiales",
    lema: "A quién llamar, quién avisa y quién responde en cada país.",
    resumen: `Directorio de autoridades de protección civil, meteorología, sismología, bomberos y sociedad de socorro de ${Object.keys(PAISES).length} países, con su número de emergencias cuando es de dominio público, y la capa internacional (IFRC, UNDRR, OMS, OCHA, Copernicus, GDACS).`,
    icono: "landmark",
    vista: "pais",
    bloques: [
      {
        tipo: "prosa",
        items: [
          "Un directorio útil es el que se consulta en frío, no el que se busca con el corazón en un puño. Cada ficha de país dice a quién llamar, cómo llega el aviso, qué marco lo rige y qué organismos responden en el territorio.",
        ],
      },
      { tipo: "aviso", titulo: "Cómo leer este directorio", texto: NOTA_VERIFICACION },
    ],
    saleA: [
      { ruta: "/mundos", etiqueta: "Todos los países", porque: "Los países sin ficha propia se conectan aquí con su ficha geográfica." },
      { ruta: "/rostros", etiqueta: "Quién manda en cada sitio", porque: "La cadena de protección civil vive en instituciones que hay que saber nombrar." },
      { ruta: "/atlas", etiqueta: "El atlas", porque: "Capital, población y territorio: el tamaño de lo que hay que proteger." },
    ],
  },
  {
    n: 7,
    id: "prevencion",
    titulo: "Recomendaciones de prevención",
    lema: "El riesgo se reduce atornillando, drenando y ensayando.",
    resumen: "Recomendaciones por ámbito —casa, portal, escuela, trabajo, barrio y municipio—, con su coste real en tiempo, más la revisión de dos veces al año que mantiene todo lo demás vivo.",
    icono: "wrench",
    vista: "bloques",
    bloques: bloquesPrevencion,
    saleA: [
      { ruta: "/resiliencia/listas", etiqueta: "Las listas para hacerlo", porque: "Cada recomendación acaba en una tarea concreta con casilla." },
      { ruta: "/regiones", etiqueta: "El riesgo de tu región", porque: "Prevenir empieza por saber qué te toca: ladera, cauce, costa o llanura." },
    ],
  },
  {
    n: 8,
    id: "recuperacion",
    titulo: "Guías de recuperación comunitaria",
    lema: "Volver, reparar, apoyar, documentar y dejarlo mejor que antes.",
    resumen: "Siete guías ordenadas por tiempo real —de las primeras 72 horas a los años— con lo que se hace, lo que se puede exigir y lo que no se hace en la fase que decide cuántos años tarda la comunidad.",
    icono: "hammer",
    vista: "bloques",
    bloques: bloquesRecuperacion,
    saleA: [
      { ruta: "/resiliencia/biblioteca", etiqueta: "Reconstruir mejor", porque: "El principio de Sendai que separa la reconstrucción del simple arreglo." },
      { ruta: "/historia", etiqueta: "Lo que pasó antes", porque: "Las recuperaciones anteriores son la única evidencia seria de lo que funciona." },
    ],
  },
  {
    n: 9,
    id: "biblioteca",
    titulo: "Biblioteca de educación sobre riesgos",
    lema: "Las doce ideas que cambian cómo se mira un mapa de inundación.",
    resumen: "Doce lecciones de fondo sobre riesgo, vulnerabilidad, alerta temprana, comunicación, infodemia, resiliencia y Marco de Sendai, con sus claves, para qué sirven y a qué sección llevan después.",
    icono: "library",
    vista: "bloques",
    bloques: bloquesBiblioteca,
    saleA: [
      { ruta: "/resiliencia/glosario", etiqueta: "El glosario", porque: "Los conceptos de las lecciones, definidos término por término." },
      { ruta: "/conocimiento", etiqueta: "El conocimiento de la casa", porque: "El marco, la historia y los datos que sostienen cada idea." },
    ],
  },
  {
    n: 10,
    id: "listas",
    titulo: "Listas generales de preparación",
    lema: "Ocho listas que se completan con lo que ya tienes en casa.",
    resumen: `Mochila de 72 horas, revisión de la vivienda, documentos, escuela, barrio, coche, trabajo y necesidades de apoyo: ${LISTAS.length} listas con su tiempo real y con las casillas que puedes marcar desde esta página.`,
    icono: "check-square",
    vista: "listas",
    bloques: introListas,
    saleA: [
      { ruta: "/resiliencia/familia", etiqueta: "El plan familiar", porque: "Las listas son el equipo; el plan es quien lo usa." },
      { ruta: "/espacio", etiqueta: "Tu espacio de trabajo", porque: "Guarda tus notas y tus listas donde la casa ya te deja escribirlas." },
    ],
  },
  {
    n: 11,
    id: "accesibilidad",
    titulo: "Accesibilidad durante emergencias",
    lema: "Una evacuación es tan rápida como la persona más lenta.",
    resumen: "Barreras y soluciones perfil por perfil (movilidad, sensorial, cognitiva, crónica, infancia, personas sin red), cinco principios de inclusión, siete comprobaciones y el sistema de compañeros.",
    icono: "accessibility",
    vista: "bloques",
    bloques: bloquesAccesibilidad,
    saleA: [
      { ruta: "/resiliencia/guias", etiqueta: "La inclusión en cada guía", porque: "Cada emergencia tiene su nota de apoyo: aquí está el criterio general." },
      { ruta: "/rostros", etiqueta: "Quién decide en tu sitio", porque: "La accesibilidad se aprueba en un presupuesto municipal, no en un folleto." },
    ],
  },
  {
    n: 12,
    id: "servicios",
    titulo: "Cortes de agua y de luz",
    lema: "El caso real: se va el grifo, se va el enchufe y hay que seguir viviendo.",
    resumen: "Agua, luz y los dos a la vez: cómo se anuncia cada corte, qué hacer antes, durante y después, y las cifras que hay que tener en la cabeza (4 litros, 4 horas, 1 minuto de hervor, monóxido de carbono).",
    icono: "zap",
    vista: "bloques",
    bloques: bloquesServicios,
    saleA: [
      { ruta: "/labs/agua", etiqueta: "La cuenca, en el simulador", porque: "De dónde viene el agua que se corta y por qué se agota." },
      { ruta: "/labs/energia", etiqueta: "La energía, en el simulador", porque: "Por qué la red se cae en la hora punta y qué la recupera." },
      { ruta: "/resiliencia/familia", etiqueta: "Continuidad en casa", porque: "El frente de agua y el frente de energía del plan familiar." },
    ],
  },
  {
    n: 13,
    id: "comunicacion",
    titulo: "Comunicación comunitaria",
    lema: "El canal por el que la comunidad sabe qué hacer y dónde están los suyos.",
    resumen: "Siete canales con su fuerza y su fracaso, el árbol de llamadas en cuatro niveles, las reglas contra los bulos, el mensaje de cuatro campos y la comunicación accesible por formato y por idioma.",
    icono: "radio",
    vista: "bloques",
    bloques: bloquesComunicacion,
    saleA: [
      { ruta: "/resiliencia/proteccion-civil", etiqueta: "Cómo se lee un aviso", porque: "El canal comunitario no sustituye al oficial: lo conecta." },
      { ruta: "/audios", etiqueta: "La voz de la casa", porque: "Porque un mensaje hablado llega donde la pantalla no." },
    ],
  },
  {
    n: 14,
    id: "glosario",
    titulo: "Glosario de protección civil",
    lema: "Las palabras que no se pueden confundir cuando hay que decidir.",
    resumen: `${GLOSARIO.length} términos de protección civil y gestión del riesgo, agrupados por tema, con su definición de organismo y con la línea de para qué sirve saberlo. Buscable desde esta página.`,
    icono: "book-marked",
    vista: "glosario",
    bloques: introGlosario,
    saleA: [
      { ruta: "/resiliencia/biblioteca", etiqueta: "Las lecciones", porque: "El glosario define; la biblioteca explica por qué importa." },
      { ruta: "/directorio", etiqueta: "El directorio de la casa", porque: "Todas las puertas de Vanguard, buscables." },
    ],
  },
  {
    n: 15,
    id: "recursos",
    titulo: "Recursos oficiales por país",
    lema: "Cómo usar la ficha de tu país y qué hay detrás de ella.",
    resumen: "El criterio para leer la ficha de cada país (el número, el aviso, el marco, quién manda), la tabla de la capa internacional y los diez minutos que hay que dedicar a esto antes de que haga falta.",
    icono: "globe-2",
    vista: "bloques",
    bloques: bloquesRecursos,
    saleA: [
      { ruta: "/resiliencia/organismos", etiqueta: "El directorio completo", porque: "Aquí está la tarjeta de cada país con sus organismos." },
      { ruta: "/mundos", etiqueta: "La ficha geográfica", porque: "El territorio, la población y la exposición que explican el riesgo." },
    ],
  },
];

export const SECCION_POR_ID: Record<string, Seccion> = Object.fromEntries(
  SECCIONES.map((s) => [s.id, s]),
);

/** Las catorce secciones, en el orden del encargo. */
export function seccionesOrdenadas(): Seccion[] {
  return [...SECCIONES].sort((a, b) => a.n - b.n);
}

/** Cifras de la portada del centro: derivadas, nunca escritas a mano. */
export function cifrasCentro(): CifraCentro[] {
  return [
    { valor: String(SECCIONES.length + 1), etiqueta: "secciones", nota: "Las quince obligatorias de la MISIÓN 09: el centro más catorce páginas." },
    { valor: String(PELIGROS.length), etiqueta: "peligros naturales", nota: "Fichas con medición, señales, cifras y mitos." },
    { valor: String(GUIAS.length), etiqueta: "guías de emergencia", nota: "Cada una con antes, durante, después, lo que no se hace y la mirada de inclusión." },
    { valor: String(LISTAS.length), etiqueta: "listas de preparación", nota: "Marcables desde la propia página." },
    { valor: String(GLOSARIO.length), etiqueta: "términos del glosario", nota: "Definidos como los usan los organismos." },
    { valor: String(Object.keys(PAISES).length), etiqueta: "países con recursos", nota: "Fichas propias enlazadas con su ficha geográfica." },
    { valor: String(ORGANISMOS_GLOBALES.length), etiqueta: "organismos internacionales", nota: "La capa que sostiene el marco mundial." },
  ];
}

export const CENTRO_META = {
  nombre: "VANGUARD CIVIL RESILIENCE",
  subtitulo: "Centro de prevención, preparación y resiliencia de comunidades",
  lema:
    "No es un observatorio meteorológico ni un boletín de pánico: es el lugar donde se aprende a estar listo, a cuidar del vecino y a volver a levantarse mejor.",
  texto: [
    "Quince secciones y una herramienta. Guías por tipo de emergencia, fichas de peligros naturales, continuidad familiar, protección civil explicada, directorio de organismos oficiales, prevención, recuperación comunitaria, biblioteca de educación sobre riesgos, listas de preparación, accesibilidad, cortes de agua y luz, comunicación comunitaria, glosario y recursos por país.",
    "Todo con la recomendación de organismos reconocidos citada en el texto, sin alertas inventadas y sin instrucciones que puedan hacer daño. Lo que la casa sabe de verdad —sismos medidos, señales observadas— vive en los datos vivos; lo que la casa enseña para prepararse vive aquí.",
  ],
};
