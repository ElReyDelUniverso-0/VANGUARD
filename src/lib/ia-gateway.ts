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
    gatewayCaidoHasta = 0; // el gateway volvió
    return String(data?.choices?.[0]?.message?.content ?? "");
  } catch {
    // v105.0: gateway colgado/fallido — memoria por instancia para no volver a
    // quemar 20s de deadline en la siguiente petición del mismo lambda
    gatewayCaidoHasta = Date.now() + 600_000;
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

// v105.0 LA REDACCIÓN — VÍA ALTERNATIVA (vía 3) para el lambda de producción.
// Lección confirmada dos años seguidos: el lambda de Vercel NO alcanza
// internal-api.z.ai (ni el SDK ni el fetch directo cuelgan hasta el deadline),
// mientras que los feeds públicos (RSS de medios) SÍ salen. La vía 3 usa un
// núcleo generativo público sin clave (pollinations.ai, endpoint OpenAI-
// compatible) — alcanza desde cualquier lambda y mantiene la sala viva con
// IA real donde el gateway privado está bloqueado. Devuelve "" si falla.

const ALT_ENDPOINT = "https://text.pollinations.ai/openai";

// v105.0 memoria del gateway caído (por instancia de lambda)
let gatewayCaidoHasta = 0;

/** true si el gateway privado falló en los últimos 10 minutos (instancia). */
export function gatewaySospechosoCaido(): boolean {
  return Date.now() < gatewayCaidoHasta;
}

export async function iaAlternativa(system: string, user: string, timeoutMs = 14_000): Promise<string> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(ALT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`alt ${res.status}`);
    const data = await res.json();
    return String(data?.choices?.[0]?.message?.content ?? "");
  } catch {
    return "";
  } finally {
    clearTimeout(t);
  }
}

/**
 * v105.0 — CARRERA 1∥3: el gateway privado (rápido donde es alcanzable) y el
 * núcleo público (rápido en producción, donde el gateway está bloqueado) corren
 * a la vez; gana el primero que devuelva texto. Así el sandbox no pierde su
 * GLM y producción no espera 40s de cuelgues muertos.
 */
export async function iaParalela(system: string, user: string, timeoutMs = 20_000): Promise<string> {
  // v105.0: si el gateway ya demostró estar caído en esta instancia (producción),
  // no lo llamamos — TODO el margen va al núcleo público que sí responde.
  if (gatewaySospechosoCaido()) {
    return iaAlternativa(system, user, timeoutMs);
  }
  const r = await Promise.allSettled([
    iaDirecta(system, user, timeoutMs),
    iaAlternativa(system, user, Math.min(20_000, timeoutMs)),
  ]);
  if (r[0].status === "fulfilled" && r[0].value) return r[0].value;
  if (r[1].status === "fulfilled" && r[1].value) return r[1].value;
  return "";
}
