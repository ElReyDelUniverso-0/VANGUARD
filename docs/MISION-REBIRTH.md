# MISIÓN 01 · VANGUARD REBIRTH — la arquitectura del ecosistema

**Versión:** v422.0 · **Rama:** `regenesis/rebirth-ecosistema` · **Base:** `3d1c5d5`
**Estado:** construido y verificado en local. **No publicado en producción** (el encargo lo prohíbe sin autorización expresa).

---

## 1 · Auditoría del repositorio (lo que hay de verdad)

Todo lo que sigue se comprobó en el árbol, no se supuso.

| Dato | Valor medido | Dónde |
|---|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript + Tailwind v4 + Prisma/SQLite | `package.json`, `src/app/` |
| Archivos TS/TSX | 1.275 | `find src -name '*.ts*'` |
| Rutas con `page.tsx` | **170** (169 antes de esta misión) | `src/app/**/page.tsx` |
| Rutas de API | **135** | `src/app/api/**/route.ts` |
| Componentes | 25 familias, 190 solo en `src/components/vanguard/` | `src/components/` |
| Portada | `src/app/page.tsx` · 279 líneas, 14 secciones apiladas | — |
| El Cuartel | `src/app/cuartel/page.tsx` + `src/lib/mapa-salas.ts` | — |
| Travesía | `src/lib/travesia/{rastro,espacios}.ts`, `src/components/travesia/*` (5 componentes) | — |
| Navegación | 12 espacios en `src/lib/navegacion/espacios.ts`, destinos derivados en `destinos.ts`, `BarraAdaptativa` montada en `src/app/layout.tsx` | — |
| Módulos | 11 declarados en `src/components/portada/modulos.ts` (10 públicos + «estado»), 76 pestañas | — |
| Estado / preferencias | `localStorage` con claves propias por sala (`vg-rastro-v1`, `vg-brujula-v1`, `vanguard:ciencia:lecturas:v1`, …); no hay store global | `src/lib/travesia/rastro.ts`, etc. |
| BD | Prisma + SQLite (`db/custom.db`), efímera en Vercel | `prisma/schema.prisma` |

### El problema estructural que encontré

La casa **no tenía un problema de componentes: tenía tres front doors compitiendo y ninguna completa**.

1. `AreasRejilla` (`src/components/portada/portada-nueva.tsx`): ocho áreas con **hrefs escritos a mano** (`INDICE_PORTADA`).
2. `ModulosRejilla` (`src/components/portada/modulos-rejilla.tsx`): los **10 módulos públicos**, que solo cubren lo que ya era módulo — ciencia, memoria, lingua, infraestructura o resiliencia entraron después y **no aparecían en la portada como familia**.
3. `/directorio` (`src/app/directorio`): el índice verdadero, pero a dos clics y sin cifras.

Y la jerarquía real de la portada era la de un diario: teletipo → historias de frentes → héroe explicativo (**tres secciones más abajo**) → áreas → noticia grande → destacadas. Quien llegaba de un enlace no sabía qué era Vanguard hasta hacer scroll.

**Decisión:** no se borró ninguna de las tres. Se creó una cuarta pieza que **las lee a todas** y la portada pasó a montarla. Los componentes antiguos siguen exportados (nada de lo que funciona se elimina), pero dejan de competir en la portada.

---

## 2 · Lo que se construyó (código real)

### Archivos creados

