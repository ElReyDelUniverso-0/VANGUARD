#!/bin/bash
# QA VISUAL v363 — EL ÁLBUM ILUSTRADO (mandato del Dueño: «que agregues las
# cartas, más únicas y más variedad; también el menú de Vanguard, feo y
# aburrido»). El guion que importa: ① el ÁLBUM crece a TRES familias (los 11
# conflictos vivos + 34 expedientes de LÍDERES + las 10 guerras de HISTORIA)
# con escáner de familia y tarjetas selladas; ② el LANZADOR viste la
# biblioteca propia (18 tiles ilustrados). móvil 390 sin desbordes y canon
# restaurado por el ritual de la casa (muerte POR PUERTO). Ley v302: arranque
# + verificación + cierre en UNA llamada. La ruta al panel es LAUNCHER → TILE
# DE SECCIÓN → PÍLDORA DEL RIEL, y el perfil limpio despierta en EN — el
# arnés siembra el idioma ES (v132: vanguard-lang-v1) antes de mirar.
set -u
PORT=3620
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

matar() { local P=$(ss -ltnp 2>/dev/null | grep ":$PORT " | grep -oP 'pid=\K[0-9]+' | head -1); [ -n "$P" ] && kill -9 "$P" 2>/dev/null; return 0; }

# DESPERTAR LA CASA: con el perfil limpio, el cine del estreno y el ritual de
# entrada (una vez por aparato) vuelven a disparar y TAPAN la portada — el
# arnés los cierra antes de mirar (la casa despertada es la que se prueba).
despertar() {
  agent-browser eval "(() => {
    const TEXTOS = ['SKIP', 'SALTAR', 'KEEP IT SILENT', 'MANTENER EN SILENCIO', 'NOT NOW', 'AHORA NO', 'MÁS TARDE', 'LATER', 'RECLAMAR BONO DIARIO', 'RECLAMAR'];
    for (let i = 0; i < 8; i++) {
      document.querySelectorAll('[aria-label=\"Cerrar el ritual\"], [aria-label=\"Cerrar\"], [aria-label=\"Close\"]').forEach(b => b.click());
      const bs = Array.from(document.querySelectorAll('button')).filter(b => b.offsetParent !== null);
      let clic = false;
      for (const t of TEXTOS) {
        const b = bs.find(x => x.innerText.trim().toUpperCase() === t);
        if (b) { b.click(); clic = true; break; }
      }
      if (!clic) break;
    }
    return 'despierto';
  })()" >/dev/null 2>&1
}

# LA RUTA A UNA PESTAÑA: launcher → tile de sección → píldora del riel
irPestana() { # $1 = nombre del tile, $2 = texto de la píldora
  P1=$(agent-browser eval "(() => {
    const L = document.querySelector('button[aria-label=\"Aplicaciones de Vanguard\"]');
    if (!L) return 'sin-launcher';
    L.click();
    return 'launcher';
  })()" 2>/dev/null | tr -d '"')
  sleep 2
  P2=$(agent-browser eval "(() => {
    const tile = Array.from(document.querySelectorAll('.app-tile')).find(t => t.innerText.trim().toUpperCase().startsWith('$1'));
    if (!tile) return 'sin-tile';
    tile.click();
    return 'tile';
  })()" 2>/dev/null | tr -d '"')
  sleep 2
  P3=$(agent-browser eval "(() => {
    const pill = Array.from(document.querySelectorAll('.vg170-riel-pill')).find(p => p.innerText.includes('$2'));
    if (!pill) return 'sin-riel';
    pill.click();
    return 'riel';
  })()" 2>/dev/null | tr -d '"')
  sleep 4
  echo "  ruta: $P1 → $P2 → $P3"
}

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa363.log 2>&1 &
ARRIBA=0
for i in $(seq 1 25); do sleep 1; if curl -s -o /dev/null "$BASE/api/health"; then ARRIBA=1; break; fi; done
echo "boot=$ARRIBA"
echo "SALUD: $(curl -s "$BASE/api/health" | head -c 150)"
if [ "$ARRIBA" != "1" ]; then echo "SIN SERVIDOR — ABORTO"; matar; exit 1; fi

agent-browser set viewport 1440 900 >/dev/null 2>&1
agent-browser console --clear >/dev/null 2>&1
agent-browser errors --clear >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 5
agent-browser eval "(() => { localStorage.clear(); sessionStorage.clear(); localStorage.setItem('vanguard-lang-v1', JSON.stringify({state:{lang:'es',autoDetected:false},version:0})); return 'perfil-limpio-es'; })()" >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 6

