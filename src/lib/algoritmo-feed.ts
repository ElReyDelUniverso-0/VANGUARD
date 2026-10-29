// ============================================================
// v191.0 EL ALGORITMO — el cerebro del feed PARA TI.
// Mandato del Dueño: «haz que Vanguard tenga un algoritmo como TikTok».
// Hasta hoy el feed ordenaba por fecha (sort createdAt) — un cronómetro,
// no un algoritmo. Ahora cada tarjeta se puntúa como en TikTok:
//
//   PUNTUACIÓN = ENGAÑO + FRESCURA + AFINIDAD − VISTO_HACE_POCO
//
//   · ENGAÑO  — log(1+likes)·1.6: los gustos pesan, pero con rendimiento
//               decreciente (un viral no aplasta todo lo demás).
//   · FRESCURA — decaimiento exponencial con vida media de 10 h: lo nuevo
//               manda, lo viejo se apaga suave (nunca muere del todo).
//   · AFINIDAD — el perfil del espectador (localStorage vg191-perfil):
//               cada tipo que miras/te gusta crece de peso (+0.15, tope 3)
//               y cada autor al que le das like también (+0.2, tope 2).
//   · VISTO   — lo que viste hace <8 h se penaliza −1.8 (no repetir).
//
// DIVERSIDAD: tras ordenar, un pase de entrelazado evita 3 tarjetas del
// mismo tipo seguidas — como el «For You» real, que mezcla para no hartar.
//
// HONESTIDAD RADICAL: cada tarjeta explica POR QUÉ está (chip «porque
// miras MEMES» / «porque te gusta @autor» / «porque es nuevo») — el
// algoritmo no es una caja negra, es un comando que da la cara.
// Todo local (localStorage), cero servidor, cero datos personales.
// ============================================================

export type TipoFeed = "video" | "musica" | "foto" | "meme" | "tv" | "pulso" | "vivo";

export interface TarjetaFeed {
  id: string;
  tipo: TipoFeed;
  titulo: string;
  autor: string;
  ts: number; // epoch ms de creación
  likes: number;
  bola?: string; // código de countryball del autor
  datos?: Record<string, unknown>; // payload específico del tipo
}

export interface PerfilFeed {
  pesoTipo: Record<string, number>;
  pesoAutor: Record<string, number>;
  vistas: number;
}

const K_PERFIL = "vg191-perfil";
const K_VISTAS = "vg191-vistas";
const MAX_VISTAS = 400;

// ---------- PERFIL (afinidad aprendida, todo en localStorage) ----------

export function leerPerfil(): PerfilFeed {
  try {
    const raw = localStorage.getItem(K_PERFIL);
    if (raw) {
      const p = JSON.parse(raw) as PerfilFeed;
      return {
        pesoTipo: p.pesoTipo ?? {},
        pesoAutor: p.pesoAutor ?? {},
        vistas: p.vistas ?? 0,
      };
    }
  } catch { /* perfil nuevo */ }
  return { pesoTipo: {}, pesoAutor: {}, vistas: 0 };
}

function guardarPerfil(p: PerfilFeed): void {
  try { localStorage.setItem(K_PERFIL, JSON.stringify(p)); } catch { /* noop */ }
}

const crecer = (n: number | undefined, delta: number, tope: number): number =>
  Math.min(tope, Math.min(1, Math.max(0.2, n ?? 1)) + delta);

/** El espectador MIRÓ una tarjeta (activa ≥60% en pantalla). */
export function notaVista(tipo: TipoFeed, autor: string): void {
  const p = leerPerfil();
  p.vistas += 1;
  p.pesoTipo[tipo] = Math.min(3, (p.pesoTipo[tipo] ?? 1) + 0.05);
  guardarPerfil(p);
}

/** El espectador dio LIKE — la señal más fuerte del algoritmo. */
export function notaLike(tipo: TipoFeed, autor: string): void {
  const p = leerPerfil();
  p.pesoTipo[tipo] = Math.min(3, (p.pesoTipo[tipo] ?? 1) + 0.15);
  p.pesoAutor[autor] = Math.min(2, (p.pesoAutor[autor] ?? 0.5) + 0.2);
  guardarPerfil(p);
}

/** El espectador abrió comentarios — interés medio. */
export function notaComentario(tipo: TipoFeed): void {
  const p = leerPerfil();
  p.pesoTipo[tipo] = Math.min(3, (p.pesoTipo[tipo] ?? 1) + 0.1);
  guardarPerfil(p);
}

// ---------- VISTAS RECIENTES (no repetir lo recién visto) ----------

