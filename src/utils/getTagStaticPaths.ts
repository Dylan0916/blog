import { getCollection } from "astro:content";
import getUniqueTags from "@/utils/getUniqueTags";

/** Static paths for the tag route — shared by the root and /en routes. */
export async function getTagStaticPaths() {
  const posts = await getCollection("posts");
  const tags = getUniqueTags(posts);

  return tags.map(tag => ({ params: { tag }, props: { tag } }));
}
