import type { Dictionary } from "../i18n";

// Dictionary 由 `as const` 声明的 en 推导而来，字段为字符串字面量类型。
// 此处仅将字符串字面量放宽为 string 以承载日语文案，
// 结构（字段名、嵌套层级、数组长度）仍严格对照 Dictionary 校验。
type WidenStrings<T> = T extends string
  ? string
  : { [K in keyof T]: WidenStrings<T[K]> };

const jaBase: WidenStrings<Dictionary> = {
  nav: {
    guide: "使い方",
    platforms: "対応プラットフォーム",
    faq: "よくある質問",
    privacy: "プライバシー",
    terms: "利用規約",
    fastLink: "簡単・スピーディー",
    primaryAriaLabel: "メインナビゲーション",
    langAriaLabel: "言語",
  },
  hero: {
    badge: "無料オンライン動画ダウンローダー",
    titleLine1: "動画をダウンロード",
    titleLine2: "素早く簡単に",
    subtitle:
      "動画のURLを貼り付けるだけで、お気に入りの動画を数秒でダウンロードできます。",
    urlPlaceholder: "ここに動画のURLを貼り付け...",
    urlAriaLabel: "動画のURL",
    supportedPlatforms: "人気の動画プラットフォームに対応",
  },
  analyze: {
    button: "解析",
    analyzing: "解析中...",
  },
  result: {
    ready: "ダウンロード準備完了",
    thumbnailFallback: "動画サムネイル",
    uploaderLabel: "投稿者:",
    durationLabel: "再生時間:",
    formatLabel: "形式",
    modeLabels: {
      mp4: "MP4",
      mp3: "MP3",
      subtitles: "字幕",
    },
    modeSubLabels: {
      mp4: "動画",
      mp3: "音声",
      subtitles: "字幕",
    },
    noSubtitles: "この動画には利用可能な字幕がありません。",
    languageLabel: "言語",
    searchLanguagePlaceholder: "言語を検索...",
    typeLabel: "種類",
    typeLabels: {
      manual: "手動",
      automatic: "自動生成",
    },
    subtitleFormatLabels: {
      vtt: "VTT",
      srt: "SRT",
    },
    downloadLabel: "ダウンロード",
    downloadStarted: "ダウンロードを開始しました。",
    status: {
      queued: "待機中",
      preparing: "準備中",
      downloading: "ダウンロード中",
      processing: "処理中",
      success: "ダウンロード開始",
      failed: "失敗",
      expired: "期限切れ",
    },
  },
  sections: {
    guide: {
      heading: "使い方",
      subheading: "3つのステップで動画を保存できます。",
    },
    features: {
      heading: "Vidsaveyが選ばれる理由",
      subheading: "動画を簡単に保存できるシンプルなツールです。",
    },
    platforms: {
      heading: "対応プラットフォーム",
      description:
        "yt-dlp搭載のVidsaveyは、1,000以上の動画サイトに対応しています。以下は特に人気のあるサイトです：",
      more: "youtube.com、tiktok.com、instagram.com、facebook.com、x.com など、さまざまな動画サイトからのダウンロードに対応しています。",
    },
    faq: {
      heading: "よくある質問",
      subheading: "Vidsaveyについて知っておきたい情報をまとめました。",
    },
  },
  guideSteps: [
    {
      title: "URLを貼り付け",
      description: "動画のリンクをコピーして、上の入力欄に貼り付けてください。",
    },
    {
      title: "動画を解析",
      description:
        "「解析」をクリックすると、動画の詳細情報が自動的に取得されます。",
    },
    {
      title: "ファイルをダウンロード",
      description:
        "MP4、MP3、字幕から選択して、ファイルをデバイスに保存できます。",
    },
  ],
  features: [
    {
      title: "高速ダウンロード",
      description: "動画を素早く処理します。",
    },
    {
      title: "シンプルで簡単",
      description: "複雑な設定は一切不要です。",
    },
    {
      title: "スマートフォン対応",
      description: "パソコン・スマートフォンどちらでもご利用いただけます。",
    },
  ],
  faq: [
    {
      question: "Vidsaveyは無料ですか？",
      answer:
        "はい。Vidsaveyは無料のオンラインツールです。アカウント登録なしで、対応している動画の解析とダウンロードがご利用いただけます。",
    },
    {
      question: "どの動画プラットフォームに対応していますか？",
      answer:
        "Vidsaveyは、YouTube、TikTok、Instagram、Facebook、X、Twitch、Reddit、Vimeo、Dailymotion、Bilibili、SoundCloud、Pinterest、Rumble、Douyin、Weibo など、人気の動画プラットフォームやその他多数の動画サイトに対応しています。動画ごとに利用できるかどうかは異なる場合があります。",
    },
    {
      question: "MP3音声をダウンロードできますか？",
      answer:
        "はい。動画を解析した後、音源が利用可能な場合はMP3を選択して音声トラックをダウンロードできます。",
    },
    {
      question: "字幕をダウンロードできますか？",
      answer:
        "はい。字幕が利用可能な場合は「字幕」を選択し、言語とトラックの種類を選んで、VTTまたはSRT形式でダウンロードできます。",
    },
    {
      question: "ソフトウェアのインストールは必要ですか？",
      answer:
        "いいえ。Vidsaveyはブラウザ上で動作します。対応動画のURLを貼り付けて解析し、利用可能な形式をダウンロードしてください。",
    },
  ],
  footer: {
    copyright: "© 2026 Vidsavey. All rights reserved.",
    privacy: "プライバシー",
    terms: "利用規約",
  },
  errors: {
    emptyUrl: "動画のURLを入力してください。",
    invalidUrl: "有効なURLを入力してください。",
    analyzeFailed: "この動画を解析できませんでした。もう一度お試しください。",
    selectSubtitle: "字幕のオプションを選択してください。",
    downloadStartFailed:
      "ダウンロードを開始できませんでした。もう一度お試しください。",
    connectionLost:
      "サーバーとの接続が切断されました。もう一度お試しください。",
    progressCheckFailed:
      "ダウンロードの進捗を確認できませんでした。もう一度お試しください。",
    downloadFailed:
      "このファイルをダウンロードできませんでした。もう一度お試しください。",
    downloadTimeout:
      "ダウンロードに予想より長い時間がかかっています。もう一度お試しください。",
    invalidPublicUrl: "有効な公開動画のURLを入力してください。",
    rateLimited:
      "リクエストが集中しています。しばらく待ってからもう一度お試しください。",
    tooManyActiveTasks:
      "現在実行中のダウンロードが多すぎます。1つ完了するまでお待ちください。",
    queueFull:
      "ただいまサーバーが混み合っています。しばらくしてからもう一度お試しください。",
    storageBusy:
      "サーバーのストレージ容量が一時的に不足しています。後ほどもう一度お試しください。",
    videoTooLong: "この動画は対応している長さの上限を超えています。",
    videoTooLarge:
      "この動画はダウンロード可能なサイズの上限を超えています。",
    sourceUnavailable:
      "この動画は利用できないか、アクセスすることができません。",
    subtitleNotFound:
      "選択された字幕をダウンロードできませんでした。",
    fileExpired: "このダウンロードは期限切れです。再度ダウンロードを作成してください。",
    serviceRestarted:
      "サーバーの再起動によりダウンロードが中断されました。もう一度お試しください。",
    downloadVideoFailed:
      "この動画をダウンロードできませんでした。もう一度お試しください。",
    internalError:
      "サーバーで予期しないエラーが発生しました。もう一度お試しください。",
    botCheck:
      "YouTubeが現在、自動アクセスではないことの確認を求めています。数分待ってからもう一度お試しいただくか、別の動画リンクをお試しください。",
  },
  meta: {
    title: "Vidsavey - 無料オンライン動画ダウンローダー",
    description:
      "Vidsaveyで動画を素早く簡単にオンラインダウンロード。対応動画をMP4やMP3で保存でき、利用可能な字幕もダウンロードできます。",
    keywords: [
      "vidsavey",
      "動画 ダウンロード",
      "動画保存",
      "youtube 動画 ダウンロード",
      "youtube ダウンロード",
      "youtube mp4 変換",
      "youtube mp3 変換",
      "mp4 ダウンロード",
      "mp3 ダウンロード",
      "字幕 ダウンロード",
    ],
    ogTitle: "Vidsavey - 無料オンライン動画ダウンローダー",
    ogDescription:
      "Vidsaveyで対応動画をオンラインでMP4またはMP3形式でダウンロードできます。",
    twitterTitle: "Vidsavey - 無料オンライン動画ダウンローダー",
    twitterDescription:
      "Vidsaveyで動画を素早く簡単にオンラインダウンロード。対応動画をMP4やMP3で保存できます。",
  },
};

export const ja: Dictionary = jaBase as Dictionary;
