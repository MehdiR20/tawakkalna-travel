"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { getI18n } from "@/i18n/server";
import { BCRYPT_ROUNDS } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";
import { fieldErrors, registerSchema, type ActionState } from "@/lib/validation";

export async function registerAction(data: FormData): Promise<ActionState> {
  const { t } = await getI18n();
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (isRateLimited(`register:${ip}`, 10, 60 * 60 * 1000)) {
    return { error: t.auth.tooMany };
  }

  const parsed = registerSchema.safeParse(Object.fromEntries(data));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error, t) };
  const { name, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return { fieldErrors: { email: [t.auth.emailTaken] } };
  }

  // Role is deliberately not read from the form: public sign-ups are always USER.
  await prisma.user.create({
    data: { name, email, phone, passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS) },
  });
  return { ok: true };
}
