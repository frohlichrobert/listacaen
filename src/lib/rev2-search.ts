import rev2Json from "@/data/caen-rev2.json";
import { fold } from "@/lib/text";

// Căutare ușoară în codurile CAEN Rev. 2, fără tabelul de corespondență, ca
// să nu încarce în browser mai mult decât lista de coduri.

const classes = Object.entries(
  (rev2Json as { classes: Record<string, string> }).classes,
)
  .map(([code, name]) => ({ code, name, folded: fold(name) }))
  .sort((a, b) => a.code.localeCompare(b.code));

export type Rev2Hit = { code: string; name: string };

export function searchRev2(rawQuery: string, limit: number): Rev2Hit[] {
  const folded = fold(rawQuery).replace(/\b(caen|rev\s?2)\b/g, " ").replace(/\s+/g, " ").trim();
  const compact = folded.replace(/\s/g, "");
  if (!compact) return [];

  const numeric = /^\d{3,4}$/.test(compact);
  const tokens = folded.split(" ").filter(Boolean);

  return classes
    .filter((item) =>
      numeric
        ? item.code.startsWith(compact)
        : tokens.every((token) => item.folded.includes(token)),
    )
    .slice(0, limit)
    .map(({ code, name }) => ({ code, name }));
}

export function isCodeQuery(rawQuery: string) {
  const compact = fold(rawQuery).replace(/\b(caen|rev\s?2)\b/g, " ").replace(/\s/g, "");
  return /^\d{3,4}$/.test(compact);
}
