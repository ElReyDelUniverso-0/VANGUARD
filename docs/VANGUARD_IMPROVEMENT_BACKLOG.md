# VANGUARD — BACKLOG DE MEJORAS (priorizado)

> Prioridad = impacto en el usuario × gravedad ÷ riesgo. Mueve a «Hecho» con versión y fecha.
> Referencias de la casa: auditoría en `VANGUARD_AUDIT.md` (códigos A#).

## P0 · Fiabilidad (rompe algo o puede romperlo)

| ID | Tarea | Origen | Notas |
|---|---|---|---|
| B-01 | Incluir siempre `bitacora.ts` y `version.ts` en el tsc acotado antes de publicar | build roto v402.6 | Proceso, ver TESTING |
| B-02 | Auditar los 3 errores eslint previos `react-hooks/set-state-in-effect` (hace.tsx, historias.tsx, reloj.tsx) | eslint | Son patrones de hidratación (fecha en cliente); arreglar sin provocar #418 |

## P1 · Alto impacto

| ID | Tarea | Origen | Idea de solución |
|---|---|---|---|
| B-10 | `/en-vivo`: 591 KB de JS, 465 textos < 10 px, 22 tocables pequeños | A5 | Dividir paneles con `dynamic()`, subir tipografía, zonas ≥ 24 px |
| B-11 | Portada `/` 2,3 MB | A3 | Revisar fotos del héroe/bento (tamaño servido vs. pintado), `loading=lazy` bajo el pliegue |
| B-12 | `/galeria` 3,6 MB | A1 | Paginar o cargar miniaturas al entrar en pantalla |
| B-13 | `/teatro-3d` 2,3 MB | A2 | Cargar modelos al pulsar; comprimir soldier.glb y tank.glb (gltf-transform, `--formats png` para jpeg) |
| B-14 | Foco visible (`:focus-visible`) en portada.css y piel.css | accesibilidad | Contorno oro 2 px |
| B-15 | Lectura: enlazar actores y conflictos del Núcleo dentro de la nota | Plan F5 | `src/lib/nucleo/relaciones.ts` ya calcula relaciones |
| B-COM | **Auditar estado real** de multijugador, ELO, foros, encuestas, búsqueda, perfiles, Radio, Ojo de Dios | Directiva del Dueño | Probar cada API y cada pantalla; documentar en AUDIT antes de mejorar |

## P2 · Medio

| ID | Tarea | Origen |
|---|---|---|
| B-20 | Recortar 35 descripciones meta a ≤ 160 letras | A8 |
| B-21 | Textos < 10 px en `/catalogo` (494), `/objetivos` (125), `/guerra-hoy` (115) | A6, A7 |
| B-22 | `/escenarios` 1,8 MB | A4 |
| B-23 | Ticker cripto de `/cuartel` a 15 px | pendiente previo |
| B-24 | Actualizar `AGENTS.md` (dice v127 y reglas que ya no aplican) o apuntarlo a `docs/` | ARCHITECTURE |
| B-25 | `/espia` necesita 7 días de datos; contador de Misión 100 necesita almacenamiento KV | pendiente previo |
| B-27 | Medir en producción cuántos eligen cada mundo (sin datos personales) y si la Puerta sube la permanencia | v403.1 |
| B-28 | `next dev` congela el sandbox (2 GB) al compilar el layout raíz: probar `next build` local o un arnés por componente | v403.1 |
| B-26 | El País bloquea lectores automáticos (403): sus notas fuera del cable caen en la página digna | v402.7 |

## Hecho

| Versión | Fecha | Qué |
|---|---|---|
| v402.7 | 2026-11-15 | La nota que no se pierde (`/lectura` ya no da 404 al salir del cable); 6 títulos sin VANGUARD doble; `docs/` y `scripts/qa/` |
| v402.6 | 2026-11-15 | Los nueve módulos: Conocimiento, Secretos, Arsenal, Datos vivos, Medios; portadas `/modulo/<id>`; `/modulos` |
| v402.5.1 | 2026-11-15 | Treinta ajustes (peso, enlaces, títulos, lectura móvil, spot, atajos PWA) |
