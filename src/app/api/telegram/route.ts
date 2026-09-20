import { NextResponse } from "next/server";

// ============================================================
// /api/telegram — puente del BOT DE TELEGRAM de VANGUARD
// El usuario crea su bot con @BotFather, pone el token en la env
// TELEGRAM_BOT_TOKEN y añade el bot a su grupo. Este endpoint
// envía alertas al grupo (chatId = TELEGRAM_CHAT_ID).
// ============================================================

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  let botName: string | null = null;

  if (token) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/getMe`, {
        cache: "no-store",
        signal: AbortSignal.timeout(6000),
      });
      const data = (await res.json()) as { ok?: boolean; result?: { username?: string } };
      if (data.ok && data.result?.username) botName = data.result.username;
    } catch {
      // token presente pero Telegram no accesible desde el sandbox
    }
  }

  return NextResponse.json({
    configured: !!token,
    chatConfigured: !!chatId,
    botName,
    webappHint: "Configura TELEGRAM_BOT_TOKEN y TELEGRAM_CHAT_ID en el entorno del servidor",
    commands: [
      { cmd: "/alertas", desc: "Activa/desactiva alertas del grupo" },
      { cmd: "/resumen", desc: "Resumen del día: conflictos, contribuidores y directos" },
      { cmd: "/incidentes", desc: "Últimos incidentes documentados" },
      { cmd: "/memorial", desc: "Velas encendidas y homenajes" },
      { cmd: "/ayuda", desc: "Lista de comandos" },
    ],
  });
}

// POST /api/telegram — enviar una alerta al grupo vinculado
// { text } o { kind: "incidente"|"memorial"|"denuncia", title, detail, evidenceUrl? }
export async function POST(req: Request) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
      return NextResponse.json(
        { error: "Bot no configurado: faltan TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID" },
        { status: 503 }
      );
    }
    const body = await req.json();
    let text = String(body.text ?? "");
    if (!text && body.kind) {
      const kind = String(body.kind);
      const title = String(body.title ?? "").slice(0, 120);
      const detail = String(body.detail ?? "").slice(0, 600);
      const loc = String(body.location ?? "");
      const ev = String(body.evidenceUrl ?? "");
      const tags: Record<string, string> = {
        incidente: "🚨 INCIDENTE DOCUMENTADO",
        memorial: "🕯️ MEMORIAL · HOMENAJE",
        denuncia: "⚖️ NUEVA DENUNCIA EN FOROS",
        contribuidor: "📰 CONTRIBUIDOR DESTACADO",
      };
      text = [tags[kind] ?? "📢 VANGUARD", title, loc ? `📍 ${loc}` : "", detail, ev ? `🔗 ${ev}` : ""]
        .filter(Boolean)
        .join("\n");
      text += "\n\n— Enviado desde VANGUARD · Verdad Cruda";
    }
    if (!text.trim()) {
      return NextResponse.json({ error: "Texto vacío" }, { status: 400 });
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: text.slice(0, 3900), parse_mode: "HTML", disable_web_page_preview: false }),
      signal: AbortSignal.timeout(8000),
    });
    const data = (await res.json()) as { ok?: boolean; description?: string };
    if (!data.ok) {
      return NextResponse.json({ error: `Telegram: ${data.description ?? "error desconocido"}` }, { status: 502 });
    }
    return NextResponse.json({ ok: true, sent: true });
  } catch {
    return NextResponse.json({ error: "No se pudo contactar la API de Telegram desde el servidor" }, { status: 502 });
  }
}
