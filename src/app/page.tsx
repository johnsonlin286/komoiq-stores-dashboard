import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Masuk",
};

export default function LoginPage() {
  return (
    <main className="grid flex-1 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden flex-col justify-between bg-sidebar px-12 py-10 text-white lg:flex">
        <p className="text-sm tracking-[0.18em] text-sidebar-muted uppercase">
          KomoIQ
        </p>
        <div className="grid max-w-md gap-4">
          <h2 className="text-4xl font-semibold tracking-tight">
            Inventory Optimizer
          </h2>
          <p className="text-base leading-7 text-sidebar-muted">
            Tugas pagi manajer toko. Lihat yang harus dikerjakan, lalu
            konfirmasi tindakannya.
          </p>
        </div>
        <p className="text-sm text-sidebar-muted">Akses manajer toko.</p>
      </section>

      <section className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
