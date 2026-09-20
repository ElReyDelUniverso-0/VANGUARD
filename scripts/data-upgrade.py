#!/usr/bin/env python3
"""Add real photo images, camera shop items, camera achievements, DC-9 challenge."""
p = "/home/z/my-project/src/lib/game-data.ts"
src = open(p, encoding="utf8").read()

# 1) PHOTOS -> real images
seed2img = {
    "ukraine-grid": "ukraine-substation", "ukraine-trench": "ukraine-trench",
    "gaza-building": "gaza-urban", "gaza-aid": "gaza-convoy",
    "lebanon-patrol": "border-check", "sudan-street": "gaza-urban",
    "elfasher-camp": "refugee-camp", "redsea-ship": "naval-ship",
    "taiwan-jet": "jet-patrol", "korea-dmz": "border-check",
    "sahel-base": "night-convoy", "hormuz-boat": "naval-ship",
    "somalia-check": "border-check", "congo-camp": "refugee-camp",
    "afghan-patrol": "night-convoy", "yemen-building": "gaza-urban",
    "syria-convoy": "gaza-convoy", "moz-gas": "refinery-fire",
    "mexico-op": "border-check", "kashmir-loc": "border-check",
    "karakh-city": "bridge-collapsed", "ukr-trench2": "ukraine-trench",
    "ukr-drone2": "ukraine-substation", "gaza-tunnel": "border-check",
    "gaza-hospital": "gaza-urban", "sudan-market": "gaza-urban",
    "leb-rocket": "gaza-urban", "rs-missile": "naval-ship",
    "tw-naval": "naval-ship", "kor-guard": "border-check",
    "sahel-ambush": "night-convoy",
}
missing = []
for seed, img in seed2img.items():
    old = f'seed: "{seed}" }}'
    if old in src:
        src = src.replace(old, f'seed: "{seed}", image: "/assets/osint/{img}.png" }}')
    else:
        missing.append(seed)
print("photos missing:", missing)

# 2) Shop: cameras + ELITE pass appended before closing bracket of SHOP_ITEMS
cam_items = '''  { id: "CAM_BASIC", title: "Camara GUARD-100", description: "Vigilancia estandar. Coloca donde quieras: capta eventos y genera intel 24/7.", cost: 350, currency: "COINS", category: "CAMERA" as any, icon: "camera" },
  { id: "CAM_THERMAL", title: "Camara TERMICA 300", description: "Vision termica nocturna, radio ampliado y mayor recaudacion de intel.", cost: 850, currency: "COINS", category: "CAMERA" as any, icon: "cctv" },
  { id: "CAM_TACTIC", title: "Camara 4K TACTICA", description: "Unidad de reconocimiento 4K con analisis automatico. Alta rentabilidad.", cost: 1600, currency: "COINS", category: "CAMERA" as any, icon: "cctv" },
  { id: "CAM_PANO", title: "Panoramica 360-X", description: "Cobertura hemisferica: vigila varios frentes simultaneamente.", cost: 2400, currency: "COINS", category: "CAMERA" as any, icon: "video" },
  { id: "CAM_ORBITAL", title: "Enlace Orbital V-9", description: "Nodo satelital de elite: continentes enteros bajo tu vigilancia. El nodo mas rentable.", cost: 10, currency: "GEMS", category: "CAMERA" as any, icon: "satellite" },
  { id: "ELITE_PASS", title: "PASE ELITE (7 dias)", description: "Ingresos de camaras x2, 3 gemas diarias, 15% de descuento en camaras y credencial ELITE.", cost: 15, currency: "GEMS", category: "ELITE" as any, icon: "crown" },
];
'''
old_shop_tail = '''  { id: "CONSUMABLE_AMMO", title: "Municion extra", description: "Duplica el ataque de tu proximo item en combate.", cost: 40, currency: "COINS", category: "CONSUMABLE", icon: "crosshair" },
];
'''
assert old_shop_tail in src, "shop tail not found"
src = src.replace(old_shop_tail, '''  { id: "CONSUMABLE_AMMO", title: "Municion extra", description: "Duplica el ataque de tu proximo item en combate.", cost: 40, currency: "COINS", category: "CONSUMABLE", icon: "crosshair" },
''' + cam_items)
# widen category type
src = src.replace(
    'category: "AVATAR" | "BRIEFING" | "BOOST" | "COSMETIC" | "CONSUMABLE";',
    'category: "AVATAR" | "BRIEFING" | "BOOST" | "COSMETIC" | "CONSUMABLE" | "CAMERA" | "ELITE";'
)
# drop the `as any` casts now that the union accepts them
src = src.replace('category: "CAMERA" as any', 'category: "CAMERA"')
src = src.replace('category: "ELITE" as any', 'category: "ELITE"')

