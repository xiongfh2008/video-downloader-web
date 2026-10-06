import type { Dictionary } from "../i18n";

// Dictionary 由 `as const` 声明的 en 推导而来，字段为字符串字面量类型。
// 此处仅将字符串字面量放宽为 string 以承载韩语文案，
// 结构（字段名、嵌套层级、数组长度）仍严格对照 Dictionary 校验。
type WidenStrings<T> = T extends string
  ? string
  : { [K in keyof T]: WidenStrings<T[K]> };

const koBase: WidenStrings<Dictionary> = {
  nav: {
    guide: "이용 가이드",
    platforms: "지원 플랫폼",
    faq: "자주 묻는 질문",
    privacy: "개인정보 처리방침",
    terms: "이용약관",
    fastLink: "빠르고 간편하게",
    primaryAriaLabel: "기본 내비게이션",
    langAriaLabel: "언어",
  },
  hero: {
    badge: "무료 온라인 동영상 다운로더",
    titleLine1: "동영상 다운로드",
    titleLine2: "빠르고 간편하게",
    subtitle:
      "동영상 URL을 붙여넣고 몇 초 만에 좋아하는 동영상을 다운로드하세요.",
    urlPlaceholder: "여기에 동영상 URL을 붙여넣으세요...",
    urlAriaLabel: "동영상 URL",
    supportedPlatforms: "인기 동영상 플랫폼 지원",
  },
  analyze: {
    button: "분석",
    analyzing: "분석 중...",
  },
  result: {
    ready: "다운로드 준비 완료",
    thumbnailFallback: "동영상 썸네일",
    uploaderLabel: "업로더:",
    durationLabel: "재생 시간:",
    formatLabel: "형식",
    modeLabels: {
      mp4: "MP4",
      mp3: "MP3",
      subtitles: "자막",
    },
    modeSubLabels: {
      mp4: "동영상",
      mp3: "오디오",
      subtitles: "자막",
    },
    noSubtitles: "이 동영상에는 사용할 수 있는 자막이 없습니다.",
    languageLabel: "언어",
    searchLanguagePlaceholder: "언어 검색...",
    typeLabel: "유형",
    typeLabels: {
      manual: "수동",
      automatic: "자동 생성",
    },
    subtitleFormatLabels: {
      vtt: "VTT",
      srt: "SRT",
    },
    downloadLabel: "다운로드",
    downloadStarted: "다운로드가 시작되었습니다.",
    status: {
      queued: "대기 중",
      preparing: "준비 중",
      downloading: "다운로드 중",
      processing: "처리 중",
      success: "다운로드 시작됨",
      failed: "실패",
      expired: "만료됨",
    },
  },
  sections: {
    guide: {
      heading: "이용 방법",
      subheading: "세 단계로 동영상을 저장하세요.",
    },
    features: {
      heading: "왜 Vidsavey인가요?",
      subheading: "동영상을 간편하게 저장해 주는 심플한 도구입니다.",
    },
    platforms: {
      heading: "지원 플랫폼",
      description:
        "yt-dlp 기반의 Vidsavey는 1,000개 이상의 동영상 사이트를 지원합니다. 대표적인 사이트는 다음과 같습니다:",
      more: "youtube.com, tiktok.com, instagram.com, facebook.com, x.com 등 다양한 동영상 사이트에서 다운로드를 지원합니다.",
    },
    faq: {
      heading: "자주 묻는 질문",
      subheading: "Vidsavey에 대해 알아야 할 모든 것.",
    },
  },
  guideSteps: [
    {
      title: "URL 붙여넣기",
      description: "동영상 링크를 복사하여 위 입력창에 붙여넣으세요.",
    },
    {
      title: "동영상 분석",
      description:
        "분석 버튼을 클릭하면 동영상 정보를 자동으로 가져옵니다.",
    },
    {
      title: "파일 다운로드",
      description:
        "MP4, MP3 또는 자막을 선택하여 기기에 파일을 저장하세요.",
    },
  ],
  features: [
    {
      title: "빠른 다운로드",
      description: "동영상을 빠르게 처리합니다.",
    },
    {
      title: "간편하고 쉬운 사용",
      description: "복잡한 설정이 필요 없습니다.",
    },
    {
      title: "모바일 친화적",
      description: "PC와 모바일에서 모두 사용할 수 있습니다.",
    },
  ],
  faq: [
    {
      question: "Vidsavey는 무료인가요?",
      answer:
        "네. Vidsavey는 무료 온라인 도구입니다. 계정을 만들지 않고도 지원되는 동영상을 분석하고 다운로드할 수 있습니다.",
    },
    {
      question: "어떤 동영상 플랫폼을 지원하나요?",
      answer:
        "Vidsavey는 YouTube, TikTok, Instagram, Facebook, X, Twitch, Reddit, Vimeo, Dailymotion, Bilibili, SoundCloud, Pinterest, Rumble, Douyin, Weibo 등 다양한 동영상 사이트를 지원합니다. 동영상마다 이용 가능 여부는 다를 수 있습니다.",
    },
    {
      question: "MP3 오디오를 다운로드할 수 있나요?",
      answer:
        "네. 동영상을 분석한 후 원본에 오디오가 있는 경우 MP3를 선택하여 오디오 트랙을 다운로드할 수 있습니다.",
    },
    {
      question: "자막을 다운로드할 수 있나요?",
      answer:
        "네. 자막을 사용할 수 있는 경우 자막을 선택하고 언어와 트랙 유형을 고른 뒤 VTT 또는 SRT로 다운로드하세요.",
    },
    {
      question: "프로그램을 설치해야 하나요?",
      answer:
        "아니요. Vidsavey는 브라우저에서 바로 작동합니다. 지원되는 동영상 URL을 붙여넣고 분석한 후 사용 가능한 형식으로 다운로드하세요.",
    },
  ],
  footer: {
    copyright: "© 2026 Vidsavey. 모든 권리 보유.",
    privacy: "개인정보 처리방침",
    terms: "이용약관",
  },
  errors: {
    emptyUrl: "동영상 URL을 입력해 주세요.",
    invalidUrl: "유효한 URL을 입력해 주세요.",
    analyzeFailed: "이 동영상을 분석할 수 없습니다. 다시 시도해 주세요.",
    selectSubtitle: "자막 옵션을 선택해 주세요.",
    downloadStartFailed:
      "다운로드를 시작할 수 없습니다. 다시 시도해 주세요.",
    connectionLost:
      "서버와의 연결이 끊어졌습니다. 다시 시도해 주세요.",
    progressCheckFailed:
      "다운로드 진행 상황을 확인할 수 없습니다. 다시 시도해 주세요.",
    downloadFailed:
      "이 파일을 다운로드할 수 없습니다. 다시 시도해 주세요.",
    downloadTimeout:
      "다운로드가 예상보다 오래 걸리고 있습니다. 다시 시도해 주세요.",
    invalidPublicUrl: "유효한 공개 동영상 URL을 입력해 주세요.",
    rateLimited:
      "요청이 너무 많습니다. 잠시 기다린 후 다시 시도해 주세요.",
    tooManyActiveTasks:
      "이미 진행 중인 다운로드가 너무 많습니다. 하나가 끝날 때까지 기다려 주세요.",
    queueFull:
      "현재 서버가 혼잡합니다. 잠시 후 다시 시도해 주세요.",
    storageBusy:
      "서버의 저장 공간이 일시적으로 부족합니다. 나중에 다시 시도해 주세요.",
    videoTooLong: "이 동영상은 지원되는 최대 길이를 초과합니다.",
    videoTooLarge:
      "이 동영상은 지원되는 최대 다운로드 용량을 초과합니다.",
    sourceUnavailable:
      "이 동영상은 사용할 수 없거나 접근할 수 없습니다.",
    subtitleNotFound:
      "선택한 자막을 다운로드할 수 없습니다.",
    fileExpired: "이 다운로드는 만료되었습니다. 새로 다운로드를 생성해 주세요.",
    serviceRestarted:
      "서버 재시작으로 다운로드가 중단되었습니다. 다시 시도해 주세요.",
    downloadVideoFailed:
      "이 동영상을 다운로드할 수 없습니다. 다시 시도해 주세요.",
    internalError:
      "서버에 예기치 않은 오류가 발생했습니다. 다시 시도해 주세요.",
    botCheck:
      "YouTube가 현재 자동화되지 않은 요청인지 확인을 요청하고 있습니다. 몇 분 후 다시 시도하거나 다른 동영상 링크로 시도해 주세요.",
  },
  meta: {
    title: "Vidsavey - 무료 온라인 동영상 다운로더",
    description:
      "Vidsavey로 온라인에서 빠르고 간편하게 동영상을 다운로드하세요. 지원되는 동영상을 MP4 또는 MP3로 저장하고 자막도 다운로드할 수 있습니다.",
    keywords: [
      "vidsavey",
      "유튜브 다운로드",
      "유튜브 mp4 변환",
      "동영상 다운로드",
      "온라인 동영상 다운로더",
      "유튜브 동영상 저장",
      "동영상 저장",
      "mp4 다운로드",
      "mp3 다운로드",
      "자막 다운로드",
    ],
    ogTitle: "Vidsavey - 무료 온라인 동영상 다운로더",
    ogDescription:
      "Vidsavey로 지원되는 동영상을 온라인에서 MP4 또는 MP3로 다운로드하세요.",
    twitterTitle: "Vidsavey - 무료 온라인 동영상 다운로더",
    twitterDescription:
      "Vidsavey로 온라인에서 빠르고 간편하게 동영상을 다운로드하세요. 지원되는 동영상을 MP4 또는 MP3로 저장할 수 있습니다.",
  },
};

export const ko: Dictionary = koBase as Dictionary;
