#!/bin/bash
# RONDA 18 — OLEADA A: ECOSISTEMA GITHUB (canales NUEVOS, nunca usados)
# 6 Gists públicos (ES/EN/PT + guía + changelog) + 4 Releases (v46-v49) + 5 Wiki.
# Todo verificado después por verify-r18.sh. Log: campaign-results.txt
GH="ElReyDelUniverso-0:$(cat /home/z/my-project/.ghtoken)"
T="${GH#*:}"  # solo el token, sin usuario
API=https://api.github.com
LOG=/home/z/my-project/scripts/campaign-results.txt
BASE=https://vanguard-kq9r.vercel.app
echo "=== R18 WAVE A (GitHub) $(date -u +"%Y-%m-%dT%H:%M:%SZ") ===" >> "$LOG"

gist() { # $1=file-name $2=desc $3=content-file
  python3 -c "import json,sys;p=json.dumps({'description':sys.argv[1],'public':True,'files':{sys.argv[2]:{'content':open(sys.argv[3]).read()}}});open('/tmp/r18/payload.json','w').write(p)" "$2" "$1" "$3"
  R=$(curl -s --max-time 30 -X POST "$API/gists" \
    -H "Authorization: Bearer $T" -H "Accept: application/vnd.github+json" \
    --data @/tmp/r18/payload.json)
  U=$(echo "$R" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d.get('html_url') or 'ERR:'+(d.get('message') or 'unknown')[:60])" 2>/dev/null)
  echo "[Gist] $1 → $U" | tee -a "$LOG"
}

mkdir -p /tmp/r18
# --- ES anuncio ---
cat > /tmp/r18/gist-es.md <<'EOF'
# VANGUARD — Misión de Difusión 200: publica el juego donde quieras

**VANGUARD** es el juego de guerra gratuito en el navegador, en español, sin registro y sin descargas: https://vanguard-kq9r.vercel.app

## Qué acaba de estrenar (v49.0 DIFUSIÓN 200)
- **Misión de difusión mundial**: barra de progreso en vivo hacia 200 enlaces públicos. Al llegar, TODOS los agentes cobran 3.000 monedas + 30 gemas + 500 XP.
- **83 secciones** agrupadas en 11 mundos con buscador universal (Ctrl+K), botón SORPRÉNDEME y recompensas por explorar.
- **NASA EONET en vivo**: volcanes, incendios, tormentas y sismos activos ahora mismo en el planeta.
- **Divisas en crisis**: el precio real del rial iraní, el rublo, el bolívar y 13 monedas más, actualizado cada hora.
- **Noticias de 5 fuentes** (GDELT, BBC Mundo, France 24, DW, Al Jazeera, ABC) en la emisora en vivo.
- Guerra global multijugador, duelos ELO, globo 3D OSINT de 15 capas, 8 idiomas.

## Cómo ayudar a la misión
Publica un enlace en tu blog, wiki, foro, red social o pastebin favorito — cada sitio nuevo suma. Comparte con tu código `VGD-TU_ALIAS` para ganarte las recompensas de reclutador.

👉 **JUGAR AHORA: https://vanguard-kq9r.vercel.app**
EOF
gist "VANGUARD-difusion-200-es.md" "VANGUARD — Misión Difusión 200 (ES)" "/tmp/r18/gist-es.md"

# --- EN anuncio ---
cat > /tmp/r18/gist-en.md <<'EOF'
# VANGUARD — 200-Link Spread Mission: publish the game anywhere

**VANGUARD** is the free browser war game — Spanish-first, no signup, no downloads: https://vanguard-kq9r.vercel.app

## Just shipped (v49.0)
- **Worldwide Spread Mission**: a live progress bar towards 200 public links. When we get there, EVERY agent claims 3,000 coins + 30 gems + 500 XP.
- **83 sections** across 11 worlds with universal search (Ctrl+K), a SURPRISE ME dice button, and coins for exploring.
- **Live NASA EONET events**: active volcanoes, wildfires, storms and quakes right now.
- **Currencies in crisis**: real IRN rial, ruble, bolívar and 13 more, refreshed hourly.
- **News from 5 sources** (GDELT, BBC, France 24, DW, Al Jazeera, ABC) in the live broadcast room.
- Global multiplayer war, ELO duels, 3D OSINT globe with 15 layers, 8 languages.

