#!/bin/bash
# Ronda 21 — v51.0 desplegada: enlaces nuevos (GitHub Discussion #2 + gh-pages ronda21 + bpa.st + shorts)
R=/home/z/my-project/scripts/r21
RES="$R/results.tsv"
: > "$RES"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
TOKEN=$(cat /home/z/my-project/.ghtoken | tr -d '[:space:]')
VW="https://vanguard.world"
add(){ printf '%s\t%s\t%s\t%s\t%s\n' "$1" "$2" "$3" "$4" "$5" >> "$RES"; }

TEXTO="⚔️ VANGUARD v51.0 PULSO MUNDIAL — juego de guerra GRATIS en tu navegador, ahora con intel REAL en vivo: satélite ISS (27.500 km/h), radar aéreo sobre el Mar Negro, Oriente Medio y Taiwán con detección de aviones militares, y señales espaciales. Sin descargas, sin registro: https://vanguard.world"

echo "== 1) GitHub Discussion #2 (Ronda 21) =="
python3 - "$TOKEN" > "$R/disc.json" <<'PYEOF'
import json, sys
tok = sys.argv[1]
body = "Ronda 21 de difusion de la comunidad.\n\n" + TEXTO + "\n\nMision comunitaria: 300 enlaces compartidos — cada publicacion en un sitio nuevo cuenta. Recompensa al llegar: 5000 monedas + 50 gemas + 800 XP para todos.\n\nJuega: https://vanguard.world"
q = {"query": "mutation($input: CreateDiscussionInput) { createDiscussion(input: $input) { discussion { url } } }",
     "variables": {"input": {"repositoryId": "R_kgDOUYlUjA", "categoryId": "DIC_kwDOUYlUjM4DGUTg", "title": "⚔️ Ronda 21 — Pulso Mundial en vivo + mision 300 enlaces", "body": body}}}
open('/home/z/my-project/scripts/r21/disc.json','w').write(json.dumps(q))
PYEOF
J=$(curl -s --max-time 30 -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" --data-binary @"$R/disc.json" https://api.github.com/graphql 2>/dev/null)
U=$(echo "$J" | grep -oP 'https://github\.com/[^"]*/discussions/[0-9]+' | head -1)
if [ -n "$U" ]; then add gh-discussion-r21 page "$U" "$U" "graphql"; else add gh-discussion-r21 fail "" "" "$(echo $J | head -c 120)"; fi

echo "== 2) gh-pages ronda21.html =="
python3 - > "$R/page21.json" <<PYEOF
import base64, json
html = """<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>VANGUARD v51.0 — Pulso Mundial: satélite, radar aéreo y señales en vivo</title>
<meta name="description" content="Juego de guerra gratuito en el navegador con inteligencia real en vivo: ISS, radar aéreo y más.">
</head><body style="font-family:sans-serif;background:#0a0e14;color:#e6edf3;max-width:640px;margin:0 auto;padding:24px">
<h1>⚔️ VANGUARD v51.0 — PULSO MUNDIAL</h1>
<p>Juego de guerra GRATIS que corre en tu navegador. Sin descargas, sin registro: juegas en 10 segundos.</p>
<h2>🛰️ Nuevo en v51.0 — intel REAL en vivo (sin API keys)</h2>
<ul>
<li>Satélite ISS en vivo: posición, altitud y velocidad reales (~27.500 km/h)</li>
<li>Radar aéreo en vivo sobre 3 zonas calientes: Mar Negro (frontera de la guerra), Oriente Medio y Estrecho de Taiwán</li>
<li>Detección de aviones militares por callsign y tipo de aeronave</li>
<li>Señales espaciales: lanzamientos y satélites (fuente real)</li>
</ul>
<p><a href="https://vanguard.world" style="color:#4dd0ff;font-size:20px">👉 Juega ahora en vanguard.world</a></p>
<p>Misión comunitaria: comparte el enlace en un sitio nuevo y suma para la meta de 300. Recompensa: 5000 monedas + 50 gemas + 800 XP.</p>
</body></html>"""
data = {"message": "Ronda 21 — pagina Pulso Mundial", "content": base64.b64encode(html.encode()).decode(), "branch": "gh-pages"}
print(json.dumps(data))
PYEOF
J=$(curl -s --max-time 30 -X PUT -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" --data-binary @"$R/page21.json" "https://api.github.com/repos/ElReyDelUniverso-0/VANGUARD/contents/ronda21.html" 2>/dev/null)
[ -n "$(echo "$J" | grep -o '"sha"')" ] && add ghpages-ronda21 page "https://elreydeluniverso-0.github.io/VANGUARD/ronda21.html" "https://elreydeluniverso-0.github.io/VANGUARD/ronda21.html" "put-api" || add ghpages-ronda21 fail "" "" "$(echo $J | head -c 100)"

echo "== 3) bpa.st retry =="
JAR="$R/bpa.jar"
BODE=$(curl -s -o /dev/null -w '%{http_code}' -A "$UA" --max-time 20 https://bpa.st/ 2>/dev/null)
echo "GET / -> $BODE"
if [ "$BODE" = "200" ]; then
  CSRF=$(curl -s -c "$JAR" -A "$UA" --max-time 20 https://bpa.st/ 2>/dev/null | grep -oP 'csrfmiddlewaretoken" value="\K[^"]+' | head -1)
  if [ -n "$CSRF" ]; then
    LOC=$(curl -s -b "$JAR" -A "$UA" --max-time 25 -e https://bpa.st/ -d "csrfmiddlewaretoken=$CSRF" --data-urlencode "raw=$TEXTO" -d "syntax=Plain text" -o /dev/null -w '%{redirect_url}' https://bpa.st/ 2>/dev/null)
    case "$LOC" in https://bpa.st/*) add bpa.st page "$LOC" "$LOC";; *) add bpa.st fail "" "" "$LOC";; esac
  else add bpa.st fail "" "" "sin-csrf"; fi
else add bpa.st fail "" "" "http-$BODE"; fi

echo "== 4) shorl.com =="
B=$(curl -s -A "$UA" --max-time 20 -d "url=$VW" https://shorl.com/ 2>/dev/null)
S=$(echo "$B" | grep -oP 'https://shorl\.com/[a-z0-9]+' | grep -v shorl.com/\" | head -1)
if [ -n "$S" ]; then add shorl short "$S" "$S"; else add shorl fail "" "" "$(echo $B | head -c 60)"; fi

echo "== 5) t2m.io =="
B=$(curl -s -A "$UA" --max-time 20 -d "url=$VW" https://t2m.io/ 2>/dev/null)
S=$(echo "$B" | grep -oP 'https://t2m\.io/[A-Za-z0-9]+' | head -1)
if [ -n "$S" ]; then add t2mio short "$S" "$S"; else add t2mio fail "" "" "$(echo $B | head -c 60)"; fi

echo "---- RESULTADOS RONDA 21 ----"
cat "$RES"
