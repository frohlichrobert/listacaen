"""Extrage corespondența CAEN Rev. 2 -> Rev. 3 din PDF-ul INS în
data/caen-corespondenta.json.

Folosire: python3 scripts/corespondenta-from-pdf.py
Necesită `pdftotext` (poppler).
"""
import json
import re
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parent.parent
pdf = root / "data-src/Corespondenta-CAEN-Rev.2-CAEN-Rev.3.pdf"
text = subprocess.run(
    ["pdftotext", "-layout", str(pdf), "-"], capture_output=True, text=True, check=True
).stdout

rows: list[dict] = []
current = None
for line in text.split("\n"):
    m = re.match(r"^(\s*)(\d{4})(?:(\s+)(\d{4}))?(?:\s+(.*))?$", line)
    if not m:
        if rows and line.strip() and re.match(r"^\s{8,}\S", line) and not line.strip().startswith("CAEN"):
            rows[-1]["note"] = (rows[-1]["note"] + " " + line.strip()).strip()
        continue
    lead, first, _gap, second, rest = m.groups()
    rest = (rest or "").strip()
    if len(lead) <= 3:
        current = first
        if second:
            rows.append({"rev2": current, "rev3": second, "note": rest})
    elif current:
        rows.append({"rev2": current, "rev3": first, "note": (second or "") + (" " + rest if rest else "")})

for row in rows:
    note = re.sub(r"\s+", " ", row["note"]).strip()
    row["note"] = "" if note in ("=", "") else note

(root / "data/caen-corespondenta.json").write_text(
    json.dumps(rows, ensure_ascii=False, indent=1) + "\n"
)
print(len(rows), "rânduri,", len({r["rev2"] for r in rows}), "coduri Rev.2,", len({r["rev3"] for r in rows}), "coduri Rev.3")