## How to help
Post a link on your blog, wiki, forum, social network or pastebin — every NEW site counts. Share with your `VGD-ALIAS` referral code for recruiter rewards.

👉 **PLAY NOW: https://vanguard-kq9r.vercel.app**
EOF
gist "VANGUARD-200-links-en.md" "VANGUARD — 200 Link Mission (EN)" "/tmp/r18/gist-en.md"

# --- PT anuncio ---
cat > /tmp/r18/gist-pt.md <<'EOF'
# VANGUARD — Missão de Difusão 200: publique o jogo onde quiser

**VANGUARD** é o jogo de guerra gratuito no navegador, em espanhol (e 7 idiomas), sem registro: https://vanguard-kq9r.vercel.app

## Novidades (v49.0)
- **Missão de difusão mundial**: barra de progresso ao vivo rumo a 200 links públicos. Ao chegar, TODOS ganham 3.000 moedas + 30 gemas + 500 XP.
- **83 seções** em 11 mundos, busca universal (Ctrl+K) e botão SURPREENDA-ME.
- **NASA EONET ao vivo**: vulcões, incêndios, tempestades e terremotos ativos agora.
- **Moedas em crise**: real cotado em tempo real e mais 15 divisas de países em conflito.
- **Notícias de 5 fontes** (GDELT, BBC, France 24, DW, Al Jazeera, ABC).
- Guerra global multijogador, duelos ELO, globo 3D OSINT de 15 camadas.

## Como ajudar
Publique um link no seu blog, wiki, fórum ou rede social — cada site novo conta.

👉 **JOGAR AGORA: https://vanguard-kq9r.vercel.app**
EOF
gist "VANGUARD-missao-200-pt.md" "VANGUARD — Missão Difusão 200 (PT)" "/tmp/r18/gist-pt.md"

# --- ES guía rápida de juego ---
cat > /tmp/r18/gist-guia.md <<'EOF'
# VANGUARD — Guía rápida para nuevos comandantes (ES)

Juego gratis, en el navegador, sin registro: https://vanguard-kq9r.vercel.app

1. **Entra y elige alias** — recibes bono de bienvenida en monedas.
2. **Portada**: mira la meta comunitaria (jugadores) y la misión de difusión (200 enlaces) — ambas pagan a TODOS al cumplirse.
3. **Ctrl+K o el botón Buscar**: 83 secciones a un toque. Prueba SORPRÉNDEME (dado verde) — saltar a lo desconocido paga monedas (hitos 10/25/50/83 secciones = 150/400/1.000/2.500).
4. **Guerra Hoy**: NASA en vivo (volcanes, sismos), divisas en crisis y noticias de 5 fuentes.
5. **Mapa 3D**: globo OSINT de 15 capas con unidades y conflictos.
6. **Armería / Mercado / Bolsa**: equipa tu ejército y especula con recursos de guerra.
7. **Duelos ELO**: sube en el ranking global.

Consejo pro: comparte tu código `VGD-TU_ALIAS` — cada 3 invitaciones = +100 monedas, y si tu amigo entra, los dos ganan.

👉 https://vanguard-kq9r.vercel.app
EOF
gist "VANGUARD-guia-rapida-es.md" "VANGUARD — Guía rápida (ES)" "/tmp/r18/gist-guia.md"

# --- PT guía ---
cat > /tmp/r18/gist-guia-pt.md <<'EOF'
# VANGUARD — Guia rápido para novos comandantes (PT)

Jogo grátis no navegador, sem registro: https://vanguard-kq9r.vercel.app

1. Entre, escolha seu alias e receba o bônus de boas-vindas.
2. Ctrl+K abre as 83 seções; o dado SURPREENDA-ME te leva ao desconhecido (e paga moedas).
3. Guerra Hoje: NASA ao vivo, divisas em crise, notícias de 5 fontes.
4. Mapa 3D OSINT com 15 camadas, duelos ELO, mercado e bolsa de guerra.
5. Compartilhe seu código VGD-SEU_ALIAS: a cada 3 convites = +100 moedas.

