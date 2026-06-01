import type { Locale } from "@/i18n/config";
import { slugifyStr } from "@/utils/slugify";

/**
 * Tag i18n. A tag has three forms:
 *   - value:   the raw string in post frontmatter (kept Chinese, e.g. "後端")
 *   - slug:    the URL segment, always English/latin (e.g. "backend")
 *   - display: the visible label, per-locale (zh shows Chinese, en shows slug)
 *
 * Only the few Chinese tags need a mapping; latin tags use their slugified
 * value as both slug and label. Keeping the frontmatter value Chinese means
 * cross-post matching is unaffected; mapping to an English slug keeps the URL
 * clean (`/en/tags/backend`, not `/en/tags/%E5%BE%8C%E7%AB%AF`).
 */
const TAG_DEFS: { zh: string; slug: string }[] = [
  { zh: "後端", slug: "backend" },
  { zh: "心得文", slug: "reflections" },
  { zh: "紀錄文", slug: "notes" },
  { zh: "面試心得", slug: "interview-notes" },
];

// Keyed by the slugified raw value (slugifyStr("後端") === "後端").
const VALUE_TO_SLUG: Record<string, string> = Object.fromEntries(
  TAG_DEFS.map(({ zh, slug }) => [slugifyStr(zh), slug])
);
const SLUG_TO_ZH: Record<string, string> = Object.fromEntries(
  TAG_DEFS.map(({ zh, slug }) => [slug, zh])
);

/** URL slug for a raw frontmatter tag value (English for the mapped tags). */
export function tagToSlug(rawTag: string): string {
  const base = slugifyStr(rawTag);

  return VALUE_TO_SLUG[base] ?? base;
}

/** Visible label for a tag slug, per locale. */
export function tagDisplay(slug: string, locale: Locale): string {
  if (locale === "en") {
    return slug;
  }

  return SLUG_TO_ZH[slug] ?? slug;
}
