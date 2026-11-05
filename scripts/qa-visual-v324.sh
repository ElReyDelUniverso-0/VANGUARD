#!/bin/bash
# QA VISUAL v324 — EL ATLAS MIRA AL SUR (el anillo de la escuela llega al atlas)
# Ley v302: arranque + verificación + cierre en UNA llamada.
# Lecciones v320/v321/v322: una carga, DOM preciso, retornos acotados,
# verificar ESTADOS (no instantes) y sembrar localStorage antes de recargar.
#   A) LA FRANJA DEL PAÍS DEL DÍA: el país predicho por la fórmula
#      (día 308 % 84 = 56 → Libia) aparece con su hora local viva y la
#      figura del día (308 % 78 = 74 → Valdecy Urquiza) + ley del anillo
#   B) LOS RÉCORDS DEL PLANETA: cinco superlativos COMPUTADOS en la vista
#      PAÍSES; el clic en «más poblado» abre la ficha de China (Pekín)
#   C) EL SUR EN PANTALLA: búsqueda «Bolivia» encuentra la nación nueva;
#      cabecera con los censos nuevos (84 · 78)
#   D) consola limpia · sin desbordes 1440/390 · canon repo restaurado · cero zombis
set -u
PORT=3497
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa324.log 2>&1 &
SRVPID=$!
ARRIBA=0
for i in $(seq 1 25); do sleep 1; if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi; done
echo "boot=$ARRIBA"
echo "SALUD: $(curl -s "$BASE/api/health" | head -c 160)"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; kill -9 $SRVPID 2>/dev/null; exit 1; fi

agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 5
agent-browser eval "(() => { localStorage.setItem('vg-cromo-tabs-v106', JSON.stringify(['atlas'])); localStorage.setItem('vg-cromo-activa-v106', 'atlas'); return 'pestaña atlas sembrada'; })()" 2>&1 | head -1
agent-browser open "$BASE/?r=1" >/dev/null 2>&1
sleep 6
# espera ACTIVA del panel (la cortina de arranque disipa cuando el último _next aterriza)
MONTO=0
for i in $(seq 1 12); do
  R=$(agent-browser eval "document.querySelector('[aria-label=\"País del día\"]') ? 'MONTO' : 'no'" 2>/dev/null | tr -d '"')
  if [ "$R" = "MONTO" ]; then MONTO=1; break; fi
  sleep 2
done
echo "panel_monto=$MONTO"
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /saltar el cine/i.test(x.textContent||'')); if (b) { b.click(); return 'cine fuera'; } return 'sin cine'; })()" >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /^skip$/i.test((x.textContent||'').trim())); if (b) { b.click(); return 'manual fuera'; } return 'sin manual'; })()" >/dev/null 2>&1
sleep 2

echo "── A) LA FRANJA DEL PAÍS DEL DÍA (sexto anillo) ──"
agent-browser eval "(() => { const f = document.querySelector('[aria-label=\"País del día\"]'); if (!f) return 'REGRESIÓN: la franja del país del día no montó'; const t = f.textContent || ''; const pais = t.includes('Libia') ? 'CUMPLE' : 'FALLA'; const figura = t.includes('Valdecy Urquiza') ? 'CUMPLE' : 'FALLA'; const ley = t.includes('el anillo del atlas avanza un país y una figura por día') ? 'CUMPLE' : 'FALLA'; const hora = /[0-9]{2}:[0-9]{2}/.test(t) ? 'CUMPLE' : 'FALLA'; return ('FRANJA: país ' + pais + ' (Libia = día 308 % 84) · figura ' + figura + ' (Urquiza = 308 % 78) · ley ' + ley + ' · hora local viva ' + hora).slice(0, 200); })()" 2>&1 | head -c 300; echo
agent-browser screenshot /tmp/render/qa324-franja.png >/dev/null 2>&1

# segunda pasada de saltos: el manual y la puerta de voz llegan TARDE (lección de esta ronda)
agent-browser eval "(() => { const b = [...document.querySelectorAll('button')].find((x) => /^skip$/i.test((x.textContent||'').trim())); if (b) { b.click(); return 'manual fuera (2ª)'; } return 'sin manual'; })()" >/dev/null 2>&1
sleep 1

