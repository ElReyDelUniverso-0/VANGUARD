#!/usr/bin/env python3
"""
v405.9 · LAS FOTOS DE VERDAD — de ilustración de IA a fotografía real en 4K
ia3 (Arena)

QUÉ HACE
  Sustituye una ilustración de `public/ilustraciones/` por una FOTOGRAFÍA REAL
  en 3840x1920, descargada de Wikimedia Commons y **solo de licencia dominio
  público** (obras del Gobierno de EE. UU., NASA, DVIDS…). Las CC BY-SA quedan
  fuera a propósito: obligan a atribuir en cada página que las muestre y la casa
  no tiene hoy un hueco de créditos.

  El archivo conserva SU NOMBRE. Eso es lo importante: ninguna página, componente
  ni `regla-oro.ts` cambia una línea. El sitio entero mejora sin tocar el sitio.

POR QUÉ
  Medido el 16-nov en las 107 ilustraciones: 104 eran de 1408x704 y 3 de
  1344x768 — un megapíxel. En una pantalla de 3840 px eso se estira 2,7 veces y
  se ve blando. Ese es el «se ven mal» que reportó el Dueño. No era el diseño:
  era la resolución y que eran dibujos de IA en vez de fotos.

CÓMO SE USA
  python3 scripts/ilustraciones-4k.py noticias mapa radar     # unas pocas
  python3 scripts/ilustraciones-4k.py --todas                  # las 99 restantes
  python3 scripts/ilustraciones-4k.py noticias --buscar "..."  # otra búsqueda

  Deja constancia de cada sustitución en `public/ilustraciones/FUENTES-4K.json`
  (URL original + licencia + autor), para que nunca haya una foto sin origen.

REGLAS DE LA CASA QUE RESPETA
  · REGLA #1: el archivo original no se borra de la historia — queda en git.
  · Cero datos inventados: si la búsqueda no devuelve una foto de dominio público
    de al menos ANCHO_MIN, ese archivo NO se toca y se avisa. Mejor quedarse con
    lo que hay que poner un relleno.
"""
from __future__ import annotations

import json
import os
import sys
import urllib.parse
import urllib.request

from PIL import Image

ANCHO = 3840
ALTO = 1920
ANCHO_MIN = 2400
# Solo licencias que NO obligan a poner crédito en cada página:
# dominio público y CC0 (dedicación). Las CC BY / CC BY-SA quedan fuera.
LICENCIAS_LIBRES = ("public domain", "cc0", "pd-", "no restrictions")
CALIDAD = 80
UA = {"User-Agent": "VANGUARD/1.0 (mejora de ilustraciones; cuevasgabriel371@gmail.com)"}
API = "https://commons.wikimedia.org/w/api.php"
DESTINO = os.path.join(os.path.dirname(__file__), "..", "public", "ilustraciones")
MANIFIESTO = os.path.join(DESTINO, "FUENTES-4K.json")

