#!/bin/bash
# RONDA 18 — WAVE G: refuerzos permanentes (pastemyst ES/PT, rentry ×4, paste.rs ×2, Telegraph "Diario de Guerra" ×4)
LOG=/home/z/my-project/scripts/campaign-results.txt
echo "=== R18 WAVE G $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" >> "$LOG"
BASE="https://vanguard-kq9r.vercel.app"

EN_BODY='VANGUARD is the free browser war game: live conflict news, 15-layer 3D OSINT globe, global multiplayer war, ELO duels and 83 sections across 11 worlds. Free, no signup, right in your browser.

New in v49.0 DIFUSIÓN 200:
- 200-Link Spread Mission: live progress bar on the home page - at 200 public links EVERYONE claims 3,000 coins + 30 gems + 500 XP.
- Live NASA EONET: active volcanoes, wildfires, quakes and storms right now.
- Currencies in crisis: Iranian rial, ruble, bolivar + 13 more with real hourly rates.
- News from 5 sources: GDELT, BBC, France 24, DW, Al Jazeera, ABC.
- Explorer mechanic: coins for discovering sections (Surprise Me dice, Ctrl+K search).

Help the mission: post the game link somewhere NEW - every different place counts.

PLAY NOW: https://vanguard-kq9r.vercel.app'
ES_BODY='VANGUARD es el juego de guerra gratuito en el navegador: noticias de conflictos en vivo, globo 3D OSINT de 15 capas, guerra global multijugador, duelos ELO y 83 secciones en 11 mundos. Gratis, sin registro.

Novedades v49.0 DIFUSIÓN 200:
- Misión de Difusión 200: barra en vivo en la portada — al llegar a 200 enlaces públicos, TODOS cobran 3.000 monedas + 30 gemas + 500 XP.
- NASA EONET en vivo: volcanes, incendios, sismos y tormentas activos ahora mismo.
- Divisas en crisis: rial iraní, rublo, bolívar y 13 más con tasas reales por hora.
- Noticias de 5 fuentes: GDELT, BBC Mundo, France 24, DW, Al Jazeera, ABC.
- Explorador de mundos: monedas por descubrir secciones (dado SORPRÉNDEME, Ctrl+K).

Ayuda a la misión: publica el enlace en un sitio NUEVO — cada lugar diferente suma.

JUGAR: https://vanguard-kq9r.vercel.app'
PT_BODY='VANGUARD é o jogo de guerra gratuito no navegador: notícias de conflitos ao vivo, globo 3D OSINT de 15 camadas, guerra global multijogador, duelos ELO e 83 seções em 11 mundos. Grátis, sem registro.

Novidades v49.0:
- Missão de Difusão 200: barra ao vivo — ao chegar em 200 links públicos, TODOS ganham 3.000 moedas + 30 gemas + 500 XP.
- NASA EONET ao vivo: vulcões, incêndios, terremotos e tempestades.
- Moedas em crise: rial iraniano, rublo e mais com taxas reais por hora.
- Notícias de 5 fontes: GDELT, BBC, France 24, DW, Al Jazeera, ABC.

JOGAR: https://vanguard-kq9r.vercel.app'