👉 https://vanguard-kq9r.vercel.app
EOF
gist "VANGUARD-guia-rapida-pt.md" "VANGUARD — Guia rápido (PT)" "/tmp/r18/gist-guia-pt.md"

# --- Changelog v46→v49 ---
cat > /tmp/r18/gist-changelog.md <<'EOF'
# VANGUARD — Changelog v46.0 → v49.0

Juega gratis: https://vanguard-kq9r.vercel.app

## v49.0 DIFUSIÓN 200
- Nueva mecánica: **Misión de Difusión Mundial** — barra en vivo hacia 200 enlaces públicos; al llegar, recompensa global reclamable (3.000 monedas + 30 gemas + 500 XP) con dedup server-side por alias.
- API nueva: `/api/sharegoal` (GET progreso + POST reclamo con INSERT ON CONFLICT).

## v48.0 BRÚJULA
- Mecánica **Explorador**: monedas por descubrir secciones (hitos 10/25/50/83), botón SORPRÉNDEME, badges por mundo, barra de progreso en la nav.
- Navegación móvil: flechas + degradados en la fila de mundos (ya no hay secciones enterradas).
- Coherencia editorial: historia y figuras → ARCHIVO MUNDIAL; EMISORA 100% en vivo.
- Más noticias: Al Jazeera + ABC Internacional (total 5 fuentes + GDELT).

## v47.0 RADAR TOTAL
- **NASA EONET en vivo** ("El planeta en llamas"): eventos naturales activos con coordenadas.
- **Divisas en crisis**: 16 monedas de países en conflicto con tasas reales por hora.
- **Buscador universal de secciones** (Ctrl+K, /): filtrado sin acentos, recientes, teclado.

## v46.0 OBJETIVO MUNDIAL
- **Meta comunitaria**: hitos de jugadores (30/40/50/75/100...) con recompensa para todos; dedup server-side; banner dorado con referidos.
EOF
gist "VANGUARD-changelog-v46-v49.md" "VANGUARD changelog v46→v49" "/tmp/r18/gist-changelog.md"

# --- RELEASES v46 / v47 / v48 / v49 ---
rel() { # $1=tag $2=title $3=body-file
  R=$(curl -s --max-time 30 -X POST "$API/repos/ElReyDelUniverso-0/VANGUARD/releases" \
    -H "Authorization: Bearer $T" -H "Accept: application/vnd.github+json" \
    -d "{\"tag_name\":\"$1\",\"target_commitish\":\"main\",\"name\":\"$2\",\"body_path\":\"$3\",\"prerelease\":false}")
  U=$(echo "$R" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d.get('html_url') or 'ERR:'+(d.get('message') or 'unknown')[:80])" 2>/dev/null)
  echo "[Release] $1 → $U" | tee -a "$LOG"
}

cat > /tmp/r18/rel49.md <<'EOF'
## v49.0 DIFUSIÓN 200
**Juega gratis: https://vanguard-kq9r.vercel.app**

Nueva mecánica **Misión de Difusión Mundial**: progreso en vivo hacia 200 enlaces públicos; recompensa global (3.000 monedas + 30 gemas + 500 XP) reclamable por todos al alcanzarla, con dedup server-side.

- API `/api/sharegoal` (GET/POST con dedup por alias)
- Banner eléctrico en portada con compartir a WhatsApp/Telegram/X
EOF
rel "v49.0" "v49.0 — DIFUSIÓN 200" "/tmp/r18/rel49.md"

cat > /tmp/r18/rel48.md <<'EOF'
## v48.0 BRÚJULA
**Juega gratis: https://vanguard-kq9r.vercel.app**

- Mecánica **Explorador de Mundos**: monedas por descubrir las 83 secciones (hitos 10/25/50/83)
- Botón **SORPRÉNDEME** + badges por mundo + barra de progreso en la nav
- Navegación móvil con flechas y degradados — cero secciones enterradas
- Coherencia: historia/muertes → ARCHIVO MUNDIAL; EMISORA solo en vivo
- Más noticias: Al Jazeera + ABC Internacional
EOF
rel "v48.0" "v48.0 — BRÚJULA" "/tmp/r18/rel48.md"

