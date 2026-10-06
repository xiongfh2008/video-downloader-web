import type { Dictionary } from "../i18n";

// Dictionary 由 `as const` 声明的 en 推导而来，字段为字符串字面量类型。
// 此处仅将字符串字面量放宽为 string 以承载阿拉伯语文案，
// 结构（字段名、嵌套层级、数组长度）仍严格对照 Dictionary 校验。
type WidenStrings<T> = T extends string
  ? string
  : { [K in keyof T]: WidenStrings<T[K]> };

const arBase: WidenStrings<Dictionary> = {
  nav: {
    guide: "الدليل",
    platforms: "المنصات المدعومة",
    faq: "الأسئلة الشائعة",
    privacy: "الخصوصية",
    terms: "الشروط",
    fastLink: "سريع وبسيط",
    primaryAriaLabel: "التنقل الرئيسي",
    langAriaLabel: "اللغة",
  },
  hero: {
    badge: "أداة تنزيل الفيديو المجانية عبر الإنترنت",
    titleLine1: "نزّل الفيديوهات",
    titleLine2: "بسرعة وسهولة",
    subtitle:
      "الصق رابط الفيديو ونزّل فيديوهاتك المفضلة في ثوانٍ.",
    urlPlaceholder: "الصق رابط الفيديو هنا...",
    urlAriaLabel: "رابط الفيديو",
    supportedPlatforms: "يدعم منصات الفيديو الشهيرة",
  },
  analyze: {
    button: "تحليل",
    analyzing: "جارٍ التحليل...",
  },
  result: {
    ready: "جاهز للتنزيل",
    thumbnailFallback: "صورة الفيديو المصغرة",
    uploaderLabel: "تم الرفع بواسطة:",
    durationLabel: "المدة:",
    formatLabel: "الصيغة",
    modeLabels: {
      mp4: "MP4",
      mp3: "MP3",
      subtitles: "الترجمات",
    },
    modeSubLabels: {
      mp4: "فيديو",
      mp3: "صوت",
      subtitles: "ترجمات",
    },
    noSubtitles: "لا توجد ترجمات متاحة لهذا الفيديو.",
    languageLabel: "اللغة",
    searchLanguagePlaceholder: "البحث عن لغة...",
    typeLabel: "النوع",
    typeLabels: {
      manual: "يدوي",
      automatic: "مُنشأ تلقائيًا",
    },
    subtitleFormatLabels: {
      vtt: "VTT",
      srt: "SRT",
    },
    downloadLabel: "تنزيل",
    downloadStarted: "بدأ التنزيل.",
    status: {
      queued: "في قائمة الانتظار",
      preparing: "جارٍ التحضير",
      downloading: "جارٍ التنزيل",
      processing: "جارٍ المعالجة",
      success: "بدأ التنزيل",
      failed: "فشل",
      expired: "منتهي الصلاحية",
    },
  },
  sections: {
    guide: {
      heading: "كيف يعمل",
      subheading: "ثلاث خطوات لحفظ فيديوك.",
    },
    features: {
      heading: "لماذا Vidsavey؟",
      subheading: "أداة بسيطة تحفظ فيديوهاتك.",
    },
    platforms: {
      heading: "المنصات المدعومة",
      description:
        "بدعم من yt-dlp، يدعم Vidsavey أكثر من 1000 موقع فيديو. إليك أشهر هذه المواقع:",
      more: "يدعم التنزيل من youtube.com وtiktok.com وinstagram.com وfacebook.com وx.com والمزيد من مواقع الفيديو.",
    },
    faq: {
      heading: "الأسئلة الشائعة",
      subheading: "كل ما تحتاج معرفته عن Vidsavey.",
    },
  },
  guideSteps: [
    {
      title: "الصق الرابط",
      description: "انسخ رابط الفيديو والصقه في مربع الإدخال أعلاه.",
    },
    {
      title: "حلّل الفيديو",
      description:
        "انقر فوق تحليل وستُجلب تفاصيل الفيديو تلقائيًا.",
    },
    {
      title: "نزّل الملف",
      description:
        "اختر MP4 أو MP3 أو الترجمات واحفظ الملف على جهازك.",
    },
  ],
  features: [
    {
      title: "تنزيل سريع",
      description: "معالجة سريعة لفيديوهاتك.",
    },
    {
      title: "بسيط وسهل",
      description: "بدون إعدادات معقدة.",
    },
    {
      title: "متوافق مع الجوال",
      description: "يعمل على الحاسوب والجوال.",
    },
  ],
  faq: [
    {
      question: "هل Vidsavey مجاني؟",
      answer:
        "نعم. Vidsavey أداة مجانية عبر الإنترنت. يمكنك تحليل وتنزيل الفيديوهات المدعومة دون إنشاء حساب.",
    },
    {
      question: "ما هي منصات الفيديو المدعومة؟",
      answer:
        "يدعم Vidsavey منصات الفيديو الشهيرة بما في ذلك YouTube وTikTok وInstagram وFacebook وX وTwitch وReddit وVimeo وDailymotion وBilibili وSoundCloud وPinterest وRumble وDouyin وWeibo والمزيد من مواقع الفيديو. قد يختلف التوفر من فيديو إلى آخر.",
    },
    {
      question: "هل يمكنني تنزيل الصوت بصيغة MP3؟",
      answer:
        "نعم. بعد تحليل الفيديو، اختر MP3 لتنزيل المقطع الصوتي عندما يكون المصدر متاحًا.",
    },
    {
      question: "هل يمكنني تنزيل الترجمات؟",
      answer:
        "نعم. عند توفر الترجمات، اختر الترجمات، ثم حدد اللغة ونوع المقطع، ونزّل الملف بصيغة VTT أو SRT.",
    },
    {
      question: "هل أحتاج إلى تثبيت أي برنامج؟",
      answer:
        "لا. يعمل Vidsavey في متصفحك. الصق رابط فيديو مدعوم، وحلّله، ثم نزّل الصيغة المتاحة.",
    },
  ],
  footer: {
    copyright: "© 2026 Vidsavey. جميع الحقوق محفوظة.",
    privacy: "الخصوصية",
    terms: "الشروط",
  },
  errors: {
    emptyUrl: "الرجاء إدخال رابط الفيديو.",
    invalidUrl: "الرجاء إدخال رابط صالح.",
    analyzeFailed: "تعذر تحليل هذا الفيديو. الرجاء المحاولة مرة أخرى.",
    selectSubtitle: "الرجاء اختيار خيار الترجمة.",
    downloadStartFailed:
      "تعذر بدء هذا التنزيل. الرجاء المحاولة مرة أخرى.",
    connectionLost:
      "انقطع الاتصال بالخادم. الرجاء المحاولة مرة أخرى.",
    progressCheckFailed:
      "تعذر التحقق من تقدم التنزيل. الرجاء المحاولة مرة أخرى.",
    downloadFailed:
      "تعذر تنزيل هذا الملف. الرجاء المحاولة مرة أخرى.",
    downloadTimeout:
      "يستغرق التنزيل وقتًا أطول من المتوقع. الرجاء المحاولة مرة أخرى.",
    invalidPublicUrl: "الرجاء إدخال رابط فيديو عام صالح.",
    rateLimited:
      "عدد كبير جدًا من الطلبات. الرجاء الانتظار قليلًا ثم المحاولة مرة أخرى.",
    tooManyActiveTasks:
      "لديك بالفعل عدد كبير جدًا من التنزيلات النشطة. الرجاء انتظار انتهاء أحدها.",
    queueFull:
      "الخادم مشغول حاليًا. الرجاء المحاولة بعد قليل.",
    storageBusy:
      "مساحة التخزين على الخادم منخفضة مؤقتًا. الرجاء المحاولة لاحقًا.",
    videoTooLong: "مدة هذا الفيديو تتجاوز الحد المدعوم.",
    videoTooLarge:
      "حجم هذا الفيديو يتجاوز حد التنزيل المدعوم.",
    sourceUnavailable:
      "هذا الفيديو غير متاح أو لا يمكن الوصول إليه.",
    subtitleNotFound:
      "تعذر تنزيل الترجمة المحددة.",
    fileExpired: "انتهت صلاحية هذا التنزيل. الرجاء إنشاء تنزيل جديد.",
    serviceRestarted:
      "توقفت عملية التنزيل بسبب إعادة تشغيل الخادم. الرجاء المحاولة مرة أخرى.",
    downloadVideoFailed:
      "تعذر تنزيل هذا الفيديو. الرجاء المحاولة مرة أخرى.",
    internalError:
      "واجه الخادم خطأً غير متوقع. الرجاء المحاولة مرة أخرى.",
    botCheck:
      "يطلب YouTube حاليًا التحقق من أن هذا الطلب ليس آليًا. يرجى الانتظار بضع دقائق ثم المحاولة مجددًا، أو تجربة رابط فيديو آخر.",
  },
  meta: {
    title: "Vidsavey - أداة تنزيل الفيديو المجانية عبر الإنترنت",
    description:
      "نزّل الفيديوهات عبر الإنترنت بسرعة وسهولة مع Vidsavey. احفظ الفيديوهات المدعومة بصيغة MP4 أو MP3 ونزّل الترجمات المتاحة.",
    keywords: [
      "Vidsavey",
      "تحميل فيديو",
      "تحميل فيديو اون لاين",
      "تنزيل فيديو يوتيوب",
      "تحميل فيديو من اليوتيوب",
      "تحميل mp4 من اليوتيوب",
      "تحميل فيديوهات اليوتيوب",
      "تحميل mp4",
      "تحميل mp3",
      "تحميل ترجمة الفيديو",
    ],
    ogTitle: "Vidsavey - أداة تنزيل الفيديو المجانية عبر الإنترنت",
    ogDescription:
      "نزّل الفيديوهات المدعومة عبر الإنترنت بصيغة MP4 أو MP3 مع Vidsavey.",
    twitterTitle: "Vidsavey - أداة تنزيل الفيديو المجانية عبر الإنترنت",
    twitterDescription:
      "نزّل الفيديوهات عبر الإنترنت بسرعة وسهولة مع Vidsavey. احفظ الفيديوهات المدعومة بصيغة MP4 أو MP3.",
  },
};

export const ar: Dictionary = arBase as Dictionary;
