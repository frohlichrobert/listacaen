import {
  ancestorsOf,
  type CaenNode,
  counts,
  describe,
  levelLabel,
} from "@/lib/caen";
import { absoluteUrl, caenPath, SITE_NAME, SITE_URL } from "@/lib/site";
import { clip } from "@/lib/text";

export const homeTitle =
  "Coduri CAEN — Lista CAEN completă (Rev. 3) | listacaen.ro";

export const homeDescription = `Lista CAEN completă: caută orice cod CAEN după cifre sau denumire. ${counts.classes} de coduri CAEN Rev. 3 (clase), în ${counts.groups} de grupe și ${counts.divisions} de diviziuni.`;

function titleName(name: string, max: number) {
  const plain = name.replace(/\s*\([^)]*\)/g, "").replace(/\s+/g, " ").trim();
  return clip(plain, max);
}

export function titleFor(node: CaenNode) {
  if (node.level === "section") {
    const prefix = `Coduri CAEN secțiunea ${node.code} — `;
    return prefix + titleName(node.name, 72 - prefix.length);
  }
  const prefix =
    node.level === "division"
      ? `Coduri CAEN ${node.code} — `
      : `Cod CAEN ${node.code} — `;
  return prefix + titleName(node.name, 70 - prefix.length);
}

export function descriptionFor(node: CaenNode) {
  return clip(describe(node), 158);
}

export function definedTermLd(node: CaenNode) {
  return {
    "@type": "DefinedTerm",
    "@id": `${absoluteUrl(caenPath(node.slug))}#term`,
    name: node.name,
    termCode: node.code,
    description: describe(node),
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "CAEN Rev. 3",
      description:
        "Clasificarea activităților din economia națională, Rev. 3",
      url: `${SITE_URL}/`,
    },
  };
}

export function breadcrumbLd(node: CaenNode) {
  const crumbs = [
    { name: "Coduri CAEN", path: "/" },
    ...ancestorsOf(node).map((item) => ({
      name: `${levelLabel[item.level]} ${item.code} — ${item.name}`,
      path: caenPath(item.slug),
    })),
    {
      name: `${levelLabel[node.level]} ${node.code} — ${node.name}`,
      path: caenPath(node.slug),
    },
  ];

  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function itemListLd(name: string, nodes: CaenNode[]) {
  return {
    "@type": "ItemList",
    name,
    numberOfItems: nodes.length,
    itemListElement: nodes.map((node, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `CAEN ${node.code} — ${node.name}`,
      url: absoluteUrl(caenPath(node.slug)),
    })),
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    inLanguage: "ro-RO",
    description: homeDescription
  };
}
