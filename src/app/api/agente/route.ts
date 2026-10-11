import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { moderateUgc } from "@/lib/ai-moderate";
import { muro, claveCliente, sanitizar, sanitizarLinea } from "@/lib/fortaleza";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth-server";
import { validarJuego } from "@/lib/juegos";
import { simular } from "@/lib/whatif";
import {
  MISIONES, misionesDelDia, ejecutarMision, semillaDe,
  type MisionAgente, type CreacionJuego, type CreacionEscenario, type CreacionInforme,
} from "@/lib/agente-nucleo";

// v103.0 MODO AGENTE — LA IA QUE CREA DENTRO DE VANGUARD.
// GET  → estado del agente: stats de creaciones oficiales + misiones del día
// POST { mision, variante?, publicar?, firmar? } → ejecuta la misión
//       DETERMINISTA en el servidor, la AUDITA (validarJuego + moderador IA)
//       y PUBLICA el resultado:
//         · firmar=true + pasaporte  → el juego/escenario sale firmado por el
//           operador (el agente trabaja PARA él) + recompensa
//         · sin firma                → sale firmado por MENTE·VANGUARD, la
//           cuenta oficial del agente (el servidor impone la firma: nadie
//           suplanta a nadie — la lección de la Ciudadela v102)
// MURO: 12 misiones por IP y hora. Dedupe por semilla: la misma misión del
// día no se duplica en la base (el mundo recibe la misma creación).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const AUTOR_AGENTE = "MENTE·VANGUARD";
const MISIONES_VALIDAS = MISIONES.map((m) => m.id) as string[];

