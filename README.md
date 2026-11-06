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

Vigila **10 familias** (OpenAI/Anthropic · Google · AWS · GitHub · Telegram · Stripe · Slack · llaves privadas/Firebase · credenciales en URLs de conexión · JWT firmados) más 2 genéricos de reserva (asignaciones de secretos y literales hex de alta entropía). El workflow de CI (`.github/workflows/escudo-apikeys.yml`) está listo para copiar: GitHub exige crear el archivo desde la web o un token con scope `workflow` — el empujador habitual no lo tiene, así que la casa lo activa a mano. Los secretos ya públicos y documentados viajan en la lista `PERMITIDOS` del script con su motivo — vaciarla cierra el P0 de la auditoría.

### La sala del escudo en la web

El mismo escudo tiene sala propia dentro de la casa: **[/escudo](https://vanguard-kq9r.vercel.app/escudo)** documenta qué vigila y cómo, con un botón de «mirada en vivo» que sirve el informe vía `GET /api/escudo`. El endpoint solo responde en desarrollo (o con `ESCUDO_WEB=1` en el entorno): el despliegue serverless no viaja con el árbol de trabajo completo, así que en producción el escudo de verdad corre en el taller y en CI. El catálogo de familias que pinta la sala es el que el propio script declara en su `--json` — una sola fuente de verdad.

### El inventario del aire (`npm run escudo-env`)

Hermano menor del Buscador: mira lo que el código **respira**.

```bash
npm run escudo-env            # informe · exit 1 si hay RESERVAS hardcodeadas
npm run escudo-env -- --strict   # también falla con variables usadas sin declarar
npm run escudo-env -- --json     # salida JSON para CI
```

Tres miradas: **(A)** variables usadas sin declarar en ningún `.env*` (guía de la rotación pendiente); **(B)** declaradas sin uso (config muerta); **(C)** reservas hardcodeadas `process.env.X ?? "literal"` donde X huele a secreto (delito siempre — hoy caza las 2 de `src/lib/auth-server.ts` y la reserva única del token Z.ai). Valores enmascarados, Node puro, cero dependencias.

### La fuente única del token (`src/lib/zai-token.ts`)

El JWT de la gateway Z.ai vivía hardcodeado en tres sitios a la vez (neurona, ia-gateway, zai-server). Ahora los tres importan `ZAI_TOKEN` de la fuente única, que lee PRIMERO la variable de entorno `ZAI_TOKEN` y conserva el literal quemado como último recurso mientras la rotación cierra la deuda. El paso a paso completo — y el protocolo de cura de toda llave — vive en [`SECURITY.md`](SECURITY.md).

### El estado de la casa (`/estado`)

**[/estado](https://vanguard-kq9r.vercel.app/estado)** — el latido público, el patrón de página de estado de toda casa seria viviendo DENTRO de Vanguard: un clic consulta `GET /api/health` (v27/v84) y pinta proceso, base de datos (`up`/`slow`/`down`), latencia del eco, memoria, versión y tiempo de vida. Sin intervalos ni sondeos automáticos (ley v335) — el watchdog de la casa ya hace la guardia.

### El mapa y las puertas (`robots.txt`)

El `robots.txt` de la casa (`public/robots.txt`, con sus bloques por bot y el `Sitemap:` desde la v34) gana una regla: las cocinas (`/api/`) quedan fuera del rastreo — no son páginas públicas y algunas ejecutan trabajo caro. El `sitemap.ts` anuncia ahora también `/escudo` y `/estado`.

### El muro de la mirada

`GET /api/escudo` corre detrás del muro de la fortaleza (`muro()` de `src/lib/fortaleza.ts`, los mismos muros anti-flood de denuncias, memes, ambassadors y live): **6 miradas por IP y minuto** — el proceso que recorre el árbol completo es caro y la puerta abierta no puede ser un DoS andando.

## Reclutamiento

Cada agente tiene un código VGD-XXXXXX: compartir el enlace trae +50 monedas de bienvenida al invitado y +100 monedas al reclutador por cada 3 invitaciones. La misión de campaña es **100 enlaces y 100 jugadores** — progreso en vivo en [/mision](https://vanguard-kq9r.vercel.app/mision).
