export type DetailStatus = "required" | "usual" | "conditional";

export type DetailField = {
  label: string;
  status: DetailStatus;
  format: string;
  note: string;
};

export type LocalCodeRule = {
  label: string;
  shortLabel: string;
  format: string;
  placeholder: string;
  pattern: string;
  normalise: "digits" | "alphanumeric";
  algorithm?: "aba";
};

export type IbanRule = {
  length: number;
  mask: string;
};

export type BankDetailsSource = {
  label: string;
  url: string;
};

export type BankDetailsProfile = {
  slug: string;
  country: string;
  countryCode: string;
  currency: string;
  accountFormat: string;
  iban?: IbanRule;
  localCode?: LocalCodeRule;
  bicUse: string;
  fields: DetailField[];
  warning: string;
  sources: BankDetailsSource[];
  reviewedAt: string;
};

const swiftIbanRegistry: BankDetailsSource = {
  label: "SWIFT IBAN Registry, release 102",
  url: "https://www.swift.com/standards/standards-resources",
};

const swiftBicSearch: BankDetailsSource = {
  label: "Official SWIFT BIC Search",
  url: "https://www.swiftref.com/en/bicsearch",
};

const europeanPaymentsCouncil: BankDetailsSource = {
  label: "European Payments Council: IBAN-only rule",
  url: "https://www.europeanpaymentscouncil.eu/what-we-do/epc-payment-scheme-management/schemes-rely-global-open-standards",
};

const reviewedAt = "31 July 2026";

function field(
  label: string,
  status: DetailStatus,
  format: string,
  note: string,
): DetailField {
  return { label, status, format, note };
}

function ibanProfile({
  slug,
  country,
  countryCode,
  currency,
  length,
  mask,
  extraFields = [],
  localCode,
  note = "For a SEPA euro transfer, the IBAN is normally enough. A bank or provider may still request a BIC for a non-SEPA route or a different currency.",
  warning = "The IBAN checksum can catch typing errors. It does not confirm the recipient name, account status or ownership.",
  sources = [],
}: {
  slug: string;
  country: string;
  countryCode: string;
  currency: string;
  length: number;
  mask: string;
  extraFields?: DetailField[];
  localCode?: LocalCodeRule;
  note?: string;
  warning?: string;
  sources?: BankDetailsSource[];
}): BankDetailsProfile {
  return {
    slug,
    country,
    countryCode,
    currency,
    accountFormat: `${length}-character ${countryCode} IBAN`,
    iban: { length, mask },
    localCode,
    bicUse: note,
    fields: [
      field("Recipient name", "required", "Exact legal or account name", "Use the name shown by the recipient's bank. Do not shorten a business name."),
      field("IBAN", "required", `${length} characters, beginning ${countryCode}`, `The published national format is ${mask}.`),
      field("SWIFT/BIC", "conditional", "8 or 11 characters", "Use the code supplied by the recipient's bank when the payment form asks for it."),
      ...extraFields,
    ],
    warning,
    sources: [swiftIbanRegistry, swiftBicSearch, ...sources],
    reviewedAt,
  };
}

