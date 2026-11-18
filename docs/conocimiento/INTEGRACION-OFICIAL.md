# Integración de Conocimiento Global y plan de 22 departamentos

18 de noviembre de 2026. Este documento amplía la entrega BETA anterior; su aviso de «sin publicación» describe aquella entrega histórica, no acredita el estado actual de producción. El estado definitivo debe comprobarse en Vercel y en las rutas públicas.

## Auditoría inicial y coordinación

La base oficial al comenzar era `5aa37aec4286cb2942711dbe93ea270d32c94bf9`. Durante la implementación entró en `main` `bba18dce25d00f16cab29b0173e915dc8c0ff97a` (arquitectura v412). Se incorporó mediante merge, conservando sus nexos, censo, contratos, laboratorios y página `/arquitectura`. Posteriormente se integraron también `9376fee` y `23959d6` (Investigación Sistémica y su corrección de tipos), conservando íntegramente esa contribución y añadiendo un enlace desde Conocimiento. Se regeneró el censo compartido en vez de resolver a mano su JSON generado. La colisión de contenido funcional fue en la ficha de país: se conservaron tanto la banda de nexos nueva como el puente específico a Conocimiento.

Se descartaron el segundo inventario y el segundo registro de departamentos que se habían preparado en paralelo. **La autoridad única es `src/lib/arquitectura/departamentos.ts` y la puerta pública `/arquitectura`.** Su censo se regenera con `node tools/arquitectura/censar.mjs`. El filtro de departamentos se añadió a esta página existente.

El código oficial ya contenía redacción (`editorial/`), catálogo de datos, perfiles, biblioteca clásica (`knowledge/`), navegación, contratos y quince laboratorios. No se reemplazaron por implementaciones paralelas.

## Funcionalidades de esta entrega

1. Integración de los nueve centros y las treinta áreas de Conocimiento Global: 63 conceptos estructurados, 39 acontecimientos, 16 civilizaciones, 24 organizaciones, 28 referencias, comparadores y 12 series recuperadas. La entrega inicial conserva sus límites documentados.
2. **Academia piloto** en `/conocimiento/aprender`: cuatro rutas y doce actividades. Reutiliza texto y fuentes de los expedientes, corrige respuestas y explica errores. Persiste únicamente actividades resueltas correctamente, sin duplicar progreso por reintentos; permite borrarlo. No envía respuestas al servidor ni emite certificados.
3. **Motor explicativo determinista** en `/api/conocimiento/explicar?tema=pib&nivel=rapido` o `completo`. Devuelve el texto existente, contexto, límites y fuentes según nivel. No genera afirmaciones nuevas. Un tema desconocido devuelve 404 y un nivel inválido 400. Usa el contrato central API v1.
4. **Integración real:** portada, navegación contextual, Núcleo, sitemap, fichas nacionales, enlaces a redacción, datos y laboratorios. Academy y Conocimiento tienen registro de módulo propio; Arquitectura conserva su registro existente.
5. Actualización del registro compartido: Academia y Explicador pasan de «sin construir» a **parcial**. Se añaden las piezas nuevas a los departamentos relacionados sin declarar completadas sus misiones.
6. Filtro de auditorías por consulta en `/arquitectura?q=academia`. Los conteos del censo describen código, **no métricas de audiencia**.

## Archivos principales

- `src/lib/conocimiento/`: contratos tipados, colecciones editoriales, instantánea, adaptador y lógica de aprendizaje/explicación.
- `src/components/conocimiento/`: explorador, estilos aislados, puente nacional y academia.
- `src/app/conocimiento/`, `src/app/api/conocimiento/`: páginas y API.
- `src/lib/arquitectura/departamentos.ts`, `src/lib/arquitectura/censo.json`, `src/app/arquitectura/page.tsx`: autoridad compartida de los departamentos, censo regenerado y filtro.
- `src/lib/nucleo/{registro,fuentes,busqueda}.ts`, `src/lib/navegacion/espacios.ts`, `src/lib/api/catalogo.ts`, portada, sitemap y ficha de país: integraciones aditivas.
- `scripts/conocimiento/`, `qa/conocimiento/`: importadores, semillas y pruebas con evidencia.

No se cambiaron esquema de base de datos, variables de entorno, permisos ni dependencias de producción. No se guardaron credenciales en los archivos.

## Pruebas y resultados

