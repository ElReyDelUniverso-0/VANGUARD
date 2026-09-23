#!/bin/bash
# VANGUARD v42.3 — RONDA 9: INFORME DEL FRENTE (números reales)
# Canales vivos verificados r1-r8: Telegraph, paste.rs, IndexNow(central),
# Ping-o-Matic, Twingly, WebSub x2, TotalPing(-L).
# Muertos, NO reintentar: Bing/Google sitemap ping, WhatUseek, Pingler,
# Blogshares, IndexNow directo a bing/yandex/seznam/naver.
BASE="https://vanguard-kq9r.vercel.app"
LOG=/home/z/my-project/scripts/campaign-results.txt
echo "=== RONDA 9 $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" >> "$LOG"

# 1) Telegraph: cuenta anónima nueva — ángulo informe con números reales
TA=$(curl -s --max-time 25 "https://api.telegra.ph/createAccount?short_name=vanguardops&author_name=VANGUARD" -o /tmp/tg9acc.json -w "%{http_code}")
TOK=$(python3 -c "import json;d=json.load(open('/tmp/tg9acc.json'));print(d.get('result',{}).get('access_token',''))" 2>/dev/null)
echo "[Telegraph-account] $TA token:${#TOK}chars" | tee -a "$LOG"
if [ -n "$TOK" ]; then
R=$(curl -s --max-time 25 -X POST "https://api.telegra.ph/createPage" \
  -H "Content-Type: application/json" \
  -d '{
    "access_token": "'"$TOK"'",
    "title": "Informe del frente: los números reales de VANGUARD (la guerra no duerme)",
    "author_name": "VANGUARD",
    "author_url": "https://vanguard-kq9r.vercel.app",
    "content": [
      {"tag":"p","children":["LOS NÚMEROS DE HOY, SIN MAQUILLAJE:"]},
      {"tag":"p","children":["— 18 comandantes registrados, y la curva sube cada día que pasa."]},
      {"tag":"p","children":["— AGENTE AUTOMÁTICO DE PROMOCIÓN: la plataforma se pega sola 2 veces al día. Nadie la empuja: la guerra se anuncia sola."]},
      {"tag":"p","children":["— CONTADOR EN VIVO: entras y ves cuánta gente está conectada AHORA MISMO. Verde y pulsante. Sin bots: es presencia real cada 30 segundos."]},
      {"tag":"p","children":["— TU IDIOMA SOLO: español, inglés, portugués, francés, italiano, ruso, chino y alemán — detectado automáticamente al entrar."]},
      {"tag":"p","children":["— 6 JUEGOS EN UNO: guerra global por rondas, duelos 1v1 con ranking ELO, quiz de geografía, dron strike 3D, simulador de guerras y bolsa de países con gemas."]},
      {"tag":"p","children":["— 15 CAPAS OSINT sobre el globo 3D: aviones, tanques, tropas, huracanes, volcanes y la EEI en directo."]},
      {"tag":"p","children":["CERO Euros. CERO registro. Solo tu móvil y tu nombre de guerra."]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/?ref=VGD-TELE9"},"children":["vanguard-kq9r.vercel.app — toma el mando"]}
    ],
    "return_content": false
  }' -o /tmp/tg9.json -w "%{http_code}")
URL=$(python3 -c "import json;d=json.load(open('/tmp/tg9.json'));print(d.get('result',{}).get('url',''))" 2>/dev/null)
echo "[Telegraph-r9] $R -> $URL" | tee -a "$LOG"
else
echo "[Telegraph-r9] SKIP sin token" | tee -a "$LOG"
fi

# 2) paste.rs
P=$(curl -s --max-time 25 -X POST "https://paste.rs/" --data-binary @- <<'EOF' -w "|%{http_code}")
VANGUARD — INFORME DEL FRENTE (números reales, sin maquillaje)

— 18 comandantes registrados, curva en subida
— Agente automático: la plataforma se promueve sola 2x/día
— Contador EN VIVO: gente conectada ahora mismo (latidos cada 30s)
— Tu idioma solo: 8 idiomas detectados automáticamente
— 6 juegos en uno: guerra por rondas, duelos ELO, quiz, dron 3D,
  simulador de guerras y bolsa de países
— Globo 3D OSINT con 15 capas + EEI en directo

Gratis, sin registro, desde el móvil:
JUGAR: https://vanguard-kq9r.vercel.app/?ref=VGD-PASTE9
NOTICIAS: https://vanguard-kq9r.vercel.app/guerra-hoy
EOF
PP9=$(echo "$P" | rev | cut -d'|' -f1 | rev); PU9=$(echo "$P" | sed 's/|[0-9]*$//')
echo "[paste.rs-r9] $PP9 -> $PU9" | tee -a "$LOG"

# 3) IndexNow API central
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"host":"vanguard-kq9r.vercel.app","key":"074b8db50cc83f0689a2211e3ff94db1","keyLocation":"https://vanguard-kq9r.vercel.app/074b8db50cc83f0689a2211e3ff94db1.txt","urlList":["'$BASE'/?ref=VGD-INR9","'$BASE'/guerra-hoy"]}')
echo "[IndexNow-r9] $R" | tee -a "$LOG"

# 4) Ping-o-Matic + Twingly
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 "https://pingomatic.com/ping/?title=VANGUARD%20informe%20del%20frente&blogurl=$BASE&rssurl=$BASE/feed.xml&chk_weblogscom=on&chk_blogs=on&chk_feedburner=on")
echo "[PingOMatic-r9] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://ping.twingly.com/" -H "Content-Type: text/xml" -d '<methodCall><methodName>weblogUpdates.ping</methodName><params><param><value>VANGUARD informe del frente</value></param><param><value>'$BASE'</value></param><param><value>'$BASE/feed.xml'</value></param></params></methodCall>')
echo "[Twingly-r9] $R" | tee -a "$LOG"

# 5) WebSub x2
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://pubsubhubbub.appspot.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-PubSubHubbub-r9] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://hub.superfeedr.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-Superfeedr-r9] $R" | tee -a "$LOG"

# 6) TotalPing (con -L, verificado r7/r8)
R=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 30 "http://www.totalping.com/?p=tp&title=VANGUARD&url=$BASE&rss=$BASE/feed.xml&chk=1")
echo "[TotalPing-r9] $R" | tee -a "$LOG"

echo "=== FIN RONDA 9 ===" >> "$LOG"
