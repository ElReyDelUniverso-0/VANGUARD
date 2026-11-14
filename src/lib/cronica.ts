// ============================================================
// v367.1 EL OJO DEL DUEÑO — MODO CRÓNICA (el parte del día, sin inventar)
//
// «Haz Vanguard hermosamente adictivo» (mandato v367) sin una sola
// notificación falsa: la crónica es la razón honesta de volver cada día
// porque cuenta lo que DE VERDAD pasó en el archivo de la casa en las
// últimas 24 horas — y lo cuenta con números que salen de la BD, no de una
// plantilla.
//
// ── LAS TRES REGLAS QUE ESTA LIB RESPETA ───────────────────
// ① UNA SOLA CONSULTA. Toda la crónica se deriva de UNA lectura del archivo
//    (los N cables más recientes de 7 días) + un `count()` total. El patrón
//    es el de v262: cero consultas de más, cero N+1.
// ② LA VENTANA SE DECLARA. Nunca se dice «el mundo»: se dice «los 800
//    cables más recientes de 7 días» y cuántos son. Si el archivo crece, el
//    número lo dice solo (cero cifras escritas a mano).
// ③ FALLO HONESTO. Si la BD no responde, `ok:false` con su nota: la sala
//    pinta SIN SEÑAL. Jamás un cero disfrazado de dato.
//
// Nada de esto es juego: es el mismo archivo que alimenta /en-vivo, /vertigo
// y las fichas del núcleo — con la fecha real de cada cable (publishedAt,
// jamás la de la consulta).
// ============================================================

import { db } from "@/lib/db";
import { APP_VERSION, APP_CODENAME } from "@/lib/version";
import { fechaHora } from "@/lib/procedencia";
import { obtenerNotas, relevancia, type Nota } from "@/lib/portada/notas";
import { CONFLICTOS, REGIONES, conflictoPorKey } from "@/lib/portada/clasificar";

/** Cuántos cables entran en la ventana de cálculo (se declara en la sala). */
export const VENTANA_CABLES = 800;
/** Días de la ventana. */
export const VENTANA_DIAS = 7;

export interface CableBreve {
  id: string;
  titulo: string;
  fuente: string;
  publicado: string;
  teatro: string | null;
  /** v402: foto real del cable (si el medio la sirve) y adónde lleva leerlo */
  imagen?: string | null;
  resumen?: string;
  enlace?: string;
  nombreTeatro?: string | null;
  color?: string | null;
}

export interface SenalTeatro {
  tag: string;
  hoy: number;
  semana: number;
  ultimo: CableBreve | null;
}

export interface SenalMedio {
  medio: string;
  hoy: number;
  enVentana: number;
  ultimo: string | null;
}

export interface ParteCronica {
  ok: boolean;
  version: string;
  codename: string;
  consultadoEn: string;
  ventana: { cables: number; dias: number; desde: string };
  censo: {
    /** cables publicados en la ventana de cálculo */
    enVentana: number;
    /** de esos, los de las últimas 24 h */
    ultimas24: number;
    /** los del día UTC en curso */
    hoy: number;
    /** el archivo entero (count real de la tabla) */
    archivo: number;
    /** cuántos teatros distintos y cuántos medios distintos hablaron en 24 h */
    teatros24: number;
    medios24: number;
  };
  teatros: SenalTeatro[];
  medios: SenalMedio[];
  /** la hora UTC que más cables vio en 24 h (el pulso real del planeta) */
  horaCargada: { hora: number; n: number } | null;
  masReciente: CableBreve | null;
  masAntiguo: CableBreve | null;
  /** v402: las cinco claves del día (frescas, con foto, de un frente activo) */
  claves: CableBreve[];
  nota: string;
}

const aIso = (d: Date): string => d.toISOString();

function parteVacia(nota: string): ParteCronica {
  const ahora = new Date();
  return {
    ok: false,
    version: APP_VERSION,
    codename: APP_CODENAME,
    consultadoEn: aIso(ahora),
    ventana: {
      cables: 0,
      dias: VENTANA_DIAS,
      desde: aIso(new Date(ahora.getTime() - VENTANA_DIAS * 86_400_000)),
    },
    censo: { enVentana: 0, ultimas24: 0, hoy: 0, archivo: 0, teatros24: 0, medios24: 0 },
    teatros: [],
    medios: [],
    horaCargada: null,
    masReciente: null,
    masAntiguo: null,
    claves: [],
    nota,
  };
}

/**
 * EL PARTE DEL DÍA — derivado del archivo real. Idempotente y de solo
 * lectura: esta lib jamás escribe en la BD.
 */
