import type { AstroIntegration } from "astro";

/**
 * Mounts an `/en` mirror of every root page by reusing the same page
 * entrypoints under an `/en` pattern. Locale is resolved from the URL at
 * render time (`Astro.currentLocale`), so there is no physical
 * `src/pages/en/` folder to keep in sync — one source of truth per page.
 */
const ROUTES: { pattern: string; entrypoint: string }[] = [
  { pattern: "/en", entrypoint: "./src/pages/index.astro" },
  { pattern: "/en/posts", entrypoint: "./src/pages/posts/index.astro" },
  {
    pattern: "/en/posts/[slug]",
    entrypoint: "./src/pages/posts/[slug]/index.astro",
  },
  { pattern: "/en/tags", entrypoint: "./src/pages/tags/index.astro" },
  { pattern: "/en/tags/[tag]", entrypoint: "./src/pages/tags/[tag].astro" },
  { pattern: "/en/search", entrypoint: "./src/pages/search.astro" },
  {
    pattern: "/en/about",
    entrypoint: "./src/components/pages/AboutPage.astro",
  },
];

export default function i18nEnMirror(): AstroIntegration {
  return {
    name: "i18n-en-mirror",
    hooks: {
      "astro:config:setup": ({ injectRoute }) => {
        for (const route of ROUTES) {
          injectRoute({
            pattern: route.pattern,
            entrypoint: route.entrypoint,
            prerender: true,
          });
        }
      },
    },
  };
}
