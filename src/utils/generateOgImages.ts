import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import satori, { type SatoriOptions } from "satori";
import { Resvg } from "@resvg/resvg-js";
import { type CollectionEntry } from "astro:content";

import { SITE } from "@/config";
import postOgImage from "./og-templates/post";
import siteOgImage from "./og-templates/site";

// ---------------------------------------------------------------------------
// Local fonts (no more network fetch at build time)
// ---------------------------------------------------------------------------
const FONTS_DIR = join(process.cwd(), "src", "assets", "fonts");
const fontRegular = readFileSync(join(FONTS_DIR, "IBMPlexMono-Regular.ttf"));
const fontBold = readFileSync(join(FONTS_DIR, "IBMPlexMono-Bold.ttf"));

const options: SatoriOptions = {
  width: 1200,
  height: 630,
  embedFont: true,
  fonts: [
    {
      name: "IBM Plex Mono",
      data: fontRegular,
      weight: 400,
      style: "normal",
    },
    {
      name: "IBM Plex Mono",
      data: fontBold,
      weight: 600,
      style: "normal",
    },
  ],
};

// ---------------------------------------------------------------------------
// File-based OG image cache
// ---------------------------------------------------------------------------
const CACHE_DIR = join(process.cwd(), ".cache", "og-images");

function ensureCacheDir() {
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function cacheKey(input: string): string {
  return createHash("sha256").update(input).digest("hex").slice(0, 16);
}

function getCached(key: string): Buffer | null {
  const filePath = join(CACHE_DIR, `${key}.png`);
  if (existsSync(filePath)) {
    return readFileSync(filePath);
  }
  return null;
}

function setCache(key: string, data: Buffer): void {
  ensureCacheDir();
  writeFileSync(join(CACHE_DIR, `${key}.png`), data);
}

// ---------------------------------------------------------------------------
// SVG → PNG
// ---------------------------------------------------------------------------
function svgBufferToPngBuffer(svg: string) {
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  return pngData.asPng();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export async function generateOgImageForPost(post: CollectionEntry<"posts">) {
  const key = cacheKey(`post:${post.data.title}:${post.data.author}`);

  const cached = getCached(key);
  if (cached) return cached;

  const svg = await satori(postOgImage(post), options);
  const png = svgBufferToPngBuffer(svg);

  setCache(key, png);
  return png;
}

export async function generateOgImageForSite() {
  const key = cacheKey(`site:${SITE.title}`);

  const cached = getCached(key);
  if (cached) return cached;

  const svg = await satori(siteOgImage(), options);
  const png = svgBufferToPngBuffer(svg);

  setCache(key, png);
  return png;
}
