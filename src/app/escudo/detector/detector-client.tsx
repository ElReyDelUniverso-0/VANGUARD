"use client";

// ═══════════════════════════════════════════════════════════════════════════
// EL CENTINELA DE BOLSILLO — isla del Detector de Llaves (/escudo/detector,
// ronda EL CENTINELA, complemento de la ley v204 EL ESCUDO). El mismo mirar del Buscador
// (scripts/busca-apikeys.mjs — su catálogo viaja horneado a esta sala en
// build) pero EN EL NAVEGADOR: pega un texto y mira si lleva llaves expuestas
// antes de enviarlo a un chat, un correo o un commit.
//
//   · PRIVACIDAD PRIMERO: TODO pasa en este navegador — cero fetch, cero red,
//     cero telemetría. El texto pegado jamás sale de la sala.
//   · SIN EFECTOS, SIN INTERVALOS (ley v335): el estado solo cambia con la
//     mano del comandante — tres gestos: MIRAR, FORJAR, MEDIR.
//   · UNA SOLA FUENTE DE VERDAD: los patrones los declara el script en su
//     --catalogo; esta isla es el motor de aplicación, no otra fuente. El
//     motor de asignación genérica es el puerto honesto de aplicaGenerico().
//   · Las llaves cazadas viajan ENMASCARADAS (ley del Buscador: jamás filtra
//     lo que caza) y LA FORJA genera con crypto.getRandomValues del navegador.
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from "react";

export type FamiliaCatalogo = {
  id: string;
  familia: string;
  severidad: string;
  cura: string;
  tipo: "regex" | "generico";
  patron: string | null;
  banderas: string | null;
};

type Hallazgo = {
  linea: number;
  familia: string;
  severidad: string;
  muestra: string;
  texto: string;
  cura: string;
};

type Medido = { bits: number; pool: number };

// ── límites honestos del bolsillo ──────────────────────────────────────────
const TOPE_TEXTO = 200_000; // lo más grande que mira una pasada
const TOPE_HALLAZGOS = 20; // lo que se pinta en la lista

