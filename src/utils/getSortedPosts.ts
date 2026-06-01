import type { CollectionEntry } from "astro:content";
import { DEFAULT_LOCALE } from "@/i18n/ui";

const getSortedPosts = (posts: CollectionEntry<"posts">[]) =>
  posts
    .filter(
      ({ data }) =>
        !data.draft && (data.lang ?? DEFAULT_LOCALE) === DEFAULT_LOCALE
    )
    .sort(
      (a, b) =>
        Math.floor(new Date(b.data.pubDatetime).getTime() / 1000) -
        Math.floor(new Date(a.data.pubDatetime).getTime() / 1000)
    );

export default getSortedPosts;
