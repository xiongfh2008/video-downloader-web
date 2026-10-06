import type { MetadataRoute } from "next";

const SITE_URL = "https://vidsavey.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // 常规搜索引擎
      { userAgent: "*", allow: "/" },
      // GEO：显式允许主流 AI 爬虫抓取，便于 AI 搜索引擎引用站点内容
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-SearchBot",
          "anthropic-ai",
          "PerplexityBot",
          "Google-Extended",
          "Applebot-Extended",
          "CCBot",
        ],
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