// ── el puerto honesto del motor del script (aplicaGenerico) ────────────────
const PLACEHOLDER =
  /(cambia|tu-|tu_|example|xxx|placeholder|changeme|change-me|<[^>]+>|\{process|\$\{|your_|my_|insert|api_key_here|personalizar|reemplazar|cadena-larga|cadena\s+larga)/i;
const COMENTARIO = /^[ \t]*(#|\/\/|\/\*|\*|--)/;
const ENV_RE =
  /^[ \t]*([A-Z][A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|APIKEY|API_KEY|ADMIN_KEY|WEBHOOK_SECRET))[A-Z0-9_]*[ \t]*=[ \t]*["']?([^"'\s]{8,120})["']?/;
const JS_RE =
  /^[ \t]*(?:export )?(?:const|let|var)[ \t]+([A-Za-z0-9_$]+)[ \t]*=[ \t]*(?:process\.env\.[A-Z_]+\s*\?\?\s*)?["'`]([^'`\n]{8,120})["'`]/;
const NOMBRE_HUELE =
  /(SECRET|TOKEN|PASSWORD|PASS|APIKEY|API_KEY|ADMIN_KEY|CRED|WEBHOOK|AUTH)/i;

function aplicaGenerico(linea: string): string | null {
  if (COMENTARIO.test(linea)) return null;
  const env = ENV_RE.exec(linea);
  const js = JS_RE.exec(linea);
  // solo nombres de variable que HUELEN a secreto — "STORAGE_KEY" no huele
  const nombreHuele = js ? NOMBRE_HUELE.test(js[1]) : false;
  const valor = env ? env[2] : js && nombreHuele ? js[2] : null;
  if (!valor) return null;
  if (PLACEHOLDER.test(valor) || PLACEHOLDER.test(linea)) return null;
  return valor;
}

// ── el enmascarado (ley del Buscador: el informe jamás filtra lo que caza) ─
function marca(s: string): string {
  return s.length > 14
    ? s.slice(0, 6) + "…" + s.slice(-4)
    : "•".repeat(Math.max(s.length, 8));
}

// ── la mirada: línea a línea, con los patrones horneados del script ────────
function escanear(texto: string, catalogo: FamiliaCatalogo[]): Hallazgo[] {
  const motores = catalogo
    .map((f) => ({
      f,
      re:
        f.tipo === "regex" && f.patron
          ? new RegExp(f.patron, f.banderas ?? "")
          : null,
    }))
    .filter((x) => x.re || x.f.tipo === "generico");

  const hallazgos: Hallazgo[] = [];
  const lineas = texto.split("\n");
  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i];
    if (!linea || linea.length > 2000) continue;
    for (const { f, re } of motores) {
      const matched = re ? (re.exec(linea)?.[0] ?? null) : aplicaGenerico(linea);
      if (!matched) continue;
      hallazgos.push({
        linea: i + 1,
        familia: f.familia,
        severidad: f.severidad,
        muestra: marca(matched),
        texto: linea.trim().slice(0, 120),
        cura: f.cura,
      });
    }
  }
  return hallazgos;
}

// ── LA FORJA — bytes del navegador, sin servidor ───────────────────────────
function bytesAleatorios(n: number): Uint8Array {
  const b = new Uint8Array(n);
  globalThis.crypto.getRandomValues(b);
  return b;
}

function llaveHex(nBytes: number): string {
  const HEX = "0123456789abcdef";
  const bytes = bytesAleatorios(nBytes);
  let out = "";
  for (const b of bytes) {
    out += HEX[b >> 4] + HEX[b & 15];
  }
  return out;
}

function llaveBase62(len: number): string {
  const ALF = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const max = 256 - (256 % ALF.length); // rechazo honesto: sin sesgo de módulo
  let out = "";
  while (out.length < len) {
    const bloque = bytesAleatorios(64);
    for (const v of bloque) {
      if (v >= max) continue;
      out += ALF[v % ALF.length];
      if (out.length === len) break;
    }
  }
  return out;
}

// 256 palabras EXACTAS = 8 bits por tirada: crypto decide el índice 0-255 y
// cada palabra del diccionario es igual de probable. 8 palabras = 64 bits.
const PALABRAS: readonly string[] = [
  "acorazado", "almirante", "arsenal", "atalaya", "ballena", "bastión", "bitácora", "brújula",
  "buque", "búnker", "cabina", "cañón", "capitán", "carguero", "carreta", "casco",
  "centinela", "cifra", "cofre", "colina", "comando", "coraza", "corsario", "crepúsculo",
  "cruzada", "cuartel", "cubierta", "cúpula", "delta", "desierto", "diana", "dintel",
  "dron", "eco", "embarcación", "emisario", "escuadrón", "espía", "espiga", "estrella",
  "estribo", "faro", "ficha", "frontera", "gavia", "golfo", "granada", "grillete",
  "guante", "guardia", "halcón", "hazaña", "hélice", "himno", "horizonte", "huracán",
  "islote", "jade", "jaguar", "jungla", "kilómetro", "laberinto", "lancha", "latitud",
  "leal", "leyenda", "libreta", "ligero", "limón", "linterna", "lobo", "longitud",
  "lumbre", "luna", "machete", "marea", "marfil", "marino", "martillo", "mástil",
  "medianoche", "meridiano", "meta", "meteorito", "mirador", "misil", "misterio", "misión",
  "mitad", "monzón", "montaña", "morada", "morsa", "mosquete", "muralla", "naranja",
  "nave", "nebulosa", "niebla", "noche", "norte", "noticia", "novena", "oasis",
  "océano", "oeste", "olvido", "órbita", "orden", "oreja", "otoño", "oveja",
  "pacto", "palacio", "palmera", "pantera", "paracaídas", "pasado", "paseo", "pasillo",
  "patio", "paz", "pecho", "pedernal", "peñón", "perfume", "perla", "pescador",
  "pintura", "piraña", "pistola", "pivote", "plancha", "plasma", "plaza", "pluma",
  "polar", "polvo", "portal", "puerto", "pulso", "punta", "quebrada", "radar",
  "ráfaga", "raíz", "ramo", "rapaz", "rasgo", "ratón", "rayo", "rebaño",
  "recodo", "red", "reflejo", "refugio", "reina", "reloj", "remolino", "represa",
  "resaca", "resina", "respiro", "retrato", "rey", "risco", "rito", "roble",
  "roca", "rodilla", "rojo", "ronda", "rosa", "rostro", "rubí", "rueda",
  "ruido", "rumbo", "sargazo", "sello", "selva", "semilla", "señal", "sereno",
  "silla", "sismo", "sombra", "sol", "sonrisa", "soporte", "sordo", "sortija",
  "sostén", "sueldo", "tabla", "tambor", "tanque", "tango", "tapia", "techo",
  "teja", "telón", "temple", "tenaza", "tierra", "tigre", "timón", "tinta",
  "tiovivo", "tonelada", "tormenta", "torre", "tractor", "traición", "trampa", "tregua",
  "trenza", "tribuna", "trigo", "trino", "trípode", "trono", "tropa", "tundra",
  "turbo", "tulipán", "túnel", "turbina", "urna", "valla", "valle", "vainilla",
  "vaquero", "vela", "venado", "venta", "verano", "vertebrado", "vestido", "vía",
  "viaje", "viga", "viñeta", "violeta", "visera", "vista", "viuda", "volcán",
  "vuelo", "yegua", "yermo", "yugo", "yate", "yunque", "zapato", "zanja",
];

function fraseMemorable(nPalabras: number): string {
  const índices = bytesAleatorios(nPalabras);
  return Array.from(índices, (b) => PALABRAS[b]).join("-");
}

// ── EL MEDIDOR — entropía honesta por alfabeto (estimación, no promesa) ────
function medirEntropia(s: string): Medido {
  if (!s) return { bits: 0, pool: 0 };
  let pool = 0;
  if (/[a-z]/.test(s)) pool += 26;
  if (/[A-Z]/.test(s)) pool += 26;
  if (/[0-9]/.test(s)) pool += 10;
  if (/[ -\/:-@[-`{-~]/.test(s)) pool += 33;
  if (/[^ -~]/.test(s)) pool += 100;
  if (pool === 0) return { bits: 0, pool: 0 };
  return { bits: Math.round(s.length * Math.log2(pool)), pool };
}

function veredictoBits(bits: number): { texto: string; clase: string } {
  if (bits <= 0) return { texto: "VACÍO", clase: "text-zinc-500" };
  if (bits < 60)
    return { texto: "DÉBIL — un diccionario la adivina", clase: "text-red-400" };
  if (bits < 100)
    return { texto: "ADMISIBLE — sirve de puerta interior", clase: "text-amber-400" };
  if (bits < 128)
    return { texto: "FUERTE — buena para el día a día", clase: "text-emerald-400" };
  return { texto: "DE ACERO — 128+ bits, grifo cerrado", clase: "text-emerald-300" };
}

const chipSeveridad = (sev: string) =>
  sev === "ALTA"
    ? "border-red-500/40 bg-red-500/10 text-red-400"
    : "border-amber-500/40 bg-amber-500/10 text-amber-400";

// ── el ejemplo didáctico — llaves FALSAS de manual (las de los manuales de
// AWS/Stripe/jwt.io y vecinas inventadas): sirven para enseñar a mirar. El
// Buscador del taller no vigila este archivo (el espejo no se vigila a sí
// mismo — declarado en scripts/busca-apikeys.mjs).
const EJEMPLO = `# Pega aquí lo que quieras mirar antes de enviarlo.
# Ejemplo de un correo peligroso (llaves FALSAS de manual):

Hola, estos son los accesos del proyecto:

const OPENAI_API_KEY = "sk-proj-4vC8xQ2mN7pR9tW3yB6dF1gH5jK8lZ0aE2cV4bX";
GOOGLE_MAPS_KEY="AIzaSyD1234567890abcdefghijklmnopqrstuvwx"
aws_access_key_id = AKIAIOSFODNN7EXAMPLE
github_token: ghp_aBcDeFgHiJkLmNoPqRsTuVwXyZ0123456789
bot de telegram: 12345678:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
stripe: sk_live_4eC39HqLyjWDarjt
# (la muestra de Slack se retiró del manual: GitHub Push Protection no deja
# viajar ni a las FALSAS — lección vivida de la ronda del bolsillo: una xoxb
# con cara de real no cruza la frontera de GitHub ni como ejemplo didáctico)
base de datos: postgres://usuario:secreta@db.ejemplo.com:5432/vanguard
sesión: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NSJ9.dBjftJeZ4CVPmB92K27uhbUJU1p1r_wW1gFWFOEjXk
const WEBHOOK_SECRET = "vanguard-ejemplo-no-es-real-2026"
const INDEXNOW = "074b8db50cc83f0689a2211e3ff94db1"

-----BEGIN PRIVATE KEY-----
(no pongas nunca una llave real aquí — es el ejemplo del peligro)
`;

type EstadoForja = { hex: string; b62: string; frase: string; copiado: string };

export function DetectorClient({ catalogo }: { catalogo: FamiliaCatalogo[] }) {
  // EL DETECTOR
  const [texto, setTexto] = useState("");
  const [hallazgos, setHallazgos] = useState<Hallazgo[] | null>(null);
  const [recortado, setRecortado] = useState(false);

  // LA FORJA
  const [forja, setForja] = useState<EstadoForja>({
    hex: "",
    b62: "",
    frase: "",
    copiado: "",
  });

  // EL MEDIDOR
  const [candidata, setCandidata] = useState("");
  const [medido, setMedido] = useState<Medido | null>(null);
  const [familiasCandidata, setFamiliasCandidata] = useState<Hallazgo[] | null>(null);

  function mirar() {
    const recorte = texto.length > TOPE_TEXTO;
    const cuerpo = recorte ? texto.slice(0, TOPE_TEXTO) : texto;
    setRecortado(recorte);
    setHallazgos(escanear(cuerpo, catalogo));
  }

  function forjar(pieza: "hex" | "b62" | "frase") {
    setForja((f) => ({
      ...f,
      hex: pieza === "hex" ? llaveHex(32) : f.hex,
      b62: pieza === "b62" ? llaveBase62(40) : f.b62,
      frase: pieza === "frase" ? fraseMemorable(8) : f.frase,
      copiado: "",
    }));
  }

  async function copiar(valor: string, etiqueta: string) {
    try {
      await navigator.clipboard.writeText(valor);
      setForja((f) => ({ ...f, copiado: etiqueta }));
    } catch {
      setForja((f) => ({ ...f, copiado: "" }));
    }
  }

  function medir() {
    setMedido(medirEntropia(candidata));
    setFamiliasCandidata(candidata ? escanear(candidata, catalogo) : null);
  }

  const veredicto = hallazgos
    ? { limpio: hallazgos.length === 0 }
    : null;

  return (
    <div className="mt-5 flex flex-col gap-10">
      {/* ══════════════ EL DETECTOR ══════════════ */}
      <section>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400">
          1 · El detector — pega y mira
        </p>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={9}
          spellCheck={false}
          placeholder="Pega aquí el texto, el .env, el correo, el fragmento de código…"
          className="mt-3 w-full rounded-md border border-zinc-800 bg-zinc-900/60 p-3 font-mono text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={mirar}
            className="inline-flex items-center gap-2 rounded-sm border border-amber-500/50 bg-amber-500/10 px-4 py-2.5 font-mono text-[12px] uppercase tracking-widest text-amber-400 transition-colors hover:border-amber-400 hover:bg-amber-500/20 hover:text-amber-300"
          >
            Mirar el texto ▸
          </button>
          <button
            onClick={() => setTexto(EJEMPLO)}
            className="rounded-sm border border-zinc-700 bg-zinc-900/60 px-3 py-2.5 font-mono text-[11px] uppercase tracking-widest text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
          >
            Cargar ejemplo (llaves falsas)
          </button>
          <button
            onClick={() => {
              setTexto("");
              setHallazgos(null);
              setRecortado(false);
            }}
            className="rounded-sm border border-zinc-800 bg-transparent px-3 py-2.5 font-mono text-[11px] uppercase tracking-widest text-zinc-600 transition-colors hover:border-zinc-600 hover:text-zinc-400"
          >
            Limpiar
          </button>
        </div>
        <p className="mt-2 font-mono text-[10px] text-zinc-600">
          todo pasa en este navegador · nada viaja a ningún server · hasta{" "}
          {TOPE_TEXTO.toLocaleString("es")} caracteres por pasada
        </p>

        {veredicto && (
          <div className="mt-4">
            {veredicto.limpio ? (
              <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-4">
                <p className="font-mono text-[13px] uppercase tracking-widest text-emerald-400">
                  Veredicto: sin llaves conocidas
                </p>
                <p className="mt-1.5 font-mono text-[11px] text-zinc-400">
                  Ninguna de las {catalogo.length} familias del escudo casó con
                  el texto. Igual mira con ojos: hay secretos que ninguna
                  familia describe.
                </p>
              </div>
            ) : (
              <div className="rounded-md border border-red-500/40 bg-red-500/10 p-4">
                <p className="font-mono text-[13px] uppercase tracking-widest text-red-400">
                  La bolsa sangra — {hallazgos?.length} hallazgos
                </p>
                <p className="mt-1.5 font-mono text-[11px] text-zinc-400">
                  Este texto lleva llaves con cara de reales. No lo envíes, no
                  lo commitees. Cada hallazgo trae su cura.
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  {hallazgos?.slice(0, TOPE_HALLAZGOS).map((h, i) => (
                    <div
                      key={`${h.linea}-${i}`}
                      className="rounded-md border border-red-500/30 bg-red-500/5 p-3"
                    >
                      <p className="font-mono text-[11px] text-red-300">
                        línea {h.linea} · [{h.severidad}] {h.muestra}
                      </p>
                      <p className="mt-1 text-[10px] text-zinc-500">
                        {h.familia}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-zinc-600 break-all">
                        {h.texto}
                      </p>
                      <p className="mt-1 text-[10px] text-emerald-500/90">
                        cura: {h.cura}
                      </p>
                    </div>
                  ))}
                  {(hallazgos?.length ?? 0) > TOPE_HALLAZGOS && (
                    <p className="font-mono text-[10px] text-zinc-600">
                      … y {(hallazgos?.length ?? 0) - TOPE_HALLAZGOS} más — este
                      texto está lleno: revísalo entero antes de moverlo.
                    </p>
                  )}
                </div>
              </div>
            )}
            {recortado && (
              <p className="mt-2 font-mono text-[10px] text-amber-400">
                Aviso honesto: el texto pasó de{" "}
                {texto.length.toLocaleString("es")} a{" "}
                {TOPE_TEXTO.toLocaleString("es")} caracteres — la mirada cubrió
                el principio, no el final.
              </p>
            )}
          </div>
        )}
      </section>

      {/* ══════════════ LA FORJA ══════════════ */}
      <section>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400">
          2 · La forja — forja llaves que sí aguantan
        </p>
        <p className="mt-2 text-[12px] text-zinc-500 leading-relaxed">
          El mismo crypto del navegador que usan los bancos (getRandomValues),
          en tres formatos: la llave larga de bytes para APIs y secretos, la
          alfanumérica para tokens de uso diario y la frase memorable para
          contraseñas de persona. Nada viaja: la llave nace y vive aquí.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <div className="rounded-md border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-[11px] text-zinc-300">
                Llave de 32 bytes · 256 bits de entropía real
              </p>
              <button
                onClick={() => forjar("hex")}
                className="shrink-0 rounded-sm border border-amber-500/50 bg-amber-500/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-amber-400 hover:border-amber-400 hover:text-amber-300"
              >
                Forjar ▸
              </button>
            </div>
            {forja.hex && (
              <p
                onClick={() => copiar(forja.hex, "hex")}
                className="mt-2 cursor-pointer break-all rounded-sm bg-zinc-950/80 p-2 font-mono text-[12px] text-emerald-400 hover:text-emerald-300"
              >
                {forja.hex}
                <span className="ml-2 text-[10px] text-zinc-600">
                  {forja.copiado === "hex" ? "· copiada ✓" : "· clic para copiar"}
                </span>
              </p>
            )}
          </div>

          <div className="rounded-md border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-[11px] text-zinc-300">
                Llave alfanumérica de 40 signos · ≈238 bits
              </p>
              <button
                onClick={() => forjar("b62")}
                className="shrink-0 rounded-sm border border-amber-500/50 bg-amber-500/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-amber-400 hover:border-amber-400 hover:text-amber-300"
              >
                Forjar ▸
              </button>
            </div>
            {forja.b62 && (
              <p
                onClick={() => copiar(forja.b62, "b62")}
                className="mt-2 cursor-pointer break-all rounded-sm bg-zinc-950/80 p-2 font-mono text-[12px] text-emerald-400 hover:text-emerald-300"
              >
                {forja.b62}
                <span className="ml-2 text-[10px] text-zinc-600">
                  {forja.copiado === "b62" ? "· copiada ✓" : "· clic para copiar"}
                </span>
              </p>
            )}
          </div>

          <div className="rounded-md border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-[11px] text-zinc-300">
                Frase memorable · 8 palabras × 8 bits = 64 bits honestos
              </p>
              <button
                onClick={() => forjar("frase")}
                className="shrink-0 rounded-sm border border-amber-500/50 bg-amber-500/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest text-amber-400 hover:border-amber-400 hover:text-amber-300"
              >
                Forjar ▸
              </button>
            </div>
            {forja.frase && (
              <p
                onClick={() => copiar(forja.frase, "frase")}
                className="mt-2 cursor-pointer break-all rounded-sm bg-zinc-950/80 p-2 font-mono text-[12px] text-emerald-400 hover:text-emerald-300"
              >
                {forja.frase}
                <span className="ml-2 text-[10px] text-zinc-600">
                  {forja.copiado === "frase" ? "· copiada ✓" : "· clic para copiar"}
                </span>
              </p>
            )}
            <p className="mt-1.5 text-[10px] text-zinc-600">
              64 bits sirve para una contraseña de persona; para llaves de API,
              las de bytes (128-256 bits) son la ley.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════ EL MEDIDOR ══════════════ */}
      <section>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-400">
          3 · El medidor — ¿tu llave aguanta?
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            type="password"
            value={candidata}
            onChange={(e) => setCandidata(e.target.value)}
            placeholder="Escribe una candidata (no se envía a ninguna parte)"
            className="min-w-0 flex-1 rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-2.5 font-mono text-[12px] text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none"
          />
          <button
            onClick={medir}
            className="shrink-0 rounded-sm border border-amber-500/50 bg-amber-500/10 px-4 py-2.5 font-mono text-[12px] uppercase tracking-widest text-amber-400 transition-colors hover:border-amber-400 hover:bg-amber-500/20 hover:text-amber-300"
          >
            Medir ▸
          </button>
        </div>
        {medido && (
          <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-900/60 p-4">
            <p className="font-mono text-[12px] text-zinc-300">
              {medido.bits} bits de entropía estimada · alfabeto de {medido.pool}{" "}
              signos
            </p>
            <p
              className={`mt-1.5 font-mono text-[12px] uppercase tracking-widest ${veredictoBits(medido.bits).clase}`}
            >
              {veredictoBits(medido.bits).texto}
            </p>
            {familiasCandidata && familiasCandidata.length > 0 && (
              <p className="mt-2 font-mono text-[11px] text-red-400">
                y además: casó con{" "}
                {familiasCandidata
                  .map((h) => h.familia.replace(/\s*\(.*\)$/, ""))
                  .join(", ")}
                {" "}— es una llave CONOCIDA, no una invención tuya.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
