#!/usr/bin/env python3
# ═══════════════════════════════════════════════════════════════════
# v416.2 · QA DE NAVEGADOR — el aro de control de VANGUARD
# Departamento 10 · INGENIERÍA Y CALIDAD
#
# Mide en un navegador de verdad (Chromium sin cabeza) lo que ninguna
# prueba de HTTP puede ver: consola, peticiones fallidas, desbordes
# horizontales, paneles que se salen de la pantalla, textos por debajo de
# 12 px, objetivos táctiles por debajo de 24×24, imágenes rotas, CLS y
# tareas largas que dejan el hilo principal sin aire.
#
#   python3 scripts/qa-navegador.py                     # móvil, puertas de la casa
#   python3 scripts/qa-navegador.py --vista todas       # móvil + tableta + escritorio
#   python3 scripts/qa-navegador.py --json qa.json      # deja el acta legible por máquina
#   python3 scripts/qa-navegador.py --comparar qa.json  # ¿qué empeoró desde la última acta?
#   python3 scripts/qa-navegador.py --lento             # CPU 4× más lenta (teléfono económico)
#
# Requisitos: python3 -m pip install playwright && python3 -m playwright install chromium
# Sale con código 1 si alguna comprobación bloqueante falla (para la cadena de
# publicación). No arregla nada: mide. Los arreglos van en src/ y se vuelven a
# medir con este mismo aro.
# ═══════════════════════════════════════════════════════════════════
import argparse, asyncio, json, os, sys, time
from playwright.async_api import async_playwright

BASE_POR_DEFECTO = "https://vanguard-kq9r.vercel.app"

# Puertas de la casa: una por familia de módulo, no las 2.649 del sitemap.
# La lista es el CONTROL: se repite entera después de cada actualización.
PUERTAS = [
    "/", "/modulos", "/modo", "/perfil", "/estado", "/privacidad",
    "/cronica", "/en-vivo", "/conflictos", "/guerra-hoy", "/mundo",
    "/mapas", "/atlas", "/universo", "/teatro-3d", "/zona-cero",
    "/editorial", "/rankings", "/directorio", "/herramientas", "/galeria",
    "/datos", "/datos-mundiales", "/datos-mundiales/comparar", "/datos-mundiales/panel",
    "/comparador", "/demografia", "/divisas", "/traductor",
    "/espacio", "/navegacion", "/arquitectura", "/conocimiento", "/historia",
    "/investigacion", "/labs", "/colecciones", "/servicios", "/creadores",
]

VISTAS = {
    "movil": {"width": 360, "height": 740, "device_scale_factor": 2, "is_mobile": True, "has_touch": True},
    "tablet": {"width": 768, "height": 1024, "device_scale_factor": 2, "is_mobile": True, "has_touch": True},
    "escritorio": {"width": 1366, "height": 768, "device_scale_factor": 1, "is_mobile": False, "has_touch": False},
}
UA_MOVIL = ("Mozilla/5.0 (Linux; Android 14; SM-A065F) AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/130 Mobile Safari/537.36")
UA_ESCRITORIO = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
                 "Chrome/130 Safari/537.36")

# ── lo que se ejecuta dentro de la página ───────────────────────────
INIT = """() => {
  window.__qa = { cls: 0, clsItems: [], largas: [], lcp: 0, fcp: 0 };
  try {
    new PerformanceObserver(l => {
      for (const e of l.getEntries()) {
        if (!e.hadRecentInput) { window.__qa.cls += e.value; window.__qa.clsItems.push({v: +e.value.toFixed(4), t: Math.round(e.startTime)}); }
      }
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.__qa.largas.push(Math.round(e.duration)); })
      .observe({ type: 'longtask', buffered: true });
    new PerformanceObserver(l => { const e = l.getEntries(); window.__qa.lcp = Math.round(e[e.length - 1].startTime); })
      .observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') window.__qa.fcp = Math.round(e.startTime); })
      .observe({ type: 'paint', buffered: true });
  } catch (e) {}
}"""

