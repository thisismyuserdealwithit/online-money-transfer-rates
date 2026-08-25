import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  trailingSlash: false,
  experimental: {
    cpus: 2,
  },
  async headers() {
    return [
      {
        source: "/",
        headers: [
          { key: "Link", value: '</.well-known/api-catalog>; rel="api-catalog", </openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json"' },
        ],
      },
      {
        source: "/api",
        headers: [
          { key: "Link", value: '</.well-known/api-catalog>; rel="api-catalog", </openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json", </apis.json>; rel="service-meta"; type="application/json"' },
        ],
      },
      {
        source: "/.well-known/api-catalog",
        headers: [
          { key: "Content-Type", value: 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"' },
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Link", value: '</.well-known/api-catalog>; rel="api-catalog", </openapi.json>; rel="service-desc"; type="application/vnd.oai.openapi+json"' },
        ],
      },
      {
        source: "/openapi.json",
        headers: [
          { key: "Content-Type", value: "application/vnd.oai.openapi+json;version=3.1" },
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        source: "/.well-known/apis.json",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        source: "/apis.json",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        source: "/omt-rates.postman_collection.json",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        source: "/omt-rates.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },
  webpack(config, { webpack }) {
    const renderAdapter = path.join(root, "lib/platform-render.ts");
    config.resolve.alias["@/lib/platform-runtime"] = renderAdapter;
    config.resolve.alias[path.join(root, "lib/platform-runtime.ts")] = renderAdapter;
    config.resolve.alias[path.join(root, "lib/platform-runtime")] = renderAdapter;
    config.plugins.push(new webpack.NormalModuleReplacementPlugin(
      /[\\/]lib[\\/]platform-runtime(?:\.ts)?$/,
      renderAdapter,
    ));
    return config;
  },
};

export default nextConfig;
