import type { Dictionary } from "../i18n";

// Dictionary 由 `as const` 声明的 en 推导而来，字段为字符串字面量类型。
// 此处仅将字符串字面量放宽为 string 以承载印尼语文案，
// 结构（字段名、嵌套层级、数组长度）仍严格对照 Dictionary 校验。
type WidenStrings<T> = T extends string
  ? string
  : { [K in keyof T]: WidenStrings<T[K]> };

const idBase: WidenStrings<Dictionary> = {
  nav: {
    guide: "Panduan",
    platforms: "Platform",
    faq: "FAQ",
    privacy: "Privasi",
    terms: "Ketentuan",
    fastLink: "Cepat & Mudah",
    primaryAriaLabel: "Navigasi utama",
    langAriaLabel: "Bahasa",
  },
  hero: {
    badge: "Pengunduh Video Online Gratis",
    titleLine1: "Unduh Video",
    titleLine2: "Cepat dan Mudah",
    subtitle:
      "Tempel URL video dan unduh video favorit Anda dalam hitungan detik.",
    urlPlaceholder: "Tempel URL video di sini...",
    urlAriaLabel: "URL video",
    supportedPlatforms: "Mendukung platform video populer",
  },
  analyze: {
    button: "Analisis",
    analyzing: "Menganalisis...",
  },
  result: {
    ready: "Siap untuk diunduh",
    thumbnailFallback: "Gambar mini video",
    uploaderLabel: "Pengunggah:",
    durationLabel: "Durasi:",
    formatLabel: "Format",
    modeLabels: {
      mp4: "MP4",
      mp3: "MP3",
      subtitles: "Subtitle",
    },
    modeSubLabels: {
      mp4: "Video",
      mp3: "Audio",
      subtitles: "Subtitle",
    },
    noSubtitles: "Tidak ada subtitle yang tersedia untuk video ini.",
    languageLabel: "Bahasa",
    searchLanguagePlaceholder: "Cari bahasa...",
    typeLabel: "Jenis",
    typeLabels: {
      manual: "Manual",
      automatic: "Dibuat otomatis",
    },
    subtitleFormatLabels: {
      vtt: "VTT",
      srt: "SRT",
    },
    downloadLabel: "Unduh",
    downloadStarted: "Unduhan dimulai.",
    status: {
      queued: "Dalam antrean",
      preparing: "Menyiapkan",
      downloading: "Mengunduh",
      processing: "Memproses",
      success: "Unduhan dimulai",
      failed: "Gagal",
      expired: "Kedaluwarsa",
    },
  },
  sections: {
    guide: {
      heading: "Cara Kerja",
      subheading: "Tiga langkah untuk menyimpan video Anda.",
    },
    features: {
      heading: "Mengapa Vidsavey?",
      subheading: "Alat sederhana untuk menyimpan video Anda.",
    },
    platforms: {
      heading: "Platform yang Didukung",
      description:
        "Ditenagai oleh yt-dlp, Vidsavey mendukung lebih dari 1000 situs video. Berikut yang paling populer:",
      more: "Mendukung unduhan dari youtube.com, tiktok.com, instagram.com, facebook.com, x.com dan situs video lainnya.",
    },
    faq: {
      heading: "Pertanyaan Umum",
      subheading: "Semua yang perlu Anda ketahui tentang Vidsavey.",
    },
  },
  guideSteps: [
    {
      title: "Tempel URL",
      description: "Salin tautan video dan tempelkan ke kolom di atas.",
    },
    {
      title: "Analisis Video",
      description:
        "Klik Analisis dan detail video akan diambil untuk Anda secara otomatis.",
    },
    {
      title: "Unduh File",
      description:
        "Pilih MP4, MP3 atau subtitle dan simpan file ke perangkat Anda.",
    },
  ],
  features: [
    {
      title: "Unduhan Cepat",
      description: "Memproses video Anda dengan cepat.",
    },
    {
      title: "Sederhana & Mudah",
      description: "Tanpa pengaturan yang rumit.",
    },
    {
      title: "Ramah Seluler",
      description: "Berfungsi di desktop dan seluler.",
    },
  ],
  faq: [
    {
      question: "Apakah Vidsavey gratis?",
      answer:
        "Ya. Vidsavey adalah alat online gratis. Anda dapat menganalisis dan mengunduh video yang didukung tanpa perlu membuat akun.",
    },
    {
      question: "Platform video apa saja yang didukung?",
      answer:
        "Vidsavey mendukung platform video populer termasuk YouTube, TikTok, Instagram, Facebook, X, Twitch, Reddit, Vimeo, Dailymotion, Bilibili, SoundCloud, Pinterest, Rumble, Douyin, Weibo dan situs video lainnya. Ketersediaan dapat berbeda untuk setiap video.",
    },
    {
      question: "Bisakah saya mengunduh audio MP3?",
      answer:
        "Ya. Setelah menganalisis video, pilih MP3 untuk mengunduh trek audio jika sumbernya tersedia.",
    },
    {
      question: "Bisakah saya mengunduh subtitle?",
      answer:
        "Ya. Saat subtitle tersedia, pilih Subtitle, tentukan bahasa dan jenis trek, lalu unduh dalam format VTT atau SRT.",
    },
    {
      question: "Apakah saya perlu menginstal perangkat lunak?",
      answer:
        "Tidak. Vidsavey berjalan langsung di browser Anda. Tempel URL video yang didukung, analisis, lalu unduh format yang tersedia.",
    },
  ],
  footer: {
    copyright: "© 2026 Vidsavey. Semua hak dilindungi.",
    privacy: "Privasi",
    terms: "Ketentuan",
  },
  errors: {
    emptyUrl: "Silakan masukkan URL video.",
    invalidUrl: "Silakan masukkan URL yang valid.",
    analyzeFailed: "Tidak dapat menganalisis video ini. Silakan coba lagi.",
    selectSubtitle: "Silakan pilih opsi subtitle.",
    downloadStartFailed:
      "Tidak dapat memulai unduhan ini. Silakan coba lagi.",
    connectionLost:
      "Koneksi ke server terputus. Silakan coba lagi.",
    progressCheckFailed:
      "Tidak dapat memeriksa progres unduhan. Silakan coba lagi.",
    downloadFailed:
      "Tidak dapat mengunduh file ini. Silakan coba lagi.",
    downloadTimeout:
      "Unduhan membutuhkan waktu lebih lama dari yang diharapkan. Silakan coba lagi.",
    invalidPublicUrl: "Silakan masukkan URL video publik yang valid.",
    rateLimited:
      "Terlalu banyak permintaan. Mohon tunggu sebentar dan coba lagi.",
    tooManyActiveTasks:
      "Anda sudah memiliki terlalu banyak unduhan aktif. Mohon tunggu hingga salah satu selesai.",
    queueFull:
      "Server sedang sibuk saat ini. Silakan coba lagi sebentar lagi.",
    storageBusy:
      "Penyimpanan server sementara menipis. Silakan coba lagi nanti.",
    videoTooLong: "Video ini melebihi batas durasi yang didukung.",
    videoTooLarge:
      "Video ini melebihi batas ukuran unduhan yang didukung.",
    sourceUnavailable:
      "Video ini tidak tersedia atau tidak dapat diakses.",
    subtitleNotFound:
      "Subtitle yang dipilih tidak dapat diunduh.",
    fileExpired: "Unduhan ini telah kedaluwarsa. Silakan buat unduhan baru.",
    serviceRestarted:
      "Unduhan terhenti karena server dimulai ulang. Silakan coba lagi.",
    downloadVideoFailed:
      "Tidak dapat mengunduh video ini. Silakan coba lagi.",
    internalError:
      "Server mengalami kesalahan yang tidak terduga. Silakan coba lagi.",
    botCheck:
      "YouTube saat ini meminta verifikasi anti-otomatis. Tunggu beberapa menit lalu coba lagi, atau gunakan tautan video lain.",
  },
  meta: {
    title: "Vidsavey - Pengunduh Video Online Gratis",
    description:
      "Unduh video online dengan cepat dan mudah bersama Vidsavey. Simpan video sebagai MP4 atau MP3 dan unduh subtitle yang tersedia.",
    keywords: [
      "vidsavey",
      "pengunduh video",
      "download video youtube",
      "youtube downloader",
      "youtube ke mp4",
      "unduh video",
      "download video online",
      "youtube ke mp3",
      "unduh video tiktok",
      "download subtitle",
    ],
    ogTitle: "Vidsavey - Pengunduh Video Online Gratis",
    ogDescription:
      "Unduh video yang didukung secara online sebagai MP4 atau MP3 dengan Vidsavey.",
    twitterTitle: "Vidsavey - Pengunduh Video Online Gratis",
    twitterDescription:
      "Unduh video online dengan cepat dan mudah bersama Vidsavey. Simpan video sebagai MP4 atau MP3.",
  },
};

export const id: Dictionary = idBase as Dictionary;
