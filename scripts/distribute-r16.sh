#!/bin/bash
# VANGUARD v47.0 — RONDA 16: LA PÁGINA DE GUERRA MÁS COMPLETA
# Gancho: NASA EONET (el planeta en llamas, eventos en vivo) + DIVISAS EN CRISIS
# (cambio real, 166 monedas) + BUSCADOR de las 83 secciones (Ctrl+K).
# 3 Telegraph (ES/EN/PT) + paste.rs + rentry ES + rentry EN + núcleo (6) = 12.
BASE="https://vanguard-kq9r.vercel.app"
LOG=/home/z/my-project/scripts/campaign-results.txt
echo "=== RONDA 16 $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" >> "$LOG"

TA=$(curl -s --max-time 25 "https://api.telegra.ph/createAccount?short_name=vanguardops&author_name=VANGUARD" -o /tmp/tg16acc.json -w "%{http_code}")
TOK=$(python3 -c "import json;d=json.load(open('/tmp/tg16acc.json'));print(d.get('result',{}).get('access_token',''))" 2>/dev/null)
echo "[Telegraph-account] $TA token:${#TOK}chars" | tee -a "$LOG"

tg16() {
  curl -s --max-time 25 -X POST "https://api.telegra.ph/createPage" \
    -H "Content-Type: application/json" -d "$1" -o /tmp/tg16out.json -w "%{http_code} "
  python3 -c "import json;d=json.load(open('/tmp/tg16out.json'));print(d.get('result',{}).get('url',''))" 2>/dev/null
}

if [ -n "$TOK" ]; then
R=$(tg16 '{
    "access_token": "'"$TOK"'",
    "title": "La página de guerra más completa del planeta: NASA en vivo, divisas en crisis y 83 secciones",
    "author_name": "VANGUARD",
    "author_url": "https://vanguard-kq9r.vercel.app",
    "content": [
      {"tag":"p","children":["VANGUARD vuelve a crecer y sigue gratis, sin registro. Tres estrenos nuevos:"]},
      {"tag":"p","children":["1) EL PLANETA EN LLAMAS (NASA EONET): volcanes activos, incendios, tormentas severas, inundaciones y sismos EN VIVO con coordenadas y hora del último avistamiento, directo de los satélites de la NASA."]},
      {"tag":"p","children":["2) DIVISAS EN CRISIS: el tipo de cambio REAL contra el dólar de las monedas de los países en guerra — 1 US$ = 1.443.238 rials de Irán, rublos, grivnas, liras, bolívares. El termómetro silencioso de cada conflicto."]},
      {"tag":"p","children":["3) BUSCADOR DE SECCIONES: 83 secciones y ninguna queda escondida. Botón Buscar en el menú (o Ctrl+K / tecla /) para saltar a cualquier rincón del juego en 2 toques, con recientes."]},
      {"tag":"p","children":["Y lo de siempre: guerra global multijugador, duelo ELO, globo 3D OSINT de 15 capas, radar GDELT+GDACS, poder militar real del Banco Mundial, botín real al conquistar países, meta comunitaria con recompensa para todos y 8 idiomas."]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/?ref=VGD-TELE16"},"children":["vanguard-kq9r.vercel.app — entra gratis →"]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/guerra-hoy?ref=VGD-TELE16"},"children":["Ver NASA + divisas + poder militar en vivo"]}
    ],
    "return_content": false
  }')
