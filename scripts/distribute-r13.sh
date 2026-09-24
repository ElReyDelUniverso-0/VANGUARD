#!/bin/bash
# VANGUARD v44.0 — RONDA 13: PODER MUNDIAL (Banco Mundial dentro del juego)
# Nuevo gancho: cifras militares REALES (US$997B EE.UU., Ucrania 34,5% PIB).
# 3 Telegraph (ES/EN/PT) + paste.rs + rentry ES + rentry EN + núcleo (6) = 12.
BASE="https://vanguard-kq9r.vercel.app"
LOG=/home/z/my-project/scripts/campaign-results.txt
echo "=== RONDA 13 $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" >> "$LOG"

TA=$(curl -s --max-time 25 "https://api.telegra.ph/createAccount?short_name=vanguardops&author_name=VANGUARD" -o /tmp/tg13acc.json -w "%{http_code}")
TOK=$(python3 -c "import json;d=json.load(open('/tmp/tg13acc.json'));print(d.get('result',{}).get('access_token',''))" 2>/dev/null)
echo "[Telegraph-account] $TA token:${#TOK}chars" | tee -a "$LOG"

tg13() { # $1 json -> crea página, imprime "code url"
  curl -s --max-time 25 -X POST "https://api.telegra.ph/createPage" \
    -H "Content-Type: application/json" -d "$1" -o /tmp/tg13out.json -w "%{http_code} "
  python3 -c "import json;d=json.load(open('/tmp/tg13out.json'));print(d.get('result',{}).get('url',''))" 2>/dev/null
}

if [ -n "$TOK" ]; then
R=$(tg13 '{
    "access_token": "'"$TOK"'",
    "title": "Los ejércitos del planeta en cifras REALES — ahora dentro de VANGUARD",
    "author_name": "VANGUARD",
    "author_url": "https://vanguard-kq9r.vercel.app",
    "content": [
      {"tag":"p","children":["¿Cuánto gasta EE.UU. en lo militar? US$ 997.000 millones al año. ¿Y Ucrania? El 34,5% de TODO su PIB. Rusia, el 7,1%. Arabia Saudita, el 7,3%. Estos no son rumores: son los indicadores abiertos del Banco Mundial (2024), ahora integrados en VANGUARD."]},
      {"tag":"p","children":["La nueva sección PODER MILITAR REAL muestra país por país: gasto militar en dólares, personas en servicio activo y porcentaje del PIB — 16 potencias, actualizadas, gratis y en español."]},
      {"tag":"p","children":["Y junto a la tabla sigue el Radar Geopolítico (GDELT, ~100.000 medios, en vivo) y las alertas de desastres de GDACS (Comisión Europea). Leer la guerra y JUGARLA: guerra global multijugador por rondas, duelos 1v1 ELO, globo 3D con 15 capas OSINT, quiz, dron strike 3D, bolsa de países."]},
      {"tag":"p","children":["100% gratis, sin registro, desde cualquier móvil."]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/guerra-hoy?ref=VGD-TELE13"},"children":["Ver la tabla PODER MILITAR REAL + radar en vivo"]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/?ref=VGD-TELE13"},"children":["Tomar el mando del juego →"]}
    ],
    "return_content": false
  }')
echo "[Telegraph-r13-ES] $R" | tee -a "$LOG"
R=$(tg13 '{
    "access_token": "'"$TOK"'",
    "title": "Who really pays for war? Real World Bank data now inside VANGUARD",
    "author_name": "VANGUARD",
    "author_url": "https://vanguard-kq9r.vercel.app",
    "content": [
      {"tag":"p","children":["How much does the US spend on its military? US$ 997 BILLION a year. Ukraine burns 34.5% of its entire GDP. Russia 7.1%. Saudi Arabia 7.3%. Not rumors — open World Bank indicators (2024), now integrated into VANGUARD."]},
      {"tag":"p","children":["The new REAL MILITARY POWER section shows, country by country: military spending in dollars, active personnel, and share of GDP — 16 major powers, free, in your phone browser."]},
      {"tag":"p","children":["Next to it: the Geopolitical Radar (GDELT, ~100,000 outlets, live) and GDACS disaster alerts (European Commission). Then stop reading and PLAY: global multiplayer war by rounds, 1v1 ELO duels, 3D OSINT globe with 15 layers, drone strike 3D, country stock market."]},
      {"tag":"p","children":["100% free, no signup, any phone."]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/guerra-hoy?ref=VGD-TELE13EN"},"children":["See REAL MILITARY POWER + live radar"]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/?ref=VGD-TELE13EN"},"children":["Take command of the game →"]}
    ],
    "return_content": false
  }')
