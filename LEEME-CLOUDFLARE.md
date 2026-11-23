# VANGUARD en Cloudflare — la ruta de las actualizaciones

**Casa oficial:** https://vanguard.vanguard-casa.workers.dev
(Vercel quedó atrás: la cuenta se pausó por límite de uso. No volver a usar vanguard-kq9r.vercel.app.)

## Cómo se publica una actualización (automático)
1. Se sube un commit a la rama `main` de GitHub (ElReyDelUniverso-0/VANGUARD).
2. GitHub Actions corre `.github/workflows/cloudflare.yml`:
   `npm ci` → `npx opennextjs-cloudflare build` → `npx opennextjs-cloudflare deploy`.
3. En 5–8 minutos la casa nueva está en vivo. Si llegan varios commits seguidos,
   solo se publica el último (los anteriores se cancelan).

Ver el estado: https://github.com/ElReyDelUniverso-0/VANGUARD/actions
(«Cloudflare — construir y publicar la casa»). Botón «Run workflow» = publicar a mano.

## Reglas para quien toque el código (agentes incluidos)
- **El build exige 0 errores de tipos** (`tsc --noEmit` corre antes de `next build`).
  Un solo error de TypeScript tumba la publicación de TODOS.
- No borrar: `wrangler.jsonc`, `open-next.config.ts`, `.github/workflows/cloudflare*.yml`.
- Base de datos: **D1** «vanguard» (binding `DB`). `src/lib/db.ts` usa Prisma +
  `@prisma/adapter-d1` en Cloudflare y SQLite (`db/custom.db`) en local.
  Si se añade una tabla al schema, hay que crearla también en D1
  (`npx wrangler d1 execute vanguard --remote --command "CREATE TABLE ..."`).
- Imágenes sin optimizar en Cloudflare (no hay sharp): servir tamaños razonables.
- **Plan gratis = 10 ms de CPU por visita.** Las páginas `force-dynamic` muy pesadas
  pueden dar 503 a veces. Preferir `export const revalidate = N` a `force-dynamic`, y no inflar el HTML.
  Desde v443.3 la caché ISR vive en D1 (tabla `occache`, gzip) vía
  `cloudflare/cache-d1.ts` — la Cache API no guarda nada en *.workers.dev.
- Tareas diarias (antes crons de Vercel): `.github/workflows/cloudflare-cron.yml`
  llama a `/api/news` (12:00 UTC) y `/api/agent-ping` (13:30 UTC).

## Llaves (guardadas en GitHub → Settings → Secrets and variables → Actions)
- `CLOUDFLARE_API_TOKEN` (permisos: Workers Scripts Edit, D1 Edit, Account Settings Read…)
- `CLOUDFLARE_ACCOUNT_ID` = f9fa9d480b3f6f632339912d3080bbdc
- Variable `CF_SITE_URL` = https://vanguard.vanguard-casa.workers.dev
Nunca escribir los tokens en el repo.

## Paneles
- Cloudflare: https://dash.cloudflare.com → Workers & Pages → «vanguard»
  (registros: pestaña Observability; base de datos: Storage & Databases → D1 → «vanguard»).
- Pasar a Workers Paid (5 USD/mes) elimina los 503 por CPU sin tocar código.
