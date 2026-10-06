import type { Dictionary } from "../i18n";

// Dictionary 由 `as const` 声明的 en 推导而来，字段为字符串字面量类型。
// 此处仅将字符串字面量放宽为 string 以承载波兰语文案，
// 结构（字段名、嵌套层级、数组长度）仍严格对照 Dictionary 校验。
type WidenStrings<T> = T extends string
  ? string
  : { [K in keyof T]: WidenStrings<T[K]> };

const plBase: WidenStrings<Dictionary> = {
  nav: {
    guide: "Przewodnik",
    platforms: "Platformy",
    faq: "FAQ",
    privacy: "Prywatność",
    terms: "Regulamin",
    fastLink: "Szybko i prosto",
    primaryAriaLabel: "Nawigacja główna",
    langAriaLabel: "Język",
  },
  hero: {
    badge: "Darmowy pobieracz wideo online",
    titleLine1: "Pobieraj filmy",
    titleLine2: "Szybko i łatwo",
    subtitle:
      "Wklej adres URL filmu i pobierz swoje ulubione filmy w kilka sekund.",
    urlPlaceholder: "Wklej tutaj adres URL filmu...",
    urlAriaLabel: "Adres URL filmu",
    supportedPlatforms: "Obsługuje popularne platformy wideo",
  },
  analyze: {
    button: "Analizuj",
    analyzing: "Analizowanie...",
  },
  result: {
    ready: "Gotowe do pobrania",
    thumbnailFallback: "Miniatura filmu",
    uploaderLabel: "Przesłał:",
    durationLabel: "Czas trwania:",
    formatLabel: "Format",
    modeLabels: {
      mp4: "MP4",
      mp3: "MP3",
      subtitles: "Napisy",
    },
    modeSubLabels: {
      mp4: "Wideo",
      mp3: "Audio",
      subtitles: "Napisy",
    },
    noSubtitles: "Ten film nie ma dostępnych napisów.",
    languageLabel: "Język",
    searchLanguagePlaceholder: "Szukaj języka...",
    typeLabel: "Typ",
    typeLabels: {
      manual: "Ręczne",
      automatic: "Generowane automatycznie",
    },
    subtitleFormatLabels: {
      vtt: "VTT",
      srt: "SRT",
    },
    downloadLabel: "Pobierz",
    downloadStarted: "Pobieranie rozpoczęte.",
    status: {
      queued: "W kolejce",
      preparing: "Przygotowywanie",
      downloading: "Pobieranie",
      processing: "Przetwarzanie",
      success: "Pobieranie rozpoczęte",
      failed: "Niepowodzenie",
      expired: "Wygasło",
    },
  },
  sections: {
    guide: {
      heading: "Jak to działa",
      subheading: "Trzy kroki, aby zapisać swój film.",
    },
    features: {
      heading: "Dlaczego Vidsavey?",
      subheading: "Proste narzędzie, które zapisze Twoje filmy.",
    },
    platforms: {
      heading: "Obsługiwane platformy",
      description:
        "Dzięki yt-dlp Vidsavey obsługuje ponad 1000 stron z wideo. Oto najpopularniejsze z nich:",
      more: "Obsługuje pobieranie z youtube.com, tiktok.com, instagram.com, facebook.com, x.com i innych stron z wideo.",
    },
    faq: {
      heading: "Często zadawane pytania",
      subheading: "Wszystko, co musisz wiedzieć o Vidsavey.",
    },
  },
  guideSteps: [
    {
      title: "Wklej adres URL",
      description: "Skopiuj link do filmu i wklej go w pole powyżej.",
    },
    {
      title: "Analizuj film",
      description:
        "Kliknij Analizuj, a szczegóły filmu zostaną pobrane automatycznie.",
    },
    {
      title: "Pobierz plik",
      description:
        "Wybierz MP4, MP3 lub napisy i zapisz plik na swoim urządzeniu.",
    },
  ],
  features: [
    {
      title: "Szybkie pobieranie",
      description: "Szybko przetworzy Twój film.",
    },
    {
      title: "Proste i łatwe",
      description: "Bez skomplikowanych ustawień.",
    },
    {
      title: "Dostępne na mobile",
      description: "Działa na komputerze i telefonie.",
    },
  ],
  faq: [
    {
      question: "Czy Vidsavey jest darmowy?",
      answer:
        "Tak. Vidsavey to darmowe narzędzie online. Możesz analizować i pobierać obsługiwane filmy bez tworzenia konta.",
    },
    {
      question: "Które platformy wideo są obsługiwane?",
      answer:
        "Vidsavey obsługuje popularne platformy wideo, w tym YouTube, TikTok, Instagram, Facebook, X, Twitch, Reddit, Vimeo, Dailymotion, Bilibili, SoundCloud, Pinterest, Rumble, Douyin, Weibo i inne strony z wideo. Dostępność może się różnić w zależności od konkretnego filmu.",
    },
    {
      question: "Czy mogę pobierać dźwięk w formacie MP3?",
      answer:
        "Tak. Po przeanalizowaniu filmu wybierz MP3, aby pobrać ścieżkę dźwiękową, jeśli jest dostępna.",
    },
    {
      question: "Czy mogę pobierać napisy?",
      answer:
        "Tak. Gdy napisy są dostępne, wybierz Napisy, wybierz język i typ ścieżki, a następnie pobierz plik VTT lub SRT.",
    },
    {
      question: "Czy muszę instalować jakieś oprogramowanie?",
      answer:
        "Nie. Vidsavey działa w Twojej przeglądarce. Wklej adres URL obsługiwanego filmu, przeanalizuj go i pobierz dostępny format.",
    },
  ],
  footer: {
    copyright: "© 2026 Vidsavey. Wszelkie prawa zastrzeżone.",
    privacy: "Prywatność",
    terms: "Regulamin",
  },
  errors: {
    emptyUrl: "Wprowadź adres URL filmu.",
    invalidUrl: "Wprowadź prawidłowy adres URL.",
    analyzeFailed: "Nie można przeanalizować tego filmu. Spróbuj ponownie.",
    selectSubtitle: "Wybierz opcję napisów.",
    downloadStartFailed:
      "Nie można rozpocząć tego pobierania. Spróbuj ponownie.",
    connectionLost:
      "Połączenie z serwerem zostało utracone. Spróbuj ponownie.",
    progressCheckFailed:
      "Nie można sprawdzić postępu pobierania. Spróbuj ponownie.",
    downloadFailed:
      "Nie można pobrać tego pliku. Spróbuj ponownie.",
    downloadTimeout:
      "Pobieranie trwa dłużej niż oczekiwano. Spróbuj ponownie.",
    invalidPublicUrl: "Wprowadź prawidłowy publiczny adres URL filmu.",
    rateLimited:
      "Zbyt wiele żądań. Odczekaj chwilę i spróbuj ponownie.",
    tooManyActiveTasks:
      "Masz już zbyt wiele aktywnych pobrań. Poczekaj, aż jedno z nich się zakończy.",
    queueFull:
      "Serwer jest obecnie zajęty. Spróbuj ponownie za chwilę.",
    storageBusy:
      "Serwer ma tymczasowo mało miejsca na dane. Spróbuj ponownie później.",
    videoTooLong: "Ten film jest dłuższy niż obsługiwany limit.",
    videoTooLarge:
      "Ten film przekracza obsługiwany limit rozmiaru pobierania.",
    sourceUnavailable:
      "Ten film jest niedostępny lub nie można się do niego dostać.",
    subtitleNotFound:
      "Nie można pobrać wybranych napisów.",
    fileExpired: "To pobieranie wygasło. Utwórz nowe pobieranie.",
    serviceRestarted:
      "Pobieranie zostało przerwane przez ponowne uruchomienie serwera. Spróbuj ponownie.",
    downloadVideoFailed:
      "Nie można pobrać tego filmu. Spróbuj ponownie.",
    internalError:
      "Wystąpił nieoczekiwany błąd serwera. Spróbuj ponownie.",
    botCheck:
      "YouTube obecnie żąda weryfikacji antybotowej. Poczekaj kilka minut i spróbuj ponownie lub użyj innego linku do filmu.",
  },
  meta: {
    title: "Vidsavey - Darmowy pobieracz wideo online",
    description:
      "Pobieraj filmy online szybko i łatwo z Vidsavey. Zapisuj obsługiwane filmy jako MP4 lub MP3 i pobieraj dostępne napisy.",
    keywords: [
      "Vidsavey",
      "pobieracz wideo",
      "pobieranie filmów",
      "pobierz wideo z youtube",
      "pobieracz youtube",
      "youtube na mp4",
      "pobieranie wideo online",
      "pobieracz mp4",
      "pobieracz mp3",
      "pobieranie napisów",
    ],
    ogTitle: "Vidsavey - Darmowy pobieracz wideo online",
    ogDescription:
      "Pobieraj obsługiwane filmy online jako MP4 lub MP3 z Vidsavey.",
    twitterTitle: "Vidsavey - Darmowy pobieracz wideo online",
    twitterDescription:
      "Pobieraj filmy online szybko i łatwo z Vidsavey. Zapisuj obsługiwane filmy jako MP4 lub MP3.",
  },
};

export const pl: Dictionary = plBase as Dictionary;
