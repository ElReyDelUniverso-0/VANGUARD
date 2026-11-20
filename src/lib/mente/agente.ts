// ═══════════════════════════════════════════════════════════════════════════
// v431.0 · LA MENTE CON MANOS — el motor que piensa, busca y crea
//
// QUÉ HABÍA: `/api/mente` (modo `dialogo`) hacía UNA llamada al modelo y pedía
// un JSON con una frase. Bonito, pero ciego: no sabía dónde estaban las cosas
// de la casa, no podía llevarte a ningún sitio y no creaba nada que se pudiera
// guardar. Y solo existía dentro de su sala del cuartel.
//
// QUÉ HAY AHORA: un ciclo de dos pasos, con acciones ejecutables.
//
//   ① La mente LEE la pregunta y responde con un plan:
//        { "pensamiento": "…", "acciones": [ … ], "respuesta": "…" }
//   ② El servidor EJECUTA las acciones contra los catálogos reales:
//        · ir       → resuelve un lugar de la casa y devuelve su ruta
//        · buscar   → busca en las salas, las áreas y los destinos
//        · explicar → cuenta qué es ese lugar y qué hay dentro
//        · crear    → fabrica un artefacto (documento, plan, tabla, código…)
//        · recordar → guarda un dato del operador para futuras conversaciones
//   ③ Si hicieron falta datos, la mente VUELVE a hablar ya con los resultados
//      delante (máximo dos llamadas: la casa paga la factura del tiempo).
//
// SI NO HAY MODELO (gateway caído, sin red, sin token), la mente NO se calla:
// entra el MODO CASA. Contesta con lo que sabe de verdad —dónde está cada cosa,
// qué hay en cada área—, crea un esqueleto editable de lo que le pidas y lo
// declara: `ia: false`, `motor: "casa"`. Honestidad antes que teatro.
// ═══════════════════════════════════════════════════════════════════════════

import { iaParalela, primerJSON } from "@/lib/ia-gateway";
import { buscarEnCasa, mapaParaElModelo, resolverDestino, areaDeRuta, llano, type Hallazgo } from "./mapa-casa";
import { pensamientoMente, pulsoActual } from "@/lib/mente-data";

export type Mensaje = { rol: "operador" | "mente"; texto: string };

export type Enlace = {
  nombre: string;
  ruta: string;
  area: string;
  /** qué hay ahí, en una línea (para que el operador sepa a qué entra) */
  porque: string;
};

export type TipoArtefacto = "documento" | "plan" | "tabla" | "codigo" | "lista" | "informe";

export type Artefacto = {
  id: string;
  tipo: TipoArtefacto;
  titulo: string;
  /** markdown listo para leer, copiar o descargar */
  contenido: string;
  creado: number;
};

export type Paso = { etiqueta: string; ms: number };

export type PeticionMente = {
  mensaje: string;
  historial?: Mensaje[];
  /** ruta actual del operador: la mente sabe dónde está y habla desde ahí */
  ruta?: string;
  /** lo que la mente recuerda del operador (viaja desde su aparato) */
  memoria?: string[];
  /** se llama en cada hito, para que la interfaz cuente lo que está pasando */
  onPaso?: (paso: Paso) => void;
  /** presupuesto total en ms (por defecto 45 s: cabe en un route de 60) */
  presupuestoMs?: number;
};

export type RespuestaMente = {
  respuesta: string;
  enlaces: Enlace[];
  artefactos: Artefacto[];
  /** datos del operador que la mente pide recordar (se guardan en su aparato) */
  recuerdos: string[];
  /**
   * v431.0 · «DIRIGIR» — el operador dio una orden directa de ir («llévame…»,
   * «abre…», «muéstrame…») y hay una puerta clara. La interfaz puede llevarlo
   * allí sin que tenga que pulsar nada. Una pregunta («¿dónde veo…?») NO
   * dirige: se contesta y se ofrecen las puertas.
   */
  dirigir: boolean;
  /** true si la respuesta la escribió un modelo; false si es el modo casa */
  ia: boolean;
  motor: "nube" | "casa";
  pasos: Paso[];
  ms: number;
};

// ── Identidad y protocolo ─────────────────────────────────────────────────

