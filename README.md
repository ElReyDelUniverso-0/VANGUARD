# VANGUARD — El mundo en tiempo real

Plataforma global de conflictos **100% gratis, en español, sin registro**. Entra desde el móvil y mira el mundo arder en directo.

## Enlaces oficiales

| Canal | URL |
|---|---|
| **Cuartel general (jugar ahora)** | https://vanguard-kq9r.vercel.app/ |
| **Noticias de conflictos de HOY** | https://vanguard-kq9r.vercel.app/guerra-hoy |
| **Centro de mando de reclutamiento** | https://vanguard-kq9r.vercel.app/mision |
| Canal RSS | https://vanguard-kq9r.vercel.app/feed.xml |

## Qué hay dentro

- **Noticias de guerra EN VIVO** — cables de BBC Mundo, DW, France 24 al minuto, con veredicto comunitario real/fake y barra de credibilidad.
- **Mapa OSINT 3D** — aviones militares, tanques, tropas y conflictos activos sobre el globo en tiempo real.
- **Guerra global multijugador** — 24 territorios, lobby mundial automático, duelos con ranking ELO.
- **Simulador táctico** + misiones, quizzes, recompensas, tienda y logros.
- **PWA instalable** — añádela a tu pantalla de inicio y no pierdas tu racha nunca.

## Stack

Next.js 16 · TypeScript · Tailwind 4 · Prisma (PostgreSQL/Supabase) · Socket.io (Render) · globe.gl · Zustand · Vercel.

## Escudo — buscador de API keys

VANGUARD revisa su propio árbol de trabajo buscando llaves y secretos filtrados (complemento de la ley v204 EL ESCUDO):

```bash
npm run escudo            # informe · exit 1 si hay hallazgos NUEVOS
npm run escudo -- --strict   # también falla con los permitidos (quemados)
npm run escudo -- --json     # salida JSON para CI
```

Vigila **10 familias** (OpenAI/Anthropic · Google · AWS · GitHub · Telegram · Stripe · Slack · llaves privadas/Firebase · credenciales en URLs de conexión · JWT firmados) más 2 genéricos de reserva (asignaciones de secretos y literales hex de alta entropía). Corre automáticamente en cada push vía GitHub Actions (`.github/workflows/escudo-apikeys.yml`). Los secretos ya públicos y documentados viajan en la lista `PERMITIDOS` del script con su motivo — vaciarla es parte del P0 de la auditoría.

## Reclutamiento

Cada agente tiene un código VGD-XXXXXX: compartir el enlace trae +50 monedas de bienvenida al invitado y +100 monedas al reclutador por cada 3 invitaciones. La misión de campaña es **100 enlaces y 100 jugadores** — progreso en vivo en [/mision](https://vanguard-kq9r.vercel.app/mision).
