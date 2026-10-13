import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import {
  getRev2,
  rev2Classes,
  rev2Path,
  targetSummary,
  targetsOf,
} from "@/lib/rev2";
import { absoluteUrl, caenPath } from "@/lib/site";
import { clip } from "@/lib/text";

export const dynamicParams = false;

export function generateStaticParams() {
  return rev2Classes.map((item) => ({ code: item.code }));
}

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const item = getRev2(code);
  if (!item) return { title: "Cod negăsit" };

  const summary = targetSummary(code);
  const targets = targetsOf(code);
  const title =
    targets.length === 0
      ? `Cod CAEN ${code} (Rev. 2) — fără corespondent în Rev. 3`
      : `Cod CAEN ${code} (Rev. 2) — corespondent Rev. 3: ${summary}`;
  const description = clip(
    targets.length === 0
      ? `Codul CAEN ${code} din Rev. 2, „${item.name}”, nu are corespondent direct în CAEN Rev. 3, conform tabelului de corespondență publicat de INS.`
      : `Codul CAEN ${code} din Rev. 2, „${item.name}”, devine în CAEN Rev. 3: ${summary}. Corespondența Rev. 2 – Rev. 3 după tabelul INS.`,
    158,
  );

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: rev2Path(code) },
    openGraph: {
      title,
      description,
      url: rev2Path(code),
      siteName: "listacaen.ro",
      locale: "ro_RO",
      type: "website",
    },
  };
}

export default async function Rev2Page({ params }: Props) {
  const { code } = await params;
  const item = getRev2(code);
  if (!item) notFound();

  const targets = targetsOf(code);
  const unchanged =
    targets.length === 1 && targets[0].node.code === code && !targets[0].note;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { name: "Coduri CAEN", path: "/" },
            { name: "Corespondență Rev. 2 – Rev. 3", path: "/caen-rev2/" },
            { name: `Cod CAEN ${code} (Rev. 2)`, path: rev2Path(code) },
          ].map((crumb, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: crumb.name,
            item: absoluteUrl(crumb.path),
          })),
        }}
      />
      <nav aria-label="Traseu">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
          <li>
            <Link href="/" className="hover:text-accent">
              Acasă
            </Link>
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            <Link href="/caen-rev2/" className="hover:text-accent">
              Rev. 2
            </Link>
          </li>
          <li className="flex items-center gap-2" aria-current="page">
            <span aria-hidden="true">/</span>
            <span className="text-ink">{code}</span>
          </li>
        </ol>
      </nav>

      <p className="mt-8 text-[13px] font-medium text-accent">
        Clasă · CAEN Rev. 2
      </p>
      <h1 className="mt-2">
        <span className="block text-[2.75rem] leading-none font-semibold tracking-[-0.04em] tabular-nums text-code">
          {code}
        </span>
        <span className="mt-3 block text-[1.65rem] leading-[1.15] font-semibold tracking-[-0.025em] text-balance sm:text-[1.85rem]">
          {item.name}
        </span>
      </h1>
      <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-pretty text-muted">
        {targets.length === 0
          ? `Codul ${code} din CAEN Rev. 2 nu are corespondent direct în CAEN Rev. 3, conform tabelului de corespondență al INS.`
          : unchanged
            ? `Codul ${code} din CAEN Rev. 2 se păstrează neschimbat în CAEN Rev. 3.`
            : `Codul ${code} din CAEN Rev. 2 corespunde în CAEN Rev. 3 cu ${targets.length === 1 ? "codul" : "codurile"} ${targetSummary(code)}.`}
      </p>

      {targets.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-[1.25rem] font-semibold tracking-[-0.022em]">
            Echivalent în CAEN Rev. 3
          </h2>
          <ul className="mt-3 overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(18,56,36,0.06),0_0_0_1px_rgba(18,56,36,0.08)]">
            {targets.map(({ node, note }) => (
              <li
                key={node.slug + note}
                className="border-b border-line/80 last:border-b-0"
              >
                <Link
                  href={caenPath(node.slug)}
                  className="block px-4 py-3.5 hover:bg-hover focus-visible:bg-hover focus-visible:outline-none"
                >
                  <span className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-baseline gap-x-3">
                    <span className="text-[15px] font-medium tabular-nums text-code">
                      {node.code}
                    </span>
                    <span className="leading-snug text-ink">{node.name}</span>
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
      ) : null}

      <p className="mt-10 text-[13px] leading-relaxed text-muted">
        Sursa: tabelul de corespondență CAEN Rev. 2 – CAEN Rev. 3 publicat de{" "}
        <a
          href="https://insse.ro"
          className="underline decoration-line underline-offset-2 hover:text-accent"
          rel="noopener noreferrer"
        >
          Institutul Național de Statistică
        </a>
        . Verifică tabelul oficial și la ONRC înainte să modifici codurile
        firmei. Vezi toate{" "}
        <Link
          href="/caen-rev2/"
          className="underline decoration-line underline-offset-2 hover:text-accent"
        >
          codurile CAEN Rev. 2 și echivalentul lor în Rev. 3
        </Link>
        .
      </p>
    </>
  );
}
