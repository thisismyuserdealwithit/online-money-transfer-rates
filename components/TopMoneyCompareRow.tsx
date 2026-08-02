import type { Corridor } from "@/lib/data";
import { money } from "@/lib/data";
import { topMoneyCompareCorridorUrl } from "@/lib/topmoneycompare";

export function TopMoneyCompareRow({ corridor }: { corridor: Corridor }) {
  const href = topMoneyCompareCorridorUrl(corridor);

  return (
    <aside className="tmc-compare-row" aria-label={`More providers for ${corridor.fromCountry} to ${corridor.toCountry}`}>
      <span className="tmc-compare-mark" aria-hidden="true">TMC</span>
      <div>
        <span className="tmc-compare-kicker">MORE PROVIDER CHOICES</span>
        <strong>Compare more companies for {corridor.fromCountry} to {corridor.toCountry}</strong>
        <small>Continue with {money(corridor.testAmount, corridor.fromCurrency)} on TopMoneyCompare.co.uk.</small>
      </div>
      <a href={href} target="_blank" rel="noopener">
        View more options <span aria-hidden="true">↗</span>
      </a>
    </aside>
  );
}
