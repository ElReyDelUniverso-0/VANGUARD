# VANGUARD — AUDITORÍA

> Auditorías reales, con método reproducible. Nada aquí es una estimación.

## Auditoría 2026-11-15 · sitemap y descubrimiento

Ver `docs/VANGUARD_SEO_DISCOVERY.md` (P1–P10, producción 7b54176).

## Auditoría 2026-11-15 · producción v402.6 (vanguard-kq9r.vercel.app)

**Método:** `scripts/qa/auditoria-movil.py` — Playwright, móvil 390×844 (iPhone UA), 61 rutas (todas las salas de
los 9 módulos, `/modulos`, las 9 portadas `/modulo/<id>`, `/lectura`, `/clasico`, `/conflicto`, `/offline` y una ruta
inexistente), espera de carga + desplazamiento al final, y comprobación HTTP de los 239 enlaces internos encontrados.

### Resultado global

| Indicador | Resultado |
|---|---|
| Rutas que responden 200 | **61/61** (la ruta inexistente da 404, correcto) |
| Errores de consola | **0** (salvo el 404 intencionado) |
| Imágenes rotas | **0** |
| Desbordes horizontales | **0** |
| Páginas con ≠ 1 `<h1>` | **0** |
| Imágenes sin `alt` | **0** |
| Enlaces internos rotos | **1 de 239** → `/lectura/<clave>` de una nota de BBC que salió del cable (**arreglado en v402.7**) |
| Mediana de peso por ruta | 385 KB · mediana de JS medido 0 KB (servidor) |

### Hallazgos abiertos (con cifra medida)

| # | Hallazgo | Medida | Prioridad |
|---|---|---|---|
| A1 | Peso de `/galeria` | 3.609 KB | Alta |
| A2 | Peso de `/teatro-3d` (modelos soldier/tank .glb) | 2.344 KB | Alta |
| A3 | Peso de la portada `/` | 2.259 KB | Alta |
| A4 | Peso de `/escenarios` | 1.765 KB | Media |
| A5 | `/en-vivo`: JS + textos diminutos + zonas tocables pequeñas | 591 KB JS · 465 textos < 10 px · 22 tocables < 24 px | Alta |
| A6 | `/catalogo`: textos < 10 px | 494 | Media |
| A7 | `/objetivos`, `/guerra-hoy`: textos < 10 px | 125 · 115 | Media |
| A8 | Descripciones meta > 160 letras (Google las corta) | 35 rutas (máx. `/herramientas` 376) | Media |
| A9 | Títulos con «VANGUARD» doble | 6 rutas → **arreglado en v402.7** | — |
| A10 | `/musica`: 6 botones «sin nombre» | **Falso positivo**: tienen texto («tocar») pero están en un panel plegado | — |

### Hallazgos de proceso (esta sesión)

- **Build roto por bitácora** (v402.6): una entrada sin el campo obligatorio `tipo` rompió `tsc --noEmit` en Vercel.
  Producción no cayó (Vercel conserva el último build bueno). Lección: el tsc acotado DEBE incluir `src/lib/bitacora.ts`
  y `src/lib/version.ts` siempre.
- **Sobrescritura entre IAs**: el commit `a52189e` de ia3 («arreglar bitacora.ts») dejó `main` como v402.4 + su Eje del
  Día, borrando sin querer v402.5 y v402.6 (130 archivos). Se restauró con cherry-pick encima de su trabajo, sin perder
  nada de ninguno de los dos. Lección: tras resolver conflictos, comparar `git diff --stat` contra el padre: si toca
  archivos que tu cambio no tocaba, algo se ha perdido.
- **Memoria del entorno**: `next dev` compilando `/cuartel` agota los 2 GB del sandbox. Probar el Cuartel en producción.

### Estado real de sistemas por verificar (no auditados aún)

Multijugador, ELO (`/api/duelo`, `/api/drone-scores`), foros/comunidad (`Contribution`, `Ugc*`, `Meme*`),
encuestas, búsqueda global (Núcleo), perfiles (`Account`, `MpProfile`), Radio de guerra, Ojo de Dios.
**No se debe afirmar que funcionan hasta auditarlos** (ver backlog B-COM).
