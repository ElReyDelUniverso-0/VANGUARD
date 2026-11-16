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
