// ═══════════════════════════════════════════════════════════════════════════
// v419.1 · LOS DOCUMENTOS DEL OPERADOR — leer PDF, DOCX y texto SIN dependencias
//
// La casa no tiene instalado ningún lector de PDF (ni pdf-parse, ni pdfjs, ni
// un servicio de OCR). En vez de fingir que sí, aquí se lee lo que un PDF
// lleva dentro de verdad: sus flujos de contenido, descomprimidos con el zlib
// que ya trae Node, y se extraen los operadores de texto (Tj/TJ/'/").
//
// LÍMITES DECLARADOS (y medidos, no supuestos — ver docs/INTELIGENCIA.md):
//   · PDF escaneado (una imagen por página) → 0 caracteres: se declara
//     «sin texto» y se pide un archivo con capa de texto. No hay OCR.
//   · PDF con fuentes CID/simbólicas sin ToUnicode → texto parcial o ilegible:
//     se declara «calidad parcial» con el porcentaje de caracteres legibles.
//   · DOCX: se lee word/document.xml (el cuerpo). Notas al pie, comentarios y
//     encabezados no se leen. Sin dependencias: zip + deflate de Node.
//   · Nunca se guarda nada en servidor: el documento se extrae y se devuelve;
//     el texto vive en el navegador del operador (la BD de Vercel es efímera).
// ═══════════════════════════════════════════════════════════════════════════

import zlib from "zlib";
import { PAISES_ATLAS } from "@/lib/atlas-data";
import { fichas } from "@/lib/mundos/ficha";
import type { Documento, Entidades, Trozo } from "./tipos";
import { acontecimientosDe, cifrasDe, fechasDe, normalizar, organizacionesDe, personasDe, trocear } from "./texto";

// ── PDF ─────────────────────────────────────────────────────────────────

function decodificarCadenaPdf(s: string): string {
  let salida = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c !== "\\") {
      salida += c;
      continue;
    }
    const d = s[++i];
    if (d === undefined) break;
    if (d === "n") salida += "\n";
    else if (d === "r") salida += "\r";
    else if (d === "t") salida += "\t";
    else if (d === "b") salida += "\b";
    else if (d === "f") salida += "\f";
    else if (d === "(" || d === ")" || d === "\\") salida += d;
    else if (/[0-7]/.test(d)) {
      // octal: hasta 3 dígitos
      let oct = d;
      while (oct.length < 3 && /[0-7]/.test(s[i + 1] ?? "")) oct += s[++i];
      salida += String.fromCharCode(parseInt(oct, 8));
    } else if (d === "\n") {
      // continuación de línea: nada
    } else salida += d;
  }
  return salida;
}

/**
 * ── LA TABLA QUE LO CAMBIA TODO: ToUnicode ──────────────────────────────
 *
 * Un PDF moderno (Word, LibreOffice, Chrome, LaTeX con pdftex) casi nunca
 * escribe letras: escribe CÓDIGOS de glifo —«<01020303> Tj»— y guarda aparte
 * un mapa (el CMap /ToUnicode) que dice qué letra es cada código.
 *
 * Sin leer ese mapa sólo salen símbolos y la casa tendría que decir «calidad
 * parcial» en casi todos los documentos reales. Leyéndolo, un informe de
 * 15 páginas se lee entero. Esto no es un adorno: es la diferencia entre
 * analizar un documento y mirarlo.
 */
export interface Codificacion {
  mapa: Map<number, string>;
  /** 1 = códigos de un byte (fuentes simples); 2 = Identity-H/CID */
  bytes: 1 | 2;
}

