import type { Metadata } from "next";
import Link from "next/link";
import { counts } from "@/lib/caen";
import { caenPath } from "@/lib/site";

export const metadata: Metadata = {
  title: "Ce este codul CAEN",
  description:
    "Ce este CAEN Rev. 3, cum sunt organizate secțiunile, diviziunile, grupele și clasele, și cum cauți un cod de activitate.",
  alternates: { canonical: "/despre/" },
  openGraph: {
    title: "Ce este codul CAEN",
    description:
      "CAEN Rev. 3 explicat pe scurt: cele patru niveluri și cum găsești clasa potrivită.",
    url: "/despre/",
    siteName: "listacaen.ro",
    locale: "ro_RO",
    type: "article",
  },
};

export default function AboutPage() {
  return (
    <article>
      <h1 className="text-[2rem] font-semibold leading-[1.1] tracking-[-0.028em] text-balance">
        Ce este codul CAEN
      </h1>
      <div className="mt-6 space-y-5 text-[1.0625rem] leading-relaxed text-pretty">
        <p>
          CAEN, Clasificarea activităților din economia națională, este
          nomenclatorul prin care activitățile economice din România primesc un
          cod. Codul folosit la înregistrarea unei firme este clasa: patru
          cifre.
        </p>
        <h2 className="pt-4 text-[1.375rem] font-semibold tracking-[-0.022em] text-ink">
          CAEN Rev. 3
        </h2>
        <p>
          Versiunea în vigoare din 1 ianuarie 2025 este CAEN Rev. 3, aprobată
          prin Ordinul președintelui Institutului Național de Statistică nr.
          377/2024. Este aliniată cu NACE Rev. 2.1, clasificarea folosită în
          Uniunea Europeană.
        </p>
        <p>
          Nomenclatorul are patru niveluri: {counts.sections} de secțiuni,{" "}
          {counts.divisions} de diviziuni, {counts.groups} de grupe și{" "}
          {counts.classes} de clase.
        </p>
        <ul className="space-y-2 pl-1">
          <li>
            <Link href={caenPath("k")} className="underline decoration-line underline-offset-2 hover:text-accent">
              Secțiune
            </Link>
            {" — o literă, de la A la V. Exemplu: K, telecomunicații și tehnologia informației."}
          </li>
          <li>
            <Link href={caenPath("62")} className="underline decoration-line underline-offset-2 hover:text-accent">
              Diviziune
            </Link>
            {" — două cifre. Exemplu: 62, programare și consultanță IT."}
          </li>
          <li>
            <Link href={caenPath("621")} className="underline decoration-line underline-offset-2 hover:text-accent">
              Grupă
            </Link>
            {" — trei cifre. Exemplu: 621, activități de programare."}
          </li>
          <li>
            <Link href={caenPath("6210")} className="underline decoration-line underline-offset-2 hover:text-accent">
              Clasă
            </Link>
            {" — patru cifre. Exemplu: 6210, realizarea softului la comandă."}
          </li>
        </ul>
        <h2 className="pt-4 text-[1.375rem] font-semibold tracking-[-0.022em] text-ink">
          Cum cauți
        </h2>
        <p>
          Poți căuta după cod, inclusiv un prefix cum este 62, sau după
          cuvinte din denumire: software, restaurant, construcții. Diacriticele
          nu sunt obligatorii. Fiecare secțiune, diviziune, grupă și clasă are
          pagină proprie, cu locul ei în ierarhie.
        </p>
        <h2 className="pt-4 text-[1.375rem] font-semibold tracking-[-0.022em] text-ink">
          Ce găsești aici
        </h2>
        <p>
          listacaen.ro listează denumirile și ierarhia din nomenclator, ca să
          ajungi repede la un cod. Nu înlocuiește textul din Monitorul Oficial
          și nu alege codul pe care trebuie să îl declari pentru o firmă.
          Clasificarea oficială este publicată de{" "}
          <a
            href="https://insse.ro"
            className="underline decoration-line underline-offset-2 hover:text-accent"
            rel="noopener noreferrer"
          >
            Institutul Național de Statistică
          </a>
          , iar înregistrarea firmelor se face la{" "}
          <a
            href="https://www.onrc.ro"
            className="underline decoration-line underline-offset-2 hover:text-accent"
            rel="noopener noreferrer"
          >
            Oficiul Național al Registrului Comerțului
          </a>
          .
        </p>
      </div>
    </article>
  );
}
