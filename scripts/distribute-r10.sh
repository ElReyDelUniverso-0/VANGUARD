#!/bin/bash
# VANGUARD v42.4 — RONDA 10: NUEVAS ESTRATEGIAS
#  · 2 idiomas NUEVOS de promoción: EN (mercado global móvil) y PT-BR (Brasil)
#  · 3 plataformas de paste SIN cuenta: dpaste.com, dpaste.org, rentry.co
#  · núcleo vivo: Telegraph ES + paste.rs + IndexNow + PingOMatic + Twingly
#    + WebSub x2 + TotalPing(-L)
BASE="https://vanguard-kq9r.vercel.app"
LOG=/home/z/my-project/scripts/campaign-results.txt
echo "=== RONDA 10 $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" >> "$LOG"

tg_page() { # $1 token  $2 title  $3 json-file  $4 tag
  curl -s --max-time 25 -X POST "https://api.telegra.ph/createPage" \
    -H "Content-Type: application/json" -d "$2" -o "$3" -w "%{http_code}"
}

# ============ 1) Telegraph EN — mercado global ============
TA=$(curl -s --max-time 25 "https://api.telegra.ph/createAccount?short_name=vanguardops&author_name=VANGUARD" -o /tmp/tg10acc.json -w "%{http_code}")
TOK=$(python3 -c "import json;d=json.load(open('/tmp/tg10acc.json'));print(d.get('result',{}).get('access_token',''))" 2>/dev/null)
echo "[Telegraph-account] $TA token:${#TOK}chars" | tee -a "$LOG"
if [ -n "$TOK" ]; then
EN_JSON='{
    "access_token": "'"$TOK"'",
    "title": "Free War Game in Your Browser — 6 Games in One, No Signup, Any Phone",
    "author_name": "VANGUARD",
    "author_url": "https://vanguard-kq9r.vercel.app",
    "content": [
      {"tag":"p","children":["VANGUARD is a free real-time world conflict platform that runs in any mobile or desktop browser. No app, no account, no download — you open the link and you are in command."]},
      {"tag":"p","children":["What you get, all free:"]},
      {"tag":"p","children":["— GLOBAL WAR multiplayer: conquer territories round by round against real commanders."]},
      {"tag":"p","children":["— LIVE world conflict news, updated minute by minute with sources and images."]},
      {"tag":"p","children":["— 3D OSINT globe with 15 intelligence layers: planes, tanks, hurricanes, volcanoes, the ISS live."]},
      {"tag":"p","children":["— 1v1 country duels with ELO ranking, geography quiz, war simulator and a country stock market."]},
      {"tag":"p","children":["— LIVE online counter: see how many commanders are connected right now."]},
      {"tag":"p","children":["— The interface speaks YOUR language automatically: English, Spanish, Portuguese, French, Italian, Russian, Chinese, German."]},
      {"tag":"p","children":["Join the war — it takes 10 seconds: "]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/?ref=VGD-TELE10EN"},"children":["vanguard-kq9r.vercel.app — take command"]}
    ],
    "return_content": false
  }'
