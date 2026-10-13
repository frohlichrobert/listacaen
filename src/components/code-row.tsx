import Link from "next/link";
import type { CaenNode } from "@/lib/caen";
import { caenPath } from "@/lib/site";

export function CodeRow({
  node,
  meta,
}: {
  node: Pick<CaenNode, "slug" | "code" | "name">;
  meta?: string;
}) {
  return (
    <li>
      <Link
        href={caenPath(node.slug)}
        className="group grid grid-cols-[3.4rem_minmax(0,1fr)] items-baseline gap-x-3 border-b border-line py-3 hover:bg-accent-soft/80 focus-visible:bg-accent-soft focus-visible:outline-none"
      >
        <span className="text-[15px] font-medium tabular-nums text-ink">
          {node.code}
        </span>
        <span className="min-w-0">
          <span className="block leading-snug text-ink group-hover:text-accent">
            {node.name}
          </span>
          {meta ? (
            <span className="mt-0.5 block text-sm text-muted">{meta}</span>
          ) : null}
        </span>
      </Link>
    </li>
  );
}