MEDIR = """() => {
  const qa = window.__qa || {cls: 0, clsItems: [], largas: [], lcp: 0, fcp: 0};
  const vw = innerWidth, vh = innerHeight;
  const visible = e => { const s = getComputedStyle(e); const b = e.getBoundingClientRect();
    return s.display !== 'none' && s.visibility !== 'hidden' && +s.opacity > 0.01 && b.width > 0 && b.height > 0; };
  const nodo = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') +
    (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\\s+/)[0] : '');

  // 1 · desborde del documento
  const desborde = document.documentElement.scrollWidth - vw;

  // 2 · elementos que se salen por la derecha (ignorando contenedores que recortan)
  const recorta = e => { let p = e.parentElement;
    while (p && p !== document.body) { const s = getComputedStyle(p);
      if (['hidden', 'auto', 'scroll', 'clip'].includes(s.overflowX)) return true; p = p.parentElement; }
    return false; };
  const salidos = [...document.querySelectorAll('body *')].filter(e => {
    if (!visible(e) || recorta(e)) return false;
    const b = e.getBoundingClientRect();
    return b.right > vw + 2 && b.left < vw && !e.closest('[aria-hidden=true]');
  }).slice(0, 8).map(e => nodo(e) + ' r=' + Math.round(e.getBoundingClientRect().right));

  // 3 · paneles flotantes (menús, ventanas) que no caben o no se pueden recorrer
  // Solo lo que de verdad flota sobre la página: diálogos, cajones y barras fijas.
  // Un «panel» dentro de un carrusel horizontal que se sale por la derecha NO es
  // un defecto: es el carrusel. Se exige que el elemento flote (fixed/sticky) o
  // que sea un diálogo declarado.
  const flota = e => { const s = getComputedStyle(e);
    return ['fixed', 'sticky'].includes(s.position) || e.matches('[role=dialog], dialog[open], [aria-modal=true]') || !!e.closest('[role=dialog], [aria-modal=true]'); };
  const paneles = [...document.querySelectorAll('[role=dialog], dialog[open], [aria-modal=true], [class*=cajon], [class*=drawer], [class*=menu], [class*=hud]')]
    .filter(e => visible(e) && flota(e)).map(e => { const b = e.getBoundingClientRect(); const s = getComputedStyle(e);
      return { n: nodo(e), w: Math.round(b.width), h: Math.round(b.height),
        fuera: Math.round(Math.max(0, b.right - vw)) + Math.round(Math.max(0, b.bottom - vh)) + Math.round(Math.max(0, -b.left)),
        recortado: e.scrollHeight > e.clientHeight + 4 && !['auto', 'scroll'].includes(s.overflowY) }; })
    .filter(p => p.fuera > 2 || p.recortado);

  // 4 · imágenes
  const imgs = [...document.images];
  const rotas = imgs.filter(i => i.currentSrc && i.complete && i.naturalWidth === 0).map(i => i.currentSrc.replace(location.origin, ''));
  const sinAlt = imgs.filter(i => !i.hasAttribute('alt')).length;
  const sinDimensiones = imgs.filter(i => !(i.hasAttribute('width') && i.hasAttribute('height')) &&
      !(i.parentElement && getComputedStyle(i.parentElement).aspectRatio !== 'auto')).length;

  // 5 · texto pequeño
  const chicos = [...document.querySelectorAll('body *')].filter(e =>
    e.childElementCount === 0 && e.textContent.trim() && visible(e) && parseFloat(getComputedStyle(e).fontSize) < 12);
  const chicosPorClase = {};
  for (const e of chicos) { const k = Math.round(parseFloat(getComputedStyle(e).fontSize) * 10) / 10 + 'px ' + nodo(e);
    chicosPorClase[k] = (chicosPorClase[k] || 0) + 1; }

  // 6 · objetivos táctiles (WCAG 2.2 · 2.5.8 = 24×24; se excluye el enlace en línea dentro de un párrafo)
  const enLinea = e => e.closest('p, li, td, h1, h2, h3') && getComputedStyle(e).display.includes('inline') && !e.matches('button,[role=button]');
  const tocables = [...document.querySelectorAll('a[href], button, input, select, textarea, [role=button], [tabindex]:not([tabindex="-1"])')]
    .filter(e => visible(e) && !enLinea(e)).map(e => { const b = e.getBoundingClientRect();
      return { n: nodo(e), w: Math.round(b.width), h: Math.round(b.height), txt: (e.textContent || '').trim().slice(0, 24) }; })
    .filter(t => t.w < 24 || t.h < 24);

  // 7 · estructura
  const h1 = [...document.querySelectorAll('h1')];
  const ids = {}; const dupIds = [];
  for (const e of document.querySelectorAll('[id]')) { ids[e.id] = (ids[e.id] || 0) + 1; }
  for (const [k, v] of Object.entries(ids)) if (v > 1) dupIds.push(k + ' ×' + v);

  // 8 · peso y trabajo del hilo
  const res = performance.getEntriesByType('resource');
  const bytes = t => Math.round(res.filter(r => t(r)).reduce((a, r) => a + (r.transferSize || 0), 0) / 1024);
  const nav = performance.getEntriesByType('navigation')[0] || {};

  return {
    vw, vh, documento: { alto: Math.round(document.documentElement.scrollHeight), ancho: document.documentElement.scrollWidth },
    desborde,
    salidos,
    paneles,
    imagenes: { total: imgs.length, rotas: rotas.slice(0, 6), nRotas: rotas.length, sinAlt, sinDimensiones },
    texto: { n: chicos.length, porClase: Object.entries(chicosPorClase).sort((a, b) => b[1] - a[1]).slice(0, 6) },
    tocables: { n: tocables.length, muestra: tocables.slice(0, 6) },
    estructura: { h1: h1.length, h1Texto: h1.slice(0, 2).map(h => h.textContent.trim().slice(0, 50)), idsDuplicados: dupIds.slice(0, 4) },
    rendimiento: {
      kb: { total: bytes(() => true), js: bytes(r => /\\.js(\\?|$)/.test(r.name)), css: bytes(r => /\\.css(\\?|$)/.test(r.name)),
            img: bytes(r => r.initiatorType === 'img' || /\\.(jpg|jpeg|png|webp|avif|svg|gif)/i.test(r.name)),
            fuente: bytes(r => /\\.(woff2?|ttf|otf)/.test(r.name)) },
      peticiones: res.length, nodos: document.querySelectorAll('*').length,
      fcp: qa.fcp, lcp: qa.lcp,
      tareasLargas: qa.largas.length, msTareasLargas: qa.largas.reduce((a, b) => a + b, 0), mayorTarea: Math.max(0, ...qa.largas),
      cls: +(qa.cls || 0).toFixed(4), clsItems: (qa.clsItems || []).slice(-3),
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0), carga: Math.round(nav.loadEventEnd || 0),
    },
    titulo: document.title.slice(0, 90),
  };
}"""


