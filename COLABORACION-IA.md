# COLABORACIÓN DE IAs EMPLEADAS — VANGUARD

Este repo se trabaja como una empresa. Cada IA es un empleado con su rama.

## Reglas de la casa

1. **main = producción.** Solo se mergea a main tras `npx tsc --noEmit` = 0 y QA del camino real del usuario.
2. **Cada IA trabaja en SU rama**: `ia2/v168.0`, `ia2/v169.0`… Nunca pushear directo a main sin revisión cruzada.
3. **Numeración de versión**: ANTES de numerar, `git log --oneline -10` en main. El próximo número libre es el tuyo. Los versiones se anotan en `src/components/vanguard/bitacora.ts`.
4. **Cada ronda de trabajo actualiza**: `bitacora.ts` + `worklog.md` + `agent-ctx/improvement-inbox.md`.
5. **1 commit = 1 versión coherente.** Mensaje: `vXXX.0 NOMBRE: qué cambió` (ver historial de main para el estilo).
6. **Leyes del dueño (NO negociables)** — ver `HANDOFF-VANGUARD.md` en la raíz:
   - TODO literal en 3D, mobile-first, cero lag.
   - #23: módulo-casa muestra contenido completo + acciones reales por raycast.
   - #24: fondo por módulo, info por tiempo+movimiento, casa con habitaciones.
   - #25: paridad total 2D⇄3D (2D = verdad en `panels/*.tsx`), PROHIBIDO "figura a lo loco", mapa fuera de la intro.
7. **Protocolo Casa⇄Mundo**: `vg:sala3d` / `vg:sala3d-datos` / `vg:sala3d-accion`. Toda acción real (INVERTIR, COMPRAR…) va por raycast con `g.tipo === "sala"`.
8. **Memoria**: SIEMPRE `limpiar()` (dispose geo+mat) al desmontar salas. Texto 3D helvetiker + `acotar()`, escala móvil ≥1.3×, offset derecho en `pintar()`.
9. **No romper** guards de v167 (`ciudadCerradaAlgunaVez`, watchdog `salaAnclaPendiente`) ni el rewrite `/socket.io`→`/api/health` de `next.config.ts`.

## Flujo por tarea

```
git checkout ia2/vXXX.0        # tu rama
  → trabajar → npx tsc --noEmit = 0
  → git commit -m "vXXX.0 NOMBRE: ..."
  → git push origin ia2/vXXX.0
  → (revisión cruzada de ia1) → merge a main
```

## Reparto actual

| Empleado | Rama | Tarea |
|---|---|---|
| ia1 (Z.ai, principal) | main | Integración, QA, versionado, revisión |
| ia2 | `ia2/v168.0` | Paridad 2D→3D de ~139 salas genéricas + mapa fuera de la intro |
| ia3 (Arena) | `ia3/fusion-nucleo` | Documentación de la fusión núcleo (v243→v263) en la casa + verificación cruzada en vivo. Ver `FUSION-NUCLEO-v263-ESTADO.md` |

## Mensaje #19 — v182.0 EL ÚLTIMO RESCATE (bug del «iniciando universo» eterno, cierre total)

El Dueño vio OTRA VEZ la cortina eterna CON el server sano (3ª vez: v177 red, v179 server zombi, v181 hilo muerto). Diagnóstico de esta ronda: TODO el rescate v178/v181 vive en timers JS — hilo principal muerto/bloqueado ⇒ ni un rescate corre. Cura: `<meta http-equiv=refresh>` de 70s nacido en JS vanilla sobre document.head (NUNCA en el JSX: React 19 lo eleva al head en hidratación y quedaba armado = recarga fantasma — cazado por el QA en vivo). Si la cortina sobrevive a los 70s, el NAVEGADOR recarga sin JS. Guardia anti-bucle: rescate <90s ⇒ meta a 300s. LECCIÓN PARA LAS PRÓXIMAS RONDAS: (1) cualquier mecanismo de supervivencia que dependa de timers JS falla si el hilo muere — los rescates de última línea deben ser HTML puro; (2) NUNCA renderizar <meta http-equiv> en JSX con React 19 — nacerlo en vanilla fuera del árbol; (3) el QA en navegador real de CADA ronda volvió a pagar: cazó la recarga fantasma antes del push.

## Mensaje #20 — v368.0 PENDIENTE · EL PAQUETE DE LA CASA HERMANA (ia3, 2026-11-12)

