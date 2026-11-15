# VANGUARD — ARQUITECTURA

> Medido en el repositorio el 2026-11-15. Si cambias algo estructural, actualiza este archivo.

## Pila

- **Next.js 16** (App Router; Turbopack en desarrollo, `next build --webpack` en producción), **React 19**, TypeScript estricto.
- **Tailwind 4** + hojas propias: `src/app/portada.css` (sistema `vx-*` de la portada y módulos),
  `src/app/piel.css` (uniforme de salas: `vx-ps-*`, barra de pestañas `vx-pest-*`), `src/app/globals.css`.
- **Prisma 6 + SQLite** (`db/custom.db`, 42 modelos). En Vercel la base es **de solo lectura y congelada**:
  todo lo vivo se lee de fuentes en tiempo real (RSS, USGS, GDACS, Banco Mundial…).
- **three 0.185** para el 3D; **zustand** para estado de cliente.
- Despliegue: **Vercel** desde `main` a 3 proyectos (vanguard, vanguard-u6b9, vanguard-kq9r). Crons en `vercel.json`
  (`/api/news` 12:00, `/api/agent-ping` 13:30).

## Tamaño

| Pieza | Cantidad |
|---|---|
| Páginas (`page.tsx`) | 55 |
| Rutas API (`route.ts`) | 92 |
| Componentes `.tsx` | 403 |
| Módulos `src/lib` | 222 |
| Modelos Prisma | 42 |

## Navegación (fuente única)

`src/components/portada/modulos.ts`
- `MODULOS`: 9 módulos (8 públicos + `estado`), cada uno con `id, nombre, corto, lema, nav, img, gancho, pestanas[]`.
- `moduloDe(ruta)`: **primera coincidencia** → una sala debe estar en UN solo módulo.
- `portadaDe(m)` → `/modulo/<id>`; `entradaDe(m)` → a dónde lleva la cabecera
  (Conflictos, Mapa y Juego entran a su sala-vestíbulo; los demás a su portada).
- La leen: `cabecera.tsx` (NAV + barra móvil), `carcasa.tsx` (barra de pestañas), `hub-modulo.tsx`,
  `modulos-rejilla.tsx`, `app/modulo/[id]`, `app/modulos`, `app/page.tsx`, `app/sitemap.ts`, `app/estado`.

| Módulo (`id`) | Salas |
|---|---|
| Conflictos (`conflictos`) | /guerra-hoy, /en-vivo, /conflictos, /cronica, /vertigo, /verdad-cruda |
| Mapa 3D (`mapa`) | /mundo, /ver-guerra, /zona-cero, /vanguard2 |
| Conocimiento (`conocimiento`) | /atlas, /rostros, /divisas, /historia, /archivo-mundial, /traductor |
| Secretos (`secretos`) | /espia, /servicios, /oscura |
| Arsenal (`arsenal`) | /armeria, /poder, /teatro-3d, /escenarios |
| Datos vivos (`datos`) | /pulso-mundial, /cruce, /herramientas, /centinela |
| Medios (`medios`) | /galeria, /audios, /musica, /voz |
| Juego (`juego`) | /cuartel, /objetivos, /universo, /mision, /perfil, /modo |
| Estado (`estado`) | /estado, /novedades, /calidad, /torre, /catalogo, /nucleo, /escudo, /privacidad |

Fuera de módulos: `/` (portada), `/lectura/[clave]` (nota), `/noticia/[id]` (redirige a lectura),
`/conflicto/[tag]` (fichas, cuelga de Conflictos), `/clasico` (redirige al Cuartel), `/offline`.

## Carcasa

`src/components/portada/carcasa.tsx` pinta cabecera + pestañas + teletipo + barra móvil en todas las
rutas salvo `SIN_CARCASA` (`/lectura`, `/cuartel`, `/clasico`, `/vanguard2`, `/vertigo`, `/offline`, `/api`).
Las salas usan `PortadaSala` (`src/components/vanguard/portada-sala.tsx`, servidor, cero JS) como cabecera visual.

## Noticias (flujo)

`src/lib/portada/notas.ts`
1. `obtenerNotas()` lee 10 RSS en español (BBC Mundo, France 24, El País, El Mundo, ABC, 20minutos,
   La Vanguardia, Europa Press, DW, ONU), ventana de 72 h, `revalidate 300`.
2. La clave de cada nota es `base64url(URL)` → `/lectura/<clave>`.
3. `buscarNota(clave)`: cable vivo → base de datos → **(v402.7) ficha OpenGraph del propio medio**
   (lista cerrada `MEDIOS_ARTICULO`, https, se respeta el charset; sin título o fecha declarados = sin nota).
4. Si nada responde y el medio es de la casa: página «Esta nota ya salió del cable vivo» (noindex) con enlace al original.
5. Clasificación por región/conflicto en `src/lib/portada/clasificar.ts`.

## Registro y coordinación

- `src/lib/version.ts` (`APP_VERSION`, `APP_CODENAME`, `APP_VERSION_ANTERIOR`) — se ve en `/api/health`.
- `src/lib/bitacora.ts` (`BITACORA`, campo `tipo` obligatorio; `version` única porque se usa como `key`).
- `worklog.md` (raíz), `agent-ctx/improvement-inbox.md` (gitignored → `git add -f`), y estos `docs/`.
- `AGENTS.md` está **desactualizado** (v127): sus «líneas rojas» de cero imágenes/cero enlaces externos ya no
  describen la casa (hay fotos reales e ilustraciones; la lectura enlaza a la fuente). Ver backlog.
