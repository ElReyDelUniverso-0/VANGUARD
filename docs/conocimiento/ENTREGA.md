# VANGUARD · Global Knowledge Expansion

**18 de noviembre de 2026 · Primera entrega funcional BETA · Sin publicación en producción**

## Qué está implementado

Una expansión aditiva en la rama local `feature/global-knowledge-expansion`, basada en el repositorio público VANGUARD, revisión `9ee9fbe18dc4dbbcb6e8f9d46d48f9fa7178aa86`.

| Cobertura | Entrega |
|---|---:|
| Centros de investigación | 9 |
| Áreas temáticas | 30 |
| Expedientes conceptuales originales | 63 |
| Acontecimientos con contexto y referencias | 39 |
| Civilizaciones comparables | 16 |
| Organizaciones internacionales | 24 |
| Referencias institucionales/editoriales | 28 |
| Identidades de países y territorios reutilizadas | 249 |
| Países/territorios con observaciones estadísticas | 215 |
| Observaciones nacionales disponibles | 35.463 |
| Series del Banco Mundial recuperadas | 12 de 18 solicitadas |
| Rutas públicas del nuevo espacio | 103 |

Los nueve centros cubren investigación histórica, análisis económico, investigación geográfica, investigación científica, recursos naturales, tecnología, estudios demográficos, civilizaciones y desarrollo mundial. Las treinta áreas abarcan los dominios de la misión, incluidos océanos, biodiversidad, infraestructura, agricultura y relaciones internacionales.

### Funciones utilizables

- Enciclopedia con búsqueda normalizada, filtros, paginación y fichas con rutas propias.
- Expedientes con explicación, mecanismo, contexto, límites, pregunta de investigación, cronología asociada, relaciones y referencias. Algunos incorporan series estadísticas de contexto pertinentes; no se añaden indicadores irrelevantes a toda ficha.
- Nueve centros navegables y treinta páginas de área.
- Cronologías filtrables y explorador geográfico de acontecimientos.
- Comparador de países: mismo año y unidad, series históricas, ausencias explícitas y exportación CSV.
- Comparador cualitativo de civilizaciones, sin puntuaciones de superioridad.
- Biblioteca temática y lecturas guardadas localmente en el navegador.
- Buscador de conceptos, explorador de organizaciones, glosario, estadísticas, mapa de indicadores y red de relaciones editoriales.
- API pública acotada y validada para las colecciones editoriales.

### Integración aditiva

Se incorporan acceso desde portada y navegación, registro/fuente/proveedor en el Núcleo, sitemap y una tarjeta de conexión desde las fichas existentes de país. Se reutilizan identidades y polígonos del sistema Mundos. Las fichas enlazan mapas, noticias/búsqueda y simulación con coordenadas. No se sustituyen las implementaciones anteriores ni se alteran sus datos.

## Validación realizada

- **TypeScript focalizado: aprobado**, incluyendo el módulo, las rutas/API y archivos modificados de integración (país, portada, navegación, Núcleo y sitemap).
- **17 comprobaciones de integridad y API: aprobadas.** Unicidad, referencias, cobertura, cronologías, datos, ausencias, rutas, validación y paginación.
- **22 comprobaciones de navegador: aprobadas** sobre la vista React/Vite y, en la ejecución final, sobre las rutas originales ejecutadas en un arnés Next.js. Incluyen 18 comprobaciones de escritorio y cuatro de móvil; sin excepciones JavaScript, sin desbordamiento horizontal a 390 × 844.
- **Rutas originales Next.js en arnés aislado:** portada, expediente PIB, área, centro y API respondieron 200; tipo de API inválido respondió 400 y tema inexistente 404. Se verificó canonical en el expediente.
- **Compilación de la vista Vite: aprobada**, con advertencia de tamaño de paquete (aprox. 1,33 MB JS sin comprimir por los datos completos).
- **Regresiones existentes:** Travesía, 9 pruebas; Forja, 19 pruebas; aprobadas.
- `git diff --check`: sin errores.

Los JSON, capturas y CSV de `qa/conocimiento/` acompañan el código. Las pruebas verifican funcionamiento y consistencia estructural: **no equivalen a revisión académica independiente de cada afirmación**.

## Límites que importan

