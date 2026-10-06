import type { Dictionary } from "../i18n";

// Dictionary 由 `as const` 声明的 en 推导而来，字段为字符串字面量类型。
// 此处仅将字符串字面量放宽为 string 以承载荷兰语文案，
// 结构（字段名、嵌套层级、数组长度）仍严格对照 Dictionary 校验。
type WidenStrings<T> = T extends string
  ? string
  : { [K in keyof T]: WidenStrings<T[K]> };

const nlBase: WidenStrings<Dictionary> = {
  nav: {
    guide: "Handleiding",
    platforms: "Ondersteunde platforms",
    faq: "FAQ",
    privacy: "Privacy",
    terms: "Voorwaarden",
    fastLink: "Snel en eenvoudig",
    primaryAriaLabel: "Hoofdnavigatie",
    langAriaLabel: "Taal",
  },
  hero: {
    badge: "Gratis online video-downloader",
    titleLine1: "Download video's",
    titleLine2: "Snel en eenvoudig",
    subtitle:
      "Plak een video-URL en download je favoriete video's binnen enkele seconden.",
    urlPlaceholder: "Plak hier de video-URL...",
    urlAriaLabel: "Video-URL",
    supportedPlatforms: "Ondersteunt populaire videoplatforms",
  },
  analyze: {
    button: "Analyseren",
    analyzing: "Bezig met analyseren...",
  },
  result: {
    ready: "Klaar om te downloaden",
    thumbnailFallback: "Videominiatuur",
    uploaderLabel: "Geüpload door:",
    durationLabel: "Duur:",
    formatLabel: "Formaat",
    modeLabels: {
      mp4: "MP4",
      mp3: "MP3",
      subtitles: "Ondertitels",
    },
    modeSubLabels: {
      mp4: "Video",
      mp3: "Audio",
      subtitles: "Ondertitels",
    },
    noSubtitles: "Er zijn geen ondertitels beschikbaar voor deze video.",
    languageLabel: "Taal",
    searchLanguagePlaceholder: "Taal zoeken...",
    typeLabel: "Type",
    typeLabels: {
      manual: "Handmatig",
      automatic: "Automatisch gegenereerd",
    },
    subtitleFormatLabels: {
      vtt: "VTT",
      srt: "SRT",
    },
    downloadLabel: "Downloaden",
    downloadStarted: "Download gestart.",
    status: {
      queued: "In wachtrij",
      preparing: "Voorbereiden",
      downloading: "Downloaden",
      processing: "Verwerken",
      success: "Download gestart",
      failed: "Mislukt",
      expired: "Verlopen",
    },
  },
  sections: {
    guide: {
      heading: "Hoe het werkt",
      subheading: "Drie stappen om je video op te slaan.",
    },
    features: {
      heading: "Waarom Vidsavey?",
      subheading: "Een eenvoudige tool die je video's opslaat.",
    },
    platforms: {
      heading: "Ondersteunde platforms",
      description:
        "Aangedreven door yt-dlp ondersteunt Vidsavey meer dan 1000 videosites. Dit zijn de populairste:",
      more: "Ondersteunt downloads van youtube.com, tiktok.com, instagram.com, facebook.com, x.com en meer videosites.",
    },
    faq: {
      heading: "Veelgestelde vragen",
      subheading: "Alles wat je moet weten over Vidsavey.",
    },
  },
  guideSteps: [
    {
      title: "Plak de URL",
      description: "Kopieer de videolink en plak deze in het invoerveld hierboven.",
    },
    {
      title: "Analyseer de video",
      description:
        "Klik op Analyseren en de videogegevens worden voor je opgehaald.",
    },
    {
      title: "Download het bestand",
      description:
        "Kies MP4, MP3 of ondertitels en sla het bestand op je apparaat op.",
    },
  ],
  features: [
    {
      title: "Snelle download",
      description: "Verwerkt je video snel.",
    },
    {
      title: "Simpel en eenvoudig",
      description: "Geen ingewikkelde instellingen.",
    },
    {
      title: "Mobielvriendelijk",
      description: "Werkt op desktop en mobiel.",
    },
  ],
  faq: [
    {
      question: "Is Vidsavey gratis?",
      answer:
        "Ja. Vidsavey is een gratis online tool. Je kunt ondersteunde video's analyseren en downloaden zonder een account aan te maken.",
    },
    {
      question: "Welke videoplatforms worden ondersteund?",
      answer:
        "Vidsavey ondersteunt populaire videoplatforms zoals YouTube, TikTok, Instagram, Facebook, X, Twitch, Reddit, Vimeo, Dailymotion, Bilibili, SoundCloud, Pinterest, Rumble, Douyin, Weibo en meer videosites. De beschikbaarheid kan per video verschillen.",
    },
    {
      question: "Kan ik MP3-audio downloaden?",
      answer:
        "Ja. Nadat je een video hebt geanalyseerd, selecteer je MP3 om het audiospoor te downloaden wanneer dat beschikbaar is.",
    },
    {
      question: "Kan ik ondertitels downloaden?",
      answer:
        "Ja. Wanneer er ondertitels beschikbaar zijn, kies je Ondertitels, selecteer je een taal en het type track en download je VTT of SRT.",
    },
    {
      question: "Moet ik software installeren?",
      answer:
        "Nee. Vidsavey werkt in je browser. Plak de URL van een ondersteunde video, analyseer deze en download het beschikbare formaat.",
    },
  ],
  footer: {
    copyright: "© 2026 Vidsavey. Alle rechten voorbehouden.",
    privacy: "Privacy",
    terms: "Voorwaarden",
  },
  errors: {
    emptyUrl: "Voer een video-URL in.",
    invalidUrl: "Voer een geldige URL in.",
    analyzeFailed: "Deze video kon niet worden geanalyseerd. Probeer het opnieuw.",
    selectSubtitle: "Selecteer een ondertiteloptie.",
    downloadStartFailed:
      "Deze download kon niet worden gestart. Probeer het opnieuw.",
    connectionLost:
      "De verbinding met de server is verbroken. Probeer het opnieuw.",
    progressCheckFailed:
      "De voortgang van de download kon niet worden gecontroleerd. Probeer het opnieuw.",
    downloadFailed:
      "Dit bestand kon niet worden gedownload. Probeer het opnieuw.",
    downloadTimeout:
      "De download duurt langer dan verwacht. Probeer het opnieuw.",
    invalidPublicUrl: "Voer een geldige openbare video-URL in.",
    rateLimited:
      "Te veel verzoeken. Wacht even en probeer het opnieuw.",
    tooManyActiveTasks:
      "Je hebt al te veel actieve downloads. Wacht tot er één is voltooid.",
    queueFull:
      "De server is momenteel druk. Probeer het straks opnieuw.",
    storageBusy:
      "De server heeft tijdelijk weinig opslagruimte. Probeer het later opnieuw.",
    videoTooLong: "Deze video overschrijdt de maximale ondersteunde duur.",
    videoTooLarge:
      "Deze video overschrijdt de maximale downloadgrootte.",
    sourceUnavailable:
      "Deze video is niet beschikbaar of kan niet worden geopend.",
    subtitleNotFound:
      "De geselecteerde ondertitel kon niet worden gedownload.",
    fileExpired: "Deze download is verlopen. Maak een nieuwe download aan.",
    serviceRestarted:
      "De download is onderbroken door een herstart van de server. Probeer het opnieuw.",
    downloadVideoFailed:
      "Deze video kon niet worden gedownload. Probeer het opnieuw.",
    internalError:
      "Er is een onverwachte fout opgetreden op de server. Probeer het opnieuw.",
    botCheck:
      "YouTube vraagt momenteel om een anti-botverificatie. Wacht enkele minuten en probeer het opnieuw, of gebruik een andere videolink.",
  },
  meta: {
    title: "Vidsavey - Gratis Online Video Downloader",
    description:
      "Download video's online snel en eenvoudig met Vidsavey. Sla ondersteunde video's op als MP4 of MP3 en download beschikbare ondertitels.",
    keywords: [
      "vidsavey",
      "video downloader",
      "video downloaden",
      "youtube video downloaden",
      "youtube naar mp4",
      "online video downloaden",
      "video naar mp3",
      "mp4 downloaden",
      "mp3 downloaden",
      "ondertitels downloaden",
    ],
    ogTitle: "Vidsavey - Gratis Online Video Downloader",
    ogDescription:
      "Download ondersteunde video's online als MP4 of MP3 met Vidsavey.",
    twitterTitle: "Vidsavey - Gratis Online Video Downloader",
    twitterDescription:
      "Download video's online snel en eenvoudig met Vidsavey. Sla ondersteunde video's op als MP4 of MP3.",
  },
};

export const nl: Dictionary = nlBase as Dictionary;
