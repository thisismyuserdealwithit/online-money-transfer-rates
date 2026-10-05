import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (filename) => readFileSync(path.join(root, filename), "utf8");
const parse = (filename) => JSON.parse(read(filename));
const api = parse("public/openapi.json");
const researchPaths = Object.keys(api.paths).filter((route) => route.startsWith("/api/research/"));

test("OpenAPI describes the real research handlers with unique operations and resolvable schemas", () => {
  assert.equal(researchPaths.length, 9);
  const ids = [];
  for (const [route, item] of Object.entries(api.paths)) {
    const filename = "app" + route.replace(/\{([^}]+)\}/g, "[$1]") + "/route.ts";
    assert.ok(existsSync(path.join(root, filename)), "Documented route exists: " + route);
    for (const method of ["get", "options"]) if (item[method]) ids.push(item[method].operationId);
  }
  assert.equal(new Set(ids).size, ids.length);
  function inspect(value) {
    if (!value || typeof value !== "object") return;
    if (value.$ref) {
      assert.ok(value.$ref.startsWith("#/"));
      const target = value.$ref.slice(2).split("/").reduce((parent, key) => parent?.[key.replaceAll("~1", "/").replaceAll("~0", "~")], api);
      assert.ok(target, "Resolves " + value.$ref);
    }
    for (const child of Object.values(value)) inspect(child);
  }
  inspect(api);
  const weekly = api.paths["/api/research/weekly-transfer-costs"].get;
  assert.deepEqual(Object.keys(weekly.responses), ["200", "400", "404", "503"]);
  assert.deepEqual(weekly.parameters.find((entry) => entry.name === "format").schema.enum, ["json", "csv"]);
  assert.ok(api.components.schemas.Rate.required.includes("priceRank"));
  assert.ok(api.components.schemas.Snapshot.required.includes("rankedRateCount"));
  assert.ok(api.components.schemas.RatesResponse.required.includes("available"));
});

test("both API indexes and the catalogue expose each research service", () => {
  const normal = parse("public/apis.json");
  const wellKnown = parse("public/.well-known/apis.json");
  assert.deepEqual(normal.apis, wellKnown.apis);
  const output = ts.transpileModule(read("lib/api-discovery.ts"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const loadedModule = { exports: {} };
  new Function("require", "module", "exports", output)((specifier) => parse(specifier.slice(2)), loadedModule, loadedModule.exports);
  const { apiCatalog } = loadedModule.exports;
  for (const route of researchPaths) {
    assert.ok(apiCatalog.linkset.some((entry) => entry.item.some((item) => item.href === "https://onlinemoneytransfer.co.uk" + route)), "Catalogue exposes " + route);
  }
  for (const key of ["vulnerability-index", "last-mile-tax", "weekly-transfer-costs"]) {
    assert.ok(normal.apis.some((entry) => entry.baseURL.endsWith("/api/research/" + key)));
  }
});

test("Postman includes every research endpoint and both weekly formats", () => {
  const collection = parse("public/omt-rates.postman_collection.json");
  for (const route of researchPaths) assert.ok(collection.item.some((entry) => entry.request.url.raw.split("?")[0] === "{{baseUrl}}" + route), "Postman exposes " + route);
  for (const format of ["json", "csv"]) assert.ok(collection.item.some((entry) => entry.request.url.raw.includes("/weekly-transfer-costs?") && entry.request.url.query.some((parameter) => parameter.key === "format" && parameter.value === format)));
});
