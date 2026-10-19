"""Extrage notele explicative NACE Rev. 2.1 (CAEN Rev. 3) din PDF-ul Eurostat
și scrie data/caen-note.json, în română.

Sursă: KS-GQ-24-007-EN-N, Eurostat 2025, CC BY 4.0. Traducerea este marcată
ca atare pe site; nu este textul din Monitorul Oficial.

Folosire: python3 scripts/note-from-pdf.py
Necesită `pdftotext` (poppler) și argostranslate (en → ro).
"""

from __future__ import annotations

import json
import re
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parent.parent
pdf = root / "data-src/KS-GQ-24-007-EN-N.pdf"
out = root / "data/caen-note.json"
cache_path = root / "scripts/.note-cache.json"

HEAD_SECTION = re.compile(r"^Section ([A-V])\s*[–—−-]\s*(.*)$")
HEAD_CLASS = re.compile(r"^(\d{2}\.\d{2})\s+(.+)$")
HEAD_GROUP = re.compile(r"^(\d{2}\.\d)\s+(.+)$")
HEAD_DIVISION = re.compile(r"^(\d{2})\s{2,}(.+)$")
MODE = re.compile(
    r"^This (?:section|division|group|class) (includes also|also includes|includes|excludes)\s*:?\s*$",
    re.I,
)
BULLET = re.compile(r"^(–|-|•|◦)\s+(.*)$")
CHROME = re.compile(
    r"^(?:\d{1,3}|3|Explanatory notes)$|NACE Rev\. 2\.1"
)


def load_text() -> str:
    raw = subprocess.run(
        ["pdftotext", "-layout", str(pdf), "-"],
        capture_output=True,
        text=True,
        check=True,
    ).stdout
    marker = "This section includes the exploitation of vegetal"
    start = raw.find(marker)
    start = raw.rfind("Section A", 0, start + 1)
    end = raw.find("Annex I\nLegal basis", start)
    if start < 0 or end < 0:
        raise SystemExit("Nu am găsit notele explicative în PDF.")
    return raw[start:end]


def clean_lines(raw: str) -> list[str]:
    lines = []
    for line in raw.splitlines():
        if "\f" in line:
            line = line.replace("\f", "")
        if CHROME.search(line.strip()):
            continue
        if not line.strip():
            continue
        lines.append(line.rstrip())
    return lines


def kind_of(stripped: str):
    if m := HEAD_SECTION.match(stripped):
        return ("section", m.group(1).lower(), m.group(2).strip())
    if m := HEAD_CLASS.match(stripped):
        return ("class", m.group(1).replace(".", ""), m.group(2).strip())
    if m := HEAD_GROUP.match(stripped):
        return ("group", m.group(1).replace(".", ""), m.group(2).strip())
    if m := HEAD_DIVISION.match(stripped):
        return ("division", m.group(1), m.group(2).strip())
    if stripped == "IMPLEMENTATION RULE":
        return ("rule", "", "")
    if m := MODE.match(stripped):
        label = m.group(1).lower()
        if "exclude" in label:
            return ("excludes", "", "")
        if "also" in label:
            return ("also", "", "")
        return ("includes", "", "")
    if m := BULLET.match(stripped):
        level = { "–": 0, "-": 0, "•": 1, "◦": 2 }[m.group(1)]
        return ("bullet", str(level), m.group(2).strip())
    return None