| Archivo | Qué es |
|---|---|
| `src/lib/experiencia/registro.ts` | **La fuente única.** Las 10 familias con puerta, experiencias, color, ilustración, espacio de trabajo y **cifras derivadas** de los datos reales (`PUBLICACIONES.length`, `PAISES_GEO.length`, `CURSOS_ACADEMIA.length`, `CATALOGO_INFRA`, `ACONTECIMIENTOS`, `MODELOS`). Exporta `EJES`, `EJE_POR_ID`, `EXPERIENCIAS`, `cifrasEcosistema()` y `ejeDeRuta()`. |
| `src/components/experiencia/entrada.tsx` | La entrada: composición cósmica (CSS puro), un `h1` único, tres acciones y cinco cifras reales. Se apaga con `prefers-reduced-motion`; cero JS de cliente. |
| `src/components/experiencia/ecosistema.tsx` | Las diez familias en una sola composición: número, nombre, promesa, cifras y **cuatro experiencias reales por familia** (40 enlaces). |
| `src/components/experiencia/portada-viva.tsx` | Cuatro aperturas diarias con registros reales: una publicación con su DOI y nivel de evidencia, un expediente de memoria con lo que **no** tiene, una obra del atlas con su fecha y un país de los 249. Selección determinista por día. |
| `src/components/experiencia/experiencia.css` | Sistema visual `vxe-*` (profundidad cósmica, filete y número como estructura, nada de tarjetas flotantes) + hoja de `/ecosistema`. |
| `src/app/ecosistema/page.tsx` | La misma composición con URL propia + índice de las 40 experiencias. **Un componente, dos montajes.** |
| `scripts/pruebas-experiencia.mjs` | 138 comprobaciones: rutas contra `src/app`, duplicados, ilustraciones, cifras no escritas a mano y la portada montando lo nuevo sin perder lo viejo. |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/app/page.tsx` | Nueva jerarquía: **Entrada** (fuera del contenedor, a sangre) → Hilo de la Travesía → **Ecosistema** → **Portada viva** → historias del día → noticia que manda + última hora → destacadas → Descubre hoy → módulos → spot → mapa vivo → regiones → bitácora → salas. Se retiraron de esta página `AreasRejilla` y `HeroeVanguard` (los sustituyen el ecosistema y la entrada). **No se perdió ni una sección**: mapa, hilo, historias, módulos, bitácora y salas siguen montados. |
| `src/lib/nucleo/registro.ts` | Nuevo módulo `mod:ecosistema` (`/ecosistema`) para que el Núcleo lo encuentre y lo busque. |
| `src/lib/bitacora.ts` | Entrada v422.0 con los seis hitos reales. |
| `src/lib/version.ts` | `v422.0 · VANGUARD REBIRTH`. |

### Lo que **no** se tocó, y por qué

- `src/lib/navegacion/*` (espacios, destinos, paneles, contexto): es la navegación global y la está evolucionando otro agente. Mi registro solo **declara** a qué espacio pertenece cada familia; no crea una segunda navegación.
- `src/components/vanguard/navegacion/*`: intacto.
- `src/components/portada/portada-nueva.tsx`: sigue exportando `AreasRejilla` y `HeroeVanguard` (usables en otra sala), solo se dejaron de montar en la portada.
- Autenticación, Prisma, `.env`, `middleware.ts`: sin cambios.

---

## 3 · Pruebas ejecutadas

```
node scripts/pruebas-experiencia.mjs   → ✔ 138 comprobaciones · 10 familias · 40 puertas reales
node tools/ciencia/comprobar.mjs       → ✔ 1237 comprobaciones
node tools/arquitectura/probar.mjs     → TODO LIMPIO (ningún nexo cita una ruta inexistente)
node tools/arquitectura/censar.mjs     → 170 páginas · 135 API · 170/170 con enlaces · 0 huérfanas
npx tsc --noEmit                       → 0 errores
npm run build                          → ver §4
```

(Resultados de navegador y capturas: §4, tras el build.)

---

## 4 · Build, navegador y capturas

```
npm run build                        ✓ compilado · 1.343 rutas prerenderizadas · 0 errores
comprobar_http.py (128 pruebas)      ✔ 128 · 0 fallos (portada, /ecosistema, 13 rutas de ciencia,
                                       sitemap por secciones, llms.txt, health v422.0, DOI reales)
navegador.py (88 pruebas)            ✔ 88 · 0 fallos · escritorio 1280×900 y móvil 390×844
                                       · 0 errores de consola · 0 respuestas ≥400 · 0 desbordes
capturas                             6 del después + 2 del antes (producción v421.9) + 3 recortes
```

Un defecto real encontrado y corregido durante la verificación: en `/ecosistema` el titular con
degradado salía **invisible** porque las variables de color (`--vxe-cian`, `--vxe-oro`) no estaban
definidas en esa página; al invalidarse el `background`, `background-clip:text` dejaba el texto
transparente. Se detectó midiendo el estilo computado en el navegador, no a ojo.

---

## 5 · Límites declarados

1. **No hay curaduría editorial manual** en la portada viva: la selección es automática por día y así se dice en la propia sección. Inventar una selección «editorial» habría sido mentir.
2. **`/ecosistema` cae en la sección «otros» del sitemap por secciones** (la clasificación es por prefijo y no quise tocar `src/lib/seo/secciones.ts`, que es de otro agente). Se anota para quien lleve el SEO.
3. **No he fusionado salas.** El encargo pedía unificar cuando dos secciones hagan lo mismo; en esta pasada la duplicación real era la de las tres front doors (resuelta) y no la de las salas, que tienen datos y funciones propias.
4. **`/cruce` excede los 60 s por página en este sandbox** (2 vCPU / 1 GB): para poder construir subí `staticPageGenerationTimeout` **solo en local** y **no va versionado**. En Vercel el mismo árbol compila sin ese parche.

---

## 6 · Cómo integrar

```bash
git fetch <bundle> refs/heads/regenesis/rebirth-ecosistema:regenesis/rebirth-ecosistema
git checkout regenesis/rebirth-ecosistema
node scripts/pruebas-experiencia.mjs && npx tsc --noEmit && npm run build
# publicar SOLO con autorización:
git push origin regenesis/rebirth-ecosistema:main   # avance rápido, nunca --force
```

## 7 · Cómo deben trabajar los siguientes agentes sobre esta arquitectura

1. **Una experiencia nueva se añade en un sitio:** una entrada en `src/lib/experiencia/registro.ts` (nombre, href real, detalle, cifra derivada) colgada de su familia. Portada, `/ecosistema` y el índice se actualizan solas.
2. **Una familia nueva son dos líneas** (`EJES` + su `ClaveEje`), pero **hay que decidir a qué `espacio` pertenece** (`src/lib/navegacion/tipos.ts`) para que la barra adaptativa y el contexto sigan diciendo la verdad.
3. **Nunca escribas una cifra a mano** en el registro: `valor: \`${ALGO.length}\``. La prueba falla si aparece un número literal.
4. **Nunca enlaces una ruta que no exista**: la prueba compara contra `src/app/**/page.tsx` y falla con el nombre del archivo que falta.
5. **La portada no es un menú**: si añades una sección, que sea contenido (una historia, una apertura, un dato), no otra lista de enlaces.
6. **El `h1` de la casa vive en `entrada.tsx`.** Si otra página necesita su `h1`, que sea el suyo (las páginas interiores ya lo tienen).