# Búsquedas curadas por archivo (nombre sin .jpg → consulta en Commons)
BUSQUEDAS = {
    "noticias": "Pentagon Press Secretary briefing media",
    "mundo": "Earth at night NASA Black Marble",
    "mapa": "topographic map",
    "planeta": "The Blue Marble Apollo 17 Earth",
    "radar": "radar antenna",
    "simulador": "flight simulator cockpit",
    "frente": "soldiers night patrol DVIDS",
    "osint": "reconnaissance satellite imagery",
    "operaciones": "US Navy aircraft carrier flight deck operations",
    "abusos": "refugee camp humanitarian aid",
    "agente": "FBI special agent training",
    "alianzas": "NATO summit meeting",
    "amigos": "multinational soldiers exercise",
    "apuestas": "casino",
    "arcade": "pinball machine",
    "armeria": "military armory weapons rack",
    "ayuda": "humanitarian aid delivery",
    "banco": "bank vault door",
    "biblioteca": "Library of Congress reading room",
    "bolsa": "stock exchange trading floor",
    "bolsamonedas": "coins banknotes currency",
    "bookmaker": "horse racing spectators track",
    "briefing": "Pentagon briefing room podium",
    "briefings": "White House press briefing room",
    "camaras": "CCTV surveillance camera",
    "canales": "television news studio",
    "carteles": "propaganda posters wall",
    "centinela": "military sentry guard tower",
    "ciber": "cyber operations center screens",
    "cielos": "fighter jets formation sky",
    "combate": "soldiers combat training",
    "conquistas3d": "satellite terrain mountains",
    "consejo": "General Assembly hall",
    "constructor": "construction site crane",
    "contadores": "data center server racks",
    "contribuidores": "conference table meeting",
    "creador": "cartography map drafting",
    "crisis": "emergency operations center",
    "curiosidades": "Design Museum exhibits",
    "detective": "forensic investigation evidence",
    "directos": "live broadcast studio camera",
    "divisas": "foreign currency exchange board",
    "dronguerra": "military drone UAV",
    "edad": "ancient ruins archaeological",
    "embajadores": "embassy diplomatic building",
    "empleos": "job fair recruitment",
    "enciclopedia": "old books",
    "encuestas": "ballot paper",
    "envivo": "television broadcast control room",
    "epocas": "museum aircraft",
    "espectro": "radio antenna tower array",
    "espionaje": "surveillance satellite imagery",
    "estadisticas": "scoreboard",
    "estudio": "broadcast studio set",
    "evaluacion": "military training evaluation",
    "expedientes": "classified documents archive files",
    "foros": "computer discussion forum",
    "foryou": "mobile phone",
    "frentes": "soldiers frontline patrol",
    "fusion": "nuclear fusion reactor",
    "galeria": "art gallery exhibition",
    "gancho": "fish hook",
    "geopolitica": "world globe geopolitics",
    "gobierno": "capitol government building",
    "hangar": "Exercise Aircraft Maintenance",
    "historia": "historic newspaper archive",
    "incidentes": "emergency responders scene",
    "logros": "trophy",
    "maps": "world atlas map",
    "memes": "newspaper comic strip",
    "memorial": "war memorial monument",
    "mercados": "grocery store",
    "mi-pais": "United Nations Headquarters flags",
    "minijuego": "chess",
    "misiones": "peacekeeping mission soldiers",
    "modoar": "Oculus Rift headset",
    "muertes": "military cemetery",
    "multijugador": "esports gaming tournament",
    "mundial": "Earthrise",
    "notificaciones": "screen interface",
    "ojo-dios": "satellite orbit earth",
    "oscura": "night vision operation",
    "perdidas": "wreckage aftermath ruins",
    "perfil": "portrait identification photo",
    "predicciones": "hurricane satellite",
    "pulso": "hospital heart monitor",
    "pulsos": "medical monitor vitals",
    "quiz": "classroom",
    "racha": "marathon runners",
    "ranking": "leaderboard",
    "recluta": "military recruits basic training",
    "recompensas": "medal",
    "registro": "registration desk",
    "retos": "obstacle course challenge",
    "sala18": "neon night city bar",
    "salas": "mission operations control room",
    "sismo": "earthquake damage seismograph",
    "studios": "film studio lot",
    "telegram": "radio room",
    "tienda": "supermarket",
    "torneos": "chess tournament",
    "tribunal": "courtroom",
    "verdades": "investigation documents evidence",
    "verifica": "magnifying glass documents",
    "videos": "video editing timeline",
    "warsim": "military wargame simulation table",
    "wikiguerra": "military history archive",
}


def _api(params: dict) -> dict:
    url = API + "?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return json.load(r)


def candidatas(consulta: str, limite: int = 20) -> list[dict]:
    d = _api({
        "action": "query", "format": "json", "generator": "search",
        "gsrsearch": consulta, "gsrnamespace": 6, "gsrlimit": limite,
        "prop": "imageinfo", "iiprop": "url|size|extmetadata",
        # miniatura a 4800 px: los originales de la NASA llegan a 43.200 px y
        # 933 Mpx — PIL los rechaza (y con razón) y la caja no tiene memoria.
        "iiurlwidth": 4800,
    })
    salida = []
    for p in (d.get("query", {}).get("pages") or {}).values():
        ii = p["imageinfo"][0]
        em = ii.get("extmetadata", {})
        lic = (em.get("LicenseShortName", {}) or {}).get("value", "?")
        autor = (em.get("Artist", {}) or {}).get("value", "")
        salida.append({
            "titulo": p["title"], "url": ii["url"], "ancho": ii["width"],
            "alto": ii["height"], "licencia": lic, "autor": autor,
            "pagina": ii.get("descriptionurl", ""),
            "miniatura": ii.get("thumburl", ""),
        })
    return salida


