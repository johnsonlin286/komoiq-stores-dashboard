import type { useTranslations } from "next-intl";
import * as z from "zod";

export type AuthErrorsTranslator = ReturnType<typeof useTranslations<"Auth.errors">>;

// Takes a translator (`useTranslations("Auth.errors")` on the client,
// `getTranslations("Auth.errors")` on the server) so the schema's own error
// messages follow the signed-in locale instead of being frozen at import
// time in one language.
export function createLoginSchema(t: AuthErrorsTranslator) {
  return z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email({ error: t("invalidEmail") })),
    password: z
      .string()
      .min(8, { error: t("passwordTooShort") })
      .max(128, { error: t("passwordTooLong") }),
  });
}

export const orderIdSchema = z.object({
  orderId: z.string().regex(/^ord_[0-9]+$/, { error: "Invalid order." }),
});

export type LoginState = {
  message?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
};
