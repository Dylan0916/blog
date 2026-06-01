import { DEFAULT_LOCALE, type Locale } from "@/i18n/ui";

export function resolveLocale(current: string | undefined): Locale {
  return current === "en" ? "en" : DEFAULT_LOCALE;
}
