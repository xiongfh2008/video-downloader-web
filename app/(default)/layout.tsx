import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClarityAnalytics } from "../../components/clarity-analytics";
import "../globals.css";
import { languageAlternates } from "../i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vidsavey.com"),
  title: "Vidsavey - Free Online Video Downloader",
  description:
    "Download videos online quickly and easily with Vidsavey. Save supported videos as MP4 or MP3 and download available subtitles.",
  keywords: [
    "Vidsavey",
    "video downloader",
    "online video downloader",
    "youtube videodownloader",
    "youtube downloader",
    "youtube to mp4",
    "youtube videodownload",
    "MP4 downloader",
    "MP3 downloader",
    "subtitle downloader",
  ],
  authors: [{ name: "Vidsavey" }],
  robots: { index: true, follow: true },
  // 站长工具所有权验证（Bing / Google / Yandex）
  verification: {
    google: "HlRSZuWQQ8N1mwTfdCsvenr8cyNwrQ7FJajWclMj60Y",
    yandex: "bd9ab20df3227d5a",
    other: { "msvalidate.01": "637B49DDC622A1D04AD4DDB6345E9C65" },
  },
  alternates: {
    canonical: "/",
    languages: languageAlternates("/"),
  },
  twitter: {
    card: "summary",
    title: "Vidsavey - Free Online Video Downloader",
    description:
      "Download videos online quickly and easily with Vidsavey. Save supported videos as MP4 or MP3.",
  },
  icons: {
    icon: "/vidsavey-mark.svg",
    shortcut: "/vidsavey-mark.svg",
    apple: "/vidsavey-mark.svg",
  },
  openGraph: {
    title: "Vidsavey - Free Online Video Downloader",
    description:
      "Download supported videos online as MP4 or MP3 with Vidsavey.",
    url: "https://vidsavey.com",
    siteName: "Vidsavey",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ClarityAnalytics />
        {children}
      </body>
    </html>
  );
}
