#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// VANGUARD — EL BUSCADOR DE LLAVES (busca-apikeys.mjs) · complemento de la
// ley v204 EL ESCUDO: revisa el árbol de trabajo buscando API keys y secretos
// filtrados ANTES de que viajen al repo o al público. Node puro, cero
// dependencias nuevas (ley de la casa).
//
//   node scripts/busca-apikeys.mjs            → informe · exit 1 si hay hallazgos NUEVOS
//   node scripts/busca-apikeys.mjs --strict   → también falla con los permitidos (quemados)
//   node scripts/busca-apikeys.mjs --json     → salida JSON (para CI u otras herramientas)
//
// Reglas del veredicto:
//   · HALLAZGO NUEVO   → una llave real detectada fuera de la lista de permitidos → exit 1.
//   · PERMITIDO        → secreto YA PÚBLICO y documentado (quemado o con rotación pendiente
//                        declarada en el propio código) → se avisa con voz alta pero exit 0,
//                        para que el escudo no sangre eternamente mientras el Dueño ejecuta
//                        su rotación. En cuanto el P0 se cure, estas líneas salen de la
//                        lista y cualquier reaparición vuelve a ser delito.
//   · Las claves del informe viajan ENMASCARADAS: el informe nunca filtra lo que caza.
// ═══════════════════════════════════════════════════════════════════════════

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";

// ── LAS 10 FAMILIAS VIGILADAS (+ 1 genérico de reserva) ────────────────────
// id · familia · severidad · patrón · consejo de cura
const DETECTORES = [
  {
    id: "openai",
    familia: "1. OpenAI / Anthropic (sk-, sk-proj-, sk-ant-)",
    severidad: "ALTA",
    regex: /\bsk-(?:proj|svcacct|admin)-[A-Za-z0-9_\-]{20,}\b|\bsk-ant-[A-Za-z0-9_\-]{20,}\b|\bsk-[A-Za-z0-9]{20,}\b/,
    cura: "Revoca en platform.openai.com / console.anthropic.com y gira la llave.",
  },
  {
    id: "google",
    familia: "2. Google Cloud / API (AIza…)",
    severidad: "ALTA",
    regex: /\bAIza[0-9A-Za-z_\-]{35}\b/,
    cura: "Restringe o borra la clave en Google Cloud Console → Credenciales.",
  },
  {
    id: "aws",
    familia: "3. Amazon AWS (AKIA/ASIA…)",
    severidad: "ALTA",
    regex: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/,
    cura: "Desactiva la access key en IAM y revisa CloudTrail por uso ajeno.",
  },
  {
    id: "github",
    familia: "4. GitHub (ghp_/gho_/ghu_/ghs_/ghr_)",
    severidad: "ALTA",
    regex: /\bgh[pousr]_[A-Za-z0-9]{36,255}\b/,
    cura: "Revoca el token en Settings → Developer settings → Tokens.",
  },
  {
    id: "telegram",
    familia: "5. Bot de Telegram (123456:AA…)",
    severidad: "ALTA",
    regex: /\b\d{8,10}:[A-Za-z0-9_\-]{35,}\b/,
    cura: "Revoca con BotFather (/revoke) y define TELEGRAM_BOT_TOKEN solo en el entorno.",
  },
  {
    id: "stripe",
    familia: "6. Stripe (sk_live_/rk_live_)",
    severidad: "ALTA",
    regex: /\b(?:sk|rk)_live_[A-Za-z0-9]{16,}\b/,
    cura: "Rueda la clave en Dashboard → Desarrolladores → Claves API.",
  },
  {
    id: "slack",
    familia: "7. Slack (xoxb-/xoxp-/xoxa-…)",
    severidad: "ALTA",
    regex: /\bxox[bparsa]-[A-Za-z0-9\-]{10,}\b/,
    cura: "Revoca en api.slack.com/apps → OAuth & Permissions.",
  },
  {
    id: "llave-privada",
    familia: "8. Llave privada / Firebase service account (BEGIN PRIVATE KEY)",
    severidad: "ALTA",
    regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP |ENCRYPTED )?PRIVATE KEY(?: BLOCK)?-----/,
    cura: "La llave viajó: considera comprometida. Genera otra y revoca la antigua.",
  },
  {
    id: "credenciales-url",
    familia: "9. Credenciales en URL de conexión (postgres://user:pass@…)",
    severidad: "ALTA",
    regex: /\b(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis|amqp|ftp):\/\/[A-Za-z0-9._%\-]+:[^@\s\/]{4,}@/,
    cura: "Mueve usuario/contraseña a variables de entorno (DATABASE_URL en Vercel).",
  },
  {
    id: "jwt",
    familia: "10. JWT firmado (eyJ…eyJ…)",
    severidad: "MEDIA",
    regex: /\beyJ[A-Za-z0-9_\-]{8,}\.eyJ[A-Za-z0-9_\-]{8,}\.[A-Za-z0-9_\-]{8,}\b/,
    cura: "Un JWT en el repo es un sesión-viva filtrada: rota AUTH_SECRET e invalida.",
  },
  {
    // GENÉRICO DE RESERVA: asignaciones de secretos con valor literal
    // (const AUTH_SECRET = "…" · TELEGRAM_BOT_TOKEN=…). Solo nombres que huelen
    // a secreto — las llaves de localStorage (LS_KEY, STORAGE_KEY…) NO son secretos.
    id: "generico",
    familia: "+1. Genérico de asignación (SECRET/TOKEN/PASSWORD = \"…\")",
    severidad: "MEDIA",
    regex: null, // se aplica línea a línea (ver aplicaGenerico)
    cura: "Mueve el valor a variables de entorno y quema el que quedó en el histórico.",
  },
  {
    // LITERAL HEX DE ALTA ENTROPÍA: caza llaves que no se llaman "secret"
    // (const KEY = "074b8db5…") — 24+ caracteres hexadecimales entre comillas.
    // Los nombres de localStorage llevan guiones/undersores/versión; el hex
    // puro de ese tamaño casi siempre es una llave, un hash o un token.
    id: "hex-entropia",
    familia: "+2. Literal hex de alta entropía (≥24 dentro de comillas)",
    severidad: "MEDIA",
    regex: /["'][a-fA-F0-9]{24,}["']/,
    cura: "Si es una llave real, muévela a variables de entorno y revoca la filtrada; si es pública por diseño (IndexNow…), decláralo en PERMITIDOS.",
  },
];

