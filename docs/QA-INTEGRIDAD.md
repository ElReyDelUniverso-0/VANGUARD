# EL ARO DE CONTROL · Departamento 10 — Ingeniería y Calidad

**Versión:** v418.2 · **Fecha:** 12 de noviembre de 2026 · **Sitio:** https://vanguard-kq9r.vercel.app

Encargo del Dueño, textual: «Tu misión es convertir todos los avances de Vanguard en un
ecosistema sólido, rápido, estable y coherente. Eres responsable de comprobar que los demás
departamentos no destruyan funcionalidades existentes» y «Vanguard debe ser estable, rápido,
accesible y consistente en escritorio, tabletas y móviles», con prioridad especial en teléfonos
económicos.

Regla de trabajo que se ha seguido, la de la casa: **medir antes de tocar**, arreglar, volver a
medir con el mismo instrumento y no dar nada por terminado sin verlo funcionando en el sitio
publicado.

---

## 1 · El instrumento (lo que no existía)

La casa ya tenía `scripts/auditoria.mjs` (agentes de rutas, enlaces, idioma, recursos, botones,
humo en vivo y densidad): comprueba el **código** y el **HTTP**. Lo que ninguna herramienta veía
es lo que solo se ve con un navegador de verdad. Eso es lo que se añade:

| Herramienta | Qué mide | Estado |
|---|---|---|
| `scripts/qa-navegador.py` **(nuevo)** | 40 puertas × 3 vistas (móvil 360×740, tableta 768×1024, escritorio 1366×768): consola y `pageerror`, peticiones fallidas, desbordes horizontales, paneles flotantes fuera de pantalla o recortados, imágenes rotas/sin `alt`/sin dimensiones, textos < 12 px, objetivos táctiles < 24×24 (WCAG 2.2 · 2.5.8), CLS, tareas largas, FCP/LCP, peso por tipo y nodos del DOM. Escribe acta JSON y **compara dos actas** (`--comparar`) para decir qué empeoró. `--lento` emula CPU 4×. | entrega |
| `scripts/auditoria.mjs` **ampliado** | ① el agente de RECURSOS ya barre `/ilustraciones`, `/enciclopedia`, `/fotos`, `/media`, `/musica`, `/audios` (antes solo `/assets`, `/images`, `/img`, `/fonts`); ② **agente 8** cabeceras de seguridad; ③ **agente 9** contrato `{ok,…}` de las puertas de máquina; ④ **agente 10** busca-claves privadas en respuestas públicas. | entrega |

### La lista de comprobación que se repite después de cada actualización

```bash
node scripts/auditoria.mjs                                   # código: rutas, enlaces, idioma, recursos, botones
node scripts/auditoria.mjs --smoke https://vanguard-kq9r.vercel.app   # + HTTP, cabeceras, contrato, claves
python3 scripts/qa-navegador.py --json qa-hoy.json           # navegador real, móvil
python3 scripts/qa-navegador.py --vista todas --json qa-hoy.json      # + tableta y escritorio
python3 scripts/qa-navegador.py --comparar qa-ayer.json      # ¿qué empeoró desde la última acta?
```

Se considera **roto** y bloquea la publicación: una respuesta ≥ 400 en una puerta, un desborde
horizontal del documento, una imagen rota, un `pageerror`, o CLS > 0,1. Se considera **deuda**
(se anota, se rebaja si se puede y no se esconde): textos < 12 px, objetivos táctiles < 24×24,
tareas largas > 600 ms y CSP ausente.

---

## 2 · Lo que se midió antes de tocar una línea

Acta completa: 39 puertas, vista móvil, sobre la casa publicada (v418.1). Para que el
«antes» y el «después» no dependan de guardar una compilación vieja (los despliegues
antiguos están protegidos por autenticación), el aro aprende a compararse consigo mismo:
`--sin-suelo` borra del CSSOM las reglas de `movil.css` y vuelve a medir **la misma página,
la misma compilación y el mismo aparato**. Las cifras de §6 salen de ese A/B, no de dos
capturas en días distintos.

