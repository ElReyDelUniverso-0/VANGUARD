// ═══════════════════════════════════════════════════════════════════════════
// v419.1 · EL TEXTO DE LA CÁMARA — normalizar, trocear, contar, extraer
//
// Todo lo de este archivo es DETERMINISTA y corre igual en servidor y en el
// navegador. Es la mitad del centro de investigación que NO depende de ningún
// modelo: si el proveedor de IA está caído, esto sigue funcionando y el
// operador sigue teniendo búsqueda, extracción y respuestas con citas.
//
// Nada aquí «adivina» sin decirlo: el extractor de nombres es heurístico y su
// límite está escrito al lado; el de lugares usa el atlas real de la casa y no
// inventa un país que no exista.
// ═══════════════════════════════════════════════════════════════════════════

/** Minúsculas, sin tildes, sin puntuación rara — la misma ley que el núcleo. */
export function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const VACIAS = new Set([
  "de", "la", "el", "los", "las", "un", "una", "unos", "unas", "y", "o", "u", "e", "a", "en",
  "con", "por", "para", "que", "del", "al", "se", "su", "sus", "es", "son", "fue", "han", "ha",
  "como", "mas", "más", "pero", "sin", "sobre", "entre", "desde", "hasta", "no", "si", "sí",
  "lo", "le", "les", "ya", "muy", "este", "esta", "estos", "estas", "ese", "esa", "the", "of",
  "and", "to", "in", "for", "on", "with", "at", "by", "an", "is", "are", "was", "were",
]);

export function terminos(texto: string, min = 3): string[] {
  return normalizar(texto)
    .replace(/[^a-z0-9áéíóúñü\s-]/gi, " ")
    .split(/\s+/)
    .filter((t) => t.length >= min && !VACIAS.has(t));
}

/** Frecuencias de un texto (para BM25 y para detectar términos raros). */
export function frecuencias(texto: string): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of terminos(texto)) m.set(t, (m.get(t) || 0) + 1);
  return m;
}

/**
 * Puntuación léxica tipo BM25 simplificado. La casa ya tiene una lupa léxica
 * en el núcleo; esta es la versión con IDF porque aquí comparamos documentos
 * entre sí (y sin IDF, una palabra como «esto» puntuaría igual que «litografía»).
 */
export function puntuar(
  consulta: string[],
  texto: string,
  idf: Map<string, number>,
  largoMedio = 220
): number {
  if (!consulta.length) return 0;
  const f = frecuencias(texto);
  let total = 0;
  let largo = 0;
  for (const n of f.values()) largo += n;
  largo = Math.max(1, largo);
  const k1 = 1.2;
  const b = 0.75;
  const vistos = new Set<string>();
  for (const t of consulta) {
    if (vistos.has(t)) continue;
    vistos.add(t);
    const tf = f.get(t) || 0;
    if (!tf) continue;
    const idfv = idf.get(t) ?? 1;
    total += idfv * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * largo) / largoMedio)));
  }
  return total;
}

/** IDF sobre una lista de documentos (cuántos documentos contienen el término). */
export function idfDe(documentos: string[]): Map<string, number> {
  const df = new Map<string, number>();
  for (const d of documentos) {
    for (const t of new Set(terminos(d))) df.set(t, (df.get(t) || 0) + 1);
  }
  const n = Math.max(1, documentos.length);
  const idf = new Map<string, number>();
  for (const [t, c] of df) idf.set(t, Math.log(1 + (n - c + 0.5) / (c + 0.5)));
  return idf;
}

/** Divide en frases sin romper abreviaturas corrientes ni decimales. */
export function frases(texto: string): string[] {
  const plano = texto.replace(/\s+/g, " ").trim();
  if (!plano) return [];
  const crudo = plano
    // protege decimales y abreviaturas frecuentes antes de partir
    .replace(/(\d)\.(\d)/g, "$1\u0001$2")
    .replace(/\b(Sr|Sra|Dr|Dra|EE|UU|etc|aprox|núm|nº|pág|art|art\.)\./gi, "$1\u0002")
    .split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡«"(\d])/);
  return crudo
    .map((s) => s.replace(/\u0001/g, ".").replace(/\u0002/g, ".").trim())
    .filter((s) => s.length > 0);
}

