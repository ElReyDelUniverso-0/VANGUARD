# CÁMARA DE INTELIGENCIA — el centro de investigación de Vanguard

**Versión:** v419.1 · **Sala:** `/inteligencia` · **Código:** `src/lib/centro/`, `src/app/api/centro/`, `src/components/vanguard/centro/`

Este documento no vende: **declara qué hace el sistema, con qué infraestructura real, qué se midió y qué no puede hacer.** Si algo de aquí no se puede repetir con un comando, no debería estar escrito.

---

## 1 · Qué existe de verdad (infraestructura, no promesas)

| Pieza | Estado real | Cómo se comprueba |
|---|---|---|
| Proveedor de modelo | **Vivo.** `iaParalela()` (gateway Z.ai + vía alternativa) responde en producción | `POST /api/mente {modo:"investigar"}` devuelve `ia:true` |
| Corpus de la casa | **Real.** 10 dossiers + enciclopedia + fichas de país + expedientes, indexados en memoria | `GET /api/centro/buscar` → `censo` |
| Buscador global del núcleo | **Real.** Reutilizado para el feed vivo (noticias, teatros) | `GET /api/nucleo/busqueda?q=taiwan` |
| Lector de PDF | **Propio, sin dependencias** (Node `zlib`) | Pruebas de §5 |
| Lector de DOCX | **Propio** (zip + deflate) | Pruebas de §5 |
| Persistencia | **Navegador del operador** (localStorage) + export `.json` | La BD de Vercel es efímera (`src/lib/db.ts`) |
| OCR | **No existe.** Ni servicio ni dependencia instalada | Un PDF escaneado se rechaza con motivo |
| Búsqueda semántica vectorial | **No existe.** La selección es léxica con IDF | — |

No se ha instalado nada nuevo: `package.json` no cambia. Todo el lector de documentos se apoya en `zlib`, que ya venía con Node.

---

## 2 · El flujo que pidió el Encargo, tal cual

> «El usuario debe poder escribir una pregunta, seleccionar fuentes, investigar, guardar resultados y continuar posteriormente.»

1. **Escribir la pregunta** → `POST /api/centro/buscar`.
2. **Seleccionar fuentes** → la respuesta trae las fuentes candidatas con una **muestra de lo que se citará** de cada una; el operador marca casillas (las tres mejores vienen premarcadas). También puede añadir sus documentos.
3. **Investigar** → `POST /api/centro/investigar` con los ids elegidos.
4. **Guardar** → pestaña *Proyectos* (localStorage) con export/import `.json`.
5. **Continuar** → *Proyectos* reabre la investigación entera; *Historial* guarda las últimas 60 preguntas.

---

## 3 · Las tres casillas: hechos, interpretación, no confirmado

Cada afirmación se publica así, y **la regla se hace cumplir en código**, no se pide por favor al modelo:

```
Afirmacion { texto, clase: "HECHO" | "INTERPRETACION" | "NO_CONFIRMADO", fuentes: string[], nota? }
```

El validador (`validarAfirmaciones`, `src/lib/centro/sintesis.ts`):

- **Cita obligatoria para HECHO.** Si el modelo marca `HECHO` sin citar ninguna fuente del material, o cita un identificador que no existe, la afirmación **se degrada a `NO_CONFIRMADO`** y se escribe la razón (`nota`) en el informe. No se borra en silencio: se enseña.
- **Sólo se puede citar lo que se entregó.** Al modelo se le pasan pasajes numerados `[F1]…[Fn]`; cualquier `[F9]` inventado se rechaza y se cuenta en `avisos`.
- **La bibliografía no la escribe el modelo.** Sale de `fuentesMetodologicas` de los dossiers y de `fuentes` de los artículos de la enciclopedia (texto + BibTeX).

---

## 4 · El motor se declara siempre

`Investigacion.motor` es `"llm"` o `"determinista"`, y la interfaz lo pinta en la cabecera de la respuesta:

