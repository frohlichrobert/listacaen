import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { CodeList } from "@/components/code-row";
import {
  rev2Classes,
  rev2Divisions,
  rev2Path,
  targetSummary,
} from "@/lib/rev2";
import { absoluteUrl } from "@/lib/site";

const title = "Corespondență CAEN Rev. 2 – Rev. 3: tabel complet";
const description =
  "Tabelul complet de corespondență între codurile CAEN Rev. 2 și CAEN Rev. 3: caută codul vechi și vezi cu ce cod nou se echivalează.";

export const metadata: Metadata = {
  title: { absolute: `${title} | listacaen.ro` },
  description,
  alternates: { canonical: "/caen-rev2/" },
  openGraph: {
    title,
    description,
    url: "/caen-rev2/",
    siteName: "listacaen.ro",
    locale: "ro_RO",
    type: "website",
  },
};

export default function Rev2IndexPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Coduri CAEN Rev. 2",
          numberOfItems: rev2Classes.length,
          itemListElement: rev2Classes.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: `CAEN ${item.code} — ${item.name}`,
            url: absoluteUrl(rev2Path(item.code)),
          })),
        }}
      />
      <p className="text-[13px] font-medium text-accent">CAEN Rev. 2 → Rev. 3</p>
      <h1 className="mt-2 text-[2.25rem] font-semibold leading-[1.08] tracking-[-0.032em] text-balance">
        Corespondență CAEN Rev. 2 – Rev. 3
      </h1>
      <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-pretty text-muted">
        Cauți un cod CAEN vechi? Mai jos sunt toate cele{" "}
        {rev2Classes.length} de clase din CAEN Rev. 2, cu codul sau codurile
        corespondente din{" "}
        <Link href="/" className="underline decoration-line underline-offset-2 hover:text-accent">
          CAEN Rev. 3
        </Link>
        , în vigoare din 1 ianuarie 2025. Corespondența urmează tabelul INS.
      </p>
      {rev2Divisions.map((division) => {
        const items = rev2Classes.filter((item) => item.division === division.code);
        if (items.length === 0) return null;
        return (
          <section key={division.code} className="mt-10">
            <h2 className="text-[1.125rem] leading-snug font-semibold tracking-[-0.02em]">
              <span className="mr-3 text-[15px] font-medium tabular-nums text-muted">
                {division.code}
              </span>
              {division.name}
            </h2>
            <CodeList>
              {items.map((item) => (
                <li key={item.code} className="border-b border-line/80 last:border-b-0">
                  <Link
                    href={rev2Path(item.code)}
                    className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-baseline gap-x-3 px-4 py-3.5 hover:bg-hover focus-visible:bg-hover focus-visible:outline-none sm:grid-cols-[2.75rem_minmax(0,1fr)_auto]"
                  >
                    <span className="text-[15px] font-medium tabular-nums text-code">
                      {item.code}
                    </span>
                    <span className="min-w-0 leading-snug text-ink">{item.name}</span>
                    <span className="col-start-2 text-[13px] text-muted sm:col-start-auto sm:text-right">
                      Rev. 3: {targetSummary(item.code)}
                    </span>
                  </Link>
                </li>
              ))}
            </CodeList>
          </section>
        );
      })}
    </>
  );
}
