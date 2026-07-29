export type GuideSection = {
  heading: string;
  paragraphs: string[];
};

export type GuideSource = {
  label: string;
  publisher: string;
  url: string;
};

export type GuideFlow = {
  label: string;
  title: string;
  steps: { title: string; detail: string }[];
  note: string;
};

export type GuideComparison = {
  label: string;
  title: string;
  columns: string[];
  rows: string[][];
  note: string;
};

export type GuideLiveComparison = {
  label: string;
  title: string;
  intro: string;
  slugs: string[];
  note: string;
};

export type GuideProviderBlock = {
  label: string;
  title: string;
  intro: string;
  items: {
    name: string;
    category: string;
    verdict: string;
    facts: { label: string; value: string }[];
    providerSlug?: string;
    linkHref?: string;
    linkLabel?: string;
    tone?: "warning";
  }[];
  note: string;
};

export type GuideNextSteps = {
  label: string;
  title: string;
  items: { eyebrow: string; title: string; description: string; href: string }[];
};

export type Guide = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  standfirst: string;
  readTime: string;
  reviewed: string;
  keyPoint: string;
  series?: "Payment infrastructure";
  flow?: GuideFlow;
  comparison?: GuideComparison;
  liveComparison?: GuideLiveComparison;
  providerBlock?: GuideProviderBlock;
  nextSteps?: GuideNextSteps;
  sections: GuideSection[];
  sources: GuideSource[];
};

