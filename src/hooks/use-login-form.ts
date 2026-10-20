"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { establishDemoSession, establishSession } from "@/app/actions/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { missingFirebaseEnv } from "@/lib/firebase-config";
import { loginSchema, type LoginState } from "@/server/validation";
import * as z from "zod";

export function useLoginForm() {
  const [state, setState] = useState<LoginState>({});
  const [pending, setPending] = useState(false);

  async function submit(formData: FormData) {
    setState({});
    const parsed = loginSchema.safeParse({
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
      setState({ message: "Tidak dapat masuk saat ini." });
      return;
    } finally {
      setPending(false);
    }

    if (missingFirebaseEnv().length > 0) {
      setState({
        message: "Konfigurasi Firebase belum lengkap. Salin variabel NEXT_PUBLIC_FIREBASE ke .env.local.",
      });
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
      setState({ message: loginErrorMessage(error) });
    } finally {
      setPending(false);
    }
  }

  return { state, pending, submit };
}

function loginErrorMessage(error: unknown) {
  const code =
    typeof error === "object" && error && "code" in error ? String(error.code) : "";

  if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password" ||
    code === "auth/user-not-found" ||
    code === "auth/invalid-email"
  ) {
    return "Email atau kata sandi tidak sesuai.";
  }

  if (code === "auth/too-many-requests") {
    return "Terlalu banyak percobaan. Coba lagi dalam 15 menit.";
  }

  if (code === "auth/operation-not-allowed") {
    return "Masuk dengan email belum diaktifkan di Firebase.";
  }

  if (code === "auth/unauthorized-domain") {
    return "Domain ini belum diizinkan di Firebase Authentication.";
  }

  if (code === "auth/network-request-failed") {
    return "Tidak dapat terhubung ke Firebase.";
  }

  return "Tidak dapat masuk saat ini.";
}
