import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CodeRow } from "@/components/code-row";
import { CopyCode } from "@/components/copy-code";
import { JsonLd } from "@/components/json-ld";
import {
  ancestorsOf,
  caenNodes,
  childrenOf,
  describe,
  getBySlug,
  levelLabel,
  type CaenNode,
} from "@/lib/caen";
import {
  breadcrumbLd,
  definedTermLd,
  descriptionFor,
  itemListLd,
  titleFor,
} from "@/lib/seo";
import { caenPath } from "@/lib/site";
import { plural } from "@/lib/text";

export const dynamicParams = false;

export function generateStaticParams() {
  return caenNodes.map((node) => ({ code: node.slug }));
}

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const node = getBySlug(code);
  if (!node) return { title: "Cod negăsit" };

  const title = titleFor(node);
  const description = descriptionFor(node);
  const path = caenPath(node.slug);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "listacaen.ro",
      locale: "ro_RO",
      type: "website",
    },
  };
}

export default async function CaenPage({ params }: Props) {
  const { code } = await params;
  const node = getBySlug(code);
  if (!node) notFound();

  const ancestors = ancestorsOf(node);
  const children = childrenOf(node);
  const listed =
    node.level === "division"
      ? children.flatMap((group) => childrenOf(group))
      : children;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            definedTermLd(node),
            breadcrumbLd(node),
            listed.length
              ? itemListLd(`CAEN ${node.code} — ${node.name}`, listed)
              : undefined,
          ].filter(Boolean),
        }}
      />
      <nav aria-label="Traseu">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          <li>
            <Link href="/" className="hover:text-accent">
              Acasă
            </Link>
          </li>
          {ancestors.map((item) => (
            <li key={item.slug} className="flex items-center gap-2">
              <span aria-hidden="true">/</span>
              <Link
                href={caenPath(item.slug)}
                title={item.name}
                className="hover:text-accent"
              >
                <span className="sr-only">{levelLabel[item.level]} </span>
                {item.code}
              </Link>
            </li>
          ))}
          <li className="flex items-center gap-2" aria-current="page">
            <span aria-hidden="true">/</span>
            <span className="text-ink">{node.code}</span>
          </li>
        </ol>
      </nav>

      <p className="mt-8 text-sm text-muted">
        {levelLabel[node.level]} · CAEN Rev. 3
      </p>
      <h1 className="mt-2">
        <span className="block text-[2.75rem] leading-none font-semibold tracking-[-0.04em] tabular-nums text-ink">
          {node.code}
        </span>
        <span className="mt-3 block text-[1.75rem] leading-[1.12] font-semibold tracking-[-0.025em] text-balance sm:text-[2rem]">
          {node.name}
        </span>
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-pretty text-muted">
        {describe(node)}
      </p>
      {node.level === "class" ? <CopyCode code={node.code} /> : null}

      {ancestors.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-[1.375rem] font-semibold tracking-[-0.022em]">Încadrare</h2>
          <ol className="mt-3 border-t border-line">
            {[...ancestors, node].map((item) => (
              <li key={item.slug} className="border-b border-line">
                <HierarchyRow item={item} current={item.slug === node.slug} />
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {node.level === "division" ? (
        <div className="mt-12">
          {children.map((group) => (
            <section key={group.slug} id={group.code} className="mt-10">
              <h2 className="text-[1.25rem] leading-snug font-semibold tracking-[-0.02em]">
                <Link href={caenPath(group.slug)} className="hover:text-accent">
                  <span className="mr-3 text-[15px] font-medium tabular-nums text-muted">
                    {group.code}
                  </span>
                  {group.name}
                </Link>
              </h2>
              <ul className="mt-2">
                {childrenOf(group).map((item) => (
                  <CodeRow key={item.slug} node={item} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : null}

      {node.level === "section" ? (
        <section className="mt-12">
          <h2 className="text-[1.375rem] font-semibold tracking-[-0.022em]">Diviziuni</h2>
          <ul className="mt-3">
            {children.map((division) => (
              <CodeRow
                key={division.slug}
                node={division}
                meta={`${plural(division.groupCount, "grupă", "grupe")} · ${plural(division.classCount, "clasă", "clase")}`}
              />
            ))}
          </ul>
        </section>
      ) : null}

      {node.level === "group" ? (
        <section className="mt-12">
          <h2 className="text-[1.375rem] font-semibold tracking-[-0.022em]">Clase</h2>
          <ul className="mt-3">
            {children.map((item) => (
              <CodeRow key={item.slug} node={item} />
            ))}
          </ul>
        </section>
      ) : null}

      {node.level === "class" ? <SiblingClasses node={node} /> : null}
    </>
  );
}

function HierarchyRow({
  item,
  current,
}: {
  item: CaenNode;
  current: boolean;
}) {
  const body = (
    <>
      <span className="text-sm text-muted">{levelLabel[item.level]}</span>
      <span className="text-[15px] font-medium tabular-nums text-ink">
        {item.code}
      </span>
      <span className={current ? "font-medium text-ink" : "text-ink"}>
        {item.name}
      </span>
    </>
  );
  const className =
    "grid grid-cols-[6rem_3.25rem_minmax(0,1fr)] items-baseline gap-x-3 py-3";

  if (current) {
    return (
      <div className={className} aria-current="page">
        {body}
      </div>
    );
  }

  return (
    <Link
      href={caenPath(item.slug)}
      className={`${className} hover:bg-accent-soft/80`}
    >
      {body}
    </Link>
  );
}

function SiblingClasses({ node }: { node: CaenNode }) {
  const group = node.groupSlug ? getBySlug(node.groupSlug) : undefined;
  if (!group) return null;
  const siblings = childrenOf(group).filter((item) => item.slug !== node.slug);
  if (siblings.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-[1.375rem] font-semibold tracking-[-0.022em]">
        Alte clase din grupa {group.code}
      </h2>
      <ul className="mt-3">
        {siblings.map((item) => (
          <CodeRow key={item.slug} node={item} />
        ))}
      </ul>
    </section>
  );
}
