#!/usr/bin/env python3
# v288.0 — medición del pulso por agencia contra la BD fría (solo lectura)
# El MISMO algoritmo del canon del consumidor (comunidad-panel cablesDeAgencia):
# keywords en minúsculas, includes en el título. Nunca escribe.
import sqlite3, re

FUENTE = "/home/z/my-project/src/lib/agencias-data.ts"
BD = "/home/z/my-project/db/custom.db"

src = open(FUENTE, encoding="utf-8").read()
ini = src.index("export const PULSO_KEYWORDS")
fin = src.index("};", ini)
bloque = src[ini:fin]
# ids en el ORDEN DE LA FUENTE
ids = re.findall(r'^\s{2}([a-z]+):\s*\[', bloque, re.M)
kws_map = {}
for m in re.finditer(r'^\s{2}([a-z]+):\s*\[(.*?)\]', bloque, re.M | re.S):
    kws_map[m.group(1)] = [k.strip().strip('"\'').lower() for k in m.group(2).split(",") if k.strip()]

print("ids en orden de fuente:", len(ids))
print(",".join(ids))

con = sqlite3.connect(f"file:{BD}?mode=ro", uri=True)
rows = con.execute("SELECT title FROM NewsItem WHERE externalId IS NOT NULL AND externalId NOT LIKE 'curated-%'").fetchall()
con.close()
titulos = [r[0].lower() for r in rows]
print("titulos no-curados:", len(titulos))

pulso = []
for aid in ids:
    kws = kws_map.get(aid, [])
    if not kws:
        continue
    n = sum(1 for t in titulos if any(k in t for k in kws))
    if n > 0:
        # el último titular (el primero del archivo en orden desc — la BD no da orden aquí,
        # sirve para el conteo; la sala usa publishedAt desc)
        ejemplo = next(t for t in titulos if any(k in t for k in kws))
        pulso.append((aid, n, ejemplo[:80]))

for aid, n, ej in pulso:
    print(f"{aid}: {n} :: {ej}")
print(f"TOTAL: {len(pulso)} de {len(ids)} agencias citadas por {sum(p[1] for p in pulso)} titulares")
