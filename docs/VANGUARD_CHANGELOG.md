# VANGUARD — CHANGELOG

> Resumen técnico por versión. El detalle para el público vive en `src/lib/bitacora.ts` (sala Novedades).
> Dos IAs publican en `main`: la IA de diseño y ia3. Cada entrada dice quién.

## v402.7 · LA NOTA QUE NO SE PIERDE — 2026-11-15 (IA de diseño)
- `/lectura/<clave>` ya no da 404 cuando la nota sale del cable vivo: `buscarNota` lee la ficha OpenGraph del propio
  medio (lista cerrada de 11 dominios, https, redirecciones verificadas, charset respetado, coletilla del medio fuera).
  Sin título o fecha declarados por el medio → página «Esta nota ya salió del cable vivo» (noindex) con enlace al original.
  Dominio ajeno → 404.
- 6 títulos con «VANGUARD» doble corregidos (/conflictos, /vanguard2, /voz, /musica, /catalogo, /herramientas).
- Nuevos `docs/` (plan, arquitectura, auditoría, backlog, changelog, pruebas) y `scripts/qa/auditoria-movil.py`.

## v402.6 · LOS NUEVE MÓDULOS — 2026-11-15 (IA de diseño)
- Inteligencia (16 salas) se reparte en Conocimiento, Secretos, Arsenal, Datos vivos y Medios; /cruce y /herramientas ganan módulo.
- Portada propia por módulo (`/modulo/[id]`, estática, 404 si no existe), índice `/modulos`, sección «Mucho más que noticias» en la portada.
- Cabecera con 8 módulos (sin desborde 1024–1920 px), barra móvil con «Módulos», nombre del módulo visible en móvil.
- Arreglo de build: entrada de bitácora sin `tipo` (TS2741).
- Restauración: v402.5.1 y v402.6 reaplicadas encima del Eje del Día de ia3 tras la sobrescritura de `a52189e`.

## v402.5.1 · TREINTA AJUSTES — 2026-11-15 (IA de diseño)
- Peso: /armeria 11,1→2,8 MB, /galeria 11,4→~3 MB, mech-leela.glb 2,4 MB→665 KB, caché de estáticos 7 días.
- Enlaces: `/cuartel?sala=`, redirecciones de rutas muertas, catálogo sin enlaces a APIs.
- SEO: 29 títulos, 5 descripciones, h1 en /vertigo y /vanguard2. Accesibilidad: salto al contenido, piso de lectura móvil.
- Enganche: spot de 30 s en portada con WhatsApp/descarga, claves de la crónica por WhatsApp, atajos PWA.
- (Numerada v402.5 en origen; renombrada para no chocar con la v402.5 de ia3.)

## v402.5 · EL EJE DEL DÍA — 2026-11-15 (ia3)
- `components/vanguard/eje-del-dia.tsx`: efemérides en un eje de tiempo real en /historia y /cruce.

## v402.4 · LA DISTANCIA DE CASA (ia3) · v402.3 (ia3)
- /cruce: sismos y alertas medidos en km desde la casa.

## v402.2 · UNA PORTADA POR SALA · v402.0 · LOS CINCO MÓDULOS (IA de diseño)
- `PortadaSala` en las salas de texto; salas agrupadas en módulos con pestañas; Estado de Vanguard.

Versiones anteriores: ver `worklog.md` y `src/lib/bitacora.ts`.
