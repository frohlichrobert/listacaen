import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-line">
      <div className="mx-auto max-w-[42rem] px-5 py-8 text-sm leading-relaxed text-muted">
        <p>listacaen.ro · nomenclator CAEN Rev. 3, în vigoare din 1 ianuarie 2025.</p>
        <p className="mt-2">
          Denumirile urmează clasificarea oficială, Ordinul Institutului
          Național de Statistică nr. 377/2024, aliniată la NACE Rev. 2.1.
        </p>
        <p className="mt-3">
          <Link href="/despre/" className="underline decoration-line underline-offset-2 hover:text-accent">
            Ce este codul CAEN
          </Link>
        </p>
      </div>
    </footer>
  );
}
