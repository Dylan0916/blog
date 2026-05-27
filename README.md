# Dylan's Blog

> 一個簡單的部落格，大多數是記錄自己在前端工作上遇到的問題、或是一些比較零散的技術問題。

Live: <https://dylan-blog.pages.dev/>

Based on [satnaing/astro-paper](https://github.com/satnaing/astro-paper) (v4) with local upgrades to Astro 6 + Tailwind v4.

## Tech Stack

- **Framework**: [Astro](https://astro.build/) v6
- **Language**: TypeScript v6
- **UI**: React 19, [TailwindCSS](https://tailwindcss.com/) v4
- **Search**: [Fuse.js](https://fusejs.io/)
- **OG images**: [satori](https://github.com/vercel/satori) + [@resvg/resvg-js](https://github.com/yisibl/resvg-js)
- **SEO**: [astro-seo-schema](https://github.com/elfrank/astro-seo-schema), [schema-dts](https://github.com/google/schema-dts)
- **Image optimization**: [@divriots/jampack](https://jampack.divriots.com/)
- **Linting / Formatting**: ESLint v10, Prettier
- **Deployment**: Cloudflare Pages

## Requirements

- Node `>=24` (pinned via `.nvmrc` / `.node-version` / `engines`)
- pnpm `10.33.0` (pinned via `packageManager` field)

## Commands

```bash
pnpm install           # install deps
pnpm run dev           # dev server at http://localhost:4321
pnpm run build         # astro check + build + jampack
pnpm run preview       # preview build locally
pnpm run lint          # eslint .
pnpm run format        # prettier --write .
pnpm run format:check  # prettier --check .
pnpm run sync          # astro sync (generate types)
pnpm run cz            # commit via commitizen
```

Docker:

```bash
docker compose up -d
```

## Project Structure

```
.
├── public/
│   ├── assets/
│   ├── blogs/                 # static blog images
│   ├── fromMediumImg/         # legacy images migrated from Medium
│   ├── favicon.png
│   ├── og-img.png
│   ├── avatar.jpg
│   └── toggle-theme.js        # FOUC-free theme bootstrap
├── src/
│   ├── assets/                # icons, etc.
│   ├── components/            # Astro + React components
│   ├── content/
│   │   └── blog/              # blog posts (.md)
│   ├── content.config.ts      # content collection schema (Astro Content Layer)
│   ├── layouts/
│   ├── pages/
│   ├── styles/
│   │   └── base.css           # global Tailwind v4 entry + @theme tokens
│   ├── utils/
│   ├── config.ts              # SITE / LOCALE / SOCIALS
│   ├── types.ts
│   └── env.d.ts
├── astro.config.ts
├── eslint.config.mjs
└── docker-compose.yml
```

## Configuration

Edit `src/config.ts`:

- `SITE` — title, author, description, OG image, posts per page, etc.
- `LOCALE` — language code + BCP 47 tag.
- `LOGO_IMAGE` — toggle logo / dimensions.
- `SOCIALS` — set `active: true` on the socials you want shown.

Optional env (`.env`):

```bash
PUBLIC_GOOGLE_SITE_VERIFICATION=...
```

If unset, the `google-site-verification` meta tag is omitted.

## Adding a Post

Create a `.md` file under `src/content/blog/` with frontmatter matching the schema in `src/content.config.ts`:

```yaml
---
author: Dylan
pubDatetime: 2026-01-01T00:00:00Z
title: Post Title
postSlug: post-slug
featured: false
draft: false
tags:
  - tag-a
description: Short description.
ogImage: optional-image-path-or-url
canonicalURL: optional
---
```

## Notes on Upgrades from Upstream v4 → Astro 6 / Tailwind v4

This repo was originally forked from AstroPaper v4. Upstream is now on v6, but with a major refactor (file renames, i18n, pagefind, etc.) we did not adopt. Migrations made locally:

- Content Collections legacy API → Content Layer API (`src/content.config.ts` + `glob` loader, `render(post)`).
- Tailwind v3 config (`tailwind.config.cjs`) → Tailwind v4 CSS-first (`@theme` / `@utility` in `src/styles/base.css`), `@astrojs/tailwind` → `@tailwindcss/vite`.
- Scoped Astro `@apply` rules inlined into class attributes to avoid v4 cascade-layer conflicts.
- `bg-opacity-*` etc. → `/N` slash syntax.
- `outline-2` defaults to solid in v4; behaviour preserved via existing skin tokens.
- `@tailwindcss/typography` plugin `code` color override (`color: inherit` outside `@layer base`) replaces v3's `color: false` typography config.

## Upstream Reference

Original theme: <https://github.com/satnaing/astro-paper>

Use upstream for:

- New theme features / fixes you might want to backport.
- Diffing against the current upstream state to see what we have / haven't tracked.

## License

MIT © Sat Naing (original AstroPaper theme).
Blog content © Dylan.