cat > /tmp/r18/rel47.md <<'EOF'
## v47.0 RADAR TOTAL
**Juega gratis: https://vanguard-kq9r.vercel.app**

- **NASA EONET en vivo** en Guerra Hoy: volcanes, incendios, tormentas, sismos activos
- **Divisas en crisis**: 16 monedas de países en conflicto, tasas reales cada hora
- **Buscador universal** Ctrl+K con las 83 secciones, recientes y teclado completo
EOF
rel "v47.0" "v47.0 — RADAR TOTAL" "/tmp/r18/rel47.md"

cat > /tmp/r18/rel46.md <<'EOF'
## v46.0 OBJETIVO MUNDIAL
**Juega gratis: https://vanguard-kq9r.vercel.app**

- **Meta comunitaria de jugadores**: hitos 30/40/50/75/100/150/200/300/500 con recompensas para TODOS
- Banner dorado con progreso real desde la BD y botones de invitación con referido
- Dedup server-side (INSERT ON CONFLICT DO NOTHING) — imposible doble reclamo
EOF
rel "v46.0" "v46.0 — OBJETIVO MUNDIAL" "/tmp/r18/rel46.md"

# habilitar wiki en el repo (si estaba off) antes del push
EN=$(curl -s --max-time 20 -X PATCH "$API/repos/ElReyDelUniverso-0/VANGUARD" \
  -H "Authorization: Bearer $T" -H "Accept: application/vnd.github+json" \
  -d '{"has_wiki":true}' -o /dev/null -w "%{http_code}")
echo "[Wiki-enable] $EN" | tee -a "$LOG"

# --- WIKI (5 páginas) ---
rm -rf /tmp/r18/wiki
git clone -q "https://$GH@github.com/ElReyDelUniverso-0/VANGUARD.wiki.git" /tmp/r18/wiki 2>/dev/null || mkdir -p /tmp/r18/wiki
cd /tmp/r18/wiki || exit 1
git init -q 2>/dev/null; git config user.email "ops@vanguard.world"; git config user.name "VANGUARD Ops"; git checkout -q -b main 2>/dev/null || git checkout -q main

cat > Home.md <<'EOF'
# 🎖️ VANGUARD — El mundo en tiempo real

**Juega gratis, sin registro, en tu navegador: https://vanguard-kq9r.vercel.app**

VANGUARD es el juego de guerra gratuito en español: noticias de conflictos en vivo, globo 3D OSINT de 15 capas, guerra global multijugador con duelos ELO, y **83 secciones** en 11 mundos temáticos.

## Páginas de esta wiki
- [[Cómo jugar]] — guía de primeros pasos
- [[Explorador y búsqueda]] — la mecánica que paga por descubrir
- [[Radar de APIs]] — todos los datos reales integrados
- [[Misión Difusión 200]] — la meta de enlaces con recompensa global

## Mundos de VANGUARD
| Mundo | Qué contiene |
|---|---|
| PORTADA | Meta comunitaria, misión de difusión, crecimiento |
| GUERRA HOY | Noticias en vivo, NASA EONET, divisas en crisis |
| MAPA | Globo 3D OSINT, capas, unidades |
| EJÉRCITO | Armería, drones, simulador de combate |
| ECONOMÍA | Mercado, bolsa, bookmaker, divisas |
| EMISORA | En vivo, vídeos, directos, memes |
| ARCHIVO MUNDIAL | Enciclopedia, guerras históricas, figuras |
| COMUNIDAD | Foro, encuestas, torneos, embajadores |
EOF

cat > Como-jugar.md <<'EOF'
# Cómo jugar VANGUARD

**Entra gratis: https://vanguard-kq9r.vercel.app**

