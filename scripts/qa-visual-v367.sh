#!/bin/bash
# QA VISUAL v367 — EL IMÁN GLOBAL (mandato del Dueño: «agrega estos tipos de
# navegación en TODO Vanguard, funcióanlo todo y haz Vanguard hermosamente
# adictivo»). El guion que importa: ① LA FRANJA DEL IMÁN EN LA PORTADA —
# iman-casa con deber/escalón/colección de números REALES + EL BONO EN UN
# TOQUE (se cobra desde la portada, una vez, y la cátedra lo sabe); ② EL
# PUENTE — la madriguera cruza la casa: ficha de la biblioteca salta AL
# ÁLBUM (Estados Unidos→LÍDERES) y carta del álbum (escáner) salta a la
# biblioteca CON la ficha abierta; ③ LAS BARRAS del álbum («SOLO TE FALTAN
# N»). TODO lo de v366 sigue en pie: la madriguera interna, el bono de la
# cátedra, el escalón, el examen de todos, la carta OBLIGATORIA (abre sola,
# fondo no cierra, sello feo), el arsenal de 44 y la sala secreta. Móvil 390
# sin desbordes y canon restaurado por el ritual de la casa (muerte POR
# PUERTO). Ley v302: arranque + verificación + cierre en UNA llamada. La
# ruta al panel es LAUNCHER → TILE DE SECCIÓN → PÍLDORA DEL RIEL, y el
# perfil limpio despierta en EN — el arnés siembra el idioma ES (v132).
set -u
PORT=3660
BASE="http://localhost:$PORT"
mkdir -p /tmp/render
cd /home/z/my-project

matar() { local P=$(ss -ltnp 2>/dev/null | grep ":$PORT " | grep -oP 'pid=\K[0-9]+' | head -1); [ -n "$P" ] && kill -9 "$P" 2>/dev/null; return 0; }

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

PORT=$PORT NODE_ENV=production bun .next/standalone/server.js > /tmp/srv-qa367.log 2>&1 &
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

echo "── A) EL HOME FIRMA LA RONDA + LA FRANJA DEL IMÁN ──"
despertar
sleep 2
FIRMA=$(agent-browser eval "(() => { const T = document.body.innerText; return (T.includes('v367.0') ? 'VERSION✓' : 'VERSION✗') + '|' + (T.includes('EL IMÁN GLOBAL') ? 'CODENAME✓' : 'CODENAME✗') + '|' + (T.length > 500 ? 'CASA✓' : 'CASA✗'); })()" 2>/dev/null | tr -d '"')
echo "firma: $FIRMA"
FRANJA=$(agent-browser eval "(() => {
  const f = document.querySelector('[data-testid=\"iman-casa\"]');
  if (!f) return 'SIN-FRANJA';
  const T = f.innerText.toUpperCase();
  const deber = !!document.querySelector('[data-testid=\"iman-deber\"]');
  const escalon = !!document.querySelector('[data-testid=\"iman-escalon\"]');
  const coleccion = !!document.querySelector('[data-testid=\"iman-coleccion\"]');
  const bono = !!document.querySelector('[data-testid=\"iman-bono\"]');
  const caduca = T.includes('CADUCAN EN');
  const faltan = T.includes('SOLO TE FALTAN');
  const selladas = T.includes('SELLADAS TE ESPERAN');
  return (deber && escalon && coleccion ? 'PUERTAS-3✓' : 'PUERTAS✗') + '|' + (T.includes('EL IMÁN DE LA CASA') ? 'TITULO✓' : 'TITULO✗') + '|' + (caduca ? 'CADUCIDAD✓' : 'CADUCIDAD✗') + '|' + (faltan ? 'ESCALON✓' : 'ESCALON✗') + '|' + (selladas ? 'COLECCION✓' : 'COLECCION✗') + '|' + (bono ? 'BONO-VIVO✓' : 'BONO✗');
})()" 2>/dev/null | tr -d '"')
echo "franja-imán: $FRANJA"
agent-browser screenshot /tmp/render/qa367-home.png >/dev/null 2>&1

