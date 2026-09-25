import { UnsupportedRouteError } from "./providers/shared.mjs";

export function cacheCaptureFailure(error) {
  return {
    message: error instanceof Error ? error.message : String(error),
    unsupported: error instanceof UnsupportedRouteError,
  };
}

export function cachedCaptureError(failure) {
  return failure.unsupported
    ? new UnsupportedRouteError(`Equivalent quote is unsupported in this run: ${failure.message}`)
    : new Error(`Equivalent quote already failed in this run: ${failure.message}`);
}

export function summarizeProviders(providers, outcomes) {
  const adapters = new Map(providers.map((provider) => [provider.slug, provider]));
  const slugs = [...new Set([
    ...adapters.keys(),
    ...outcomes.map((item) => item.provider),
  ])];

  return slugs.map((slug) => {
    const items = outcomes.filter((item) => item.provider === slug);
    const errors = new Map();
    for (const item of items) {
      if (item.status !== "failed") continue;
      const reason = item.error || "Unknown failure";
      errors.set(reason, (errors.get(reason) || 0) + 1);
    }
    return {
      provider: slug,
      // A comparison source emits quotes under their actual provider slugs.
      kind: typeof adapters.get(slug)?.captureAll === "function" ? "comparison-source" : "provider",
      stored: items.filter((item) => item.status === "stored").length,
      failed: items.filter((item) => item.status === "failed").length,
      unsupported: items.filter((item) => item.status === "unsupported").length,
      errors: [...errors.entries()].map(([error, count]) => ({ error, count })),
    };
  });
}
