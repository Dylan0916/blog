# CLAUDE.md

Agent-specific notes for working in this repo. Read [README.md](./README.md) first for project overview, stack, install, and commands — this file does NOT repeat those.

## Content workflow

Posts live under `src/content/posts/<locale>/*.{md,mdx}` (collection name `posts`), one folder per locale: `zh-TW/` (default) and `en/`. Filename convention: `YYYY-MM-DD_kebab-slug.md`. `.mdx` is supported when a post needs to import components. The locale a post belongs to is **derived from its folder** — there is no `lang` frontmatter field.

Frontmatter schema is defined in `src/content.config.ts`. Required: `author`, `pubDatetime` (ISO 8601), `title`, `postSlug`, `tags`, `description`. Optional: `modDatetime`, `featured`, `draft`, `ogImage`, `canonicalURL`.

### Draft → publish

`draft: true` filters the post out of:
- home (`src/pages/index.astro`)
- `/posts`, `/tags`
- RSS
- `getStaticPaths` of the post route — **direct URL 404s for drafts**

To preview a draft, temporarily flip `draft: false` and run dev.

Default new posts to `draft: true` so the user reviews before they go live.

## i18n

Default locale is `zh-TW` (unprefixed, at root). English is a mirror under `/en` (Astro i18n, `prefixDefaultLocale: false`). UI chrome is translated via JSON string tables; post bodies are translated per-post and fall back to Chinese.

