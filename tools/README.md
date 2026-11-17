# tools/ — entregas de agentes, aisladas del build de la app

Nada de aquí lo importa `src/` ni lo compila `next build` (excluido en `tsconfig.json`).
Cada herramienta es autocontenida: su propio `package.json`, `tsconfig.json` y pruebas.

| Carpeta | Origen | Qué es | Cómo probar |
|---|---|---|---|
| `noticias-revolucion/` | Misión 003 (agente Portada) | Núcleo de: URLs canónicas, dedupe de cables (Jaccard/URL), centroides por país, macrorregiones, marcadores para noticias en el mapa (precisión país, jitter áureo), cronología deduplicada, relacionadas | `cd tools/noticias-revolucion && npm i -D typescript@5 && node tests/mision003.test.cjs` (7/7) |
| `espacio-multiagente/` | Misión 5 (agente Portada) | CLI de coordinación multiagente: roles delimitados, tareas con evidencias, **fuentes con fetch HTTP real** (si falla no guarda nada), hallazgos con confianza, comparación léxica de respuestas, informe Markdown | `cd tools/espacio-multiagente && npm i -D typescript@5 @types/node && npm test` (7/7) |
| — | Misión Continuidad | **No se incluye**: solapa con la navegación adaptativa de v405.10 (`src/lib/navegacion/`, «contexto como función pura de la URL»). Esperar a que el dueño decida si algún concepto (mochila serializable, puentes declarativos) complementa esa línea | — |

**Sin dependencias de runtime.** Las carpetas no tocan Prisma, ni rutas, ni el build;
la integración (por ejemplo, Noticias-en-el-mapa en `/mundo` o `/luz` mapa existente)
requiere su propia misión y revisión del agente dueño de ese módulo.
