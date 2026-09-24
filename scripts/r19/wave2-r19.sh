#!/bin/bash
# VANGUARD — Ronda 19 OLA 2: sitemap pings (Google/Bing), weblogs, Wayback,
# archive.ph, mojeek retry, pastes nuevos (hst.sh, katb.in, txt.fyi, dumpz, paste2),
# refuerzos probados (clck.ru, spoo.me, cleanuri, pastemyst, paste.rs, Telegraph),
# GitHub (Release v50.0 + Pages mision300 + Discussion).
T="$(cat /home/z/my-project/.ghtoken)"
API=https://api.github.com
OWNER=ElReyDelUniverso-0; REPO=VANGUARD
B="https://vanguard.world"
LOG=/home/z/my-project/scripts/r19/wave2.log
echo "=== R19 WAVE 2 $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" > "$LOG"
q() { python3 -c "import json,sys;print(json.load(sys.stdin).get('$1',''))" 2>/dev/null; }

# ---------- 1. Google sitemap ping ----------
R=$(curl -s --max-time 20 "https://www.google.com/ping?sitemap=$(python3 -c "import urllib.parse;print(urllib.parse.quote('$B/sitemap.xml',safe=''))")")
echo "$R" | grep -qi "Sitemap notification received" && echo "[OK] google-sitemap-ping" >> "$LOG" || echo "[ERR] google-sitemap-ping: $(echo "$R" | head -c 60)" >> "$LOG"

# ---------- 2. Bing sitemap ping ----------
C=$(curl -s -o /tmp/r19_bingping.html -w "%{http_code}" --max-time 20 "https://www.bing.com/ping?sitemap=$(python3 -c "import urllib.parse;print(urllib.parse.quote('$B/sitemap.xml',safe=''))")")
[ "$C" = "200" ] && echo "[OK] bing-sitemap-ping (HTTP $C)" >> "$LOG" || echo "[ERR] bing-sitemap-ping HTTP $C" >> "$LOG"

# ---------- 3. weblogs.com XML-RPC ----------
R=$(curl -s --max-time 20 -X POST "http://rpc.weblogs.com/RPC2" -H "Content-Type: text/xml" \
  --data "<?xml version=\"1.0\"?><methodCall><methodName>weblogUpdates.ping</methodName><params><param><value>VANGUARD</value></param><param><value>$B</value></param></params></methodCall>")
echo "$R" | grep -q "<boolean>1</boolean>\|Thanks for the ping" && echo "[OK] weblogs-ping" >> "$LOG" || echo "[ERR] weblogs-ping: $(echo "$R" | head -c 80)" >> "$LOG"

