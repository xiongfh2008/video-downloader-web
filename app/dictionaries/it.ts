import type { Dictionary } from "../i18n";

// Dictionary 由 `as const` 声明的 en 推导而来，字段为字符串字面量类型。
// 此处仅将字符串字面量放宽为 string 以承载意大利语文案，
// 结构（字段名、嵌套层级、数组长度）仍严格对照 Dictionary 校验。
type WidenStrings<T> = T extends string
  ? string
  : { [K in keyof T]: WidenStrings<T[K]> };

const itBase: WidenStrings<Dictionary> = {
  nav: {
    guide: "Guida",
    platforms: "Piattaforme",
    faq: "FAQ",
    privacy: "Privacy",
    terms: "Termini",
    fastLink: "Veloce e semplice",
    primaryAriaLabel: "Navigazione principale",
    langAriaLabel: "Lingua",
  },
  hero: {
    badge: "Video downloader online gratuito",
    titleLine1: "Scarica video",
    titleLine2: "Rapido e facile",
    subtitle:
      "Incolla l'URL di un video e scarica i tuoi video preferiti in pochi secondi.",
    urlPlaceholder: "Incolla qui l'URL del video...",
    urlAriaLabel: "URL del video",
    supportedPlatforms: "Supporta le piattaforme video più popolari",
  },
  analyze: {
    button: "Analizza",
    analyzing: "Analisi in corso...",
  },
  result: {
    ready: "Pronto per il download",
    thumbnailFallback: "Miniatura del video",
    uploaderLabel: "Caricato da:",
    durationLabel: "Durata:",
    formatLabel: "Formato",
    modeLabels: {
      mp4: "MP4",
      mp3: "MP3",
      subtitles: "Sottotitoli",
    },
    modeSubLabels: {
      mp4: "Video",
      mp3: "Audio",
      subtitles: "Sottotitoli",
    },
    noSubtitles: "Non ci sono sottotitoli disponibili per questo video.",
    languageLabel: "Lingua",
    searchLanguagePlaceholder: "Cerca una lingua...",
    typeLabel: "Tipo",
    typeLabels: {
      manual: "Manuali",
      automatic: "Generati automaticamente",
    },
    subtitleFormatLabels: {
      vtt: "VTT",
      srt: "SRT",
    },
    downloadLabel: "Scarica",
    downloadStarted: "Download avviato.",
    status: {
      queued: "In coda",
      preparing: "Preparazione",
      downloading: "Download in corso",
      processing: "Elaborazione",
      success: "Download avviato",
      failed: "Non riuscito",
      expired: "Scaduto",
    },
  },
  sections: {
    guide: {
      heading: "Come funziona",
      subheading: "Tre passaggi per salvare il tuo video.",
    },
    features: {
      heading: "Perché Vidsavey?",
      subheading: "Uno strumento semplice che salva i tuoi video.",
    },
    platforms: {
      heading: "Piattaforme supportate",
      description:
        "Basato su yt-dlp, Vidsavey supporta oltre 1000 siti video. Questi sono i più popolari:",
      more: "Consente di scaricare video da youtube.com, tiktok.com, instagram.com, facebook.com, x.com e altri siti video.",
    },
    faq: {
      heading: "Domande frequenti",
      subheading: "Tutto ciò che devi sapere su Vidsavey.",
    },
  },
  guideSteps: [
    {
      title: "Incolla l'URL",
      description: "Copia il link del video e incollalo nel campo qui sopra.",
    },
    {
      title: "Analizza il video",
      description:
        "Fai clic su Analizza e i dettagli del video verranno recuperati automaticamente.",
    },
    {
      title: "Scarica il file",
      description:
        "Scegli MP4, MP3 o sottotitoli e salva il file sul tuo dispositivo.",
    },
  ],
  features: [
    {
      title: "Download veloce",
      description: "Elabora il tuo video rapidamente.",
    },
    {
      title: "Semplice e facile",
      description: "Nessuna configurazione complicata.",
    },
    {
      title: "Adatto ai dispositivi mobili",
      description: "Funziona su desktop e mobile.",
    },
  ],
  faq: [
    {
      question: "Vidsavey è gratuito?",
      answer:
        "Sì. Vidsavey è uno strumento online gratuito. Puoi analizzare e scaricare i video supportati senza creare un account.",
    },
    {
      question: "Quali piattaforme video sono supportate?",
      answer:
        "Vidsavey supporta piattaforme video popolari come YouTube, TikTok, Instagram, Facebook, X, Twitch, Reddit, Vimeo, Dailymotion, Bilibili, SoundCloud, Pinterest, Rumble, Douyin, Weibo e altri siti video. La disponibilità può variare a seconda del singolo video.",
    },
    {
      question: "Posso scaricare audio in MP3?",
      answer:
        "Sì. Dopo aver analizzato un video, seleziona MP3 per scaricare la traccia audio quando è disponibile.",
    },
    {
      question: "Posso scaricare i sottotitoli?",
      answer:
        "Sì. Quando i sottotitoli sono disponibili, scegli Sottotitoli, seleziona una lingua e il tipo di traccia, quindi scarica in formato VTT o SRT.",
    },
    {
      question: "Devo installare qualche programma?",
      answer:
        "No. Vidsavey funziona nel tuo browser. Incolla l'URL di un video supportato, analizzalo e scarica il formato disponibile.",
    },
  ],
  footer: {
    copyright: "© 2026 Vidsavey. Tutti i diritti riservati.",
    privacy: "Privacy",
    terms: "Termini",
  },
  errors: {
    emptyUrl: "Inserisci l'URL di un video.",
    invalidUrl: "Inserisci un URL valido.",
    analyzeFailed: "Impossibile analizzare questo video. Riprova.",
    selectSubtitle: "Seleziona un'opzione per i sottotitoli.",
    downloadStartFailed:
      "Impossibile avviare questo download. Riprova.",
    connectionLost:
      "La connessione con il server è stata persa. Riprova.",
    progressCheckFailed:
      "Impossibile verificare lo stato di avanzamento del download. Riprova.",
    downloadFailed:
      "Impossibile scaricare questo file. Riprova.",
    downloadTimeout:
      "Il download sta richiedendo più tempo del previsto. Riprova.",
    invalidPublicUrl: "Inserisci un URL pubblico valido del video.",
    rateLimited:
      "Troppe richieste. Attendi un momento e riprova.",
    tooManyActiveTasks:
      "Hai già troppi download attivi. Attendi che uno termini.",
    queueFull:
      "Il server è occupato in questo momento. Riprova tra poco.",
    storageBusy:
      "Il server ha temporaneamente poco spazio di archiviazione. Riprova più tardi.",
    videoTooLong: "Questo video supera la durata massima supportata.",
    videoTooLarge:
      "Questo video supera la dimensione massima supportata per il download.",
    sourceUnavailable:
      "Questo video non è disponibile o non è accessibile.",
    subtitleNotFound:
      "Impossibile scaricare il sottotitolo selezionato.",
    fileExpired: "Questo download è scaduto. Crea un nuovo download.",
    serviceRestarted:
      "Il download è stato interrotto dal riavvio del server. Riprova.",
    downloadVideoFailed:
      "Impossibile scaricare questo video. Riprova.",
    internalError:
      "Il server ha riscontrato un errore imprevisto. Riprova.",
    botCheck:
      "YouTube sta richiedendo una verifica anti-bot. Attendi qualche minuto e riprova, oppure prova con un altro link video.",
  },
  meta: {
    title: "Vidsavey - Video downloader online gratuito",
    description:
      "Scarica video online in modo rapido e semplice con Vidsavey. Salva i video supportati in MP4 o MP3 e scarica i sottotitoli disponibili.",
    keywords: [
      "Vidsavey",
      "scaricare video",
      "video downloader online",
      "scaricare video youtube",
      "youtube downloader",
      "youtube in mp4",
      "scaricare video da youtube",
      "scaricare mp4",
      "scaricare mp3",
      "scaricare sottotitoli",
    ],
    ogTitle: "Vidsavey - Video downloader online gratuito",
    ogDescription:
      "Scarica online i video supportati in MP4 o MP3 con Vidsavey.",
    twitterTitle: "Vidsavey - Video downloader online gratuito",
    twitterDescription:
      "Scarica video online in modo rapido e semplice con Vidsavey. Salva i video supportati in MP4 o MP3.",
  },
};

export const it: Dictionary = itBase as Dictionary;