async def auditar_vista(navegador, vista, puertas, base, lento):
    cfg = VISTAS[vista]
    ctx = await navegador.new_context(
        user_agent=UA_MOVIL if cfg["is_mobile"] else UA_ESCRITORIO,
        viewport={"width": cfg["width"], "height": cfg["height"]},
        device_scale_factor=cfg["device_scale_factor"],
        is_mobile=cfg["is_mobile"], has_touch=cfg["has_touch"])
    pagina = await ctx.new_page()
    if lento:
        cdp = await ctx.new_cdp_session(pagina)
        await cdp.send("Emulation.setCPUThrottlingRate", {"rate": 4})
    acta = []
    estado = {"ruta": None}
    consola, fallos = [], []

    def on_consola(m):
        if m.type in ("error", "warning"):
            consola.append({"ruta": estado["ruta"], "tipo": m.type, "txt": m.text[:180]})

    def on_respuesta(r):
        if r.status >= 400:
            fallos.append({"ruta": estado["ruta"], "status": r.status, "url": r.url.replace(base, "")[:140],
                           "tipo": r.request.resource_type})

    def on_peticionfallida(r):
        # Una navegación a otra página aborta los trozos que la anterior tenía
        # en vuelo: net::ERR_ABORTED aquí no es un defecto, es el navegador
        # haciendo su trabajo. Solo se anota lo que de verdad no llegó.
        if "ERR_ABORTED" in str(r.failure):
            return
        fallos.append({"ruta": estado["ruta"], "status": "SIN_RESPUESTA", "url": r.url.replace(base, "")[:140],
                       "tipo": r.resource_type, "error": str(r.failure)[:60]})

    pagina.on("console", on_consola)
    pagina.on("pageerror", lambda e: consola.append({"ruta": estado["ruta"], "tipo": "pageerror", "txt": str(e)[:200]}))
    pagina.on("response", on_respuesta)
    pagina.on("requestfailed", on_peticionfallida)
    await pagina.add_init_script(INIT)

    for ruta in puertas:
        estado["ruta"] = ruta
        antes_c, antes_f = len(consola), len(fallos)
        t0 = time.time()
        try:
            r = await pagina.goto(base + ruta, wait_until="load", timeout=60000)
            estado_http = r.status if r else 0
            await pagina.wait_for_timeout(1400)
            # una pasada de desplazamiento para disparar lo perezoso
            await pagina.evaluate("() => scrollTo(0, document.documentElement.scrollHeight * 0.45)")
            await pagina.wait_for_timeout(500)
            await pagina.evaluate("() => scrollTo(0, 0)")
            await pagina.wait_for_timeout(400)
            datos = await pagina.evaluate(MEDIR)
        except Exception as e:
            datos = {"error": str(e)[:200]}
            estado_http = 0
        datos.update({"ruta": ruta, "vista": vista, "http": estado_http, "ms": int((time.time() - t0) * 1000),
                      "consola": consola[antes_c:], "fallos": fallos[antes_f:]})
        acta.append(datos)
        marca = "✗" if estado_http >= 400 else "·"
        rend = datos.get("rendimiento", {})
        print(f"  {marca} {ruta:34} {estado_http}  {datos['ms']:5} ms  "
              f"CLS {rend.get('cls', '?')}  largas {rend.get('tareasLargas', '?')}  "
              f"KB {rend.get('kb', {}).get('total', '?')}  peque {datos.get('texto', {}).get('n', '?')}  "
              f"táct {datos.get('tocables', {}).get('n', '?')}")
    await ctx.close()
    return acta


