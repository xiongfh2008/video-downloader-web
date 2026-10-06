import type { Dictionary } from "../i18n";

// Dictionary 由 `as const` 声明的 en 推导而来，字段为字符串字面量类型。
// 此处仅将字符串字面量放宽为 string 以承载俄语文案，
// 结构（字段名、嵌套层级、数组长度）仍严格对照 Dictionary 校验。
type WidenStrings<T> = T extends string
  ? string
  : { [K in keyof T]: WidenStrings<T[K]> };

const ruBase: WidenStrings<Dictionary> = {
  nav: {
    guide: "Гайд",
    platforms: "Платформы",
    faq: "FAQ",
    privacy: "Приватность",
    terms: "Условия",
    fastLink: "Быстро и просто",
    primaryAriaLabel: "Основная навигация",
    langAriaLabel: "Язык",
  },
  hero: {
    badge: "Бесплатный онлайн-загрузчик видео",
    titleLine1: "Скачивайте видео",
    titleLine2: "Быстро и легко",
    subtitle:
      "Вставьте ссылку на видео и скачайте любимые видео за считанные секунды.",
    urlPlaceholder: "Вставьте ссылку на видео...",
    urlAriaLabel: "Ссылка на видео",
    supportedPlatforms: "Поддерживаются популярные видеоплатформы",
  },
  analyze: {
    button: "Анализировать",
    analyzing: "Анализируем...",
  },
  result: {
    ready: "Готово к скачиванию",
    thumbnailFallback: "Превью видео",
    uploaderLabel: "Автор:",
    durationLabel: "Длительность:",
    formatLabel: "Формат",
    modeLabels: {
      mp4: "MP4",
      mp3: "MP3",
      subtitles: "Субтитры",
    },
    modeSubLabels: {
      mp4: "Видео",
      mp3: "Аудио",
      subtitles: "Субтитры",
    },
    noSubtitles: "Для этого видео нет доступных субтитров.",
    languageLabel: "Язык",
    searchLanguagePlaceholder: "Поиск языка...",
    typeLabel: "Тип",
    typeLabels: {
      manual: "Вручную",
      automatic: "Автоматически созданные",
    },
    subtitleFormatLabels: {
      vtt: "VTT",
      srt: "SRT",
    },
    downloadLabel: "Скачать",
    downloadStarted: "Скачивание началось.",
    status: {
      queued: "В очереди",
      preparing: "Подготовка",
      downloading: "Скачивание",
      processing: "Обработка",
      success: "Скачивание началось",
      failed: "Ошибка",
      expired: "Срок истёк",
    },
  },
  sections: {
    guide: {
      heading: "Как это работает",
      subheading: "Три шага, чтобы сохранить видео.",
    },
    features: {
      heading: "Почему Vidsavey?",
      subheading: "Простой инструмент, который сохранит ваши видео.",
    },
    platforms: {
      heading: "Поддерживаемые платформы",
      description:
        "На базе yt-dlp Vidsavey поддерживает более 1000 видеосайтов. Вот самые популярные из них:",
      more: "Поддерживается скачивание видео с youtube.com, tiktok.com, instagram.com, facebook.com, x.com и других видеосайтов.",
    },
    faq: {
      heading: "Часто задаваемые вопросы",
      subheading: "Всё, что нужно знать о Vidsavey.",
    },
  },
  guideSteps: [
    {
      title: "Вставьте ссылку",
      description: "Скопируйте ссылку на видео и вставьте её в поле выше.",
    },
    {
      title: "Проанализируйте видео",
      description:
        "Нажмите «Анализировать», и данные видео загрузятся автоматически.",
    },
    {
      title: "Скачайте файл",
      description:
        "Выберите MP4, MP3 или субтитры и сохраните файл на устройство.",
    },
  ],
  features: [
    {
      title: "Быстрое скачивание",
      description: "Быстрая обработка вашего видео.",
    },
    {
      title: "Просто и удобно",
      description: "Никаких сложных настроек.",
    },
    {
      title: "Удобно с телефона",
      description: "Работает на компьютере и смартфоне.",
    },
  ],
  faq: [
    {
      question: "Бесплатен ли Vidsavey?",
      answer:
        "Да. Vidsavey — бесплатный онлайн-инструмент. Вы можете анализировать и скачивать поддерживаемые видео без создания аккаунта.",
    },
    {
      question: "Какие видеоплатформы поддерживаются?",
      answer:
        "Vidsavey поддерживает популярные видеоплатформы, включая YouTube, TikTok, Instagram, Facebook, X, Twitch, Reddit, Vimeo, Dailymotion, Bilibili, SoundCloud, Pinterest, Rumble, Douyin, Weibo и другие видеосайты. Доступность может различаться для отдельных видео.",
    },
    {
      question: "Можно ли скачать аудио в MP3?",
      answer:
        "Да. После анализа видео выберите MP3, чтобы скачать аудиодорожку, если она доступна.",
    },
    {
      question: "Можно ли скачать субтитры?",
      answer:
        "Да. Если субтитры доступны, выберите «Субтитры», укажите язык и тип дорожки, затем скачайте файл в формате VTT или SRT.",
    },
    {
      question: "Нужно ли устанавливать какие-либо программы?",
      answer:
        "Нет. Vidsavey работает прямо в браузере. Вставьте ссылку на поддерживаемое видео, проанализируйте его и скачайте доступный формат.",
    },
  ],
  footer: {
    copyright: "© 2026 Vidsavey. Все права защищены.",
    privacy: "Конфиденциальность",
    terms: "Условия",
  },
  errors: {
    emptyUrl: "Введите ссылку на видео.",
    invalidUrl: "Введите корректную ссылку.",
    analyzeFailed: "Не удалось проанализировать это видео. Попробуйте ещё раз.",
    selectSubtitle: "Выберите вариант субтитров.",
    downloadStartFailed:
      "Не удалось начать скачивание. Попробуйте ещё раз.",
    connectionLost:
      "Соединение с сервером потеряно. Попробуйте ещё раз.",
    progressCheckFailed:
      "Не удалось проверить прогресс скачивания. Попробуйте ещё раз.",
    downloadFailed:
      "Не удалось скачать этот файл. Попробуйте ещё раз.",
    downloadTimeout:
      "Скачивание занимает больше времени, чем ожидалось. Попробуйте ещё раз.",
    invalidPublicUrl: "Введите корректную публичную ссылку на видео.",
    rateLimited:
      "Слишком много запросов. Подождите немного и попробуйте снова.",
    tooManyActiveTasks:
      "У вас слишком много активных скачиваний. Дождитесь завершения одного из них.",
    queueFull:
      "Сервер сейчас перегружен. Попробуйте чуть позже.",
    storageBusy:
      "На сервере временно мало свободного места. Попробуйте позже.",
    videoTooLong: "Это видео длиннее допустимого лимита.",
    videoTooLarge:
      "Размер этого видео превышает допустимый лимит скачивания.",
    sourceUnavailable:
      "Это видео недоступно или к нему нет доступа.",
    subtitleNotFound:
      "Не удалось скачать выбранные субтитры.",
    fileExpired: "Срок действия этого скачивания истёк. Создайте новое скачивание.",
    serviceRestarted:
      "Скачивание было прервано перезапуском сервера. Попробуйте ещё раз.",
    downloadVideoFailed:
      "Не удалось скачать это видео. Попробуйте ещё раз.",
    internalError:
      "На сервере произошла непредвиденная ошибка. Попробуйте ещё раз.",
    botCheck:
      "YouTube сейчас требует подтвердить, что запрос не автоматический. Подождите несколько минут и попробуйте снова или используйте другую ссылку на видео.",
  },
  meta: {
    title: "Vidsavey - Бесплатный онлайн-загрузчик видео",
    description:
      "Скачивайте видео онлайн быстро и легко с Vidsavey. Сохраняйте видео в MP4 или MP3 и скачивайте доступные субтитры.",
    keywords: [
      "vidsavey",
      "скачать видео",
      "скачать видео онлайн",
      "скачать видео с youtube",
      "скачать видео с ютуб",
      "youtube в mp4",
      "скачать музыку из видео",
      "скачать mp4",
      "скачать mp3",
      "скачать субтитры",
    ],
    ogTitle: "Vidsavey - Бесплатный онлайн-загрузчик видео",
    ogDescription:
      "Скачивайте поддерживаемые видео онлайн в формате MP4 или MP3 с Vidsavey.",
    twitterTitle: "Vidsavey - Бесплатный онлайн-загрузчик видео",
    twitterDescription:
      "Скачивайте видео онлайн быстро и легко с Vidsavey. Сохраняйте видео в MP4 или MP3.",
  },
};

export const ru: Dictionary = ruBase as Dictionary;