export const guides: Guide[] = [
  {
    slug: "best-money-transfer-rates",
    title: "Who Has the Best Money Transfer Rate Today? Four UK Routes Checked",
    shortTitle: "Best money transfer rates",
    description: "Current UK money transfer checks for four popular routes, showing the fee, exchange-rate cost and receipt behind each published result.",
    standfirst: "A company can win pounds to euros and lose pounds to rupees before lunch. Our live board fixes the amount and payment route, then ranks what reaches the recipient rather than the rate printed in large type.",
    readTime: "9 minute read",
    reviewed: "23 July 2026",
    keyPoint: "No company owns the cheapest-rate title. Price the precise route, compare recipient amounts and open the receipt before choosing.",
    liveComparison: {
      label: "LIVE UK RATE BOARD",
      title: "Popular comparisons, pulled from the same evidence as our corridor pages",
      intro: "Each panel reads the newest verified public quotes in our database. Xe remains marked Best Rated; every amount and fee links back to the captured provider screen.",
      slugs: ["uk-to-spain", "uk-to-united-states", "uk-to-india", "uk-to-pakistan"],
      note: "These are live observations, not a permanent ranking. An unavailable or indicative provider stays visible on the full corridor page but cannot be called cheapest. Recheck the provider's final screen before payment."
    },
    sections: [
      {
        heading: "The route matters more than the logo",
        paragraphs: [
          "I have an irritating habit when somebody tells me they found the best exchange rate: I ask which route, how much and what the recipient got. Xe, Wise, Revolut, Remitly and Western Union do not price every corridor alike. One can be sharp for pounds to euros and uncompetitive for pounds to rupees on the same afternoon.",
          "The FCA's worked example is the bit worth pinning to the fridge, because it starts with a £100 transfer. A firm may advertise no fixed fee while converting pounds at 1.26 dollars, even though its reference rate is 1.30. On this quote, $126.10 lands. A provider charging £3 openly at the 1.30 rate produces the same amount. One bill is visible, the other is rate-shaped camouflage, and neither is cheaper.",
          "Our corridor pages therefore rank the recipient amount and keep the screenshot beside it. The calculator above reads those same records rather than copying a marketing rate into an article. Fix £200, choose bank funding and bank deposit, then quote every provider in one short window. Change the payment method or destination and you have started a different race."
        ]
      },
      {
        heading: "The winner has a short shelf life",
        paragraphs: [
          "Sterling never waits for the Bank of England to chalk up a price. Buyers and sellers jostle it around the wholesale market that supplies base rates to banks and transfer firms. BIS dealers reported $9.6 trillion changing hands on an average day in April 2025. That daily river is roughly four years of UK output squeezed between breakfast and bedtime.",
          "Providers also price each route differently. A busy pound-to-euro transfer may use deep currency markets and direct local payment rails. Pounds to Pakistani rupees can depend on a different local partner and more prefunded liquidity. Choose a card and the quote can swell to cover processing costs that a UK bank payment avoids. Cash collection adds shops and physical cash management. This is why a company can win Spain at breakfast and finish fourth for Pakistan after lunch.",
          "Scale changes the answer as well. Here is where a tiny flat fee stops looking tiny: £2.99 takes almost 3% from £100, yet only about 0.15% from £2,000. A broker may quote a tighter margin for £100,000 because the dealing cost is spread across far more money. I would not extrapolate from a holiday-money calculator to a house purchase; that is rate-shopping with the wrong-sized shoes."
        ]
      },
      {
        heading: "Make the checkout screen settle the argument",
        paragraphs: [
          "Start with the transfer you will actually make. Enter the same send amount, currency pair and delivery method on each provider's public quote screen. Use one funding method, since a debit card and a bank transfer are different products. Record the fee separately, but rank the result by the guaranteed recipient amount. If a page gives only an indicative rate, it belongs outside the competitive table until a transferable quote appears.",
          "Quote expiry matters. Wise says most transfers use a guaranteed rate if the money arrives on time, although volatile routes can use a live rate that changes before conversion. Other firms give a short dealing window or ask a dealer to confirm a larger transfer. Keep a timestamped screenshot beside the result. It cannot freeze the market, but it shows exactly what was compared and stops a stale quote from wearing a fresh-date hat.",
          "The bank at the far end may still take a bite. The FCA says intermediary or recipient bank fees can reduce the final amount, and a provider should disclose that risk when it cannot estimate the deduction. Ask whether the quoted recipient amount is guaranteed and whether the beneficiary bank may charge. Delivery time belongs in that conversation too. Two extra pounds can be poor value if rent arrives a day late.",
          "Security gets a veto. Check the trading entity, not just the brand, with the FCA Firm Checker. Authorised payment firms must safeguard customer money, but safeguarding is not the same as FSCS deposit protection. A clone can copy a real firm's name and registration number, so match the website and contact details to the FCA record before sending a large sum. The cheapest fake quote remains 100% expensive."
        ]
      },
      {
        heading: "My rule for a routine £200 payment",
        paragraphs: [
          "For a routine £200 transfer, I would open the relevant corridor, compare at least three fresh verified quotes and select the best recipient amount from a properly checked firm. Wise is often the transparency benchmark because it separates rate and fee. Xe deserves a separate look because its transfer quote can differ from its public currency converter. Remitly, Paysend and Western Union matter on remittance routes where delivery options differ.",
          "The World Bank's latest published global measure puts the average cost of sending a small remittance at 6.36%, or £6.36 on each £100. Its dataset spans hundreds of corridors, so that average hides cheap routes beside painful ones. Your own quote is the decision; the global figure is the reminder that shopping around still has room to pay.",
          "There is no permanent best provider. There is a best documented quote for a stated transfer at a stated moment. Keep the screenshot, read the final confirmation screen and recheck the recipient amount before pressing send. That is less glamorous than discovering a secret rate code, which is unfortunate because I would enjoy owning one, but it is how you find the transfer that costs least."
        ]
      }
    ],
    nextSteps: {
      label: "USE THE DATA",
      title: "Go from a general rule to the route in front of you",
      items: [
        { eyebrow: "Compare", title: "Browse every UK corridor", description: "Open the full provider tables, unavailable results and timestamped proof archive.", href: "/#corridors" },
        { eyebrow: "Audit", title: "Read how a quote qualifies", description: "See why promotional, stale and indicative results cannot win the standard comparison.", href: "/methodology" },
        { eyebrow: "Research", title: "The £2.10 cash penalty", description: "See how cash collection changes the cost of a £200 UK transfer across 33 destinations.", href: "/research/last-mile-tax" }
      ]
    },
    sources: [
      { label: "International payment pricing transparency", publisher: "Financial Conduct Authority", url: "https://www.fca.org.uk/publications/good-and-poor-practice/consumer-duty-international-payment-pricing-transparency-good-poor-practice" },
      { label: "Who sets exchange rates?", publisher: "Bank of England", url: "https://www.bankofengland.co.uk/explainers/who-sets-exchange-rates" },
      { label: "2025 Triennial Central Bank Survey", publisher: "Bank for International Settlements", url: "https://www.bis.org/press/p250930.htm" },
      { label: "Remittance Prices Worldwide", publisher: "World Bank", url: "https://remittanceprices.worldbank.org/" },
      { label: "How live rate transfers work", publisher: "Wise", url: "https://wise.com/help/articles/2978018/how-do-live-rate-transfers-work" },
      { label: "FCA Firm Checker", publisher: "Financial Conduct Authority", url: "https://www.fca.org.uk/consumers/fca-firm-checker" }
    ]
  },
  {
    slug: "what-are-currency-brokers",
    title: "What Does a Currency Broker Actually Do With Your Rate?",
    shortTitle: "Currency brokers compared",
    description: "A named UK currency-broker comparison covering dealer pricing, forward contracts and the difference between an app quote and an executable rate.",
    standfirst: "TorFX and Key Currency put a dealer at the centre of the service. OFX leans towards self-service, while Xe and Currencies Direct mix an online account with human dealing. The shared label hides quite different businesses.",
    readTime: "10 minute read",
    reviewed: "23 July 2026",
    keyPoint: "A broker earns its keep on a large or awkward payment when negotiation or a forward contract has real value. Compare executable recipient amounts, not claims about bank-beating rates.",
    providerBlock: {
      label: "NAMED BROKER DESK",
      title: "What the main UK-facing brokers actually offer",
      intro: "This is a product map, not a fixed ranking. Public terms were checked on 23 July 2026. Broker margins remain quote-specific, so the comparison names what can be verified and flags what cannot.",
      items: [
        {
          name: "TorFX",
          category: "Dealer-led specialist",
          verdict: "Built for customers who want an account manager to handle a property purchase, recurring payment or negotiated large transfer.",
          facts: [
            { label: "Pricing", value: "No separate transfer fee; cost sits in the agreed exchange rate" },
            { label: "Forwards", value: "Rates can be secured up to two years ahead" },
            { label: "Visibility", value: "Executable customer rate follows registration or a dealer quote" }
          ],
          providerSlug: "torfx"
        },
        {
          name: "Xe Money Transfer",
          category: "Hybrid platform and dealer",
          verdict: "Useful when you want a recognisable public rate screen plus support for larger personal transfers or business hedging.",
          facts: [
            { label: "UK entity", value: "HiFX Europe Limited, FCA payment-services registration 462444" },
            { label: "Forwards", value: "Business forwards up to 24 months; terms beyond 12 months need credit approval" },
            { label: "Caveat", value: "The public converter is not automatically the executable transfer quote" }
          ],
          providerSlug: "xe"
        },
        {
          name: "OFX",
          category: "Digital-first broker",
          verdict: "A stronger fit for customers who want an online account and 24-hour support without giving up forward contracts or a dealing desk.",
          facts: [
            { label: "Minimum", value: "£100 for a standard transfer in major currencies" },
            { label: "Forwards", value: "Two days to 12 months; typically from £25,000, with lower amounts considered" },
            { label: "Deposit", value: "A personal forward most often asks for 10%, subject to assessment" }
          ],
          providerSlug: "ofx"
        },
        {
          name: "Key Currency",
          category: "Phone-first specialist",
          verdict: "A personal, dealer-owned process aimed at property, emigration and other high-value transfers rather than small app payments.",
          facts: [
            { label: "UK entity", value: "Key Currency Limited, FCA authorised payment institution 753989" },
            { label: "Pricing", value: "No public rate card; the dealer supplies the customer quote" },
            { label: "Tools", value: "Spot, regular payments, rate alerts and forward contracts" }
          ],
          providerSlug: "keycurrency"
        },
        {
          name: "Currencies Direct",
          category: "Platform plus dealing desk",
          verdict: "A long-running hybrid with an online account, dealer support and hedging tools for personal and business customers.",
          facts: [
            { label: "UK entity", value: "Currencies Direct Limited, FCA electronic money institution 900669" },
            { label: "Forwards", value: "Major currencies up to two years; booked through the dealing desk" },
            { label: "Visibility", value: "Rates and transfers are available after account access" }
          ],
          providerSlug: "currenciesdirect"
        },
        {
          name: "Halo Financial",
          category: "Not available",
          verdict: "Halo entered special administration on 29 May 2026. It cannot be treated as a current broker option or accept new transfer funds.",
          facts: [
            { label: "FCA notice", value: "Published 1 June 2026" },
            { label: "Position", value: "Special administrators are managing customer claims and fund returns" },
            { label: "Lesson", value: "Authorisation is a live status check, not a lifetime badge" }
          ],
          linkHref: "https://www.fca.org.uk/news/news-stories/halo-financial-limited-enters-administration",
          linkLabel: "Read the FCA notice",
          tone: "warning"
        }
      ],
      note: "Wise and Revolut are important alternatives but are not dealer-led currency brokers in the traditional UK sense. Their self-service model is often better for a routine £200 payment. Halo is included because removing a failed provider from history would hide the most useful due-diligence lesson."
    },
    sections: [
      {
        heading: "Five brokers, several rather different services",
        paragraphs: [
          "TorFX and Key Currency are dealer-led. You register, speak to an account manager and receive a rate for the amount and date. OFX pushes more work into an online account but keeps phone support and hedging tools. Xe and Currencies Direct combine self-service screens with dealing teams. Calling all five brokers conceals the real decision: how much human ownership is useful?",
          "The dealer's useful job is execution. They agree the amount, confirm a rate, collect pounds and arrange the beneficiary payment. The same desk may book a limit order or forward contract. A good dealer can also anticipate proof-of-funds questions on a property completion. No dealer knows next Tuesday's pound price, however. Market commentary can explain risk; it cannot turn a forecast into a fact.",
          "The legal descriptions differ. TorFX and Currencies Direct describe themselves as electronic money institutions. Key Currency is an authorised payment institution. Xe's UK transfer service is provided by HiFX Europe Limited. Check the entity on the FCA register before funding a trade. Halo's 2026 administration is the reminder that an old authorisation number does not settle today's safety question."
        ]
      },
      {
        heading: "Your quote starts in the wholesale market",
        paragraphs: [
          "The Bank of England does not pin sterling to a board each morning. Supply and demand in the foreign exchange market set the pound's wholesale price, and retail firms use those trades as their starting point. By the BIS count, $9.6 trillion was traded daily in April 2025. A broker quoting £250,000 into euros is dipping a cup into a river that does not stop moving for the brochure.",
          "The customer rate normally includes a margin from that wholesale level. On £100,000, a 0.5% margin costs £500 before any separate fee. A 1.5% margin costs £1,500, equal to ten £150 solicitor appointments. Brokers may narrow their margin for larger deals because the fixed work is spread across more money, although the exact pricing is commercial and rarely published as a neat tariff.",
          "Currency pair matters. Pounds and euros trade heavily, banks compete to make prices and hedging is easy to find. A restricted or lightly traded currency may need another currency in the middle, a local bank and money held ready for payout. Each extra handoff adds cost or risk. Calling every difference a rip-off misses the plumbing; pretending the plumbing excuses hidden charges misses the customer."
        ]
      },
      {
        heading: "Why the dealer will not hold the rate all afternoon",
        paragraphs: [
          "A broker can hold a rate only by accepting market risk or covering the trade elsewhere. During a calm market it may leave an online quote open for seconds or minutes. A sharp political announcement can move sterling before the customer finishes typing bank details. Fixed public rates would force the broker to build in a wide safety cushion, rather like a taxi charging every passenger for the worst traffic day of the year.",
          "Route costs also move independently of the pound. Local partners revise fees, banks change cut-off times and compliance teams may need more documents for a payment that does not match the customer's normal pattern. Funding method matters because card acceptance carries a different bill from a UK bank transfer. Even two customers buying euros at the same moment can receive different all-in prices when one sends £2,000 and the other sends £200,000.",
          "A fixed rate does exist once both sides book a spot contract. When the firm covers that trade, the customer owes the agreed money; walking away later can therefore leave a loss. A forward contract fixes a rate for later delivery, but its price also reflects the two currencies' interest rates rather than today's spot number copied forward. I cover that machinery separately in the forward guide because it deserves more than a jargon-sized footnote.",
          "Public calculators are useful evidence, not a promise of dealer pricing. Save the amount received as well as the displayed rate, since two brokers can use different ways to present the same cost. On a six-figure trade, ask whether the quoted margin changes once the dealer has your exact amount and settlement date."
        ]
      },
      {
        heading: "A useful dealer call ends with a number",
        paragraphs: [
          "Give TorFX, OFX or another shortlisted broker the same source amount, destination and settlement date. Ask how much currency will arrive after charges, how long the figure is firm and whether an intermediary bank may deduct more. Request the competing quote within a few minutes. A claim about saving against a bank's standard rate is not a comparison; it is sales upholstery.",
          "The awkward failure question belongs on the list too: where is my money held, and what happens if your company goes under? FCA safeguarding rules usually mean relevant customer funds sit apart from the firm's own cash, or are covered by insurance. That arrangement is different from an ordinary bank deposit protected by the FSCS. Ask the broker to name its authorised entity, then verify it independently instead of using the link in an unexpected email.",
          "I would use a broker when the amount is large enough for negotiation, the payment has moving parts or I want a forward explained by the person booking it. For a £200 remittance, open the relevant live corridor first. Wise, Xe, Remitly or another automated provider may be quicker and cheaper. For £200,000 towards a Spanish property, I would add at least two dealer quotes and make each firm spell out the received euros."
        ]
      }
    ],
    nextSteps: {
      label: "MAKE IT SPECIFIC",
      title: "Choose the next page by the problem you are solving",
      items: [
        { eyebrow: "Large transfer", title: "Should you wait for a better rate?", description: "Use the €300,000 property example to separate a budget decision from a currency bet.", href: "/guides/should-you-time-a-currency-transfer" },
        { eyebrow: "Hedging", title: "Compare forward contract terms", description: "See actual durations, deposits and cancellation risks from TorFX, Xe, OFX and Currencies Direct.", href: "/guides/forward-contracts" },
        { eyebrow: "Live price", title: "Check a UK corridor", description: "For a routine transfer, start with current provider quotes and the stored evidence screen.", href: "/#corridors" }
      ]
    },
    sources: [
      { label: "Who sets exchange rates?", publisher: "Bank of England", url: "https://www.bankofengland.co.uk/explainers/who-sets-exchange-rates" },
      { label: "Global FX turnover in April 2025", publisher: "Bank for International Settlements", url: "https://www.bis.org/press/p250930.htm" },
      { label: "Using payment service providers", publisher: "Financial Conduct Authority", url: "https://www.fca.org.uk/consumers/using-payment-service-providers" },
      { label: "The interbank rate in currency converter tools", publisher: "Financial Conduct Authority", url: "https://www.fca.org.uk/news/statements/use-interbank-rate-online-currency-converter-tools" },
      { label: "How to check a financial firm", publisher: "Financial Conduct Authority", url: "https://www.fca.org.uk/consumers/how-check-firm-individual-authorised" },
      { label: "How a forward rate is calculated", publisher: "OFX UK", url: "https://www.ofx.com/en-gb/faqs/how-is-a-forward-contract-rate-calculated/" },
      { label: "About TorFX and its UK service", publisher: "TorFX", url: "https://www.torfx.com/about-us" },
      { label: "United Kingdom regulatory information", publisher: "Xe", url: "https://help.xe.com/hc/en-gb/articles/360020236157-United-Kingdom-UK-Regulatory-Information" },
      { label: "Key Currency company and regulatory details", publisher: "Key Currency", url: "https://www.keycurrency.co.uk/find-out-more-about-us/" },
      { label: "Forward contracts", publisher: "Currencies Direct", url: "https://www.currenciesdirect.com/en-gb/forward-contracts" },
      { label: "Halo Financial enters special administration", publisher: "Financial Conduct Authority", url: "https://www.fca.org.uk/news/news-stories/halo-financial-limited-enters-administration" }
    ]
  },
  {
    slug: "should-you-time-a-currency-transfer",
    title: "Should You Wait for a Better Exchange Rate on a Large Transfer?",
    shortTitle: "Should you time a transfer?",
    description: "A pounds-and-pence guide to timing a large currency transfer, with staged payments and a budget rule for property or business costs.",
    standfirst: "A better pound can save thousands on a property purchase. Waiting can add the same amount to the bill. The decision begins with the payment deadline and the rate your budget can survive, not the latest economist forecast.",
    readTime: "8 minute read",
    reviewed: "23 July 2026",
    keyPoint: "A known foreign-currency bill is already a liability. Protect the affordable outcome and leave money exposed only if a worse rate will not damage the purchase.",
    comparison: {
      label: "€300,000 PROPERTY TEST",
      title: "A three-cent move changes the sterling bill by thousands",
      columns: ["GBP/EUR rate", "Sterling needed", "Change from €1.18"],
      rows: [
        ["€1.22", "£245,902", "£8,335 less"],
        ["€1.18", "£254,237", "Starting case"],
        ["€1.15", "£260,870", "£6,633 more"]
      ],
      note: "Simple division using a fixed €300,000 liability. Provider margins and fees would increase the sterling cost, so compare an executable broker quote rather than the market rate alone."
    },
    sections: [
      {
        heading: "Refreshing the rate is still a market bet",
        paragraphs: [
          "A reader with a €300,000 house payment does not need much currency movement to feel clever or ill. At an executable rate of €1.18 to the pound, that bill comes to about £254,237. Let the rate slip to €1.15 and it becomes roughly £260,870: £6,633 more. Refreshing the pound chart soon feels like useful work.",
          "I understand the temptation. The trouble is that the house creates a euro liability with a date, while the buyer earns or holds pounds. Leaving the money unconverted is an open currency position whether or not anyone calls it trading. You are betting that sterling will strengthen before completion, and the market does not waive the loss because the original motive was a sensible property purchase.",
          "There is a second trap: the remembered high. People anchor on a rate they saw last month and treat its return as normal. ONS records show how far an old favourite can recede. The change is sobering on paper: the annual GBP/USD average sat near $2.00 in 2007 but only $1.36 in 2016. Against yen, the annual average fell from about 236 to 147 over the same span. Markets can stay far away from an old favourite longer than a completion chain can wait."
        ]
      },
      {
        heading: "Forecasts describe risks; they do not pay the bill",
        paragraphs: [
          "Exchange rates respond to interest expectations, inflation news, elections and flows from investors who are reacting to all of those at once. Researchers do find pockets of predictability. A BIS study found commodity prices improved forecasts for several commodity-exporting currencies over horizons up to two months. IMF researchers reached a related result with data through 2024: medium-term patterns beat a random-walk benchmark for nine currencies.",
          "Neither result gives a UK homebuyer a reliable day to press send. A model can outperform a naive benchmark across many observations while being wrong on the particular week that matters to you. Forecasts also get absorbed into prices as traders act. If a widely expected Bank of England cut is already in sterling, reading the same forecast on Thursday is not an information edge; it is reheated market soup.",
          "Professional dealers manage that uncertainty with limits and hedges, not heroic confidence. Do not start by deciding that the pound feels cheap. Ask what happens to the plan if it becomes 3% cheaper. On a £250,000 conversion, that adverse move is £7,500, comparable with several months of UK take-home pay. If that breaks the purchase budget, waiting with the whole amount is a poor fit."
        ]
      },
      {
        heading: "Set the rule while the budget still works",
        paragraphs: [
          "Set a budget rate first. Work backwards from the maximum sterling cost you can afford, including property charges or supplier costs. If today's executable quote clears that level with room to spare, converting at least the protected amount solves the financial problem. You may later watch the market improve and feel annoyed, but regret is not the same as a bad risk decision.",
          "Staging earns its keep where the date can bend and the budget has breathing room. Converting one quarter now, another quarter on set dates and the balance before the deadline produces an average of several market levels. It cannot deliver the single best day. It also avoids staking the whole payment on the worst one. I prefer calendar-based tranches to improvised targets because a target can leave the entire sum exposed when sterling never reaches it.",
          "A forward contract can lock a rate for a later date, while a spot transfer converts now. Some people hedge only the non-negotiable part and leave a smaller amount open. A business expecting uncertain euro revenue might use a similar split. The unhedged slice should be money the plan can tolerate moving, not the amount somebody hopes will pay for the kitchen.",
          "Limit orders need care. They instruct a provider to trade if the market reaches a target, but the rate may never appear and fast markets can behave differently around the trigger. Ask whether the instruction binds you immediately and when it expires. Cancellation deserves a plain answer too. An alert is gentler: it tells you the level arrived without committing the money while you are asleep."
        ]
      },
      {
        heading: "The timing rule I would use",
        paragraphs: [
          "When a payment is necessary and dated, I would not risk all of it on a currency view. I would secure the amount required to keep the plan affordable, compare the provider margin separately and write down the rule for any remainder. The saved provider fee is certain. The hoped-for market gain is not, which is why rate comparison deserves attention before amateur macro forecasting.",
          "Before any money moves, run the provider's legal name through the FCA checker and read what the product commits you to. A normal international payment and a speculative leveraged forex account are not the same thing. The FCA warns that unauthorised forex firms and clone websites target people searching online, sometimes using the details of a real regulated business. Never let a persuasive rate forecast hurry identity checks on a six-figure transfer.",
          "Waiting is reasonable when there is no firm liability, no damaging deadline and the downside fits comfortably inside your budget. Once the payment date matters, timing becomes risk management. Pick the rate that preserves the real-world purchase, even if next week's chart later shows that a luckier answer existed."
        ]
      }
    ],
    nextSteps: {
      label: "TURN THE VIEW INTO A PLAN",
      title: "Price the transfer, then decide what must be protected",
      items: [
        { eyebrow: "Provider quotes", title: "Compare currency brokers by name", description: "See which firms are dealer-led, which publish rates and which offer forward contracts.", href: "/guides/what-are-currency-brokers" },
        { eyebrow: "Hedge", title: "Read the forward contract worked example", description: "See what happens to a €200,000 purchase when the pound rises, falls or the deal collapses.", href: "/guides/forward-contracts" },
        { eyebrow: "Current price", title: "Open UK to Spain", description: "Check today's public GBP to EUR provider evidence before asking a broker for a large-transfer quote.", href: "/uk-to-spain/" }
      ]
    },
    sources: [
      { label: "Average sterling exchange rate: US dollar", publisher: "Office for National Statistics", url: "https://www.ons.gov.uk/economy/nationalaccounts/balanceofpayments/timeseries/auss/diop" },
      { label: "Average sterling exchange rate: Japanese yen", publisher: "Office for National Statistics", url: "https://www.ons.gov.uk/economy/nationalaccounts/balanceofpayments/timeseries/ajfo" },
      { label: "When the walk is not random", publisher: "Bank for International Settlements", url: "https://www.bis.org/publ/work551.htm" },
      { label: "Reconciling random walks and predictability", publisher: "International Monetary Fund", url: "https://www.imf.org/en/publications/wp/issues/2024/12/14/reconciling-random-walks-and-predictability-a-dual-component-model-of-exchange-rate-dynamics-559469" },
      { label: "Forex trading scams", publisher: "Financial Conduct Authority", url: "https://www.fca.org.uk/consumers/forex-trading-scams" },
      { label: "FCA Firm Checker", publisher: "Financial Conduct Authority", url: "https://www.fca.org.uk/consumers/fca-firm-checker" }
    ]
  },
  {
    slug: "forward-contracts",
    title: "Currency Forward Contracts: The Rate Is Fixed, and So Is the Obligation",
    shortTitle: "How forward contracts work",
    description: "Compare UK currency-forward terms through a €200,000 property example, including deposits, margin calls and the cost of cancellation.",
    standfirst: "A two-year booking window sounds reassuring. The contract underneath matters more: the rate is binding, a deposit may be due and cancelling after the market moves can produce a bill with no property attached.",
    readTime: "10 minute read",
    reviewed: "23 July 2026",
    keyPoint: "Use a forward for a known future payment when the budget cannot tolerate a worse rate. A guessed amount or uncertain completion date is poor material for a binding contract.",
    comparison: {
      label: "PUBLISHED UK TERMS",
      title: "Four forward-contract offers are not the same product",
      columns: ["Provider", "Published horizon", "Amount or deposit", "How it is arranged"],
      rows: [
        ["TorFX", "Up to two years", "Confirmed in the individual quote", "Account manager or dealing team"],
        ["Xe", "Business: up to 24 months", "Margin percentage; credit approval can apply", "Business account; some personal accounts also show a value-date option"],
        ["OFX", "Two days to 12 months", "Typically from £25,000; personal deposit most often 10%", "Phone with an OFXpert; approval required"],
        ["Currencies Direct", "Up to two years", "Terms confirmed by the dealer", "All forwards booked with the dealing desk"]
      ],
      note: "Provider pages checked 23 July 2026. This compares published access terms, not rates. The forward rate and collateral requirement are customer-specific and must be confirmed before booking."
    },
    sections: [
      {
        heading: "The comforting rate comes with a real obligation",
        paragraphs: [
          "A forward contract is often introduced as a way to lock today's exchange rate for later. That shorthand misses something important. You agree today to buy one currency and sell another on a future date at a stated forward rate. Interest-rate differences shift the spot starting point, then the provider applies its margin. It is not today's screen rate stored in a drawer.",
          "Suppose a UK buyer owes €200,000 in six months. A forward rate of 1.16 euros per pound fixes the sterling cost at about £172,414 before any stated charge. If the spot rate is 1.10, the contract has kept roughly £9,404 inside the buyer's budget compared with converting then. If spot reaches 1.22, the buyer still settles at 1.16 and forgoes an improvement of about £8,480.",
          "That is not product failure; certainty was the purchase. A forward resembles budget insurance without an insurance payout: the benefit is knowing the sterling bill. Anyone promising protection from bad moves plus full benefit from good ones is describing an option, with a different cost."
        ]
      },
      {
        heading: "What the broker does after you agree",
        paragraphs: [
          "The provider confirms the currencies, amount and maturity date before stating the rate. Acceptance is the click that matters: once the customer says yes, the deal binds both sides. The provider may hedge it in the wholesale market, which explains why changing your mind is not the same as cancelling a restaurant table. The bought currency already exists economically, even if no euros have reached the estate agent yet.",
          "Brokers commonly want part of the sold currency up front. OFX says a personal contract most often requires 10%, although the figure can vary with duration and assessment. On a £172,414 obligation, that portion ties up about £17,241 until settlement, around half a year's gross pay for a full-time worker earning £34,500. Xe describes the equivalent as a margin percentage. TorFX and Currencies Direct confirm the requirement in the individual deal.",
          "A large adverse market move can create mark-to-market exposure, the current cost of replacing the contract. The provider may ask for more collateral under its terms. That is the margin-call-shaped detail that glossy explanations tend to whisper. Read when extra funds can be requested, how quickly they must arrive and what the firm can do if they do not.",
          "Settlement requires the remaining currency by the maturity date. Some contracts allow a window, partial drawdown or early delivery; others use one fixed day. Those features are not automatic. OFX's UK terms let a customer request an earlier date or extension, but approval sits with the provider and the price can change."
        ]
      },
      {
        heading: "A collapsed purchase can leave a currency loss",
        paragraphs: [
          "A house purchase can collapse. A supplier contract can shrink. The forward remains a contract even when the reason for booking it disappears. To close it, the provider reverses the currency position at the current market rate. If that creates a loss, the customer normally owes it plus relevant costs. Arithmetic is plain; the consequences can become painfully personal. OFX calls this a reversal loss and says any gain on cancellation is not paid to the customer under its UK terms.",
          "Imagine the €200,000 property deal fails after sterling weakens. The broker must unwind euros that are now more valuable in pound terms, so a five-figure bill is possible even though no house changed hands. The deposit may cover part of that amount rather than return intact. This is why I would never hedge the aspirational top of a property budget before the purchase and financing were genuinely firm.",
          "Counterparty details matter too. Check the legal entity and its FCA permissions for the service and product. The FCA notes that a future currency contract may require investment permissions unless an exclusion applies. Ask how customer money is safeguarded, since payment-firm safeguarding differs from FSCS protection on a bank deposit. A long contract creates more time for both market and company risk to matter."
        ]
      },
      {
        heading: "The cases where certainty is worth paying for",
        paragraphs: [
          "A forward fits a known foreign-currency bill with a reasonably firm amount and date. Overseas property completion, contracted school fees and an agreed business purchase are common examples. The budget should value certainty more than the chance of a better rate. Hedging part of the amount can suit a bill that is likely but not perfectly fixed, provided the uncovered part would remain affordable after a poor move.",
          "It fits badly when the transaction may vanish, the amount is speculative or the customer needs easy cancellation. Small routine remittances rarely justify the paperwork. A person who merely thinks sterling will fall is making a market trade rather than protecting a payment; the contract mechanics may look identical, but the financial reason is not.",
          "Before booking, get the all-in forward rate from at least two checked providers. TorFX and Currencies Direct can quote two-year horizons, while OFX publishes a shorter 12-month limit and more detail on its typical starting amount. Ask each one about the initial deposit, possible further margin and delivery flexibility. The best forward is not the one that later beats the market. It is the contract that keeps a necessary payment inside budget without creating a second risk you cannot fund.",
          "Keep the confirmation and dealing call record too. Six months later, memory is a poor substitute for the agreed maturity terms."
        ]
      }
    ],
    nextSteps: {
      label: "BEFORE YOU BOOK",
      title: "Check the liability, the provider and the live spot alternative",
      items: [
        { eyebrow: "Decision", title: "Should you hedge or wait?", description: "Use the €300,000 rate table to decide how much of the payment your budget can leave exposed.", href: "/guides/should-you-time-a-currency-transfer" },
        { eyebrow: "Provider", title: "Compare five UK-facing brokers", description: "See service models, regulatory entities, live-rate visibility and the current Halo warning.", href: "/guides/what-are-currency-brokers" },
        { eyebrow: "Spot benchmark", title: "Open UK to Spain rates", description: "Use the current public GBP to EUR quotes as a reference before requesting dealer prices.", href: "/uk-to-spain/" }
      ]
    },
    sources: [
      { label: "OFX UK terms and conditions", publisher: "OFX UK", url: "https://www.ofx.com/en-gb/legal/terms-and-conditions/" },
      { label: "Forward contract advance payments", publisher: "OFX UK", url: "https://www.ofx.com/en-gb/faqs/do-i-need-to-pay-upfront-when-i-book-a-forward-contract/" },
      { label: "Cancelling a forward contract", publisher: "OFX UK", url: "https://www.ofx.com/en-gb/faqs/what-if-i-no-longer-need-the-forward-contract/" },
      { label: "How a forward rate is calculated", publisher: "OFX UK", url: "https://www.ofx.com/en-gb/faqs/how-is-a-forward-contract-rate-calculated/" },
      { label: "Forward contracts for business payments", publisher: "Xe", url: "https://www.xe.com/en-gb/business/forwards/" },
      { label: "Forward contract tools", publisher: "TorFX", url: "https://www.torfx.com/" },
      { label: "Forward contracts", publisher: "Currencies Direct", url: "https://www.currenciesdirect.com/en-gb/forward-contracts" },
      { label: "Information for customers of Premier FX", publisher: "Financial Conduct Authority", url: "https://www.fca.org.uk/news/statements/information-customers-premier-fx-limited" }
    ]
  },
  {
    slug: "evolution-of-money-transfer-companies",
    title: "From the Agent Counter to Wise: Thirty Years of Money Transfer",
    shortTitle: "Money transfers since the 1990s",
    description: "How the industry moved from 1990s cash counters to apps and local payment networks, including the stubborn costs technology did not remove.",
    standfirst: "The customer journey moved from a paper form to a live quote in a pocket. The money still has to be converted and checked, then delivered through a local system that may have changed rather less.",
    readTime: "8 minute read",
    reviewed: "23 July 2026",
    keyPoint: "Technology removed queues and much of the paperwork. It did not create one worldwide payment rail, so modern providers compete through local access and clearer prices.",
    comparison: {
      label: "35-YEAR INDUSTRY MAP",
      title: "Each wave changed a different part of the transfer",
      columns: ["Period", "Named examples", "What changed", "What remained"],
      rows: [
        ["1990s", "Western Union, MoneyGram, bank wires", "Agent networks and correspondent-bank reach", "Paper forms, opaque FX margins and cash handling"],
        ["1999 to 2008", "PayPal, online remittance portals", "The web became the sending counter", "Settlement still depended on banks and local payout partners"],
        ["2008 to 2015", "Faster Payments, Wise, CurrencyFair", "Local collection and payout made price and speed easier to compare", "Liquidity and compliance stayed behind the screen"],
        ["2015 to 2026", "Revolut, Currencycloud, open banking", "Multi-currency apps, embedded infrastructure and bank-to-bank funding", "There is still no single global retail payment rail"]
      ],
      note: "The dates mark product waves, not neat handovers. Cash agents, correspondent banking, local payout and mobile apps all operate at the same time because recipients need different forms of access."
    },
    sections: [
      {
        heading: "In the 1990s, the counter was the product",
        paragraphs: [
          "A cross-border transfer in the early 1990s often began with cash, a paper form and a trip to an agent. The customer paid for access to a physical network as much as for currency conversion. Jamaica provides a neat scale marker for Western Union: its 1990 partnership received money from four countries. Twenty-five years later, the network received transfers from 126.",
          "Swift dates the beginning of its story to 1973. Four years on, its network gave banks a common language for payment instructions. It did not move customer money by itself; correspondent banks held accounts with each other and settled the instructions. The distinction matters because people often call any international bank payment a SWIFT transfer, rather as every vacuum cleaner briefly became a Hoover.",
          "Retail customers rarely saw the plumbing or its price. A sending fee appeared on the receipt, while the exchange-rate margin sat inside the conversion. Intermediary banks could deduct more on the way. Several days could pass before the recipient made the trip to an agent, identification in hand. Physical cash delivery solved a real access problem, though shops, security and ready cash made it costly to run."
        ]
      },
      {
        heading: "The web removed the trip into town",
        paragraphs: [
          "An email address becoming a payment identity was PayPal's small but consequential trick. Its early figures are almost quaint: 12,000 accounts and $235,000 of payment volume by the end of 1999. Six years later, the account count was above 100 million; payment volume had passed $27 billion, about 115,000 times the first-year total. It mostly served commerce, but taught customers to expect money movement on a screen.",
          "Money transfer companies put web forms in front of older networks, which removed the journey to a counter for the sender. The deeper change arrived when providers started collecting and paying out through domestic bank systems. Instead of pushing every transfer along one chain of correspondent accounts, a firm could accept pounds in Britain and release locally held rupees in India. Matching flows and prefunding accounts cut time, although the balance-sheet work stayed backstage.",
          "Once Faster Payments arrived in 2008, the first domestic leg could feel immediate to a UK customer. Wise followed in 2011 with a model built around local transfers and a separately disclosed fee at the mid-market rate. Its founders' original problem was wonderfully ordinary: one earned euros in London while the other needed euros for an Estonian mortgage. The private swap became a regulated payment business."
        ]
      },
      {
        heading: "The phone made poor pricing harder to hide",
        paragraphs: [
          "Smartphones put onboarding, identity checks and tracking into one pocket. Customers could photograph a passport, fund by bank or card and see an estimated arrival time. Then came a convenience: no call to an agent, just a notification in your pocket. Digital firms also made the recipient amount visible before confirmation, which exposed the old zero-fee trick: a transfer can have no separate charge and still carry an expensive exchange rate.",
          "Open banking improved the UK funding step after its 2018 launch. It replaced the familiar fiddle with a bank approval screen: no retyping card details and no copying bank information. Open Banking Limited counted more than 16.5 million live user connections by January 2026, alongside almost 33 million payments in November 2025. Put another way, one month of open-banking payments was equivalent to roughly half the UK's adult population making a payment.",
          "Yet the phone does not erase the last mile. A bank deposit in France can run over connected account systems; cash collected in rural Sierra Leone needs an agent and local liquidity. Compliance rules differ, operating hours do not line up and some currencies are hard to source. The Financial Stability Board still described high cost, low speed and limited transparency as global problems in 2020, not relics from a fax-machine museum."
        ]
      },
      {
        heading: "The transfer improved; the old costs did not vanish",
        paragraphs: [
          "The World Bank now records prices across 377 corridors, while public calculators can refresh in seconds. Our own rate monitor adds the missing receipt: a screenshot of the provider quote with amount, route and time. In the 1990s, a customer could keep the paper slip; today the evidence can be compared across firms and stored before the quote disappears.",
          "Competition also blurred the categories. Banks offer app transfers, remittance brands fund digital wallets and currency brokers provide automated dealing beside a human desk. Some technology firms supply their payment network to banks instead of competing only for the end customer. The visible brand may own the relationship while another regulated company executes part of the payment, so reading the legal footer has become oddly useful.",
          "Progress has limits. The FSB's 2025 review found that policy work had not yet produced clear global gains for end users, and average costs remained sticky even as remittance speed improved. The thinning of the bank network was substantial too. BIS counted about one quarter fewer correspondent-banking relationships in 2020 than in 2011. Fewer links can simplify networks in some places and reduce access in others.",
          "I expect the next chapter to be quieter than the app revolution: payment systems linked directly, better data travelling with each transfer and currency conversion placed nearer settlement. The BIS has tested that shape in Project Rialto. How much arrives? Thirty-five years of technology has made that answer faster to obtain and harder to hide, which may be the most useful change of all."
        ]
      }
    ],
    nextSteps: {
      label: "FOLLOW THE MODERN STACK",
      title: "The history makes more sense when you open the machinery",
      items: [
        { eyebrow: "Routing", title: "How a transfer is routed", description: "Follow a customer instruction through collection, FX, compliance, liquidity and local payout.", href: "/guides/international-money-transfer-routing" },
        { eyebrow: "Networks", title: "How Wise and Revolut differ", description: "Compare local account networks, bank partners, balances and the role of cards beneath similar apps.", href: "/guides/wise-vs-revolut-infrastructure" },
        { eyebrow: "Embedded finance", title: "What Currencycloud supplies", description: "See why the brand facing the customer may not own every account, ledger or payment connection.", href: "/guides/currencycloud-network-explained" }
      ]
    },
    sources: [
      { label: "About Swift", publisher: "Swift", url: "https://www.swift.com/about-us" },
      { label: "Western Union and GraceKennedy mark 25 years", publisher: "Western Union", url: "https://ir.westernunion.com/news/archived-press-releases/press-release-details/2015/Western-Union-and-GraceKennedy-Celebrate-25-Years-in-Jamaica-with-Expansion-Plans/default.aspx" },
      { label: "PayPal passes 100 million accounts", publisher: "PayPal", url: "https://newsroom.paypal-corp.com/2006-02-13-PayPal-Surpasses-100-Million-Account-Mark" },
      { label: "The Wise story", publisher: "Wise", url: "https://wise.com/us/about/our-story" },
      { label: "Eight years of UK open banking", publisher: "Open Banking Limited", url: "https://www.openbanking.org.uk/news/open-banking-limited-marks-8-years-of-transforming-the-uks-financial-landscape/" },
      { label: "Cross-border payments progress report 2025", publisher: "Financial Stability Board", url: "https://www.fsb.org/2025/10/g20-roadmap-for-cross-border-payments-consolidated-progress-report-for-2025/" },
      { label: "Correspondent banking trends", publisher: "Bank for International Settlements", url: "https://www.bis.org/press/p211213.htm" },
      { label: "Project Rialto", publisher: "Bank for International Settlements", url: "https://www.bis.org/about/bisih/topics/cbdc/rialto.htm" }
    ]
  },
  {
    slug: "international-money-transfer-routing",
    title: "Where Does an International Transfer Actually Go?",
    shortTitle: "How international transfers are routed",
    description: "Follow an international payment through provider ledgers, local accounts and correspondent banks to see what creates the price and delay.",
    standfirst: "The app shows one neat arrow. Behind it sit separate jobs: collecting the pounds, checking the payment and finding money to pay out locally. Two providers can sell the same currency pair while using rather different routes.",
    readTime: "8 minute read",
    reviewed: "22 July 2026",
    keyPoint: "A provider may collect pounds in Britain and pay the beneficiary from money already held abroad. The service crosses a border even when both bank payments are domestic.",
    series: "Payment infrastructure",
    flow: {
      label: "ROUTE MAP",
      title: "One £200 transfer, five operational jobs",
      steps: [
        { title: "Fund", detail: "GBP reaches the provider by bank payment or card." },
        { title: "Screen", detail: "Names, account data and payment purpose are checked." },
        { title: "Convert", detail: "The provider prices GBP against the destination currency." },
        { title: "Instruct", detail: "A ledger and payment message tell the next system what to do." },
        { title: "Settle", detail: "The recipient bank is credited through a local rail or correspondents." }
      ],
      note: "The stages can overlap. An instant recipient credit may be funded from a balance the provider positioned earlier."
    },
    sections: [
      {
        heading: "The pound often stays in Britain",
        paragraphs: [
          "Picture a £200 transfer from Manchester to a family account in Mumbai. The tempting story is that pounds leave one bank, travel through the internet and emerge as rupees. Banking ledgers do something less cinematic. Institutions debit one account and credit another, then reconcile the promises between them.",
          "A specialist provider can receive the £200 through Faster Payments in Britain. Its Indian operation or payout partner may already hold rupees in a local account. Once the checks pass, that account sends a domestic payment to the recipient. Customer value crossed the border, but neither retail bank leg needed to do so.",
          "The provider must eventually rebalance those pools. GBP builds up on one side while INR runs down on the other. Treasury staff forecast demand, trade currency and move wholesale funds when necessary. The quiet skill is keeping enough money in the right place without leaving expensive piles idle."
        ]
      },
      {
        heading: "Correspondent banking remains the useful fallback",
        paragraphs: [
          "Local payout is not available for every currency, amount or recipient. A British bank without its own destination account can borrow another bank's reach. That arrangement is correspondent banking: institutions keep accounts for one another. Another bank can join the chain if the first pair lack a direct relationship.",
          "Swift usually carries the instruction. It does not hold the customer funds or operate the banks' accounts. The actual settlement appears as updates to nostro and vostro balances, names for the same correspondent account viewed from opposite sides. Each extra bank gets another chance to screen the payment, miss a cut-off or take a deduction.",
          "That does not make correspondent banking obsolete. It offers broad reach, handles currencies without a convenient local payout network and supports high-value or unusual payments. The weakness is uncertainty. A sender may know its own fee while an intermediary or receiving bank applies a charge later."
        ]
      },
      {
        heading: "The recipient can be paid before treasury catches up",
        paragraphs: [
          "A recipient can be credited before the provider has finished rebalancing the corridor. How? Yesterday's treasury team put money in the payout account. The app's timer measures the retail instruction and local release, not necessarily the provider's later FX settlement and treasury work.",
          "Local systems differ. Faster Payments moves ordinary UK bank payments continuously, while CHAPS settles high-value instructions individually in the Bank of England's RTGS service. Euro instant payments can settle through TIPS in central-bank money at any hour. Each connection has membership rules, technical formats and liquidity demands.",
          "Compliance runs beside the route rather than neatly before it. A provider screens the payer and beneficiary, checks sanctions exposure and may ask why the payment is being made. Destination rules can require purpose codes or address fields. Clean structured data makes automation possible; a misspelt name can send the payment to a human queue."
        ]
      },
      {
        heading: "The route explains part of the quote",
        paragraphs: [
          "A busy corridor can support frequent balancing and direct local connections. A thin route may need a partner that charges per payout, a vehicle currency between the two currencies and a larger liquidity cushion. Those costs help explain why one provider's margin changes between countries. They do not excuse hiding the margin.",
          "Funding also changes the first leg. A UK bank payment is normally cheap for the provider. Card funding carries acceptance, fraud and chargeback costs, so the same destination can produce a worse quote. Cash collection adds premises, staff and physical money management at the final leg.",
          "Returns reveal another route cost. A local system might bounce a closed account before lunch. Send the same mistake through several banks and the diminished return may wander home days later. Providers reserve for those repairs and employ people to trace missing instructions. An unusually cheap route is much less impressive if its operations desk cannot explain where a failed £200 payment has gone.",
          "Ask what the recipient gets, whether that figure is guaranteed and whether another bank can deduct fees. Then look at the quoted delivery method. A company using local payout may be both faster and cheaper on one route while falling back to correspondents on the next. The brand is not the route; the quote in front of you is."
        ]
      }
    ],
    sources: [
      { label: "The next-generation monetary and financial system", publisher: "Bank for International Settlements", url: "https://www.bis.org/publ/arpdf/ar2025e3.htm" },
      { label: "Payments without borders", publisher: "Bank for International Settlements", url: "https://www.bis.org/publ/qtrpdf/r_qt2003h.htm" },
      { label: "What Swift does", publisher: "Swift", url: "https://www.swift.com/news-events/press-releases/swifts-cross-border-payments-processing-speed-surpasses-g20-target" },
      { label: "RTGS and CHAPS Annual Report 2024/25", publisher: "Bank of England", url: "https://www.bankofengland.co.uk/report/2025/rtgs-and-chaps-annual-report-2024-25" },
      { label: "What is TIPS?", publisher: "European Central Bank", url: "https://www.ecb.europa.eu/paym/target/tips/html/index.en.html" },
      { label: "Currencycloud payment guides", publisher: "Currencycloud", url: "https://support.currencycloud.com/hc/en-gb/articles/360017745159-Payment-Guides-Index" }
    ]
  },
  {
    slug: "swift-iso-20022-payment-protocols",
    title: "Swift Does Not Move Your Money. So What Does?",
    shortTitle: "Swift, ISO 20022 and payment protocols",
    description: "See how Swift messages differ from bank settlement, and where ISO 20022 or domestic payment systems fit into the journey.",
    standfirst: "Payment companies often place Swift and ISO 20022 in one impressive-looking sentence. Swift carries an instruction. ISO 20022 gives that instruction a shared format. The actual bank balances change elsewhere.",
    readTime: "8 minute read",
    reviewed: "22 July 2026",
    keyPoint: "The message says what institutions should do. Settlement changes the balances that finish the payment. A network can support several layers, though the jobs remain distinct.",
    series: "Payment infrastructure",
    flow: {
      label: "PROTOCOL STACK",
      title: "What happens after a customer presses send",
      steps: [
        { title: "Channel", detail: "The app or bank portal captures the instruction." },
        { title: "Message", detail: "ISO 20022 gives the data a shared structure." },
        { title: "Network", detail: "Swift or a domestic system carries it onward." },
        { title: "Clearing", detail: "Participants' obligations are calculated or validated." },
        { title: "Settlement", detail: "Money in commercial or central-bank accounts is updated." }
      ],
      note: "A protocol can make data richer and repairs easier. It cannot create liquidity or make two legal regimes identical."
    },
    sections: [
      {
        heading: "A Swift message is an instruction, not a suitcase",
        paragraphs: [
          "People say a payment went through Swift as if Swift were a pipe full of pounds. Swift describes its own role more narrowly: it exchanges standardised financial messages and does not hold funds or manage customer accounts. The instruction and the settlement it triggers are related, but they are not the same event.",
          "A message identifies the institutions, amount, currency and parties. Banks then settle using accounts they hold directly or through correspondents. Swift's tracker can show progress because a unique reference follows the instruction. Tracking a parcel does not drive the van, and tracking a payment does not provide the receiving bank with money.",
          "Domestic systems combine the layers differently. CHAPS instructions settle one by one across accounts in the Bank of England's RTGS service. Faster Payments gives customers near-real-time credits, while the participating institutions' net positions settle in RTGS at scheduled points during the day. Similar front-end speed can hide a different settlement design."
        ]
      },
      {
        heading: "ISO 20022 gives the instruction better fields",
        paragraphs: [
          "ISO 20022 defines structured financial messages. It is not a network and does not choose the bank route. Its value is the ability to carry consistent fields rather than squeeze important detail into short free-text lines. Better data can improve sanctions screening, reconciliation and automated repairs.",
          "The names look forbidding until they are translated. A pacs.008 carries a customer credit transfer between financial institutions. A pacs.009 covers an institution's own credit transfer. A pacs.002 reports payment status, while camt messages handle jobs such as statements and debit or credit notifications. The code identifies a business purpose, not a faster class of money.",
          "Swift ended the general CBPR+ coexistence period for old MT and ISO 20022 payment instructions in November 2025. The work continues. From November 2026, town and country must sit in designated fields for relevant cross-border messages, and fully unstructured addresses will no longer be supported. A cleaner message still depends on clean customer data."
        ]
      },
      {
        heading: "Settlement is where the promise becomes final",
        paragraphs: [
          "RTGS means real-time gross settlement. Each accepted payment is settled individually rather than included in a later net total. Central-bank money is used between participants, removing the commercial-bank credit exposure from that final settlement asset. The Bank of England's renewed RT2 ledger went live in April 2025.",
          "Net settlement takes another route. A retail system can process thousands of customer payments, offset what each member owes and submit the remaining positions for settlement. This economises on liquidity. It also requires rules for failed participants and enough funds when the settlement cycle arrives.",
          "The European Central Bank's TIPS service settles instant payments in euros, Swedish kronor and Danish kroner continuously. Settlement is final in central-bank money. Access still comes through eligible payment service providers or reachable arrangements, so a British transfer app does not gain a direct European rail merely by using ISO 20022."
        ]
      },
      {
        heading: "How the plumbing reaches a £200 quote",
        paragraphs: [
          "Structured purpose and address data can keep an ordinary payment away from manual review. The recipient bank's yes or no comes back in its own status message. Standard identifiers make repairs less like comparing two faxed forms. Every repair avoided saves work. With luck, a little of that saving shows up in the price or arrival time.",
          "APIs are not here to push those messages into retirement. A bank may accept a customer instruction through an API, translate it into an ISO 20022 payment and receive status events back. Another provider may expose the same journey as one developer endpoint. The neat request at the top can still fan out into several network-specific instructions below.",
          "Standards cannot remove a missing correspondent, a closed local market or an empty payout account. Nor do they decide the exchange rate. The BIS keeps returning to liquidity, access and legal differences because a technically perfect message may still reach a system where the sender cannot settle directly.",
          "When a provider advertises a new protocol, ask which layer improved. Is the company connected to a domestic payment system, sending richer messages through a partner or merely offering better tracking? That narrower answer can still describe a useful improvement. It should be more precise than saying the money now uses modern rails."
        ]
      }
    ],
    sources: [
      { label: "ISO 20022 usage guidelines for cross-border payments", publisher: "Swift", url: "https://www.swift.com/news-events/news/updated-iso-20022-usage-guidelines-cross-border-payments-released" },
      { label: "ISO 20022 changes for November 2026", publisher: "Swift", url: "https://www.swift.com/standards/iso-20022/iso-20022-bytes/call-action-november-2026" },
      { label: "What Swift does", publisher: "Swift", url: "https://www.swift.com/news-events/press-releases/swifts-cross-border-payments-processing-speed-surpasses-g20-target" },
      { label: "RTGS and CHAPS Annual Report 2024/25", publisher: "Bank of England", url: "https://www.bankofengland.co.uk/report/2025/rtgs-and-chaps-annual-report-2024-25" },
      { label: "RTGS daily timetable", publisher: "Bank of England", url: "https://www.bankofengland.co.uk/payment-and-settlement/summary-of-rtgs-daily-timetable" },
      { label: "What is TIPS?", publisher: "European Central Bank", url: "https://www.ecb.europa.eu/paym/target/tips/html/index.en.html" }
    ]
  },
  {
    slug: "currencycloud-network-explained",
    title: "Currencycloud: The Payment Company Behind Someone Else's App",
    shortTitle: "How the Currencycloud network works",
    description: "How Currencycloud supplies virtual accounts, foreign exchange and payout access to fintech firms, and which work its clients still own.",
    standfirst: "A transfer brand can build the app while renting much of the machinery underneath. Currencycloud bundles accounts and foreign exchange with payment access, sparing the client from assembling every bank relationship from scratch.",
    readTime: "8 minute read",
    reviewed: "22 July 2026",
    keyPoint: "Currencycloud is a bundle of infrastructure rather than one worldwide rail. The client calls an API while regulated entities and banking partners carry the payment.",
    series: "Payment infrastructure",
    flow: {
      label: "EMBEDDED PAYMENTS",
      title: "Where the visible brand ends and Currencycloud begins",
      steps: [
        { title: "Customer app", detail: "The client owns the screen, support and commercial proposition." },
        { title: "API request", detail: "It creates a beneficiary, conversion or payment instruction." },
        { title: "Currencycloud ledger", detail: "Balances, accounts and transaction records are updated." },
        { title: "Route choice", detail: "The platform uses an available local or Swift path." },
        { title: "Recipient bank", detail: "The destination institution receives the final instruction." }
      ],
      note: "Responsibility depends on the contract and regulated entity. A white-label screen does not make every participant invisible in the legal terms."
    },
    sections: [
      {
        heading: "Currencycloud sells the awkward middle",
        paragraphs: [
          "Imagine a payroll app that wants customers to hold dollars, convert them into euros and pay contractors in Poland. Building the interface is only the visible work. The company also needs regulated accounts, beneficiary validation, FX execution, sanctions controls and access to payment systems or banks. Currencycloud sells much of that middle as a service.",
          "The API menu is fairly concrete. A client can open a beneficiary record, show a balance, quote the conversion and finally release the payment. Virtual or named accounts help identify incoming funds for individual customers. Webhooks and status records feed the result back into the client's own screen. Teams that prefer a dashboard can do the same work in Currencycloud Direct.",
          "Industry shorthand calls this embedded finance, a woolly name for somebody else's financial functions inside your product. The end customer may mainly recognise the payroll, wealth or travel brand. Legal disclosures should still identify who issues e-money or provides the payment. In Britain, The Currency Cloud Limited is an FCA-authorised electronic money institution, not a bank account quietly wearing somebody else's colours."
        ]
      },
      {
        heading: "One client screen can hide several payment routes",
        paragraphs: [
          "Currencycloud currently advertises 180-plus-country reach, stitched together from local payments and Swift. The route changes by currency. For zloty, that can mean Poland's Elixir system; choose priority delivery and Swift enters the picture. Cut-off time, maximum value and required data differ between those options.",
          "Local payout generally means the recipient receives a domestic bank payment from an account or partner already connected in that market. Swift reaches farther, although an intermediary bank may send its own bill. Currencycloud's payment overview warns that those institutions can take handling fees. An API removes manual work; it cannot repeal correspondent banking.",
          "Coverage has edges. Currencycloud labels several currencies, including Indian rupees and Philippine pesos, as restricted for direct funding. Some local USD services are unavailable for clients or beneficiaries linked to specified countries. An industry buyer must inspect the actual corridor matrix rather than place 180-country reach into every sales slide."
        ]
      },
      {
        heading: "The fintech still owns the customer problem",
        paragraphs: [
          "The client decides its retail price and customer experience. Nothing stops it from putting a fee or FX margin on top of Currencycloud's wholesale terms. This is why two apps using related infrastructure can show different recipient amounts. Shared plumbing does not produce shared pricing, any more than two restaurants using the same card terminal produce the same lunch bill.",
          "Customer-checking responsibilities vary. Currencycloud can support compliance and payment requirements, but the programme design decides which company checks the end user and who handles suspicious activity. Support follows a similar split. The customer complains to the app. Its team may then need Currencycloud or a payout bank to work out what happened.",
          "Reconciliation deserves equal attention. A payment company needs identifiers that join a bank credit, conversion, fee and beneficiary payout back to one customer record. Virtual accounts help because an incoming account number can identify the owner without somebody reading a reference field. The awkward exceptions still need operations staff and auditable corrections.",
          "Treasury is not abolished either. Somebody must fund balances, manage currency exposure and plan for weekends. Some clients put cash on the platform first. A smaller group may be allowed to owe the platform within an agreed limit. Good API documentation can make the instruction immediate while the commercial arrangement decides whether money is available to honour it."
        ]
      },
      {
        heading: "Visa paid for the infrastructure, not a universal rail",
        paragraphs: [
          "Currencycloud has belonged to Visa since the deal closed in December 2021. The strategic fit was broader than card payments: Currencycloud added wallets, virtual account management and bank-transfer FX to Visa's network ambitions. It continues to operate a platform for banks and technology companies rather than turning every payout into a Visa card transaction.",
          "Competitors package the stack differently. Wise Platform exposes parts of Wise's own payment network to banks and enterprises. Nium markets global payouts and local collections. Thunes emphasises a direct network reaching bank accounts and mobile wallets. Comparing logo counts is unhelpful unless the required currency, entity and payout method match.",
          "For a business buyer, I would ask for a live route matrix, named regulated entities and a failed-payment workflow. Then I would price local and Swift delivery separately and test the reconciliation data. Infrastructure earns its fee when the awkward cases are legible, not when the happy-path diagram has the fewest boxes."
        ]
      }
    ],
    sources: [
      { label: "Payments overview", publisher: "Currencycloud", url: "https://support.currencycloud.com/hc/en-gb/articles/360017498439-Payments-overview" },
      { label: "Payment Guides Index", publisher: "Currencycloud", url: "https://support.currencycloud.com/hc/en-gb/articles/360017745159-Payment-Guides-Index" },
      { label: "Currencycloud regulation", publisher: "Currencycloud", url: "https://www.currencycloud.com/legal/regulation/" },
      { label: "Currencycloud Spark", publisher: "Currencycloud", url: "https://www.currencycloud.com/technology/currencycloud-spark/" },
      { label: "Visa completes Currencycloud acquisition", publisher: "Visa", url: "https://investor.visa.com/news/news-details/2021/Visa-Completes-Acquisition-of-Currencycloud/default.aspx" },
      { label: "Purpose of Payment codes", publisher: "Currencycloud", url: "https://support.currencycloud.com/hc/en-gb/articles/360017430000-Purpose-of-Payment-Codes" }
    ]
  },
  {
    slug: "wise-vs-revolut-infrastructure",
    title: "Wise Versus Revolut: Similar Screens, Different Payment Machines",
    shortTitle: "Wise versus Revolut infrastructure",
    description: "Compare the local payment access and partner banks beneath Wise and Revolut, including where Swift still enters the route.",
    standfirst: "Both apps hold currencies and send money abroad. Wise grew around the transfer itself. Revolut placed international payments inside a broader current-account alternative, giving the two firms different reasons to build each route.",
    readTime: "8 minute read",
    reviewed: "22 July 2026",
    keyPoint: "Wise has invested heavily in direct domestic payment access. Revolut mixes local rails with Swift inside a broader banking app. Neither provider sends every payment the same way.",
    series: "Payment infrastructure",
    comparison: {
      label: "INFRASTRUCTURE SNAPSHOT",
      title: "The useful differences are below the app",
      columns: ["Layer", "Wise", "Revolut UK"],
      rows: [
        ["Core proposition", "Cross-border payments and multi-currency account", "Multi-product bank and money app"],
        ["Domestic access", "Direct in eight markets, plus partners", "Local details and rails where available"],
        ["Correspondent route", "Swift for supported cases", "Swift for supported international transfers"],
        ["UK legal position", "Electronic money and payment services", "Move to UK bank accounts began in 2026"],
        ["Route warning", "Partner banks still appear in some currencies", "Intermediary fees can apply outside local paths"]
      ],
      note: "This is an architectural comparison, not a permanent price ranking. Check the live recipient amount for the corridor and funding method."
    },
    sections: [
      {
        heading: "Wise built outwards from the transfer",
        paragraphs: [
          "Wise designed its network around accepting money locally and paying it out locally where possible. The company's May 2026 investor material reports direct connections to domestic payment systems in eight markets. Those links include Britain, the euro area and Australia, with later access in markets such as the Philippines and Brazil.",
          "Direct access matters because it can remove a sponsor bank from the domestic leg. Wise can submit eligible payments and, in some markets, settle through an account at the central bank. It still needs licences, liquidity and operational controls. Direct does not mean costless or globally uniform.",
          "Even Wise's local-network story has seams. Some account details come from partner banks, and certain payments still run through Swift. Its help centre is explicit that a customer's account remains with Wise even when partner-bank details appear. A USD payment outside the United States may use Swift and take longer than a normal Wise transfer."
        ]
      },
      {
        heading: "Revolut put the transfer inside an account",
        paragraphs: [
          "Revolut's product is broader. Currency exchange and bank transfers sit beside cards, savings, trading and other services. A UK customer receives local GBP details and a Swift account for supported currencies. The app can keep an internal balance, exchange it on its own ledger and then choose a local or international bank route for payout.",
          "Revolut makes much the same route distinction in its own help pages: local rails where it can, Swift when the transfer calls for it. Its UK fee guidance warns that intermediary banks can complete a transfer and deduct charges outside Revolut's visibility or control. That is a useful admission because an attractive in-app exchange can still meet older plumbing at the edge.",
          "The legal structure is changing too. Revolut Bank UK became authorised to accept deposits in March 2026, and the company said eligible customers would move over during the following months. A current UK user should check which entity provides the account rather than assume every balance has already become an FSCS-protected bank deposit."
        ]
      },
      {
        heading: "Fast delivery depends on prepared local money",
        paragraphs: [
          "Wise says 75% of its payments arrive in under 20 seconds. It is an average across the company, not your promise for Tuesday's payment. The number reflects route automation, local system access and liquidity positioned ahead of demand. A payment can reach the recipient instantly while Wise rebalances the currency pools later.",
          "Revolut-to-Revolut movement can be an internal ledger transfer when both users are on the platform. A payment to an outside bank leaves that closed loop. Local GBP or SEPA delivery may be simple, whereas a less connected currency can require correspondents. Calling both actions a transfer hides the change in infrastructure.",
          "The rest of the market refuses to line up neatly behind either model. A bank may own direct domestic access but rely heavily on correspondent relationships abroad. Currencycloud supplies embedded FX and payments to other brands. Cash remittance firms add agent locations and physical liquidity. There is no single fintech architecture waiting to replace a single bank architecture."
        ]
      },
      {
        heading: "The comparison I would run before sending",
        paragraphs: [
          "Start with the exact corridor and recipient method. Compare £100 or £200 funded by the same UK bank-payment method, then rank the guaranteed amount received. A monthly plan can alter Revolut's exchange or transfer charges. Wise normally presents a transfer-specific fee. Product economics matter as much as technical elegance.",
          "Next, inspect the route clues. Local recipient details and a short arrival estimate suggest a domestic payout path, although the provider may not disclose every partner. A request for BIC or Swift details points towards correspondent messaging. Ask whether beneficiary or intermediary deductions can reduce the quoted amount.",
          "Do not mix that route comparison with protection of the stored balance. An electronic money balance is normally safeguarded under payment rules, while an eligible bank deposit can carry FSCS protection up to the current limit. The logo on the app does not settle which regime applies. Read the entity named in the account terms, especially while a provider is moving customers between legal structures.",
          "Wise is the clearer infrastructure story because cross-border transfer performance is its central product and its direct-access count is published. Revolut may be better integrated with the rest of a customer's financial life. Neither observation chooses today's cheapest quote. Architecture explains the likely behaviour; the timestamped recipient amount proves the price."
        ]
      }
    ],
    sources: [
      { label: "Wise debuts US listing on Nasdaq", publisher: "Wise", url: "https://owners.wise.com/news-releases/news-release-details/wise-debuts-us-listing-nasdaq" },
      { label: "Wise partner bank account details", publisher: "Wise", url: "https://wise.com/help/articles/31JKZjRRkfpSsDd0lE3X0T/how-our-account-details-use-partner-banks" },
      { label: "Wise direct access in the Philippines", publisher: "Wise", url: "https://newsroom.wise.com/en-CAS/243149-wise-granted-direct-access-to-philippines-instant-payments-infrastructure-gets-settlement-account-with-bsp/" },
      { label: "Revolut UK bank transfer fees", publisher: "Revolut", url: "https://help.revolut.com/help/transfers/bank-transfers/which-fees-are-charged-for-a-bank-transfer/" },
      { label: "Revolut UK account details", publisher: "Revolut", url: "https://help.revolut.com/help/transfers/inbound-transfers/how-to-receive-money-from-another-bank/what-account-details-should-i-use-to-transfer-money-to-my-revolut-account/what-account-details-are-available-for-me/" },
      { label: "Revolut becomes a UK bank", publisher: "Revolut", url: "https://www.revolut.com/blog/post/revolut-is-officially-a-bank-in-the-uk/" }
    ]
  },
  {
    slug: "prefunding-netting-local-payouts",
    title: "Why an Instant International Transfer Needs Money Waiting Abroad",
    shortTitle: "Prefunding, netting and local payouts",
    description: "How prefunded accounts and netting make transfers look instant, plus the treasury cost when money builds up on the wrong side.",
    standfirst: "An instant transfer often spends money the provider placed abroad earlier. That preparation buys speed for the customer, while leaving treasury to manage idle balances and the risk of one-way demand.",
    readTime: "8 minute read",
    reviewed: "22 July 2026",
    keyPoint: "Local payout separates the customer's speed from the provider's wholesale rebalancing. The beneficiary is paid now because liquidity was positioned earlier.",
    series: "Payment infrastructure",
    flow: {
      label: "LIQUIDITY LOOP",
      title: "Why an instant payout needs yesterday's treasury work",
      steps: [
        { title: "Forecast", detail: "The provider estimates demand by currency and direction." },
        { title: "Prefund", detail: "Destination accounts receive a working liquidity buffer." },
        { title: "Pay locally", detail: "The recipient gets a domestic transfer from that pool." },
        { title: "Net flows", detail: "Opposing customer demand reduces the amount to move." },
        { title: "Rebalance", detail: "Treasury trades and transfers only the remaining shortfall." }
      ],
      note: "The fastest customer route can create the slowest-looking balance-sheet work behind the scenes."
    },
    sections: [
      {
        heading: "The speed sits in a funded local account",
        paragraphs: [
          "A provider promising rapid pounds-to-pesos delivery cannot wait for every wholesale currency trade and cross-border settlement to finish before paying the family. It keeps pesos in a destination account or funds a payout partner. When the customer's pounds arrive, the local pool releases the matching amount.",
          "This is prefunding. The money sits ready before a particular customer appears. It reduces the chance that a payment stalls for lack of settlement cash, and it lets the final bank leg use domestic infrastructure. The cost is the return forgone on idle balances and the operational effort of maintaining accounts across markets.",
          "The buffer is never just one average day. Weekends, paydays and holidays change demand. A sudden migration payment or business batch can drain a pool. Treasury teams model those patterns and leave a safety margin. Too little liquidity breaks the service; too much turns working capital into expensive furniture."
        ]
      },
      {
        heading: "Two-way customer flow saves treasury work",
        paragraphs: [
          "Suppose customers send £1 million to India while other customers move the equivalent of £400,000 back to Britain. The provider does not need to replace the full outward amount wholesale. It can offset the opposing flows and rebalance the net £600,000, subject to its legal entities and account structure.",
          "When opposing flows cancel out, less money needs settling. The provider can trade a smaller FX amount and send fewer wholesale transfers. That makes a corridor with useful two-way traffic attractive. A heavily one-directional remittance route keeps draining the destination pool, forcing more frequent funding and a larger buffer against disruption.",
          "Timing can make an apparently balanced corridor unhelpful. Business receipts may arrive on weekdays while families send money on Sunday evening. The totals offset over a month, yet the payout account can still run short at the exact moment ordinary customers need it. Useful netting depends on compatible currencies, legal entities and settlement windows, not only matching numbers in a spreadsheet.",
          "The customer does not normally see that imbalance as a separate line item. It can appear inside the FX margin or available route. This is one reason a provider prices the same currency differently depending on where the beneficiary account sits. Currency is only half the problem; liquidity has a location."
        ]
      },
      {
        heading: "Nostro balances buy certainty and tie up cash",
        paragraphs: [
          "Banks have long held foreign-currency balances with correspondents. The home bank calls its overseas account a nostro; the bank holding it views the same balance as a vostro. Those funds make payments possible where the sender lacks direct settlement access. The cash ends up scattered between banks just when one timezone closes and another opens.",
          "BIS research describes the trade-off plainly. Prefunding reduces delays and failures but creates idle buffer costs or credit exposure elsewhere. A provider must also consider the bank holding the balance, limits on withdrawing currency and what happens when markets close while retail payments continue.",
          "Foreign exchange adds settlement risk. One party can deliver the sold currency before receiving the bought one. Payment-versus-payment arrangements make both legs conditional on each other. The 2025 BIS survey still found that only 36% of average daily FX settlement used PvP to eliminate that risk, evidence that the old timing problem remains large."
        ]
      },
      {
        heading: "New rails still need money at the far end",
        paragraphs: [
          "Project Nexus proposes linking domestic instant-payment systems with standard messages and competing FX providers. Its technical design requires those providers to hold sufficient balances in the systems where they quote. Instant connectivity does not remove prefunding; it makes liquidity monitoring more immediate and exposes a provider that quotes without enough money.",
          "Project Rialto tested a more ambitious design combining automated FX with payment-versus-payment settlement in tokenised central-bank money. The experiment addressed FX and settlement friction, including routes that need a third vehicle currency. It is a proof of concept, not a retail network that has replaced today's accounts.",
          "For customers, the lesson is practical. An instant badge describes the expected retail experience under normal liquidity and screening conditions. Before trusting it, ask two blunt questions: is the delivery time guaranteed, and who fixes a failed payout? For industry buyers, ask how balances are forecast, where funds sit and how weekend shortfalls are covered. The attractive API call is merely the last inch of a very liquid machine."
        ]
      }
    ],
    sources: [
      { label: "Payments without borders", publisher: "Bank for International Settlements", url: "https://www.bis.org/publ/qtrpdf/r_qt2003h.htm" },
      { label: "The next-generation monetary and financial system", publisher: "Bank for International Settlements", url: "https://www.bis.org/publ/arpdf/ar2025e3.htm" },
      { label: "FX settlement risk in the 2025 Triennial Survey", publisher: "Bank for International Settlements", url: "https://www.bis.org/publ/qtrpdf/r_qt2606c.htm" },
      { label: "Managing liquidity in Nexus", publisher: "BIS Innovation Hub", url: "https://docs.bis.org/nexus/fx-provision/managing-liquidity" },
      { label: "Nexus: enabling instant cross-border payments", publisher: "Bank for International Settlements", url: "https://www.bis.org/publ/othp86.htm" },
      { label: "Project Rialto technical report", publisher: "Bank for International Settlements", url: "https://www.bis.org/publ/othp106.htm" }
    ]
  }
];

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}

export function guideWordCount(guide: Guide) {
  const text = [guide.standfirst, ...guide.sections.flatMap((section) => section.paragraphs)].join(" ");
  return text.trim().split(/\s+/).length;
}
