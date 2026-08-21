import type { Metadata } from "next";
import {
  generateStaticParams as corridorStaticParams,
  renderCorridorPage,
} from "@/app/corridors/[slug]/page";
import { getCorridor } from "@/lib/data";
import { isCorridorIndexable } from "@/lib/live-data";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return corridorStaticParams().map(({ slug }) => ({ route: slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ route: string }> },
): Promise<Metadata> {
  const { route } = await params;
  const corridor = getCorridor(route);
  if (!corridor) return {};
  const title = `${corridor.fromCountry} to ${corridor.toCountry} Money Transfer Rates Today`;
  const description = `Compare current ${corridor.fromCurrency} to ${corridor.toCurrency} transfer rates, fees, recipient amounts and dated provider receipts.`;
  const indexable = await isCorridorIndexable(route);
  return pageMetadata({
    title,
    description,
    path: `/${route}/`,
    noIndex: !indexable,
  });
}

export default async function PublicCorridorPage(
  { params }: { params: Promise<{ route: string }> },
) {
  const { route } = await params;
  return renderCorridorPage(route);
}
