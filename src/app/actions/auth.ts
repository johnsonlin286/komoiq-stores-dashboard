"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { clearLoginAttempts, consumeLoginAttempt } from "@/server/rate-limit";
import { verifyFirebaseIdToken } from "@/server/firebase-token";
import { createSession, deleteSession } from "@/server/session";
import { homeForRole, isAppRole, type CurrentUser } from "@/types/dashboard";
import type { LoginState } from "@/server/validation";

export type { LoginState };

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
