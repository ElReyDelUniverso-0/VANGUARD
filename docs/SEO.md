# VANGUARD · Infraestructura de indexación (v421.0)

> Todo lo que sigue está **medido**, no supuesto. Fecha de la ronda: 2026-11-19.
> Dominio auditado: `https://vanguard-kq9r.vercel.app` (proyecto Vercel `vanguard-kq9r`).

---

## 1. Qué hay hoy (censo en vivo)

| Dato | Valor medido | Cómo se midió |
|---|---|---|
| URLs anunciadas antes | 3.766 | `<loc>` de `/sitemap.xml` (628 KB, un solo archivo) |
| URLs anunciadas ahora | **3.987** | índice + 7 archivos de sección |
| Páginas que responden 200 | **349 de 349** (muestra) | Googlebot UA, 8 hilos |
| Canónica propia | 348 de 349 | `rel="canonical"` vs URL pedida |
| Palabras por página (media) | **769** | texto visible del HTML inicial (sin JS) |
| JSON-LD por página | 100 % de la muestra | `application/ld+json` |
| Latencia | p50 149 ms · p90 468 ms · máx 3,6 s | red real, no laboratorio |
| Páginas con `<h1>` | 348 de 349 | recuento de `<h1>` |
| Títulos duplicados | **0** | sobre la muestra |
| Robots | `/robots.txt` 200, solo bloquea `/api/` | — |
| Dominios propios en Vercel | **0** | API de Vercel `list_domains` |
| Propiedades en Search Console | **0** (sin un solo correo de GSC) | Gmail `search console` |

Conclusión honesta: **el contenido ya está a la altura** (769 palabras de media, canónica, JSON-LD, 200 en todo). El problema no era el contenido: era la **puerta** (dominio), la **estructura del mapa** y un puñado de defectos que impedían indexar páginas concretas.

---

## 2. Defectos encontrados y su estado

| # | Defecto | Gravedad | Estado |
|---|---|---|---|
| D1 | La canónica del sitio es `vanguard-kq9r.vercel.app`, alias de proyecto. `vanguard.world` **no tiene DNS** (NXDOMAIN) y `vanguard.vercel.app` **no es nuestra** (otra app, «Vanguard Elegance», 742 B). | **crítica** | **pendiente de ti**: registrar dominio y poner `NEXT_PUBLIC_SITE_URL` |
| D2 | Search Console sin configurar: no hay forma de enviar sitemaps ni de saber qué se indexa. | **crítica** | **pendiente de ti** (credenciales) |
| D3 | El layout raíz declaraba `canonical: "/"`; Next lo **hereda** en toda página hija sin canónica propia → `/academia` y `/academia/ejercicios` respondían 200 declarándose duplicados de la portada (nunca se indexan). | **alta** | **corregido** (v421.1) |
| D4 | `/datos-mundiales/pais/[iso]` tiene **217 fichas reales** (52 indicadores con fuente) y **ninguna** estaba en el mapa. | **alta** | **corregido** (69 → 287 en la sección de información) |
| D5 | 5 páginas con 200 y sin `noindex` fuera del mapa: `/datos`, `/tierra`, `/sistema`, `/inteligencia`, `/navegacion`. | media | **corregido** |
| D6 | Un solo sitemap de 628 KB: Search Console informa por archivo, así que un fallo de una sala se lee como fallo del sitio entero. | media | **corregido** (índice + 7 secciones) |
| D7 | `/academia/ejercicios` no tenía **ni un `<h1>`** (su título real era `<h2>`). `/cuartel` sigue sin `h1` (es una app a pantalla completa: decisión pendiente). | baja | **corregido** (uno), pendiente (otro) |
| D8 | 13 páginas con **dos `<h1>`** (casi todas `/infraestructura/obra/*`). | baja | pendiente |
| D9 | El mapa anuncia paginación con parámetros: `/conflicto/ukraine?page=2..5`. Cada una se autocanoniza (válido), pero son 8 URLs de contenido casi idéntico. | baja | decisión pendiente: URLs limpias `/pagina/N` o sacarlas |
| D10 | Las URLs de conflicto están en inglés (`/conflicto/ukraine`) y el contenido en español. El usuario busca «guerra de Ucrania». | media | **decisión pendiente** (ver §5) |
| D11 | `/conflicto/ucrania`, `/conflicto/estrecho-taiwan`, `/datos-mundiales/pais/tw` → 404. No es un fallo del código: los teatros viven en `TEATROS` con claves inglesas y Taiwán no está en el catálogo del Banco Mundial. | informativa | documentado |
| D12 | Tres puertas sirven el mismo código (`vanguard-u6b9`, `vanguard-chi-puce`, `vanguard-cuevasgabriel371…`). Medido: las dos primeras redirigen **308** a la casa y la tercera responde **302 a SSO de Vercel**. Contenido duplicado: **ninguno**. | ok | verificado |

