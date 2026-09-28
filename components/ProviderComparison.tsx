"use client";

import { useId, useState } from "react";
import type { CustomerReviewEvidence, ProviderComparisonProfile } from "@/lib/customer-review-types";
import styles from "./ProviderComparison.module.css";

type Focus = "overall" | "price" | "delivery" | "feedback";

const focusOptions: { value: Focus; label: string }[] = [
  { value: "overall", label: "Overall" },
  { value: "price", label: "Price" },
  { value: "delivery", label: "Delivery & access" },
  { value: "feedback", label: "Customer feedback" },
];

const scopeLabels: Record<CustomerReviewEvidence["scope"], string> = {
  "transfer-service": "Money-transfer service profile",
  "whole-company": "Whole-company profile; includes other products",
  "parent-company": "Parent-company profile; not this service alone",
  limited: "Limited review evidence",
};

function checkedDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
}

function Feedback({ profile, expanded }: { profile: ProviderComparisonProfile; expanded: boolean }) {
  const evidence = profile.customer;
  if (!evidence) {
    return <p>We have not yet published a sourced customer-feedback assessment for {profile.name}.</p>;
  }
  return (
    <div className={styles.feedback}>
      <p>{evidence.summary}</p>
      <p className={styles.sourceLine}>
        <a href={evidence.sourceUrl}>{evidence.sourceLabel}</a>
        {evidence.score !== null && Number.isFinite(evidence.score) && <span>Published score: {evidence.score}</span>}
        {evidence.reviewCount !== null && Number.isFinite(evidence.reviewCount) && <span>{evidence.reviewCount.toLocaleString("en-GB")} reviews</span>}
        <span>Checked <time dateTime={evidence.checkedAt}>{checkedDate(evidence.checkedAt)}</time></span>
      </p>
      <p className={styles.scope}>{scopeLabels[evidence.scope]}</p>
      {expanded && <>
        {evidence.praise.length > 0 && <div><h4>Positive themes</h4><ul>{evidence.praise.map((point) => <li key={point}>{point}</li>)}</ul></div>}
        {evidence.concerns.length > 0 && <div><h4>Concerns to check</h4><ul>{evidence.concerns.map((point) => <li key={point}>{point}</li>)}</ul></div>}
        <p className={styles.takeaway}>{evidence.comparisonTakeaway}</p>
        <p className={styles.note}>{evidence.evidenceNote}</p>
      </>}
      <a className={styles.textLink} href={`/reviews/${profile.slug}#customer-reviews`}>Read the customer-feedback assessment <span aria-hidden="true">→</span></a>
    </div>
  );
}