def veredicto(acta):
    """Convierte el acta en hallazgos con severidad. Es la parte que se lee."""
    fallos = []
    for d in acta:
        ruta, vista = d["ruta"], d["vista"]
        if d.get("error"):
            fallos.append(("BLOQUEA", f"{ruta} [{vista}] no cargó: {d['error']}"))
            continue
        if d["http"] >= 400:
            fallos.append(("BLOQUEA", f"{ruta} [{vista}] responde {d['http']}"))
        for f in d["fallos"]:
            if f["tipo"] in ("image", "script", "stylesheet", "document"):
                fallos.append(("ALTA", f"{ruta} [{vista}] petición fallida {f['status']} {f['tipo']}: {f['url']}"))
        for c in d["consola"]:
            if c["tipo"] in ("error", "pageerror") and "GL Driver" not in c["txt"]:
                fallos.append(("ALTA", f"{ruta} [{vista}] consola {c['tipo']}: {c['txt'][:120]}"))
        if d["desborde"] > 1:
            fallos.append(("BLOQUEA", f"{ruta} [{vista}] la página desborda {d['desborde']} px: {d['salidos'][:3]}"))
        for p in d["paneles"]:
            fallos.append(("ALTA", f"{ruta} [{vista}] panel fuera de pantalla o recortado: {p}"))
        if d["imagenes"]["nRotas"]:
            fallos.append(("ALTA", f"{ruta} [{vista}] {d['imagenes']['nRotas']} imágenes rotas: {d['imagenes']['rotas']}"))
        if d["imagenes"]["sinAlt"]:
            fallos.append(("MEDIA", f"{ruta} [{vista}] {d['imagenes']['sinAlt']} imágenes sin alt"))
        if d["texto"]["n"]:
            fallos.append(("MEDIA", f"{ruta} [{vista}] {d['texto']['n']} textos < 12 px: {d['texto']['porClase'][:3]}"))
        if d["tocables"]["n"]:
            fallos.append(("MEDIA", f"{ruta} [{vista}] {d['tocables']['n']} objetivos táctiles < 24 px: {[m['n'] + ' ' + str(m['w']) + 'x' + str(m['h']) for m in d['tocables']['muestra'][:3]]}"))
        if d["estructura"]["h1"] != 1:
            fallos.append(("BAJA", f"{ruta} [{vista}] {d['estructura']['h1']} etiquetas h1"))
        if d["estructura"]["idsDuplicados"]:
            fallos.append(("BAJA", f"{ruta} [{vista}] id duplicados: {d['estructura']['idsDuplicados']}"))
        r = d["rendimiento"]
        if r["cls"] > 0.1:
            fallos.append(("ALTA", f"{ruta} [{vista}] CLS {r['cls']} (> 0,1 molesta al leer)"))
        if r["msTareasLargas"] > 600:
            fallos.append(("MEDIA", f"{ruta} [{vista}] {r['tareasLargas']} tareas largas = {r['msTareasLargas']} ms (mayor {r['mayorTarea']} ms)"))
    return fallos


