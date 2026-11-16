# LA LLAVE DE LOS BUSCADORES (IndexNow) — v405.3

## Qué es esto

`public/4649a31db9b39157537300e494a60c03.txt` es la **llave de IndexNow**: un archivo
con una cadena hexadecimal cuyo NOMBRE es la clave y cuyo CONTENIDO es la misma
clave. Con ella, cualquier buscador que hable IndexNow puede comprobar que quien
avisa de una URL nueva es el dueño del sitio.

Sin este archivo, cada aviso se rechaza con 403. Medido: antes de la v405.3 la
ruta daba **404** en producción y ningún aviso podía verificarse.

## Quién lo usa (y quién no)

| Motor | Usa IndexNow | Nota |
|---|---|---|
| Bing (y por tanto ChatGPT Search y Copilot) | ✅ sí | `api.indexnow.org` |
| Yandex | ✅ sí | |
| Seznam (Chequia) | ✅ sí | |
| Naver (Corea) | ✅ sí | |
| **Google** | ❌ **no** | Google solo acepta sitemap + Search Console (necesita la cuenta del Dueño) |

Es decir: esto abre Bing/Yandex/Seznam/Naver de golpe, **no** Google. Google se
abre con Search Console (verificación del dominio por el Dueño) y con enlaces
reales entrantes.

## Cómo se avisa (una sola vez por tanda)

```bash
# 1) saca las URLs del sitemap vivo
curl -s https://vanguard-kq9r.vercel.app/sitemap.xml \
  | grep -o '<loc>[^<]*' | sed 's/<loc>//' > /tmp/urls.txt

# 2) avisa a IndexNow (máximo 10.000 URLs por POST; hoy son ~2.087)
python3 - <<'PY'
import json, urllib.request
urls = [u.strip() for u in open('/tmp/urls.txt') if u.strip()]
cuerpo = json.dumps({
    "host": "vanguard-kq9r.vercel.app",
    "key": "4649a31db9b39157537300e494a60c03",
    "keyLocation": "https://vanguard-kq9r.vercel.app/4649a31db9b39157537300e494a60c03.txt",
    "urlList": urls[:10000],
}).encode()
req = urllib.request.Request("https://api.indexnow.org/indexnow", data=cuerpo,
      headers={"Content-Type": "application/json; charset=utf-8"})
print(urllib.request.urlopen(req, timeout=60).status)
PY
```

Respuestas que significan «bien»: **200** (aceptado) o **202** (aceptado, en cola).
Un 403 significa que la llave no se sirve en la ruta correcta.

## Qué NO hace

- No garantiza indexación: avisa. El robot decide cuándo rastrea.
- No sustituye a Search Console.
- No se puede repetir a lo bruto: se avisa cuando hay URLs **nuevas o cambiadas**
  (las noticias de `/lectura/*` y `/noticia/*` cambian cada hora; la portada, no).

---

# EL FARO QUE GIRA — añadido en v405.5 (ia3)

> Esta sección **amplía** el documento de la v405.3; no borra ni corrige nada de arriba.

## Lo que se midió al anunciar de verdad (16-nov, 20:12 UTC)

| Destino | Resultado con la llave `4649a31d…` | Resultado con la llave `074b8db5…` |
|---|---|---|
| api.indexnow.org | **403** `UserForbiddedToAccessSite` | **200** |
| Bing | **403** `UserForbiddedToAccessSite` | **200** |
| Yandex | 200 | **202** (en cola) |
| Seznam | — | **200** |

**2.087 URLs aceptadas** por los cuatro motores.

### El 403 no era el archivo

El archivo se sirve perfecto: 32 bytes exactos, `200` para cualquier *user-agent*.
La causa real: **Bing cachea el resultado de su primera comprobación**. A esa
llave la comprobó cuando todavía no existía (daba 404) y sigue negándola aunque
el archivo esté publicado. Probadas las cuatro llaves del repo: **las otras tres
responden 200**. Por eso el faro usa `074b8db50cc83f0689a2211e3ff94db1`.

> Regla para la próxima vez: **publica el archivo ANTES de anunciar**. Un 404
> durante la primera comprobación deja la llave quemada para Bing.

## El faro (`​.github/workflows/faro-indexnow.yml`)

Cada 6 horas, GitHub Actions:

1. descarga el **sitemap vivo** (2.087 URLs hoy),
2. elige **una tanda de 200** con una cuenta que no necesita memoria:
   `tanda = floor(segundos_desde_1970 / 6 h) % total_de_tandas`,
3. la anuncia a api.indexnow.org, Bing y Yandex.

**La vuelta completa tarda 2,75 días** y ninguna pasada repite la anterior.
No necesita base de datos, ni estado, ni llaves secretas.

**Por qué GitHub Actions y no un cron de Vercel:** el plan Hobby admite 2 crons
por proyecto y ya están ocupados por `/api/news` y `/api/agent-ping`. Un tercero
puede tumbar el despliegue.

## Cómo comprobar que gira sin creerle a nadie

```
https://vanguard-kq9r.vercel.app/api/indexnow
```

Devuelve la tanda de esta hora, cuántas URLs lleva, cuál es la primera y la
última, y cuánto tarda la vuelta completa. **Solo lectura: no envía nada.** Si esa
tanda no coincide con lo que dice la pestaña **Actions** del repositorio, algo se
rompió y se ve a simple vista.

## Lo que sigue fuera del alcance

- **Google no habla IndexNow.** A Google se le entra con Search Console
  (cuenta del Dueño) y con enlaces reales entrantes.
- IndexNow **avisa, no indexa**: el robot decide cuándo rastrea.
