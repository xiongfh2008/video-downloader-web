"use client";

import { useState } from "react";
import Link from "next/link";

type AnalyzeStatus = "idle" | "loading" | "success" | "error";
type SubtitleType = "manual" | "automatic";
type SubtitleFormat = "vtt" | "srt";
type DownloadMode = "mp4" | "mp3" | "subtitles";

interface SubtitleTrack {
  language: string;
  name: string;
  type: SubtitleType;
  formats: string[];
}

interface SubtitleInfo {
  available: boolean;
  tracks: SubtitleTrack[];
}

interface VideoInfo {
  id: string;
  title: string;
  uploader: string;
  duration: number;
  thumbnail: string;
  webpage_url: string;
  subtitles: SubtitleInfo;
}

interface VideoInfoResponse {
  success: boolean;
  data: VideoInfo;
}

type DownloadTaskStatus =
  | "idle"
  | "queued"
  | "preparing"
  | "downloading"
  | "processing"
  | "success"
  | "failed"
  | "expired";

interface DownloadCreateResponse {
  success: boolean;
  task_id: string;
  status: "queued";
  status_url: string;
}

interface DownloadTaskResponse {
  success: boolean;
  task_id: string;
  status: Exclude<DownloadTaskStatus, "idle">;
  progress: number;
  title: string | null;
  filename: string | null;
  size: number | null;
  error_code: string | null;
  error_message: string | null;
  download_url?: string;
}

interface ApiErrorResponse {
  detail?:
    | string
    | {
        code?: string;
        message?: string;
      };
}

class UserFacingError extends Error {}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const API_URL = `${API_BASE_URL}/api/video/info`;
const DOWNLOAD_API_URL = `${API_BASE_URL}/api/video/download`;
const TASK_API_BASE_URL = `${API_BASE_URL}/api/video/tasks`;
const FILE_API_BASE_URL = `${API_BASE_URL}/api/video/file`;

const DOWNLOAD_POLL_INTERVAL_MS = 1000;
const DOWNLOAD_POLL_TIMEOUT_MS = 60 * 60 * 1000;

// 基于 yt-dlp 支持站点列表精选的主流平台（https://github.com/yt-dlp/yt-dlp）
const platforms = [
  "YouTube",
  "TikTok",
  "Instagram",
  "Facebook",
  "X",
  "Twitch",
  "Reddit",
  "Vimeo",
  "Dailymotion",
  "Bilibili",
  "SoundCloud",
  "Pinterest",
  "Rumble",
  "Douyin",
  "Weibo",
] as const;

const howItWorks = [
  {
    title: "Paste URL",
    description: "Copy the video link and paste it into the input box above.",
    icon: "link",
  },
  {
    title: "Analyze Video",
    description: "Click Analyze and the video details will be fetched for you.",
    icon: "search",
  },
  {
    title: "Download File",
    description: "Choose MP4, MP3 or subtitles and save the file to your device.",
    icon: "download",
  },
] as const;

const features = [
  {
    title: "Fast Download",
    description: "Quickly process your video.",
    icon: "bolt",
  },
  {
    title: "Simple & Easy",
    description: "No complicated settings.",
    icon: "shield",
  },
  {
    title: "Mobile Friendly",
    description: "Works on desktop and mobile.",
    icon: "phone",
  },
] as const;

const faqItems = [
  {
    question: "Is Vidsavey free?",
    answer:
      "Yes. Vidsavey is a free online tool. You can analyze and download supported videos without creating an account.",
  },
  {
    question: "Which video platforms are supported?",
    answer:
      "Vidsavey supports popular video platforms including YouTube, TikTok, Instagram, Facebook, X, Twitch, Reddit, Vimeo, Dailymotion, Bilibili and hundreds more sites powered by yt-dlp. Availability may vary by individual video.",
  },
  {
    question: "Can I download MP3 audio?",
    answer:
      "Yes. After analyzing a video, select MP3 to download the audio track when the source is available.",
  },
  {
    question: "Can I download subtitles?",
    answer:
      "Yes. When subtitles are available, choose Subtitles, select a language and track type, then download VTT or SRT.",
  },
  {
    question: "Do I need to install any software?",
    answer:
      "No. Vidsavey runs in your browser. Paste a supported video URL, analyze it, and download the available format.",
  },
] as const;

