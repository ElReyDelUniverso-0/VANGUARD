#!/bin/bash
# Ronda 24 — Wave C: acortar las 7 paginas gh-pages via tinyurl-api + clck.ru + spoo.me
R=/home/z/my-project/scripts/r24
RES="$R/results.tsv"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
add(){ printf '%s\t%s\t%s\t%s\t%s\n' "$1" "$2" "$3" "$4" "$5" >> "$RES"; }

URLS=(
  "https://elreydeluniverso-0.github.io/VANGUARD/ronda21.html"
  "https://elreydeluniverso-0.github.io/VANGUARD/ronda22.html"
  "https://elreydeluniverso-0.github.io/VANGUARD/radar-militar.html"
  "https://elreydeluniverso-0.github.io/VANGUARD/senal-iss.html"
  "https://elreydeluniverso-0.github.io/VANGUARD/pulso.html"
  "https://elreydeluniverso-0.github.io/VANGUARD/mision-300.html"
  "https://elreydeluniverso-0.github.io/VANGUARD/juega-ya.html"
)

echo "== tinyurl api-create x7 =="
for U in "${URLS[@]}"; do
  S=$(curl -s --max-time 15 -A "$UA" "https://tinyurl.com/api-create.php?url=$U" 2>/dev/null | tr -d '[:space:]')
  case "$S" in https://tinyurl.com/*) add "tinyurl-$(basename $U .html)" short "$S" "$S";; *) add "tinyurl-$(basename $U .html)" fail "" "" "$(echo $S | head -c 50)";; esac
  sleep 1
done

echo "== clck.ru x7 =="
for U in "${URLS[@]}"; do
  S=$(curl -s -A "$UA" --max-time 20 "https://clck.ru/--?url=$U" 2>/dev/null | head -c 200 | tr -d '[:space:]')
  case "$S" in https://clck.ru/*) add "clck-$(basename $U .html)" short "$S" "$S";; *) add "clck-$(basename $U .html)" fail "" "" "$(echo $S | head -c 50)";; esac
  sleep 2
done

echo "== spoo.me x7 =="
for U in "${URLS[@]}"; do
  J=$(curl -s -A "$UA" --max-time 20 -H "Accept: application/json" -d "url=$U" https://spoo.me/ 2>/dev/null | head -c 300)
  S=$(echo "$J" | grep -oP '"short_url"\s*:\s*"\K[^"]+' | head -1 | sed 's|^http://|https://|')
  [ -n "$S" ] && add "spoo-$(basename $U .html)" short "$S" "$S" || add "spoo-$(basename $U .html)" fail "" "" "$(echo $J | head -c 60)"
  sleep 2
done

echo "---- RESULTADOS WAVE C ----"
tail -21 "$RES" | awk -F'\t' '{printf "%-28s %s %s\n", $1, $2, $3}'
echo "OK: $(tail -21 "$RES" | grep -cP '^\S+\t(short|page)\t') / 21"
