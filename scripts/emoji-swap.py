#!/usr/bin/env python3
"""Vanguard: replace emojis with icon keys / ISO codes (emoji-free data layer)."""
import re, sys

GD = "/home/z/my-project/src/lib/game-data.ts"
GS = "/home/z/my-project/src/lib/game-store.ts"

# ---- ISO country codes for flags ----
FLAGS = {
    "\U0001F1FA\U0001F1E6": "UA", "\U0001F1F5\U0001F1F8": "PS", "\U0001F1F1\U0001F1E7": "LB",
    "\U0001F1F8\U0001F1E9": "SD", "\U0001F1F0\U0001F1F5": "KP", "\U0001F1F9\U0001F1FC": "TW",
    "\U0001F1FE\U0001F1EA": "YE", "\U0001F1EE\U0001F1F7": "IR", "\U0001F1F2\U0001F1F1": "ML",
    "\U0001F1F2\U0001F1F2": "MM", "\U0001F1FB\U0001F1EA": "VE", "\U0001F1E8\U0001F1F4": "CO",
    "\U0001F1ED\U0001F1F9": "HT", "\U0001F1F2\U0001F1E6": "MA", "\U0001F1E6\U0001F1F2": "AM",
    "\U0001F1F8\U0001F1F4": "SO", "\U0001F1E8\U0001F1E9": "CD", "\U0001F1E6\U0001F1EB": "AF",
    "\U0001F1F8\U0001F1FE": "SY", "\U0001F1EA\U0001F1F9": "ET", "\U0001F1F2\U0001F1FF": "MZ",
    "\U0001F1F2\U0001F1FD": "MX", "\U0001F1EE\U0001F1F3": "IN", "\U0001F1F3\U0001F1EC": "NG",
    "\U0001F1E7\U0001F1F7": "BR", "\U0001F3F4": "AF",  # pirate flag (ISIS-K) -> AF
}

# ---- emoji -> icon key (rendered by <VIcon k="..."/>) ----
ICONS = {
    "\u26A1\ufe0f": "zap", "\u26A1": "zap",
    "\U0001F3AF": "crosshair", "\U0001F48E": "gem", "\u2764\ufe0f": "heart-pulse", "\u2764": "heart-pulse",
    "\U0001F534": "palette", "\U0001F535": "palette", "\U0001F3F7\ufe0f": "glasses",
    "\U0001F396\ufe0f": "medal", "\U0001F396": "medal", "\U0001F6F0\ufe0f": "satellite", "\U0001F6F0": "satellite",
    "\U0001F5C2\ufe0f": "folder", "\U0001F5C2": "folder", "\U0001F3C6": "trophy", "\u2B50": "star",
    "\U0001F525": "flame", "\U0001F4C4": "file-text", "\U0001F4DA": "book-open", "\U0001F4F0": "newspaper",
    "\U0001F5BC\ufe0f": "image", "\U0001F5BC": "image", "\U0001F9E0": "brain", "\u2697\ufe0f": "flask", "\u2697": "flask",
    "\U0001F52E": "crystal", "\U0001F5FA\ufe0f": "map", "\U0001F5FA": "map", "\u2705": "check-circle",
    "\U0001F4B0": "coins", "\U0001F3E6": "landmark", "\U0001F5DD\ufe0f": "key", "\U0001F5DD": "key",
    "\U0001F9ED": "compass", "\U0001F451": "crown", "\u2694\ufe0f": "swords", "\u2694": "swords",
    "\U0001F305": "sunrise", "\U0001F4E1": "radio", "\U0001F30D": "globe", "\U0001F680": "rocket",
    "\U0001F6E1\ufe0f": "shield", "\U0001F6E1": "shield", "\u271D\ufe0f": "cross", "\u271D": "cross",
    "\U0001F3F0": "castle", "\U0001F3A9": "flag", "\U0001F4A5": "bomb", "\U0001F6CC": "palmtree",
    "\U0001F3DD\ufe0f": "palmtree", "\u26F0\ufe0f": "mountain", "\u26F0": "mountain", "\U0001F48A": "pill",
    "\U0001F333": "tree", "\U0001F6E2\ufe0f": "fuel", "\U0001F6E2": "fuel", "\U0001F480": "skull",
    "\U0001F697": "car", "\U0001F681": "radar", "\u2622\ufe0f": "radiation", "\u2622": "radiation",
    "\U0001F3D4": "mountain", "\U0001F3EF": "castle", "\U0001F381": "gift", "\U0001F4E6": "package",
    "\U0001F9FF": "crystal", "\U0001F41A": "shell",
    "\U0001F3AD": "flag",
    "\U0001F4B0": "coins",
}

def apply(path, extra=None):
    src = open(path, encoding="utf8").read()
    before = src
    for emo, rep in FLAGS.items():
        src = src.replace(f'flag: "{emo}"', f'flag: "{rep}"')
    for emo, rep in ICONS.items():
        src = src.replace(f'icon: "{emo}"', f'icon: "{rep}"')
        src = src.replace(f'emoji: "{emo}"', f'emoji: "{rep}"')
        src = src.replace(f'avatar: "{emo}"', f'avatar: "{rep}"')
    if extra:
        src = extra(src)
    open(path, "w", encoding="utf8").write(src)
    remaining = re.findall(r"[\U0001F000-\U0001FAFF\u2600-\u27BF\u2B00-\u2BFF\uFE0F]", src)
    print(path, "->", len(remaining), "emoji chars left:", sorted(set(remaining))[:30])

apply(GD)
apply(GS)