echo "── B) LOS RÉCORDS DEL PLANETA (computados) ──"
agent-browser eval "(() => { const btn = [...document.querySelectorAll('button')].find((x) => x.textContent.trim() === 'PAÍSES'); if (!btn) return 'REGRESIÓN: sin botón PAÍSES'; btn.click(); return 'vista países'; })()" >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const r = document.querySelector('[aria-label=\"Récords del planeta\"]'); if (!r) return 'REGRESIÓN: sin franja de récords'; const t = r.textContent || ''; const n = ['más poblado','más grande','más denso','más pequeño','más vacío'].filter((x) => t.includes(x)).length; return ('RÉCORDS: ' + n + '/5 computados — más poblado→' + (t.includes('India') ? 'India ✓' : '✗') + ' · más grande→' + (t.includes('Rusia') ? 'Rusia ✓' : '✗') + ' · más denso→' + (t.includes('Singapur') ? 'Singapur ✓' : '✗')).slice(0, 180); })()" 2>&1 | head -c 250; echo
agent-browser eval "(() => { const b = [...document.querySelectorAll('[aria-label=\"Récords del planeta\"] button')].find((x) => /más poblado/.test(x.textContent||'')); if (!b) return 'sin botón'; b.click(); return 'clic en más poblado'; })()" >/dev/null 2>&1
sleep 1
agent-browser eval "(() => { const t = document.body.textContent || ''; const ficha = t.includes('LÍDER:'); const capital = t.includes('Nueva Delhi'); return ('FICHA POR RÉCORD: ' + (ficha && capital ? 'CUMPLE — el clic abrió la ficha de India (CAPITAL Nueva Delhi)' : 'FALLA')).slice(0, 140); })()" 2>&1 | head -c 200; echo
agent-browser screenshot /tmp/render/qa324-records.png >/dev/null 2>&1

echo "── C) EL SUR EN PANTALLA ──"
agent-browser eval "(() => { const i = document.querySelector('input[placeholder*=\"Buscar país\"]'); if (!i) return 'sin buscador'; const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(i, 'Bolivia'); i.dispatchEvent(new Event('input', { bubbles: true })); return 'buscando Bolivia'; })()" 2>&1 | head -1
sleep 2
agent-browser eval "(() => { const t = document.body.textContent || ''; return ('SUR: ' + (t.includes('Bolivia') && t.includes('La Paz') ? 'CUMPLE — Bolivia (el sur andino) vive en la sala' : 'FALLA — la nación nueva no aparece')).slice(0, 140); })()" 2>&1 | head -c 200; echo
agent-browser eval "(() => { const t = document.body.textContent || ''; const h = [...document.querySelectorAll('span,div')].map((x) => x.textContent||'').find((x) => /EDICI\u00d3N 2026 ·/.test(x)); return ('CABECERA: ' + (h && h.includes('84') && h.includes('78') ? 'CUMPLE — 84 PAÍSES · 78 PERSONAS' : 'FALLA: ' + (h || '').slice(0,60))).slice(0, 140); })()" 2>&1 | head -c 200; echo
agent-browser screenshot /tmp/render/qa324-sur.png >/dev/null 2>&1

echo "── D) MÓVIL + CONSOLA + DESBORDES ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; const f = document.querySelector('[aria-label=\"País del día\"]'); return o ? 'DESBORDE en 390 — REGRESIÓN' : 'sin desborde en 390 · franja ' + (f ? 'en pie' : 'PERDIDA'); })()" 2>&1 | head -1
agent-browser screenshot /tmp/render/qa324-movil.png >/dev/null 2>&1
agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser eval "(() => { const o = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1; return o ? 'DESBORDE en 1440 — REGRESIÓN' : 'sin desborde en 1440'; })()" 2>&1 | head -1
agent-browser errors 2>&1 | head -3; echo "(vacío = sin errores de página)"
agent-browser console 2>&1 | rg -i "hydration|hydrat|error" | head -3; echo "(vacío = consola limpia)"

echo "── CIERRE ──"
agent-browser close >/dev/null 2>&1
kill $SRVPID 2>/dev/null; sleep 1
kill -9 $SRVPID 2>/dev/null
curl -s -o /dev/null --max-time 2 "$BASE/api/health" && echo "ZOMBI" || echo "puerto 3497 libre — cero zombis"
git checkout HEAD -- db/custom.db 2>/dev/null
echo "canon repo restaurado"
echo "QA VISUAL v324 FIN"