echo "── A) EL HOME FIRMA LA RONDA ──"
despertar
sleep 2
FIRMA=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('v363.0') ? 'VERSION✓' : 'VERSION✗') + '|' + (T.includes('EL ÁLBUM ILUSTRADO') ? 'CODENAME✓' : 'CODENAME✗') + '|' + (T.length > 500 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "firma: $FIRMA"
agent-browser screenshot /tmp/render/qa363-home.png >/dev/null 2>&1

echo "── B) EL LANZADOR VISTE LA CASA: 18 tiles ilustrados ──"
despertar
agent-browser eval "(() => { const L = document.querySelector('button[aria-label=\"Aplicaciones de Vanguard\"]'); if (L) L.click(); return 'launcher'; })()" >/dev/null 2>&1
sleep 2
LANZ=$(agent-browser eval "(() => {
  const tiles = Array.from(document.querySelectorAll('.app-tile'));
  const conIlu = tiles.filter(t => {
    const s = Array.from(t.querySelectorAll('span')).find(x => (x.getAttribute('style') || '').includes('background-image'));
    return !!s;
  }).length;
  return (tiles.length === 18 ? 'TILES-18✓' : 'TILES✗' + tiles.length) + '|' + (conIlu === 18 ? 'ILUSTRADOS-18✓' : 'ILUSTRADOS✗' + conIlu);
})()" 2>/dev/null | tr -d '"')
echo "lanzador: $LANZ"
agent-browser screenshot /tmp/render/qa363-launcher.png >/dev/null 2>&1
agent-browser eval "(() => { document.querySelector('[aria-label=\"Cerrar\"]')?.click(); return 'cerrado'; })()" >/dev/null 2>&1
sleep 1

echo "── C) EL ÁLBUM: tres familias en la colección ──"
irPestana "INICIO" "LA COLECCIÓN DE GUERRA"
ALBUM=$(agent-browser eval "(() => {
  const T = document.body.innerText.toUpperCase();
  const fam = document.querySelector('[data-testid=\"album-familias\"]');
  const botones = fam ? fam.querySelectorAll('button').length : 0;
  return (T.includes('LA COLECCIÓN DE GUERRA') ? 'PANEL✓' : 'PANEL✗') + '|' + (fam ? 'FAMILIAS✓' : 'FAMILIAS✗') + '|' + (botones === 3 ? 'TRES✓' : 'TRES✗' + botones) + '|' + (T.includes('CONFLICTOS · 11') ? 'CONFLICTOS-11✓' : 'CONFLICTOS✗') + '|' + (T.includes('LÍDERES · 34') ? 'LIDERES-34✓' : 'LIDERES✗') + '|' + (T.includes('HISTORIA · 10') ? 'HISTORIA-10✓' : 'HISTORIA✗');
})()" 2>/dev/null | tr -d '"')
echo "álbum: $ALBUM"
agent-browser screenshot /tmp/render/qa363-album.png >/dev/null 2>&1