# ---------- 4. Wayback ×2 ----------
for tgt in "$B" "$B/guerra-hoy"; do
  U=$(curl -sL -o /dev/null -w "%{url_effective}" --max-time 60 "https://web.archive.org/save/$tgt" 2>/dev/null)
  case "$U" in *web.archive.org/web/*) echo "[OK] wayback $tgt → $U" >> "$LOG";; *) echo "[ERR] wayback $tgt ($U)" >> "$LOG";; esac
done

# ---------- 5. archive.ph ----------
C=$(curl -s -o /tmp/r19_arch.html -w "%{http_code} %{url_effective}" --max-time 30 -X POST "https://archive.ph/submit" -d "url=$B" 2>/dev/null)
echo "$C" | grep -q "wip/" && echo "[OK] archiveph → $C" >> "$LOG" || echo "[ERR] archiveph ($C)" >> "$LOG"

# ---------- 6. Mojeek retry ----------
C=$(curl -s -o /tmp/r19_mj.html -w "%{http_code}" --max-time 30 "https://www.mojeek.com/submit.html?url=$B")
grep -qi "vanguard\|thank\|submit" /tmp/r19_mj.html 2>/dev/null && [ "$C" = "200" ] && echo "[OK] mojeek (HTTP $C)" >> "$LOG" || echo "[ERR] mojeek HTTP $C" >> "$LOG"

# ---------- 7. hst.sh ----------
K=$(curl -s --max-time 20 -X POST "https://hst.sh/documents" -H "Content-Type: application/json" \
  --data "$(python3 -c "import json;print(json.dumps({'content':open('/dev/stdin').read()}))" <<< "VANGUARD v50 RED GLOBAL — juego de guerra mundial GRATIS en el navegador. Misión 300 enlaces: 5.000 monedas + 50 gemas para todos. 83 secciones que pagan, noticias en vivo, multijugador. https://vanguard.world")" | q key)
[ -n "$K" ] && echo "[OK] hstsh → https://hst.sh/$K" >> "$LOG" || echo "[ERR] hstsh" >> "$LOG"

# ---------- 8. katb.in ----------
C=$(curl -s -o /tmp/r19_katb.html -w "%{http_code} %{redirect_url}" --max-time 20 -X POST "https://katb.in/" --data-urlencode "paste_content=VANGUARD v50 — free browser war game. 300-link mission: 5,000 coins for everyone. 83 sections, live news, multiplayer. https://vanguard.world")
echo "$C" | grep -qo "katb.in/[A-Za-z0-9]*" && echo "[OK] katbin → $(echo "$C" | grep -o 'katb.in/[A-Za-z0-9]*' | head -1)" >> "$LOG" || echo "[ERR] katbin ($C)" >> "$LOG"

# ---------- 9. txt.fyi ----------
C=$(curl -s -o /tmp/r19_txt.html -w "%{http_code} %{redirect_url}" --max-time 20 -X POST "https://txt.fyi/" --data-urlencode "title=VANGUARD RED GLOBAL" --data-urlencode "body=VANGUARD v50 — free browser world-war strategy game. Join the 300-link mission: https://vanguard.world")
L=$(echo "$C" | grep -o "txt\.fyi/[A-Za-z0-9/]*" | head -1)
[ -n "$L" ] && echo "[OK] txtfyi → $L" >> "$LOG" || echo "[ERR] txtfyi ($C)" >> "$LOG"

# ---------- 10. dumpz.org ----------
R=$(curl -s --max-time 20 -X POST "https://dumpz.org/api/paste/" -H "Content-Type: application/json" \
  --data "$(python3 -c "import json;print(json.dumps({'content':'VANGUARD v50 RED GLOBAL — https://vanguard.world','language':'text'}))")")
U=$(echo "$R" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d.get('url',''))" 2>/dev/null)
[ -n "$U" ] && echo "[OK] dumpz → $U" >> "$LOG" || echo "[ERR] dumpz: $(echo "$R" | head -c 60)" >> "$LOG"

# ---------- 11. paste2.org ----------
R=$(curl -sL --max-time 20 -X POST "https://paste2.org/" --data-urlencode "code=VANGUARD v50 RED GLOBAL — misión 300 enlaces — https://vanguard.world" -w " URL:%{url_effective}" -o /tmp/r19_p2.html)
echo "$R" | grep -qo "paste2.org/p/[A-Za-z0-9]*" && echo "[OK] paste2 → $(echo "$R" | grep -o 'paste2.org/p/[A-Za-z0-9]*' | head -1)" >> "$LOG" || echo "[ERR] paste2 ($(echo "$R" | tail -c 60))" >> "$LOG"

# ---------- 12. Refuerzos probados: clck.ru ×2 ----------
i=0; for p in "" "/guerra-hoy" ; do
  i=$((i+1))
  U=$(curl -s --max-time 15 "https://clck.ru/--?url=$(python3 -c "import urllib.parse;print(urllib.parse.quote('$B/?ref=VGD-R19-c$i',safe=''))")" | tr -d '[:space:]')
  case "$U" in https://clck.ru/*) echo "[OK] clck-r19-$i → $U" >> "$LOG";; *) echo "[ERR] clck-r19-$i ($U)" >> "$LOG";; esac
done

# ---------- 13. spoo.me ×2 ----------
i=0; for p in "/?ref=VGD-R19-s1" "/mision/?ref=VGD-R19-s2"; do
  i=$((i+1))
  U=$(curl -s --max-time 15 -X POST https://spoo.me/ -H "Accept: application/json" -d "url=$B$p" | q short_url)
  case "$U" in https://spoo.me/*) echo "[OK] spoo-r19-$i → $U" >> "$LOG";; *) echo "[ERR] spoo-r19-$i ($U)" >> "$LOG";; esac
done

# ---------- 14. cleanuri ×2 ----------
i=0; for p in "/?ref=VGD-R19-cu1" "/guerra-hoy/?ref=VGD-R19-cu2"; do
  i=$((i+1))
  U=$(curl -s --max-time 15 -X POST https://cleanuri.com/api/v1/shorten -d "url=$B$p" | q result_url)
  case "$U" in https://cleanuri.com/*) echo "[OK] cleanuri-r19-$i → $U" >> "$LOG";; *) echo "[ERR] cleanuri-r19-$i ($U)" >> "$LOG";; esac
done

# ---------- 15. pastemyst ×1 ----------
R=$(curl -s --max-time 20 -X POST "https://paste.myst.rs/api/v2/paste" -H "Content-Type: application/json" \
  --data "$(python3 -c "import json;print(json.dumps({'title':'VANGUARD v50 RED GLOBAL','language':'plaintext','content':'VANGUARD — juego de guerra mundial gratuito en el navegador, sin registro. Misión 300 enlaces: 5.000 monedas + 50 gemas para todos. https://vanguard.world'}))")")
P=$(echo "$R" | q pid)
[ -n "$P" ] && echo "[OK] pastemyst → https://paste.myst.rs/$P" >> "$LOG" || echo "[ERR] pastemyst: $(echo "$R" | head -c 60)" >> "$LOG"

# ---------- 16. paste.rs ×1 ----------
R=$(curl -s --max-time 20 --data-binary @- "https://paste.rs/" <<'EOF'
VANGUARD v50 RED GLOBAL — free browser war game, Spanish-first, no signup.
Mission 300 links: 5,000 coins + 50 gems for everyone. 83 sections that pay coins,
live news (Al Jazeera, France24, DW, BBC, ABC), 3D globe, multiplayer, 3D drone strikes.
PLAY: https://vanguard.world
EOF
)
case "$R" in https://paste.rs/*) echo "[OK] pasters → $R" >> "$LOG";; *) echo "[ERR] pasters ($R)" >> "$LOG";; esac

# ---------- 17. Telegraph ×2 (reutiliza cuenta si existe, si no crea una) ----------
TOK=$(python3 -c "import json;d=json.load(open('/tmp/tg19acc.json'));print(d.get('result',{}).get('access_token',''))" 2>/dev/null)
if [ -z "$TOK" ]; then
  curl -s --max-time 20 "https://api.telegra.ph/createAccount?short_name=VANGUARD&author_name=VanguardPress" > /tmp/tg19acc.json
  TOK=$(python3 -c "import json;d=json.load(open('/tmp/tg19acc.json'));print(d.get('result',{}).get('access_token',''))" 2>/dev/null)
fi
tgpost() { # $1 título, $2 texto
  curl -s --max-time 25 -X POST "https://api.telegra.ph/createPage" \
    --data-urlencode "access_token=$TOK" --data-urlencode "title=$1" \
    --data-urlencode "author_name=VanguardPress" --data-urlencode "content=[{\"tag\":\"p\",\"children\":[\"$2\"]}]" \
    --data-urlencode "return_content=false" | q result | python3 -c "import json,sys;d=json.load(sys.stdin);print(d.get('url','ERR'))" 2>/dev/null
}
U=$(tgpost "VANGUARD v50 RED GLOBAL — misión 300 enlaces (ES)" "El juego de guerra mundial GRATIS en tu navegador superó los 200 enlaces publicados por la comunidad. Nueva misión: 300 enlaces = 5.000 monedas + 50 gemas para TODOS los agentes. Explorador de 83 secciones que paga monedas, noticias en vivo de 5 fuentes, mapa 3D, multijugador y más. JUEGA SIN DESCARGAR NADA: https://vanguard.world")
case "$U" in https://telegra.ph/*) echo "[OK] telegraph-es → $U" >> "$LOG";; *) echo "[ERR] telegraph-es ($U)" >> "$LOG";; esac
U=$(tgpost "VANGUARD v50 GLOBAL NETWORK — 300-link mission (EN)" "The free browser world-war strategy game passed 200 community links. New mission: 300 links = 5,000 coins + 50 gems for EVERYONE. 83-section explorer that pays coins, live news from 5 sources, 3D globe, multiplayer. PLAY NOW, NO DOWNLOAD: https://vanguard.world")
case "$U" in https://telegra.ph/*) echo "[OK] telegraph-en → $U" >> "$LOG";; *) echo "[ERR] telegraph-en ($U)" >> "$LOG";; esac

# ---------- 18. GitHub Release v50.0 ----------
R=$(curl -s --max-time 30 -X POST "$API/repos/$OWNER/$REPO/releases" \
  -H "Authorization: Bearer $T" -H "Accept: application/vnd.github+json" -H "Content-Type: application/json" \
  --data "$(python3 -c "import json;print(json.dumps({'tag_name':'v50.0','target_commitish':'main','name':'v50.0 RED GLOBAL','body':'Misión de difusión progresiva: 200 ✓ conquistada → 300 → 400 → 500 → 750 → 1000 enlaces. Recompensas escalables (5.000 monedas + 50 gemas + 800 XP en el hito 300). Banner dinámico y mapa de reclamos por hito.\\n\\nJUEGA: https://vanguard.world'}))")")
U=$(echo "$R" | q html_url)
case "$U" in *releases*) echo "[OK] release-v50 → $U" >> "$LOG";; *) echo "[ERR] release-v50: $(echo "$R" | head -c 80)" >> "$LOG";; esac

# ---------- 19. GitHub Pages mision300.html ----------
PGBODY="$(cat <<'EOF'
<!doctype html><html lang="es"><head><meta charset="utf-8"><title>VANGUARD — Misión 300 enlaces</title><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="index,follow"></head>
<body style="font-family:monospace;background:#0a0e14;color:#7df9ff;max-width:760px;margin:40px auto;padding:0 16px">
<h1>VANGUARD v50 · RED GLOBAL</h1>
<p>El juego de estrategia de guerra mundial <b>GRATIS</b> en tu navegador ya superó <b>200 enlaces</b> publicados por la comunidad.</p>
<p><b>Misión 300</b>: 5.000 monedas + 50 gemas + 800 XP para todos al alcanzarla.</p>
<ul><li>Explorador de 83 secciones que paga monedas</li><li>Noticias en vivo: Al Jazeera, France24, DW, BBC, ABC</li><li>Mapa 3D, multijugador, dron de guerra, radio en vivo</li></ul>
<p><a href="https://vanguard.world" style="color:#ffd54a">▶ JUGAR AHORA — https://vanguard.world</a></p>
</body></html>
EOF
)"
B64=$(printf '%s' "$PGBODY" | base64 -w 0)
R=$(curl -s --max-time 30 -X PUT "$API/repos/$OWNER/$REPO/contents/mision300.html" \
  -H "Authorization: Bearer $T" -H "Accept: application/vnd.github+json" -H "Content-Type: application/json" \
  --data "$(python3 -c "import json,sys;print(json.dumps({'message':'R19: mision300 page','content':'$B64','branch':'gh-pages'}))")")
U=$(echo "$R" | python3 -c "import json,sys;d=json.load(sys.stdin);print((d.get('content') or {}).get('html_url',''))" 2>/dev/null)
[ -n "$U" ] && echo "[OK] pages-mision300 → $U" >> "$LOG" || echo "[ERR] pages-mision300: $(echo "$R" | head -c 80)" >> "$LOG"

# ---------- 20. Discussion R19 ----------
NODEID="R_kgDOUYlUjA"; CATID="DIC_kwDOUYlUjM4DGUTg"
python3 -c "
import json
body='''## Ronda 19 — RED GLOBAL (v50.0)

La misión 200 está **CONQUISTADA (202 enlaces verificados)** y ahora la difusión es progresiva: **300 → 400 → 500 → 750 → 1000** con recompensas crecientes (5.000 monedas + 50 gemas + 800 XP en el 300).

**Ronda 19 en marcha** por lugares NUEVOS: Google/Bing sitemap ping, Wayback Machine, hst.sh, katb.in, pastemyst, Telegraph, acortadores y más.

👉 **JUGAR: https://vanguard.world**'''
q='mutation(\$input: CreateDiscussionInput!){createDiscussion(input:\$input){discussion{url}}}'
print(json.dumps({'query':q,'variables':{'input':{'repositoryId':'$NODEID','categoryId':'$CATID','title':'Ronda 19 — RED GLOBAL: misión 300 enlaces','body':body}}}))" > /tmp/r19_dq.json
R=$(curl -s --max-time 30 -X POST "$API/graphql" -H "Authorization: Bearer $T" -H "Content-Type: application/json" --data @/tmp/r19_dq.json)
U=$(echo "$R" | python3 -c "import json,sys;d=json.load(sys.stdin);print((d.get('data') or {}).get('createDiscussion',{}).get('discussion',{}).get('url') or '')" 2>/dev/null)
[ -n "$U" ] && echo "[OK] discussion-r19 → $U" >> "$LOG" || echo "[ERR] discussion-r19: $(echo "$R" | head -c 100)" >> "$LOG"

echo "=== R19 WAVE 2 FIN ===" >> "$LOG"
cat "$LOG"
