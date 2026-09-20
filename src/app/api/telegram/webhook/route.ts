import { NextResponse } from "next/server";

// ============================================================
// /api/telegram/webhook — receptor de updates del bot de Telegram
// Configúralo con: https://api.telegram.org/bot<TOKEN>/setWebhook?url=<TU-DOMINIO>/api/telegram/webhook
// ============================================================

export async function POST(req: Request) {
  try {
    const update = (await req.json()) as {
      message?: { chat?: { id?: number; title?: string }; text?: string; from?: { first_name?: string } };
    };
    const text = update.message?.text ?? "";
    const chatId = update.message?.chat?.id;
    const firstName = update.message?.from?.first_name ?? "operador";
    const token = process.env.TELEGRAM_BOT_TOKEN;

    const reply = (t: string) =>
      token && chatId
        ? fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: chatId, text: t, parse_mode: "HTML" }),
          })
        : Promise.resolve(null);

    if (text.startsWith("/start")) {
      await reply(
        `🎖️ <b>VANGUARD · BOT DE GUERRA</b>\n\nHola ${firstName}, soy el bot de la plataforma de conflictos #1 en español.\n\n/bot — conexión con la web\n/alertas — activar alertas del grupo\n/resumen — resumen del día\n/incidentes — últimos incidentes documentados\n/ayuda — comandos`
      );
    } else if (text.startsWith("/ayuda")) {
      await reply("📋 <b>Comandos</b>\n/alertas · /resumen · /incidentes · /memorial · /ayuda");
    } else if (text.startsWith("/alertas")) {
      await reply("🔔 <b>Alertas activadas</b> para este grupo: incidentes, memorial, denuncias y directos.");
    } else if (text.startsWith("/incidentes")) {
      await reply("🚨 <b>Últimos incidentes documentados</b>\n· Frente de Pokrovsk — bombardeos con FAB-500 guiadas\n· El Fasher, Sudán — asedio + hambruna IPC fase 5\n· Sagaing, Myanmar — ataque aéreo a escuela\n\nFuentes: ACLED · ONU · ISW");
    } else if (text.startsWith("/resumen")) {
      await reply("📊 <b>Resumen del día</b>\n· Conflictos activos: 14+\n· Contribuidores en rank: consulta /contribuidores en la web\n· Directos: sala EN VIVO mundial abierta\n· Memorial: enciende tu vela en la web 🕯️");
    } else {
      await reply("✅ VANGUARD bot operativo. Usa /ayuda para ver los comandos.");
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // Telegram reintenta si falla; responder siempre 200
  }
}