R=$(tg_page "$TOK" "$EN_JSON" /tmp/tg10en.json x)
URL=$(python3 -c "import json;d=json.load(open('/tmp/tg10en.json'));print(d.get('result',{}).get('url',''))" 2>/dev/null)
echo "[Telegraph-r10-EN] $R -> $URL" | tee -a "$LOG"
PT_JSON='{
    "access_token": "'"$TOK"'",
    "title": "Jogo de guerra grátis no navegador — 6 jogos em um, sem cadastro, direto do celular",
    "author_name": "VANGUARD",
    "author_url": "https://vanguard-kq9r.vercel.app",
    "content": [
      {"tag":"p","children":["VANGUARD é uma plataforma gratuita de conflitos mundiais em tempo real que roda em qualquer navegador. Sem app, sem conta, sem download — você abre o link e assume o comando."]},
      {"tag":"p","children":["O que você tem, tudo grátis:"]},
      {"tag":"p","children":["— GUERRA GLOBAL multiplayer: conquiste territórios rodada por rodada contra comandantes reais."]},
      {"tag":"p","children":["— Notícias de conflitos AO VIVO, atualizadas minuto a minuto, com fontes e imagens."]},
      {"tag":"p","children":["— Globo 3D OSINT com 15 camadas de inteligência: aviões, tanques, furacões, vulcões e a EEI ao vivo."]},
      {"tag":"p","children":["— Duelos 1v1 entre países com ranking ELO, quiz de geografia, simulador de guerra e bolsa de países."]},
      {"tag":"p","children":["— Contador AO VIVO: veja quantos comandantes estão conectados agora."]},
      {"tag":"p","children":["— A interface fala SEU idioma automaticamente: português, espanhol, inglês, francês, italiano, russo, chinês e alemão."]},
      {"tag":"p","children":["Entre para a guerra — leva 10 segundos: "]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/?ref=VGD-TELE10PT"},"children":["vanguard-kq9r.vercel.app — assuma o comando"]}
    ],
    "return_content": false
  }'
R=$(tg_page "$TOK" "$PT_JSON" /tmp/tg10pt.json x)
URL=$(python3 -c "import json;d=json.load(open('/tmp/tg10pt.json'));print(d.get('result',{}).get('url',''))" 2>/dev/null)
echo "[Telegraph-r10-PT] $R -> $URL" | tee -a "$LOG"
fi

# ============ 2) paste.rs ES ============
P=$(curl -s --max-time 25 -X POST "https://paste.rs/" --data-binary @- <<'EOF' -w "|%{http_code}")
VANGUARD — RONDA 10: ahora reclutamos en INGLÉS y PORTUGUÉS también

La guerra no habla un solo idioma. VANGUARD detecta el idioma del
visitante automáticamente (8 idiomas) y ahora promocionamos en:
— ES: https://vanguard-kq9r.vercel.app/?ref=VGD-PASTE10
— EN: 6 juegos en uno, sin registro, cualquier móvil
— PT-BR: sem cadastro, direto do celular

Cada jugador ahora tiene SU PROPIO enlace de reclutamiento con
código de guerra y ranking en vivo. Bonus de +50 monedas para
quien entra por tu enlace.

JUGAR: https://vanguard-kq9r.vercel.app/?ref=VGD-PASTE10
NOTICIAS: https://vanguard-kq9r.vercel.app/guerra-hoy
MISIÓN: https://vanguard-kq9r.vercel.app/mision
EOF
PP=$(echo "$P" | rev | cut -d'|' -f1 | rev); PU=$(echo "$P" | sed 's/|[0-9]*$//')
echo "[paste.rs-r10] $PP -> $PU" | tee -a "$LOG"

# ============ 3) dpaste.com (API v2, sin cuenta) ============
D=$(curl -s --max-time 25 -X POST "https://dpaste.com/api/v2/" \
  --data-urlencode "content=VANGUARD — free browser war game, 6 games in one, no signup. Multiplayer global war, live conflict news, 3D OSINT globe with 15 layers, ELO duels, war simulator. Speaks your language automatically (EN/ES/PT/FR/IT/RU/ZH/DE). PLAY: https://vanguard-kq9r.vercel.app/?ref=VGD-DP10" \
  --data-urlencode "syntax=text" --data-urlencode "expiry_days=365" -D /tmp/dp10h.txt -w "|%{http_code}")
DC=$(echo "$D" | rev | cut -d'|' -f1 | rev); DU=$(echo "$D" | sed 's/|[0-9]*$//')
[ -s /tmp/dp10h.txt ] && LOC=$(rg -i "^location: ?" /tmp/dp10h.txt | head -1 | sed 's/^[Ll]ocation: ?//' | tr -d '\r') || LOC=""
echo "[dpaste.com-r10] $DC -> ${DU:-$LOC}" | tee -a "$LOG"

