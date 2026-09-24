#!/bin/bash
# Ronda 22 — Wave 2: plataformas NUEVAS (nunca intentadas) — resultados al mismo results.tsv
R=/home/z/my-project/scripts/r22
P="$R/promo-r22.txt"
RES="$R/results.tsv"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
VW="https://vanguard.world"
add(){ printf '%s\t%s\t%s\t%s\t%s\n' "$1" "$2" "$3" "$4" "$5" >> "$RES"; }

echo "== N1) bashupload.com =="
B=$(curl -s --max-time 30 -T "$P" https://bashupload.com/ 2>/dev/null | head -c 600)
U=$(echo "$B" | grep -oP 'https://bashupload\.com/\S+' | head -1 | tr -d '`')
[ -n "$U" ] && add bashupload page "$U" "$U" || add bashupload fail "" "" "$(echo $B | head -c 80)"

echo "== N2) tmpsend.com =="
B=$(curl -s --max-time 30 -T "$P" https://tmpsend.com/ 2>/dev/null | head -c 800)
U=$(echo "$B" | grep -oP 'https://tmpsend\.com/[a-zA-Z0-9]+' | head -1)
[ -n "$U" ] && add tmpsend page "$U" "$U" || add tmpsend fail "" "" "$(echo $B | head -c 80)"

echo "== N3) temp.sh =="
B=$(curl -s --max-time 30 -T "$P" https://temp.sh/ 2>/dev/null | head -c 600)
U=$(echo "$B" | grep -oP 'https://temp\.sh/\S+' | head -1 | tr -d '`')
[ -n "$U" ] && add temp.sh page "$U" "$U" || add temp.sh fail "" "" "$(echo $B | head -c 80)"

echo "== N4) p.ip.fi =="
U=$(curl -s --max-time 25 --data-binary @"$P" https://p.ip.fi/ 2>/dev/null | head -c 200 | tr -d '[:space:]')
case "$U" in https://p.ip.fi/*) add p.ip.fi page "$U" "$U";; *) add p.ip.fi fail "" "" "$U";; esac

echo "== N5) kpaste.net =="
B=$(curl -s --max-time 25 --data-urlencode "content@$P" -d "expiry=week" https://kpaste.net/ 2>/dev/null | head -c 2000)
U=$(echo "$B" | grep -oP 'https?://kpaste\.net/[a-zA-Z0-9]+' | head -1)
[ -n "$U" ] && add kpaste page "$U" "$U" || add kpaste fail "" "" "$(echo $B | head -c 80)"

echo "== N6) ctrl-v.pl =="
B=$(curl -s -A "$UA" --max-time 25 --data-urlencode "content@$P" https://ctrl-v.pl/ 2>/dev/null | head -c 2000)
U=$(echo "$B" | grep -oP 'https?://ctrl-v\.pl/[a-zA-Z0-9]+' | head -1)
[ -n "$U" ] && add ctrl-v page "$U" "$U" || add ctrl-v fail "" "" "$(echo $B | head -c 80)"

echo "== N7) shorl.com retry (con cookies) =="
JAR="$R/shorl.jar"
curl -s -c "$JAR" -A "$UA" --max-time 20 https://shorl.com/ -o /dev/null 2>/dev/null
B=$(curl -s -b "$JAR" -A "$UA" --max-time 20 -e https://shorl.com/ -d "url=$VW" https://shorl.com/create.php 2>/dev/null | head -c 3000)
S=$(echo "$B" | grep -oP 'https://shorl\.com/[a-z0-9]+' | head -1)
if [ -z "$S" ]; then
  B=$(curl -s -b "$JAR" -A "$UA" --max-time 20 -e https://shorl.com/ -d "url=$VW" https://shorl.com/ 2>/dev/null | head -c 3000)
  S=$(echo "$B" | grep -oP 'https://shorl\.com/[a-z0-9]+' | grep -v 'href="https://shorl.com"' | head -1)
fi
[ -n "$S" ] && add shorl short "$S" "$S" || add shorl fail "" "" "$(echo $B | head -c 80)"

echo "== N8) is.fi / qfi.fi shorteners descartados; pruebo gtf.li via vgy no. Pruebo 1km.de =="
B=$(curl -s -A "$UA" --max-time 20 "https://1km.de/?c=create&url=$VW" 2>/dev/null | head -c 500)
S=$(echo "$B" | grep -oP 'https://1km\.de/[a-zA-Z0-9]+' | head -1)
[ -n "$S" ] && add 1km.de short "$S" "$S" || add 1km.de fail "" "" "$(echo $B | head -c 80)"

echo "---- RESULTADOS WAVE 2 ----"
tail -8 "$RES"
