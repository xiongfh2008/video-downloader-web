import type { MetadataRoute } from "next";
import { I18N_LANGS, languageAlternates } from "./i18n";

const SITE_URL = "https://vidsavey.com";

// 内容最后一次实质更新的日期（多语言 + 站长验证完成）。
// 固定日期而非 new Date()：lastmod 若随每次构建漂移，搜索引擎会视为噪声并忽略该信号。
const CONTENT_LAST_MODIFIED = new Date("2026-10-07");

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
      // 首页带尾斜杠，与页面 canonical（"/" → https://vidsavey.com/）保持同一 URL 形态。
      url: `${SITE_URL}/`,
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages: alternateUrls("/") },
    },
    ...I18N_LANGS.map((lang) => ({
      url: `${SITE_URL}/${lang}`,
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: "weekly" as const,
      priority: 1,
      alternates: { languages: alternateUrls("/") },
    })),
    {
      url: `${SITE_URL}/privacy`,
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: CONTENT_LAST_MODIFIED,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];
}
