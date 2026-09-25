import type { ProviderReview } from "./reviews";

export const additionalProviderReviews: ProviderReview[] = [
  {
    slug: "nala",
    name: "NALA",
    mark: "NA",
    category: "Transfer specialist",
    rating: null,
    reviewedAt: "2026-09-25",
    byline: "OMT research desk",
    collectionMethod: "public-calculator",
    collectionStatus: "pending",
    verdict: "NALA deserves consideration for UK payments to supported African and Asian destinations. Its public rate data lacks transfer fees and funding or payout conditions, so it cannot yet supply a complete price for our rankings.",
    bestFor: "Regular family payments to a supported bank account or mobile wallet.",
    lessSuitableFor: "Customers needing a destination or payout method outside NALA's published coverage.",
    rateModel: "NALA adds an exchange-rate markup to its market reference. The customer rate appears before payment confirmation.",
    feeModel: "Fees depend on the route, payout method and amount. Its UK terms do not promise universally fee-free transfers.",
    delivery: "Mobile-wallet and bank timings differ by country. Bank processing windows, weekends and local holidays can affect arrival.",
    access: "App-based transfers from the UK, with debit-card Apple Pay funding documented. Apple Pay credit cards are not supported.",
    strengths: ["Bank and mobile-wallet delivery on supported routes", "Published country-specific delivery guidance", "Fees and recipient amount shown before confirmation"],
    weaknesses: ["Exchange-rate markup forms part of the cost", "Funding and payout availability require a route-specific check", "Public rates alone do not establish total transfer cost"],
    analysis: [
      "NALA's destination list includes India, Pakistan, Bangladesh, the Philippines, Nigeria, Ghana and several East African countries. Its appeal depends on how the recipient uses money. A mobile-wallet payment may be more useful than a bank deposit, even when another provider advertises a slightly stronger conversion rate.",
      "The pricing documents need reading alongside the quote. NALA describes an FX markup, while its UK terms allow transfer fees that vary with the transaction. A claim about low fees therefore cannot establish the cheapest provider. Compare the same sending amount, funding method and payout option, including any charge deducted before conversion.",
      "Our check of NALA's public rate data returned currency rates with timestamps and provider names, but no transfer fee or funding and payout conditions. Those rates cannot establish the final recipient amount for a specified budget. Ranked pricing remains pending until that information can be captured. This review does not claim a completed transfer test."
    ],
    comparisonSlugs: ["lemfi", "taptapsend", "remitly"],
    sources: [
      { label: "Coverage and delivery guidance", publisher: "NALA", url: "https://www.nala.com/" },
      { label: "Public rate data, without transfer fees", publisher: "NALA", url: "https://partners-api.prod.nala-api.com/v1/fx/rates" },
      { label: "UK fees and exchange-rate terms", publisher: "NALA", url: "https://www.nala.com/terms-of-service-uk-2025" },
      { label: "How NALA earns money", publisher: "NALA Help Centre", url: "https://help.nala.money/en/articles/4771774-how-does-nala-make-money" },
      { label: "Apple Pay funding and fees", publisher: "NALA Help Centre", url: "https://help.nala.money/en/articles/6633372-send-money-with-apple-pay-on-nala-how-it-works-fees" }
    ]
  },
  {
    slug: "moneyfex",
    name: "MoneyFex",
    mark: "MF",
    category: "Transfer specialist",
    rating: null,
    reviewedAt: "2026-09-25",
    byline: "OMT research desk",
    collectionMethod: "public-calculator",
    collectionStatus: "active",
    verdict: "MoneyFex's public calculator returns rates, fees and recipient amounts for supported routes. We report these as indicative estimates: funding is not selected at this stage, so they do not qualify for our cheapest-provider rankings.",
    bestFor: "Customers checking an additional provider for a supported bank or mobile-wallet payment.",
    lessSuitableFor: "Anyone needing a verified universal fee schedule or a guaranteed delivery time before obtaining a quote.",
    rateModel: "Use the customer rate returned for the selected route and amount. We have not verified a single published exchange-rate margin.",
    feeModel: "The checked calculator adds its fee on top of the entered sending amount. Compare total payable, then confirm charges in the transfer flow.",
    delivery: "The website lists bank deposits, mobile money and cash collection. Availability and arrival time need confirmation for the selected destination.",
    access: "Public website calculator and mobile app. The calculator supports GBP from the UK; available funding methods require confirmation in the transfer flow.",
    strengths: ["Public sending and receiving currency selectors", "Several recipient delivery types advertised", "App features for managing recipient payments"],
    weaknesses: ["Funding method is not selected in the public estimate", "Payout types are not confirmed for every destination", "Indicative calculator results remain outside cheapest-provider rankings"],
    analysis: [
      "The public calculator lists destinations including Nigeria, Ghana, Uganda, Cameroon, Senegal and euro-area countries. That makes MoneyFex worth checking beside providers already serving those routes. A country appearing in a selector is a starting point: the actual payment still needs an available delivery method and a returned customer price.",
      "MoneyFex's own app description also discusses recipient wallets and direct payments for services. Those features address a different need from a straightforward bank transfer. Customers should check the receiving arrangements before choosing the service for a particular bill or recipient.",
      "The public estimate separates the sending amount, fee and total payable. Comparing only its sending amount with another provider's all-in budget would overstate value. We preserve those distinctions and label the estimate indicative because funding remains unspecified. We have not completed a payment, tested support or established a typical delivery time."
    ],
    comparisonSlugs: ["remitchoice", "lemfi", "worldremit"],
    sources: [
      { label: "Public calculator and delivery services", publisher: "MoneyFex", url: "https://www.moneyfex.com/" },
      { label: "Provider's app description", publisher: "MoneyFex Ltd via Apple App Store", url: "https://apps.apple.com/gb/app/moneyfex/id1581733143" }
    ]
  },
  {
    slug: "remitchoice",
    name: "Remit Choice",
    mark: "RC",
    category: "Transfer specialist",
    rating: null,
    reviewedAt: "2026-09-25",
    byline: "OMT research desk",
    collectionMethod: "public-calculator",
    collectionStatus: "pending",
    verdict: "Remit Choice offers useful funding and payout choices for UK remittances. Its public calculator makes price checking possible, but first-transfer offers need separating from the cost a returning customer pays.",
    bestFor: "Family payments where the recipient needs a supported cash, mobile-wallet or bank payout.",
    lessSuitableFor: "Customers comparing a promotional first-transfer rate with competitors' ordinary prices.",
    rateModel: "A customer exchange rate includes an FX spread. The terms explain that Remit Choice earns revenue from the conversion.",
    feeModel: "Service fees and the total payable appear before confirmation. Introductory promotions can change the rate, fee or both.",
    delivery: "Bank deposits, mobile wallets and cash collection are advertised. Timing and availability depend on the chosen destination and service.",
    access: "Website and app, with identity verification. Published funding options include cards, online/open banking, Apple Pay and Google Pay, subject to availability.",
    strengths: ["Public homepage calculator for rate checks", "Several funding and recipient delivery options", "Terms describe both service fees and FX spread"],
    weaknesses: ["First-transfer offers can distort repeat-price comparisons", "Account and identity checks are required to transfer", "Destination coverage does not guarantee every payout method"],
    analysis: [
      "Remit Choice's own FAQ directs visitors to its homepage calculator for live rates. The service lists destinations across Africa, Asia and Europe, but the relevant question is whether a particular recipient can use the selected delivery option. Bank deposits and cash collection should remain separate comparisons when their prices or access differ.",
      "The welcome offer deserves a separate check. Its first-transfer terms allow an improved rate, reduced fees or both for eligible new customers. That may be useful for a one-off payment, but it cannot establish the ongoing cost of sending money each month. A repeated payment should be evaluated using the ordinary customer terms.",
      "This review uses official service and pricing documents. It does not represent a completed payment or a test of customer support. Our reporting should retain the funding method, payout choice and promotion status alongside each captured quote so readers can judge whether the result applies to them."
    ],
    comparisonSlugs: ["remitly", "ace", "moneyfex"],
    sources: [
      { label: "Public calculator and destinations", publisher: "Remit Choice", url: "https://remitchoice.com/" },
      { label: "Funding, payout and first-transfer conditions", publisher: "Remit Choice", url: "https://www.remitchoice.com/faqs" },
      { label: "Fees and FX spread terms", publisher: "Remit Choice", url: "https://www.remitchoice.com/terms-and-conditions" }
    ]
  },
  {
    slug: "currenciesdirect",
    name: "Currencies Direct",
    mark: "CD",
    category: "Transfer specialist",
    rating: null,
    reviewedAt: "2026-09-25",
    byline: "OMT research desk",
    collectionMethod: "account-quote",
    collectionStatus: "review-only",
    verdict: "Currencies Direct suits people who want help arranging property, relocation or regular overseas payments. Its customer rate requires an account or individual quote, so public market information cannot establish its position in a daily price ranking.",
    bestFor: "Transfers where an account manager and advance planning are useful.",
    lessSuitableFor: "Customers seeking an immediately verifiable public recipient amount without registering or requesting a quote.",
    rateModel: "Customer rates combine a reference rate with a variable margin retained by Currencies Direct.",
    feeModel: "Most transfers have no separate provider fee; the website notes possible Batchpay charges. Recipient-bank fees may still apply.",
    delivery: "Bank-transfer timing depends on the payment arrangement and destination. Confirm the arrival estimate for the actual transaction.",
    access: "Personal and business services through the website, app and telephone. Bank transfer and debit-card funding are documented.",
    strengths: ["Account-manager support for planned transfers", "Online and app access alongside telephone service", "Published explanation of its variable exchange-rate margin"],
    weaknesses: ["Customer rates require login or an individual quote", "No universal published margin for every transfer", "No separate transfer fee does not mean conversion is free"],
    analysis: [
      "An account manager can be useful when payment details, timing and documentation need coordinating. Currencies Direct also describes rate alerts and tools for targeting or fixing a rate. Those services deserve consideration on a planned overseas payment, although their availability does not prove a better exchange price.",
      "The decisive comparison remains the amount delivered for the same total sterling cost. Currencies Direct states that it adds a variable margin to its reference rate. A quotation therefore needs comparing at the intended transfer size; a general currency chart cannot reveal what a particular customer will receive.",
      "The public quote form requests contact details, and the service FAQ directs customers to log in for live rates. Our review records that access limitation. We do not substitute an interbank observation for a customer quote or mark the provider cheapest without comparable evidence. This assessment covers its published service, rather than a completed transfer or an independently measured support experience."
    ],
    comparisonSlugs: ["torfx", "moneycorp", "ofx"],
    sources: [
      { label: "UK service, funding and rate-margin explanation", publisher: "Currencies Direct", url: "https://www.currenciesdirect.com/en-gb" },
      { label: "Transfer fees and possible recipient-bank charges", publisher: "Currencies Direct Help Centre", url: "https://help.currenciesdirect.com/en/sending-money/do-i-pay-any-fees-for-sending-money-needs-check" }
    ]
  },
  {
    slug: "torfx",
    name: "TorFX",
    mark: "TX",
    category: "Transfer specialist",
    rating: null,
    reviewedAt: "2026-09-25",
    byline: "OMT research desk",
    collectionMethod: "account-quote",
    collectionStatus: "review-only",
    verdict: "TorFX combines account-manager support with online transfers and tools for planned payments. Its own help page says public website rates are indicative interbank rates, so a customer quote is essential before judging value.",
    bestFor: "Property, relocation and regular transfers where telephone support or advance rate planning matters.",
    lessSuitableFor: "An anonymous public comparison that requires an immediately available customer quote.",
    rateModel: "TorFX provides a customer exchange rate through login, its app or an account manager. Public interbank rates are indicative only.",
    feeModel: "TorFX says it charges no separate transfer fee. Compare the agreed exchange rate and recipient amount to assess conversion cost.",
    delivery: "TorFX describes same-day delivery through to two working days, depending on currency, destination and receiving bank. Confirm the transaction estimate.",
    access: "Website, app and telephone, with bank-transfer or sterling/euro debit-card funding documented in its help centre.",
    strengths: ["Dedicated account-manager service", "Regular-payment and rate-planning options", "Explicit explanation of the public-rate limitation"],
    weaknesses: ["Public charts do not show an executable customer price", "No single published exchange-rate margin", "Forward contracts can mean missing a later favourable market move"],
    analysis: [
      "TorFX's service includes regular transfers, rate alerts, limit orders and forward contracts. These tools address different needs. A rate alert informs the customer; a forward contract fixes a rate for a later payment. Fixing can improve budget certainty, but it also removes the benefit of a favourable move after the agreement.",
      "Its fee claim should be read with the agreed exchange rate. The absence of a separate transfer fee does not make the conversion cost disappear. Customers should obtain the amount their beneficiary will receive for the intended sterling payment, then compare an equivalent quote from other providers.",
      "The distinction is unusually clear in TorFX's public help page: website and email interbank rates serve an indicative purpose. We preserve that boundary in reporting. This review assesses the published service and access terms; it does not claim that we opened an account, completed a transfer or tested an account manager."
    ],
    comparisonSlugs: ["currenciesdirect", "moneycorp", "xe"],
    sources: [
      { label: "Service, fees and transfer tools", publisher: "TorFX", url: "https://www.torfx.com/" },
      { label: "Funding and indicative-rate limitation", publisher: "TorFX Online Help", url: "https://online.torfx.com/CustomerPortal/help.htm" },
      { label: "Everyday transfers and quote access", publisher: "TorFX", url: "https://www.torfx.com/everyday-transfers" }
    ]
  },
  {
    slug: "moneycorp",
    name: "Moneycorp",
    mark: "MC",
    category: "Transfer specialist",
    rating: null,
    reviewedAt: "2026-09-25",
    byline: "OMT research desk",
    collectionMethod: "account-quote",
    collectionStatus: "review-only",
    verdict: "Moneycorp offers online transfers and dealer support for people managing money across countries. Its published online fee policy is clear, but the customer exchange rate requires an account or individual quote before a cost comparison is meaningful.",
    bestFor: "Customers arranging repeat overseas payments or comparing an individually quoted larger transfer.",
    lessSuitableFor: "Cash-pickup remittances or a public rate comparison that must work without an account.",
    rateModel: "Moneycorp's FAQ says the customer rate reflects market pricing, the amount and currency, with a conversion margin.",
    feeModel: "Standard online transfers have no separate transfer fee. Telephone payments and regular-payment arrangements may have different charges.",
    delivery: "Timing depends on funding clearance, destination and payment arrangements. Confirm the arrival estimate before committing.",
    access: "Personal online account, app and telephone service. Published funding options include a UK-issued debit card or bank transfer; the online minimum is £50 or equivalent.",
    strengths: ["Self-service transfers with dealer support available", "Bank-transfer and UK debit-card funding", "Transaction history, saved recipients and rate alerts"],
    weaknesses: ["Customer rates are not anonymous public quotes", "Fee terms differ by service channel", "A conversion margin remains despite no standard online transfer fee"],
    analysis: [
      "Moneycorp's online account supports holding currencies, saved recipients and transaction history. These features can reduce repeated administration for customers with regular overseas commitments. Telephone support is another reason to consider the service, but a dealer-assisted payment should be priced separately from an ordinary online transfer.",
      "Its personal FAQ explains why one headline rate cannot describe every payment: the market, transaction amount and currency influence the quote. The same page says debit-card funding and prefunding by bank transfer receive the same exchange rate. Funding clearance can still affect when the payment proceeds.",
      "Compare the complete sterling outlay and recipient amount for the service you intend to use. Our review is based on Moneycorp's published documentation, not a completed payment or a negotiated dealer rate. Without a captured customer quote, reporting can describe its service and price access but cannot establish that Moneycorp is cheapest on a route."
    ],
    comparisonSlugs: ["currenciesdirect", "torfx", "ofx"],
    sources: [
      { label: "Online service and funding", publisher: "Moneycorp", url: "https://www.moneycorp.com/en-gb/personal/moneycorp-online/" },
      { label: "Rate calculation and online minimum", publisher: "Moneycorp", url: "https://www.moneycorp.com/en-gb/help-support/personal-faq/" },
      { label: "Personal payments and service options", publisher: "Moneycorp", url: "https://www.moneycorp.com/en-gb/personal/make-payments/" },
      { label: "Online, telephone and regular-payment fee distinctions", publisher: "Moneycorp", url: "https://www.moneycorp.com/en-gb/personal/send-money-abroad/send-money-to-ireland/" }
    ]
  }
];
