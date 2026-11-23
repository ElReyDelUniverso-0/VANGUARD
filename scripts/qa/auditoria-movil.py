# Uso: pip install playwright && python -m playwright install chromium
#      python scripts/qa/auditoria-movil.py [BASE_URL] [salida.json]
# Recorre las rutas en un móvil 390x844 y revisa enlaces internos. Ver docs/VANGUARD_TESTING.md
"""Auditoría real de producción, móvil 390x844: errores, imágenes rotas, desbordes,
peso, tiempos, textos diminutos, botones pequeños, metadatos y enlaces internos."""
import json, sys, time, asyncio
from playwright.async_api import async_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "https://vanguard.vanguard-casa.workers.dev"
RUTAS = """/ /guerra-hoy /en-vivo /conflictos /cronica /vertigo /escenarios /verdad-cruda /audios
/mundo /ver-guerra /zona-cero /teatro-3d /vanguard2 /pulso-mundial /espia /atlas /rostros /servicios
/poder /armeria /divisas /historia /archivo-mundial /oscura /galeria /traductor /centinela /voz /musica
/cuartel /objetivos /universo /mision /perfil /modo /estado /novedades /calidad /torre /catalogo
/nucleo /escudo /privacidad /herramientas /cruce /lectura /clasico /conflicto /offline /ruta-que-no-existe
/modulos /modulo/conflictos /modulo/mapa /modulo/conocimiento /modulo/secretos /modulo/arsenal /modulo/datos /modulo/medios /modulo/juego /modulo/estado""".split()

JS = r"""() => {
  const W = innerWidth, r = {};
  r.titulo = document.title;
  r.desc = (document.querySelector('meta[name=description]')||{}).content || '';
  r.og = !!document.querySelector('meta[property="og:image"]');
  r.h1 = document.querySelectorAll('h1').length;
  r.nodos = document.getElementsByTagName('*').length;
  r.ancho = document.documentElement.scrollWidth; r.alto = document.documentElement.scrollHeight;
  const des = [];
  for (const el of document.body.querySelectorAll('*')) {
    const b = el.getBoundingClientRect();
    if (b.width > 0 && b.right > W + 2 && getComputedStyle(el).position !== 'fixed') {
      let p = el.parentElement, oculto = false;
      while (p) { const o = getComputedStyle(p).overflowX; if (o === 'hidden' || o === 'auto' || o === 'scroll' || o === 'clip') { oculto = true; break; } p = p.parentElement; }
      if (!oculto) des.push((el.tagName + '.' + (el.className.baseVal ?? el.className)).slice(0, 70) + ' →' + Math.round(b.right));
    }
  }
  r.desbordes = des.slice(0, 6); r.nDesbordes = des.length;
  const imgs = [...document.images];
  r.imgs = imgs.length;
  r.rotas = imgs.filter(i => i.complete && i.naturalWidth === 0 && i.src && !i.src.startsWith('data:')).map(i => i.src.slice(0, 110)).slice(0, 6);
  r.sinAlt = imgs.filter(i => !i.hasAttribute('alt')).length;
  let mini = 0, ejMini = '';
  for (const el of document.body.querySelectorAll('p,span,a,li,div,small,button,time,dd,dt,td')) {
    if (!el.childNodes.length) continue;
    const t = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('');
    if (t.length < 3) continue;
    const b = el.getBoundingClientRect(); if (!b.width) continue;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    if (fs < 10) { mini++; if (!ejMini) ejMini = fs + 'px «' + t.slice(0, 40) + '»'; }
  }
  r.textoMini = mini; r.ejMini = ejMini;
  let peq = 0;
  for (const el of document.querySelectorAll('a[href],button,[role=button],input,select')) {
    const b = el.getBoundingClientRect();
    if (b.width > 0 && b.height > 0 && (b.height < 24 || b.width < 24) && getComputedStyle(el).display !== 'inline') peq++;
  }
  r.tocablesPeq = peq;
  r.sinNombre = [...document.querySelectorAll('button,a[href]')].filter(e => !(e.innerText||'').trim() && !e.getAttribute('aria-label') && !e.getAttribute('title') && !e.querySelector('img[alt]:not([alt=""]),svg title')).length;
  r.enlaces = [...new Set([...document.querySelectorAll('a[href^="/"]')].map(a => a.getAttribute('href').split('#')[0].split('?')[0]))];
  const nav = performance.getEntriesByType('navigation')[0];
  r.ttfb = nav ? Math.round(nav.responseStart) : -1;
  r.dcl = nav ? Math.round(nav.domContentLoadedEventEnd) : -1;
  r.kb = Math.round(performance.getEntriesByType('resource').reduce((s, e) => s + (e.transferSize || 0), (nav && nav.transferSize) || 0) / 1024);
  r.js = Math.round(performance.getEntriesByType('resource').filter(e => e.initiatorType === 'script').reduce((s, e) => s + (e.transferSize || 0), 0) / 1024);
  return r;
}"""

async def una(ctx, ruta, sem, out):
    async with sem:
        p = await ctx.new_page()
        errs, fallos = [], []
        p.on("console", lambda m: errs.append(m.text[:160]) if m.type == "error" else None)
        p.on("pageerror", lambda e: errs.append("PAGEERROR " + str(e)[:160]))
        p.on("response", lambda r: fallos.append(f"{r.status} {r.url[:110]}") if r.status >= 400 and "vercel" in r.url else None)
        t = time.time(); st = -1
        try:
            resp = await p.goto(BASE + ruta + "?qa=" + str(int(t)), wait_until="load", timeout=45000)
            st = resp.status if resp else -1
            await p.wait_for_timeout(2500)
            await p.evaluate("window.scrollTo(0, document.body.scrollHeight)")
            await p.wait_for_timeout(1200)
            r = await p.evaluate(JS)
        except Exception as e:
            r = {"fallo": str(e)[:200]}
        r.update(ruta=ruta, status=st, seg=round(time.time() - t, 1), errores=errs[:6], nErrores=len(errs), http=fallos[:6])
        out.append(r); print(ruta, st, r.get("seg"), "err", len(errs), "rotas", len(r.get("rotas", [])), "desb", r.get("nDesbordes"), flush=True)
        await p.close()

async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=1, is_mobile=True, has_touch=True,
                                  user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1")
        sem = asyncio.Semaphore(3); out = []
        await asyncio.gather(*[una(ctx, r, sem, out) for r in RUTAS])
        # enlaces internos: comprobar estado
        todos = sorted({e for r in out for e in r.get("enlaces", [])} - set(RUTAS))
        req = ctx.request; malos = []
        for e in todos[:250]:
            try:
                rr = await req.get(BASE + e, max_redirects=5, timeout=20000)
                if rr.status >= 400: malos.append(f"{rr.status} {e}")
            except Exception as ex:
                malos.append(f"ERR {e}")
        json.dump({"rutas": out, "enlacesMalos": malos, "nEnlaces": len(todos)}, open(sys.argv[2] if len(sys.argv) > 2 else "auditoria-movil.json", "w"), ensure_ascii=False, indent=1)
        print("enlaces revisados", len(todos), "malos", malos)
        await b.close()

asyncio.run(main())
