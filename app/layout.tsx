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
  title: "Video Downloader - Download Videos Online",
  description:
    "Download videos online quickly and easily. Paste a video URL to analyze and download videos in MP4 or MP3 format.",
  keywords:
    "video downloader, online video downloader, download videos, mp4 downloader, mp3 downloader",
  authors: [{ name: "Video Downloader" }],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Video Downloader - Download Videos Online",
    description:
      "Download videos online quickly and easily. Paste a video URL to analyze and download videos in MP4 or MP3 format.",
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
