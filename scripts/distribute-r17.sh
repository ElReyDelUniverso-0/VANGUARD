#!/bin/bash
# VANGUARD v48.0 — RONDA 17: BRÚJULA (EXPLORADOR)
# Gancho: VANGUARD te PAGA por explorar — nueva mecánica Explorador
# (Sorpréndeme, badges de secciones sin descubrir, monedas por hitos 10/25/50/83)
# + navegación más fácil en móvil + más noticias (Al Jazeera + ABC).
# 3 Telegraph (ES/EN/PT) + paste.rs + rentry ES + rentry EN + núcleo (6) = 12.
BASE="https://vanguard-kq9r.vercel.app"
LOG=/home/z/my-project/scripts/campaign-results.txt
echo "=== RONDA 17 $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" >> "$LOG"

TA=$(curl -s --max-time 25 "https://api.telegra.ph/createAccount?short_name=vanguardops&author_name=VANGUARD" -o /tmp/tg17acc.json -w "%{http_code}")
TOK=$(python3 -c "import json;d=json.load(open('/tmp/tg17acc.json'));print(d.get('result',{}).get('access_token',''))" 2>/dev/null)
echo "[Telegraph-account] $TA token:${#TOK}chars" | tee -a "$LOG"

tg17() {
  curl -s --max-time 25 -X POST "https://api.telegra.ph/createPage" \
    -H "Content-Type: application/json" -d "$1" -o /tmp/tg17out.json -w "%{http_code} "
  python3 -c "import json;d=json.load(open('/tmp/tg17out.json'));print(d.get('result',{}).get('url',''))" 2>/dev/null
}

if [ -n "$TOK" ]; then
R=$(tg17 '{
    "access_token": "'"$TOK"'",
    "title": "VANGUARD ahora te PAGA por explorar: nueva mecánica Explorador con monedas por conocer las 83 secciones",
    "author_name": "VANGUARD",
    "author_url": "https://vanguard-kq9r.vercel.app",
    "content": [
      {"tag":"p","children":["Estreno v48.0 BRÚJULA: explorar VANGUARD ya es un juego dentro del juego, y paga monedas de verdad."]},
      {"tag":"p","children":["1) EXPLORADOR DE MUNDOS: cada sección nueva que descubres suma progreso. Al llegar a 10, 25, 50 y las 83 secciones cobras 150, 400, 1.000 y 2.500 monedas. Tu barra de progreso viaja contigo en la barra de navegación."]},
      {"tag":"p","children":["2) BOTÓN SORPRÉNDEME: un dado verde en el menú te lleva en un toque a una sección que nunca has visto. Nada queda enterrado: cada mundo muestra cuántas secciones sin descubrir esconde."]},
      {"tag":"p","children":["3) NAVEGACIÓN NUEVA EN MÓVIL: la fila de mundos ahora tiene flechas y degradados — las secciones del final ya son visibles y alcanzables."]},
      {"tag":"p","children":["4) MÁS NOTICIAS: la sala de prensa suma Al Jazeera y ABC Internacional al radar (GDELT + BBC Mundo + France 24 + DW). El mundo, en vivo, en tu idioma."]},
      {"tag":"p","children":["Y lo de siempre: guerra global multijugador, duelos ELO, globo 3D OSINT de 15 capas, NASA EONET en vivo, divisas en crisis, meta comunitaria con recompensa para todos y 8 idiomas. Gratis, sin registro."]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/?ref=VGD-TELE17"},"children":["vanguard-kq9r.vercel.app — explora y cobra →"]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/guerra-hoy?ref=VGD-TELE17"},"children":["Ver el planeta en vivo"]}
    ],
    "return_content": false
  }')
