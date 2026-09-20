#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// VANGUARD · AGENTE DE MEJORA CONTINUA  v1.0
// ═══════════════════════════════════════════════════════════════════
// Misión: cada vez que el equipo termina una tarea, este agente
// analiza el estado de la página y envía un MENSAJE al agente
// principal con ideas concretas para mejorar la web (cualquier ámbito).
//
// Uso (tras completar cualquier Task ID):
//   node scripts/improvement-agent.mjs --task <id> --notes "qué se hizo"
//   bun run improve --task 21 --notes "v21 publicada"
//   bun run improve --task 21 --focus "rendimiento del mapa"
//
// Salida:
//   · stdout  → el mensaje (el agente principal lo lee y actúa)
//   · stderr  → logs del agente
//   · agent-ctx/improvement-inbox.md → historial acumulado de mensajes
//
// Protocolo oficial documentado en agent-ctx/README.md
// ═══════════════════════════════════════════════════════════════════

import fs from "node:fs";
import path from "node:path";
import ZAI from "z-ai-web-dev-sdk";

const ROOT = "/home/z/my-project";
const INBOX_DIR = path.join(ROOT, "agent-ctx");
const INBOX = path.join(INBOX_DIR, "improvement-inbox.md");
const WORKLOG = path.join(ROOT, "worklog.md");
const PAGE = path.join(ROOT, "src", "app", "page.tsx");
const PANELS_DIR = path.join(ROOT, "src", "components", "vanguard", "panels");

function arg(name, def = "") {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--")) {
    return process.argv[i + 1];
  }
  return def;
}

async function check(url) {
  const t0 = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    return `${res.status} (${Date.now() - t0}ms)`;
  } catch (e) {
    return `ERROR:${e.name}`;
  }
}

function readWorklogTail(max = 2600) {
  try {
    const raw = fs.readFileSync(WORKLOG, "utf8");
    return raw.slice(-max);
  } catch {
    return "(worklog no disponible)";
  }
}

function readVersion() {
  try {
    const m = fs.readFileSync(PAGE, "utf8").match(/v(\d+)\.0 · ([A-ZÁÉÍÓÚÑa-zü·\s]+)/);
    return m ? `v${m[1]}.0 · ${m[2].trim()}` : "desconocida";
  } catch {
    return "desconocida";
  }
}

function countModules() {
  try {
    return fs.readdirSync(PANELS_DIR).filter((f) => f.endsWith(".tsx")).length;
  } catch {
    return 0;
  }
}

function countInboxMessages() {
  try {
    return (fs.readFileSync(INBOX, "utf8").match(/^## /gm) || []).length;
  } catch {
    return 0;
  }
}

const SYSTEM_PROMPT = `Eres el AGENTE DE MEJORA CONTINUA de VANGUARD (vanguard.world), la plataforma de conflictos globales #1 en español. Stack: Next.js 16 + TypeScript + Tailwind 4 + Zustand + Prisma/SQLite + globe.gl + Socket.io (multijugador :3003 vía gateway Caddy :81 con ?XTransformPort=3003).

TU MISIÓN: cada vez que el equipo termina una tarea, TÚ envías un mensaje al agente principal con ideas para mejorar la página web. Cualquier cosa vale: nuevas funciones, gamificación, viralidad social, UX/móvil, contenido, SEO, rendimiento, comunidad, eventos en vivo, visualización de datos, monitoreo.

REGLAS DEL MENSAJE (estrictas):
1. Primera línea exacta: "📡 MENSAJE DEL AGENTE DE MEJORA · VANGUARD"
2. 3 a 5 ideas numeradas, ordenadas por prioridad (mayor impacto + menor esfuerzo primero).
3. Cada idea en una línea con este formato: "N. [TÍTULO CORTO] — qué hacer exactamente (componente/archivo concreto si aplica) · POR QUÉ funciona (beneficio real de usuario) · Esfuerzo: S|M|L".
4. PROHIBIDO proponer cosas que YA EXISTEN o NO APLICAN: banderas verdaderas en todo el sitio (v20), atlas de divisas de 247 países con tasas en vivo, countryballs con bandera real, perfil con avatar de cualquier país, stickers en comentarios, multijugador Socket.io con insignia EN VIVO y reconexión, juegos arcade propios, studio de videos, foro, apuestas de guerra, frentes de guerra con banderas, noticias con chip de país, SEO/PWA/sitemap/manifest, sistema de monedas/gemas/rachas, 60+ paneles, cuentas con guardado en la nube y pack de bienvenida.
5. NO APLICA: modos oscuros/nocturnos ni temas claros — VANGUARD ya es 100% tema oscuro permanente por diseño (#0A0A0F). Tampoco propongas misiones diarias (ya existe daily-challenges-panel).
6. Cierra con una línea: "⭐ IDEA ESTRELLA: ..." — la única que implementarías HOY si solo pudieras hacer una, y por qué.
7. Español directo, estilo militar-tech de VANGUARD. Máximo ~230 palabras. Cero relleno.`;

async function askLLM(userContent) {
  let lastErr;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const zai = await ZAI.create();
      const completion = await zai.chat.completions.create({
        messages: [
          { role: "assistant", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        thinking: { type: "disabled" },
      });
      const msg = completion.choices?.[0]?.message?.content?.trim();
      if (!msg || msg.length < 40) throw new Error("respuesta vacía");
      return msg;
    } catch (e) {
      lastErr = e;
      if (attempt < 2) await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw lastErr;
}

async function main() {
  const task = arg("task", "sin-id");
  const notes = arg("notes", "(sin notas)");
  const focus = arg("focus", "");

  console.error(`[agente-mejora] analizando estado tras Task ${task}…`);

  // 1) Salud de servicios
  const [home, gw, sitemap, news] = await Promise.all([
    check("http://localhost:3000/"),
    check("http://localhost:81/"),
    check("http://localhost:3000/sitemap.xml"),
    check("http://localhost:3000/api/news"),
  ]);

  // 2) Contexto del proyecto
  const version = readVersion();
  const modules = countModules();
  const worklogTail = readWorklogTail();
  const msgNumber = countInboxMessages() + 1;

  // 3) Mensaje del LLM
  const userContent = [
    `TAREA RECIÉN COMPLETADA: Task ${task}`,
    `Notas del equipo: ${notes}`,
    focus ? `Área que el equipo quiere mejorar: ${focus}` : "",
    ``,
    `Estado actual de VANGUARD: versión ${version} · ${modules} paneles/módulos`,
    `Salud de servicios: home=${home} | gateway=${gw} | sitemap=${sitemap} | api/news=${news}`,
    ``,
    `Trabajo reciente (final del worklog compartido):`,
    worklogTail,
  ]
    .filter(Boolean)
    .join("\n");

  const message = await askLLM(userContent);

  // 4) Entrega: mensaje por stdout (lo lee el agente principal), logs por stderr
  console.log(message);

  // 5) Historial en la bandeja
  fs.mkdirSync(INBOX_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace("T", " ").slice(0, 19);
  const entry = [
    "",
    `## MENSAJE #${msgNumber} · ${stamp} · tras Task ${task}`,
    `Notas: ${notes}`,
    `Salud: home=${home} | gateway=${gw} | sitemap=${sitemap} | api/news=${news}`,
    "",
    message,
    "",
    "---",
    "",
  ].join("\n");
  fs.appendFileSync(INBOX, entry, "utf8");
  console.error(`[agente-mejora] mensaje #${msgNumber} guardado en agent-ctx/improvement-inbox.md`);
}

main().catch((e) => {
  console.error(`[agente-mejora] FALLO: ${e.message}`);
  process.exit(1);
});
