import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";

/** Normalize Astro.currentLocale (string | undefined) into a known Locale. */
export function resolveLocale(current: string | undefined): Locale {
  return current === "en" ? "en" : DEFAULT_LOCALE;
}

/**
 * URL of the current page in the other locale. The English mirror is a pure
 * `/en` path prefix, so the counterpart is derived by adding or removing it.
 * Always returns a trailing-slash path (root → "/").
 */
export function getCounterpartUrl(pathname: string): string {
  const stripped = pathname.replace(/\/+$/, "");
  const counterpart =
    stripped === "/en" || stripped.startsWith("/en/")
      ? stripped.replace(/^\/en/, "")
      : `/en${stripped}`;

  return `${counterpart}/`;
}
