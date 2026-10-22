"use client";

import { signOut } from "firebase/auth";
import { useTranslations } from "next-intl";
import { logout } from "@/app/actions/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const t = useTranslations("Common");

  async function onLogout() {
    try {
      await signOut(getFirebaseAuth());
    } catch {
      // The Firebase client session may already be gone.
    }

    await logout();
  }

  return (
    <Button type="button" variant="inverse" size="sm" onClick={onLogout}>
      {t("logout")}
    </Button>
  );
}
