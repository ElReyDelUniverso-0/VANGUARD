
### Despliegue Vercel · MISIÓN 03 (2026-11-19)
- Producción: proyecto `vanguard-kq9r` (`prj_uJKJQvYBrY8wRtsS82Jl73cmj1lB`), build `dpl_9hVywytUiym82gqQNLw1Haz7xyMM` — READY y PROMOTED, commit `922e365` de `main` (descendiente de los commits del Atlas).
- URL: https://vanguard-kq9r.vercel.app — las cuatro puertas, la ficha Golden Gate y `/mundos/us` responden 200; cabecera muestra **v420.3**.
- Sitemap en producción dividido por bloques: el Atlas vive en `/sitemaps/mapas/sitemap.xml` con 179 URLs (puertas + fichas); fichas contradas devuelven 200.
- Build limpio (prisma generate + tsc --noEmit + next build --webpack), cache de build restaurado (hit de rama), lambdas listas en iad1.

### v421.9 · MISIÓN 06 — SCIENCE FRONTIER (2026-11-20)
- El departamento científico publicado: 45 registros con DOI/arXiv, 22 citas verificadas, tipo editorial y nivel de evidencia separados, 13 rutas + `/api/ciencia`, 1.237 comprobaciones propias y el informe completo en `docs/SCIENCE-FRONTIER.md`.

### v422.0 · MISIÓN 04 — VANGUARD WORLDS (2026-11-19)
- **Lo construido**: `/worlds` — cinco MUNDOS explorables como ZONAS GEOGRAFÍCAS REALES (América, Europa, África, Asia, Oceanía), NO un globo giratorio con marcadores. 39 lugares de verdad (lat/lng reales, 20+ países), cada uno linkeando a experiencias EXISTENTES de Vanguard (ficha de país `/mundos/[iso]`, Atlas `/atlas`, obra documentada `/infraestructura/obra/[id]`, historia, datos, ciencia, academia, organizaciones, novedades) — **nada ficticio**: 121 experiencias, 87 rutas distintas, todas verificadas contra el servidor (80/80 → 200).
- **Tres vistas, tres transiciones**: Mundo → Zona → Lugar; ESC vuelve un paso; buscador vuela al lugar; rails de mundos y lugares. Capas conmutables que **REUTILIZAN** las ocho declaraciones del Centro de Mapas (`mapas-payload`) — el mismo globo, la misma fuente, cero mapas duplicados.
- **Tecnología**: sin una sola biblioteca nueva — reuso del motor de la casa `GlobeMap3D` (globe.gl + three.js ya presentes), cliente-only via `dynamic(ssr:false)` (patrón `mundo-3d-vivo.tsx`). Detección WebGL; **alternativa 2D** dibujada en código (SVG, equirectangular) cuando no hay motor o el visitante la pide; LOD por zona; `prefers-reduced-motion`; touch nativo (globe.gl).
- **Arquitectura**: un mundo es una DECLARACION en `src/lib/mundos-vivos/zonas.ts` (`ZonaMundo`) — el sexto mundo no toca ni el globo ni la página. Módulo registrado en `nucleo/registro.ts` (`mod:worlds`), fuente `fnt:mundos-vivos`, constelación `mapa-salas.ts`, pestaña «Mundos vivos» en el módulo Mapa 3D de la portada, sitemap (`/worlds` en `seo/mapa.ts` + sección `mapas`) y `llms.txt` auto-derivado.
- **i18n**: 24 claves `worlds.*` en ES + los 7 diccionarios (en/pt/fr/de/it/ru/zh). Versión **v422.0 · VANGUARD WORLDS**.
- **Pruebas**: tipeado `tsc` limpio (archivos nuevos y tocados); payload verificado en node: 5 zonas / 39 lugares / 121 experiencias / 8 capas, IDs únicos, rutas todas absolutas; `/worlds` → HTTP 200 con el mundo renderizado; las 80 puertas linkeadas responden 200.

