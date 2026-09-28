import type { Metadata } from "next";
import {
  generateStaticParams as corridorStaticParams,
  renderCorridorPage,
} from "@/app/corridors/[slug]/page";
import { getCorridor } from "@/lib/data";
import { isPublishedCorridor } from "@/lib/corridor-publication";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 300;

export function generateStaticParams() {
  return corridorStaticParams().map(({ slug }) => ({ route: slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ route: string }> },
): Promise<Metadata> {
  const { route } = await params;
  const corridor = getCorridor(route);
  if (!corridor) return {};
  const title = `${corridor.fromCountry} to ${corridor.toCountry}: Compare Money Transfers`;
  const description = `Compare ${corridor.fromCurrency} to ${corridor.toCurrency} transfer quotes, fees and dated receipts. Explore customer reviews and how this route compares with other destinations.`;
  const indexable = isPublishedCorridor(route);
  return pageMetadata({
    title,
    description,
    path: `/${route}`,
    noIndex: !indexable,
  });
}

export default async function PublicCorridorPage(
  { params }: { params: Promise<{ route: string }> },
) {
  const { route } = await params;
  return renderCorridorPage(route);
}