export function leerCMap(datos: string): Codificacion {
  const mapa = new Map<number, string>();
  const hex = (h: string) => parseInt(h, 16);
  const utf16 = (h: string) => {
    const limpio = h.replace(/[^0-9A-Fa-f]/g, "");
    let out = "";
    for (let i = 0; i + 3 < limpio.length + 1 && i < limpio.length; i += 4) {
      const code = parseInt(limpio.slice(i, i + 4), 16);
      if (!Number.isFinite(code)) break;
      out += String.fromCharCode(code);
    }
    return out || String.fromCharCode(hex(limpio.slice(0, 4)));
  };

  for (const bloque of datos.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const par of bloque[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      mapa.set(hex(par[1]), utf16(par[2]));
    }
  }
  for (const bloque of datos.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    // forma 1: <lo> <hi> <destino>
    for (const r of bloque[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g)) {
      const lo = hex(r[1]);
      const hi = hex(r[2]);
      const base = utf16(r[3]);
      const codigoBase = base.charCodeAt(base.length - 1);
      for (let c = lo; c <= hi && c - lo < 512; c++) {
        mapa.set(c, base.slice(0, -1) + String.fromCharCode(codigoBase + (c - lo)));
      }
    }
    // forma 2: <lo> <hi> [<d1> <d2> …]
    for (const r of bloque[1].matchAll(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*\[([^\]]*)\]/g)) {
      const lo = hex(r[1]);
      const destinos = [...r[3].matchAll(/<([0-9A-Fa-f]+)>/g)].map((d) => utf16(d[1]));
      destinos.forEach((d, i) => mapa.set(lo + i, d));
    }
  }
  let max = 0;
  mapa.forEach((_l, codigo) => {
    if (codigo > max) max = codigo;
  });
  return { mapa, bytes: max > 255 ? 2 : 1 };
}

/** Nombres de glifo que aparecen en /Differences → su carácter (los comunes). */
const GLIFOS: Record<string, string> = {
  space: " ", exclam: "!", quotedbl: '"', numbersign: "#", dollar: "$", percent: "%",
  ampersand: "&", quotesingle: "'", parenleft: "(", parenright: ")", asterisk: "*",
  plus: "+", comma: ",", hyphen: "-", minus: "-", period: ".", slash: "/",
  zero: "0", one: "1", two: "2", three: "3", four: "4", five: "5", six: "6",
  seven: "7", eight: "8", nine: "9", colon: ":", semicolon: ";", less: "<",
  equal: "=", greater: ">", question: "?", at: "@", bracketleft: "[",
  backslash: "\\", bracketright: "]", asciicircum: "^", underscore: "_",
  grave: "`", braceleft: "{", bar: "|", braceright: "}", asciitilde: "~",
  endash: "–", emdash: "—", quoteleft: "‘", quoteright: "’", quotedblleft: "“",
  quotedblright: "”", bullet: "•", ellipsis: "…", fi: "fi", fl: "fl", ffi: "ffi",
  ffl: "ffl", degree: "°", section: "§", paragraph: "¶", Euro: "€", sterling: "£",
  nbspace: " ", periodcentered: "·", guillemotleft: "«", guillemotright: "»",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú", ntilde: "ñ",
  Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú", Ntilde: "Ñ",
  udieresis: "ü", Udiaeresis: "Ü", exclamdown: "¡", questiondown: "¿", ccedilla: "ç",
};

function glifoACaracter(nombre: string): string | null {
  if (GLIFOS[nombre]) return GLIFOS[nombre];
  if (nombre.length === 1) return nombre;
  const uni = nombre.match(/^uni([0-9A-Fa-f]{4})$/);
  if (uni) return String.fromCharCode(parseInt(uni[1], 16));
  const u = nombre.match(/^u([0-9A-Fa-f]{4,6})$/);
  if (u) return String.fromCharCode(parseInt(u[1], 16));
  return null;
}