| Medida | Antes |
|---|---|
| Textos por debajo de 12 px | **9.023** en 39 puertas (225 en `/`, 912 en `/datos-mundiales`, 596 en `/en-vivo`) |
| Objetivos táctiles por debajo de 24×24 | **1.008** |
| Imágenes rotas | **2** (`herramientas.jpg`, `mapas.jpg`) pero **16 respuestas 404** repartidas en 9 puertas |
| `pageerror` de React | **2** — error #418 de hidratación en `/espacio` y `/navegacion` |
| Desbordes horizontales del documento | 0 en las 15 puertas comprobadas antes del barrido completo |
| CLS | **0,000** en las 10 primeras puertas |
| Tareas largas | **0** |

Las dos últimas filas importan tanto como las otras: el trabajo de animaciones de v416–v418 ya
había dejado la casa sin tareas largas ni saltos de maquetación. Este departamento **no lo
rehace: lo vigila**.

---

## 3 · Defectos encontrados y arreglados

### ① Dos ilustraciones que no existen, pintadas encima del titular
`/espacio` pedía `/ilustraciones/herramientas.jpg` y `/navegacion` `/ilustraciones/mapas.jpg`.
Ninguna de las dos está en `public/ilustraciones` (107 piezas). El navegador pintaba el icono de
imagen rota **y el texto alternativo encima del `h1`**, en móvil y en escritorio, y el 404 se
repetía en todas las puertas que enlazan esos módulos: `/directorio`, `/rankings`, `/comparador`,
`/demografia`, `/colecciones`, `/datos`.
**Arreglo:** `/espacio` → `constructor.jpg` (mesa de planos, modelos e instrumentos, que es lo que
describe su `alt`), `/navegacion` → `operaciones.jpg` (cartografía sobre mesa de operaciones).
**Y el punto ciego:** el agente de RECURSOS de la auditoría no miraba `/ilustraciones`. Ahora sí.
Tras el arreglo: **235 recursos pedidos → 0 faltan**.

### ② Error de hidratación #418 en toda sala con «cadena de la verdad»
`FuenteYFecha` imprimía el retraso («40 min de retraso») y la marca `LEÍDO` calculados contra
`new Date()` del servidor y luego contra el del navegador: dos textos distintos para React, que
tira el HTML del servidor y **repinta el árbol entero** en el cliente. En un teléfono humilde eso
es justo lo que no se puede pagar. Estaba en `/espacio`, `/navegacion` y en cualquier sala que
monte el pie.
**Arreglo:** la marca de tiempo se declara como tal (`suppressHydrationWarning` en los tres nodos
que dependen del «ahora»), con el porqué escrito al lado. El sello que se lee sigue siendo el del
servidor, que es el que vale: cuándo leyó la casa el dato.

### ③ El suelo del teléfono (`src/app/movil.css`, nuevo)
Hoja aparte, importada la última en `layout.tsx` para no necesitar ni un `!important`:
- **Lectura:** nada por debajo de 12 px en móvil (12,5 px en las celdas numéricas de las tablas
  de datos). Cubre `time`, `small`, `em`, `.vx-sello`, `.vx-md-meta`, `td.num`, chips editoriales y
  las utilidades `text-[6px]`…`text-[11px]` de Tailwind, que son la mayoría de los casos.
- **Tacto:** `min-height: 24px` en enlaces, botones, `summary`, `select` y campos; `min-width: 24px`
  en botones. Un enlace **en línea dentro de un párrafo** no se ve afectado (las cajas en línea
  ignoran `min-height`), así que la prosa queda intacta.
- **Campos a 16 px:** por debajo de 16 px, Safari en iPhone amplía la página al enfocar un campo y
  ya no la devuelve. El buscador central servía 15 px en una caja de 20 px de alto.
- **Ventanas:** todo `[role=dialog]`/`[aria-modal]` cabe en la pantalla y se puede recorrer
  (`max-height: calc(100dvh - 24px)` + `overflow-y: auto` + `overscroll-behavior: contain`).
