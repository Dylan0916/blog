import type { CollectionEntry } from "astro:content";

import { SITE } from "@/config";
import { slugifyStr } from "./slugify";

const JSON_LD_CONTEXT = "https://schema.org" as const;

export const getWebsiteJsonLd = () => {
  return {
    "@context": JSON_LD_CONTEXT,
    "@type": "WebSite" as const,
    name: SITE.title,
    author: SITE.author,
    url: SITE.website,
    potentialAction: {
      "@type": "SearchAction" as const,
      target: {
        "@type": "EntryPoint" as const,
        urlTemplate: `${SITE.website}search/?q={keyword}`,
      },
      "query-input": "required name=keyword",
    },
  };
};

export const getPostJsonLd = (post: CollectionEntry<"blog">) => {
  const {
    body,
    data: {
      title: postTitle,
      description,
      postSlug,
      pubDatetime,
      ogImage,
      tags,
    },
  } = post;
  const postUrl = SITE.website + postSlug;
  const personImgUrl = `${SITE.website}avatar.jpg`;
  const postImgUrl = SITE.website + ogImage;
  const keywords = tags.map(tag => slugifyStr(tag));
  const publishedDate = `${pubDatetime}`;

  return {
    "@context": JSON_LD_CONTEXT,
    "@type": "BlogPosting" as const,
    mainEntityOfPage: postUrl,
    headline: postTitle,
    name: postTitle,
    description,
    datePublished: publishedDate,
    dateModified: publishedDate,
    author: {
      "@type": "Person" as const,
      name: SITE.author,
      url: `${SITE.website}about`,
      image: {
        "@type": "ImageObject" as const,
        "@id": personImgUrl,
        url: personImgUrl,
        height: "96",
        width: "96",
      },
    },
    image: {
      "@type": "ImageObject" as const,
      "@id": postImgUrl,
      url: postImgUrl,
      height: "362",
      width: "388",
    },
    url: postUrl,
    isPartOf: {
      "@type": "Blog" as const,
      name: SITE.title,
    },
    wordCount: body.length,
    keywords,
  };
};
