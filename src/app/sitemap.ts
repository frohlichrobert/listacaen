import type { MetadataRoute } from "next";
import { caenNodes, type Level } from "@/lib/caen";
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
    ...caenNodes.map((node) => ({
      url: absoluteUrl(caenPath(node.slug)),
      lastModified: updated,
      changeFrequency: "yearly" as const,
      priority: priority[node.level],
    })),
  ];
}
