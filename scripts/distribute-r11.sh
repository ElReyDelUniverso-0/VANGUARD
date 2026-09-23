#!/bin/bash
# VANGUARD v42.4 — RONDA 11: FAQ SIN HUMO (objeciones que frenan al jugador)
# Canales vivos r1-r10: Telegraph, paste.rs, rentry.co, IndexNow(central),
# Ping-o-Matic, Twingly, WebSub x2, TotalPing(-L).
# Muertos, NO reintentar: dpaste.com (IP bloqueada), dpaste.org (405),
# 0x0.st (000), Pingler, Blogshares, IndexNow directo, WhatUseek.
BASE="https://vanguard-kq9r.vercel.app"
LOG=/home/z/my-project/scripts/campaign-results.txt
echo "=== RONDA 11 $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" >> "$LOG"

# 1) Telegraph ES — FAQ
TA=$(curl -s --max-time 25 "https://api.telegra.ph/createAccount?short_name=vanguardops&author_name=VANGUARD" -o /tmp/tg11acc.json -w "%{http_code}")
TOK=$(python3 -c "import json;d=json.load(open('/tmp/tg11acc.json'));print(d.get('result',{}).get('access_token',''))" 2>/dev/null)
echo "[Telegraph-account] $TA token:${#TOK}chars" | tee -a "$LOG"
if [ -n "$TOK" ]; then
R=$(curl -s --max-time 25 -X POST "https://api.telegra.ph/createPage" \
  -H "Content-Type: application/json" \
  -d '{
    "access_token": "'"$TOK"'",
    "title": "Preguntas que todos hacen antes de entrar a VANGUARD — respondidas sin humo",
    "author_name": "VANGUARD",
    "author_url": "https://vanguard-kq9r.vercel.app",
    "content": [
      {"tag":"p","children":["¿Es gratis de verdad? SÍ. Cero descargas, cero suscripción, cero tarjeta. Todo el contenido del juego se abre con un enlace."]},
      {"tag":"p","children":["¿Tengo que registrarme? NO. Entras y ya eres comandante. Sin correo, sin contraseña, sin verificar nada."]},
      {"tag":"p","children":["¿Funciona en mi teléfono? SÍ — está hecho para el móvil primero: el globo 3D, el mercado y la guerra multijugador corren en el navegador de cualquier teléfono."]},
      {"tag":"p","children":["¿Hay gente jugando o estoy solo? HAY GENTE — hay un contador verde EN VIVO en la cabecera: ves cuántos comandantes están conectados ahora mismo, con latidos reales cada 30 segundos. Nada de números falsos."]},
      {"tag":"p","children":["¿Qué puedo hacer ahí dentro? 6 juegos en uno: conquista global por rondas, duelos 1v1 con ranking ELO, quiz de geografía, dron strike 3D, simulador de guerras y bolsa de países con gemas. Además noticias de guerra reales al minuto."]},
      {"tag":"p","children":["¿Y si no hablo español? La página te detecta el idioma del navegador sola: español, inglés, portugués, francés, italiano, ruso, chino y alemán."]},
      {"tag":"p","children":["¿Cuánto tarda entrar? 10 segundos. El resto es guerra."]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/?ref=VGD-TELE11"},"children":["vanguard-kq9r.vercel.app — toma el mando"]}
    ],
    "return_content": false
  }' -o /tmp/tg11.json -w "%{http_code}")
URL=$(python3 -c "import json;d=json.load(open('/tmp/tg11.json'));print(d.get('result',{}).get('url',''))" 2>/dev/null)
echo "[Telegraph-r11] $R -> $URL" | tee -a "$LOG"
else
echo "[Telegraph-r11] SKIP sin token" | tee -a "$LOG"
fi

# 2) paste.rs ES
P=$(curl -s --max-time 25 -X POST "https://paste.rs/" --data-binary @- <<'EOF' -w "|%{http_code}")
VANGUARD — PREGUNTAS QUE TODOS HACEN (respondidas sin humo)

¿Es gratis? SÍ. ¿Registro? NINGUNO. ¿Móvil? ES LO PRIMERO.
¿Hay gente? Contador EN VIVO en la cabecera — latidos reales cada 30s.
¿Qué hago ahí? 6 juegos: conquista por rondas, duelos ELO, quiz,
dron 3D, simulador y bolsa de países + noticias de guerra al minuto.
¿Idioma? Detecta el tuyo solo: ES/EN/PT/FR/IT/RU/ZH/DE.

ENTRAR (10 segundos): https://vanguard-kq9r.vercel.app/?ref=VGD-PASTE11
NOTICIAS: https://vanguard-kq9r.vercel.app/guerra-hoy
EOF
PP=$(echo "$P" | rev | cut -d'|' -f1 | rev); PU=$(echo "$P" | sed 's/|[0-9]*$//')
echo "[paste.rs-r11] $PP -> $PU" | tee -a "$LOG"

# 3) rentry.co EN — segundo uso del canal conquistado en r10
CSRF=$(curl -s --max-time 25 -c /tmp/ren11c.txt https://rentry.co | rg -o 'name="csrfmiddlewaretoken" value="[^"]+' | head -1 | sed 's/.*value="//')
if [ -n "$CSRF" ]; then
RE=$(curl -s --max-time 25 -b /tmp/ren11c.txt -e https://rentry.co -X POST "https://rentry.co/api/new" \
  --data-urlencode "csrfmiddlewaretoken=$CSRF" \
  --data-urlencode "edit_code=vgd11edit$(date +%s)" \
  --data-urlencode "text=VANGUARD — questions everyone asks before entering (no BS answers)

Is it really free? YES. No download, no subscription, no card.
Do I need an account? NO. You open the link and you are a commander.
Does it work on my phone? YES — mobile-first: 3D globe, market and multiplayer war run in any phone browser.
Are there real players? YES — live green counter in the header, real heartbeats every 30 seconds.
What is there to do? 6 games in one: round-based global conquest, 1v1 ELO duels, geography quiz, 3D drone strike, war simulator, country stock market + live war news.
Language? It detects yours automatically: EN, ES, PT, FR, IT, RU, ZH, DE.

ENTER (10 seconds): https://vanguard-kq9r.vercel.app/?ref=VGD-REN11
NEWS: https://vanguard-kq9r.vercel.app/guerra-hoy" \
  --data-urlencode "do_wrap=on" -w "|%{http_code}")
REC=$(echo "$RE" | rev | cut -d'|' -f1 | rev); REU=$(echo "$RE" | sed 's/|[0-9]*$//' | python3 -c "import sys,json; s=sys.stdin.read().strip(); s=s[:s.rfind('|')] if '|' in s else s; print(json.loads(s).get('url','') if s.startswith('{') else '')" 2>/dev/null)
echo "[rentry-r11] $REC -> $REU" | tee -a "$LOG"
else
echo "[rentry-r11] SKIP sin CSRF" | tee -a "$LOG"
fi

# 4) Núcleo: IndexNow + pings
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"host":"vanguard-kq9r.vercel.app","key":"074b8db50cc83f0689a2211e3ff94db1","keyLocation":"https://vanguard-kq9r.vercel.app/074b8db50cc83f0689a2211e3ff94db1.txt","urlList":["'$BASE'/?ref=VGD-INR11","'$BASE'/guerra-hoy"]}')
echo "[IndexNow-r11] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 "https://pingomatic.com/ping/?title=VANGUARD%20FAQ%20sin%20humo&blogurl=$BASE&rssurl=$BASE/feed.xml&chk_weblogscom=on&chk_blogs=on&chk_feedburner=on")
echo "[PingOMatic-r11] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://ping.twingly.com/" -H "Content-Type: text/xml" -d '<methodCall><methodName>weblogUpdates.ping</methodName><params><param><value>VANGUARD FAQ sin humo</value></param><param><value>'$BASE'</value></param><param><value>'$BASE/feed.xml'</value></param></params></methodCall>')
echo "[Twingly-r11] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://pubsubhubbub.appspot.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-PubSubHubbub-r11] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://hub.superfeedr.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-Superfeedr-r11] $R" | tee -a "$LOG"
R=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 30 "http://www.totalping.com/?p=tp&title=VANGUARD&url=$BASE&rss=$BASE/feed.xml&chk=1")
echo "[TotalPing-r11] $R" | tee -a "$LOG"

echo "=== FIN RONDA 11 ===" >> "$LOG"