- **Locale constants**: `src/i18n/config.ts` is the single source of truth (`LOCALES`, `DEFAULT_LOCALE`, `type Locale`), dependency-free so `astro.config.ts` can import it. `src/i18n/ui.ts` re-exports them.
- **UI strings**: `src/i18n/locales/{zh-TW,en}.json` hold the bilingual tables; `src/i18n/ui.ts` imports both and exposes `useTranslations(locale)`. `en.json` is `satisfies`-checked against the zh-TW key set, so a missing key is a compile error.
- **Locale is NOT threaded as a prop**: `.astro` components/layouts derive it from the URL via `resolveLocale(Astro.currentLocale)` (`src/utils/getLocale.ts`). Only React leaves (`Card`, `Datetime`) receive a `locale` prop, passed at the single Astro render boundary. The language-toggle `counterpartUrl` is derived from `Astro.url.pathname` by `getCounterpartUrl` (pure `/en` prefix mirror), not passed down — `BaseLayout`/`Header` take a `langToggle` boolean (default true) only to suppress the toggle + `hreflang` on pages with no counterpart (404).
- **English post**: create `en/<name>.md` with the **same filename and `postSlug`** as the Chinese `zh-TW/<name>.md`. The two are paired by their shared base id (filename minus the locale folder) via `findEnglishTwin` in `src/utils/postLocale.ts` — no `lang`/`translationKey` frontmatter needed. Locale is read from the folder by `getPostLocale`.
- **Listings stay Chinese-authored, swap title/desc when an en twin exists**: `getSortedPosts`/`getUniqueTags` filter to the default locale (via `getPostLocale`), so `en/` posts never appear as duplicates in home/tags/RSS/search. The `/en` listing pages reuse that same Chinese-authored set but pass each card through `localizedCardData` — if an English twin exists, the card shows the twin's title/description, else it falls back to Chinese. The post-detail body likewise switches via `resolveEnglishBody`.
- **Routes are thin shells over shared page components**: every page body lives in `src/components/pages/*.astro` (`HomePage`, `TagsPage`, `TagPostsPage`, `SearchPage`, `PostsIndexPage`, `PostPage`). The root route file and its `/en` mirror are **byte-identical** thin wrappers that render the same component — locale resolves from the URL at render time, so there's nothing to duplicate. `[slug]`/`[tag]` keep `getStaticPaths` in the route file (Astro requirement) but share the logic via `getPostStaticPaths`/`getTagStaticPaths`; adjacent-post nav carries a `slug` (not a URL) so `AdjacentPostNav` builds the locale-correct link.
- **Tags**: tag *values* are NOT translated (raw strings shown in both locales); only the surrounding UI labels are.
- **Out of scope** (don't add without being asked): English RSS, per-post English OG image, localized 404, a per-locale search index. `/en/search` reuses the one Fuse index.

## Writing style guide

The post archive has 6+ years of content. A recent cleanup pass trimmed filler and consolidated voice. Match what survived; do NOT drift toward generic technical-blog prose.

### Voice

- Direct, code-first, personal-utilitarian. Reads like notes-to-self that happen to be public.
- **Self-reference: `筆者`** (not `我`). Consistent across the archive after the cleanup pass.
- Paragraphs 1-3 sentences typically. Long expository paragraphs feel out of place.
- Concrete > abstract: specific versions, package names, error messages.
- English technical terms stay in English (`Temporal`, `getOrInsert`, `View Transitions`, `LTS`). Don't translate API names into Chinese.
- One sentence of motivating context is fine ("最近專案接到 X、順手把 Y 補起來"). Not a paragraph.

### Structure

- Sections: `##` (H2). Subsections `###`. Don't go deeper without reason.
- `## 結` / `### 結` closing section is **optional**. Only include if there's a concrete personal take or a follow-up note. Pure ritual closings get cut.
- Fenced code blocks with a language tag. Inline code with backticks for short identifiers.

### AI tells + filler patterns to actively avoid

The corpus audit caught these. Do NOT reproduce them in new posts.

1. **Opening paragraph that restates the frontmatter `description`** — biggest tell. The description is shown above the post; don't say it twice. Open with substance.
2. **Throat-clearing transitions** — 「終於進入我們寫 code 時間了」「進入寫 code 時間啦」「那就開始吧!」「廢話不多說」「以下就 ...」.
3. **Ritual polite closings** — 「感謝看到此的各位」「若有哪裡講錯的，還請不吝指教」「希望對讀者有幫助」.
4. **Empty hedging** — 「看起來都不是很乾淨」「應該會減少一些怪 bug」「算是滿不錯的」「還滿值得試試看的」. Say what specifically, or cut.
5. **Stating the obvious** — 「過去寫過 X 的應該都知道」「相信大家都遇過」「眾所周知」.
6. **Self-deprecation as filler** — 「我也不擅長寫」「我就爛」「希望我不會富堅」「我打了這麼多廢話」. Hedging is OK if tied to specific technical uncertainty ("這部分還在 stage 3，API 可能會變"), not as a personality trait.
7. **AI-style symmetric structure** — every section opening with 「首先 / 其次 / 最後」, every paragraph ending with a wrap-up sentence, balanced 對偶. Real writing is asymmetric.
8. **Wrap-up summaries that re-list the section headings** — fine in `description`, terrible in closing.

### Flow is more important than the AI-tell checklist

Items 1-8 are necessary but not sufficient. A post that has zero forbidden phrases can still feel AI-generated if the sentences don't connect, the opening lands mid-thought, or the closing cuts off abruptly. Read the post aloud (mentally) end-to-end and ask:

- Does the first sentence land naturally, or does it dangle with a connector (`而`, `所以`, `翻了一下`, `這邊就`) that needs something before it?
- After every deletion, do the two newly-adjacent paragraphs still flow? You may need to add a short bridge sentence — but bridge sentences are NOT the same as filler. A bridge is "為了實作這需求，翻了一下網上資料"; filler is "那就開始吧!".
- Is the closing a real stop, or does it just trail off? If a closing was deleted as ritual but the article needs *some* wind-down, add one concrete sentence (a personal take, a "what's next", a pointer to a related post). Don't add a generic "希望這篇對你有幫助".

The user has called out this exact failure mode multiple times during editing passes. Treat re-reading for flow as a required step, not optional.

### Drafting a new post — checklist

1. Read 2-3 recent posts first to lock in voice. Good calibration samples: `2024-09-17_beyond-coding-in-software-development.md`, `2024-01-02_migrate-to-astro.md`, `2023-10-22_vitest-nuxt3-unit-test.md`, `2026-05-27_nodejs-26-intro.md`.
2. Write `description` first — under ~100 zh-TW chars, one sentence.
3. Open with substance. NOT with a restated description.
4. Use `筆者` if self-reference is unavoidable.
5. `draft: true` until the user says publish.
6. Self-review against items 1-8 above.
7. Read end-to-end checking for flow (see section above) before reporting done.

### Editing existing posts — checklist

When deleting filler from an existing post:

1. Re-read the paragraph BEFORE and AFTER each deletion. Look for dangling connectors (`而`, `那`, `再來`, `這時`) at the start of what's now the first sentence.
2. If the opening was deleted, the new opening sentence often needs a one-line bridge to give the reader context. Write that bridge — don't leave the reader cold.
3. If the closing was deleted, decide if the article truly needs no closing (some technical reference posts don't), or if it needs a one-sentence wind-down (most posts do). When in doubt, write one short concrete sentence.
4. Read end-to-end after every editing pass before declaring it done.

## Local conventions you'll trip over when editing

- **Styling preference order: inline class > `@apply` > plain CSS.** Put utilities directly in the element's `class` attribute (deduped once in the global stylesheet, smaller payload). Only when a style can't be a static class — state/structural selectors like `.menu-icon.is-active .line` (child reacting to an ancestor's runtime class) or `.prose` overrides on markdown-rendered content — fall back to a scoped `<style>`, and inside it prefer `@apply <utility>` over hand-written CSS where a utility exists. Hand-written CSS is the last resort (no utility maps).
- **Tailwind v4 cascade**: scoped Astro `<style>` blocks that use `@apply` need `@reference "../styles/base.css"`. Custom utilities (`bg-skin-*`, `text-skin-*`) come from `@theme inline` mapped to runtime CSS vars; theme switching flows through `[data-theme="dark"]` overrides.
- **Layout slot wiring**: `src/layouts/BaseLayout.astro` has `<slot name="head" />`. Per-page head injections (article meta, JSON-LD overrides) belong inside `<Fragment slot="head">` in the child layout (`PostLayout.astro`, etc.). Lowercase `<fragment>` silently does nothing — it's not a known Astro element.
- **FOUC + theme**: small inline IIFE in `BaseLayout.astro` sets `data-theme` before paint and exposes `window.__theme.value`. The rest of theme logic lives in `src/scripts/theme.ts`. Don't move FOUC detection out of the inline script — that's load-blocking on purpose.
- **Fonts**: declared in `astro.config.ts` via `fontProviders.google()`. CSS var is `--font-ibm-plex-mono`. Don't add manual `<link>` to fonts.gstatic.com.

## Git

- Husky + lint-staged runs prettier on staged JS/TS/MD/JSON before commit.
- **Do NOT auto-push without explicit user instruction.** Commits alone are fine; pushes need a clear "push" from the user.
- **Do NOT lump unrelated changes into one commit.** The upgrade work was deliberately split into ~6 thematic commits; keep that pattern.
- Don't use `git rebase -i` (banned by user rules) — for sequence cleanup, do new commits on top instead.

## Medium mirror

Posts are also on the author's Medium (`@klj40702`). Local edits do NOT auto-sync — Medium API doesn't allow editing existing posts. Syncing requires browser automation or manual paste, and the user directs it separately when needed.

## Upstream backport decisions

Track [satnaing/astro-paper](https://github.com/satnaing/astro-paper) for theme features and patches. We did NOT adopt upstream's full v6 refactor (i18n, file renames, Pagefind search).

When considering an upstream change:
- **Always backport**: SEO, performance, accessibility, security fixes.
- **Case-by-case**: new optional features (ShareLinks, AdjacentPostNav, etc.) — adopt only if the user asks.
- **Skip by default**: file renames, i18n scaffolding (single-locale blog), Pagefind (Fuse.js works), predefined color schemes (custom palette already chosen), Shiki transformers (not currently used).

## When in doubt

Ask. The user has strong opinions about voice, structure, and commit scope. Better to confirm than write a draft that gets rewritten because it "sounds AI-generated".