# ============ 4) dpaste.org (API, sin cuenta) ============
D2=$(curl -s --max-time 25 -X POST "https://dpaste.org/api/" \
  --data-urlencode "content=VANGUARD — jogo de guerra grátis no navegador, sem cadastro. Guerra global multiplayer, notícias ao vivo, globo 3D OSINT, duelos ELO. Fala seu idioma automaticamente. JOGAR: https://vanguard-kq9r.vercel.app/?ref=VGD-DPO10 — ENGLISH: free browser war game, 6 games in one, no signup: https://vanguard-kq9r.vercel.app/?ref=VGD-DPO10" \
  --data-urlencode "lexer=_text" --data-urlencode "format=url" --data-urlencode "expires=31536000" -w "|%{http_code}")
D2C=$(echo "$D2" | rev | cut -d'|' -f1 | rev); D2U=$(echo "$D2" | sed 's/|[0-9]*$//')
echo "[dpaste.org-r10] $D2C -> $D2U" | tee -a "$LOG"

# ============ 5) rentry.co (CSRF + form, sin cuenta) ============
CSRF=$(curl -s --max-time 25 -c /tmp/ren10.txt https://rentry.co | rg -o 'csrfmiddlewaretoken" value="[^"]+' | head -1 | sed 's/.*value="//')
if [ -n "$CSRF" ]; then
RE=$(curl -s --max-time 25 -b /tmp/ren10.txt -e https://rentry.co -X POST "https://rentry.co/api/new/form" \
  --data-urlencode "csrfmiddlewaretoken=$CSRF" \
  --data-urlencode "edit_code=vgd10$(date +%s)" \
  --data-urlencode "text=VANGUARD — la guerra del mundo en tu navegador

Gratis, sin registro, desde cualquier móvil. 6 juegos en uno:
guerra global por rondas, duelos 1v1 ELO, quiz de geografía,
dron strike 3D, simulador de guerras y bolsa de países.

Noticias de conflictos al minuto + globo 3D OSINT con 15 capas
+ contador de gente EN LÍNEA ahora mismo.

ENTRAR: https://vanguard-kq9r.vercel.app/?ref=VGD-REN10
NOTICIAS: https://vanguard-kq9r.vercel.app/guerra-hoy" \
  --data-urlencode "do_wrap=on" -w "|%{http_code}")
REC=$(echo "$RE" | rev | cut -d'|' -f1 | rev); REU=$(echo "$RE" | sed 's/|[0-9]*$//')
echo "[rentry-r10] $REC -> $REU" | tee -a "$LOG"
else
echo "[rentry-r10] SKIP sin CSRF" | tee -a "$LOG"
fi

# ============ 6) núcleo: IndexNow + pings ============
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"host":"vanguard-kq9r.vercel.app","key":"074b8db50cc83f0689a2211e3ff94db1","keyLocation":"https://vanguard-kq9r.vercel.app/074b8db50cc83f0689a2211e3ff94db1.txt","urlList":["'$BASE'/?ref=VGD-INR10","'$BASE'/guerra-hoy"]}')
echo "[IndexNow-r10] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 "https://pingomatic.com/ping/?title=VANGUARD%20ronda%2010&blogurl=$BASE&rssurl=$BASE/feed.xml&chk_weblogscom=on&chk_blogs=on&chk_feedburner=on")
echo "[PingOMatic-r10] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://ping.twingly.com/" -H "Content-Type: text/xml" -d '<methodCall><methodName>weblogUpdates.ping</methodName><params><param><value>VANGUARD ronda 10</value></param><param><value>'$BASE'</value></param><param><value>'$BASE/feed.xml'</value></param></params></methodCall>')
echo "[Twingly-r10] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://pubsubhubbub.appspot.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-PubSubHubbub-r10] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://hub.superfeedr.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-Superfeedr-r10] $R" | tee -a "$LOG"
R=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 30 "http://www.totalping.com/?p=tp&title=VANGUARD&url=$BASE&rss=$BASE/feed.xml&chk=1")
echo "[TotalPing-r10] $R" | tee -a "$LOG"

echo "=== FIN RONDA 10 ===" >> "$LOG"
