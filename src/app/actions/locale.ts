"use server";

import { getSessionUser } from "@/server/auth";
import { createSession } from "@/server/session";
import type { Locale } from "@/i18n/locale";

// Persists the EN|ID toggle on the signed-in account's session (re-signs
// the same session cookie with everything unchanged except locale). A
// no-op if there's no session — the toggle isn't shown on the login page.
export async function setLocale(locale: Locale) {
  const user = await getSessionUser();
  if (!user) return;

  await createSession({ ...user, locale });
}