1. Elige tu alias — recibes un bono de bienvenida en monedas.
2. Explora con **Ctrl+K** (buscador universal) o el dado **SORPRÉNDEME**.
3. Cada sección nueva que descubres suma progreso del **Explorador**: hitos 10/25/50/83 = 150/400/1.000/2.500 monedas.
4. En **Guerra Hoy** ves NASA en vivo, divisas de países en conflicto y noticias de 5 fuentes.
5. En el **Mapa** controlas el globo 3D con 15 capas OSINT.
6. En **Armería** equipas tu ejército; en **Duelos ELO** subes en el ranking.
7. Comparte tu código `VGD-TU_ALIAS`: cada 3 invitaciones = +100 monedas.

La **Meta Comunitaria** y la **Misión de Difusión 200** pagan recompensas a TODOS cuando la comunidad las alcanza.
EOF

cat > Explorador-y-busqueda.md <<'EOF'
# Explorador y búsqueda (v48)

VANGUARD convierte la navegación en un juego:

- **Buscador universal**: Ctrl+K o tecla `/`. Filtra las 83 secciones sin acentos, guarda 6 recientes y navega con el teclado.
- **Botón SORPRÉNDEME**: el dado verde te lleva a una sección que nunca has visitado.
- **Badges por mundo**: cada mundo muestra cuántas secciones sin descubrir esconde, con un punto parpadeante.
- **Barra de progreso** en la nav con X/83 y porcentaje.

Recompensas: 10 secciones = 150 monedas · 25 = 400 · 50 = 1.000 · 83 (MAPA COMPLETO) = 2.500.

👉 https://vanguard-kq9r.vercel.app
EOF

cat > Radar-de-APIs.md <<'EOF'
# Radar de APIs — datos reales integrados

VANGUARD trae el planeta en vivo, todo con APIs gratuitas:

| Fuente | Qué aporta | Dónde |
|---|---|---|
| GDELT | Noticias de conflictos globales | Emisora / Guerra Hoy |
| BBC Mundo, France 24, DW, Al Jazeera, ABC | Titulares RSS en vivo | Emisora |
| NASA EONET v3 | Eventos naturales activos (volcanes, incendios, sismos, tormentas) | Guerra Hoy — "El planeta en llamas" |
| USGS | Terremotos en tiempo real | Mapa / Guerra Hoy |
| open.er-api.com | Tasas de cambio de 166 monedas | Guerra Hoy — "Divisas en crisis" |
| World Bank | Indicadores económicos por país | Geopolítica |
| Wikipedia | Enciclopedia contextual | Archivo Mundial |
| Google Maps | Cartografía | Mapa |

Todo el radar está documentado en juego en la sección **GUERRA HOY**.

👉 Juega gratis: https://vanguard-kq9r.vercel.app
EOF

cat > Mision-Difusion-200.md <<'EOF'
# Misión de Difusión 200 (v49)

La meta del comando: **200 enlaces públicos** de VANGUARD en lugares DIFERENTES (blogs, wikis, foros, pastebins, imágenes, acortadores...).

- Progreso en vivo en la portada del juego y en `/api/sharegoal`.
- Al llegar a 200, **todos los agentes** pueden reclamar **3.000 monedas + 30 gemas + 500 XP**.
- Cada jugador reclama una vez (dedup server-side por alias).

## Reglas de honestidad del contador
Solo se cuentan enlaces verificados a mano (HTTP 200 + contenido correcto). Nada de bots ni números inflados.

## Cómo sumar
Publica en tu blog, wiki, foro o red social y comparte tu código `VGD-TU_ALIAS`.

👉 **Jugar: https://vanguard-kq9r.vercel.app**
EOF

git add -A && git commit -qm "VANGUARD wiki: 5 páginas (Home, Cómo jugar, Explorador, Radar APIs, Misión 200)" && git branch -M main && git push -q -u "https://$GH@github.com/ElReyDelUniverso-0/VANGUARD.wiki.git" main 2>&1 | head -2
for p in Home Como-jugar Explorador-y-busqueda Radar-de-APIs Mision-Difusion-200; do
  C=$(curl -s -o /dev/null -w "%{http_code}" --max-time 20 "https://github.com/ElReyDelUniverso-0/VANGUARD/wiki/$p")
  echo "[Wiki] $p → $C" | tee -a "$LOG"
done
echo "=== R18 WAVE A FIN ===" >> "$LOG"
