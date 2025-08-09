import type { APIRoute } from "astro";
import { generateOgImageForSite } from "@/utils/generateOgImages";

export const GET: APIRoute = async () =>
  new Response(
    new Blob([new Uint8Array(await generateOgImageForSite())], {
      type: "image/png",
    }),
    {
      headers: { "Content-Type": "image/png" },
    }
  );
