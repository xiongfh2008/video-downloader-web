import { ar } from "./dictionaries/ar";
import { de } from "./dictionaries/de";
import { en } from "./dictionaries/en";
import { es } from "./dictionaries/es";
import { fr } from "./dictionaries/fr";
import { hi } from "./dictionaries/hi";
import { id } from "./dictionaries/id";
import { it } from "./dictionaries/it";
import { ja } from "./dictionaries/ja";
import { ko } from "./dictionaries/ko";
import { nl } from "./dictionaries/nl";
import { pl } from "./dictionaries/pl";
import { pt } from "./dictionaries/pt";
import { ru } from "./dictionaries/ru";
import { th } from "./dictionaries/th";
import { tr } from "./dictionaries/tr";
import { vi } from "./dictionaries/vi";
import { zh } from "./dictionaries/zh";

export const DEFAULT_LANG = "en";

// LANGS：站点全部语言（默认语言走根路径，其余走 /{lang} 子目录）。
export const LANGS = [
  DEFAULT_LANG,
  "es",
  "pt",
  "fr",
  "de",
  "it",
  "ru",
  "id",
  "ja",
  "ko",
  "vi",
  "th",
  "tr",
  "zh",
  "hi",
  "ar",
  "nl",
  "pl",
] as const;

// I18N_LANGS：使用 /{lang} 前缀路由的非默认语言（(i18n)/[lang] 组的 generateStaticParams 数据源）。
export const I18N_LANGS = [
  "es",
  "pt",
  "fr",
  "de",
  "it",
  "ru",
  "id",
  "ja",
  "ko",
  "vi",
  "th",
  "tr",
  "zh",
  "hi",
  "ar",
  "nl",
  "pl",
] as const;

export type Lang = (typeof LANGS)[number];

export type Dictionary = typeof en;

// 各语言的自称（endonym）：语言切换菜单按惯例显示语言自称而非当前语言译文。
export const LANG_NAMES: Record<Lang, string> = {
  en: "English",
  es: "Español",
  pt: "Português",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  ru: "Русский",
  id: "Bahasa Indonesia",
  ja: "日本語",
  ko: "한국어",
  vi: "Tiếng Việt",
  th: "ไทย",
  tr: "Türkçe",
  zh: "中文",
  hi: "हिन्दी",
  ar: "العربية",
  nl: "Nederlands",
  pl: "Polski",
};

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

const DICTIONARIES: Record<Lang, Dictionary> = {
  en,
  es,
  pt,
  fr,
  de,
  it,
  ru,
  id,
  ja,
  ko,
  vi,
  th,
  tr,
  zh,
  hi,
  ar,
  nl,
  pl,
};

export function getDictionary(lang: Lang): Dictionary {
  return DICTIONARIES[lang];
}

// 生成 hreflang 互指集群：默认语言无前缀，其余带 /{lang} 前缀，x-default 指向默认语言。
export function languageAlternates(path: string): Record<string, string> {
  return {
    [DEFAULT_LANG]: path,
    ...Object.fromEntries(
      I18N_LANGS.map((lang) => [lang, `/${lang}${path === "/" ? "" : path}`]),
    ),
    "x-default": path,
  };
}
