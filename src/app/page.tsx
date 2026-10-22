import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/auth/login-form";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth");
  return { title: t("pageTitle") };
}

export const instant = false;

export default async function LoginPage() {
  const t = await getTranslations("Auth");

  return (
    <main className="grid flex-1 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden flex-col justify-between bg-sidebar px-12 py-10 text-white lg:flex">
        <p className="text-sm tracking-[0.18em] text-sidebar-muted uppercase">
          KomoIQ
        </p>
        <div className="grid max-w-md gap-4">
          <h2 className="text-4xl font-semibold tracking-tight">{t("heroTitle")}</h2>
          <p className="text-base leading-7 text-sidebar-muted">{t("heroSubtitle")}</p>
        </div>
        <p className="text-sm text-sidebar-muted">{t("heroFooter")}</p>
      </section>

      <section className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
