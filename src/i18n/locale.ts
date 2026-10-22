export const locales = ["en", "id"] as const;
export type Locale = (typeof locales)[number];

// English by default — see Langkah 1 of the brief ("Bahasa layar: Inggris
// sebagai bawaan"). Every fresh login starts here regardless of what the
// account last chose; the EN|ID toggle then persists the choice on the
// session for the rest of that login.
export const defaultLocale: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "id";
}
