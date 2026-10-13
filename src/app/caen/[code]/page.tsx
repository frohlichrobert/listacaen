import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/ad-slot";
import { CodeList, CodeRow } from "@/components/code-row";
import { CopyCode } from "@/components/copy-code";
import { JsonLd } from "@/components/json-ld";
import {
  ancestorsOf,
  caenNodes,
  childrenOf,
  describe,
  getBySlug,
  levelLabel,
  neighborsOf,
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
import { rev2Path, sourcesOf } from "@/lib/rev2";
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

      <p className="mt-8 text-[13px] font-medium text-accent">
        {levelLabel[node.level]} · CAEN Rev. 3
      </p>
      <h1 className="mt-2">
        <span className="block text-[2.75rem] leading-none font-semibold tracking-[-0.04em] tabular-nums text-code">
          {node.code}
        </span>
        <span className="mt-3 block text-[1.65rem] leading-[1.15] font-semibold tracking-[-0.025em] text-balance sm:text-[1.85rem]">
          {node.name}
        </span>
      </h1>
      <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-pretty text-muted">
        {describe(node)}
      </p>
      {node.level === "class" ? <CopyCode code={node.code} /> : null}

      {ancestors.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-[1.25rem] font-semibold tracking-[-0.022em]">Încadrare</h2>
          <ol className="mt-3 overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(18,56,36,0.06),0_0_0_1px_rgba(18,56,36,0.08)]">
            {[...ancestors, node].map((item) => (
              <li key={item.slug} className="border-b border-line/80 last:border-b-0">
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
              <CodeList>
                {childrenOf(group).map((item) => (
                  <CodeRow key={item.slug} node={item} />
                ))}
              </CodeList>
            </section>
          ))}
        </div>
      ) : null}

      {node.level === "section" ? (
        <section className="mt-12">
          <h2 className="text-[1.25rem] font-semibold tracking-[-0.022em]">Diviziuni</h2>
          <CodeList>
            {children.map((division) => (
              <CodeRow
                key={division.slug}
                node={division}
                meta={`${plural(division.groupCount, "grupă", "grupe")} · ${plural(division.classCount, "clasă", "clase")}`}
              />
            ))}
          </CodeList>
        </section>
      ) : null}

      {node.level === "group" ? (
        <section className="mt-12">
          <h2 className="text-[1.25rem] font-semibold tracking-[-0.022em]">Clase</h2>
          <CodeList>
            {children.map((item) => (
              <CodeRow key={item.slug} node={item} />
            ))}
          </CodeList>
        </section>
      ) : null}

      {node.level === "class" ? <Rev2Sources node={node} /> : null}
      {node.level === "class" ? <SiblingClasses node={node} /> : null}
      <PrevNext node={node} />
      <AdSlot id="cod" />
    </>
  );
}

function Rev2Sources({ node }: { node: CaenNode }) {
  const sources = sourcesOf(node.code);
  if (sources.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-[1.25rem] font-semibold tracking-[-0.022em]">
        Cod CAEN Rev. 2 corespondent
      </h2>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">
        Codul {node.code} din Rev. 3 preia activități din{" "}
        {sources.length === 1 ? "codul" : "codurile"} CAEN Rev. 2 de mai jos,
        după tabelul INS.
      </p>
      <ul className="mt-3 overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(18,56,36,0.06),0_0_0_1px_rgba(18,56,36,0.08)]">
        {sources.map(({ item, note }) => (
          <li key={item.code + note} className="border-b border-line/80 last:border-b-0">
            <Link
              href={rev2Path(item.code)}
              className="block px-4 py-3.5 hover:bg-hover focus-visible:bg-hover focus-visible:outline-none"
            >
              <span className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-baseline gap-x-3">
                <span className="text-[15px] font-medium tabular-nums text-code">
                  {item.code}
                </span>
                <span className="leading-snug text-ink">{item.name}</span>
              </span>
              {note ? (
                <span className="mt-1 block pl-[3.5rem] text-[13px] leading-snug text-muted">
                  Obs. INS: {note}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PrevNext({ node }: { node: CaenNode }) {
  const { prev, next } = neighborsOf(node);
  if (!prev && !next) return null;
  const label = levelLabel[node.level].toLowerCase();

  return (
    <nav
      aria-label={`Navigare între ${label}`}
      className="mt-12 grid gap-3 text-sm sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={caenPath(prev.slug)}
          rel="prev"
          className="rounded-2xl bg-card px-4 py-3 shadow-[0_0_0_1px_rgba(18,56,36,0.08)] hover:bg-hover"
        >
          <span className="block text-muted">← CAEN anterior</span>
          <span className="mt-1 block text-ink">
            <span className="tabular-nums text-code">{prev.code}</span>{" "}
            {prev.name}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={caenPath(next.slug)}
          rel="next"
          className="rounded-2xl bg-card px-4 py-3 shadow-[0_0_0_1px_rgba(18,56,36,0.08)] hover:bg-hover sm:text-right"
        >
          <span className="block text-muted">CAEN următor →</span>
          <span className="mt-1 block text-ink">
            <span className="tabular-nums text-code">{next.code}</span>{" "}
            {next.name}
          </span>
        </Link>
      ) : null}
    </nav>
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
      <span className="text-[15px] font-medium tabular-nums text-code">
        {item.code}
      </span>
      <span className={current ? "font-medium text-ink" : "text-ink"}>
        {item.name}
      </span>
    </>
  );
  const className =
    "grid grid-cols-[5.5rem_2.75rem_minmax(0,1fr)] items-baseline gap-x-3 px-4 py-3.5";

  if (current) {
    return (
      <div className={`${className} bg-accent-soft`} aria-current="page">
        {body}
      </div>
    );
  }

  return (
    <Link
      href={caenPath(item.slug)}
      className={`${className} hover:bg-hover`}
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
      <h2 className="text-[1.25rem] font-semibold tracking-[-0.022em]">
        Alte clase din grupa {group.code}
      </h2>
      <CodeList>
        {siblings.map((item) => (
          <CodeRow key={item.slug} node={item} />
        ))}
      </CodeList>
    </section>
  );
}
