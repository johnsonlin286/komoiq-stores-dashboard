"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { useLoginForm } from "@/hooks/use-login-form";

export function LoginForm() {
  const t = useTranslations("Auth");
  const { state, pending, submit } = useLoginForm();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      className="grid gap-5"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void submit(new FormData(event.currentTarget));
      }}
    >
      <div className="grid gap-3">
        <BrandMark />
        <div className="grid gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="text-sm leading-6 text-muted">{t("subtitle")}</p>
        </div>
      </div>

      {state.message ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger"
        >
          {state.message}
        </p>
      ) : null}

      <TextField
        label={t("emailLabel")}
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        spellCheck={false}
        maxLength={254}
        required
        error={state.fieldErrors?.email?.[0]}
      />

      <div className="grid gap-2">
        <TextField
          label={t("passwordLabel")}
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          maxLength={128}
          required
          error={state.fieldErrors?.password?.[0]}
        />
        <button
          type="button"
          className="justify-self-start text-sm text-muted underline-offset-4 hover:underline"
          onClick={() => setShowPassword((current) => !current)}
          aria-pressed={showPassword}
        >
          {showPassword ? t("hidePassword") : t("showPassword")}
        </button>
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("submitPending") : t("submit")}
      </Button>
    </form>
  );
}