echo "── A2) EL BONO EN UN TOQUE: se cobra DESDE la portada, UNA vez ──"
agent-browser eval "(() => { const b = document.querySelector('[data-testid=\"iman-bono\"]'); if (b) b.click(); return 'cobrado'; })()" >/dev/null 2>&1
sleep 1.5
BONOPORTADA=$(agent-browser eval "(() => {
  const hecho = document.querySelector('[data-testid=\"iman-bono-hecho\"]');
  const btn = document.querySelector('[data-testid=\"iman-bono\"]');
  const T = document.body.innerText;
  const toast = T.includes('BONO DEL ARCHIVO');
  return (hecho && hecho.innerText.includes('COBRADO HOY') ? 'BONO-COBRA✓' : 'BONO✗') + '|' + (!btn ? 'BONO-UNA-VEZ✓' : 'BONO-RECLAMABLE✗') + '|' + (toast ? 'BONO-TOAST✓' : 'BONO-TOAST✗');
})()" 2>/dev/null | tr -d '"')
echo "bono-portada: $BONOPORTADA"
agent-browser screenshot /tmp/render/qa367-bono-portada.png >/dev/null 2>&1

echo "── B) LA RUTA A LA BIBLIOTECA: launcher → ARCHIVO → píldora ──"
despertar
irPestana "ARCHIVO" "GRAN BIBLIOTECA"
BIBLIO=$(agent-browser eval "(() => {
  const T = document.body.innerText.toUpperCase();
  const salas = document.querySelector('[data-testid=\"biblio-salas\"]');
  const chips = salas ? salas.querySelectorAll('button').length : 0;
  return (T.includes('LA GRAN BIBLIOTECA') ? 'PANEL✓' : 'PANEL✗') + '|' + (chips === 4 ? 'SALAS-4✓' : 'SALAS✗' + chips) + '|' + (T.includes('CONSTITUCIONES (99)') ? 'CARTAS-99✓' : 'CARTAS✗') + '|' + (T.includes('ARSENAL (44)') ? 'ARSENAL-44✓' : 'ARSENAL✗');
})()" 2>/dev/null | tr -d '"')
echo "biblioteca: $BIBLIO"

echo "── C) LA CÁTEDRA SABE DEL BONO COBRADO DESDE LA PORTADA ──"
CATEDRA=$(agent-browser eval "(() => {
  const T = document.body.innerText;
  const TU = T.toUpperCase();
  const misiones = document.querySelectorAll('[data-testid=\"catedra-mision\"]').length;
  const bonoMonto = document.querySelector('[data-testid=\"catedra-bono-monto\"]');
  const cobrado = bonoMonto && bonoMonto.innerText.toUpperCase().includes('COBRADO HOY');
  const comun = document.querySelector('[data-testid=\"biblio-examen-comun\"]');
  return (misiones === 3 ? 'MISIONES-3✓' : 'MISIONES✗' + misiones) + '|' + (cobrado ? 'BONO-CRUZADO✓' : 'BONO✗') + '|' + (comun && comun.innerText.includes('EL MISMO EXAMEN PARA TODA LA ESCUELA') ? 'EXAMEN-COMUN✓' : 'EXAMEN✗');
})()" 2>/dev/null | tr -d '"')
echo "cátedra: $CATEDRA"

echo "── D) LA CARTA OBLIGATORIA: se abre sola, el fondo no cierra ──"
CARTA=$(agent-browser eval "(() => {
  const c = document.querySelector('[data-testid=\"carta-deber\"]');
  if (!c) return 'SIN-CARTA';
  const botones = c.querySelectorAll('button').length;
  const fondo = c.parentElement;
  fondo.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  const sigue = !!document.querySelector('[data-testid=\"carta-deber\"]');
  return (botones === 1 ? 'UNICO-BOTON✓' : 'BOTONES✗' + botones) + '|' + (sigue ? 'FONDO-NO-CIERRA✓' : 'FONDO-CIERRA✗');
})()" 2>/dev/null | tr -d '"')
echo "carta-obligatoria: $CARTA"
agent-browser eval "(() => { const b = document.querySelector('[data-testid=\"carta-boton\"]'); if (b) b.click(); return 'cerrada'; })()" >/dev/null 2>&1
sleep 1