echo "[Telegraph-r13-EN] $R" | tee -a "$LOG"
R=$(tg13 '{
    "access_token": "'"$TOK"'",
    "title": "Quem gasta mais com guerra? Dados REAIS do Banco Mundial dentro do VANGUARD",
    "author_name": "VANGUARD",
    "author_url": "https://vanguard-kq9r.vercel.app",
    "content": [
      {"tag":"p","children":["Quanto os EUA gastam com o exército? US$ 997 BILHÕES por ano. A Ucrânia queima 34,5% de todo o PIB. A Rússia, 7,1%. A Arábia Saudita, 7,3%. Não são rumores: são os indicadores abertos do Banco Mundial (2024), agora integrados ao VANGUARD."]},
      {"tag":"p","children":["A nova seção PODER MILITAR REAL mostra país por país: gasto militar em dólares, efetivo em serviço ativo e porcentagem do PIB — 16 potências, de graça, no navegador do celular."]},
      {"tag":"p","children":["E ao lado: o Radar Geopolítico (GDELT, ~100.000 veículos de imprensa, ao vivo) e alertas de desastres do GDACS (Comissão Europeia). Depois de ler, JOGUE: guerra global multiplayer por rodadas, duelos 1v1 com ELO, globo 3D com 15 camadas OSINT."]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/guerra-hoy?ref=VGD-TELE13PT"},"children":["Ver PODER MILITAR REAL + radar ao vivo"]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/?ref=VGD-TELE13PT"},"children":["Jogar agora →"]}
    ],
    "return_content": false
  }')
echo "[Telegraph-r13-PT] $R" | tee -a "$LOG"
fi

# paste.rs
P=$(curl -s --max-time 25 -X POST "https://paste.rs/" --data-binary @- <<'EOF' -w "|%{http_code}")
VANGUARD v44.0 — PODER MILITAR REAL (Banco Mundial) dentro de la página

¿Cuánto gasta cada país en guerra? Ahora lo ves al instante:
· EE.UU.: US$ 997 mil M/año · China: US$ 314 mil M · Rusia: 7,1% del PIB
· Ucrania: 34,5% del PIB · India: 3,1 M de personas en servicio
16 potencias: gasto militar + personal armado + % PIB + año.
Junto al Radar Geopolítico (GDELT ~100.000 medios) y alertas GDACS.

DATOS: https://vanguard-kq9r.vercel.app/guerra-hoy?ref=VGD-PASTE13
JUGAR: https://vanguard-kq9r.vercel.app/?ref=VGD-PASTE13
EOF
PP=$(echo "$P" | rev | cut -d'|' -f1 | rev); PU=$(echo "$P" | sed 's/|[0-9]*$//')
echo "[paste.rs-r13] $PP -> $PU" | tee -a "$LOG"

