import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import {
  getDictionary,
  I18N_LANGS,
  isLang,
  languageAlternates,
} from "../../i18n";
import "../../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return I18N_LANGS.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const { meta } = getDictionary(lang);
  return {
    metadataBase: new URL("https://vidsavey.com"),
    title: meta.title,
    description: meta.description,
    keywords: [...meta.keywords],
    authors: [{ name: "Vidsavey" }],
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/${lang}`,
      languages: languageAlternates("/"),
    },
    icons: {
      icon: "/vidsavey-mark.svg",
      shortcut: "/vidsavey-mark.svg",
      apple: "/vidsavey-mark.svg",
    },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      url: `https://vidsavey.com/${lang}`,
      siteName: "Vidsavey",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: meta.twitterTitle,
      description: meta.twitterDescription,
    },
  };
}

export default async function I18nRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  return (
    <html
      lang={lang}
      // 阿拉伯语等 RTL 语言在 html 上声明书写方向，其余保持 LTR。
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
