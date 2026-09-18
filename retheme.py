#!/usr/bin/env python3
"""De-templatize the portfolio palette (idempotent).

Swaps the "near-black + amber/coral" stock dark-theme pairing for a single
deliberate accent — emerald/mint (circuit-board green, fitting an IoT +
embedded-systems developer) — on a cool-toned charcoal ground.

Every amber/coral/red/violet/cyan literal becomes a shade of green, so the
whole site reads as one deliberate palette instead of a multi-colour gradient
template. Error reds and the macOS terminal traffic lights are excluded and
hand-edited separately.
"""
import re
import pathlib

FRONT = pathlib.Path(__file__).resolve().parent / "frontend"

HEX = [
    ("#ffcb8a", "#8fffd2"),   # gradient light
    ("#ff9a4f", "#00e5a0"),   # accent
    ("#ffb054", "#00e5a0"),   # accent
    ("#ff7a45", "#00c98b"),   # accent-2
    ("#ff5e62", "#00b87f"),   # accent-3 (deep)
    ("#8b6cff", "#16c9a0"),   # was violet
    ("#6ee7d8", "#4fdcb4"),   # was cyan -> mint sibling
    ("#070708", "#0b0e12"),   # ground
    ("#0b0b0f", "#0d1117"),   # bg-2
    ("#101016", "#12171e"),   # bg-3
    ("#16090a", "#04120b"),   # dark text on gradient
    ("#14090a", "#04120b"),   # dark text on gradient
    ("#04140f", "#05130c"),   # dark text on mint chip
    ("#d4780a", "#0a8a5e"),   # light-theme accent ramp
    ("#c05a1e", "#08764f"),
    ("#c03040", "#0a6b49"),
    ("#6b4ecf", "#0d7d5c"),
    ("#1a9e8e", "#0f8f68"),
    ("#e8a04a", "#57c99a"),
]

# (old rgb triple) -> (new rgb triple); whitespace inside rgba() is ignored.
RGB = [
    ((255, 176, 84), (0, 229, 160)),
    ((255, 122, 69), (0, 201, 139)),
    ((255, 94, 98), (0, 184, 127)),
    ((139, 108, 255), (22, 201, 160)),
    ((110, 231, 216), (79, 220, 180)),
    ((200, 200, 210), (150, 200, 175)),
    ((255, 160, 80), (0, 229, 160)),
    ((212, 120, 10), (10, 138, 94)),
    ((192, 48, 64), (10, 107, 73)),
    ((107, 78, 207), (13, 125, 92)),
]

# Files keeping their own colours (error states / terminal traffic lights).
EXCLUDE = {"sections/Contact.module.css", "sections/Contact.js", "sections/Hero.js"}
SKIP_DIRS = {"node_modules", ".next", ".git"}

exts = {".css", ".js", ".mjs"}


def _rgba_pattern(rgb):
    return re.compile(r"rgba\(\s*%d,\s*%d,\s*%d," % rgb)


def retheme(text):
    for old, new in RGB:
        text = _rgba_pattern(old).sub("rgba(%d, %d, %d," % new, text)
    for old, new in HEX:
        text = text.replace(old, new)
    return text


changed = []
for p in FRONT.rglob("*"):
    if p.suffix not in exts or any(part in SKIP_DIRS for part in p.parts):
        continue
    rel = p.relative_to(FRONT).as_posix()
    if rel in EXCLUDE:
        continue
    src = p.read_text(encoding="utf-8")
    out = retheme(src)
    if out != src:
        p.write_text(out, encoding="utf-8")
        changed.append(rel)

print(f"Rethemed {len(changed)} files:")
for c in sorted(changed):
    print(" ", c)