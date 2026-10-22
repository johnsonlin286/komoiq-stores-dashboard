import Link from "next/link";
import { getTranslations } from "next-intl/server";

export const instant = false;

export default async function NotFound() {
  const t = await getTranslations("Common");

  return (
    <main className="grid flex-1 place-items-center px-6 py-16 text-center">
      <div className="grid gap-3">
        <p className="text-sm font-medium text-muted">404</p>
        <h1 className="text-2xl font-semibold tracking-tight">{t("notFoundTitle")}</h1>
        <Link href="/" className="text-sm font-medium text-accent underline">
          {t("notFoundLink")}
        </Link>
      </div>
    </main>
  );
}
