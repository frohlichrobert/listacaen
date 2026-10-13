import rawJson from "@/data/caen-rev3.json";
import { fold, plural } from "@/lib/text";

// Nomenclator CAEN Rev. 3 (Ordinul INS nr. 377/2024), aliniat la NACE Rev. 2.1.
// Structura JSON pornește de la https://github.com/razgraf/coduri-caen (MIT).

export type Level = "section" | "division" | "group" | "class";

export type CaenNode = {
  slug: string;
  code: string;
  name: string;
  level: Level;
  folded: string;
  sectionSlug: string;
  divisionSlug?: string;
  groupSlug?: string;
  parentSlug?: string;
  childSlugs: string[];
  divisionCount: number;
  groupCount: number;
  classCount: number;
};

type RawClass = { code: string; name: string };
type RawGroup = { code: string; name: string; codes: RawClass[] };
type RawDivision = { code: string; name: string; groups: RawGroup[] };
type RawSection = { code: string; name: string; divisions: RawDivision[] };

const raw = rawJson as RawSection[];

const bySlug = new Map<string, CaenNode>();
const ordered: CaenNode[] = [];
const sections: CaenNode[] = [];

function add(node: CaenNode) {
  bySlug.set(node.slug, node);
  ordered.push(node);
  return node;
}

for (const section of raw) {
  const sectionSlug = section.code.toLowerCase();
  const divisionSlugs: string[] = [];
  let sectionGroups = 0;
  let sectionClasses = 0;

  for (const division of section.divisions) {
    const groupSlugs: string[] = [];
    let divisionClasses = 0;

    for (const group of division.groups) {
      const classSlugs: string[] = [];

      for (const item of group.codes) {
        classSlugs.push(item.code);
        add({
          slug: item.code,
          code: item.code,
          name: item.name,
          level: "class",
          folded: fold(item.name),
          sectionSlug,
          divisionSlug: division.code,
          groupSlug: group.code,
          parentSlug: group.code,
          childSlugs: [],
          divisionCount: 0,
          groupCount: 0,
          classCount: 0,
        });
      }

      divisionClasses += classSlugs.length;
      groupSlugs.push(group.code);
      add({
        slug: group.code,
        code: group.code,
        name: group.name,
        level: "group",
        folded: fold(group.name),
        sectionSlug,
        divisionSlug: division.code,
        groupSlug: group.code,
        parentSlug: division.code,
        childSlugs: classSlugs,
        divisionCount: 0,
        groupCount: 0,
        classCount: classSlugs.length,
      });
    }

    sectionGroups += groupSlugs.length;
    sectionClasses += divisionClasses;
    divisionSlugs.push(division.code);
    add({
      slug: division.code,
      code: division.code,
      name: division.name,
      level: "division",
      folded: fold(division.name),
      sectionSlug,
      divisionSlug: division.code,
      parentSlug: sectionSlug,
      childSlugs: groupSlugs,
      divisionCount: 0,
      groupCount: groupSlugs.length,
      classCount: divisionClasses,
    });
  }

  sections.push(
    add({
      slug: sectionSlug,
      code: section.code.toUpperCase(),
      name: section.name,
      level: "section",
      folded: fold(section.name),
      sectionSlug,
      parentSlug: undefined,
      childSlugs: divisionSlugs,
      divisionCount: divisionSlugs.length,
      groupCount: sectionGroups,
      classCount: sectionClasses,
    }),
  );
}

export const caenSections = sections;
export const caenNodes = ordered;

export const counts = {
  sections: sections.length,
  divisions: sections.reduce((sum, section) => sum + section.divisionCount, 0),
  groups: sections.reduce((sum, section) => sum + section.groupCount, 0),
  classes: sections.reduce((sum, section) => sum + section.classCount, 0),
};

export const levelLabel: Record<Level, string> = {
  section: "Secțiune",
  division: "Diviziune",
  group: "Grupă",
  class: "Clasă",
};

export function getBySlug(slug: string) {
  return bySlug.get(slug.trim().toLowerCase());
}

export function childrenOf(node: CaenNode) {
  return node.childSlugs.map((slug) => {
    const child = bySlug.get(slug);
    if (!child) throw new Error(`Cod CAEN lipsă: ${slug}`);
    return child;
  });
}

