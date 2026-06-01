import zhTW from "./locales/zh-TW.json";
import en from "./locales/en.json";
import { DEFAULT_LOCALE, type Locale } from "./config";

export { DEFAULT_LOCALE, LOCALES } from "./config";
export type { Locale } from "./config";

// `satisfies` enforces that every locale file carries the same key set as the
// default locale — a missing key in en.json is a compile error, not a silent
// runtime fallback.
const ui = {
  "zh-TW": zhTW,
  en,
} satisfies Record<Locale, Record<keyof typeof zhTW, string>>;

export type UIKey = keyof typeof zhTW;

export function useTranslations(locale: Locale) {
  return function t(key: UIKey): string {
    return ui[locale]?.[key] ?? ui[DEFAULT_LOCALE][key];
  };
}