/** Trocea un texto largo en ventanas con solape, respetando frases. */
export function trocear(texto: string, tam = 1100, solape = 160): { texto: string; pagina: number }[] {
  const fs = frases(texto);
  const salida: { texto: string; pagina: number }[] = [];
  let actual: string[] = [];
  let largo = 0;
  let pagina = 0;
  for (const f of fs) {
    actual.push(f);
    largo += f.length + 1;
    if (largo >= tam) {
      salida.push({ texto: actual.join(" "), pagina });
      // el solape conserva el hilo entre trozos (dos frases de contexto)
      const cola = actual.slice(-2);
      actual = [...cola];
      largo = cola.join(" ").length;
      pagina += 1;
    }
  }
  if (actual.length) salida.push({ texto: actual.join(" "), pagina });
  return salida;
}

// ── Extracción de entidades (determinista, con límites declarados) ──────

const MESES: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7,
  agosto: 8, septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
  // un informe en inglés es igual de común que uno en español: sin esto, la
  // mitad de los documentos que llegan a la casa no daban ni una fecha
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7,
  august: 8, september: 9, october: 10, november: 11, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
};

const RE_FECHA_TEXTO = /\b(\d{1,2})\s+de\s+([a-záéíóúñ]+)(?:\s+de(?:l)?\s+(\d{4}))?/gi;
const RE_FECHA_INGLES = /\b(\d{1,2})\s+([A-Za-z]{3,9})\.?\s+(\d{4})\b|\b([A-Za-z]{3,9})\.?\s+(\d{1,2}),\s*(\d{4})\b/g;
const RE_FECHA_NUM = /\b(\d{1,2})[/-](\d{1,2})[/-](\d{4})\b/g;
const RE_ISO = /\b(\d{4})-(\d{2})-(\d{2})\b/g;

export function fechasDe(texto: string): { valor: string; iso: string | null; n: number }[] {
  const acc = new Map<string, { valor: string; iso: string | null; n: number }>();
  const meter = (valor: string, iso: string | null) => {
    const k = normalizar(valor);
    const prev = acc.get(k);
    if (prev) prev.n += 1;
    else acc.set(k, { valor, iso, n: 1 });
  };
  for (const m of texto.matchAll(RE_ISO)) meter(m[0], m[0]);
  for (const m of texto.matchAll(RE_FECHA_NUM)) {
    const [d, mes, a] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const iso = d <= 31 && mes <= 12 ? `${m[3]}-${String(mes).padStart(2, "0")}-${String(d).padStart(2, "0")}` : null;
    meter(m[0], iso);
  }
  for (const m of texto.matchAll(RE_FECHA_INGLES)) {
    const dia = Number(m[1] ?? m[5]);
    const mes = MESES[normalizar(m[2] ?? m[4])];
    const anio = Number(m[3] ?? m[6]);
    if (!mes || !anio || dia > 31) continue;
    meter(m[0], `${anio}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`);
  }
  for (const m of texto.matchAll(RE_FECHA_TEXTO)) {
    const mes = MESES[normalizar(m[2])];
    if (!mes) continue;
    const a = m[3] ? Number(m[3]) : null;
    const iso = a ? `${a}-${String(mes).padStart(2, "0")}-${String(Number(m[1])).padStart(2, "0")}` : null;
    meter(m[0], iso);
  }
  return [...acc.values()].sort((a, b) => b.n - a.n).slice(0, 40);
}

const UNIDADES = [
  "por ciento", "%", "millones", "millón", "billones", "mil millones", "km²", "km2", "kilómetros",
  "toneladas", "barriles", "dólares", "euros", "habitantes", "personas", "años", "MW", "GW", "TWh",
  "GWh", "kg", "toneladas métricas", "puntos porcentuales", "puntos básicos", "naves", "soldados",
  // unidades de un informe técnico (el caso más común en documentos subidos)
  "nm", "mm", "cm", "km", "m", "ms", "s", "GB", "MB", "TB", "GHz", "MHz", "páginas", "paginas",
  "págs", "capas", "parámetros", "parametros", "millones de dólares", "billion", "million",
  "percent", "tonnes", "barrels", "dollars", "years", "people", "layers", "parameters",
];
const RE_CIFRA = new RegExp(
  `\\b(\\d{1,3}(?:[.,]\\d{3})*(?:[.,]\\d+)?|\\d+(?:[.,]\\d+)?)\\s*((?:${UNIDADES.map((u) => u.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")}))\\b`,
  "gi"
);

