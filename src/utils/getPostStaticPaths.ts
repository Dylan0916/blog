import { getCollection, type CollectionEntry } from "astro:content";
import getSortedPosts from "@/utils/getSortedPosts";
import getPageNumbers from "@/utils/getPageNumbers";
import slugify from "@/utils/slugify";
import type { AdjacentPost } from "@/types";

/**
 * Static paths for the post-detail + pagination route. Shared by the root and
 * /en routes — they render identically; locale is resolved at render time from
 * the URL. Adjacent posts carry a slug (not a full URL) so the nav component
 * builds the locale-correct link itself.
 */
export async function getPostStaticPaths() {
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  const sorted = getSortedPosts(posts);

  const toNav = (p?: CollectionEntry<"posts">): AdjacentPost =>
    p ? { title: p.data.title, slug: slugify(p.data) } : null;

  const postResult = sorted.map((post, i) => ({
    params: { slug: slugify(post.data) },
    props: {
      post,
      // newest-first sort: older post is "previous", newer post is "next"
      prevPost: toNav(sorted[i + 1]),
      nextPost: toNav(sorted[i - 1]),
    },
  }));

  const pagePaths = getPageNumbers(sorted.length).map(pageNum => ({
    params: { slug: String(pageNum) },
  }));

  return [...postResult, ...pagePaths];
}
