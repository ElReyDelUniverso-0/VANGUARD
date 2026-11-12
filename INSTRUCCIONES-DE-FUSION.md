# INSTRUCCIONES DE FUSIÓN (NÚCLEO) — para la IA que publica (v367 · EL IMÁN GLOBAL)

De: tu IA hermana (línea local v243→v263, entregada por el Dueño).
Objetivo: **absorber aditivamente** 21 versiones de trabajo dentro de TU main y publicarlas con tu canal. Una sola línea de vida.

## 0. Qué hay dentro (NÚCLEO = solo código, ~20 MB)

```
vanguard2-v263-nucleo/
├── src/                    (TODO el código: componentes, app, lib — tsc 0 / build EXIT 0 en su era)
├── scripts/                (derivaciones tsx de datos + suites QA playwright/python)
├── media/                  (audios de la emisora — por si acaso; seguramente ya los tienes)
├── prisma/                 (schema de referencia — NO ejecutar, NO sobrescribir)
├── MANIFIESTO-DELTA.md     (los 20 commits con archivos A/M por versión ← TU MAPA DE TRABAJO)
├── worklog.md / improvement-inbox.md  (el porqué y el cómo de cada pieza, con QA registrado)
├── configs + .md de la casa
```

**NO trae `public/`**: el análisis git confirma que esta línea NO añadió NI modificó ni un solo archivo de `public/` — todos los assets ya existen en tu árbol (base común). Si un build reclamara algún asset, pídelo al Dueño: el paquete completo (69 MB) con `public/` íntegro está en manos del Dueño.
**NO trae `db/`**: TU base de datos viva manda. Jamás la sobrescribas.

## 1. Reglas de la casa (no negociables)

1. **REGLA #1: solo se AGREGA, nunca se elimina.** Si algo tuyo y algo mío coinciden, se funden en uno más completo — no se borra historia.
2. **db/prisma: intocable.** Sin `prisma db push`. Tu `DATABASE_URL` sigue igual.
3. **Numeración**: manda tu `git log --oneline -5`. Versión de fusión = siguiente número libre (hoy, v368.0). 1 commit = 1 versión.
4. Antes de main: `npx tsc --noEmit` = 0 + build EXIT 0 + QA real.

## 2. Orden de absorción

1. Lee `MANIFIESTO-DELTA.md`: archivos `A` = NUEVOS (copiar tal cual); `M` = editados (absorber de forma aditiva sobre TU versión del archivo — nunca reemplazo ciego).
2. Piezas mayores:
   - `src/components/vanguard/observatorio-planeta.tsx` + `observatorio-mapa-2d.tsx` + `src/app/api/ojo/observatorio/route.ts` → GOD'S EYE observatorio del planeta (9 capas públicas: GDELT, NASA EONET, USGS, GDACS, Open-Meteo/CAMS, EEI; ventana informativa con FUENTE ORIGINAL y FECHA REAL; plano 2D; filtros). Se monta desde el panel ojo-dios (import + montaje).
   - Bloques `.gen-*` de `globals.css` (vitrina del acta v248, hilo v250, matasellos v254, polvo de oro v255...) y componentes de panels/ que los usan.
   - `scripts/datos_vXXX.ts` (data real derivada tsx) y `scripts/qa_vXXX.py` (suites re-ejecutables).
3. Archivos compartidos (`M`):
   - `src/lib/bitacora.ts`: AÑADE mis 21 entradas (v243.0→v263.0) tras las tuyas, texto íntegro. Las dos historias son verdad.
   - `src/lib/version.ts`: manda TU numeración; el codename de la fusión lo pones tú (ej. «v368.0 · LA FUSIÓN DE LAS DOS CASAS»).
   - `globals.css`: si colisión de clases, gana la tuya y renombra la mía con prefijo — no silencies ninguna.
   - `package.json`: une dependencias (mi línea añadió jsdom y @types/jsdom en devDependencies — las usan suites QA).
4. Registra: bitacora + worklog + inbox + health (protocolo de cinco).

## 3. QA antes de publicar

`tsc = 0` · `build EXIT 0` · suites scripts/qa_*.py aplicables · móvil 390px sin desborde · reduced-motion sin transiciones (doctrina v243) · `/api/health` con la versión de fusión.

## 4. Advertencia crítica

**NO despliegues este árbol tal cual sustituyendo al tuyo** — es material de ABSORCIÓN sobre tu v367, no sustitución (rebajaría la web viva).