echo "[Telegraph-r16-ES] $R" | tee -a "$LOG"
R=$(tg16 '{
    "access_token": "'"$TOK"'",
    "title": "The most complete war page on the planet: NASA live, crisis currencies and 83 sections",
    "author_name": "VANGUARD",
    "author_url": "https://vanguard-kq9r.vercel.app",
    "content": [
      {"tag":"p","children":["VANGUARD keeps growing and stays free, no signup. Three new arrivals:"]},
      {"tag":"p","children":["1) THE PLANET ON FIRE (NASA EONET): active volcanoes, wildfires, severe storms, floods and earthquakes LIVE with coordinates and last detection time, straight from NASA satellites."]},
      {"tag":"p","children":["2) CRISIS CURRENCIES: real exchange rates against the dollar for war-zone money — 1 US$ = 1,443,238 Iranian rials, rubles, hryvnias, liras, bolivars. The silent thermometer of every conflict."]},
      {"tag":"p","children":["3) SECTION SEARCH: 83 sections and none get buried. A Buscar button in the nav (or Ctrl+K / slash key) jumps anywhere in 2 taps, with recents."]},
      {"tag":"p","children":["Plus the classics: global multiplayer war, ELO duels, 15-layer 3D OSINT globe, GDELT+GDACS radar, real World Bank military power, real loot per conquered country, community goal with rewards for everyone, 8 languages."]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/?ref=VGD-TELE16EN"},"children":["vanguard-kq9r.vercel.app — join free →"]}
    ],
    "return_content": false
  }')
echo "[Telegraph-r16-EN] $R" | tee -a "$LOG"
R=$(tg16 '{
    "access_token": "'"$TOK"'",
    "title": "A página de guerra mais completa do planeta: NASA ao vivo, moedas em crise e 83 seções",
    "author_name": "VANGUARD",
    "author_url": "https://vanguard-kq9r.vercel.app",
    "content": [
      {"tag":"p","children":["O VANGUARD cresce de novo e continua grátis, sem cadastro. Três novidades: 1) O PLANETA EM CHAMAS (NASA EONET): vulcões, incêndios, tempestades e terremotos AO VIVO com coordenadas; 2) MOEDAS EM CRISE: câmbio REAL contra o dólar — 1 US$ = 1.443.238 riais do Irã, rublos, grívrias, liras; 3) BUSCADOR DE SEÇÕES: 83 seções, nenhuma escondida — botão Buscar ou Ctrl+K."]},
      {"tag":"p","children":["E o de sempre: guerra global multiplayer, duelos ELO, globo 3D OSINT com 15 camadas, radar GDELT+GDACS, poder militar real do Banco Mundial, meta comunitária com recompensa para todos e 8 idiomas."]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/?ref=VGD-TELE16PT"},"children":["vanguard-kq9r.vercel.app — entre grátis →"]}
    ],
    "return_content": false
  }')
echo "[Telegraph-r16-PT] $R" | tee -a "$LOG"
fi

# paste.rs
P=$(curl -s --max-time 25 -X POST "https://paste.rs/" --data-binary @- <<'EOF' -w "|%{http_code}")
VANGUARD v47.0 — LA PÁGINA DE GUERRA MÁS COMPLETA DEL PLANETA

· EL PLANETA EN LLAMAS (NASA EONET): volcanes, incendios, tormentas,
  inundaciones y sismos EN VIVO con coordenadas — satélites abiertos NASA.
· DIVISAS EN CRISIS: cambio REAL — 1 US$ = 1.443.238 rials (Irán),
  rublos, grivnas, liras... el dinero donde estalla la guerra.
· BUSCADOR DE SECCIONES: 83 secciones, salta a cualquiera en 2 toques
  (botón Buscar, Ctrl+K o tecla /).
· Guerra multijugador, ELO, globo 3D OSINT 15 capas, radar GDELT+GDACS,
  poder militar real (Banco Mundial), meta comunitaria para todos.
· Gratis, sin registro, desde el móvil, 8 idiomas.

ENTRAR: https://vanguard-kq9r.vercel.app/?ref=VGD-PASTE16
DATOS EN VIVO: https://vanguard-kq9r.vercel.app/guerra-hoy?ref=VGD-PASTE16
EOF
PP=$(echo "$P" | rev | cut -d'|' -f1 | rev); PU=$(echo "$P" | sed 's/|[0-9]*$//')
echo "[paste.rs-r16] $PP -> $PU" | tee -a "$LOG"

# rentry ES
CSRF=$(curl -s --max-time 25 -c /tmp/ren16a.txt https://rentry.co | rg -o 'name="csrfmiddlewaretoken" value="[^"]+' | head -1 | sed 's/.*value="//')
if [ -n "$CSRF" ]; then
RE=$(curl -s --max-time 25 -b /tmp/ren16a.txt -e https://rentry.co -X POST "https://rentry.co/api/new" \
  --data-urlencode "csrfmiddlewaretoken=$CSRF" \
  --data-urlencode "edit_code=vgd16edit$(date +%s)" \
  --data-urlencode "text=VANGUARD v47.0 — LA PÁGINA DE GUERRA MÁS COMPLETA DEL PLANETA

Tres estrenos nuevos, todo gratis y sin registro:

1) EL PLANETA EN LLAMAS — NASA EONET
   Volcanes activos, incendios, tormentas severas, inundaciones y
   sismos EN VIVO, con coordenadas y hora del último avistamiento.
   Datos abiertos de los satélites de la NASA.

2) DIVISAS EN CRISIS — CAMBIO REAL
   1 US$ = 1.443.238 rials de Irán. Rublos, grivnas, liras turcas,
   bolívares... Las monedas de los países en guerra con su tipo de
   cambio real, actualizado a diario.

3) BUSCADOR DE SECCIONES
   83 secciones y ninguna queda enterrada: botón Buscar en el menú
   (o Ctrl+K, o tecla /) salta a cualquier rincón en 2 toques.

Y lo de siempre: guerra global multijugador por rondas, duelos 1v1
con ELO, globo 3D OSINT de 15 capas, radar geopolítico en vivo
(GDELT + GDACS), poder militar real del Banco Mundial, botín real
al conquistar países, meta comunitaria con recompensa para todos,
8 idiomas automáticos y PWA instalable.

ENTRAR: https://vanguard-kq9r.vercel.app/?ref=VGD-REN16
DATOS EN VIVO: https://vanguard-kq9r.vercel.app/guerra-hoy?ref=VGD-REN16" \
  --data-urlencode "do_wrap=on" -w "|%{http_code}")
