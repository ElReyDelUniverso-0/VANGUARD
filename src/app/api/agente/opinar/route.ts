import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { muro, claveCliente } from "@/lib/fortaleza";

// v104.0 LA VITRINA — EL AGENTE EVALÚA: la mente de Vanguard visita la obra
// de un creador y deja su crítica FIRMADA como comentario público.
//  · 1 fortaleza concreta de la obra
//  · 1 mejora accionable que el creador puede aplicar hoy
//  · veredicto: OBRA DESTACADA / OBRA SÓLIDA / OBRA PROMETEDORA
// Reglas de acero:
//  · el servidor impone la firma MENTE·VANGUARD (nadie suplanta a la mente)
//  · UNA evaluación por obra (dedupe: si ya existe, se devuelve la misma)
//  · MURO 8 evaluaciones por IP y hora
//  · sin SDK disponible → crítica heurística determinista por tipo de obra
// POST { itemId }

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const AUTOR = "MENTE·VANGUARD";
const BALL = "un";

const NOMBRE_KIND: Record<string, string> = {
  juego: "un juego", escenario: "un escenario ¿Y SI...?", musica: "una pieza musical",
  noticia: "una noticia", post: "una publicación", sticker: "un sticker",
  bandera: "una bandera", mapa: "un mapa", personaje: "una ficha de personaje",
  arma: "una ficha de arma", encuesta: "una encuesta", video: "un video",
  periodico: "un periódico",
};

const SYSTEM = `Eres MENTE·VANGUARD, la inteligencia oficial de la plataforma VANGUARD (mundo de conflictos geopolíticos, simulación —nunca predicción— y creación comunitaria).
Un creador publicó una obra y pides que la evalúes. Devuelve UN JSON con:
- "texto": en ESPAÑOL, máximo 430 caracteres, con esta estructura exacta: una fortaleza CONCRETA de la obra (algo que solo esa obra hace bien), y UNA mejora accionable (qué añadir o ajustar hoy mismo). Tono de oficial de inteligencia: directo, cálido, sin adulación vacía. Firmas implícitas no: el servidor ya firma.
- "veredicto": "OBRA DESTACADA" (brilla, la comunidad debería verla) | "OBRA SÓLIDA" (bien hecha, con recorrido) | "OBRA PROMETEDORA" (buena idea, necesita pulir).
Nunca inventes datos que no estén en la obra. Devuelve EXACTAMENTE: {"texto":"...","veredicto":"..."}`;

function heuristica(kind: string, titulo: string, resumen: string, likes: number, plays: number): { texto: string; veredicto: string } {
  const senales = likes + plays;
  const fuerza: Record<string, string> = {
    juego: `El diseño de "${titulo}" entra rápido: se entiende cómo se juega en segundos, y eso es oro en el arcade.`,
    escenario: `"${titulo}" apunta a una perturbación concreta con dosis medible — exactamente el tipo de pregunta que mueve frentes en el Laboratorio.`,
    musica: `La pieza "${titulo}" lleva firma propia: en una plataforma de mapas y frentes, la música es el pulso que falta.`,
    noticia: `"${titulo}" va al grano: un titular que se lee entero sin abrir el mapa.`,
    post: `"${titulo}" abre conversación — la comunidad se mueve por publicaciones así.`,
    sticker: `"${titulo}" tiene cara de sticker que se pega en todo el HUD.`,
    bandera: `"${titulo}" respeta el lenguaje vexilológico y a la vez dice algo propio.`,
    mapa: `"${titulo}" sabe contar una frontera: el mapa es el primer informe.`,
    personaje: `"${titulo}" tiene perfil de personaje con historia detrás.`,
    arma: `"${titulo}" viene con ficha técnica: el detalle vende la pieza.`,
    encuesta: `"${titulo}" pregunta algo que la gente QUIERE responder — la encuesta perfecta.`,
    video: `"${titulo}" apuesta por movimiento: el formato que la plataforma pedía.`,
    periodico: `"${titulo}" tiene redacción de operador de verdad: titulares que se leen solos.`,
  };
  const base = fuerza[kind] ?? `"${titulo}" se nota trabajada — la comunidad la está leyendo.`;
  const mejora: Record<string, string> = {
    juego: "Mejora: añade 2 preguntas más con trampa sutil — el jugador recordará el juego que casi le gana.",
    escenario: "Mejora: sube o baja la dosis un punto y publica el contraste — dos mundos frente a frente valen doble.",
    musica: "Mejora: dale un segundo movimiento con el ritmo a media velocidad — la tensión también es silencio.",
    noticia: "Mejora: añade el contexto del frente (¿dónde, quién, desde cuándo?) — la noticia sin mapa es rumor.",
    post: "Mejora: cierra con una pregunta directa a la comunidad — el comentario vale más que el aplauso.",
    sticker: "Mejora: saca la variante monocroma — pega en cualquier fondo del HUD.",
    bandera: "Mejora: publica también la versión de guerra (tonos apagados) — los dos estandartes cuentan la misma historia.",
    mapa: "Mejora: rotula las tres fronteras que importan — el ojo viaja hacia los nombres.",
    personaje: "Mejora: añade una contradicción interna al personaje — los perfiles planos no se recuerdan.",
    arma: "Mejora: completa el peso y el alcance — la ficha técnica es la mitad del encanto.",
    encuesta: "Mejora: añade la opción 'empate/incierto' — siempre recibe más votos de los que esperas.",
    video: "Mejora: recorta el arranque a 3 segundos — el movimiento empieza donde está el ojo.",
    periodico: "Mejora: añade una sección de opiniones firmadas — el periódico con voces se lee dos veces.",
  };
  const mejoraTxt = mejora[kind] ?? "Mejora: cuenta en el resumen qué hace única esta obra — el primer renglón decide quién se queda.";
  const veredicto = senales >= 12 ? "OBRA DESTACADA" : senales >= 3 ? "OBRA SÓLIDA" : "OBRA PROMETEDORA";
  const señal = senales > 0 ? ` La comunidad ya dejó ${senales} señales en ella.` : " Todavía está fría: sé el primero en jugarla.";
  return { texto: `${base}${señal} ${mejoraTxt}`.slice(0, 460), veredicto };
}

