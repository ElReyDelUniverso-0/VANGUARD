# VANGUARD — AUDITORÍA DE SITEMAP Y DESCUBRIMIENTO (2026-11-15)

> Pedido del Dueño: Search Console dice **«Google no reconoce esta URL»** («URL is unknown to Google») para
> `/conflicto/gaza`, `/conflicto/hormuz`, `/conflicto/korea`, `/conflicto/redsea`, `/conflicto/sahel`,
> `/conflicto/sudan`, `/conflicto/taiwan` y `/conflicto/ukraine`.
> Todo lo de abajo está **medido** sobre producción (`https://vanguard-kq9r.vercel.app`, despliegue `7b54176`)
> con `curl` y los guiones `scripts/qa/seo-sitemap.py` y `scripts/qa/seo-conflictos.py`. Nada es estimación.

## 1. Veredicto corto

Las 8 páginas **estaban en el sitemap**, responden **200**, tienen **canónica propia y única**, `index, follow`,
ningún `noindex` (ni meta ni cabecera), 1.089–3.455 palabras servidas desde el servidor y están enlazadas con
`<a href>` normales desde la portada, `/conflicto`, `/conflictos`, `/mundo`, `/en-vivo` y entre ellas.
**No son huérfanas.**

En Search Console, «Google no reconoce esta URL» significa que **Google todavía no ha rastreado la URL**. Esto no
quiere decir que la página esté rota. Con las URLs en el sitemap y enlazadas, las causas posibles son estas:

1. **La propiedad de Search Console no es `https://vanguard-kq9r.vercel.app/`**. Hay tres despliegues con el mismo
   contenido: `vanguard-kq9r`, `vanguard-u6b9` y el proyecto `vanguard`. El repositorio declara además `vanguard.world`,
   que no tiene DNS. Si la propiedad es otro dominio, sus URLs nunca serán «conocidas», porque todas las canónicas y el
   sitemap apuntan a `kq9r`. **Esto lo tiene que comprobar el Dueño en Search Console.**
2. **El sitemap no está enviado en esa propiedad, o Google aún no lo ha procesado.** Un subdominio `vercel.app` nuevo
   recibe poca prioridad de rastreo.
3. **Señales que restaban confianza** (ver §3), ya corregidas en v403.2: había URLs `noindex` dentro del sitemap,
   `lastmod` falsos que cambiaban en cada despliegue, soft 404 y metadatos en el `<body>` para Googlebot.

## 2. Comprobaciones pedidas

| Comprobación | Resultado |
|---|---|
| `sitemap.xml` accesible | 200 · `application/xml` · XML válido · 2.072 URLs · 0 duplicadas · se genera en el build |
| Las 8 fichas en el sitemap | **Sí, las 8**, con sus páginas `?page=N` (Ucrania 5, Gaza 4, Ormuz 2, Taiwán 2) |
| Fichas públicas que faltaban | **`/conflicto/lebanon`**: 200, `index`, canónica propia y enlazada desde las 9 fichas, `/conflicto`, `/conflictos` y `/mundo`, pero fuera del sitemap por la cota «≥ 5 cables» (tiene 3) |
| `lastmod` | **Mal:** 54 rutas fijas con la hora del build. **Mal:** Gaza, Ormuz, Taiwán y Ucrania declaraban octubre (31-oct, 21-oct, 29-oct, 22-oct) teniendo cables del 14-nov (ver P6) |
| `robots.txt` | 200 · `Allow: /` · `Disallow: /api/` · `Sitemap: https://vanguard-kq9r.vercel.app/sitemap.xml` ✔ |
| HTTP 200 de las 8 | ✔ 200, sin redirecciones (0,26–0,9 s), también con UA Googlebot y Google-InspectionTool |
| Canónica única | ✔ cada una apunta a sí misma, y las `?page=N` a sí mismas |
| Enlaces `<a href>` rastreables | ✔ portada → 5 fichas; `/conflicto`, `/conflictos` y `/mundo` → las 9; cada ficha → las otras 8 |
| Huérfanas | Ninguna ficha de conflicto |
| Contenido único servido por el servidor | ✔ títulos y h1 distintos, 1.089–3.455 palabras visibles sin JavaScript |
| `noindex` accidental | Ninguno en las 8. **Sí** había 6 URLs `noindex` metidas en el sitemap (ver P3) |

## 3. Problemas confirmados

