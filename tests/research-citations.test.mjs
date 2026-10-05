import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../", import.meta.url));
function loadTypescript(file, mocks = {}) {
  const source = readFileSync(path.join(root, file), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const loadedModule = { exports: {} };
  new Function("exports", "require", "module", compiled)(loadedModule.exports, (name) => Object.hasOwn(mocks, name) ? mocks[name] : require(name), loadedModule);
  return loadedModule.exports;
}
const citations = loadTypescript("lib/research-citations.ts");
const { ResearchCitation } = loadTypescript("components/ResearchCitation.tsx", {
  "@/lib/research-citations": citations,
  "./ResearchCitation.module.css": { __esModule: true, default: {} },
});
const ids = ["last-mile-tax", "uk-remittance-vulnerability-index"];

for (const id of ids) {
  test(`${id}: citation edition and distributions agree with the archived release`, () => {
    const study = citations.getResearchCitation(id);
    const releaseDirectory = path.join(root, "research-releases", study.tag);
    const cff = readFileSync(path.join(releaseDirectory, "CITATION.cff"), "utf8");
    assert.ok(cff.includes(`title: "${study.dataTitle}"`));
    assert.ok(cff.includes(`version: ${study.version}`));
    assert.ok(cff.includes(`date-released: ${study.snapshotDate}`));
    assert.ok(cff.includes(`url: "${study.canonicalUrl}"`));
    assert.ok(Date.parse(study.releasePublished) >= Date.parse(study.snapshotDate));
    assert.equal(study.releasePublished, "2026-08-25");
    for (const field of ["citationUrl", "licenceUrl", "attributionUrl", "methodologyUrl", "checksumUrl"]) {
      const url = new URL(study[field]);
      assert.equal(url.hostname, "raw.githubusercontent.com");
      assert.ok(url.pathname.includes(`/${study.releaseCommit}/research-releases/${study.tag}/`));
      assert.ok(readFileSync(path.join(releaseDirectory, path.basename(url.pathname)), "utf8").trim());
    }
    for (const file of study.files) {
      const csv = readFileSync(path.join(releaseDirectory, "data", file.file), "utf8");
      assert.equal(csv.trimEnd().split(/\r?\n/).length - 1, file.rows);
      assert.ok(file.url.includes(`/${study.releaseCommit}/research-releases/${study.tag}/data/`));
    }
  });

  test(`${id}: Dataset schema describes the frozen files and links to its report`, () => {
    const study = citations.getResearchCitation(id);
    const schema = citations.researchDatasetSchema(id);
    assert.equal(schema["@type"], "Dataset");
    assert.equal(schema["@id"], study.datasetId);
    assert.equal(schema.isPartOf["@id"], study.reportId);
    assert.equal(schema.dateCreated, study.snapshotDate);
    assert.equal(schema.datePublished, study.releasePublished);
    assert.equal(schema.license, study.licenceUrl);
    assert.equal(schema.usageInfo, study.attributionUrl);
    assert.match(schema.conditionsOfAccess, /original selection, arrangement, calculations and documentation/);
    assert.match(schema.conditionsOfAccess, /World Bank data retain their licence and additional terms/);
    assert.match(schema.description, /Q3 2025/);
    assert.deepEqual(schema.distribution.map((file) => file.contentUrl), study.files.map((file) => file.url));
    assert.ok(schema.distribution.every((file) => file.encodingFormat === "text/csv" && !file.contentUrl.includes("/api/")));
  });

  test(`${id}: rendered citation keeps dates, caveats and verifiable downloads visible`, () => {
    const study = citations.getResearchCitation(id);
    const html = renderToStaticMarkup(React.createElement(ResearchCitation, { studyId: id }));
    assert.match(html, /id="cite-this-study"/);
    assert.match(html, /id="dataset-v1-0-0"/);
    assert.match(html, /23 August 2026/);
    assert.match(html, /25 August 2026/);
    assert.match(html, /6 October 2026/);
    assert.match(html, /These are derived tables/);
    for (const url of [study.canonicalUrl, study.archiveUrl, study.citationUrl, study.checksumUrl, study.licenceUrl, study.attributionUrl, ...study.files.map((file) => file.url)]) {
      assert.ok(html.includes(`href="${url}"`), `Missing visible resource link: ${url}`);
    }
    const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    assert.equal(scripts.length, 1);
    assert.deepEqual(JSON.parse(scripts[0][1]), citations.researchDatasetSchema(id));
    if (id === "last-mile-tax") {
      assert.match(html, /not a captured £200 quote/);
      assert.match(html, /ITU-origin internet-use fields/);
      const header = readFileSync(path.join(root, "research-releases", study.tag, "data/corridor-summary.csv"), "utf8").split(/\r?\n/)[0];
      assert.doesNotMatch(header, /internet_use/);
    } else {
      assert.match(html, /Quote-summary fields in the archived panel are historical/);
      assert.match(html, /no synthetic vulnerability score/);
    }
  });
}