import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/ad-slot";
import { CodeList, CodeRow } from "@/components/code-row";
import { JsonLd } from "@/components/json-ld";
import { SearchBox } from "@/components/search-box";
import { caenSections, counts, getBySlug, type CaenNode } from "@/lib/caen";
import { homeDescription, homeTitle, itemListLd, websiteLd } from "@/lib/seo";
import { plural } from "@/lib/text";

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: homeDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: "/",
    siteName: "listacaen.ro",
    locale: "ro_RO",
    type: "website",
  },
};

const popular = [
  "6210", "6220", "4711", "5630", "4941", "6820", "6920", "6910", "7311", "4399", "9313", "8559",
]
  .map((slug) => getBySlug(slug))
  .filter((node): node is CaenNode => Boolean(node));

export default function Home() {
  return (
    <>
      <JsonLd data={websiteLd()} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          ...itemListLd("Secțiuni CAEN Rev. 3", caenSections),
        }}
      />
      <p className="text-[13px] font-medium text-accent">CAEN Rev. 3</p>
      <h1 className="mt-2 text-[2.75rem] font-semibold leading-[1.05] tracking-[-0.035em] text-balance">
        Coduri CAEN
      </h1>
      <p className="mt-3 max-w-md text-[17px] leading-relaxed text-pretty text-muted">
        Lista CAEN completă: toate codurile CAEN Rev. 3, pentru activitățile
        din economia națională. Caută un cod CAEN sau răsfoiește secțiunile.
      </p>
      <div className="mt-6">
        <SearchBox variant="hero" />
      </div>
      <dl className="mt-6 grid grid-cols-4 overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(18,56,36,0.06),0_0_0_1px_rgba(18,56,36,0.08)]">
        {[
          [counts.sections, "secțiuni"],
          [counts.divisions, "diviziuni"],
          [counts.groups, "grupe"],
          [counts.classes, "clase"],
        ].map(([value, label], index) => (
          <div
            key={label}
            className={`px-2 py-4 text-center sm:px-3 ${index > 0 ? "border-l border-line/80" : ""}`}
          >
            <dt className="text-[1.35rem] font-semibold tracking-[-0.03em] tabular-nums text-code sm:text-[1.5rem]">
              {value}
            </dt>
            <dd className="mt-0.5 text-[11px] text-muted sm:text-[13px]">
              {label}
            </dd>
          </div>
        ))}
      </dl>
      <AdSlot id="acasa" />
      <h2 className="mt-12 text-[1.375rem] font-semibold tracking-[-0.022em]">
        Secțiuni
      </h2>
      <CodeList>
        {caenSections.map((section) => (
          <CodeRow
            key={section.slug}
            node={section}
            meta={plural(section.classCount, "clasă", "clase")}
          />
        ))}
      </CodeList>
      <section className="mt-14">
        <h2 className="text-[1.375rem] font-semibold tracking-[-0.022em]">
          Coduri CAEN căutate frecvent
        </h2>
        <CodeList>
          {popular.map((node) => (
            <CodeRow key={node.slug} node={node} />
          ))}
        </CodeList>
      </section>
      <section className="mt-14 space-y-4 text-[1.0625rem] leading-relaxed text-pretty">
        <h2 className="text-[1.375rem] font-semibold tracking-[-0.022em]">
          Ce sunt codurile CAEN
        </h2>
        <p>
          Codul CAEN (Clasificarea activităților din economia națională)
          identifică activitatea unei firme, PFA sau întreprinderi individuale.
          Lista CAEN de pe această pagină urmează versiunea Rev. 3, în vigoare
          din 1 ianuarie 2025, cu {counts.classes} de coduri CAEN la nivel de
          clasă (patru cifre).
        </p>
        <p>
          Poți căuta un cod CAEN după număr sau după denumire, fără diacritice.
          Fiecare cod are pagina lui, cu locul în ierarhie și clasele vecine.
          Pentru explicații vezi{" "}
          <Link
            href="/despre/"
            className="underline decoration-line underline-offset-2 hover:text-accent"
          >
            ce este codul CAEN
          </Link>{" "}
          sau{" "}
          <Link
            href="/ghid/cum-alegi-codul-caen/"
            className="underline decoration-line underline-offset-2 hover:text-accent"
          >
            cum alegi codul CAEN potrivit
          </Link>
          . Dacă ai un cod vechi, găsești echivalentul în{" "}
          <Link
            href="/caen-rev2/"
            className="underline decoration-line underline-offset-2 hover:text-accent"
          >
            tabelul de corespondență CAEN Rev. 2 – Rev. 3
          </Link>
          .
        </p>
      </section>
    </>
  );
}
