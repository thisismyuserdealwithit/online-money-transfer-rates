"use client";

import { useState } from "react";
import { BankDetailsChecker } from "@/components/BankDetailsChecker";
import { bankDetailsProfiles } from "@/lib/bank-details";

export function GlobalBicChecker() {
  const [countrySlug, setCountrySlug] = useState("united-kingdom");
  const profile = bankDetailsProfiles.find((item) => item.slug === countrySlug) ?? bankDetailsProfiles[0];

  return (
    <div className="global-bic-checker" id="checker">
      <label className="bic-country-select">
        <span>Expected bank country</span>
        <select value={countrySlug} onChange={(event) => setCountrySlug(event.target.value)}>
          {bankDetailsProfiles
            .filter((item) => item.countryCode !== "EU")
            .sort((a, b) => a.country.localeCompare(b.country))
            .map((item) => (
              <option value={item.slug} key={item.slug}>{item.country} ({item.countryCode})</option>
            ))}
        </select>
      </label>
      <BankDetailsChecker key={profile.slug} profile={profile} bicOnly />
    </div>
  );
}
