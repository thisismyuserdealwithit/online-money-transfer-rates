import type { Metadata } from "next";
import CorridorPage, {
  generateStaticParams as corridorStaticParams,
} from "@/app/corridors/[slug]/page";
import { getCorridor } from "@/lib/data";

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
  return {
    title,
    description,
    alternates: { canonical: `/${route}/` },
    openGraph: { title, description, type: "website" },
  };
}

export default async function PublicCorridorPage(
  { params }: { params: Promise<{ route: string }> },
) {
  const { route } = await params;
  return CorridorPage({ params: Promise.resolve({ slug: route }) });
}
