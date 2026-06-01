import type { CollectionEntry } from "astro:content";
import { tagToSlug } from "@/i18n/tags";

const getPostsByTag = (posts: CollectionEntry<"posts">[], tag: string) =>
  posts.filter(post => post.data.tags.map(tagToSlug).includes(tag));

export default getPostsByTag;
