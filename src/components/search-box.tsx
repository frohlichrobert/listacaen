"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { searchCaen, searchContext, type CaenNode } from "@/lib/caen";
import { caenPath } from "@/lib/site";

export function SearchBox({ variant = "compact" }: { variant?: "hero" | "compact" }) {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const limit = variant === "hero" ? 12 : 8;

  const { hits, total } = useMemo(
    () => searchCaen(query, limit),
    [query, limit],
  );

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

  function go(node: CaenNode) {
    setOpen(false);
    router.push(caenPath(node.slug));
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
  const activeId = hits[active] ? `${listId}-${hits[active].slug}` : undefined;

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
          className={`w-full border border-line bg-card text-ink outline-none placeholder:text-muted/80 focus:border-accent focus:ring-4 focus:ring-accent/15 ${
            variant === "hero"
              ? "rounded-xl px-4 py-3 text-[17px]"
              : "rounded-lg px-3.5 py-2 text-[15px]"
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
              ? "absolute z-40 mt-2 w-full overflow-hidden rounded-xl border border-line bg-card shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
              : "mt-3 overflow-hidden rounded-xl border border-line bg-card"
          }
        >
          {hits.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted">
              Niciun cod pentru „{query.trim()}”.
            </p>
          ) : (
            <ul id={`${listId}-results`} role="listbox" className="py-1">
              {hits.map((hit, index) => (
                <li key={hit.slug} role="presentation">
                  <button
                    id={`${listId}-${hit.slug}`}
                    type="button"
                    role="option"
                    aria-selected={index === active}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => go(hit)}
                    className={`grid w-full grid-cols-[3.4rem_minmax(0,1fr)] items-baseline gap-x-3 px-3 py-2.5 text-left ${
                      index === active ? "bg-accent-soft" : ""
                    }`}
                  >
                    <span className="text-[15px] font-medium tabular-nums text-ink">
                      {hit.code}
                    </span>
                    <span className="min-w-0">
                      <span className="block leading-snug">{hit.name}</span>
                      <span className="mt-0.5 block text-sm text-muted">
                        {searchContext(hit)}
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
