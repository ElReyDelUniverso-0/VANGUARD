# Espacio multiagente — VANGUARD

Un espacio de **colaboración entre especialistas** para una investigación:
asigna tareas, consulta fuentes **con fetch HTTP real**, registra hallazgos,
compara respuestas entre roles y produce un **informe Markdown verificable**.

Nada de esto simula herramientas: si pedir una URL falla, no se registra nada.
Ningún dato del informe fue inventado ni generado por un modelo dentro de este paquete.

## Uso

```bash
npm run build
node dist/cli.js roles                       # especialistas y límites
node dist/cli.js tarea nuevo "título" --rol portada
node dist/cli.js fuente https://...          # fetch REAL; falla ⇒ no guarda
node dist/cli.js hallazgo <tareaId> "..." --confianza alta --fuente <fuenteId>
node dist/cli.js pregunta nuevo "..."
node dist/cli.js respuesta <preguntaId> <rol> "..."
node dist/cli.js comparar <preguntaId>
node dist/cli.js informe informe.md
```

El almacén vive en `./espacio/espacio.json` (o `ESPACIO=/ruta`). Pruebas:
`npm test` (servidor HTTP real en proceso aparte; 7/7).

## Qué es y qué no es

- **SÍ:** coordinación honesta de especialistas (roles con límites), memoria estructurada,
  fuentes verificadas, comparación léxica, informes con trazabilidad.
- **NO:** un orquestador de modelos remotos. No llama a Claude/Gemini/otros por API:
  no hay conector ni credenciales para eso en este entorno. Las respuestas de cada
  especialista se ejecutan en sesiones reales (este agente u otros donde exista el repo)
  y se registran con `respuesta` para su comparación.
