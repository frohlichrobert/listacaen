"""Generează favicon.ico și assets/apple-touch-icon.png din aceeași geometrie
ca assets/icon.svg (monograma LC). Necesită Pillow: pip install pillow

Folosire: python3 bin/make-icons.py
"""
from pathlib import Path

from PIL import Image, ImageDraw

root = Path(__file__).resolve().parent.parent
BG, L_COLOR, C_COLOR = "#163028", "#fffdf8", "#e7a07a"
SS = 8  # supraeșantionare pentru margini fine


def draw(size: int, rounded: bool = True) -> Image.Image:
    big = size * SS
    u = big / 64  # unitatea din viewBox-ul 64x64 al SVG-ului
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    if rounded:
        d.rounded_rectangle([0, 0, big - 1, big - 1], radius=14 * u, fill=BG)
    else:
        d.rectangle([0, 0, big - 1, big - 1], fill=BG)

    # L: M8 16 h8 v24 h11 v8 H8 z
    d.polygon([(8 * u, 16 * u), (16 * u, 16 * u), (16 * u, 40 * u),
               (27 * u, 40 * u), (27 * u, 48 * u), (8 * u, 48 * u)], fill=L_COLOR)

    # C: arc cu centrul (42, 32), raza 10.5, grosime 7, deschis spre dreapta
    cx, cy, r, w = 42 * u, 32 * u, 10.5 * u, 7 * u
    d.arc([cx - r - w / 2, cy - r - w / 2, cx + r + w / 2, cy + r + w / 2],
          start=45, end=315, fill=C_COLOR, width=round(w))
    return img.resize((size, size), Image.LANCZOS)


sizes = [16, 32, 48]
draw(256).save(root / "favicon.ico", sizes=[(s, s) for s in sizes])
# iOS rotunjește singur colțurile, deci iconița e pătrată
draw(180, rounded=False).convert("RGB").save(root / "assets/apple-touch-icon.png")
print("favicon.ico", sizes, "+ assets/apple-touch-icon.png")
