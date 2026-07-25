import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProofPage from "@/app/proof/[id]/page";
import { getCorridor } from "@/lib/data";
import { getLiveProof } from "@/lib/live-data";

export async function generateMetadata(
  { params }: { params: Promise<{ route: string; id: string }> },
): Promise<Metadata> {
  const { route, id } = await params;
  const corridor = getCorridor(route);
  if (!corridor) return {};
  return {
    title: `Stored rate receipt: ${corridor.fromCountry} to ${corridor.toCountry}`,
    description: "The dated provider evidence behind an Online Money Transfer rate.",
    alternates: { canonical: `/${route}/receipts/${encodeURIComponent(id)}/` },
    robots: { index: false, follow: true },
  };
}

export default async function CorridorReceiptPage(
  { params }: { params: Promise<{ route: string; id: string }> },
) {
  const { route, id } = await params;
  const corridor = getCorridor(route);
  if (!corridor) notFound();

  const live = await getLiveProof(id);
  const fallbackExists = corridor.quotes.some((quote) => quote.proofId === id);
  if ((!live && !fallbackExists) || (live && String(live.corridor_slug) !== route)) {
    notFound();
  }
  return ProofPage({ params: Promise.resolve({ id }) });
}
