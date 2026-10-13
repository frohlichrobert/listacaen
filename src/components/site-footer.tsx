import Link from "next/link";
import { CookieSettingsButton } from "@/components/consent";
import { caenSections } from "@/lib/caen";
import { caenPath } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-16">
      <div className="mx-auto max-w-[44rem] px-5 py-8 text-[13px] leading-relaxed text-muted">
        <p>listacaen.ro · nomenclator CAEN Rev. 3, în vigoare din 1 ianuarie 2025.</p>
        <p className="mt-2">
          Denumirile urmează clasificarea oficială, Ordinul Institutului
          Național de Statistică nr. 377/2024, aliniată la NACE Rev. 2.1.
        </p>
        <nav aria-label="Secțiuni CAEN" className="mt-4">
          <p className="font-medium text-ink">Secțiuni CAEN</p>
          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            {caenSections.map((section) => (
              <li key={section.slug}>
                <Link
                  href={caenPath(section.slug)}
                  title={section.name}
                  className="underline decoration-line underline-offset-2 hover:text-accent"
                >
                  {section.code}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mt-3">
          <Link href="/despre/" className="underline decoration-line underline-offset-2 hover:text-accent">
            Ce este codul CAEN
          </Link>
          {" · "}
          <Link href="/ghid/cum-alegi-codul-caen/" className="underline decoration-line underline-offset-2 hover:text-accent">
            Cum alegi codul CAEN
          </Link>
          {" · "}
          <Link href="/caen-rev2/" className="underline decoration-line underline-offset-2 hover:text-accent">
            Corespondență Rev. 2 – Rev. 3
          </Link>
          {" · "}
          <CookieSettingsButton className="underline decoration-line underline-offset-2 hover:text-accent" />
        </p>
      </div>
    </footer>
  );
}