def parse(lines: list[str]) -> dict:
    notes: dict[str, dict] = {}
    cur = None
    mode = "lead"
    bullet_stack: list[dict] = []

    def finish_title():
        if cur is not None:
            cur["title"] = re.sub(r"\s+", " ", cur["title"]).strip()

    def start(code: str, title: str):
        nonlocal cur, mode, bullet_stack
        finish_title()
        cur = {"title": title, "lead": [], "includes": [], "also": [], "excludes": [], "rule": []}
        notes[code] = cur
        mode = "lead"
        bullet_stack = []

    def target_list():
        if mode == "includes":
            return cur["includes"]
        if mode == "also":
            return cur["also"]
        if mode == "excludes":
            return cur["excludes"]
        return None

    def add_bullet(level: int, text: str):
        node = {"t": text, "k": []}
        lst = target_list()
        if lst is None:
            # Listă fără antet: tratăm ca „include”.
            nonlocal mode
            mode = "includes"
            lst = cur["includes"]
        while len(bullet_stack) > level + 1:
            bullet_stack.pop()
        if level == 0 or not bullet_stack:
            lst.append(node)
            bullet_stack[:] = [node]
        else:
            parent = bullet_stack[min(level, len(bullet_stack)) - 1]
            parent["k"].append(node)
            bullet_stack[:] = bullet_stack[:level] + [node]

    def append_text(text: str):
        nonlocal mode, bullet_stack
        if cur is None:
            return
        if mode == "rule":
            if re.match(r"^This (?:section|division|group|class)\b", text):
                mode = "lead"
                bullet_stack = []
                cur["lead"].append(text)
                return
            cur["rule"].append(text)
            return
        if bullet_stack and text[:1].islower():
            bullet_stack[-1]["t"] = (bullet_stack[-1]["t"] + " " + text).strip()
            return
        if cur["title"] and text[:1].islower() and not cur["lead"] and not target_list():
            cur["title"] = (cur["title"] + " " + text).strip()
            return
        cur["lead"].append(text)

    for line in lines:
        stripped = line.strip()
        kind = kind_of(stripped)
        if kind is None:
            append_text(stripped)
            continue
        tag = kind[0]
        if tag in {"section", "division", "group", "class"}:
            start(kind[1], kind[2])
        elif tag == "rule":
            mode = "rule"
            bullet_stack = []
        elif tag in {"includes", "also", "excludes"}:
            mode = tag
            bullet_stack = []
        else:
            add_bullet(int(kind[1]), kind[2])

    finish_title()
    for note in notes.values():
        note["lead"] = join_paragraphs(note["lead"])
        note["rule"] = join_paragraphs(note["rule"])
        note.pop("title", None)
        for key in ("includes", "also", "excludes"):
            for node in note[key]:
                tidy_node(node)
        if not note["rule"]:
            del note["rule"]
        if not note["lead"]:
            del note["lead"]
        for key in ("includes", "also", "excludes"):
            if not note[key]:
                del note[key]
    return notes


def join_paragraphs(parts: list[str]) -> str:
    text = " ".join(parts)
    text = re.sub(r"\s+", " ", text).strip()
    text = re.sub(r"-\s+(?=[a-z])", "-", text)
    return text


def tidy_node(node: dict):
    node["t"] = join_paragraphs([node["t"]])
    for child in node["k"]:
        tidy_node(child)
    if not node["k"]:
        del node["k"]


REF = re.compile(
    r"\b(?:see\s+)?(?:sections?|divisions?|groups?|classes?)?\s*(?:[A-V](?![A-Za-z])|\d{2}\.\d{1,2})",
    re.I,
)


def token(code: str) -> str:
    return "#" + code + "#"


def protect(text: str) -> str:
    text = text.replace("n.e.c.", "n.c.a.")

    def dotted(raw: str) -> str:
        return token(raw.replace(".", ""))

    item = r"(?:sections?\s+[A-V]|divisions?\s+\d{2}|(?:groups?|classes?)\s+\d{2}\.\d{1,2}|\d{2}\.\d{1,2})"

    def refs(chunk) -> str:
        if not isinstance(chunk, str):
            chunk = chunk.group(0)
        codes = []
        for part in re.finditer(
            r"sections?\s+([A-V])|divisions?\s+(\d{2})|(?:groups?|classes?)\s+(\d{2}\.\d{1,2})|(\d{2}\.\d{1,2})",
            chunk,
            re.I,
        ):
            if part.group(1):
                codes.append(part.group(1).lower())
            elif part.group(2):
                codes.append(part.group(2))
            else:
                codes.append((part.group(3) or part.group(4)).replace(".", ""))
        return " " + " ".join(token(c) for c in codes) if codes else chunk

    def divs(m: re.Match) -> str:
        return " " + " ".join(token(n) for n in re.findall(r"\d{2}", m.group(0)))

    text = re.sub(
        rf",?\s*\bsee\s+{item}(?:\s*,\s*(?:and\s+)?{item}|\s+and\s+{item})*",
        refs,
        text,
        flags=re.I,
    )
    text = re.sub(
        r"\bdivisions?\s+\d{2}(?:\s*,\s*(?:and\s+)?\d{2})*(?:\s+and\s+\d{2})?",
        divs,
        text,
        flags=re.I,
    )
    text = re.sub(r"\bsections?\s+([A-V])\b", lambda m: token(m.group(1).lower()), text, flags=re.I)
    text = re.sub(r"\b(?:groups?|classes?)\s+(\d{2}\.\d{1,2})\b", lambda m: dotted(m.group(1)), text, flags=re.I)
    text = re.sub(r"\b(\d{2}\.\d{1,2})\b", lambda m: dotted(m.group(1)), text)
    text = re.sub(r"\s{2,}", " ", text)
    text = re.sub(r"\(\s+", "(", text)
    text = re.sub(r"\s+([,.;:])", r"\1", text)
    return text.strip(" ,")


def walk_strings(notes: dict):
    for note in notes.values():
        if note.get("lead"):
            yield note, "lead", None
        if note.get("rule"):
            yield note, "rule", None
        for key in ("includes", "also", "excludes"):
            for node in note.get(key, []):
                yield from walk_nodes(node)


