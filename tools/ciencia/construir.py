#!/usr/bin/env python3
"""VANGUARD SCIENCE FRONTIER — constructor del índice científico.

Lee las capturas crudas (metadatos Crossref/arXiv, fichas Nobel, cabeceras de
instituciones) y la especificación editorial, y escribe los JSON que consume
`src/lib/ciencia/indice.ts`.

Reglas:
  · Ninguna cifra ni autor se escribe a mano aquí: sale de la captura.
  · Toda afirmación del catálogo (lectura, cautela, estado de una idea) es
    editorial y vive en `especificacion.json` con el sello de VANGUARD.
  · Se niega a construir si un enlace interno no existe, si una fecha no se
    puede leer o si un premio cita una publicación que no está en el índice.
"""
from __future__ import annotations

import hashlib
import json
import re
import sys
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
CAPTURA = Path("/home/user/.cache/vgsci")
SALIDA = RAIZ / "src/lib/ciencia"

NIVELES = {
    "Observación": "medicion",
    "Medición": "medicion",
    "Detección": "medicion",
    "Espectroscopia": "medicion",
    "Medición funcional": "medicion",
    "Medición indirecta": "inferencia",
    "Detección indirecta": "inferencia",
    "Modelo y contraste": "inferencia",
    "Estimación": "inferencia",
    "Reconstrucción": "inferencia",
    "Experimento": "experimento",
    "Prueba de concepto": "experimento",
    "Ensayo controlado": "experimento",
    "Cohorte": "observacional",
    "Casos y controles": "observacional",
    "Hipótesis contrastable": "hipotesis",
    "Modelo geométrico": "hipotesis",
    "Hipótesis y cálculo": "hipotesis",
    "Interpretación": "hipotesis",
    "Revisión": "sintesis",
    "Exposición matemática": "sintesis",
    "Argumento matemático": "demostracion",
    "Versión v1": "registro",
    "Modelo": "inferencia",
    "Inferencia con modelo": "inferencia",
    "Nueva observación": "medicion",
}
REVISIONES = {"revision-grafeno", "revision-bold", "notas"}


def limpio(t: str) -> str:
    t = unicodedata.normalize("NFKC", str(t))
    return re.sub(r"\s+", " ", t.replace("\u2009", " ").replace("\u00ad", "")).strip()


def cargar():
    esp = json.loads((RAIZ / "tools/ciencia/datos/especificacion.json").read_text())
    meta = {d["id"]: d for d in json.loads((CAPTURA / "metadata.json").read_text())}
    lecturas = {}
    for linea in (CAPTURA / "lecturas.tsv").read_text().splitlines():
        if not linea.strip():
            continue
        k, titulo_es, nivel, _letra, lectura, cautela = linea.split("|")
        lecturas[k] = {
            "titulo": limpio(titulo_es),
            "nivelEtiqueta": limpio(nivel),
            "lectura": limpio(lectura),
            "cautela": limpio(cautela),
        }
    return esp, meta, lecturas


