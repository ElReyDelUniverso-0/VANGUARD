#!/usr/bin/env python3
"""
v405.9 · UNA SOLA PORTADA — la imagen de VANGUARD para las salas
ia3 (Arena)

QUÉ HACE
  Fabrica las DOS piezas gráficas que faltaban en la casa, a partir de una
  fotografía REAL de dominio público (NASA):

    public/portada-vanguard.jpg   3840x1920  la portada única de VANGUARD
    public/og-vanguard.jpg        1200x630   la misma portada con el nombre,
                                             para cuando la enseña un enlace
                                             (WhatsApp, X, Telegram) y no hay CSS

POR QUÉ
  Orden del Dueño: «las salas de juego fusiónalas con el VANGUARD de portada,
  el de noticias en un solo VANGUARD». Había dos portadas distintas (la del
  mundo NOTICIAS y la del mundo JUEGO) y cada sala con su dibujo. Ahora hay UNA
  portada que sirve para las dos puertas y para las salas de juego.

CÓMO SE USA
  python3 scripts/portada-vanguard.py

REGLA DE LA CASA
  La foto es de la NASA (dominio público, sin atribución obligatoria) y su
  origen queda escrito en public/portada-vanguard.json. El nombre se dibuja
  SOLO en la pieza de enlace: sobre el sitio el título lo pone el HTML, así que
  en la portada grande no hay letras pegadas al píxel.
"""
from __future__ import annotations

import json
import os
import urllib.request

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

UA = {"User-Agent": "VANGUARD/1.0 (portada; cuevasgabriel371@gmail.com)"}
API = "https://commons.wikimedia.org/w/api.php"
PUBLIC = os.path.join(os.path.dirname(__file__), "..", "public")
PORTADA = os.path.join(PUBLIC, "portada-vanguard.jpg")
ENLACE = os.path.join(PUBLIC, "og-vanguard.jpg")
LIGERA = os.path.join(PUBLIC, "portada-vanguard-1920.jpg")
FUENTE = os.path.join(PUBLIC, "portada-vanguard.json")

TITULO = "File:ISS-65 Northwest America at night, city lights.jpg"
ANCHO, ALTO = 3840, 1920
ORO = (232, 197, 106)
FUENTE_NEGRITA = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


def descargar(titulo: str) -> tuple[Image.Image, dict]:
    import urllib.parse

    url = API + "?" + urllib.parse.urlencode({
        "action": "query", "format": "json", "titles": titulo,
        "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": 4800,
    })
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
        d = json.load(r)
    p = list(d["query"]["pages"].values())[0]
    ii = p["imageinfo"][0]
    src = ii["url"]
    if int(ii["width"]) * int(ii["height"]) > 60_000_000:
        src = ii.get("thumburl") or src
    with urllib.request.urlopen(urllib.request.Request(src, headers=UA), timeout=180) as r:
        datos = r.read()
    tmp = os.path.join(PUBLIC, "_portada.tmp")
    with open(tmp, "wb") as f:
        f.write(datos)
    im = Image.open(tmp).convert("RGB")
    os.remove(tmp)
    em = ii.get("extmetadata", {})
    info = {
        "titulo_original": titulo,
        "origen": ii.get("descriptionurl", ""),
        "original": ii["url"],
        "licencia": (em.get("LicenseShortName", {}) or {}).get("value", "?"),
        "autor": (em.get("Artist", {}) or {}).get("value", ""),
    }
    return im, info


def recortar(im: Image.Image, ancho: int, alto: int, sesgo: float = 0.45) -> Image.Image:
    """Recorte centrado con sesgo vertical (0 = arriba, 1 = abajo)."""
    objetivo = ancho / alto
    w, h = im.size
    if w / h > objetivo:
        nw = int(h * objetivo)
        x = (w - nw) // 2
        im = im.crop((x, 0, x + nw, h))
    else:
        nh = int(w / objetivo)
        y = int((h - nh) * sesgo)
        im = im.crop((0, y, w, y + nh))
    return im.resize((ancho, alto), Image.LANCZOS)


