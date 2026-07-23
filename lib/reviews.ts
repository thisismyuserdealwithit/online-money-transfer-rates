export type ReviewSource = {
  label: string;
  publisher: string;
  url: string;
};

export type ProviderReview = {
  slug: string;
  name: string;
  mark: string;
  category: "Transfer specialist" | "Digital account" | "Bank" | "Cash network";
  rating: number;
  verdict: string;
  bestFor: string;
  lessSuitableFor: string;
  rateModel: string;
  feeModel: string;
  delivery: string;
  access: string;
  strengths: string[];
  weaknesses: string[];
  analysis: string[];
  comparisonSlugs: string[];
  sources: ReviewSource[];
};

const reviewed = "23 July 2026";

export const reviewsUpdated = reviewed;

export const providerReviews: ProviderReview[] = [
  {
    slug: "xe",
    name: "Xe",
    mark: "XE",
    category: "Transfer specialist",
    rating: 4.6,
    verdict: "Xe has the reach and support to handle far more than a routine £200 payment. Its public converter is useful, though it is not the rate a customer can necessarily book, a distinction the glossy chart leaves rather quiet.",
    bestFor: "People who want broad currency coverage, rate alerts and support for larger transfers.",
    lessSuitableFor: "Anyone comparing only the public mid-market-style converter without opening the transfer quote.",
    rateModel: "Xe displays live market information publicly, then provides a customer send rate during the transfer flow. Xe states that it earns money on the conversion.",
    feeModel: "A send fee can apply according to the route, payment method and amount. The fee and customer rate appear before confirmation.",
    delivery: "Usually 1 to 3 business days after Xe receives the customer's funds, depending on the destination and currency.",
    access: "Online and app transfers, with support for personal and business customers. The published UK and European online limit is £350,000 or the sending-currency equivalent.",
    strengths: ["Very broad currency and country coverage", "Rate alerts and established market-data tools", "Suitable for transfers far above the £200 examples on this site"],
    weaknesses: ["Public converter evidence is indicative, not a transferable quote", "The exchange-rate margin is not expressed as one standard percentage", "Third-party bank deductions can still occur"],
    analysis: [
      "Xe needs two separate judgements. As a currency-information service it is exceptionally visible: customers can inspect charts, alerts and market rates without opening an account. As a transfer company, however, Xe supplies a separate send rate. That rate includes the commercial conversion economics of the transaction. A screenshot of the public converter proves the market reference at that moment, not the final amount available to a signed-in customer.",
      "That distinction explains our treatment of Xe in corridor tables. Xe is marked Best Rated for its overall service, breadth and reputation, but an indicative converter result cannot beat a provider that has supplied a complete, bookable bank-transfer quote. Readers should compare the final recipient amount after Xe has applied both its rate and any send fee.",
      "Xe becomes more interesting when the payment is larger or less routine. Its published UK and European online limit reaches £350,000, while its support and rate-alert tools fit property, business and relocation transfers. For £200, a flat-fee specialist or a remittance app may win. For a six-figure payment, service, execution and payment tracing can matter alongside the last decimal point."
    ],
    comparisonSlugs: ["wise", "currencyfair", "ofx"],
    sources: [
      { label: "Money transfer fees", publisher: "Xe Help Centre", url: "https://help.xe.com/hc/en-gb/articles/360019472317" },
      { label: "UK international money transfers", publisher: "Xe", url: "https://www.xe.com/en-gb/send-money/" }
    ]
  },
  {
    slug: "wise",
    name: "Wise",
    mark: "WI",
    category: "Transfer specialist",
    rating: 4.7,
    verdict: "Wise remains the cleanest yardstick for an ordinary bank transfer. It uses the mid-market rate and places its charge in view, so there is less detective work between the advertised rate and the amount delivered.",
    bestFor: "Transparent bank-to-bank transfers, multi-currency balances and customers who want the rate and fee separated.",
    lessSuitableFor: "Cash collection and customers who assume every funding method costs the same.",
    rateModel: "The mid-market exchange rate is used for the conversion. Wise does not add a hidden rate margin to a standard transfer.",
    feeModel: "A variable fee combines a small fixed element with a percentage that changes by currency, amount and payment method. Volume discounts can reduce the percentage on large transfers.",
    delivery: "Often seconds or the same day on supported local routes. Swift-funded or less liquid routes can take longer.",
    access: "Website and app, personal and business accounts, local receiving details in selected currencies and transfers from small to multi-million-pound amounts.",
    strengths: ["Mid-market rate with the charge shown separately", "Strong public calculator and comparison evidence", "Fast local payout on many common routes"],
    weaknesses: ["The fee varies by funding method and currency", "Not a cash-pickup network", "The cheapest method may require a bank transfer into Wise"],
    analysis: [
      "Wise is the most useful control in a rate comparison because its price is legible. The customer sees the market rate, the amount deducted as a fee and the resulting recipient amount. That does not make Wise cheapest on every route, but it makes the reason for the result easier to identify. A rival can beat Wise through a flat fee, a promotional rate or cheaper local payout, yet the comparison remains grounded in a visible total.",
      "For the £200 tests used across this site, Wise's fixed fee component can matter more than it would on a larger transfer. Atlantic Money's £3 flat fee may look expensive at £200 and unusually cheap at £20,000. Remittance providers may subsidise a first transfer. Wise is therefore best read as a repeat-customer benchmark using bank funding, not as an automatic winner.",
      "The service extends beyond transfers. Customers can hold currencies, receive local payments in selected markets and spend from a Wise card. Those account features are useful, but they should not blur the transfer test. Our tables compare the exact route, amount, funding method and recipient amount shown in the captured quote."
    ],
    comparisonSlugs: ["xe", "atlanticmoney", "revolut"],
    sources: [
      { label: "UK transfer calculator and pricing", publisher: "Wise", url: "https://wise.com/gb/send-money/" },
      { label: "Provider comparison methodology", publisher: "Wise", url: "https://wise.com/gb/compare/" }
    ]
  },
  {
    slug: "revolut",
    name: "Revolut",
    mark: "RE",
    category: "Digital account",
    rating: 4.4,
    verdict: "Revolut can be very good value for an existing customer exchanging within the plan allowance. Go beyond that allowance, or exchange at the weekend, and the apparently simple price develops rather more moving parts.",
    bestFor: "Existing Revolut users, weekday exchanges within plan limits and people who hold several currencies.",
    lessSuitableFor: "A one-screen public comparison, since the final transferable quote normally sits inside the app.",
    rateModel: "Revolut applies its own exchange rate. It says the rate reflects market conditions, the amount and its costs.",
    feeModel: "Standard customers have a £1,000 monthly exchange allowance before a 1% fair-usage fee. Plus has £3,000 before 0.5%. Weekend fees can also apply. International payment fees vary by route.",
    delivery: "Instant between Revolut users. Local, SEPA and international bank-payment times differ by destination and rail.",
    access: "App-led personal and business accounts with multi-currency balances, cards and local or international payments.",
    strengths: ["Very convenient for existing account holders", "Clear plan allowances and in-app confirmation", "Strong multi-currency account and card features"],
    weaknesses: ["Plan and weekend rules make headline pricing incomplete", "Public pages do not expose every final quote", "Intermediary fees can affect some Swift payments"],
    analysis: [
      "Revolut cannot be reduced to one exchange-rate margin. The answer changes with the customer's plan, the amount already exchanged in that rolling month and whether the conversion occurs during the weekend window. A Standard customer converting £200 on a weekday below the allowance can face a very different price from someone converting £2,000 after using the allowance.",
      "This is why a live app quote matters. The international payment itself can also carry a route-specific fee even when the currency conversion appears inexpensive. Revolut's Pay All Fees option can improve certainty on some Swift routes, while ordinary intermediary charges remain outside the neat headline exchange calculation.",
      "For an existing user, the convenience is hard to dismiss. Currency can be held before payment, transfers between Revolut users are instant and the same account handles travel spending. A new customer making one transfer should still compare the recipient amount with Wise, Xe and a route specialist before choosing a paid plan for the sake of one exchange."
    ],
    comparisonSlugs: ["wise", "xe", "starling"],
    sources: [
      { label: "Standard plan fees", publisher: "Revolut UK", url: "https://www.revolut.com/legal/standard-fees/" },
      { label: "Exchange fees and limits", publisher: "Revolut Help", url: "https://help.revolut.com/help/wealth/exchanging-money/how-much-does-it-cost-to-make-an-exchange/will-i-be-charged-for-exchanging-foreign-currencies/" }
    ]
  },
  {
    slug: "currencyfair",
    name: "CurrencyFair",
    mark: "CF",
    category: "Transfer specialist",
    rating: 4.3,
    verdict: "CurrencyFair is a credible bank-transfer specialist that publishes a typical exchange margin, which is more candour than most brokers manage. The flat transfer-out fee still needs adding to the rate cost.",
    bestFor: "Bank-to-bank payments, businesses and customers who value telephone support and rate alerts.",
    lessSuitableFor: "Cash pickup, card-to-card remittances and very small transfers where the flat fee has more weight.",
    rateModel: "CurrencyFair states that its exchange margin varies by currency and is typically around 0.53%.",
    feeModel: "After conversion, a transfer-out fee applies. The published GBP fee is £2.50 and the euro fee is €3.",
    delivery: "Many transfers complete within 24 hours. Timing depends on when the customer's deposit reaches CurrencyFair and the destination rail.",
    access: "Personal and business accounts, more than 20 currencies and transfers to over 150 countries.",
    strengths: ["Publishes a typical FX margin", "Low, simple transfer-out fee", "Personal support and business functionality"],
    weaknesses: ["The final margin still varies by currency", "Requires an account-funded transfer process", "Fewer payout types than remittance networks"],
    analysis: [
      "CurrencyFair sits between an automated transfer app and a traditional currency broker. It offers self-service conversion, rate alerts and multi-currency balances, while retaining telephone and email support. Its published typical margin of about 0.53% gives a useful starting point, although the booked rate for a particular pair can be better or worse.",
      "The fee structure is easy to misunderstand. The £2.50 transfer-out charge is not the full conversion cost. The exchange margin has already affected how much foreign currency was bought. A fair comparison therefore uses the recipient amount after both the exchange and transfer-out fee, which is exactly what our captured evidence is designed to show.",
      "CurrencyFair can suit a customer who transfers periodically and wants more control than a remittance app supplies. It is not designed around cash collection or mobile-wallet payouts. On a £200 transfer the fixed fee is visible; on a larger payment the rate margin becomes the larger number."
    ],
    comparisonSlugs: ["wise", "xe", "ofx"],
    sources: [
      { label: "UK pricing and typical margin", publisher: "CurrencyFair", url: "https://www.currencyfair.com/en-gb/" },
      { label: "Transfer fee table", publisher: "CurrencyFair", url: "https://www.currencyfair.com/how-it-works/transfer-fees-overview" }
    ]
  },
  {
    slug: "atlanticmoney",
    name: "Atlantic Money",
    mark: "AM",
    category: "Transfer specialist",
    rating: 4.4,
    verdict: "Atlantic Money charges £3 rather than taking a percentage, and says it adds no exchange-rate markup. That is fairly ordinary on £200 but difficult to ignore on £20,000, provided the route is actually supported.",
    bestFor: "Larger bank transfers on supported currencies, including business payments.",
    lessSuitableFor: "Cash pickup, unsupported destinations and people who need a large branch or agent network.",
    rateModel: "Atlantic Money says it passes through the live institutional exchange rate without a markup.",
    feeModel: "A flat £3 fee for UK transfers, rather than a percentage of the amount.",
    delivery: "Route-dependent bank delivery through the app. The quote should be checked for the actual arrival estimate.",
    access: "App-based personal and business transfers from the UK and supported European countries, with transfers advertised up to £1 million.",
    strengths: ["Flat £3 pricing can be exceptional on large amounts", "No stated FX markup", "Simple cost structure"],
    weaknesses: ["Narrower corridor and payout coverage than larger rivals", "App-led service with a smaller operating history", "A public quote is not available on every route"],
    analysis: [
      "Atlantic Money changes the arithmetic of a large transfer. A percentage fee grows with the amount; £3 does not. On a £200 payment the flat fee is 1.5% before any other consideration. On £20,000 it is 0.015%. That makes amount size central to the verdict.",
      "The company says it uses a live institutional rate without adding a markup. Our corridor crawler still checks the complete recipient amount, because a claim about pricing is not a substitute for a route-specific quote. Availability is the main practical limit. Atlantic Money does not try to match the global cash and mobile-wallet footprint of a remittance network.",
      "Where it is available, it deserves a place beside Wise and a broker quote on any large bank transfer. Customers should confirm the supported destination, payment timing and beneficiary requirements before treating the flat fee as the whole decision."
    ],
    comparisonSlugs: ["wise", "currencyfair", "xe"],
    sources: [
      { label: "UK pricing and live-rate policy", publisher: "Atlantic Money", url: "https://atlantic.money/get-app" },
      { label: "Business transfer pricing", publisher: "Atlantic Money", url: "https://atlantic.money/gb/en/business" }
    ]
  },
  {
    slug: "remitly",
    name: "Remitly",
    mark: "RM",
    category: "Transfer specialist",
    rating: 4.2,
    verdict: "Remitly earns its place through local delivery, including cash and mobile wallets. The welcome rate can look splendid on the first screen, so we keep it away from the repeat-customer comparison.",
    bestFor: "Family remittances where delivery choice and local payout coverage matter.",
    lessSuitableFor: "Customers comparing a promotional first transfer with competitors' standard repeat pricing.",
    rateModel: "A route-specific customer exchange rate. New-customer promotional rates can apply to a capped first-transfer amount.",
    feeModel: "Route and delivery dependent. UK examples commonly show a fixed fee, while first-transfer promotions may remove it.",
    delivery: "Express and economy-style options vary by corridor. Remitly advertises a delivery-time guarantee on eligible transfers.",
    access: "Website and app, with bank deposits, cash pickup, mobile money and other local delivery methods where available.",
    strengths: ["Wide range of recipient delivery methods", "Useful route-level pricing pages", "Transfer tracking and delivery guarantee"],
    weaknesses: ["Promotions can obscure the ordinary repeat price", "Rates differ by payout and funding method", "Not designed as a broad multi-currency account"],
    analysis: [
      "Remitly competes on the last mile as much as on foreign exchange. A slightly weaker bank-deposit rate may still be useful if the recipient needs a cash counter, mobile wallet or specific local bank network. That breadth is not captured by a rate-only league table.",
      "The main comparison trap is the welcome offer. A promotional exchange rate, no-fee first transfer or limited boosted amount is a real offer, but it is not the price a regular customer receives. We preserve promotional evidence while excluding it from the standard winner when the quote cannot be reproduced by an existing customer.",
      "For a recurring family payment, check the second-transfer price and the required payout method. Compare the final amount received, not the fee in isolation. A £1.99 fee paired with a stronger rate can beat a £0 fee paired with a wider conversion margin."
    ],
    comparisonSlugs: ["worldremit", "ria", "westernunion"],
    sources: [
      { label: "UK route pricing example", publisher: "Remitly", url: "https://www.remitly.com/gb/en/netherlands/pricing" },
      { label: "UK money transfer service", publisher: "Remitly", url: "https://www.remitly.com/gb/en" }
    ]
  },
  {
    slug: "worldremit",
    name: "WorldRemit",
    mark: "WR",
    category: "Transfer specialist",
    rating: 4.1,
    verdict: "WorldRemit is useful when the recipient needs cash or mobile money rather than another bank account. Change the payout method and the price can change with it, so the exact delivery choice belongs in the quote.",
    bestFor: "Recipients who need cash pickup or mobile money rather than a conventional bank account.",
    lessSuitableFor: "Large currency conversions or customers who only need a low-cost bank-to-bank route.",
    rateModel: "A customer rate is shown in the transfer calculator after the receive country, amount and payout option are selected.",
    feeModel: "Upfront route-specific fees. Card issuers may add their own charge, and the rate also forms part of the cost.",
    delivery: "Bank deposit, cash pickup and mobile money can have different delivery estimates, often ranging from minutes to several business days.",
    access: "Website and app with a broad recipient network across remittance markets.",
    strengths: ["Cash and mobile-money coverage", "Several ways to fund and receive", "Upfront recipient amount in the calculator"],
    weaknesses: ["Public automation can encounter human-verification checks", "Total cost changes with payout choice", "Less suited to high-value FX planning"],
    analysis: [
      "WorldRemit is most useful where the receiving problem is not simply an IBAN. Cash counters and mobile wallets can reach people who do not use a conventional bank account, and that service has a real operating cost. Comparing it only with a European bank transfer misses the point.",
      "The price still needs scrutiny. WorldRemit shows the fee and rate before confirmation, but both can change when the customer switches from bank deposit to cash or changes the funding card. The recipient amount is the cleanest common measure.",
      "Our crawler keeps WorldRemit visible when the public calculator demands a human-verification step. An unavailable automated capture is not evidence that the service is unavailable to a person; it means we do not publish an unproven number."
    ],
    comparisonSlugs: ["remitly", "ria", "taptapsend"],
    sources: [
      { label: "UK transfer methods and pricing explanation", publisher: "WorldRemit", url: "https://www.worldremit.com/en-gb" }
    ]
  },
  {
    slug: "westernunion",
    name: "Western Union",
    mark: "WU",
    category: "Cash network",
    rating: 4.0,
    verdict: "Western Union can still put cash within reach almost anywhere. That network has a price, and the figure changes between online and agent transfers, making a generic “low fee” claim about as useful as it sounds.",
    bestFor: "Urgent cash pickup and destinations where digital bank payout is not practical.",
    lessSuitableFor: "Customers seeking a consistently tight bank-transfer rate without comparing channel options.",
    rateModel: "Western Union applies its own exchange rate and states that it makes money from currency exchange.",
    feeModel: "Variable by amount, destination, online or agent channel, funding method and receive method. First-transfer offers may apply.",
    delivery: "Cash can be available in minutes on eligible routes. Bank deposits and compliance checks can take longer.",
    access: "Online, app and a very large physical agent network.",
    strengths: ["Exceptional physical cash network", "Many funding and payout combinations", "Transfer tracking through the MTCN"],
    weaknesses: ["Pricing varies between agent and online channels", "Exchange margin can outweigh a low visible fee", "Promotional pricing is not the repeat price"],
    analysis: [
      "Western Union is not one product. A bank-funded online deposit, a debit-card transfer and cash handed to an agent can produce three different totals on the same corridor. The recipient may also choose cash, bank or wallet delivery. Every combination has different operating economics.",
      "The physical network is the reason to pay attention. A specialist may send more money to a bank account, yet be useless to a recipient who needs cash today. That does not excuse weak pricing, but it does explain why the service cannot be judged solely against an electronic UK-to-Europe transfer.",
      "For a fair test, select the actual send and receive methods before reading the recipient amount. Western Union openly states that it earns from currency conversion, so a £0 headline fee should never be read as a zero-cost transfer."
    ],
    comparisonSlugs: ["ria", "moneygram", "remitly"],
    sources: [
      { label: "UK first-transfer pricing disclosure", publisher: "Western Union", url: "https://www.westernunion.com/gb/en/transfer-money-fee-free.html" },
      { label: "UK rate alerts and quote factors", publisher: "Western Union", url: "https://www.westernunion.com/gb/en/frequently-asked-questions/faq-exchange-rate-alert.html" }
    ]
  },
  {
    slug: "ria",
    name: "Ria Money Transfer",
    mark: "RIA",
    category: "Cash network",
    rating: 4.1,
    verdict: "Ria combines a large cash network with a public calculator that exposes more than many rivals. Its shop counter and online journey carry different costs, so they should never be folded into one convenient headline.",
    bestFor: "Cash pickup, bank deposit and customers who value a physical agent option.",
    lessSuitableFor: "A comparison that assumes the online fee applies at a shop counter.",
    rateModel: "Ria adds a markup to the market rate. The rate changes with amount, destination, funding and delivery method.",
    feeModel: "Variable and shown in the calculator. Card funding generally costs more than bank funding; retail-store pricing differs from online.",
    delivery: "Minutes for some cash and digital routes, longer for bank-funded or bank-deposit transfers.",
    access: "Website, app and agent locations, with service to more than 190 countries.",
    strengths: ["Large cash and bank payout network", "Public calculator before sign-in", "Clear explanation of channel-specific pricing"],
    weaknesses: ["Shop and online prices differ", "A rate markup applies as well as the fee", "Card issuer or intermediary fees may appear"],
    analysis: [
      "Ria is one of the clearer cash-network providers about the reason prices vary. Its help material states that shop and online pricing are different because the channels carry different costs. It also confirms that the exchange rate includes a markup rather than presenting the visible transfer fee as the whole cost.",
      "The public calculator is useful because it can expose the fee, rate, total paid and recipient amount before login. Promotional first-transfer rates still need to be labelled. A repeat customer should not be ranked behind a price available only once.",
      "Against Western Union and MoneyGram, Ria should be tested on the recipient's actual payout location and method. Against Wise, it should be tested only when both offers deliver to the same type of account. Otherwise the comparison confuses price with access."
    ],
    comparisonSlugs: ["westernunion", "moneygram", "remitly"],
    sources: [
      { label: "UK rate calculator", publisher: "Ria Money Transfer", url: "https://www.riamoneytransfer.com/en-gb/" },
      { label: "How Ria fees and rates work", publisher: "Ria Help Centre", url: "https://help.riamoneytransfer.com/hc/en-us/articles/4407752015249-How-our-fees-and-exchange-rates-work" }
    ]
  },
  {
    slug: "moneygram",
    name: "MoneyGram",
    mark: "MG",
    category: "Cash network",
    rating: 3.9,
    verdict: "MoneyGram can solve a cash-payout problem that a cheaper bank service cannot touch. Its public quote journey is inconsistent, however, so we leave the rate blank when the calculator will not complete.",
    bestFor: "Cash collection and recipients served by MoneyGram's agent footprint.",
    lessSuitableFor: "Customers who want an easily reproducible public bank-transfer quote.",
    rateModel: "A route-specific customer rate that can include a conversion margin.",
    feeModel: "Varies with amount, payment method, delivery method and channel.",
    delivery: "Some cash transfers arrive within minutes; bank deposits depend on the destination and payment clearance.",
    access: "Online, app and physical agents in supported markets.",
    strengths: ["Large cash-pickup footprint", "Several payout methods", "Useful for recipients outside mainstream bank rails"],
    weaknesses: ["Public estimator can require anti-bot verification", "Channel pricing varies", "Exchange-rate cost is not one published percentage"],
    analysis: [
      "MoneyGram belongs in a UK remittance comparison because cash access changes the practical value of a transfer. Its rate is not automatically comparable with a bank-only specialist if the recipient cannot use the bank route.",
      "The service also illustrates why this site fails closed. When the estimator requires anti-bot verification, we keep MoneyGram in the company list but show no invented quote. A missing capture is a data limitation, not a negative number.",
      "Customers should price the exact shop or digital route and check identification, collection hours and currency availability. The recipient amount after the fee and exchange rate remains the useful headline."
    ],
    comparisonSlugs: ["westernunion", "ria", "worldremit"],
    sources: [
      { label: "UK money transfer service", publisher: "MoneyGram", url: "https://www.moneygram.com/mgo/gb/en/" }
    ]
  },
  {
    slug: "ofx",
    name: "OFX",
    mark: "OFX",
    category: "Transfer specialist",
    rating: 4.3,
    verdict: "OFX is better suited to a property payment or business transfer than a quick £200 remittance. Human support is useful, though the executable rate usually sits behind registration rather than on the public page.",
    bestFor: "Larger personal transfers, business payments and customers who want dealer support.",
    lessSuitableFor: "Small transfers and readers who need a complete anonymous public quote.",
    rateModel: "OFX provides a customer rate with a margin against the wholesale rate. Pricing can improve with amount and relationship.",
    feeModel: "OFX states that UK transfers carry no OFX transfer fee, although third-party banks may deduct charges.",
    delivery: "Common currencies can settle in one or two business days after funds are received; less common routes take longer.",
    access: "Online and telephone-supported personal and business transfers.",
    strengths: ["Strong support for larger and business payments", "No OFX transfer fee for UK customers", "Dealer assistance and risk-management products"],
    weaknesses: ["Customer rate usually requires registration", "Not aimed at cash pickup", "A no-fee message does not remove the FX margin"],
    analysis: [
      "OFX resembles a digital currency broker more than a small-remittance app. The service is built for bank transfers, larger amounts and businesses that may need to discuss execution. That makes it relevant to property purchases and supplier payments even when it is not the cheapest £200 option.",
      "The phrase no transfer fee needs translating. OFX still earns through the customer exchange rate, and a third-party bank may deduct money on some routes. The useful number is the final foreign-currency amount for the exact payment size.",
      "Public comparison is harder because a transferable customer rate normally requires registration. We do not substitute a marketing or interbank rate. A serious large-transfer comparison should obtain an OFX quote, then place it beside Xe, CurrencyFair, Wise and any broker quote at the same time."
    ],
    comparisonSlugs: ["xe", "currencyfair", "wise"],
    sources: [
      { label: "UK currencies and fee FAQs", publisher: "OFX", url: "https://www.ofx.com/en-gb/faqs/category/currencies-fees/" }
    ]
  },
  {
    slug: "paysend",
    name: "Paysend",
    mark: "PS",
    category: "Transfer specialist",
    rating: 4.0,
    verdict: "Paysend makes the visible charge pleasantly simple on many routes. The exchange rate still does some of the charging, so two identical £1 fees can leave the recipient with different amounts.",
    bestFor: "Small digital transfers, especially card-to-card or card-to-bank routes supported by Paysend.",
    lessSuitableFor: "Large transfers where a percentage difference in the exchange rate dominates the fixed fee.",
    rateModel: "Paysend includes an exchange-rate margin on currency conversion and displays the route rate before confirmation.",
    feeModel: "A low fixed transfer fee that varies by sending country and delivery method. Promotions can reduce it.",
    delivery: "Many card transfers are advertised as arriving within minutes, subject to the route, recipient bank and checks.",
    access: "App and web transfer service with bank, card and selected wallet delivery.",
    strengths: ["Predictable fixed fee", "Fast card delivery on supported routes", "Useful public route calculator"],
    weaknesses: ["The fixed fee is not the full FX cost", "Card or recipient-bank charges can apply", "Not designed for negotiated large-transfer pricing"],
    analysis: [
      "Paysend's fixed fee is easy to understand, which is useful for a £200 transfer. It also makes the exchange-rate comparison more important. Two providers can both charge £1 and produce different recipient amounts because their conversion rates differ.",
      "Card-to-card delivery can be faster and easier than entering a full bank instruction, but it is a different product from a bank-funded transfer. Funding-bank charges and recipient-card rules can affect the result beyond Paysend's displayed fee.",
      "Paysend should be tested against TransferGo and the remittance specialists on the exact destination. For larger payments, Wise, Atlantic Money or a broker may deserve more attention because a small rate difference becomes worth more than the convenience of a fixed fee."
    ],
    comparisonSlugs: ["transfergo", "wise", "remitly"],
    sources: [
      { label: "How Paysend fees work", publisher: "Paysend Help", url: "https://help.paysend.com/hc/en-gb/articles/5989311261341-Understanding-Paysend-fees" },
      { label: "UK route calculator", publisher: "Paysend", url: "https://paysend.com/send-money" }
    ]
  },
  {
    slug: "transfergo",
    name: "TransferGo",
    mark: "TG",
    category: "Transfer specialist",
    rating: 4.2,
    verdict: "TransferGo is a useful UK and European service with published starting prices and a modest multi-currency account. “From” remains the operative word because speed and payout method decide the final bill.",
    bestFor: "Regular consumer and small-business transfers, especially UK and European routes.",
    lessSuitableFor: "Customers who read a 'from' fee as the guaranteed price for every currency.",
    rateModel: "TransferGo applies a small markup to the mid-market rate. In-account and business pricing can differ from direct consumer transfers.",
    feeModel: "International and in-account conversion pricing starts from published percentages, with delivery or card fees on some options.",
    delivery: "Instant between TransferGo accounts, with next-day and faster paid options for external recipients.",
    access: "Personal and business transfers plus GBP, EUR, PLN and RON balances.",
    strengths: ["Useful delivery choices", "Published starting margins", "Multi-currency and business features"],
    weaknesses: ["Starting prices are not the price of every route", "Card delivery can carry third-party costs", "Currency balances remain narrower than Wise or Revolut"],
    analysis: [
      "TransferGo has moved beyond a single transfer form into a small multi-currency account. That can help repeat users who receive and hold GBP or European currencies, but the review still starts with the transfer quote.",
      "Its pricing page states that personal conversion and international-transfer pricing starts from 0.5%, while some in-account conversion starts lower. Business pricing can begin around 0.35%. The word 'from' matters: the destination, method and speed decide the actual figure.",
      "A next-business-day bank transfer and an urgent card payout should not be ranked as identical services. Our evidence records the method and delivery label so readers can see what was actually compared."
    ],
    comparisonSlugs: ["paysend", "wise", "instarem"],
    sources: [
      { label: "Personal pricing", publisher: "TransferGo", url: "https://www.transfergo.com/pricing" },
      { label: "Business pricing", publisher: "TransferGo", url: "https://www.transfergo.com/pricing/business" }
    ]
  },
  {
    slug: "taptapsend",
    name: "Taptap Send",
    mark: "TS",
    category: "Transfer specialist",
    rating: 4.1,
    verdict: "Taptap Send is built for particular migrant routes rather than universal currency coverage. Many transfers show no separate fee, leaving the exchange rate to do the commercial work.",
    bestFor: "Mobile money and family remittances on destinations supported by Taptap Send.",
    lessSuitableFor: "General-purpose European bank transfers or users who equate 'no fee' with no conversion cost.",
    rateModel: "Taptap Send says many corridors carry a small percentage within the exchange rate.",
    feeModel: "Often no separate fee, although country-specific fixed fees apply on a number of routes and amounts.",
    delivery: "Often fast to mobile money or local bank rails, with timing dependent on the destination partner.",
    access: "App-led service from supported sending countries to selected remittance destinations.",
    strengths: ["Strong mobile-money focus", "Simple recipient experience", "Country-level fee disclosure"],
    weaknesses: ["No-fee routes still include rate economics", "Coverage is selective", "Public quote availability varies by country"],
    analysis: [
      "Taptap Send is built around particular communities and payout partners rather than universal currency coverage. That can make it far more useful than a generic FX account on the destinations it serves.",
      "Its fee guide is unusually detailed. Some routes have a small fixed amount, while many say the company charges through the exchange rate instead. This is a good example of why a fee column alone cannot rank transfer companies.",
      "The proper comparison is with Remitly, WorldRemit and LemFi using the same mobile-wallet, bank or cash endpoint. A bank-only Wise quote may still be a useful price reference, but it is not always a substitute."
    ],
    comparisonSlugs: ["remitly", "worldremit", "lemfi"],
    sources: [
      { label: "Country-by-country fee guide", publisher: "Taptap Send", url: "https://support.taptapsend.com/hc/en-gb/articles/45247485548051-Fees-you-pay-sending-with-Taptap-Send" }
    ]
  },
  {
    slug: "instarem",
    name: "Instarem",
    mark: "IR",
    category: "Transfer specialist",
    rating: 4.1,
    verdict: "Instarem has a serious Asia-Pacific footprint and useful business features. Its published fees start low, but the exchange margin and payment method still decide whether the recipient gets a good deal.",
    bestFor: "Transfers linked to Asia-Pacific markets and businesses needing collection accounts.",
    lessSuitableFor: "Anyone relying on a headline starting percentage without checking the route quote.",
    rateModel: "Instarem says it adds a small exchange margin and displays it through the customer rate.",
    feeModel: "Personal transfers are advertised from 0.4%. Business sending has a published standard of 0.65%, subject to route and amount.",
    delivery: "Varies by currency and funding method, with some routes completing within hours.",
    access: "Personal and business accounts across supported sending markets, with local collection features for businesses.",
    strengths: ["Strong Asia-Pacific footprint", "Published personal and business starting fees", "Upfront cost and loyalty points"],
    weaknesses: ["UK route availability is not universal", "Starting fees vary by payment method and destination", "A small FX margin also applies"],
    analysis: [
      "Instarem has more depth than a simple remittance form. Its business account can collect and send several currencies, while the consumer product focuses on direct international transfers. Availability depends on where the customer lives, not only where the money is going.",
      "The published personal fee starts at 0.4%, and Instarem also acknowledges a small currency margin. The final recipient amount therefore remains the useful measure. A zero-fee promotional quote should be labelled rather than blended into ordinary pricing.",
      "For Asian routes, compare Instarem with SingX, Wise and the relevant remittance specialist. For UK-to-Europe, broader local-account services may be easier. The live evidence table below shows where our crawler has found a reproducible result."
    ],
    comparisonSlugs: ["singx", "wise", "transfergo"],
    sources: [
      { label: "Personal and business fees", publisher: "Instarem", url: "https://www.instarem.com/fees/" }
    ]
  },
  {
    slug: "singx",
    name: "SingX",
    mark: "SX",
    category: "Transfer specialist",
    rating: 4.0,
    verdict: "SingX separates its transaction fee from a rate it says carries no markup. The disclosure is admirably plain, though the service is most relevant to customers sending from its licensed Asian markets.",
    bestFor: "Singapore and supported Asia-Pacific transfers, including business payments.",
    lessSuitableFor: "UK customers assuming that every SingX product is available from Britain.",
    rateModel: "SingX states that it does not add a foreign-exchange markup and uses live rates.",
    feeModel: "Transaction fees are separate. Its disclosure says roughly 0.5% is common for frequently traded pairs, with a wider 0.5% to 5% range across all routes.",
    delivery: "Local-remittance timing varies by currency and partner, with third-party delays possible.",
    access: "Web-based personal and business service centred on Singapore and other licensed sending markets.",
    strengths: ["Separates rate and transaction fee", "Good Singapore and regional relevance", "Rate alerts and business capability"],
    weaknesses: ["Sending-country access is limited", "Infrequently traded currencies can cost materially more", "Third-party deductions may occur"],
    analysis: [
      "SingX offers a clean pricing idea: no FX markup, with the transaction fee shown separately. Its formal product disclosure adds the detail that the fee can vary widely and may be substantially higher for infrequently traded currencies.",
      "That disclosure is useful because it resists the temptation to present one 0.5% number as universal. A £200-equivalent liquid pair and an illiquid destination do not carry the same wholesale, compliance or payout costs.",
      "The service matters most for Singapore and regional customers. Our UK-oriented site keeps SingX in major corridors where public evidence is available, but it should not be presented as a universally accessible UK product."
    ],
    comparisonSlugs: ["instarem", "wise", "ofx"],
    sources: [
      { label: "Product disclosure and fee range", publisher: "SingX", url: "https://www.singx.co/productdisclosure" },
      { label: "Exchange-rate FAQ", publisher: "SingX", url: "https://www.singx.co/faq" }
    ]
  },
  {
    slug: "lemfi",
    name: "LemFi",
    mark: "LF",
    category: "Digital account",
    rating: 4.1,
    verdict: "LemFi combines migrant banking with strong African remittance routes. Many transfers carry no separate fee, which makes the customer exchange rate the part worth staring at.",
    bestFor: "UK customers sending regularly to supported African and other migrant corridors.",
    lessSuitableFor: "Customers who need a public browser quote or a universal country list.",
    rateModel: "Real-time app rate that changes through the day. The rate is confirmed when the transfer is initiated.",
    feeModel: "Many supported currency transfers carry no separate transfer fee, although pricing varies by route.",
    delivery: "Route-dependent bank and local payouts, generally managed inside the app.",
    access: "App-led multi-currency and remittance service for eligible residents and destinations.",
    strengths: ["Strong corridor focus", "Often no separate transfer fee", "Account and remittance features in one app"],
    weaknesses: ["The final rate normally requires the app", "Zero fee does not describe the exchange margin", "Coverage depends heavily on sending residence"],
    analysis: [
      "LemFi is designed around the financial life of migrants rather than occasional holiday money. That can make it more relevant than a broad European FX app on Nigeria and other supported corridors.",
      "Its help centre says many transfers carry zero fees and that the exchange rate changes through the day. The recipient amount therefore bears the commercial cost. A public comparison that records only the fee would miss almost everything.",
      "We keep LemFi visible where automated proof capture is blocked. Readers should open the app, enter the same £200 amount and compare the recipient amount with Taptap Send, Remitly and any local specialist."
    ],
    comparisonSlugs: ["taptapsend", "remitly", "wise"],
    sources: [
      { label: "How LemFi exchange rates work", publisher: "LemFi Support", url: "https://support.lemfi.com/hc/en-us/articles/4417425349521-What-exchange-rate-will-I-get" }
    ]
  },
  {
    slug: "starling",
    name: "Starling Bank",
    mark: "ST",
    category: "Bank",
    rating: 4.4,
    verdict: "Starling is unusually straight with UK customers: a 0.4% conversion charge sits beside the delivery fee. That does not always make it cheapest, but it does spare customers the usual bank-rate archaeology.",
    bestFor: "Existing Starling customers who want a transparent bank payment without opening a separate transfer account.",
    lessSuitableFor: "Cash pickup, unsupported currencies and customers who need weekend wholesale-rate conversion.",
    rateModel: "A current exchange rate with a separate 0.4% conversion fee. Weekend euro-account conversions use a fixed weekend rate.",
    feeModel: "0.4% conversion plus a delivery fee. Swift costs £5.50; lower-cost local delivery starts from 30p where available.",
    delivery: "Local network or Swift, depending on currency. International payment processing has weekday windows.",
    access: "Inside a Starling current account, with separate euro-account features for eligible customers.",
    strengths: ["Bank integration with unusually clear pricing", "Low-cost local payment option", "Published calculator and fee table"],
    weaknesses: ["Requires a Starling account", "Limited country list compared with specialists", "Recipient-bank fees can still reduce a Swift payment"],
    analysis: [
      "Starling is the most useful high-street-style comparison because it states the conversion charge plainly. On £1,000 the 0.4% conversion fee is £4, before the chosen delivery charge. That lets a customer compare it with Wise or Atlantic Money without reverse-engineering the bank rate.",
      "The low-cost local option can be only 30p for common routes, while Swift is £5.50. Those are not interchangeable delivery rails. Swift may carry payment references or reach a currency the local option does not, but recipient-bank fees remain possible.",
      "For an existing Starling customer the small difference from the cheapest specialist may be worth the convenience. For a customer opening an account solely for one payment, the specialist quote remains the cleaner baseline."
    ],
    comparisonSlugs: ["wise", "revolut", "natwestbusiness"],
    sources: [
      { label: "International transfer calculator", publisher: "Starling Bank", url: "https://www.starlingbank.com/send-money-abroad/" },
      { label: "International payment fee table", publisher: "Starling Bank", url: "https://www.starlingbank.com/send-money-abroad/country-fees/" }
    ]
  },
  {
    slug: "natwestbusiness",
    name: "NatWest Business",
    mark: "NWB",
    category: "Bank",
    rating: 3.5,
    verdict: "NatWest Business keeps permissions and payment records inside Bankline, which has genuine value. Its £15 payment fee swallows 7.5% of a £200 transfer before the exchange-rate margin gets involved.",
    bestFor: "Existing NatWest businesses that prioritise one banking workflow, permissions and payment references.",
    lessSuitableFor: "Price-led small international transfers.",
    rateModel: "NatWest applies a foreign-exchange margin and exposes a public business calculator for selected currencies.",
    feeModel: "Bankline and Online Banking charge £15 for most non-euro international payments. SEPA via Bankline is listed at 50p.",
    delivery: "Bank and Swift settlement according to currency cut-off and destination.",
    access: "NatWest business accounts through Online Banking or Bankline.",
    strengths: ["Integrated business approvals and records", "Public FX calculator", "Clear payment-fee disclosure"],
    weaknesses: ["£15 is large against a £200 payment", "FX margin is another cost", "Intermediary deductions can occur"],
    analysis: [
      "NatWest Business illustrates the difference between banking convenience and transfer value. A company may prefer to keep supplier payments inside Bankline because staff permissions, statements and audit trails are already there. That operational value is real.",
      "The rate comparison remains unforgiving. A £15 payment fee consumes 7.5% of a £200 test before the FX margin. On a larger payment the fixed fee matters less, while the margin becomes the main cost. Both belong in the recipient calculation.",
      "The NatWest calculator provides useful public evidence for selected currencies. We treat those figures as modelled bank pricing and link to the captured screen, rather than describing a published reference rate as a guaranteed customer execution."
    ],
    comparisonSlugs: ["starling", "wise", "lloydsbusiness"],
    sources: [
      { label: "Business international payments and fees", publisher: "NatWest", url: "https://www.natwest.com/business/support-centre/making-and-accepting-payments/electronic-payments/international-transfers.html" }
    ]
  },
  {
    slug: "lloydsbusiness",
    name: "Lloyds Bank Business",
    mark: "LB",
    category: "Bank",
    rating: 3.6,
    verdict: "Lloyds deserves credit for printing the number. Its standard 2.60% margin on outbound business payments up to £25,000 is still a bit steep beside many specialist quotes.",
    bestFor: "Existing Lloyds businesses that need bank controls and prefer the payment to remain within their banking platform.",
    lessSuitableFor: "Businesses choosing primarily on recipient amount.",
    rateModel: "A published standard outbound FX margin of 2.60% up to £25,000, tapering on larger payment bands.",
    feeModel: "Payment fees depend on the account and channel. The FX margin remains the larger cost on many conversions.",
    delivery: "International bank payment subject to cut-offs, currency and correspondent route.",
    access: "Lloyds business banking and Commercial Banking Online for eligible customers.",
    strengths: ["Exceptional transparency about standard FX margins", "Business permissions and bank statements", "Tiered margins improve with size"],
    weaknesses: ["2.60% is expensive beside many specialists", "Payment fees or correspondent charges may add cost", "The best pricing may require a larger amount or relationship"],
    analysis: [
      "Lloyds publishes information that many banks leave buried in the quote. An outbound business payment of £25,000 or less carries a standard 2.60% margin. That is not a separate debit; it changes the exchange rate and therefore the recipient amount.",
      "The absolute cost grows quickly. A 2.60% margin represents about £52 of value on £2,000 and £650 on £25,000 before any other charge. The margin band narrows above £25,000, but it remains worth obtaining a specialist quote.",
      "The bank may still be the right operational choice for a controlled supplier payment. The review does not call the margin abuse. It reflects liquidity, service, risk, distribution and the bank's pricing decision. The customer's job is simply to compare the complete outcome."
    ],
    comparisonSlugs: ["natwestbusiness", "santanderuk", "wise"],
    sources: [
      { label: "Published business FX margins", publisher: "Lloyds Bank", url: "https://www.lloydsbank.com/business/fx-margins.html" }
    ]
  },
  {
    slug: "santanderuk",
    name: "Santander UK",
    mark: "SAN",
    category: "Bank",
    rating: 3.5,
    verdict: "Santander publishes a 3% business FX markup up to £10,000, falling to 1% above £50,000. The transparency is welcome; the smaller-transfer price is not exactly a bargain.",
    bestFor: "Existing Santander businesses that value account integration and larger-payment banking controls.",
    lessSuitableFor: "Small price-sensitive transfers.",
    rateModel: "Published business conversion markup of 3% up to £10,000, 2% from £10,001 to £50,000 and 1% from £50,001.",
    feeModel: "Depends on payment type and banking channel. Corporate Swift tables show separate online and offline charges.",
    delivery: "SEPA and Swift with currency-specific cut-off and settlement times.",
    access: "Santander UK business, corporate and commercial banking customers.",
    strengths: ["Publishes the conversion markup", "Supports SEPA and many Swift currencies", "Business banking controls"],
    weaknesses: ["3% markup on smaller business payments", "Payment fees can sit on top", "Final Swift receipts may face other-bank charges"],
    analysis: [
      "Santander's worked example is useful because it states that the markup is deducted from the exchange rate and will not appear separately on the statement. That is exactly the cost most customers miss when they focus on a no-fee transfer.",
      "At £200, a 3% markup represents about £6 before any fixed payment fee. At £10,000 it represents £300. The lower 1% band for payments above £50,000 improves the rate, yet a specialist or broker can still be materially tighter.",
      "The bank's strength is process rather than raw FX pricing. Existing businesses may value approval chains, account history and same-platform reconciliation. Our table keeps that service context beside the rate evidence."
    ],
    comparisonSlugs: ["lloydsbusiness", "natwestbusiness", "wise"],
    sources: [
      { label: "Business international payment markups", publisher: "Santander UK", url: "https://www.santander.co.uk/business/support/payments/making-international-payments" },
      { label: "Corporate payment fees and settlement", publisher: "Santander UK", url: "https://www.santander.co.uk/corporate/solutions/global/global-payments-and-receipts" }
    ]
  },
  {
    slug: "hsbcuk",
    name: "HSBC UK",
    mark: "HSBC",
    category: "Bank",
    rating: 3.8,
    verdict: "HSBC has useful global accounts and broad bank infrastructure. A standard international payment still combines a visible charge with a signed-in customer rate, so the fee table tells only part of the story.",
    bestFor: "Existing HSBC customers, particularly those using Global Money or moving money within HSBC.",
    lessSuitableFor: "Anonymous public rate comparison and customers using a standard account without checking the conversion.",
    rateModel: "HSBC applies its customer exchange rate. The final transferable rate is generally shown inside the account flow.",
    feeModel: "Standard personal pricing lists £5 for many non-HSBC international payments through normal channels, with exceptions for account type and destination.",
    delivery: "International bank payment through local, EEA or Swift rails depending on the currency and destination.",
    access: "HSBC current accounts, Premier, business products and the Global Money Account.",
    strengths: ["Large international banking network", "Global Money can change the economics", "Useful for HSBC-to-HSBC transfers"],
    weaknesses: ["The public transfer rate is limited", "Standard-account fee does not show the full FX cost", "Different account tiers produce different answers"],
    analysis: [
      "There is no single HSBC transfer review without naming the account. A standard current-account international payment, Premier service and Global Money transfer can carry different rates and fees. Customers should compare the product they actually hold.",
      "HSBC publishes the visible payment fee, but the currency conversion can be worth much more. The authenticated rate must be compared with the market reference or a specialist recipient amount at the same moment.",
      "The international network is still useful for people who bank across countries or need a recognised bank payment. Convenience should be priced consciously rather than mistaken for a free conversion."
    ],
    comparisonSlugs: ["barclays", "wise", "revolut"],
    sources: [
      { label: "Current-account payment fees", publisher: "HSBC UK", url: "https://www.hsbc.co.uk/current-accounts/interest-rates-and-charges/" },
      { label: "Current cross-border rate markups", publisher: "HSBC UK", url: "https://www.hsbc.co.uk/cbpr/" }
    ]
  },
  {
    slug: "barclays",
    name: "Barclays",
    mark: "BAR",
    category: "Bank",
    rating: 3.6,
    verdict: "Barclays is convenient when the money is already in the account and the beneficiary is saved. The transferable rate sits inside the payment journey and can leave less currency than a specialist quote.",
    bestFor: "Existing Barclays customers who value a single banking relationship and payment record.",
    lessSuitableFor: "Customers who want to compare the full cost before logging in.",
    rateModel: "A Barclays customer exchange rate with an embedded margin, shown during the payment process.",
    feeModel: "Varies by personal or business product, payment rail and channel. Business Swift and SEPA tariffs are separate.",
    delivery: "International bank payment using SEPA, Swift or local routes where supported.",
    access: "Personal, Premier, Wealth and business accounts, each with its own terms.",
    strengths: ["Integrated bank payment", "Broad business and international capability", "Useful for existing account controls"],
    weaknesses: ["Final rate normally requires authentication", "Account tier changes pricing", "Intermediary charges can affect Swift payments"],
    analysis: [
      "Barclays is easy to use for someone already inside the app, which is why many customers never request a second quote. The visible transfer charge can be small or absent while the conversion rate supplies most of the cost.",
      "Our evidence uses reproducible public comparison material where a Barclays transfer quote cannot be captured directly. Such a result is marked indicative. It can illustrate the likely gap but cannot outrank a complete, bookable offer.",
      "For a routine £200 payment, compare the recipient amount with Wise and Starling. For a large payment, request a live Barclays rate and a specialist or broker quote together. The absolute difference matters more than the fee label."
    ],
    comparisonSlugs: ["hsbcuk", "wise", "starling"],
    sources: [
      { label: "International payment support", publisher: "Barclays", url: "https://www.barclays.co.uk/help/payments/payment-information/international-payments/" }
    ]
  },
  {
    slug: "paypal",
    name: "PayPal",
    mark: "PP",
    category: "Digital account",
    rating: 3.3,
    verdict: "PayPal solves a familiar-account problem, particularly for merchants. Its currency conversion can be expensive, and moving the balance into a bank account may add another step after the apparent transfer is finished.",
    bestFor: "Payments where PayPal acceptance, buyer tools or an existing PayPal balance matter more than the cheapest FX.",
    lessSuitableFor: "Pure international bank transfers chosen mainly on rate.",
    rateModel: "PayPal sets a transaction exchange rate that includes a currency-conversion fee retained by PayPal.",
    feeModel: "Depends on personal or commercial use, funding, receiving market and currency conversion.",
    delivery: "Often immediate to the recipient's PayPal balance, with separate withdrawal timing to a bank.",
    access: "Digital wallet, personal payments, merchant checkout and international services.",
    strengths: ["Very familiar recipient experience", "Fast PayPal-to-PayPal balance movement", "Merchant and purchase ecosystem"],
    weaknesses: ["Conversion margin can be substantial", "Personal and commercial fee rules differ", "A PayPal balance is not the same as money in the recipient's bank"],
    analysis: [
      "PayPal solves an acceptance problem, not just a transfer problem. A recipient may already invoice through PayPal or need its checkout ecosystem. That convenience can justify a higher cost for a commercial payment.",
      "For a straightforward family bank transfer, the pricing deserves close attention. PayPal's own help centre confirms that the transaction exchange rate includes a retained conversion fee. The recipient may then need to withdraw the balance, adding another step.",
      "Our comparison records PayPal as indicative when the number comes from a public comparison rather than a complete transferable quote. It should not be ranked ahead of a verified offer on that basis."
    ],
    comparisonSlugs: ["xoom", "wise", "revolut"],
    sources: [
      { label: "UK consumer fee schedule", publisher: "PayPal", url: "https://www.paypal.com/uk/webapps/mpp/digital-wallet/paypal-consumer-fees" },
      { label: "How PayPal sets its exchange rate", publisher: "PayPal Help", url: "https://www.paypal.com/uk/cshelp/article/where-can-i-find-paypals-currency-calculator-and-exchange-rates-help109" }
    ]
  },
  {
    slug: "xoom",
    name: "Xoom",
    mark: "XM",
    category: "Transfer specialist",
    rating: 3.8,
    verdict: "Xoom adds cash and bank delivery to a PayPal-linked remittance service. The final price depends heavily on how the customer pays and how the recipient collects, so zero-fee examples need reading carefully.",
    bestFor: "PayPal users who need fast bank, debit-card or cash delivery on a supported route.",
    lessSuitableFor: "UK customers expecting every US Xoom route and funding method to be available.",
    rateModel: "A Xoom customer rate that can include a conversion spread.",
    feeModel: "Route, amount, funding method and receive method determine the fee. Some combinations qualify for zero transfer fees.",
    delivery: "Often minutes for eligible card, wallet or cash routes; bank delivery varies.",
    access: "PayPal-linked web and app remittance service, with availability determined by sending country.",
    strengths: ["PayPal account integration", "Several payout methods", "Fast delivery on eligible routes"],
    weaknesses: ["Funding method changes price", "UK availability is narrower than US marketing suggests", "Zero fee does not remove the exchange-rate cost"],
    analysis: [
      "Xoom should be reviewed separately from an ordinary PayPal payment. It is a remittance product with recipient bank, card, wallet and cash options. That gives it a different practical use.",
      "The fee table contains many zero-fee combinations, but the currency conversion still needs checking. Bank funding may be cheaper than a card, and cash delivery may have a different rate from bank deposit.",
      "Our crawler does not publish a result when the bank-funded public quote cannot be reproduced outside the PayPal flow. Customers should compare the final Xoom recipient amount after signing in."
    ],
    comparisonSlugs: ["paypal", "remitly", "westernunion"],
    sources: [
      { label: "Transfer fee conditions", publisher: "Xoom", url: "https://www.xoom.com/legal/xoom-transfer-fees" }
    ]
  },
  {
    slug: "monese",
    name: "Monese",
    mark: "MO",
    category: "Digital account",
    rating: 3.7,
    verdict: "Monese is an account for people living across borders rather than a standalone transfer tool. Any fair price comparison must decide how much of the monthly subscription belongs to the payment.",
    bestFor: "Customers who use the account, card and transfers regularly across the UK and Europe.",
    lessSuitableFor: "A one-off transfer where a subscription or plan allowance adds unnecessary cost.",
    rateModel: "Plan-based currency conversion and transfer pricing shown in the app.",
    feeModel: "Monthly plan and usage charges vary. International transfer allowances and conversion fees depend on plan.",
    delivery: "Account and bank-transfer timing depends on currency and destination.",
    access: "Mobile GBP and euro accounts with cards and international features.",
    strengths: ["Accessible mobile-account proposition", "Useful for cross-border residents", "Account and transfer features together"],
    weaknesses: ["Plan pricing complicates one-transfer comparisons", "Public live quotes are limited", "Coverage is narrower than a global specialist"],
    analysis: [
      "Monese is best understood as an account subscription, not a standalone transfer engine. Someone using its card and account every week may spread the monthly cost across several benefits. Someone sending £200 once cannot.",
      "The transfer review therefore needs the customer's plan and remaining allowance. A no-extra-fee transfer on a paid plan is not economically free, but nor should the entire monthly fee be assigned to one payment for a regular user.",
      "Where no current public quote can be captured, we show Monese as unavailable rather than borrowing a rate from a different plan or date."
    ],
    comparisonSlugs: ["revolut", "wise", "starling"],
    sources: [
      { label: "UK plan pricing", publisher: "Monese", url: "https://www.monese.com/gb/en/pricing" }
    ]
  },
  {
    slug: "skrill",
    name: "Skrill",
    mark: "SK",
    category: "Digital account",
    rating: 3.2,
    verdict: "Skrill remains useful where both sides already use the wallet. Funding and conversion can each carry a charge, which makes a plain bank-transfer specialist the more revealing price comparison.",
    bestFor: "Existing Skrill users and recipients already operating inside the wallet ecosystem.",
    lessSuitableFor: "A plain bank-to-bank international transfer selected on exchange rate.",
    rateModel: "Skrill customer conversion rate with a currency-conversion charge.",
    feeModel: "Depends on wallet funding, transfer type, currency and withdrawal method.",
    delivery: "Fast within the wallet; bank and card withdrawals have separate timing.",
    access: "Digital wallet, merchant payments and money-transfer products in supported markets.",
    strengths: ["Established wallet network", "Fast wallet-to-wallet movement", "Useful in selected online merchant settings"],
    weaknesses: ["Several fee layers can apply", "Wallet receipt is not bank receipt", "Public comparable quotes are limited"],
    analysis: [
      "Skrill can make sense when the money is meant to remain in Skrill or pay a merchant that accepts it. That is different from sending pounds to a foreign bank account.",
      "Currency conversion, funding and withdrawal can each have their own price. The cheapest-looking step may therefore sit inside a more expensive end-to-end path.",
      "Our review gives priority to the amount that reaches the final recipient account. If that amount cannot be reproduced publicly, Skrill remains listed without an invented rate."
    ],
    comparisonSlugs: ["paypal", "wise", "revolut"],
    sources: [
      { label: "UK fee schedule", publisher: "Skrill", url: "https://www.skrill.com/en/siteinformation/fees/" }
    ]
  },
  {
    slug: "profee",
    name: "Profee",
    mark: "PF",
    category: "Transfer specialist",
    rating: 3.9,
    verdict: "Profee can price European card and account routes keenly. Some of those journeys do not match a UK-funded bank transfer, so we compare it only where the sending market and payout method line up.",
    bestFor: "Supported European sending markets and card or bank payouts to Profee destinations.",
    lessSuitableFor: "Customers sending from a market or by a method outside Profee's public quote.",
    rateModel: "Customer exchange rate shown in the calculator, with route-specific economics.",
    feeModel: "Varies by corridor and promotion, with the final amount shown before confirmation.",
    delivery: "Often fast to supported cards and accounts.",
    access: "App and web service in eligible sending countries.",
    strengths: ["Fast digital payout focus", "Competitive selected corridors", "Simple app flow"],
    weaknesses: ["UK and funding availability varies", "Public bank-funded evidence is not always reproducible", "Promotions require separate labelling"],
    analysis: [
      "Profee should be compared where its supported send market, funding method and recipient method match the customer's transfer. A European card quote is not automatically a UK bank-transfer quote.",
      "The company can be competitive on selected remittance routes, but our crawler requires a complete reproducible result. We do not fill gaps with a marketing rate.",
      "Compare the recipient amount with Paysend, TransferGo and the destination specialist, then check whether card funding adds a bank charge."
    ],
    comparisonSlugs: ["paysend", "transfergo", "wise"],
    sources: [
      { label: "Money transfer service", publisher: "Profee", url: "https://www.profee.com/" }
    ]
  },
  {
    slug: "ace",
    name: "ACE Money Transfer",
    mark: "ACE",
    category: "Transfer specialist",
    rating: 3.9,
    verdict: "ACE has useful depth on South Asian remittance routes, where local payout partners matter. Its public calculator often blocks automated collection, so an unproven rate stays off the table.",
    bestFor: "UK family remittances to destinations where ACE has strong local payout coverage.",
    lessSuitableFor: "Readers who need an anonymous proof screenshot before entering the provider flow.",
    rateModel: "Route-specific customer rate, with promotions sometimes applied to new customers.",
    feeModel: "Amount, payment and destination dependent, shown during quote creation.",
    delivery: "Bank, cash and other local methods vary by destination.",
    access: "Website and app for supported sending countries and remittance destinations.",
    strengths: ["Strong corridor specialisation", "Several local payout options", "Relevant to UK migrant communities"],
    weaknesses: ["Automated quote capture can be blocked", "Promotions can distort first comparisons", "Not a general multi-currency account"],
    analysis: [
      "ACE is relevant because a broad global provider may not have the same bank or cash partners in Pakistan and other key remittance destinations. Local depth can improve delivery as well as price.",
      "The public calculator may block automated evidence capture. We treat that as an evidence problem rather than a verdict on the service. The company remains visible and cannot win without proof.",
      "Customers should record the ordinary repeat-customer recipient amount and compare the same bank, cash or wallet payout with Ria, Remitly and Wise."
    ],
    comparisonSlugs: ["ria", "remitly", "wise"],
    sources: [
      { label: "UK money transfer service", publisher: "ACE Money Transfer", url: "https://acemoneytransfer.com/" }
    ]
  },
  {
    slug: "orbitremit",
    name: "OrbitRemit",
    mark: "OR",
    category: "Transfer specialist",
    rating: 3.8,
    verdict: "OrbitRemit is a recognised Australasian specialist and belongs on those regional routes. Its products are far less relevant to a customer funding the transfer from Britain.",
    bestFor: "Transfers originating in Australia or New Zealand on supported destinations.",
    lessSuitableFor: "UK customers assuming the same service and funding options are available.",
    rateModel: "Customer exchange rate shown for the selected route.",
    feeModel: "Country and destination dependent, with the final quote shown before payment.",
    delivery: "Bank-transfer timing depends on funding clearance and the destination network.",
    access: "Web and app service focused on Australia and New Zealand sending markets.",
    strengths: ["Regional focus", "Bank-transfer expertise", "Relevant to Australia and New Zealand corridors"],
    weaknesses: ["Limited UK relevance", "Automated evidence can be blocked", "No cash network comparable with Western Union"],
    analysis: [
      "OrbitRemit belongs on the major-corridor side of this site rather than being forced into every UK table. A provider's licence and sending-market access are part of the product.",
      "Where our evidence capture cannot pass the public verification step, no quote is shown. That prevents an old or reference rate from being presented as today's offer.",
      "Australasian customers should compare OrbitRemit with Wise, Xe and OFX at the same amount and funding method."
    ],
    comparisonSlugs: ["wise", "xe", "ofx"],
    sources: [
      { label: "International transfers", publisher: "OrbitRemit", url: "https://www.orbitremit.com/" }
    ]
  },
  {
    slug: "natwest",
    name: "NatWest",
    mark: "NW",
    category: "Bank",
    rating: 3.4,
    verdict: "NatWest is easy for an existing current-account customer. The exchange rate usually costs more than the visible transfer charge, so convenience should be priced rather than assumed free.",
    bestFor: "Existing NatWest customers prioritising simplicity and an in-bank payment record.",
    lessSuitableFor: "Customers choosing primarily on foreign-currency amount received.",
    rateModel: "NatWest customer rate calculated in Online Banking or the app.",
    feeModel: "Payment and fee option depend on destination and rail. Other banks can deduct Swift charges.",
    delivery: "International bank payment, with local and Swift timing.",
    access: "NatWest personal account through app or Online Banking.",
    strengths: ["No new transfer account", "Integrated fraud checks and payment history", "Broad mainstream banking access"],
    weaknesses: ["Final rate requires the bank flow", "FX margin is embedded", "Specialists often produce more currency"],
    analysis: [
      "NatWest's advantage is that the customer is already verified and funded. That saves setup time but does not reveal whether the rate is competitive.",
      "Enter the same £200 recipient amount in NatWest and a specialist at the same moment. Compare what arrives after the fee option and rate, not only the amount debited.",
      "Our public comparison evidence is marked indicative when it is supplied by a third-party comparison rather than a captured NatWest execution."
    ],
    comparisonSlugs: ["starling", "wise", "rbs"],
    sources: [
      { label: "Making an international payment", publisher: "NatWest", url: "https://www.natwest.com/support-centre/general-banking-information/general/how-do-i-make-an-international-payment-using-mobile-banking.html" }
    ]
  },
  {
    slug: "rbs",
    name: "Royal Bank of Scotland",
    mark: "RBS",
    category: "Bank",
    rating: 3.4,
    verdict: "RBS offers the familiar benefit of paying from an existing bank account. Its useful rate appears inside the authenticated journey, which makes a second specialist quote worth the small faff.",
    bestFor: "Existing RBS customers who value account integration.",
    lessSuitableFor: "A rate-first transfer where a specialist account is practical.",
    rateModel: "Customer exchange rate shown during the international payment flow.",
    feeModel: "Route and payment-option dependent, with possible intermediary deductions.",
    delivery: "Bank transfer through the available local or Swift route.",
    access: "RBS personal and business banking products.",
    strengths: ["Existing banking relationship", "Payment records and account controls", "Mainstream international bank access"],
    weaknesses: ["Rate is not fully public", "Embedded FX cost", "Limited payout choice"],
    analysis: [
      "RBS should be judged using the same method as NatWest: record the bank's live recipient amount, then request a specialist quote before the market moves.",
      "The bank may be convenient for a regulated supplier or property payment, but convenience has a measurable price. The exchange-rate difference usually matters more than the transfer fee.",
      "Indicative comparison data remains labelled and cannot beat a verified public offer on this site."
    ],
    comparisonSlugs: ["natwest", "wise", "starling"],
    sources: [
      { label: "International payments", publisher: "Royal Bank of Scotland", url: "https://www.rbs.co.uk/support-centre/general-banking-information/general/how-do-i-make-an-international-payment.html" }
    ]
  },
  {
    slug: "nationwide",
    name: "Nationwide",
    mark: "NWD",
    category: "Bank",
    rating: 3.4,
    verdict: "Nationwide gives members a familiar bank route, but its published foreign-exchange information is not a completed transfer quote. The amount arriving in the beneficiary account remains the figure to compare.",
    bestFor: "Existing Nationwide members who want a straightforward bank instruction.",
    lessSuitableFor: "Customers comparing specialist rates or requiring cash and wallet payout.",
    rateModel: "Nationwide customer exchange rate applied to the payment conversion.",
    feeModel: "Depends on the international payment method and destination, with possible recipient or correspondent charges.",
    delivery: "International bank transfer subject to currency and banking cut-offs.",
    access: "Eligible Nationwide current accounts.",
    strengths: ["Familiar account relationship", "Simple bank beneficiary workflow", "Published foreign-exchange information"],
    weaknesses: ["Limited public transferable quote", "Embedded exchange-rate margin", "No remittance payout network"],
    analysis: [
      "Nationwide's public rate information can help establish a reference, but the review needs the actual recipient amount in the payment flow. A rate published for a different channel or time is not enough.",
      "The society may be perfectly practical for a small one-off payment. A second quote still takes only minutes and can reveal whether convenience costs pounds or tens of pounds.",
      "We leave the provider visible when no current public quote has been captured, rather than reusing an old comparison."
    ],
    comparisonSlugs: ["wise", "starling", "natwest"],
    sources: [
      { label: "Foreign exchange rates", publisher: "Nationwide", url: "https://www.nationwide.co.uk/help/payments/foreign-exchange-rates/" }
    ]
  },
  {
    slug: "asda",
    name: "Asda Money",
    mark: "AS",
    category: "Transfer specialist",
    rating: 3.2,
    verdict: "Asda Money is a familiar name attached to several partner products. A travel-cash rate is not an international bank transfer, and we refuse to make the two look comparable for the sake of a fuller table.",
    bestFor: "Customers using a currently supported Asda Money partner product after checking its exact terms.",
    lessSuitableFor: "Anyone treating a travel-cash rate as an international transfer rate.",
    rateModel: "Product and partner dependent.",
    feeModel: "Depends on the selected Asda Money product and delivery channel.",
    delivery: "Product dependent.",
    access: "Consumer financial products marketed under Asda Money.",
    strengths: ["Recognisable UK retail brand", "Consumer-facing access", "Useful travel-money context"],
    weaknesses: ["Product scope can change", "Travel cash and bank transfer are different", "No reproducible public transfer quote in our latest check"],
    analysis: [
      "Asda Money appears in some comparison datasets, but the exact product needs naming. A bureau or delivered travel-cash rate is not a bank transfer and should not be inserted into the same league table.",
      "Our site requires a current transferable recipient amount and proof. Until that exists, Asda remains a monitored company rather than a rate winner.",
      "Customers should follow the current product terms and identify the underlying provider before comparing price and protection."
    ],
    comparisonSlugs: ["wise", "revolut", "starling"],
    sources: [
      { label: "Asda Money", publisher: "Asda", url: "https://money.asda.com/" }
    ]
  }
];

export function getProviderReview(slug: string) {
  return providerReviews.find((review) => review.slug === slug);
}
