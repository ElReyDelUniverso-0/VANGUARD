#!/bin/bash
# Ronda 20 — Wave F: wiki enable + bytebin + hedgedoc extras + jsbin + tilde
R=/home/z/my-project/scripts/r20
P="$R/promo-r20.txt"
RES="$R/resultsF.tsv"
: > "$RES"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
TOKEN=$(cat /home/z/my-project/.ghtoken | tr -d '[:space:]')
add(){ printf '%s\t%s\t%s\t%s\t%s\n' "$1" "$2" "$3" "$4" "$5" >> "$RES"; }

echo "== F1) habilitar wiki + push =="
CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 25 -X PATCH -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" -d '{"has_wiki":true}' https://api.github.com/repos/ElReyDelUniverso-0/VANGUARD 2>/dev/null)
echo "PATCH has_wiki -> $CODE"
if [ "$CODE" = "200" ]; then
  rm -rf "$R/wiki20"
  if git clone --quiet "https://ElReyDelUniverso-0:${TOKEN}@github.com/ElReyDelUniverso-0/VANGUARD.wiki.git" "$R/wiki20" 2>"$R/wiki-clone.err"; then
    cat > "$R/wiki20/Mision-300.md" <<EOF
# ⚔️ VANGUARD — Mision 300 enlaces

$(cat "$P")

## Juega ahora
**https://vanguard.world**

Pagina de la comunidad para la meta de 300 enlaces compartidos. Cada enlace cuenta.
EOF
    cd "$R/wiki20" && git add . && git -c user.email=vanguard@vanguard.world -c user.name=VANGUARD commit -qm "Mision 300 — Ronda 20" && git push -q origin master 2>/dev/null || git push -q origin main
    cd /home/z/my-project
    add github-wiki page "https://github.com/ElReyDelUniverso-0/VANGUARD/wiki/Mision-300" "https://github.com/ElReyDelUniverso-0/VANGUARD/wiki/Mision-300" "push"
  else
    add github-wiki fail "" "" "$(head -c 100 $R/wiki-clone.err)"
  fi
else
  add github-wiki fail "" "" "patch-$CODE"
fi

echo "== F2) bytebin.lucko.me =="
RESP=$(curl -s -i -A "$UA" --max-time 25 -X POST -H "Content-Type: text/plain" --data-binary @"$P" https://bytebin.lucko.me/ 2>/dev/null)
KEY=$(echo "$RESP" | grep -i -oP '(?i)^\s*key\s*:\s*\K\S+' | head -1 | tr -d '\r')
[ -z "$KEY" ] && KEY=$(echo "$RESP" | tail -1 | grep -oP '^[A-Za-z0-9_-]{4,}$' | head -1)
if [ -n "$KEY" ]; then add bytebin page "https://bytebin.lucko.me/$KEY" "https://bytebin.lucko.me/$KEY" "post"; else add bytebin fail "" "" "$(echo "$RESP" | head -c 80)"; fi

echo "== F3) HedgeDoc extras =="
for H in hedgedoc.softwaretalk.de md.opensourceecology.org hedgedoc.unetresgrossebite.com; do
  LOC=$(curl -s -A "$UA" --max-time 20 -H "Content-Type: text/plain" --data-binary @"$P" -o /dev/null -w '%{redirect_url}' "https://$H/new" 2>/dev/null)
  case "$LOC" in
    https://$H/*) add "hedgedoc-$H" page "$LOC" "${LOC}download" "post";;
    *) add "hedgedoc-$H" fail "" "" "$(echo $LOC | head -c 50)";;
  esac
done

echo "== F4) jsbin.com =="
J=$(curl -s -A "$UA" --max-time 20 -X POST -H "Content-Type: application/x-www-form-urlencoded" --data-urlencode "html=<a href='https://vanguard.world'>VANGUARD juego de guerra gratis</a>" https://jsbin.com/api/save 2>/dev/null | head -c 300)
U=$(echo "$J" | grep -oP 'https?://jsbin\.com/[a-zA-Z0-9]+' | head -1)
if [ -n "$U" ]; then add jsbin page "$U" "$U"; else add jsbin fail "" "" "$(echo $J|head -c 80)"; fi

echo "== F5) paste.tilde.team =="
B=$(curl -s -A "$UA" --max-time 25 -F "content=<$P" -F "lang=plain" https://paste.tilde.team/ 2>/dev/null | head -c 2000)
U=$(echo "$B" | grep -oP 'https?://paste\.tilde\.team/[a-zA-Z0-9/]+' | head -1)
if [ -n "$U" ]; then add tildepaste page "$U" "$U"; else add tildepaste fail "" "" "$(echo $B|head -c 80)"; fi

echo "---- RESULTADOS F ----"
cat "$RES"
