# HANDOFF VANGUARD — Paquete de edición para cualquier IA
_Generado: 2026-10-25 · Estado: v167.0 (git 63e9240) · Próximo incremento: **v168.0**_

## 1. Qué es Vanguard
Web app Next.js (App Router) + motor 3D propio (Three.js r158 + CSS3DRenderer + GSAP 3.12), tema "conflictos mundiales". **Ley de hierro del dueño: TODO literal en 3D ("todo literal cada imagen 3D"), mobile-first, cero lag.**

## 2. Dónde está y cómo correrlo
- Carpeta: `/home/z/my-project` (Next.js 16 + TypeScript + Tailwind + shadcn + Prisma/SQLite local `db/custom.db`).
- Node v24. Arrancar: `npm run dev:real` → puerto 3000. Build: `npm run build`.
- **Verdad única de compilación: `npx tsc --noEmit` debe salir exit 0.** También `npm run lint`.
- NO abrir sesiones de navegador largas (el navegador hace OOM). QA = sesiones cortas + capturas.
- `next.config.ts` ya tiene rewrite de `/socket.io` → `/api/health` (guard contra OOM en dev). No quitarlo.

## 3. Archivos que mandan (leer ANTES de tocar nada)
| Archivo | Líneas | Qué es |
|---|---|---|
| `src/components/vanguard/mundo-webgl.tsx` | ~6.400 | El MUNDO 3D: intro, ciudad, vuelo libre (WASD/dedo), `anclarSala()` (~líneas 1725–1760), HUD, protocolo con la Casa |
| `src/components/vanguard/salas-3d.ts` | ~3.600 | Fábrica de SALAS: `TipoSala3D = economia\|conflictos\|memes\|noticias\|quiz\|votaciones\|perfil\|generica` — 7 insignia + ~139 genéricas |
| `src/components/vanguard/zc3d-engine.ts` | ~2.300 | Motor: WebGLRenderer+CSS3DRenderer sincronizados, `acotar()`, `limpiar()` (dispose), `sigKey` anti-rebote, calidad adaptativa |
| `src/components/vanguard/panels/*.tsx` | ~160 | **VERDAD ÚNICA DE CONTENIDO (2D)**: news, markets, shop, quiz, polls, perfil… Todo lo que existe en 2D debe existir igual en 3D |
| `src/components/vanguard/use-sala3d-contenido.ts` | — | Datos que la Casa envía a la sala 3D |
| `src/app/page.tsx` | — | Router de módulos, `TIPO_SALA_3D`, switch global 2D↔3D |
| `src/components/vanguard/bitacora.ts` | — | Bitácora de versiones: ACTUALIZAR cada ronda |
| `agent-ctx/improvement-inbox.md`, `worklog.md` | — | Bandeja de mejoras y bitácora de agentes: ACTUALIZAR cada ronda |

## 4. Protocolo Casa⇄Mundo (obligatorio para toda acción real en 3D)
Eventos de ventana:
- `vg:sala3d` — mundo → casa: "abre/ancha sala X con datos Y"
- `vg:sala3d-datos` — casa → mundo: datos vivos del panel (news top-5 cada 30s, quiz estado, polls `idxDestacada` cada 10s, perfil nivel/xp/coins cada 5s, tienda…)
- `vg:sala3d-accion` — mundo → casa: **raycast ejecuta la acción REAL del panel** (INVERTIR, COMPRAR, COBRAR, VENDER, JUGAR…). Todo botón de un panel 2D debe poder dispararse desde su réplica 3D por raycast.
- Proxy invisible de raycast: objeto con `g.tipo === "sala"`.

## 5. Leyes del dueño (NO negociables)
1. **#23**: entrar a un módulo-casa muestra SU CONTENIDO COMPLETO (igual que 2D, con acciones como invertir); acercarse dispara info dinámica (texto 3D que entra/sale + gráficos grandes, en TODOS los módulos); switch global 2D/3D; el 2D embebe el 3D.
2. **#24**: el FONDO lo crea cada módulo (cúpula del acento + planeta dormido ya existen, v166); la info llega por TIEMPO (olas 6s/12s) y por MOVIMIENTO (entrar despierta lo siguiente); casa de vidrio con habitaciones (fachada+portal+vestíbulo+salas+lámparas); pulido visual; controles móviles simplificados (botón AVANZAR + vuelo fino).
3. **#25 (prioridad máxima)**: "reestructura" — el 3D debe ser **paridad total con el 2D** (el 2D es la verdad; el 3D puf nada = falla). PROHIBIDO "figura a lo loco": nada de gráficos aleatorios sin significado. **Eliminar el MAPA de la intro.** Orden en el espacio: contenido alineado a cuadrícula, título arriba, datos en filas, acciones raycast reales abajo.
4. Texto 3D: fuente helvetiker, siempre `acotar()`, escala móvil (líneas ≥1.3×), contenido con offset derecho en `pintar()` (desktop 0.18–0.4 / móvil 0.04–0.08).
5. Memoria: SIEMPRE `limpiar()` (dispose geometrías+materials) al desmontar salas.
6. Tierra en [0,0,0]; audio Web Audio; calidad adaptativa `CtxSala3D {fuente, calidadBaja, movil, animarP}`.

## 6. Tareas pendientes (en orden)
1. **Paridad 2D→3D de las ~139 salas genéricas** en `salas-3d.ts` (mercado/tienda son el ejemplo que señalaba el dueño). Patrón probado en v165: 9 filas de datos + acciones reales INVERTIR/COMPRAR/COBRAR/VENDER. Copiar el patrón de las salas insignia (noticias/quiz/votaciones/perfil, construirQuiz etc.).
2. **Eliminar el mapa de la intro** (busca en `mundo-webgl.tsx` el flujo de intro / `intro-cinematica.tsx`, `intro-trailer.tsx`).
3. Casa-habitaciones para todos los módulos (extender v166: cada módulo = casa + salas internas progresivas).
4. Fondo por módulo (v166 ya lo hizo para la casa; extender a todas).
5. Controles móviles simplificados (ya hay AVANZAR; pulir vuelo por dedo).
6. Bug hunting general (pendiente del dueño desde hace varias rondas).
7. Menú/noticias en vivo: rematar v164 (teletipo, galería de juegos).

## 7. Convenciones de versión
- Git: 1 commit por versión, mensaje = nombre de versión + qué cambió. Actual: **v167.0** → la próxima es **v168.0**.
- Cada ronda: actualizar `bitacora.ts`, `worklog.md`, `agent-ctx/improvement-inbox.md`, y `src/app/api/health` (health guarda versión).
- QA: recorrer el camino real del usuario (tap globo → tab → zona → sala), consola sin errores, `tsc --noEmit` 0, build limpio.

## 8. Errores conocidos / trampas
- Dev OOM si el watcher procesa demasiado → ya mitigado con el rewrite; no reactivar HMR pesado ni sockets.
- El remoto a veces toma números de versión (pasó con v164–v166): mirar `git log` ANTES de numerar.
- La ciudad re-abriéndose encima de la sala fue bug R19 (v167 la arregló con triple guard) — no romper `ciudadCerradaAlgunaVez` ni el watchdog `salaAnclaPendiente`.
- Texto 3D microscópico en móvil → respetar factores de escala.
