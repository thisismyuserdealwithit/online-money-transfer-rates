"use client";

import { useMemo, useState } from "react";
import type { BankDetailsProfile } from "@/lib/bank-details";
import {
  abaChecksumPass,
  bicFormatPass,
  cleanBankCode,
  ibanChecksumPass,
} from "@/lib/bank-validation";

type CheckState = "idle" | "pass" | "warn" | "fail";

type CheckResult = {
  state: CheckState;
  title: string;
  detail: string;
};

function bicResult(value: string, profile: BankDetailsProfile): CheckResult {
  const bic = cleanBankCode(value);
  if (!bic) {
    return { state: "idle", title: "Enter a BIC", detail: "Use the 8 or 11-character code supplied by the bank." };
  }
  if (!bicFormatPass(bic)) {
    return { state: "fail", title: "Incorrect BIC format", detail: "A BIC has 8 characters, or 11 when a branch identifier is included." };
  }

  const codeCountry = bic.slice(4, 6);
  if (profile.countryCode !== "EU" && codeCountry !== profile.countryCode) {
    return {
      state: "warn",
      title: `The code points to ${codeCountry}, not ${profile.countryCode}`,
      detail: "It could identify an intermediary or overseas booking branch. Confirm it with the recipient's bank before paying.",
    };
  }

  return {
    state: "pass",
    title: "The BIC format passes",
    detail: "This does not prove that the institution or branch exists, is connected to SWIFT or belongs to the recipient.",
  };
}

function ibanResult(value: string, profile: BankDetailsProfile): CheckResult {
  const iban = cleanBankCode(value);
  if (!iban) {
    return { state: "idle", title: "Enter the IBAN", detail: `A ${profile.country} IBAN has ${profile.iban?.length} characters.` };
  }
  if (!profile.iban) {
    return { state: "warn", title: "No single IBAN rule", detail: profile.warning };
  }
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(iban)) {
    return { state: "fail", title: "Incorrect IBAN structure", detail: "It must begin with two country letters and two check digits." };
  }
  if (iban.slice(0, 2) !== profile.countryCode) {
    return { state: "fail", title: `This is not a ${profile.countryCode} IBAN`, detail: `The account supplied begins ${iban.slice(0, 2)}.` };
  }
  if (iban.length !== profile.iban.length) {
    return { state: "fail", title: "Incorrect IBAN length", detail: `${profile.country} uses ${profile.iban.length} characters. This entry has ${iban.length}.` };
  }
  if (!ibanChecksumPass(iban)) {
    return { state: "fail", title: "The IBAN checksum fails", detail: "At least one character is likely missing or mistyped. Ask the recipient to send it again." };
  }
  return {
    state: "pass",
    title: "Format and checksum pass",
    detail: "The checksum catches many typing errors. It does not confirm the account exists, is open or belongs to the named recipient.",
  };
}

function localCodeResult(value: string, profile: BankDetailsProfile): CheckResult {
  const rule = profile.localCode;
  if (!rule) {
    return { state: "idle", title: "No single local-code rule", detail: "Use the exact fields shown by the receiving bank or transfer provider." };
  }
  const normalised = rule.normalise === "digits"
    ? value.replace(/\D/g, "")
    : cleanBankCode(value);
  if (!normalised) {
    return { state: "idle", title: `Enter the ${rule.shortLabel.toLowerCase()}`, detail: rule.format };
  }
  if (!new RegExp(rule.pattern).test(normalised)) {
    return { state: "fail", title: `Incorrect ${rule.shortLabel.toLowerCase()} format`, detail: `Expected ${rule.format}.` };
  }
  if (rule.algorithm === "aba" && !abaChecksumPass(normalised)) {
    return { state: "fail", title: "The ABA checksum fails", detail: "Recheck all nine digits and confirm whether the bank supplied ACH or wire instructions." };
  }
  return {
    state: "pass",
    title: "The local-code format passes",
    detail: "This does not confirm the institution, branch, payment rail or recipient account.",
  };
}

function Result({ result }: { result: CheckResult }) {
  return (
    <div className={`bank-check-result result-${result.state}`} aria-live="polite">
      <strong>{result.title}</strong>
      <span>{result.detail}</span>
    </div>
  );
}

export function BankDetailsChecker({
  profile,
  compact = false,
  bicOnly = false,
}: {
  profile: BankDetailsProfile;
  compact?: boolean;
  bicOnly?: boolean;
}) {
  const [bic, setBic] = useState("");
  const [iban, setIban] = useState("");
  const [localCode, setLocalCode] = useState("");

  const bicCheck = useMemo(() => bicResult(bic, profile), [bic, profile]);
  const ibanCheck = useMemo(() => ibanResult(iban, profile), [iban, profile]);
  const localCheck = useMemo(() => localCodeResult(localCode, profile), [localCode, profile]);

  return (
    <div className={`bank-checker${compact ? " checker-compact" : ""}`}>
      <div className="bank-checker-grid">
        <label>
          <span>SWIFT/BIC</span>
          <input
            value={bic}
            onChange={(event) => setBic(event.target.value)}
            placeholder="AAAA GB 2L XXX"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            maxLength={16}
          />
          <Result result={bicCheck} />
        </label>

        {!bicOnly && profile.iban ? (
          <label>
            <span>{profile.countryCode} IBAN</span>
            <input
              value={iban}
              onChange={(event) => setIban(event.target.value)}
              placeholder={profile.iban.mask}
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              maxLength={42}
            />
            <Result result={ibanCheck} />
          </label>
        ) : null}

        {!bicOnly && profile.localCode ? (
          <label>
            <span>{profile.localCode.label}</span>
            <input
              value={localCode}
              onChange={(event) => setLocalCode(event.target.value)}
              placeholder={profile.localCode.placeholder}
              inputMode={profile.localCode.normalise === "digits" ? "numeric" : "text"}
              autoComplete="off"
              spellCheck={false}
              maxLength={24}
            />
            <Result result={localCheck} />
          </label>
        ) : null}
      </div>
      <p className="bank-check-privacy">Checked only in this browser. Nothing entered here is sent, logged or stored.</p>
    </div>
  );
}