1. **No es una enciclopedia mundial terminada.** La cobertura editorial inicial es transversal pero breve: 63 expedientes, aproximadamente dos por área. Falta profundizar cada campo y ampliar historias nacionales. El sistema muestra cuando no tiene acontecimientos específicos de un país en lugar de fabricar una historia genérica.
2. Las visualizaciones entregadas son SVG: gráficos, relaciones, esquemas y cartografía. **No incluye un archivo fotográfico/arqueológico ni una ilustración científica específica y licenciada por cada expediente.** Esta parte de la ambición de la misión queda pendiente.
3. La instantánea estadística fue capturada el `2026-11-18T18:55:49.875Z`, solicita años 2010–2025 y no es información en tiempo real. Cada serie puede tener años faltantes. No se interpola ni se sustituye un dato ausente por cero.
4. Seis series fallaron durante la importación: acceso a electricidad, valor añadido agrícola, superficie forestal y escolarización secundaria (HTTP 502); impuestos y extracción de agua (tiempo agotado). El importador y la interfaz lo declaran. Los países sin datos permanecen accesibles.
5. Las 28 referencias son un registro seleccionado, no 28 sitios auditados individualmente. Se consultaron documentación del Banco Mundial, Carta de la ONU, síntesis AR6 del IPCC, catálogo OpenStax y lista UNESCO; otros destinos requieren verificación editorial enlace por enlace antes de publicación.
6. **No se completó el chequeo TypeScript ni la compilación Next de toda la aplicación**: el chequeo global agotó la memoria del entorno. El arnés Next prueba el módulo con sus rutas originales, no todos los layouts, middleware, servicios o rutas del producto. La integración completa debe validarse en CI con más memoria.
7. El payload inicial del observatorio requiere optimización adicional (carga diferida por herramienta/serie). Las rutas profundas reducen el conjunto estadístico/cartográfico enviado, pero aún hay margen.
8. No se modificó producción, no se hizo push, PR ni despliegue. Los problemas detectados anteriormente en módulos ajenos no se consideran corregidos por esta entrega.

## Archivos de entrega

- `VANGUARD-GLOBAL-EXPANSION.zip`: código nuevo y archivos modificados en estructura de repositorio, scripts, datos, QA y documentación. Es un **overlay**, no un clon completo.
- `expansion.patch`: parche Git binario completo respecto a la revisión base indicada.
- `fuentes/`: el mismo overlay descomprimido, para inspección.
- `next-rutas.json`: comprobaciones HTTP del arnés Next.
- Registros de compilación, TypeScript y pruebas junto a este informe. `ingestion.log` corresponde al primer intento fallido, no a la instantánea final; la instantánea y su informe interno son la fuente de verdad.

## Reproducción e integración

En un clon limpio del repositorio, en la revisión base, **elegir una sola vía**:

```sh
git switch -c feature/global-knowledge-expansion
git apply --check /ruta/expansion.patch
git apply /ruta/expansion.patch
# Alternativa: copiar el contenido de fuentes/ sobre el clon; no aplicar además el parche.
npm ci
npx prisma generate
npx tsc --noEmit -p tsconfig.conocimiento.json
npx --yes --package=tsx tsx scripts/conocimiento/pruebas.ts
```

No se cambiaron dependencias de producción ni el esquema de base de datos. El chequeo focalizado cubre los archivos modificados pero no garantiza el resto del repositorio.

Para la vista independiente de la implementación:

```sh
npm install --no-save --package-lock=false vite@6 tsx playwright
npx tsx scripts/conocimiento/exportar-preview.ts
npx vite --config knowledge-preview/vite.config.mjs --host 0.0.0.0
npx playwright install --with-deps chromium
node scripts/conocimiento/pruebas-navegador.mjs
```

La vista Vite adapta únicamente sus enlaces hacia módulos antiguos para abrir el sitio canónico; los componentes entregados mantienen rutas relativas. No es sustituto del despliegue completo Next.

Para comprobar el producto integrado, arrancar el Next del repositorio y ejecutar `KNOWLEDGE_URL=http://127.0.0.1:3000 node scripts/conocimiento/pruebas-navegador.mjs`. En CI ejecutar además el build y las pruebas globales existentes con recursos suficientes. Las dependencias de pruebas son herramientas de desarrollo opcionales y no se añadieron al lockfile del producto.

### Actualizar contenidos y datos

- Editar colecciones tipadas en `src/lib/conocimiento/` y ejecutar las pruebas. Si se regeneran semillas, orden obligatorio: `semilla-editorial.py` → `semilla-historica.py` → `semilla-sociedades.py` (el segundo añade relaciones cronológicas).
- `node scripts/conocimiento/actualizar-indicadores.mjs` vuelve a consultar el Banco Mundial, usa caché diaria por serie y registra fallos. Revisar el resultado antes de sustituir la instantánea publicada.
- API: `/api/conocimiento?q=tectonica&tipo=conceptos&limite=10&desde=0`. Tipos: `conceptos`, `acontecimientos`, `civilizaciones`, `organizaciones`; área opcional mediante `area`. Límite 1–50 y desplazamiento 0–10000. Sin cuentas privadas ni acceso a BD.

## Puerta de publicación recomendada

1. Integrar en una rama de revisión sobre la versión vigente y resolver divergencias con la base.
2. Build completo/CI, comprobación de layouts y enlaces en staging, revisión de accesibilidad y rendimiento.
3. Revisión editorial, comprobación de referencias y plan de imágenes con licencia/procedencia.
4. Reintentar las seis series fallidas y conservar los avisos si continúan faltando.
5. Aprobar explícitamente la publicación. Solo después desplegar.
