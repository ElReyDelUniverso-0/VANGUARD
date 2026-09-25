#!/bin/bash
# Ronda 25 — Wave 2: 9 shorts (3 URLs nuevas x 3 servicios) + verificación estricta completa
R=/home/z/my-project/scripts/r25
RES="$R/results.tsv"
OUT="$R/verified.tsv"; : > "$OUT"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
add(){ printf '%s\t%s\t%s\t%s\t%s\n' "$1" "$2" "$3" "$4" "$5" >> "$RES"; }

URLS=(
  "https://elreydeluniverso-0.github.io/VANGUARD/ronda25.html"
  "https://elreydeluniverso-0.github.io/VANGUARD/como-jugar.html"
  "https://elreydeluniverso-0.github.io/VANGUARD/detective.html"
)

echo "== Creando 9 shorts =="
for U in "${URLS[@]}"; do
  B=$(basename "$U" .html)
  S=$(curl -s --max-time 15 -A "$UA" "https://tinyurl.com/api-create.php?url=$U" 2>/dev/null | tr -d '[:space:]')
  case "$S" in https://tinyurl.com/*) add "tinyurl-$B" short "$S" "$S";; *) add "tinyurl-$B" fail "" "" "$S";; esac
  sleep 1
  S=$(curl -s -A "$UA" --max-time 20 "https://clck.ru/--?url=$U" 2>/dev/null | head -c 200 | tr -d '[:space:]')
  case "$S" in https://clck.ru/*) add "clck-$B" short "$S" "$S";; *) add "clck-$B" fail "" "" "$S";; esac
  sleep 2
  J=$(curl -s -A "$UA" --max-time 20 -H "Accept: application/json" -d "url=$U" https://spoo.me/ 2>/dev/null | head -c 300)
  S=$(echo "$J" | grep -oP '"short_url"\s*:\s*"\K[^"]+' | head -1 | sed 's|^http://|https://|')
  [ -n "$S" ] && add "spoo-$B" short "$S" "$S" || add "spoo-$B" fail "" "" "$(echo $J | head -c 60)"
  sleep 2
done
echo "-- shorts creados:"; tail -9 "$RES" | awk -F'\t' '{printf "%-24s %s %s\n", $1, $2, $3}'

echo "== VERIFICACIÓN =="
# Dedupe: R20+R21+R23(11)+R24(30)
PREV=$(cat /home/z/my-project/scripts/r20/verified.tsv /home/z/my-project/scripts/r21/verified.tsv /home/z/my-project/scripts/r24/verified.tsv 2>/dev/null | cut -f3)
PREV="$PREV
https://elreydeluniverso-0.github.io/VANGUARD/ronda22.html
https://elreydeluniverso-0.github.io/VANGUARD/radar-militar.html
https://elreydeluniverso-0.github.io/VANGUARD/senal-iss.html
https://github.com/ElReyDelUniverso-0/VANGUARD/issues/13
https://github.com/ElReyDelUniverso-0/VANGUARD/discussions/14
https://hedgedoc.envs.net/9UDvhGqjS9SAFwKJwro_Sg
https://pad.nixnet.services/94TZKtVrQ8-MbosNWKS96g
https://x0.at/OUFD.txt
https://paste.rs/xwVJY
https://hst.sh/lirutecuqe
https://spoo.me/QMlnHU"
dup(){ echo "$PREV" | grep -qiF "$1"; }

verpage(){
  local N="$1" P="$2"
  dup "$P" && { echo "⏭️  $N dup"; return; }
  local C=$(curl -sL -A "$UA" --max-time 30 -o /tmp/v25b -w '%{http_code}' "$P" 2>/dev/null)
  if [ "$C" != "200" ]; then sleep 35; C=$(curl -sL -A "$UA" --max-time 30 -o /tmp/v25b -w '%{http_code}' "$P" 2>/dev/null); fi
  if [ "$C" = "200" ] && grep -q "vanguard.world" /tmp/v25b 2>/dev/null; then
    printf '%s\tOK\t%s\n' "$N" "$P" >> "$OUT"; echo "✅ $N"
  else echo "❌ $N (http-$C)"; fi
}
vershort(){
  local N="$1" S="$2" FRAG="$3"
  dup "$S" && { echo "⏭️  $N dup"; return; }
  local L=$(curl -sI -A "$UA" --max-time 25 "$S" 2>/dev/null | grep -i '^location:' | tr -d '\r' | head -1)
  local C=$(curl -sL -A "$UA" --max-time 30 -o /tmp/v25s -w '%{http_code}' "$S" 2>/dev/null)
  if [ "$C" = "200" ] && grep -q "vanguard.world" /tmp/v25s 2>/dev/null && echo "$L" | grep -qF "$FRAG"; then
    printf '%s\tOK\t%s\n' "$N" "$S" >> "$OUT"; echo "✅ $N"
  else echo "❌ $N (http-$C loc:$(echo $L | head -c 70))"; fi
}

verpage ghpages-ronda25    "https://elreydeluniverso-0.github.io/VANGUARD/ronda25.html"
verpage ghpages-comojugar  "https://elreydeluniverso-0.github.io/VANGUARD/como-jugar.html"
verpage ghpages-detective  "https://elreydeluniverso-0.github.io/VANGUARD/detective.html"
verpage gh-issue-17        "https://github.com/ElReyDelUniverso-0/VANGUARD/issues/17"
verpage gh-discussion-18   "https://github.com/ElReyDelUniverso-0/VANGUARD/discussions/18"
vershort tinyurl-ronda25   "$(grep -P '^tinyurl-ronda25\t' "$RES" | cut -f3)" "ronda25.html"
vershort tinyurl-comojugar "$(grep -P '^tinyurl-como-jugar.html\t|^tinyurl-comojugar\t' "$RES" | cut -f3)" "como-jugar.html"
vershort tinyurl-detective "$(grep -P '^tinyurl-detective' "$RES" | cut -f3)" "detective.html"
vershort clck-ronda25      "$(grep -P '^clck-ronda25\t' "$RES" | cut -f3)" "ronda25.html"
vershort clck-comojugar    "$(grep -P '^clck-como-jugar.html\t|^clck-comojugar\t' "$RES" | cut -f3)" "como-jugar.html"
vershort clck-detective    "$(grep -P '^clck-detective' "$RES" | cut -f3)" "detective.html"
vershort spoo-ronda25      "$(grep -P '^spoo-ronda25\t' "$RES" | cut -f3)" "ronda25.html"
vershort spoo-comojugar    "$(grep -P '^spoo-como-jugar.html\t|^spoo-comojugar\t' "$RES" | cut -f3)" "como-jugar.html"
vershort spoo-detective    "$(grep -P '^spoo-detective' "$RES" | cut -f3)" "detective.html"

echo "---- VERIFICADOS R25 ----"
cat "$OUT"
echo "TOTAL: $(grep -c OK "$OUT")"
