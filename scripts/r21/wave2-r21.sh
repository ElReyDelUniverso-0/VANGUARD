#!/bin/bash
# Ronda 21 — wave 2: Discussion fix + bpa.st cookie-csrf
R=/home/z/my-project/scripts/r21
RES="$R/results.tsv"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
TOKEN=$(cat /home/z/my-project/.ghtoken | tr -d '[:space:]')
add(){ printf '%s\t%s\t%s\t%s\t%s\n' "$1" "$2" "$3" "$4" "$5" >> "$RES"; }

echo "== D) GitHub Discussion #2 (fix) =="
python3 - "$TOKEN" <<'PYEOF'
import json, sys
tok = sys.argv[1]
body = ("Ronda 21 de difusion de la comunidad.\n\n"
        "⚔️ VANGUARD v51.0 PULSO MUNDIAL — juego de guerra GRATIS en tu navegador, ahora con intel REAL en vivo: "
        "satelite ISS (27.500 km/h), radar aereo sobre el Mar Negro, Oriente Medio y Taiwan con deteccion de aviones militares, "
        "y senales espaciales.\n\nSin descargas, sin registro: https://vanguard.world\n\n"
        "Mision comunitaria: 300 enlaces compartidos — cada publicacion en un sitio nuevo cuenta. "
        "Recompensa al llegar: 5000 monedas + 50 gemas + 800 XP para todos.")
q = {"query": "mutation($input: CreateDiscussionInput!) { createDiscussion(input: $input) { discussion { url } } }",
     "variables": {"input": {"repositoryId": "R_kgDOUYlUjA", "categoryId": "DIC_kwDOUYlUjM4DGUTg",
                             "title": "Ronda 21 — Pulso Mundial en vivo + mision 300 enlaces", "body": body}}}
open('/home/z/my-project/scripts/r21/disc.json', 'w').write(json.dumps(q))
print("disc.json OK")
PYEOF
J=$(curl -s --max-time 30 -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" --data-binary @"$R/disc.json" https://api.github.com/graphql 2>/dev/null)
U=$(echo "$J" | grep -oP 'https://github\.com/[^"]*/discussions/[0-9]+' | head -1)
if [ -n "$U" ]; then add gh-discussion-r21 page "$U" "$U" "graphql"; else add gh-discussion-r21 fail "" "" "$(echo $J | head -c 150)"; fi

echo "== B) bpa.st con csrf de cookie =="
JAR="$R/bpa2.jar"
rm -f "$JAR"
curl -s -c "$JAR" -A "$UA" --max-time 20 https://bpa.st/ -o /dev/null 2>/dev/null
CSRF=$(grep csrftoken "$JAR" 2>/dev/null | awk '{print $7}' | head -1)
echo "cookie csrf: ${CSRF:0:8}..."
if [ -n "$CSRF" ]; then
  LOC=$(curl -s -b "$JAR" -A "$UA" --max-time 25 -e https://bpa.st/ -d "csrfmiddlewaretoken=$CSRF" --data-urlencode "raw=⚔️ VANGUARD v51.0 PULSO MUNDIAL — juego de guerra GRATIS en tu navegador. Satélite ISS en vivo, radar aéreo (Mar Negro, Oriente Medio, Taiwán) y señales espaciales reales. Sin descargas: https://vanguard.world — Misión 300 enlaces de la comunidad." -d "syntax=Plain text" -o /dev/null -w '%{redirect_url}' https://bpa.st/ 2>/dev/null)
  case "$LOC" in https://bpa.st/*) add bpa.st page "$LOC" "$LOC";; *) add bpa.st fail "" "" "$LOC";; esac
else add bpa.st fail "" "" "sin-cookie-csrf"; fi

echo "---- WAVE 2 ----"
tail -2 "$RES"
