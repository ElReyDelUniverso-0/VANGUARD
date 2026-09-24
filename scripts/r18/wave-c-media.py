#!/usr/bin/env python3
# RONDA 18 — WAVE C: 3 banners PNG + 1 boletín PDF → catbox.moe
# Formatos NUEVOS de difusión: imagen y documento descargable.
import subprocess, os
os.makedirs("/tmp/r18/img", exist_ok=True)
LOG = "/home/z/my-project/scripts/campaign-results.txt"

# ---------- banners con PIL ----------
from PIL import Image, ImageDraw, ImageFont, ImageFilter

F_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
F_REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

def banner(path, l1, l2, sub, accent=(78, 227, 138)):
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), (10, 14, 18))
    d = ImageDraw.Draw(img)
    # degradado de fondo (azul militar -> oscuro)
    for y in range(H):
        t = y / H
        r = int(13 + 10 * (1 - t)); g = int(20 + 14 * (1 - t)); b = int(26 + 18 * (1 - t))
        d.line([(0, y), (W, y)], fill=(r, g, b))
    # cuadrícula táctica sutil
    for x in range(0, W, 60):
        d.line([(x, 0), (x, H)], fill=(18, 26, 33), width=1)
    for y in range(0, H, 60):
        d.line([(0, y), (W, y)], fill=(18, 26, 33), width=1)
    # banda de acento
    d.rectangle([0, 0, W, 8], fill=accent)
    d.rectangle([0, H - 8, W, H], fill=(55, 182, 255))
    # textos
    f1 = ImageFont.truetype(F_BOLD, 92)
    f2 = ImageFont.truetype(F_BOLD, 44)
    f3 = ImageFont.truetype(F_REG, 30)
    f4 = ImageFont.truetype(F_BOLD, 34)
    d.text((70, 90), l1, font=f1, fill=(232, 230, 227))
    d.text((70, 210), l2, font=f2, fill=accent)
    d.text((70, 300), sub, font=f3, fill=(159, 176, 187))
    # caja URL
    d.rounded_rectangle([70, 420, 1130, 500], radius=14, fill=(20, 32, 42), outline=(55, 182, 255), width=2)
    d.text((100, 445), "https://vanguard-kq9r.vercel.app", font=f4, fill=(78, 227, 138))
    d.text((70, 540), "GRATIS · SIN REGISTRO · EN EL NAVEGADOR · 8 IDIOMAS", font=ImageFont.truetype(F_REG, 24), fill=(93, 109, 120))
    img.save(path, "PNG")

banner("/tmp/r18/img/vg-mision200.png", "VANGUARD", "MISIÓN DE DIFUSIÓN 200", "Progreso en vivo: al llegar a 200 enlaces públicos, TODOS cobran 3.000 monedas + 30 gemas.", (78, 227, 138))
banner("/tmp/r18/img/vg-planeta.png", "VANGUARD", "EL PLANETA, EN VIVO", "NASA EONET · sismos USGS · divisas en crisis · noticias de 5 fuentes · globo 3D OSINT de 15 capas.", (55, 182, 255))
banner("/tmp/r18/img/vg-83.png", "VANGUARD", "83 SECCIONES · 11 MUNDOS", "Buscador Ctrl+K · botón SORPRÉNDEME · monedas por explorar · guerra multijugador ELO.", (255, 184, 77))

# ---------- boletín PDF con reportlab ----------
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas

pdf_path = "/tmp/r18/img/vg-boletin.pdf"
c = canvas.Canvas(pdf_path, pagesize=A4)
W, H = A4
BG = HexColor("#0a0e12"); FG = HexColor("#e8e6e3"); GR = HexColor("#4ee38a"); BL = HexColor("#37b6ff"); MUT = HexColor("#9fb0bb")
c.setFillColor(BG); c.rect(0, 0, W, H, fill=1, stroke=0)
c.setFillColor(GR); c.rect(0, H - 10 * mm, W, 10 * mm, fill=1, stroke=0)