def variantes(consulta: str) -> list[str]:
    """Commons exige que aparezcan TODAS las palabras. Si la frase completa no
    da nada, se prueba más corta antes de rendirse (nunca se inventa el tema)."""
    pal = consulta.split()
    v = [consulta]
    if len(pal) > 2:
        v.append(" ".join(pal[:2]))
    if len(pal) > 1:
        v.append(pal[0])
    return v


def elegir(lista: list[dict]) -> dict | None:
    """La foto más grande de DOMINIO PÚBLICO que sirva. Nada de CC-BY."""
    # ojo: las URLs de Commons llevan querystring (?_campaign=…), así que la
    # extensión se mira SOLO en el camino, no en la cadena entera.
    def es_imagen(u: str) -> bool:
        camino = urllib.parse.urlsplit(u).path.lower()
        return camino.endswith((".jpg", ".jpeg", ".png"))

    validas = [
        c for c in lista
        if c["ancho"] >= ANCHO_MIN
        and c["licencia"].strip().lower().startswith(LICENCIAS_LIBRES)
        and es_imagen(c["url"])
    ]
    return max(validas, key=lambda c: c["ancho"] * c["alto"]) if validas else None


MAX_PIXELES_SEGUROS = 60_000_000  # 60 Mpx: por encima, se usa la miniatura


def recortar_y_guardar(cand: dict, destino: str) -> tuple[int, int]:
    fuente = cand["url"]
    if cand["ancho"] * cand["alto"] > MAX_PIXELES_SEGUROS and cand.get("miniatura"):
        fuente = cand["miniatura"]
    with urllib.request.urlopen(urllib.request.Request(fuente, headers=UA), timeout=180) as r:
        datos = r.read()
    tmp = destino + ".tmp"
    with open(tmp, "wb") as f:
        f.write(datos)
    try:
        im = Image.open(tmp).convert("RGB")
        # recorte centrado al 2:1 que usan todas las ilustraciones de la casa
        objetivo = 2.0
        w, h = im.size
        if w / h > objetivo:
            nuevo_w = int(h * objetivo)
            x = (w - nuevo_w) // 2
            im = im.crop((x, 0, x + nuevo_w, h))
        else:
            nuevo_h = int(w / objetivo)
            y = (h - nuevo_h) // 2
            im = im.crop((0, y, w, y + nuevo_h))
        im = im.resize((ANCHO, ALTO), Image.LANCZOS)
        # calidad adaptativa: mismo tamaño 4K, pero ninguna foto debe pesar más
        # de ~700 KB (la casa se sirve a móvil; 1,2 MB por héroe es un castigo).
        for q in (CALIDAD, 72, 66, 60):
            im.save(destino, "JPEG", quality=q, optimize=True, progressive=True)
            if os.path.getsize(destino) <= 700 * 1024:
                break
        return im.size
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)


def anotar(manifiesto: dict, clave: str, cand: dict) -> None:
    manifiesto[clave] = {
        "archivo": f"{clave}.jpg",
        "resolucion": f"{ANCHO}x{ALTO}",
        "origen": cand["pagina"],
        "original": cand["url"],
        "titulo_original": cand["titulo"],
        "licencia": cand["licencia"],
        "autor": cand["autor"],
        "buscado": BUSQUEDAS.get(clave, ""),
    }


PESO_OBJETIVO = 640 * 1024  # KB por foto 4K: suficiente para que se vea limpia


