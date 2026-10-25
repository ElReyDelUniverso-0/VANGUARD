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