def txt(x, y, s, size=11, color=FG, bold=False):
    c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
    c.setFillColor(color); c.drawString(x, y, s)

y = H - 40 * mm
txt(25 * mm, y, "VANGUARD — BOLETÍN DE GUERRA Nº 1", 24, GR, True); y -= 12 * mm
txt(25 * mm, y, "El mundo en tiempo real · juego gratuito de navegador", 12, MUT); y -= 16 * mm

lines = [
    ("MISIÓN DE DIFUSIÓN 200", 14, BL, True),
    ("El comando ha fijado una nueva meta: 200 enlaces públicos de VANGUARD en lugares", 11, FG, False),
    ("diferentes — blogs, wikis, foros, pastebins, imágenes, acortadores. El progreso en", 11, FG, False),
    ("vivo se ve en la portada del juego, y al alcanzar la meta TODOS los agentes podrán", 11, FG, False),
    ("reclamar 3.000 monedas + 30 gemas + 500 XP (un reclamo por jugador, sin trampas).", 11, FG, False),
    ("", 6, FG, False),
    ("QUÉ HAY DENTRO DEL JUEGO", 14, BL, True),
    ("· Guerra global multijugador con duelos ELO y ranking mundial.", 11, FG, False),
    ("· Globo 3D OSINT de 15 capas con conflictos y unidades en vivo.", 11, FG, False),
    ("· NASA EONET: volcanes, incendios, sismos y tormentas activos ahora mismo.", 11, FG, False),
    ("· Divisas en crisis: rial iraní, rublo, bolívar y 13 monedas más, tasas reales/hora.", 11, FG, False),
    ("· Noticias de 5 fuentes: GDELT, BBC Mundo, France 24, DW, Al Jazeera, ABC.", 11, FG, False),
    ("· Explorador de mundos: 83 secciones, buscador Ctrl+K, monedas por descubrir.", 11, FG, False),
    ("· Mercado, bolsa, bookmaker, armería, drones, espionaje y 50+ sistemas más.", 11, FG, False),
    ("", 6, FG, False),
    ("CÓMO SUMAR A LA MISIÓN", 14, BL, True),
    ("Publica el enlace del juego en un sitio NUEVO. Cada lugar diferente suma al", 11, FG, False),
    ("contador global verificado. Comparte con tu código VGD-TU_ALIAS y gana monedas", 11, FG, False),
    ("extra por cada 3 invitaciones.", 11, FG, False),
]
for s, size, col, bold in lines:
    txt(25 * mm, y, s, size, col, bold); y -= (size + 2.6) * mm

c.setFillColor(HexColor("#14202a")); c.setStrokeColor(BL); c.setLineWidth(2)
c.roundRect(25 * mm, 22 * mm, W - 50 * mm, 16 * mm, 4 * mm, fill=1, stroke=1)
txt(33 * mm, 28 * mm, "JUGAR AHORA: https://vanguard-kq9r.vercel.app", 15, GR, True)
c.save()

# ---------- subir todo a catbox.moe ----------
results = []
for f in ["vg-mision200.png", "vg-planeta.png", "vg-83.png", "vg-boletin.pdf"]:
    p = f"/tmp/r18/img/{f}"
    r = subprocess.run(["curl", "-s", "--max-time", "60", "-F", "reqtype=fileupload", "-F", f"fileToUpload=@{p}", "https://catbox.moe/user/api.php"], capture_output=True, text=True, timeout=90)
    out = r.stdout.strip()
    ok = out.startswith("https://files.catbox.moe/")
    results.append(f"[catbox] {f} → {out if ok else 'ERR:' + out[:70]}")

with open(LOG, "a") as lg:
    lg.write("=== R18 WAVE C (catbox media) ===\n")
    for r in results:
        print(r); lg.write(r + "\n")
    lg.write("=== R18 WAVE C FIN ===\n")
