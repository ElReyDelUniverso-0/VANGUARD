// Vanguard v207.0 INFINITO — EL CORAZÓN QUE SE ACTUALIZA SOLO.
// El Dueño mandó: «que Vanguard siempre se actualice sola y que sea
// ilimitado». Este módulo es el pulso de esa orden:
//
//   1. MIRA EL REPOSITORIO: descarga la versión declarada en src/lib/version.ts
//      del repo público (raw.githubusercontent) — la misma fuente de verdad de
//      cada despliegue. Sin API key, sin dependencias.
//   2. SE COMPARA: si la versión del repo es MÁS NUEVA que la que corre este
//      despliegue, significa que hay código nuevo esperando.
//   3. SE DESPLIEGA SOLA: si existe VERCEL_DEPLOY_HOOK_URL en el entorno, lanza
//      el redeploy de Vercel ella misma — UNA sola vez por versión (guard en
//      memoria). Nadie tiene que tocar un botón: push → Vanguard despierta
//      nueva en ~2 minutos.
//   4. AVISA A LA CASA: /api/system devuelve { version local, remote } y la
//      capa AutoActualizacion (cliente) ofrece el botón ACTUALIZAR — la
//      recarga SIEMPRE es opt-in (ley v190: nada se recarga solo; ley v189:
//      no bloquea la experiencia).
//
// Economía: la mirada al repo se hace COMO MÁXIMO 1 vez cada 5 minutos por
// instancia (guard en memoria) — da igual cuántos clientes pregunten.

import { execFile } from "child_process";
import { APP_VERSION } from "@/lib/version";

const REPO_RAW =
  "https://raw.githubusercontent.com/ElReyDelUniverso-0/VANGUARD/main/src/lib/version.ts";
const MIRADA_MIN_MS = 5 * 60 * 1000; // 1 mirada al repo cada 5 min como máximo

let ultimaMirada = 0;
let remotaCache: string | null = null;
let hookDisparadoPara: string | null = null;

/** «v206.0» → [206, 0]; «v206.1.2» → [206, 1, 2] — comparación numérica segura. */
export function compararVersiones(a: string, b: string): number {
  const na = (a.match(/\d+/g) ?? []).map(Number);
  const nb = (b.match(/\d+/g) ?? []).map(Number);
  const len = Math.max(na.length, nb.length);
  for (let i = 0; i < len; i++) {
    const x = na[i] ?? 0;
    const y = nb[i] ?? 0;
    if (x !== y) return x - y;
  }
  return 0;
}

/** Descarga el version.ts del repo y extrae APP_VERSION (curl-first: la huella
 *  TLS de node a veces la bloquean — mismo patrón probado de /api/pulso). */
function leerVersionRemota(): Promise<string | null> {
  return new Promise((resolve) => {
    execFile(
      "curl",
      ["-sg", "--max-time", "9", "-H", "Accept: text/plain", REPO_RAW],
      { timeout: 11_000 },
      (err, stdout) => {
        if (err || !stdout) return resolve(null);
        const m = String(stdout).match(/APP_VERSION\s*=\s*"([^"]+)"/);
        resolve(m ? m[1] : null);
      }
    );
  });
}

export interface EstadoDespliegue {
  local: string;
  remota: string | null;
  hayNueva: boolean;
  hookDisparado: boolean;
  hookConfigurado: boolean;
}

/** Mira el repo (como mucho 1 vez / 5 min) y, si hay versión nueva y hay hook
 *  de despliegue configurado, SE DESPLIEGA SOLA (una vez por versión). */
export async function chequearDespliegue(): Promise<EstadoDespliegue> {
  const ahora = Date.now();
  if (ahora - ultimaMirada > MIRADA_MIN_MS || remotaCache === null) {
    ultimaMirada = ahora;
    remotaCache = await leerVersionRemota();
  }

  const remota = remotaCache;
  const hayNueva = !!remota && compararVersiones(remota, APP_VERSION) > 0;

  let hookDisparado = false;
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL ?? "";
  if (hayNueva && hook && hookDisparadoPara !== remota) {
    hookDisparadoPara = remota; // UNA sola vez por versión, aunque fallen las réplicas
    try {
      await fetch(hook, {
        method: "POST",
        signal: AbortSignal.timeout(10_000),
      });
      hookDisparado = true;
    } catch {
      // sin internet hacia el hook: la próxima mirada lo reintentará (el guard
      // solo se consume cuando el POST no explota — lo reseteamos aquí)
      hookDisparadoPara = null;
    }
  }

  return {
    local: APP_VERSION,
    remota,
    hayNueva,
    hookDisparado,
    hookConfigurado: !!hook,
  };
}
