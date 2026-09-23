#!/bin/bash
# MISIÓN 100 — envíos REALES del enlace de VANGUARD a motores de búsqueda,
# archivos web, servicios de ping y directorios. Cada envío queda registrado
# con su código HTTP en campaign-results.txt; solo 2xx/3xx cuentan como entregados.
SITE="https://vanguard-kq9r.vercel.app"
KEY="074b8db50cc83f0689a2211e3ff94db1"
GH_TOKEN="${GH_TOKEN:-}"
LOG="/home/z/my-project/scripts/campaign-results.txt"
: > "$LOG"

try() {
  local name="$1"; shift
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" "$@" 2>/dev/null)
  echo "$code $name" >> "$LOG"
  echo "$code $name"
}

echo "== 1) INDEXNOW — 5 motores x 3 URLs (/, /guerra-hoy, /feed.xml) =="

# 1a. api.indexnow.org (reparte a todos los motores aliados) — POST con las 3 URLs
try "indexnow-api-3urls" -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "{\"host\":\"vanguard-kq9r.vercel.app\",\"key\":\"$KEY\",\"urlList\":[\"$SITE/\",\"$SITE/guerra-hoy\",\"$SITE/feed.xml\"]}"

# 1b-1e. Motores individuales vía GET (1 llamada por URL)
ENC="%3A%2F%2Fvanguard-kq9r.vercel.app"
for path in "/" "/guerra-hoy" "/feed.xml"; do
  U="https${ENC}${path}"
  U=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote('https://vanguard-kq9r.vercel.app'+sys.argv[1],safe=''))" "$path")
  try "indexnow-bing-$path"        "https://www.bing.com/indexnow?url=$U&key=$KEY"
  try "indexnow-yandex-$path"      "https://yandex.com/indexnow?url=$U&key=$KEY"
  try "indexnow-seznam-$path"      "https://search.seznam.cz/indexnow?url=$U&key=$KEY"
  try "indexnow-naver-$path"       "https://searchadvisor.naver.com/indexnow?url=$U&key=$KEY"
done

echo "== 2) ARCHIVO WEB (Wayback Machine) — instantánea permanente =="
try "wayback-portada"      -L --max-time 70 "https://web.archive.org/save/$SITE/"
try "wayback-guerra-hoy"   -L --max-time 70 "https://web.archive.org/save/$SITE/guerra-hoy"

echo "== 3) PING-O-MATIC — sindica a ~15 servicios de blogs con 1 llamada =="
try "pingomatic" "https://pingomatic.com/ping/?title=VANGUARD%20%E2%80%94%20El%20mundo%20en%20tiempo%20real&blogurl=https%3A%2F%2Fvanguard-kq9r.vercel.app%2F&rssurl=https%3A%2F%2Fvanguard-kq9r.vercel.app%2Ffeed.xml&chk_weblogscom=on&chk_blogs=on&chk_feedburner=on&chk_syndic8=on&chk_blogdigger=on&chk_blogrolling=on&chk_blogstreet=on&chk_moreover=on&chk_weblogalot=on&chk_icerocket=on&chk_newsisfree=on&chk_topicexchange=on&chk_googleblogsearch=on&chk_blogshares=on&chk_a2b=on"

echo "== 4) TWINGLY + INFOTIGER + 1ABC + TOTALPING — directorios y pings abiertos =="
try "twingly"      "https://ping.twingly.com/ping?url=https%3A%2F%2Fvanguard-kq9r.vercel.app%2F"
try "infotiger"    "http://www.infotiger.com/addurl.html?url=https%3A%2F%2Fvanguard-kq9r.vercel.app%2F"
try "1abc"         -X POST "https://www.1abc.org/submit.php" -d "url=https%3A%2F%2Fvanguard-kq9r.vercel.app&send=Submit+URL" -H "Content-Type: application/x-www-form-urlencoded"
try "totalping"    "https://www.totalping.com/ping?title=VANGUARD&url=https%3A%2F%2Fvanguard-kq9r.vercel.app%2F&rss=https%3A%2F%2Fvanguard-kq9r.vercel.app%2Ffeed.xml"

echo "== 5) GIST PÚBLICO EN GITHUB — backlink permanente en github.com =="
GIST_CODE=$(curl -s -o /tmp/gist-resp.json -w "%{http_code}" -X POST "https://api.github.com/gists" \
  -H "Authorization: Bearer $GH_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  -d '{
    "description": "VANGUARD — El mundo en tiempo real: noticias de guerra en vivo, mapa OSINT 3D y guerra global multijugador (gratis, en español)",
    "public": true,
    "files": {
      "VANGUARD-enlaces-oficiales.md": {
        "content": "# VANGUARD — El mundo en tiempo real\n\nPlataforma global de conflictos en vivo. 100% gratis, en español:\n\n- **Noticias de guerra al minuto** — BBC Mundo, DW, France 24 en directo\n- **Mapa OSINT 3D** — aviones militares, tanques y tropas en tiempo real\n- **Guerra global multijugador** — conquista territorios, ranking ELO\n- **Simulador táctico** + quizzes, misiones y recompensas\n\n## Enlaces oficiales\n\n- Entrar al cuartel general: https://vanguard-kq9r.vercel.app/\n- Noticias de conflictos de HOY: https://vanguard-kq9r.vercel.app/guerra-hoy\n- Canal RSS: https://vanguard-kq9r.vercel.app/feed.xml\n\nSin registro. Entra desde el móvil y mira el mundo arder en directo.\n"
      }
    }
  }')
echo "$GIST_CODE gist-github" >> "$LOG"
echo "$GIST_CODE gist-github"

echo "== RESUMEN =="
OK=$(awk '$1 ~ /^2/ || $1 ~ /^3/' "$LOG" | wc -l)
TOTAL=$(grep -c . "$LOG")
echo "Entregados (2xx/3xx): $OK / $TOTAL intentos"
