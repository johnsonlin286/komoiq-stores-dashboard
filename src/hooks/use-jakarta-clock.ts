"use client";

import { useRef, useSyncExternalStore } from "react";
import { useLocale } from "next-intl";

const emptyClock = { date: "", time: "" };

function formatClock(locale: string) {
  const now = new Date();
  const intlLocale = locale === "id" ? "id-ID" : "en-US";

  return {
    date: new Intl.DateTimeFormat(intlLocale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Jakarta",
    }).format(now),
    time: new Intl.DateTimeFormat(intlLocale, {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }).format(now),
  };
}

export function useJakartaClock() {
  const locale = useLocale();
  // getSnapshot must return a stable reference when nothing actually changed
  // (React calls it on every render to check for tearing); caching here, in a
  // ref scoped to this hook instance, keeps that stability without the old
  // module-level singleton's cross-locale leak.
  const cacheRef = useRef({ locale, date: "", time: "" });

  // Subscribe/getSnapshot close over the current locale, so switching locales
  // can't leak one locale's formatted string into another. Starts empty
  // server-side so the server-rendered markup and the first client render
  // match (the server has no reliable "now"); fills in right after mount.
  return useSyncExternalStore(
    (callback) => {
      const timer = window.setInterval(callback, 30_000);
      return () => window.clearInterval(timer);
    },
    () => {
      const next = formatClock(locale);
      const cached = cacheRef.current;
      if (cached.locale === locale && cached.date === next.date && cached.time === next.time) {
        return cached;
      }
      cacheRef.current = { locale, ...next };
      return cacheRef.current;
    },
    () => emptyClock,
  );
}