// SEO / GEO：结构化数据（WebApplication + FAQPage），随 SSR 输出到首屏 HTML
const SITE_URL = "https://vidsavey.com";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Vidsavey",
      url: SITE_URL,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any",
      description:
        "Vidsavey is a free online video downloader. Paste a video URL to download supported videos as MP4 or MP3, plus available subtitles.",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ],
};

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(remainingSeconds).padStart(2, "0");

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${mm}:${ss}`;
  }

  return `${mm}:${ss}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function readApiError(response: Response) {
  try {
    const body = (await response.json()) as ApiErrorResponse;

    if (typeof body.detail === "string") {
      return { code: "", message: body.detail };
    }

    if (body.detail && typeof body.detail === "object") {
      return {
        code: body.detail.code ?? "",
        message: body.detail.message ?? "",
      };
    }
  } catch {
    // Fall through to the generic error below.
  }

  return { code: "", message: "" };
}

function getFriendlyErrorMessage(
  code: string | null | undefined,
  serverMessage: string | null | undefined,
  fallback: string,
) {
  switch (code) {
    case "invalid_url":
      return serverMessage || "Please enter a valid public video URL.";
    case "rate_limited":
      return "Too many requests. Please wait a moment and try again.";
    case "too_many_active_tasks":
      return "You already have too many active downloads. Please wait for one to finish.";
    case "queue_full":
      return "The server is busy right now. Please try again shortly.";
    case "storage_busy":
      return "The server is temporarily low on storage. Please try again later.";
    case "video_too_long":
      return "This video is longer than the supported limit.";
    case "video_too_large":
      return "This video is larger than the supported download limit.";
    case "source_unavailable":
      return "This video is unavailable or cannot be accessed.";
    case "subtitle_not_found":
      return "The selected subtitle could not be downloaded.";
    case "file_expired":
      return "This download has expired. Please create a new download.";
    case "service_restarted":
      return "The download was interrupted by a server restart. Please try again.";
    case "download_failed":
      return "Unable to download this video. Please try again.";
    case "internal_error":
      return "The server encountered an unexpected error. Please try again.";
    default:
      return serverMessage || fallback;
  }
}

function getDownloadStatusLabel(status: DownloadTaskStatus, progress: number) {
  switch (status) {
    case "queued":
      return "Queued";
    case "preparing":
      return "Preparing";
    case "downloading":
      return `Downloading ${progress}%`;
    case "processing":
      return "Processing";
    case "success":
      return "Download started";
    case "failed":
      return "Failed";
    case "expired":
      return "Expired";
    default:
      return "";
  }
}

function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width="32"
      height="32"
      aria-hidden="true"
      className={className}
      fill="none"
      style={{ width: 32, height: 32, flex: "0 0 32px" }}
    >
      <path
        d="M10 7.5c0-2.05 2.24-3.31 3.99-2.25l24.46 14.82c1.68 1.02 1.68 3.45 0 4.47L13.99 39.36C12.24 40.42 10 39.16 10 37.11V7.5Z"
        fill="#2563EB"
      />
      <path
        d="M18.25 15.25v17.5l14.5-8.75-14.5-8.75Z"
        fill="white"
      />
      <path
        d="M24 27.75v8.15m0 0-4.15-4.15M24 35.9l4.15-4.15"
        stroke="#2563EB"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SimpleIcon({
  name,
  className = "h-5 w-5",
}: {
  name: string;
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    width: 24,
    height: 24,
    style: { width: 24, height: 24, flex: "0 0 24px" },
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "link") {
    return (
      <svg {...common}>
        <path d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15" />
        <path d="M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 12 20l1.15-1.15" />
      </svg>
    );
  }

  if (name === "search") {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </svg>
    );
  }

  if (name === "download") {
    return (
      <svg {...common}>
        <path d="M12 3v11" />
        <path d="m8 10 4 4 4-4" />
        <path d="M5 20h14" />
      </svg>
    );
  }

  if (name === "bolt") {
    return (
      <svg {...common}>
        <path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z" />
      </svg>
    );
  }

  if (name === "shield") {
    return (
      <svg {...common}>
        <path d="M12 3 5 6v5c0 4.6 2.8 8.1 7 10 4.2-1.9 7-5.4 7-10V6l-7-3Z" />
        <path d="M12 7v10" />
      </svg>
    );
  }

  if (name === "phone") {
    return (
      <svg {...common}>
        <rect x="7" y="2.5" width="10" height="19" rx="2.2" />
        <path d="M10 5h4" />
        <path d="M11 18.5h2" />
      </svg>
    );
  }

  return null;
}

