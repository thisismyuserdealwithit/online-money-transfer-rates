"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { corridorGroups, corridors } from "@/lib/data";

export function CorridorFinder() {
  const router = useRouter();
  const [slug, setSlug] = useState("uk-to-spain");
  const selected = corridors.find((corridor) => corridor.slug === slug) ?? corridors[0];

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(`/corridors/${slug}`);
  }

  return (
    <form className="finder" onSubmit={submit}>
      <div className="field-static">
        <label>Money starts in</label>
        <strong>{selected.fromCountry}</strong>
        <small>{selected.fromCurrency}</small>
      </div>
      <div className="finder-arrow" aria-hidden="true">→</div>
      <label className="field-select">
        <span>Where should it arrive?</span>
        <select value={slug} onChange={(event) => setSlug(event.target.value)}>
          <optgroup label="From the United Kingdom">
            {corridorGroups["from-uk"].map((corridor) => <option key={corridor.slug} value={corridor.slug}>{corridor.toCountry} · {corridor.toCurrency}</option>)}
          </optgroup>
          <optgroup label="To the United Kingdom">
            {corridorGroups["to-uk"].map((corridor) => <option key={corridor.slug} value={corridor.slug}>{corridor.fromCountry} → UK · {corridor.fromCurrency}</option>)}
          </optgroup>
          <optgroup label="Major global routes">
            {corridorGroups.major.map((corridor) => <option key={corridor.slug} value={corridor.slug}>{corridor.fromCountry} → {corridor.toCountry}</option>)}
          </optgroup>
        </select>
      </label>
      <button type="submit">See today&apos;s evidence <span>→</span></button>
    </form>
  );
}