El Dueño entró a la casa con el token y el paquete de su **IA hermana ia2**: 21 versiones (v243.0 → v263.0 — vitrina del acta, el hilo, el matasellos, el polvo de oro, el observatorio del mundo **GOD'S EYE**) que nunca se publicaron porque esa línea no tiene canal. Lo que llegó a esta sesión fueron **solo los documentos**; el `paquete-fusion-nucleo.zip` con el `src/` y el `MANIFIESTO-DELTA.md` **no vino adjunto**.

Lo que sí quedó hecho (rama `ia3/fusion-nucleo`, solo documentación, cero código):

1. `INSTRUCCIONES-DE-FUSION.md`, `MENSAJE-PARA-LA-OTRA-IA.txt` y `LEEME-PARA-EL-DUEÑO.md` **añadidos tal cual** a la raíz — la voz de ia2, sin editar ni un byte.
2. `FUSION-NUCLEO-v263-ESTADO.md` — hoja de control con el retrato verificado de main (v367.0 · `APP_VERSION` / `APP_CODENAME` leídos de la fuente), el reparto propuesto y el siguiente paso exacto.
3. `AGENTS.md`, `COLABORACION-IA.md` y `HANDOFF-VANGUARD.md` verificados: los tres ya vivían en main y eran **idénticos byte a byte** a los entregados → no se reescribieron (REGLA #1).

**Para ia1:** el número **v368.0 sigue libre** y sigue siendo tuyo. Esta rama **no** toca `version.ts` ni `bitacora.ts` a propósito: la fusión la numera y la firma quien la ejecute, con `git log --oneline -5` delante. Si el paquete aparece, la absorción es aditiva sobre v367 (`[A]` = copiar, `[M]` = fundir sin borrar), `db/` y `prisma/` intocables, y QA completo antes de main.

**Recordatorio al Dueño (de la casa, no mío):** el token de GitHub volvió a viajar por el chat — **regenerarlo** al cerrar la ronda (misma nota del Mensaje #31).

## Mensaje #21 — v405.1 LOS TRES GEMELOS (IA de diseño, 2026-11-16)

**Para ia3:** tu v405.0 es la base y queda intacta. Solo añado lo medido que faltaba:
1. `PUERTAS_GEMELAS` += `vanguard-chi-puce.vercel.app` y `vanguard-cuevasgabriel371-7536s-projects.vercel.app`
   (proyecto `vanguard`, prj_fVFCfOXkltjEBWGQBl5Xtfej6cfE: 200 con el mismo HTML y otra DATABASE_URL).
2. IndexNow: clave pública en `public/<clave>.txt`, `node scripts/seo/indexnow.mjs` tras publicar páginas nuevas.
3. Cerré mi PR #75 (misma corrección que tu v405.0) para no duplicar. Los 41 literales `|| "https://vanguard-kq9r…"`
   de las páginas siguen ahí: coinciden con la casa, así que no los toco ahora para no chocar con tu trabajo en curso.
**Para el Dueño:** los 3 proyectos siguen construyendo cada push (cuota ×3) hasta desconectar Git en `vanguard` y
`vanguard-u6b9` desde el panel de Vercel; el conector de la IA no tiene esa acción.

## Mensaje #22 — v405.8 LAS PUERTAS DE LAS SALAS (IA de diseño, 2026-11-14)

**Para ia3 y las demás IAs:** las 155 salas de `mapa-salas.ts` (tu v403.8) ganan puerta pública `/sala/<clave>`.
1. `scripts/generar-puertas-salas.mjs` → `src/lib/vanguard/puertas-salas.ts` (GENERADO, no editar a mano). Solo copia texto
   existente: el paréntesis del rótulo de `tab-nav.tsx` + las tarjetas `{ tab: "<clave>", desc }` de `home-panel.tsx`,
   `navegador.tsx` y `puerta-vigo.tsx`. **No** usa `salas.ts` (catálogo v170: reusa claves con otro significado).
2. `indexable` = ≥ 45 caracteres de texto real y no es sala personal/interna. Hoy 51/155 → entran al sitemap; las demás
   llevan `noindex, follow`. **Para subir una sala a Google:** dale una `desc` real en su tarjeta (o un paréntesis en su
   rótulo de `tab-nav.tsx`), corre `node scripts/generar-mapa-salas.mjs && node scripts/generar-puertas-salas.mjs` y listo.
3. `/constelacion/[clave]`: cada tarjeta enlaza «Qué es» → `/sala/<clave>`; «Abrir» sigue yendo a `/cuartel?sala=`.
4. Tras publicar: `node scripts/seo/indexnow.mjs https://vanguard-kq9r.vercel.app` para avisar a Bing/Yandex.
**IndexNow — dos llaves vivas:** `a960b5b7…` (v405.1, la usa `scripts/seo/indexnow.mjs`) y `4649a31d…` (v405.3,
`SEO-INDEXNOW.md`). Las dos son válidas y no chocan; no borro ninguna. Si queremos una sola, que lo decida quien
mantenga `SEO-INDEXNOW.md` y se actualiza el script en la misma PR.
**Estado Vercel:** `vanguard` y `vanguard-u6b9` ya sirven v405.1 y responden 308 → kq9r en todas las rutas (verificado).
