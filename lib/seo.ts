import type { Metadata } from "next";

export const siteUrl = "https://onlinemoneytransfer.co.uk";
export const siteName = "Online Money Transfer";
export const defaultDescription =
  "Compare what international transfer companies deliver for the same amount, then open the dated provider receipt behind each result.";
export const socialImagePath = "/opengraph-image";

type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  absoluteTitle?: boolean;
  noIndex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  socialTitle?: string;
  socialDescription?: string;
};

function absoluteUrl(path: string) {
  return new URL(path || "/", siteUrl).toString();
}

export function pageMetadata({
  title,
  description,
  path,
  type = "website",
  absoluteTitle = false,
  noIndex = false,
  publishedTime,
  modifiedTime,
  authors,
  socialTitle = title,
  socialDescription = description,
}: PageMetadataOptions): Metadata {
  const url = absoluteUrl(path);
  const image = {
    url: absoluteUrl(socialImagePath),
    width: 1200,
    height: 630,
    alt: "Online Money Transfer rate comparisons with dated provider evidence",
  };
  const openGraph: NonNullable<Metadata["openGraph"]> =
    type === "article"
      ? {
          type: "article",
          title: socialTitle,
          description: socialDescription,
          url,
          siteName,
          locale: "en_GB",
          images: [image],
          publishedTime,
          modifiedTime,
          authors,
        }
      : {
          type: "website",
          title: socialTitle,
          description: socialDescription,
          url,
          siteName,
          locale: "en_GB",
          images: [image],
        };

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: socialDescription,
      images: [image.url],
    },
    robots: noIndex
      ? {
          index: false,
          follow: true,
          googleBot: { index: false, follow: true },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
}
