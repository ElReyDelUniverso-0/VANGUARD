#!/usr/bin/env python3
"""VANGUARD SCIENCE FRONTIER — captura de procedencia.

Junta, para cada publicación del índice:
  · sus metadatos bibliográficos reales (Crossref por DOI, o la ficha arXiv),
  · la respuesta cruda con su huella SHA-256,
  · las referencias citadas que apuntan a otra publicación del índice,
  · el registro oficial del premio (NobelPrize.org) y la cabecera de cada
    institución del catálogo.

Uso:
  python tools/ciencia/capturar.py            # captura (respeta la caché)
  python tools/ciencia/capturar.py --offline  # reconstruye desde la caché

No inventa: si una fuente no responde, el registro no se escribe y el programa
lo dice. Los archivos crudos viven fuera del repositorio (`.cache/vgsci/raw`).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import time
from pathlib import Path
from urllib.parse import quote

import requests
from bs4 import BeautifulSoup

CAPTURA = Path.home() / ".cache/vgsci"
ESPECIFICACION = Path(__file__).resolve().parent / "datos" / "especificacion.json"
RAW = CAPTURA / "raw"
CABECERAS = {"User-Agent": "VANGUARD-ScienceFrontier/1.0 (metadatos bibliográficos públicos)"}
NOBEL = [(2017, "physics"), (2019, "physics"), (2010, "physics"), (2006, "physics"), (2003, "medicine"), (2021, "physics")]
INSTITUCIONES = [
    "https://www.ligo.caltech.edu/",
    "https://www.ligo.caltech.edu/news/ligo20160211",
    "https://www.graphene.manchester.ac.uk/ngi/",
    "https://www.stsci.edu/",
    "https://science.nasa.gov/universe/exoplanets/nasas-webb-detects-carbon-dioxide-in-exoplanet-atmosphere/",
    "https://science.nasa.gov/mission/cobe/",
    "https://cbs.riken.jp/en/",
    "https://scrippsco2.ucsd.edu/",
    "https://www.usgs.gov/programs/earthquake-hazards",
    "https://www.eso.org/public/about-eso/",
    "https://public.nrao.edu/",
    "https://www.claymath.org/millennium/poincare-conjecture/",
]


def limpio(t: str) -> str:
    return re.sub(r"\s+", " ", str(t).replace("\u2009", " ")).strip()


def traer(url: str, destino: Path, offline: bool) -> bytes:
    if destino.exists():
        return destino.read_bytes()
    if offline:
        raise SystemExit(f"falta en caché: {destino}")
    for intento in range(4):
        r = requests.get(url, timeout=(6, 20), headers=CABECERAS)
        if r.status_code != 429:
            break
        time.sleep(max(float(r.headers.get("Retry-After", 2)), 2 ** (intento + 1)))
    r.raise_for_status()
    destino.write_bytes(r.content)
    return r.content


def ficha(fila: str, offline: bool) -> dict:
    pid, idea, ident = fila.split("|")
    if ident.startswith("arxiv:"):
        ax = ident[6:]
        crudo = traer(f"https://arxiv.org/abs/{ax}", RAW / f"{pid}.html", offline)
        s = BeautifulSoup(crudo, "html.parser")
        meta = lambda k: [e["content"] for e in s.select(f'meta[name="{k}"][content]')]
        d = {
            "id": pid,
            "idea": idea,
            "arxiv": ax,
            "url": f"https://arxiv.org/abs/{ax}",
            "original": limpio(meta("citation_title")[0]),
            "medio": "arXiv",
            "fecha": meta("citation_date")[0].replace("/", "-"),
            "campoFecha": "citation_date · v1",
            "autores": [{"n": limpio(a)} for a in meta("citation_author")],
            "totalAutores": len(meta("citation_author")),
            "refs": [],
            "doiRevista": (meta("citation_doi") or [""])[0],
            "metadatos": f"https://arxiv.org/abs/{ax}",
        }
        print(pid, d["fecha"], d["original"][:90], flush=True)
    else:
        crudo = traer(f"https://api.crossref.org/works/{quote(ident, safe='/')}", RAW / f"{pid}.json", offline)
        v = json.loads(crudo)["message"]
        if v["DOI"].lower() != ident.lower():
            raise SystemExit(f"{pid}: el DOI devuelto no coincide")
        fechas = [(v[campo]["date-parts"][0], campo) for campo in ("published-print", "published-online", "published", "issued") if v.get(campo, {}).get("date-parts", [[]])[0]]
        partes, campo = min(fechas, key=lambda df: tuple(df[0]))
        d = {
            "id": pid,
            "idea": idea,
            "doi": v["DOI"],
            "url": "https://doi.org/" + quote(v["DOI"], safe="/();:."),
            "original": limpio(v["title"][0]),
            "medio": limpio((v.get("container-title") or [""])[0]),
            "fecha": "-".join([str(partes[0])] + [f"{p:02d}" for p in partes[1:]]),
            "campoFecha": campo,
            "autores": [{"n": limpio(a.get("name") or " ".join(x for x in [a.get("given"), a.get("family")] if x)), "orcid": a.get("ORCID", "").replace("http://", "https://")} for a in v.get("author", [])[:10]],
            "totalAutores": len(v.get("author", [])),
            "refs": [r["DOI"].lower() for r in v.get("reference", []) if r.get("DOI")],
            "resumenOriginal": limpio(BeautifulSoup(v.get("abstract", ""), "html.parser").get_text(" ")),
            "metadatos": f"https://api.crossref.org/works/{quote(v['DOI'], safe='/')}",
        }
        print(pid, d["fecha"], d["original"][:90], d["totalAutores"], flush=True)
    d["sha256"] = hashlib.sha256(crudo).hexdigest()
    return d


def premios(offline: bool) -> None:
    for anio, cat in NOBEL:
        destino = RAW / f"nobel-{anio}.html"
        traer(f"https://www.nobelprize.org/prizes/{cat}/{anio}/summary/", destino, offline)
        texto = BeautifulSoup(destino.read_text(encoding="utf-8", errors="replace"), "html.parser").get_text(" ", strip=True)
        i = texto.find("was awarded")
        print("premio", anio, cat, "motivación:", "sí" if "for " in texto[i : i + 900] else "NO")


def instituciones(offline: bool) -> None:
    salida = []
    for url in INSTITUCIONES:
        nombre = re.sub(r"[^a-z0-9]+", "-", url.split("//")[1])[:60]
        try:
            crudo = traer(url, RAW / f"inst-{nombre}.html", offline)
            salida.append({"url": url, "http": 200, "bytes": len(crudo)})
        except Exception as e:  # noqa: BLE001 - se informa, no se inventa
            salida.append({"url": url, "http": None, "error": str(e)[:120]})
    (CAPTURA / "instituciones-verificadas.json").write_text(json.dumps(salida, ensure_ascii=False, indent=1))
    print("instituciones:", sum(1 for s in salida if s.get("http") == 200), "/", len(salida))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--offline", action="store_true")
    args = ap.parse_args()
    RAW.mkdir(parents=True, exist_ok=True)
    filas = [f for f in (CAPTURA / "identidades.tsv").read_text().splitlines() if f.strip()]
    hechas = []
    for fila in filas:
        try:
            hechas.append(ficha(fila, args.offline))
        except Exception as e:  # noqa: BLE001
            print("FALLO", fila, str(e)[:160], file=sys.stderr)
    (CAPTURA / "metadata.json").write_text(json.dumps(sorted(hechas, key=lambda d: d["id"]), ensure_ascii=False, indent=1))
    premios(args.offline)
    instituciones(args.offline)
    print(f"capturadas {len(hechas)}/{len(filas)}")
    return 0 if len(hechas) == len(filas) else 1


if __name__ == "__main__":
    sys.exit(main())
