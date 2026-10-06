import type { Dictionary } from "../i18n";

// Dictionary 由 `as const` 声明的 en 推导而来，字段为字符串字面量类型。
// 此处仅将字符串字面量放宽为 string 以承载葡萄牙语（巴西）文案，
// 结构（字段名、嵌套层级、数组长度）仍严格对照 Dictionary 校验。
type WidenStrings<T> = T extends string
  ? string
  : { [K in keyof T]: WidenStrings<T[K]> };

const ptBase: WidenStrings<Dictionary> = {
  nav: {
    guide: "Guia",
    platforms: "Plataformas",
    faq: "FAQ",
    privacy: "Privacidade",
    terms: "Termos",
    fastLink: "Rápido e simples",
    primaryAriaLabel: "Navegação principal",
    langAriaLabel: "Idioma",
  },
  hero: {
    badge: "Baixador de vídeos online gratuito",
    titleLine1: "Baixe vídeos",
    titleLine2: "Rápido e fácil",
    subtitle:
      "Cole o URL de um vídeo e baixe seus vídeos favoritos em segundos.",
    urlPlaceholder: "Cole aqui o URL do vídeo...",
    urlAriaLabel: "URL do vídeo",
    supportedPlatforms: "Compatível com plataformas de vídeo populares",
  },
  analyze: {
    button: "Analisar",
    analyzing: "Analisando...",
  },
  result: {
    ready: "Pronto para baixar",
    thumbnailFallback: "Miniatura do vídeo",
    uploaderLabel: "Enviado por:",
    durationLabel: "Duração:",
    formatLabel: "Formato",
    modeLabels: {
      mp4: "MP4",
      mp3: "MP3",
      subtitles: "Legendas",
    },
    modeSubLabels: {
      mp4: "Vídeo",
      mp3: "Áudio",
      subtitles: "Legendas",
    },
    noSubtitles: "Não há legendas disponíveis para este vídeo.",
    languageLabel: "Idioma",
    searchLanguagePlaceholder: "Pesquisar idioma...",
    typeLabel: "Tipo",
    typeLabels: {
      manual: "Manual",
      automatic: "Geradas automaticamente",
    },
    subtitleFormatLabels: {
      vtt: "VTT",
      srt: "SRT",
    },
    downloadLabel: "Baixar",
    downloadStarted: "Download iniciado.",
    status: {
      queued: "Na fila",
      preparing: "Preparando",
      downloading: "Baixando",
      processing: "Processando",
      success: "Download iniciado",
      failed: "Erro",
      expired: "Expirado",
    },
  },
  sections: {
    guide: {
      heading: "Como funciona",
      subheading: "Três passos para salvar seu vídeo.",
    },
    features: {
      heading: "Por que Vidsavey?",
      subheading: "Uma ferramenta simples que salva seus vídeos.",
    },
    platforms: {
      heading: "Plataformas compatíveis",
      description:
        "Impulsionado pelo yt-dlp, o Vidsavey suporta mais de 1000 sites de vídeo. Estes são os mais populares:",
      more: "Permite baixar vídeos de youtube.com, tiktok.com, instagram.com, facebook.com, x.com e outros sites de vídeo.",
    },
    faq: {
      heading: "Perguntas frequentes",
      subheading: "Tudo o que você precisa saber sobre o Vidsavey.",
    },
  },
  guideSteps: [
    {
      title: "Cole o URL",
      description: "Copie o link do vídeo e cole no campo acima.",
    },
    {
      title: "Analise o vídeo",
      description:
        "Clique em Analisar e os detalhes do vídeo serão carregados automaticamente.",
    },
    {
      title: "Baixe o arquivo",
      description:
        "Escolha MP4, MP3 ou legendas e salve o arquivo no seu dispositivo.",
    },
  ],
  features: [
    {
      title: "Download rápido",
      description: "Processe seu vídeo rapidamente.",
    },
    {
      title: "Simples e fácil",
      description: "Sem configurações complicadas.",
    },
    {
      title: "Otimizado para celular",
      description: "Funciona no computador e no celular.",
    },
  ],
  faq: [
    {
      question: "O Vidsavey é grátis?",
      answer:
        "Sim. O Vidsavey é uma ferramenta online gratuita. Você pode analisar e baixar vídeos compatíveis sem criar uma conta.",
    },
    {
      question: "Quais plataformas de vídeo são compatíveis?",
      answer:
        "O Vidsavey é compatível com plataformas de vídeo populares como YouTube, TikTok, Instagram, Facebook, X, Twitch, Reddit, Vimeo, Dailymotion, Bilibili, SoundCloud, Pinterest, Rumble, Douyin, Weibo e outros sites de vídeo. A disponibilidade pode variar de vídeo para vídeo.",
    },
    {
      question: "Posso baixar áudio em MP3?",
      answer:
        "Sim. Após analisar um vídeo, selecione MP3 para baixar a faixa de áudio quando estiver disponível.",
    },
    {
      question: "Posso baixar legendas?",
      answer:
        "Sim. Quando houver legendas disponíveis, escolha Legendas, selecione um idioma e o tipo de faixa, e baixe em VTT ou SRT.",
    },
    {
      question: "Preciso instalar algum programa?",
      answer:
        "Não. O Vidsavey funciona no seu navegador. Cole o URL de um vídeo compatível, analise e baixe o formato disponível.",
    },
  ],
  footer: {
    copyright: "© 2026 Vidsavey. Todos os direitos reservados.",
    privacy: "Privacidade",
    terms: "Termos",
  },
  errors: {
    emptyUrl: "Insira o URL de um vídeo.",
    invalidUrl: "Insira um URL válido.",
    analyzeFailed: "Não foi possível analisar este vídeo. Tente novamente.",
    selectSubtitle: "Selecione uma opção de legendas.",
    downloadStartFailed:
      "Não foi possível iniciar este download. Tente novamente.",
    connectionLost:
      "A conexão com o servidor foi perdida. Tente novamente.",
    progressCheckFailed:
      "Não foi possível verificar o progresso do download. Tente novamente.",
    downloadFailed:
      "Não foi possível baixar este arquivo. Tente novamente.",
    downloadTimeout:
      "O download está demorando mais do que o esperado. Tente novamente.",
    invalidPublicUrl: "Insira um URL público válido do vídeo.",
    rateLimited:
      "Muitas solicitações. Aguarde um momento e tente novamente.",
    tooManyActiveTasks:
      "Você já tem muitos downloads ativos. Aguarde a conclusão de um deles.",
    queueFull:
      "O servidor está ocupado no momento. Tente novamente em alguns minutos.",
    storageBusy:
      "O servidor está temporariamente com pouco espaço de armazenamento. Tente novamente mais tarde.",
    videoTooLong: "Este vídeo excede a duração máxima permitida.",
    videoTooLarge:
      "Este vídeo excede o tamanho máximo de download permitido.",
    sourceUnavailable:
      "Este vídeo não está disponível ou não pode ser acessado.",
    subtitleNotFound:
      "Não foi possível baixar a legenda selecionada.",
    fileExpired: "Este download expirou. Crie um novo download.",
    serviceRestarted:
      "O download foi interrompido por uma reinicialização do servidor. Tente novamente.",
    downloadVideoFailed:
      "Não foi possível baixar este vídeo. Tente novamente.",
    internalError:
      "O servidor encontrou um erro inesperado. Tente novamente.",
    botCheck:
      "O YouTube está pedindo uma verificação anti-robô. Aguarde alguns minutos e tente novamente, ou tente outro link de vídeo.",
  },
  meta: {
    title: "Vidsavey - Baixador de vídeos online gratuito",
    description:
      "Baixe vídeos online de forma rápida e fácil com o Vidsavey. Salve vídeos como MP4 ou MP3 e baixe as legendas disponíveis.",
    keywords: [
      "Vidsavey",
      "baixador de vídeos",
      "baixar vídeos online",
      "baixar vídeo do youtube",
      "baixar do youtube",
      "youtube para mp4",
      "download de vídeo do youtube",
      "baixador de mp4",
      "baixador de mp3",
      "baixar legendas",
    ],
    ogTitle: "Vidsavey - Baixador de vídeos online gratuito",
    ogDescription:
      "Baixe vídeos compatíveis online como MP4 ou MP3 com o Vidsavey.",
    twitterTitle: "Vidsavey - Baixador de vídeos online gratuito",
    twitterDescription:
      "Baixe vídeos online de forma rápida e fácil com o Vidsavey. Salve vídeos como MP4 ou MP3.",
  },
};

export const pt: Dictionary = ptBase as Dictionary;
