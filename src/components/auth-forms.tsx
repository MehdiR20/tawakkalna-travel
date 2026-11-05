"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { registerAction } from "@/actions/auth";
import { useI18n } from "@/i18n/provider";
import type { ActionState } from "@/lib/validation";
import { button, Field, FormError, inputClass } from "./ui";

// Emails, phones and passwords read left to right even on an Arabic page.
const latinInput = `${inputClass} rtl:text-right`;

function useSignInRedirect(callbackUrl: string) {
  const router = useRouter();
  return async (email: string, password: string) => {
    const result = await signIn("credentials", { email, password, redirect: false });
    if (!result?.ok) return false;
    router.push(callbackUrl);
    router.refresh();
    return true;
  };
}

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const { t } = useI18n();
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const signInAndGo = useSignInRedirect(callbackUrl);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setError(undefined);
    start(async () => {
      const ok = await signInAndGo(String(data.get("email")), String(data.get("password")));
      if (!ok) setError(t.auth.badCredentials);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <FormError message={error} />
      <Field label={t.auth.email} htmlFor="email">
        <input id="email" name="email" type="email" dir="ltr" autoComplete="email" required className={latinInput} />
      </Field>
      <Field label={t.auth.password} htmlFor="password">
        <input id="password" name="password" type="password" dir="ltr" autoComplete="current-password" required className={latinInput} />
      </Field>
      <button type="submit" disabled={pending} className={`${button.primary} w-full cursor-pointer`}>
        {pending ? t.auth.signingIn : t.auth.signIn}
      </button>
    </form>
  );
}

export function RegisterForm({ callbackUrl }: { callbackUrl: string }) {
  const { t } = useI18n();
  const [state, setState] = useState<ActionState>({});
  const [pending, start] = useTransition();
  const signInAndGo = useSignInRedirect(callbackUrl);
  const errors = state.fieldErrors;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    start(async () => {
      const result = await registerAction(data);
      setState(result);
      if (!result.ok) return;
      const ok = await signInAndGo(String(data.get("email")), String(data.get("password")));
      if (!ok) setState({ error: t.auth.createdNoSignIn });
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <FormError message={state.error} />
      <Field label={t.auth.fullName} htmlFor="name" errors={errors?.name}>
        <input id="name" name="name" autoComplete="name" required aria-invalid={!!errors?.name} className={inputClass} />
      </Field>
      <Field label={t.auth.email} htmlFor="email" errors={errors?.email}>
        <input id="email" name="email" type="email" dir="ltr" autoComplete="email" required aria-invalid={!!errors?.email} className={latinInput} />
      </Field>
      <Field label={t.auth.phone} htmlFor="phone" hint={t.auth.phoneHint} errors={errors?.phone}>
        <input id="phone" name="phone" type="tel" dir="ltr" autoComplete="tel" aria-invalid={!!errors?.phone} className={latinInput} />
      </Field>
      <Field label={t.auth.password} htmlFor="password" hint={t.auth.passwordHint} errors={errors?.password}>
        <input id="password" name="password" type="password" dir="ltr" autoComplete="new-password" required aria-invalid={!!errors?.password} className={latinInput} />
      </Field>
      <button type="submit" disabled={pending} className={`${button.primary} w-full cursor-pointer`}>
        {pending ? t.auth.creating : t.auth.createAccount}
      </button>
    </form>
  );
}
