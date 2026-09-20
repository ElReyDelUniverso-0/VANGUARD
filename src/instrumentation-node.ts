// v27 ESTABILIDAD — solo se importa desde runtime Node (ver instrumentation.ts):
// 1) captura promesas rechazadas / excepciones no manejadas y las LOGUEA
//    (antes un rejection soltaba el proceso en dev y "la página se caía")
// 2) purga periódica de mapas en memoria (presence de streams, salas de juego)
// 3) pragmas SQLite al boot (ver lib/db.ts)
export function registerNode() {
  const root = process.cwd();
  const log = (kind: string, err: unknown) => {
    const msg = err instanceof Error ? `${err.message}\n${err.stack ?? ""}` : String(err);
    console.error(`[VANGUARD-${kind}] ${new Date().toISOString()} ${msg.slice(0, 800)}`);
  };

  process.on("unhandledRejection", (reason) => log("REJECTION", reason));
  process.on("uncaughtException", (err) => log("UNCAUGHT", err));
  // evita crash por EPIPE en el pipe de tee del dev.log
  process.stdout?.on?.("error", (e: NodeJS.ErrnoException) => {
    if (e.code === "EPIPE") process.exit(0);
  });

  // limpieza de mapas en memoria cada 10 min (presence y similares)
  const g = globalThis as unknown as { __vanguardPresence?: Map<string, { last: number }> };
  const timer = setInterval(() => {
    try {
      const m = g.__vanguardPresence;
      if (m) {
        const cut = Date.now() - 10 * 60_000;
        for (const [k, v] of m) if (v.last < cut) m.delete(k);
      }
      if (typeof globalThis.gc === "function") globalThis.gc();
    } catch {
      /* noop */
    }
  }, 10 * 60_000);
  timer.unref?.();

  console.log(`[VANGUARD-BOOT] ${new Date().toISOString()} cwd=${root}`);
}
