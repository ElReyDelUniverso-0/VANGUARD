# ═══════════════════════════════════════════════════════════════════
# LA CASA EN UN CONTENEDOR — para cualquier host gratuito que ejecute
# Docker y no cobre (Koyeb, Render, Hugging Face Spaces…).
#
# El repo ya construye en modo «standalone» (next.config.ts), así que el
# servidor de producción es node .next/standalone/server.js. No hace falta
# bun: el arranque con bun del package.json es cosa del entorno del Dueño.
#
#   docker build -t vanguard .
#   docker run -p 3000:3000 vanguard
# ═══════════════════════════════════════════════════════════════════
FROM node:22-bookworm-slim AS deps
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN rm -f bun.lock bun.lockb || true \
 && npm ci --no-audit --no-fund

FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS=--max-old-space-size=8192
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN rm -f bun.lock bun.lockb || true \
 && npx prisma generate \
 && npx next build --webpack

FROM node:22-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/db ./db
EXPOSE 3000
CMD ["node", "server.js"]
