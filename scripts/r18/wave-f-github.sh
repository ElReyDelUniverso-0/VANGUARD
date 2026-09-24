#!/bin/bash
# RONDA 18 — WAVE F: GitHub permanente (3 discussions + release v45.0 + 2 páginas Pages)
T="$(cat /home/z/my-project/.ghtoken)"
API=https://api.github.com
OWNER=ElReyDelUniverso-0; REPO=VANGUARD
LOG=/home/z/my-project/scripts/campaign-results.txt
echo "=== R18 WAVE F (GitHub perm.) $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" >> "$LOG"
NODEID="R_kgDOUYlUjA"

# ---------- discussions ×3 ----------
mkdisc() { # $1=title $2=bodyfile
  CATID="DIC_kwDOUYlUjM4DGUTg" # Announcements
  python3 -c "
import json
body=open('$2').read()
q='mutation(\$input: CreateDiscussionInput!){createDiscussion(input:\$input){discussion{url}}}'
print(json.dumps({'query':q,'variables':{'input':{'repositoryId':'$NODEID','categoryId':'$CATID','title':'$1','body':body}}}))" > /tmp/r18/dq.json
  U=$(curl -s --max-time 30 -X POST "$API/graphql" -H "Authorization: Bearer $T" -H "Content-Type: application/json" --data @/tmp/r18/dq.json | python3 -c "import json,sys;d=json.load(sys.stdin);print((d.get('data') or {}).get('createDiscussion',{}).get('discussion',{}).get('url') or ('ERR:'+str(d.get('errors'))[:80]))" 2>/dev/null)
  echo "[Discussion] $1 → $U" | tee -a "$LOG"
}

cat > /tmp/r18/d2.md <<'EOF'
## 🕹️ Juega gratis: https://vanguard-kq9r.vercel.app

Guía rápida para nuevos comandantes:

1. **Entra y elige alias** — bono de bienvenida en monedas al instante.
2. **Ctrl+K o `/`**: buscador universal de las 83 secciones. El dado **SORPRÉNDEME** te lleva a lo desconocido — descubrir secciones PAGA (hitos 10/25/50/83 = 150/400/1.000/2.500 monedas).
3. **Guerra Hoy**: NASA EONET en vivo (volcanes, sismos, incendios), divisas de países en conflicto con tasas reales por hora y noticias de 5 fuentes.
4. **Mapa**: globo 3D OSINT de 15 capas.
5. **Armería / Mercado / Bolsa**: equipa tu ejército y especula con recursos de guerra.
6. **Duelos ELO**: escala el ranking global.
7. **Comparte tu código VGD-TU_ALIAS**: +100 monedas cada 3 invitaciones.

Las metas comunitarias (jugadores y Misión de Difusión 200) pagan a TODOS cuando se cumplen. ¡Nos vemos en el frente!
EOF
mkdisc "🕹️ Guía rápida para nuevos comandantes" "/tmp/r18/d2.md"

cat > /tmp/r18/d3.md <<'EOF'
## Changelog v46.0 → v49.0

**Juega gratis: https://vanguard-kq9r.vercel.app**

### v49.0 DIFUSIÓN 200
- Misión de Difusión Mundial: barra en vivo hacia 200 enlaces públicos; recompensa global (3.000 monedas + 30 gemas + 500 XP) con dedup server-side por alias.
- API `/api/sharegoal` (GET progreso / POST reclamo).

### v48.0 BRÚJULA
- Explorador de Mundos: monedas por descubrir secciones (hitos 10/25/50/83).
- Botón SORPRÉNDEME + badges por mundo + barra de progreso en la nav.
- Navegación móvil con flechas y degradados; coherencia editorial (ARCHIVO = histórico, EMISORA = en vivo).
- Más noticias: Al Jazeera + ABC Internacional.

### v47.0 RADAR TOTAL
- NASA EONET en vivo ("El planeta en llamas").
- Divisas en crisis (16 monedas con tasas reales por hora).
- Buscador universal Ctrl+K con filtrado sin acentos y recientes.

