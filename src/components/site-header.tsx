"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchBox } from "@/components/search-box";

export function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-card/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[44rem] flex-wrap items-center gap-3 px-5 py-3">
        <Link
          href="/"
          className="order-1 text-[1.0625rem] font-semibold tracking-[-0.02em] text-ink"
        >
          listacaen
          <span className="text-muted">.ro</span>
        </Link>
        {isHome ? null : (
          <div className="order-3 w-full sm:order-2 sm:w-auto sm:min-w-0 sm:flex-1">
            <SearchBox />
          </div>
        )}
        <Link
          href="/despre/"
          className={`order-2 text-sm text-muted hover:text-accent sm:order-3 ${
            isHome ? "ml-auto" : "ml-auto sm:ml-0"
          }`}
        >
          Despre
        </Link>
      </div>
    </header>
  );
}
