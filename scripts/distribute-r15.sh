#!/bin/bash
# VANGUARD v46.0 — RONDA 15: OBJETIVO MUNDIAL (LA META QUE NOS PAGA A TODOS)
# Gancho nuevo y el más urgente hasta la fecha: la meta comunitaria lee
# jugadores REALES de la BD. "Faltan N para que TODOS cobren 1.500 monedas".
# 3 Telegraph (ES/EN/PT) + paste.rs + rentry ES + rentry EN + núcleo (6) = 12.
BASE="https://vanguard-kq9r.vercel.app"
LOG=/home/z/my-project/scripts/campaign-results.txt
echo "=== RONDA 15 $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" >> "$LOG"

TA=$(curl -s --max-time 25 "https://api.telegra.ph/createAccount?short_name=vanguardops&author_name=VANGUARD" -o /tmp/tg15acc.json -w "%{http_code}")
TOK=$(python3 -c "import json;d=json.load(open('/tmp/tg15acc.json'));print(d.get('result',{}).get('access_token',''))" 2>/dev/null)
echo "[Telegraph-account] $TA token:${#TOK}chars" | tee -a "$LOG"

tg15() {
  curl -s --max-time 25 -X POST "https://api.telegra.ph/createPage" \
    -H "Content-Type: application/json" -d "$1" -o /tmp/tg15out.json -w "%{http_code} "
  python3 -c "import json;d=json.load(open('/tmp/tg15out.json'));print(d.get('result',{}).get('url',''))" 2>/dev/null
}

if [ -n "$TOK" ]; then
R=$(tg15 '{
    "access_token": "'"$TOK"'",
    "title": "Faltan 6 jugadores para que TODOS cobren 1.500 monedas: la meta comunitaria de VANGUARD",
    "author_name": "VANGUARD",
    "author_url": "https://vanguard-kq9r.vercel.app",
    "content": [
      {"tag":"p","children":["VANGUARD estrenó el OBJETIVO MUNDIAL: una meta comunitaria que lee jugadores REALES de la base de datos — sin bots, sin humo. Cuando la comunidad llega al hito, TODOS los que están dentro cobran la recompensa: monedas + gemas + XP de una sola vez."]},
      {"tag":"p","children":["El estado AHORA: ya conquistamos la meta de 30 (1.000 monedas para todos) y somos 34 agentes. La meta de 40 paga 1.500 monedas + 15 gemas + 400 XP. FALTAN 6 JUGADORES. Cada amigo que entra con tu código suma para todos — y tu código de referido además te paga recompensas propias."]},
      {"tag":"p","children":["Y dentro del juego: guerra global multijugador por rondas, duelos 1v1 con ELO, globo 3D con 15 capas OSINT, radar geopolítico en vivo (GDELT + GDACS), botín real con presupuestos militares del Banco Mundial (Ucrania +65), quiz, bolsa de países y 8 idiomas."]},
      {"tag":"p","children":["100% gratis, sin registro, desde cualquier móvil. Entra, asegura tu recompensa y trae a tu escuadrón:"]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/?ref=VGD-TELE15"},"children":["vanguard-kq9r.vercel.app — asegura tu recompensa →"]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/guerra-hoy?ref=VGD-TELE15"},"children":["Ver el poder militar real + radar en vivo"]}
    ],
    "return_content": false
  }')
