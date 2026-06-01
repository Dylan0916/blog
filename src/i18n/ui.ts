export const DEFAULT_LOCALE = "zh-TW";
export const LOCALES = ["zh-TW", "en"] as const;
export type Locale = (typeof LOCALES)[number];

const ui = {
  "zh-TW": {
    "nav.posts": "Posts",
    "nav.tags": "Tags",
    "nav.about": "About",
    "nav.search": "Search",
    "nav.skipToContent": "Skip to content",
    "breadcrumb.home": "Home",
    "home.bio":
      "一名前端工程師，隨便記錄一下自己覺得有趣的事情，方便自己回顧。",
    "home.recentPosts": "Recent Posts",
    "home.allPosts": "All Posts",
    "post.goBack": "Go back",
    "post.backToTop": "Back to Top",
    "post.prev": "上一篇",
    "post.next": "下一篇",
    "tags.title": "Tags",
    "tags.label": "Tag:",
    "tags.allWithTag": "所有標籤為",
    "tags.allWithTagSuffix": "的文章",
    "search.title": "Search",
    "search.placeholder": "搜尋文章...",
    "langToggle.toEn": "EN",
    "langToggle.toZh": "中文",
  },
  en: {
    "nav.posts": "Posts",
    "nav.tags": "Tags",
    "nav.about": "About",
    "nav.search": "Search",
    "nav.skipToContent": "Skip to content",
    "breadcrumb.home": "Home",
    "home.bio":
      "A front-end engineer jotting down things I find interesting, for my own future reference.",
    "home.recentPosts": "Recent Posts",
    "home.allPosts": "All Posts",
    "post.goBack": "Go back",
    "post.backToTop": "Back to Top",
    "post.prev": "Previous",
    "post.next": "Next",
    "tags.title": "Tags",
    "tags.label": "Tag:",
    "tags.allWithTag": "All the articles with the tag",
    "tags.allWithTagSuffix": "",
    "search.title": "Search",
    "search.placeholder": "Search for anything...",
    "langToggle.toEn": "EN",
    "langToggle.toZh": "中文",
  },
} as const;

export type UIKey = keyof (typeof ui)["zh-TW"];

export function useTranslations(locale: Locale) {
  return function t(key: UIKey): string {
    return ui[locale]?.[key] ?? ui[DEFAULT_LOCALE][key];
  };
}
