import { corridors } from "./data.ts";

// Every configured public route is published. Quote freshness affects the
// evidence labels, never whether the page can appear in search results.
export const publishedCorridorSlugs = corridors.map((corridor) => corridor.slug);

const published = new Set<string>(publishedCorridorSlugs);

export function isPublishedCorridor(slug: string) {
  return published.has(slug);
}
