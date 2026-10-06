import type { Dictionary } from "../i18n";

// Dictionary 由 `as const` 声明的 en 推导而来，字段为字符串字面量类型。
// 此处仅将字符串字面量放宽为 string 以承载越南语文案，
// 结构（字段名、嵌套层级、数组长度）仍严格对照 Dictionary 校验。
type WidenStrings<T> = T extends string
  ? string
  : { [K in keyof T]: WidenStrings<T[K]> };

const viBase: WidenStrings<Dictionary> = {
  nav: {
    guide: "Hướng dẫn",
    platforms: "Nền tảng",
    faq: "FAQ",
    privacy: "Quyền riêng tư",
    terms: "Điều khoản",
    fastLink: "Nhanh chóng và đơn giản",
    primaryAriaLabel: "Điều hướng chính",
    langAriaLabel: "Ngôn ngữ",
  },
  hero: {
    badge: "Trình tải video trực tuyến miễn phí",
    titleLine1: "Tải video",
    titleLine2: "Nhanh chóng và dễ dàng",
    subtitle:
      "Dán URL video và tải xuống các video yêu thích của bạn chỉ trong vài giây.",
    urlPlaceholder: "Dán URL video vào đây...",
    urlAriaLabel: "URL video",
    supportedPlatforms: "Hỗ trợ các nền tảng video phổ biến",
  },
  analyze: {
    button: "Phân tích",
    analyzing: "Đang phân tích...",
  },
  result: {
    ready: "Sẵn sàng tải xuống",
    thumbnailFallback: "Hình thu nhỏ video",
    uploaderLabel: "Người đăng tải:",
    durationLabel: "Thời lượng:",
    formatLabel: "Định dạng",
    modeLabels: {
      mp4: "MP4",
      mp3: "MP3",
      subtitles: "Phụ đề",
    },
    modeSubLabels: {
      mp4: "Video",
      mp3: "Âm thanh",
      subtitles: "Phụ đề",
    },
    noSubtitles: "Video này không có phụ đề.",
    languageLabel: "Ngôn ngữ",
    searchLanguagePlaceholder: "Tìm kiếm ngôn ngữ...",
    typeLabel: "Loại",
    typeLabels: {
      manual: "Thủ công",
      automatic: "Tự động tạo",
    },
    subtitleFormatLabels: {
      vtt: "VTT",
      srt: "SRT",
    },
    downloadLabel: "Tải xuống",
    downloadStarted: "Đã bắt đầu tải xuống.",
    status: {
      queued: "Đang chờ",
      preparing: "Đang chuẩn bị",
      downloading: "Đang tải xuống",
      processing: "Đang xử lý",
      success: "Đã bắt đầu tải xuống",
      failed: "Thất bại",
      expired: "Đã hết hạn",
    },
  },
  sections: {
    guide: {
      heading: "Cách hoạt động",
      subheading: "Ba bước để lưu video của bạn.",
    },
    features: {
      heading: "Tại sao chọn Vidsavey?",
      subheading: "Công cụ đơn giản giúp bạn lưu video.",
    },
    platforms: {
      heading: "Nền tảng được hỗ trợ",
      description:
        "Được vận hành bởi yt-dlp, Vidsavey hỗ trợ hơn 1000 trang web video. Đây là những trang phổ biến nhất:",
      more: "Hỗ trợ tải video từ youtube.com, tiktok.com, instagram.com, facebook.com, x.com và nhiều trang web video khác.",
    },
    faq: {
      heading: "Câu hỏi thường gặp",
      subheading: "Tất cả những gì bạn cần biết về Vidsavey.",
    },
  },
  guideSteps: [
    {
      title: "Dán URL",
      description: "Sao chép liên kết video và dán vào ô nhập ở trên.",
    },
    {
      title: "Phân tích video",
      description:
        "Nhấp vào Phân tích và thông tin chi tiết của video sẽ được tải về cho bạn.",
    },
    {
      title: "Tải tệp xuống",
      description:
        "Chọn MP4, MP3 hoặc phụ đề và lưu tệp vào thiết bị của bạn.",
    },
  ],
  features: [
    {
      title: "Tải xuống nhanh",
      description: "Xử lý video của bạn nhanh chóng.",
    },
    {
      title: "Đơn giản và dễ dàng",
      description: "Không có cài đặt phức tạp.",
    },
    {
      title: "Thân thiện với di động",
      description: "Hoạt động trên máy tính và điện thoại.",
    },
  ],
  faq: [
    {
      question: "Vidsavey có miễn phí không?",
      answer:
        "Có. Vidsavey là công cụ trực tuyến miễn phí. Bạn có thể phân tích và tải các video được hỗ trợ mà không cần tạo tài khoản.",
    },
    {
      question: "Những nền tảng video nào được hỗ trợ?",
      answer:
        "Vidsavey hỗ trợ các nền tảng video phổ biến bao gồm YouTube, TikTok, Instagram, Facebook, X, Twitch, Reddit, Vimeo, Dailymotion, Bilibili, SoundCloud, Pinterest, Rumble, Douyin, Weibo và nhiều trang web video khác. Tính khả dụng có thể khác nhau tùy theo từng video.",
    },
    {
      question: "Tôi có thể tải âm thanh MP3 không?",
      answer:
        "Có. Sau khi phân tích video, hãy chọn MP3 để tải xuống bản âm thanh khi nguồn có sẵn.",
    },
    {
      question: "Tôi có thể tải phụ đề không?",
      answer:
        "Có. Khi có phụ đề, hãy chọn Phụ đề, chọn ngôn ngữ và loại phụ đề, sau đó tải xuống định dạng VTT hoặc SRT.",
    },
    {
      question: "Tôi có cần cài đặt phần mềm nào không?",
      answer:
        "Không. Vidsavey chạy ngay trên trình duyệt của bạn. Dán URL video được hỗ trợ, phân tích và tải xuống định dạng có sẵn.",
    },
  ],
  footer: {
    copyright: "© 2026 Vidsavey. Bảo lưu mọi quyền.",
    privacy: "Quyền riêng tư",
    terms: "Điều khoản",
  },
  errors: {
    emptyUrl: "Vui lòng nhập URL video.",
    invalidUrl: "Vui lòng nhập URL hợp lệ.",
    analyzeFailed: "Không thể phân tích video này. Vui lòng thử lại.",
    selectSubtitle: "Vui lòng chọn một tùy chọn phụ đề.",
    downloadStartFailed:
      "Không thể bắt đầu tải xuống này. Vui lòng thử lại.",
    connectionLost:
      "Kết nối với máy chủ bị mất. Vui lòng thử lại.",
    progressCheckFailed:
      "Không thể kiểm tra tiến trình tải xuống. Vui lòng thử lại.",
    downloadFailed:
      "Không thể tải xuống tệp này. Vui lòng thử lại.",
    downloadTimeout:
      "Tải xuống đang mất nhiều thời gian hơn dự kiến. Vui lòng thử lại.",
    invalidPublicUrl: "Vui lòng nhập URL video công khai hợp lệ.",
    rateLimited:
      "Quá nhiều yêu cầu. Vui lòng đợi một lúc rồi thử lại.",
    tooManyActiveTasks:
      "Bạn đang có quá nhiều lượt tải xuống đang hoạt động. Vui lòng đợi một lượt hoàn tất.",
    queueFull:
      "Máy chủ hiện đang bận. Vui lòng thử lại sau ít phút.",
    storageBusy:
      "Máy chủ tạm thời thiếu dung lượng lưu trữ. Vui lòng thử lại sau.",
    videoTooLong: "Video này dài hơn giới hạn được hỗ trợ.",
    videoTooLarge:
      "Video này có dung lượng lớn hơn giới hạn tải xuống được hỗ trợ.",
    sourceUnavailable:
      "Video này không khả dụng hoặc không thể truy cập.",
    subtitleNotFound:
      "Không thể tải xuống phụ đề đã chọn.",
    fileExpired: "Lượt tải xuống này đã hết hạn. Vui lòng tạo lượt tải xuống mới.",
    serviceRestarted:
      "Tải xuống bị gián đoạn do máy chủ khởi động lại. Vui lòng thử lại.",
    downloadVideoFailed:
      "Không thể tải xuống video này. Vui lòng thử lại.",
    internalError:
      "Máy chủ gặp lỗi ngoài dự kiến. Vui lòng thử lại.",
    botCheck:
      "YouTube hiện đang yêu cầu xác minh chống tự động hóa. Vui lòng đợi vài phút rồi thử lại, hoặc thử liên kết video khác.",
  },
  meta: {
    title: "Vidsavey - Trình tải video trực tuyến miễn phí",
    description:
      "Tải video trực tuyến nhanh chóng và dễ dàng với Vidsavey. Lưu video thành MP4 hoặc MP3 và tải xuống phụ đề có sẵn.",
    keywords: [
      "vidsavey",
      "tải video youtube",
      "youtube sang mp4",
      "tải nhạc mp3",
      "trình tải video",
      "tải video trực tuyến",
      "tải video về máy",
      "tải video tiktok",
      "trình tải mp4",
      "tải phụ đề",
    ],
    ogTitle: "Vidsavey - Trình tải video trực tuyến miễn phí",
    ogDescription:
      "Tải video được hỗ trợ trực tuyến dưới dạng MP4 hoặc MP3 với Vidsavey.",
    twitterTitle: "Vidsavey - Trình tải video trực tuyến miễn phí",
    twitterDescription:
      "Tải video trực tuyến nhanh chóng và dễ dàng với Vidsavey. Lưu video thành MP4 hoặc MP3.",
  },
};

export const vi: Dictionary = viBase as Dictionary;
