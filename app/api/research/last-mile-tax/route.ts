import study from "@/lib/last-mile-data.json";

const sources = {
  remittancePrices: "https://datacatalog.worldbank.org/search/dataset/0037898/remittance-prices-worldwide",
  accountOwnership: "https://data.worldbank.org/indicator/FX.OWN.TOTL.ZS",
  globalFindex: "https://www.worldbank.org/en/publication/globalfindex/download-data",
  controlOfCorruption: "https://www.worldbank.org/en/publication/worldwide-governance-indicators",
  bankBranches: "https://data.worldbank.org/indicator/FB.CBK.BRCH.P5",
  atms: "https://data.worldbank.org/indicator/FB.ATM.TOTL.P5",
  internetUse: "https://data.worldbank.org/indicator/IT.NET.USER.ZS",
  swiftContext: "https://www.swift.com/about-us/who-we-are/what-swift",
};

export async function GET() {
  return Response.json({
    title: "The Last Mile Tax 2026",
    subtitle: "What cash collection costs families receiving money from Britain",
    methodology: {
      prices: "All 791 transparent UK service observations in World Bank Remittance Prices Worldwide Q3 2025.",
      displayBasket: "Estimated £200 monetary cost by linear interpolation between the official £120 and £300 UK baskets. It is not an observed £200 quote.",
      matchedOffers: "Provider, destination, funding instrument, access point, speed, collection date and receiving network coverage are held constant. Only cash versus account delivery changes.",
      adjustedModel: "Ordinary least squares with heteroskedasticity-consistent uncertainty, controlling for provider and corridor combination, funding instrument, access point, speed and receiving network coverage.",
      countryContext: "Global Findex 2025 account ownership data collected in 2024, World Bank 2024 Worldwide Governance Indicators and latest available 2021 to 2024 WDI or IMF Financial Access Survey observations.",
      correlations: "Spearman rank relationships. They describe association and are not causal estimates.",
    },
    sources,
    ...study,
  }, { headers: { "cache-control": "public, max-age=3600" } });
}
