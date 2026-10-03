"use client";

import { useState } from "react";
import type { MouseEvent } from "react";
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

// 后端 API 地址：优先读取环境变量，未设置时回退到当前后端地址
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "";

const API_URL = `${API_BASE_URL}/api/video/info`;
const DOWNLOAD_API_URL = `${API_BASE_URL}/api/video/download`;
const TASK_API_BASE_URL = `${API_BASE_URL}/api/video/tasks`;
const FILE_API_BASE_URL = `${API_BASE_URL}/api/video/file`;

const DOWNLOAD_POLL_INTERVAL_MS = 1000;
const DOWNLOAD_POLL_TIMEOUT_MS = 60 * 60 * 1000;

const platforms = ["YouTube", "TikTok", "Instagram", "Facebook", "X"];

const guideSteps = [
  {
    title: "Paste URL",
    description: "Copy the video link and paste it into the input box above.",
  },
  {
    title: "Analyze Video",
    description: "Click Analyze and the video details will be fetched for you.",
  },
  {
    title: "Download File",
    description:
      "Choose MP4, MP3 or subtitles and save the file to your device.",
  },
];

const faqs = [
  {
    question: "Is Vidsavey free?",
    answer:
      "Yes. Vidsavey is a free online tool. You can analyze and download videos without paying anything.",
  },
  {
    question: "Which video platforms are supported?",
    answer:
      "Vidsavey supports popular video platforms including YouTube, TikTok, Instagram, Facebook and X.",
  },
  {
    question: "Can I download MP3 audio?",
    answer:
      "Yes. After analyzing a video, switch the format to MP3 to download the audio track.",
  },
  {
    question: "Can I download subtitles?",
    answer:
      "Yes. If a video has subtitles, choose the Subtitles format, then pick the language, track type and file format (VTT or SRT).",
  },
  {
    question: "Do I need to install any software?",
    answer:
      "No. Vidsavey runs entirely in your browser. Just paste a video URL and start downloading.",
  },
];

// 平台 pill 内的小尺寸品牌图标（inline SVG，不引入 icon library）
function PlatformIcon({ name }: { name: string }) {
  switch (name) {
    case "YouTube":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
          <path
            fill="#FF0000"
            d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z"
          />
        </svg>
      );
    case "TikTok":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
          <path
            fill="#0F172A"
            d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.78.12v-3.16a5.76 5.76 0 0 0-.78-.05 5.68 5.68 0 1 0 5.68 5.68V9.29a7.35 7.35 0 0 0 4.3 1.38V7.58a4.34 4.34 0 0 1-3.24-1.76z"
          />
        </svg>
      );
    case "Instagram":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="h-4 w-4 text-pink-600"
        >
          <rect
            x="2.5"
            y="2.5"
            width="19"
            height="19"
            rx="5"
            stroke="currentColor"
            strokeWidth="2.2"
          />
          <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="2.2" />
          <circle cx="17.4" cy="6.6" r="1.4" fill="currentColor" />
        </svg>
      );
    case "Facebook":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
          <path
            fill="#1877F2"
            d="M13.5 21v-8.2h2.8l.4-3.2h-3.2V7.6c0-.9.3-1.6 1.6-1.6h1.7V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.8V21h3.4z"
          />
        </svg>
      );
    case "X":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
          <path
            fill="#0F172A"
            d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-4.9-6.4L6.4 22H3.3l7.3-8.3L1.6 2H8l4.4 5.9L18.9 2zm-1.1 18h1.7L7.1 3.7H5.3L17.8 20z"
          />
        </svg>
      );
    default:
      return null;
  }
}

const features = [
  {
    title: "Fast Download",
    description: "Quickly process your video.",
  },
  {
    title: "Simple & Easy",
    description: "No complicated settings.",
  },
  {
    title: "Mobile Friendly",
    description: "Works on desktop and mobile.",
  },
];

