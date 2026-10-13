import Link from "next/link";
import type { ReactNode } from "react";
import type { CaenNode } from "@/lib/caen";
import { caenPath } from "@/lib/site";

export function CodeList({ children }: { children: ReactNode }) {
  return (
    <ul className="mt-3 overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(18,56,36,0.06),0_0_0_1px_rgba(18,56,36,0.08)]">
      {children}
    </ul>
  );
}

export function CodeRow({
  node,
  meta,
}: {
  node: Pick<CaenNode, "slug" | "code" | "name">;
  meta?: string;
}) {
  return (
    <li className="border-b border-line/80 last:border-b-0">
      <Link
        href={caenPath(node.slug)}
        className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-baseline gap-x-3 px-4 py-3.5 hover:bg-hover focus-visible:bg-hover focus-visible:outline-none sm:grid-cols-[2.75rem_minmax(0,1fr)_auto]"
      >
        <span className="text-[15px] font-medium tabular-nums text-code">
          {node.code}
        </span>
        <span className="min-w-0 leading-snug text-ink">{node.name}</span>
        {meta ? (
          <span className="col-start-2 text-[13px] text-muted sm:col-start-auto sm:text-right">
            {meta}
          </span>
        ) : null}
      </Link>
    </li>
  );
}
