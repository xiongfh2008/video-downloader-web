import type { Dictionary } from "../i18n";

// Dictionary 由 `as const` 声明的 en 推导而来，字段为字符串字面量类型。
// 此处仅将字符串字面量放宽为 string 以承载土耳其语文案，
// 结构（字段名、嵌套层级、数组长度）仍严格对照 Dictionary 校验。
type WidenStrings<T> = T extends string
  ? string
  : { [K in keyof T]: WidenStrings<T[K]> };

const trBase: WidenStrings<Dictionary> = {
  nav: {
    guide: "Rehber",
    platforms: "Platformlar",
    faq: "SSS",
    privacy: "Gizlilik",
    terms: "Şartlar",
    fastLink: "Hızlı ve Basit",
    primaryAriaLabel: "Ana gezinme",
    langAriaLabel: "Dil",
  },
  hero: {
    badge: "Ücretsiz Çevrimiçi Video İndirici",
    titleLine1: "Videoları İndirin",
    titleLine2: "Hızlı ve Kolayca",
    subtitle:
      "Video URL'sini yapıştırın ve favori videolarınızı saniyeler içinde indirin.",
    urlPlaceholder: "Video URL'sini buraya yapıştırın...",
    urlAriaLabel: "Video URL'si",
    supportedPlatforms: "Popüler video platformlarını destekler",
  },
  analyze: {
    button: "Analiz Et",
    analyzing: "Analiz Ediliyor...",
  },
  result: {
    ready: "İndirmeye hazır",
    thumbnailFallback: "Video küçük resmi",
    uploaderLabel: "Yükleyen:",
    durationLabel: "Süre:",
    formatLabel: "Format",
    modeLabels: {
      mp4: "MP4",
      mp3: "MP3",
      subtitles: "Altyazılar",
    },
    modeSubLabels: {
      mp4: "Video",
      mp3: "Ses",
      subtitles: "Altyazılar",
    },
    noSubtitles: "Bu video için altyazı bulunmuyor.",
    languageLabel: "Dil",
    searchLanguagePlaceholder: "Dil ara...",
    typeLabel: "Tür",
    typeLabels: {
      manual: "Manuel",
      automatic: "Otomatik oluşturulan",
    },
    subtitleFormatLabels: {
      vtt: "VTT",
      srt: "SRT",
    },
    downloadLabel: "İndir",
    downloadStarted: "İndirme başlatıldı.",
    status: {
      queued: "Sırada",
      preparing: "Hazırlanıyor",
      downloading: "İndiriliyor",
      processing: "İşleniyor",
      success: "İndirme başlatıldı",
      failed: "Başarısız",
      expired: "Süresi doldu",
    },
  },
  sections: {
    guide: {
      heading: "Nasıl Çalışır",
      subheading: "Videonuzu kaydetmek için üç adım.",
    },
    features: {
      heading: "Neden Vidsavey?",
      subheading: "Videolarınızı kaydeden basit bir araç.",
    },
    platforms: {
      heading: "Desteklenen Platformlar",
      description:
        "yt-dlp destekli Vidsavey, 1000'den fazla video sitesini destekler. En popüler olanları şunlardır:",
      more: "youtube.com, tiktok.com, instagram.com, facebook.com, x.com ve daha birçok video sitesinden indirmeyi destekler.",
    },
    faq: {
      heading: "Sıkça Sorulan Sorular",
      subheading: "Vidsavey hakkında bilmeniz gereken her şey.",
    },
  },
  guideSteps: [
    {
      title: "URL'yi Yapıştırın",
      description: "Video bağlantısını kopyalayın ve yukarıdaki alana yapıştırın.",
    },
    {
      title: "Videoyu Analiz Edin",
      description:
        "Analiz Et'e tıklayın; video ayrıntıları sizin için getirilir.",
    },
    {
      title: "Dosyayı İndirin",
      description:
        "MP4, MP3 veya altyazı seçin ve dosyayı cihazınıza kaydedin.",
    },
  ],
  features: [
    {
      title: "Hızlı İndirme",
      description: "Videonuzu hızlıca işler.",
    },
    {
      title: "Basit ve Kolay",
      description: "Karmaşık ayarlar yok.",
    },
    {
      title: "Mobil Uyumlu",
      description: "Masaüstünde ve mobilde çalışır.",
    },
  ],
  faq: [
    {
      question: "Vidsavey ücretsiz mi?",
      answer:
        "Evet. Vidsavey ücretsiz bir çevrimiçi araçtır. Hesap oluşturmadan desteklenen videoları analiz edebilir ve indirebilirsiniz.",
    },
    {
      question: "Hangi video platformları destekleniyor?",
      answer:
        "Vidsavey; YouTube, TikTok, Instagram, Facebook, X, Twitch, Reddit, Vimeo, Dailymotion, Bilibili, SoundCloud, Pinterest, Rumble, Douyin, Weibo ve daha birçok video sitesi dahil popüler video platformlarını destekler. Kullanılabilirlik her video için farklılık gösterebilir.",
    },
    {
      question: "MP3 ses indirebilir miyim?",
      answer:
        "Evet. Videoyu analiz ettikten sonra, kaynak mevcut olduğunda ses parçasını indirmek için MP3'ü seçin.",
    },
    {
      question: "Altyazı indirebilir miyim?",
      answer:
        "Evet. Altyazılar mevcut olduğunda Altyazılar seçeneğini belirtin, bir dil ve parça türü seçin, ardından VTT veya SRT olarak indirin.",
    },
    {
      question: "Herhangi bir yazılım kurmam gerekiyor mu?",
      answer:
        "Hayır. Vidsavey tarayıcınızda çalışır. Desteklenen bir video URL'si yapıştırın, analiz edin ve mevcut formatı indirin.",
    },
  ],
  footer: {
    copyright: "© 2026 Vidsavey. Tüm hakları saklıdır.",
    privacy: "Gizlilik",
    terms: "Şartlar",
  },
  errors: {
    emptyUrl: "Lütfen bir video URL'si girin.",
    invalidUrl: "Lütfen geçerli bir URL girin.",
    analyzeFailed: "Bu video analiz edilemedi. Lütfen tekrar deneyin.",
    selectSubtitle: "Lütfen bir altyazı seçeneği seçin.",
    downloadStartFailed:
      "Bu indirme başlatılamadı. Lütfen tekrar deneyin.",
    connectionLost:
      "Sunucu bağlantısı kesildi. Lütfen tekrar deneyin.",
    progressCheckFailed:
      "İndirme ilerlemesi kontrol edilemedi. Lütfen tekrar deneyin.",
    downloadFailed:
      "Bu dosya indirilemedi. Lütfen tekrar deneyin.",
    downloadTimeout:
      "İndirme beklenenden uzun sürüyor. Lütfen tekrar deneyin.",
    invalidPublicUrl: "Lütfen geçerli, herkese açık bir video URL'si girin.",
    rateLimited:
      "Çok fazla istek gönderildi. Lütfen kısa bir süre bekleyip tekrar deneyin.",
    tooManyActiveTasks:
      "Zaten çok fazla aktif indirmeniz var. Birinin bitmesini bekleyin.",
    queueFull:
      "Sunucu şu anda meşgul. Lütfen kısa süre sonra tekrar deneyin.",
    storageBusy:
      "Sunucunun depolama alanı geçici olarak dolu. Lütfen daha sonra tekrar deneyin.",
    videoTooLong: "Bu video, desteklenen süre sınırını aşıyor.",
    videoTooLarge:
      "Bu video, desteklenen indirme boyutu sınırını aşıyor.",
    sourceUnavailable:
      "Bu video mevcut değil veya erişilemiyor.",
    subtitleNotFound:
      "Seçilen altyazı indirilemedi.",
    fileExpired: "Bu indirmenin süresi doldu. Lütfen yeni bir indirme oluşturun.",
    serviceRestarted:
      "İndirme, sunucu yeniden başlatması nedeniyle kesildi. Lütfen tekrar deneyin.",
    downloadVideoFailed:
      "Bu video indirilemedi. Lütfen tekrar deneyin.",
    internalError:
      "Sunucuda beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
    botCheck:
      "YouTube şu anda otomasyon doğrulaması istiyor. Lütfen birkaç dakika bekleyip tekrar deneyin veya başka bir video bağlantısı deneyin.",
  },
  meta: {
    title: "Vidsavey - Ücretsiz Çevrimiçi Video İndirici",
    description:
      "Vidsavey ile videoları hızlı ve kolayca çevrimiçi indirin. Desteklenen videoları MP4 veya MP3 olarak kaydedin ve mevcut altyazıları indirin.",
    keywords: [
      "vidsavey",
      "video indir",
      "video indirme",
      "youtube video indir",
      "youtube mp3 dönüştürücü",
      "çevrimiçi video indirici",
      "youtube mp4 indir",
      "mp4 indirici",
      "mp3 indirici",
      "altyazı indir",
    ],
    ogTitle: "Vidsavey - Ücretsiz Çevrimiçi Video İndirici",
    ogDescription:
      "Vidsavey ile desteklenen videoları MP4 veya MP3 olarak çevrimiçi indirin.",
    twitterTitle: "Vidsavey - Ücretsiz Çevrimiçi Video İndirici",
    twitterDescription:
      "Vidsavey ile videoları hızlı ve kolayca çevrimiçi indirin. Desteklenen videoları MP4 veya MP3 olarak kaydedin.",
  },
};

export const tr: Dictionary = trBase as Dictionary;