/** Lee la tabla /Differences de una fuente: código de byte → carácter. */
function codificacionDeDiferencias(cuerpo: string): Codificacion | null {
  const i = cuerpo.indexOf("/Differences");
  if (i < 0) return null;
  const desde = cuerpo.indexOf("[", i);
  const hasta = cuerpo.indexOf("]", desde);
  if (desde < 0 || hasta < 0) return null;
  const mapa = new Map<number, string>();
  let code = 0;
  for (const tok of cuerpo.slice(desde + 1, hasta).matchAll(/\/([A-Za-z0-9_.]+)|(\d+)/g)) {
    if (tok[2] !== undefined) {
      code = Number(tok[2]);
      continue;
    }
    const ch = glifoACaracter(tok[1]);
    if (ch !== null) mapa.set(code, ch);
    code += 1;
  }
  if (!mapa.size) return null;
  return { mapa, bytes: 1 };
}

/** Los mapas de un PDF: el global y el de cada fuente con nombre de recurso. */
function mapasDelPdf(crudo: string, objetos: ObjetoPdf[]): { global: Codificacion | null; porNombre: Map<string, Codificacion> } {
  const porNumero = expandirObjStm(objetos);

  // ① todos los CMaps del archivo, por número de objeto
  const porObjeto = new Map<number, Codificacion>();
  porNumero.forEach((o, num) => {
    if (!o.datos) return;
    const texto = /beginbfchar|beginbfrange|begincmap/.test(o.datos) ? o.datos : null;
    if (texto) {
      porObjeto.set(num, leerCMap(texto));
      return;
    }
    try {
      const inf = zlib.inflateSync(Buffer.from(o.datos, "latin1")).toString("latin1");
      if (/beginbfchar|beginbfrange/.test(inf)) porObjeto.set(num, leerCMap(inf));
    } catch {
      /* no es un flujo comprimido */
    }
  });

  // ② nombre de recurso (/F1) → objeto de fuente → su ToUnicode (o su /Differences)
  const porNombre = new Map<string, Codificacion>();
  const fuentes = new Map<number, Codificacion>();

  const cmapDeFuente = (numFont: number): Codificacion | null => {
    if (fuentes.has(numFont)) return fuentes.get(numFont) ?? null;
    const o = porNumero.get(numFont);
    if (!o) return null;
    const cuerpo = o.dict;
    const tu = cuerpo.match(/\/ToUnicode\s+(\d+)\s+\d+\s+R/);
    let cod: Codificacion | null = tu ? porObjeto.get(Number(tu[1])) ?? null : null;
    if (!cod) cod = codificacionDeDiferencias(cuerpo);
    if (cod) fuentes.set(numFont, cod);
    return cod;
  };

  // el diccionario de recursos de cada página: /Font << /F1 104 0 R … >>
  const cuerpos = [crudo, ...[...porNumero.values()].map((o) => o.dict)].join("\n");
  for (const r of cuerpos.matchAll(/\/Font\s*<<([\s\S]{0,4000}?)>>/g)) {
    for (const par of r[1].matchAll(/\/([A-Za-z0-9_.-]+)\s+(\d+)\s+\d+\s+R/g)) {
      const nombre = par[1];
      const cod = cmapDeFuente(Number(par[2]));
      if (cod && !porNombre.has(nombre)) porNombre.set(nombre, cod);
    }
  }

  // ③ red de seguridad: si un nombre no se resolvió, se usa el mapa único del
  // archivo (o la fusión de todos, que al menos acierta letras ASCII)
  let global: Codificacion | null = null;
  if (porObjeto.size === 1) {
    porObjeto.forEach((v) => {
      global = v;
    });
  } else if (porObjeto.size > 1) {
    const mapa = new Map<number, string>();
    let bytes: 1 | 2 = 1;
    porObjeto.forEach((v) => {
      if (v.bytes === 2) bytes = 2;
      v.mapa.forEach((letra, codigo) => {
        if (!mapa.has(codigo)) mapa.set(codigo, letra);
      });
    });
    global = { mapa, bytes };
  }
  return { global, porNombre };
}

/**
 * Extrae el texto de un flujo de contenido PDF ya descomprimido, respetando el
 * mapa de la fuente activa (los operadores Tf cambian de fuente a mitad de
 * página y cada fuente puede tener su propia codificación).
 */
