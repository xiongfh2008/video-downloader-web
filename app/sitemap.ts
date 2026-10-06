import type { MetadataRoute } from "next";
import { I18N_LANGS, languageAlternates } from "./i18n";

const SITE_URL = "https://vidsavey.com";

// 将 hreflang 路径集群转成 sitemap 要求的绝对 URL 集群。
function alternateUrls(path: string): Record<string, string> {
  return Object.fromEntries(
    Object.entries(languageAlternates(path)).map(([lang, url]) => [
      lang,
      `${SITE_URL}${url}`,
    ]),
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages: alternateUrls("/") },
    },
    ...I18N_LANGS.map((lang) => ({
      url: `${SITE_URL}/${lang}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
      alternates: { languages: alternateUrls("/") },
    })),
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];
}
