# VANGUARD SCIENCE FRONTIER (v421.9)

Departamento científico de la casa pública: **descubrimiento**, no divulgación.
No repite los artículos de la Enciclopedia; indexa publicaciones reales y
explica cómo se movió una idea.

Puerta pública: `/ciencia` (dentro de `https://vanguard-kq9r.vercel.app`).

## 1 · Qué hay dentro

| Pieza | Ruta | Qué resuelve |
|---|---|---|
| Centro | `/ciencia` | Portada, buscador, cifras, taxonomía editorial |
| Explorador | `/ciencia/explorador` | Una pregunta y todos sus pasos (interactivo + enlaces sin JS) |
| Buscador | `/ciencia/buscar` | Texto, disciplina, tipo, evidencia, idea, años, orden; estado en la URL |
| Ficha | `/ciencia/publicacion/[id]` | Autores, fecha, medio, identificador, huella, citas verificadas, original |
| Idea | `/ciencia/idea/[id]` | Línea de evolución, grafo de citas, preguntas abiertas, premios y métodos |
| Disciplina | `/ciencia/disciplina/[id]` | Investigaciones por fecha dentro de la materia |
| Cronología | `/ciencia/cronologia` | 53 entradas fechadas con su tipo |
| Instituciones | `/ciencia/instituciones` | 10 instituciones con URL comprobada y vínculo documentado |
| Premios | `/ciencia/premios` | 6 Nobel con motivación literal + traducción de trabajo |
| Experimentos | `/ciencia/experimentos` | 9 métodos con «qué no demuestra» |
| Tecnología | `/ciencia/tecnologia` | 7 avances con madurez y límite |
| Biblioteca | `/ciencia/biblioteca` | 5 estanterías curadas, índice completo y estantería personal |
| Método | `/ciencia/metodo` | Procedencia, taxonomía, límites y reproducción |
| API | `/api/ciencia` | El índice en JSON con los mismos filtros |

## 2 · Los dos sellos (la regla del Dueño)

**Tipo editorial** — dónde se publicó:

- `articulo` — revista que declara arbitraje. *El DOI acredita registro, no calidad.*
- `preprint` — arXiv. *Moderación, no arbitraje.* Si es una versión, se declara.
- `revision` — síntesis de literatura; no aporta medición nueva.
- `divulgacion` — comunicado o nota institucional; no añade evidencia.

**Nivel de evidencia** — qué sostiene la afirmación:

`medicion` · `experimento` · `observacional` · `inferencia` · `hipotesis` ·
`sintesis` · `demostracion` · `registro`

Una idea puede estar `demostrado` y contener pasos que fueron `hipotesis`: el
explorador y la cronología lo marcan paso a paso. `tools/ciencia/comprobar.mjs`
falla si una hipótesis aparece redactada como hallazgo.

## 3 · Procedencia

Capturado el **2026-11-18** desde:

- **Crossref REST** (`api.crossref.org/works/{DOI}`): título, autores, ORCID
  cuando existe, revista, fecha (con el campo usado) y referencias citadas.
- **arXiv** (`arxiv.org/abs/{id}`): versión v1, fecha de depósito, autores y
  `citation_doi` si el depósito lo declara.
- **Europe PMC**: comprobación de DOI y PMID de la literatura biomédica.
- **NobelPrize.org**: motivación literal de cada fallo.
- **Clay Mathematics Institute**: estado declarado del problema de Poincaré.
- **Cabeceras institucionales**: 12/12 respondieron 200 en la captura.

Cada registro guarda `sha256` de la respuesta cruda, `metadatos` (URL consultada)
y `original` (DOI o arXiv). Las capturas crudas no se publican; la huella sí.

Índice: **42 publicaciones** (34 artículos, 5 prepublicaciones, 3 revisiones) +
**3 registros institucionales** = 45. **9 ideas**, **6 disciplinas**, **53
entradas** de cronología, **22 citas verificadas** entre registros del índice.

## 4 · Reproducir

```bash
python tools/ciencia/capturar.py    # metadatos reales + premios + instituciones
python tools/ciencia/construir.py   # valida y escribe src/lib/ciencia/*.json
node   tools/ciencia/comprobar.mjs  # 1.237 comprobaciones
```

`construir.py` se niega a construir si un vínculo, una fecha o un premio citan
algo que no existe. `comprobar.mjs` comprueba además que cada ruta publicada
tiene su `page.tsx` y que el centro está enganchado a la casa.

## 5 · Integración nativa

- `src/lib/nucleo/registro.ts`: `mod:science-frontier`, `mod:science-explorador`, `mod:science-biblioteca`.
- `src/lib/nucleo/fuentes.ts`: `fnt:ciencia` (pública).
- `src/lib/nucleo/busqueda.ts`: proveedor propio en la búsqueda global.
- `src/components/portada/modulos.ts`: módulo «Science Frontier» (10 pestañas).
- `src/lib/navegacion/espacios.ts`: herramientas en el espacio de trabajo.
- `src/lib/seo/mapa.ts` + `src/lib/seo/secciones.ts` (sección «educación e investigación»), `src/app/llms.txt/route.ts`, `src/lib/api/catalogo.ts`.
- `src/lib/arquitectura/departamentos.ts`: el departamento pasa de «sin construir» a «parcial».

## 6 · Límites declarados

- No es exhaustivo: 9 preguntas elegidas por valor de método.
- No es una revisión sistemática ni declara haber revisado toda la evidencia.
- No busca en el texto completo del artículo: título, autores, revista, lectura,
  identificador e idea.
- No hay recolector programado: el índice se reconstruye a mano.
- No hay datos de afiliación salvo cuando el registro los publica; por eso 7 de
  las 10 instituciones figuran sin vínculo documental, y así se dice.
