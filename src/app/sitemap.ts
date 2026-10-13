import type { MetadataRoute } from "next";
import { caenNodes, type Level } from "@/lib/caen";
import { rev2Classes, rev2Path } from "@/lib/rev2";
import { absoluteUrl, caenPath } from "@/lib/site";

export const dynamic = "force-static";

const priority: Record<Level, number> = {
  section: 0.8,
  division: 0.7,
  class: 0.6,
  group: 0.5,
};

export default function sitemap(): MetadataRoute.Sitemap {
  const updated = new Date("2026-10-13");
  return [
    {
      url: absoluteUrl("/"),
      lastModified: updated,
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: absoluteUrl("/despre/"),
      lastModified: updated,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/ghid/cum-alegi-codul-caen/"),
      lastModified: updated,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/caen-rev2/"),
      lastModified: updated,
      changeFrequency: "yearly",
      priority: 0.8,
    },
    ...rev2Classes.map((item) => ({
      url: absoluteUrl(rev2Path(item.code)),
      lastModified: updated,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    ...caenNodes.map((node) => ({
      url: absoluteUrl(caenPath(node.slug)),
      lastModified: updated,
      changeFrequency: "yearly" as const,
      priority: priority[node.level],
    })),
  ];
}
