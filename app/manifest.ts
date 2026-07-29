import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Online Money Transfer",
    short_name: "OMT Rates",
    description:
      "Independent UK money transfer rate checks with dated provider receipts.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f2e9",
    theme_color: "#112343",
    lang: "en-GB",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
