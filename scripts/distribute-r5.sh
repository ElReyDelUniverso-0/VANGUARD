#!/bin/bash
# VANGUARD v41.0 — RONDA 5: PLANETA VIVO (NASA + auroras + EEI + quiz/duelo)
# Canales ya verificados en r1-r4 + Telegraph con cuenta anónima nueva.
# Solo cuenta 2xx/3xx con confirmación real del servicio.
BASE="https://vanguard-kq9r.vercel.app"
LOG=/home/z/my-project/scripts/campaign-results.txt
echo "=== RONDA 5 $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" >> "$LOG"

# 1) Telegraph: cuenta anónima nueva (el token de r4 quedó muerto) + página con keywords
TA=$(curl -s --max-time 25 "https://api.telegra.ph/createAccount?short_name=vanguardops&author_name=VANGUARD" -o /tmp/tg5acc.json -w "%{http_code}")
TOK=$(python3 -c "import json;d=json.load(open('/tmp/tg5acc.json'));print(d.get('result',{}).get('access_token',''))" 2>/dev/null)
echo "[Telegraph-account] $TA token:${#TOK}chars" | tee -a "$LOG"
if [ -n "$TOK" ]; then
R=$(curl -s --max-time 25 -X POST "https://api.telegra.ph/createPage" \
  -H "Content-Type: application/json" \
  -d '{
    "access_token": "'"$TOK"'",
    "title": "Planeta Vivo gratis: mapa 3D con huracanes, volcanes, auroras y la EEI en directo",
    "author_name": "VANGUARD",
    "author_url": "https://vanguard-kq9r.vercel.app",
    "content": [
      {"tag":"p","children":["VANGUARD lanza PLANETA VIVO: un globo 3D con las capas reales del planeta, gratis y sin instalar nada:"]},
      {"tag":"p","children":["— Huracanes, tifones y volcanes ACTIVOS ahora mismo (NASA EONET)","— Cinturón de AURORAS en vivo (predicción NOAA Space Weather)","— Sismos M4.5+ de las últimas 24h (USGS)","— La Estación Espacial Internacional pasando EN DIRECTO sobre tu casa","— Duelo de países: ¿QUIÉN GANA? con datos oficiales del Banco Mundial","— DESAFÍO GEO: quiz de geopolítica con récord personal"]},
      {"tag":"p","children":["Todo en el navegador del móvil, cero coste: "]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/?ref=VGD-TELE5"},"children":["vanguard-kq9r.vercel.app — abrir el Planeta Vivo"]},
      {"tag":"p","children":["Menú INTELIGENCIA > PLANETA. Noticias de guerra 24/7 en /guerra-hoy."]}
    ],
    "return_content": false
  }' -o /tmp/tg5.json -w "%{http_code}")
URL=$(python3 -c "import json;d=json.load(open('/tmp/tg5.json'));print(d.get('result',{}).get('url',''))" 2>/dev/null)
echo "[Telegraph-planeta] $R -> $URL" | tee -a "$LOG"
else
echo "[Telegraph-planeta] SKIP sin token" | tee -a "$LOG"
fi

# 2) paste.rs (verificado r4/r1)
P=$(curl -s --max-time 25 -X POST "https://paste.rs/" --data-binary @- <<'EOF' -w "|%{http_code}")
VANGUARD — PLANETA VIVO: el mapa de TODO (gratis, móvil, sin registro)

En un solo globo 3D, en vivo:
* Huracanes/tifones activos + volcanes + incendios (NASA EONET)
* Aurora boreal: cinturón de probabilidad EN VIVO (NOAA)
* Sismos M4.5+ últimas 24h (USGS)
* La EEI cruzando el cielo AHORA (posición real cada 6 seg)
* Duelo ¿QUIÉN GANA? entre países con datos del Banco Mundial
* Quiz DESAFÍO GEO con récord local

ENTRAR: https://vanguard-kq9r.vercel.app/?ref=VGD-PASTE5
Ruta: menú INTELIGENCIA > PLANETA
Noticias de guerra: https://vanguard-kq9r.vercel.app/guerra-hoy
EOF
PP5=$(echo "$P" | rev | cut -d'|' -f1 | rev); PU5=$(echo "$P" | sed 's/|[0-9]*$//')
echo "[paste.rs-planeta] $PP5 -> $PU5" | tee -a "$LOG"

# 3) IndexNow (verificado r1-r4)
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"host":"vanguard-kq9r.vercel.app","key":"074b8db50cc83f0689a2211e3ff94db1","keyLocation":"https://vanguard-kq9r.vercel.app/074b8db50cc83f0689a2211e3ff94db1.txt","urlList":["'$BASE'/?ref=VGD-INR5","'$BASE'/guerra-hoy"]}')
echo "[IndexNow-r5] $R" | tee -a "$LOG"

# 4) Ping-o-Matic (verificado r1-r4)
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 "https://pingomatic.com/ping/?title=VANGUARD%20Planeta%20Vivo&blogurl=$BASE&rssurl=$BASE/feed.xml&chk_weblogscom=on&chk_blogs=on&chk_feedburner=on")
echo "[PingOMatic-r5] $R" | tee -a "$LOG"

# 5) Twingly (verificado r1-r4)
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://ping.twingly.com/" -H "Content-Type: text/xml" -d '<methodCall><methodName>weblogUpdates.ping</methodName><params><param><value>VANGUARD Planeta Vivo</value></param><param><value>'$BASE'</value></param><param><value>'$BASE/feed.xml'</value></param></params></methodCall>')
echo "[Twingly-r5] $R" | tee -a "$LOG"

# 6) WebSub x2 hubs (verificado r3)
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://pubsubhubbub.appspot.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-PubSubHubbub-r5] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://hub.superfeedr.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-Superfeedr-r5] $R" | tee -a "$LOG"

echo "=== FIN RONDA 5 ===" >> "$LOG"