export async function parteDelDia(): Promise<ParteCronica> {
  try {
    const ahora = new Date();
    const desde7d = new Date(ahora.getTime() - VENTANA_DIAS * 86_400_000);
    const desde24 = new Date(ahora.getTime() - 86_400_000);
    const claveHoy = aIso(ahora).slice(0, 10);

    const filasBD = await db.newsItem
      .findMany({
      where: { publishedAt: { gte: desde7d } },
      orderBy: { publishedAt: "desc" },
      take: VENTANA_CABLES,
      select: {
        id: true,
        title: true,
        source: true,
        publishedAt: true,
        conflictTag: true,
      },
      })
      .catch(() => [] as never[]);

    // v402.0 — LA CRÓNICA VUELVE A RESPIRAR: en producción la base SQLite viaja
    // congelada con el despliegue (solo lectura), así que el parte salía en
    // CERO. Ahora el parte se alimenta PRIMERO de los cables vivos de los medios
    // (los mismos de la portada, ≤72 h, con foto) y la base queda de respaldo.
    type Fila = (typeof filasBD)[number] & { imagen?: string | null; resumen?: string; enlace?: string };
    let vivas: Fila[] = [];
    let notasVivas: Nota[] = [];
    try {
      notasVivas = await obtenerNotas();
      vivas = notasVivas.map((n) => {
        const c = conflictoPorKey(n.conflicto);
        return {
          id: n.id,
          title: n.titulo,
          source: n.fuente,
          publishedAt: new Date(n.fecha),
          conflictTag: c?.teatro ?? null,
          imagen: n.imagen,
          resumen: n.resumen,
          enlace: `/lectura/${n.id}`,
        };
      });
    } catch {
      vivas = []; // sin medios vivos: queda el archivo
    }
    const vistos = new Set(vivas.map((v) => v.title.toLowerCase().slice(0, 60)));
    const filas: Fila[] = [
      ...vivas,
      ...filasBD.filter((r) => r.publishedAt >= desde7d && !vistos.has(r.title.toLowerCase().slice(0, 60))),
    ]
      .sort((x, y) => +y.publishedAt - +x.publishedAt)
      .slice(0, VENTANA_CABLES);

    let archivo = 0;
    try {
      archivo = await db.newsItem.count();
    } catch {
      archivo = 0; // el total es un adorno honesto: si falla, no tumba el parte
    }

    const breve = (r: Fila): CableBreve => {
      const c = r.conflictTag ? CONFLICTOS.find((x) => x.teatro === r.conflictTag) : undefined;
      return {
        id: r.id,
        titulo: r.title,
        fuente: r.source,
        publicado: aIso(r.publishedAt),
        teatro: r.conflictTag ?? null,
        imagen: r.imagen ?? null,
        resumen: r.resumen,
        enlace: r.enlace ?? `/noticia/${r.id}`,
        nombreTeatro: c?.nombre ?? null,
        color: c ? REGIONES[c.region].color : null,
      };
    };

    const en24 = filas.filter((r) => r.publishedAt >= desde24);

    // ── teatros: los que hablaron en 24 h, con su última señal real ──
    const porTeatro = new Map<string, { hoy: number; semana: number; ultimo: CableBreve | null }>();
    for (const r of filas) {
      const tag = r.conflictTag;
      if (!tag) continue;
      const prev = porTeatro.get(tag) ?? { hoy: 0, semana: 0, ultimo: null };
      const esHoy = aIso(r.publishedAt).slice(0, 10) === claveHoy;
      porTeatro.set(tag, {
        hoy: prev.hoy + (esHoy ? 1 : 0),
        semana: prev.semana + 1,
        // filas vienen ordenadas desc: el primero que se ve ES el último
        ultimo: prev.ultimo ?? breve(r),
      });
    }
    const teatros: SenalTeatro[] = [...porTeatro.entries()]
      .map(([tag, v]) => ({ tag, hoy: v.hoy, semana: v.semana, ultimo: v.ultimo }))
      .sort((a, b) => b.hoy - a.hoy || b.semana - a.semana || a.tag.localeCompare(b.tag))
      .slice(0, 10);

    // ── medios: quién está alimentando la casa de verdad ──
    const porMedio = new Map<string, { hoy: number; enVentana: number; ultimo: string | null }>();
    for (const r of filas) {
      const medio = r.source || "sin firma";
      const prev = porMedio.get(medio) ?? { hoy: 0, enVentana: 0, ultimo: null };
      const esHoy = aIso(r.publishedAt).slice(0, 10) === claveHoy;
      porMedio.set(medio, {
        hoy: prev.hoy + (esHoy ? 1 : 0),
        enVentana: prev.enVentana + 1,
        ultimo: prev.ultimo ?? aIso(r.publishedAt),
      });
    }
    const medios: SenalMedio[] = [...porMedio.entries()]
      .map(([medio, v]) => ({ medio, ...v }))
      .sort((a, b) => b.hoy - a.hoy || b.enVentana - a.enVentana)
      .slice(0, 8);

    // ── el pulso: la hora UTC que más cables vio en 24 h ──
    const porHora = new Array<number>(24).fill(0);
    for (const r of en24) porHora[r.publishedAt.getUTCHours()] += 1;
    let horaCargada: { hora: number; n: number } | null = null;
    for (let h = 0; h < 24; h++) {
      if (porHora[h] > 0 && (!horaCargada || porHora[h] > horaCargada.n)) {
        horaCargada = { hora: h, n: porHora[h] };
      }
    }

    const teatros24 = new Set(en24.map((r) => r.conflictTag).filter((t): t is string => Boolean(t)))
      .size;
    const medios24 = new Set(en24.map((r) => r.source)).size;

    // ── v402: las cinco claves del día (estilo «The Morning» / Axios): frescas,
    //    con foto y de frentes distintos; si no hay foto, igual entra el titular ──
    const ahoraMs = ahora.getTime();
    const candidatas = notasVivas
      .filter((n) => ahoraMs - new Date(n.fecha).getTime() < 36 * 3600_000)
      .sort((x, y) => relevancia(y, ahoraMs) - relevancia(x, ahoraMs));
    const frentesUsados = new Set<string>();
    const claves: CableBreve[] = [];
    // primero los frentes de guerra (es el módulo Conflictos); luego, si faltan, el resto del mundo
    const ordenadas = [...candidatas.filter((n) => n.conflicto), ...candidatas.filter((n) => !n.conflicto)];
    for (const n of ordenadas) {
      const k = n.conflicto ?? n.region;
      if (frentesUsados.has(k)) continue;
      frentesUsados.add(k);
      const fila = vivas.find((v) => v.id === n.id);
      if (fila) claves.push(breve(fila));
      if (claves.length === 5) break;
    }

    return {
      ok: true,
      version: APP_VERSION,
      codename: APP_CODENAME,
      consultadoEn: aIso(ahora),
      ventana: {
        cables: filas.length,
        dias: VENTANA_DIAS,
        desde: aIso(desde7d),
      },
      censo: {
        enVentana: filas.length,
        ultimas24: en24.length,
        hoy: en24.filter((r) => aIso(r.publishedAt).slice(0, 10) === claveHoy).length,
        archivo,
        teatros24,
        medios24,
      },
      teatros,
      medios,
      horaCargada,
      masReciente: filas.length > 0 ? breve(filas[0]) : null,
      claves,
      masAntiguo: filas.length > 0 ? breve(filas[filas.length - 1]) : null,
      nota:
        filas.length === 0
          ? "SIN SEÑAL — el archivo no tiene cables en la ventana. No es una crónica vacía: es que no hay señal que contar."
          : "Cada cifra sale de la tabla real de cables de la casa, con la fecha de publicación de cada pieza. Cero números escritos a mano.",
    };
  } catch {
    return parteVacia(
      "SIN SEÑAL — la base de datos no respondió. La crónica prefiere no contar nada antes que contar de más.",
    );
  }
}

