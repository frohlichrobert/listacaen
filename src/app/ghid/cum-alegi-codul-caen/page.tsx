import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { absoluteUrl, caenPath } from "@/lib/site";

const title = "Cum alegi codul CAEN pentru firma ta";
const description =
  "Cum găsești codul CAEN potrivit pentru SRL, PFA sau II: activitate principală și secundare, căutare în lista CAEN Rev. 3 și ce verifici înainte să îl declari.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/ghid/cum-alegi-codul-caen/" },
  openGraph: {
    title,
    description,
    url: "/ghid/cum-alegi-codul-caen/",
    siteName: "listacaen.ro",
    locale: "ro_RO",
    type: "article",
  },
};

const link =
  "underline decoration-line underline-offset-2 hover:text-accent";

export default function GuidePage() {
  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: title,
          description,
          inLanguage: "ro-RO",
          mainEntityOfPage: absoluteUrl("/ghid/cum-alegi-codul-caen/"),
          publisher: { "@type": "Organization", name: "listacaen.ro" },
        }}
      />
      <h1 className="text-[2rem] font-semibold leading-[1.1] tracking-[-0.028em] text-balance">
        {title}
      </h1>
      <div className="mt-6 space-y-5 text-[1.0625rem] leading-relaxed text-pretty">
        <p>
          Când înființezi o firmă, un PFA sau o întreprindere individuală,
          declari unul sau mai multe coduri CAEN. Un cod CAEN are patru cifre
          și descrie o activitate economică. Mai jos găsești pașii pentru a-l
          alege, folosind{" "}
          <Link href="/" className={link}>
            lista codurilor CAEN Rev. 3
          </Link>
          .
        </p>

        <h2 className="pt-4 text-[1.375rem] font-semibold tracking-[-0.022em] text-ink">
          1. Descrie activitatea în cuvinte simple
        </h2>
        <p>
          Scrie ce vei face concret: „dezvolt aplicații la comandă”, „vând
          haine online”, „transport marfă”. Aceste cuvinte sunt punctul de
          plecare pentru căutare.
        </p>

        <h2 className="pt-4 text-[1.375rem] font-semibold tracking-[-0.022em] text-ink">
          2. Caută în lista CAEN
        </h2>
        <p>
          Folosește căutarea de pe{" "}
          <Link href="/" className={link}>
            prima pagină
          </Link>{" "}
          după cuvinte din denumire, fără diacritice, sau după un prefix de
          cod. Dacă știi domeniul, intră pe diviziunea potrivită și citește
          toate grupele ei. Exemplu:{" "}
          <Link href={caenPath("62")} className={link}>
            diviziunea 62
          </Link>{" "}
          pentru programare și consultanță IT sau{" "}
          <Link href={caenPath("56")} className={link}>
            diviziunea 56
          </Link>{" "}
          pentru restaurante și servirea băuturilor.
        </p>

        <h2 className="pt-4 text-[1.375rem] font-semibold tracking-[-0.022em] text-ink">
          3. Alege clasa, nu grupa
        </h2>
        <p>
          Codul declarat este clasa, cu patru cifre. Grupa (trei cifre) și
          diviziunea (două cifre) te ajută doar să navighezi. Citește și clasele
          vecine din aceeași grupă, pentru că denumirile apropiate se
          deosebesc prin detalii.
        </p>

        <h2 className="pt-4 text-[1.375rem] font-semibold tracking-[-0.022em] text-ink">
          4. Activitate principală și activități secundare
        </h2>
        <p>
          Activitatea principală este cea care aduce cea mai mare parte din
          venituri. Pe lângă ea poți declara activități secundare, dacă le
          desfășori sau vrei să le poți desfășura. Unele activități cer
          autorizații sau avize speciale, deci verifică acest lucru înainte să
          declari codul.
        </p>

        <h2 className="pt-4 text-[1.375rem] font-semibold tracking-[-0.022em] text-ink">
          5. Atenție la versiune: Rev. 2 sau Rev. 3
        </h2>
        <p>
          Din 1 ianuarie 2025 este în vigoare CAEN Rev. 3 (Ordinul INS nr.
          377/2024), aliniat la NACE Rev. 2.1. Unele coduri din Rev. 2 au fost
          redenumite, împărțite sau unite, așa că un cod vechi nu mai are
          mereu aceeași denumire. Dacă firma ta are coduri din Rev. 2,
          verifică tabelul oficial de corespondență publicat de{" "}
          <a
            href="https://insse.ro"
            className={link}
            rel="noopener noreferrer"
          >
            Institutul Național de Statistică
          </a>{" "}
          și termenele comunicate de{" "}
          <a
            href="https://www.onrc.ro"
            className={link}
            rel="noopener noreferrer"
          >
            Oficiul Național al Registrului Comerțului
          </a>
          .
        </p>

        <h2 className="pt-4 text-[1.375rem] font-semibold tracking-[-0.022em] text-ink">
          6. Confirmă codul înainte să îl declari
        </h2>
        <p>
          Site-ul listează denumirile din nomenclator, dar nu alege codul în
          locul tău. Pentru o decizie sigură, discută cu un contabil sau cu
          Registrul Comerțului, mai ales dacă activitatea e la limita dintre
          două coduri.
        </p>
      </div>
    </article>
  );
}
