#!/bin/bash
# Ronda 25 — Wave 1: 3 paginas gh-pages nuevas + Issue + Discussion
R=/home/z/my-project/scripts/r25
RES="$R/results.tsv"
: > "$RES"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
TOKEN=$(cat /home/z/my-project/.ghtoken | tr -d '[:space:]')
add(){ printf '%s\t%s\t%s\t%s\t%s\n' "$1" "$2" "$3" "$4" "$5" >> "$RES"; }

ghpage(){  # $1=nombre-archivo $2=html
  python3 - "$1" "$2" > "$R/tmp-page.json" <<PYEOF
import base64, json, sys
name, html = sys.argv[1], sys.argv[2]
data = {"message": "Ronda 25 — pagina " + name, "content": base64.b64encode(html.encode()).decode(), "branch": "gh-pages"}
print(json.dumps(data))
PYEOF
  J=$(curl -s --max-time 30 -X PUT -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" --data-binary @"$R/tmp-page.json" "https://api.github.com/repos/ElReyDelUniverso-0/VANGUARD/contents/$1" 2>/dev/null)
  [ -n "$(echo "$J" | grep -o '"sha"')" ] && add "ghpages-$1" page "https://elreydeluniverso-0.github.io/VANGUARD/$1" "https://elreydeluniverso-0.github.io/VANGUARD/$1" || add "ghpages-$1" fail "" "" "$(echo $J | head -c 100)"
}

echo "== P1) ronda25.html =="
ghpage "ronda25.html" '<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ronda 25 — la comunidad está a punto de ganar | VANGUARD</title>
<meta name="description" content="La misión de 300 enlaces de VANGUARD está al 97%: 5000 monedas, 50 gemas y 800 XP para todos los jugadores al cruzar la meta.">
</head><body style="font-family:sans-serif;background:#0a0e14;color:#e6edf3;max-width:640px;margin:0 auto;padding:24px">
<h1>🏁 RONDA 25 — LA RONDA FINAL</h1>
<p>La comunidad de VANGUARD (juego de guerra gratis en el navegador) lleva <b>25 rondas de difusión</b> compartiendo el juego por el mundo.</p>
<h2>Estado de la misión</h2>
<ul>
<li>✅ Hito 200: conseguido — 3000 monedas + 30 gemas + 500 XP repartidos</li>
<li>🔥 Hito 300: <b>al 97%</b> — 5000 monedas + 50 gemas + 800 XP para TODOS</li>
</ul>
<h2>Lo que se comparte</h2>
<ul>
<li>La ISS real en vivo (27.500 km/h) dentro de un juego</li>
<li>Radar de aviones militares reales: Mar Negro, Oriente Medio y Taiwán</li>
<li>Y un juego de guerra completo: mapa 3D, mercado en vivo, detective multijugador</li>
</ul>
<p><a href="https://vanguard.world" style="color:#4dd0ff;font-size:20px">👉 Únete antes del hito: vanguard.world</a></p>
</body></html>'

echo "== P2) como-jugar.html =="
ghpage "como-jugar.html" '<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cómo jugar — guía rápida de VANGUARD</title>
<meta name="description" content="Guía rápida de VANGUARD: entra sin registro, cobra tu bono diario, escanea el planeta y domina el mapa 3D.">
</head><body style="font-family:sans-serif;background:#0a0e14;color:#e6edf3;max-width:640px;margin:0 auto;padding:24px">
<h1>📖 CÓMO JUGAR — VANGUARD</h1>
<p>Gratis, en tu navegador, sin registro. Entras y juegas en 10 segundos.</p>
<h2>Primeros pasos</h2>
<ul>
<li>🎁 Al entrar, reclama tu <b>bono diario</b> (botón RECLAMAR BONO DIARIO)</li>
<li>🛰️ Ve a la pestaña <b>PULSO MUNDIAL</b> y pulsa <b>ESCANEAR</b>: +5 monedas cada 60 segundos viendo la ISS y el radar militar real</li>
<li>🗺️ En el <b>MAPA</b> exploras las 24 regiones del mundo en 3D</li>
<li>📈 En el <b>MERCADO</b> compras y vendes acciones con precios en vivo</li>
<li>🕵️ En <b>DETECTIVE</b> juegas multijugador: mentir, deducir y juzgar</li>
<li>🚁 Los <b>DRONES</b> tienen minijuegos 3D con recompensas</li>
</ul>
<h2>Consejos de agente</h2>
<ul>
<li>Invita amigos con tu código VGD: +100 monedas por cada 3 invitados</li>
<li>El radar marca en ROJO los aviones militares (F-16, F-35, B-52...)</li>
<li>Cada zona del mapa tiene recursos y conflictos distintos</li>
</ul>
<p><a href="https://vanguard.world" style="color:#4dd0ff;font-size:20px">👉 Jugar ahora en vanguard.world</a></p>
</body></html>'

echo "== P3) detective.html =="
ghpage "detective.html" '<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>El Detective multijugador: miente, deduce, juzga | VANGUARD</title>
<meta name="description" content="El modo Detective de VANGUARD: un crimen, jugadores con coartadas falsas, pistas plantadas y un juicio final. Multijugador gratis en el navegador.">
</head><body style="font-family:sans-serif;background:#0a0e14;color:#e6edf3;max-width:640px;margin:0 auto;padding:24px">
<h1>🕵️ MODO DETECTIVE — engaño y juicio</h1>
<p>Dentro de VANGUARD (juego de guerra gratis en el navegador) existe un modo multijugador donde la mente es el arma.</p>
<h2>Cómo funciona</h2>
<ul>
<li>Ocurre un crimen y cada jugador cuenta su versión: <b>algunos mienten</b></li>
<li>Los sospechosos pueden <b>plantar pistas falsas</b> para desviar la investigación</li>
<li>El detective interroga, cruza coartadas y descubre contradicciones</li>
<li>Todo termina en un <b>JUICIO</b> en vivo: la sala vota y el culpable es condenado (o escapa)</li>
</ul>
<h2>Por qué es único</h2>
<p>No es un juego de pistas estáticas: los engaños los inventan jugadores reales en tiempo real. Cada partida es distinta, y la reputación se gana (o se pierde) en cada juicio.</p>
<p><a href="https://vanguard.world" style="color:#ff5252;font-size:20px">👉 Jugar al Detective en vanguard.world</a></p>
</body></html>'

echo "== I) Issue Ronda 25 =="
python3 - > "$R/issue25.json" <<'PYEOF'
import json
body = ("Ronda 25 de difusion de la comunidad.\n\n"
        "Progreso: 291/300 enlaces (97%). Solo faltan 9. Recompensa al cruzar: 5000 monedas + 50 gemas + 800 XP para todos.\n\n"
        "Paginas nuevas: ronda25.html (la ronda final), como-jugar.html (guia rapida), detective.html (modo multijugador).\n\n"
        "Juega gratis: https://vanguard.world")
print(json.dumps({"title": "Ronda 25 — a 9 enlaces del hito 300", "body": body}))
PYEOF
J=$(curl -s --max-time 30 -X POST -H "Authorization: Bearer $TOKEN" -H "Accept: application/vnd.github+json" --data-binary @"$R/issue25.json" https://api.github.com/repos/ElReyDelUniverso-0/VANGUARD/issues 2>/dev/null)
IU=$(echo "$J" | grep -oP '"html_url"\s*:\s*"\K[^"]*issues/[0-9]+' | head -1)
[ -n "$IU" ] && add gh-issue-r25 page "$IU" "$IU" || add gh-issue-r25 fail "" "" "$(echo $J | head -c 100)"

echo "== D) Discussion Ronda 25 =="
python3 - "$TOKEN" > "$R/disc25.json" <<'PYEOF'
import json, sys
tok = sys.argv[1]
body = ("Ronda 25 de difusion de la comunidad.\n\n"
        "Vamos 291/300 enlaces (97%). FALTAN 9. Al cruzar: 5000 monedas + 50 gemas + 800 XP para TODOS.\n\n"
        "Paginas nuevas:\n"
        "- Guia rapida: elreydeluniverso-0.github.io/VANGUARD/como-jugar.html\n"
        "- Modo Detective: elreydeluniverso-0.github.io/VANGUARD/detective.html\n"
        "- Ronda 25: elreydeluniverso-0.github.io/VANGUARD/ronda25.html\n\n"
        "Juega gratis, sin registro: https://vanguard.world")
q = {"query": "mutation($input: CreateDiscussionInput!) { createDiscussion(input: $input) { discussion { url } } }",
     "variables": {"input": {"repositoryId": "R_kgDOUYlUjA", "categoryId": "DIC_kwDOUYlUjM4DGUTg", "title": "🏁 Ronda 25 — a 9 enlaces del hito 300", "body": body}}}
print(json.dumps(q))
PYEOF
J=$(curl -s --max-time 30 -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" --data-binary @"$R/disc25.json" https://api.github.com/graphql 2>/dev/null)
U=$(echo "$J" | grep -oP 'https://github\.com/[^"]*/discussions/[0-9]+' | head -1)
[ -n "$U" ] && add gh-discussion-r25 page "$U" "$U" || add gh-discussion-r25 fail "" "" "$(echo $J | head -c 120)"

echo "---- RESULTADOS WAVE 1 R25 ----"
cat "$RES"
