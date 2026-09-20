#!/usr/bin/env node
// ============================================================
// VANGUARD v24 · BOT DE TELEGRAM STANDALONE (long polling)
// ------------------------------------------------------------
// 1) Crea tu bot con @BotFather en Telegram → obtén el TOKEN
// 2) Añade el bot a tu grupo y dale permiso de enviar mensajes
// 3) Obtén el chat_id del grupo (añade @RawDataBot al grupo o
//    visita https://api.telegram.org/bot<TOKEN>/getUpdates)
// 4) Ejecuta:  TELEGRAM_BOT_TOKEN=123:abc TELEGRAM_CHAT_ID=-100123456789 node scripts/telegram-bot.mjs
//    (o pon las variables en .env y usa bun run bot:telegram)
// ============================================================

const TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const CHAT_ID = process.env.TELEGRAM_CHAT_ID ?? "";

if (!TOKEN) {
  console.error("❌ Falta TELEGRAM_BOT_TOKEN. Créalo con @BotFather y exporta la variable.");
  process.exit(1);
}

const API = `https://api.telegram.org/bot${TOKEN}`;

async function tg(method, body) {
  const res = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

const send = (text) => tg("sendMessage", { chat_id: CHAT_ID, text, parse_mode: "HTML" });

// ---- datos de demo que el bot empuja al grupo (cámbialos por tu API) ----
const INCIDENTS_DEMO = [
  "🚨 Frente de Pokrovsk (UA) — bombardeos con FAB-500 guiadas sobre evacuaciones",
  "🚨 El Fasher (SD) — asedio de RSF + hambruna IPC fase 5 confirmada",
  "🚨 Sagaing (MM) — ataque aéreo de la junta sobre escuela rural",
];
const MEMORIAL_DEMO = "🕯️ Viktoria Roshchyna (1996-2024), reportera ucraniana que murió bajo custodia. Enciende tu vela en VANGUARD → MEMORIAL.";

const HELP = [
  "🎖️ <b>VANGUARD · BOT DE CONFLICTOS</b>",
  "",
  "/start — bienvenida",
  "/alertas — activa las alertas diarias de este grupo",
  "/incidentes — últimos incidentes documentados",
  "/memorial — homenaje del día",
  "/resumen — resumen del día",
  "/ayuda — este mensaje",
].join("\n");

let alertsOn = {};

async function handle(msg) {
  const text = msg?.text ?? "";
  const chatId = msg?.chat?.id;
  const name = msg?.from?.first_name ?? "operador";
  if (!chatId) return;

  if (text.startsWith("/start")) {
    await send(`Hola <b>${name}</b> 👋 soy el bot de VANGUARD, la plataforma de conflictos #1 en español.\n\n${HELP}`);
  } else if (text.startsWith("/ayuda")) {
    await send(HELP);
  } else if (text.startsWith("/alertas")) {
    alertsOn[chatId] = !alertsOn[chatId];
    await send(alertsOn[chatId] ? "🔔 <b>Alertas activadas</b> para este grupo." : "🔕 Alertas desactivadas.");
  } else if (text.startsWith("/incidentes")) {
    await send(["🚨 <b>INCIDENTES DOCUMENTADOS (24h)</b>", "", ...INCIDENTS_DEMO, "", "Fuentes: ACLED · ONU · ISW"].join("\n"));
  } else if (text.startsWith("/memorial")) {
    await send(MEMORIAL_DEMO);
  } else if (text.startsWith("/resumen")) {
    await send(
      [
        "📊 <b>RESUMEN DEL DÍA · VANGUARD</b>",
        "· Conflictos activos monitorizados: 14+",
        "· Denuncias nuevas en foros: revisa /foros en la web",
        "· Directos: sala EN VIVO mundial abierta 24/7",
        MEMORIAL_DEMO,
      ].join("\n")
    );
  } else {
    await send("✅ Bot operativo. Usa /ayuda.");
  }
}

async function main() {
  let offset = 0;
  console.log("🤖 VANGUARD bot en marcha (long polling)…");
  if (CHAT_ID) {
    await send("🎖️ <b>VANGUARD bot conectado a este grupo.</b> Usa /ayuda para ver los comandos.");
  }
  for (;;) {
    try {
      const data = await tg("getUpdates", { offset, timeout: 25 });
      if (data.ok) {
        for (const u of data.result ?? []) {
          offset = u.update_id + 1;
          if (u.message) await handle(u.message);
        }
      }
    } catch (e) {
      console.error("poll error:", e?.message ?? e);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

main();
