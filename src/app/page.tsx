import type { Metadata } from "next";
import { CodeRow } from "@/components/code-row";
import { JsonLd } from "@/components/json-ld";
import { SearchBox } from "@/components/search-box";
import { caenSections, counts } from "@/lib/caen";
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
      <h1 className="text-[2.5rem] font-semibold leading-[1.07] tracking-[-0.03em] text-balance">
        Coduri CAEN
      </h1>
      <p className="mt-3 max-w-[38rem] text-lg leading-relaxed text-pretty text-muted">
        Clasificarea activităților din economia națională, Rev. 3. Caută un
        cod sau răsfoiește secțiunile.
      </p>
      <p className="mt-4 text-sm text-muted">
        {counts.sections} secțiuni · {counts.divisions} diviziuni ·{" "}
        {counts.groups} grupe · {counts.classes} clase
      </p>
      <div className="mt-6">
        <SearchBox variant="hero" />
      </div>
      <h2 className="mt-12 text-[1.375rem] font-semibold tracking-[-0.022em]">
        Secțiuni
      </h2>
      <ul className="mt-3">
        {caenSections.map((section) => (
          <CodeRow
            key={section.slug}
            node={section}
            meta={plural(section.classCount, "clasă", "clase")}
          />
        ))}
      </ul>
    </>
  );
}