---

## 3. La infraestructura nueva

```
/sitemap.xml                          → <sitemapindex> con 7 archivos
/sitemaps/noticias/sitemap.xml        2.002 URLs   (las noticias + las salas del archivo)
/sitemaps/geopolitica/sitemap.xml        67 URLs   (9 teatros de guerra, redes, poder)
/sitemaps/mapas/sitemap.xml             507 URLs   (atlas, mundos, salas, infraestructura)
/sitemaps/educacion/sitemap.xml       1.086 URLs   (enciclopedia, lingua, memoria, academia)
/sitemaps/informacion/sitemap.xml       287 URLs   (217 fichas de país + centros de datos)
/sitemaps/simuladores/sitemap.xml        20 URLs
/sitemaps/herramientas/sitemap.xml       18 URLs
```

Reglas del sistema:

- **Una URL vive en UNA sección** (duplicar en el mapa es pedirle a Google que elija).
- **Ninguna se pierde**: lo que no casa con ninguna regla cae en `otros` y la prueba lo delata. Hoy `otros` está vacío.
- **La sección vacía no se anuncia**: el índice solo lista archivos con URLs.
- **Sección desconocida = 404**, nunca un sitemap vacío.
- **Memoria de 10 minutos por instancia**: el mapa se construye una vez y se reparte; sin esto cada archivo repetiría las mismas consultas.
- **`lastmod` real**: el de la última noticia de cada sala; el resto, ninguna fecha (mejor ninguna que una fingida).
- **Límites del protocolo respetados por archivo**: 50.000 URLs / 50 MB. El mayor hoy: 2.002 URLs / 286 KB.

Archivos nuevos:

```
src/lib/seo/mapa.ts        ← el antiguo src/app/sitemap.ts, con la lógica intacta
src/lib/seo/secciones.ts   ← a qué sección pertenece cada ruta
src/lib/seo/xml.ts         ← protocolo sitemaps (módulo puro, testeable)
src/lib/seo/entrega.ts     ← memoria + reparto por sección
src/app/sitemap.xml/route.ts                        ← el índice
src/app/sitemaps/[seccion]/sitemap.xml/route.ts     ← los hijos
scripts/prueba-sitemap.mjs  ← prueba sobre las URLs reales
scripts/seo-panel.mjs       ← panel de indexación (HTML autocontenido)
```

---

## 4. Cómo se prueba (y qué salió)

```bash
node scripts/prueba-sitemap.mjs https://vanguard-kq9r.vercel.app/sitemap.xml
node scripts/seo-panel.mjs https://vanguard-kq9r.vercel.app 300
```

Salida real de la prueba (sobre las 3.766 URLs que la casa ya anunciaba):

```
✓ 3766 URLs repartidas = 3766 anunciadas (ninguna perdida)
✓ la fuente no trae URLs repetidas
  ✓ sitemap-noticias.xml      2002 URLs   286 KB
  ✓ sitemap-geopolitica.xml     66 URLs     9 KB
  ✓ sitemap-mapas.xml          506 URLs    66 KB
  ✓ sitemap-simuladores.xml     20 URLs     3 KB
  ✓ sitemap-educacion.xml     1086 URLs   145 KB
  ✓ sitemap-informacion.xml     69 URLs     9 KB
  ✓ sitemap-herramientas.xml    17 URLs     2 KB
✓ el índice anuncia 7 archivos (uno por sección con URLs)
✓ PRUEBA SUPERADA
```

En dev local, con la rama puesta:

```
GET /sitemap.xml                          200  (índice, 8 hijos listados)
GET /sitemaps/noticias/sitemap.xml        200  2002 URLs
GET /sitemaps/geopolitica/sitemap.xml     200    67 URLs
GET /sitemaps/mapas/sitemap.xml           200   507 URLs
GET /sitemaps/simuladores/sitemap.xml     200    20 URLs
GET /sitemaps/educacion/sitemap.xml       200  1086 URLs
GET /sitemaps/informacion/sitemap.xml     200   286 URLs   ← +217 fichas de país
GET /sitemaps/herramientas/sitemap.xml    200    17 URLs
GET /sitemaps/inexistente/sitemap.xml     404
GET /academia                      canónica → /academia            (antes: → la portada)
GET /academia/ejercicios           canónica → /academia/ejercicios (antes: → la portada)
```