echo "── E) BUSCAR → FICHA ELEGANTE (España 1978) + MADRIGUERA INTERNA ──"
agent-browser eval "(() => {
  const i = document.querySelector('[data-testid=\"biblio-buscar\"]');
  if (!i) return 'sin-buscar';
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(i, 'España');
  i.dispatchEvent(new Event('input', { bubbles: true }));
  i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  return 'buscado';
})()" >/dev/null 2>&1
sleep 1.5
agent-browser eval "(() => { const c = document.querySelector('[data-testid=\"biblio-carta\"]'); if (c) c.click(); return 'ficha'; })()" >/dev/null 2>&1
sleep 1.5
FICHA=$(agent-browser eval "(() => {
  const f = document.querySelector('[data-testid=\"biblio-ficha\"]');
  const saltos = f ? f.querySelectorAll('[data-testid=\"ficha-salto\"]').length : 0;
  const T = document.body.innerText;
  return (f ? 'MODAL✓' : 'MODAL✗') + '|' + (saltos >= 2 ? 'MADRIGUERA-' + saltos + '✓' : 'MADRIGUERA✗' + saltos) + '|' + (T.includes('FICHA NUEVA EN TU EXPEDIENTE') ? 'XP-TOAST✓' : 'XP-TOAST✗') + '|' + (!document.querySelector('[data-testid=\"ficha-album-zona\"]') ? 'SIN-ALBUM-HONESTO✓' : 'ALBUM✗');
})()" 2>/dev/null | tr -d '"')
echo "ficha-España: $FICHA"
agent-browser eval "(() => { document.querySelector('[aria-label=\"Cerrar ficha\"]')?.click(); return 'cerrado'; })()" >/dev/null 2>&1
sleep 1
agent-browser eval "(() => { const i = document.querySelector('[data-testid=\"biblio-buscar\"]'); if (i) { const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set; setter.call(i, ''); i.dispatchEvent(new Event('input', { bubbles: true })); } return 'limpio'; })()" >/dev/null 2>&1
sleep 1

echo "── E3) EL PUENTE IDA: ficha de EE.UU. salta AL ÁLBUM (LÍDERES) ──"
agent-browser eval "(() => {
  const i = document.querySelector('[data-testid=\"biblio-buscar\"]');
  if (!i) return 'sin-buscar';
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(i, 'Estados Unidos');
  i.dispatchEvent(new Event('input', { bubbles: true }));
  return 'buscado';
})()" >/dev/null 2>&1
sleep 1.5
agent-browser eval "(() => { const c = document.querySelector('[data-testid=\"biblio-carta\"]'); if (c) c.click(); return 'ficha'; })()" >/dev/null 2>&1
sleep 1.5
ZONA=$(agent-browser eval "(() => {
  const z = document.querySelector('[data-testid=\"ficha-album-zona\"]');
  const b = document.querySelector('[data-testid=\"ficha-salto-album\"]');
  const T = z ? z.innerText.toUpperCase() : '';
  return (z ? 'ZONA✓' : 'ZONA✗') + '|' + (T.includes('LA MADRIGUERA CRUZA LA CASA') ? 'PORQUE✓' : 'PORQUE✗') + '|' + (b ? 'SALTO-VIVO✓' : 'SALTO✗');
})()" 2>/dev/null | tr -d '"')
echo "zona-álbum: $ZONA"
agent-browser screenshot /tmp/render/qa367-zona-album.png >/dev/null 2>&1
agent-browser eval "(() => { const b = document.querySelector('[data-testid=\"ficha-salto-album\"]'); if (b) b.click(); return 'saltando'; })()" >/dev/null 2>&1
sleep 3
ATERRIZA=$(agent-browser eval "(() => {
  const lideres = document.querySelector('[data-testid=\"album-familia-lideres\"]');
  const grid = document.querySelector('[data-testid=\"album-lideres\"]');
  const activo = lideres && lideres.getAttribute('aria-pressed') === 'true';
  const barra = !!document.querySelector('[data-testid=\"album-lideres-barra\"]');
  return (activo ? 'FAMILIA-LIDERES✓' : 'FAMILIA✗') + '|' + (grid ? 'GRID-VIVO✓' : 'GRID✗') + '|' + (barra ? 'BARRA✓' : 'BARRA✗');
})()" 2>/dev/null | tr -d '"')
echo "puente-ida: $ATERRIZA"
agent-browser screenshot /tmp/render/qa367-puente-ida.png >/dev/null 2>&1

