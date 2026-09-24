#!/bin/bash
# VANGUARD v45.0 — RONDA 14: SÉ PARTE DEL RÉCORD
# Gancho nuevo: RÉCORD GLOBAL en vivo (pico histórico de gente en línea, chip dorado)
# + BOTÍN REAL del Banco Mundial en Control de Países (Ucrania +65).
# 3 Telegraph (ES/EN/PT) + paste.rs + rentry ES + rentry EN + núcleo (6) = 12.
BASE="https://vanguard-kq9r.vercel.app"
LOG=/home/z/my-project/scripts/campaign-results.txt
echo "=== RONDA 14 $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" >> "$LOG"

TA=$(curl -s --max-time 25 "https://api.telegra.ph/createAccount?short_name=vanguardops&author_name=VANGUARD" -o /tmp/tg14acc.json -w "%{http_code}")
TOK=$(python3 -c "import json;d=json.load(open('/tmp/tg14acc.json'));print(d.get('result',{}).get('access_token',''))" 2>/dev/null)
echo "[Telegraph-account] $TA token:${#TOK}chars" | tee -a "$LOG"

tg14() {
  curl -s --max-time 25 -X POST "https://api.telegra.ph/createPage" \
    -H "Content-Type: application/json" -d "$1" -o /tmp/tg14out.json -w "%{http_code} "
  python3 -c "import json;d=json.load(open('/tmp/tg14out.json'));print(d.get('result',{}).get('url',''))" 2>/dev/null
}

if [ -n "$TOK" ]; then
R=$(tg14 '{
    "access_token": "'"$TOK"'",
    "title": "El contador lleva tu nombre: entra ahora y sé parte del RÉCORD de VANGUARD",
    "author_name": "VANGUARD",
    "author_url": "https://vanguard-kq9r.vercel.app",
    "content": [
      {"tag":"p","children":["VANGUARD acaba de estrenar el RÉCORD GLOBAL: el pico histórico de guerreros EN LÍNEA al mismo tiempo, visible en vivo con chip dorado. Cuando el número actual alcanza el récord, el chip pulsa en dorado y suena la fiesta. Cada visitante que entra empuja el récord un poco más arriba."]},
      {"tag":"p","children":["Y el juego ahora paga con dinero REAL de verdad (casi): Control de Países estrenó el BOTÍN REAL — los presupuestos militares verdaderos del Banco Mundial se convierten en monedas al conquistar. ¿El premio gordo? Ucrania: US$ 64.700 millones al año → +65 monedas extra de botín. México, +17. Myanmar, +5."]},
      {"tag":"p","children":["Todo lo demás sigue: guerra global multijugador por rondas, duelos 1v1 con ELO, globo 3D con 15 capas OSINT, radar geopolítico en vivo (GDELT + GDACS), tabla de poder militar real, quiz, bolsa de países y 8 idiomas automáticos."]},
      {"tag":"p","children":["100% gratis, sin registro, desde cualquier móvil. Entra y sube el número:"]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/?ref=VGD-TELE14"},"children":["vanguard-kq9r.vercel.app — empuja el récord →"]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/guerra-hoy?ref=VGD-TELE14"},"children":["Ver el poder militar real + radar en vivo"]}
    ],
    "return_content": false
  }')