- **El muelle contextual** sube por encima de la barra inferior y baja a 0,92 de opacidad: tapaba la
  etiqueta de una cifra en `/espacio` y `/navegacion`.

### ④ `/ajustes` no existía
Devolvía 404 con la casa entera en pie. No es una ruta inventada: es el nombre que cualquiera
escribe. **Arreglo:** `/ajustes`, `/configuracion` y `/settings` aterrizan en `/modo` (MODO Y
CUENTA: tema, nivel de animaciones, sonido y mundo), que es donde viven de verdad.

### ⑤ Tres agentes más en la auditoría
- **Cabeceras (agente 8):** HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` y
  `Permissions-Policy` viajan en todas las respuestas: **5 de 5**. La **CSP no está** y se declara
  como deuda con su plan (§5).
- **Contrato (agente 9):** cinco puertas de máquina (`/api/health`, `/api/mundial`, `/api/auth/me`,
  `/api/creadores/yo`, `/api/duelo`) responden con `{ok,…}` y sin códigos de error: **5 de 5**.
- **Claves (agente 10):** ninguna respuesta pública comprobada lleva dentro una clave privada
  (`ghp_`, `sk-`, claves PEM, `SERVICE_ROLE`, `AUTH_SECRET`).

---

## 4 · Lo que se comprobó y estaba bien (y por tanto no se toca)

- **Cero desbordes horizontales** del documento en 15 puertas a 360 px: los carruseles y tablas
  anchas viven dentro de contenedores con `overflow-x`, que es lo correcto.
- **CLS 0,000** y **cero tareas largas** en las 10 puertas medidas a 360 px.
- **Mapas y salas 3D** (`/teatro-3d`, `/zona-cero`, `/mapas`): cargan, no bloquean la interfaz y no
  dejan errores de consola (solo avisos de rendimiento del driver WebGL del propio navegador).
- **Seguridad:** `/api/escudo` responde 403 fuera del entorno autorizado (falla cerrado),
  `/api/creadores/yo` devuelve `rol: visitante` sin sesión, `/api/auth/me` devuelve `account: null`.
  No hay fuga de datos de otras cuentas.
- **Persistencia:** los componentes que leen `localStorage` lo hacen en `useEffect`, no durante el
  render (patrón correcto, sin desajustes de hidratación). El nivel de animaciones `vg-anim` se
  aplica antes del primer pintado desde el `<script>` del layout.
- **Enlaces:** 302 enlaces del código revisados → 0 rotos; 81/81 rutas estáticas responden en vivo.

---

## 5 · Deuda declarada (no se esconde)

| Deuda | Por qué no se cierra ahora | Plan |
|---|---|---|
| **CSP ausente** | Una CSP mal puesta en una app Next con estilos y scripts en línea rompe la casa entera; hay que desplegarla primero en `Content-Security-Policy-Report-Only`, recoger violaciones y ajustar antes de activarla. | Report-only en una entrega próxima, con el acta de violaciones al lado. |
| **Textos < 12 px que quedan** | El suelo cubre las clases de la casa y las utilidades de Tailwind, pero cada componente puede traer un tamaño en línea (`style={{fontSize}}`) que ninguna hoja alcanza. | El acta JSON los lista por puerta y por selector; se van cerrando componente a componente. |
| **Objetivos táctiles 24×24 restantes** | Los que quedan son iconos de 16–20 px dentro de HUDs densos (teatro, zona cero) donde crecer sin rediseñar el panel es peor que el defecto. | Rediseño del HUD con la rejilla de 24 px, junto al departamento dueño de esas salas. |
| **Peso de la portada (~1,6 MB de imágenes)** | Las 8 ilustraciones del mosaico pesan 114–156 KB cada una y son las de `public/ilustraciones` (1408×704). Reducirlas de verdad exige generar variantes `webp` responsivas con `srcset`, lo que toca 107 archivos y el manifiesto de fotos de otro departamento. | Propuesta concreta: `<picture>` + `-640.webp`/`-1280.webp` generados por `scripts/`, sin cambiar ni un nombre de archivo. |
| **El botón flotante tapa una tarjeta** | Es un elemento de diseño (acceso a la Redacción) que flota sobre el contenido por definición. Se ha separado de la barra inferior y bajado su opacidad; ocultarlo al desplazar necesita JavaScript nuevo en una pieza compartida. | `IntersectionObserver` que lo repliegue a icono mientras se lee. |

---

## 6 · Después — A/B sobre la misma compilación (v418.2b)

Ocho puertas, móvil 360×740, mismo build, midiendo con el suelo encendido y apagado:

| Medida | Sin el suelo | Con el suelo | Diferencia |
|---|---:|---:|---:|
| Textos por debajo de 12 px | 3.546 | **581** | **−84 %** |
| Objetivos táctiles < 24×24 | 926 | **53** | **−94 %** |
| Desbordes horizontales del documento | 0 | **0** | el suelo no rompe ninguna maqueta |
| Peso transferido (KB) | 7.646 | 7.638 | −8 KB (sin coste) |

Por puerta:

| Puerta | Textos < 12 px (antes → ahora) | Táctiles < 24 px (antes → ahora) |
|---|---|---|
| `/divisas` | 1.059 → **32** | 247 → **0** |
| `/datos-mundiales` | 912 → **10** | 219 → **0** |
| `/navegacion` | 436 → **88** | 178 → **10** |
| `/servicios` | 362 → **33** | 36 → **0** |
| `/modulos` | 280 → **226** | 175 → **20** |
| `/` (portada) | 225 → **109** | 22 → **13** |
| `/espacio` | 146 → **45** | 38 → **0** |
| `/editorial` | 126 → **38** | 11 → **10** |

Y el barrido completo de las 39 puertas antes/después del trabajo:

| | Antes (v418.1) | Después (v418.2d) |
|---|---:|---:|
| Respuestas 404 / peticiones fallidas | 16 | **0** |
| Imágenes rotas | 2 | **0** |
| Errores de React (`pageerror`) | 2 (hidratación #418) | **0** |
| Desbordes horizontales | 0 | 0 |
| CLS | 0,000 | 0,000 |
| Tareas largas | 0 | 0 |
| Hallazgos BLOQUEA / ALTA | 1 / 35 | **0 / 0** |

---

### 6.1 · Comprobado también sobre la entrega siguiente (v419.0)

Cuando otro departamento publicó su versión, el aro se volvió a pasar sobre las ocho
puertas: **0 BLOQUEA, 0 ALTA**, cero 404, cero imágenes rotas, cero desbordes y cero
errores de consola; el suelo sigue sirviéndose en la hoja de estilos (una sola hoja con
las reglas de `movil.css`), las redirecciones de `/ajustes` → `/modo` siguen vivas y
`/datos` ya no pide rutas con parámetro. Lo que este informe arregla no se queda en la
versión en la que se arregló: se comprueba en la siguiente.

## 7 · Cómo se repite (y qué significa cada semáforo)

```bash
# 1 · el código y el contrato publicado (10 agentes, sin dependencias)
node scripts/auditoria.mjs --smoke https://vanguard-kq9r.vercel.app

# 2 · el navegador: móvil, tableta y escritorio (necesita playwright)
python3 -m pip install playwright && python3 -m playwright install chromium
python3 scripts/qa-navegador.py --vista todas --json qa-hoy.json

# 3 · ¿qué empeoró desde la última acta?
python3 scripts/qa-navegador.py --comparar qa-ayer.json

# 4 · teléfono económico de verdad (CPU 4× más lenta)
python3 scripts/qa-navegador.py --lento --json qa-lento.json

# 5 · A/B del suelo del teléfono sobre la misma compilación
python3 scripts/qa-navegador.py --sin-suelo --json qa-sin-suelo.json
```

Sale con código 1 si hay un hallazgo **BLOQUEA** (respuesta ≥ 400 en una puerta,
desborde horizontal, `pageerror`), de modo que se puede encadenar a la publicación.
Las cifras de estas herramientas son las que se publican: si una medida no se puede
repetir con el mismo comando, no se escribe.