echo "── F) EL PUENTE VUELTA: escáner revela carta → salta a la biblioteca CON ficha abierta ──"
agent-browser eval "(() => { const b = document.querySelector('[data-testid=\"escaner-lideres\"]'); if (b) b.click(); return 'escaner'; })()" >/dev/null 2>&1
sleep 2
DETALLE=$(agent-browser eval "(() => {
  const saltos = document.querySelectorAll('[data-testid=\"carta-salto\"]').length;
  const zona = document.querySelector('[data-testid=\"carta-saltos\"]');
  const T = zona ? zona.innerText.toUpperCase() : '';
  return (saltos >= 1 ? 'SALTOS-' + saltos + '✓' : 'SALTOS✗' + saltos) + '|' + (T.includes('LA MADRIGUERA DEL ÁLBUM') ? 'ZONA✓' : 'ZONA✗');
})()" 2>/dev/null | tr -d '"')
echo "detalle-lider: $DETALLE"
agent-browser screenshot /tmp/render/qa367-carta-saltos.png >/dev/null 2>&1
agent-browser eval "(() => { const b = document.querySelector('[data-testid=\"carta-salto\"]'); if (b) b.click(); return 'saltando'; })()" >/dev/null 2>&1
sleep 3
VUELTA=$(agent-browser eval "(() => {
  const f = document.querySelector('[data-testid=\"biblio-ficha\"]');
  const sala = document.querySelector('[data-testid=\"biblio-sala-constituciones\"]');
  const activa = sala && sala.className.includes('bg-amber-hud');
  const T = f ? f.innerText.toUpperCase() : '';
  // el pago es ÚNICO (ley v364): si la ficha ya estaba en el expediente,
  // no hay toast — pero el modal la reconoce como SUYA. Ambas son verdad.
  const xp = document.body.innerText.includes('FICHA NUEVA EN TU EXPEDIENTE');
  const ya = T.includes('EN TU EXPEDIENTE DESDE');
  return (f ? 'FICHA-ABIERTA✓' : 'FICHA✗') + '|' + (activa ? 'SALA-CONST✓' : 'SALA✗') + '|' + ((xp || ya) ? 'XP-HONESTO✓' : 'XP✗');
})()" 2>/dev/null | tr -d '"')
echo "puente-vuelta: $VUELTA"
agent-browser screenshot /tmp/render/qa367-puente-vuelta.png >/dev/null 2>&1
agent-browser eval "(() => { document.querySelector('[aria-label=\"Cerrar ficha\"]')?.click(); return 'cerrado'; })()" >/dev/null 2>&1
sleep 1

echo "── G) EL ARSENAL: 44 dossiers y su salto al álbum ──"
agent-browser eval "(() => { const b = document.querySelector('[data-testid=\"biblio-sala-arsenal\"]'); if (b) b.click(); return 'arsenal'; })()" >/dev/null 2>&1
sleep 2
ARSENAL=$(agent-browser eval "(() => {
  const cartas = document.querySelectorAll('[data-testid=\"biblio-carta\"]').length;
  const T = document.body.innerText.toUpperCase();
  return (cartas === 44 ? 'DOSSIERS-44✓' : 'DOSSIERS✗' + cartas) + '|' + (T.includes('ARCHIVO ESCOLAR: CONSECUENCIAS, NO RECETAS') ? 'REGLA✓' : 'REGLA✗');
})()" 2>/dev/null | tr -d '"')
echo "arsenal: $ARSENAL"
agent-browser eval "(() => {
  const i = document.querySelector('[data-testid=\"biblio-buscar\"]');
  if (!i) return 'sin-buscar';
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(i, 'Manhattan');
  i.dispatchEvent(new Event('input', { bubbles: true }));
  return 'buscado';
})()" >/dev/null 2>&1
sleep 1.5
agent-browser eval "(() => { const c = document.querySelector('[data-testid=\"biblio-carta\"]'); if (c) c.click(); return 'ficha'; })()" >/dev/null 2>&1
sleep 1.5
FICHAARMA=$(agent-browser eval "(() => {
  const f = document.querySelector('[data-testid=\"biblio-ficha\"]');
  const album = !!document.querySelector('[data-testid=\"ficha-salto-album\"]');
  const T = f ? f.innerText.toUpperCase() : '';
  return (f ? 'MODAL✓' : 'MODAL✗') + '|' + (T.includes('POR QUÉ CAMBIÓ EL MUNDO') ? 'PORQUE✓' : 'PORQUE✗') + '|' + (album ? 'ALBUM-VIVO✓' : 'ALBUM✗');
})()" 2>/dev/null | tr -d '"')
echo "ficha-arsenal: $FICHAARMA"
agent-browser eval "(() => { document.querySelector('[aria-label=\"Cerrar ficha\"]')?.click(); return 'cerrado'; })()" >/dev/null 2>&1
sleep 1

