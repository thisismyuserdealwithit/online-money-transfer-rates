import { fillTrackingTemplate, getAffiliateDestination } from "@/lib/affiliate";
import { batch } from "@/lib/platform-runtime";

const safeValue = (value: string | null, fallback: string, max = 100) => {
  if (!value) return fallback;
  const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, max);
  return cleaned || fallback;
};

function readCookie(request: Request, name: string) {
  const cookies = request.headers.get("cookie") ?? "";
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function sha256(value: string) {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function sameSiteReferrerPath(request: Request) {
  const referrer = request.headers.get("referer");
  if (!referrer) return null;
  try {
    const referrerUrl = new URL(referrer);
    const currentUrl = new URL(request.url);
    return referrerUrl.origin === currentUrl.origin ? referrerUrl.pathname.slice(0, 250) : null;
  } catch {
    return null;
  }
}

async function recordClick(input: {
  id: string;
  providerSlug: string;
  corridorSlug: string | null;
  placement: string;
  destinationHost: string;
  commercial: boolean;
  consentMode: "essential" | "analytics";
  sessionHash: string | null;
  referrerPath: string | null;
  clickedAt: string;
}) {
  await batch([
    { sql: `CREATE TABLE IF NOT EXISTS affiliate_clicks (
      id TEXT PRIMARY KEY NOT NULL,
      provider_slug TEXT NOT NULL,
      corridor_slug TEXT,
      placement TEXT NOT NULL,
      destination_host TEXT NOT NULL,
      commercial INTEGER DEFAULT 0 NOT NULL,
      consent_mode TEXT NOT NULL,
      session_hash TEXT,
      referrer_path TEXT,
      clicked_at TEXT NOT NULL
    )` },
    { sql: "CREATE INDEX IF NOT EXISTS affiliate_clicks_provider_date_idx ON affiliate_clicks (provider_slug, clicked_at)" },
    { sql: "CREATE INDEX IF NOT EXISTS affiliate_clicks_corridor_date_idx ON affiliate_clicks (corridor_slug, clicked_at)" },
    {
      sql: `INSERT INTO affiliate_clicks (
        id, provider_slug, corridor_slug, placement, destination_host, commercial,
        consent_mode, session_hash, referrer_path, clicked_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: [input.id, input.providerSlug, input.corridorSlug, input.placement, input.destinationHost, input.commercial ? 1 : 0, input.consentMode, input.sessionHash, input.referrerPath, input.clickedAt],
    },
  ]);
}

export async function GET(request: Request, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;
  const providerSlug = safeValue(provider, "", 60);
  const entry = getAffiliateDestination(providerSlug);
  if (!providerSlug || !entry) return new Response("Provider link not found", { status: 404 });

  const requestUrl = new URL(request.url);
  const corridorSlug = safeValue(requestUrl.searchParams.get("corridor"), "", 100) || null;
  const placement = safeValue(requestUrl.searchParams.get("placement"), "general", 60);
  const id = `clk_${crypto.randomUUID().replaceAll("-", "")}`;
  const consentMode = readCookie(request, "omt_consent") === "analytics" ? "analytics" : "essential";
  let sessionId = readCookie(request, "omt_affiliate_session");
  const shouldSetSession = consentMode === "analytics" && !sessionId;
  if (consentMode === "analytics" && !sessionId) sessionId = crypto.randomUUID();
  const sessionHash = sessionId ? (await sha256(sessionId)).slice(0, 32) : null;

  const destination = fillTrackingTemplate(entry.url, {
    click_id: id,
    corridor: corridorSlug ?? "general",
    placement,
  });
  const destinationUrl = new URL(destination);

  try {
    await recordClick({
      id,
      providerSlug,
      corridorSlug,
      placement,
      destinationHost: destinationUrl.hostname,
      commercial: entry.commercial,
      consentMode,
      sessionHash,
      referrerPath: sameSiteReferrerPath(request),
      clickedAt: new Date().toISOString(),
    });
  } catch {
    // A provider visit must not fail because analytics storage is unavailable.
  }

  const response = new Response(null, {
    status: 302,
    headers: {
      location: destinationUrl.toString(),
      "cache-control": "no-store",
      "referrer-policy": "strict-origin-when-cross-origin",
    },
  });
  if (shouldSetSession && sessionId) {
    response.headers.append("set-cookie", `omt_affiliate_session=${encodeURIComponent(sessionId)}; Max-Age=15552000; Path=/; SameSite=Lax; Secure; HttpOnly`);
  }
  return response;
}