export function cifrasDe(texto: string): { valor: string; unidad: string; contexto: string }[] {
  const salida: { valor: string; unidad: string; contexto: string }[] = [];
  const vistos = new Set<string>();
  for (const m of texto.matchAll(RE_CIFRA)) {
    const clave = `${m[1]}|${normalizar(m[2])}`;
    if (vistos.has(clave)) continue;
    vistos.add(clave);
    const desde = Math.max(0, (m.index ?? 0) - 60);
    const contexto = texto.slice(desde, (m.index ?? 0) + m[0].length + 40).replace(/\s+/g, " ").trim();
    salida.push({ valor: m[1], unidad: m[2], contexto });
    if (salida.length >= 40) break;
  }
  return salida;
}

/** Frontera de fin de palabra que SÍ entiende vocales acentuadas. */
const FRONTERA_FIN = "(?![a-záéíóúñü])";

const ORG_CLAVES = new RegExp(
  "(?<![a-záéíóúñü])(" +
  [
    "ONU","OTAN","UE","FMI","OMS","UNESCO","UNICEF","ACNUR","OIEA","OPEP","OMC","BRI","CSIS","SIA","AIE","OEA","UA","ASEAN","G7","G20","Banco Mundial","Banco Central","Corte","Tribunal","Consejo","Comisión","Agencia","Instituto","Universidad","Ministerio","Departamento","Organización","Fundación","Alianza","SAF","FRS","RSF","Hamas","Hezbolá","Yihad","Estado Islámico",
  ].join("|") +
  ")" + FRONTERA_FIN,
  "i"
);
const _ORG_VIEJO = /\b(ONU|OTAN|UE|FMI|OMS|UNESCO|UNICEF|ACNUR|OIEA|OPEP|OMC|BRI|CSIS|SIA|AIE|OEA|UA|ASEAN|G7|G20|Banco Mundial|Banco Central|Corte|Tribunal|Consejo|Comisión|Agencia|Instituto|Universidad|Ministerio|Departamento|Organización|Fundación|Alianza|OPA?EP|SAF|FRS|RSF|Hamas|Hezbolá|Yihad|Estado Islámico)\b/i;

const PERSONA_EXCLUIDAS = new Set([
  "el", "la", "los", "las", "un", "una", "este", "esta", "según", "además", "sin", "con",
  "tras", "ante", "desde", "hasta", "entre", "sobre", "cuando", "mientras", "también", "pero",
  "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre",
  "octubre", "noviembre", "diciembre", "lunes", "martes", "miércoles", "jueves", "viernes",
  "sábado", "domingo", "estados", "naciones", "consejo", "banco", "corte", "unión",
  // artículos y muletillas en inglés: «The Transformer» no es un señor
  "the", "this", "these", "those", "table", "figure", "section", "chapter", "equation",
  "january", "february", "march", "april", "june", "july", "august", "september",
  "october", "november", "december",
]);

/**
 * Nombres de persona por heurística de capitalización (dos o tres palabras
 * seguidas en mayúscula, sin palabra vacía al principio).
 * LÍMITE DECLARADO: no distingue «Banco Mundial» de «Pedro Sánchez»; por eso
 * las organizaciones se extraen ANTES y se restan, y la interfaz llama a esto
 * «posibles nombres», no «personas identificadas».
 */