echo "[Telegraph-r14-ES] $R" | tee -a "$LOG"
R=$(tg14 '{
    "access_token": "'"$TOK"'",
    "title": "The counter has your name in it: join now and be part of the VANGUARD RECORD",
    "author_name": "VANGUARD",
    "author_url": "https://vanguard-kq9r.vercel.app",
    "content": [
      {"tag":"p","children":["VANGUARD just launched the GLOBAL RECORD: the all-time peak of warriors ONLINE at the same time, visible live with a golden chip. When the current number reaches the record, the chip pulses gold and the party starts. Every visitor pushes the record higher."]},
      {"tag":"p","children":["And the game now pays with (almost) real money: Country Control got REAL LOOT — actual World Bank military budgets turn into coins when you conquer. The jackpot? Ukraine: US$ 64.7 billion a year → +65 bonus coins. Mexico +17. Myanmar +5."]},
      {"tag":"p","children":["Everything else is still there: round-based global multiplayer war, 1v1 ELO duels, 3D OSINT globe with 15 layers, live geopolitical radar (GDELT + GDACS), real military power table, quiz, country stock market, 8 auto languages."]},
      {"tag":"p","children":["100% free, no signup, any phone. Come push the number:"]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/?ref=VGD-TELE14EN"},"children":["vanguard-kq9r.vercel.app — push the record →"]}
    ],
    "return_content": false
  }')
echo "[Telegraph-r14-EN] $R" | tee -a "$LOG"
R=$(tg14 '{
    "access_token": "'"$TOK"'",
    "title": "O contador tem o seu nome: entre agora e faça parte do RECORDE do VANGUARD",
    "author_name": "VANGUARD",
    "author_url": "https://vanguard-kq9r.vercel.app",
    "content": [
      {"tag":"p","children":["O VANGUARD estreou o RECORDE GLOBAL: o pico histórico de guerreiros ONLINE ao mesmo tempo, visível ao vivo com um selo dourado. Quando o número atual alcança o recorde, o selo pulsa em dourado. Cada visitante empurra o recorde mais alto."]},
      {"tag":"p","children":["E o jogo agora paga quase dinheiro de verdade: o Controle de Países ganhou o BUTIM REAL — os orçamentos militares reais do Banco Mundial viram moedas ao conquistar. O prêmio maior? Ucrânia: US$ 64,7 bilhões por ano → +65 moedas extras. México +17."]},
      {"tag":"p","children":["Guerra global multiplayer por rodadas, duelos 1v1 com ELO, globo 3D com 15 camadas OSINT, radar geopolítico ao vivo, quiz e 8 idiomas automáticos. 100% grátis, sem cadastro, direto do celular."]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/?ref=VGD-TELE14PT"},"children":["vanguard-kq9r.vercel.app — empurre o recorde →"]}
    ],
    "return_content": false
  }')
echo "[Telegraph-r14-PT] $R" | tee -a "$LOG"
fi

# paste.rs
P=$(curl -s --max-time 25 -X POST "https://paste.rs/" --data-binary @- <<'EOF' -w "|%{http_code}")
VANGUARD v45.0 — SÉ PARTE DEL RÉCORD GLOBAL

· RÉCORD EN VIVO: el pico histórico de gente EN LÍNEA con chip dorado.
  Cuando el número actual alcanza el récord, la fiesta empieza.
· BOTÍN REAL: presupuestos militares del Banco Mundial convertidos en
  monedas. Ucrania (US$ 64,7 mil M/año) = +65 monedas. México +17.
· Gratis, sin registro, desde el móvil. 8 idiomas.

EMPUJAR EL RÉCORD: https://vanguard-kq9r.vercel.app/?ref=VGD-PASTE14
DATOS REALES: https://vanguard-kq9r.vercel.app/guerra-hoy?ref=VGD-PASTE14
EOF
PP=$(echo "$P" | rev | cut -d'|' -f1 | rev); PU=$(echo "$P" | sed 's/|[0-9]*$//')
echo "[paste.rs-r14] $PP -> $PU" | tee -a "$LOG"

# rentry ES
CSRF=$(curl -s --max-time 25 -c /tmp/ren14a.txt https://rentry.co | rg -o 'name="csrfmiddlewaretoken" value="[^"]+' | head -1 | sed 's/.*value="//')
if [ -n "$CSRF" ]; then
RE=$(curl -s --max-time 25 -b /tmp/ren14a.txt -e https://rentry.co -X POST "https://rentry.co/api/new" \
  --data-urlencode "csrfmiddlewaretoken=$CSRF" \
  --data-urlencode "edit_code=vgd14edit$(date +%s)" \
  --data-urlencode "text=VANGUARD v45.0 — SÉ PARTE DEL RÉCORD GLOBAL

El juego de guerra gratis del navegador estrenó dos cosas:

1) RÉCORD GLOBAL EN VIVO
   El pico histórico de guerreros EN LÍNEA al mismo tiempo, con chip
   dorado junto al contador. ¿Hoy se rompe el récord? El chip pulsa,
   la fiesta suena y tu nombre queda en el número.

2) BOTÍN REAL (Banco Mundial)
   Los presupuestos militares de verdad se convierten en monedas al
   conquistar países en Control de Países:
   · Ucrania: US$ 64,7 mil M/año → +65 monedas de botín real
   · México: US$ 16,7 mil M → +17
   · Myanmar: US$ 5,0 mil M → +5
   Junto a la tabla PODER MILITAR REAL y el radar GDELT+GDACS.

Gratis, sin registro, desde cualquier móvil, 8 idiomas.

EMPUJAR EL RÉCORD: https://vanguard-kq9r.vercel.app/?ref=VGD-REN14
PODER MILITAR REAL: https://vanguard-kq9r.vercel.app/guerra-hoy?ref=VGD-REN14" \
  --data-urlencode "do_wrap=on" -w "|%{http_code}")
REC=$(echo "$RE" | rev | cut -d'|' -f1 | rev); REU=$(echo "$RE" | sed 's/|[0-9]*$//' | python3 -c "import sys,json;s=sys.stdin.read().strip();s=s[:s.rfind('|')] if '|' in s else s;print(json.loads(s).get('url','') if s.startswith('{') else '')" 2>/dev/null)
echo "[rentry-r14-ES] $REC -> $REU" | tee -a "$LOG"
fi

# rentry EN
CSRF2=$(curl -s --max-time 25 -c /tmp/ren14b.txt https://rentry.co | rg -o 'name="csrfmiddlewaretoken" value="[^"]+' | head -1 | sed 's/.*value="//')
if [ -n "$CSRF2" ]; then
RE2=$(curl -s --max-time 25 -b /tmp/ren14b.txt -e https://rentry.co -X POST "https://rentry.co/api/new" \
  --data-urlencode "csrfmiddlewaretoken=$CSRF2" \
  --data-urlencode "edit_code=vgd14editb$(date +%s)" \
  --data-urlencode "text=VANGUARD v45.0 — BE PART OF THE GLOBAL RECORD

The free browser war game just shipped two things:

1) LIVE GLOBAL RECORD
   The all-time peak of warriors ONLINE at the same time, with a
   golden chip next to the live counter. Does today break the record?
   The chip pulses, the party sounds, and you are part of the number.

2) REAL LOOT (World Bank)
   Actual military budgets turn into coins when you conquer countries
   in Country Control:
   · Ukraine: US$ 64.7 B/yr -> +65 loot coins
   · Mexico: US$ 16.7 B -> +17
   · Myanmar: US$ 5.0 B -> +5
   Next to the REAL MILITARY POWER table and the GDELT+GDACS radar.

Free, no signup, any phone, 8 languages.

PUSH THE RECORD: https://vanguard-kq9r.vercel.app/?ref=VGD-REN14EN
REAL MILITARY POWER: https://vanguard-kq9r.vercel.app/guerra-hoy?ref=VGD-REN14EN" \
  --data-urlencode "do_wrap=on" -w "|%{http_code}")