echo "[Telegraph-r17-ES] $R" | tee -a "$LOG"
R=$(tg17 '{
    "access_token": "'"$TOK"'",
    "title": "VANGUARD now PAYS you to explore: new Explorer mechanic with coins for visiting all 83 sections",
    "author_name": "VANGUARD",
    "author_url": "https://vanguard-kq9r.vercel.app",
    "content": [
      {"tag":"p","children":["v48.0 BRÚJULA drops: exploring VANGUARD is now a game inside the game — and it pays real coins."]},
      {"tag":"p","children":["1) EXPLORER OF WORLDS: every new section you discover adds progress. Hit 10, 25, 50 and all 83 sections to claim 150, 400, 1,000 and 2,500 coins. Your progress bar lives in the nav."]},
      {"tag":"p","children":["2) SURPRISE ME button: a green dice in the menu takes you in one tap to a section you have never seen. Every world shows how many hidden sections it holds."]},
      {"tag":"p","children":["3) BETTER MOBILE NAV: the worlds row now has arrows and edge fades — the sections at the end are visible and reachable at last."]},
      {"tag":"p","children":["4) MORE NEWS: the press room adds Al Jazeera and ABC International to the radar (GDELT + BBC Mundo + France 24 + DW)."]},
      {"tag":"p","children":["Plus the classics: global multiplayer war, ELO duels, 15-layer 3D OSINT globe, live NASA EONET, crisis currencies, community goal with rewards for everyone, 8 languages. Free, no signup."]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/?ref=VGD-TELE17EN"},"children":["vanguard-kq9r.vercel.app — explore and earn →"]}
    ],
    "return_content": false
  }')
echo "[Telegraph-r17-EN] $R" | tee -a "$LOG"
R=$(tg17 '{
    "access_token": "'"$TOK"'",
    "title": "VANGUARD agora PAGA para explorar: mecânica Explorador com moedas por conhecer as 83 seções",
    "author_name": "VANGUARD",
    "author_url": "https://vanguard-kq9r.vercel.app",
    "content": [
      {"tag":"p","children":["Chegou o v48.0 BRÚJULA: explorar o VANGUARD virou um jogo dentro do jogo — e paga moedas de verdade."]},
      {"tag":"p","children":["1) EXPLORADOR DE MUNDOS: cada seção nova descoberta soma progresso. Com 10, 25, 50 e as 83 seções você recebe 150, 400, 1.000 e 2.500 moedas."]},
      {"tag":"p","children":["2) BOTÃO SURPREENDA-ME: um dado verde no menu leva você em um toque a uma seção que você nunca viu."]},
      {"tag":"p","children":["3) NAVEGAÇÃO MELHOR NO CELULAR: setas e degradês na fileira de mundos — as seções do fim agora são visíveis."]},
      {"tag":"p","children":["4) MAIS NOTÍCIAS: Al Jazeera e ABC Internacional entram no radar (GDELT + BBC + France 24 + DW)."]},
      {"tag":"p","children":["E o de sempre: guerra global multiplayer, duelos ELO, globo 3D OSINT 15 camadas, NASA ao vivo, meta comunitária e 8 idiomas. Grátis, sem cadastro."]},
      {"tag":"a","attrs":{"href":"https://vanguard-kq9r.vercel.app/?ref=VGD-TELE17PT"},"children":["vanguard-kq9r.vercel.app — explore e ganhe →"]}
    ],
    "return_content": false
  }')
echo "[Telegraph-r17-PT] $R" | tee -a "$LOG"
fi

# paste.rs
P=$(curl -s --max-time 25 -X POST "https://paste.rs/" --data-binary @- <<'EOF' -w "|%{http_code}")
VANGUARD v48.0 BRÚJULA — AHORA TE PAGA POR EXPLORAR

· EXPLORADOR DE MUNDOS: descubre secciones nuevas y cobra monedas
  en los hitos 10 / 25 / 50 / 83 (150 → 2.500 monedas).
· BOTÓN SORPRÉNDEME: un dado verde te lleva a una sección que nunca
  has visto, en un toque.
· MÓVIL ARREGLADO: la fila de mundos tiene flechas y degradados —
  las secciones del final ya no quedan ocultas.
· MÁS NOTICIAS: Al Jazeera + ABC Internacional se suman al radar
  (GDELT + BBC Mundo + France 24 + DW).
· Guerra multijugador, ELO, globo 3D OSINT 15 capas, NASA EONET,
  divisas en crisis, meta comunitaria para todos, 8 idiomas.
· Gratis, sin registro, desde el móvil.

ENTRAR: https://vanguard-kq9r.vercel.app/?ref=VGD-PASTE17
DATOS EN VIVO: https://vanguard-kq9r.vercel.app/guerra-hoy?ref=VGD-PASTE17
EOF
PP=$(echo "$P" | python3 -c "import sys;s=sys.stdin.read();print(s.rsplit('|',1)[1].strip() if '|' in s else 'NOBAR')" 2>/dev/null); PU=$(echo "$P" | sed 's/|[0-9]*$//')
echo "[paste.rs-r17] $PP -> $PU" | tee -a "$LOG"

# rentry ES
CSRF=$(curl -s --max-time 25 -c /tmp/ren17a.txt https://rentry.co | rg -o 'name="csrfmiddlewaretoken" value="[^"]+' | head -1 | sed 's/.*value="//')
if [ -n "$CSRF" ]; then
RE=$(curl -s --max-time 25 -b /tmp/ren17a.txt -e https://rentry.co -X POST "https://rentry.co/api/new" \
  --data-urlencode "csrfmiddlewaretoken=$CSRF" \
  --data-urlencode "edit_code=vgd17edit$(date +%s)" \
  --data-urlencode "text=VANGUARD v48.0 BRÚJULA — AHORA TE PAGA POR EXPLORAR

Cuatro estrenos, todo gratis y sin registro:

1) EXPLORADOR DE MUNDOS — la nueva mecánica
   Cada sección nueva que descubres suma progreso en tu barra de
   navegación. Al llegar a 10, 25, 50 y las 83 secciones cobras
   150, 400, 1.000 y 2.500 monedas. El mapa completo es un trofeo.

2) BOTÓN SORPRÉNDEME
   Un dado verde en el menú: un toque y apareces en una sección
   que nunca has visto. Cada mundo muestra un contador con las
   secciones sin descubrir que esconde. Nada queda enterrado.

3) NAVEGACIÓN MÓVIL ARREGLADA
   La fila de mundos ahora tiene flechas y degradados en los
   bordes: las secciones del final son visibles y alcanzables.

