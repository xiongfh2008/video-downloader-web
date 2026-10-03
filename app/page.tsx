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

          const a = document.createElement("a");
          a.href = fileUrl;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.style.display = "none";
          document.body.appendChild(a);
          a.click();
          a.remove();

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
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 rounded-md bg-blue-600"
            />
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Video Downloader
            </span>
          </div>

          <span className="hidden text-sm font-medium text-slate-500 sm:block">
            Fast &amp; Simple
          </span>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-3xl px-6 pb-16 pt-16 text-center sm:pt-28">
          <span className="inline-flex items-center rounded-full bg-blue-50 px-3.5 py-1 text-sm font-medium text-blue-700">
            Free Online Video Downloader
          </span>

          <h1 className="mt-6 text-balance text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl sm:leading-[1.1]">
            Download Videos
            <br />
            Quickly and Easily
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Paste a video URL and download your favorite videos in seconds.
          </p>

          {/* URL Input */}
          <div className="mt-12 flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm transition focus-within:border-blue-200 sm:flex-row">
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
              className="h-14 flex-1 rounded-xl border-0 bg-slate-50 px-5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzeStatus === "loading" || isDownloading}
              className="flex h-14 items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 text-base font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 sm:px-10"
            >
              {analyzeStatus === "loading" ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Analyzing...
                </>
              ) : (
                "Analyze"
              )}
            </button>
          </div>

          {/* 错误提示（固定高度，避免布局跳动） */}
          <div
            aria-live="polite"
            className="mt-3 h-5 text-left text-sm text-red-600"
          >
            {analyzeStatus === "error" ? errorMessage : ""}
          </div>

          {/* Supported platforms */}
          <p className="mt-3 text-sm text-slate-500">
            Supports popular video platforms
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {platforms.map((platform) => (
              <span
                key={platform}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500"
              >
                {platform}
              </span>
            ))}
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
                    Your download is ready.
                  </p>
                )}

              {/* 下载错误提示 */}
              {downloadError && (
                <p className="mt-3 text-sm text-red-600">{downloadError}</p>
              )}
            </div>
          </section>
        )}

        {/* Features */}
        <section className="border-t border-slate-100 bg-slate-50">
          <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Why Video Downloader?
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
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-10 text-sm text-slate-500 sm:flex-row">
          <p>© 2026 Video Downloader. All rights reserved.</p>

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
