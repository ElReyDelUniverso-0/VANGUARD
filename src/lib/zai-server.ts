// v79.1 — Cliente del núcleo IA para rutas de servidor.
// ZAI.create() lee .z-ai-config del cwd/home//etc (funciona en local).
// En serverless (Vercel) ese archivo no viaja con la función, así que caemos
// a una config inline equivalente. Nunca importar desde el cliente.

import ZAI from "z-ai-web-dev-sdk";

type ZAIClient = Awaited<ReturnType<typeof ZAI.create>>;

const INLINE_CONFIG = {
  baseUrl: "https://internal-api.z.ai/v1",
  apiKey: "Z.ai",
  chatId: "chat-5935f975-d405-4770-a7b3-a5fccd315d6a",
  token:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYTc3ZDY0MDUtNjY0OS00ZGM0LWJhNTYtMDhkZmQ3NjU2MjdlIiwiY2hhdF9pZCI6ImNoYXQtNTkzNWY5NzUtZDQwNS00NzcwLWE3YjMtYTVmY2NkMzE1ZDZhIiwicGxhdGZvcm0iOiJ6YWkifQ.b57YZe6sGj-HZsCcRx1WV_vtDtekbsK6teHkbof462U",
  userId: "a77d6405-6649-4dc4-ba56-08dfd765627e",
};

let cached: ZAIClient | null = null;

export async function createZAI(): Promise<ZAIClient> {
  if (cached) return cached;
  try {
    cached = await ZAI.create();
    return cached;
  } catch {
    // serverless: sin .z-ai-config en el filesystem → instancia directa.
    // (el constructor es público en runtime; el d.ts lo marca privado)
    const Ctor = ZAI as unknown as new (cfg: unknown) => ZAIClient;
    cached = new Ctor(INLINE_CONFIG);
    return cached;
  }
}