export function personasDe(texto: string, excluir?: Set<string>): { nombre: string; n: number }[] {
  const acc = new Map<string, number>();
  const re = /\b([A-ZÁÉÍÓÚÑ][a-záéíóúñü]{2,})\s+(?:de\s+|del\s+)?([A-ZÁÉÍÓÚÑ][a-záéíóúñü]{2,})(?:\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñü]{2,}))?/g;
  for (const m of texto.matchAll(re)) {
    const primero = normalizar(m[1]);
    if (PERSONA_EXCLUIDAS.has(primero)) continue;
    const nombre = m[0].replace(/\s+/g, " ");
    if (ORG_CLAVES.test(nombre)) continue;
    if (excluir && excluir.has(normalizar(nombre))) continue;
    acc.set(nombre, (acc.get(nombre) || 0) + 1);
  }
  return [...acc.entries()]
    .map(([nombre, n]) => ({ nombre, n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 40);
}

export function organizacionesDe(texto: string): { nombre: string; n: number }[] {
  const acc = new Map<string, number>();
  const re = /\b([A-ZÁÉÍÓÚÑ][\wáéíóúñü.&-]*(?:\s+(?:de|del|para|por|y)\s+)?){1,4}\b/g;
  for (const m of texto.matchAll(re)) {
    const nombre = m[0].trim();
    if (nombre.length < 4 || nombre.split(/\s+/).length > 5) continue;
    if (!ORG_CLAVES.test(nombre)) continue;
    acc.set(nombre, (acc.get(nombre) || 0) + 1);
  }
  return [...acc.entries()]
    .map(([nombre, n]) => ({ nombre, n }))
    .sort((a, b) => b.n - a.n)
    .slice(0, 30);
}

// OJO con \b: en JavaScript «ó» no es carácter de palabra, así que /anunció\b/
// NUNCA casa («anunció »). Por eso la frontera se escribe a mano.
const VERBOS_ACONTECIMIENTO = new RegExp(
  "(?<![a-záéíóúñü])(" +
  "firmó|firmaron|invadió|invadieron|anexionó|declaró|declararon|aprobó|rechazó|dimitió|renunció|asumió|celebró|celebraron|acordó|acordaron|atacó|atacaron|bombardeó|retiró|retiraron|desplegó|anunció|anunciaron|impuso|sancionó|bloqueó|cerró|abrió|estalló|comenzó|terminó|colapsó|cayó|subió|bajó|golpe|tratado|acuerdo|alto el fuego|elecciones|referéndum" +
  ")" + FRONTERA_FIN,
  "i"
);
const _VERBOS_VIEJO =
  /\b(firmó|firmaron|invadió|invadieron|anexionó|declaró|declararon|aprobó|aprobó la|rechazó|dimitió|renunció|asumió|celebró|celebraron|acordó|acordaron|atacó|atacaron|bombardeó|invadió|retiró|retiraron|desplegó|anunció|anunciaron|impuso|sancionó|bloqueó|cerró|abrió|estalló|comenzó|terminó|colapsó|cayó|subió|bajó|golpe|tratado|acuerdo|alto el fuego|elecciones|referéndum)\b/i;

/** Acontecimientos: frases con verbo de acción + fecha cercana. Heurístico. */
export function acontecimientosDe(texto: string): { texto: string; fecha?: string; n: number }[] {
  const salida: { texto: string; fecha?: string; n: number }[] = [];
  const vistos = new Set<string>();
  for (const f of frases(texto)) {
    if (f.length < 30 || f.length > 320) continue;
    if (!VERBOS_ACONTECIMIENTO.test(f)) continue;
    const fecha = f.match(RE_ISO)?.[0] ?? f.match(RE_FECHA_NUM)?.[0] ?? f.match(RE_FECHA_TEXTO)?.[0];
    const clave = normalizar(f).slice(0, 80);
    if (vistos.has(clave)) continue;
    vistos.add(clave);
    salida.push({ texto: f, fecha, n: 1 });
    if (salida.length >= 25) break;
  }
  return salida;
}

// ── Contradicciones entre documentos ────────────────────────────────────

const NEGACIONES = /\b(no|nunca|jamás|niega|desmiente|rechaza|descarta|imposible|falso)\b/i;

function firma(t: string): Set<string> {
  return new Set(terminos(t, 4));
}

function solape(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let c = 0;
  for (const x of a) if (b.has(x)) c += 1;
  return c / Math.min(a.size, b.size);
}

function numeroDe(s: string): number | null {
  const m = s.replace(/\./g, "").replace(",", ".").match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : null;
}

/**
 * Detector de contradicciones. Cuatro clases, todas comprobables a mano —
 * no es «la IA opina que se contradicen»: es que dos fragmentos de documentos
 * distintos hablan del mismo asunto (solape de términos ≥ 0,5) y, además,
 * discrepan en una cifra, en una fecha, en quién hizo algo, o en la polaridad.
 */
export function contradiccionesEntre(
  docs: { id: string; nombre: string; trozos: { texto: string; pagina: number }[] }[]
): { tema: string; a: { fuenteId: string; texto: string }; b: { fuenteId: string; texto: string }; tipo: "cifra" | "fecha" | "atribucion" | "polaridad"; explicacion: string }[] {
  const salida: {
    tema: string;
    a: { fuenteId: string; texto: string };
    b: { fuenteId: string; texto: string };
    tipo: "cifra" | "fecha" | "atribucion" | "polaridad";
    explicacion: string;
  }[] = [];

  for (let i = 0; i < docs.length; i++) {
    for (let j = i + 1; j < docs.length; j++) {
      const A = docs[i];
      const B = docs[j];
      for (const ta of A.trozos) {
        const fa = firma(ta.texto);
        const fechasA = fechasDe(ta.texto);
        const cifrasA = cifrasDe(ta.texto);
        for (const tb of B.trozos) {
          if (salida.length >= 12) return salida;
          const s = solape(fa, firma(tb.texto));
          if (s < 0.5) continue;
          const tema = [...fa].filter((x) => firma(tb.texto).has(x)).slice(0, 4).join(" · ");

          // ① cifra: misma unidad, distinto valor (y más de una por par: un
          // informe puede discrepar en varias cifras a la vez)

          const cifrasB = cifrasDe(tb.texto);
          for (const ca of cifrasA) {
            // No basta con «la primera de la misma unidad»: eso emparejaba «60
            // millones de capas» con «3 millones de unidades». Se busca la cifra
            // de B cuyo CONTEXTO comparte más palabras con el de A.
            const ctxA = new Set(terminos(ca.contexto));
            const candidatas = cifrasB
              .filter((c) => normalizar(c.unidad) === normalizar(ca.unidad))
              .map((c) => {
                let comun = 0;
                for (const t of terminos(c.contexto)) if (ctxA.has(t)) comun += 1;
                return { c, comun };
              })
              .sort((x, y) => y.comun - x.comun);
            const cb = candidatas.length && candidatas[0].comun > 0 ? candidatas[0].c : undefined;
            if (!cb) continue;
            const na = numeroDe(ca.valor);
            const nb = numeroDe(cb.valor);
            if (na === null || nb === null || na === nb) continue;
            salida.push({
              tema,
              a: { fuenteId: A.id, texto: ta.texto.slice(0, 300) },
              b: { fuenteId: B.id, texto: tb.texto.slice(0, 300) },
              tipo: "cifra",
              explicacion: `${A.nombre} da ${ca.valor} ${ca.unidad}; ${B.nombre} da ${cb.valor} ${cb.unidad} para el mismo asunto (${tema}).`,
            });
            if (salida.length >= 12) return salida;
            if (salida.filter((x) => x.tipo === "cifra" && x.a.fuenteId === A.id && x.b.fuenteId === B.id).length >= 3) break;
          }

          // ② fecha: mismo hecho, distinto día
          const fa2 = fechasA.filter((f) => f.iso);
          const fb2 = fechasDe(tb.texto).filter((f) => f.iso);
          if (fa2.length && fb2.length) {
            const isoA = new Set(fa2.map((f) => f.iso));
            const distinta = fb2.find((f) => !isoA.has(f.iso));
            if (distinta && fa2.length === 1 && fb2.length === 1) {
              salida.push({
                tema,
                a: { fuenteId: A.id, texto: ta.texto.slice(0, 300) },
                b: { fuenteId: B.id, texto: tb.texto.slice(0, 300) },
                tipo: "fecha",
                explicacion: `${A.nombre} fecha el asunto en ${fa2[0].valor}; ${B.nombre} en ${distinta.valor}.`,
              });
              if (salida.length >= 12) return salida;
            }
          }

          // ③ polaridad: uno afirma, el otro niega el mismo asunto
          const negA = NEGACIONES.test(ta.texto);
          const negB = NEGACIONES.test(tb.texto);
          if (negA !== negB) {
            salida.push({
              tema,
              a: { fuenteId: A.id, texto: ta.texto.slice(0, 300) },
              b: { fuenteId: B.id, texto: tb.texto.slice(0, 300) },
              tipo: "polaridad",
              explicacion: `Un documento afirma y el otro niega el mismo asunto (${tema}). Hay que leer las dos orillas antes de citar.`,
            });
            continue;
          }

          // ④ atribución: quién hizo qué, con distinto sujeto
          const orgA = organizacionesDe(ta.texto)[0]?.nombre;
          const orgB = organizacionesDe(tb.texto)[0]?.nombre;
          if (orgA && orgB && normalizar(orgA) !== normalizar(orgB)) {
            salida.push({
              tema,
              a: { fuenteId: A.id, texto: ta.texto.slice(0, 300) },
              b: { fuenteId: B.id, texto: tb.texto.slice(0, 300) },
              tipo: "atribucion",
              explicacion: `${A.nombre} atribuye el hecho a «${orgA}»; ${B.nombre} a «${orgB}».`,
            });
          }
        }
      }
    }
  }
  return salida;
}