- Suite de integridad/API de Conocimiento: **17 comprobaciones**.
- Suite de contratos, aprendizaje y registro compartido: **11 comprobaciones**.
- Suite de navegador de Conocimiento: **22 comprobaciones**, escritorio y móvil, ejecutadas con las rutas originales en un arnés Next aislado.
- Suite adicional Academia/Arquitectura: **9 comprobaciones** incluyendo reintentos, persistencia, borrado, navegación, API, filtro y móvil. El resultado definitivo y su URL figuran en `qa/conocimiento/academia-navegador.json`.
- Arquitectura: `node tools/arquitectura/probar.mjs`; 22 departamentos y quince modelos, rutas citadas existentes.
- TypeScript focalizado sobre archivos nuevos/modificados. Evitar ejecutarlo simultáneamente con Next/Chromium en entornos de 2 GB.
- Regresiones puras existentes: Travesía (9) y Forja (19), aprobadas.
- La antigua suite monolítica `pruebas-nucleo.mjs` mezcla versiones históricas y pruebas contra servidor: una invocación exploratoria no fue una ejecución válida de regresión. **No se declara aprobada.**

El primer build de preview en Vercel ejecutó el `tsc --noEmit` global seguido de Next, compiló y generó 881 páginas. Esa prueba correspondía al primer commit de integración; la versión fusionada debe tener su propio build aprobado antes de publicar. Los registros del despliegue definitivo prevalecen sobre esta observación intermedia.

## Problemas encontrados y corregidos

- Fuentes y avances concurrentes: merge explícito y eliminación del registro duplicado.
- Colisión en ficha de país: preservadas ambas integraciones, sin descartar trabajo de otra rama.
- Pruebas de rutas dinámicas: se validan patrones y registros, no una carpeta por país/modelo.
- Persistencia local: las pruebas esperan la restauración tras hidratación en vez de confundir el HTML inicial con el estado final.
- `<title>` SVG: se emite una cadena única para evitar advertencias de React en SSR.
- Memoria: servidor de pruebas y TypeScript simultáneos saturaron el sandbox; se detuvieron procesos y se ejecutaron secuencialmente. No se relajaron las reglas de tipos del producto.

## Comprobación adicional de fuentes

Se consultaron los 28 destinos del registro para comprobar disponibilidad (no para validar todas sus afirmaciones): 21 devolvieron HTTP 200, seis bloquearon al comprobador con HTTP 403 y uno devolvió 404. Se corrigió el enlace de ONU-Habitat a la ficha oficial del World Cities Report 2024 y se confirmó HTTP 200. Resultado final: 22 accesibles desde el comprobador y seis restringidos. El informe de disponibilidad conserva el destino anterior y la corrección; no equipara accesibilidad con credibilidad ni revisión académica.

## Pendientes y motivos

Las 22 misiones son un programa progresivo, no 22 departamentos completos en una sola entrega. El registro canónico conserva por departamento infraestructura existente, carencias y siguiente expansión. «En pie» indica una base funcional, no totalidad de la misión.

Siguen pendientes: profundidad editorial y perfiles piloto; fotos/documentos con derechos comprobados; mapas de fronteras históricas reales; revisión científica y pedagógica; FAQ curadas; sincronización de progreso opcional con cuenta; flujos editoriales multiusuario y moderación; trazabilidad afirmación-fuente; distribución social; auditoría forense de analíticas y Search Console. **No se consultaron datos de audiencia ni se inventaron métricas.**

La instantánea estadística conserva seis series fallidas y años faltantes; no son errores ocultados ni ceros inventados. Las 28 referencias seleccionadas no equivalen a 28 fuentes auditadas individualmente. El piloto educativo tampoco sustituye revisión especializada.

## Próxima expansión concreta

- IA 14: prueba pedagógica de estas cuatro rutas con estudiantes/docentes, más actividades y evaluación de accesibilidad.
- IA 15: selector de nivel en las fichas, ejemplos y FAQ curados, siempre reutilizando los mismos expedientes.
- IA 17: registro de afirmaciones y correcciones vinculado a fuentes, sin puntuaciones arbitrarias.
- IA 18/22: carga diferida de indicadores y medición de rendimiento en el producto completo.
- IA 1: actualizar el censo y los contratos al incorporar cada entrega, manteniendo una sola autoridad y respetando las contribuciones concurrentes.

Para ejecutar: `npx --yes --package=tsx tsx scripts/conocimiento/pruebas.ts`, `npx --yes --package=tsx tsx scripts/conocimiento/pruebas-departamentos.ts`, `node tools/arquitectura/probar.mjs`. Navegador: instalar Playwright/Chromium y ejecutar las suites con `KNOWLEDGE_URL` apuntando al entorno deseado.
