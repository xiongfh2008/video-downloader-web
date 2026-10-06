import type { Dictionary } from "../i18n";

// Dictionary 由 `as const` 声明的 en 推导而来，字段为字符串字面量类型。
// 此处仅将字符串字面量放宽为 string 以承载西班牙语文案，
// 结构（字段名、嵌套层级、数组长度）仍严格对照 Dictionary 校验。
type WidenStrings<T> = T extends string
  ? string
  : { [K in keyof T]: WidenStrings<T[K]> };

const esBase: WidenStrings<Dictionary> = {
  nav: {
    guide: "Guía",
    platforms: "Plataformas",
    faq: "FAQ",
    privacy: "Privacidad",
    terms: "Términos",
    fastLink: "Rápido y simple",
    primaryAriaLabel: "Navegación principal",
    langAriaLabel: "Idioma",
  },
  hero: {
    badge: "Descargador de videos en línea gratis",
    titleLine1: "Descarga videos",
    titleLine2: "Rápido y fácil",
    subtitle:
      "Pega la URL de un video y descarga tus videos favoritos en segundos.",
    urlPlaceholder: "Pega aquí la URL del video...",
    urlAriaLabel: "URL del video",
    supportedPlatforms: "Compatible con plataformas de video populares",
  },
  analyze: {
    button: "Analizar",
    analyzing: "Analizando...",
  },
  result: {
    ready: "Listo para descargar",
    thumbnailFallback: "Miniatura del video",
    uploaderLabel: "Subido por:",
    durationLabel: "Duración:",
    formatLabel: "Formato",
    modeLabels: {
      mp4: "MP4",
      mp3: "MP3",
      subtitles: "Subtítulos",
    },
    modeSubLabels: {
      mp4: "Video",
      mp3: "Audio",
      subtitles: "Subtítulos",
    },
    noSubtitles: "No hay subtítulos disponibles para este video.",
    languageLabel: "Idioma",
    searchLanguagePlaceholder: "Buscar idioma...",
    typeLabel: "Tipo",
    typeLabels: {
      manual: "Manual",
      automatic: "Generados automáticamente",
    },
    subtitleFormatLabels: {
      vtt: "VTT",
      srt: "SRT",
    },
    downloadLabel: "Descargar",
    downloadStarted: "Descarga iniciada.",
    status: {
      queued: "En cola",
      preparing: "Preparando",
      downloading: "Descargando",
      processing: "Procesando",
      success: "Descarga iniciada",
      failed: "Error",
      expired: "Expirado",
    },
  },
  sections: {
    guide: {
      heading: "Cómo funciona",
      subheading: "Tres pasos para guardar tu video.",
    },
    features: {
      heading: "¿Por qué Vidsavey?",
      subheading: "Una herramienta simple que guarda tus videos.",
    },
    platforms: {
      heading: "Plataformas compatibles",
      description:
        "Impulsado por yt-dlp, Vidsavey admite más de 1000 sitios de video. Estos son los más populares:",
      more: "Permite descargar videos de youtube.com, tiktok.com, instagram.com, facebook.com, x.com y más sitios de video.",
    },
    faq: {
      heading: "Preguntas frecuentes",
      subheading: "Todo lo que necesitas saber sobre Vidsavey.",
    },
  },
  guideSteps: [
    {
      title: "Pega la URL",
      description: "Copia el enlace del video y pégalo en el campo de arriba.",
    },
    {
      title: "Analiza el video",
      description:
        "Haz clic en Analizar y los detalles del video se cargarán automáticamente.",
    },
    {
      title: "Descarga el archivo",
      description:
        "Elige MP4, MP3 o subtítulos y guarda el archivo en tu dispositivo.",
    },
  ],
  features: [
    {
      title: "Descarga rápida",
      description: "Procesa tu video rápidamente.",
    },
    {
      title: "Simple y fácil",
      description: "Sin configuraciones complicadas.",
    },
    {
      title: "Adaptado a móviles",
      description: "Funciona en escritorio y móvil.",
    },
  ],
  faq: [
    {
      question: "¿Vidsavey es gratis?",
      answer:
        "Sí. Vidsavey es una herramienta en línea gratuita. Puedes analizar y descargar videos compatibles sin crear una cuenta.",
    },
    {
      question: "¿Qué plataformas de video son compatibles?",
      answer:
        "Vidsavey es compatible con plataformas de video populares como YouTube, TikTok, Instagram, Facebook, X, Twitch, Reddit, Vimeo, Dailymotion, Bilibili, SoundCloud, Pinterest, Rumble, Douyin, Weibo y más sitios de video. La disponibilidad puede variar según cada video.",
    },
    {
      question: "¿Puedo descargar audio en MP3?",
      answer:
        "Sí. Después de analizar un video, selecciona MP3 para descargar la pista de audio cuando esté disponible.",
    },
    {
      question: "¿Puedo descargar subtítulos?",
      answer:
        "Sí. Cuando haya subtítulos disponibles, elige Subtítulos, selecciona un idioma y el tipo de pista, y descarga en VTT o SRT.",
    },
    {
      question: "¿Necesito instalar algún programa?",
      answer:
        "No. Vidsavey funciona en tu navegador. Pega la URL de un video compatible, analízalo y descarga el formato disponible.",
    },
  ],
  footer: {
    copyright: "© 2026 Vidsavey. Todos los derechos reservados.",
    privacy: "Privacidad",
    terms: "Términos",
  },
  errors: {
    emptyUrl: "Ingresa la URL de un video.",
    invalidUrl: "Ingresa una URL válida.",
    analyzeFailed: "No se pudo analizar este video. Inténtalo de nuevo.",
    selectSubtitle: "Selecciona una opción de subtítulos.",
    downloadStartFailed:
      "No se pudo iniciar esta descarga. Inténtalo de nuevo.",
    connectionLost:
      "Se perdió la conexión con el servidor. Inténtalo de nuevo.",
    progressCheckFailed:
      "No se pudo verificar el progreso de la descarga. Inténtalo de nuevo.",
    downloadFailed:
      "No se pudo descargar este archivo. Inténtalo de nuevo.",
    downloadTimeout:
      "La descarga está tardando más de lo esperado. Inténtalo de nuevo.",
    invalidPublicUrl: "Ingresa una URL pública válida del video.",
    rateLimited:
      "Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.",
    tooManyActiveTasks:
      "Ya tienes demasiadas descargas activas. Espera a que una finalice.",
    queueFull:
      "El servidor está ocupado en este momento. Inténtalo en unos minutos.",
    storageBusy:
      "El servidor tiene poco espacio de almacenamiento temporalmente. Inténtalo más tarde.",
    videoTooLong: "Este video supera la duración máxima permitida.",
    videoTooLarge:
      "Este video supera el tamaño máximo de descarga permitido.",
    sourceUnavailable:
      "Este video no está disponible o no se puede acceder a él.",
    subtitleNotFound:
      "No se pudo descargar el subtítulo seleccionado.",
    fileExpired: "Esta descarga expiró. Crea una nueva descarga.",
    serviceRestarted:
      "La descarga fue interrumpida por un reinicio del servidor. Inténtalo de nuevo.",
    downloadVideoFailed:
      "No se pudo descargar este video. Inténtalo de nuevo.",
    internalError:
      "El servidor encontró un error inesperado. Inténtalo de nuevo.",
    botCheck:
      "YouTube está pidiendo ahora una verificación anti-automatización. Espera unos minutos e inténtalo de nuevo, o prueba con otro enlace de vídeo.",
  },
  meta: {
    title: "Vidsavey - Descargador de videos en línea gratis",
    description:
      "Descarga videos en línea de forma rápida y fácil con Vidsavey. Guarda videos como MP4 o MP3 y descarga los subtítulos disponibles.",
    keywords: [
      "Vidsavey",
      "descargador de videos",
      "online video downloader",
      "youtube videodownloader",
      "descargar videos de youtube",
      "youtube a mp4",
      "descargar videos online",
      "descargador mp4",
      "descargador mp3",
      "descargar subtítulos",
    ],
    ogTitle: "Vidsavey - Descargador de videos en línea gratis",
    ogDescription:
      "Descarga videos compatibles en línea como MP4 o MP3 con Vidsavey.",
    twitterTitle: "Vidsavey - Descargador de videos en línea gratis",
    twitterDescription:
      "Descarga videos en línea de forma rápida y fácil con Vidsavey. Guarda videos como MP4 o MP3.",
  },
};

export const es: Dictionary = esBase as Dictionary;
