import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
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
