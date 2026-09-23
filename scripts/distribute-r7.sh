#!/bin/bash
# VANGUARD v42.1 — RONDA 7: BÚSQUEDA DE COMANDANTES (ángulo reclutamiento multijugador)
# Probados en r1-r6 + 3 canales NUEVOS (Pingler XML-RPC, Blogshares, TotalPing -L).
# Solo cuenta 2xx/3xx con confirmación real del servicio.
BASE="https://vanguard-kq9r.vercel.app"
LOG=/home/z/my-project/scripts/campaign-results.txt
echo "=== RONDA 7 $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" >> "$LOG"

# 1) Telegraph: cuenta anónima nueva (los tokens mueren solos) — ángulo RECLUTAMIENTO
TA=$(curl -s --max-time 25 "https://api.telegra.ph/createAccount?short_name=vanguardops&author_name=VANGUARD" -o /tmp/tg7acc.json -w "%{http_code}")
TOK=$(python3 -c "import json;d=json.load(open('/tmp/tg7acc.json'));print(d.get('result',{}).get('access_token',''))" 2>/dev/null)
echo "[Telegraph-account] $TA token:${#TOK}chars" | tee -a "$LOG"
if [ -n "$TOK" ]; then
R=$(curl -s --max-time 25 -X POST "https://api.telegra.ph/createPage" \
  -H "Content-Type: application/json" \
  -d '{
    "access_token": "'"$TOK"'",
    "title": "VANGUARD busca comandantes: guerra multijugador gratis por rondas (móvil, sin registro)",
    "author_name": "VANGUARD",
    "author_url": "https://vanguard-kq9r.vercel.app",
    "content": [
      {"tag":"p","children":["Se buscan comandantes para la guerra global: VANGUARD es un juego de estrategia y conflictos mundiales que corre EN EL NAVEGADOR del móvil, gratis y sin registro."]},
      {"tag":"p","children":["— GUERRA GLOBAL MULTIJUGADOR por rondas: conquista territorios en un mapa mundial en vivo","— DUELOS 1v1 con ranking ELO","— ENTRAS Y LA PÁGINA SALE EN TU IDIOMA (8: español, inglés, portugués, francés, alemán, italiano, ruso, chino)","— CONTADOR VERDE de guerreros EN LÍNEA ahora mismo: gente real, no bots","— Huracanes y volcanes de NASA, auroras NOAA, sismos USGS y la EEI en directo","— Noticias de guerra 24/7 en /guerra-hoy"]},
      {"tag":"p","children":["Entra desde el móvil y toma el mando: "]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/?ref=VGD-TELE7"},"children":["vanguard-kq9r.vercel.app — TU IDIOMA, TU GUERRA"]},
      {"tag":"p","children":["El mapa del planeta en vivo te espera. Gratis, siempre."]}
    ],
    "return_content": false
  }' -o /tmp/tg7.json -w "%{http_code}")
URL=$(python3 -c "import json;d=json.load(open('/tmp/tg7.json'));print(d.get('result',{}).get('url',''))" 2>/dev/null)
echo "[Telegraph-r7] $R -> $URL" | tee -a "$LOG"
else
echo "[Telegraph-r7] SKIP sin token" | tee -a "$LOG"
fi

# 2) paste.rs (verificado r1/r4/r5/r6)
P=$(curl -s --max-time 25 -X POST "https://paste.rs/" --data-binary @- <<'EOF' -w "|%{http_code}")
VANGUARD BÚSCA COMANDANTES — guerra multijugador gratis (móvil, sin registro)

* Guerra global por rondas: conquista territorios en vivo
* Duelos 1v1 con ranking ELO
* La página sale en TU idioma al entrar (8 idiomas)
* Contador verde de guerreros EN LÍNEA ahora mismo (gente real)
* Huracanes NASA + volcanes + auroras NOAA + sismos USGS + EEI en directo
* Noticias de guerra 24/7

ENTRAR: https://vanguard-kq9r.vercel.app/?ref=VGD-PASTE7
Noticias: https://vanguard-kq9r.vercel.app/guerra-hoy
EOF
PP7=$(echo "$P" | rev | cut -d'|' -f1 | rev); PU7=$(echo "$P" | sed 's/|[0-9]*$//')
echo "[paste.rs-r7] $PP7 -> $PU7" | tee -a "$LOG"

# 3) IndexNow API central + 4 endpoints directos (todos verificados r1) con URLs frescas
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"host":"vanguard-kq9r.vercel.app","key":"074b8db50cc83f0689a2211e3ff94db1","keyLocation":"https://vanguard-kq9r.vercel.app/074b8db50cc83f0689a2211e3ff94db1.txt","urlList":["'$BASE'/?ref=VGD-INR7","'$BASE'/guerra-hoy"]}')
echo "[IndexNow-api-r7] $R" | tee -a "$LOG"
for ENG in bing yandex seznam naver; do
  R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 \
    -X POST "https://${ENG}.indexnow.org/indexnow" \
    -H "Content-Type: application/json; charset=utf-8" \
    -d '{"host":"vanguard-kq9r.vercel.app","key":"074b8db50cc83f0689a2211e3ff94db1","keyLocation":"https://vanguard-kq9r.vercel.app/074b8db50cc83f0689a2211e3ff94db1.txt","urlList":["'$BASE'/?ref=VGD-INR7","'$BASE'/guerra-hoy"]}')
  echo "[IndexNow-${ENG}-r7] $R" | tee -a "$LOG"
done

# 4) Ping-o-Matic + Twingly (verificados todas las rondas)
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 "https://pingomatic.com/ping/?title=VANGUARD%20busca%20comandantes&blogurl=$BASE&rssurl=$BASE/feed.xml&chk_weblogscom=on&chk_blogs=on&chk_feedburner=on")
echo "[PingOMatic-r7] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://ping.twingly.com/" -H "Content-Type: text/xml" -d '<methodCall><methodName>weblogUpdates.ping</methodName><params><param><value>VANGUARD busca comandantes</value></param><param><value>'$BASE'</value></param><param><value>'$BASE/feed.xml'</value></param></params></methodCall>')
echo "[Twingly-r7] $R" | tee -a "$LOG"

# 5) WebSub x2 hubs (verificados r3-r6)
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://pubsubhubbub.appspot.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-PubSubHubbub-r7] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://hub.superfeedr.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-Superfeedr-r7] $R" | tee -a "$LOG"

# 6) NUEVO: Pingler XML-RPC (weblogUpdates.ping)
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "http://pingler.com/xmlrpc.php" -H "Content-Type: text/xml" -d '<methodCall><methodName>weblogUpdates.ping</methodName><params><param><value>VANGUARD busca comandantes</value></param><param><value>'$BASE'</value></param></params></methodCall>')
echo "[Pingler-r7] $R" | tee -a "$LOG"

# 7) NUEVO: Blogshares ping
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "http://ping.blogshares.com/rpc.php" -H "Content-Type: text/xml" -d '<methodCall><methodName>weblogUpdates.ping</methodName><params><param><value>VANGUARD busca comandantes</value></param><param><value>'$BASE'</value></param></params></methodCall>')
echo "[Blogshares-r7] $R" | tee -a "$LOG"

# 8) NUEVO: TotalPing con redirección (-L; en r1 dio 301 sin seguimiento)
R=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 30 "http://www.totalping.com/?p=tp&title=VANGUARD&url=$BASE&rss=$BASE/feed.xml&chk=1")
echo "[TotalPing-r7] $R" | tee -a "$LOG"

echo "=== FIN RONDA 7 ===" >> "$LOG"
