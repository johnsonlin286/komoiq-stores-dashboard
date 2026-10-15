import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt } from "@/server/session";
import {
  homeForRole,
  storeAdminRole,
  type AppRole,
  type CurrentUser,
} from "@/types/dashboard";

export const getSessionUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get("session")?.value;
  return decrypt(token);
});

export async function requireRole(role: AppRole) {
  const user = await getSessionUser();
  if (!user) redirect("/");
  if (user.role !== role) redirect(homeForRole(user.role));
  return user;
}

export async function getCurrentUser() {
  return requireRole(storeAdminRole);
}