export function marcarVista(id: string): void {
  try {
    const raw = localStorage.getItem(K_VISTAS);
    const m = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    m[id] = Date.now();
    const podado = Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .slice(0, MAX_VISTAS);
    localStorage.setItem(K_VISTAS, JSON.stringify(Object.fromEntries(podado)));
  } catch { /* noop */ }
}

function vistoHace(id: string, ahora: number): number | null {
  try {
    const raw = localStorage.getItem(K_VISTAS);
    const m = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    const t = m[id];
    return t ? ahora - t : null;
  } catch { return null; }
}

// ---------- PUNTUACIÓN ----------

export interface TarjetaPuntuada {
  tarjeta: TarjetaFeed;
  score: number;
  porQue: string;
}

export function puntuar(t: TarjetaFeed, perfil: PerfilFeed, ahora: number): TarjetaPuntuada {
  const horas = Math.max(0, (ahora - t.ts) / 3_600_000);
  const engano = Math.log10(1 + Math.max(0, t.likes)) * 1.6;
  const frescura = Math.pow(0.5, horas / 10) * 2.2;
  const afinTipo = Math.min(3, perfil.pesoTipo[t.tipo] ?? 1);
  const afinAutor = Math.min(1.5, (perfil.pesoAutor[t.autor] ?? 0.5) * 0.75);
  const visto = vistoHace(t.id, ahora);
  const penalVisto = visto !== null && visto < 8 * 3_600_000 ? -1.8 : 0;
  // los PULSOS del Productor y los canales VIVO llevan base propia para
  // mezclarse con dignidad aunque no tengan likes todavía
  const base = t.tipo === "pulso" ? 1.2 : t.tipo === "vivo" ? 1.6 : 0;

  const score = base + engano + frescura + afinTipo + afinAutor + penalVisto;

  // explicación honesta: ¿por qué está esta tarjeta aquí?
  let porQue: string;
  if (t.tipo === "vivo") porQue = "EN VIVO AHORA MISMO";
  else if (t.tipo === "pulso") porQue = "VANGUARD LO PRODUJO PARA TI";
  else if (visto !== null && visto < 8 * 3_600_000) porQue = "LO VISTE HACE POCO";
  else if ((perfil.pesoAutor[t.autor] ?? 0) > 0.9) porQue = `PORQUE TE GUSTA @${t.autor.toUpperCase()}`;
  else if (afinTipo >= 1.45) porQue = `PORQUE MIRAS ${etiquetaTipo(t.tipo)}`;
  else if (horas < 2) porQue = "RECIÉN LLEGADO AL MUNDO";
  else if (t.likes >= 8) porQue = `VIRAL · ${t.likes} LIKES`;
  else porQue = "PARA DIVERSIFICAR TU FEED";

  return { tarjeta: t, score, porQue };
}

function etiquetaTipo(tipo: TipoFeed): string {
  switch (tipo) {
    case "video": return "VIDEOS";
    case "musica": return "MÚSICA";
    case "foto": return "FOTOS";
    case "meme": return "MEMES";
    case "tv": return "TV";
    case "pulso": return "PULSOS";
    case "vivo": return "EN VIVO";
  }
}

// ---------- ORDEN + DIVERSIDAD ----------

/** Ordena por score y entrelaza: jamás 3 tarjetas del mismo tipo seguidas. */
export function ordenarAlgoritmo(
  tarjetas: TarjetaFeed[],
  perfil: PerfilFeed,
  ahora: number,
): TarjetaPuntuada[] {
  const puntuadas = tarjetas.map((t) => puntuar(t, perfil, ahora));
  puntuadas.sort((a, b) => b.score - a.score);

  const salida: TarjetaPuntuada[] = [];
  const resto = [...puntuadas];
  while (resto.length > 0) {
    let elegido = 0;
    if (salida.length >= 2) {
      const t1 = salida[salida.length - 1].tarjeta.tipo;
      const t2 = salida[salida.length - 2].tarjeta.tipo;
      if (t1 === t2) {
        const proximo = resto.findIndex((p) => p.tarjeta.tipo !== t1);
        if (proximo > -1) elegido = proximo;
      }
    }
    salida.push(resto.splice(elegido, 1)[0]);
  }
  return salida;
}

/** Orden cronológico puro (pestaña RECIENTE). */
export function ordenarReciente(tarjetas: TarjetaFeed[]): TarjetaPuntuada[] {
  return [...tarjetas]
    .sort((a, b) => b.ts - a.ts)
    .map((tarjeta) => ({ tarjeta, score: 0, porQue: "LO MÁS NUEVO PRIMERO" }));
}
