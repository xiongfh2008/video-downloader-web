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
  title: "Vidsavey - Free YouTube Downloader | YouTube to MP4 & MP3",
  description:
    "Vidsavey is a free online YouTube video downloader. Download and save YouTube videos as MP4 or MP3 quickly and easily — no software installation required.",
  keywords:
    "vidsavey, youtube videodownloader, youtube downloader, youtube to mp4, youtube videodownload, online video downloader, download youtube videos, mp4 downloader, mp3 downloader",
  authors: [{ name: "Vidsavey" }],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Vidsavey - Free YouTube Downloader | YouTube to MP4 & MP3",
    description:
      "Vidsavey is a free online YouTube video downloader. Download and save YouTube videos as MP4 or MP3 quickly and easily — no software installation required.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