function textoDeFlujo(contenido: string, mapas?: { global: Codificacion | null; porNombre: Map<string, Codificacion> }): string {
  let salida = "";
  let cmap: Codificacion | null = null;

  const ancho = () => (cmap ? cmap.bytes * 2 : 2); // en dígitos hexadecimales

  const decodificarHex = (h: string): string => {
    const limpio = h.replace(/[^0-9A-Fa-f]/g, "").padEnd(ancho(), "0");
    let out = "";
    const paso = ancho();
    for (let i = 0; i + paso <= limpio.length; i += paso) {
      const code = parseInt(limpio.slice(i, i + paso), 16);
      const letra = cmap?.mapa.get(code);
      if (letra !== undefined) out += letra;
      else if (code >= 32 && code < 127 && !cmap) out += String.fromCharCode(code);
      // glifo sin nombre conocido: se marca; si queda entre dos letras era un
      // espacio (los PDF escriben el espacio como un glifo propio sin ToUnicode)
      else out += "\u0000";
    }
    return out.replace(/(?<=[\p{L}\p{N}])\u0000+/gu, " ").replace(/\u0000+/g, "");
  };

  /**
   * Un literal entre paréntesis casi siempre viene en una codificación de un
   * byte (WinAnsi/MacRoman) aunque en la página haya además fuentes CID. Por eso
   * se prueba el mapa y SÓLO se acepta si decodifica la mayoría de los códigos:
   * si no, se queda el texto tal cual. Sin esta comprobación, el sello en
   * ángulo de un PDF de arXiv convertía el cuerpo entero en símbolos.
   */
  const decodificarLiteral = (txt: string): string => {
    if (!cmap) return txt;
    if (cmap.bytes === 1) {
      let out = "";
      for (const ch of txt) out += cmap.mapa.get(ch.charCodeAt(0)) ?? ch;
      return out;
    }
    // los literales van byte a byte SIEMPRE: una tabla de dos bytes aquí
    // convertía el cuerpo de un artículo en símbolos matemáticos
    let out = "";
    let codigos = 0;
    let resueltos = 0;
    for (const ch of txt) {
      codigos += 1;
      const letra = cmap.mapa.get(ch.charCodeAt(0));
      if (letra !== undefined) resueltos += 1;
      out += letra ?? ch;
    }
    return codigos && resueltos / codigos >= 0.6 ? out : txt;
  };

  // El tokenizador tiene que entender las TRES formas de pintar texto de un PDF:
  //   (texto) Tj · (texto) ' · [ (a) -250 (b) ] TJ      ← la de pdftex es la tercera
  // Ignorar los arrays TJ era perder el 90 % del texto de cualquier artículo.
  const re = /\/([A-Za-z0-9_.-]+)\s+[\d.]+\s+Tf|<([0-9A-Fa-f\s]+)>|\((?:\\.|[^\\()])*\)|\[|\]|-?\d+(?:\.\d+)?|\bT[dD]\b|\bT\*\b|\bTm\b|\bTJ\b|\bT[jJ]\b|\bTf\b/g;
  let enArray = 0;
  let pendiente: string | null = null;
  let m: RegExpExecArray | null;

  while ((m = re.exec(contenido))) {
    const tok = m[0];

    if (tok === "[") {
      enArray += 1;
      continue;
    }
    if (tok === "]") {
      enArray = Math.max(0, enArray - 1);
      continue;
    }
    if (tok === "TJ" || tok === "Tj" || tok === "'" || tok === '"') {
      if (pendiente) {
        salida += pendiente;
        pendiente = null;
      }
      continue;
    }
    if (m[1]) {
      // cambio de fuente: cada fuente puede traer su propia tabla de códigos
      cmap = mapas?.porNombre.get(m[1]) ?? mapas?.global ?? null;
      continue;
    }
    if (m[2] !== undefined) {
      const txt = decodificarHex(m[2]);
      if (enArray) salida += txt;
      else pendiente = (pendiente ?? "") + txt;
      continue;
    }
    if (tok.startsWith("(")) {
      const txt = decodificarLiteral(decodificarCadenaPdf(tok.slice(1, -1)));
      if (enArray) salida += txt;
      else pendiente = (pendiente ?? "") + txt;
      continue;
    }
    if (tok === "Td" || tok === "TD" || tok === "T*" || tok === "Tm") {
      const antes = contenido.slice(Math.max(0, m.index - 40), m.index);
      const nums = (antes.match(/-?\d+(?:\.\d+)?/g) ?? []).slice(-2).map(Number);
      const dy = nums.length === 2 ? nums[1] : 0;
      const dx = nums.length === 2 ? nums[0] : 0;
      if (pendiente) {
        salida += pendiente;
        pendiente = null;
      }
      if (tok === "T*" || Math.abs(dy) > 0.5) salida += "\n";
      else if (Math.abs(dx) > 220) salida += "\n"; // salto de columna, no de palabra
      continue;
    }
    // número dentro de un array TJ: los negativos grandes son separación de palabras
    if (enArray && /^-?\d/.test(tok) && Number(tok) < -120) salida += " ";
  }
  if (pendiente) salida += pendiente;
  return salida;
}

