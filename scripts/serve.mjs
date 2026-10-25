#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// serve.mjs — LANZADOR DE PRODUCCIÓN VANGUARD (v169, recreado tras el merge v168)
// El OOM-killer mataba `next dev` (1.8GB/3.9GB). Este lanzador hace un
// DOBLE FORK real: serve.mjs → hijo intermedio (detached+unref) → next start
// (detached+unref). El proceso next queda huérfano hacia PPID 1: sobrevive
// entre sesiones de shell y consume ~200MB en producción.
// USO:  node scripts/serve.mjs --prod     (next start, puerto 3000)
//       node scripts/serve.mjs --stop     (mata la instancia del .srv.pid)
// El .next debe estar construido (npm run build) antes de --prod.
// ─────────────────────────────────────────────────────────────
import { spawn, fork } from "node:child_process";
import { writeFileSync, readFileSync, existsSync, unlinkSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PIDFILE = resolve(RAIZ, ".srv.pid");
const PUERTO = process.env.PORT || "3000";

function pidVivo() {
  try {
    const pid = parseInt(readFileSync(PIDFILE, "utf8").trim(), 10);
    process.kill(pid, 0);
    return pid;
  } catch {
    return null;
  }
}

if (process.argv.includes("--stop")) {
  const pid = pidVivo();
  if (pid) {
    try {
      process.kill(pid, "SIGTERM");
      console.log(`[serve] instancia ${pid} recibió SIGTERM`);
    } catch {
      console.log("[serve] la instancia ya no vive");
    }
    try { unlinkSync(PIDFILE); } catch {}
  } else {
    console.log("[serve] sin instancia viva (.srv.pid ausente o muerto)");
  }
  process.exit(0);
}

const vivo = pidVivo();
if (vivo) {
  console.log(`[serve] ya hay una instancia viva (pid ${vivo}) en http://localhost:${PUERTO}`);
  process.exit(0);
}

// ── DOBLE FORK: este proceso queda solo como lanzador efímero ──
const esHijo = process.argv.includes("--child");
if (!esHijo) {
  const hijo = fork(fileURLToPath(import.meta.url), ["--child", ...process.argv.slice(2)], {
    detached: true,
    stdio: "ignore",
  });
  hijo.unref();
  console.log(`[serve] hijo intermedio ${hijo.pid} lanzado (detached) — next arranca en el puerto ${PUERTO}`);
  process.exit(0);
}

// ── HIJO INTERMEDIO: spawn del servicio y muerte inmediata (next → PPID 1) ──
const args = process.argv.slice(2);
const nextBin = resolve(RAIZ, "node_modules/next/dist/bin/next");
const servicio = args.includes("--dev")
  ? spawn(process.execPath, [nextBin, "dev", "-p", PUERTO], {
      cwd: RAIZ,
      detached: true,
      stdio: "ignore",
      env: { ...process.env, NODE_ENV: "development" },
    })
  : spawn(process.execPath, [nextBin, "start", "-p", PUERTO], {
      cwd: RAIZ,
      detached: true,
      stdio: "ignore",
      env: { ...process.env, NODE_ENV: "production" },
    });

writeFileSync(PIDFILE, String(servicio.pid));
console.log(`[serve] next ${args.includes("--dev") ? "dev" : "start"} pid ${servicio.pid} (PPID 1) — .srv.pid escrito`);
servicio.unref();
process.exit(0);