function PlatformBadge({ name }: { name: (typeof platforms)[number] }) {
  const styles: Record<(typeof platforms)[number], string> = {
    YouTube: "#ef4444",
    TikTok: "#0f172a",
    Instagram: "#ec4899",
    Facebook: "#2563eb",
    X: "#0f172a",
    Twitch: "#9146ff",
    Reddit: "#ff4500",
    Vimeo: "#1ab7ea",
    Dailymotion: "#2563eb",
    Bilibili: "#fb7299",
    SoundCloud: "#ff7700",
    Pinterest: "#e60023",
    Rumble: "#85c742",
    Douyin: "#161823",
    Weibo: "#e6162d",
  };

  const letters: Record<(typeof platforms)[number], string> = {
    YouTube: "▶",
    TikTok: "♪",
    Instagram: "◎",
    Facebook: "f",
    X: "X",
    Twitch: "T",
    Reddit: "r",
    Vimeo: "V",
    Dailymotion: "d",
    Bilibili: "B",
    SoundCloud: "S",
    Pinterest: "P",
    Rumble: "R",
    Douyin: "D",
    Weibo: "W",
  };

  return (
    <span className="vs-platform-badge">
      <span
        className="vs-platform-icon"
        style={{ backgroundColor: styles[name] }}
        aria-hidden="true"
      >
        {letters[name]}
      </span>
      {name}
    </span>
  );
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [downloadMode, setDownloadMode] = useState<DownloadMode>("mp4");
  const [subtitleLanguage, setSubtitleLanguage] = useState("");
  const [subtitleType, setSubtitleType] = useState<SubtitleType>("manual");
  const [subtitleFormat, setSubtitleFormat] = useState<SubtitleFormat>("vtt");
  const [analyzeStatus, setAnalyzeStatus] = useState<AnalyzeStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [thumbnailError, setThumbnailError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [downloadStatus, setDownloadStatus] =
    useState<DownloadTaskStatus>("idle");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [subtitleSearch, setSubtitleSearch] = useState("");

  const subtitleTracks = videoInfo?.subtitles?.tracks ?? [];
  const subtitlesAvailable =
    (videoInfo?.subtitles?.available ?? false) && subtitleTracks.length > 0;

  const currentSubtitleTrack = subtitleTracks.find(
    (track) =>
      track.language === subtitleLanguage && track.type === subtitleType,
  );

  const subtitleDownloadDisabled =
    downloadMode === "subtitles" &&
    (!currentSubtitleTrack ||
      currentSubtitleTrack.formats.length === 0 ||
      (subtitleFormat === "vtt" &&
        !currentSubtitleTrack.formats.includes("vtt")));

  const languageOptions: { value: string; label: string }[] = [];
  for (const track of subtitleTracks) {
    if (!languageOptions.some((option) => option.value === track.language)) {
      languageOptions.push({
        value: track.language,
        label: track.name || track.language,
      });
    }
  }

  languageOptions.sort((a, b) => a.label.localeCompare(b.label));

  const normalizedSubtitleSearch = subtitleSearch.trim().toLowerCase();
  const filteredLanguageOptions = languageOptions.filter((option) => {
    if (normalizedSubtitleSearch === "") return true;
    return (
      option.label.toLowerCase().includes(normalizedSubtitleSearch) ||
      option.value.toLowerCase().includes(normalizedSubtitleSearch)
    );
  });

  const currentLanguageOption = languageOptions.find(
    (option) => option.value === subtitleLanguage,
  );
  const visibleLanguageOptions =
    currentLanguageOption &&
    !filteredLanguageOptions.some(
      (option) => option.value === currentLanguageOption.value,
    )
      ? [currentLanguageOption, ...filteredLanguageOptions]
      : filteredLanguageOptions;

  const availableTypes: SubtitleType[] = [];
  if (
    subtitleTracks.some(
      (track) => track.language === subtitleLanguage && track.type === "manual",
    )
  ) {
    availableTypes.push("manual");
  }
  if (
    subtitleTracks.some(
      (track) =>
        track.language === subtitleLanguage && track.type === "automatic",
    )
  ) {
    availableTypes.push("automatic");
  }

  const handleAnalyze = async () => {
    if (analyzeStatus === "loading" || isDownloading) return;

    const trimmedUrl = url.trim();
    if (trimmedUrl === "") {
      setAnalyzeStatus("error");
      setErrorMessage("Please enter a video URL.");
      return;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      setAnalyzeStatus("error");
      setErrorMessage("Please enter a valid URL.");
      return;
    }

    setErrorMessage("");
    setDownloadError("");
    setVideoInfo(null);
    setThumbnailError(false);
    setAnalyzeStatus("loading");
    setDownloadMode("mp4");
    setSubtitleLanguage("");
    setSubtitleType("manual");
    setSubtitleFormat("vtt");
    setSubtitleSearch("");
    setDownloadStatus("idle");
    setDownloadProgress(0);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmedUrl }),
      });

      if (!response.ok) {
        const apiError = await readApiError(response);
        setAnalyzeStatus("error");
        setErrorMessage(
          getFriendlyErrorMessage(
            apiError.code,
            apiError.message,
            "Unable to analyze this video. Please try again.",
          ),
        );
        return;
      }

      const result: VideoInfoResponse = await response.json();
      if (!result.success) {
        setAnalyzeStatus("error");
        setErrorMessage("Unable to analyze this video. Please try again.");
        return;
      }

      setVideoInfo(result.data);
      setAnalyzeStatus("success");

      if (
        result.data.subtitles.available === true &&
        result.data.subtitles.tracks.length > 0
      ) {
        const firstTrack =
          result.data.subtitles.tracks.find(
            (track) => track.type === "manual",
          ) ?? result.data.subtitles.tracks[0];

        setSubtitleLanguage(firstTrack.language);
        setSubtitleType(firstTrack.type);
        setSubtitleFormat(
          firstTrack.formats.includes("vtt") ? "vtt" : "srt",
        );
      }
    } catch {
      setAnalyzeStatus("error");
      setErrorMessage("Unable to analyze this video. Please try again.");
    }
  };

  const handleSubtitleLanguageChange = (language: string) => {
    setSubtitleLanguage(language);
    const languageTracks = subtitleTracks.filter(
      (track) => track.language === language,
    );
    const nextType: SubtitleType = languageTracks.some(
      (track) => track.type === "manual",
    )
      ? "manual"
      : "automatic";
    setSubtitleType(nextType);
    const nextTrack = languageTracks.find((track) => track.type === nextType);
    setSubtitleFormat(nextTrack?.formats.includes("vtt") ? "vtt" : "srt");
  };

  const handleSubtitleTypeChange = (type: SubtitleType) => {
    setSubtitleType(type);
    const nextTrack = subtitleTracks.find(
      (track) => track.language === subtitleLanguage && track.type === type,
    );
    setSubtitleFormat(nextTrack?.formats.includes("vtt") ? "vtt" : "srt");
  };

  const handleDownload = async () => {
    if (!videoInfo || isDownloading) return;

    if (downloadMode === "subtitles") {
      const track = subtitleTracks.find(
        (item) =>
          item.language === subtitleLanguage && item.type === subtitleType,
      );

      if (
        subtitleLanguage === "" ||
        !track ||
        (subtitleFormat !== "vtt" && subtitleFormat !== "srt") ||
        track.formats.length === 0 ||
        (subtitleFormat === "vtt" && !track.formats.includes("vtt"))
      ) {
        setDownloadError("Please select a subtitle option.");
        return;
      }
    }

    setDownloadError("");
    setDownloadStatus("queued");
    setDownloadProgress(0);
    setIsDownloading(true);

    try {
      const response = await fetch(DOWNLOAD_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          downloadMode === "subtitles"
            ? {
                url: url.trim(),
                format: subtitleFormat,
                language: subtitleLanguage,
                subtitle_type: subtitleType,
              }
            : { url: url.trim(), format: downloadMode },
        ),
      });

      if (!response.ok) {
        const apiError = await readApiError(response);
        throw new UserFacingError(
          getFriendlyErrorMessage(
            apiError.code,
            apiError.message,
            "Unable to start this download. Please try again.",
          ),
        );
      }

      const created: DownloadCreateResponse = await response.json();
      if (!created.success || !created.task_id) {
        throw new UserFacingError(
          "Unable to start this download. Please try again.",
        );
      }

      const deadline = Date.now() + DOWNLOAD_POLL_TIMEOUT_MS;
      let consecutivePollingErrors = 0;

      while (Date.now() < deadline) {
        await sleep(DOWNLOAD_POLL_INTERVAL_MS);
        let taskResponse: Response;

        try {
          taskResponse = await fetch(`${TASK_API_BASE_URL}/${created.task_id}`, {
            method: "GET",
            cache: "no-store",
          });
        } catch {
          consecutivePollingErrors += 1;
          if (consecutivePollingErrors <= 3) continue;
          throw new UserFacingError(
            "Connection to the server was lost. Please try again.",
          );
        }

        if (!taskResponse.ok) {
          const apiError = await readApiError(taskResponse);
          throw new UserFacingError(
            getFriendlyErrorMessage(
              apiError.code,
              apiError.message,
              "Unable to check download progress. Please try again.",
            ),
          );
        }

        consecutivePollingErrors = 0;
        const task: DownloadTaskResponse = await taskResponse.json();
        setDownloadStatus(task.status);
        setDownloadProgress(
          Math.max(0, Math.min(100, Number(task.progress) || 0)),
        );

        if (task.status === "success") {
          const fileUrl = task.download_url
            ? task.download_url.startsWith("http")
              ? task.download_url
              : `${API_BASE_URL}${task.download_url}`
            : `${FILE_API_BASE_URL}/${created.task_id}`;

          const iframe = document.createElement("iframe");
          iframe.src = fileUrl;
          iframe.style.display = "none";
          iframe.setAttribute("aria-hidden", "true");
          document.body.appendChild(iframe);
          window.setTimeout(() => iframe.remove(), 60_000);

          setDownloadProgress(100);
          return;
        }

        if (task.status === "failed" || task.status === "expired") {
          throw new UserFacingError(
            getFriendlyErrorMessage(
              task.error_code,
              task.error_message,
              "Unable to download this file. Please try again.",
            ),
          );
        }
      }

      throw new UserFacingError(
        "The download is taking longer than expected. Please try again.",
      );
    } catch (error) {
      setDownloadStatus("failed");
      if (error instanceof UserFacingError) {
        setDownloadError(error.message);
      } else {
        setDownloadError("Unable to download this file. Please try again.");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="vs-page">
      <header className="vs-header">
        <div className="vs-header-inner">
          <Link href="/" className="flex items-center gap-2.5">
            <img
              src="/vidsavey-logo.png"
              alt="Vidsavey"
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 object-contain"
            />
            <span className="text-[22px] font-bold tracking-tight text-slate-900">
              Vidsavey
            </span>
          </Link>

          <nav className="vs-nav" aria-label="Primary navigation">
            <a href="#guide">Guide</a>
            <a href="#platforms">Supported Platforms</a>
            <a href="#faq">FAQ</a>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </nav>

          <a href="#features" className="vs-fast-link">
            Fast &amp; Simple
          </a>
        </div>
      </header>

      <main>
        <section className="vs-hero">
          <div className="vs-hero-glow vs-hero-glow-left" aria-hidden="true" />
          <div className="vs-hero-glow vs-hero-glow-right" aria-hidden="true" />

          <div className="vs-hero-inner">
            <span className="vs-eyebrow">Free Online Video Downloader</span>

            <h1 className="vs-hero-title">
              <span>Download Videos</span>
              <strong>Quickly and Easily</strong>
            </h1>

            <p className="vs-hero-subtitle">
              Paste a video URL and download your favorite videos in seconds.
            </p>

            <div className="vs-analyze-wrap">
              <div className="vs-analyze-box">
                <div className="vs-url-field">
                  <SimpleIcon name="link" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (analyzeStatus === "error") {
                        setAnalyzeStatus("idle");
                        setErrorMessage("");
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void handleAnalyze();
                    }}
                    placeholder="Paste video URL here..."
                    aria-label="Video URL"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={analyzeStatus === "loading" || isDownloading}
                  className="vs-analyze-button"
                >
                  {analyzeStatus === "loading" ? (
                    <>
                      <span className="vs-spinner" aria-hidden="true" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze <span aria-hidden="true">→</span>
                    </>
                  )}
                </button>
              </div>

              <div className="vs-analyze-error" aria-live="polite">
                {analyzeStatus === "error" ? errorMessage : ""}
              </div>
            </div>

            <div className="vs-hero-platforms">
              <p>Supports popular video platforms</p>
              <div className="vs-platform-list">
                {platforms.slice(0, 5).map((platform) => (
                  <PlatformBadge key={platform} name={platform} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {analyzeStatus === "success" && (
          <section className="vs-result-section">
            <div className="vs-result-shell">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)] sm:p-7">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Ready to download
                </div>

                <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:gap-6">
                  {videoInfo?.thumbnail && !thumbnailError ? (
                    <img
                      src={videoInfo.thumbnail}
                      alt={videoInfo.title}
                      onError={() => setThumbnailError(true)}
                      className="aspect-video w-full shrink-0 rounded-2xl object-cover sm:w-64"
                    />
                  ) : (
                    <div className="flex aspect-video w-full shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-400 sm:w-64">
                      Video Thumbnail
                    </div>
                  )}

                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <h2 className="line-clamp-2 break-words text-xl font-semibold leading-snug text-slate-950">
                      {videoInfo?.title}
                    </h2>
                    <div className="mt-4 space-y-1.5 text-sm text-slate-500">
                      <p>
                        Uploader: <span className="font-medium text-slate-700">{videoInfo?.uploader}</span>
                      </p>
                      <p>
                        Duration: <span className="font-medium text-slate-700">{formatDuration(videoInfo?.duration ?? 0)}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-7 border-t border-slate-100 pt-6">
                  <p className="mb-3 text-sm font-semibold text-slate-700">Format</p>
                  <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
                    {(["mp4", "mp3", "subtitles"] as DownloadMode[]).map((mode) => {
                      const disabled = mode === "subtitles" && !subtitlesAvailable;
                      const active = downloadMode === mode;
                      const label = mode === "mp4" ? "MP4" : mode === "mp3" ? "MP3" : "Subtitles";
                      const sub = mode === "mp4" ? "Video" : mode === "mp3" ? "Audio" : "Captions";

                      return (
                        <button
                          key={mode}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setDownloadMode(mode)}
                          disabled={disabled}
                          className={`flex flex-col items-center gap-0.5 rounded-xl border px-2 py-3 transition sm:px-6 ${
                            active
                              ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          <span className="text-sm font-semibold">{label}</span>
                          <span className="text-xs font-medium opacity-70">{sub}</span>
                        </button>
                      );
                    })}
                  </div>

                  {!subtitlesAvailable && (
                    <p className="mt-3 text-sm text-slate-500">No subtitles are available for this video.</p>
                  )}
                </div>

                {downloadMode === "subtitles" && subtitlesAvailable && (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <label htmlFor="subtitle-language" className="mb-2 block text-sm font-semibold text-slate-700">
                        Language
                      </label>
                      {languageOptions.length > 12 && (
                        <input
                          type="search"
                          value={subtitleSearch}
                          onChange={(e) => setSubtitleSearch(e.target.value)}
                          placeholder="Search language..."
                          className="mb-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
                        />
                      )}

                      <select
                        id="subtitle-language"
                        value={subtitleLanguage}
                        onChange={(e) => handleSubtitleLanguageChange(e.target.value)}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
                      >
                        {visibleLanguageOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-4">
                      <p className="mb-2 text-sm font-semibold text-slate-700">Type</p>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        {availableTypes.map((type) => (
                          <button
                            key={type}
                            type="button"
                            aria-pressed={subtitleType === type}
                            onClick={() => handleSubtitleTypeChange(type)}
                            className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition sm:px-6 ${
                              subtitleType === type
                                ? "border-blue-600 bg-blue-50 text-blue-700"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {type === "manual" ? "Manual" : "Auto-generated"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="mb-2 text-sm font-semibold text-slate-700">Format</p>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        <button
                          type="button"
                          aria-pressed={subtitleFormat === "vtt"}
                          onClick={() => setSubtitleFormat("vtt")}
                          disabled={!currentSubtitleTrack?.formats.includes("vtt")}
                          className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition sm:px-6 ${
                            subtitleFormat === "vtt"
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          VTT
                        </button>
                        <button
                          type="button"
                          aria-pressed={subtitleFormat === "srt"}
                          onClick={() => setSubtitleFormat("srt")}
                          disabled={(currentSubtitleTrack?.formats.length ?? 0) === 0}
                          className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition sm:px-6 ${
                            subtitleFormat === "srt"
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          } disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          SRT
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isDownloading || subtitleDownloadDisabled}
                  className="mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 text-base font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isDownloading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      {getDownloadStatusLabel(downloadStatus, downloadProgress)}
                    </>
                  ) : (
                    `Download ${
                      downloadMode === "subtitles"
                        ? subtitleFormat.toUpperCase()
                        : downloadMode.toUpperCase()
                    }`
                  )}
                </button>

                {isDownloading && (
                  <div className="mt-3" aria-live="polite">
                    <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-slate-500">
                      <span>{getDownloadStatusLabel(downloadStatus, downloadProgress)}</span>
                      <span>{downloadProgress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-[width] duration-300"
                        style={{ width: `${downloadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {downloadStatus === "success" && !isDownloading && !downloadError && (
                  <p className="mt-3 text-sm font-medium text-emerald-600">Download started.</p>
                )}

                {downloadError && <p className="mt-3 text-sm text-red-600">{downloadError}</p>}
              </div>
            </div>
          </section>
        )}

        <section id="guide" className="vs-section vs-guide-section">
          <div className="vs-section-inner">
            <div className="vs-section-heading">
              <h2>How It Works</h2>
              <p>Three steps to save your video.</p>
            </div>

            <div className="vs-card-grid">
              {howItWorks.map((step, index) => (
                <article key={step.title} className="vs-guide-card">
                  <div className="vs-card-topline">
                    <span className="vs-step-number">{index + 1}</span>
                    <span className="vs-card-icon"><SimpleIcon name={step.icon} /></span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="vs-section vs-features-section">
          <div className="vs-section-inner">
            <div className="vs-section-heading">
              <h2>Why Vidsavey?</h2>
              <p>A simple tool that gets your videos saved.</p>
            </div>

            <div className="vs-card-grid">
              {features.map((feature) => (
                <article key={feature.title} className="vs-feature-card">
                  <span className="vs-feature-icon"><SimpleIcon name={feature.icon} /></span>
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="platforms" className="vs-section vs-platform-section">
          <div className="vs-section-inner vs-section-inner-narrow">
            <div className="vs-section-heading">
              <h2>Supported Platforms</h2>
              <p>
                Powered by yt-dlp, Vidsavey supports 1000+ video sites. These
                are the most popular ones:
              </p>
            </div>
            <div className="vs-platform-list vs-platform-list-large">
              {platforms.map((platform) => (
                <PlatformBadge key={platform} name={platform} />
              ))}
            </div>
            <p className="mt-4 text-center text-sm text-slate-500">
              ...and hundreds more sites supported by yt-dlp.
            </p>
          </div>
        </section>

        <section id="faq" className="vs-section vs-faq-section">
          <div className="vs-faq-inner">
            <div className="vs-section-heading">
              <h2>Frequently Asked Questions</h2>
              <p>Everything you need to know about Vidsavey.</p>
            </div>

            <div className="vs-faq-list">
              {faqItems.map((item) => (
                <details key={item.question}>
                  <summary>
                    <span>{item.question}</span>
                    <span className="vs-faq-chevron" aria-hidden="true">⌄</span>
                  </summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="vs-footer">
        <div className="vs-footer-inner">
          <p>© 2026 Vidsavey. All rights reserved.</p>
          <div>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
        </div>
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
