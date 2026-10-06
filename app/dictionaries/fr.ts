import type { Dictionary } from "../i18n";

// Dictionary 由 `as const` 声明的 en 推导而来，字段为字符串字面量类型。
// 此处仅将字符串字面量放宽为 string 以承载法语文案，
// 结构（字段名、嵌套层级、数组长度）仍严格对照 Dictionary 校验。
type WidenStrings<T> = T extends string
  ? string
  : { [K in keyof T]: WidenStrings<T[K]> };

const frBase: WidenStrings<Dictionary> = {
  nav: {
    guide: "Guide",
    platforms: "Plateformes",
    faq: "FAQ",
    privacy: "Confidentialité",
    terms: "Conditions",
    fastLink: "Rapide et simple",
    primaryAriaLabel: "Navigation principale",
    langAriaLabel: "Langue",
  },
  hero: {
    badge: "Téléchargeur de vidéos en ligne gratuit",
    titleLine1: "Téléchargez des vidéos",
    titleLine2: "Rapidement et facilement",
    subtitle:
      "Collez l'URL d'une vidéo et téléchargez vos vidéos préférées en quelques secondes.",
    urlPlaceholder: "Collez l'URL de la vidéo ici...",
    urlAriaLabel: "URL de la vidéo",
    supportedPlatforms: "Prend en charge les plateformes vidéo populaires",
  },
  analyze: {
    button: "Analyser",
    analyzing: "Analyse en cours...",
  },
  result: {
    ready: "Prêt à télécharger",
    thumbnailFallback: "Miniature de la vidéo",
    uploaderLabel: "Publié par :",
    durationLabel: "Durée :",
    formatLabel: "Format",
    modeLabels: {
      mp4: "MP4",
      mp3: "MP3",
      subtitles: "Sous-titres",
    },
    modeSubLabels: {
      mp4: "Vidéo",
      mp3: "Audio",
      subtitles: "Sous-titres",
    },
    noSubtitles: "Aucun sous-titre n'est disponible pour cette vidéo.",
    languageLabel: "Langue",
    searchLanguagePlaceholder: "Rechercher une langue...",
    typeLabel: "Type",
    typeLabels: {
      manual: "Manuels",
      automatic: "Générés automatiquement",
    },
    subtitleFormatLabels: {
      vtt: "VTT",
      srt: "SRT",
    },
    downloadLabel: "Télécharger",
    downloadStarted: "Téléchargement lancé.",
    status: {
      queued: "En file d'attente",
      preparing: "Préparation",
      downloading: "Téléchargement en cours",
      processing: "Traitement",
      success: "Téléchargement lancé",
      failed: "Échec",
      expired: "Expiré",
    },
  },
  sections: {
    guide: {
      heading: "Comment ça marche",
      subheading: "Trois étapes pour enregistrer votre vidéo.",
    },
    features: {
      heading: "Pourquoi Vidsavey ?",
      subheading: "Un outil simple qui enregistre vos vidéos.",
    },
    platforms: {
      heading: "Plateformes prises en charge",
      description:
        "Propulsé par yt-dlp, Vidsavey prend en charge plus de 1000 sites vidéo. Voici les plus populaires :",
      more: "Prend en charge le téléchargement depuis youtube.com, tiktok.com, instagram.com, facebook.com, x.com et d'autres sites vidéo.",
    },
    faq: {
      heading: "Questions fréquentes",
      subheading: "Tout ce que vous devez savoir sur Vidsavey.",
    },
  },
  guideSteps: [
    {
      title: "Collez l'URL",
      description: "Copiez le lien de la vidéo et collez-le dans le champ ci-dessus.",
    },
    {
      title: "Analysez la vidéo",
      description:
        "Cliquez sur Analyser et les détails de la vidéo seront récupérés automatiquement.",
    },
    {
      title: "Téléchargez le fichier",
      description:
        "Choisissez MP4, MP3 ou sous-titres et enregistrez le fichier sur votre appareil.",
    },
  ],
  features: [
    {
      title: "Téléchargement rapide",
      description: "Traite votre vidéo rapidement.",
    },
    {
      title: "Simple et facile",
      description: "Aucun réglage compliqué.",
    },
    {
      title: "Adapté aux mobiles",
      description: "Fonctionne sur ordinateur et mobile.",
    },
  ],
  faq: [
    {
      question: "Vidsavey est-il gratuit ?",
      answer:
        "Oui. Vidsavey est un outil en ligne gratuit. Vous pouvez analyser et télécharger des vidéos prises en charge sans créer de compte.",
    },
    {
      question: "Quelles plateformes vidéo sont prises en charge ?",
      answer:
        "Vidsavey prend en charge les plateformes vidéo populaires telles que YouTube, TikTok, Instagram, Facebook, X, Twitch, Reddit, Vimeo, Dailymotion, Bilibili, SoundCloud, Pinterest, Rumble, Douyin, Weibo et bien d'autres sites vidéo. La disponibilité peut varier selon chaque vidéo.",
    },
    {
      question: "Puis-je télécharger de l'audio en MP3 ?",
      answer:
        "Oui. Après avoir analysé une vidéo, sélectionnez MP3 pour télécharger la piste audio lorsqu'elle est disponible.",
    },
    {
      question: "Puis-je télécharger des sous-titres ?",
      answer:
        "Oui. Lorsque des sous-titres sont disponibles, choisissez Sous-titres, sélectionnez une langue et le type de piste, puis téléchargez en VTT ou SRT.",
    },
    {
      question: "Dois-je installer un logiciel ?",
      answer:
        "Non. Vidsavey fonctionne dans votre navigateur. Collez l'URL d'une vidéo prise en charge, analysez-la et téléchargez le format disponible.",
    },
  ],
  footer: {
    copyright: "© 2026 Vidsavey. Tous droits réservés.",
    privacy: "Confidentialité",
    terms: "Conditions",
  },
  errors: {
    emptyUrl: "Veuillez saisir l'URL d'une vidéo.",
    invalidUrl: "Veuillez saisir une URL valide.",
    analyzeFailed: "Impossible d'analyser cette vidéo. Veuillez réessayer.",
    selectSubtitle: "Veuillez sélectionner une option de sous-titres.",
    downloadStartFailed:
      "Impossible de lancer ce téléchargement. Veuillez réessayer.",
    connectionLost:
      "La connexion au serveur a été perdue. Veuillez réessayer.",
    progressCheckFailed:
      "Impossible de vérifier la progression du téléchargement. Veuillez réessayer.",
    downloadFailed:
      "Impossible de télécharger ce fichier. Veuillez réessayer.",
    downloadTimeout:
      "Le téléchargement prend plus de temps que prévu. Veuillez réessayer.",
    invalidPublicUrl: "Veuillez saisir une URL vidéo publique valide.",
    rateLimited:
      "Trop de requêtes. Veuillez patienter un instant et réessayer.",
    tooManyActiveTasks:
      "Vous avez déjà trop de téléchargements actifs. Veuillez attendre la fin de l'un d'entre eux.",
    queueFull:
      "Le serveur est actuellement occupé. Veuillez réessayer dans quelques instants.",
    storageBusy:
      "Le stockage du serveur est temporairement saturé. Veuillez réessayer plus tard.",
    videoTooLong: "Cette vidéo dépasse la durée maximale prise en charge.",
    videoTooLarge:
      "Cette vidéo dépasse la taille maximale de téléchargement prise en charge.",
    sourceUnavailable:
      "Cette vidéo est indisponible ou inaccessible.",
    subtitleNotFound:
      "Le sous-titre sélectionné n'a pas pu être téléchargé.",
    fileExpired: "Ce téléchargement a expiré. Veuillez créer un nouveau téléchargement.",
    serviceRestarted:
      "Le téléchargement a été interrompu par un redémarrage du serveur. Veuillez réessayer.",
    downloadVideoFailed:
      "Impossible de télécharger cette vidéo. Veuillez réessayer.",
    internalError:
      "Le serveur a rencontré une erreur inattendue. Veuillez réessayer.",
    botCheck:
      "YouTube demande actuellement une vérification anti-robot. Patientez quelques minutes et réessayez, ou essayez un autre lien de vidéo.",
  },
  meta: {
    title: "Vidsavey - Téléchargeur de vidéos en ligne gratuit",
    description:
      "Téléchargez des vidéos en ligne rapidement et facilement avec Vidsavey. Enregistrez des vidéos en MP4 ou MP3 et récupérez les sous-titres disponibles.",
    keywords: [
      "Vidsavey",
      "téléchargeur vidéo",
      "télécharger vidéo en ligne",
      "téléchargeur youtube",
      "télécharger vidéo youtube",
      "convertisseur youtube mp4",
      "youtube en mp4",
      "téléchargeur mp4",
      "téléchargeur mp3",
      "télécharger sous-titres",
    ],
    ogTitle: "Vidsavey - Téléchargeur de vidéos en ligne gratuit",
    ogDescription:
      "Téléchargez en ligne des vidéos prises en charge en MP4 ou MP3 avec Vidsavey.",
    twitterTitle: "Vidsavey - Téléchargeur de vidéos en ligne gratuit",
    twitterDescription:
      "Téléchargez des vidéos en ligne rapidement et facilement avec Vidsavey. Enregistrez des vidéos en MP4 ou MP3.",
  },
};

export const fr: Dictionary = frBase as Dictionary;
