export const en = {
  nav: {
    guide: "Guide",
    platforms: "Supported Platforms",
    faq: "FAQ",
    privacy: "Privacy",
    terms: "Terms",
    fastLink: "Fast & Simple",
    primaryAriaLabel: "Primary navigation",
    langAriaLabel: "Language",
  },
  hero: {
    badge: "Free Online Video Downloader",
    titleLine1: "Download Videos",
    titleLine2: "Quickly and Easily",
    subtitle: "Paste a video URL and download your favorite videos in seconds.",
    urlPlaceholder: "Paste video URL here...",
    urlAriaLabel: "Video URL",
    supportedPlatforms: "Supports popular video platforms",
  },
  analyze: {
    button: "Analyze",
    analyzing: "Analyzing...",
  },
  result: {
    ready: "Ready to download",
    thumbnailFallback: "Video Thumbnail",
    uploaderLabel: "Uploader:",
    durationLabel: "Duration:",
    formatLabel: "Format",
    modeLabels: {
      mp4: "MP4",
      mp3: "MP3",
      subtitles: "Subtitles",
    },
    modeSubLabels: {
      mp4: "Video",
      mp3: "Audio",
      subtitles: "Captions",
    },
    noSubtitles: "No subtitles are available for this video.",
    languageLabel: "Language",
    searchLanguagePlaceholder: "Search language...",
    typeLabel: "Type",
    typeLabels: {
      manual: "Manual",
      automatic: "Auto-generated",
    },
    subtitleFormatLabels: {
      vtt: "VTT",
      srt: "SRT",
    },
    downloadLabel: "Download",
    downloadStarted: "Download started.",
    status: {
      queued: "Queued",
      preparing: "Preparing",
      downloading: "Downloading",
      processing: "Processing",
      success: "Download started",
      failed: "Failed",
      expired: "Expired",
    },
  },
  sections: {
    guide: {
      heading: "How It Works",
      subheading: "Three steps to save your video.",
    },
    features: {
      heading: "Why Vidsavey?",
      subheading: "A simple tool that gets your videos saved.",
    },
    platforms: {
      heading: "Supported Platforms",
      description:
        "Powered by yt-dlp, Vidsavey supports 1000+ video sites. These are the most popular ones:",
      more: "Supports downloads from youtube.com, tiktok.com, instagram.com, facebook.com, x.com and more video sites.",
    },
    faq: {
      heading: "Frequently Asked Questions",
      subheading: "Everything you need to know about Vidsavey.",
    },
  },
  guideSteps: [
    {
      title: "Paste URL",
      description: "Copy the video link and paste it into the input box above.",
    },
    {
      title: "Analyze Video",
      description:
        "Click Analyze and the video details will be fetched for you.",
    },
    {
      title: "Download File",
      description:
        "Choose MP4, MP3 or subtitles and save the file to your device.",
    },
  ],
  features: [
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
  ],
  faq: [
    {
      question: "Is Vidsavey free?",
      answer:
        "Yes. Vidsavey is a free online tool. You can analyze and download supported videos without creating an account.",
    },
    {
      question: "Which video platforms are supported?",
      answer:
        "Vidsavey supports popular video platforms including YouTube, TikTok, Instagram, Facebook, X, Twitch, Reddit, Vimeo, Dailymotion, Bilibili, SoundCloud, Pinterest, Rumble, Douyin, Weibo and more video sites. Availability may vary by individual video.",
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
  ],
  footer: {
    copyright: "© 2026 Vidsavey. All rights reserved.",
    privacy: "Privacy",
    terms: "Terms",
  },
  errors: {
    emptyUrl: "Please enter a video URL.",
    invalidUrl: "Please enter a valid URL.",
    analyzeFailed: "Unable to analyze this video. Please try again.",
    selectSubtitle: "Please select a subtitle option.",
    downloadStartFailed: "Unable to start this download. Please try again.",
    connectionLost: "Connection to the server was lost. Please try again.",
    progressCheckFailed: "Unable to check download progress. Please try again.",
    downloadFailed: "Unable to download this file. Please try again.",
    downloadTimeout:
      "The download is taking longer than expected. Please try again.",
    invalidPublicUrl: "Please enter a valid public video URL.",
    rateLimited: "Too many requests. Please wait a moment and try again.",
    tooManyActiveTasks:
      "You already have too many active downloads. Please wait for one to finish.",
    queueFull: "The server is busy right now. Please try again shortly.",
    storageBusy:
      "The server is temporarily low on storage. Please try again later.",
    videoTooLong: "This video is longer than the supported limit.",
    videoTooLarge: "This video is larger than the supported download limit.",
    sourceUnavailable: "This video is unavailable or cannot be accessed.",
    subtitleNotFound: "The selected subtitle could not be downloaded.",
    fileExpired: "This download has expired. Please create a new download.",
    serviceRestarted:
      "The download was interrupted by a server restart. Please try again.",
    downloadVideoFailed: "Unable to download this video. Please try again.",
    internalError:
      "The server encountered an unexpected error. Please try again.",
    botCheck:
      "YouTube is currently asking us to verify that this request is not automated. Please wait a few minutes and try again, or try a different video link.",
  },
  meta: {
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
    ogTitle: "Vidsavey - Free Online Video Downloader",
    ogDescription:
      "Download supported videos online as MP4 or MP3 with Vidsavey.",
    twitterTitle: "Vidsavey - Free Online Video Downloader",
    twitterDescription:
      "Download videos online quickly and easily with Vidsavey. Save supported videos as MP4 or MP3.",
  },
} as const;