4) MÁS NOTICIAS QUE NUNCA
   La sala de prensa suma Al Jazeera y ABC Internacional al radar
   en vivo: GDELT + BBC Mundo + France 24 + DW + Al Jazeera + ABC.

Y lo de siempre: guerra global multijugador por rondas, duelos 1v1
con ELO, globo 3D OSINT de 15 capas, NASA EONET en vivo, divisas en
crisis, poder militar real, meta comunitaria con recompensa para
todos, 8 idiomas automáticos y PWA instalable.

ENTRAR: https://vanguard-kq9r.vercel.app/?ref=VGD-REN17
DATOS EN VIVO: https://vanguard-kq9r.vercel.app/guerra-hoy?ref=VGD-REN17" \
  --data-urlencode "do_wrap=on" -w "|%{http_code}")
REC=$(echo "$RE" | python3 -c "import sys;s=sys.stdin.read();print(s.rsplit('|',1)[1].strip() if '|' in s else 'NOBAR')" 2>/dev/null); REU=$(echo "$RE" | sed 's/|[0-9]*$//' | python3 -c "import sys,json;s=sys.stdin.read().strip();s=s[:s.rfind('|')] if '|' in s else s;print(json.loads(s).get('url','') if s.startswith('{') else '')" 2>/dev/null)
echo "[rentry-r17-ES] $REC -> $REU" | tee -a "$LOG"
fi