echo "── D) LÍDERES: sellados → el escáner revela un expediente real ──"
agent-browser eval "(() => { const b = document.querySelector('[data-testid=\"album-familia-lideres\"]'); if (b) b.click(); return 'lideres'; })()" >/dev/null 2>&1
sleep 2
SELLADOS=$(agent-browser eval "(() => {
  const T = document.body.innerText.toUpperCase();
  const grid = document.querySelector('[data-testid=\"album-lideres\"]');
  const cartas = grid ? grid.querySelectorAll('[data-testid^=\"ficha-lider-\"]').length : 0;
  return (T.includes('EXPEDIENTE SELLADO') ? 'SELLADOS✓' : 'SELLADOS✗') + '|' + (cartas === 34 ? 'CARTAS-34✓' : 'CARTAS✗' + cartas) + '|' + (T.includes('PODER ≥95') ? 'REGLA✓' : 'REGLA✗');
})()" 2>/dev/null | tr -d '"')
echo "sellados: $SELLADOS"
agent-browser eval "(() => { const b = document.querySelector('[data-testid=\"escaner-lideres\"]'); if (b) b.click(); return 'escaner'; })()" >/dev/null 2>&1
sleep 2
REVELA=$(agent-browser eval "(() => {
  const T = document.body.innerText.toUpperCase();
  const dlg = Array.from(document.querySelectorAll('[role=\"dialog\"]')).find(d => d.innerText.includes('VG-P-'));;
  return (T.includes('DESCUBIERTA — VG-P-') || T.includes('CARTA VG-P-') ? 'TOAST✓' : 'TOAST✗') + '|' + (dlg && dlg.innerText.includes('PODER') ? 'DETALLE✓' : 'DETALLE✗') + '|' + (dlg && (dlg.innerText.includes('MANDATO') || dlg.innerText.includes('FRASE')) ? 'EXPEDIENTE✓' : 'EXPEDIENTE✗');
})()" 2>/dev/null | tr -d '"')
echo "escáner: $REVELA"
agent-browser screenshot /tmp/render/qa363-lider-detalle.png >/dev/null 2>&1
agent-browser eval "(() => { const bs = Array.from(document.querySelectorAll('[aria-label]')).filter(b => b.getAttribute('aria-label').startsWith('Cerrar expediente')); bs.forEach(b => b.click()); return 'cerrado'; })()" >/dev/null 2>&1
sleep 1
PROGRESO=$(agent-browser eval "(() => { const p = document.querySelector('[data-testid=\"album-lideres-progreso\"]'); return p ? 'PROGRESO✓ ' + p.innerText : 'PROGRESO✗'; })()" 2>/dev/null | tr -d '"')
echo "progreso: $PROGRESO"

echo "── E) HISTORIA: el escáner del archivo revela una guerra ──"
agent-browser eval "(() => { const b = document.querySelector('[data-testid=\"album-familia-historia\"]'); if (b) b.click(); return 'historia'; })()" >/dev/null 2>&1
sleep 2
HIST=$(agent-browser eval "(() => {
  const T = document.body.innerText.toUpperCase();
  const grid = document.querySelector('[data-testid=\"album-historia\"]');
  const cartas = grid ? grid.querySelectorAll('[data-testid^=\"ficha-historia-\"]').length : 0;
  return (T.includes('SIGLO SELLADO') ? 'SELLADAS✓' : 'SELLADAS✗') + '|' + (cartas === 10 ? 'CARTAS-10✓' : 'CARTAS✗' + cartas) + '|' + (T.includes('≥100 AÑOS') ? 'REGLA✓' : 'REGLA✗');
})()" 2>/dev/null | tr -d '"')
echo "historia: $HIST"
agent-browser eval "(() => { const b = document.querySelector('[data-testid=\"escaner-historia\"]'); if (b) b.click(); return 'escaner'; })()" >/dev/null 2>&1
sleep 2
REVELAH=$(agent-browser eval "(() => {
  const dlg = Array.from(document.querySelectorAll('[role=\"dialog\"]')).find(d => d.innerText.includes('VG-H-'));;
  const T = document.body.innerText.toUpperCase();
  return (T.includes('VG-H-') ? 'SERIE✓' : 'SERIE✗') + '|' + (dlg && (dlg.innerText.toUpperCase().includes('DESENLACE') || dlg.innerText.toUpperCase().includes('BANDOS')) ? 'FICHA✓' : 'FICHA✗');
})()" 2>/dev/null | tr -d '"')
echo "escáner-archivo: $REVELAH"
agent-browser screenshot /tmp/render/qa363-historia-detalle.png >/dev/null 2>&1
agent-browser eval "(() => { const bs = Array.from(document.querySelectorAll('[aria-label]')).filter(b => b.getAttribute('aria-label').startsWith('Cerrar conflicto')); bs.forEach(b => b.click()); return 'cerrado'; })()" >/dev/null 2>&1
sleep 1