- **`llm`** — el proveedor respondió; síntesis redactada + citas validadas.
- **`determinista`** — sin proveedor (o a petición con «Sólo extractos»): respuesta **extractiva**, citas literales ordenadas por pertinencia, confianza calculada por cobertura. La sala lo dice con la palabra «extractivo», no lo disfraza de análisis.

Nunca hay un tercer estado en el que la casa responda sin decir con qué.

---

## 5 · Lo que se midió (no lo que se supone)

### Lector de PDF

| Archivo | Antes del trabajo | Ahora |
|---|---|---|
| `dummy.pdf` (W3C, Identity-H, fuentes CID) | 0 caracteres → «sin texto» | **«Dummy PDF file»**, calidad `alta` |
| `arxiv.pdf` (Attention is all you need, 15 págs., pdftex) | 39 caracteres basura | **38.263 caracteres legibles**, calidad `alta` |

Lo que hizo falta, en el orden en que se descubrió:

1. Leer **objetos** (`N 0 obj … endobj`) en vez de buscar «stream» en el archivo entero (el binario de una imagen se confundía con una página).
2. **Objetos comprimidos (`/Type /ObjStm`)**: los PDF modernos meten ahí fuentes y mapas; sin abrirlos no se encuentra nada.
3. **`/ToUnicode` con Identity-H**: los PDF de Word/Chrome escriben códigos de glifo, no letras. Sin el mapa, todo son símbolos.
4. **`/Differences`**: fuentes viejas y TeX declaran sus glifos por nombre (`/a`, `/uni00E1`).
5. **Arrays `TJ`**: la forma dominante de pintar texto en pdftex. Sin entenderlos se perdía el 90 % del texto.
6. **El espacio es un glifo sin nombre**: se detecta entre dos letras y se convierte en espacio (antes: `DummyPDFfile`).

### Lector de DOCX

Documento de prueba de tres párrafos → texto completo + fecha `12 de marzo de 2026` extraída. Sin dependencias: zip local + `inflateRaw`.

### Detector de contradicciones (determinista)

Dos informes de prueba sobre el mismo recorte de la OPEP:

```
A: «recorte de 2 millones de barriles diarios», 12 de marzo de 2026
B: «recorte de 3 millones de barriles diarios», 14 de marzo de 2026
→ cifra : «Informe A da 2 millones; Informe B da 3 millones para el mismo asunto (marzo · 2026 · opep · recorte).»
→ fecha : «Informe A fecha el asunto en 12 de marzo de 2026; Informe B en 14 de marzo de 2026.»
```

Cuatro clases, todas comprobables a mano: **cifra** (misma unidad, distinto valor), **fecha** (mismo hecho, distinto día), **atribución** (distinto sujeto), **polaridad** (uno afirma, otro niega).

### Extracción de entidades

- **Fechas:** ISO, `dd/mm/aaaa` y «12 de marzo de 2026» → normalizadas a ISO.
- **Lugares:** contra el **atlas real** (`PAISES_ATLAS`): 249 países y sus capitales. Un lugar que no está en el atlas no se inventa.
- **Posibles nombres:** heurística de mayúsculas, **restando el atlas y las organizaciones** (para que «Arabia Saudí» no salga como señor Saudí). La interfaz lo llama «posibles nombres», no «personas identificadas».
- **Acontecimientos:** frases con verbo de acción + fecha cercana. (Aquí se encontró un fallo real de JavaScript: `\b` no funciona tras vocal acentuada —`/anunció\b/` nunca casa—; la frontera se escribe a mano.)

---

## 6 · Integración con la casa (no es una maqueta aparte)