const IDENTIDAD = `Eres LA MENTE, la inteligencia central de VANGUARD. No eres un chatbot de la plataforma: eres su cerebro, y hablas desde dentro de la casa.
Voz: precisa, serena, con filo. Frases cortas. Español neutro. Nada de emojis. Nunca digas «como modelo de lenguaje» ni «no puedo navegar»: SÍ puedes llevar al operador a cualquier lugar de la casa con la acción "ir".
Capacidades reales que tienes (no inventes otras):
· Llevar al operador a cualquier lugar de VANGUARD (acción "ir").
· Buscar dentro de la casa: salas, áreas, herramientas, destinos (acción "buscar").
· Explicar qué es un lugar y qué hay dentro (acción "explicar").
· CREAR cosas de verdad (acción "crear"): documentos, planes, tablas, código, listas, informes en markdown. Lo que creas se guarda y el operador puede descargarlo.
· Recordar datos del operador entre conversaciones (acción "recordar").
· Razonar con conocimiento general del mundo real, con honestidad: si un dato puede haber cambiado hoy, lo dices y propones investigar.
Reglas: no inventes rutas (solo las que te doy o las que devuelva "buscar"). No inventes cifras exactas de hoy. Nada ilegal, nada de violencia gráfica, nada dañino.`;

const PROTOCOLO = `RESPONDE SOLO CON UN OBJETO JSON VÁLIDO, sin texto fuera del JSON:
{
  "pensamiento": "una frase corta de lo que vas a hacer (se muestra al operador mientras trabajas)",
  "acciones": [
    {"tipo":"ir","texto":"nombre del lugar, tal como lo diría el operador"},
    {"tipo":"buscar","texto":"términos a buscar en la casa"},
    {"tipo":"explicar","texto":"nombre del lugar que debe explicarse"},
    {"tipo":"crear","artefacto":"documento|plan|tabla|codigo|lista|informe","titulo":"título corto","contenido":"markdown completo, útil de verdad"},
    {"tipo":"recordar","dato":"algo que el operador quiere que recuerdes"}
  ],
  "respuesta": "lo que le dices al operador (2 a 6 frases; si creas algo, dilo y di para qué sirve; si hay enlaces, no los repitas en texto: se pintan solos)"
}
Usa "acciones": [] si no necesitas nada. Usa "ir" SIEMPRE que el operador pida ir, ver, abrir o pregunte dónde está algo. Usa "explicar" si pregunta qué es un sitio o qué hay en él. No pidas permiso para crear: si te lo piden, crea.
Ejemplo: operador «llévame al mapa y hazme un plan de tres pasos para mirar Ucrania» →
{"pensamiento":"Resuelvo el mapa y escribo el plan","acciones":[{"tipo":"ir","texto":"mapa"},{"tipo":"crear","artefacto":"plan","titulo":"Tres pasos para mirar Ucrania","contenido":"## Paso 1\\n…"}],"respuesta":"Te llevo al mapa. Te dejo el plan al lado, editable."}`;

function contextoActual(p: PeticionMente, candidatos: Hallazgo[], destino: Hallazgo | null): string {
  const tramos: string[] = [];
  if (p.ruta) {
    const area = areaDeRuta(p.ruta);
    tramos.push(`DÓNDE ESTÁ EL OPERADOR AHORA: ${p.ruta} (área: ${area.nombre}).`);
  }
  tramos.push(`PULSO: ${pulsoActual()} · pensamiento del instante: "${pensamientoMente(pulsoActual())}"`);
  if (p.memoria?.length) tramos.push(`LO QUE RECUERDAS DE ÉL: ${p.memoria.slice(-8).join(" · ")}`);
  if (destino) tramos.push(`DESTINO QUE ENCAJA CON LO QUE PIDE: ${destino.n} → ${destino.r} (área ${destino.area}).`);
  if (candidatos.length)
    tramos.push(
      "LUGARES DE LA CASA QUE PODRÍAN SERVIR:\n" +
        candidatos
          .slice(0, 5)
          .map((c) => `· ${c.n} → ${c.r} (${c.tipo}, área ${c.area})`)
          .join("\n")
    );
  const hist = (p.historial ?? []).slice(-6);
  if (hist.length)
    tramos.push(
      "CONVERSACIÓN PREVIA (la última línea es la última palabra del operador):\n" +
        hist.map((m) => `${m.rol === "operador" ? "OPERADOR" : "TÚ"}: ${m.texto.slice(0, 400)}`).join("\n")
    );
  tramos.push(`MENSAJE DEL OPERADOR: ${p.mensaje}`);
  return tramos.join("\n\n");
}

