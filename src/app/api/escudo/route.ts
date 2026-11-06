import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { promisify } from "node:util";
import { muro, claveCliente } from "@/lib/fortaleza";

// ═══════════════════════════════════════════════════════════════════════════
// EL ESCUDO EN LA WEB — /api/escudo (complemento de la ley v204 EL ESCUDO).
// Esta ruta sirve el INFORME del Buscador de Llaves (scripts/busca-apikeys.mjs)
// a la sala /escudo: el mismo escudo que corre el taller, mirando desde la web.
//
//   · El informe viaja ENMASCARADO (ley del Buscador: jamás filtra lo que caza).
//   · La mirada solo se sirve DESDE DENTRO: en desarrollo siempre; en producción
//     queda a puerta cerrada (403) salvo que la casa defina ESCUDO_WEB=1 — el
//     despliegue serverless no viaja con el árbol de trabajo completo, así que
//     ahí el escudo de verdad corre en el taller y en CI.
//   · Además del informe, entrega el catálogo VIVO de familias que el propio
//     script declara en su --json (una sola fuente de verdad: el script).
//   · La mirada vive tras el MURO de la fortaleza (6 por IP y minuto): el
//     proceso que recorre el árbol es caro y la puerta abierta no es un DoS.
// ═══════════════════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

const ejecutar = promisify(execFile);

type FamiliaEscudo = {
  id: string;
  familia: string;
  severidad: string;
  cura: string;
};

type HallazgoEscudo = {
  archivo: string;
  linea: number;
  detector: string;
  familia: string;
  severidad: string;
  muestra: string;
  lineaTexto: string;
  cura: string;
  permiso?: string;
};

type InformeEscudo = {
  examinados: number;
  familias: FamiliaEscudo[];
  nuevos: HallazgoEscudo[];
  permitidos: HallazgoEscudo[];
  exito: boolean;
};

export async function GET(req: Request) {
  const enDesarrollo = process.env.NODE_ENV !== "production";
  if (!enDesarrollo && process.env.ESCUDO_WEB !== "1") {
    return NextResponse.json(
      {
        ok: false,
        motivo:
          "El escudo solo mira desde dentro: disponible en desarrollo o con ESCUDO_WEB=1 definido en el entorno.",
      },
      { status: 403 }
    );
  }

  // EL MURO DE LA MIRADA (ley v204): la mirada ejecuta un proceso que recorre
  // el árbol completo (caro) — 6 miradas por IP y minuto bastan. Los mismos
  // muros de la casa (denuncias, memes, ambassadors, live): cero librería nueva.
  const veredictoMuro = muro(`escudo-mirada:${claveCliente(req)}`, 6, 60_000);
  if (!veredictoMuro.permitido) {
    return NextResponse.json(
      { ok: false, motivo: "Demasiadas miradas seguidas — espera un momento" },
      { status: 429 }
    );
  }

  const script = join(process.cwd(), "scripts", "busca-apikeys.mjs");
  if (!existsSync(script)) {
    return NextResponse.json(
      {
        ok: false,
        motivo:
          "El Buscador de Llaves (scripts/busca-apikeys.mjs) no viaja con este despliegue: corre el escudo desde el taller (npm run escudo).",
      },
      { status: 501 }
    );
  }

  try {
    const { stdout } = await ejecutar("node", [script, "--json"], {
      cwd: process.cwd(),
      timeout: 120_000,
      maxBuffer: 16 * 1024 * 1024,
    });
    const informe = JSON.parse(stdout) as InformeEscudo;
    return NextResponse.json({
      ok: true,
      entorno: enDesarrollo ? "desarrollo" : "produccion-escudo-web",
      informe,
    });
  } catch (err) {
    // El escudo sale con exit 1 cuando hay hallazgos NUEVOS — es su voz alta,
    // no un fallo. Si el informe viajó en stdout, se sirve igual: el veredicto
    // ROJO es información, no un error de la mirada.
    const stdout =
      err && typeof err === "object" && "stdout" in err
        ? String((err as { stdout?: string }).stdout ?? "")
        : "";
    if (stdout.trim()) {
      try {
        const informe = JSON.parse(stdout) as InformeEscudo;
        return NextResponse.json({
          ok: true,
          entorno: enDesarrollo ? "desarrollo" : "produccion-escudo-web",
          informe,
        });
      } catch {
        /* stdout no era JSON: cae al 500 de abajo */
      }
    }
    return NextResponse.json(
      {
        ok: false,
        motivo:
          "La mirada del escudo falló: " +
          (err instanceof Error ? err.message : String(err)),
      },
      { status: 500 }
    );
  }
}