# 3) AchievementState fields
src = src.replace(
    "  minigameBestScore: number;\n}",
    "  minigameBestScore: number;\n  camerasPlaced: number;\n  cameraEvents: number;\n  cameraIncome: number;\n}",
) if "  minigameBestScore: number;\n}" in src else src

# 4) Camera achievements appended at end of ACHIEVEMENTS
cam_ach = '''  // VIGILANCIA (camaras)
  { id: "ACH-CAM-1", title: "Ojo en el muro", description: "Coloca tu primera camara de vigilancia.", category: "VIGILANCIA", icon: "camera", rarity: "COMUN", xpReward: 40, coinReward: 30, gemReward: 0, check: (s) => s.camerasPlaced >= 1, progress: (s) => ({ current: Math.min(s.camerasPlaced, 1), target: 1 }) },
  { id: "ACH-CAM-5", title: "Red de vigilancia", description: "Opera 5 camaras simultaneamente.", category: "VIGILANCIA", icon: "cctv", rarity: "RARO", xpReward: 120, coinReward: 100, gemReward: 1, check: (s) => s.camerasPlaced >= 5, progress: (s) => ({ current: Math.min(s.camerasPlaced, 5), target: 5 }) },
  { id: "ACH-CAM-10", title: "Gran hermano", description: "Opera 10 camaras simultaneamente.", category: "VIGILANCIA", icon: "video", rarity: "EPICO", xpReward: 250, coinReward: 200, gemReward: 2, check: (s) => s.camerasPlaced >= 10, progress: (s) => ({ current: Math.min(s.camerasPlaced, 10), target: 10 }) },
  { id: "ACH-EVENT-10", title: "Devastacion documentada", description: "Captura 10 eventos en vivo con tus camaras.", category: "VIGILANCIA", icon: "zap", rarity: "RARO", xpReward: 140, coinReward: 120, gemReward: 1, check: (s) => s.cameraEvents >= 10, progress: (s) => ({ current: Math.min(s.cameraEvents, 10), target: 10 }) },
  { id: "ACH-EVENT-40", title: "Archivo de guerra", description: "Captura 40 eventos en vivo con tus camaras.", category: "VIGILANCIA", icon: "film", rarity: "LEGENDARIO", xpReward: 400, coinReward: 350, gemReward: 4, check: (s) => s.cameraEvents >= 40, progress: (s) => ({ current: Math.min(s.cameraEvents, 40), target: 40 }) },
  { id: "ACH-INCOME-2000", title: "Magnate de la intel", description: "Recauda 2000 monedas con tu red de camaras.", category: "ESPECIAL", icon: "coins", rarity: "EPICO", xpReward: 250, coinReward: 0, gemReward: 3, check: (s) => s.cameraIncome >= 2000, progress: (s) => ({ current: Math.min(s.cameraIncome, 2000), target: 2000 }) },
];
'''
# find ACHIEVEMENTS closing: last entry is ACH-MINIGAME-2000 line ending with "];"
ach_anchor = '''  { id: "ACH-MINIGAME-2000", title: "Leyenda del combate", description: "Alcanza 2000 puntos en el mini-game.", category: "COMBATE", icon: "trophy", rarity: "LEGENDARIO", xpReward: 500, coinReward: 400, gemReward: 5, check: (s) => s.minigameBestScore >= 2000, progress: (s) => ({ current: Math.min(s.minigameBestScore, 2000), target: 2000 }) },
];'''
assert ach_anchor in src, "achievements anchor not found"
src = src.replace(ach_anchor, ach_anchor[:-2] + "\n" + cam_ach)

# 5) DC-9 camera daily challenge
dc_anchor = '''  { id: "DC-8", title: "Explorador global", description: "Abre el mapa y visita 2 frentes.", icon: "map", xpReward: 25, coinReward: 20, target: 2, action: "OPEN_MAP" },
];'''
assert dc_anchor in src
src = src.replace(dc_anchor, '''  { id: "DC-8", title: "Explorador global", description: "Abre el mapa y visita 2 frentes.", icon: "map", xpReward: 25, coinReward: 20, target: 2, action: "OPEN_MAP" },
  { id: "DC-9", title: "Operador CCTV", description: "Captura 3 eventos en vivo con tu red de camaras.", icon: "camera", xpReward: 45, coinReward: 40, target: 3, action: "CAM_EVENT" },
];''')

open(p, "w", encoding="utf8").write(src)
print("OK game-data updated")
