#!/bin/bash
# Ronda 22 — Wave 3: 4 plataformas nuevas + 3a pagina gh-pages (ISS)
R=/home/z/my-project/scripts/r22
P="$R/promo-r22.txt"
RES="$R/results.tsv"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
TOKEN=$(cat /home/z/my-project/.ghtoken | tr -d '[:space:]')
add(){ printf '%s\t%s\t%s\t%s\t%s\n' "$1" "$2" "$3" "$4" "$5" >> "$RES"; }

echo "== W1) gh-pages senal-iss.html =="
python3 - > "$R/pageiss.json" <<PYEOF
import base64, json
html = """<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>La ISS vuela a 27.500 km/h y puedes verla en vivo | VANGUARD</title>
<meta name="description" content="Sigue la Estación Espacial Internacional en tiempo real dentro de VANGUARD: posición, altitud y velocidad reales, gratis y sin registro.">
</head><body style="font-family:sans-serif;background:#0a0e14;color:#e6edf3;max-width:640px;margin:0 auto;padding:24px">
<h1>🛰️ LA ISS EN VIVO — dentro de un juego</h1>
<p>VANGUARD, el juego de guerra gratuito de navegador, ahora muestra la Estación Espacial Internacional con datos REALES de wheretheiss.at: posición sobre el planeta, altitud (~420 km) y velocidad (~27.500 km/h).</p>
<h2>Qué más verás al escanear</h2>
<ul>
<li>Radar aéreo militar en vivo: Mar Negro, Oriente Medio y Taiwán</li>
<li>Aviones militares en rojo (F-16, F-35, C-17, B-52...)</li>
<li>Señales espaciales: lanzamientos y noticias de fuentes reales</li>
<li>ESCÁNEA cada 60 segundos: +5 monedas +2 XP gratis</li>
</ul>
<p>Sin descargas, sin registro: entras y juegas en 10 segundos.</p>
<p><a href="https://vanguard.world" style="color:#4dd0ff;font-size:20px">👉 Ver la ISS ahora en vanguard.world</a></p>
</body></html>"""
data = {"message": "Ronda 22 — pagina ISS en vivo", "content": base64.b64encode(html.encode()).decode(), "branch": "gh-pages"}
print(json.dumps(data))
PYEOF
J=$(curl -s --max-time 30 -X PUT -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" --data-binary @"$R/pageiss.json" "https://api.github.com/repos/ElReyDelUniverso-0/VANGUARD/contents/senal-iss.html" 2>/dev/null)
[ -n "$(echo "$J" | grep -o '"sha"')" ] && add ghpages-iss page "https://elreydeluniverso-0.github.io/VANGUARD/senal-iss.html" "https://elreydeluniverso-0.github.io/VANGUARD/senal-iss.html" "put-api" || add ghpages-iss fail "" "" "$(echo $J | head -c 100)"

echo "== W2) dpaste.de =="
J=$(curl -s -A "$UA" --max-time 25 -H "Content-Type: application/json" -d "{\"content\": $(python3 -c "import json;print(json.dumps(open('/home/z/my-project/scripts/r22/promo-r22.txt').read()))"), \"format\": \"json\"}" https://dpaste.de/api/ 2>/dev/null | head -c 400)
U=$(echo "$J" | grep -oP 'https://dpaste\.de/[a-zA-Z0-9]+' | head -1)
[ -n "$U" ] && add dpaste.de page "$U" "${U}/raw" || add dpaste.de fail "" "" "$(echo $J | head -c 80)"

echo "== W3) tpaste.us =="
U=$(curl -s -A "$UA" --max-time 25 --data-urlencode "text@$P" https://tpaste.us/ 2>/dev/null | head -c 2000)
S=$(echo "$U" | grep -oP 'https?://tpaste\.us/[a-zA-Z0-9]+' | head -1)
[ -n "$S" ] && add tpaste.us page "$S" "$S" || add tpaste.us fail "" "" "$(echo $U | head -c 80)"

echo "== W4) pastes.io =="
B=$(curl -s -A "$UA" -c "$R/pio.jar" --max-time 25 https://pastes.io/ -o /dev/null 2>/dev/null)
CSRF=$(curl -s -b "$R/pio.jar" -A "$UA" --max-time 25 https://pastes.io/ 2>/dev/null | grep -oP 'CSRF_TOKEN[^"]*"[^"]*"[^"]*"\K[^"]+' | head -1)
add pastes.io fail "" "" "csrf-complejo-skip"

echo "== W5) sudopaste.net =="
B=$(curl -s -A "$UA" --max-time 25 -d "text@$P" https://sudopaste.net/ 2>/dev/null | head -c 2000)
S=$(echo "$B" | grep -oP 'https?://sudopaste\.net/p/[a-zA-Z0-9]+' | head -1)
[ -n "$S" ] && add sudopaste page "$S" "$S" || add sudopaste fail "" "" "$(echo $B | head -c 80)"

echo "---- RESULTADOS WAVE 3 ----"
tail -5 "$RES"