| # | Problema | Evidencia | Estado |
|---|---|---|---|
| P1 | **Para Googlebot, title, description, canonical y robots salían en el `<body>`** del HTML inicial. Next 16 «transmite» los metadatos a todo agente que no esté en su lista `htmlLimitedBots`, y Googlebot no está en ella; Google-InspectionTool sí. Google ignora la `rel=canonical` del `<body>` del HTML descargado | `/conflicto/sudan` con UA Googlebot: `</head>` en el byte 2.394 y la canónica en el 50.345. Reproducido en una app mínima con Next 16.4.3 | **Arreglado** (next.config `htmlLimitedBots` = lista de fábrica + rastreadores de buscadores). Probado: canónica en el `<head>` para Googlebot y bingbot; los visitantes siguen recibiendo la transmisión |
| P2 | **Soft 404**: `/conflicto/<inexistente>` respondía **200** con `noindex`, porque `loading.tsx` envía el 200 antes del `notFound()` | `/conflicto/atlantida` → 200 con UA Googlebot, Inspection y Chrome | **Arreglado** con `conflicto/[tag]/layout.tsx`: comprueba `TEATROS` antes de la frontera de carga. Probado en la app mínima: 404 real. Además cierra `/conflicto/constructor`, que pasaba la comprobación `TEATROS[tag]` |
| P3 | **6 URLs `noindex` en el sitemap**: `/novedades`, `/nucleo`, `/calidad`, `/catalogo`, `/escudo` y `/mision`. Llevan `X-Robots-Tag: noindex` desde next.config, y `/mision` además lleva meta `noindex, nofollow` y canónica a la portada | `seo-sitemap.py` | **Arreglado**: el sitemap filtra `SALAS_INTERNAS` |
| P4 | **URL pública fuera del sitemap**: `/conflicto/lebanon` | ver §2 | **Arreglado**: misma regla que la página (≥ 1 cable). Un teatro nuevo en `TEATROS` con cables entra solo |
| P5 | **`lastmod` falso**: 54 rutas fijas con la hora del build. Cada despliegue «modificaba» todo, y Google aprende a ignorar ese dato | sitemap de producción | **Arreglado**: las salas que viven del archivo declaran la última noticia real; el resto, ninguna fecha |
| P6 | **Fechas mezcladas en `NewsItem.publishedAt`**: 1.935 filas en milisegundos y 77 en texto. SQLite ordena el texto por encima de los números, así que `MAX()` y `ORDER BY publishedAt DESC` se equivocan | La página 1 de Gaza lista primero 24 cables del 8 al 31 de octubre y después los del 14 de noviembre | **Sitemap arreglado** (máximo calculado fecha a fecha). **Pendiente en las páginas** (B-29): normalizar las 77 filas o comparar como fecha. Toca la base que escribe ia3, así que se coordina antes |
| P7 | Varios hosts con el mismo contenido (`vanguard-u6b9.vercel.app` y otros) | u6b9 sirve las mismas fichas con canónica a kq9r (correcto) | Sin cambio: lo correcto es que la propiedad de Search Console sea kq9r |
| P8 | `/vanguard2`: canónica a la portada (hereda la del layout) y 33 palabras servidas | `curl` | Pendiente (B-30): no se añade al sitemap porque es una página fina; decidir entre canónica propia con texto o `noindex` |
| P9 | `/noticia/<inexistente>` y `/conflicto/<tag>?page=99` responden 200 con `noindex` (soft 404, misma causa que P2) | `curl` | Pendiente (B-31): hay que comprobar los datos antes de la frontera de carga |
| P10 | Descripciones de 204–253 letras en las 8 fichas | parser | No afecta al descubrimiento (B-20) |

Fuera del sitemap a propósito: `/entrar` (puerta de paso, ahora `noindex, follow`), `/torre` y `/offline`
(`noindex`), `/clasico` (308) y `/vanguard2` (P8). Las rutas dinámicas `/lectura/<clave>` son notas del cable con
vida corta.

## 4. Sitemap: antes → después (generado con el código nuevo sobre la misma base)

- 2.072 → **2.067 URLs**, 0 duplicadas.
- **Entra:** `/conflicto/lebanon`.
- **Salen:** las 6 salas `noindex`.
- `lastmod`: 6 salas del archivo con la última noticia real (`2026-11-14T20:54:25Z`); 43 rutas fijas sin fecha
  inventada.

| Teatro | lastmod antes | lastmod ahora |
|---|---|---|
| gaza | 2026-10-31T05:51 | 2026-11-14T17:54 |
| hormuz | 2026-10-21T21:51 | 2026-11-14T08:32 |
| taiwan | 2026-10-29T11:51 | 2026-11-14T14:54 |
| ukraine | 2026-10-22T11:51 | 2026-11-14T19:48 |
| lebanon | — (fuera) | 2026-11-14T12:54 |
| korea, redsea, sahel, sudan | sin cambio | sin cambio |

## 5. Lo que tiene que hacer el Dueño en Search Console (no se puede hacer desde el código)

1. Comprobar que la propiedad es **`https://vanguard-kq9r.vercel.app/`**. Si no lo es, crear esa propiedad de prefijo
   de URL y verificarla.
2. En **Sitemaps**, enviar `https://vanguard-kq9r.vercel.app/sitemap.xml`.
3. Cuando esté publicada v403.2, abrir **Inspección de URLs**, «Probar URL publicada» y luego «Solicitar
   indexación» para las 9 fichas.
