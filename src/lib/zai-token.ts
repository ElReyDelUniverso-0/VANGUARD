// ═══════════════════════════════════════════════════════════════════════════
// LA FUENTE ÚNICA DEL TOKEN — /lib/zai-token (complemento de la ley v204).
// El JWT de la gateway Z.ai vivía hardcodeado en TRES sitios a la vez
// (api/neurona/route.ts · lib/ia-gateway.ts · lib/zai-server.ts) — tres
// copias del mismo secreto que el Buscador de Llaves cazaba en cada corrida.
// La cura (deuda declarada en el worklog v362 y en SECURITY.md): UNA sola
// fuente. El token se lee PRIMERO del entorno (ZAI_TOKEN) y la reserva
// quemada queda SOLO aquí, una vez, mientras la rotación en Vercel cierra
// la deuda. Definida ZAI_TOKEN en el entorno, la reserva queda muerta.
// SOLO importar desde rutas API / componentes de servidor.
// ═══════════════════════════════════════════════════════════════════════════

export const ZAI_TOKEN = process.env.ZAI_TOKEN ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYTc3ZDY0MDUtNjY0OS00ZGM0LWJhNTYtMDhkZmQ3NjU2MjdlIiwiY2hhdF9pZCI6ImNoYXQtNTkzNWY5NzUtZDQwNS00NzcwLWE3YjMtYTVmY2NkMzE1ZDZhIiwicGxhdGZvcm0iOiJ6YWkifQ.b57YZe6sGj-HZsCcRx1WV_vtDtekbsK6teHkbof462U";
