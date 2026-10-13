"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { searchCaen, searchContext } from "@/lib/caen";
import { isCodeQuery, searchRev2 } from "@/lib/rev2-search";
import { caenPath } from "@/lib/site";

type Hit = {
  key: string;
  code: string;
  name: string;
  context: string;
  href: string;
};

export function SearchBox({ variant = "compact" }: { variant?: "hero" | "compact" }) {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const limit = variant === "hero" ? 12 : 8;

  const { hits, total } = useMemo(() => {
    const result = searchCaen(query, limit);
    const list: Hit[] = result.hits.map((node) => ({
      key: node.slug,
      code: node.code,
      name: node.name,
      context: searchContext(node),
      href: caenPath(node.slug),
    }));
    // Coduri vechi: la căutări după cifre sau când Rev. 3 nu are nimic.
    const wantsRev2 = isCodeQuery(query) || result.total === 0;
    const old = wantsRev2 ? searchRev2(query, 5) : [];
    for (const item of old) {
      list.push({
        key: `rev2-${item.code}`,
        code: item.code,
        name: item.name,
        context: "Cod vechi, CAEN Rev. 2 · vezi echivalentul în Rev. 3",
        href: `/caen-rev2/${item.code}/`,
      });
    }
    return { hits: list, total: result.total + old.length };
  }, [query, limit]);

  useEffect(() => {
    if (variant !== "hero") return;
    const params = new URLSearchParams(window.location.search).get("q");
    if (params) {
      setQuery(params);
      setOpen(true);
    }
  }, [variant]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  function go(hit: Hit) {
    setOpen(false);
    router.push(hit.href);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((current) => Math.min(current + 1, Math.max(hits.length - 1, 0)));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
    } else if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "Enter" && hits[active]) {
      event.preventDefault();
      go(hits[active]);
    }
  }

  const showList = open && query.trim().length > 0;
  const activeId = hits[active] ? `${listId}-${hits[active].key}` : undefined;

  return (
    <div ref={rootRef} className="relative">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (hits[active]) go(hits[active]);
        }}
      >
        <label htmlFor={listId} className="sr-only">
          Caută un cod CAEN sau o activitate
        </label>
        <input
          id={listId}
          type="search"
          value={query}
          role="combobox"
          aria-expanded={showList}
          aria-controls={`${listId}-results`}
          aria-autocomplete="list"
          aria-activedescendant={showList ? activeId : undefined}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          placeholder={
            variant === "hero"
              ? "Cod sau activitate — 6210, software, construcții"
              : "Caută un cod CAEN"
          }
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={`w-full bg-card text-ink shadow-[0_1px_2px_rgba(18,56,36,0.06),0_0_0_1px_rgba(18,56,36,0.1)] outline-none placeholder:text-muted/70 focus:shadow-[0_0_0_4px_rgba(196,83,42,0.18),0_0_0_1px_#c4532a] ${
            variant === "hero"
              ? "rounded-2xl px-4 py-3.5 text-[17px]"
              : "rounded-xl px-3.5 py-2 text-[15px]"
          }`}
        />
      </form>
      <p className="sr-only" aria-live="polite">
        {query.trim() ? `${total} rezultate` : ""}
      </p>
      {showList ? (
        <div
          className={
            variant === "compact"
              ? "absolute z-40 mt-2 w-full overflow-hidden rounded-2xl bg-card shadow-[0_12px_32px_rgba(18,56,36,0.14),0_0_0_1px_rgba(18,56,36,0.08)]"
              : "mt-3 overflow-hidden rounded-2xl bg-card shadow-[0_12px_32px_rgba(18,56,36,0.14),0_0_0_1px_rgba(18,56,36,0.08)]"
          }
        >
          {hits.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">
              Niciun cod pentru „{query.trim()}”.
            </p>
          ) : (
            <ul id={`${listId}-results`} role="listbox" className="py-1">
              {hits.map((hit, index) => (
                <li key={hit.key} role="presentation">
                  <button
                    id={`${listId}-${hit.key}`}
                    type="button"
                    role="option"
                    aria-selected={index === active}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => go(hit)}
                    className={`grid w-full grid-cols-[3.4rem_minmax(0,1fr)] items-baseline gap-x-3 px-4 py-3 text-left ${
                      index === active ? "bg-hover" : ""
                    }`}
                  >
                    <span className="text-[15px] font-medium tabular-nums text-code">
                      {hit.code}
                    </span>
                    <span className="min-w-0">
                      <span className="block leading-snug">{hit.name}</span>
                      <span className="mt-0.5 block text-sm text-muted">
                        {hit.context}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {total > hits.length ? (
            <p className="border-t border-line px-4 py-2 text-sm text-muted">
              {hits.length} din {total} rezultate. Îngustează căutarea.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
