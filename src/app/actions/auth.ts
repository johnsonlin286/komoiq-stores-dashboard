"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { clearLoginAttempts, consumeLoginAttempt } from "@/server/rate-limit";
import { verifyFirebaseIdToken } from "@/server/firebase-token";
import { createSession, deleteSession } from "@/server/session";
import { homeForRole, isAppRole, superAdminRole, type CurrentUser } from "@/types/dashboard";
import type { LoginState } from "@/server/validation";

export type { LoginState };

export type DemoLoginState = LoginState & { matched: boolean };

// Demo-only login path: bypasses Firebase entirely when the submitted
// credentials match AUTH_EMAIL/AUTH_PASSWORD in .env.local, granting a
// super-admin session that can open both /store-admin and /store-managment.
// Not configuring those env vars disables this path (`matched` stays false
// and the normal Firebase flow runs instead).
export async function establishDemoSession(
  email: string,
  password: string,
): Promise<DemoLoginState> {
  const demoEmail = process.env.AUTH_EMAIL;
  const demoPassword = process.env.AUTH_PASSWORD;

  if (!demoEmail || !demoPassword || email.trim().toLowerCase() !== demoEmail.toLowerCase()) {
    return { matched: false };
  }

  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const client = forwarded || headerList.get("x-real-ip") || "local";
  const attempt = consumeLoginAttempt(client);

  if (!attempt.allowed) {
    return { matched: true, message: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." };
  }

  if (password !== demoPassword) {
    return { matched: true, message: "Email atau kata sandi tidak sesuai." };
  }

  clearLoginAttempts(client);
  await createSession({
    id: "demo-super-admin",
    email: demoEmail,
    name: process.env.AUTH_NAME?.trim() || demoEmail,
    role: superAdminRole,
  });
  redirect(homeForRole(superAdminRole));
}

export async function establishSession(idToken: string): Promise<LoginState> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const client = forwarded || headerList.get("x-real-ip") || "local";
  const attempt = consumeLoginAttempt(client);

  if (!attempt.allowed) {
    return { message: "Terlalu banyak percobaan. Coba lagi dalam 15 menit." };
  }

  let verified;
  try {
    verified = await verifyFirebaseIdToken(idToken);
  } catch {
    return { message: "Tidak dapat memverifikasi sesi Firebase." };
  }

  if (!isAppRole(verified.role)) {
    return {
      message: "Akun ini belum memiliki peran yang dikenali.",
    };
  }

  const user: CurrentUser = {
    id: verified.uid,
    email: verified.email,
    name: verified.name,
    role: verified.role,
  };

  clearLoginAttempts(client);
  await createSession(user);
  redirect(homeForRole(verified.role));
}

export async function logout() {
  await deleteSession();
  redirect("/");
}