### v46.0 OBJETIVO MUNDIAL
- Meta comunitaria de jugadores con hitos 30→500 y recompensa para todos; dedup server-side; banner dorado con referidos.
EOF
mkdisc "📜 Changelog v46.0 → v49.0" "/tmp/r18/d3.md"

cat > /tmp/r18/d4.md <<'EOF'
## 🛰️ El radar de APIs de VANGUARD — todo el planeta, sin pagar un centavo

**Verlo en vivo: https://vanguard-kq9r.vercel.app/guerra-hoy**

| Fuente | Qué aporta | Dónde en el juego |
|---|---|---|
| GDELT | Conflictos globales en vivo | Emisora / Guerra Hoy |
| BBC Mundo · France 24 · DW · Al Jazeera · ABC | Titulares RSS continuos | Emisora |
| NASA EONET v3 | Eventos naturales activos | Guerra Hoy — "El planeta en llamas" |
| USGS | Terremotos en tiempo real | Mapa / Guerra Hoy |
| open.er-api.com | 166 tasas de cambio | Guerra Hoy — "Divisas en crisis" |
| World Bank | Indicadores económicos | Geopolítica |
| Wikipedia | Contexto enciclopédico | Archivo Mundial |
| Google Maps | Cartografía | Mapa |

Todo integrado con cache y degradación elegante. Sugerencias de más APIs gratuitas: bienvenidas en este hilo.
EOF
mkdisc "🛰️ El radar de APIs — datos reales integrados" "/tmp/r18/d4.md"

# ---------- release v45.0 ----------
cat > /tmp/r18/rel45.md <<'EOF'
## v45.0 — Estabilidad y presencia en vivo
**Juega gratis: https://vanguard-kq9r.vercel.app**

- Presencia en tiempo real: contador de comandantes conectados en el HUD.
- Idioma automático según el navegador (8 idiomas).
- Estabilidad de sesión multijugador y reconexión diaria.
EOF
R=$(curl -s --max-time 30 -X POST "$API/repos/$OWNER/$REPO/releases" -H "Authorization: Bearer $T" -H "Accept: application/vnd.github+json" -d "{\"tag_name\":\"v45.0\",\"target_commitish\":\"main\",\"name\":\"v45.0 — PRESENCIA\",\"body_path\":\"/tmp/r18/rel45.md\"}")
echo "[Release] v45.0 → $(echo "$R" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d.get('html_url') or 'ERR:'+(d.get('message') or '?')[:80])" 2>/dev/null)" | tee -a "$LOG"

# ---------- páginas Pages extra: /mision200/ y /radar/ ----------
put_page() { # $1=path $2=archivo
  python3 -c "import json,sys,base64;p=json.dumps({'message':'R18','content':base64.b64encode(open(sys.argv[1],'rb').read()).decode(),'branch':'gh-pages'});open('/tmp/r18/pp.json','w').write(p)" "$2"
  C=$(curl -s --max-time 30 -X PUT "$API/repos/$OWNER/$REPO/contents/$1" -H "Authorization: Bearer $T" -H "Accept: application/vnd.github+json" --data @/tmp/r18/pp.json -o /dev/null -w "%{http_code}")
  echo "[Page] $1 → $C" | tee -a "$LOG"
}
python3 - <<'PYEOF'
tpl = open("/tmp/r18/site/index.html").read()
import re
def page(title, sub, body):
    return f"""<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title><meta name="description" content="{sub}">
<style>*{{margin:0;padding:0;box-sizing:border-box}}body{{font-family:system-ui,sans-serif;background:#0a0e12;color:#e8e6e3;padding:40px 20px;line-height:1.65}}
.c{{max-width:760px;margin:0 auto;border:1px solid #1e2a33;border-radius:16px;padding:40px 36px;background:linear-gradient(160deg,#0d141a,#0a0e12)}}
h1{{font-size:28px;color:#4ee38a;letter-spacing:.1em;text-transform:uppercase;margin-bottom:8px}}h2{{color:#37b6ff;font-size:18px;margin:26px 0 10px;text-transform:uppercase;letter-spacing:.08em}}
p,li{{color:#c5d1d9;font-size:15px}}ul{{padding-left:22px;margin:8px 0}}li{{margin:7px 0}}table{{width:100%;border-collapse:collapse;margin:12px 0;font-size:13.5px}}
td,th{{border:1px solid #1e2a33;padding:8px 10px;text-align:left;color:#c5d1d9}}th{{color:#37b6ff;background:#101a22}}
a.cta{{display:inline-block;background:linear-gradient(90deg,#37b6ff,#4ee38a);color:#06110b;font-weight:800;padding:13px 26px;border-radius:10px;text-decoration:none;margin-top:18px;text-transform:uppercase;letter-spacing:.08em}}</style></head>
<body><div class="c">{body}<a class="cta" href="https://vanguard-kq9r.vercel.app/?ref=VGD-PAGES">▶ Jugar ahora — gratis</a></div></body></html>"""