# rentry ES
CSRF=$(curl -s --max-time 25 -c /tmp/ren13a.txt https://rentry.co | rg -o 'name="csrfmiddlewaretoken" value="[^"]+' | head -1 | sed 's/.*value="//')
if [ -n "$CSRF" ]; then
RE=$(curl -s --max-time 25 -b /tmp/ren13a.txt -e https://rentry.co -X POST "https://rentry.co/api/new" \
  --data-urlencode "csrfmiddlewaretoken=$CSRF" \
  --data-urlencode "edit_code=vgd13edit$(date +%s)" \
  --data-urlencode "text=VANGUARD v44.0 — PODER MILITAR REAL: los datos del Banco Mundial dentro del juego

¿Cuánto gasta cada país en lo militar? La nueva sección de VANGUARD
lo muestra país por país, con los indicadores abiertos del Banco Mundial:

· GASTO MILITAR en dólares (EE.UU. US$ 997 mil M/año, China US$ 314 mil M)
· PERSONAL ARMADO en servicio activo (India 3,1 M, EE.UU. 1,4 M, China 2,5 M)
· % DEL PIB (Ucrania 34,5%, Arabia Saudita 7,3%, Rusia 7,1%)
· Año del dato — 16 potencias, en español, gratis, sin registro

Y al lado, el Radar Geopolítico Global: GDELT (~100.000 medios del
planeta) en vivo + alertas de desastres GDACS (Comisión Europea).

Leer la guerra es gratis. Jugarla también:
DATOS + RADAR: https://vanguard-kq9r.vercel.app/guerra-hoy?ref=VGD-REN13
MANDO: https://vanguard-kq9r.vercel.app/?ref=VGD-REN13" \
  --data-urlencode "do_wrap=on" -w "|%{http_code}")
REC=$(echo "$RE" | rev | cut -d'|' -f1 | rev); REU=$(echo "$RE" | sed 's/|[0-9]*$//' | python3 -c "import sys,json;s=sys.stdin.read().strip();s=s[:s.rfind('|')] if '|' in s else s;print(json.loads(s).get('url','') if s.startswith('{') else '')" 2>/dev/null)
echo "[rentry-r13-ES] $REC -> $REU" | tee -a "$LOG"
fi

# rentry EN
CSRF2=$(curl -s --max-time 25 -c /tmp/ren13b.txt https://rentry.co | rg -o 'name="csrfmiddlewaretoken" value="[^"]+' | head -1 | sed 's/.*value="//')
if [ -n "$CSRF2" ]; then
RE2=$(curl -s --max-time 25 -b /tmp/ren13b.txt -e https://rentry.co -X POST "https://rentry.co/api/new" \
  --data-urlencode "csrfmiddlewaretoken=$CSRF2" \
  --data-urlencode "edit_code=vgd13editb$(date +%s)" \
  --data-urlencode "text=VANGUARD v44.0 — REAL MILITARY POWER: World Bank data inside the game

How much does each country spend on war? VANGUARD's new section shows it
country by country, using open World Bank indicators:

· MILITARY SPENDING in dollars (USA US$ 997 B/yr, China US$ 314 B)
· ACTIVE PERSONNEL (India 3.1 M, USA 1.4 M, China 2.5 M)
· SHARE OF GDP (Ukraine 34.5%, Saudi Arabia 7.3%, Russia 7.1%)
· Data year — 16 major powers, free, no signup

Next to it: the Global Geopolitical Radar — GDELT (~100,000 outlets
worldwide) live + GDACS disaster alerts (European Commission).

Reading the war is free. Playing it too:
DATA + RADAR: https://vanguard-kq9r.vercel.app/guerra-hoy?ref=VGD-REN13EN
COMMAND: https://vanguard-kq9r.vercel.app/?ref=VGD-REN13EN" \
  --data-urlencode "do_wrap=on" -w "|%{http_code}")
RE2C=$(echo "$RE2" | rev | cut -d'|' -f1 | rev); RE2U=$(echo "$RE2" | sed 's/|[0-9]*$//' | python3 -c "import sys,json;s=sys.stdin.read().strip();s=s[:s.rfind('|')] if '|' in s else s;print(json.loads(s).get('url','') if s.startswith('{') else '')" 2>/dev/null)
echo "[rentry-r13-EN] $RE2C -> $RE2U" | tee -a "$LOG"
fi

# Núcleo (6): IndexNow + PingOMatic + Twingly + WebSub x2 + TotalPing
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"host":"vanguard-kq9r.vercel.app","key":"074b8db50cc83f0689a2211e3ff94db1","keyLocation":"https://vanguard-kq9r.vercel.app/074b8db50cc83f0689a2211e3ff94db1.txt","urlList":["'$BASE'/?ref=VGD-INR13","'$BASE'/guerra-hoy"]}')
echo "[IndexNow-r13] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 "https://pingomatic.com/ping/?title=VANGUARD%20poder%20militar%20real&blogurl=$BASE&rssurl=$BASE/feed.xml&chk_weblogscom=on&chk_blogs=on&chk_feedburner=on")
echo "[PingOMatic-r13] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://ping.twingly.com/" -H "Content-Type: text/xml" -d '<methodCall><methodName>weblogUpdates.ping</methodName><params><param><value>VANGUARD poder militar real</value></param><param><value>'$BASE'</value></param><param><value>'$BASE/feed.xml'</value></param></params></methodCall>')
echo "[Twingly-r13] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://pubsubhubbub.appspot.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-PubSubHubbub-r13] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://hub.superfeedr.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-Superfeedr-r13] $R" | tee -a "$LOG"
R=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 30 "http://www.totalping.com/?p=tp&title=VANGUARD&url=$BASE&rss=$BASE/feed.xml&chk=1")
echo "[TotalPing-r13] $R" | tee -a "$LOG"

echo "=== FIN RONDA 13 ===" >> "$LOG"
