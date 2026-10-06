import type { Dictionary } from "../i18n";

// Dictionary 由 `as const` 声明的 en 推导而来，字段为字符串字面量类型。
// 此处仅将字符串字面量放宽为 string 以承载简体中文文案，
// 结构（字段名、嵌套层级、数组长度）仍严格对照 Dictionary 校验。
type WidenStrings<T> = T extends string
  ? string
  : { [K in keyof T]: WidenStrings<T[K]> };

const zhBase: WidenStrings<Dictionary> = {
  nav: {
    guide: "使用指南",
    platforms: "支持的平台",
    faq: "常见问题",
    privacy: "隐私政策",
    terms: "服务条款",
    fastLink: "快速简洁",
    primaryAriaLabel: "主导航",
    langAriaLabel: "语言",
  },
  hero: {
    badge: "免费在线视频下载器",
    titleLine1: "下载视频",
    titleLine2: "快速又简单",
    subtitle: "粘贴视频链接，几秒钟即可下载你喜爱的视频。",
    urlPlaceholder: "在此粘贴视频链接...",
    urlAriaLabel: "视频链接",
    supportedPlatforms: "支持热门视频平台",
  },
  analyze: {
    button: "解析",
    analyzing: "解析中...",
  },
  result: {
    ready: "准备就绪，可以下载",
    thumbnailFallback: "视频缩略图",
    uploaderLabel: "上传者：",
    durationLabel: "时长：",
    formatLabel: "格式",
    modeLabels: {
      mp4: "MP4",
      mp3: "MP3",
      subtitles: "字幕",
    },
    modeSubLabels: {
      mp4: "视频",
      mp3: "音频",
      subtitles: "字幕",
    },
    noSubtitles: "该视频暂无可用字幕。",
    languageLabel: "语言",
    searchLanguagePlaceholder: "搜索语言...",
    typeLabel: "类型",
    typeLabels: {
      manual: "手动",
      automatic: "自动生成",
    },
    subtitleFormatLabels: {
      vtt: "VTT",
      srt: "SRT",
    },
    downloadLabel: "下载",
    downloadStarted: "已开始下载。",
    status: {
      queued: "排队中",
      preparing: "准备中",
      downloading: "下载中",
      processing: "处理中",
      success: "已开始下载",
      failed: "下载失败",
      expired: "已过期",
    },
  },
  sections: {
    guide: {
      heading: "使用方法",
      subheading: "三步保存你的视频。",
    },
    features: {
      heading: "为什么选择 Vidsavey？",
      subheading: "简单工具，轻松保存视频。",
    },
    platforms: {
      heading: "支持的平台",
      description:
        "Vidsavey 基于 yt-dlp 打造，支持 1000+ 视频网站。以下是最热门的网站：",
      more: "支持从 youtube.com、tiktok.com、instagram.com、facebook.com、x.com 等更多视频网站下载视频。",
    },
    faq: {
      heading: "常见问题",
      subheading: "关于 Vidsavey 你想了解的一切。",
    },
  },
  guideSteps: [
    {
      title: "粘贴链接",
      description: "复制视频链接并粘贴到上方输入框。",
    },
    {
      title: "解析视频",
      description: "点击解析按钮，即可自动获取视频详情。",
    },
    {
      title: "下载文件",
      description: "选择 MP4、MP3 或字幕，将文件保存到你的设备。",
    },
  ],
  features: [
    {
      title: "高速下载",
      description: "快速处理你的视频。",
    },
    {
      title: "简单易用",
      description: "无需复杂设置。",
    },
    {
      title: "移动端友好",
      description: "桌面端和移动端均可使用。",
    },
  ],
  faq: [
    {
      question: "Vidsavey 是免费的吗？",
      answer:
        "是的。Vidsavey 是一款免费的在线工具，无需注册账号即可解析并下载受支持的视频。",
    },
    {
      question: "支持哪些视频平台？",
      answer:
        "Vidsavey 支持 YouTube、TikTok、Instagram、Facebook、X、Twitch、Reddit、Vimeo、Dailymotion、Bilibili、SoundCloud、Pinterest、Rumble、Douyin、Weibo 等热门视频平台及更多视频网站。具体可用性可能因视频而异。",
    },
    {
      question: "可以下载 MP3 音频吗？",
      answer:
        "可以。解析视频后，若源文件可用，选择 MP3 即可下载音频轨。",
    },
    {
      question: "可以下载字幕吗？",
      answer:
        "可以。若视频有可用字幕，选择字幕选项，再选择语言和字幕类型，即可下载 VTT 或 SRT 文件。",
    },
    {
      question: "需要安装任何软件吗？",
      answer:
        "不需要。Vidsavey 直接在浏览器中运行：粘贴受支持的视频链接，点击解析，即可下载可用格式。",
    },
  ],
  footer: {
    copyright: "© 2026 Vidsavey. 保留所有权利.",
    privacy: "隐私政策",
    terms: "服务条款",
  },
  errors: {
    emptyUrl: "请输入视频链接。",
    invalidUrl: "请输入有效的链接。",
    analyzeFailed: "无法解析该视频，请重试。",
    selectSubtitle: "请选择一个字幕选项。",
    downloadStartFailed: "无法开始此次下载，请重试。",
    connectionLost: "与服务器的连接已断开，请重试。",
    progressCheckFailed: "无法获取下载进度，请重试。",
    downloadFailed: "无法下载该文件，请重试。",
    downloadTimeout: "下载耗时超出预期，请重试。",
    invalidPublicUrl: "请输入有效的公开视频链接。",
    rateLimited: "请求过于频繁，请稍候再试。",
    tooManyActiveTasks: "你的进行中下载任务过多，请等待其中一个完成。",
    queueFull: "服务器当前繁忙，请稍后再试。",
    storageBusy: "服务器存储空间暂时不足，请稍后再试。",
    videoTooLong: "该视频时长超出支持上限。",
    videoTooLarge: "该视频大小超出下载上限。",
    sourceUnavailable: "该视频不可用或无法访问。",
    subtitleNotFound: "所选字幕无法下载。",
    fileExpired: "该下载已过期，请重新创建下载。",
    serviceRestarted: "下载因服务器重启而中断，请重试。",
    downloadVideoFailed: "无法下载该视频，请重试。",
    internalError: "服务器发生意外错误，请重试。",
    botCheck: "YouTube 目前要求验证该请求并非机器人。请几分钟后再试，或更换其他视频链接。",
  },
  meta: {
    title: "Vidsavey - 免费在线视频下载器",
    description:
      "使用 Vidsavey 在线快速便捷地下载视频，可将支持的视频保存为 MP4 或 MP3，并下载可用字幕。",
    keywords: [
      "vidsavey",
      "视频下载器",
      "在线视频下载",
      "youtube 视频下载",
      "youtube 下载",
      "youtube 转mp4",
      "视频下载",
      "mp4 下载器",
      "mp3 下载器",
      "字幕下载",
    ],
    ogTitle: "Vidsavey - 免费在线视频下载器",
    ogDescription: "使用 Vidsavey 在线将支持的视频下载为 MP4 或 MP3。",
    twitterTitle: "Vidsavey - 免费在线视频下载器",
    twitterDescription:
      "使用 Vidsavey 在线快速便捷地下载视频，可将支持的视频保存为 MP4 或 MP3。",
  },
};

export const zh: Dictionary = zhBase as Dictionary;