| Desde | Qué pasa |
|---|---|
| `/investigacion` | Tarjeta de entrada a la Cámara en la cabecera de los dossiers |
| `/datos-mundiales/pais/[iso]` | «Investigar este país en la Cámara →» abre la sala con la pregunta ya escrita (`?q=`) |
| Fuentes citadas | Cada cita lleva su ruta real (`/investigacion/<slug>`, `/conocimiento/enciclopedia/<slug>`, `/datos-mundiales/pais/<iso>`, `/conocimiento/tema/<id>`) |
| Núcleo | El feed vivo entra como fuente `nucleo:…` cuando la pregunta pide actualidad, y se marca como tal |
| Temas relacionados | Salen de `buscarFuentes()` sobre el corpus real: no son sugerencias inventadas |

---

## 7 · Contrato de las puertas de máquina

Todas devuelven `{ ok, … }` y tienen muro por IP (mismo patrón que `/api/asistente`):

| Ruta | Cuerpo | Devuelve |
|---|---|---|
| `GET/POST /api/centro/buscar` | `{ pregunta, vias?, vivo? }` | `{ ok, candidatas[], vivas[], censo, avisos[] }` |
| `POST /api/centro/investigar` | `{ pregunta, fuentes[], documentos?, sinModelo? }` | `{ ok, investigacion }` |
| `POST /api/centro/informe` | `{ investigacion }` | `{ ok, informe }` (incluye `markdown`) |
| `POST /api/centro/documento` | multipart `archivo` **o** `{ texto, nombre? }` | `{ ok, documento }` |
| `POST /api/centro/documento/preguntar` | `{ documento, pregunta, sinModelo? }` | `{ ok, respuesta, citas[], vacio }` |
| `POST /api/centro/documento/comparar` | `{ a, b }` | `{ ok, comparacion }` |

Límites: 400 caracteres de pregunta, 4 MB por archivo (límite real de la función), 3 documentos por investigación, 12 investigaciones/minuto por IP.

---

## 8 · Límites declarados (y por qué)

1. **No hace OCR.** Un PDF escaneado devuelve `422` con el motivo. Inventar texto sería peor que no leerlo.
2. **No navega Internet abierta.** El modelo sintetiza sobre el corpus de la casa y los documentos del operador. La búsqueda web en vivo tiene su propia sala (`/api/mente`, modo `investigar`) y aquí no se duplica.
3. **No hay búsqueda vectorial.** La selección de fuentes es léxica con IDF (BM25 simplificado): encuentra sinónimos que estén en el texto, no conceptos que no aparezcan escritos.
4. **No hay sincronización entre dispositivos.** Lo guardado vive en el navegador; se exporta a `.json`. La BD de Vercel es efímera por diseño y prometer permanencia en servidor sería mentir.
5. **El extractor de nombres es heurístico.** Puede confundir una organización con una persona; por eso se resta el atlas y se llama «posibles nombres».
6. **La calidad de un PDF puede ser `parcial`.** Con fuentes simbólicas sin `ToUnicode` ni `/Differences` no hay forma honesta de descifrar; se dice y se mide el porcentaje de caracteres legibles.

---

## 9 · Cómo se repite la medición

```bash
# censo del corpus (cuántas fuentes y pasajes puede citar la Cámara)
curl -s https://vanguard-kq9r.vercel.app/api/centro/buscar | head -c 300

# buscar fuentes para una pregunta
curl -s -X POST https://vanguard-kq9r.vercel.app/api/centro/buscar \
  -H 'Content-Type: application/json' \
  -d '{"pregunta":"¿por qué la litografía ultravioleta es un cuello de botella?"}'

# investigar con las dos primeras fuentes
curl -s -X POST https://vanguard-kq9r.vercel.app/api/centro/investigar \
  -H 'Content-Type: application/json' \
  -d '{"pregunta":"¿por qué la litografía ultravioleta es un cuello de botella?","fuentes":["dossier:semiconductores-litografia"]}'

# analizar un PDF
curl -s -X POST https://vanguard-kq9r.vercel.app/api/centro/documento \
  -F archivo=@informe.pdf
```

---

## 10 · Archivos

