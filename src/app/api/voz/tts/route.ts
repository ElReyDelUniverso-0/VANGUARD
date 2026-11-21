// ═══════════════════════════════════════════════════════════════════════════
// v432.2 · LA VOZ DE ESTUDIO — texto a voz neuronal, solo si hay clave
//
// El Dueño pidió «la voz de ChatGPT, súper realista». Una voz así NO se puede
// fabricar en el navegador: sale de un servicio neuronal que cuesta dinero y
// necesita una clave. Esta puerta la usa si existe; si no existe, lo dice con
// la verdad (501) y el orbe sigue con la mejor voz que tenga el aparato.
//
// LEY DE LA CASA: no se simula un proveedor. Sin clave no hay audio falso ni
// mensajes de «conectando…» eternos: hay un 501 claro y la casa responde con su
// propia boca (lib/voz/decir).
//
// CLAVES QUE ENTIENDE (la primera que exista):
//   OPENAI_API_KEY        → modelo gpt-4o-mini-tts, voz nova (la más natural)
//   ELEVENLABS_API_KEY    → eleven_multilingual_v2 (ELEVENLABS_VOZ opcional)
//
// USO:  POST /api/voz/tts  { "texto": "…", "voz": "nova" }
// 200 → audio/mpeg · 400 texto vacío · 501 sin clave · 502 el proveedor falló
// ═══════════════════════════════════════════════════════════════════════════

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const LIMITE = 700;

export async function GET() {
  const hayOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const hayEleven = Boolean(process.env.ELEVENLABS_API_KEY);
  return NextResponse.json({
    ok: hayOpenAI || hayEleven,
    proveedor: hayOpenAI ? "openai" : hayEleven ? "elevenlabs" : null,
    nota:
      hayOpenAI || hayEleven
        ? "Hay clave de voz neuronal: el orbe la usará antes que la voz del aparato."
        : "No hay clave de voz neuronal en este entorno. El orbe habla con la boca de la casa (la mejor voz instalada en el aparato). Para la voz de estudio hay que añadir OPENAI_API_KEY (o ELEVENLABS_API_KEY) en el proyecto.",
  });
}

export async function POST(peticion: Request) {
  let texto = "";
  let vozPedida = "";
  try {
    const cuerpo = (await peticion.json()) as { texto?: unknown; voz?: unknown };
    texto = typeof cuerpo.texto === "string" ? cuerpo.texto.slice(0, LIMITE).trim() : "";
    vozPedida = typeof cuerpo.voz === "string" ? cuerpo.voz.slice(0, 24) : "";
  } catch {
    return NextResponse.json({ ok: false, motivo: "Cuerpo inválido" }, { status: 400 });
  }
  if (!texto) return NextResponse.json({ ok: false, motivo: "Texto vacío" }, { status: 400 });

  const openai = process.env.OPENAI_API_KEY;
  if (openai) {
    try {
      const res = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: { Authorization: `Bearer ${openai}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini-tts",
          voice: vozPedida || "nova",
          input: texto,
          response_format: "mp3",
          instructions: "Habla en español neutro, con calma, frases cortas y pausas naturales. Tono sereno y seguro.",
        }),
      });
      if (!res.ok) {
        const detalle = await res.text().catch(() => "");
        return NextResponse.json({ ok: false, motivo: `OpenAI ${res.status}`, detalle: detalle.slice(0, 300) }, { status: 502 });
      }
      const audio = await res.arrayBuffer();
      return new NextResponse(audio, {
        status: 200,
        headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
      });
    } catch (e) {
      return NextResponse.json({ ok: false, motivo: `OpenAI no respondió: ${(e as Error).message}` }, { status: 502 });
    }
  }

  const eleven = process.env.ELEVENLABS_API_KEY;
  if (eleven) {
    const voz = process.env.ELEVENLABS_VOZ || voicePreferred(vozPedida) || "EXAVITQu4vr4xnSDxMaL";
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voz}`, {
        method: "POST",
        headers: { "xi-api-key": eleven, "Content-Type": "application/json", Accept: "audio/mpeg" },
        body: JSON.stringify({
          text: texto,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.1, use_speaker_boost: true },
        }),
      });
      if (!res.ok) {
        const detalle = await res.text().catch(() => "");
        return NextResponse.json({ ok: false, motivo: `ElevenLabs ${res.status}`, detalle: detalle.slice(0, 300) }, { status: 502 });
      }
      const audio = await res.arrayBuffer();
      return new NextResponse(audio, {
        status: 200,
        headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
      });
    } catch (e) {
      return NextResponse.json({ ok: false, motivo: `ElevenLabs no respondió: ${(e as Error).message}` }, { status: 502 });
    }
  }

  return NextResponse.json(
    {
      ok: false,
      motivo: "Sin clave de voz neuronal",
      como: "Añade OPENAI_API_KEY (voz de ChatGPT) o ELEVENLABS_API_KEY en las variables del proyecto. Mientras tanto el orbe usa la boca de la casa.",
    },
    { status: 501 },
  );
}

/** traduce los nombres de voz de ChatGPT a los de ElevenLabs, por si acaso */
function voicePreferred(voz: string): string {
  const mapa: Record<string, string> = {
    nova: "EXAVITQu4vr4xnSDxMaL",
    alloy: "21m00Tcm4TlvDq8ikWAM",
    shimmer: "ThT5KcBeYPX3keUQqHPh",
  };
  return mapa[voz] ?? "";
}