# ---------- pastemyst ×2 (ES, PT) ----------
pm() { # $1=lang-body-file $2=label
  U=$(python3 -c "
import json,urllib.request
body=open('$1').read()
p=json.dumps({'title':'VANGUARD — free browser war game','pasties':[{'language':'text','title':'VANGUARD','code':body}]}).encode()
r=urllib.request.urlopen(urllib.request.Request('https://paste.myst.rs/api/v2/paste',data=p,headers={'Content-Type':'application/json'}),timeout=25)
print('https://paste.myst.rs/'+json.load(r)['_id'])" 2>/dev/null) || U="ERR"
  echo "[pastemyst] $2 → $U" | tee -a "$LOG"
}
echo "$ES_BODY" > /tmp/r18/pm-es.txt; echo "$PT_BODY" > /tmp/r18/pm-pt.txt
pm "/tmp/r18/pm-es.txt" "ES"
pm "/tmp/r18/pm-pt.txt" "PT"

# ---------- rentry ×4 (CSRF + form) ----------
rentry() { # $1=title $2=bodyfile $3=label
  rm -f /tmp/r18/re.cookies
  TOK=$(curl -s -c /tmp/r18/re.cookies --max-time 20 https://rentry.co/ | grep -o 'name="csrfmiddlewaretoken" value="[^"]*"' | cut -d'"' -f4)
  U=$(curl -s -b /tmp/r18/re.cookies --max-time 30 -X POST https://rentry.co/ \
    -H "Referer: https://rentry.co/" \
    --data-urlencode "csrfmiddlewaretoken=$TOK" \
    --data-urlencode "text=$(cat $2)" \
    --data-urlencode "edit_code=" --data-urlencode "url_code=" \
    -D - -o /dev/null | grep -i "^location:" | tr -d '\r' | awk '{print $2}')
  echo "[rentry] $3 → ${U:-ERR}" | tee -a "$LOG"
}
echo "# VANGUARD — el planeta en vivo, gratis

**Jugar: $BASE**

Guerra global multijugador, globo 3D OSINT de 15 capas, duelos ELO y **83 secciones** en 11 mundos. Gratis, sin registro.

## Novedades v49.0 DIFUSIÓN 200
- **Misión de Difusión 200**: barra en vivo — al llegar a 200 enlaces públicos, TODOS cobran 3.000 monedas + 30 gemas + 500 XP.
- **NASA EONET en vivo**: volcanes, incendios, sismos y tormentas activos.
- **Divisas en crisis**: rial iraní, rublo, bolívar y 13 más, tasas reales por hora.
- **Noticias de 5 fuentes**: GDELT, BBC Mundo, France 24, DW, Al Jazeera, ABC.
- **Explorador**: monedas por descubrir secciones (SORPRÉNDEME, Ctrl+K).

Ayuda: publica el enlace en un sitio nuevo. Cada lugar diferente suma.

**JUGAR: $BASE**" > /tmp/r18/re-es.md
echo "# VANGUARD — the planet, live, free

**Play: $BASE**

Global multiplayer war, 15-layer 3D OSINT globe, ELO duels and **83 sections** across 11 worlds. Free, no signup.

## New in v49.0
- **200-Link Spread Mission**: at 200 public links EVERYONE claims 3,000 coins + 30 gems + 500 XP.
- **Live NASA EONET**, currencies in crisis, news from 5 sources.
- **Explorer mechanic**: coins for discovering sections.

**PLAY: $BASE**" > /tmp/r18/re-en.md
echo "# VANGUARD — o planeta ao vivo, grátis

**Jogar: $BASE**

Guerra global multijogador, globo 3D OSINT de 15 camadas, duelos ELO e **83 seções**. Grátis, sem registro.

## Novidades v49.0
- **Missão de Difusão 200**: 3.000 moedas + 30 gemas para TODOS ao chegar em 200 links.
- **NASA EONET ao vivo** · divisas em crise · notícias de 5 fontes.
- **Explorador**: moedas por descobrir seções.

**JOGAR: $BASE**" > /tmp/r18/re-pt.md
echo "# VANGUARD — Guía rápida del comandante

**Jugar: $BASE**

1. Alias + bono de bienvenida.
2. Ctrl+K: 83 secciones a un toque. SORPRÉNDEME paga por explorar.
3. Guerra Hoy: NASA en vivo + divisas + 5 fuentes de noticias.
4. Globo 3D OSINT de 15 capas.
5. Duelos ELO, mercado, bolsa, armería, drones.
6. Código VGD-TU_ALIAS: +100 monedas cada 3 invitaciones.

**JUGAR: $BASE**" > /tmp/r18/re-guia.md
rentry "VANGUARD ES" "/tmp/r18/re-es.md" "ES anuncio"
rentry "VANGUARD EN" "/tmp/r18/re-en.md" "EN anuncio"
rentry "VANGUARD PT" "/tmp/r18/re-pt.md" "PT anuncio"
rentry "VANGUARD guia" "/tmp/r18/re-guia.md" "ES guía"

# ---------- paste.rs ×2 ----------
prs() { # $1=body $2=label
  U=$(curl -s --max-time 25 -X POST --data-binary @"$1" https://paste.rs/ -w "|%{http_code}")
  CODE="${U##*|}"; URL="${U%|*}"
  echo "[paste.rs] $2 → $URL ($CODE)" | tee -a "$LOG"
}
echo "$EN_BODY" > /tmp/r18/prs-en.txt; echo "$ES_BODY" > /tmp/r18/prs-es.txt
prs "/tmp/r18/prs-en.txt" "EN"
prs "/tmp/r18/prs-es.txt" "ES"

# ---------- Telegraph "Diario de Guerra" ×4 ----------
TOK=$(curl -s --max-time 25 "https://api.telegra.ph/createAccount?short_name=vanguardr18&author_name=VANGUARD" | python3 -c "import json,sys;print(json.load(sys.stdin).get('result',{}).get('access_token',''))" 2>/dev/null)
echo "[Telegraph-account] token:${#TOK}" | tee -a "$LOG"
tg() { # $1=json
  curl -s --max-time 25 -X POST "https://api.telegra.ph/createPage" -H "Content-Type: application/json" -d "$1" -o /tmp/r18/tg.json
  python3 -c "import json;d=json.load(open('/tmp/r18/tg.json'));print(d.get('result',{}).get('url') or 'ERR:'+json.dumps(d)[:70])" 2>/dev/null
}
R=$(tg "{\"access_token\":\"$TOK\",\"title\":\"Diario de Guerra #1: nace la Misión de Difusión 200\",\"author_name\":\"VANGUARD\",\"author_url\":\"$BASE\",\"content\":[{\"tag\":\"p\",\"children\":[\"Comunicado del comando: la nueva meta es 200 enlaces públicos de VANGUARD en lugares DIFERENTES — blogs, wikis, foros, pastebins, imágenes y páginas de proyecto.\"]},{\"tag\":\"p\",\"children\":[\"El progreso se ve EN VIVO en la portada del juego y en /api/sharegoal. Al llegar a 200, cada agente podrá reclamar 3.000 monedas + 30 gemas + 500 XP. Un reclamo por jugador: dedup en servidor, nada de trampas.\"]},{\"tag\":\"p\",\"children\":[\"Mientras tanto, el radar sigue encendido: NASA EONET en vivo con volcanes, sismos e incendios; divisas de países en conflicto con tasas reales por hora; y noticias de 5 fuentes en la emisora.\"]},{\"tag\":\"a\",\"attrs\":{\"href\":\"$BASE/?ref=VGD-R18\"},\"children\":[\"Jugar gratis →\"]}],\"return_content\":false}")
echo "[Telegraph] Diario-ES → $R" | tee -a "$LOG"
R=$(tg "{\"access_token\":\"$TOK\",\"title\":\"War Diary #1: the 200-Link Spread Mission begins\",\"author_name\":\"VANGUARD\",\"author_url\":\"$BASE\",\"content\":[{\"tag\":\"p\",\"children\":[\"HQ order: reach 200 public links to VANGUARD in DIFFERENT places - blogs, wikis, forums, pastebins, images and project pages.\"]},{\"tag\":\"p\",\"children\":[\"Progress is live on the home page and via /api/sharegoal. At 200, every agent claims 3,000 coins + 30 gems + 500 XP. One claim per player - server-side dedup, no cheating.\"]},{\"tag\":\"a\",\"attrs\":{\"href\":\"$BASE/?ref=VGD-R18\"},\"children\":[\"Play free →\"]}],\"return_content\":false}")
echo "[Telegraph] Diario-EN → $R" | tee -a "$LOG"
R=$(tg "{\"access_token\":\"$TOK\",\"title\":\"Diário de Guerra #1: começa a Missão de Difusão 200\",\"author_name\":\"VANGUARD\",\"author_url\":\"$BASE\",\"content\":[{\"tag\":\"p\",\"children\":[\"Ordem do comando: alcançar 200 links públicos de VANGUARD em lugares DIFERENTES. Progresso ao vivo na página inicial. Ao chegar, TODOS ganham 3.000 moedas + 30 gemas + 500 XP.\"]},{\"tag\":\"a\",\"attrs\":{\"href\":\"$BASE/?ref=VGD-R18\"},\"children\":[\"Jogar grátis →\"]}],\"return_content\":false}")
echo "[Telegraph] Diario-PT → $R" | tee -a "$LOG"
R=$(tg "{\"access_token\":\"$TOK\",\"title\":\"Diario de Guerra #2: guía express de las 83 secciones\",\"author_name\":\"VANGUARD\",\"author_url\":\"$BASE\",\"content\":[{\"tag\":\"p\",\"children\":[\"Ctrl+K abre el buscador universal. El dado SORPRÉNDEME te salta a secciones que nunca viste — y descubrir paga: 150/400/1.000/2.500 monedas al llegar a 10/25/50/83.\"]},{\"tag\":\"p\",\"children\":[\"Cada mundo muestra sus secciones sin descubrir con un punto parpadeante. Nada queda enterrado.\"]},{\"tag\":\"a\",\"attrs\":{\"href\":\"$BASE/?ref=VGD-R18\"},\"children\":[\"Explorar y cobrar →\"]}],\"return_content\":false}")
echo "[Telegraph] Diario-ES2 → $R" | tee -a "$LOG"
echo "=== R18 WAVE G FIN ===" >> "$LOG"
