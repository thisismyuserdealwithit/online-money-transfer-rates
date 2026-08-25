/**
 * Editorial publication is deliberately separate from live quote freshness.
 * A crawler or database outage must not make an established page disappear
 * from the sitemap or suddenly acquire a noindex directive.
 */
export const publishedCorridorSlugs = [
  "uk-to-spain",
  "uk-to-france",
  "uk-to-germany",
  "uk-to-ireland",
  "uk-to-italy",
  "uk-to-netherlands",
  "uk-to-portugal",
  "uk-to-poland",
  "uk-to-united-states",
  "uk-to-canada",
  "uk-to-australia",
] as const;

const published = new Set<string>(publishedCorridorSlugs);

export function isPublishedCorridor(slug: string) {
  return published.has(slug);
}
