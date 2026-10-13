"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";
import { CONSENT_KEY, GA_ID } from "@/lib/analytics";

type Consent = "granted" | "denied" | "unset" | "pending";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getSnapshot(): Consent {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : "unset";
  } catch {
    return "unset";
  }
}

function getServerSnapshot(): Consent {
  return "pending";
}

function write(value: "granted" | "denied" | null) {
  try {
    if (value) window.localStorage.setItem(CONSENT_KEY, value);
    else window.localStorage.removeItem(CONSENT_KEY);
  } catch {
    // fără stocare, alegerea ține doar până la reîncărcare
  }
  listeners.forEach((listener) => listener());
}

function choose(value: "granted" | "denied") {
  if (value === "denied") {
    window.gtag?.("consent", "update", { analytics_storage: "denied" });
    for (const name of document.cookie.split(";")) {
      const key = name.split("=")[0]?.trim();
      if (key && (key === "_ga" || key.startsWith("_ga_"))) {
        document.cookie = `${key}=; Max-Age=0; path=/`;
      }
    }
  }
  write(value);
}

export function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" onClick={() => write(null)} className={className}>
      Setări cookie
    </button>
  );
}

export function Consent() {
  const consent = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return (
    <>
      {consent === "granted" && process.env.NODE_ENV === "production" ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted'});
gtag('js',new Date());gtag('config','${GA_ID}');`}
          </Script>
        </>
      ) : null}
      {consent === "unset" ? (
        <div
          role="dialog"
          aria-label="Cookie-uri"
          className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-[44rem] rounded-2xl bg-card p-4 text-[14px] leading-relaxed text-ink shadow-[0_12px_32px_rgba(18,56,36,0.18),0_0_0_1px_rgba(18,56,36,0.1)]"
        >
          <p>
            Folosim Google Analytics pentru statistici anonime de vizitare,
            doar dacă ești de acord. Poți schimba alegerea oricând din
            „Setări cookie” din subsol.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => choose("granted")}
              className="rounded-full bg-ink px-4 py-2 font-medium text-paper hover:opacity-90"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => choose("denied")}
              className="rounded-full px-4 py-2 font-medium text-ink shadow-[0_0_0_1px_rgba(18,56,36,0.2)] hover:bg-hover"
            >
              Refuz
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