export function neighborsOf(node: CaenNode) {
  const same = ordered.filter((item) => item.level === node.level);
  const index = same.findIndex((item) => item.slug === node.slug);
  return {
    prev: index > 0 ? same[index - 1] : undefined,
    next: index >= 0 && index < same.length - 1 ? same[index + 1] : undefined,
  };
}

export function ancestorsOf(node: CaenNode) {
  const trail: CaenNode[] = [];
  let slug = node.parentSlug;
  while (slug) {
    const parent = bySlug.get(slug);
    if (!parent) break;
    trail.push(parent);
    slug = parent.parentSlug;
  }
  return trail.reverse();
}

export function describe(node: CaenNode) {
  const section = bySlug.get(node.sectionSlug);
  if (!section) return node.name;

  if (node.level === "section") {
    return `Lista codurilor CAEN din secțiunea ${node.code} grupează activitățile „${node.name}”: ${plural(node.divisionCount, "diviziune", "diviziuni")}, ${plural(node.groupCount, "grupă", "grupe")} și ${plural(node.classCount, "clasă", "clase")} CAEN Rev. 3.`;
  }

  const division = node.divisionSlug
    ? bySlug.get(node.divisionSlug)
    : undefined;

  if (node.level === "division") {
    return `Coduri CAEN ${node.code}: diviziunea „${node.name}”, în secțiunea ${section.code} — ${section.name}. Cuprinde ${plural(node.groupCount, "grupă", "grupe")} și ${plural(node.classCount, "clasă", "clase")}.`;
  }

  if (node.level === "group" && division) {
    return `Coduri CAEN ${node.code}: grupa „${node.name}”, în diviziunea ${division.code} — ${division.name}, secțiunea ${section.code}. Conține ${plural(node.classCount, "clasă", "clase")}.`;
  }

  const group = node.groupSlug ? bySlug.get(node.groupSlug) : undefined;
  if (division && group) {
    return `Codul CAEN ${node.code} este clasa pentru „${node.name}”. Intră în grupa ${group.code} ${group.name}, diviziunea ${division.code} ${division.name}, secțiunea ${section.code} ${section.name}.`;
  }

  return node.name;
}

export function searchContext(node: CaenNode) {
  if (node.level === "section") return "Secțiune";
  if (node.level === "division") {
    return `Diviziune · Secțiunea ${bySlug.get(node.sectionSlug)?.code ?? ""}`;
  }
  if (node.level === "group") return `Grupă · Diviziunea ${node.divisionSlug}`;
  return `Clasă · Diviziunea ${node.divisionSlug}`;
}

const levelBoost: Record<Level, number> = {
  class: 8,
  division: 5,
  group: 2,
  section: 0,
};

export function searchCaen(rawQuery: string, limit: number) {
  const folded = fold(rawQuery).replace(/\bcaen\b/g, " ").replace(/\s+/g, " ").trim();
  const compact = folded.replace(/\s/g, "");

  if (!folded) return { hits: [] as CaenNode[], total: 0 };

  if (compact.length === 1 && !/^\d$/.test(compact)) {
    const section = bySlug.get(compact);
    return section
      ? { hits: [section], total: 1 }
      : { hits: [] as CaenNode[], total: 0 };
  }

  const tokens = folded.split(" ").filter(Boolean);
  const scored: { node: CaenNode; score: number }[] = [];

  for (const node of ordered) {
    let score = 0;
    if (node.slug === compact || node.folded === folded) score = 1000;
    else if (/^\d+$/.test(compact) && node.slug.startsWith(compact)) {
      score = 860 - node.slug.length;
    } else if (node.folded.startsWith(folded)) score = 720;
    else if (tokens.every((token) => node.folded.includes(token) || node.slug.startsWith(token))) {
      const wordStart = tokens.every((token) =>
        node.folded.split(" ").some((word) => word.startsWith(token)),
      );
      score = wordStart ? 640 : 430;
    }

    if (score > 0) scored.push({ node, score: score + levelBoost[node.level] });
  }

  scored.sort(
    (a, b) =>
      b.score - a.score ||
      a.node.code.localeCompare(b.node.code, "ro", { numeric: true }),
  );

  return {
    hits: scored.slice(0, limit).map((item) => item.node),
    total: scored.length,
  };
}