### Despliegue Vercel · MISIÓN 04 (2026-11-19)
- Producción: proyecto `vanguard-kq9r` (`prj_uJKJQvYBrY8wRtsS82Jl73cmj1lB`), build `dpl_8GuMpetd691hZcWSduqK97jJ2nuK` — READY y PROMOTED, commit `c6a9fd0` de `main`.
- URL: https://vanguard-kq9r.vercel.app — `/worlds` responde 200 (235 KB) con los cinco mundos renderizados y cabecera **v422.0**.
- Sitemap: `/worlds` indexado en `/sitemaps/mapas/sitemap.xml`; llms.txt y la constelación INTELIGENCIA (19 salas) lo anuncian; la portada muestra la pestaña «Mundos vivos». Todas las puertas linkeadas responden 200.


### v422.2 · MISIÓN 05 — VIDA (2026-11-19)
- **Mandato**: «que Vanguard sea hermoso y dopamínico; el menú no se ve interactivo ni cambiado».
- **Lo construido**: capa de identidad `src/app/vida.css` (paleta de cinco familias, Inter —ya descargada, cero bytes nuevos—, aurora de cuatro orbes, foco que sigue al puntero, cabecera y barra de pestañas animadas, tarjetas con borde de luz, cortina de arranque de 1,7 s una vez por sesión, aparición al desplazar) + cuatro componentes cliente nuevos `components/vida/{aurora,cortina,orbita,para-ti}` + el motor `lib/vida/algoritmo.ts`.
- **El menú**: la órbita —botón flotante con los diez módulos reales de `modulos.ts`, su color y entrada escalonada; cierra con Esc, con un toque fuera o al elegir; `aria-expanded` real; no aparece en `/vanguard2`—. Se SUMA a la cabecera de 03 y a la barra adaptativa: no se sustituye nada.
- **Algoritmo de impresiones**: favoritos (+8), aperturas (+2,2 × min(aperturas,8)), afinidad de grupo (+1,4 ×), novedad (+3 × olvido) y repetición reciente (−4 × decaimiento, vida media 3 días). Determinista (desempate por hash) y **explicable**: cada recomendación dice su razón. Todo en el aparato; nada viaja al servidor.
- **El carril «Para ti»** en la portada: tu tarjeta (degradado estable por persona, inicial, nombre de `/api/auth/me`) y seis puertas ordenadas por tu uso.
- **Pruebas**: `node scripts/pruebas-vida.mjs` → **20 pasan · 0 fallan** (determinismo, saturación, olvido simétrico, afinidad, almacén corrupto, formato zustand de `vg171-favoritos`, tonos estables, razones siempre legibles). Una prueba falló y destapó un fallo real del modelo (lo visto hace un mes seguía castigado): se corrigió el modelo, no la prueba.
- **Accesibilidad**: respeta los tres niveles de `data-vg-anim` y `prefers-reduced-motion`; la aurora solo anima `transform`/`opacity`; la cortina no se gasta en pestaña oculta (prefetch).
- **Documentación**: `docs/VIDA.md`.


### Corrección de render · MISIÓN 04 (v422.0 · 2026-11-19)
- **Diagnóstico** (audit headless con Puppeteer/Chromium + WebGL angle/swiftshader): `/worlds` no tiene errores JS ni parpadeo; el globo y los rails renderizan. El defecto real era geometría: el botón «Capas» flotante estaba `position: absolute` sin antecesor posicionado, por lo que se anclaba al **viewport** (y=12) mientras el escenario está en y=783 — una «mache» visible. Auditoría de geometría: sin overflow horizontal, sin etiquetas duplicadas, sin parpadeo.
- **Correcciones** en `marco-worlds.tsx` y `worlds.css`:
  - Botón «Capas» movido **dentro** de `.vx-worlds-escenario` (que es `position: relative`) — ahora se ancla al escenario, no al viewport.
  - Se eliminan `countryAltitude` y `bordes` del `GlobeMap3D` (props que la casa no usa en `CentroMapas` y que producen artefactos de render) y se pasa `dimColor` de la casa.
  - Zoom por escalera (ladder de altitudes igual al `CentroMapas`) en lugar de altitudes fijas 1.9/0.6; `motionReducido` en `useEffect`.
  - `.vx-worlds` y el escenario refuerzan `min-width: 0` para evitar overflow; rails de mundos colapsados por defecto en móvil (≤900px).