RE2C=$(echo "$RE2" | rev | cut -d'|' -f1 | rev); RE2U=$(echo "$RE2" | sed 's/|[0-9]*$//' | python3 -c "import sys,json;s=sys.stdin.read().strip();s=s[:s.rfind('|')] if '|' in s else s;print(json.loads(s).get('url','') if s.startswith('{') else '')" 2>/dev/null)
echo "[rentry-r14-EN] $RE2C -> $RE2U" | tee -a "$LOG"
fi

# Núcleo (6)
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"host":"vanguard-kq9r.vercel.app","key":"074b8db50cc83f0689a2211e3ff94db1","keyLocation":"https://vanguard-kq9r.vercel.app/074b8db50cc83f0689a2211e3ff94db1.txt","urlList":["'$BASE'/?ref=VGD-INR14","'$BASE'/guerra-hoy"]}')
echo "[IndexNow-r14] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 "https://pingomatic.com/ping/?title=VANGUARD%20record%20global&blogurl=$BASE&rssurl=$BASE/feed.xml&chk_weblogscom=on&chk_blogs=on&chk_feedburner=on")
echo "[PingOMatic-r14] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://ping.twingly.com/" -H "Content-Type: text/xml" -d '<methodCall><methodName>weblogUpdates.ping</methodName><params><param><value>VANGUARD record global</value></param><param><value>'$BASE'</value></param><param><value>'$BASE/feed.xml'</value></param></params></methodCall>')
echo "[Twingly-r14] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://pubsubhubbub.appspot.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-PubSubHubbub-r14] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://hub.superfeedr.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-Superfeedr-r14] $R" | tee -a "$LOG"
R=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 30 "http://www.totalping.com/?p=tp&title=VANGUARD&url=$BASE&rss=$BASE/feed.xml&chk=1")
echo "[TotalPing-r14] $R" | tee -a "$LOG"

echo "=== FIN RONDA 14 ===" >> "$LOG"
