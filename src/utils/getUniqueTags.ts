import { slugifyStr } from "./slugify";
import type { CollectionEntry } from "astro:content";
import { DEFAULT_LOCALE } from "@/i18n/ui";

const getUniqueTags = (posts: CollectionEntry<"posts">[]) => {
  const filteredPosts = posts.filter(
    ({ data }) =>
      !data.draft && (data.lang ?? DEFAULT_LOCALE) === DEFAULT_LOCALE
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