def graduar(im: Image.Image) -> Image.Image:
    """Un grado de cine: un poco más de contraste y un velo oscuro abajo, para
    que el título en oro que pinta el HTML se lea sin caja de texto."""
    im = ImageEnhance.Contrast(im).enhance(1.08)
    im = ImageEnhance.Color(im).enhance(1.06)
    velo = Image.new("L", (1, im.height))
    for y in range(im.height):
        t = y / max(1, im.height - 1)
        # negro al 62 % en el pie, nada en la mitad de arriba
        velo.putpixel((0, y), int(255 * max(0.0, (t - 0.42)) ** 1.6 * 0.62))
    velo = velo.resize(im.size)
    negro = Image.new("RGB", im.size, (6, 8, 12))
    return Image.composite(negro, im, velo)


def guardar(im: Image.Image, ruta: str, objetivo_kb: int) -> int:
    for q in (78, 72, 66, 60, 54):
        im.save(ruta, "JPEG", quality=q, optimize=True, progressive=True)
        if os.path.getsize(ruta) <= objetivo_kb * 1024:
            break
    return os.path.getsize(ruta)


def pieza_enlace(im: Image.Image) -> Image.Image:
    """1200x630 con el nombre: es lo único que ve quien recibe el enlace."""
    base = recortar(im, 1200, 630, sesgo=0.4).filter(ImageFilter.GaussianBlur(0.4))
    base = ImageEnhance.Brightness(base).enhance(0.82)
    velo = Image.new("L", base.size, 0)
    d = ImageDraw.Draw(velo)
    for y in range(base.height):
        t = y / base.height
        d.line([(0, y), (base.width, y)], fill=int(200 * max(0.0, t - 0.15) ** 1.5))
    base = Image.composite(Image.new("RGB", base.size, (5, 7, 11)), base, velo)

    dib = ImageDraw.Draw(base)
    # esquinas de mira (el mismo lenguaje que la casa)
    for x, y, sx, sy in ((44, 44, 1, 1), (1156, 44, -1, 1), (44, 586, 1, -1), (1156, 586, -1, -1)):
        dib.line([(x, y), (x + sx * 34, y)], fill=ORO, width=2)
        dib.line([(x, y), (x, y + sy * 34)], fill=ORO, width=2)

    # el nombre, con letra espaciada (se dibuja letra a letra)
    f_tit = ImageFont.truetype(FUENTE_NEGRITA, 92)
    letras = "VANGUARD"
    espacio = 14
    anchos = [dib.textlength(c, font=f_tit) for c in letras]
    total = int(sum(anchos) + espacio * (len(letras) - 1))
    x = 78
    y = base.height - 265  # deja aire abajo: las esquinas de mira van al pie
    for c, w in zip(letras, anchos):
        dib.text((x, y), c, font=f_tit, fill=ORO)
        x += w + espacio

    dib.line([(78, y + 122), (78 + total, y + 122)], fill=(232, 197, 106, 180), width=3)
    f_sub = ImageFont.truetype(FUENTE_NEGRITA, 26)
    dib.text((80, y + 142), "I N T E L I G E N C I A   A B I E R T A   ·   J U E G O   G L O B A L",
             font=f_sub, fill=(214, 222, 236))
    return base


def main(argv: list[str]) -> int:
    import sys as _s
    titulo = argv[0] if argv else TITULO
    destino = argv[1] if len(argv) > 1 else PORTADA
    im, info = descargar(titulo)
    grande = graduar(recortar(im, ANCHO, ALTO))
    kb = guardar(grande, destino, 620)
    kb3 = 0
    if len(argv) <= 1:  # copia ligera para la banda de las 155 puertas de sala
        kb3 = guardar(graduar(recortar(im, 1920, 960)).resize((1920, 960), Image.LANCZOS), LIGERA, 210)
    kb2 = 0
    if len(argv) <= 1:
        kb2 = guardar(pieza_enlace(im), ENLACE, 240)
    with open(FUENTE, "w", encoding="utf-8") as f:
        json.dump({
            "portada": {"archivo": "portada-vanguard.jpg", "resolucion": f"{ANCHO}x{ALTO}", **info},
            "enlace": {"archivo": "og-vanguard.jpg", "resolucion": "1200x630", **info},
        }, f, ensure_ascii=False, indent=2)
    print(f"✓ portada-vanguard.jpg  {ANCHO}x{ALTO}  {kb/1024:.0f} KB")
    print(f"✓ og-vanguard.jpg       1200x630    {kb2/1024:.0f} KB")
    if kb3:
        print(f"✓ portada-vanguard-1920.jpg  1920x960  {kb3/1024:.0f} KB")
    print(f"  fuente: {info['titulo_original']} [{info['licencia']}]")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(__import__("sys").argv[1:]))
