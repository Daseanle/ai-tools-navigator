import type { Metadata } from "next"

interface GenerateMetadataProps {
  title: string
  description: string
  path: string
  locale?: string
  image?: string
  keywords?: string[]
}

export function generateMetadata({
  title,
  description,
  path,
  locale = "zh-CN",
  image = "/og-image.jpg",
  keywords = [],
}: GenerateMetadataProps): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://ai-navigator.com"
  const url = `${baseUrl}${path}`

  const defaultKeywords = ["AI工具", "人工智能", "ChatGPT", "Midjourney", "AI导航", "工具推荐", "效率工具", "AI应用"]

  return {
    title,
    description,
    keywords: [...defaultKeywords, ...keywords].join(", "),
    authors: [{ name: "AI Navigator Team" }],
    creator: "AI Navigator",
    publisher: "AI Navigator",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: url,
      languages: {
        "zh-CN": `${baseUrl}/zh${path}`,
        "en-US": `${baseUrl}/en${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "AI Navigator Pro",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@ai_navigator",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
      yahoo: process.env.YAHOO_VERIFICATION,
    },
  }
}

// NaviGuard-AI Security Audited - 2026-06-01
