"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { useTranslations } from "next-intl";
import { establishDemoSession, establishSession } from "@/app/actions/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { missingFirebaseEnv } from "@/lib/firebase-config";
import { createLoginSchema, type AuthErrorsTranslator, type LoginState } from "@/server/validation";
import * as z from "zod";

export function useLoginForm() {
  const t = useTranslations("Auth.errors");
  const [state, setState] = useState<LoginState>({});
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setState({});
    const parsed = createLoginSchema(t).safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      setState({ fieldErrors: z.flattenError(parsed.error).fieldErrors });
      return;
    }

    setPending(true);

    try {
      // Demo-only path (see establishDemoSession): matches AUTH_EMAIL /
      // AUTH_PASSWORD in .env.local, no Firebase involved. Falls through to
      // the normal Firebase flow below when the email isn't that account.
      const demo = await establishDemoSession(parsed.data.email, parsed.data.password);
      if (demo.matched) {
        if (demo.message) setState({ message: demo.message });
        return;
      }
    } catch (error) {
      if (isRedirectError(error)) throw error;
      setState({ message: t("genericSignInError") });
      return;
    } finally {
      setPending(false);
    }

    if (missingFirebaseEnv().length > 0) {
      setState({ message: t("missingFirebaseEnv") });
      return;
    }

    setPending(true);
    const auth = getFirebaseAuth();

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        parsed.data.email,
        parsed.data.password,
      );
      const idToken = await credential.user.getIdToken(true);
      const result = await establishSession(idToken);
      if (result?.message) {
        await signOut(auth);
        setState({ message: result.message });
      }
    } catch (error) {
      if (isRedirectError(error)) throw error;
      await signOut(auth).catch(() => undefined);
      setState({ message: loginErrorMessage(error, t) });
    } finally {
      setPending(false);
    }
  }

  return { state, pending, submit };
}

function loginErrorMessage(error: unknown, t: AuthErrorsTranslator) {
  const code =
    typeof error === "object" && error && "code" in error ? String(error.code) : "";

  if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password" ||
    code === "auth/user-not-found" ||
    code === "auth/invalid-email"
  ) {
    return t("wrongCredentials");
  }

  if (code === "auth/too-many-requests") {
    return t("tooManyAttempts");
  }

  if (code === "auth/operation-not-allowed") {
    return t("firebaseSignInNotEnabled");
  }

  if (code === "auth/unauthorized-domain") {
    return t("unauthorizedDomain");
  }

  if (code === "auth/network-request-failed") {
    return t("networkError");
  }

  return t("genericSignInError");
}
