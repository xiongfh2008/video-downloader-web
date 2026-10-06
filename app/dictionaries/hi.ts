import type { Dictionary } from "../i18n";

// Dictionary 由 `as const` 声明的 en 推导而来，字段为字符串字面量类型。
// 此处仅将字符串字面量放宽为 string 以承载印地语文案，
// 结构（字段名、嵌套层级、数组长度）仍严格对照 Dictionary 校验。
type WidenStrings<T> = T extends string
  ? string
  : { [K in keyof T]: WidenStrings<T[K]> };

const hiBase: WidenStrings<Dictionary> = {
  nav: {
    guide: "गाइड",
    platforms: "प्लेटफ़ॉर्म",
    faq: "FAQ",
    privacy: "गोपनीयता",
    terms: "नियम व शर्तें",
    fastLink: "तेज़ और आसान",
    primaryAriaLabel: "मुख्य नेविगेशन",
    langAriaLabel: "भाषा",
  },
  hero: {
    badge: "मुफ़्त ऑनलाइन वीडियो डाउनलोडर",
    titleLine1: "वीडियो डाउनलोड करें",
    titleLine2: "तेज़ी से और आसानी से",
    subtitle:
      "वीडियो का URL पेस्ट करें और कुछ ही सेकंड में अपने पसंदीदा वीडियो डाउनलोड करें।",
    urlPlaceholder: "यहाँ वीडियो URL पेस्ट करें...",
    urlAriaLabel: "वीडियो URL",
    supportedPlatforms: "लोकप्रिय वीडियो प्लेटफ़ॉर्म समर्थित",
  },
  analyze: {
    button: "एनालाइज़ करें",
    analyzing: "एनालाइज़ हो रहा है...",
  },
  result: {
    ready: "डाउनलोड के लिए तैयार",
    thumbnailFallback: "वीडियो थंबनेल",
    uploaderLabel: "अपलोडर:",
    durationLabel: "अवधि:",
    formatLabel: "फ़ॉर्मैट",
    modeLabels: {
      mp4: "MP4",
      mp3: "MP3",
      subtitles: "सबटाइटल",
    },
    modeSubLabels: {
      mp4: "वीडियो",
      mp3: "ऑडियो",
      subtitles: "कैप्शन",
    },
    noSubtitles: "इस वीडियो के लिए कोई सबटाइटल उपलब्ध नहीं है।",
    languageLabel: "भाषा",
    searchLanguagePlaceholder: "भाषा खोजें...",
    typeLabel: "प्रकार",
    typeLabels: {
      manual: "मैनुअल",
      automatic: "ऑटो-जेनरेटेड",
    },
    subtitleFormatLabels: {
      vtt: "VTT",
      srt: "SRT",
    },
    downloadLabel: "डाउनलोड",
    downloadStarted: "डाउनलोड शुरू हो गया।",
    status: {
      queued: "क़तार में",
      preparing: "तैयार हो रहा है",
      downloading: "डाउनलोड हो रहा है",
      processing: "प्रोसेस हो रहा है",
      success: "डाउनलोड शुरू",
      failed: "विफल",
      expired: "समाप्त",
    },
  },
  sections: {
    guide: {
      heading: "यह कैसे काम करता है",
      subheading: "अपना वीडियो सेव करने के तीन चरण।",
    },
    features: {
      heading: "Vidsavey क्यों?",
      subheading: "एक आसान टूल जो आपके वीडियो सेव कर देता है।",
    },
    platforms: {
      heading: "समर्थित प्लेटफ़ॉर्म",
      description:
        "yt-dlp द्वारा संचालित, Vidsavey 1000+ वीडियो साइटों को सपोर्ट करता है। ये हैं सबसे लोकप्रिय:",
      more: "youtube.com, tiktok.com, instagram.com, facebook.com, x.com और कई अन्य वीडियो साइटों से डाउनलोड सपोर्ट करता है।",
    },
    faq: {
      heading: "अक्सर पूछे जाने वाले प्रश्न",
      subheading: "Vidsavey के बारे में वह सब जो आपको जानना चाहिए।",
    },
  },
  guideSteps: [
    {
      title: "URL पेस्ट करें",
      description: "वीडियो लिंक कॉपी करें और ऊपर दिए गए इनपुट बॉक्स में पेस्ट करें।",
    },
    {
      title: "वीडियो एनालाइज़ करें",
      description:
        "एनालाइज़ पर क्लिक करें और वीडियो की पूरी जानकारी अपने आप लोड हो जाएगी।",
    },
    {
      title: "फ़ाइल डाउनलोड करें",
      description:
        "MP4, MP3 या सबटाइटल चुनें और फ़ाइल को अपने डिवाइस में सेव करें।",
    },
  ],
  features: [
    {
      title: "तेज़ डाउनलोड",
      description: "आपका वीडियो तुरंत प्रोसेस होता है।",
    },
    {
      title: "सरल और आसान",
      description: "कोई जटिल सेटिंग नहीं।",
    },
    {
      title: "मोबाइल फ्रेंडली",
      description: "डेस्कटॉप और मोबाइल दोनों पर काम करता है।",
    },
  ],
  faq: [
    {
      question: "क्या Vidsavey मुफ़्त है?",
      answer:
        "हाँ। Vidsavey एक मुफ़्त ऑनलाइन टूल है। आप बिना अकाउंट बनाए समर्थित वीडियो को एनालाइज़ और डाउनलोड कर सकते हैं।",
    },
    {
      question: "कौन से वीडियो प्लेटफ़ॉर्म सपोर्टेड हैं?",
      answer:
        "Vidsavey YouTube, TikTok, Instagram, Facebook, X, Twitch, Reddit, Vimeo, Dailymotion, Bilibili, SoundCloud, Pinterest, Rumble, Douyin, Weibo और कई अन्य वीडियो साइटों जैसे लोकप्रिय प्लेटफ़ॉर्म को सपोर्ट करता है। उपलब्धता हर वीडियो के हिसाब से अलग हो सकती है।",
    },
    {
      question: "क्या मैं MP3 ऑडियो डाउनलोड कर सकता हूँ?",
      answer:
        "हाँ। वीडियो एनालाइज़ करने के बाद, सोर्स उपलब्ध होने पर MP3 चुनकर ऑडियो ट्रैक डाउनलोड करें।",
    },
    {
      question: "क्या मैं सबटाइटल डाउनलोड कर सकता हूँ?",
      answer:
        "हाँ। जब सबटाइटल उपलब्ध हों, तो Subtitles चुनें, भाषा और ट्रैक प्रकार चुनें, फिर VTT या SRT डाउनलोड करें।",
    },
    {
      question: "क्या मुझे कोई सॉफ़्टवेयर इंस्टॉल करने की ज़रूरत है?",
      answer:
        "नहीं। Vidsavey आपके ब्राउज़र में चलता है। समर्थित वीडियो का URL पेस्ट करें, एनालाइज़ करें और उपलब्ध फ़ॉर्मैट डाउनलोड करें।",
    },
  ],
  footer: {
    copyright: "© 2026 Vidsavey. सर्वाधिकार सुरक्षित।",
    privacy: "गोपनीयता",
    terms: "नियम व शर्तें",
  },
  errors: {
    emptyUrl: "कृपया वीडियो का URL दर्ज करें।",
    invalidUrl: "कृपया मान्य URL दर्ज करें।",
    analyzeFailed: "यह वीडियो एनालाइज़ नहीं हो सका। कृपया फिर से कोशिश करें।",
    selectSubtitle: "कृपया सबटाइटल विकल्प चुनें।",
    downloadStartFailed:
      "यह डाउनलोड शुरू नहीं हो सका। कृपया फिर से कोशिश करें।",
    connectionLost:
      "सर्वर से कनेक्शन टूट गया। कृपया फिर से कोशिश करें।",
    progressCheckFailed:
      "डाउनलोड की प्रगति जांची नहीं जा सकी। कृपया फिर से कोशिश करें।",
    downloadFailed:
      "यह फ़ाइल डाउनलोड नहीं हो सकी। कृपया फिर से कोशिश करें।",
    downloadTimeout:
      "डाउनलोड में अपेक्षा से ज़्यादा समय लग रहा है। कृपया फिर से कोशिश करें।",
    invalidPublicUrl: "कृपया वीडियो का मान्य सार्वजनिक URL दर्ज करें।",
    rateLimited:
      "बहुत ज़्यादा अनुरोध। कृपया थोड़ी देर प्रतीक्षा करें और फिर से कोशिश करें।",
    tooManyActiveTasks:
      "आपकी पहले से ही बहुत सारी डाउनलोड चल रही हैं। कृपया एक के पूरा होने का इंतज़ार करें।",
    queueFull:
      "सर्वर इस समय व्यस्त है। कृपया थोड़ी देर बाद कोशिश करें।",
    storageBusy:
      "सर्वर पर स्टोरेज अस्थायी रूप से कम है। कृपया बाद में कोशिश करें।",
    videoTooLong: "यह वीडियो समर्थित सीमा से लंबा है।",
    videoTooLarge:
      "यह वीडियो समर्थित डाउनलोड सीमा से बड़ा है।",
    sourceUnavailable:
      "यह वीडियो उपलब्ध नहीं है या उसे एक्सेस नहीं किया जा सकता।",
    subtitleNotFound:
      "चयनित सबटाइटल डाउनलोड नहीं हो सका।",
    fileExpired: "यह डाउनलोड समाप्त हो गया है। कृपया नया डाउनलोड बनाएं।",
    serviceRestarted:
      "सर्वर रीस्टार्ट होने से डाउनलोड बाधित हुआ। कृपया फिर से कोशिश करें।",
    downloadVideoFailed:
      "यह वीडियो डाउनलोड नहीं हो सका। कृपया फिर से कोशिश करें।",
    internalError:
      "सर्वर पर अनपेक्षित त्रुटि हुई। कृपया फिर से कोशिश करें।",
    botCheck:
      "YouTube अभी यह सत्यापित करने का अनुरोध कर रहा है कि यह अनुरोध स्वचालित नहीं है। कृपया कुछ मिनट प्रतीक्षा करके फिर से कोशिश करें या कोई अन्य वीडियो लिंक आज़माएँ।",
  },
  meta: {
    title: "Vidsavey - मुफ़्त ऑनलाइन वीडियो डाउनलोडर",
    description:
      "Vidsavey के साथ ऑनलाइन वीडियो तेज़ी और आसानी से डाउनलोड करें। समर्थित वीडियो को MP4 या MP3 में सेव करें और उपलब्ध सबटाइटल डाउनलोड करें।",
    keywords: [
      "vidsavey",
      "video downloader",
      "youtube video download",
      "youtube se video kaise download kare",
      "youtube video downloader",
      "youtube to mp4",
      "video download kaise kare",
      "online video downloader",
      "mp4 downloader",
      "mp3 downloader",
    ],
    ogTitle: "Vidsavey - मुफ़्त ऑनलाइन वीडियो डाउनलोडर",
    ogDescription:
      "Vidsavey के साथ समर्थित वीडियो को ऑनलाइन MP4 या MP3 में डाउनलोड करें।",
    twitterTitle: "Vidsavey - मुफ़्त ऑनलाइन वीडियो डाउनलोडर",
    twitterDescription:
      "Vidsavey के साथ ऑनलाइन वीडियो तेज़ी और आसानी से डाउनलोड करें। समर्थित वीडियो को MP4 या MP3 में सेव करें।",
  },
};

export const hi: Dictionary = hiBase as Dictionary;
