// ============================================================
// v217.0 LA EMISORA DE GUERRA — el parte que EXPLICA, no el que
// solo lista. Por qué existía un vacío: el despacho v119 narraba
// el cronoteatro (sector/hora) y el briefing v203 daba el resumen
// del día, pero NADIE contaba EL GUERRA COMPLETA: qué frente
// arde, cuántos cables lo sostienen, cuál es el último hecho y
// POR QUÉ ese teatro importa. El Dueño mandó: «que hable más de
// guerra, tenga más información que explique».
//
// CURA: el EMISOR compone el parte con datos REALES de la BD
// (conteo de cables por teatro en 24 h + último titular) y el
// DOSSIER del teatrólogo: una línea de contexto por teatro que
// explica qué es y por qué importa (verificada, sin opinión).
// Se narra con la voz COMANDANTE (motor v196: troceado anti-traba,
// vigía, respeta MUTE) y se puede cambiar de voz al instante.
// Cero servicios externos, cero coste — la casa narra su propia
// guerra con la verdad que ya tiene guardada.
// ============================================================

import { db } from "@/lib/db";
import { hablarAgente, type VozAgenteId } from "./voces-agentes";

export interface TeatroDelParte {
  tag: string;
  nombre: string;
  cables: number;
  ultimoTitular: string | null;
  dossier: string;
}

// ── EL DOSSIER DEL TEATRÓLOGO: qué es cada frente y por qué pesa ──
const DOSSIER: Record<string, string> = {
  ukraine:
    "Ucrania. La mayor guerra terrestre de Europa desde 1945. Artillería, drones y trincheras de mil kilómetros: aquí se decide el equilibrio de la OTAN y de Moscú.",
  gaza:
    "Gaza y Oriente Próximo. El frente que enciende a la región entera: mediación de Catar y Egipto, frontera con Líbano y el pulso entre Irán e Israel siempre al rojo.",
  hormuz:
    "Estrecho de Ormuz. La garganta del petróleo: cerca de un quinto del crudo del planeta pasa por ahí. Cada incidente aquí mueve el precio mundial de la energía.",
  taiwan:
    "Taiwán. La espina dorsal de los chips del mundo y el punto de fricción entre Pekín y Washington: maniobras navales y cruces de la línea media cada semana.",
  sahel:
    "El Sahel. La línea de fuego entre el Sáhara y la selva: golpes de Estado, milicias y tres bandos de potencias compitiendo por el control de la región.",
  redsea:
    "Mar Rojo y Babel-Mandeb. La puerta del comercio asiático: buques atacados desde Yemen y convoyes navales escoltados. El 12% del tráfico mundial pasa por aquí.",
  korea:
    "Coreas. La frontera más armada del planeta: pruebas de misiles del norte y ejercicios combinados del sur en un bucle constante de tensión.",
  sudan:
    "Sudán. La guerra civil que nadie mira: dos generales, una capital sitiada y la mayor crisis de refugiados de África avanzando hacia el Cuerno.",
  lebanon:
    "Líbano. La frontera sur del país de los cedros: escaramuzas cruzadas, desplazados y el miedo eterno a que el fuego de Gaza abra un segundo frente total.",
};

const NOMBRE: Record<string, string> = {
  ukraine: "Ucrania",
  gaza: "Gaza y Oriente Próximo",
  hormuz: "Estrecho de Ormuz",
  taiwan: "Taiwán",
  sahel: "Sahel",
  redsea: "Mar Rojo",
  korea: "Coreas",
  sudan: "Sudán",
  lebanon: "Líbano",
};

/** Lee la BD real: cables de 24 h por teatro + último titular de cada uno. */
export async function teatrosDelParte(): Promise<TeatroDelParte[]> {
  const desde = new Date(Date.now() - 24 * 3600_000);
  const grupos = await db.newsItem.groupBy({
    by: ["conflictTag"],
    where: { conflictTag: { not: null }, publishedAt: { gte: desde } },
    _count: { _all: true },
    orderBy: { _count: { conflictTag: "desc" } },
  });

  const partes: TeatroDelParte[] = [];
  for (const g of grupos) {
    const tag = g.conflictTag ?? "";
    if (!NOMBRE[tag]) continue;
    const ultimo = await db.newsItem.findFirst({
      where: { conflictTag: tag },
      orderBy: { publishedAt: "desc" },
      select: { title: true },
    });
    partes.push({
      tag,
      nombre: NOMBRE[tag],
      cables: g._count._all,
      ultimoTitular: ultimo?.title ?? null,
      dossier: DOSSIER[tag] ?? "",
    });
  }
  return partes;
}

/** El texto completo del parte (también se muestra en pantalla). */
export function componerParte(teatros: TeatroDelParte[], total24h: number): string[] {
  const frases: string[] = [];
  frases.push(
    `Aquí el Comandante. Emisora de guerra de Vanguard. Parte completo. En las últimas veinticuatro horas la casa ha registrado ${total24h} cables de conflicto en el mundo. Atención a los frentes.`
  );
  teatros.forEach((t, i) => {
    frases.push(`${t.dossier}`);
    frases.push(
      `Dossier del frente, ${t.cables} cables en veinticuatro horas.` +
        (t.ultimoTitular ? ` Último hecho: ${t.ultimoTitular}` : " Sin titular dominante esta hora.")
    );
    if (i === 0)
      frases.push(
        "Este es el frente que más arde ahora mismo. Si el mundo se rompe en algún punto, rompe aquí primero."
      );
  });
  if (teatros.length === 0)
    frases.push("Ningún teatro por encima del umbral. El mundo respira, por ahora. Vanguard sigue escuchando.");
  frases.push(
    "Fin del parte. Recuerda: cada cable lleva su fuente, cada frente su mapa, y aquí nadie te cuenta cuentos. Vanguard, la guerra en vivo."
  );
  return frases;
}

/** Narra el parte con la voz elegida (por defecto, COMANDANTE). */
export async function narrarParteGuerra(voz: VozAgenteId = "comandante"): Promise<boolean> {
  const teatros = await teatrosDelParte();
  const total24h = teatros.reduce((a, t) => a + t.cables, 0);
  const frases = componerParte(teatros, total24h);
  const { isMuted } = await import("./sound");
  if (isMuted()) return false;
  return hablarAgente(voz, frases.join(" "));
}
