"""Extrage structura CAEN Rev. 2 din PDF-ul INS în src/data/caen-rev2.json.

Folosire: python3 scripts/rev2-from-pdf.py
Necesită `pdftotext` (poppler).
"""
import json
import re
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parent.parent
pdf = root / "src/data/CAEN-Rev.2_structura-completa.pdf"
text = subprocess.run(
    ["pdftotext", "-layout", str(pdf), "-"], capture_output=True, text=True, check=True
).stdout


def clean(value: str) -> str:
    return (
        value.replace("ţ", "ț").replace("Ţ", "Ț").replace("ş", "ș").replace("Ş", "Ș")
        .strip()
    )


divisions: dict[str, str] = {}
classes: dict[str, str] = {}
last: tuple[str, str] | None = None

for line in text.split("\n"):
    if m := re.match(r"^\s{0,4}(\d{2})\s{10,}(\S.*)$", line):
        divisions[m.group(1)] = m.group(2).strip()
        last = ("d", m.group(1))
    elif m := re.match(r"^\s+(\d{3})\s{8,}(\S.*)$", line):
        last = ("g", m.group(1))
    elif m := re.match(r"^\s+(\d{4})\s{2,}(\S.*)$", line):
        classes[m.group(1)] = m.group(2).strip()
        last = ("c", m.group(1))
    elif m := re.match(r"^\s+(\d{4})\s*$", line):
        classes[m.group(1)] = ""
        last = ("c", m.group(1))
    elif m := re.match(r"^\s{0,4}(\d{2})\s*$", line):
        divisions[m.group(1)] = ""
        last = ("d", m.group(1))
    elif (m := re.match(r"^\s{14,}(?!\d)(\S.*)$", line)) and last:
        if re.match(r"^\s+\d+\s+\d+\s*$", line) or "SECŢIUNEA" in line:
            continue
        kind, key = last
        if kind == "c":
            classes[key] = (classes[key] + " " + m.group(1).strip()).strip()
        elif kind == "d":
            divisions[key] = (divisions[key] + " " + m.group(1).strip()).strip()

out = {
    "divisions": {k: clean(v) for k, v in divisions.items()},
    "classes": {k: clean(v) for k, v in classes.items()},
}
(root / "src/data/caen-rev2.json").write_text(
    json.dumps(out, ensure_ascii=False, indent=1) + "\n"
)
print(len(out["divisions"]), "diviziuni,", len(out["classes"]), "clase")