- **Verificación**: tsc limpio en los archivos tocados; redeploy a Vercel (production con más memoria) y re-audito headless para confirmar que el flotante se ancla al escenario. **Resultado PASS**: en 1440×900 el flotante quedó en (x=975, y=796) — DENTRO del escenario (x 274–1106, y 783–1528); antes estaba en y=12 (viewport). En 390×844: flotante en (x=247, y=685), también dentro del escenario; rails colapsados (railZones 0×0); sin overflow horizontal en ambos. Deployment `dpl_9bawQAJ73xA6rAixGdG5xY4w91zG` — READY/PROMOTED, `vanguard-kq9r.vercel.app/worlds` → 200.


### v422.3 · MISIÓN 05 — VIDA 2 (2026-11-19)
- **Mandato**: «míralo, mejóralo, supera lo que hiciste, hazlo 100 veces mejor, púlalo».
- **La órbita 2**: botón magnético con anillo cónico, VELO que desenfoca el resto, BUSCADOR en vivo («ma» → Mapa 3D, Mapas…), dos grupos (Módulos / Tu lado), flechas y Esc con foco devuelto, y **cada puerta anota su impresión** (el menú también enseña al algoritmo).
- **El carril «Para ti» 2**: tarjetas con **inclinación 3D** y foco de luz que sigue al ratón, número fantasma, **ruleta «Sorpréndeme»** (sorpresa con memoria: nunca lo que ya ves, nunca lo abierto en la última hora, prefiere lo nuevo; 500 ms de nombres y aterriza con tarjeta dorada), **medidor vivo** (puertas y aperturas), «Ver doce», «Borrar lo aprendido».
- **Aurora 2**: cinco orbes con **paralaje al puntero** (se escribe una variable CSS por frame) + grano fino de 220 bytes sin peticiones.
- **Pulso de lectura**: línea de luz arriba con el avance, y aparición al desplazar SOLO si el script monta (sin JS todo se ve).
- **Cortina 2**: tres tiempos (marca → lema → módulos reales parpadeando) + línea que se llena + «toca para entrar».
- **Motor**: nuevas piezas puras `elegirSorprendente` y `resumenSenal`, y la memoria central `lib/vida/senal.ts` (una sola clave, tolerante a basura). Una prueba destapó que un valor negativo del almacén inflaba el contador de aperturas: se ignora la basura en el código.
- **Pruebas**: \`node scripts/pruebas-vida.mjs\` → **28 pasan · 0 fallan**.
- **Accesibilidad**: todo respeta \`data-vg-anim\` (completas/reducidas/desactivadas) y \`prefers-reduced-motion\`; inclinación y paralaje se apagan en táctil; la casa inmersiva \`/vanguard2\` sigue sin capas 2D.



### Pulido de render · MISIÓN 04 (v422.3 · 2026-11-19)
- **Plano 2D con fronteras reales**: el plano alternativo de `/worlds` pasó de rejilla + puntos a un mapa de verdad — esfera Natural Earth, reticulado y los polígonos de país de Natural Earth 110m (`COUNTRY_FEATURES`, la misma fuente del Atlas 2D de la casa). Puntos con `<title>` (tooltip) y etiquetas para los lugares del mundo activo.
- **Barra de contexto**: crumbs Mundo → Zona → Lugar con volver al paso anterior y hint de Esc, encima del escenario.
- **Ficha de lugar**: breadcrumb de zona, bandera emoji (ISO2), cuenta de experiencias y animación de entrada.
- **Buscador**: Enter abre el primer resultado; contador en `aria-live`; la búsqueda también casa con la etiqueta y la ruta de la experiencia linkeada. Los resultados transversales muestran el mundo del lugar.
- **Nuevos mandos del escenario**: `⟲` reiniciar la vista (vuela al estado actual) y `⛶` pantalla completa (Fullscreen API, Estado seguido con `fullscreenchange`; Esc también sale).
- **A11y**: `focus-visible` en todos los mandos, `aria-label` en rails, región `aria-live` para el contador de resultados.
- **i18n completo**: las claves `worlds.*` (24 existentes + 8 nuevas) estaban solo en ES; ahora los 7 diccionarios diferenciados (en/pt/fr/de/it/ru/zh) las tienen completas.
- **Pruebas**: `tsc` limpio en los archivos tocados; deployment `dpl_EMzXJSHyvWrPK69hwE2RBgUdCUNr` — READY/PROMOTED, `/worlds` → 200. Audit headless PASS: **0 errores JS**; barra de contexto presente; 6 mandos en el escenario (+, −, ⟲, girar, ⛶, 2D); breadcrumb Mundo → Zona → Lugar; ficha con bandera (🇲🇽) y 4 experiencias; plano 2D con **177 fronteras reales de país**, 39 puntos, 39 tooltips y 8 etiquetas. Audit con locale ES: «Todos los mundos · Esc para volver», «El mundo vivo», cifras 5/39/121 — los diccionarios diferenciados ahora traen las keys completas.

### v431.1 · MISIÓN 05 — VIDA 3 (2026-11-19)
- **Mandato**: «mejora todo lo que hiciste» (tercera vuelta del Dueño sobre la misma capa).
- **Estrella propia**: botón por tarjeta (`vx421-vida-favoritos`), +6 en el algoritmo; la de la casa (+8, `vg171-favoritos`) manda y no se suman. Es un `<button>` FUERA del enlace: HTML válido y sin robar el toque a la tarjeta.
- **El tiempo en palabras**: `haceCuanto()` («ahora mismo», «hace 5 min», «hace 2 h», «ayer», «hace 4 días»…) y cada tarjeta dice cuándo la abriste.
- **Arranque**: si el aparato no ha aprendido nada, tres puertas reales del registro para empezar.
- **La órbita recuerda**: «seguir donde lo dejaste» + las tres últimas puertas con su tiempo; estrellas marcadas (★) en la lista; atajo **/** para abrirla desde cualquier sala.
- **El barrido**: franja de luz al cambiar de sala (0,62 s, sin bloquear clics, se limpia sola, no en la primera carga).
- **Pruebas**: `node scripts/pruebas-vida.mjs` → **35 pasan · 0 fallan** (7 nuevas).
- **Verificado en producción**: marcas `vida-estrella`, `vida-carta-hace`, `vida-arranque`, `vida-orbita-recientes` y `vida-barrido` en la hoja servida; rutas 200; `/vanguard2` sin capas 2D.

### v431.2 · MISIÓN 05 — OPERACIÓN (2026-11-19)
- **Mandato**: «cambia toda la estética de Vanguard completamente: secreta, militar, de gobierno, seria… y sin piedad. Y todos los módulos, en uno solo».
- **Repintado por tokens**: `operacion.css` reescribe `--vx-*` (fondo, cartón, líneas, texto, acento, **radio 0**) y `--vida-*`. La portada entera cambia sin tocar una hoja ajena.
- **Fondo**: fuera la aurora de colores. Entra **retícula de sector** de 64 px, **barrido de radar** cada 9 s, grano documental y viñeta de sala oscura.
- **Voz**: titulares en mayúsculas con **regla roja**, fechas y cifras en **mono**, etiquetas de expediente. Movimiento seco (`steps`), cero rebotes.
- **Terminal de mando** (antes órbita): una sola numeración para toda la casa —**M-01…** los módulos, **T-01…** tu lado—, un solo cuerpo: es el «todos los módulos en uno».
- **Expediente personal** (antes «Para ti»): «OPERADOR: …», foco rojo, fichas de ficha única con hover de barra roja (sin inclinación 3D ni neón).
- **Protocolo de acceso** (antes cortina): «SISTEMA CLASIFICADO · ACCESO AUTORIZADO», línea roja de carga en 20 pasos.
- **Sello de clasificación**: franja de peligro de 3 px arriba + «CONFIDENCIAL · SECTOR 05 · hh:mm:ssZ» en la esquina (oculto en móvil y en `/vanguard2`).
- **Nuevo**: `src/app/operacion.css`, `src/components/operacion/clasificacion.tsx`, `docs/OPERACION.md`.
- **Pruebas**: sin cambios en el motor → `node scripts/pruebas-vida.mjs` sigue en **35 pasan · 0 fallan**.

### v434.0 · NEGRO OSCURO + FOTOS REALES (2026-11-21)
- **Mandato del Dueño**: «los colores de Vanguard deben ser negro oscuro, está muy pintado;
  mejora las ilustraciones, agrega más 3D y más realismo; agregá fotos reales por todo;
  hay mucho texto y no hay imágenes». Tras aclaración: **NO eliminar** las ilustraciones,
  sino **mejorarlas + más realismo**; **fotos reales por todo** (cero IA); **paleta negro oscuro**;
  consolidación de módulos ya hecha en v433.0 (sete módulos, un solo universo).
- **Paleta negro oscuRO** (`src/app/globals.css`): `:root`/`.dark`/`@theme` tokens → fondo
  `#050505`, superficies casi negras, bordes neutros casi invisibles. Los tonos HUD
  (antes caviar/oro/marfil que lampaban) se desaturan a grises oscuros: bronce sobrio
  `#6B5E3E`, rojo crisis atenuado `#8A3028`, y los accents cian/violeta/verde apagados.
  Auroras coloridas → sombras oscuras (opacity 0.30, rgba desaturado); rejilla de oro
  → casi invisible. Se quita el «pinto».
