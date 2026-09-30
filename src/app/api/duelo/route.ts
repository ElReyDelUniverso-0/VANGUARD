import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// v73.0 REGLA DE ORO — DUELO PVP DE PREDICCIONES.
// Dos guerreros, una pregunta táctica con 4 opciones: el que acierte más rápido
// se lleva el bote. Doctrina (mismo patrón probado de /api/reclutar):
//  · El rival se elige AL AZAR entre los guerreros EN LÍNEA AHORA (site_presence < 90s).
//  · Todo vive en site_duelos (tabla on-demand idempotente); caduca en 10 min.
//  · La clave correcta NUNCA sale del servidor hasta que el duelo termina.
//  · La economía (apuesta/bote) se liquida en el cliente como el resto del juego.

export const dynamic = "force-dynamic";

const VENTANA_MS = 90_000; // ventana de presencia
const VIDA_MS = 10 * 60_000; // el duelo caduca en 10 min

async function ensureTables() {
  await db.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS site_duelos (
      id BIGSERIAL PRIMARY KEY,
      from_uid TEXT NOT NULL,
      from_alias TEXT NOT NULL DEFAULT '',
      to_uid TEXT NOT NULL,
      to_alias TEXT NOT NULL DEFAULT '',
      pregunta TEXT NOT NULL,
      opciones TEXT NOT NULL,
      correcta INT NOT NULL,
      from_resp INT,
      from_ms INT,
      to_resp INT,
      to_ms INT,
      estado TEXT NOT NULL DEFAULT 'activa',
      ganador TEXT,
      apuesta INT NOT NULL DEFAULT 100,
      ts BIGINT NOT NULL
    )`);
}

function str(v: unknown, max: number): string {
  return String(v ?? "").replace(/[<>]/g, "").trim().slice(0, max);
}

// ---- banco de preguntas tácticas (SOLO servidor; la clave no viaja) ----
const BANCO: { p: string; o: string[]; c: number }[] = [
  { p: "¿Qué país tiene MÁS fronteras terrestres del mundo?", o: ["Rusia", "China", "Brasil", "Alemania"], c: 1 },
  { p: "¿Cuál es el estrecho marítimo MÁS transitado (petróleo) del mundo?", o: ["Bósforo", "Ormuz", "Magallanes", "Gibraltar"], c: 1 },
  { p: "¿Qué organización emite las alertas sísmicas globales que usa Vanguard?", o: ["NASA", "USGS", "OMS", "FAO"], c: 1 },
  { p: "¿Cuántos miembros permanentes con veto tiene el Consejo de Seguridad de la ONU?", o: ["3", "5", "7", "10"], c: 1 },
  { p: "¿Qué país es el MAYOR exportador de petróleo crudo por volumen?", o: ["Arabia Saudita", "Rusia", "EE.UU.", "Irak"], c: 2 },
  { p: "¿Qué mar es considerado el punto más bajo de la superficie terrestre?", o: ["Mar Muerto", "Mar Rojo", "Mar Caspio", "Mar de Aral"], c: 0 },
  { p: "¿Qué tratado prohíbe las armas nucleares en América Latina y el Caribe?", o: ["Tratado de Tlatelolco", "Tratado de Rarotonga", "NPT", "START"], c: 0 },
  { p: "¿Cuál es la capital más alta del mundo entre estas?", o: ["Quito", "La Paz", "Bogotá", "Katmandú"], c: 1 },
  { p: "¿Qué canal interoceánico fue ampliado en 2016 para buques Neopanamax?", o: ["Suez", "Panamá", "Kiel", "Corinto"], c: 1 },
  { p: "¿Qué porcentaje de la superficie del planeta cubren los OCÉANOS?", o: ["51%", "61%", "71%", "81%"], c: 2 },
  { p: "¿Qué país tiene el MAYOR número de países vecinos (fronteras)?", o: ["China", "Rusia", "Brasil", "Francia"], c: 1 },
  { p: "¿Dónde está la mayor base militar estadounidense en el extranjero?", o: ["Okinawa (Japón)", "Ramstein (Alemania)", "Diego García", "Camp Humphreys (Corea)"], c: 3 },
  { p: "¿Qué moneda usan la mayor parte de los países del oeste de África (CFA)?", o: ["Franco CFA", "Naira", "Cedi", "Libra egipcia"], c: 0 },
  { p: "¿Qué estrecho separa Europa de África en su punto más estrecho?", o: ["Gibraltar", "Bósforo", "Dardanelos", "Messina"], c: 0 },
  { p: "¿Cuál es el país MÁS pequeño de la ONU por superficie?", o: ["Mónaco", "Nauru", "San Marino", "Liechtenstein"], c: 1 },
  { p: "¿Qué alianza militar se fundó en 1949 con 12 miembros?", o: ["OTAN", "Pacto de Varsovia", "SEATO", "ANZUS"], c: 0 },
  { p: "¿Qué línea imaginaria separa Corea del Norte y Corea del Sur?", o: ["Paralelo 38", "Paralelo 17", "Meridiano 105", "Línea McMahon"], c: 0 },
  { p: "¿Qué país es el mayor PRODUCTOR de café del mundo?", o: ["Colombia", "Vietnam", "Brasil", "Etiopía"], c: 2 },
  { p: "¿Cuál de estos países NO tiene ejército permanente?", o: ["Costa Rica", "Panamá", "Islandia", "Todas las anteriores"], c: 3 },
  { p: "¿Qué agua subterránea comparten Egipto, Libia, Chad y Sudán?", o: ["Acuífero de Nubia", "Acuífero Guaraní", "Ogallala", "Cáspio"], c: 0 },
  { p: "¿Qué país NO reconoce la Corte Penal Internacional (CPI)?", o: ["España", "EE.UU.", "Brasil", "Sudáfrica"], c: 1 },
  { p: "¿Qué potencia opera la red de satélites GLONASS?", o: ["EE.UU.", "China", "Rusia", "UE"], c: 2 },
  { p: "¿Cuántos países integran la Unión Europea desde 2020?", o: ["25", "27", "28", "30"], c: 1 },
  { p: "¿Qué país sudamericano tiene la mayor reserva de litio del planeta?", o: ["Chile", "Argentina", "Bolivia", "Perú"], c: 2 },
  { p: "¿Cuál es la frontera terrestre MÁS LARGA del mundo?", o: ["Rusia–China", "EE.UU.–Canadá", "Argentina–Chile", "India–Bangladés"], c: 1 },
  { p: "¿Qué mar conecta el Mar Negro con el Mediterráneo?", o: ["Mar de Mármara (Bósforo)", "Mar Adriático", "Mar Egeo directo", "Mar Jónico"], c: 0 },
  { p: "¿Qué estrecho separa Asia de Europa en Estambul?", o: ["Bósforo", "Dardanelos", "Gibraltar", "Suez"], c: 0 },
  { p: "¿Qué país tiene más husos horarios (con territorios)?", o: ["Rusia", "EE.UU.", "Francia", "China"], c: 2 },
  { p: "¿Qué organización emite los boletines del ISS que usa Vanguard?", o: ["wheretheiss.at / NASA", "ESA Copernicus", "NOAA", "Roscosmos TV"], c: 0 },
  { p: "¿Cuál es el desierto MÁS GRANDE del mundo?", o: ["Sahara", "Antártico", "Gobi", "Atacama"], c: 1 },
];

// GET /api/duelo?uid= → mis duelos activos + terminados recientes
export async function GET(req: Request) {
  try {
    await ensureTables();
    const uid = (new URL(req.url).searchParams.get("uid") || "").replace(/[^A-Za-z0-9-]/g, "").slice(0, 40);
    if (!uid) return NextResponse.json({ ok: true, activas: [], acabadas: [] });

    // caducar duelos abandonados: paseo para quien respondió; bote nulo si nadie
    await db.$executeRawUnsafe(`
      UPDATE site_duelos SET estado = 'acabada', ganador = CASE
        WHEN from_resp IS NOT NULL THEN from_uid
        WHEN to_resp IS NOT NULL THEN to_uid
        ELSE NULL END
      WHERE estado = 'activa' AND ts < ${Date.now() - VIDA_MS}`).catch(() => {});

    const rows = await db.$queryRaw<{
      id: bigint | number; from_uid: string; from_alias: string; to_uid: string; to_alias: string;
      pregunta: string; opciones: string; correcta: number;
      from_resp: number | null; from_ms: number | null; to_resp: number | null; to_ms: number | null;
      estado: string; ganador: string | null; apuesta: number; ts: bigint | number;
    }[]>`
      SELECT * FROM site_duelos
      WHERE (from_uid = ${uid} OR to_uid = ${uid}) AND ts > ${Date.now() - 40 * 60_000}
      ORDER BY ts DESC LIMIT 12`;

    const activas: unknown[] = [];
    const acabadas: unknown[] = [];
    for (const r of rows) {
      const duel = {
        id: Number(r.id),
        soyFrom: r.from_uid === uid,
        rival: r.from_uid === uid ? r.to_alias || "Guerrero" : r.from_alias || "Guerrero",
        pregunta: r.pregunta,
        opciones: JSON.parse(r.opciones || "[]") as string[],
        apuesta: r.apuesta,
        miResp: r.from_uid === uid ? r.from_resp : r.to_resp,
        rivalResp: r.from_uid === uid ? r.to_resp : r.from_resp,
        estado: r.estado,
        ganador: r.ganador,
        correcta: r.estado === "acabada" ? r.correcta : null,
        miMs: r.from_uid === uid ? r.from_ms : r.to_ms,
        rivalMs: r.from_uid === uid ? r.to_ms : r.from_ms,
      };
      if (r.estado === "activa") activas.push(duel);
      else acabadas.push(duel);
    }
    return NextResponse.json({ ok: true, activas, acabadas });
  } catch (e) {
    console.error("duelo GET error", e);
    return NextResponse.json({ ok: true, activas: [], acabadas: [] });
  }
}

// POST /api/duelo
// { action: "retar", uid, alias, apuesta }  → crea duelo contra guerrero aleatorio en línea
// { action: "responder", uid, id, resp, ms } → registra mi respuesta
export async function POST(req: Request) {
  try {
    await ensureTables();
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const uid = str(body.uid, 40).replace(/[^A-Za-z0-9-]/g, "");
    if (uid.length < 8) return NextResponse.json({ ok: false, error: "UID inválido" }, { status: 400 });
    const action = str(body.action, 10);

    if (action === "retar") {
      const alias = str(body.alias, 24) || "Guerrero";
      const apuestaRaw = Number(body.apuesta);
      const apuesta = [50, 100, 200, 500].includes(apuestaRaw) ? apuestaRaw : 100;

      // rival al azar entre los en línea ahora, excluyéndome
      // (site_presence NO tiene alias: uid/last_seen/lang — alias desde site_naciones)
      const online = await db.$queryRaw<{ uid: string }[]>`
        SELECT uid FROM site_presence
        WHERE last_seen > ${Date.now() - VENTANA_MS} AND uid <> ${uid}
        ORDER BY random() LIMIT 1`;
      if (!online[0]) {
        return NextResponse.json({ ok: false, error: "No hay otros guerreros en línea ahora — vuelve pronto" });
      }
      let aliasRival = "Guerrero";
      try {
        const nac = await db.$queryRaw<{ nombre: string }[]>`
          SELECT nombre FROM site_naciones WHERE uid = ${online[0].uid} LIMIT 1`;
        if (nac[0]?.nombre) aliasRival = nac[0].nombre;
      } catch { /* site_naciones aún no existe: alias genérico */ }
      // anti-spam: nada de retar al mismo rival dos veces en <3 min
      const dup = await db.$queryRaw<{ id: bigint | number }[]>`
        SELECT id FROM site_duelos WHERE from_uid = ${uid} AND to_uid = ${online[0].uid} AND ts > ${Date.now() - 180_000} LIMIT 1`;
      if (dup[0]) {
        return NextResponse.json({ ok: false, error: "Ya retaste a ese guerrero hace un momento — espera su respuesta" });
      }
      const q = BANCO[Math.floor(Math.random() * BANCO.length)];
      await db.$executeRaw`
        INSERT INTO site_duelos (from_uid, from_alias, to_uid, to_alias, pregunta, opciones, correcta, apuesta, ts)
        VALUES (${uid}, ${alias}, ${online[0].uid}, ${aliasRival}, ${q.p}, ${JSON.stringify(q.o)}, ${q.c}, ${apuesta}, ${Date.now()})`;
      await db.$executeRawUnsafe(`DELETE FROM site_duelos WHERE ts < ${Date.now() - 40 * 60_000}`).catch(() => {});
      return NextResponse.json({ ok: true, rival: aliasRival });
    }

    if (action === "responder") {
      const id = Number(body.id);
      const resp = Number(body.resp);
      const ms = Math.max(0, Math.min(600_000, Number(body.ms) || 0));
      if (!Number.isFinite(id) || !Number.isFinite(resp) || resp < 0 || resp > 3) {
        return NextResponse.json({ ok: false, error: "Respuesta inválida" }, { status: 400 });
      }
      const rows = await db.$queryRaw<{ from_uid: string; to_uid: string; estado: string }[]>`
        SELECT from_uid, to_uid, estado FROM site_duelos WHERE id = ${id} LIMIT 1`;
      const d = rows[0];
      if (!d || d.estado !== "activa" || (d.from_uid !== uid && d.to_uid !== uid)) {
        return NextResponse.json({ ok: false, error: "Ese duelo ya no está activo" });
      }
      const soyFrom = d.from_uid === uid;
      await db.$executeRawUnsafe(
        soyFrom
          ? `UPDATE site_duelos SET from_resp = ${resp}, from_ms = ${ms} WHERE id = ${id}`
          : `UPDATE site_duelos SET to_resp = ${resp}, to_ms = ${ms} WHERE id = ${id}`
      );
      // ¿ya respondieron los dos? → resolver
      const after = await db.$queryRaw<{ from_resp: number | null; to_resp: number | null; correcta: number; from_uid: string; to_uid: string; from_ms: number | null; to_ms: number | null }[]>`
        SELECT from_resp, to_resp, correcta, from_uid, to_uid, from_ms, to_ms FROM site_duelos WHERE id = ${id} LIMIT 1`;
      const a = after[0];
      if (a && a.from_resp !== null && a.to_resp !== null) {
        let ganador: string | null = null;
        if (a.from_resp === a.correcta && a.to_resp !== a.correcta) ganador = a.from_uid;
        else if (a.to_resp === a.correcta && a.from_resp !== a.correcta) ganador = a.to_uid;
        else if (a.from_resp === a.correcta && a.to_resp === a.correcta) {
          // ambos aciertan: gana el MÁS RÁPIDO
          const fm = a.from_ms ?? 600_000;
          const tm = a.to_ms ?? 600_000;
          ganador = fm <= tm ? a.from_uid : a.to_uid;
        }
        await db.$executeRaw`UPDATE site_duelos SET estado = 'acabada', ganador = ${ganador} WHERE id = ${id}`;
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: "Acción desconocida" }, { status: 400 });
  } catch (e) {
    console.error("duelo POST error", e);
    const detail = body.debug ? String(e).slice(0, 400) : undefined;
    return NextResponse.json({ ok: false, error: "Error del servidor de duelos", detail }, { status: 200 });
  }
}
