#!/bin/bash
# RONDA 18 — OLEADA D: acortadores NUEVOS con alias personalizados + OLEADA E: reintentos
# Log honesto: cada URL se verifica después con verify-r18.sh
T="$(cat /home/z/my-project/.ghtoken)"
LOG=/home/z/my-project/scripts/campaign-results.txt
BASE="https://vanguard-kq9r.vercel.app"
echo "=== R18 WAVE D (shorteners) $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" >> "$LOG"

# --- is.gd con alias personalizados (nuevos enlaces públicos) ---
isd() { # $1=alias $2=label
  U=$(curl -s --max-time 20 "https://is.gd/create.php?format=json&url=${BASE}/?ref=VGD-R18&shorturl=$1" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d.get('shorturl') or 'ERR:'+(d.get('errormessage') or '?')[:50])")
  echo "[is.gd] $2 → $U" | tee -a "$LOG"
}
isd "vanguardjuego" "ES juego"
isd "vanguardwar" "EN war"
isd "vanguardmision" "ES mision200"
isd "vanguardnasa" "NASA en vivo"
isd "vguerrahoy" "guerra hoy"

# --- v.gd ---
vgd() {
  U=$(curl -s --max-time 20 "https://v.gd/create.php?format=json&url=${BASE}/?ref=VGD-R18&shorturl=$1" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d.get('shorturl') or 'ERR:'+(d.get('errormessage') or '?')[:50])")
  echo "[v.gd] $1 → $U" | tee -a "$LOG"
}
vgd "vanguardpt"
vgd "vanguardfrente"

# --- tny.im (YOURLS) ---
tny() {
  U=$(curl -s --max-time 20 "https://tny.im/yourls-api.php?action=shorturl&format=json&url=${BASE}/?ref=VGD-R18&title=VANGUARD%20free%20browser%20war%20game" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d.get('shorturl') or 'ERR:'+json.dumps(d)[:60])" 2>/dev/null)
  echo "[tny.im] → $U" | tee -a "$LOG"
}
tny
tny

# --- tinyurl anónimo ---
TU=$(curl -s --max-time 20 -X POST "https://tinyurl.com/create.php" --data-urlencode "url=${BASE}/?ref=VGD-R18" -o /tmp/r18/tu.html -w "%{http_code}")
TU2=$(grep -o -E 'https://tinyurl\.com/[a-z0-9]+' /tmp/r18/tu.html | grep -v create | head -1)
echo "[tinyurl] $TU → ${TU2:-sin-url}" | tee -a "$LOG"

echo "=== R18 WAVE E (reintentos) $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" >> "$LOG"

# --- paste.debian con lang=plaintext? probar valores ---
for L in plaintext text; do
  D=$(curl -s --max-time 20 -X POST https://paste.debian.net/ --data-urlencode "code=VANGUARD is the free browser war game: live conflict news, 15-layer 3D OSINT globe, global multiplayer war, ELO duels and 83 sections across 11 worlds. Free, no signup. New v49.0: 200-Link Spread Mission (3,000 coins + 30 gems for EVERYONE at goal), live NASA EONET, currencies in crisis, news from 5 sources, Explorer mechanic that pays coins. Help: post the game link somewhere NEW. PLAY: https://vanguard-kq9r.vercel.app" -d "lang=$L" -d "expire=2592000" -d "poster=VANGUARD" -d "send=send" -o /tmp/r18/deb2.html -w "%{http_code}")
  DU=$(grep -o -E '/[0-9]{6,}' /tmp/r18/deb2.html | head -1)
  if [ -n "$DU" ]; then echo "[paste.debian] lang=$L → https://paste.debian.net$DU" | tee -a "$LOG"; break; else echo "[paste.debian] lang=$L ERR $D" | tee -a "$LOG"; fi
done

# --- termbin (netcat) ---
TB=$(echo "VANGUARD free browser war game: live conflict news, 3D OSINT globe, multiplayer ELO, 83 sections, NASA live, currencies in crisis. v49.0 200-Link Mission: 3000 coins for everyone at goal. PLAY: https://vanguard-kq9r.vercel.app" | timeout 15 nc termbin.com 9999 2>/dev/null | tr -d '[:space:]')
echo "[termbin] → ${TB:-ERR-egress-bloqueado}" | tee -a "$LOG"

# --- paste.centos.org ---
PC=$(curl -s --max-time 20 -X POST https://paste.centos.org/api/create -d "api_dev_key=&api_option=paste" -o /tmp/r18/centos.txt -w "%{http_code}")
echo "[paste.centos] $PC $(head -c 80 /tmp/r18/centos.txt)" | tee -a "$LOG"

# --- justpaste con curl (reintento) ---
rm -f /tmp/r18/jp.cookies
JPX=$(curl -s -c /tmp/r18/jp.cookies --max-time 15 https://justpaste.it/ -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36" -o /dev/null -w "%{http_code}")
JPTOK=$(grep XSRF-TOKEN /tmp/r18/jp.cookies | awk '{print $NF}' | python3 -c "import sys,urllib.parse;print(urllib.parse.unquote(sys.stdin.read().strip()))" 2>/dev/null)
JP=$(curl -s -b /tmp/r18/jp.cookies --max-time 20 -X POST "https://justpaste.it/article/create" -A "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36" -H "X-Requested-With: XMLHttpRequest" -H "X-XSRF-TOKEN: $JPTOK" -H "Referer: https://justpaste.it/" --data-urlencode "article[title]=VANGUARD — juego de guerra gratis con el planeta en vivo" --data-urlencode "article[data]=<p>VANGUARD: guerra global multijugador, globo 3D OSINT de 15 capas, duelos ELO y 83 secciones en 11 mundos. Gratis, sin registro.</p><p><b>Novedades v49.0</b></p><p>— Misión de Difusión 200: al llegar a 200 enlaces públicos, TODOS cobran 3.000 monedas + 30 gemas.<br>— NASA EONET en vivo: volcanes, sismos e incendios activos.<br>— Divisas en crisis: rial iraní, rublo y más con tasas reales.<br>— Noticias de 5 fuentes: GDELT, BBC Mundo, France 24, DW, Al Jazeera.</p><p>Jugar: <a href=\"https://vanguard-kq9r.vercel.app\">https://vanguard-kq9r.vercel.app</a></p>" -o /tmp/r18/jp.json -w "%{http_code}")
JPU=$(python3 -c "import json;d=json.load(open('/tmp/r18/jp.json'));print(d.get('url') or json.dumps(d)[:70])" 2>/dev/null)
echo "[justpaste] $JP → ${JPU:-no-url}" | tee -a "$LOG"

echo "=== R18 WAVE D+E FIN ===" >> "$LOG"