export const bankDetailsProfiles: BankDetailsProfile[] = [
  ibanProfile({
    slug: "united-kingdom",
    country: "United Kingdom",
    countryCode: "GB",
    currency: "GBP",
    length: 22,
    mask: "GBkk BBBB SSSS SSCC CCCC CC",
    localCode: {
      label: "UK sort code",
      shortLabel: "Sort code",
      format: "6 digits",
      placeholder: "12-34-56",
      pattern: "^\\d{6}$",
      normalise: "digits",
    },
    extraFields: [
      field("Sort code", "usual", "6 digits", "Used with a UK account number for local GBP settlement."),
      field("Account number", "usual", "Usually 8 digits", "Copy the number exactly as the recipient's bank displays it."),
    ],
    note: "A direct international wire may request the bank's BIC and the recipient's IBAN. Providers paying through UK local rails may ask only for a sort code and account number.",
    warning: "Use your bank or transfer provider's Confirmation of Payee check when offered. A format check cannot match an account name.",
    sources: [{
      label: "Pay.UK Confirmation of Payee",
      url: "https://www.wearepay.uk/what-we-do/overlay-services/confirmation-of-payee/",
    }],
  }),
  ibanProfile({
    slug: "spain",
    country: "Spain",
    countryCode: "ES",
    currency: "EUR",
    length: 24,
    mask: "ESkk BBBB GGGG XXCC CCCC CCCC",
    sources: [europeanPaymentsCouncil],
  }),
  ibanProfile({
    slug: "france",
    country: "France",
    countryCode: "FR",
    currency: "EUR",
    length: 27,
    mask: "FRkk BBBB BGGG GGCC CCCC CCCC CXX",
    sources: [europeanPaymentsCouncil],
  }),
  ibanProfile({
    slug: "germany",
    country: "Germany",
    countryCode: "DE",
    currency: "EUR",
    length: 22,
    mask: "DEkk BBBB BBBB CCCC CCCC CC",
    sources: [europeanPaymentsCouncil],
  }),
  ibanProfile({
    slug: "ireland",
    country: "Ireland",
    countryCode: "IE",
    currency: "EUR",
    length: 22,
    mask: "IEkk AAAA SSSS SSCC CCCC CC",
    sources: [europeanPaymentsCouncil],
  }),
  ibanProfile({
    slug: "italy",
    country: "Italy",
    countryCode: "IT",
    currency: "EUR",
    length: 27,
    mask: "ITkk XAAA AABB BBBC CCCC CCCC CCC",
    sources: [europeanPaymentsCouncil],
  }),
  ibanProfile({
    slug: "netherlands",
    country: "Netherlands",
    countryCode: "NL",
    currency: "EUR",
    length: 18,
    mask: "NLkk BBBB CCCC CCCC CC",
    sources: [europeanPaymentsCouncil],
  }),
  ibanProfile({
    slug: "portugal",
    country: "Portugal",
    countryCode: "PT",
    currency: "EUR",
    length: 25,
    mask: "PTkk BBBB GGGG CCCC CCCC CCCX X",
    sources: [europeanPaymentsCouncil],
  }),
  ibanProfile({
    slug: "poland",
    country: "Poland",
    countryCode: "PL",
    currency: "PLN",
    length: 28,
    mask: "PLkk BBBB BBBX CCCC CCCC CCCC CCCC",
    note: "The Polish IBAN is the main account identifier. A BIC may still be requested for an international wire or a non-SEPA payment.",
    sources: [europeanPaymentsCouncil],
  }),
  ibanProfile({
    slug: "switzerland",
    country: "Switzerland",
    countryCode: "CH",
    currency: "CHF",
    length: 21,
    mask: "CHkk BBBB BCCC CCCC CCCC C",
    note: "Ask for the CH IBAN. A BIC may be requested for a direct international payment, especially outside a SEPA euro transfer.",
    sources: [europeanPaymentsCouncil],
  }),
  {
    slug: "united-states",
    country: "United States",
    countryCode: "US",
    currency: "USD",
    accountFormat: "Account number plus a 9-digit routing number",
    localCode: {
      label: "ABA routing number",
      shortLabel: "Routing number",
      format: "9 digits with an ABA checksum",
      placeholder: "123456780",
      pattern: "^\\d{9}$",
      normalise: "digits",
      algorithm: "aba",
    },
    bicUse: "The United States does not use IBAN. A direct international wire may need a SWIFT/BIC, bank address and a wire-enabled ABA routing number. ACH and wire routing instructions are not always interchangeable.",
    fields: [
      field("Recipient name", "required", "Exact account name", "Match the spelling held by the receiving bank."),
      field("Account number", "required", "Length varies by bank", "Do not add spaces or omit leading zeroes unless the bank tells you to."),
      field("ABA routing number", "required", "9 digits", "Confirm whether the bank supplied ACH or wire instructions for this payment."),
      field("Account type", "usual", "Checking or savings", "Some local payout forms need the account type."),
      field("SWIFT/BIC", "conditional", "8 or 11 characters", "Usually needed for a direct international wire, but not for every local payout."),
      field("Bank address", "conditional", "Bank-provided address", "Use it only when the sending bank or provider requests it."),
    ],
    warning: "A valid routing-number checksum does not prove that the number accepts the payment type you selected. Confirm ACH versus wire instructions.",
    sources: [
      swiftBicSearch,
      { label: "Federal Reserve E-Payments Routing Directory", url: "https://www.frbservices.org/resources/routing-number-directory" },
    ],
    reviewedAt,
  },
  {
    slug: "canada",
    country: "Canada",
    countryCode: "CA",
    currency: "CAD",
    accountFormat: "Account number plus transit and institution numbers",
    localCode: {
      label: "Canadian institution and transit numbers",
      shortLabel: "Institution + transit",
      format: "3-digit institution followed by 5-digit transit",
      placeholder: "123-45678",
      pattern: "^\\d{8}$",
      normalise: "digits",
    },
    bicUse: "Canada does not use IBAN. Ask for the 5-digit transit number, 3-digit institution number and account number. A direct international wire may also request a SWIFT/BIC and bank address.",
    fields: [
      field("Recipient name", "required", "Exact account name", "Use the full personal or business account name."),
      field("Transit number", "required", "5 digits", "This identifies the branch."),
      field("Institution number", "required", "3 digits", "This identifies the financial institution."),
      field("Account number", "required", "Length varies", "Copy all digits, including any leading zeroes."),
      field("SWIFT/BIC", "conditional", "8 or 11 characters", "Use the code provided for an incoming international wire when requested."),
    ],
    warning: "A routing format check does not confirm the branch, recipient or whether the account accepts the selected transfer rail.",
    sources: [
      swiftBicSearch,
      { label: "Payments Canada official directories", url: "https://www.payments.ca/payment-resources/directories" },
    ],
    reviewedAt,
  },
  {
    slug: "australia",
    country: "Australia",
    countryCode: "AU",
    currency: "AUD",
    accountFormat: "Account number plus a 6-digit BSB",
    localCode: {
      label: "Australian BSB",
      shortLabel: "BSB",
      format: "6 digits",
      placeholder: "123-456",
      pattern: "^\\d{6}$",
      normalise: "digits",
    },
    bicUse: "Australia does not use IBAN. Local AUD payouts normally use a BSB and account number. A direct international wire may request the bank's SWIFT/BIC.",
    fields: [
      field("Recipient name", "required", "Exact account name", "Use the name registered to the account."),
      field("BSB", "required", "6 digits", "The BSB identifies the bank and branch."),
      field("Account number", "required", "Length varies by bank", "Keep leading zeroes."),
      field("SWIFT/BIC", "conditional", "8 or 11 characters", "Use the receiving bank's international-payment instructions when requested."),
    ],
    warning: "A six-digit BSB can be structurally correct and still be the wrong branch. Confirm it against the recipient's banking screen.",
    sources: [
      swiftBicSearch,
      { label: "Australian Payments Network BSB lookup", url: "https://bsb.auspaynet.com.au/public/" },
    ],
    reviewedAt,
  },
  {
    slug: "new-zealand",
    country: "New Zealand",
    countryCode: "NZ",
    currency: "NZD",
    accountFormat: "Bank, branch, account and suffix components",
    localCode: {
      label: "New Zealand bank and branch code",
      shortLabel: "Bank + branch",
      format: "2-digit bank plus 4-digit branch",
      placeholder: "12-3456",
      pattern: "^\\d{6}$",
      normalise: "digits",
    },
    bicUse: "New Zealand does not use IBAN. A local account is commonly shown as bank, branch, account and suffix groups. A direct international wire may also request a SWIFT/BIC.",
    fields: [
      field("Recipient name", "required", "Exact account name", "Use the registered account name."),
      field("Bank and branch", "required", "2 digits + 4 digits", "These are the first two account-number groups."),
      field("Account and suffix", "required", "7 digits + 2 or 3 digits", "Keep the suffix and any leading zeroes exactly as shown."),
      field("SWIFT/BIC", "conditional", "8 or 11 characters", "Follow the bank's incoming international-payment instructions."),
    ],
    warning: "Do not remove the account suffix. A format match does not confirm the recipient or branch.",
    sources: [
      swiftBicSearch,
      { label: "Payments NZ Bank Branch Register", url: "https://www.paymentsnz.co.nz/resources/industry-registers/bank-branch-register/" },
    ],
    reviewedAt,
  },
  {
    slug: "india",
    country: "India",
    countryCode: "IN",
    currency: "INR",
    accountFormat: "Account number plus an 11-character IFSC",
    localCode: {
      label: "Indian IFSC",
      shortLabel: "IFSC",
      format: "4 letters, 0, then 6 letters or digits",
      placeholder: "ABCD0123456",
      pattern: "^[A-Z]{4}0[A-Z0-9]{6}$",
      normalise: "alphanumeric",
    },
    bicUse: "Most consumer transfer providers pay INR through Indian local rails and ask for an IFSC rather than a BIC. A direct international bank wire may request both a SWIFT/BIC and the transfer purpose.",
    fields: [
      field("Recipient name", "required", "Exact account name", "Use the full name registered at the bank."),
      field("Account number", "required", "Length varies", "Copy every digit and preserve leading zeroes."),
      field("IFSC", "required", "11 characters", "The fifth character is zero, not the letter O."),
      field("Purpose", "conditional", "Provider-selected category", "Choose the truthful reason for the remittance when requested."),
      field("SWIFT/BIC", "conditional", "8 or 11 characters", "More likely on a direct bank wire than a provider's local INR payout."),
    ],
    warning: "A correctly formed IFSC does not prove the account belongs to the named recipient. Recheck both the name and account number.",
    sources: [
      swiftBicSearch,
      { label: "Reserve Bank of India IFSC search", url: "https://rbi.org.in/Scripts/IFSCMICRDetails.aspx" },
    ],
    reviewedAt,
  },
  ibanProfile({
    slug: "pakistan",
    country: "Pakistan",
    countryCode: "PK",
    currency: "PKR",
    length: 24,
    mask: "PKkk BBBB CCCC CCCC CCCC CCCC",
    extraFields: [field("Payment purpose", "conditional", "Provider-selected reason", "Use the real reason for the payment when requested.")],
    note: "Ask for the recipient's 24-character PK IBAN. A SWIFT/BIC and payment purpose may be requested for a direct international wire.",
    sources: [{ label: "State Bank of Pakistan IBAN information", url: "https://www.sbp.org.pk/psd/iban.htm" }],
  }),
  {
    slug: "philippines",
    country: "Philippines",
    countryCode: "PH",
    currency: "PHP",
    accountFormat: "Bank name and account number; no IBAN",
    bicUse: "The Philippines does not use IBAN. Transfer providers may ask only for the bank and account number when paying locally. Direct international wires commonly request a SWIFT/BIC and sometimes the recipient address.",
    fields: [
      field("Recipient name", "required", "Exact account name", "Match the bank record, including middle names when shown."),
      field("Bank and account number", "required", "Bank-specific format", "Select the exact bank and copy the account number."),
      field("SWIFT/BIC", "conditional", "8 or 11 characters", "Use the bank's official incoming-wire instruction when requested."),
      field("Recipient address", "conditional", "Current address", "Some direct international wires request it."),
    ],
    warning: "A bank code or BIC format check cannot confirm the recipient account. Confirm any changed instructions through a trusted channel.",
    sources: [
      swiftBicSearch,
      { label: "Bangko Sentral ng Pilipinas payments information", url: "https://www.bsp.gov.ph/SitePages/PaymentsAndSettlements/PaymentsAndSettlements.aspx" },
    ],
    reviewedAt,
  },
  ibanProfile({
    slug: "united-arab-emirates",
    country: "United Arab Emirates",
    countryCode: "AE",
    currency: "AED",
    length: 23,
    mask: "AEkk BBB CCCC CCCC CCCC CCCC",
    extraFields: [field("Purpose code", "conditional", "Provider or bank code list", "Select the code that truthfully describes the transfer.")],
    note: "Ask for the 23-character AE IBAN. A SWIFT/BIC and purpose code may also be required, depending on the payment route.",
    sources: [{ label: "Central Bank of the UAE IBAN information", url: "https://centralbank.ae/en/our-operations/payments-and-settlements/regulations-and-standards/iban/" }],
  }),
  {
    slug: "south-africa",
    country: "South Africa",
    countryCode: "ZA",
    currency: "ZAR",
    accountFormat: "Account number plus a 6-digit branch code",
    localCode: {
      label: "South African branch code",
      shortLabel: "Branch code",
      format: "6 digits",
      placeholder: "123456",
      pattern: "^\\d{6}$",
      normalise: "digits",
    },
    bicUse: "South Africa does not use IBAN. Local ZAR settlement uses an account number and branch code. A SWIFT/BIC and payment-purpose information may be requested for an international wire.",
    fields: [
      field("Recipient name", "required", "Exact account name", "Use the registered bank-account name."),
      field("Account number", "required", "Bank-specific length", "Preserve leading zeroes."),
      field("Branch code", "required", "6 digits", "Use the branch or universal code supplied by the recipient's bank."),
      field("SWIFT/BIC", "conditional", "8 or 11 characters", "Use the bank's incoming international-payment instructions."),
      field("Payment purpose", "conditional", "Bank or provider category", "Select the true reason for the transfer."),
    ],
    warning: "Some banks use universal branch codes and others provide branch-specific instructions. Confirm which code the recipient supplied.",
    sources: [
      swiftBicSearch,
      { label: "South African Reserve Bank payment oversight", url: "https://www.resbank.co.za/en/home/what-we-do/payments-and-settlements/regulation-oversight-and-supervision" },
    ],
    reviewedAt,
  },
  {
    slug: "nigeria",
    country: "Nigeria",
    countryCode: "NG",
    currency: "NGN",
    accountFormat: "10-digit NUBAN account number",
    localCode: {
      label: "Nigerian NUBAN",
      shortLabel: "NUBAN",
      format: "10 digits",
      placeholder: "1234567890",
      pattern: "^\\d{10}$",
      normalise: "digits",
    },
    bicUse: "Nigeria does not use IBAN. Local payouts normally use the selected bank and a 10-digit NUBAN. A direct international wire may also request a SWIFT/BIC, recipient address and payment purpose.",
    fields: [
      field("Recipient name", "required", "Exact account name", "Match the account name returned by the provider when it offers a name check."),
      field("Bank", "required", "Selected institution", "Choose the exact receiving bank."),
      field("NUBAN", "required", "10 digits", "Copy the account number without adding a bank code."),
      field("SWIFT/BIC", "conditional", "8 or 11 characters", "More likely for a direct international wire than a local NGN payout."),
      field("Payment purpose", "conditional", "Provider-selected reason", "Use the truthful transfer reason."),
    ],
    warning: "Never share a PIN, password or one-time code to receive a transfer. A 10-digit number alone does not prove account ownership.",
    sources: [
      swiftBicSearch,
      { label: "Central Bank of Nigeria retail payments", url: "https://www.cbn.gov.ng/PaymentsSystem/RetailPayments.html" },
    ],
    reviewedAt,
  },
  {
    slug: "singapore",
    country: "Singapore",
    countryCode: "SG",
    currency: "SGD",
    accountFormat: "Bank, branch and account number; no IBAN",
    bicUse: "Singapore does not use IBAN. Local SGD payouts may ask for the bank and account number. A direct international wire can also require bank and branch identifiers, a SWIFT/BIC and recipient address.",
    fields: [
      field("Recipient name", "required", "Exact account name", "Use the name registered at the receiving bank."),
      field("Bank and account number", "required", "Bank-specific format", "Copy the full account number, including leading zeroes."),
      field("Bank and branch code", "conditional", "4 digits + 3 digits", "Use these only when the payment form asks for them."),
      field("SWIFT/BIC", "conditional", "8 or 11 characters", "Follow the receiving bank's international-payment instructions."),
      field("Recipient address", "conditional", "Current address", "Some international wire forms require it."),
    ],
    warning: "FAST, local account payout and a direct SWIFT wire can request different fields. Follow the rail selected by the provider.",
    sources: [
      swiftBicSearch,
      { label: "Association of Banks in Singapore FAST information", url: "https://www.abs.org.sg/e-payments/fast" },
    ],
    reviewedAt,
  },
  {
    slug: "hong-kong",
    country: "Hong Kong",
    countryCode: "HK",
    currency: "HKD",
    accountFormat: "Bank code, branch code and account number; no IBAN",
    localCode: {
      label: "Hong Kong bank and branch code",
      shortLabel: "Bank + branch",
      format: "3-digit bank plus 3-digit branch",
      placeholder: "123-456",
      pattern: "^\\d{6}$",
      normalise: "digits",
    },
    bicUse: "Hong Kong does not use IBAN. Local HKD payouts may use bank and branch codes with the account number. A direct international wire commonly requests the bank's SWIFT/BIC.",
    fields: [
      field("Recipient name", "required", "Exact account name", "Use the personal or business name held by the bank."),
      field("Bank code", "usual", "3 digits", "This identifies the clearing bank."),
      field("Branch code", "usual", "3 digits", "Copy the branch identifier supplied with the account."),
      field("Account number", "required", "Bank-specific length", "Keep any leading zeroes and separators required by the provider."),
      field("SWIFT/BIC", "conditional", "8 or 11 characters", "Use the receiving bank's official code for international wires."),
    ],
    warning: "A bank and branch code identifies the institution path, not the recipient. Recheck the account name and number separately.",
    sources: [
      swiftBicSearch,
      { label: "Hong Kong Interbank Clearing bank code list", url: "https://www.hkicl.com.hk/eng/information_centre/clearing_code_and_branch_code_list.php" },
    ],
    reviewedAt,
  },
  {
    slug: "euro-area",
    country: "Euro area",
    countryCode: "EU",
    currency: "EUR",
    accountFormat: "Country-specific IBAN",
    bicUse: "There is no single EU IBAN length. Use the destination account's national IBAN format. Since February 2016, customers normally provide only the IBAN for a SEPA euro payment; the provider derives the BIC.",
    fields: [
      field("Recipient name", "required", "Exact account name", "Use the legal or account name."),
      field("IBAN", "required", "Country-specific length", "Check the first two letters and the length against the actual account country."),
      field("SWIFT/BIC", "conditional", "8 or 11 characters", "Usually not requested from the customer for a SEPA euro payment, but it can appear on other routes."),
    ],
    warning: "EU is not an IBAN country code. The IBAN begins with the two-letter code of the country where the account is held.",
    sources: [swiftIbanRegistry, swiftBicSearch, europeanPaymentsCouncil],
    reviewedAt,
  },
];

export const bankDetailsByCode = new Map(
  bankDetailsProfiles.map((profile) => [profile.countryCode, profile]),
);

export const bankDetailsBySlug = new Map(
  bankDetailsProfiles.map((profile) => [profile.slug, profile]),
);

export function getBankDetailsByCode(countryCode: string) {
  return bankDetailsByCode.get(countryCode);
}

export function getBankDetailsBySlug(slug: string) {
  return bankDetailsBySlug.get(slug);
}