echo "── F) LA MÁQUINA SIGUE VIVA: el teatro y el atlas no se rompieron ──"
agent-browser eval "(() => { const L = document.querySelector('button[aria-label=\"Aplicaciones de Vanguard\"]'); if (L) L.click(); return 'launcher'; })()" >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const tile = Array.from(document.querySelectorAll('.app-tile')).find(t => t.innerText.trim().toUpperCase() === 'INTELIGENCIA'); if (tile) tile.click(); return 'tile'; })()" >/dev/null 2>&1
sleep 2
agent-browser eval "(() => { const pill = Array.from(document.querySelectorAll('.vg170-riel-pill')).find(p => p.innerText.includes('MÁQUINA DEL TIEMPO')); if (pill) pill.click(); return 'riel'; })()" >/dev/null 2>&1
sleep 5
MAQ=$(agent-browser eval "(() => {
  const T = document.body.innerText.toUpperCase();
  const chips = document.querySelectorAll('[data-testid^=\"maquina-chip-mundo-\"]').length;
  const barras = document.querySelectorAll('[data-testid^=\"maquina-atlas-barra-\"]').length;
  return (T.includes('MÁQUINA DEL TIEMPO') ? 'PANEL✓' : 'PANEL✗') + '|' + (chips === 6 ? 'CHIPS-6✓' : 'CHIPS✗' + chips) + '|' + (barras === 10 ? 'ATLAS-10✓' : 'ATLAS✗' + barras);
})()" 2>/dev/null | tr -d '"')
echo "máquina: $MAQ"
# el cruce: abrir la ficha de una guerra del atlas la DESCUBRE en el álbum
agent-browser eval "(() => { const b = document.querySelector('[data-testid=\"maquina-atlas-barra-0\"]'); if (b) b.click(); return 'ficha'; })()" >/dev/null 2>&1
sleep 1
CRUZ=$(agent-browser eval "(() => { const T = document.body.innerText.toUpperCase(); return T.includes('CARTA VG-H-01 DESCUBIERTA') || T.includes('VG-H-01') ? 'ATLAS-DESCUBRE✓' : 'ATLAS-DESCUBRE✗'; })()" 2>/dev/null | tr -d '"')
echo "cruce-atlas: $CRUZ"

echo "── G) MÓVIL 390: el álbum y el lanzador sin desbordes ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 6
despertar
sleep 1
agent-browser eval "(() => { localStorage.setItem('vanguard-lang-v1', JSON.stringify({state:{lang:'es',autoDetected:false},version:0})); return 'es'; })()" >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 5
despertar
irPestana "INICIO" "LA COLECCIÓN DE GUERRA"
agent-browser eval "(() => { const b = document.querySelector('[data-testid=\"album-familia-lideres\"]'); if (b) b.click(); return 'lideres'; })()" >/dev/null 2>&1
sleep 2
MOVIL=$(agent-browser eval "(() => {
  const d = document.documentElement;
  const fam = document.querySelector('[data-testid=\"album-familias\"]');
  return (d.scrollWidth <= window.innerWidth + 2 ? 'SIN-DESBORDE✓' : 'DESBORDE✗ ' + d.scrollWidth) + '|' + (fam ? 'FAMILIAS✓' : 'FAMILIAS✗');
})()" 2>/dev/null | tr -d '"')
echo "móvil-álbum: $MOVIL"
agent-browser screenshot /tmp/render/qa363-movil.png >/dev/null 2>&1
agent-browser eval "(() => { const L = document.querySelector('button[aria-label=\"Aplicaciones de Vanguard\"]'); if (L) L.click(); return 'launcher'; })()" >/dev/null 2>&1
sleep 2
MOVIL2=$(agent-browser eval "(() => { const d = document.documentElement; return d.scrollWidth <= window.innerWidth + 2 ? 'SIN-DESBORDE✓' : 'DESBORDE✗ ' + d.scrollWidth; })()" 2>/dev/null | tr -d '"')
echo "móvil-lanzador: $MOVIL2"
agent-browser screenshot /tmp/render/qa363-movil-launcher.png >/dev/null 2>&1

echo "── H) HIGIENE: consola, errores, zombis, canon ──"
CONSOLA=$(agent-browser console 2>/dev/null | rg -i "error" | rg -v "401|429|favicon|3620|websocket|socket" | head -3)
ERRORES=$(agent-browser errors 2>/dev/null | head -3)
echo "consola: ${CONSOLA:-limpia}"
echo "errores: ${ERRORES:-ninguno}"

matar
sleep 1
VIVO=$(ss -ltn 2>/dev/null | grep -c ":$PORT ")
echo "zombis-puerto: $VIVO (esperado 0)"
rm -f db/custom.db-wal db/custom.db-shm
git checkout HEAD -- db/custom.db 2>/dev/null
CANON=$(md5sum db/custom.db | cut -d' ' -f1)
echo "canon: $CANON (esperado 38121cfce2148acecbc47cca61c8b062)"
CANON2=$(md5sum db/custom.db | cut -d' ' -f1)
[ "$CANON" = "$CANON2" ] && echo "doble lectura: ESTABLE" || echo "doble lectura: DRIFT!"
echo "QA-V363 FIN"