// ── LISTA DE PERMITIDOS — secretos YA PÚBLICOS, documentados y pendientes ──
// Cada entrada es una deuda declarada: cuando el Dueño cure el P0 (rotar en
// Vercel + borrar el fallback del código), ESTA lista se vacía y el escudo
// vuelve a sangre completa. Nada nuevo entra aquí sin un commit que lo confiese.
const PERMITIDOS = [
  {
    valor: "074b8db50cc83f0689a2211e3ff94db1",
    motivo: "IndexNow: clave de verificación PÚBLICA por diseño (se hospeda en /<KEY>.txt, agent-ping) — no es secreto.",
  },
  {
    valor: "vg-escudo-204-reserva-rotada-2026-11-xQ7",
    motivo: "v204: AUTH_SECRET de reserva en src/lib/auth-server.ts — público, rotación pendiente en Vercel.",
  },
  {
    valor: "escudo204-comandante",
    motivo: "v204: OWNER_PASSWORD de reserva en src/lib/auth-server.ts — público, rotación pendiente en Vercel.",
  },
  {
    valor: "vanguard-launch-2026",
    motivo: "quemado: AUTH_SECRET original (documentado en version.ts y worklog) — sin uso desde v204.",
  },
  {
    valor: "vanguard2026",
    motivo: "quemado: OWNER_PASSWORD original (documentado en version.ts y worklog) — sin uso desde v204.",
  },
];

// ── Qué se escanea y qué no ────────────────────────────────────────────────
const DIRS_FUERA = new Set([
  "node_modules", ".git", ".next", ".vercel", ".output", "standalone", "dist",
  "video", "capturas", "media", "rescate-v168", "tmp", "download", "upload",
  "tool-results", ".zscripts-cache",
]);
const EXT_TXT = new Set([
  ".ts", ".tsx", ".js", ".mjs", ".cjs", ".mts", ".jsx", ".json", ".md", ".yml",
  ".yaml", ".sh", ".bash", ".prisma", ".css", ".scss", ".html", ".htm", ".xml",
  ".svg", ".txt", ".env", ".example", ".toml", ".ini", ".cfg", ".sql", ".lock",
]);
const EXT_BIN = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".bmp", ".mp4", ".webm",
  ".mov", ".wav", ".mp3", ".ogg", ".db", ".sqlite", ".sqlite3", ".wasm", ".zip",
  ".gz", ".tgz", ".tar", ".rar", ".7z", ".pdf", ".woff", ".woff2", ".ttf", ".otf",
  ".eot", ".bin", ".pid", ".exe", ".dll", ".so", ".dylib", ".node", ".onnx",
]);
const NOMBRES_TXT_SIN_EXT = new Set(["Caddyfile", "Dockerfile", ".gitignore", ".npmrc", ".env", ".env.example"]);
const TOPE_BYTES = 2_000_000; // lo más grande que se lee (worklog 1.6 MB entra)

