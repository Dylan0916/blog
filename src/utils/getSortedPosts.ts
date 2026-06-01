import type { CollectionEntry } from "astro:content";
import { getPostLocale } from "@/utils/postLocale";
import { DEFAULT_LOCALE } from "@/i18n/config";

const getSortedPosts = (posts: CollectionEntry<"posts">[]) =>
  posts
    .filter(post => !post.data.draft && getPostLocale(post) === DEFAULT_LOCALE)
    .sort(
      (a, b) =>
        Math.floor(new Date(b.data.pubDatetime).getTime() / 1000) -
        Math.floor(new Date(a.data.pubDatetime).getTime() / 1000)
    );

export default getSortedPosts;
