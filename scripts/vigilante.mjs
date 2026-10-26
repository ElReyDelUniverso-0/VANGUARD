#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// vigilante.mjs — GUARDIÁN ANTI-OOM DE VANGUARD (v178.1)
// La fuga real: next-server crece 200MB → 2.58GB en ~45 min y el
// OOM-killer del kernel lo mata = el Dueño ve «horas cargando».
// Este guardián vive desdoblado hacia PPID 1, despierta cada 30s,
// lee el VmRSS real del proceso del .srv.pid y:
//   · server MUERTO  → lo despierta (serve.mjs --stop + --prod)
//   · RSS > 900MB    → relevo ordenado ANTES de que el kernel dispare
// Anti-doble-instancia por .vigilante.pid. Log con recorte a 500 líneas.
// USO:  node scripts/vigilante.mjs            (padre: desdobla y sale)
//       node scripts/vigilante.mjs --hijo     (bucle eterno, PPID 1)
// ─────────────────────────────────────────────────────────────
import { fork } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, unlinkSync, appendFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, execSync } from "node:child_process";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PIDFILE = resolve(RAIZ, ".srv.pid");
const MIPIDFILE = resolve(RAIZ, ".vigilante.pid");
const LOG = resolve(RAIZ, "vigilante.log");
const UMBRAL_MB = 900;
const CADA_MS = 30_000;

function log(msg) {
  try {
    appendFileSync(LOG, `${new Date().toISOString()} ${msg}\n`);
    // recorte a 500 líneas
    const lineas = readFileSync(LOG, "utf8").split("\n");
    if (lineas.length > 500) writeFileSync(LOG, lineas.slice(-500).join("\n"));
  } catch {}
}

function rssMb(pid) {
  try {
    const st = readFileSync(`/proc/${pid}/status`, "utf8");
    const m = st.match(/VmRSS:\s+(\d+) kB/);
    return m ? Math.round(parseInt(m[1], 10) / 1024) : null;
  } catch {
    return null;
  }
}

function pidServer() {
  try {
    const pid = parseInt(readFileSync(PIDFILE, "utf8").trim(), 10);
    process.kill(pid, 0);
    return pid;
  } catch {
    return null;
  }
}

function despertar(motivo) {
  log(`ACCIÓN: ${motivo} — relevo del server`);
  try {
    execSync(`node ${resolve(RAIZ, "scripts/serve.mjs")} --stop`, { cwd: RAIZ, timeout: 15_000 });
  } catch {}
  try {
    execSync(`node ${resolve(RAIZ, "scripts/serve.mjs")} --prod`, { cwd: RAIZ, timeout: 120_000 });
  } catch {}
  log("ACCIÓN: relevo completado");
}

// ── anti-doble-instancia ─────────────────────────────────────
function yaHayVigilante() {
  try {
    const pid = parseInt(readFileSync(MIPIDFILE, "utf8").trim(), 10);
    if (pid === process.pid) return false; // somos nosotros (relanzado)
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

// ── desdoble hacia PPID 1 (sobrevive al cierre del shell) ────
if (!process.argv.includes("--hijo")) {
  if (yaHayVigilante()) {
    console.log("[vigilante] ya hay uno vivo — no duplico");
    process.exit(0);
  }
  const hijo = fork(fileURLToPath(import.meta.url), ["--hijo"], {
    detached: true,
    stdio: "ignore",
  });
  hijo.unref();
  writeFileSync(MIPIDFILE, String(hijo.pid));
  console.log(`[vigilante] desdoblado a PPID 1 (pid ${hijo.pid})`);
  process.exit(0);
}

// ── bucle eterno del hijo ────────────────────────────────────
writeFileSync(MIPIDFILE, String(process.pid));
process.on("exit", () => {
  try {
    if (parseInt(readFileSync(MIPIDFILE, "utf8").trim(), 10) === process.pid) unlinkSync(MIPIDFILE);
  } catch {}
});

log(`vigilante nace (pid ${process.pid}, umbral ${UMBRAL_MB}MB, cada ${CADA_MS / 1000}s)`);

setInterval(() => {
  const pid = pidServer();
  if (!pid) {
    despertar("server MUERTO");
    return;
  }
  const mb = rssMb(pid);
  if (mb === null) {
    log(`pid ${pid} ilegible — trato como muerto`);
    despertar("server ilegible");
    return;
  }
  if (mb > UMBRAL_MB) {
    log(`fuga: pid ${pid} en ${mb}MB > ${UMBRAL_MB}MB`);
    despertar(`RSS ${mb}MB`);
    return;
  }
  log(`ok pid ${pid} ${mb}MB`);
}, CADA_MS);