def construir() -> None:
    esp, meta, lecturas = cargar()
    disciplinas = {d["id"]: d for d in esp["disciplinas"]}
    ideas = {i["id"]: i for i in esp["ideas"]}

    if set(meta) != set(lecturas):
        raise SystemExit(f"captura y lecturas no coinciden: {set(meta) ^ set(lecturas)}")

    publicaciones = []
    for pid, m in sorted(meta.items()):
        lec = lecturas[pid]
        idea = ideas.get(m["idea"])
        if not idea:
            raise SystemExit(f"{pid}: idea desconocida {m['idea']}")
        if lec["nivelEtiqueta"] not in NIVELES:
            raise SystemExit(f"{pid}: nivel sin traducir {lec['nivelEtiqueta']!r}")
        es_arxiv = "arxiv" in m
        doi = m.get("doi", "")
        version_de = ""
        if es_arxiv:
            # ¿el propio depósito declara una versión arbitrada?
            version_de = m.get("doiRevista", "")
        tipo = "revision" if pid in REVISIONES else ("preprint" if es_arxiv else "articulo")
        arbitraje = {
            "articulo": "revista",
            "revision": "revista",
            "preprint": "repositorio",
        }[tipo]
        fecha = m["fecha"]
        if not re.fullmatch(r"\d{4}(-\d{2})?(-\d{2})?", fecha):
            raise SystemExit(f"{pid}: fecha ilegible {fecha!r}")
        autores = [
            {"nombre": limpio(a["n"]), "orcid": (a.get("orcid") or None)}
            for a in m.get("autores", [])
            if limpio(a["n"])
        ]
        publicaciones.append(
            {
                "id": pid,
                "titulo": lec["titulo"],
                "tituloOriginal": limpio(m["original"]),
                "ideaId": m["idea"],
                "disciplinaId": idea["disciplina"],
                "fecha": fecha,
                "anio": int(fecha[:4]),
                "medio": limpio(m["medio"]),
                "tipo": tipo,
                "arbitraje": arbitraje,
                "nivel": NIVELES[lec["nivelEtiqueta"]],
                "nivelEtiqueta": lec["nivelEtiqueta"],
                "lectura": lec["lectura"],
                "cautela": lec["cautela"],
                "original": m["url"],
                "identificador": m["doi"] if doi else m["arxiv"],
                "idTipo": "doi" if doi else "arxiv",
                "metadatos": m["metadatos"],
                "sha256": m["sha256"],
                "autores": autores,
                "totalAutores": m.get("totalAutores", len(autores)),
                "resumenOriginal": limpio(m.get("resumenOriginal") or "") or None,
                "versionDe": version_de or None,
                "referencias": sorted(
                    {r.lower() for r in m.get("refs", []) if r.lower() in {x.get("doi", "").lower() for x in meta.values()}}
                ),
            }
        )

    # ── divulgación institucional (tipo propio, sin arbitraje) ──
    for dv in esp.get("divulgacion", []):
        if dv["publicacion"] and dv["publicacion"] not in {p["id"] for p in publicaciones}:
            raise SystemExit(f"divulgación {dv['id']}: publicación inexistente")
        base = next((p for p in publicaciones if p["id"] == dv["publicacion"]), None)
        publicaciones.append(
            {
                "id": dv["id"],
                "titulo": dv["titulo"],
                "tituloOriginal": dv["titulo"],
                "ideaId": base["ideaId"] if base else "geometria",
                "disciplinaId": base["disciplinaId"] if base else "matematicas",
                "fecha": dv["fecha"],
                "anio": int(dv["fecha"][:4]),
                "medio": dv["medio"],
                "tipo": "divulgacion",
                "arbitraje": "no-aplica",
                "nivel": "registro",
                "nivelEtiqueta": "Registro institucional",
                "lectura": dv["lectura"],
                "cautela": dv["cautela"],
                "original": dv["url"],
                "identificador": dv["url"],
                "idTipo": "url",
                "metadatos": dv["url"],
                "sha256": None,
                "autores": [],
                "totalAutores": 0,
                "resumenOriginal": None,
                "versionDe": None,
                "referencias": [],
                "citadaPor": [],
                "relacionadas": [],
            }
        )

    # ── referencias verificadas → ids internos ─────────────────
    por_doi = {p["identificador"].lower(): p["id"] for p in publicaciones if p["idTipo"] == "doi"}
    for p in publicaciones:
        p["referencias"] = sorted({por_doi[r] for r in p["referencias"] if r in por_doi})

    # ── citada por (inverso) ──────────────────────────────────
    citada = {p["id"]: [] for p in publicaciones}
    for p in publicaciones:
        for r in p["referencias"]:
            citada[r].append(p["id"])
    for p in publicaciones:
        p["citadaPor"] = sorted(citada[p["id"]])
        p["relacionadas"] = sorted(set(p["referencias"]) | set(p["citadaPor"]))

    orden = {p["id"]: p["fecha"] for p in publicaciones}
    salida_ideas = []
    for iid, i in ideas.items():
        rango = list(i.get("pasos", {}))
        pubs = sorted(
            [p["id"] for p in publicaciones if p["ideaId"] == iid and p["tipo"] != "divulgacion"],
            key=lambda x: (orden[x], rango.index(x) if x in rango else 99),
        )
        faltan = [x for x in pubs if x not in i.get("pasos", {})]
        if faltan:
            raise SystemExit(f"{iid}: publicaciones sin paso explicado {faltan}")
        if len(pubs) < 2:
            raise SystemExit(f"{iid}: una idea necesita al menos dos publicaciones")
        if i["disciplina"] not in disciplinas:
            raise SystemExit(f"{iid}: disciplina desconocida")
        salida_ideas.append(
            {
                "id": iid,
                "disciplinaId": i["disciplina"],
                "pregunta": i["pregunta"],
                "sintesis": i["sintesis"],
                "estado": i["estado"],
                "estadoDetalle": i["estadoDetalle"],
                "abiertas": i["abiertas"],
                "pasos": {k: i["pasos"][k] for k in pubs},
                "publicaciones": pubs,
                "desde": int(orden[pubs[0]][:4]),
                "hasta": int(orden[pubs[-1]][:4]),
            }
        )

    # ── catálogo y validación de vínculos ─────────────────────
    ids = {p["id"] for p in publicaciones}

    def exige(ids_citados, donde):
        malos = [x for x in ids_citados if x not in ids]
        if malos:
            raise SystemExit(f"{donde}: publicaciones inexistentes {malos}")

    for inst in esp["instituciones"]:
        exige([v["publicacion"] for v in inst["vinculos"]], f"institución {inst['id']}")
        if not inst["sitio"].startswith("https://"):
            raise SystemExit(f"institución {inst['id']}: enlace no seguro")
    for pr in esp["premios"]:
        exige(pr["publicaciones"], f"premio {pr['id']}")
        if pr["idea"] not in ideas:
            raise SystemExit(f"premio {pr['id']}: idea desconocida")
        if len(pr["motivacion"]) < 30:
            raise SystemExit(f"premio {pr['id']}: motivación no citada")
    for ex in esp["experimentos"]:
        exige(ex["publicaciones"], f"experimento {ex['id']}")
    for te in esp["tecnologias"]:
        exige(te["publicaciones"], f"tecnología {te['id']}")
    for es in esp["estanterias"]:
        exige(es["publicaciones"], f"estantería {es['id']}")

    # ── cronología ────────────────────────────────────────────
    cronologia = []
    for p in publicaciones:
        cronologia.append(
            {"fecha": p["fecha"], "precision": len(p["fecha"].split("-")), "tipo": p["tipo"] if p["tipo"] == "divulgacion" else "publicacion", "id": p["id"], "titulo": p["titulo"], "disciplinaId": p["disciplinaId"]}
        )
    for pr in esp["premios"]:
        cronologia.append({"fecha": f"{pr['anio']}-12-10", "precision": 3, "tipo": "premio", "id": pr["id"], "titulo": pr["premio"], "disciplinaId": ideas[pr["idea"]]["disciplina"], "nota": "Ceremonia anual; la fecha del fallo no es la del descubrimiento."})
    for h in esp["hitosHistoricos"]:
        cronologia.append({"fecha": f"{h['anio']}-01-01", "precision": 1, "tipo": "hito", "id": f"hito-{h['anio']}", "titulo": h["texto"], "fuente": h["fuente"]})
    cronologia.sort(key=lambda c: c["fecha"])

    captura = esp["captura"]
    fuentes = [
        {"id": "crossref", "nombre": "Crossref REST API", "uso": "Metadatos bibliográficos: DOI, títulos, autores, fechas, revista y referencias citadas.", "url": "https://api.crossref.org/", "politica": "API pública; cada registro se consultó por su DOI y se guardó la respuesta cruda con su huella.", "capturado": captura},
        {"id": "arxiv", "nombre": "arXiv", "uso": "Versiones públicas de manuscritos y su fecha de depósito (v1).", "url": "https://arxiv.org/", "politica": "Moderación, no arbitraje: se etiqueta como prepublicación.", "capturado": captura},
        {"id": "europepmc", "nombre": "Europe PMC (literatura biomédica)", "uso": "Comprobación de identificadores PMID para artículos médicos.", "url": "https://europepmc.org/", "politica": "Índice de citas; recuperar un registro no prueba revisión por pares.", "capturado": captura},
        {"id": "nobel", "nombre": "NobelPrize.org", "uso": "Registro oficial de premios, laureados y motivaciones.", "url": "https://www.nobelprize.org/", "politica": "Sitio institucional del premio: se cita la motivación literal.", "capturado": captura},
        {"id": "clay", "nombre": "Clay Mathematics Institute", "uso": "Estado declarado del problema de Poincaré.", "url": "https://www.claymath.org/", "politica": "Sitio institucional del problema.", "capturado": captura},
    ]

    SALIDA.mkdir(parents=True, exist_ok=True)
    (SALIDA / "publicaciones.json").write_text(json.dumps(publicaciones, ensure_ascii=False, indent=1))
    (SALIDA / "ideas.json").write_text(json.dumps(salida_ideas, ensure_ascii=False, indent=1))
    (SALIDA / "catalogo.json").write_text(
        json.dumps(
            {
                "version": esp["version"],
                "captura": captura,
                "generado": esp["version"],
                "disciplinas": esp["disciplinas"],
                "instituciones": esp["instituciones"],
                "institucionesSinVerificar": esp["institucionesSinVerificar"],
                "premios": esp["premios"],
                "experimentos": esp["experimentos"],
                "tecnologias": esp["tecnologias"],
                "estanterias": esp["estanterias"],
                "divulgacion": esp.get("divulgacion", []),
                "fuentes": fuentes,
            },
            ensure_ascii=False,
            indent=1,
        )
    )
    (SALIDA / "cronologia.json").write_text(json.dumps(cronologia, ensure_ascii=False, indent=1))

    huella = hashlib.sha256(
        b"".join((SALIDA / f).read_bytes() for f in ["publicaciones.json", "ideas.json", "catalogo.json", "cronologia.json"])
    ).hexdigest()
    print(f"OK {len(publicaciones)} publicaciones · {len(salida_ideas)} ideas · {len(esp['premios'])} premios · {len(cronologia)} hitos")
    print("huella del índice:", huella)


if __name__ == "__main__":
    sys.exit(construir())