echo "── H) EL EXAMEN DEL DÍA: 6 preguntas ──"
agent-browser eval "(() => { const b = document.querySelector('[data-testid=\"biblio-examen\"]'); if (b) b.click(); return 'examen'; })()" >/dev/null 2>&1
sleep 1
PREGUNTAS=$(agent-browser eval "(() => {
  const ps = document.querySelectorAll('[data-testid=\"examen-pregunta\"]').length;
  return (ps === 6 ? 'PREGUNTAS-6✓' : 'PREGUNTAS✗' + ps);
})()" 2>/dev/null | tr -d '"')
echo "examen: $PREGUNTAS"

echo "── I) LA SALA SECRETA: intacta ──"
agent-browser eval "(() => { const b = document.querySelector('[data-testid=\"biblio-sala-secreta\"]'); if (b) b.click(); return 'secreta'; })()" >/dev/null 2>&1
sleep 2
SECRETA=$(agent-browser eval "(() => {
  const T = document.body.innerText.toUpperCase();
  return (T.includes('BIBLIOTECA SECRETA') ? 'SECRETA✓' : 'SECRETA✗') + '|' + (T.includes('DOCUMENTO DEL DÍA') ? 'ANILLO✓' : 'ANILLO✗');
})()" 2>/dev/null | tr -d '"')
echo "secreta: $SECRETA"

echo "── J) MÓVIL 390: la portada con el imán y la biblioteca sin desbordes ──"
agent-browser set viewport 390 844 >/dev/null 2>&1
# la casa restaura la ÚLTIMA SALA activa (v112, función del Dueño) — el arnés
# limpia el recuerdo para mirar la PORTADA desde cero, como un visitante nuevo
agent-browser eval "(() => { localStorage.clear(); sessionStorage.clear(); localStorage.setItem('vanguard-lang-v1', JSON.stringify({state:{lang:'es',autoDetected:false},version:0})); return 'perfil-limpio-es'; })()" >/dev/null 2>&1
agent-browser open "$BASE/" >/dev/null 2>&1
sleep 7
despertar
sleep 2
MOVILHOME=$(agent-browser eval "(() => {
  const d = document.documentElement;
  const franja = !!document.querySelector('[data-testid=\"iman-casa\"]');
  return (d.scrollWidth <= window.innerWidth + 2 ? 'SIN-DESBORDE✓' : 'DESBORDE✗ ' + d.scrollWidth) + '|' + (franja ? 'IMAN-CASA✓' : 'IMAN✗');
})()" 2>/dev/null | tr -d '"')
echo "móvil-portada: $MOVILHOME"
irPestana "ARCHIVO" "GRAN BIBLIOTECA"
MOVIL=$(agent-browser eval "(() => {
  const d = document.documentElement;
  const cat = document.querySelector('[data-testid=\"biblio-catedra\"]');
  return (d.scrollWidth <= window.innerWidth + 2 ? 'SIN-DESBORDE✓' : 'DESBORDE✗ ' + d.scrollWidth) + '|' + (cat ? 'CATEDRA✓' : 'CATEDRA✗');
})()" 2>/dev/null | tr -d '"')
echo "móvil-biblioteca: $MOVIL"
agent-browser screenshot /tmp/render/qa367-movil.png >/dev/null 2>&1

echo "── K) HIGIENE: consola, errores, zombis, canon ──"
CONSOLA=$(agent-browser console 2>/dev/null | rg -i "error" | rg -v "401|429|favicon|3660|websocket|socket" | head -3)
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
echo "QA-V367 FIN"
