/**
 * Validation-only Node loader for Cloudflare's workerd-native module.
 * Production resolves cloudflare:workers natively. The artifact validator only
 * needs to import the worker and inspect its default fetch export.
 */
export async function resolve(specifier, context, nextResolve) {
  if (specifier === "cloudflare:workers") {
    return {
      url: "data:text/javascript,export const env={};",
      shortCircuit: true,
    };
  }
  return nextResolve(specifier, context);
}
