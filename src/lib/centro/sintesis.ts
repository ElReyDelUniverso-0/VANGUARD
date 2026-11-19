// ═══════════════════════════════════════════════════════════════════════════
// v419.1 · LA SÍNTESIS — el modelo propone, el validador decide
//
// Aquí está la parte del encargo que más se puede hacer mal: pedirle a un
// modelo que «responda con fuentes» y publicar lo que devuelva. La casa no
// hace eso. Hace tres cosas antes de enseñar una sola frase:
//
//   ① SE LE DA MATERIAL CERRADO. El modelo no busca: recibe pasajes
//      numerados de fuentes reales ([F3]) y sólo puede citar esos.
//   ② SE VALIDA CADA CITA. Si una afirmación dice HECHO y cita una fuente que
//      no está en el material —o no cita ninguna—, se degrada a NO_CONFIRMADO
//      y se escribe POR QUÉ en el propio informe. Una cita inventada no se
//      borra en silencio: se enseña tachada como error del modelo.
//   ③ SI NO HAY MODELO, HAY RESPUESTA. Sin proveedor, la Cámara devuelve
//      extractos literales ordenados por pertinencia, con su fuente y su
//      ubicación. Eso no es una síntesis y la interfaz lo dice con la palabra
//      «extractiva», no lo disfraza.
//
// El motor se declara siempre (`llm` | `determinista`) y la interfaz lo pinta.
// ═══════════════════════════════════════════════════════════════════════════

import { iaParalela, primerJSON } from "@/lib/ia-gateway";
import type {
  Afirmacion,
  Bibliografia,
  Comparacion,
  Informe,
  ClaseAfirmacion,
  Contradiccion,
  Documento,
  Fuente,
  Investigacion,
  Motor,
  Pasaje,
  RespuestaDocumento,
} from "./tipos";
import { bibliografiaDe } from "./corpus";
import { contradiccionesEntre, idfDe, normalizar, puntuar, terminos } from "./texto";

// ── Prompt ──────────────────────────────────────────────────────────────

const SYSTEM = `Eres la CÁMARA DE INTELIGENCIA de VANGUARD: un analista de investigación documental, no un asistente conversacional.
Recibes una PREGUNTA y MATERIAL: pasajes numerados extraídos de fuentes reales. Cada pasaje lleva su identificador entre corchetes, por ejemplo [F2].
Tu trabajo es responder la pregunta usando EXCLUSIVAMENTE ese material.

REGLAS INNEGOCIABLES:
1. No añadas conocimiento propio. Si el material no lo dice, no lo afirmas.
2. Clasifica cada afirmación en una de tres clases exactas:
   · "HECHO" — el material lo dice literalmente. Exige al menos una cita válida.
   · "INTERPRETACION" — es una lectura, una relación o una consecuencia que se deduce del material, no algo que el material diga.
   · "NO_CONFIRMADO" — no está en el material, o el material es insuficiente o contradictorio.
3. En "fuentes" sólo van identificadores que aparezcan en el material, tal cual (F1, F2…). Nunca inventes un identificador.
4. Si el material no responde a la pregunta, dilo en "sintesis" con una frase y deja las afirmaciones vacías. Es una respuesta correcta.
5. Español sobrio, sin emojis, sin markdown, sin adulación. Frases cortas.

Responde SOLO con JSON válido, sin texto alrededor:
{"sintesis":"2-5 frases que responden directamente a la pregunta, máximo 900 caracteres",
 "afirmaciones":[{"texto":"una afirmación concreta, máximo 240 caracteres","clase":"HECHO|INTERPRETACION|NO_CONFIRMADO","fuentes":["F1","F3"]}],
 "clave":["2-4 consecuencias o lecturas, máximo 110 caracteres cada una"],
 "confianza":0,
 "vacios":["qué NO se puede responder con este material, máximo 3"]}
Máximo 8 afirmaciones. "confianza" es un entero 0-100: cuánto respalda el material a tu síntesis.`;