---

## 5. Decisiones que necesitan al Dueño

1. **Dominio propio.** Es la palanca más grande y no la puede hacer un agente: comprar el dominio, apuntarlo a Vercel y poner `NEXT_PUBLIC_SITE_URL`. Todo el código ya lee de `src/lib/site.ts`: **no hay un solo dominio escrito a mano** en segundo sitio. `vanguard.world` está libre de DNS hoy; si se registra, no se toca código.
2. **Search Console.** Se necesita cuenta con permiso de *Propietario* sobre el dominio (o la URL de Vercel mientras no haya dominio) y una cuenta de servicio para leer la API. Sin eso, la columna «indexadas» del panel se queda en **pendiente** — no se estima.
3. **Slugs en español para los teatros** (`/conflicto/ukraine` → `/conflicto/ucrania`). Se puede hacer sin romper nada: alias en `TEATROS` + 301 desde el inglés + actualizar los 13 enlaces internos. No se hizo en esta ronda porque cambia URLs públicas y esa decisión es del Dueño.
4. **Versión clásica vs moderna.** Medido: `/clasico` responde **308** y `/vanguard2` declara canónica a la portada. Hoy no compiten. Si se publica el clásico con contenido propio, hay que decidirlo con canónicas, no con dos copias.
5. **`/cuartel` sin `h1`** y los 13 `obra/*` con dos: es una hora de trabajo, no urgente.
6. **Credenciales de datos.** `/datos-mundiales/pais/tw` es 404 porque Taiwán no está en el catálogo del Banco Mundial. Si Taiwán debe tener ficha (y es el ejemplo nº 1 del Dueño), hay que decidir la fuente, no inventar la página.

---

## 6. Search Console: qué hacer cuando haya credenciales

1. Verificar la propiedad (dominio o `https://vanguard-kq9r.vercel.app/`).
2. Enviar **solo** `https://…/sitemap.xml` (el índice). Los 7 hijos se descubren solos.
3. Comprobar en «Páginas» las tres cifras que el panel no puede saber: *indexadas*, *excluidas* y *descubiertas sin rastrear*.
4. Comparar por archivo de sección: es lo que la división de v421 permite y antes no.
5. Para automatizar el panel:

```
GSC_SITE=https://vanguard-kq9r.vercel.app/
GOOGLE_APPLICATION_CREDENTIALS=/ruta/a/cuenta-de-servicio.json
```

con el scope `https://www.googleapis.com/auth/webmasters.readonly` y la cuenta de servicio añadida como usuario en Search Console. El panel marcará «indexadas» en cuanto exista esa variable; mientras no exista, seguirá diciendo **pendiente**.

---

## 7. Reglas de la casa que esta ronda respeta

- No se inventó ni una URL: las 217 fichas de país salen del mismo catálogo que usa la página.
- No se borró ni se desactivó ningún módulo.
- No se duplicó contenido para inflar el mapa (de hecho `otros` quedó vacío).
- La lógica del mapa es **la misma de antes** (3.766 URLs idénticas + las que faltaban).
- Todo dominio se lee de `src/lib/site.ts`.

### D13 — Cuatro URLs del mapa devolvían 404 (corregido, v421.2/v421.3)

Medido el 2026-11-20 con `scripts/diagnostico-sitemaps.mjs --barrido`: de las 3.987
URLs anunciadas, **3.983 respondían 200 y cuatro daban 404** — exactamente las
cuatro cuyo id llevaba acento:

```
central-eólica-offshore-{hornsea,walney,wir}
sanitaria-hospital-del-niño
```

El catálogo las generaba con «ó»/«ñ», la ficha compara el id exacto y declara
`dynamicParams = false` (Next responde 404 antes de ejecutar la página), así que
ni la forma cruda ni la percent-encoded resolvían.

Corregido en `31adaa2` (ids ASCII, `obraPorId` tolerante con `plano()`, `<loc>`
con `encodeURI`) y `6d755ff` (301 de borde en `next.config` para las dos formas
viejas — la redirección dentro de la página no podía ejecutarse nunca).
Verificado en producción: **3.987/3.987 en 200**, las ocho variantes viejas en
308 hacia su canónica.

Nota sobre el «No se ha podido obtener» de Search Console: los sitemaps hijos
**no existieron en producción hasta las 01:08:05 UTC del 2026-11-20** (el
deployment anterior, v421.0, falló el build). Un fetch de Google anterior a esa
hora recibió 404 y GSC conserva ese estado hasta el reintento (24–72 h).
