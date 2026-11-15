# Auditoría SEO de las páginas /conflicto/<tag> (HTML servido, sin JS)
import re, sys, html, json, glob, os
from html.parser import HTMLParser
class P(HTMLParser):
    def __init__(s):
        super().__init__(); s.meta=[]; s.links=[]; s.a=[]; s.h1=[]; s.title=""; s._t=None; s.txt=[]; s._skip=0
    def handle_starttag(s,t,a):
        a=dict(a)
        if t=="meta": s.meta.append(a)
        if t=="link": s.links.append(a)
        if t=="a" and a.get("href"): s.a.append(a["href"])
        if t in("script","style","noscript","template"): s._skip+=1
        if t in("h1","title"): s._t=t
    def handle_endtag(s,t):
        if t in("script","style","noscript","template"): s._skip=max(0,s._skip-1)
        if t in("h1","title"): s._t=None
    def handle_data(s,d):
        if s._t=="h1": s.h1.append(d.strip())
        if s._t=="title": s.title+=d
        if not s._skip and d.strip(): s.txt.append(d.strip())
res={}
for f in sorted(glob.glob(sys.argv[1]+"/p_*.html")):
    t=f.split("p_")[1][:-5]; p=P(); p.feed(open(f,encoding="utf-8",errors="replace").read())
    can=[l.get("href") for l in p.links if l.get("rel")=="canonical"]
    rob=[m.get("content") for m in p.meta if (m.get("name") or "").lower() in("robots","googlebot")]
    desc=[m.get("content") for m in p.meta if m.get("name")=="description"]
    hl=[l.get("hreflang")+"→"+l.get("href") for l in p.links if l.get("hreflang")]
    texto=" ".join(p.txt)
    conf=sorted(set(h for h in p.a if "/conflicto/" in h))
    res[t]={"title":p.title.strip(),"h1":" ".join(x for x in p.h1 if x)[:90],"canonical":can,"robots":rob,"desc_len":len(desc[0]) if desc else 0,
            "palabras_visibles":len(texto.split()),"enlaces_a":len(p.a),"enlaces_a_conflictos":conf,"hreflang":hl[:3]}
print(json.dumps(res,indent=1,ensure_ascii=False))