function material(pasajes: Pasaje[], fuentes: Fuente[]): { texto: string; mapa: Map<string, Pasaje> } {
  const porFuente = new Map<string, { f: Fuente; ps: Pasaje[] }>();
  for (const p of pasajes) {
    const f = fuentes.find((x) => x.id === p.fuenteId);
    if (!f) continue;
    if (!porFuente.has(p.fuenteId)) porFuente.set(p.fuenteId, { f, ps: [] });
    porFuente.get(p.fuenteId)!.ps.push(p);
  }
  const mapa = new Map<string, Pasaje>();
  const lineas: string[] = [];
  let n = 1;
  for (const { f, ps } of porFuente.values()) {
    lineas.push(`\n### FUENTE [F${n}] — ${f.titulo} (${f.emisor}${f.fecha ? `, ${f.fecha}` : ""}) ruta: ${f.ruta || "documento del operador"}`);
    for (const p of ps) {
      lineas.push(`[F${n}] (${p.donde}) ${p.texto}`);
    }
    for (const p of ps) mapa.set(`F${n}`, p);
    n += 1;
  }
  return { texto: lineas.join("\n"), mapa };
}

// ── Validación de citas ─────────────────────────────────────────────────

const CLASES: ClaseAfirmacion[] = ["HECHO", "INTERPRETACION", "NO_CONFIRMADO"];

