// Single source of truth for the site's locales. Kept dependency-free so it
// can be imported from astro.config.ts without pulling in the UI string table.
export const LOCALES = ["zh-TW", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "zh-TW";
