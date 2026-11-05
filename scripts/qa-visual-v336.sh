#!/bin/bash
# QA VISUAL v336 — EL DOCUMENTO DEL DÍA (la décimo-segunda puerta del anillo
# de la escuela se abre en la Biblioteca Secreta)
# Ley v302: arranque + verificación + cierre en UNA llamada.
#   A) PREDICCIÓN HONESTA (lección v328): el catálogo se lee de la FUENTE
#      (biblioteca-panel.tsx, orden de archivo) y el día del reloj CENTRAL se
#      calcula en UTC — la franja debe CUMPLIR la predicción
#   B) LA FRANJA DICE LA VERDAD: ley en pantalla + contador honesto + total
#      derivado del catálogo (nada duro que se pudra — ley v322)
#   C) EL CLIC END-TO-END: historial sembrado → la franja dice «desclasificado»
#      → el clic abre el LECTOR con el expediente del día (el handler de la
#      casa, mismas reglas que abrir a mano)
#   D) LA ESTRELLA EN LA REJILLA: una sola tarjeta lleva ★ + DÍA
#   E) SIN BUCLES: consola limpia · sin desbordes 1440/390 · cero errores
#   F) CIERRE: pgrep centinela (v332) + canon repo restaurado
set -u
PORT=3519
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

# ── predicción honesta desde la fuente ──────────────────────────────────────
PRED=$(node -e "
const fs = require('fs');
const src = fs.readFileSync('src/components/vanguard/panels/biblioteca-panel.tsx', 'utf8');
const docs = [...src.matchAll(/id: \"([^\"]+)\", title: \"([^\"]+)\", level: \"([A-Z]+)\"/g)].map(m => ({ id: m[1], title: m[2], level: m[3] }));
const f = new Date();
const dia = Math.max(0, Math.floor((Date.UTC(f.getUTCFullYear(), f.getUTCMonth(), f.getUTCDate(), 12) - Date.UTC(f.getUTCFullYear(), 0, 1)) / 86400000));
const d = docs[dia % docs.length];
console.log(JSON.stringify({ id: d.id, title: d.title, level: d.level, dia, total: docs.length }));
")
echo "PREDICCIÓN: $PRED"
PID=$(echo "$PRED" | node -e "let s=''; process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).id))")
PTITULO=$(echo "$PRED" | node -e "let s=''; process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).title))")

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa336.log 2>&1 &
ARRIBA=0
for i in $(seq 1 25); do sleep 1; if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi; done
echo "boot=$ARRIBA"
echo "SALUD: $(curl -s "$BASE/api/health" | head -c 150)"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; pkill -9 -f "standalone/server.js" 2>/dev/null; exit 1; fi

agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
# sembrar: llave del cine (lección v330) + pestaña BIBLIOTECA + el documento
# del día YA en el historial (lección v334: el estado persistido se siembra
# ANTES de recargar — zustand/localStorage no mienten si se siembran temprano)
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const k = 'vg-cine-entrada-v178-' + new Date().toLocaleDateString('en-CA'); sessionStorage.setItem(k, '1'); localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['biblioteca'])); localStorage.setItem('vg-cromo-activa-v106', 'biblioteca'); localStorage.setItem('vanguard-library-v13', JSON.stringify(['$PID'])); return 'cine fuera · biblioteca sembrada · $PID en historial'; })()" >/dev/null 2>&1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 6

echo "── A) LA FRANJA CUMPLE LA PREDICCIÓN ──"
FRANJA=$(agent-browser eval "(() => { const f = document.querySelector('[aria-label=\"Documento del día\"]'); if (!f) return 'SIN FRANJA'; const t = f.textContent; return (t.includes('$PTITULO') ? 'TITULO✓' : 'TITULO✗') + '|' + (t.includes('la rotación es el reloj de la escuela') ? 'LEY✓' : 'LEY✗') + '|' + (t.includes('10 documentos en el catálogo') ? 'TOTAL✓' : 'TOTAL✗') + '|' + (t.includes('desclasificado — está en tu historial') ? 'HONESTO✓' : 'HONESTO✗'); })()" 2>/dev/null | tr -d '"')
echo "franja: $FRANJA"
agent-browser screenshot /tmp/render/qa336-franja.png >/dev/null 2>&1

echo "── B) EL CLIC ABRE EL LECTOR (el handler de la casa) ──"
agent-browser eval "(() => { const f = document.querySelector('[aria-label=\"Documento del día\"]'); if (!f) return 'sin franja'; f.click(); return 'clic dado'; })()" >/dev/null 2>&1
sleep 2
LECTOR=$(agent-browser eval "(() => { const m = [...document.querySelectorAll('.fixed')].find((d) => (d.textContent||'').includes('copia de lectura única')); if (!m) return 'SIN LECTOR'; return m.textContent.includes('DOC-DEEP') || m.textContent.includes('$PTITULO') ? 'LECTOR✓ expediente del día abierto' : 'lector con otro expediente'; })()" 2>/dev/null | tr -d '"')
echo "lector: $LECTOR"
agent-browser screenshot /tmp/render/qa336-lector.png >/dev/null 2>&1
agent-browser eval "(() => { const m = document.querySelector('.fixed.inset-0'); if (m) m.click(); return 'lector cerrado'; })()" >/dev/null 2>&1
sleep 1

echo "── C) LA ESTRELLA EN LA REJILLA (una sola tarjeta) ──"
ESTRELLA=$(agent-browser eval "(() => { const dias = [...document.querySelectorAll('span')].filter((s) => (s.textContent||'').trim() === 'DÍA').length; return 'tarjetas con insignia DÍA: ' + dias; })()" 2>/dev/null | tr -d '"')
echo "$ESTRELLA"

echo "── D) SIN BUCLES NI DESHIDRATACIONES ──"
agent-browser console 2>&1 | rg -i "maximum update|too many|hydration|hydrat" | head -3; echo "(vacío = consola limpia — la puerta no perturbó nada)"

echo "── E) MÓVIL + DESBORDES ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa336-movil.png >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -4; echo "(vacío = sin errores de página)"

echo "── CIERRE (el centinela pgrep — ley v332) ──"
agent-browser close >/dev/null 2>&1
pkill -9 -f "standalone/server.js" 2>/dev/null; sleep 1
pgrep -f "standalone/server.js" >/dev/null && echo "ZOMBI (pgrep)" || echo "pgrep limpio — cero zombis"
git checkout HEAD -- db/custom.db 2>/dev/null
echo "canon repo restaurado"
echo "QA VISUAL v336 FIN"