// 将秒数格式化为 mm:ss，超过 1 小时显示为 hh:mm:ss
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
      return {
        code: "",
        message: body.detail,
      };
    }

    if (body.detail && typeof body.detail === "object") {
      return {
        code: body.detail.code ?? "",
        message: body.detail.message ?? "",
      };
    }
  } catch {
    // Ignore invalid/non-JSON error bodies and use the fallback below.
  }

  return {
    code: "",
    message: "",
  };
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
      return "Ready";
    case "failed":
      return "Failed";
    case "expired":
      return "Expired";
    default:
      return "";
  }
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

  // 当前视频的字幕数据（容错处理后端未返回的情况）
  const subtitleTracks = videoInfo?.subtitles?.tracks ?? [];
  const subtitlesAvailable =
    (videoInfo?.subtitles?.available ?? false) && subtitleTracks.length > 0;

  // 当前语言 + 类型对应的字幕 Track
  const currentSubtitleTrack = subtitleTracks.find(
    (track) =>
      track.language === subtitleLanguage && track.type === subtitleType,
  );

  // Download 按钮禁用条件：字幕模式下当前 Track 不存在或不可下载
  const subtitleDownloadDisabled =
    downloadMode === "subtitles" &&
    (!currentSubtitleTrack ||
      currentSubtitleTrack.formats.length === 0 ||
      (subtitleFormat === "vtt" &&
        !currentSubtitleTrack.formats.includes("vtt")));

  // Language 下拉选项：同一语言只显示一次，显示名称优先 track.name
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
    if (normalizedSubtitleSearch === "") {
      return true;
    }

    return (
      option.label.toLowerCase().includes(normalizedSubtitleSearch) ||
      option.value.toLowerCase().includes(normalizedSubtitleSearch)
    );
  });

  // 搜索时仍保留当前已选语言，避免 select 的 value 突然不存在。
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

  // 当前语言实际可用的字幕类型（不展示用户无法选择的类型）
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

  // 页内锚点通用处理：平滑滚动到目标 section，不刷新页面，URL 变为 #id
  const handleAnchorClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const targetId = event.currentTarget.getAttribute("href")?.slice(1);

    if (!targetId || !document.getElementById(targetId)) {
      return;
    }

    event.preventDefault();
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
    window.history.pushState(null, "", `#${targetId}`);
  };

  const handleAnalyze = async () => {
    // 防止解析中或下载中重复发起新的解析任务。
    if (analyzeStatus === "loading" || isDownloading) {
      return;
    }

    const trimmedUrl = url.trim();

    // URL 为空
    if (trimmedUrl === "") {
      setAnalyzeStatus("error");
      setErrorMessage("Please enter a video URL.");
      return;
    }

    // 基本合法性校验：不合法时 new URL() 会抛出异常
    try {
      new URL(trimmedUrl);
    } catch {
      setAnalyzeStatus("error");
      setErrorMessage("Please enter a valid URL.");
      return;
    }

    // 清除旧结果，进入 loading
    setErrorMessage("");
    setDownloadError("");
    setVideoInfo(null);
    setThumbnailError(false);
    setAnalyzeStatus("loading");

    // 重置上一次视频的下载选择，避免影响新视频
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: trimmedUrl,
        }),
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

      // 默认优先选择人工字幕；没有人工字幕时再使用第一条自动字幕。
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
      // fetch 失败（网络错误、CORS 等）
      setAnalyzeStatus("error");
      setErrorMessage("Unable to analyze this video. Please try again.");
    }
  };

  const handleSubtitleLanguageChange = (language: string) => {
    setSubtitleLanguage(language);

    const languageTracks = subtitleTracks.filter(
      (track) => track.language === language,
    );

    // 该语言存在人工字幕时优先选择 manual，否则选择 automatic
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

    // 切换类型后重新计算默认格式，避免保留不可用的格式选择
    const nextTrack = subtitleTracks.find(
      (track) => track.language === subtitleLanguage && track.type === type,
    );
    setSubtitleFormat(nextTrack?.formats.includes("vtt") ? "vtt" : "srt");
  };

  const handleDownload = async () => {
    // 没有解析结果或已有下载任务执行中时，不重复创建任务。
    if (!videoInfo || isDownloading) {
      return;
    }

    // 字幕下载前校验，参数不完整或当前 Track 不可下载时不发送请求。
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
      // 1. 创建异步下载任务，后端应快速返回 task_id。
      const response = await fetch(DOWNLOAD_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          downloadMode === "subtitles"
            ? {
                url: url.trim(),
                format: subtitleFormat,
                language: subtitleLanguage,
                subtitle_type: subtitleType,
              }
            : {
                url: url.trim(),
                format: downloadMode,
              },
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

      setDownloadStatus("queued");

      // 2. 轮询任务状态。允许短暂网络抖动，连续 3 次失败后才终止。
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

          if (consecutivePollingErrors <= 3) {
            continue;
          }

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

          // 通过隐藏 iframe 触发浏览器下载：
          // 不刷新当前页面、不打开新标签页，且不会把大文件读进内存。
          // 延迟清理，给浏览器足够时间启动下载。
          const iframe = document.createElement("iframe");
          iframe.src = fileUrl;
          iframe.style.display = "none";
          iframe.setAttribute("aria-hidden", "true");
          document.body.appendChild(iframe);

          window.setTimeout(() => {
            iframe.remove();
          }, 60_000);

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
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between gap-6 px-8">
          <Link
            href="/"
            aria-label="Vidsavey - back to home"
            className="flex shrink-0 items-center gap-2.5 transition hover:opacity-80"
          >
            <img
              src="/vidsavey-icon.png"
              alt=""
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-[22px] font-bold tracking-tight text-slate-900">
              Vidsavey
            </span>
          </Link>

          <nav
            aria-label="Main"
            className="hidden items-center gap-8 text-[14px] font-medium text-slate-600 lg:flex"
          >
            <a
              href="#guide"
              onClick={handleAnchorClick}
              className="transition hover:text-blue-600"
            >
              Guide
            </a>
            <a
              href="#platforms"
              onClick={handleAnchorClick}
              className="transition hover:text-blue-600"
            >
              Supported Platforms
            </a>
            <a
              href="#faq"
              onClick={handleAnchorClick}
              className="transition hover:text-blue-600"
            >
              FAQ
            </a>
            <Link href="/privacy" className="transition hover:text-blue-600">
              Privacy
            </Link>
            <Link href="/terms" className="transition hover:text-blue-600">
              Terms
            </Link>
          </nav>

          <a
            href="#features"
            onClick={handleAnchorClick}
            className="hidden h-[42px] shrink-0 items-center rounded-full border border-blue-500 px-6 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 sm:inline-flex"
          >
            Fast &amp; Simple
          </a>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* 极淡蓝/紫光晕背景（低透明度，不产生横向溢出） */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-32 left-[-120px] h-[420px] w-[520px] rounded-full bg-blue-200/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-28 right-[-100px] h-[400px] w-[480px] rounded-full bg-indigo-200/25 blur-3xl"
          />

          <div className="relative mx-auto flex min-h-[650px] max-w-[1200px] flex-col items-center px-8 pb-16 pt-[70px] text-center">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-[14px] font-medium text-blue-600">
              Free Online Video Downloader
            </span>

            <h1 className="mt-8 max-w-[900px] text-[36px] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[56px] lg:text-[72px]">
              <span className="block text-slate-950">Download Videos</span>
              <span className="block text-blue-600">Quickly and Easily</span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-600 sm:text-[20px]">
              Paste a video URL and download your favorite videos in seconds.
            </p>

            {/* URL Input */}
            <div className="mt-12 flex w-full max-w-[920px] flex-col gap-2 rounded-[18px] border border-slate-200 bg-white p-2 shadow-lg shadow-slate-200/60 sm:flex-row sm:items-center">
              <div className="flex h-16 flex-1 items-center rounded-xl bg-slate-50 px-5 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-5 w-5 shrink-0 text-slate-400"
                >
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>

                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    // 输入时清除上一次的错误提示
                    if (analyzeStatus === "error") {
                      setAnalyzeStatus("idle");
                      setErrorMessage("");
                    }
                  }}
                  placeholder="Paste video URL here..."
                  className="ml-3 h-full w-full min-w-0 bg-transparent text-[16px] text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={analyzeStatus === "loading" || isDownloading}
                className="flex h-16 w-full shrink-0 items-center justify-center gap-3 rounded-xl bg-blue-600 text-[16px] font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 sm:w-[220px]"
              >
                {analyzeStatus === "loading" ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className="h-4 w-4"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>

            {/* 错误提示（输入框下方独立一行，固定高度避免布局跳动） */}
            <div
              aria-live="polite"
              className="mx-auto mt-3 h-5 w-full max-w-[920px] text-left text-sm text-red-600"
            >
              {analyzeStatus === "error" ? errorMessage : ""}
            </div>

            {/* Supported platforms */}
            <p className="mt-7 text-sm text-slate-500">
              Supports popular video platforms
            </p>

            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2">
              {platforms.map((platform) => (
                <span
                  key={platform}
                  className="inline-flex h-8 items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3.5 text-sm font-medium text-slate-600"
                >
                  <PlatformIcon name={platform} />
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Video Information Card（仅在解析成功后显示） */}
        {analyzeStatus === "success" && (
          <section className="mx-auto max-w-3xl px-6 pb-20">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Ready to download
              </div>

              <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:gap-6">
                {videoInfo?.thumbnail && !thumbnailError ? (
                  <img
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    onError={() => setThumbnailError(true)}
                    className="aspect-video w-full shrink-0 rounded-xl object-cover sm:w-60"
                  />
                ) : (
                  <div className="flex aspect-video w-full shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400 sm:w-60">
                    Video Thumbnail
                  </div>
                )}

                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <h2 className="line-clamp-2 break-words text-lg font-semibold leading-snug text-slate-900">
                    {videoInfo?.title}
                  </h2>

                  <div className="mt-3 space-y-1 text-sm text-slate-500">
                    <p>
                      Uploader:{" "}
                      <span className="font-medium text-slate-700">
                        {videoInfo?.uploader}
                      </span>
                    </p>
                    <p>
                      Duration:{" "}
                      <span className="font-medium text-slate-700">
                        {formatDuration(videoInfo?.duration ?? 0)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Format（MP4 / MP3 / Subtitles 三种下载模式） */}
              <div className="mt-7 border-t border-slate-100 pt-6">
                <p className="mb-3 text-sm font-semibold text-slate-700">
                  Format
                </p>

                <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
                  <button
                    type="button"
                    aria-pressed={downloadMode === "mp4"}
                    onClick={() => setDownloadMode("mp4")}
                    className={`flex flex-col items-center gap-0.5 rounded-xl border px-2 py-3 transition sm:px-6 ${
                      downloadMode === "mp4"
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-sm font-semibold">MP4</span>
                    <span className="text-xs font-medium opacity-70">
                      Video
                    </span>
                  </button>

                  <button
                    type="button"
                    aria-pressed={downloadMode === "mp3"}
                    onClick={() => setDownloadMode("mp3")}
                    className={`flex flex-col items-center gap-0.5 rounded-xl border px-2 py-3 transition sm:px-6 ${
                      downloadMode === "mp3"
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span className="text-sm font-semibold">MP3</span>
                    <span className="text-xs font-medium opacity-70">
                      Audio
                    </span>
                  </button>

                  <button
                    type="button"
                    aria-pressed={downloadMode === "subtitles"}
                    onClick={() => setDownloadMode("subtitles")}
                    disabled={!subtitlesAvailable}
                    className={`flex flex-col items-center gap-0.5 rounded-xl border px-2 py-3 transition sm:px-6 ${
                      downloadMode === "subtitles"
                        ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    } disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:bg-white`}
                  >
                    <span className="text-sm font-semibold">Subtitles</span>
                    <span className="text-xs font-medium opacity-70">
                      Captions
                    </span>
                  </button>
                </div>

                {!subtitlesAvailable && (
                  <p className="mt-3 text-sm text-slate-500">
                    No subtitles are available for this video.
                  </p>
                )}
              </div>

              {/* Subtitles 配置区域（仅在选择 Subtitles 且有可用字幕时展开） */}
              {downloadMode === "subtitles" && subtitlesAvailable && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  {/* Language */}
                  <div>
                    <label
                      htmlFor="subtitle-language"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Language
                    </label>
                    {languageOptions.length > 12 && (
                      <input
                        type="search"
                        value={subtitleSearch}
                        onChange={(e) => setSubtitleSearch(e.target.value)}
                        placeholder="Search language..."
                        className="mb-2 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-200 focus:ring-2 focus:ring-blue-500"
                      />
                    )}

                    <select
                      id="subtitle-language"
                      value={subtitleLanguage}
                      onChange={(e) =>
                        handleSubtitleLanguageChange(e.target.value)
                      }
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-200 focus:ring-2 focus:ring-blue-500"
                    >
                      {visibleLanguageOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    {languageOptions.length > 12 && (
                      <p className="mt-2 text-xs text-slate-500">
                        {filteredLanguageOptions.length} of {languageOptions.length} languages shown
                      </p>
                    )}
                  </div>

                  {/* Type */}
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-semibold text-slate-700">
                      Type
                    </p>

                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {availableTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          aria-pressed={subtitleType === type}
                          onClick={() => handleSubtitleTypeChange(type)}
                          className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition sm:px-6 ${
                            subtitleType === type
                              ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {type === "manual" ? "Manual" : "Auto-generated"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Format（字幕格式，与主 Format 是两个层级） */}
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-semibold text-slate-700">
                      Format
                    </p>

                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      <button
                        type="button"
                        aria-pressed={subtitleFormat === "vtt"}
                        onClick={() => setSubtitleFormat("vtt")}
                        disabled={
                          !currentSubtitleTrack?.formats.includes("vtt")
                        }
                        className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition sm:px-6 ${
                          subtitleFormat === "vtt"
                            ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        VTT
                      </button>

                      <button
                        type="button"
                        aria-pressed={subtitleFormat === "srt"}
                        onClick={() => setSubtitleFormat("srt")}
                        disabled={
                          (currentSubtitleTrack?.formats.length ?? 0) === 0
                        }
                        className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition sm:px-6 ${
                          subtitleFormat === "srt"
                            ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        SRT
                      </button>
                    </div>

                    {currentSubtitleTrack &&
                      currentSubtitleTrack.formats.length === 0 && (
                        <p className="mt-2 text-sm text-slate-500">
                          No downloadable subtitle format is available for this
                          track.
                        </p>
                      )}
                  </div>
                </div>
              )}

              {/* Download */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={isDownloading || subtitleDownloadDisabled}
                className="mt-7 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-base font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
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

              {/* 异步任务状态与进度 */}
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

              {downloadStatus === "success" &&
                !isDownloading &&
                !downloadError && (
                  <p className="mt-3 text-sm text-emerald-600">
                    Download started.
                  </p>
                )}

              {/* 下载错误提示 */}
              {downloadError && (
                <p className="mt-3 text-sm text-red-600">{downloadError}</p>
              )}
            </div>
          </section>
        )}

        {/* Guide */}
        <section id="guide" className="border-t border-slate-100 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                How It Works
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Three steps to save your video.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-3 sm:gap-8">
              {guideSteps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    {index + 1}
                  </div>

                  <h3 className="mt-4 font-semibold text-slate-900">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="border-t border-slate-100 bg-slate-50"
        >
          <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Why Vidsavey?
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                A simple tool that gets your videos saved.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-3 sm:gap-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm"
                >
                  <div
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-blue-600"
                  />

                  <h3 className="mt-4 font-semibold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Supported Platforms */}
        <section id="platforms" className="border-t border-slate-100 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Supported Platforms
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Vidsavey works with the most popular video platforms.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              {platforms.map((platform) => (
                <span
                  key={platform}
                  className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm"
                >
                  <PlatformIcon name={platform} />
                  {platform}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-slate-100 bg-slate-50">
          <div className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Frequently Asked Questions
              </h2>

              <p className="mt-2 text-sm text-slate-600">
                Everything you need to know about Vidsavey.
              </p>
            </div>

            <div className="mt-10 space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <h3 className="font-semibold text-slate-900">
                    {faq.question}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* SEO 文案（自然融入关键词，纯静态内容） */}
        <section className="border-t border-slate-100 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
            <h2 className="text-center text-lg font-bold text-slate-900">
              Free YouTube Video Downloader
            </h2>

            <div className="mx-auto mt-4 max-w-3xl space-y-3 text-sm leading-6 text-slate-600">
              <p>
                Vidsavey is a free YouTube downloader that works entirely
                online. Paste a YouTube link, analyze the video and save it as
                MP4 video or MP3 audio in seconds — no software installation
                required.
              </p>

              <p>
                In addition to YouTube to MP4 and MP3 downloads, Vidsavey also
                supports popular platforms such as TikTok, Instagram, Facebook
                and X, so you can quickly download videos from your favorite
                sites.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-10 text-sm text-slate-500 sm:flex-row">
          <p>© 2026 Vidsavey. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="transition hover:text-slate-900"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="transition hover:text-slate-900"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
