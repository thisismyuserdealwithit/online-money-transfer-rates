import { readFile } from "node:fs/promises";

const origin = "https://onlinemoneytransfer.co.uk";
const key = "9b0465a5dc7ca4fefb6b930e77fe93e0";
const keyLocation = `${origin}/${key}.txt`;

async function sitemapUrls() {
  const response = await fetch(`${origin}/sitemap.xml`, {
    headers: { "user-agent": "OMT-IndexNow/1.0" },
  });
  if (!response.ok) throw new Error(`Sitemap request failed with ${response.status}`);
  const xml = await response.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

const discoveryUrls = [
  `${origin}/api`,
  `${origin}/openapi.json`,
  `${origin}/.well-known/apis.json`,
  `${origin}/.well-known/api-catalog`,
  `${origin}/omt-rates.postman_collection.json`,
];

const urls = [...new Set([...(await sitemapUrls()), ...discoveryUrls])]
  .filter((url) => new URL(url).origin === origin)
  .slice(0, 10_000);

if (process.env.INDEXNOW_DRY_RUN === "1") {
  const keyFile = (await readFile(new URL(`../public/${key}.txt`, import.meta.url), "utf8")).trim();
  if (keyFile !== key) throw new Error("IndexNow key file does not match the submitted key");
  console.log(JSON.stringify({ host: new URL(origin).host, keyLocation, urlCount: urls.length }, null, 2));
  process.exit(0);
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: {
    "content-type": "application/json; charset=utf-8",
    "user-agent": "OMT-IndexNow/1.0",
  },
  body: JSON.stringify({
    host: new URL(origin).host,
    key,
    keyLocation,
    urlList: urls,
  }),
});

if (![200, 202].includes(response.status)) {
  throw new Error(`IndexNow submission failed with ${response.status}: ${await response.text()}`);
}

console.log(`IndexNow accepted ${urls.length} OMT URLs with HTTP ${response.status}.`);