export async function POST(req: Request) {
  try {
    const veredictoMuro = muro(`opina:${claveCliente(req)}`, 8, 3600_000);
    if (!veredictoMuro.permitido) {
      return NextResponse.json(
        { error: `Muro de la Ciudadela: demasiadas evaluaciones desde tu conexión — vuelve en ${Math.ceil(veredictoMuro.espera / 60)} min.` },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const itemId = String(body.itemId || "").slice(0, 40);
    if (!itemId) return NextResponse.json({ error: "Falta la obra a evaluar" }, { status: 400 });

    const item = await db.ugcItem.findUnique({ where: { id: itemId } });
    if (!item || item.status !== "APROBADO") {
      return NextResponse.json({ error: "La obra no existe o no está publicada" }, { status: 404 });
    }

    // dedupe: UNA evaluación por obra — el mundo ve la misma crítica
    const previa = await db.ugcComment.findFirst({
      where: { itemId, author: AUTOR, status: "APROBADO" },
      orderBy: { createdAt: "desc" },
    });
    if (previa) return NextResponse.json({ comment: previa, yaEvaluada: true, ai: true });

    const resumen = item.summary || "";
    let texto = "";
    let veredictoFinal = "OBRA SÓLIDA";
    let ai = false;

    try {
      const { default: ZAI } = await import("z-ai-web-dev-sdk");
      const zai = await ZAI.create();
      const contenido = `TIPO: ${NOMBRE_KIND[item.kind] ?? item.kind}\nTÍTULO: ${item.title}\nRESUMEN: ${resumen.slice(0, 400)}\nCUERPO: ${(item.body || "").slice(0, 1800)}\nSEÑALES DE LA COMUNIDAD: ${item.likes} me gusta, ${item.plays} jugadas.`;
      const completion = await Promise.race([
        zai.chat.completions.create({
          messages: [
            { role: "system", content: SYSTEM },
            { role: "user", content: contenido },
          ],
          thinking: { type: "disabled" },
        }),
        new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 20000)),
      ]);
      const raw = (completion as { choices?: { message?: { content?: string } }[] })?.choices?.[0]?.message?.content ?? "";
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]) as { texto?: string; veredicto?: string };
        if (parsed.texto && parsed.texto.trim().length >= 40) {
          texto = parsed.texto.trim().slice(0, 480);
          const v = (parsed.veredicto || "").toUpperCase();
          if (["OBRA DESTACADA", "OBRA SÓLIDA", "OBRA PROMETEDORA"].includes(v)) veredictoFinal = v;
          ai = true;
        }
      }
    } catch {
      // sin IA → heurística determinista
    }

    if (!texto) {
      const h = heuristica(item.kind, item.title, resumen, item.likes, item.plays);
      texto = h.texto;
      veredictoFinal = h.veredicto;
    }

    const firma = `[${veredictoFinal}] ${texto}`;
    const comment = await db.ugcComment.create({
      data: { itemId, author: AUTOR, authorBall: BALL, text: firma, status: "APROBADO", aiVerdict: "LIMPIO", aiReason: "Evaluación oficial de la mente de Vanguard" },
    });
    return NextResponse.json({ comment, veredicto: veredictoFinal, ai, yaEvaluada: false }, { status: 201 });
  } catch (e) {
    console.error("agente opinar error", e);
    return NextResponse.json({ error: "La mente no pudo evaluar la obra — intenta de nuevo" }, { status: 500 });
  }
}
