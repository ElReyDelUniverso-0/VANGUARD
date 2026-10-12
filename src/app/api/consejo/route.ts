import { NextResponse } from "next/server";
import { iaParalela } from "@/lib/ia-gateway";

// v79.0 — EL CONSEJO DE ACERO: la primera sala de deliberación con IA en vivo.
// POST { modo: "deliberacion", tema }                      → 4 intervenciones + voto + decreto
// POST { modo: "dialogo", consejero, mensaje, historial }  → respuesta de 1 consejero
// v107.0 — EL MODELO DE LOS PERSONAJES, RECONSTRUIDO: dos mandatos del comandante
// se aten here — "mejora el modelo de los agentes, esa de los personajes":
//  ① VÍA BLINDADA (lección v105): el SDK (createZAI) NUNCA alcanza el gateway
//    desde el lambda de producción → los personajes caían SIEMPRE a las
//    plantillas locales ("solo cosas automáticas"). Ahora deliberan por
//    iaParalela (gateway privado ∥ núcleo público, con memoria de caída).
//  ② FICHAS DE PERSONAJE: cada consejero tiene biografía, tics verbales, lema
//    y forma propia de discrepar — ya no son 4 plantillas, son 4 voces.
// Si la IA falla, hay fallback heurístico para que la sala NUNCA quede en silencio.

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type ConsejeroId = "estratega" | "canciller" | "general" | "analista";

// v107.0 FICHAS DE PERSONAJE — biografía ficticia, voz, tics, lema y filo para
// discrepar. Todo es ficción de juego: títulos y carreras inventadas.
const CONSEJEROS: Record<ConsejeroId, { nombre: string; rol: string; bio: string; voz: string; tics: string; lema: string }> = {
  estratega: {
    nombre: "EL ESTRATEGA",
    rol: "táctica, mapas y logística",
    bio: "Veinte años ficticios de estado mayor en una academia que no existe; piensa en mapas antes que en palabras y jamás ha dado una orden sin tres rutas de retirada.",
    voz: "Frío, calculador y quirúrgico: ejes de avance, suministros y consecuencias de segundo orden. Habla corto, sin exclamaciones, y numera escenarios («escenario A / escenario B»).",
    tics: "cita el «segundo orden» y las «líneas de suministro»; desconfía de cualquier plan que dependa de suerte",
    lema: "La geografía manda",
  },
  canciller: {
    nombre: "LA CANCILLER",
    rol: "diplomacia y alianzas",
    bio: "Carrera diplomática ficticia: firmó tres armisticios que nunca salieron en prensa. Elegante, paciente, letal en la nota al pie.",
    voz: "Elegante y medida: tratados, sanciones, opinión pública y salidas negociables. Busca la mesa antes que el frente y siempre pregunta qué necesita cada parte para firmar sin perder la cara.",
    tics: "habla de «la mesa», «el canal discreto» y «la cara de todos»; deja preguntas en el aire en vez de órdenes",
    lema: "Toda guerra termina en una firma; la pregunta es dónde",
  },
  general: {
    nombre: "EL GENERAL",
    rol: "fuerza y disuasión",
    bio: "Artillería ficticia de viejo cuño: habla en tres palabras cuando basta una y desprecia los planes de diez puntos.",
    voz: "Seco y contundente: capacidad, movilización y coste humano sin adornos. Desprecia la duda y exige responder «¿y el día después?» antes de mover una sola pieza.",
    tics: "pregunta lo incómodo («¿y el día después?»), cita cifras de movilización y desprecia el ruido estratégico",
    lema: "La logística es el destino",
  },
  analista: {
    nombre: "EL ANALISTA",
    rol: "datos y probabilidad",
    bio: "Ex-inteligencia de señales ficticia: convirtió la duda en profesión y la probabilidad en su idioma nativo.",
    voz: "Metódico y cuantitativo: escenarios con porcentajes, supuestos frágiles y datos que faltan. Números antes que adjetivos, intervalos anchos antes que certezas.",
    tics: "responde con rangos («45-60%»), menciona el «base rate» y siempre lista qué datos faltan",
    lema: "Sin datos es solo opinión con uniforme",
  },
};