interface PdfLeido {
  texto: string;
  paginas: number;
  flujos: number;
  legibles: number;
  total: number;
  avisos: string[];
}

/** Un objeto del PDF: su diccionario (texto) y su flujo de datos (si lo tiene). */
interface ObjetoPdf {
  num: number;
  dict: string;
  datos: string | null;
}

/**
 * Recorre los objetos `N 0 obj … endobj` BUSCANDO DENTRO de cada uno su
 * «stream». La primera versión buscaba «stream» en todo el archivo y confundía
 * el binario de una imagen con el flujo de una página: el texto salía basura.
 * La lección: en un PDF, el binario se lee por objetos, no por índice global.
 */
function objetosPdf(crudo: string): ObjetoPdf[] {
  const salida: ObjetoPdf[] = [];
  const re = /\d+\s+\d+\s+obj\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(crudo))) {
    const desde = m.index + m[0].length;
    const finObj = crudo.indexOf("endobj", desde);
    const corte = finObj >= 0 ? finObj : Math.min(crudo.length, desde + 2_000_000);
    const cuerpo = crudo.slice(desde, corte);
    const num = Number(m[0].trim().split(/\s+/)[0]);
    const iStream = cuerpo.indexOf("stream");
    if (iStream < 0) {
      salida.push({ num, dict: cuerpo, datos: null });
      continue;
    }
    const dict = cuerpo.slice(0, iStream);
    const iFin = cuerpo.lastIndexOf("endstream");
    let datos = cuerpo.slice(iStream + 6, iFin > iStream ? iFin : cuerpo.length);
    datos = datos.replace(/^\r?\n/, "").replace(/\r?\n$/, "");
    salida.push({ num, dict, datos });
    re.lastIndex = corte; // los datos binarios no se reescanean buscando objetos
  }
  return salida;
}

/**
 * Un PDF moderno (Chrome, Word, pdftex reciente) guarda diccionarios enteros
 * —fuentes incluidas— dentro de «object streams» comprimidos. Si no se abren,
 * no se encuentran las tablas /ToUnicode y medio documento sale ilegible.
 * Aquí se abren y sus objetos pasan a formar parte del mapa del archivo.
 */
