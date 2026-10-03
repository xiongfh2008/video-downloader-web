import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
    "MP4 downloader",
    "MP3 downloader",
    "subtitle downloader",
  ],
  authors: [{ name: "Vidsavey" }],
  robots: { index: true, follow: true },
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
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
