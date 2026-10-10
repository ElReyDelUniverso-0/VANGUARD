// v99.0 MENTE VIVA — puente único al núcleo IA (solo servidor).
// La lección de v89: dentro del lambda el SDK puede fallar por init de config,
// pero el fetch DIRECTO al gateway (mismos encabezados que el SDK) no depende
// de filesystem ni de inicialización. Centralizo ese camino aquí para que
// NEURONA, el CONSEJO y LA MENTE compartan una sola vía fiable.
// SOLO importar desde rutas API / componentes de servidor.

const GATEWAY = "https://internal-api.z.ai/v1/chat/completions";

const GATEWAY_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  Authorization: "Bearer Z.ai",
  "X-Z-AI-From": "Z",
  "X-Chat-Id": "chat-5935f975-d405-4770-a7b3-a5fccd315d6a",
  "X-User-Id": "a77d6405-6649-4dc4-ba56-08dfd765627e",
  "X-Token":
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYTc3ZDY0MDUtNjY0OS00ZGM0LWJhNTYtMDhkZmQ3NjU2MjdlIiwiY2hhdF9pZCI6ImNoYXQtNTkzNWY5NzUtZDQwNS00NzcwLWE3YjMtYTVmY2NkMzE1ZDZhIiwicGxhdGZvcm0iOiJ6YWkifQ.b57YZe6sGj-HZsCcRx1WV_vtDtekbsK6teHkbof462U",
};

export type Msg = { role: "assistant" | "user"; content: string };

/** Llamada directa al gateway. Devuelve "" si falla (el llamador hace fallback). */
export async function iaDirecta(system: string, user: string, timeoutMs = 25_000): Promise<string> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(GATEWAY, {
      method: "POST",
      headers: GATEWAY_HEADERS,
      body: JSON.stringify({
        messages: [
          { role: "assistant", content: system },
          { role: "user", content: user },
        ],
        thinking: { type: "disabled" },
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`gateway ${res.status}`);
    const data = await res.json();
    return String(data?.choices?.[0]?.message?.content ?? "");
  } catch {
    return "";
  } finally {
    clearTimeout(t);
  }
}

/** Igual que iaDirecta pero con historial completo (chat multi-turno). */
export async function iaConversa(messages: Msg[], timeoutMs = 25_000): Promise<string> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(GATEWAY, {
      method: "POST",
      headers: GATEWAY_HEADERS,
      body: JSON.stringify({
        messages,
        thinking: { type: "disabled" },
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`gateway ${res.status}`);
    const data = await res.json();
    return String(data?.choices?.[0]?.message?.content ?? "");
  } catch {
    return "";
  } finally {
    clearTimeout(t);
  }
}

/** Extrae el primer objeto JSON de una respuesta cruda del modelo. */
export function primerJSON(raw: string): Record<string, unknown> | null {
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]) as Record<string, unknown>;
  } catch {
    return null;
  }
}
