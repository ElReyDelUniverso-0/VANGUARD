#!/bin/bash
# Ronda 20 — Wave A: paste sites NUEVOS (no usados en R15-R19)
R=/home/z/my-project/scripts/r20
P="$R/promo-r20.txt"
RES="$R/resultsA.tsv"
: > "$RES"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
add(){ printf '%s\t%s\t%s\t%s\n' "$1" "$2" "$3" "$4" >> "$RES"; } # name | kind | page | verify

echo "== 1) dpaste.com API v2 =="
U=$(curl -s -A "$UA" --max-time 25 -d "content=<$P" -d "syntax=none" -d "expiry_days=365" https://dpaste.com/api/v2/ 2>/dev/null | head -c 300)
case "$U" in https://dpaste.com/*) add dpaste.com page "$U" "$U";; *) add dpaste.com fail "" "$U";; esac

echo "== 2) dpaste.org API =="
J=$(curl -s -A "$UA" --max-time 25 -d "content=<$P" -d "lexer=_text" -d "format=json" -d "expires=31536000" https://dpaste.org/api/ 2>/dev/null | head -c 400)
U=$(echo "$J" | grep -oP '"url"\s*:\s*"\K[^"]+' | head -1)
case "$U" in https://dpaste.org/*) add dpaste.org page "$U" "$U";; *) add dpaste.org fail "" "$J";; esac

echo "== 3) glot.io anonymous snippet =="
python3 -c "
import json
c=open('$P').read()
print(json.dumps({'language':'plaintext','title':'VANGUARD - juego de guerra gratis','public':True,'files':[{'name':'vanguard.txt','content':c}]}))
" > "$R/glot.json" 2>/dev/null
J=$(curl -s -A "$UA" --max-time 25 -H "Content-Type: application/json" --data-binary @"$R/glot.json" https://glot.io/api/snippets 2>/dev/null | head -c 300)
ID=$(echo "$J" | grep -oP '"id"\s*:\s*"\K[^"]+' | head -1)
if [ -n "$ID" ]; then add glot.io page "https://glot.io/snippets/$ID" "https://glot.io/api/snippets/$ID"; else add glot.io fail "" "$J"; fi

echo "== 4) bpa.st (bashpaste) =="
JAR="$R/bpa.jar"
CSRF=$(curl -s -c "$JAR" -A "$UA" --max-time 25 https://bpa.st/ 2>/dev/null | grep -oP 'csrfmiddlewaretoken" value="\K[^"]+' | head -1)
if [ -n "$CSRF" ]; then
  LOC=$(curl -s -b "$JAR" -A "$UA" --max-time 25 -e https://bpa.st/ -d "csrfmiddlewaretoken=$CSRF" -d "raw=<$P" -d "syntax=Plain text" -o /dev/null -w '%{redirect_url}' https://bpa.st/ 2>/dev/null)
  case "$LOC" in https://bpa.st/*) add bpa.st page "$LOC" "$LOC";; *) add bpa.st fail "" "$LOC";; esac
else add bpa.st fail "" "no-csrf"; fi

echo "== 5) paste.debian.net (JSON API) =="
J=$(curl -s -A "$UA" --max-time 25 -H "Accept: application/json" -d "content=<$P" -d "lang=plain" -d "expire=259200" https://paste.debian.net/ 2>/dev/null | head -c 300)
ID=$(echo "$J" | grep -oP '"id"\s*:\s*"\K[0-9]+' | head -1)
if [ -z "$ID" ]; then ID=$(echo "$J" | grep -oP '"id"\s*:\s*\K[0-9]+' | head -1); fi
if [ -n "$ID" ]; then add paste.debian.net page "https://paste.debian.net/$ID/" "https://paste.debian.net/plain/$ID"; else add paste.debian.net fail "" "$J"; fi

echo "== 6) sprunge.us =="
U=$(curl -s -A "$UA" --max-time 25 --data-urlencode "sprunge=<$P" https://sprunge.us 2>/dev/null | head -c 200 | tr -d '[:space:]')
case "$U" in *sprunge.us*) add sprunge.us page "$U" "$U";; *) add sprunge.us fail "" "$U";; esac

echo "== 7) 0x0.st =="
U=$(curl -s -A "$UA" --max-time 30 -F "file=@$P;type=text/plain" https://0x0.st 2>/dev/null | head -c 200 | tr -d '[:space:]')
case "$U" in http*) add 0x0.st page "$U" "$U";; *) add 0x0.st fail "" "$U";; esac

echo "== 8) envs.sh =="
U=$(curl -s -A "$UA" --max-time 30 -F "file=@$P;type=text/plain" https://envs.sh 2>/dev/null | head -c 200 | tr -d '[:space:]')
case "$U" in http*) add envs.sh page "$U" "$U";; *) add envs.sh fail "" "$U";; esac

echo "== 9) termbin.com (netcat via /dev/tcp) =="
URL=$({ printf '%s' "$(cat "$P")" >&3; timeout 8 cat <&3 2>/dev/null | head -c 100; } 3<>/dev/tcp/termbin.com/9999 | tr -d '[:space:]' | sed 's|^\(http[^ ]*\).*|\1|')
case "$URL" in http*termbin*) add termbin.com page "$URL" "$URL";; *) add termbin.com fail "" "$URL";; esac

echo "== 10) controlc.com =="
J=$(curl -s -A "$UA" --max-time 25 -d "paste_title=VANGUARD juego de guerra gratis" -d "paste_text=<$P" -d "paste_lang=Text" -o /dev/null -w '%{http_code}|%{redirect_url}' https://controlc.com/create.php 2>/dev/null)
case "$J" in *controlc.com/*) add controlc.com page "$(echo $J|cut -d'|' -f2)" "";; *) add controlc.com fail "" "$J";; esac

echo "== 11) pastelink.net =="
J=$(curl -s -A "$UA" --max-time 25 -d "title=VANGUARD juego de guerra gratis" -d "content=<$P" -o /dev/null -w '%{http_code}|%{redirect_url}' https://pastelink.net/ 2>/dev/null)
case "$J" in *pastelink.net/*) add pastelink.net page "$(echo $J|cut -d'|' -f2)" "";; *) add pastelink.net fail "" "$J";; esac

echo "---- RESULTADOS WAVE A ----"
cat "$RES"