echo "[Telegraph-r15-ES] $R" | tee -a "$LOG"
R=$(tg15 '{
    "access_token": "'"$TOK"'",
    "title": "6 players away from EVERYONE getting 1,500 coins: VANGUARD community goal",
    "author_name": "VANGUARD",
    "author_url": "https://vanguard-kq9r.vercel.app",
    "content": [
      {"tag":"p","children":["VANGUARD just launched the COMMUNITY GOAL: a milestone meter fed by REAL players straight from the database — no bots, no fake numbers. When the community reaches the goal, EVERYONE inside claims the reward: coins + gems + XP."]},
      {"tag":"p","children":["Status RIGHT NOW: the 30-player goal is already conquered (1,000 coins for everyone) and we are 34 agents strong. The 40 goal pays 1,500 coins + 15 gems + 400 XP. ONLY 6 PLAYERS MISSING. Every friend who joins with your code pushes it for everybody — and your referral code pays you extra too."]},
      {"tag":"p","children":["Inside: round-based global multiplayer war, 1v1 ELO duels, 3D OSINT globe with 15 layers, live geopolitical radar (GDELT + GDACS), real World Bank military loot (Ukraine +65), quiz, country stock market, 8 languages."]},
      {"tag":"p","children":["100% free, no signup, any phone. Lock your reward and bring your squad:"]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/?ref=VGD-TELE15EN"},"children":["vanguard-kq9r.vercel.app — claim your reward →"]}
    ],
    "return_content": false
  }')
echo "[Telegraph-r15-EN] $R" | tee -a "$LOG"
R=$(tg15 '{
    "access_token": "'"$TOK"'",
    "title": "Faltam 6 jogadores para TODOS ganharem 1.500 moedas: meta comunitária do VANGUARD",
    "author_name": "VANGUARD",
    "author_url": "https://vanguard-kq9r.vercel.app",
    "content": [
      {"tag":"p","children":["O VANGUARD estreou o OBJETIVO MUNDIAL: uma meta comunitária alimentada por jogadores REAIS direto do banco de dados — sem bots, sem números falsos. Quando a comunidade chega à meta, TODOS os que estão dentro recebem a recompensa: moedas + gemas + XP."]},
      {"tag":"p","children":["Status AGORA: a meta de 30 já foi conquistada (1.000 moedas para todos) e somos 34 agentes. A meta de 40 paga 1.500 moedas + 15 gemas + 400 XP. FALTAM 6 JOGADORES. Cada amigo que entra com seu código empurra a meta — e seu código de indicação também te paga."]},
      {"tag":"p","children":["Guerra global multiplayer por rodadas, duelos 1v1 com ELO, globo 3D com 15 camadas OSINT, radar geopolítico ao vivo, butim real do Banco Mundial, quiz e 8 idiomas. 100% grátis, sem cadastro, direto do celular."]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/?ref=VGD-TELE15PT"},"children":["vanguard-kq9r.vercel.app — garanta sua recompensa →"]}
    ],
    "return_content": false
  }')
echo "[Telegraph-r15-PT] $R" | tee -a "$LOG"
fi

# paste.rs
P=$(curl -s --max-time 25 -X POST "https://paste.rs/" --data-binary @- <<'EOF' -w "|%{http_code}")
VANGUARD v46.0 — OBJETIVO MUNDIAL: LA META QUE NOS PAGA A TODOS

· META COMUNITARIA con jugadores REALES de la base de datos (sin bots).
· Meta de 30 ya conquistada. Somos 34 agentes.
· Meta de 40: 1.500 monedas + 15 gemas + 400 XP para TODOS. FALTAN 6.
· Tu código de referido suma para la meta Y te paga recompensas propias.
· Guerra multijugador, ELO, globo 3D OSINT, radar GDELT+GDACS en vivo,
  botín real del Banco Mundial (Ucrania +65). Gratis, sin registro, 8 idiomas.

ASEGURA TU RECOMPENSA: https://vanguard-kq9r.vercel.app/?ref=VGD-PASTE15
DATOS REALES: https://vanguard-kq9r.vercel.app/guerra-hoy?ref=VGD-PASTE15
EOF
PP=$(echo "$P" | rev | cut -d'|' -f1 | rev); PU=$(echo "$P" | sed 's/|[0-9]*$//')
echo "[paste.rs-r15] $PP -> $PU" | tee -a "$LOG"

# rentry ES
CSRF=$(curl -s --max-time 25 -c /tmp/ren15a.txt https://rentry.co | rg -o 'name="csrfmiddlewaretoken" value="[^"]+' | head -1 | sed 's/.*value="//')
if [ -n "$CSRF" ]; then
RE=$(curl -s --max-time 25 -b /tmp/ren15a.txt -e https://rentry.co -X POST "https://rentry.co/api/new" \
  --data-urlencode "csrfmiddlewaretoken=$CSRF" \
  --data-urlencode "edit_code=vgd15edit$(date +%s)" \
  --data-urlencode "text=VANGUARD v46.0 — OBJETIVO MUNDIAL: LA META QUE NOS PAGA A TODOS

El juego de guerra gratis del navegador estrenó la mecánica que más
conviene a la comunidad:

1) META COMUNITARIA HONESTA
   La barra de progreso lee jugadores ÚNICOS reales de la base de datos.
   Nada de bots ni números inflados: cuando la comunidad llega al hito,
   TODOS los que están dentro reclaman monedas + gemas + XP.

2) ESTADO EN VIVO
   · Meta de 30: CONQUISTADA (1.000 monedas cobrables por todos)
   · Ahora: 34 agentes — meta de 40: 1.500 monedas + 15 gemas + 400 XP
   · FALTAN 6 JUGADORES. Cada amigo que entra suma para todos.
   · Tu código de referido (VGD-XXXXXX) además te da recompensas propias.

3) TODO LO DEMÁS SIGUE
   Guerra global multijugador por rondas, duelos 1v1 con ELO, globo 3D
   con 15 capas OSINT, radar geopolítico en vivo (GDELT + GDACS),
   botín real del Banco Mundial (Ucrania +65 monedas), quiz, bolsa de
   países, récord global de gente en línea y 8 idiomas automáticos.

Gratis, sin registro, desde cualquier móvil.

ASEGURA TU RECOMPENSA: https://vanguard-kq9r.vercel.app/?ref=VGD-REN15
PODER MILITAR REAL: https://vanguard-kq9r.vercel.app/guerra-hoy?ref=VGD-REN15" \
  --data-urlencode "do_wrap=on" -w "|%{http_code}")
