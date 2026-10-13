import corespondentaJson from "@/data/caen-corespondenta.json";
import rev2Json from "@/data/caen-rev2.json";
import { getBySlug, type CaenNode } from "@/lib/caen";

// Structura CAEN Rev. 2 și tabelul de corespondență Rev. 2 – Rev. 3, ambele
// publicate de INS. Datele sunt extrase din PDF cu scripts/*-from-pdf.py.

type Row = { rev2: string; rev3: string; note: string };

const rows = corespondentaJson as Row[];
const rev2 = rev2Json as {
  divisions: Record<string, string>;
  classes: Record<string, string>;
};

export type Rev2Class = { code: string; name: string; division: string };

export const rev2Classes: Rev2Class[] = Object.entries(rev2.classes)
  .map(([code, name]) => ({ code, name, division: code.slice(0, 2) }))
  .sort((a, b) => a.code.localeCompare(b.code));

export const rev2Divisions = Object.entries(rev2.divisions)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.code.localeCompare(b.code));

const rev2ByCode = new Map(rev2Classes.map((item) => [item.code, item]));

export function getRev2(code: string) {
  return rev2ByCode.get(code);
}

export type Rev2Target = { node: CaenNode; note: string };

export function targetsOf(code: string): Rev2Target[] {
  return rows
    .filter((row) => row.rev2 === code)
    .flatMap((row) => {
      const node = getBySlug(row.rev3);
      return node ? [{ node, note: row.note }] : [];
    });
}

export type Rev2Source = { item: Rev2Class; note: string };

export function sourcesOf(rev3Code: string): Rev2Source[] {
  return rows
    .filter((row) => row.rev3 === rev3Code)
    .flatMap((row) => {
      const item = rev2ByCode.get(row.rev2);
      return item ? [{ item, note: row.note }] : [];
    });
}

export function rev2Path(code: string) {
  return `/caen-rev2/${code}/`;
}

export function targetSummary(code: string) {
  const codes = [...new Set(targetsOf(code).map((target) => target.node.code))];
  if (codes.length === 0) return "fără corespondent";
  return codes.length > 3 ? `${codes.slice(0, 3).join(", ")}…` : codes.join(", ");
}
