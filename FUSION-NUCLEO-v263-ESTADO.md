# ESTADO DE LA FUSIÓN NÚCLEO (hermana ia2, v243.0 → v263.0) — hoja de control

_Abierta: 2026-11-12 · por **ia3** · rama `ia3/fusion-nucleo` · sin tocar una sola línea de código_
_Destino: **v368.0**, la siguiente versión libre de main (la numera y la firma quien fusione, no esta hoja)._

---

## 1. Qué llegó en esta sesión (entregado por el Dueño, vía chat)

| Archivo | Estado en este commit |
|---|---|
| `INSTRUCCIONES-DE-FUSION.md` | **NUEVO** — copiado tal cual, sin editar (es la voz de ia2). |
| `MENSAJE-PARA-LA-OTRA-IA.txt` | **NUEVO** — copiado tal cual, es el texto que el Dueño pega en el chat de la IA que publica. |
| `LEEME-PARA-EL-DUEÑO.md` | **NUEVO** — copiado tal cual (los 2 pasos del Dueño). |
| `AGENTS.md` | Ya existía en main: **idéntico byte a byte** al entregado → no se toca. |
| `COLABORACION-IA.md` | Ya existía en main: **idéntico byte a byte** al entregado → solo se le AÑADE la fila de ia3 (REGLA #1). |
| `HANDOFF-VANGUARD.md` | Ya existía en main: **idéntico byte a byte** al entregado → no se toca. |

## 2. Qué NO llegó (y por eso NO hay fusión en esta rama)

- ❌ **`paquete-fusion-nucleo.zip`** (~20 MB): el `src/` completo de la línea v243→v263, `scripts/`, `media/`, `prisma/` de referencia y, sobre todo, **`MANIFIESTO-DELTA.md`** — el mapa de los 20 commits con los archivos nuevos `[A]` y editados `[M]` de cada versión.
- ❌ El paquete completo de 69 MB (`paquete-fusion-vanguard-v263.zip`, con `public/` íntegro).

**Ley de la casa aplicada:** sin el manifiesto y sin el árbol de origen, nadie reescribe 21 versiones de memoria. Aquí no se inventa código. Esta rama deja la casa preparada y documentada; la absorción se hace cuando el paquete esté en manos de la IA que fusiona.

## 3. Retrato de main al abrir esta hoja (verificado con `git log` / API de GitHub)

- `main` = **bc5a611** · 2026-11-12 03:40Z · `chore(audit): Polaris + Twin-Wing emblem, security/SQL/API hardening…`
- Debajo: **8645761f · v367.0 EL IMÁN GLOBAL** (2026-11-07) — intacta.
- `src/lib/version.ts` → `APP_VERSION = "v367.0"` · `APP_CODENAME = "EL IMÁN GLOBAL"`.
- **Próximo número libre: v368.0** (libre de verdad: no hay rama ni commit con ese número).
- Ramas vivas en el remoto: `main`, `gh-pages`, `ia2/v168.0`, `ia2/v172.0`, `ia2/v174.0`.

## 4. Reparto propuesto (que ia1 confirme o corrija — no se impone nada)

| Empleado | Rama | Tarea |
|---|---|---|
| ia1 (Z.ai, principal) | `main` | Absorción, QA, numeración **v368.0** y publicación. Es su canal, su firma. |
| ia2 (línea local, sin canal de publicación) | — | Autora del paquete v243→v263 (acta, hilo, matasellos, polvo de oro, GOD'S EYE…). |
| **ia3 (Arena)** | `ia3/fusion-nucleo` | Documentación de la fusión en la casa, verificación cruzada en vivo cuando haya despliegue, y este puente con el Dueño. |

## 5. Reglas que esta rama respeta (todas)

1. **REGLA #1 — solo se agrega:** cero archivos borrados, cero código tocado, cero historia reescrita.
2. **`db/` y `prisma/` intocables:** ni un byte, ni `prisma db push`.
3. **No se roba el número:** `src/lib/version.ts` y `src/lib/bitacora.ts` **no** se tocan aquí. El v368.0 lo numera quien fusione, con `git log --oneline -5` delante.
4. **No se sustituye el árbol del paquete:** es material de absorción sobre v367, nunca reemplazo (rebajaría la web viva).
5. **No se despliega** nada desde esta rama.

## 6. QA de esta rama (honesto y proporcional)

- Solo se añadieron `.md` / `.txt`: `npx tsc --noEmit`, `build` y runtime quedan intactos **por construcción** (ningún import, ningún tipo, ninguna ruta).
- QA de la fusión real (queda para el commit v368.0): `tsc` 0 · `build` EXIT 0 · móvil 390 sin desborde · reduced-motion sin transiciones · `/api/health` sirviendo v368.0.

## 7. Siguiente paso exacto (3 movimientos)

1. El Dueño sube **`paquete-fusion-nucleo.zip`** al chat de la IA que va a fusionar (ver `MENSAJE-PARA-LA-OTRA-IA.txt`).
2. Esa IA lee **primero** `INSTRUCCIONES-DE-FUSION.md` y **después** `MANIFIESTO-DELTA.md`, y absorbe aditivamente sobre main.
3. Un commit = **v368.0** con el protocolo de cinco: `bitacora.ts` + `worklog.md` + `agent-ctx/improvement-inbox.md` + `/api/health` + `version.ts`.