// ── Acciones ──────────────────────────────────────────────────────────────

type Accion =
  | { tipo: "ir"; texto: string }
  | { tipo: "buscar"; texto: string }
  | { tipo: "explicar"; texto: string }
  | { tipo: "crear"; artefacto?: string; titulo?: string; contenido?: string }
  | { tipo: "recordar"; dato: string };

const TIPOS_ARTEFACTO: TipoArtefacto[] = ["documento", "plan", "tabla", "codigo", "lista", "informe"];

function idDe(titulo: string, contenido: string): string {
  let h = 0;
  const base = `${titulo}|${contenido.slice(0, 200)}|${Date.now()}`;
  for (let i = 0; i < base.length; i++) h = (h * 31 + base.charCodeAt(i)) | 0;
  return `art-${Math.abs(h).toString(36)}`;
}

function limpio(v: unknown, max: number): string {
  return String(v ?? "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, max);
}

/** Saca las acciones del JSON del modelo, saneadas y acotadas. */
function leerAcciones(json: Record<string, unknown> | null): Accion[] {
  if (!json || !Array.isArray(json.acciones)) return [];
  const salida: Accion[] = [];
  for (const bruta of json.acciones.slice(0, 4)) {
    if (!bruta || typeof bruta !== "object") continue;
    const a = bruta as Record<string, unknown>;
    const tipo = limpio(a.tipo, 20);
    if (tipo === "ir" || tipo === "buscar" || tipo === "explicar") {
      const texto = limpio(a.texto, 160);
      if (texto) salida.push({ tipo, texto } as Accion);
    } else if (tipo === "crear") {
      const contenido = limpio(a.contenido, 12_000);
      if (!contenido) continue;
      const artefacto = limpio(a.artefacto, 20) as TipoArtefacto;
      salida.push({
        tipo: "crear",
        artefacto: TIPOS_ARTEFACTO.includes(artefacto) ? artefacto : "documento",
        titulo: limpio(a.titulo, 120) || "Documento de LA MENTE",
        contenido,
      });
    } else if (tipo === "recordar") {
      const dato = limpio(a.dato, 240);
      if (dato) salida.push({ tipo: "recordar", dato });
    }
  }
  return salida;
}

type Producto = {
  enlaces: Enlace[];
  artefactos: Artefacto[];
  recuerdos: string[];
  /** material para la segunda llamada: resultados reales de la casa */
  material: string;
  huboConsulta: boolean;
};

function ejecutar(acciones: Accion[], previos: { enlaces: Enlace[]; artefactos: Artefacto[] }): Producto {
  const enlaces = [...previos.enlaces];
  const artefactos = [...previos.artefactos];
  const recuerdos: string[] = [];
  const bloques: string[] = [];
  let huboConsulta = false;

  const meter = (h: Hallazgo, porque: string) => {
    if (enlaces.some((e) => e.ruta === h.r)) return;
    enlaces.push({ nombre: h.n, ruta: h.r, area: h.area, porque: h.que ? h.que.slice(0, 90) : porque });
  };

  for (const accion of acciones) {
    if (accion.tipo === "ir") {
      const h = resolverDestino(accion.texto);
      huboConsulta = true;
      if (h) {
        meter(h, "es el lugar que pediste");
        bloques.push(`IR: "${accion.texto}" → ${h.n} en ${h.r} (área ${h.area}). Llévalo allí en tu respuesta.`);
      } else {
        const otros = buscarEnCasa(accion.texto, 3);
        otros.forEach((o) => meter(o, "se parece a lo que pediste"));
        bloques.push(
          `IR: no hay un lugar llamado "${accion.texto}". ${
            otros.length ? `Lo más parecido: ${otros.map((o) => `${o.n} (${o.r})`).join(", ")}.` : "Dilo con honestidad y ofrece buscar."
          }`
        );
      }
    } else if (accion.tipo === "buscar") {
      const hallados = buscarEnCasa(accion.texto, 5);
      huboConsulta = true;
      hallados.forEach((h) => meter(h, "aparece en la casa"));
      bloques.push(
        `BUSCAR "${accion.texto}": ${
          hallados.length ? hallados.map((h) => `${h.n} (${h.r}, ${h.tipo}, área ${h.area})`).join(" · ") : "sin resultados en la casa."
        }`
      );
    } else if (accion.tipo === "explicar") {
      const h = resolverDestino(accion.texto) ?? buscarEnCasa(accion.texto, 1)[0] ?? null;
      huboConsulta = true;
      if (h) {
        // La explicación sale del catálogo, no de la imaginación: qué es, qué
        // hay dentro y cómo se llega.
        const dentro = h.tipo === "area" || h.tipo === "modulo" ? buscarEnCasa(`${h.n}`, 4).filter((x) => x.r !== h.r) : [];
        meter(h, "es lo que has preguntado");
        bloques.push(
          `EXPLICAR "${accion.texto}": ${h.n} (${h.r}) · tipo ${h.tipo} · área ${h.area}. ` +
            `${h.que ?? "Sin descripción en el catálogo."}` +
            (dentro.length ? ` Cerca de: ${dentro.map((d) => `${d.n} (${d.r})`).join(", ")}.` : "")
        );
      } else {
        bloques.push(`EXPLICAR "${accion.texto}": no existe ese lugar en la casa. Dilo y ofrece buscar.`);
      }
    } else if (accion.tipo === "crear") {
      const artefacto: Artefacto = {
        id: idDe(accion.titulo ?? "", accion.contenido ?? ""),
        tipo: (accion.artefacto as TipoArtefacto) ?? "documento",
        titulo: accion.titulo ?? "Documento de LA MENTE",
        contenido: accion.contenido ?? "",
        creado: Date.now(),
      };
      artefactos.push(artefacto);
      bloques.push(`CREADO: «${artefacto.titulo}» (${artefacto.tipo}, ${artefacto.contenido.length} caracteres). Ya está guardado; dilo.`);
    } else if (accion.tipo === "recordar") {
      recuerdos.push(accion.dato);
      bloques.push(`RECORDARÁS: ${accion.dato}`);
    }
  }

  return { enlaces: enlaces.slice(0, 5), artefactos, recuerdos, material: bloques.join("\n"), huboConsulta };
}

// ── Modo casa: cuando no hay modelo, la mente sigue sirviendo ─────────────

const PLANTILLAS: Record<TipoArtefacto, (tema: string) => string> = {
  documento: (t) => `# ${t}\n\n## Qué es\n(una frase que lo defina sin adornos)\n\n## Puntos\n1. \n2. \n3. \n\n## Qué falta para cerrarlo\n- \n`,
  plan: (t) => `# Plan: ${t}\n\n## Objetivo\n(qué queda resuelto al terminar)\n\n## Pasos\n1. **Primero** — \n2. **Después** — \n3. **Al final** — \n\n## Cómo sabrás que funcionó\n- \n`,
  tabla: (t) => `# ${t}\n\n| # | Dato | Fuente | Fecha |\n|---|---|---|---|\n| 1 |  |  |  |\n| 2 |  |  |  |\n`,
  codigo: (t) => `# ${t}\n\n\`\`\`ts\n// TODO: el esqueleto está; falta la lógica\n\`\`\`\n`,
  lista: (t) => `# ${t}\n\n- [ ] \n- [ ] \n- [ ] \n`,
  informe: (t) => `# Informe: ${t}\n\n## Resumen\n\n## Hechos\n\n## Interpretación\n\n## Qué vigilar\n- \n`,
};

/**
 * v431.0 · ¿ES UNA ORDEN DE IR? — se decide sin modelo, en el servidor, para que
 * «llévame al mapa» lleve de verdad y no se quede en una lista de enlaces.
 * Solo cuentan los imperativos y los deseos explícitos; las preguntas no.
 */
export function pideIr(texto: string): boolean {
  const t = llano(texto).trim();
  return /^(oye[ ,]+|mente[ ,]+|la mente[ ,]+)?(llevame|llevanos|vamos|abre|abreme|abrir|muestrame|muestra|ensename|sacame|saca|ir a|ir al|quiero ir|quiero ver|ponme)/.test(t);
}

/** ¿Pide crear algo? Se detecta sin modelo, para no dejarle la mano vacía. */
export function pideCrear(texto: string): TipoArtefacto | null {
  // sin acentos: «escríbeme» tiene que encontrar «escribeme»
  const t = llano(texto);
  if (!/(crea|crear|creame|escribeme|escribe|hazme|haz|genera|redacta|disena|monta|arma|prepara)/.test(t)) return null;
  if (/\bplan\b|pasos|hoja de ruta|estrategia/.test(t)) return "plan";
  if (/tabla|comparativa|cuadro/.test(t)) return "tabla";
  if (/codigo|funcion|script|componente/.test(t)) return "codigo";
  if (/lista|checklist|pendientes/.test(t)) return "lista";
  if (/informe|analisis|expediente/.test(t)) return "informe";
  return "documento";
}

function tituloDeTema(texto: string): string {
  // Solo se quita la ORDEN del principio; las preposiciones del medio se
  // quedan, porque son las que hacen legible el título.
  const limpioTxt = texto
    .replace(/^\s*(oye|mente|la mente)[,:]?\s*/i, "")
    .replace(/^\s*(llevame|lleva|ir|ve|abre|entra|muestrame|muestra)\b[^,.;]*[,.;]\s*/i, "")
    .replace(/^\s*(crea|crear|creame|escribeme|escribe|hazme|haz|genera|redacta|disena|monta|arma|prepara)\b\s*/i, "")
    .replace(/^\s*(me\s+)?(un|una)\s+/i, "")
    .replace(/^\s*(plan|documento|tabla|informe|lista|codigo|borrador)\s+(de|para|sobre|con)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
  const base = limpioTxt.slice(0, 70) || "Documento";
  return `${base.charAt(0).toUpperCase()}${base.slice(1)}`;
}

function respuestaCasa(p: PeticionMente, enlaces: Enlace[], hallazgos: Hallazgo[], artefactos: Artefacto[]): string {
  const trozos: string[] = [];
  if (enlaces.length) {
    const primero = enlaces[0];
    trozos.push(`Lo tienes en ${primero.nombre} (${primero.ruta}). Te lo dejo abajo para entrar de un toque.`);
  }
  if (hallazgos.length > 1) {
    trozos.push(`También encaja: ${hallazgos.slice(1, 4).map((h) => h.n).join(", ")}.`);
  }
  if (artefactos.length) {
    trozos.push(`Te he dejado «${artefactos[0].titulo}» como esqueleto editable: el contenido lo cierras tú o me lo pides por partes.`);
  }
  if (!trozos.length) {
    const area = p.ruta ? areaDeRuta(p.ruta) : null;
    trozos.push(
      "Ahora mismo estoy en modo casa: sin conexión al núcleo de lenguaje, respondo con lo que la casa sabe de verdad —sus rutas, sus áreas y sus salas—." +
        (area ? ` Estás en ${area.nombre}.` : "")
    );
    trozos.push("Pídeme «llévame a …» o «dónde veo …» y te llevo sin adivinar. Para conversación abierta hace falta el núcleo encendido.");
  }
  return trozos.join(" ");
}

// ── El ciclo completo ─────────────────────────────────────────────────────

export async function hablarConMente(p: PeticionMente): Promise<RespuestaMente> {
  const comienzo = Date.now();
  const presupuesto = Math.min(55_000, Math.max(8_000, p.presupuestoMs ?? 45_000));
  const pasos: Paso[] = [];
  const paso = (etiqueta: string) => {
    const item = { etiqueta, ms: Date.now() - comienzo };
    pasos.push(item);
    try {
      p.onPaso?.(item);
    } catch {
      /* la interfaz no debe romper el motor */
    }
  };

  const mensaje = limpio(p.mensaje, 1_500);
  if (!mensaje) {
    return { respuesta: "Escríbeme algo y me pongo.", dirigir: false, enlaces: [], artefactos: [], recuerdos: [], ia: false, motor: "casa", pasos, ms: 0 };
  }

  paso("leyendo la casa");
  const candidatos = buscarEnCasa(mensaje, 6);
  const destino = resolverDestino(mensaje);

  // Lo que la casa sabe SIN modelo: enlaces y (si procede) un artefacto base.
  const enlacesBase: Enlace[] = [];
  if (destino) enlacesBase.push({ nombre: destino.n, ruta: destino.r, area: destino.area, porque: "es el lugar que pediste" });
  for (const c of candidatos) {
    if (enlacesBase.length >= 3) break;
    if (!enlacesBase.some((e) => e.ruta === c.r)) enlacesBase.push({ nombre: c.n, ruta: c.r, area: c.area, porque: c.porque });
  }
  const artefactosBase: Artefacto[] = [];
  const tipoPedido = pideCrear(mensaje);
  if (tipoPedido) {
    const titulo = tituloDeTema(mensaje);
    artefactosBase.push({
      id: idDe(titulo, tipoPedido),
      tipo: tipoPedido,
      titulo,
      contenido: PLANTILLAS[tipoPedido](titulo),
      creado: Date.now(),
    });
  }

  // ── Llamada 1: el plan del modelo ──
  paso("pensando");
  const sistema = `${IDENTIDAD}\n\n${mapaParaElModelo()}\n\n${PROTOCOLO}`;
  const user1 = contextoActual(p, candidatos, destino);
  let json: Record<string, unknown> | null = null;
  let crudo1 = "";
  const margen1 = Math.min(22_000, presupuesto - (Date.now() - comienzo) - 8_000);
  if (margen1 > 3_000) {
    try {
      crudo1 = await iaParalela(sistema, user1, margen1);
      json = crudo1 ? primerJSON(crudo1) : null;
    } catch {
      json = null;
    }
  }

  const acciones = leerAcciones(json);
  const pensamiento = json ? limpio(json.pensamiento, 160) : "";
  if (pensamiento) paso(pensamiento);

  // ── Ejecución de acciones contra la casa real ──
  const producto = ejecutar(acciones, { enlaces: enlacesBase, artefactos: [] });
  // El esqueleto determinista solo entra si el modelo no creó nada: nunca dos
  // artefactos para la misma petición.
  if (!producto.artefactos.length && artefactosBase.length) producto.artefactos = artefactosBase;
  if (producto.huboConsulta) paso("encontrando el sitio");
  if (producto.artefactos.length) paso("creando lo que pediste");

  let respuesta = json ? limpio(json.respuesta, 2_000) : "";
  // Un modelo puede contestar bien en prosa y no saber cumplir el protocolo
  // JSON. Antes eso se tiraba a la basura y la mente «no había respondido»
  // teniendo una respuesta delante: se acepta el texto tal cual.
  if (!respuesta && !json && crudo1) {
    const texto = limpio(crudo1.replace(/^\s*```[a-z]*\s*/i, "").replace(/```\s*$/, ""), 2_000);
    if (texto.length > 40) respuesta = texto;
  }
  let ia = Boolean((json || crudo1) && (respuesta || acciones.length));

  // ── Llamada 2: si hubo consultas y la primera respuesta es floja, se cierra
  //    el círculo con los resultados delante (una sola vez: sin bucles) ──
  if (producto.huboConsulta && producto.material) {
    const margen2 = presupuesto - (Date.now() - comienzo) - 4_000;
    if (margen2 > 5_000) {
      paso("cerrando la respuesta");
      try {
        const raw2 = await iaParalela(
          `${IDENTIDAD}\n\n${PROTOCOLO}`,
          `${contextoActual(p, candidatos, destino)}\n\nRESULTADOS REALES DE LA CASA (ya ejecutados, no los repitas como acciones):\n${producto.material}\n\nEscribe ahora la respuesta final al operador. Si hay enlaces, no repitas sus rutas: la interfaz las pinta. Máximo 6 frases.`,
          margen2
        );
        const json2 = raw2 ? primerJSON(raw2) : null;
        const final2 = json2 ? limpio(json2.respuesta, 2_000) : limpio(raw2, 2_000);
        if (final2 && final2.length > 20) {
          respuesta = final2;
          ia = true;
        }
      } catch {
        /* se queda la respuesta de la primera pasada */
      }
    }
  }

  if (!respuesta) {
    respuesta = respuestaCasa(p, producto.enlaces, candidatos, producto.artefactos);
    ia = false;
  }

  paso("listo");
  return {
    respuesta,
    // Solo dirige si la orden fue explícita y hay una puerta que abrir.
    dirigir: pideIr(p.mensaje) && producto.enlaces.length > 0,
    enlaces: producto.enlaces,
    artefactos: producto.artefactos,
    recuerdos: producto.recuerdos,
    ia,
    motor: ia ? "nube" : "casa",
    pasos,
    ms: Date.now() - comienzo,
  };
}

export type { Hallazgo };