```
src/lib/centro/tipos.ts        contrato compartido (afirmaciones, fuentes, proyectos)
src/lib/centro/texto.ts        normalización, BM25, troceado, entidades, contradicciones
src/lib/centro/corpus.ts       corpus de la casa + selección de fuentes + bibliografía
src/lib/centro/documentos.ts   lector PDF/DOCX, entidades, calidad de extracción
src/lib/centro/sintesis.ts     prompt, validador de citas, informe, preguntas, comparador
src/lib/centro/store.ts        proyectos, historial y documentos en el navegador
src/app/api/centro/**          seis puertas de máquina
src/app/inteligencia/page.tsx  la sala
src/components/vanguard/centro/  la interfaz (cuatro pestañas + piezas)
```

Sin dependencias nuevas. Sin servicios externos nuevos. Con el proveedor que la casa ya tenía.

---

## 11 · Medido en producción (`https://vanguard-kq9r.vercel.app`, 12 nov 2026)

Todo lo de abajo se ejecutó contra el sitio publicado, no contra un entorno local.

### Corpus y búsqueda

```
GET /api/centro/buscar → {"fuentes":181,"pasajes":1234,
                          "porVia":{"dossier":10,"enciclopedia":24,"pais":84,"concepto":63}}
POST buscar «¿por qué la litografía ultravioleta extrema es un cuello de botella?»
  → 11 candidatas + 6 vivas; la primera, el dossier de semiconductores (121,04 puntos),
    con muestra del pasaje que se citará
```

### Investigación con modelo

```
POST /api/centro/investigar (dossier:semiconductores-litografia)
  motor: llm · 10,5 s · confianza 80/100
  3 HECHO (cada uno con su cita validada) + 1 INTERPRETACION
  0 citas rechazadas · bibliografía: SIA 2025, ASML 2025, CSIS 2024
```

### Documentos

```
POST /api/centro/documento  (attention.pdf, 15 págs, 2,1 MB)
  calidad: alta · 38.263 caracteres · 44 trozos · 1,8 s
POST documento/preguntar  «¿Qué es la atención multi-cabeza?» (pregunta en español, documento en inglés)
  aviso: se buscó con el vocabulario equivalente (attention, mechanism, transformer, multi, head)
  → fragmentos pertinentes citados por página (la expansión funciona; el proveedor
    cayó en esa llamada y se respondió en modo extractivo, declarándolo)
POST documento/comparar  (dos informes de contraste sobre el mismo asunto)
  solapamiento 77 % · 3 contradicciones:
    cifra 2 vs 3 millones · cifra 60 vs 90 millones · fecha 12 vs 14 de marzo de 2026
```

### Informe

```
POST /api/centro/informe → 9 secciones, 2.945 caracteres de Markdown y 424 de BibTeX
  RESUMEN · CONTEXTO · HECHOS CON FUENTE · INTERPRETACIÓN · NO CONFIRMADO ·
  LECTURA PROVISIONAL · CONTRADICCIONES · LAGUNAS · BIBLIOGRAFÍA
```

### Recorrido completo en un navegador real (390×844, móvil)

Guion automatizado sobre la sala publicada:

| Paso | Resultado |
|---|---|
| Abrir `/inteligencia` | 200, título correcto, 0 errores de consola |
| Preguntar «¿Qué dicen las fuentes sobre el estrecho de Malaca?» | **20 fuentes**, 3 premarcadas |
| Investigar | las cinco casillas presentes (hechos, interpretación, no confirmado, pasajes, bibliografía) |
| Generar informe | generado con bibliografía |
| Crear proyecto y recargar | el proyecto **sigue ahí** (`vg:centro:v1:proyectos`) |

### Aro de calidad del departamento 10 sobre la sala nueva

```
/inteligencia  ·  móvil 360×740  ·  0 desbordes  ·  CLS 0  ·  0 tareas largas  ·  0 pageerror
```

En la primera pasada el aro cazó un **React #418** en la sala: `hayAlmacen()` se
preguntaba durante el primer render (el servidor no tiene localStorage y el
navegador sí). Corregido: se decide después de montar.
