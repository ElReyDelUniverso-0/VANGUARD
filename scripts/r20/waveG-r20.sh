#!/bin/bash
# Ronda 20 — Wave G: bytebin fix + wiki bootstrap + write.as + lodgeit GNOME/openSUSE + Software Heritage
R=/home/z/my-project/scripts/r20
P="$R/promo-r20.txt"
RES="$R/resultsG.tsv"
: > "$RES"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
TOKEN=$(cat /home/z/my-project/.ghtoken | tr -d '[:space:]')
add(){ printf '%s\t%s\t%s\t%s\t%s\n' "$1" "$2" "$3" "$4" "$5" >> "$RES"; }

echo "== G1) bytebin correcto (headers a archivo) =="
HDR="$R/bytebin.hdr"
CODE=$(curl -s -D "$HDR" -A "$UA" --max-time 25 -X POST -H "Content-Type: text/plain" --data-binary @"$P" -o /dev/null -w '%{http_code}' https://bytebin.lucko.me/ 2>/dev/null)
KEY=$(grep -i '^key:' "$HDR" 2>/dev/null | head -1 | awk '{print $2}' | tr -d '\r')
echo "code=$CODE key=$KEY"
if [ -n "$KEY" ]; then add bytebin page "https://bytebin.lucko.me/$KEY" "https://bytebin.lucko.me/$KEY" "http-$CODE"; else add bytebin fail "" "" "code=$CODE"; fi

echo "== G2) wiki bootstrap git init+push =="
rm -rf "$R/wiki20b" && mkdir -p "$R/wiki20b"
cd "$R/wiki20b" && git init -q -b master && git remote add origin "https://ElReyDelUniverso-0:${TOKEN}@github.com/ElReyDelUniverso-0/VANGUARD.wiki.git"
cat > Mision-300.md <<EOF
# ⚔️ VANGUARD — Mision 300 enlaces

$(cat "$P")

## Juega ahora
**https://vanguard.world**

Pagina de la comunidad para la meta de 300 enlaces compartidos. Cada enlace cuenta.
EOF
git add . && git -c user.email=vanguard@vanguard.world -c user.name=VANGUARD commit -qm "Mision 300 — Ronda 20"
if git push -q origin master 2>"$R/wiki-push.err"; then
  add github-wiki page "https://github.com/ElReyDelUniverso-0/VANGUARD/wiki/Mision-300" "https://github.com/ElReyDelUniverso-0/VANGUARD/wiki/Mision-300" "bootstrap-push"
else
  add github-wiki fail "" "" "$(head -c 100 $R/wiki-push.err)"
fi
cd /home/z/my-project

echo "== G3) write.as anonimo =="
python3 -c "
import json
c = open('/home/z/my-project/scripts/r20/promo-r20.txt').read()
body = '# VANGUARD — juego de guerra gratis en tu navegador\n\n' + c + '\n\n**Entra a jugar: https://vanguard.world**\n'
print(json.dumps({'body': body}))
" > "$R/writeas.json"
J=$(curl -s -A "$UA" --max-time 25 -H "Content-Type: application/json" --data-binary @"$R/writeas.json" https://write.as/api/posts 2>/dev/null | head -c 500)
T=$(echo "$J" | grep -oP '"token"\s*:\s*"\K[^"]+' | head -1)
if [ -n "$T" ]; then add write.as page "https://write.as/$T" "https://write.as/$T" "anon"; else add write.as fail "" "" "$(echo $J | head -c 100)"; fi

echo "== G4) lodgeit paste.gnome.org =="
python3 -c "
import json
c = open('/home/z/my-project/scripts/r20/promo-r20.txt').read()
print(json.dumps({'jsonrpc':'2.0','method':'paste.create','id':1,'params':{'language':'text','code':c,'private':False}}))
" > "$R/lodgeit.json"
for H in paste.gnome.org paste.opensuse.org; do
  J=$(curl -s -A "$UA" --max-time 20 -H "Content-Type: application/json" --data-binary @"$R/lodgeit.json" "https://$H/jsonrpc" 2>/dev/null | head -c 400)
  ID=$(echo "$J" | grep -oP '"paste_id"\s*:\s*"\K[^"]+' | head -1)
  if [ -n "$ID" ]; then add "lodgeit-$H" page "https://$H/$ID" "https://$H/raw/$ID" "jsonrpc"; else add "lodgeit-$H" fail "" "" "$(echo $J | head -c 80)"; fi
done

echo "== G5) Software Heritage save =="
J=$(curl -s -A "$UA" --max-time 30 -X POST -H "Accept: application/json" "https://archive.softwareheritage.org/api/1/origin/save/git/url/https://github.com/ElReyDelUniverso-0/VANGUARD/" 2>/dev/null | head -c 400)
ST=$(echo "$J" | grep -oP '"save_request_status"\s*:\s*"\K[^"]+' | head -1)
if [ -n "$ST" ]; then add software-heritage page "https://archive.softwareheritage.org/browse/origin/directory/?origin_url=https://github.com/ElReyDelUniverso-0/VANGUARD" "" "save-$ST"; else add software-heritage fail "" "" "$(echo $J | head -c 100)"; fi

echo "---- RESULTADOS G ----"
cat "$RES"
