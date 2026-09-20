#!/usr/bin/env node
// v27 ESTABILIDAD — SUPERVISOR DEL SERVIDOR VANGUARD
//
// Diagnóstico del bug "la página se cae después de un rato":
//   dmesg → "Out of memory: Killed process (next-server), anon-rss: 1.9GB"
//   El dev-server crece en memoria (compilación HMR de ~80 paneles) hasta que
//   el kernel lo mata (la máquina tiene 4GB).
//
// Solución en dos capas:
//   1) Este supervisor reinicia el server automáticamente si muere (2-3s de corte).
//   2) NODE_OPTIONS limita el heap a 1400MB para que V8 recoja basura ANTES de
//      que el kernel mate el proceso.
//   3) El cliente (connection-watchdog.tsx) muestra "RECONECTANDO" y recarga
//      solo cuando el server vuelve — el usuario nunca ve un dead-screen.

import { spawn } from "node:child_process";

const args = process.argv.slice(2);
const mode = args[0] === "--prod" ? "prod" : "dev";

const CHILD_CMD = mode === "prod" ? "bun" : "bun";
const CHILD_ARGS = mode === "prod"
  ? [".next/standalone/server.js"]
  : ["run", "dev"];

let restarting = 0;

function start() {
  const env = {
    ...process.env,
    NODE_ENV: mode === "prod" ? "production" : "development",
    NODE_OPTIONS: "--max-old-space-size=1400",
  };
  const child = spawn(CHILD_CMD, CHILD_ARGS, {
    cwd: process.cwd(),
    env,
    stdio: ["ignore", "inherit", "inherit"],
  });

  const ts = () => new Date().toISOString();
  console.log(`[WATCHDOG ${ts()}] next-server arrancado (pid ${child.pid}, modo ${mode}, heap cap 1400MB)`);

  child.on("exit", (code, signal) => {
    if (restarting) return;
    restarting = 1;
    console.error(`[WATCHDOG ${ts()}] server murió (code=${code} signal=${signal}) — reiniciando en 3s…`);
    setTimeout(() => {
      restarting = 0;
      start();
    }, 3000);
  });

  child.on("error", (err) => {
    console.error(`[WATCHDOG] spawn error: ${err.message}`);
  });
}

// el propio supervisor nunca muere por rechazos
process.on("unhandledRejection", (r) => console.error("[WATCHDOG-REJECTION]", r));

start();
