import type { TranslationKey } from "../i18n";

type TranslateFn = (key: TranslationKey) => string;

/** Maps raw Supabase / PostgREST error messages to friendly i18n keys. */
export function translateAuthError(raw: string, t: TranslateFn): string {
  console.error("[auth error]", raw);
  const msg = raw.toLowerCase();

  if (
    msg.includes("invalid login credentials") ||
    msg.includes("invalid credentials") ||
    msg.includes("wrong password") ||
    msg.includes("user not found") ||
    msg.includes("email not confirmed")
  ) {
    return t("errors.signInFailed");
  }

  if (
    (msg.includes("duplicate key") && msg.includes("email")) ||
    msg.includes("user already registered") ||
    msg.includes("email already")
  ) {
    return t("errors.emailAlreadyRegistered");
  }

  if (
    (msg.includes("duplicate key") && msg.includes("username")) ||
    msg.includes("unique constraint") ||
    msg.includes("username")
  ) {
    return t("errors.usernameTaken");
  }

  if (
    msg.includes("permission denied") ||
    msg.includes("rls") ||
    msg.includes("row-level security") ||
    msg.includes("policy")
  ) {
    return t("errors.permissionDenied");
  }

  if (
    msg.includes("network") ||
    msg.includes("failed to fetch") ||
    msg.includes("timeout") ||
    msg.includes("connection")
  ) {
    return t("errors.networkError");
  }

  if (
    msg.includes("sign up") ||
    msg.includes("signup") ||
    msg.includes("registration")
  ) {
    return t("errors.signUpFailed");
  }

  return t("errors.unknown");
}
