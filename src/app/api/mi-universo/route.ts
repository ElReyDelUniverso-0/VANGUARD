// ═══════════════════════════════════════════════════════════════════
// v421.8 · MY UNIVERSE — LA PUERTA DEL SERVIDOR
//
// Este endpoint NO guarda nada, y eso es deliberado: dice la verdad.
//
// LO MEDIDO (2026-11-20): la producción sirve SQLite comprometida en el repo y
// `src/lib/db.ts` la copia a /tmp porque el filesystem del lambda es de solo
// lectura. /tmp es POR INSTANCIA: cada arranque en frío vuelve al archivo del
// repo. Es decir, un guardado en el servidor se perdería sin avisar.
//
// Por eso GET informa de la capacidad real —¿hay sesión? ¿la base es
// durable?— y PUT RECHAZA con el motivo en vez de aceptar y olvidar. Cuando la
// casa tenga una base durable, aquí se escribe el estado del espacio y la
// interfaz lo dirá sin cambiar una línea: solo cambian estas dos respuestas.
// ═══════════════════════════════════════════════════════════════════
import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Estado = { nube: boolean; motivo: string; detalle: string };

/**
 * ¿Puede el servidor guardar de forma DURADERA?
 * Se exige lo dos: una base remota de verdad y que el Dueño lo declare con
 * MI_UNIVERSO_NUBE=1 (encender la nube sin base sería volver a mentir).
 */
function durabilidad(): Estado {
  const url = process.env.DATABASE_URL ?? "";
  const remota = /^(postgres|postgresql|mysql|libsql|https?):/i.test(url);
  const declarada = process.env.MI_UNIVERSO_NUBE === "1";

  if (remota && declarada) {
    return {
      nube: true,
      motivo: "base remota declarada",
      detalle: "Hay una base durable conectada: el espacio se puede guardar en tu cuenta.",
    };
  }
  return {
    nube: false,
    motivo: remota ? "base remota no declarada" : "base local efímera",
    detalle:
      "La casa guarda hoy su base en SQLite dentro del repositorio y, en Vercel, el sistema de archivos del lambda es de solo lectura: el motor copia la base a /tmp, que es POR INSTANCIA y desaparece en cada arranque en frío. " +
      "Un guardado en el servidor se perdería sin avisar. Por eso tu espacio vive en ESTE dispositivo (con una clave por cuenta) y se exporta a un archivo cuando quieras. " +
      "Nada se dice «en la nube» porque no lo está.",
  };
}

export async function GET(req: NextRequest) {
  const usuario = verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  const estado = durabilidad();
  return NextResponse.json({
    ok: true,
    autenticado: !!usuario,
    usuario: usuario ?? null,
    ...estado,
    almacen: "dispositivo",
  });
}

export async function PUT(req: NextRequest) {
  const estado = durabilidad();
  const usuario = verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);

  if (!estado.nube) {
    return NextResponse.json(
      {
        ok: false,
        guardado: false,
        ...estado,
        nota:
          "No se guardó en el servidor a propósito: sin base durable sería un guardado que se pierde al arrancar en frío. " +
          "El espacio se guarda en el dispositivo.",
      },
      { status: 409 },
    );
  }
  if (!usuario) {
    return NextResponse.json({ ok: false, error: "sin sesión de cuenta" }, { status: 401 });
  }
  // Con base durable habilitada, aquí va el guardado por cuenta. Hoy no hay
  // tabla de espacios personales en el esquema, así que se declara en vez de
  // simularlo: preferimos un 501 honesto a un 200 que no guarda.
  return NextResponse.json(
    {
      ok: false,
      error: "almacén de cuenta aún no provisionado",
      detalle:
        "La casa tiene una base durable, pero todavía no existe la tabla de espacios personales. " +
        "Añadir el modelo a prisma/schema.prisma y aplicar el esquema lo enciende; hasta entonces, dispositivo + archivo.",
    },
    { status: 501 },
  );
}
