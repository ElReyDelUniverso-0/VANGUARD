import { NextResponse } from "next/server";
import { APP_VERSION, APP_CODENAME, APP_VERSION_LABEL } from "@/lib/version";
import { chequearDespliegue } from "@/lib/auto-despliegue";
import { muro, claveCliente } from "@/lib/fortaleza";

// v207.0 INFINITO — PULSO DE ACTUALIZACIÓN.
// El cliente (capa AutoActualizacion) pregunta aquí cada pocos minutos:
//   · version  → la que corre este despliegue (la que lleva el bundle)
//   · remota   → la última publicada en el repo (null si no se pudo mirar)
//   · hayNueva → ¿hay código nuevo esperando? El cliente muestra el aviso
//                «ACTUALIZAR AHORA» (opt-in: ley v190, nada se recarga solo).
// Si VERCEL_DEPLOY_HOOK_URL está en el entorno, este mismo GET (y el cron
// diario de agent-ping) LANZAN EL REDEPLOY solos: push → Vanguard se
// reconstruye y se despliega ella misma. Sin API keys, sin dependencias.
//
// Cache dura no-store (ley v125: siempre la verdad fresca).

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  // muro ligero: 30 miradas/min por IP sobra de sobra para el polling honesto
  const veredicto = muro(`system:${claveCliente(req)}`, 30, 60_000);
  if (!veredicto.permitido) {
    return NextResponse.json(
      { ok: false, error: "muro" },
      { status: 429, headers: { "Retry-After": String(veredicto.espera) } }
    );
  }

  let remota: string | null = null;
  let hayNueva = false;
  let hookDisparado = false;
  let hookConfigurado = false;
  try {
    const estado = await chequearDespliegue();
    remota = estado.remota;
    hayNueva = estado.hayNueva;
    hookDisparado = estado.hookDisparado;
    hookConfigurado = estado.hookConfigurado;
  } catch {
    // la mirada al repo nunca puede tumbar este pulso
  }

  return NextResponse.json(
    {
      ok: true,
      version: APP_VERSION,
      codename: APP_CODENAME,
      label: APP_VERSION_LABEL,
      remota,
      hayNueva,
      hookDisparado,
      hookConfigurado,
      ts: Date.now(),
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}