REC=$(echo "$RE" | rev | cut -d'|' -f1 | rev); REU=$(echo "$RE" | sed 's/|[0-9]*$//' | python3 -c "import sys,json;s=sys.stdin.read().strip();s=s[:s.rfind('|')] if '|' in s else s;print(json.loads(s).get('url','') if s.startswith('{') else '')" 2>/dev/null)
echo "[rentry-r15-ES] $REC -> $REU" | tee -a "$LOG"
fi

# rentry EN
CSRF2=$(curl -s --max-time 25 -c /tmp/ren15b.txt https://rentry.co | rg -o 'name="csrfmiddlewaretoken" value="[^"]+' | head -1 | sed 's/.*value="//')
if [ -n "$CSRF2" ]; then
RE2=$(curl -s --max-time 25 -b /tmp/ren15b.txt -e https://rentry.co -X POST "https://rentry.co/api/new" \
  --data-urlencode "csrfmiddlewaretoken=$CSRF2" \
  --data-urlencode "edit_code=vgd15editb$(date +%s)" \
  --data-urlencode "text=VANGUARD v46.0 — COMMUNITY GOAL: THE MILESTONE THAT PAYS EVERYONE

The free browser war game just shipped the mechanic that benefits
the whole community:

1) HONEST COMMUNITY GOAL
   The progress bar reads REAL unique players from the database.
   No bots, no inflated numbers: when the community hits the goal,
   EVERYONE inside claims coins + gems + XP.

2) LIVE STATUS
   · 30-player goal: CONQUERED (1,000 coins claimable by all)
   · Now: 34 agents — 40 goal pays 1,500 coins + 15 gems + 400 XP
   · ONLY 6 PLAYERS MISSING. Every friend who joins pushes it.
   · Your referral code (VGD-XXXXXX) also pays you personal rewards.

3) EVERYTHING ELSE REMAINS
   Round-based global multiplayer war, 1v1 ELO duels, 3D OSINT globe
   with 15 layers, live GDELT+GDACS geopolitical radar, real World
   Bank loot (Ukraine +65 coins), quiz, country stock market, online
   record chip and 8 automatic languages.

Free, no signup, any phone.

CLAIM YOUR REWARD: https://vanguard-kq9r.vercel.app/?ref=VGD-REN15EN
REAL MILITARY POWER: https://vanguard-kq9r.vercel.app/guerra-hoy?ref=VGD-REN15EN" \
  --data-urlencode "do_wrap=on" -w "|%{http_code}")
RE2C=$(echo "$RE2" | rev | cut -d'|' -f1 | rev); RE2U=$(echo "$RE2" | sed 's/|[0-9]*$//' | python3 -c "import sys,json;s=sys.stdin.read().strip();s=s[:s.rfind('|')] if '|' in s else s;print(json.loads(s).get('url','') if s.startswith('{') else '')" 2>/dev/null)
echo "[rentry-r15-EN] $RE2C -> $RE2U" | tee -a "$LOG"
fi

# Núcleo (6)
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"host":"vanguard-kq9r.vercel.app","key":"074b8db50cc83f0689a2211e3ff94db1","keyLocation":"https://vanguard-kq9r.vercel.app/074b8db50cc83f0689a2211e3ff94db1.txt","urlList":["'$BASE'/?ref=VGD-INR15","'$BASE'/guerra-hoy"]}')
echo "[IndexNow-r15] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 "https://pingomatic.com/ping/?title=VANGUARD%20objetivo%20mundial&blogurl=$BASE&rssurl=$BASE/feed.xml&chk_weblogscom=on&chk_blogs=on&chk_feedburner=on")
echo "[PingOMatic-r15] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://ping.twingly.com/" -H "Content-Type: text/xml" -d '<methodCall><methodName>weblogUpdates.ping</methodName><params><param><value>VANGUARD objetivo mundial</value></param><param><value>'$BASE'</value></param><param><value>'$BASE/feed.xml'</value></param></params></methodCall>')
echo "[Twingly-r15] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://pubsubhubbub.appspot.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-PubSubHubbub-r15] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://hub.superfeedr.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-Superfeedr-r15] $R" | tee -a "$LOG"
R=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 30 "http://www.totalping.com/?p=tp&title=VANGUARD&url=$BASE&rss=$BASE/feed.xml&chk=1")
echo "[TotalPing-r15] $R" | tee -a "$LOG"

echo "=== FIN RONDA 15 ===" >> "$LOG"
