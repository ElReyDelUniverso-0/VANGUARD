#!/bin/bash
# Ronda 20 — Wave B/C/D: acortadores nuevos + GitHub Issue/Wiki + IndexNow otros motores + HedgeDoc
R=/home/z/my-project/scripts/r20
P="$R/promo-r20.txt"
RES="$R/resultsB.tsv"
: > "$RES"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
VW="https://vanguard.world"
add(){ printf '%s\t%s\t%s\t%s\t%s\n' "$1" "$2" "$3" "$4" "$5" >> "$RES"; } # name | kind | page | verify | note

echo "== B1) tinyurl.com create.php =="
B=$(curl -s -A "$UA" --max-time 25 "https://tinyurl.com/create.php?url=https%3A%2F%2Fvanguard.world" 2>/dev/null)
U=$(echo "$B" | grep -oP 'https://tinyurl\.com/[a-z0-9]+' | grep -v create | head -1)
if [ -n "$U" ]; then add tinyurl short "$U" "$U" "form"; else add tinyurl fail "" "" "$(echo $B|head -c 80)"; fi

echo "== B2) zws.im (Zero Width Shortener) =="
for EP in "https://zws.im/api/urls" "https://zws.im/api/shorten"; do
  J=$(curl -s -A "$UA" --max-time 20 -H "Content-Type: application/json" -d '{"url":"https://vanguard.world"}' "$EP" 2>/dev/null | head -c 300)
  U=$(echo "$J" | grep -oP '"url"\s*:\s*"\Khttps[^"]+' | head -1)
  if [ -n "$U" ] && [ -z "$(echo $U | grep vanguard)" ]; then add zws.im short "$U" "$U" "$EP"; break; fi
done
[ -z "$(grep -c zws "$RES")" ] || grep -q "zws.im" "$RES" || add zws.im fail "" "" "$J"

echo "== B3) frama.link (LSTU) =="
for EXTRA in "lstu_format=json" "format=json"; do
  J=$(curl -s -A "$UA" --max-time 20 -d "url=$VW" -d "$EXTRA" https://frama.link/a 2>/dev/null | head -c 300)
  U=$(echo "$J" | grep -oP '"short"\s*:\s*"\Khttps[^"]+' | head -1)
  if [ -n "$U" ]; then add frama.link short "$U" "$U" "json"; break; fi
done
grep -q "frama.link" "$RES" || add frama.link fail "" "" "$(echo $J | head -c 80)"

echo "== B4) gg.gg =="
B=$(curl -s -A "$UA" --max-time 20 -d "url=$VW" -d "submit=Shorten" https://gg.gg/ 2>/dev/null | head -c 2000)
U=$(echo "$B" | grep -oP 'https?://gg\.gg/[a-zA-Z0-9]+' | head -1)
if [ -n "$U" ]; then add gg.gg short "$U" "$U" "post"; else add gg.gg fail "" "" "$(echo $B | head -c 60)"; fi

echo "== C1) GitHub Issue =="
TOKEN=$(cat /home/z/my-project/.ghtoken | tr -d '[:space:]')
python3 -c "
import json
c = open('/home/z/my-project/scripts/r20/promo-r20.txt').read()
body = 'Mision de difusion — Ronda 20\n\n' + c + '\nEntra a jugar: https://vanguard.world\n'
print(json.dumps({'title':'⚔️ Mision 300 enlaces — Ronda 20','body':body}))
" > "$R/issue.json"
J=$(curl -s --max-time 30 -X POST -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" --data-binary @"$R/issue.json" https://api.github.com/repos/ElReyDelUniverso-0/VANGUARD/issues 2>/dev/null)
NU=$(echo "$J" | grep -oP '"html_url"\s*:\s*"\K[^"]*issues/[0-9]+' | head -1)
if [ -n "$NU" ]; then add github-issue page "$NU" "$NU" "api"; else add github-issue fail "" "" "$(echo $J | head -c 100)"; fi

echo "== C2) GitHub Wiki =="
rm -rf "$R/wiki20"
if git clone --quiet "https://x-access-token:${TOKEN}@github.com/ElReyDelUniverso-0/VANGUARD.wiki.git" "$R/wiki20" 2>"$R/wiki-clone.err"; then
  cat > "$R/wiki20/Mision-300.md" <<EOF
# ⚔️ VANGUARD — Mision 300 enlaces

$(cat "$P")

## Juega ahora
**https://vanguard.world**

Pagina de la comunidad para la meta de 300 enlaces compartidos. Cada enlace cuenta.
EOF
  cd "$R/wiki20" && git add . && git -c user.email=vanguard@vanguard.world -c user.name=VANGUARD commit -qm "Mision 300 — Ronda 20" && git push -q origin master 2>/dev/null || git push -q origin main 2>/dev/null
  cd /home/z/my-project
  add github-wiki page "https://github.com/ElReyDelUniverso-0/VANGUARD/wiki/Mision-300" "https://github.com/ElReyDelUniverso-0/VANGUARD/wiki/Mision-300" "push"
else
  add github-wiki fail "" "" "$(head -c 100 $R/wiki-clone.err 2>/dev/null)"
fi

echo "== C3) IndexNow api.indexnow.org (generico) =="
CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "https://api.indexnow.org/indexnow?url=https%3A%2F%2Fvanguard.world&key=074b8db50cc83f0689a2211e3ff94db1" 2>/dev/null)
case "$CODE" in 200|202) add indexnow-generic page "https://api.indexnow.org/indexnow?url=https%3A%2F%2Fvanguard.world&key=074b8db50cc83f0689a2211e3ff94db1" "" "http-$CODE";; *) add indexnow-generic fail "" "" "http-$CODE";; esac

echo "== C4) IndexNow seozoom =="
CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "https://seaapi.seozoom.it/v1/IndexNow?url=https%3A%2F%2Fvanguard.world&key=074b8db50cc83f0689a2211e3ff94db1" 2>/dev/null)
case "$CODE" in 200|202) add indexnow-seozoom page "https://seaapi.seozoom.it/v1/IndexNow?url=https%3A%2F%2Fvanguard.world&key=074b8db50cc83f0689a2211e3ff94db1" "" "http-$CODE";; *) add indexnow-seozoom fail "" "" "http-$CODE";; esac

echo "== D1/D2) HedgeDoc anonimo =="
for H in hedgedoc.envs.net pad.nixnet.services; do
  LOC=$(curl -s -A "$UA" --max-time 25 -H "Content-Type: text/plain" --data-binary @"$P" -o /dev/null -w '%{redirect_url}' "https://$H/new" 2>/dev/null)
  case "$LOC" in
    https://$H/*) add hedgedoc-$H page "$LOC" "${LOC}download" "post";;
    *) add hedgedoc-$H fail "" "" "$(echo $LOC | head -c 60)";;
  esac
done

echo "---- RESULTADOS B/C/D ----"
cat "$RES"
