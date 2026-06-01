import type { CollectionEntry } from "astro:content";
import slugify from "@/utils/slugify";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/ui";

type Post = CollectionEntry<"posts">;

/** Posts authored in the default (zh-TW) locale, drafts dropped. */
export const getDefaultLocalePosts = (posts: Post[]) =>
  posts.filter(
    p => !p.data.draft && (p.data.lang ?? DEFAULT_LOCALE) === DEFAULT_LOCALE
  );

/** The English twin of a post, matched by translationKey. */
export const findEnglishTwin = (posts: Post[], key: string | undefined) =>
  key
    ? (posts.find(p => p.data.lang === "en" && p.data.translationKey === key) ??
      null)
    : null;

/**
 * For an English page request keyed by the default-locale slug, return the
 * post whose body should render: the English twin if it exists, else the
 * default-locale post (fallback).
 */
export const resolveEnglishBody = (defaultPost: Post, posts: Post[]): Post =>
  findEnglishTwin(posts, defaultPost.data.translationKey) ?? defaultPost;

/** URL of a post in a target locale (English mirror lives under /en). */
export const localizedPostUrl = (post: Post, locale: Locale) => {
  const base = `/posts/${slugify(post.data)}/`;

  return locale === "en" ? `/en${base}` : base;
};
