#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
VANGUARD v39.1 — GENERADOR DE PÓSTERES DE RECLUTAMIENTO (WhatsApp-ready).
2 formatos:
  1) Historia/Estado WhatsApp: 1080x1920 (vertical)
  2) Chat/Grupo: 1080x1080 (cuadrado)
QR apunta a https://vanguard-kq9r.vercel.app/?ref=VGD-POSTER (rastreado).
Estilo: militar HUD oscuro, tipografía bold, sin dependencias externas de fuente
(usamos DejaVu Sans Bold disponible en el sistema).
"""
from PIL import Image, ImageDraw, ImageFont
import qrcode

W1, H1 = 1080, 1920   # historia/estado
W2, H2 = 1080, 1080   # post cuadrado

BG = (10, 10, 15)          # #0A0A0F casi negro
AMBER = (255, 193, 7)      # #FFC107
GREEN = (0, 255, 135)      # #00FF87
RED = (255, 59, 48)        # #FF3B30
WHITE = (245, 244, 238)
GREY = (140, 140, 150)

F = "/usr/share/fonts/truetype/dejavu/"
def font(sz, bold=True):
    return ImageFont.truetype(F + ("DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"), sz)

def make_qr(url, box):
    q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=12, border=2)
    q.add_data(url)
    q.make(fit=True)
    img = q.make_image(fill_color="#0A0A0F", back_color="#F5F4EE").convert("RGB")
    return img.resize((box, box), Image.NEAREST)

def scanlines(d, w, h, alpha=14, step=6):
    for y in range(0, h, step):
        d.rectangle([0, y, w, y + 2], fill=(20, 20, 28))

def corners(d, x0, y0, x1, y1, color, L=34, t=5):
    for (cx, cy, dx, dy) in [(x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)]:
        d.line([(cx, cy), (cx + dx * L, cy)], fill=color, width=t)
        d.line([(cx, cy), (cx, cy + dy * L)], fill=color, width=t)

def center_text(d, w, y, text, f, fill, tracking=0):
    if tracking:
        text = (" " * 1).join(list(text)) if tracking >= 2 else text
    bb = d.textbbox((0, 0), text, font=f)
    d.text(((w - (bb[2] - bb[0])) // 2, y), text, font=f, fill=fill)
    return y + (bb[3] - bb[1])

def poster(w, h, path, tagline2, bullets, qr_box, footer):
    img = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(img)
    scanlines(d, w, h)
    # barra superior de amenaza
    d.rectangle([0, 0, w, 12], fill=RED)
    d.rectangle([0, 12, w, 16], fill=AMBER)

    y = 70
    center_text(d, w, y, "E L   M U N D O   E N", font(34), GREY); y += 56
    bb = d.textbbox((0, y), "VANGUARD", font=font(148))
    d.text(((w - (bb[2] - bb[0])) // 2 + 5, y + 5), "VANGUARD", font=font(148), fill=(60, 42, 0))
    d.text(((w - (bb[2] - bb[0])) // 2, y), "VANGUARD", font=font(148), fill=AMBER)
    y = bb[3] + 30
    center_text(d, w, y, "TIEMPO REAL", font(52), WHITE); y += 100

    # tagline principal
    center_text(d, w, y, tagline2, font(40, True), GREEN)
    y += 70

    y += 30
    # divisor HUD
    d.line([(w // 6, y), (w - w // 6, y)], fill=(50, 50, 62), width=2); y += 40
    # bullets
    for b in bullets:
        bb2 = d.textbbox((0, 0), b, font=font(30, True))
        d.text(((w - (bb2[2] - bb2[0])) // 2, y), b, font=font(30, True), fill=WHITE)
        y += 56

    y += 34
    # marco QR
    qx = (w - qr_box) // 2
    d.rectangle([qx - 14, y - 14, qx + qr_box + 14, y + qr_box + 14], outline=AMBER, width=5)
    corners(d, qx - 26, y - 26, qx + qr_box + 26, y + qr_box + 26, GREEN, L=40, t=6)
    img.paste(make_qr("https://vanguard-kq9r.vercel.app/?ref=VGD-POSTER", qr_box), (qx, y))
    y += qr_box + 58

    center_text(d, w, y, "ESCANEA Y ENTRA AL MANDO", font(34, True), AMBER); y += 58
    center_text(d, w, y, "vanguard-kq9r.vercel.app", font(36, True), WHITE); y += 64
    center_text(d, w, y, footer, font(24, False), GREY)

    # barra inferior
    d.rectangle([0, h - 46, w, h - 40], fill=GREEN)
    d.rectangle([0, h - 40, w, h], fill=(14, 14, 20))
    img.save(path, "PNG", optimize=True)
    print("OK", path, img.size)

poster(W1, H1, "/home/z/my-project/download/vanguard-poster-historia.png",
       "MAPA DE GUERRA 3D EN VIVO",
       ["Aviones, tanques y flotas en el mapa",
        "Noticias de guerra reales 24/7",
        "Multijugador mundial por rondas",
        "Gratis · sin instalar nada"],
       qr_box=470,
       footer="8 IDIOMAS · NOTICIAS VERIFICADAS POR FUENTE · COMUNIDAD GLOBAL")

poster(W2, H2, "/home/z/my-project/download/vanguard-poster-cuadrado.png",
       "GUERRA GLOBAL EN VIVO",
       ["Mapa 3D militar · Noticias 24/7 · Multijugador",
        "Gratis · sin instalar nada"],
       qr_box=380,
       footer="8 IDIOMAS · PWA INSTALABLE · COMUNIDAD GLOBAL")
