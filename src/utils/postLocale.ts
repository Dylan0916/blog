import type { CollectionEntry } from "astro:content";
import slugify from "@/utils/slugify";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";

type Post = CollectionEntry<"posts">;
type PostData = Post["data"];

// The glob loader lowercases ids, so the zh-TW folder surfaces as the `zh-tw/`
// prefix. Match the English mirror by its (already-lowercase) `en/` prefix.
/** Locale a post belongs to, derived from its folder (`en/…` vs `zh-TW/…`). */
export const getPostLocale = (post: Post): Locale =>
  post.id.startsWith("en/") ? "en" : DEFAULT_LOCALE;

/** Post id with the leading locale folder stripped — the cross-locale key. */
const baseId = (post: Post) => post.id.replace(/^[^/]+\//, "");

/** Posts authored in the default (zh-TW) locale, drafts dropped. */
export const getDefaultLocalePosts = (posts: Post[]) =>
  posts.filter(p => !p.data.draft && getPostLocale(p) === DEFAULT_LOCALE);

/** The English twin of a post, paired by shared base id (same filename). */
export const findEnglishTwin = (posts: Post[], post: Post) =>
  posts.find(p => getPostLocale(p) === "en" && baseId(p) === baseId(post)) ??
  null;

/**
 * For an English page request keyed by the default-locale post, return the
 * post whose body should render: the English twin if it exists, else the
 * default-locale post (fallback).
 */
export const resolveEnglishBody = (defaultPost: Post, posts: Post[]): Post =>
  findEnglishTwin(posts, defaultPost) ?? defaultPost;

/**
 * Frontmatter to show for a post in a listing card. On the English mirror,
 * swap to the twin's title/description when a translation exists; otherwise
 * fall back to the Chinese-authored data.
 */
export const localizedCardData = (
  post: Post,
  posts: Post[],
  locale: Locale
): PostData => {
  if (locale !== "en") {
    return post.data;
  }

  return findEnglishTwin(posts, post)?.data ?? post.data;
};

/** URL of a post in a target locale (English mirror lives under /en). */
export const localizedPostUrl = (post: Post, locale: Locale) => {
  const base = `/posts/${slugify(post.data)}/`;

  return locale === "en" ? `/en${base}` : base;
};
