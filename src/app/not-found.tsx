import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pagina nu există",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <h1 className="text-[2rem] font-semibold tracking-[-0.028em]">Pagina nu există</h1>
      <p className="mt-3 text-lg text-muted">
        Codul nu este în CAEN Rev. 3, sau adresa este incompletă.
      </p>
      <p className="mt-6">
        <Link
          href="/"
          className="underline decoration-line underline-offset-2 hover:text-accent"
        >
          Înapoi la lista de coduri
        </Link>
      </p>
    </>
  );
}
