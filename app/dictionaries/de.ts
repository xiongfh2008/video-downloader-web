import type { Dictionary } from "../i18n";

// Dictionary 由 `as const` 声明的 en 推导而来，字段为字符串字面量类型。
// 此处仅将字符串字面量放宽为 string 以承载德语文案，
// 结构（字段名、嵌套层级、数组长度）仍严格对照 Dictionary 校验。
type WidenStrings<T> = T extends string
  ? string
  : { [K in keyof T]: WidenStrings<T[K]> };

const deBase: WidenStrings<Dictionary> = {
  nav: {
    guide: "Anleitung",
    platforms: "Plattformen",
    faq: "FAQ",
    privacy: "Datenschutz",
    terms: "AGB",
    fastLink: "Schnell & einfach",
    primaryAriaLabel: "Hauptnavigation",
    langAriaLabel: "Sprache",
  },
  hero: {
    badge: "Kostenloser Online-Video-Downloader",
    titleLine1: "Videos herunterladen",
    titleLine2: "Schnell und einfach",
    subtitle:
      "Füge eine Video-URL ein und lade deine Lieblingsvideos in Sekunden herunter.",
    urlPlaceholder: "Video-URL hier einfügen...",
    urlAriaLabel: "Video-URL",
    supportedPlatforms: "Unterstützt beliebte Video-Plattformen",
  },
  analyze: {
    button: "Analysieren",
    analyzing: "Wird analysiert...",
  },
  result: {
    ready: "Bereit zum Herunterladen",
    thumbnailFallback: "Video-Vorschaubild",
    uploaderLabel: "Hochgeladen von:",
    durationLabel: "Dauer:",
    formatLabel: "Format",
    modeLabels: {
      mp4: "MP4",
      mp3: "MP3",
      subtitles: "Untertitel",
    },
    modeSubLabels: {
      mp4: "Video",
      mp3: "Audio",
      subtitles: "Untertitel",
    },
    noSubtitles: "Für dieses Video sind keine Untertitel verfügbar.",
    languageLabel: "Sprache",
    searchLanguagePlaceholder: "Sprache suchen...",
    typeLabel: "Typ",
    typeLabels: {
      manual: "Manuell",
      automatic: "Automatisch generiert",
    },
    subtitleFormatLabels: {
      vtt: "VTT",
      srt: "SRT",
    },
    downloadLabel: "Herunterladen",
    downloadStarted: "Download gestartet.",
    status: {
      queued: "In Warteschlange",
      preparing: "Wird vorbereitet",
      downloading: "Wird heruntergeladen",
      processing: "Wird verarbeitet",
      success: "Download gestartet",
      failed: "Fehlgeschlagen",
      expired: "Abgelaufen",
    },
  },
  sections: {
    guide: {
      heading: "So funktioniert es",
      subheading: "Drei Schritte, um dein Video zu speichern.",
    },
    features: {
      heading: "Warum Vidsavey?",
      subheading: "Ein einfaches Tool, das deine Videos speichert.",
    },
    platforms: {
      heading: "Unterstützte Plattformen",
      description:
        "Angetrieben von yt-dlp unterstützt Vidsavey über 1000 Video-Websites. Dies sind die beliebtesten:",
      more: "Unterstützt Downloads von youtube.com, tiktok.com, instagram.com, facebook.com, x.com und weiteren Video-Websites.",
    },
    faq: {
      heading: "Häufig gestellte Fragen",
      subheading: "Alles, was du über Vidsavey wissen musst.",
    },
  },
  guideSteps: [
    {
      title: "URL einfügen",
      description: "Kopiere den Video-Link und füge ihn in das obige Feld ein.",
    },
    {
      title: "Video analysieren",
      description:
        "Klicke auf Analysieren und die Video-Details werden automatisch geladen.",
    },
    {
      title: "Datei herunterladen",
      description:
        "Wähle MP4, MP3 oder Untertitel und speichere die Datei auf deinem Gerät.",
    },
  ],
  features: [
    {
      title: "Schneller Download",
      description: "Verarbeitet dein Video in Sekunden.",
    },
    {
      title: "Einfach & unkompliziert",
      description: "Keine komplizierten Einstellungen.",
    },
    {
      title: "Mobilfreundlich",
      description: "Funktioniert auf Desktop und Mobilgerät.",
    },
  ],
  faq: [
    {
      question: "Ist Vidsavey kostenlos?",
      answer:
        "Ja. Vidsavey ist ein kostenloses Online-Tool. Du kannst unterstützte Videos analysieren und herunterladen, ohne ein Konto zu erstellen.",
    },
    {
      question: "Welche Video-Plattformen werden unterstützt?",
      answer:
        "Vidsavey unterstützt beliebte Video-Plattformen wie YouTube, TikTok, Instagram, Facebook, X, Twitch, Reddit, Vimeo, Dailymotion, Bilibili, SoundCloud, Pinterest, Rumble, Douyin, Weibo und weitere Video-Websites. Die Verfügbarkeit kann je nach Video variieren.",
    },
    {
      question: "Kann ich MP3-Audio herunterladen?",
      answer:
        "Ja. Wähle nach der Analyse eines Videos MP3 aus, um die Tonspur herunterzuladen, sofern sie verfügbar ist.",
    },
    {
      question: "Kann ich Untertitel herunterladen?",
      answer:
        "Ja. Wenn Untertitel verfügbar sind, wähle Untertitel aus, wähle eine Sprache und einen Typ und lade sie als VTT oder SRT herunter.",
    },
    {
      question: "Muss ich Software installieren?",
      answer:
        "Nein. Vidsavey läuft in deinem Browser. Füge die URL eines unterstützten Videos ein, analysiere es und lade das verfügbare Format herunter.",
    },
  ],
  footer: {
    copyright: "© 2026 Vidsavey. Alle Rechte vorbehalten.",
    privacy: "Datenschutz",
    terms: "AGB",
  },
  errors: {
    emptyUrl: "Bitte gib eine Video-URL ein.",
    invalidUrl: "Bitte gib eine gültige URL ein.",
    analyzeFailed: "Dieses Video konnte nicht analysiert werden. Bitte versuche es erneut.",
    selectSubtitle: "Bitte wähle eine Untertitel-Option aus.",
    downloadStartFailed:
      "Dieser Download konnte nicht gestartet werden. Bitte versuche es erneut.",
    connectionLost:
      "Die Verbindung zum Server wurde unterbrochen. Bitte versuche es erneut.",
    progressCheckFailed:
      "Der Downloadfortschritt konnte nicht geprüft werden. Bitte versuche es erneut.",
    downloadFailed:
      "Diese Datei konnte nicht heruntergeladen werden. Bitte versuche es erneut.",
    downloadTimeout:
      "Der Download dauert länger als erwartet. Bitte versuche es erneut.",
    invalidPublicUrl: "Bitte gib eine gültige öffentliche Video-URL ein.",
    rateLimited:
      "Zu viele Anfragen. Bitte warte einen Moment und versuche es erneut.",
    tooManyActiveTasks:
      "Du hast bereits zu viele aktive Downloads. Bitte warte, bis einer abgeschlossen ist.",
    queueFull:
      "Der Server ist derzeit ausgelastet. Bitte versuche es in Kürze erneut.",
    storageBusy:
      "Der Speicherplatz des Servers ist vorübergehend knapp. Bitte versuche es später erneut.",
    videoTooLong: "Dieses Video überschreitet die unterstützte Maximallänge.",
    videoTooLarge:
      "Dieses Video überschreitet die unterstützte maximale Downloadgröße.",
    sourceUnavailable:
      "Dieses Video ist nicht verfügbar oder kann nicht abgerufen werden.",
    subtitleNotFound:
      "Der ausgewählte Untertitel konnte nicht heruntergeladen werden.",
    fileExpired: "Dieser Download ist abgelaufen. Bitte erstelle einen neuen Download.",
    serviceRestarted:
      "Der Download wurde durch einen Server-Neustart unterbrochen. Bitte versuche es erneut.",
    downloadVideoFailed:
      "Dieses Video konnte nicht heruntergeladen werden. Bitte versuche es erneut.",
    internalError:
      "Auf dem Server ist ein unerwarteter Fehler aufgetreten. Bitte versuche es erneut.",
    botCheck:
      "YouTube verlangt derzeit eine Anti-Bot-Verifizierung. Warte bitte einige Minuten und versuche es erneut, oder verwende einen anderen Video-Link.",
  },
  meta: {
    title: "Vidsavey - Kostenloser Online-Video-Downloader",
    description:
      "Lade mit Vidsavey schnell und einfach Videos online herunter. Speichere unterstützte Videos als MP4 oder MP3 und lade verfügbare Untertitel herunter.",
    keywords: [
      "vidsavey",
      "video herunterladen",
      "video downloader",
      "youtube video herunterladen",
      "youtube downloader",
      "youtube zu mp4",
      "youtube video download",
      "mp4 herunterladen",
      "mp3 herunterladen",
      "untertitel herunterladen",
    ],
    ogTitle: "Vidsavey - Kostenloser Online-Video-Downloader",
    ogDescription:
      "Lade unterstützte Videos mit Vidsavey online als MP4 oder MP3 herunter.",
    twitterTitle: "Vidsavey - Kostenloser Online-Video-Downloader",
    twitterDescription:
      "Lade mit Vidsavey schnell und einfach Videos online herunter. Speichere unterstützte Videos als MP4 oder MP3.",
  },
};

export const de: Dictionary = deBase as Dictionary;