def comparar(acta, previo):
    """¿Qué empeoró? Se compara por ruta+vista+comprobación."""
    def claves(lista):
        return {(d["ruta"], d["vista"]): d for d in lista}
    antes, ahora = claves(previo), claves(acta)
    nuevos = []
    for k, d in ahora.items():
        a = antes.get(k)
        if not a:
            continue
        if d.get("desborde", 0) > a.get("desborde", 0):
            nuevos.append(f"{k[0]} [{k[1]}] desborde {a.get('desborde')} → {d.get('desborde')} px")
        if d.get("rendimiento", {}).get("cls", 0) > a.get("rendimiento", {}).get("cls", 0) + 0.02:
            nuevos.append(f"{k[0]} [{k[1]}] CLS {a['rendimiento']['cls']} → {d['rendimiento']['cls']}")
        if len(d.get("fallos", [])) > len(a.get("fallos", [])):
            nuevos.append(f"{k[0]} [{k[1]}] peticiones fallidas {len(a.get('fallos', []))} → {len(d.get('fallos', []))}")
        if d.get("texto", {}).get("n", 0) > a.get("texto", {}).get("n", 0) + 5:
            nuevos.append(f"{k[0]} [{k[1]}] textos < 12 px {a['texto']['n']} → {d['texto']['n']}")
        if d.get("tocables", {}).get("n", 0) > a.get("tocables", {}).get("n", 0) + 5:
            nuevos.append(f"{k[0]} [{k[1]}] objetivos táctiles pequeños {a['tocables']['n']} → {d['tocables']['n']}")
        if d.get("http", 0) >= 400 > a.get("http", 0):
            nuevos.append(f"{k[0]} [{k[1]}] pasó de {a.get('http')} a {d.get('http')}")
    return nuevos


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default=BASE_POR_DEFECTO)
    ap.add_argument("--vista", default="movil", choices=["movil", "tablet", "escritorio", "todas"])
    ap.add_argument("--paginas", default="")
    ap.add_argument("--json", default="")
    ap.add_argument("--comparar", default="")
    ap.add_argument("--lento", action="store_true")
    args = ap.parse_args()

    base = args.base.rstrip("/")
    puertas = [p.strip() for p in args.paginas.split(",") if p.strip()] if args.paginas else PUERTAS
    vistas = list(VISTAS) if args.vista == "todas" else [args.vista]

    print(f"QA de navegador · {base} · {len(puertas)} puertas · vistas: {', '.join(vistas)}"
          + (" · CPU 4× más lenta" if args.lento else ""))
    acta = []
    async with async_playwright() as p:
        navegador = await p.chromium.launch()
        for v in vistas:
            print(f"\n── {v} ──")
            acta += await auditar_vista(navegador, v, puertas, base, args.lento)
        await navegador.close()

    fallos = veredicto(acta)
    cuenta = {}
    for sev, _ in fallos:
        cuenta[sev] = cuenta.get(sev, 0) + 1
    print("\n" + "═" * 78)
    print("HALLAZGOS:", ", ".join(f"{k} {v}" for k, v in sorted(cuenta.items())) or "ninguno")
    orden = {"BLOQUEA": 0, "ALTA": 1, "MEDIA": 2, "BAJA": 3}
    for sev, txt in sorted(fallos, key=lambda x: orden[x[0]])[:60]:
        print(f"  [{sev}] {txt}")
    if len(fallos) > 60:
        print(f"  … y {len(fallos) - 60} más (el acta completa va en --json)")

    if args.comparar and os.path.exists(args.comparar):
        previo = json.load(open(args.comparar, encoding="utf-8")).get("acta", [])
        nuevos = comparar(acta, previo)
        print("\nREGRESIONES DESDE LA ÚLTIMA ACTA:", len(nuevos))
        for n in nuevos[:20]:
            print("  ←", n)

    if args.json:
        json.dump({"base": base, "cuando": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                   "vistas": vistas, "puertas": puertas, "lento": args.lento,
                   "resumen": cuenta, "hallazgos": [{"sev": s, "txt": t} for s, t in fallos], "acta": acta},
                  open(args.json, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print("\nacta escrita en", args.json)

    sys.exit(1 if cuenta.get("BLOQUEA") else 0)


if __name__ == "__main__":
    asyncio.run(main())
