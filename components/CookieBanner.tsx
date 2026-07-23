"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Consent = "essential" | "analytics";

function saveConsent(value: Consent) {
  document.cookie = `omt_consent=${value}; Max-Age=15552000; Path=/; SameSite=Lax; Secure`;
  window.localStorage.setItem("omt_consent", value);
  window.dispatchEvent(new CustomEvent("omt-consent", { detail: value }));
}

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const match = document.cookie.match(/(?:^|; )omt_consent=(essential|analytics)(?:;|$)/);
      const saved = match?.[1] ?? window.localStorage.getItem("omt_consent");
      setVisible(saved !== "essential" && saved !== "analytics");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function choose(value: Consent) {
    saveConsent(value);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside className="cookie-banner" role="dialog" aria-modal="false" aria-labelledby="cookie-title">
      <div>
        <strong id="cookie-title">A brief word about cookies</strong>
        <p>One cookie remembers the choice you make here. If you agree, a random identifier also tells us which provider links people use. It is not an advertising profile. <Link href="/cookie-policy">See the cookie details</Link>.</p>
      </div>
      <div className="cookie-actions">
        <button type="button" className="cookie-secondary" onClick={() => choose("essential")}>Use essential cookies only</button>
        <button type="button" className="cookie-primary" onClick={() => choose("analytics")}>Allow anonymous link measurement</button>
      </div>
    </aside>
  );
}
