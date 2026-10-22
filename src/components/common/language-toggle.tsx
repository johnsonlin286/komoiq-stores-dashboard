"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/app/actions/locale";
import type { Locale } from "@/i18n/locale";

export function LanguageToggle({
  currentLocale,
  className = "",
}: {
  currentLocale: Locale;
  className?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(locale: Locale) {
    if (locale === currentLocale || pending) return;
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  }

  return (
    <div
      className={`inline-flex h-9 items-center overflow-hidden rounded-xl border border-white/20 text-xs font-semibold ${className}`}
      role="group"
      aria-label="Language"
    >
      <LocaleButton locale="en" active={currentLocale === "en"} onSelect={choose}>
        EN
      </LocaleButton>
      <span className="h-full w-px bg-white/20" />
      <LocaleButton locale="id" active={currentLocale === "id"} onSelect={choose}>
        ID
      </LocaleButton>
    </div>
  );
}

function LocaleButton({
  locale,
  active,
  onSelect,
  children,
}: {
  locale: Locale;
  active: boolean;
  onSelect: (locale: Locale) => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onSelect(locale)}
      className={`h-full px-3 transition ${active ? "bg-white/20 text-panel" : "text-panel/70 hover:bg-white/10"}`}
    >
      {children}
    </button>
  );
}