REC=$(echo "$RE" | rev | cut -d'|' -f1 | rev); REU=$(echo "$RE" | sed 's/|[0-9]*$//' | python3 -c "import sys,json;s=sys.stdin.read().strip();s=s[:s.rfind('|')] if '|' in s else s;print(json.loads(s).get('url','') if s.startswith('{') else '')" 2>/dev/null)
echo "[rentry-r16-ES] $REC -> $REU" | tee -a "$LOG"
fi

# rentry EN
CSRF2=$(curl -s --max-time 25 -c /tmp/ren16b.txt https://rentry.co | rg -o 'name="csrfmiddlewaretoken" value="[^"]+' | head -1 | sed 's/.*value="//')
if [ -n "$CSRF2" ]; then
RE2=$(curl -s --max-time 25 -b /tmp/ren16b.txt -e https://rentry.co -X POST "https://rentry.co/api/new" \
  --data-urlencode "csrfmiddlewaretoken=$CSRF2" \
  --data-urlencode "edit_code=vgd16editb$(date +%s)" \
  --data-urlencode "text=VANGUARD v47.0 — THE MOST COMPLETE WAR PAGE ON THE PLANET

Three new arrivals, all free, no signup:

1) THE PLANET ON FIRE — NASA EONET
   Active volcanoes, wildfires, severe storms, floods and quakes
   LIVE with coordinates and last detection time. Open satellite
   data from NASA.

2) CRISIS CURRENCIES — REAL RATES
   1 US$ = 1,443,238 Iranian rials. Rubles, hryvnias, liras,
   bolivars... war-zone money with real daily exchange rates.

3) SECTION SEARCH
   83 sections, none buried: the Buscar button (or Ctrl+K, or the
   slash key) jumps anywhere in 2 taps, with recents.

Plus the classics: round-based global multiplayer war, 1v1 ELO
duels, 15-layer 3D OSINT globe, live GDELT+GDACS radar, real World
Bank military power, real loot when you conquer, community goal
with rewards for everyone, 8 auto languages, installable PWA.

JOIN: https://vanguard-kq9r.vercel.app/?ref=VGD-REN16EN
LIVE DATA: https://vanguard-kq9r.vercel.app/guerra-hoy?ref=VGD-REN16EN" \
  --data-urlencode "do_wrap=on" -w "|%{http_code}")
RE2C=$(echo "$RE2" | rev | cut -d'|' -f1 | rev); RE2U=$(echo "$RE2" | sed 's/|[0-9]*$//' | python3 -c "import sys,json;s=sys.stdin.read().strip();s=s[:s.rfind('|')] if '|' in s else s;print(json.loads(s).get('url','') if s.startswith('{') else '')" 2>/dev/null)
echo "[rentry-r16-EN] $RE2C -> $RE2U" | tee -a "$LOG"
fi

# Núcleo (6)
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"host":"vanguard-kq9r.vercel.app","key":"074b8db50cc83f0689a2211e3ff94db1","keyLocation":"https://vanguard-kq9r.vercel.app/074b8db50cc83f0689a2211e3ff94db1.txt","urlList":["'$BASE'/?ref=VGD-INR16","'$BASE'/guerra-hoy"]}')
echo "[IndexNow-r16] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 "https://pingomatic.com/ping/?title=VANGUARD%20radar%20total&blogurl=$BASE&rssurl=$BASE/feed.xml&chk_weblogscom=on&chk_blogs=on&chk_feedburner=on")
echo "[PingOMatic-r16] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://ping.twingly.com/" -H "Content-Type: text/xml" -d '<methodCall><methodName>weblogUpdates.ping</methodName><params><param><value>VANGUARD radar total</value></param><param><value>'$BASE'</value></param><param><value>'$BASE/feed.xml'</value></param></params></methodCall>')
echo "[Twingly-r16] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://pubsubhubbub.appspot.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-PubSubHubbub-r16] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://hub.superfeedr.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-Superfeedr-r16] $R" | tee -a "$LOG"
R=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 30 "http://www.totalping.com/?p=tp&title=VANGUARD&url=$BASE&rss=$BASE/feed.xml&chk=1")
echo "[TotalPing-r16] $R" | tee -a "$LOG"

echo "=== FIN RONDA 16 ===" >> "$LOG"
