"use client";

import { useState } from "react";

export function CopyCode({ code }: { code: string }) {
  const [label, setLabel] = useState("Copiază codul");

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setLabel("Copiat");
    } catch {
      setLabel("Nu s-a putut copia");
    }
    window.setTimeout(() => setLabel("Copiază codul"), 1600);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="mt-5 inline-flex items-center rounded-full bg-accent px-4 py-1.5 text-sm text-white hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {label}
    </button>
  );
}