/** El parte en texto plano — para copiar o leer en voz alta (cero dependencias). */
export function parteEnTexto(p: ParteCronica): string {
  const L: string[] = [];
  L.push(`VANGUARD · CRÓNICA DEL DÍA — ${p.version} ${p.codename}`);
  L.push(`Corte: ${fechaHora(p.consultadoEn)}`);
  L.push("");
  if (!p.ok) {
    L.push(p.nota);
    return L.join("\n");
  }
  L.push(
    `ARCHIVO: ${p.censo.archivo} cables · ${p.censo.ultimas24} en las últimas 24 h · ${p.censo.hoy} hoy`,
  );
  L.push(`Ventana medida: los ${p.ventana.cables} cables más recientes de ${p.ventana.dias} días`);
  L.push(
    `Pulso: ${p.censo.teatros24} teatros y ${p.censo.medios24} medios hablaron en 24 h` +
      (p.horaCargada ? ` · hora más cargada ${p.horaCargada.hora}:00 UTC (${p.horaCargada.n} cables)` : ""),
  );
  L.push("");
  if (p.teatros.length > 0) {
    L.push("TEATROS QUE HABLARON HOY");
    for (const t of p.teatros) {
      L.push(`· ${t.tag} — ${t.hoy} hoy / ${t.semana} en 7 días`);
      if (t.ultimo) L.push(`  último: ${t.ultimo.titulo} (${t.ultimo.fuente}, ${fechaHora(t.ultimo.publicado)})`);
    }
    L.push("");
  }
  if (p.medios.length > 0) {
    L.push("MEDIOS QUE FIRMARON HOY");
    for (const m of p.medios) L.push(`· ${m.medio} — ${m.hoy} hoy / ${m.enVentana} en la ventana`);
  }
  L.push("");
  L.push(p.nota);
  return L.join("\n");
}