// ── placeholders que anulan el genérico ────────────────────────────────────
const PLACEHOLDER = /(cambia|tu-|tu_|example|xxx|placeholder|changeme|change-me|<[^>]+>|\{process|\$\{|your_|my_|insert|api_key_here|personalizar|reemplazar|cadena-larga|cadena\s+larga)/i;
const COMENTARIO = /^[ \t]*(#|\/\/|\/\*|\*|--)/;

// ── utilidades ─────────────────────────────────────────────────────────────
const RUTA = process.cwd();
const marca = (s) => (s.length > 14 ? s.slice(0, 6) + "…" + s.slice(-4) : "•".repeat(Math.max(s.length, 8)));
const permitidoPorTexto = (texto) => PERMITIDOS.find((p) => texto.includes(p.valor)) || null;

function aplicaGenerico(linea) {
  const sinComentario = COMENTARIO.test(linea) ? null : linea;
  if (!sinComentario) return null;
  const env = /^[ \t]*([A-Z][A-Z0-9_]*(?:SECRET|TOKEN|PASSWORD|APIKEY|API_KEY|ADMIN_KEY|WEBHOOK_SECRET))[A-Z0-9_]*[ \t]*=[ \t]*["']?([^"'\s]{8,120})["']?/.exec(linea);
  const js = /^[ \t]*(?:export )?(?:const|let|var)[ \t]+([A-Za-z0-9_$]+)[ \t]*=[ \t]*(?:process\.env\.[A-Z_]+\s*\?\?\s*)?["'`]([^'`\n]{8,120})["'`]/.exec(linea);
  // solo nombres de variable que HUELEN a secreto — "STORAGE_KEY" o "LS_KEY" no huelen
  const nombreHuele = js ? /(SECRET|TOKEN|PASSWORD|PASS|APIKEY|API_KEY|ADMIN_KEY|CRED|WEBHOOK|AUTH)/i.test(js[1]) : false;
  const valor = env ? env[2] : js && nombreHuele ? js[2] : null;
  if (!valor) return null;
  if (PLACEHOLDER.test(valor) || PLACEHOLDER.test(linea)) return null;
  return valor;
}

function* archivos(raiz) {
  for (const nombre of readdirSync(raiz)) {
    const completo = join(raiz, nombre);
    let st;
    try { st = statSync(completo); } catch { continue; }
    if (st.isDirectory()) {
      if (DIRS_FUERA.has(nombre)) continue;
      yield* archivos(completo);
    } else {
      yield completo;
    }
  }
}

function legible(ruta) {
  const rel = relative(RUTA, ruta);
  const ext = extname(nombre(rel)).toLowerCase();
  const base = nombre(rel);
  if (EXT_BIN.has(ext)) return false;
  if (!ext) return NOMBRES_TXT_SIN_EXT.has(base);
  return EXT_TXT.has(ext);
}
const nombre = (p) => p.split("/").pop().split("\\").pop();

// ── el barrido ─────────────────────────────────────────────────────────────
const nuevos = [];
const permitidos = [];
let examinados = 0;

for (const ruta of archivos(RUTA)) {
  const rel2 = relative(RUTA, ruta);
  if (rel2 === "scripts/busca-apikeys.mjs") continue; // el espejo no se vigila a sí mismo
  if (!legible(ruta)) continue;
  let st;
  try { st = statSync(ruta); } catch { continue; }
  if (!st.isFile() || st.size > TOPE_BYTES) continue;
  let texto;
  try {
    texto = readFileSync(ruta, "utf8");
  } catch { continue; }
  if (texto.slice(0, 8192).includes("\u0000")) continue; // binario disfrazado
  examinados++;

  const rel = relative(RUTA, ruta);
  const lineas = texto.split("\n");
  for (let i = 0; i < lineas.length; i++) {
    const linea = lineas[i];
    if (!linea || linea.length > 2000) continue;

    for (const d of DETECTORES) {
      let matched = null;
      if (d.regex) {
        const m = d.regex.exec(linea);
        if (m) matched = m[0];
      } else {
        matched = aplicaGenerico(linea);
      }
      if (!matched) continue;

      const registro = {
        archivo: rel,
        linea: i + 1,
        detector: d.id,
        familia: d.familia,
        severidad: d.severidad,
        muestra: marca(matched),
        lineaTexto: linea.trim().slice(0, 120),
        cura: d.cura,
      };
      const p = permitidoPorTexto(linea) || permitidoPorTexto(matched);
      if (p) registro.permiso = p.motivo;
      (p ? permitidos : nuevos).push(registro);
    }
  }
}

// ── informe ────────────────────────────────────────────────────────────────
const estricto = process.argv.includes("--strict");
const comoJson = process.argv.includes("--json");

if (comoJson) {
  console.log(
    JSON.stringify(
      {
        examinados,
        // catálogo VIVO de familias (fuente de verdad) — la sala /escudo lo pinta
        familias: DETECTORES.map((d) => ({ id: d.id, familia: d.familia, severidad: d.severidad, cura: d.cura })),
        nuevos,
        permitidos,
        exito: nuevos.length === 0 && (!estricto || permitidos.length === 0),
      },
      null,
      2
    )
  );
} else {
  const linea = "════════════════════════════════════════════════════════════";
  console.log(linea);
  console.log(" VANGUARD — EL BUSCADOR DE LLAVES · escudo de la ley v204");
  console.log(linea);
  console.log("Familias vigiladas (10 + 2 genéricos de reserva):");
  for (const d of DETECTORES) console.log("  ·", d.familia, `[${d.severidad}]`);
  console.log("");
  console.log(`Archivos examinados: ${examinados}`);
  console.log(`Hallazgos NUEVOS: ${nuevos.length}`);
  console.log(`Permitidos (público-conocido, pendiente de rotar): ${permitidos.length}`);
  console.log("");

  if (permitidos.length) {
    console.log("── PERMITIDOS — deudas declaradas (no hacen caer el veredicto) ──");
    for (const r of permitidos.slice(0, 20)) {
      console.log(`  ⚠ [${r.severidad}] ${r.archivo}:${r.linea} · ${r.muestra}`);
      console.log(`     permiso: ${r.permiso}`);
    }
    if (permitidos.length > 20) console.log(`  … y ${permitidos.length - 20} más`);
    console.log("");
  }
  if (nuevos.length) {
    console.log("── HALLAZGOS NUEVOS — la casa sangra ───────────────────────────");
    for (const r of nuevos.slice(0, 40)) {
      console.log(`  ✗ [${r.severidad}] ${r.familia}`);
      console.log(`     ${r.archivo}:${r.linea} · ${r.muestra}`);
      console.log(`     línea: ${r.lineaTexto}`);
      console.log(`     cura:  ${r.cura}`);
    }
    if (nuevos.length > 40) console.log(`  … y ${nuevos.length - 40} más`);
    console.log("");
    console.log("PROTOCOLO DE CURA:");
    console.log("  1. REVOCAR la llave en su servicio, ya.");
    console.log("  2. Girar: definir la nueva SOLO como variable de entorno (Vercel).");
    console.log("  3. Purgar el histórico si ya viajó al repo (git filter-repo).");
    console.log("  4. Si era falsa alarma, añadirla a PERMITIDOS con motivo escrito.");
  } else {
    console.log("VEREDICTO: LIMPIO — ninguna llave nueva en el árbol de trabajo.");
    if (permitidos.length) {
      console.log("RECUERDA: los permitidos siguen siendo deudas abiertas (P0 de la");
      console.log("auditoría): define AUTH_SECRET / OWNER_PASSWORD en Vercel, borra los");
      console.log("fallbacks de auth-server.ts y vacía la lista PERMITIDOS.");
    }
  }
}

const exito = nuevos.length === 0 && (!estricto || permitidos.length === 0);
process.exit(exito ? 0 : 1);
