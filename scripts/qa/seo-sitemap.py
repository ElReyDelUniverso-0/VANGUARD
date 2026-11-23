# Recorre las URLs del sitemap (todas menos /noticia, + muestra de noticias) y compara canónica/robots/estado
import re, sys, random, concurrent.futures as cf, urllib.request, ssl, json
SM = sys.argv[1] if len(sys.argv) > 1 else "https://vanguard.vanguard-casa.workers.dev/sitemap.xml"
UA = "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Mobile Safari/537.36 (compatible; Google-InspectionTool/1.0;)"
def get(u):
    r = urllib.request.Request(u, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(r, timeout=60) as x: return x.status, x.geturl(), x.read().decode("utf-8", "replace"), dict(x.headers)
    except urllib.error.HTTPError as e: return e.code, u, "", {}
xml = get(SM)[2]
locs = re.findall(r"<loc>([^<]*)</loc>", xml)
otras = [l for l in locs if "/noticia/" not in l]
random.seed(7); muestra = random.sample([l for l in locs if "/noticia/" in l], 25)
def chk(u):
    st, fin, h, hd = get(u)
    head = h[: h.find("</head>")] if "</head>" in h else h
    can = re.findall(r'<link rel="canonical" href="([^"]*)"', h)
    rob = re.findall(r'<meta name="robots" content="([^"]*)"', h)
    xr = hd.get("X-Robots-Tag") or hd.get("x-robots-tag")
    prob = []
    if st != 200: prob.append(f"estado {st}")
    if fin.rstrip("/") != u.rstrip("/"): prob.append(f"redirige a {fin}")
    if not can: prob.append("sin canónica")
    elif len(set(can)) > 1: prob.append(f"canónicas múltiples {set(can)}")
    elif can[0].rstrip("/") != u.rstrip("/"): prob.append(f"canónica → {can[0]}")
    if any("noindex" in r for r in rob): prob.append(f"robots {rob}")
    if xr and "noindex" in xr: prob.append(f"X-Robots-Tag {xr}")
    if can and 'rel="canonical"' not in head: prob.append("canónica fuera de <head>")
    return u, prob
with cf.ThreadPoolExecutor(8) as ex: res = list(ex.map(chk, otras + muestra))
mal = [(u, p) for u, p in res if p]
print(json.dumps({"urls_sitemap": len(locs), "revisadas": len(res), "con_problema": len(mal)}, ensure_ascii=False))
for u, p in mal: print(u.replace("https://vanguard.vanguard-casa.workers.dev", "") or "/", "→", "; ".join(p))
