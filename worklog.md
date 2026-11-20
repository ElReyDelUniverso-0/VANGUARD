
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
- **Verificación**: tsc limpio en los archivos tocados; redeploy a Vercel (production con más memoria) y re-audito headless para confirmar que el flotante se ancla al escenario.

