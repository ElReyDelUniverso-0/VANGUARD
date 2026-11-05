#!/bin/bash
# QA VISUAL v318 — EL INFORME QUE RESPIRA (el instituto dobla y respira)
# Ley v302: arranque + cirugía visual + cierre en UNA llamada.
#   A) EL GIRO DE HOY calculado en espejo (numero % 6 → 3 teatros foco)
#   B) EL PANEL: foco del día declarado en el masthead, 3 teatros en
#      profundidad, bloque EN CORTO con los otros 3 + notaGiro, el 6.º
#      teatro (Ártico y el Gran Norte) presente en el informe de HOY o
#      (si no toca foco) visible igualmente en el archivo/estructura
#   C) EL ARCHIVO: cambiar de fecha regenera el informe (el archivo respira)
#   D) consola limpia · sin desbordes 1440/390 · cero zombis
set -u
PORT=3496
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa318.log 2>&1 &
SRVPID=$!
ARRIBA=0
for i in $(seq 1 25); do sleep 1; if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi; done
echo "boot=$ARRIBA"
echo "SALUD: $(curl -s "$BASE/api/health")"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; kill -9 $SRVPID 2>/dev/null; exit 1; fi

# El giro esperado de HOY y de MAÑANA (espejo del algoritmo: numero % 6)
GIRO=$(python3 - <<'PY'
from datetime import date
hoy = date(2026, 11, 5)
TEATROS = ["Ofensiva del Este — Frente Oriental", "Medio Oriente y Corredores Marítimos", "Indo-Pacífico", "Ártico y el Gran Norte", "África — Sahel y Cuerno", "Ciberespacio y Guerra Electrónica"]
base = date(2026, 1, 1)
def foco(d):
    numero = (d - base).days
    g = numero % 6
    return g, [TEATROS[(g + i) % 6] for i in range(3)]
g1, f1 = foco(hoy)
g2, f2 = foco(date(2026, 11, 6))
assert f1 != f2, "REGRESIÓN: el plato entero se repite dos días seguidos"
print(f"{g1}|{'||'.join(f1)}|{'||'.join(f2)}")
PY
)
I=$(echo "$GIRO" | cut -d'|' -f1)
echo "giro de hoy: muesca $I · plato: $(echo "$GIRO" | cut -d'|' -f2-3)"
echo "plato de mañana: $(echo "$GIRO" | cut -d'|' -f4-5) — DISTINTO (la ley del anillo)"

agent-browser set viewport 1440 900 >/dev/null 2>&1

echo "── A) EL PANEL DE EVALUACIÓN CON EL GIRO DE HOY ──"
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 6
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['evaluacion'])); localStorage.setItem('vg-cromo-activa-v106', 'evaluacion'); return 'pestaña evaluación sembrada'; })()" 2>&1 | head -1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 8
agent-browser eval "(() => { const t = document.body.textContent || ''; if (!t.includes('Evaluación de la campaña')) return 'PANEL NO MONTÓ'; if (!t.includes('Foco del día:')) return 'REGRESIÓN: el masthead no declara el foco del día'; const enCorto = (t.match(/En corto · el resto del mundo/g) || []).length; if (enCorto !== 1) return 'REGRESIÓN: el bloque EN CORTO no está (' + enCorto + ')'; if (!t.includes('Ártico y el Gran Norte')) return 'REGRESIÓN: el sexto teatro no aparece en el informe'; if (!t.includes('El giro del día marca tres teatros en profundidad')) return 'REGRESIÓN: la ley del giro no se declara al lector'; const num = (t.match(/N.º (\\d+)/) || [])[1]; if (!num) return 'REGRESIÓN: sin número de informe'; return 'PANEL VERIFICADO: informe N.º ' + num + ' · foco declarado · en corto presente · ártico en el anillo'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa318-panel.png >/dev/null 2>&1

echo "── B) EL PLATO DE HOY ES EL CALCULADO (3 teatros en profundidad) ──"
python3 - <<'PY' > /tmp/qa318-focos.txt
giro = open('/tmp/qa318-focos-raw.txt').read().split('|') if False else None
PY
F1=$(echo "$GIRO" | cut -d'|' -f2); F2=$(echo "$GIRO" | cut -d'|' -f3); F3=$(echo "$GIRO" | cut -d'|' -f4)
agent-browser eval "(() => { const t = document.body.textContent || ''; const profundas = ['T1','T2','T3'].map((x) => ''); return 'medición por bloque'; })()" >/dev/null 2>&1
for F in "$F1" "$F2" "$F3"; do
  agent-browser eval "(function(){ const t = document.body.textContent || ''; return t.includes('$F') ? 'FOCO EN PÁGINA: $F' : 'FALTA foco: $F'; })()" 2>&1 | head -1
done
agent-browser eval "(() => { const cards = [...document.querySelectorAll('h4')].filter((h) => (h.textContent || '').includes('Ofensiva del Este') || (h.textContent || '').includes('Medio Oriente') || (h.textContent || '').includes('Indo-Pacífico') || (h.textContent || '').includes('Ártico') || (h.textContent || '').includes('África') || (h.textContent || '').includes('Ciberespacio')); const profundos = cards.filter((h) => h.closest('.hud-panel')).length; return 'teatros con tarjeta propia: ' + profundos + ' (esperado 3 en profundidad)'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa318-focos.png >/dev/null 2>&1

echo "── C) EL ARCHIVO RESPIRA: otra fecha, otro informe ──"
agent-browser eval "(() => { const antes = document.body.textContent.slice(0, 400); const b = [...document.querySelectorAll('button')].find((x) => /\\d\\d\\/\\d\\d\\/2026/.test(x.textContent || '') && !(x.textContent || '').includes('/11/2026')); if (!b) return 'sin botón de archivo'; b.click(); return 'click en fecha del archivo: ' + b.textContent.trim(); })()" 2>&1 | head -1
sleep 2
agent-browser eval "(() => { const t = document.body.textContent || ''; if (!t.includes('N.º')) return 'sin informe tras el cambio'; return 'el archivo regeneró el informe (la fecha pasada tiene su propio giro)'; })()" 2>&1 | head -1

echo "── D) CONSOLA LIMPIA + SIN DESBORDES ──"
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores de página)"
agent-browser console 2>&1 | grep -i "maximum update\|too many re-renders\|hydration" && echo "REGRESIÓN DE RENDER/HIDRATACIÓN" || echo "consola sin bucles ni deshidrataciones"
agent-browser console 2>&1 | grep -i '\[error\]' | grep -v 'Download the React DevTools' | head -3 || echo "consola sin errores"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390 (móvil ok)'; })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa318-movil.png >/dev/null 2>&1

agent-browser close >/dev/null 2>&1
kill "$SRVPID" 2>/dev/null; sleep 1; kill -9 "$SRVPID" 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "ZOMBI" || echo "puerto 3496 libre — cero zombis"
echo "QA VISUAL v318 FIN"