function expandirObjStm(objetos: ObjetoPdf[]): Map<number, ObjetoPdf> {
  const porNumero = new Map<number, ObjetoPdf>();
  for (const o of objetos) porNumero.set(o.num, o);

  for (const o of objetos) {
    if (!o.datos || !/\/Type\s*\/ObjStm/.test(o.dict)) continue;
    let contenido: string;
    try {
      contenido = zlib.inflateSync(Buffer.from(o.datos, "latin1")).toString("latin1");
    } catch {
      continue;
    }
    const n = Number(o.dict.match(/\/N\s+(\d+)/)?.[1] ?? 0);
    const primero = Number(o.dict.match(/\/First\s+(\d+)/)?.[1] ?? 0);
    if (!n) continue;
    const cabecera = contenido.slice(0, primero).trim().split(/\s+/).map(Number);
    for (let i = 0; i < n; i++) {
      const num = cabecera[i * 2];
      const off = cabecera[i * 2 + 1];
      const sig = cabecera[(i + 1) * 2 + 1] ?? contenido.length - primero;
      if (!Number.isFinite(num) || !Number.isFinite(off)) break;
      const cuerpo = contenido.slice(primero + off, primero + (Number.isFinite(sig) ? sig : contenido.length));
      if (cuerpo.trim()) porNumero.set(num, { num, dict: cuerpo, datos: null });
    }
  }
  return porNumero;
}

/** Filtros que NO son texto: si el objeto los lleva, no es una página. */
const NO_TEXTO = /\/(Subtype\s*\/Image|Type\s*\/Font|Type\s*\/XObject(?!\s*\/Form)|Length1|Type\s*\/Metadata|Type\s*\/ObjStm|Type\s*\/Filespec|Type\s*\/EmbeddedFile|FontFile[23]?)/;

