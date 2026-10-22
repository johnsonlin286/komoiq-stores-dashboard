import "server-only";

import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale, type Locale } from "@/i18n/locale";
import { decrypt } from "@/server/session";

// No URL-based locale routing (no /en/, /id/ prefixes) — this app's routes
// are already gated by role (/store-admin, /store-managment), and the
// brief wants the language choice tied to the signed-in account, not the
// URL. So the locale is read straight from the session cookie instead.
async function resolveLocale(): Promise<Locale> {
  const token = (await cookies()).get("session")?.value;
  const user = await decrypt(token);
  if (user && isLocale(user.locale)) return user.locale;
  return defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();
  const messages = (await import(`../messages/${locale}.json`)).default;

  return { locale, messages };
});