def walk_nodes(node: dict):
    yield node, "t", None
    for child in node.get("k", []):
        yield from walk_nodes(child)


def split_long(text: str) -> list[str]:
    if len(text) <= 4000:
        return [text]
    pieces, buf = [], ""
    for sentence in re.split(r"(?<=\.)\s+", text):
        if buf and len(buf) + len(sentence) > 3200:
            pieces.append(buf)
            buf = sentence
        else:
            buf = (buf + " " + sentence).strip()
    if buf:
        pieces.append(buf)
    return pieces or [text]


def translate_all(notes: dict):
    try:
        import argostranslate.translate as argos
    except ImportError as exc:
        raise SystemExit("Lipsește argostranslate în interpretul folosit.") from exc

    cache = {}
    if cache_path.exists():
        cache = json.loads(cache_path.read_text())

    pending = []
    for obj, key, _ in walk_strings(notes):
        original = obj[key]
        protected = protect(original)
        obj[key] = protected
        if protected and protected not in cache:
            pending.append(protected)

    pending = list(dict.fromkeys(pending))
    print(f"de tradus: {len(pending)} texte, în cache: {len(cache)}")
    batch = 80
    for i in range(0, len(pending), batch):
        chunk = pending[i : i + batch]
        for src in chunk:
            try:
                parts = [argos.translate(piece, "en", "ro") for piece in split_long(src)]
                cache[src] = " ".join(part for part in parts if part).strip() or src
            except Exception as exc:
                print(f"netradus ({exc}): {src[:80]}")
                cache[src] = src
        if i % 400 == 0:
            cache_path.write_text(json.dumps(cache, ensure_ascii=False))
        print(f"  {min(i + batch, len(pending))}/{len(pending)}", flush=True)
    cache_path.write_text(json.dumps(cache, ensure_ascii=False))

    for obj, key, _ in list(walk_strings(notes)):
        obj[key] = polish(cache.get(obj[key], obj[key]))


def polish(text: str) -> str:
    text = text.replace("ş", "ș").replace("ţ", "ț").replace("Ş", "Ș").replace("Ţ", "Ț")
    reps = [
        (r"\b[Cc]reșterea de\b", "cultivare a"),
        (r"\b[Cc]reștere a\b", "cultivare a"),
        (r"\bde cultivarea\b", "de cultivare a"),
        (r"\bculturilor de glifosat\b", "plantelor leguminoase"),
        (r"\bculturilor păstăi\b", "plantelor leguminoase"),
        (r"\bculturi păstăi\b", "plante leguminoase"),
        (r"\bporumb din cereale\b", "porumb boabe"),
        (r"\bdezvoltarea cererilor\b", "dezvoltarea aplicațiilor"),
        (r"jocurilor de noroc la cerere", "serviciilor de jocuri video la cerere"),
        (r"producția de glifosat\b", "producția de dolomită calcinată"),
        (r"\bAceastă divizie\b", "Această diviziune"),
        (r"\baceastă divizie\b", "această diviziune"),
        (r"\bAcest grup include\b", "Această grupă include"),
        (r"non-perene", "nepermanente"),
        (r"neperinare", "nepermanente"),
        (r"culturilor nepermanente", "plantelor nepermanente"),
        (r"Creșterea acestor culturi", "Cultivarea acestor culturi"),
        (r"\b[Cc]hinoa\b", "quinoa"),
        (r"\bn\.e\.c\.\b", "n.c.a."),
    ]
    for pattern, repl in reps:
        text = re.sub(pattern, repl, text)
    text = re.sub(r"\s{2,}", " ", text).strip()
    text = re.sub(r"\s+([,.;:])", r"\1", text)
    text = re.sub(r"\(\s+", "(", text)
    if text and text[0].isalpha():
        text = text[0].upper() + text[1:]
    return text


def main():
    notes = parse(clean_lines(load_text()))
    rev3 = json.loads((root / "data/caen-rev3.json").read_text())
    expected = set()
    for section in rev3:
        expected.add(section["code"].lower())
        for division in section["divisions"]:
            expected.add(division["code"])
            for group in division["groups"]:
                expected.add(group["code"])
                for item in group["codes"]:
                    expected.add(item["code"])
    missing = sorted(expected - notes.keys())
    extra = sorted(set(notes) - expected)
    print(f"note: {len(notes)}  lipsă: {len(missing)}  în plus: {len(extra)}")
    if missing:
        print("lipsă:", ", ".join(missing[:40]))
    if extra:
        print("în plus:", ", ".join(extra[:40]))
    translate_all(notes)
    out.write_text(json.dumps(notes, ensure_ascii=False, separators=(",", ":")) + "\n")
    print("scris", out, "octeți", out.stat().st_size)


if __name__ == "__main__":
    main()