export function ProviderComparison({ profiles, initialLeft, initialRight }: {
  profiles: ProviderComparisonProfile[];
  initialLeft: string;
  initialRight?: string;
}) {
  const id = useId();
  const available = profiles.filter((profile, index) => profiles.findIndex((candidate) => candidate.slug === profile.slug) === index);
  const defaultLeft = available.find((profile) => profile.slug === initialLeft) ?? available[0];
  const defaultRight = available.find((profile) => profile.slug === initialRight && profile.slug !== defaultLeft?.slug)
    ?? available.find((profile) => profile.slug !== defaultLeft?.slug);
  const [leftSlug, setLeftSlug] = useState(defaultLeft?.slug ?? "");
  const [rightSlug, setRightSlug] = useState(defaultRight?.slug ?? "");
  const [focus, setFocus] = useState<Focus>("overall");
  const left = available.find((profile) => profile.slug === leftSlug) ?? defaultLeft;
  const right = available.find((profile) => profile.slug === rightSlug && profile.slug !== left?.slug)
    ?? available.find((profile) => profile.slug !== left?.slug);

  if (!left || !right) {
    return <p className={styles.note}>A side-by-side comparison needs two published provider profiles.</p>;
  }

  const fields: { key: keyof Pick<ProviderComparisonProfile, "bestFor" | "lessSuitableFor" | "rateModel" | "feeModel" | "delivery" | "access">; label: string; focuses: Focus[] }[] = [
    { key: "bestFor", label: "Best suited to", focuses: ["overall"] },
    { key: "lessSuitableFor", label: "Where it may not fit", focuses: ["overall"] },
    { key: "rateModel", label: "Exchange-rate model", focuses: ["overall", "price"] },
    { key: "feeModel", label: "Fees to compare", focuses: ["overall", "price"] },
    { key: "delivery", label: "Delivery", focuses: ["overall", "delivery"] },
    { key: "access", label: "Access and eligibility", focuses: ["overall", "delivery"] },
  ];

  return (
    <section className={styles.comparison} aria-labelledby={`${id}-title`}>
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Provider comparison</p>
        <h2 id={`${id}-title`}>Compare the service behind the quote</h2>
        <p>Choose two companies to compare pricing terms, practical limits and customer feedback. The better fit depends on the transfer you need to make.</p>
      </div>
      <div className={styles.selectors}>
        <label htmlFor={`${id}-left`}>First provider
          <select aria-label="First provider" id={`${id}-left`} value={left.slug} onChange={(event) => setLeftSlug(event.target.value)}>
            {available.map((profile) => <option key={profile.slug} value={profile.slug} disabled={profile.slug === right.slug}>{profile.name}</option>)}
          </select>
        </label>
        <label htmlFor={`${id}-right`}>Compare with
          <select aria-label="Compare with" id={`${id}-right`} value={right.slug} onChange={(event) => setRightSlug(event.target.value)}>
            {available.map((profile) => <option key={profile.slug} value={profile.slug} disabled={profile.slug === left.slug}>{profile.name}</option>)}
          </select>
        </label>
      </div>
      <div className={styles.focusButtons} role="group" aria-label="Comparison focus">
        {focusOptions.map((option) => <button key={option.value} type="button" aria-pressed={focus === option.value}
          className={focus === option.value ? styles.activeFocus : undefined} onClick={() => setFocus(option.value)}>{option.label}</button>)}
      </div>
      <div className={styles.results} aria-live="polite" aria-atomic="false">
        <div className={styles.providerHeadings}>
          <p className={styles.comparisonLabel}>{focusOptions.find((option) => option.value === focus)?.label}</p>
          {[left, right].map((profile) => <div key={profile.slug} className={styles.providerHeading}>
            <h3>{profile.name}</h3><p>{profile.category}</p><a href={`/reviews/${profile.slug}`}>Read our review <span aria-hidden="true">→</span></a>
          </div>)}
        </div>
        <dl className={styles.fields}>
          {fields.filter((field) => field.focuses.includes(focus)).map((field) => <div className={styles.comparisonRow} key={field.key}>
            <dt>{field.label}</dt>
            {[left, right].map((profile) => <dd key={profile.slug}><span className={styles.mobileProvider}>{profile.name}</span><p>{profile[field.key]}</p></dd>)}
          </div>)}
          {(focus === "overall" || focus === "feedback") && <div className={styles.comparisonRow}>
            <dt>Customer feedback</dt>
            {[left, right].map((profile) => <dd key={profile.slug}><span className={styles.mobileProvider}>{profile.name}</span><Feedback profile={profile} expanded={focus === "feedback"} /></dd>)}
          </div>}
        </dl>
      </div>
      {(focus === "overall" || focus === "price") && <p className={styles.note}>These are service and pricing models, not live quotes. Use current verified quotes for the same route, funding method and payout method to compare the total paid with the amount the recipient receives.</p>}
      {(focus === "overall" || focus === "feedback") && <p className={styles.note}>Customer scores belong to the linked review sources and are separate from our editorial ratings. Review profiles can cover different products, countries and periods, so their scores do not establish an overall winner.</p>}
    </section>
  );
}
