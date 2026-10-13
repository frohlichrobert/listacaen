export const adSlotIds = ["acasa", "cod"] as const;

export type AdSlotId = (typeof adSlotIds)[number];

export type AdPlacement = {
  html: string;
  scriptSrc?: string;
};

// Lasă null cât timp nu e reclamă. Slotul nu se afișează deloc.
// `acasa` — pagina principală, între cifre și lista de secțiuni.
// `cod` — la finalul paginii unui cod, după încadrare și clase.
export const adSlots: Record<AdSlotId, AdPlacement | null> = {
  acasa: null,
  cod: null,
};
