// ═══════════════════════════════════════════════════════════════════
// v420.0 VANGUARD LINGUA — consultas en vivo a Wikimedia (SOLO servidor).
//
// Diccionario: Wikcionario en español (API action=parse, wikitexto).
// Pronunciación: grabaciones de Wikimedia Commons citadas en Wikcionario
// (plantillas {{pron-graf}} en español y {{audio}} en inglés) y
// transcripciones AFI escritas por los editores ({{IPA}}). Nada se
// sintetiza ni se genera: si la fuente no tiene audio, no hay audio.
// Licencias: textos CC BY-SA 4.0; cada audio lleva su licencia y autor
// tal como figuran en Commons.
// ═══════════════════════════════════════════════════════════════════

import { motivoIdiomaIncorrecto } from "./verificacion";
const UA = "VanguardLingua/1.0 (https://vanguard-kq9r.vercel.app/lingua; descubrimiento@vanguard.local)";
const UN_DIA = 86_400;

async function api<T>(host: string, params: Record<string, string>): Promise<T | null> {
  const u = `https://${host}/w/api.php?${new URLSearchParams({ format: "json", formatversion: "2", ...params }).toString()}`;
  try {
    const r = await fetch(u, { headers: { "User-Agent": UA, "Api-User-Agent": UA }, next: { revalidate: UN_DIA }, signal: AbortSignal.timeout(9000) });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

interface RespParse {
  parse?: { title: string; revid: number; wikitext?: string; text?: string; sections?: { index: string; line: string; toclevel: number; level: string }[] };
  error?: { code: string; info: string };
}

export async function wikitexto(wiki: "es" | "en", pagina: string): Promise<{ titulo: string; revid: number; texto: string } | null> {
  const d = await api<RespParse>(`${wiki}.wiktionary.org`, { action: "parse", page: pagina, prop: "wikitext|revid", redirects: "1" });
  if (!d?.parse?.wikitext) return null;
  return { titulo: d.parse.title, revid: d.parse.revid, texto: d.parse.wikitext };
}

// ── limpieza de wikitexto ──────────────────────────────────────────
export function limpiarWiki(s: string, nombreLengua: (c: string) => string = (c) => c): string {
  let t = s;
  t = t.replace(/<ref[^>]*\/>/g, "").replace(/<ref[^>]*>[\s\S]*?<\/ref>/g, "").replace(/<!--[\s\S]*?-->/g, "");
  t = t.replace(/<sup>([^<]*)<\/sup>/g, "$1").replace(/<[^>]+>/g, "");
  for (let i = 0; i < 4; i++) {
    t = t.replace(/\{\{(?:l\+?|l-lite|plm|m|term)\|[^|{}]*\|([^|{}]+)(?:\|[^{}]*)?\}\}/g, (_m, w: string) => w);
    t = t.replace(/\{\{plm\|([^|{}]+)\}\}/g, (_m, w: string) => w);
    t = t.replace(/\{\{etim\|([^|{}]+)\|([^|{}]+)(?:\|[^{}]*)?\}\}/g, (_m, c: string, w: string) => `del ${nombreLengua(c).toLowerCase()} «${w}»`);
    t = t.replace(/\{\{etimología\|([a-z]{2,3}(?:-[a-z]{2,4})?)\|([^|{}]+)(?:\|[^{}]*)?\}\}/g, (_m, c: string, w: string) => `Del ${nombreLengua(c).toLowerCase()} «${w}»`);
    t = t.replace(/\{\{[^{}]*\}\}/g, "");
  }
  t = t.replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, "$1").replace(/\[https?:\/\/[^\s\]]+ ([^\]]+)\]/g, "$1");
  t = t.replace(/'''?/g, "").replace(/\s+([,.;:])/g, "$1").replace(/\s{2,}/g, " ").trim();
  return t;
}

// ── diccionario (es.wiktionary) ────────────────────────────────────
export interface SeccionLengua {
  codigo: string;
  definiciones: string[];
  etimologia: string;
  audios: string[];
}

export interface EntradaDiccionario {
  titulo: string;
  revid: number;
  url: string;
  secciones: SeccionLengua[];
  traducciones: Record<string, { texto: string; translit: string; acepciones: string; nota: string }[]>;
}

function trozosPorLengua(texto: string): { codigo: string; cuerpo: string }[] {
  const re = /^==\s*\{\{lengua\|([^}|]+)[^}]*\}\}\s*==\s*$/gm;
  const marcas: { codigo: string; ini: number; fin: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) marcas.push({ codigo: m[1].trim(), ini: m.index, fin: m.index + m[0].length });
  return marcas.map((x, i) => {
    let cuerpo = texto.slice(x.fin, i + 1 < marcas.length ? marcas[i + 1].ini : texto.length);
    const ref = cuerpo.search(/^==\s*Referencias/m);
    if (ref >= 0) cuerpo = cuerpo.slice(0, ref);
    return { codigo: x.codigo, cuerpo };
  });
}

function parametros(cuerpo: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const parte of cuerpo.split("|")) {
    const k = parte.indexOf("=");
    if (k > 0) out[parte.slice(0, k).trim()] = parte.slice(k + 1).trim();
  }
  return out;
}

export function traduccionesWiki(texto: string): EntradaDiccionario["traducciones"] {
  const out: EntradaDiccionario["traducciones"] = {};
  for (const m of texto.matchAll(/\{\{t\|([^|}]+)\|([^}]*)\}\}/g)) {
    const lang = m[1].trim();
    const args = parametros(m[2]);
    for (const [k, v] of Object.entries(args)) {
      const mm = /^t(\d+)$/.exec(k);
      if (!mm || !v) continue;
      const i = mm[1];
      (out[lang] ??= []).push({ texto: limpiarWiki(v), translit: args[`tl${i}`] ?? "", acepciones: args[`a${i}`] ?? "", nota: limpiarWiki(args[`nota${i}`] ?? "") });
    }
  }
  return out;
}

export async function consultarDiccionario(palabra: string, nombreLengua: (c: string) => string): Promise<EntradaDiccionario | null> {
  const w = await wikitexto("es", palabra);
  if (!w) return null;
  const secciones: SeccionLengua[] = trozosPorLengua(w.texto).map(({ codigo, cuerpo }) => {
    const definiciones = [...cuerpo.matchAll(/^;\s*(\d+)[^:\n]*:\s*(.+)$/gm)]
      .map((d) => limpiarWiki(d[2], nombreLengua))
      .filter((d) => d.length > 1)
      .slice(0, 12);
    const etLinea = cuerpo.split("\n").find((l) => l.includes("{{etimología"));
    let etimologia = etLinea ? limpiarWiki(etLinea, nombreLengua) : "";
    if (etimologia.length < 6) etimologia = "";
    const audios = [...cuerpo.matchAll(/\{\{pron-graf([^}]*)\}\}/g)].flatMap((p) =>
      Object.entries(parametros(p[1]))
        .filter(([k, v]) => /^\d*audio\d*$/.test(k) && v)
        .map(([, v]) => v),
    );
    return { codigo, definiciones, etimologia, audios };
  });
  return {
    titulo: w.titulo,
    revid: w.revid,
    url: `https://es.wiktionary.org/wiki/${encodeURIComponent(w.titulo.replace(/ /g, "_"))}`,
    secciones,
    traducciones: traduccionesWiki(w.texto),
  };
}

// ── Wikimedia Commons: licencia, autor y URL reproducible ─────────
export interface AudioCommons {
  archivo: string;
  url: string;
  mp3: string | null;
  licencia: string;
  autor: string;
  pagina: string;
}

interface RespImageinfo {
  query?: {
    pages?: {
      title: string;
      missing?: boolean;
      imageinfo?: { url: string; mime: string; descriptionurl: string; extmetadata?: Record<string, { value: string }> }[];
    }[];
    normalized?: { from: string; to: string }[];
  };
}

export async function metadatosAudio(archivos: string[]): Promise<Map<string, AudioCommons>> {
  const out = new Map<string, AudioCommons>();
  const unicos = [...new Set(archivos.map((a) => a.replace(/^(File|Archivo):/i, "").trim()).filter(Boolean))].slice(0, 50);
  if (!unicos.length) return out;
  const d = await api<RespImageinfo>("commons.wikimedia.org", {
    action: "query",
    titles: unicos.map((a) => `File:${a}`).join("|"),
    prop: "imageinfo",
    iiprop: "url|mime|extmetadata",
    iiextmetadatafilter: "LicenseShortName|Artist",
  });
  const norm = new Map((d?.query?.normalized ?? []).map((n) => [n.to, n.from]));
  for (const p of d?.query?.pages ?? []) {
    const ii = p.imageinfo?.[0];
    if (p.missing || !ii) continue;
    const original = (norm.get(p.title) ?? p.title).replace(/^File:/, "");
    const url = ii.url.split("?")[0];
    const esOgg = /\.(ogg|oga|opus|flac|webm)$/i.test(url);
    const base = url.split("/").pop() ?? "";
    const mp3 = esOgg ? url.replace("/wikipedia/commons/", "/wikipedia/commons/transcoded/") + `/${base}.mp3` : null;
    const autor = (ii.extmetadata?.Artist?.value ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 140);
    out.set(original, {
      archivo: original,
      url,
      mp3,
      licencia: ii.extmetadata?.LicenseShortName?.value ?? "ver Commons",
      autor: autor || "ver página del archivo",
      pagina: ii.descriptionurl,
    });
  }
  // también por nombre normalizado (espacios/guiones bajos)
  for (const a of unicos) {
    if (out.has(a)) continue;
    const alt = [...out.values()].find((x) => x.archivo.replace(/_/g, " ") === a.replace(/_/g, " "));
    if (alt) out.set(a, alt);
  }
  return out;
}

// ── pronunciación ──────────────────────────────────────────────────
export interface PronunciacionLengua {
  codigo: string;
  /** nombre de la sección en Wiktionary inglés (o código en el español) */
  seccion: string;
  ipa: { texto: string; acento: string }[];
  audios: { archivo: string; acento: string }[];
  fuente: "es" | "en";
}

function seccionesEn(texto: string): { nombre: string; cuerpo: string }[] {
  const re = /^==([^=].*?)==\s*$/gm;
  const marcas: { nombre: string; ini: number; fin: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) marcas.push({ nombre: m[1].trim(), ini: m.index, fin: m.index + m[0].length });
  return marcas.map((x, i) => ({ nombre: x.nombre, cuerpo: texto.slice(x.fin, i + 1 < marcas.length ? marcas[i + 1].ini : texto.length) }));
}

function acentoDe(args: string[]): string {
  const a = args.find((x) => /^(a|accent|q)=/.test(x));
  return a ? limpiarWiki(a.split("=").slice(1).join("=").replace(/<<|>>/g, "")) : "";
}

export function pronunciacionesEn(texto: string): PronunciacionLengua[] {
  const out: PronunciacionLengua[] = [];
  for (const s of seccionesEn(texto)) {
    const porCodigo = new Map<string, PronunciacionLengua>();
    const obtener = (c: string) => {
      let p = porCodigo.get(c);
      if (!p) {
        p = { codigo: c, seccion: s.nombre, ipa: [], audios: [], fuente: "en" };
        porCodigo.set(c, p);
      }
      return p;
    };
    for (const m of s.cuerpo.matchAll(/\{\{IPA\|([^}]*)\}\}/g)) {
      const args = m[1].split("|").map((x) => x.trim());
      const code = args[0];
      if (!code || code.includes("=")) continue;
      const acento = acentoDe(args);
      for (const v of args.slice(1)) if (v && !v.includes("=") && /[/[]/.test(v)) obtener(code).ipa.push({ texto: v, acento });
    }
    for (const m of s.cuerpo.matchAll(/\{\{audio\|([^}]*)\}\}/g)) {
      const args = m[1].split("|").map((x) => x.trim());
      const [code, archivo] = args;
      if (!code || !archivo || code.includes("=")) continue;
      obtener(code).audios.push({ archivo, acento: acentoDe(args.slice(2)) || (args[2] && !args[2].includes("=") ? limpiarWiki(args[2]) : "") });
    }
    out.push(...porCodigo.values());
  }
  return out;
}

/** AFI de la sección en español que es.wiktionary genera automáticamente (HTML) */
export async function afiEspanol(palabra: string): Promise<string[]> {
  const d = await api<RespParse>("es.wiktionary.org", { action: "parse", page: palabra, prop: "text", section: "1", redirects: "1", disablelimitreport: "1" });
  const h = d?.parse?.text ?? "";
  const out: string[] = [];
  for (const m of h.matchAll(/AFI<\/a>\)\s*<\/td>\s*<td>\s*([^<]+)</g)) {
    const v = m[1].trim();
    if (v && !out.includes(v)) out.push(v);
  }
  return out.slice(0, 4);
}

export async function consultarPronunciacion(palabra: string): Promise<{ titulo: string; lenguas: PronunciacionLengua[]; fuentes: string[] } | null> {
  const [en, es] = await Promise.all([wikitexto("en", palabra), wikitexto("es", palabra)]);
  if (!en && !es) return null;
  const lenguas: PronunciacionLengua[] = en ? pronunciacionesEn(en.texto) : [];
  const fuentes: string[] = [];
  if (en) fuentes.push(`https://en.wiktionary.org/wiki/${encodeURIComponent(en.titulo.replace(/ /g, "_"))}`);
  if (es) {
    fuentes.push(`https://es.wiktionary.org/wiki/${encodeURIComponent(es.titulo.replace(/ /g, "_"))}`);
    const trozos = trozosPorLengua(es.texto);
    for (const { codigo, cuerpo } of trozos) {
      const audios: { archivo: string; acento: string }[] = [];
      const ipa: { texto: string; acento: string }[] = [];
      for (const p of cuerpo.matchAll(/\{\{pron-graf([^}]*)\}\}/g)) {
        const args = parametros(p[1]);
        for (const [k, v] of Object.entries(args)) {
          if (/^\d*audio\d*$/.test(k) && v) audios.push({ archivo: v, acento: "" });
          if (/^\d*fone\d*$/.test(k) && v) ipa.push({ texto: `[${limpiarWiki(v)}]`, acento: "" });
        }
      }
      if (!audios.length && !ipa.length) continue;
      const ya = lenguas.find((l) => l.codigo === codigo);
      if (ya) {
        for (const a of audios) if (!ya.audios.some((x) => x.archivo.replace(/_/g, " ") === a.archivo.replace(/_/g, " "))) ya.audios.push(a);
        if (!ya.ipa.length) ya.ipa.push(...ipa);
      } else lenguas.push({ codigo, seccion: codigo, ipa, audios, fuente: "es" });
    }
    if (trozos[0]?.codigo === "es") {
      const afi = await afiEspanol(es.titulo);
      if (afi.length) {
        const sp = lenguas.find((l) => l.codigo === "es");
        if (sp && !sp.ipa.length) sp.ipa.push(...afi.map((t) => ({ texto: t, acento: "transcripción generada por Wikcionario" })));
        else if (!sp) lenguas.push({ codigo: "es", seccion: "es", ipa: afi.map((t) => ({ texto: t, acento: "" })), audios: [], fuente: "es" });
      }
    }
  }
  return { titulo: en?.titulo ?? es?.titulo ?? palabra, lenguas: lenguas.filter((l) => l.ipa.length || l.audios.length), fuentes };
}

// ── traducción automática: MyMemory (Translated) ──────────────────
export interface ResultadoTraduccion {
  texto: string;
  coincidencia: number;
  proveedor: "MyMemory";
  alternativas: { texto: string; calidad: number; coincidencia: number; origen: string }[];
  /** presente si la primera propuesta del proveedor se descartó */
  aviso?: string;
}

export class ErrorTraduccion extends Error {
  cuota: boolean;
  constructor(mensaje: string, cuota = false) {
    super(mensaje);
    this.cuota = cuota;
  }
}

export async function traducirMyMemory(texto: string, de: string, a: string): Promise<ResultadoTraduccion> {
  const u = `https://api.mymemory.translated.net/get?${new URLSearchParams({ q: texto, langpair: `${de}|${a}` }).toString()}`;
  let r: Response;
  try {
    r = await fetch(u, { headers: { "User-Agent": UA }, cache: "no-store", signal: AbortSignal.timeout(12000) });
  } catch {
    throw new ErrorTraduccion("MyMemory no respondió a tiempo.");
  }
  if (r.status === 429) throw new ErrorTraduccion("Se agotó la cuota gratuita diaria de MyMemory.", true);
  if (!r.ok) throw new ErrorTraduccion(`MyMemory respondió ${r.status}.`);
  const j = (await r.json()) as {
    responseData?: { translatedText?: string; match?: number };
    responseStatus?: number | string;
    responseDetails?: string;
    quotaFinished?: boolean;
    matches?: { translation?: string; quality?: string | number; "created-by"?: string; match?: number }[];
  };
  const t = j.responseData?.translatedText ?? "";
  const estado = Number(j.responseStatus);
  if (j.quotaFinished || /MYMEMORY WARNING|USED ALL AVAILABLE FREE/i.test(t)) throw new ErrorTraduccion("Se agotó la cuota gratuita diaria de MyMemory.", true);
  if (estado !== 200 || !t) throw new ErrorTraduccion(j.responseDetails && estado !== 200 ? `MyMemory: ${j.responseDetails}.` : "MyMemory no tiene traducción para este texto en ese par de idiomas.");
  // Las memorias aportadas por usuarios pueden estar mal etiquetadas (una frase en
  // inglés marcada como francés): se descarta todo lo que no parezca del idioma pedido.
  const valida = (x: string) => motivoIdiomaIncorrecto(x, a, de, texto) === null;
  const matches = (j.matches ?? []).filter((m) => m.translation && m.translation.trim());
  let principal = t;
  let coincidencia = Number(j.responseData?.match) || 0;
  let aviso: string | undefined;
  if (!valida(t)) {
    // solo se promueve otra propuesta si traduce la MISMA frase (coincidencia ≥ 95 %) o es traducción automática
    const otra = matches.find((m) => valida(String(m.translation)) && ((Number(m.match) || 0) >= 0.95 || m["created-by"] === "MT!"));
    if (!otra) throw new ErrorTraduccion("MyMemory devolvió un texto que no está en el idioma pedido (una memoria de traducción mal etiquetada), así que no lo mostramos. Reformular la frase suele resolverlo.");
    principal = String(otra.translation);
    coincidencia = Number(otra.match) || 0;
    aviso = "La primera propuesta de MyMemory estaba en otro idioma y se descartó; se muestra la siguiente.";
  }
  const alternativas = matches
    .filter((m) => String(m.translation).trim() !== principal.trim() && valida(String(m.translation)))
    .slice(0, 3)
    .map((m) => ({
      texto: String(m.translation),
      calidad: Number(m.quality) || 0,
      coincidencia: Number(m.match) || 0,
      origen: m["created-by"] === "MT!" ? "traducción automática" : "memoria de traducción",
    }));
  return { texto: principal, coincidencia, proveedor: "MyMemory", alternativas, ...(aviso ? { aviso } : {}) };
}