export async function GET() {
  try {
    const [agentes, juegos, escenarios] = await Promise.all([
      db.ugcItem.count({ where: { author: AUTOR_AGENTE, status: "APROBADO" } }),
      db.ugcItem.count({ where: { kind: "juego", status: "APROBADO" } }),
      db.ugcItem.count({ where: { kind: "escenario", status: "APROBADO" } }),
    ]);
    const ultimas = await db.ugcItem.findMany({
      where: { author: AUTOR_AGENTE, status: "APROBADO" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { id: true, kind: true, title: true, createdAt: true },
    });
    return NextResponse.json({
      autor: AUTOR_AGENTE,
      stats: { creacionesAgente: agentes, juegosEnArcade: juegos, escenariosEnGaleria: escenarios },
      ultimas,
      misionesDelDia: misionesDelDia(),
      catalogo: MISIONES.map((m) => ({ id: m.id, nombre: m.nombre, producto: m.producto, color: m.color, recompensa: m.recompensa })),
    });
  } catch {
    return NextResponse.json(
      { autor: AUTOR_AGENTE, stats: { creacionesAgente: 0, juegosEnArcade: 0, escenariosEnGaleria: 0 }, ultimas: [], misionesDelDia: misionesDelDia(), catalogo: [] },
      { status: 200 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // v103 MURO — 12 misiones por IP y hora (el agente no es gratis para abusar)
    const veredictoMuro = muro(`agente:${claveCliente(req)}`, 12, 3600_000);
    if (!veredictoMuro.permitido) {
      return NextResponse.json(
        { error: `Muro de la Ciudadela: demasiadas misiones desde tu conexión — vuelve en ${Math.ceil(veredictoMuro.espera / 60)} min.` },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const mision = sanitizarLinea(body.mision, 16) as MisionAgente;
    if (!MISIONES_VALIDAS.includes(mision)) {
      return NextResponse.json({ error: "Misión desconocida — elige una del catálogo" }, { status: 400 });
    }
    const variante = Math.max(0, Math.min(9, Number(body.variante) || 0));
    const publicar = body.publicar === true;
    const firmar = body.firmar === true;

    // sesión (pasaporte de la Ciudadela)
    let sesion: string | null = null;
    try {
      sesion = verifySessionToken((req as any).cookies?.get?.(SESSION_COOKIE)?.value ?? null);
    } catch {
      sesion = null;
    }
    const autorFinal = firmar && sesion ? sesion : AUTOR_AGENTE;

    // ===== MISIÓN DETERMINISTA =====
    const semilla = semillaDe(mision, variante);
    const resultado = ejecutarMision(mision, semilla);
    if (!resultado.auditada) {
      return NextResponse.json({ error: `La auditoría local falló: ${resultado.notaAuditoria}` }, { status: 422 });
    }
    const c = resultado.creacion;

    // ===== PREPARACIÓN POR TIPO =====
    let titulo = "";
    let resumen = "";
    let specs = "";
    let kind = "";

    if (c.tipo === "juego") {
      const cj = c as CreacionJuego;
      const check = validarJuego(cj.def);
      if (!check.ok) return NextResponse.json({ error: check.error }, { status: 422 });
      kind = "juego";
      titulo = cj.titulo;
      resumen = `${cj.resumen} — ${cj.fuente}`.slice(0, 300);
      specs = check.json;
    } else if (c.tipo === "escenario") {
      const ce = c as CreacionEscenario;
      // corre la simulación REAL del Laboratorio con esta semilla
      const r = simular(ce.cfg);
      const spec = {
        crisisId: ce.cfg.crisisId,
        crisis: ce.titulo,
        perturbacion: ce.cfg.perturbacion,
        dosis: ce.cfg.dosis,
        horizonte: ce.cfg.horizonte,
        final: r.fin.nombre,
        diaFin: r.fin.dia,
        ganador: r.fin.ganador,
        mc: r.monteCarlo.map((m) => ({ nombre: m.nombre, probabilidad: m.probabilidad })),
        frente: r.serie.length > 0 ? Math.round(r.serie[r.serie.length - 1].frente) : 0,
      };
      kind = "escenario";
      titulo = ce.titulo.slice(0, 120);
      resumen = `${ce.resumen} Resultado de la simulación: ${r.fin.nombre} en el día ${r.fin.dia} (SIMULACIÓN · no es predicción). ${ce.fuente}`.slice(0, 300);
      specs = JSON.stringify(spec);
    } else {
      // informe: NO va al UGC — viaja en la respuesta y el operador lo lee en la consola
      const ci = c as CreacionInforme;
      return NextResponse.json({
        mision, semilla, autor: autorFinal, publicado: false,
        creacion: ci, protocolo: resultado.protocolo, notaAuditoria: resultado.notaAuditoria,
      });
    }

    // ===== DEDUPE POR SEMILLA (el día no se duplica) — solo al publicar =====
    if (publicar) {
      const existente = await db.ugcItem.findFirst({
        where: { author: autorFinal, title: titulo, status: "APROBADO", createdAt: { gte: new Date(Date.now() - 26 * 3600_000) } },
        select: { id: true, kind: true, title: true, createdAt: true },
      });
      if (existente) {
        return NextResponse.json({
          mision, semilla, autor: autorFinal, publicado: true, yaPublicado: true, item: existente,
          creacion: c, protocolo: resultado.protocolo, notaAuditoria: resultado.notaAuditoria,
        });
      }
    }

    if (!publicar) {
      // solo lectura: devolver la creación sin tocar la base
      return NextResponse.json({
        mision, semilla, autor: autorFinal, publicado: false,
        creacion: c, protocolo: resultado.protocolo, notaAuditoria: resultado.notaAuditoria,
      });
    }

    // ===== PUBLICACIÓN (moderador IA + firma impuesta por el servidor) =====
    const mod = await moderateUgc({ kind, title: titulo, summary: resumen, body: "" });
    const status = mod.verdict === "LIMPIO" ? "APROBADO" : mod.verdict === "SOSPECHOSO" ? "PENDIENTE" : "ELIMINADO";
    if (status === "ELIMINADO") {
      return NextResponse.json({ error: `El moderador IA detuvo la publicación: ${mod.reason}` }, { status: 202 });
    }
    const item = await db.ugcItem.create({
      data: {
        kind,
        author: autorFinal, // firma impuesta: sesión firmada o cuenta oficial del agente
        authorBall: autorFinal === AUTOR_AGENTE ? "eu" : String(body.authorBall || "us").slice(0, 2).toLowerCase(),
        title: titulo,
        summary: resumen,
        body: "",
        photos: "[]",
        country: "",
        specs,
        assembly: "[]",
        gameUrl: "",
        gameHtml: "",
        gamePlatform: "pc",
        audioData: "",
        audioGenre: "",
        pollOptions: "[]",
        videoUrl: "",
        sensitive: false,
        status,
        aiVerdict: mod.verdict,
        aiReason: mod.reason,
        aiModerated: mod.ai,
      },
    });
    const reward = kind === "juego" ? 50 : kind === "escenario" ? 35 : 0;
    return NextResponse.json({
      mision, semilla, autor: autorFinal, publicado: true, item: { id: item.id, kind, title: item.title },
      verdict: mod.verdict, reason: mod.reason, ai: mod.ai, reward,
      creacion: c, protocolo: resultado.protocolo, notaAuditoria: resultado.notaAuditoria,
    }, { status: 201 });
  } catch (e) {
    console.error("agente POST error", e);
    return NextResponse.json({ error: "El agente no pudo completar la misión" }, { status: 500 });
  }
}