- **Fotos reales por todo**: 334 refs a ilustraciones en 76 archivos → **544 refs a fotos
  reales** (416 `imagenes-reales/` + 128 `assets/real/`); **0 refs a ilustraciones** en el
  código. Mapeo temático (cada módulo/pestanía → foto real coherente: Frente→portaaviones,
  Terreno→satélite, Inteligencia→radar/CIA, Conocimiento→sumeria/arco, etc.). `google-bar.tsx`
  (mapeo dinámico `ILU_DE_SECCION`) y CSS `url(...)` también reconvertidos. El folder
  `public/ilustraciones/` se **conserva** (no se borra, per el mandato).
- **Más realismo**: las portadas y tiles de los 7 módulos ahora muestran fotos reales.
  El set 3D existente (globe-3d, frente-3d, carta-3d, teatro3d/*) se mantiene.
- **Commit**: `f054421` (rebase sobre `523f65c` v433.1; conflicto en `modulos.ts` resuelto
  conservando la pestaña `mi-universo` nueva + fotos reales). Push exitoso.
- **Deployment**: `dpl_A6wxuN21s6BLEjS1zy3tjuJU7cEh` — **READY/PROMOTED**, producción
  `https://vanguard-kq9r.vercel.app`. Build: `prisma generate` + **`tsc --noEmit` PASS** +
  `next build` Compiled successfully (1358 páginas estáticas).
- **Audit headless PASS** (producción): `/` y `/worlds` → HTTP 200; body bg `rgb(6,8,12)`
  (negro oscuro); **0 ilustraciones** (img/css/markup); **0 errores JS**; home renderiza
  **19 background-images de fotos reales** + `/worlds` 1 `<img>` real cargado. Sin regreso
  en MISIÓN 04 `/worlds`.