m200 = page("Misión de Difusión 200 — VANGUARD", "La meta del comando: 200 enlaces públicos con recompensa global",
"""<h1>Misión de Difusión 200</h1>
<p>El comando ha fijado una nueva meta: <b>200 enlaces públicos</b> de VANGUARD en lugares diferentes — blogs, wikis, foros, pastebins, imágenes, acortadores, páginas de proyecto. El progreso se ve EN VIVO en la portada del juego y vía <b>/api/sharegoal</b>.</p>
<h2>Recompensa global</h2>
<ul><li>Al llegar a 200: <b>3.000 monedas + 30 gemas + 500 XP</b> para cada agente.</li>
<li>Un reclamo por jugador — dedup en servidor, imposible inflar.</li>
<li>El contador solo suma enlaces <b>verificados a mano</b> (HTTP 200 + contenido correcto).</li></ul>
<h2>Estado del contador</h2>
<p>Cada vez que un enlace nuevo se verifica, suma al contador compartido. Los acortadores, pastes, gists, wikis, releases y páginas de proyecto todos cuentan: <b>en diferentes lugares</b>, como ordena la misión.</p>""")

radar = page("Radar de APIs — VANGUARD", "Todos los datos reales integrados, gratis",
"""<h1>Radar de APIs</h1>
<p>VANGUARD trae el planeta en vivo con APIs 100% gratuitas, con cache y degradación elegante:</p>
<table><tr><th>Fuente</th><th>Aporta</th><th>Dónde</th></tr>
<tr><td>GDELT</td><td>Conflictos globales</td><td>Emisora / Guerra Hoy</td></tr>
<tr><td>BBC Mundo · France 24 · DW · Al Jazeera · ABC</td><td>Titulares RSS</td><td>Emisora</td></tr>
<tr><td>NASA EONET v3</td><td>Eventos naturales activos</td><td>Guerra Hoy</td></tr>
<tr><td>USGS</td><td>Sismos en tiempo real</td><td>Mapa</td></tr>
<tr><td>open.er-api.com</td><td>166 tasas de cambio</td><td>Divisas en crisis</td></tr>
<tr><td>World Bank</td><td>Indicadores económicos</td><td>Geopolítica</td></tr>
<tr><td>Wikipedia</td><td>Enciclopedia</td><td>Archivo Mundial</td></tr></table>""")

open("/tmp/r18/site/mision.html","w").write(m200)
open("/tmp/r18/site/radar.html","w").write(radar)
print("2 pages extra OK")
PYEOF
sleep 2
put_page "mision200/index.html" "/tmp/r18/site/mision.html"
put_page "radar/index.html" "/tmp/r18/site/radar.html"
echo "=== R18 WAVE F FIN ===" >> "$LOG"