export function leerPdf(buf: Buffer): PdfLeido {
  const avisos: string[] = [];
  const crudo = buf.toString("latin1");
  const paginas = Math.max(1, (crudo.match(/\/Type\s*\/Page[^s]/g) ?? []).length);
  const partes: string[] = [];
  let flujos = 0;
  const objetos = objetosPdf(crudo);
  const mapas = mapasDelPdf(crudo, objetos);

  for (const obj of objetos) {
    if (!obj.datos) continue;
    if (NO_TEXTO.test(obj.dict)) continue;
    let textoFlujo: string | null = null;
    if (/\/FlateDecode/.test(obj.dict)) {
      try {
        textoFlujo = zlib.inflateSync(Buffer.from(obj.datos, "latin1")).toString("latin1");
      } catch {
        try {
          textoFlujo = zlib.inflateRawSync(Buffer.from(obj.datos, "latin1")).toString("latin1");
        } catch {
          continue;
        }
      }
    } else if (!/\/(DCTDecode|JPXDecode|CCITTFaxDecode|JBIG2Decode|ASCII85Decode|LZWDecode)/.test(obj.dict)) {
      textoFlujo = obj.datos;
    }
    if (!textoFlujo) continue;
    // un flujo de contenido se reconoce por sus operadores de texto
    if (!/(\bT[jJ]\b|\bBT\b)/.test(textoFlujo)) continue;
    flujos += 1;
    const t = textoDeFlujo(textoFlujo, mapas);
    if (t.trim()) partes.push(t);
  }

  const texto = partes
    .join("\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const total = texto.length;
  const legibles = (texto.match(/[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ0-9\s.,;:()"'¿?¡!%\-–—]/g) ?? []).length;

  if (!total) {
    avisos.push(
      "El PDF no tiene capa de texto (probablemente es un escaneo). La casa no hace OCR: sube el PDF original digital o pega el texto."
    );
  } else if (legibles / Math.max(1, total) < 0.82) {
    avisos.push(
      "Extracción parcial: parte del texto usa fuentes con codificación propia (CID) que no se pueden descifrar sin la tabla ToUnicode del archivo. Lo leído es fiable; lo que falta, no está."
    );
  }
  if (flujos === 0 && total === 0) avisos.push("No se encontró ningún flujo de texto reconocible.");

  return { texto, paginas, flujos, legibles, total, avisos };
}

// ── DOCX (zip + deflate, sin dependencias) ──────────────────────────────

export function leerDocx(buf: Buffer): { texto: string; avisos: string[] } {
  const avisos: string[] = [];
  try {
    // recorre las entradas locales del zip buscando word/document.xml
    let i = 0;
    while (i < buf.length - 4) {
      if (buf.readUInt32LE(i) !== 0x04034b50) {
        i += 1;
        continue;
      }
      const metodo = buf.readUInt16LE(i + 8);
      let comprimido = buf.readUInt32LE(i + 18);
      const nombreLen = buf.readUInt16LE(i + 26);
      const extraLen = buf.readUInt16LE(i + 28);
      const nombre = buf.slice(i + 30, i + 30 + nombreLen).toString("utf8");
      const inicioDatos = i + 30 + nombreLen + extraLen;
      if (comprimido === 0) {
        // tamaño en el descriptor central: se busca el siguiente PK
        const sig = buf.indexOf(Buffer.from([0x50, 0x4b, 0x03, 0x04]), inicioDatos);
        comprimido = (sig > 0 ? sig : buf.length) - inicioDatos;
      }
      if (nombre === "word/document.xml") {
        const datos = buf.slice(inicioDatos, inicioDatos + comprimido);
        const xml =
          metodo === 8 ? zlib.inflateRawSync(datos).toString("utf8") : datos.toString("utf8");
        const texto = xml
          .replace(/<w:tab[^>]*\/>/g, "\t")
          .replace(/<\/w:p>/g, "\n")
          .replace(/<w:br[^>]*\/>/g, "\n")
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
          .replace(/\n{3,}/g, "\n\n")
          .trim();
        avisos.push("DOCX: se leyó el cuerpo del documento. Notas al pie, comentarios y encabezados no se leen.");
        return { texto, avisos };
      }
      i = inicioDatos + comprimido;
    }
    return { texto: "", avisos: ["No se encontró word/document.xml dentro del DOCX (¿está dañado?)."] };
  } catch {
    return { texto: "", avisos: ["El DOCX no se pudo abrir: archivo dañado o cifrado."] };
  }
}

// ── Entidades ───────────────────────────────────────────────────────────

/**
 * El diccionario de lugares sale de DOS catálogos reales de la casa, no de una
 * lista inventada: el atlas (84 naciones con su capital) y las 249 fichas de
 * /mundos (que traen el resto del planeta). Sin lo segundo, «Bruselas» no era
 * un lugar porque Bélgica no estaba en el atlas.
 */
const GAZETTEER = new Map<string, string>();
for (const p of PAISES_ATLAS) {
  GAZETTEER.set(normalizar(p.nombre), p.id);
  if (p.capital) GAZETTEER.set(normalizar(p.capital), p.id);
}
try {
  for (const f of fichas()) {
    if (!f?.iso2) continue;
    if (f.nombre) GAZETTEER.set(normalizar(f.nombre), f.iso2);
    const capital = (f as unknown as { atlas?: { capital?: string | null } }).atlas?.capital;
    if (capital) GAZETTEER.set(normalizar(capital), f.iso2);
  }
} catch {
  /* si el catálogo de mundos no carga, queda el atlas: nunca se rompe el lector */
}

/**
 * Lo que NUNCA es un nombre de persona: países, capitales y las palabras que
 * el atlas usa como nombre propio. Se pasa al extractor heurístico para que
 * «Arabia Saudí» no salga como señor Saudí.
 */
const NO_PERSONAS = new Set<string>([...GAZETTEER.keys()]);

export function lugaresDe(texto: string): { nombre: string; iso?: string; n: number }[] {
  const acc = new Map<string, { nombre: string; iso?: string; n: number }>();
  // ① el atlas real de la casa: nombres de país y capital conocidos
  const palabras = texto.match(/[A-ZÁÉÍÓÚÑ][\wáéíóúñü'.-]+(?:\s+(?:de|del|la|el)\s+[A-ZÁÉÍÓÚÑ][\wáéíóúñü'.-]+)*/g) ?? [];
  for (const w of palabras) {
    const clave = normalizar(w);
    const iso = GAZETTEER.get(clave);
    if (!iso) continue;
    const prev = acc.get(clave);
    if (prev) prev.n += 1;
    else acc.set(clave, { nombre: w, iso, n: 1 });
  }
  // ② capitales y países con tilde escrita de otra forma
  return [...acc.values()].sort((a, b) => b.n - a.n).slice(0, 40);
}

export function entidadesDe(texto: string): Entidades {
  return {
    fechas: fechasDe(texto),
    lugares: lugaresDe(texto),
    personas: personasDe(texto, NO_PERSONAS),
    organizaciones: organizacionesDe(texto),
    acontecimientos: acontecimientosDe(texto),
    cifras: cifrasDe(texto),
  };
}

// ── Construcción del documento ──────────────────────────────────────────

export interface EntradaDocumento {
  nombre: string;
  tipo: Documento["tipo"];
  bytes: number;
  texto: string;
  avisos: string[];
  paginas?: number;
}

export function aDocumento(entrada: EntradaDocumento): Documento {
  const limpio = entrada.texto.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").trim();
  const caracteres = limpio.length;
  const legibles = (limpio.match(/[a-zA-ZáéíóúñüÁÉÍÓÚÑÜ0-9\s.,;:()"'¿?¡!%\-–—]/g) ?? []).length;
  const ratio = caracteres ? legibles / caracteres : 0;
  const calidad: Documento["calidad"] = !caracteres ? "sin-texto" : ratio < 0.82 ? "parcial" : "alta";

  const trozos: Trozo[] = trocear(limpio).map((t, n) => ({ n, pagina: t.pagina + 1, texto: t.texto }));

  // id estable del documento: se calcula con un hash simple del contenido
  let h = 5381;
  for (let i = 0; i < Math.min(limpio.length, 20000); i++) h = ((h << 5) + h + limpio.charCodeAt(i)) | 0;
  const id = `doc:${Math.abs(h).toString(36)}`;

  return {
    id,
    nombre: entrada.nombre,
    tipo: entrada.tipo,
    bytes: entrada.bytes,
    calidad,
    caracteres,
    paginas: entrada.paginas ?? Math.max(1, trozos.length ? trozos[trozos.length - 1].pagina : 1),
    texto: limpio.slice(0, 400_000),
    trozos,
    entidades: entidadesDe(limpio.slice(0, 400_000)),
    avisos: entrada.avisos,
  };
}

/** Lee un archivo subido y devuelve el documento normalizado. */
export function leerArchivo(nombre: string, buf: Buffer): Documento {
  const ext = (nombre.split(".").pop() ?? "").toLowerCase();
  const bytes = buf.length;

  if (ext === "pdf") {
    const r = leerPdf(buf);
    const doc = aDocumento({ nombre, tipo: "pdf", bytes, texto: r.texto, avisos: r.avisos, paginas: r.paginas });
    return doc;
  }
  if (ext === "docx") {
    const r = leerDocx(buf);
    return aDocumento({ nombre, tipo: "docx", bytes, texto: r.texto, avisos: r.avisos });
  }
  if (["txt", "md", "csv", "json", "tsv", "log", "xml", "html", "htm"].includes(ext)) {
    let t = buf.toString("utf8");
    if (ext === "html" || ext === "htm") {
      t = t.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, "\n");
    }
    const tipo = (["md", "csv", "json"].includes(ext) ? ext : "txt") as Documento["tipo"];
    return aDocumento({ nombre, tipo, bytes, texto: t, avisos: [] });
  }
  return aDocumento({
    nombre,
    tipo: "txt",
    bytes,
    texto: "",
    avisos: [`Formato «${ext}» no admitido. La casa lee PDF, DOCX, TXT, MD, CSV y JSON (o texto pegado).`],
  });
}