// rate-limit en memoria por IP (simple, por instancia serverless)
const hits = new Map<string, { n: number; ts: number }>();
const WINDOW_MS = 60_000;
const MAX_REQ = 14;

function limited(ip: string): boolean {
  const now = Date.now();
  const h = hits.get(ip);
  if (!h || now - h.ts > WINDOW_MS) {
    hits.set(ip, { n: 1, ts: now });
    if (hits.size > 500) {
      for (const [k, v] of hits) if (now - v.ts > WINDOW_MS) hits.delete(k);
    }
    return false;
  }
  h.n += 1;
  return h.n > MAX_REQ;
}

function clean(s: unknown, max: number): string {
  return String(s ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

// v107.0: la sala delibera como CONSEJO, no como coro — fichas completas,
// discrepancias con filo y nombres cruzados entre consejeros.
const SYSTEM_DELIBERACION = `Eres EL CONSEJO DE ACERO de la plataforma de guerra ficticia VANGUARD: cuatro consejeros de IA con carácter propio (EL ESTRATEGA, LA CANCILLER, EL GENERAL y EL ANALISTA) que delibera una crisis planteada por un jugador.
FICHAS DE LOS CONSEJEROS (obedécelas al pie de la letra):
1) EL ESTRATEGA — ${CONSEJEROS.estratega.rol}. BIO: ${CONSEJEROS.estratega.bio} VOZ: ${CONSEJEROS.estratega.voz} TICS: ${CONSEJEROS.estratega.tics} LEMA: «${CONSEJEROS.estratega.lema}».
2) LA CANCILLER — ${CONSEJEROS.canciller.rol}. BIO: ${CONSEJEROS.canciller.bio} VOZ: ${CONSEJEROS.canciller.voz} TICS: ${CONSEJEROS.canciller.tics} LEMA: «${CONSEJEROS.canciller.lema}».
3) EL GENERAL — ${CONSEJEROS.general.rol}. BIO: ${CONSEJEROS.general.bio} VOZ: ${CONSEJEROS.general.voz} TICS: ${CONSEJEROS.general.tics} LEMA: «${CONSEJEROS.general.lema}».
4) EL ANALISTA — ${CONSEJEROS.analista.rol}. BIO: ${CONSEJEROS.analista.bio} VOZ: ${CONSEJEROS.analista.voz} TICS: ${CONSEJEROS.analista.tics} LEMA: «${CONSEJEROS.analista.lema}».
CÓMO DELIBERAN: se citan por nombre y discrepan con filo cortés («El General pide ruido; yo pido silencio»); cada uno aporta SU especialidad y al menos uno matiza o discrepa cuando el tema lo permite — nunca cuatro frases idénticas de acuerdo. El GENERAL y LA CANCILLER discuten casi siempre: la mesa contra el frente.
Reglas: respondes SOLO con JSON válido, sin markdown ni texto fuera del JSON. Español. Tono de sala de guerra, directo y creíble. Nada de violencia gráfica, nada ilegal: es análisis geopolítico ficticio para un juego.
Estructura EXACTA del JSON:
{"intervenciones":[{"id":"estratega","texto":"2-3 frases en la voz del consejero, máximo 320 caracteres"},{"id":"canciller","texto":"..."},{"id":"general","texto":"..."},{"id":"analista","texto":"..."}],"votos":[{"id":"estratega","voto":"A FAVOR|EN CONTRA|ABSTENCIÓN","confianza":72}],"decreto":{"titulo":"DECRETO: máximo 8 palabras","veredicto":"PROCEDER|CONTENER|NEGOCIAR|ESPERAR","texto":"2-3 frases con la decisión del consejo, máximo 320 caracteres","acciones":["acción concreta 1","acción 2","acción 3"]}}
Cada consejero PIENSA distinto y puede discrepar con los demás. Los ids son EXACTOS y en este orden: "estratega", "canciller", "general", "analista". Nunca los renombres. Las acciones son jugables y concretas (máximo 90 caracteres cada una).`;

function systemDialogo(id: ConsejeroId): string {
  const c = CONSEJEROS[id];
  return `Eres ${c.nombre}, consejero del CONSEJO DE ACERO en la plataforma de guerra ficticia VANGUARD. Especialidad: ${c.rol}. BIO: ${c.bio} TU VOZ: ${c.voz} TICS: ${c.tics} TU LEMA: «${c.lema}». Puedes discrepar del comandante con respeto y filo: das razones concretas de tu especialidad, nunca relleno genérico. El comandante te habla directamente en la sala de deliberación. Respondes SOLO JSON válido: {"respuesta":"2-4 frases, máximo 380 caracteres, en tu voz"}. Español, análisis geopolítico ficticio de juego, sin violencia gráfica ni instrucciones reales dañinas.`;
}

function stripFences(raw: string): string {
  return raw.replace(/^\s*```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
}

function extractJson(raw: string): Record<string, unknown> | null {
  const clean = stripFences(raw);
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(clean.slice(start, end + 1));
  } catch {
    return null;
  }
}

// ---- NÚCLEO LOCAL: generador procedural cuando el gateway de IA no es alcanzable ----
// Variedad real: palabras clave del tema + plantillas múltiples + azar por consejero.
const STOP = new Set(["de","la","el","los","las","un","una","unos","unas","y","o","en","con","para","por","que","al","del","lo","su","sus","es","son","se","sobre","entre","hacia","sin","mas","más","ya","frente","cayo","caída"]);
function keywords(tema: string): string[] {
  const ws = tema.toLowerCase().replace(/[^a-záéíóúñü0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
  return [...new Set(ws)].slice(0, 3);
}
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const rnd = (a: number, b: number) => Math.floor(a + Math.random() * (b - a));

const NUCLEO_VOZ: Record<ConsejeroId, ((k: string[]) => string)[]> = {
  estratega: [
    (k) => `La geografía manda: alrededor de ${k[0] ?? "el objetivo"} hay tres ejes y solo dos son defendibles. Aseguro suministros y me posiciono antes de mover una pieza visible.`,
    (k) => `${k[0] ?? "El escenario"} es una partida de segundo orden: quien mueve primero cede la iniciativa. Recomiendo preparar posiciones ocultas y dejar que el rival se exponga.`,
    (k) => `En ${k[0] ?? "esta crisis"} la logística decide: sin rutas seguras, toda medida sobre ${k[1] ?? "el terreno"} es teatro. Fijaría tres líneas de abastecimiento antes de cualquier gesto público.`,
    (k) => `Mapa en mano: ${k[0] ?? "el punto crítico"} no se defiende desde su frontera, se defiende a dos pasos atrás. Reordenaría el despliegue y guardaría la reserva.`,
  ],
  canciller: [
    (k) => `Antes de que ${k[0] ?? "esta crisis"} escale en la prensa, abriría un canal discreto. Una mesa callada vale más que diez discursos y protege la cara de todos.`,
    (k) => `Hay margen diplomático en ${k[0] ?? "el asunto"}: tercero neutral, plazo corto y agenda mínima. Si falla, la coalición queda legitimada para el paso siguiente.`,
    (k) => `Las sanciones que duelen son las coordinadas: sin ${k[1] ?? "los socios"} dentro, la medida es un anuncio. Ofrecería una salida presentable a la otra parte.`,
    (k) => `Opinión pública primero: si el mundo entiende ${k[0] ?? "el conflicto"} como defensa y no como apuesta, ganamos la votación antes de que empiece.`,
  ],
  general: [
    (k) => `La disuasión se demuestra, no se anuncia. Visibilidad de capacidades respecto a ${k[0] ?? "el objetivo"} y nada más: el ruido estratégico solo invita a pruebas.`,
    (k) => `Pregunto lo incómodo: ¿qué pasa el día después en ${k[0] ?? "la zona"}? Sin respuesta operativa, toda escalada es un cheque en blanco sin fondos.`,
    (k) => `Movilidad, comunicaciones, municiones. Si alguna de las tres falla frente a ${k[0] ?? "el escenario"}, no se entra. La valentía sin logística es obituario.`,
    (k) => `El adversario cuenta con que dudemos. Una demostración corta, clara y limitada alrededor de ${k[0] ?? "el frente"} reordena su cálculo en 72 horas.`,
  ],
  analista: [
    (k) => `Modelo rápido sobre ${k[0] ?? "el tema"}: ${rnd(45, 60)}% congelamiento esta semana, ${rnd(25, 35)}% escalada retórica, ${rnd(10, 20)}% incidente físico. Intervalos anchos: faltan datos duros.`,
    (k) => `Tres señales que vigilaría en ${k[0] ?? "el frente"}: tráficos logísticos, discursos internos y reservas de ${k[1] ?? "recursos"}. Si dos se mueven juntas, el modelo cambia.`,
    (k) => `El sesgo del momento es sobre-reaccionar a ${k[0] ?? "el titular"}. Base rate histórico: ${rnd(60, 75)}% de estas crisis se negocian antes de ${rnd(2, 6)} semanas.`,
    (k) => `Dato incómodo: los indicadores públicos sobre ${k[0] ?? "el caso"} llevan ${rnd(4, 11)} días de retraso. Recomiendo contrastar con dos fuentes independientes antes de votar.`,
  ],
};

const VEREDICTOS = ["PROCEDER", "CONTENER", "NEGOCIAR", "ESPERAR"] as const;
const ACCIONES: Record<string, string[]> = {
  PROCEDER: ["Consulta la Sala OSINT antes de actuar", "Marca el objetivo en el Mapa Mundial", "Vuelve al consejo con pruebas nuevas"],
  CONTENER: ["Refuerza la vigilancia en Pulso Mundial", "Documenta el caso en Archivo Secreto", "Reevalúa en 24 horas con datos frescos"],
  NEGOCIAR: ["Abre expediente diplomático en Alianzas", "Consulta a los Embajadores por país", "Prepara tu propuesta para el tribunal"],
  ESPERAR: ["Vigila el Pulso Mundial cada 6 horas", "Abre expediente en el Archivo Secreto", "Trae el tema de vuelta al consejo"],
};
const TITULOS = ["VIGILANCIA ACTIVA", "CONTENCIÓN FIRME", "MESA ANTES QUE FRENTE", "ORDEN DE ESPERA", "DECISIÓN DEL ACERO"];

function nucleoLocalDeliberacion(tema: string) {
  const k = keywords(tema);
  const veredicto = pick([...VEREDICTOS]);
  const conf = () => rnd(42, 92);
  const votos = (["estratega", "canciller", "general", "analista"] as ConsejeroId[]).map((id) => ({
    id,
    voto: pick(["A FAVOR", "EN CONTRA", "ABSTENCIÓN"]),
    confianza: conf(),
  }));
  return {
    intervenciones: (["estratega", "canciller", "general", "analista"] as ConsejeroId[]).map((id) => ({
      id,
      texto: pick(NUCLEO_VOZ[id])(k),
    })),
    votos,
    decreto: {
      titulo: `DECRETO: ${pick(TITULOS)}`,
      veredicto,
      texto: `El consejo analiza "${tema}" y ordena: ${veredicto === "PROCEDER" ? "actuar con pasos acotados y prueba en la mano" : veredicto === "CONTENER" ? "frenar la escalada sin ceder terreno" : veredicto === "NEGOCIAR" ? "forzar la mesa antes que el frente" : "mantener la mirada fija y no mover ficha hasta tener datos"}.`,
      acciones: [...ACCIONES[veredicto]].sort(() => Math.random() - 0.5).slice(0, 3),
    },
  };
}

const NUCLEO_REPLICA: Record<ConsejeroId, ((m: string) => string)[]> = {
  estratega: [
    (m) => `Interesante contraargumento. Ajusto el plan: lo que propones sobre "${m.slice(0, 60)}" solo funciona con suministros asegurados. ¿Tienes las rutas?`,
    (m) => `Anoto tu punto. Pero el terreno no perdona la improvisación: sin mapa fresco de la zona, tu opción cuesta el doble y rinde la mitad.`,
    (m) => `Hablemos de sequencias: primero posiciones, después señales, y solo al final tu medida. Saltarte pasos es regalar la iniciativa.`,
  ],
  canciller: [
    (m) => `Tu propuesta tiene una puerta diplomática: si la presentas como respuesta y no como amenaza, el coste político cae a la mitad.`,
    (m) => `Creo en tu instinto, pero los aliados necesitan una excusa presentable. Déjame construirles el relatorio antes de mover ficha.`,
    (m) => `Detrás de cada posición dura hay una audiencia interna. Habla a esa audiencia y la posición se suaviza sola.`,
  ],
  general: [
    (m) => `Respuesta seca: la duda no detiene tanques. Si vas a hacer "${m.slice(0, 60)}", hazlo rápido, corto y con salida preparada.`,
    (m) => `Estoy dispuesto a escuchar. Pero cada día de vacío lo llena el adversario, y su relleno nunca nos favorece.`,
    (m) => `Tu plan tiene una debilidad logística y una ventana. Resuelve la primera y te doy la segunda.`,
  ],
  analista: [
    (m) => `Cuantifico tu idea: probabilidad de éxito estimada ${rnd(35, 75)}%, con un margen de error del ${rnd(8, 20)}%. Necesito dos datos más para afinar.`,
    (m) => `Tu razonamiento coincide con el base rate en casos parecidos, pero la muestra es pequeña. Vigilaría las señales que ya te dije.`,
    (m) => `Dato que cambia el debate: los indicadores llevan días de retraso. Tu medida, aplicada hoy, se evaluaría con datos de la semana pasada.`,
  ],
};

function nucleoLocalDialogo(consejero: ConsejeroId, mensaje: string) {
  const voces = NUCLEO_REPLICA[consejero] ?? NUCLEO_REPLICA.analista;
  return pick(voces)(mensaje);
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) {
    return NextResponse.json({ ok: false, error: "El consejo necesita respirar: espera unos segundos." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Petición inválida" }, { status: 400 });
  }

  const modo = body?.modo === "dialogo" ? "dialogo" : "deliberacion";
  // ?nucleo=1 fuerza el núcleo local (QA del comportamiento de producción)
  const forzarNucleo = new URL(req.url).searchParams.get("nucleo") === "1";

  try {
    if (forzarNucleo) throw new Error("núcleo local forzado");

    if (modo === "deliberacion") {
      const tema = clean(body?.tema, 280);
      if (tema.length < 4) {
        return NextResponse.json({ ok: false, error: "Plantea el tema con al menos 4 caracteres." }, { status: 400 });
      }
      // v80: memoria persistente del comandante (enviada por el cliente)
      const memoria = clean(body?.memoria, 400);
      // v107.0 CARRERA 1∥3: el modelo fuerte de verdad para los personajes —
      // el mismo camino blindado que LA MENTE (v105): gateway privado ∥ núcleo
      // público, con memoria de caída por instancia. En producción el SDK
      // anterior colgaba 20s y todo caía a plantillas.
      const user = `${memoria ? `MEMORIA DEL COMANDANTE: ${memoria}\n` : ""}CRISIS PLANTEADA POR EL COMANDANTE: "${tema}". Deliberen AHORA y emitan el decreto. Responde solo el JSON.`;
      const raw = await iaParalela(SYSTEM_DELIBERACION, user, 26_000);
      const parsed = raw ? (extractJson(raw) as any) : null;
      if (!parsed?.intervenciones || !parsed?.decreto) {
        return NextResponse.json({ ok: true, ...nucleoLocalDeliberacion(tema), ia: false });
      }
      const ids: ConsejeroId[] = ["estratega", "canciller", "general", "analista"];
      const lista: any[] = Array.isArray(parsed.intervenciones) ? parsed.intervenciones : [];
      // mapeo tolerante: primero por id exacto; si falta, por posición (el modelo
      // a veces renombra los consejeros — les asignamos nuestra voz canónica)
      const intervenciones = ids
        .map((id, i) => {
          const porId = lista.find((x) => x?.id === id);
          const elegido = porId ?? lista[i] ?? null;
          return { id, texto: clean(elegido?.texto ?? elegido?.intervencion ?? "", 400) };
        })
        .filter((x) => x.texto.length > 0);
      if (intervenciones.length < 2) {
        return NextResponse.json({ ok: true, ...nucleoLocalDeliberacion(tema), ia: false });
      }
      const votos = ids.map((id, i) => {
        const vlista: any[] = Array.isArray(parsed.votos) ? parsed.votos : [];
        const v = vlista.find((x: any) => x?.id === id) ?? vlista[i] ?? {};
        const voto = clean(v.voto, 16).toUpperCase();
        return {
          id,
          voto: ["A FAVOR", "EN CONTRA", "ABSTENCIÓN"].includes(voto) ? voto : "ABSTENCIÓN",
          confianza: Math.max(10, Math.min(99, parseInt(String(v.confianza), 10) || 55)),
        };
      });
      const d = parsed.decreto ?? {};
      return NextResponse.json({
        ok: true,
        ia: true,
        tema,
        intervenciones,
        votos,
        decreto: {
          titulo: clean(d.titulo, 60) || "DECRETO DEL CONSEJO",
          veredicto: clean(d.veredicto, 12).toUpperCase() || "PROCEDER",
          texto: clean(d.texto, 360) || "El consejo ha deliberado. Mantén la vigilancia.",
          acciones: [clean(d.acciones?.[0], 90), clean(d.acciones?.[1], 90), clean(d.acciones?.[2], 90)].filter(Boolean),
        },
      });
    }

    // modo diálogo con un consejero
    const id = String(body?.consejero) as ConsejeroId;
    if (!CONSEJEROS[id]) {
      return NextResponse.json({ ok: false, error: "Consejero desconocido" }, { status: 400 });
    }
    const mensaje = clean(body?.mensaje, 500);
    if (mensaje.length < 2) {
      return NextResponse.json({ ok: false, error: "Escribe tu réplica." }, { status: 400 });
    }
    const historial = Array.isArray(body?.historial) ? body.historial.slice(-12) : [];
    const hist = historial
      .map((h: Record<string, unknown>) => `${clean(h?.consejero, 20)}: ${clean(h?.texto, 400)}`)
      .filter((l: string) => l.length > 3)
      .join("\n");
    // v80: memoria persistente del comandante (enviada por el cliente)
    const memoriaD = clean(body?.memoria, 400);

    // v107.0: cara a cara también por la vía blindada (modelo fuerte de verdad)
    const userD = `${hist ? `TRANSCRIPCIÓN PREVIA DE LA SALA:\n${hist}\n` : ""}${
      memoriaD ? `MEMORIA DEL COMANDANTE: ${memoriaD}\n` : ""
    }EL COMANDANTE TE CONTESTA: "${mensaje}". Responde solo el JSON.`;
    const raw = await iaParalela(systemDialogo(id), userD, 24_000);
    const parsed = raw ? (extractJson(raw) as any) : null;
    const respuesta = clean(parsed?.respuesta, 420);
    if (!respuesta) {
      return NextResponse.json({ ok: true, ia: false, respuesta: nucleoLocalDialogo(id, mensaje) });
    }
    return NextResponse.json({ ok: true, ia: true, respuesta });
  } catch (e: unknown) {
    const errMsg = e instanceof Error ? e.message : String(e);
    console.error("consejo error", errMsg);
    const tema = clean(body?.tema, 60) || "la crisis abierta";
    const url = new URL(req.url);
    const debug = url.searchParams.get("debug") === "1";
    return NextResponse.json(
      modo === "deliberacion"
        ? { ok: true, ia: false, ...nucleoLocalDeliberacion(tema), ...(debug ? { err: errMsg } : {}) }
        : { ok: true, ia: false, respuesta: nucleoLocalDialogo((modo === "dialogo" ? String(body?.consejero) : "general") as ConsejeroId, String(body?.mensaje ?? tema)), ...(debug ? { err: errMsg } : {}) },
      { status: 200 },
    );
  }
}
