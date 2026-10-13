import Script from "next/script";
import { adSlots, type AdSlotId } from "@/lib/ads";

export function AdSlot({ id }: { id: AdSlotId }) {
  const slot = adSlots[id];
  if (!slot?.html) return null;

  return (
    <aside aria-label="Publicitate" data-ad-slot={id} className="mt-10">
      <p className="mb-2 text-[13px] text-muted">Publicitate</p>
      <div
        className="overflow-hidden rounded-2xl bg-card px-4 py-4 shadow-[0_1px_2px_rgba(18,56,36,0.06),0_0_0_1px_rgba(18,56,36,0.08)]"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: slot.html }}
      />
      {slot.scriptSrc ? (
        <Script src={slot.scriptSrc} strategy="lazyOnload" />
      ) : null}
    </aside>
  );
}
