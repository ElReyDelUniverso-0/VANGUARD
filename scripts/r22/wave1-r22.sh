#!/bin/bash
# Ronda 22 — Wave 1: GitHub firepower (2 paginas + issue + discussion) + canales estables
R=/home/z/my-project/scripts/r22
P="$R/promo-r22.txt"
RES="$R/results.tsv"
: > "$RES"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
TOKEN=$(cat /home/z/my-project/.ghtoken | tr -d '[:space:]')
VW="https://vanguard.world"
add(){ printf '%s\t%s\t%s\t%s\t%s\n' "$1" "$2" "$3" "$4" "$5" >> "$RES"; }

echo "== 1) gh-pages ronda22.html =="
python3 - > "$R/page22.json" <<PYEOF
import base64, json
html = """<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>VANGUARD Ronda 22 — ESCANEA el planeta: +5 monedas y radar militar en vivo</title>
<meta name="description" content="Escanea el planeta en VANGUARD: ISS en vivo, radar aéreo militar y señales espaciales. Juego de guerra gratis en el navegador.">
</head><body style="font-family:sans-serif;background:#0a0e14;color:#e6edf3;max-width:640px;margin:0 auto;padding:24px">
<h1>⚔️ VANGUARD — RONDA 22</h1>
<p>Juego de guerra GRATIS en tu navegador. Sin descargas, sin registro: juegas en 10 segundos.</p>
<h2>📡 ESCANEA el planeta = +5 monedas cada 60s</h2>
<ul>
<li>Botón ESCANEAR en la pestaña PULSO MUNDIAL: +5 monedas y +2 XP gratis cada 60 segundos</li>
<li>Satélite ISS en vivo: posición, altitud y velocidad reales (~27.500 km/h)</li>
<li>Radar aéreo MILITAR en vivo sobre 3 zonas calientes: Mar Negro, Oriente Medio y Estrecho de Taiwán</li>
<li>Aviones militares marcados en rojo con callsign, tipo y velocidad</li>
<li>Señales espaciales: lanzamientos y noticias de fuentes reales</li>
</ul>
<p><a href="https://vanguard.world" style="color:#4dd0ff;font-size:20px">👉 Juega ahora en vanguard.world</a></p>
<p>🎁 Misión: 300 enlaces compartidos → 5000 monedas + 50 gemas + 800 XP para TODOS.</p>
</body></html>"""
data = {"message": "Ronda 22 — pagina ESCANEA", "content": base64.b64encode(html.encode()).decode(), "branch": "gh-pages"}
print(json.dumps(data))
PYEOF
J=$(curl -s --max-time 30 -X PUT -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" --data-binary @"$R/page22.json" "https://api.github.com/repos/ElReyDelUniverso-0/VANGUARD/contents/ronda22.html" 2>/dev/null)
[ -n "$(echo "$J" | grep -o '"sha"')" ] && add ghpages-ronda22 page "https://elreydeluniverso-0.github.io/VANGUARD/ronda22.html" "https://elreydeluniverso-0.github.io/VANGUARD/ronda22.html" "put-api" || add ghpages-ronda22 fail "" "" "$(echo $J | head -c 100)"

echo "== 2) gh-pages radar-militar.html =="
python3 - > "$R/pageradar.json" <<PYEOF
import base64, json
html = """<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Radar aéreo militar en vivo — Mar Negro, Oriente Medio y Taiwán | VANGUARD</title>
<meta name="description" content="Cómo funciona el radar aéreo militar en vivo de VANGUARD: datos reales de vuelo sobre 3 zonas calientes del mundo.">
</head><body style="font-family:sans-serif;background:#0a0e14;color:#e6edf3;max-width:640px;margin:0 auto;padding:24px">
<h1>🛩️ RADAR MILITAR EN VIVO — VANGUARD</h1>
<p>VANGUARD (juego de guerra gratis en el navegador) ahora muestra tráfico aéreo REAL con detección de aeronaves militares.</p>
<h2>Las 3 zonas que vigilamos</h2>
<ul>
<li><b>Mar Negro</b> — frontera de la guerra: el espacio aéreo ucraniano lleva cerrado desde 2022; si ves pocos vuelos civiles, eso ES el dato real de la guerra.</li>
<li><b>Oriente Medio (Tel Aviv)</b> — una de las zonas con más actividad militar del planeta.</li>
<li><b>Estrecho de Taiwán</b> — cruce diario de cientos de vuelos entre dos potencias.</li>
</ul>
<h2>Cómo detectamos lo militar</h2>
<p>Por prefijo de callsign (RCH, FORTE, NATO, ASCOT, VIPER...) y por tipo de aeronave (F-16, F-35, C-17, B-52, E-3, P-8...). Los aviones militares aparecen en ROJO en tu radar.</p>
<p><a href="https://vanguard.world" style="color:#ff5252;font-size:20px">👉 Abre tu radar en vanguard.world</a></p>
</body></html>"""
data = {"message": "Ronda 22 — pagina radar militar", "content": base64.b64encode(html.encode()).decode(), "branch": "gh-pages"}
print(json.dumps(data))
PYEOF
J=$(curl -s --max-time 30 -X PUT -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" --data-binary @"$R/pageradar.json" "https://api.github.com/repos/ElReyDelUniverso-0/VANGUARD/contents/radar-militar.html" 2>/dev/null)
[ -n "$(echo "$J" | grep -o '"sha"')" ] && add ghpages-radar page "https://elreydeluniverso-0.github.io/VANGUARD/radar-militar.html" "https://elreydeluniverso-0.github.io/VANGUARD/radar-militar.html" "put-api" || add ghpages-radar fail "" "" "$(echo $J | head -c 100)"

echo "== 3) Issue #11 =="
python3 - > "$R/issue11.json" <<'PYEOF'
import json
body = ("Ronda 22 de difusion de la comunidad.\n\n"
        "Paginas nuevas de la ronda:\n"
        "- ESCANEA el planeta: +5 monedas cada 60s en la pestana PULSO MUNDIAL\n"
        "- Radar militar en vivo: Mar Negro / Oriente Medio / Taiwan\n"
        "- ISS en vivo: ~27.500 km/h sobre tu cabeza\n\n"
        "Mision comunitaria: 300 enlaces compartidos — recompensa 5000 monedas + 50 gemas + 800 XP para todos.\n\n"
        "Juega gratis: https://vanguard.world")
print(json.dumps({"title": "Ronda 22 — ESCANEA +5 monedas y radar militar en vivo", "body": body}))
PYEOF
J=$(curl -s --max-time 30 -X POST -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" --data-binary @"$R/issue11.json" https://api.github.com/repos/ElReyDelUniverso-0/VANGUARD/issues 2>/dev/null)
IU=$(echo "$J" | grep -oP '"html_url"\s*:\s*"\K[^"]*issues/[0-9]+' | head -1)
[ -n "$IU" ] && add gh-issue-r22 page "$IU" "$IU" "rest" || add gh-issue-r22 fail "" "" "$(echo $J | head -c 100)"

echo "== 4) Discussion #10 (GraphQL) =="
python3 - "$TOKEN" > "$R/disc22.json" <<'PYEOF'
import json, sys
tok = sys.argv[1]
body = ("Ronda 22 de difusion de la comunidad.\n\n"
        "Novedades que compartimos esta ronda:\n"
        "- ESCANEA el planeta: +5 monedas y +2 XP gratis cada 60 segundos\n"
        "- Radar aereo militar EN VIVO: Mar Negro, Oriente Medio y Estrecho de Taiwan\n"
        "- Aviones militares en rojo: F-16, F-35, C-17, B-52 y mas (43 prefijos y 28 tipos)\n"
        "- ISS en vivo: posicion, altitud y velocidad reales (~27.500 km/h)\n"
        "- Senales espaciales de fuentes reales\n\n"
        "Mision: 300 enlaces compartidos. Al llegar: 5000 monedas + 50 gemas + 800 XP para TODOS.\n\n"
        "Juega gratis, sin registro: https://vanguard.world")
q = {"query": "mutation($input: CreateDiscussionInput!) { createDiscussion(input: $input) { discussion { url } } }",
     "variables": {"input": {"repositoryId": "R_kgDOUYlUjA", "categoryId": "DIC_kwDOUYlUjM4DGUTg", "title": "⚔️ Ronda 22 — Radar militar en vivo + mision 300 enlaces", "body": body}}}
print(json.dumps(q))
PYEOF
J=$(curl -s --max-time 30 -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" --data-binary @"$R/disc22.json" https://api.github.com/graphql 2>/dev/null)
U=$(echo "$J" | grep -oP 'https://github\.com/[^"]*/discussions/[0-9]+' | head -1)
[ -n "$U" ] && add gh-discussion-r22 page "$U" "$U" "graphql" || add gh-discussion-r22 fail "" "" "$(echo $J | head -c 120)"

echo "== 5) HedgeDoc envs.net =="
LOC=$(curl -s -A "$UA" --max-time 25 -H "Content-Type: text/plain" --data-binary @"$P" -o /dev/null -w '%{redirect_url}' "https://hedgedoc.envs.net/new" 2>/dev/null)
case "$LOC" in https://hedgedoc.envs.net/*) add hedgedoc-envs page "$LOC" "${LOC}download";; *) add hedgedoc-envs fail "" "" "$(echo $LOC | head -c 60)";; esac

echo "== 6) pad.nixnet.services =="
LOC=$(curl -s -A "$UA" --max-time 25 -H "Content-Type: text/plain" --data-binary @"$P" -o /dev/null -w '%{redirect_url}' "https://pad.nixnet.services/new" 2>/dev/null)
case "$LOC" in https://pad.nixnet.services/*) add nixnet-pad page "$LOC" "${LOC}download";; *) add nixnet-pad fail "" "" "$(echo $LOC | head -c 60)";; esac

echo "== 7) x0.at =="
U=$(curl -s -A "$UA" --max-time 30 -F "file=@$P;type=text/plain" https://x0.at 2>/dev/null | head -c 200 | tr -d '[:space:]')
case "$U" in https://x0.at/*|http://x0.at/*) add x0.at page "$U" "$U";; *) add x0.at fail "" "" "$U";; esac

echo "== 8) paste.rs =="
U=$(curl -s --max-time 25 --data-binary @"$P" https://paste.rs 2>/dev/null | head -c 200 | tr -d '[:space:]')
case "$U" in https://paste.rs/*) add paste.rs page "$U" "$U";; *) add paste.rs fail "" "" "$U";; esac

echo "== 9) hst.sh =="
python3 -c "
import json
print(json.dumps({'content': open('/home/z/my-project/scripts/r22/promo-r22.txt').read()}))
" > "$R/hst22.json"
J=$(curl -s -A "$UA" --max-time 25 -H "Content-Type: application/json" --data-binary @"$R/hst22.json" https://hst.sh/documents 2>/dev/null | head -c 200)
K=$(echo "$J" | grep -oP '"key"\s*:\s*"\K[^"]+' | head -1)
[ -n "$K" ] && add hst.sh page "https://hst.sh/$K" "https://hst.sh/raw/$K" || add hst.sh fail "" "" "$(echo $J | head -c 80)"

echo "== 10) clck.ru =="
U=$(curl -s -A "$UA" --max-time 20 "https://clck.ru/--?url=$VW" 2>/dev/null | head -c 200 | tr -d '[:space:]')
case "$U" in https://clck.ru/*) add clck.ru short "$U" "$U";; *) add clck.ru fail "" "" "$U";; esac

echo "== 11) spoo.me =="
J=$(curl -s -A "$UA" --max-time 20 -H "Accept: application/json" -d "url=$VW" https://spoo.me/ 2>/dev/null | head -c 300)
S=$(echo "$J" | grep -oP '"short_url"\s*:\s*"\K[^"]+' | head -1 | sed 's|^http://|https://|')
[ -n "$S" ] && add spoo.me short "$S" "$S" || add spoo.me fail "" "" "$(echo $J | head -c 80)"

echo "== 12/13) IndexNow x2 =="
CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "https://api.indexnow.org/indexnow?url=https%3A%2F%2Fvanguard.world&key=074b8db50cc83f0689a2211e3ff94db1" 2>/dev/null)
case "$CODE" in 200|202) add indexnow-generic api "https://api.indexnow.org/indexnow?url=https%3A%2F%2Fvanguard.world&key=074b8db50cc83f0689a2211e3ff94db1" "" "http-$CODE";; *) add indexnow-generic fail "" "" "http-$CODE";; esac
CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "https://seaapi.seozoom.it/v1/IndexNow?url=https%3A%2F%2Fvanguard.world&key=074b8db50cc83f0689a2211e3ff94db1" 2>/dev/null)
case "$CODE" in 200|202) add indexnow-seozoom api "https://seaapi.seozoom.it/v1/IndexNow?url=https%3A%2F%2Fvanguard.world&key=074b8db50cc83f0689a2211e3ff94db1" "" "http-$CODE";; *) add indexnow-seozoom fail "" "" "http-$CODE";; esac

echo "---- RESULTADOS WAVE 1 ----"
cat "$RES"