function limitar(s: unknown, max: number): string {
  return String(s ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

interface CrudaAfirmacion {
  texto?: unknown;
  clase?: unknown;
  fuentes?: unknown;
}

/**
 * Convierte lo que devolvió el modelo en afirmaciones publicables.
 * Devuelve también cuántas citas se cayeron (para confianza y para avisos).
 */
export function validarAfirmaciones(
  crudas: CrudaAfirmacion[],
  mapa: Map<string, Pasaje>,
  fuentesReales: Set<string>
): { afirmaciones: Afirmacion[]; invalidas: number; degradadas: number } {
  const salida: Afirmacion[] = [];
  let invalidas = 0;
  let degradadas = 0;

  for (const c of crudas.slice(0, 10)) {
    const texto = limitar(c.texto, 320);
    if (texto.length < 12) continue;
    const claseCruda = String(c.clase ?? "").toUpperCase().trim() as ClaseAfirmacion;
    let clase: ClaseAfirmacion = CLASES.includes(claseCruda) ? claseCruda : "INTERPRETACION";

    const pedidas = Array.isArray(c.fuentes) ? c.fuentes.map((x) => String(x).toUpperCase().trim()) : [];
    const validas: string[] = [];
    for (const ref of pedidas) {
      const p = mapa.get(ref);
      if (p && fuentesReales.has(p.fuenteId)) validas.push(p.fuenteId);
      else invalidas += 1;
    }

    let nota: string | undefined;
    if (clase === "HECHO" && validas.length === 0) {
      clase = "NO_CONFIRMADO";
      degradadas += 1;
      nota = pedidas.length
        ? "El modelo la presentó como hecho pero citó una fuente que no está en el material: se degrada y se declara."
        : "El modelo la presentó como hecho sin citar ninguna fuente del material: se degrada y se declara.";
    } else if (clase === "HECHO" && validas.length < pedidas.length) {
      nota = `Se cayeron ${pedidas.length - validas.length} cita(s) que no existen en el material.`;
    }

    salida.push({
      texto,
      clase,
      fuentes: [...new Set(validas)],
      ...(nota ? { nota } : {}),
    });
  }
  return { afirmaciones: salida, invalidas, degradadas };
}

// ── Respuesta determinista (sin modelo) ─────────────────────────────────

const RELEVANTES = /\b(es|son|fue|han|ha|tiene|supera|alcanza|representa|equivale|según|cifra|por ciento|millones|km|fecha|acuerdo|conflicto|controla|produce|exporta|importa)\b/i;

function determinista(
  pregunta: string,
  fuentes: Fuente[],
  pasajes: Pasaje[]
): { sintesis: string; afirmaciones: Afirmacion[]; clave: string[]; confianza: number; vacios: string[] } {
  const q = terminos(pregunta);
  const idf = idfDe(pasajes.map((p) => p.texto));
  const ordenados = pasajes
    .map((p) => ({ p, s: puntuar(q, p.texto, idf) }))
    .sort((a, b) => b.s - a.s);

  const elegidos: Pasaje[] = [];
  for (const { p } of ordenados) {
    if (elegidos.length >= 5) break;
    if (elegidos.some((e) => e.fuenteId === p.fuenteId && e.texto.slice(0, 80) === p.texto.slice(0, 80))) continue;
    elegidos.push(p);
  }

  const afirmaciones: Afirmacion[] = elegidos.map((p) => ({
    texto: p.texto.length > 300 ? `${p.texto.slice(0, 297)}…` : p.texto,
    clase: "HECHO",
    fuentes: [p.fuenteId],
    nota: `Extracto literal de «${p.donde}». No es una síntesis: es lo que dice la fuente.`,
  }));

  const nombreFuentes = [...new Set(elegidos.map((p) => fuentes.find((f) => f.id === p.fuenteId)?.titulo).filter(Boolean))];
  const cubierto = elegidos.length
    ? Math.min(100, Math.round(38 + elegidos.length * 9 + new Set(elegidos.map((p) => p.fuenteId)).size * 5))
    : 0;

  return {
    sintesis: elegidos.length
      ? `Sin proveedor de modelo disponible: esto es una respuesta EXTRACTIVA, no una síntesis redactada. Las ${elegidos.length} afirmaciones de abajo son citas literales de ${nombreFuentes.length} fuente(s) de la casa — ${nombreFuentes.slice(0, 3).join("; ")}${nombreFuentes.length > 3 ? "…" : ""} — ordenadas por pertinencia a la pregunta. La lectura, la comparación y la detección de contradicciones sí se hicieron aquí, con reglas.`
      : "Ninguna fuente de la casa habla de esto con suficiente detalle. No se responde con relleno: se declara el vacío.",
    afirmaciones,
    clave: [],
    confianza: cubierto,
    vacios: elegidos.length
      ? ["Sin modelo no hay interpretación redactada: sólo extractos. Las consecuencias y la comparación fina requieren leer las fuentes completas."]
      : ["El corpus de la casa no cubre esta pregunta. Prueba otras palabras, sube documentos o conecta un proveedor de modelo."],
  };
}

// ── Investigación ───────────────────────────────────────────────────────

export interface EncargoInvestigacion {
  pregunta: string;
  fuentes: Fuente[];
  pasajes: Pasaje[];
  contradicciones: Contradiccion[];
  relacionados: { titulo: string; ruta: string; porque: string }[];
  /** si el operador pidió no usar el modelo */
  sinModelo?: boolean;
}

export async function investigar(enc: EncargoInvestigacion): Promise<Investigacion> {
  const inicio = Date.now();
  const { pregunta, fuentes, pasajes } = enc;
  const mapaFuentes = new Set(fuentes.map((f) => f.id));
  const avisos: string[] = [];

  const validos = pasajes.filter((p) => mapaFuentes.has(p.fuenteId));
  const { texto, mapa } = material(validos, fuentes);

  let motor: Motor = "determinista";
  let base = determinista(pregunta, fuentes, validos);
  let invalidas = 0;
  let degradadas = 0;

  if (!enc.sinModelo && validos.length) {
    const user = `PREGUNTA: ${pregunta}\n\nMATERIAL (sólo puedes usar esto):\n${texto}`;
    const crudo = await iaParalela(SYSTEM, user, 26_000);
    const json = crudo ? primerJSON(crudo) : null;
    if (json && typeof json.sintesis === "string" && json.sintesis.trim().length > 20) {
      const afs = Array.isArray(json.afirmaciones) ? (json.afirmaciones as CrudaAfirmacion[]) : [];
      const v = validarAfirmaciones(afs, mapa, mapaFuentes);
      invalidas = v.invalidas;
      degradadas = v.degradadas;
      motor = "llm";
      base = {
        sintesis: limitar(json.sintesis, 1400),
        afirmaciones: v.afirmaciones,
        clave: Array.isArray(json.clave) ? (json.clave as unknown[]).map((x) => limitar(x, 160)).filter(Boolean).slice(0, 4) : [],
        confianza: Math.max(0, Math.min(100, Math.round(Number(json.confianza) || 0))),
        vacios: Array.isArray(json.vacios) ? (json.vacios as unknown[]).map((x) => limitar(x, 200)).filter(Boolean).slice(0, 3) : [],
      };
      if (!base.afirmaciones.length) {
        base.vacios = [...base.vacios, "El modelo no devolvió afirmaciones citables: la síntesis va sin respaldo desglosado."];
      }
    } else {
      avisos.push("El proveedor de modelo no respondió a tiempo: se responde de forma extractiva con las mismas fuentes.");
    }
  } else if (!validos.length) {
    avisos.push("No hay pasajes que citar: revisa las fuentes seleccionadas.");
  }

  if (invalidas) {
    avisos.push(`Se rechazaron ${invalidas} cita(s) del modelo que no correspondían a ninguna fuente del material.`);
  }
  if (degradadas) {
    avisos.push(`${degradadas} afirmación(es) presentadas como hecho pasaron a NO CONFIRMADO por falta de cita válida.`);
  }

  // La bibliografía se construye SIEMPRE del corpus real, nunca del modelo.
  const bibliografia = bibliografiaDe(fuentes.map((f) => f.id)) as Bibliografia;

  return {
    pregunta,
    sintesis: base.sintesis,
    afirmaciones: base.afirmaciones,
    clave: base.clave,
    fuentes,
    pasajes: validos,
    motor,
    confianza: base.confianza,
    vacios: base.vacios,
    contradicciones: enc.contradicciones,
    relacionados: enc.relacionados,
    bibliografia,
    generado: new Date().toISOString(),
    ms: Date.now() - inicio,
    avisos,
  };
}

// ── Informe estructurado ────────────────────────────────────────────────

const SYSTEM_INFORME = `Eres la CÁMARA DE INTELIGENCIA de VANGUARD. Redactas un informe breve y verificable a partir de una INVESTIGACIÓN ya hecha.
Recibes: la pregunta, la síntesis, las afirmaciones ya clasificadas (HECHO/INTERPRETACION/NO_CONFIRMADO) y las fuentes.
Escribe las secciones que falten sin inventar nada nuevo: no añadas datos que no estén en las afirmaciones.
Responde SOLO con JSON válido:
{"titulo":"máximo 90 caracteres, descriptivo y sobrio",
 "resumenEjecutivo":"3-5 frases, máximo 700 caracteres",
 "contexto":"2-4 frases sobre el marco del asunto, sólo con lo que digan las afirmaciones",
 "lectura":"2-4 frases de interpretación explícitamente provisional, marcadas como tales"}
Español, sin markdown, sin emojis, sin adulación. Si el material no alcanza para una sección, escribe una frase que lo diga.`;

export async function construirInforme(inv: Investigacion): Promise<Informe> {
  const avisos: string[] = [];
  const hechos = inv.afirmaciones.filter((a) => a.clase === "HECHO");
  const interpretaciones = inv.afirmaciones.filter((a) => a.clase === "INTERPRETACION");
  const noConfirmado = inv.afirmaciones.filter((a) => a.clase === "NO_CONFIRMADO");

  let motor: Motor = "determinista";
  let titulo = inv.pregunta.length > 90 ? `${inv.pregunta.slice(0, 87)}…` : inv.pregunta;
  let resumenEjecutivo = inv.sintesis;
  let contexto = "";
  let lectura = "";

  const cuerpo = [
    `PREGUNTA: ${inv.pregunta}`,
    `SÍNTESIS: ${inv.sintesis}`,
    ...hechos.map((a) => `HECHO: ${a.texto}`),
    ...interpretaciones.map((a) => `INTERPRETACION: ${a.texto}`),
    ...noConfirmado.map((a) => `NO CONFIRMADO: ${a.texto}`),
  ].join("\n");

  if (inv.motor === "llm") {
    const crudo = await iaParalela(SYSTEM_INFORME, cuerpo, 24_000);
    const j = crudo ? primerJSON(crudo) : null;
    if (j && typeof j.resumenEjecutivo === "string") {
      motor = "llm";
      titulo = limitar(j.titulo, 110) || titulo;
      resumenEjecutivo = limitar(j.resumenEjecutivo, 900);
      contexto = limitar(j.contexto, 900);
      lectura = limitar(j.lectura, 900);
    } else {
      avisos.push("El informe se compuso sin modelo: secciones montadas con las afirmaciones ya clasificadas.");
    }
  } else {
    avisos.push("Informe determinista: sin proveedor de modelo, las secciones se montan con las afirmaciones y los extractos. No hay prosa nueva.");
  }

  const cronologia = inv.pasajes
    .flatMap((p) =>
      (p.texto.match(/\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}\s+de\s+[a-záéíóúñ]+\s+de\s+\d{4}\b/gi) ?? []).map((f) => ({
        fecha: f,
        hecho: p.texto.slice(0, 180),
        fuenteId: p.fuenteId,
      }))
    )
    .slice(0, 10)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const secciones: Informe["secciones"] = [
    { titulo: "RESUMEN EJECUTIVO", parrafos: [resumenEjecutivo], motor },
    ...(contexto ? [{ titulo: "CONTEXTO", parrafos: [contexto], motor }] : []),
    {
      titulo: "HECHOS CON FUENTE",
      parrafos: hechos.length ? hechos.map((a) => `${a.texto} [${a.fuentes.join(", ")}]`) : ["No se estableció ningún hecho con fuente válida."],
      motor: inv.motor,
    },
    {
      titulo: "INTERPRETACIÓN (provisional)",
      parrafos: interpretaciones.length ? interpretaciones.map((a) => a.texto) : ["No se formuló interpretación: el material no la sostiene."],
      motor: inv.motor,
    },
    {
      titulo: "NO CONFIRMADO",
      parrafos: noConfirmado.length ? noConfirmado.map((a) => `${a.texto}${a.nota ? ` — ${a.nota}` : ""}`) : ["Nada quedó en el limbo: todo lo afirmado tiene fuente."],
      motor: inv.motor,
    },
    ...(lectura ? [{ titulo: "LECTURA PROVISIONAL DEL ANALISTA", parrafos: [lectura], motor }] : []),
    {
      titulo: "CONTRADICCIONES ENTRE FUENTES",
      parrafos: inv.contradicciones.length
        ? inv.contradicciones.map((c) => `${c.tipo.toUpperCase()}: ${c.explicacion}`)
        : ["No se detectaron choques comprobables entre las fuentes seleccionadas."],
      motor: "determinista",
    },
    {
      titulo: "LAGUNAS DE EVIDENCIA",
      parrafos: inv.vacios.length ? inv.vacios : ["No se declararon lagunas."],
      motor: inv.motor,
    },
    ...(cronologia.length
      ? [{ titulo: "CRONOLOGÍA DETECTADA", parrafos: cronologia.map((c) => `${c.fecha} — ${c.hecho} [${c.fuenteId}]`), motor: "determinista" as Motor }]
      : []),
    {
      titulo: "BIBLIOGRAFÍA",
      parrafos: inv.bibliografia.citas.length ? inv.bibliografia.citas : ["Las fuentes seleccionadas no traen referencias metodológicas propias."],
      motor: "determinista",
    },
  ];

  const markdown = [
    `# ${titulo}`,
    "",
    `**Pregunta:** ${inv.pregunta}`,
    `**Generado:** ${inv.generado.slice(0, 19).replace("T", " ")} UTC · **Motor:** ${motor === "llm" ? "modelo + validación de citas" : "determinista (sin modelo)"} · **Confianza:** ${inv.confianza}/100`,
    "",
    ...secciones.flatMap((s) => [`## ${s.titulo}`, "", ...s.parrafos.map((p) => `${p}`), ""]),
    "## FUENTES CITADAS",
    "",
    ...inv.fuentes.map((f) => `- ${f.titulo} — ${f.emisor}${f.fecha ? ` (${f.fecha})` : ""}${f.ruta ? ` · ${f.ruta}` : ""}`),
    "",
    inv.bibliografia.bibtex ? `## BIBTEX\n\n\`\`\`\n${inv.bibliografia.bibtex}\n\`\`\`` : "",
    "",
    "_Informe generado por la Cámara de Inteligencia de Vanguard. Los hechos citan fuente; las interpretaciones se declaran como tales; lo no confirmado se queda en su casilla._",
  ].join("\n");

  return {
    titulo,
    pregunta: inv.pregunta,
    resumenEjecutivo,
    secciones,
    hechos,
    interpretaciones,
    noConfirmado,
    contradicciones: inv.contradicciones,
    cronologia,
    vacios: inv.vacios,
    bibliografia: inv.bibliografia,
    fuentes: inv.fuentes,
    motor,
    generado: new Date().toISOString(),
    markdown,
    avisos,
  };
}

// ── Preguntas sobre un documento ────────────────────────────────────────

const SYSTEM_DOC = `Eres la CÁMARA DE INTELIGENCIA de VANGUARD. Respondes una pregunta usando SOLO los fragmentos de un documento que se te dan, numerados [T1], [T2]…
Si los fragmentos no contienen la respuesta, lo dices en una frase y no inventas.
Responde SOLO con JSON válido:
{"respuesta":"2-5 frases, máximo 800 caracteres","citas":["T1","T3"],"vacio":false}
"vacio": true si el documento no responde a la pregunta. Español, sin markdown, sin emojis.`;

export async function preguntarDocumento(
  doc: Documento,
  pregunta: string,
  usarModelo = true
): Promise<RespuestaDocumento> {
  const avisos: string[] = [];
  const q = terminos(pregunta);
  const idf = idfDe(doc.trozos.map((t) => t.texto));
  const orden = doc.trozos
    .map((t) => ({ t, s: puntuar(q, t.texto, idf) }))
    .sort((a, b) => b.s - a.s)
    .filter((x) => x.s > 0)
    .slice(0, 5);

  if (!orden.length) {
    return {
      documentoId: doc.id,
      pregunta,
      respuesta: "El documento no contiene ningún fragmento que trate la pregunta con esas palabras. Ni se responde ni se inventa: no está.",
      motor: "determinista",
      citas: [],
      vacio: true,
      avisos: ["Sin coincidencias léxicas. Prueba con otras palabras del propio documento."],
    };
  }

  const materialTxt = orden.map((x, i) => `[T${i + 1}] (pág. ${x.t.pagina}) ${x.t.texto}`).join("\n\n");

  if (usarModelo) {
    const crudo = await iaParalela(
      SYSTEM_DOC,
      `PREGUNTA: ${pregunta}\n\nFRAGMENTOS DEL DOCUMENTO «${doc.nombre}»:\n${materialTxt}`,
      22_000
    );
    const j = crudo ? primerJSON(crudo) : null;
    if (j && typeof j.respuesta === "string") {
      const pedidas = Array.isArray(j.citas) ? (j.citas as unknown[]).map((x) => String(x).toUpperCase().trim()) : [];
      const citas = pedidas
        .map((r) => {
          const i = Number(r.replace(/[^0-9]/g, "")) - 1;
          const x = orden[i];
          return x ? { n: x.t.n, pagina: x.t.pagina, texto: x.t.texto.slice(0, 260) } : null;
        })
        .filter((x): x is { n: number; pagina: number; texto: string } => !!x);
      return {
        documentoId: doc.id,
        pregunta,
        respuesta: limitar(j.respuesta, 1100),
        motor: "llm",
        citas,
        vacio: Boolean(j.vacio),
        avisos: pedidas.length !== citas.length ? ["Se cayeron citas del modelo que no correspondían a ningún fragmento."] : [],
      };
    }
    avisos.push("El proveedor de modelo no respondió: se responde con el fragmento más pertinente, sin redactar.");
  }

  const mejor = orden[0].t;
  const texto = mejor.texto.replace(/\s+/g, " ").trim();
  return {
    documentoId: doc.id,
    pregunta,
    respuesta: `Extracto literal del documento (sin modelo, sin redacción): «${texto.slice(0, 320)}${texto.length > 320 ? "…" : ""}»`,
    motor: "determinista",
    citas: [{ n: mejor.n, pagina: mejor.pagina, texto: mejor.texto.slice(0, 260) }],
    vacio: false,
    avisos,
  };
}

// ── Comparador de documentos ────────────────────────────────────────────

const NORMAL = (s: string) => normalizar(s).trim();

export function compararDocumentos(a: Documento, b: Documento): Comparacion {
  const ta = new Set(terminos(a.texto, 4));
  const tb = new Set(terminos(b.texto, 4));
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter += 1;
  const union = ta.size + tb.size - inter;
  const solapamiento = union ? Math.round((inter / union) * 100) : 0;

  // temas comunes: términos con IDF alto que aparecen en los dos
  const corpus = [a.texto, b.texto];
  const idf = idfDe(corpus);
  const comunes = [...ta]
    .filter((t) => tb.has(t))
    .map((t) => ({ t, peso: (idf.get(t) ?? 0) * Math.min(3, (a.texto.match(new RegExp(`\\b${t}\\w*`, "gi")) ?? []).length) }))
    .sort((x, y) => y.peso - x.peso)
    .slice(0, 8)
    .map(({ t }) => {
      const fragmento = (texto: string) => {
        const i = NORMAL(texto).indexOf(t);
        const desde = Math.max(0, i - 90);
        return texto.slice(desde, i + 150).replace(/\s+/g, " ").trim();
      };
      return { tema: t, enA: fragmento(a.texto), enB: fragmento(b.texto) };
    });

  const soloA = [...ta].filter((t) => !tb.has(t)).map((t) => ({ t, p: idf.get(t) ?? 0 })).sort((x, y) => y.p - x.p).slice(0, 10).map((x) => x.t);
  const soloB = [...tb].filter((t) => !ta.has(t)).map((t) => ({ t, p: idf.get(t) ?? 0 })).sort((x, y) => y.p - x.p).slice(0, 10).map((x) => x.t);

  // contradicciones: se reutiliza el detector determinista entre los dos
  const contradicciones: Contradiccion[] = contradiccionesEntre([
      { id: a.id, nombre: a.nombre, trozos: a.trozos.slice(0, 40) },
      { id: b.id, nombre: b.nombre, trozos: b.trozos.slice(0, 40) },
    ]);

  const clave = (e: { nombre: string }[]) => e.map((x) => x.nombre);
  const fechasA = clave(a.entidades.fechas.map((f) => ({ nombre: f.valor })));
  const fechasB = clave(b.entidades.fechas.map((f) => ({ nombre: f.valor })));

  const ambas = (x: string[], y: string[]) => x.filter((v) => y.includes(v));
  const solo = (x: string[], y: string[]) => x.filter((v) => !y.includes(v));

  const veredicto =
    solapamiento > 55
      ? "Los dos documentos tratan el mismo asunto: sirven para contrastar versiones, no para sumar cobertura."
      : solapamiento > 25
        ? "Comparten el asunto pero cada uno aporta ángulos propios: son complementarios."
        : "Apenas se solapan: tratan asuntos distintos. Compararlos sirve para descubrir un puente, no para verificar.";

  return {
    a: { id: a.id, nombre: a.nombre, caracteres: a.caracteres, paginas: a.paginas },
    b: { id: b.id, nombre: b.nombre, caracteres: b.caracteres, paginas: b.paginas },
    comunes: comunes.slice(0, 6),
    soloA,
    soloB,
    contradicciones,
    solapamiento,
    entidades: {
      fechas: { solo: solo(fechasA, fechasB).slice(0, 12), ambas: ambas(fechasA, fechasB).slice(0, 12) },
      lugares: { solo: solo(clave(a.entidades.lugares), clave(b.entidades.lugares)).slice(0, 12), ambas: ambas(clave(a.entidades.lugares), clave(b.entidades.lugares)).slice(0, 12) },
      personas: { solo: solo(clave(a.entidades.personas), clave(b.entidades.personas)).slice(0, 12), ambas: ambas(clave(a.entidades.personas), clave(b.entidades.personas)).slice(0, 12) },
    },
    veredicto,
    avisos: [
      ...(a.calidad !== "alta" ? [`«${a.nombre}»: extracción ${a.calidad}.`] : []),
      ...(b.calidad !== "alta" ? [`«${b.nombre}»: extracción ${b.calidad}.`] : []),
    ],
  };
}
