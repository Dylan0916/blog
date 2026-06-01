import { slugifyStr } from "./slugify";
import type { CollectionEntry } from "astro:content";
import { getPostLocale } from "@/utils/postLocale";
import { DEFAULT_LOCALE } from "@/i18n/config";

const getUniqueTags = (posts: CollectionEntry<"posts">[]) => {
  const filteredPosts = posts.filter(
    post => !post.data.draft && getPostLocale(post) === DEFAULT_LOCALE
  );
  const tags: string[] = filteredPosts
    .flatMap(post => post.data.tags)
    .map(tag => slugifyStr(tag))
    .filter(
      (value: string, index: number, self: string[]) =>
        self.indexOf(value) === index
    )
    .sort((tagA: string, tagB: string) => tagA.localeCompare(tagB));
  return tags;
};

export default getUniqueTags;
