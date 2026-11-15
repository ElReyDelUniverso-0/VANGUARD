# VANGUARD — PLAN MAESTRO

> Documento vivo. Léelo al empezar cada sesión, junto con `VANGUARD_IMPROVEMENT_BACKLOG.md`.
> Última actualización: 2026-11-15 · versión en producción: **v402.7** (tras el despliegue de esta sesión).

## 1. Qué es VANGUARD

Una plataforma de información geopolítica en español: noticias vivas de medios verificados, conflictos,
mapa 3D, conocimiento (atlas, rostros del poder, dinero, historia), datos vivos (sismos, alertas,
indicadores), medios (fotos, radio, música) y una capa de juego (misiones, logros, carnet de agente).
Identidad visual propia: negro táctico `#06080c`, oro `#e8c56a / #d4af37`, rojo de alerta `#ff3b30`,
Orbitron para la marca, monoespaciada para datos, Inter para leer.

## 2. Visión a largo plazo

Un ecosistema donde cualquiera pueda:
1. **Entender** lo que pasa hoy en 30 segundos (lo esencial, mapa, línea de tiempo, fuente).
2. **Explorar** el mundo de forma interactiva (globo 3D, atlas, rutas del poder).
3. **Relacionar** hechos: cada nota enlazada a su conflicto, su región, su historia y sus actores.
4. **Seguir** lo que le importa (centinela, avisos, «a qué distancia de mi casa»).
5. **Participar** (juego, comunidad) sin que eso tape la información.

## 3. Principios no negociables

- **Cero cifras, noticias, imágenes, fuentes o verificaciones inventadas.** Si un dato no existe, no se muestra.
- **Evolución, no destrucción**: cambios incrementales, reversibles, con commit y respaldo (bundle).
- **Móvil primero** (390×844 es la pantalla de referencia de las auditorías).
- **Una sola fuente de verdad** para la navegación: `src/components/portada/modulos.ts`.
- Simulaciones de conflicto solo educativas, históricas o de ficción.
- No se publica nada que no haya pasado: tsc acotado + eslint + prueba en `next dev` + auditoría de producción.

## 4. Estructura actual (v402.6+)

8 módulos públicos + Estado (ver `VANGUARD_ARCHITECTURE.md`):
Conflictos · Mapa 3D · Conocimiento · Secretos · Arsenal · Datos vivos · Medios · Juego · (Estado de Vanguard).
Cada módulo tiene portada propia en `/modulo/<id>` y barra de pestañas. Índice en `/modulos`.

## 5. Hoja de ruta por fases

| Fase | Objetivo | Estado |
|---|---|---|
| F1 · Fiabilidad | 0 errores de consola, 0 enlaces rotos, 0 builds rotos | **En curso** — auditoría v402.7: 61/61 rutas OK, 1 enlace roto → arreglado |
| F2 · Lectura rápida | Toda nota con «lo esencial», foto, mapa, línea de tiempo, relacionadas | Hecho en `/lectura`; falta extender a `/en-vivo` y fichas de conflicto |
| F3 · Peso y velocidad | Ninguna ruta > 1,5 MB en móvil | Pendiente: `/galeria` 3,6 MB, `/teatro-3d` 2,3 MB, `/` 2,3 MB, `/escenarios` 1,8 MB |
| F4 · Accesibilidad | Foco visible, texto ≥ 10 px, zonas tocables ≥ 24 px | Parcial (piso de lectura móvil v402.5); faltan foco visible y `/en-vivo` |
| F5 · Relaciones | Nota ↔ conflicto ↔ actores ↔ historia, navegable | Base en el Núcleo (`src/lib/nucleo`); falta exponerlo en la lectura |
| F6 · Comunidad | Estado real de foros, encuestas, multijugador, ELO | **Por auditar** (ver backlog) |

## 6. Cómo trabajar (ciclo de cada sesión)

1. `git fetch` — **otra IA (ia3) trabaja en paralelo** en el mismo `main`; revisa sus commits y su buzón
   (`agent-ctx/improvement-inbox.md`) antes de tocar nada.
2. Lee el backlog, elige la tarea de más valor y menor riesgo.
3. Desarrolla en el repo existente (nunca reescribir desde cero).
4. Verifica según `VANGUARD_TESTING.md`.
5. Registra: `version.ts`, `bitacora.ts`, `worklog.md`, buzón, `VANGUARD_CHANGELOG.md`, backlog.
6. Publica (`main` despliega en Vercel: vanguard, vanguard-u6b9, vanguard-kq9r) y **comprueba el estado
   del despliegue** en GitHub (`/commits/<sha>/status`) y en `/api/health`.