# rentry EN
CSRF2=$(curl -s --max-time 25 -c /tmp/ren17b.txt https://rentry.co | rg -o 'name="csrfmiddlewaretoken" value="[^"]+' | head -1 | sed 's/.*value="//')
if [ -n "$CSRF2" ]; then
RE2=$(curl -s --max-time 25 -b /tmp/ren17b.txt -e https://rentry.co -X POST "https://rentry.co/api/new" \
  --data-urlencode "csrfmiddlewaretoken=$CSRF2" \
  --data-urlencode "edit_code=vgd17editb$(date +%s)" \
  --data-urlencode "text=VANGUARD v48.0 BRUJULA — IT NOW PAYS TO EXPLORE

Four new arrivals, all free, no signup:

1) EXPLORER OF WORLDS — the new mechanic
   Every new section you discover fills the progress bar in your
   nav. Hit 10, 25, 50 and all 83 sections to claim 150, 400,
   1,000 and 2,500 coins. A complete map is a trophy.

2) SURPRISE ME BUTTON
   A green dice in the menu: one tap and you land in a section
   you have never seen. Every world shows a counter with its
   undiscovered sections. Nothing stays buried.

3) MOBILE NAVIGATION FIXED
   The worlds row now has arrows and edge fades: the sections at
   the end are finally visible and reachable.

4) MORE NEWS THAN EVER
   The press room adds Al Jazeera and ABC International to the
   live radar: GDELT + BBC Mundo + France 24 + DW + Al Jazeera + ABC.

Plus the classics: round-based global multiplayer war, 1v1 ELO
duels, 15-layer 3D OSINT globe, live NASA EONET, crisis currencies,
real military power, community goal with rewards for everyone,
8 auto languages, installable PWA.

JOIN: https://vanguard-kq9r.vercel.app/?ref=VGD-REN17EN
LIVE DATA: https://vanguard-kq9r.vercel.app/guerra-hoy?ref=VGD-REN17EN" \
  --data-urlencode "do_wrap=on" -w "|%{http_code}")
RE2C=$(echo "$RE2" | python3 -c "import sys;s=sys.stdin.read();print(s.rsplit('|',1)[1].strip() if '|' in s else 'NOBAR')" 2>/dev/null); RE2U=$(echo "$RE2" | sed 's/|[0-9]*$//' | python3 -c "import sys,json;s=sys.stdin.read().strip();s=s[:s.rfind('|')] if '|' in s else s;print(json.loads(s).get('url','') if s.startswith('{') else '')" 2>/dev/null)
echo "[rentry-r17-EN] $RE2C -> $RE2U" | tee -a "$LOG"
fi

# Núcleo (6)
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"host":"vanguard-kq9r.vercel.app","key":"074b8db50cc83f0689a2211e3ff94db1","keyLocation":"https://vanguard-kq9r.vercel.app/074b8db50cc83f0689a2211e3ff94db1.txt","urlList":["'$BASE'/?ref=VGD-INR17","'$BASE'/guerra-hoy"]}')
echo "[IndexNow-r17] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 "https://pingomatic.com/ping/?title=VANGUARD%20brujula%20explorador&blogurl=$BASE&rssurl=$BASE/feed.xml&chk_weblogscom=on&chk_blogs=on&chk_feedburner=on")
echo "[PingOMatic-r17] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://ping.twingly.com/" -H "Content-Type: text/xml" -d '<methodCall><methodName>weblogUpdates.ping</methodName><params><param><value>VANGUARD brujula explorador</value></param><param><value>'$BASE'</value></param><param><value>'$BASE/feed.xml'</value></param></params></methodCall>')
echo "[Twingly-r17] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://pubsubhubbub.appspot.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-PubSubHubbub-r17] $R" | tee -a "$LOG"
R=$(curl -s -o /dev/null -w "%{http_code}" --max-time 25 -X POST "https://hub.superfeedr.com/" -d "hub.mode=publish&hub.url=$BASE/feed.xml")
echo "[WebSub-Superfeedr-r17] $R" | tee -a "$LOG"
R=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 30 "http://www.totalping.com/?p=tp&title=VANGUARD&url=$BASE&rss=$BASE/feed.xml&chk=1")
echo "[TotalPing-r17] $R" | tee -a "$LOG"

echo "=== FIN RONDA 17 ===" >> "$LOG"