def repesar(manifiesto: dict, claves: list[str]) -> tuple[int, list[str]]:
    """Re-codifica desde el ORIGINAL (no re-comprime lo ya comprimido) las fotos
    que se pasaron del objetivo. Mismo encuadre, mismo nombre, menos peso."""
    hechas, fallos = 0, []
    for clave in claves:
        destino = os.path.join(DESTINO, f"{clave}.jpg")
        info = manifiesto.get(clave)
        if not info or not os.path.exists(destino):
            continue
        try:
            ancho_real = Image.open(destino).size[0]
        except Exception:
            ancho_real = ANCHO
        if ancho_real >= ANCHO and os.path.getsize(destino) <= PESO_OBJETIVO:
            continue  # ya está en 4K y en peso
        try:
            d = _api({"action": "query", "format": "json", "titles": info["titulo_original"],
                      "prop": "imageinfo", "iiprop": "url|size", "iiurlwidth": 4800})
            p_ = list(d["query"]["pages"].values())[0]
            ii = p_["imageinfo"][0]
            url = ii["url"]
            if int(ii["width"]) * int(ii["height"]) > MAX_PIXELES_SEGUROS:
                url = ii.get("thumburl") or url
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=180) as r:
                datos = r.read()
            tmp = destino + ".tmp"
            open(tmp, "wb").write(datos)
            im = Image.open(tmp).convert("RGB")
            w, h = im.size
            if w / h > 2.0:
                nw = int(h * 2.0); x = (w - nw) // 2; im = im.crop((x, 0, x + nw, h))
            else:
                nh = int(w / 2.0); y = (h - nh) // 2; im = im.crop((0, y, w, y + nh))
            im = im.resize((ANCHO, ALTO), Image.LANCZOS)
            # La casa promete 4K: NUNCA se baja la resolución para ahorrar peso.
            # Si el detalle (mapas, grabados, periódicos) no cabe, se baja la
            # calidad del JPEG hasta 46 — se ve mejor un 4K con más compresión
            # que un 3200 nítido, porque el tamaño es lo que se nota al ampliar.
            for q in (76, 70, 64, 58, 52, 46):
                im.save(destino, "JPEG", quality=q, optimize=True, progressive=True)
                if os.path.getsize(destino) <= PESO_OBJETIVO:
                    break
            os.remove(tmp)
            hechas += 1
        except Exception as e:
            fallos.append(f"{clave}: {e}")
    return hechas, fallos


def main(argv: list[str]) -> int:
    claves: list[str] = []
    modo_repeso = False
    consulta_manual = None
    i = 0
    while i < len(argv):
        a = argv[i]
        if a == "--repeso":
            modo_repeso = True
        elif a == "--todas":
            claves += [c for c in BUSQUEDAS if os.path.exists(os.path.join(DESTINO, c + ".jpg"))]
        elif a == "--buscar":
            i += 1
            consulta_manual = argv[i] if i < len(argv) else None
        elif not a.startswith("--"):
            claves.append(a)
        i += 1

    manifiesto = {}
    if os.path.exists(MANIFIESTO):
        with open(MANIFIESTO, encoding="utf-8") as f:
            manifiesto = json.load(f)

    if modo_repeso:
        objetivo = claves or list(manifiesto)
        hechas, fallos = repesar(manifiesto, objetivo)
        print(f"\nRepesadas: {hechas} · Fallos: {len(fallos)}")
        for f_ in fallos:
            print("  ✗", f_)
        return 0

    if not claves:
        print(__doc__)
        return 1

    hechas, fallos = 0, []
    for clave in claves:
        destino = os.path.join(DESTINO, f"{clave}.jpg")
        if not os.path.exists(destino):
            fallos.append(f"{clave}: el archivo no existe")
            continue
        consulta = consulta_manual or BUSQUEDAS.get(clave) or f"{clave} military"
        cand = None
        try:
            for v in variantes(consulta):
                cand = elegir(candidatas(v))
                if cand:
                    consulta = v
                    break
        except Exception as e:  # red caída: se declara, no se rellena
            fallos.append(f"{clave}: búsqueda falló ({e})")
            continue
        if not cand:
            fallos.append(f"{clave}: sin foto libre ≥{ANCHO_MIN}px para «{consulta}»")
            continue
        try:
            recortar_y_guardar(cand, destino)
        except Exception as e:
            fallos.append(f"{clave}: descarga/recorte falló ({e})")
            continue
        anotar(manifiesto, clave, cand)
        peso = os.path.getsize(destino) / 1024
        print(f"  ✓ {clave:<14} {ANCHO}x{ALTO}  {peso:6.0f} KB  [{cand['licencia']}]  {cand['titulo'][:58]}")
        hechas += 1

    with open(MANIFIESTO, "w", encoding="utf-8") as f:
        json.dump(manifiesto, f, ensure_ascii=False, indent=2)

    print(f"\nHechas: {hechas} · Fallos: {len(fallos)}")
    for f_ in fallos:
        print("  ✗", f_)
    return 0 if hechas or not fallos else 2


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
