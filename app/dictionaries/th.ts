import type { Dictionary } from "../i18n";

// Dictionary 由 `as const` 声明的 en 推导而来，字段为字符串字面量类型。
// 此处仅将字符串字面量放宽为 string 以承载泰语文案，
// 结构（字段名、嵌套层级、数组长度）仍严格对照 Dictionary 校验。
type WidenStrings<T> = T extends string
  ? string
  : { [K in keyof T]: WidenStrings<T[K]> };

const thBase: WidenStrings<Dictionary> = {
  nav: {
    guide: "คู่มือ",
    platforms: "แพลตฟอร์มที่รองรับ",
    faq: "คำถามที่พบบ่อย",
    privacy: "ความเป็นส่วนตัว",
    terms: "ข้อกำหนด",
    fastLink: "รวดเร็วและง่ายดาย",
    primaryAriaLabel: "การนำทางหลัก",
    langAriaLabel: "ภาษา",
  },
  hero: {
    badge: "โปรแกรมดาวน์โหลดวิดีโอออนไลน์ฟรี",
    titleLine1: "ดาวน์โหลดวิดีโอ",
    titleLine2: "รวดเร็วและง่ายดาย",
    subtitle:
      "วาง URL วิดีโอแล้วดาวน์โหลดวิดีโอที่คุณชื่นชอบได้ในไม่กี่วินาที",
    urlPlaceholder: "วาง URL วิดีโอที่นี่...",
    urlAriaLabel: "URL วิดีโอ",
    supportedPlatforms: "รองรับแพลตฟอร์มวิดีโอยอดนิยม",
  },
  analyze: {
    button: "วิเคราะห์",
    analyzing: "กำลังวิเคราะห์...",
  },
  result: {
    ready: "พร้อมดาวน์โหลด",
    thumbnailFallback: "ภาพตัวอย่างวิดีโอ",
    uploaderLabel: "ผู้อัปโหลด:",
    durationLabel: "ระยะเวลา:",
    formatLabel: "รูปแบบ",
    modeLabels: {
      mp4: "MP4",
      mp3: "MP3",
      subtitles: "คำบรรยาย",
    },
    modeSubLabels: {
      mp4: "วิดีโอ",
      mp3: "เสียง",
      subtitles: "คำบรรยาย",
    },
    noSubtitles: "วิดีโอนี้ไม่มีคำบรรยาย",
    languageLabel: "ภาษา",
    searchLanguagePlaceholder: "ค้นหาภาษา...",
    typeLabel: "ประเภท",
    typeLabels: {
      manual: "แบบแมนนวล",
      automatic: "สร้างอัตโนมัติ",
    },
    subtitleFormatLabels: {
      vtt: "VTT",
      srt: "SRT",
    },
    downloadLabel: "ดาวน์โหลด",
    downloadStarted: "เริ่มดาวน์โหลดแล้ว",
    status: {
      queued: "อยู่ในคิว",
      preparing: "กำลังเตรียมข้อมูล",
      downloading: "กำลังดาวน์โหลด",
      processing: "กำลังประมวลผล",
      success: "เริ่มดาวน์โหลดแล้ว",
      failed: "ล้มเหลว",
      expired: "หมดอายุ",
    },
  },
  sections: {
    guide: {
      heading: "วิธีใช้งาน",
      subheading: "บันทึกวิดีโอของคุณได้ใน 3 ขั้นตอน",
    },
    features: {
      heading: "ทำไมต้อง Vidsavey?",
      subheading: "เครื่องมือง่าย ๆ ที่ช่วยบันทึกวิดีโอของคุณ",
    },
    platforms: {
      heading: "แพลตฟอร์มที่รองรับ",
      description:
        "ขับเคลื่อนด้วย yt-dlp Vidsavey รองรับเว็บไซต์วิดีโอมากกว่า 1,000 เว็บ นี่คือเว็บไซต์ที่ได้รับความนิยมสูงสุด:",
      more: "รองรับการดาวน์โหลดจาก youtube.com, tiktok.com, instagram.com, facebook.com, x.com และเว็บไซต์วิดีโออื่น ๆ อีกมากมาย",
    },
    faq: {
      heading: "คำถามที่พบบ่อย",
      subheading: "ทุกสิ่งที่คุณต้องรู้เกี่ยวกับ Vidsavey",
    },
  },
  guideSteps: [
    {
      title: "วาง URL",
      description: "คัดลอกลิงก์วิดีโอแล้ววางลงในช่องด้านบน",
    },
    {
      title: "วิเคราะห์วิดีโอ",
      description:
        "คลิกวิเคราะห์ แล้วรายละเอียดของวิดีโอจะถูกดึงข้อมูลให้อัตโนมัติ",
    },
    {
      title: "ดาวน์โหลดไฟล์",
      description:
        "เลือก MP4, MP3 หรือคำบรรยาย แล้วบันทึกไฟล์ลงเครื่องของคุณ",
    },
  ],
  features: [
    {
      title: "ดาวน์โหลดรวดเร็ว",
      description: "ประมวลผลวิดีโอของคุณอย่างรวดเร็ว",
    },
    {
      title: "ง่ายและสะดวก",
      description: "ไม่ต้องตั้งค่าให้ยุ่งยาก",
    },
    {
      title: "รองรับมือถือ",
      description: "ใช้งานได้ทั้งบนคอมพิวเตอร์และมือถือ",
    },
  ],
  faq: [
    {
      question: "Vidsavey ฟรีหรือไม่?",
      answer:
        "ฟรี Vidsavey เป็นเครื่องมือออนไลน์ที่ใช้งานได้ฟรี คุณสามารถวิเคราะห์และดาวน์โหลดวิดีโอที่รองรับได้โดยไม่ต้องสมัครบัญชี",
    },
    {
      question: "รองรับแพลตฟอร์มวิดีโอใดบ้าง?",
      answer:
        "Vidsavey รองรับแพลตฟอร์มวิดีโอยอดนิยม เช่น YouTube, TikTok, Instagram, Facebook, X, Twitch, Reddit, Vimeo, Dailymotion, Bilibili, SoundCloud, Pinterest, Rumble, Douyin, Weibo และเว็บไซต์วิดีโออื่น ๆ ซึ่งความพร้อมใช้งานอาจแตกต่างกันไปในแต่ละวิดีโอ",
    },
    {
      question: "ดาวน์โหลดเสียงเป็น MP3 ได้หรือไม่?",
      answer:
        "ได้ หลังจากวิเคราะห์วิดีโอแล้ว เลือก MP3 เพื่อดาวน์โหลดแทร็กเสียงเมื่อแหล่งที่มารองรับ",
    },
    {
      question: "ดาวน์โหลดคำบรรยายได้หรือไม่?",
      answer:
        "ได้ เมื่อมีคำบรรยาย ให้เลือกคำบรรยาย เลือกภาษาและประเภทแทร็ก แล้วดาวน์โหลดเป็น VTT หรือ SRT",
    },
    {
      question: "ต้องติดตั้งโปรแกรมเพิ่มเติมหรือไม่?",
      answer:
        "ไม่ต้อง Vidsavey ทำงานบนเบราว์เซอร์ของคุณ เพียงวาง URL วิดีโอที่รองรับ วิเคราะห์ แล้วดาวน์โหลดรูปแบบที่มีให้",
    },
  ],
  footer: {
    copyright: "© 2026 Vidsavey. สงวนลิขสิทธิ์",
    privacy: "ความเป็นส่วนตัว",
    terms: "ข้อกำหนด",
  },
  errors: {
    emptyUrl: "กรุณากรอก URL วิดีโอ",
    invalidUrl: "กรุณากรอก URL ที่ถูกต้อง",
    analyzeFailed: "ไม่สามารถวิเคราะห์วิดีโอนี้ได้ กรุณาลองอีกครั้ง",
    selectSubtitle: "กรุณาเลือกตัวเลือกคำบรรยาย",
    downloadStartFailed:
      "ไม่สามารถเริ่มการดาวน์โหลดนี้ได้ กรุณาลองอีกครั้ง",
    connectionLost:
      "การเชื่อมต่อกับเซิร์ฟเวอร์ขาดหาย กรุณาลองอีกครั้ง",
    progressCheckFailed:
      "ไม่สามารถตรวจสอบความคืบหน้าของการดาวน์โหลดได้ กรุณาลองอีกครั้ง",
    downloadFailed:
      "ไม่สามารถดาวน์โหลดไฟล์นี้ได้ กรุณาลองอีกครั้ง",
    downloadTimeout:
      "การดาวน์โหลดใช้เวลานานกว่าที่คาดไว้ กรุณาลองอีกครั้ง",
    invalidPublicUrl: "กรุณากรอก URL วิดีโอสาธารณะที่ถูกต้อง",
    rateLimited:
      "มีคำขอมากเกินไป กรุณารอสักครู่แล้วลองอีกครั้ง",
    tooManyActiveTasks:
      "คุณมีการดาวน์โหลดที่กำลังดำเนินอยู่มากเกินไป กรุณารอให้รายการใดรายการหนึ่งเสร็จสิ้นก่อน",
    queueFull:
      "เซิร์ฟเวอร์กำลังยุ่งอยู่ในขณะนี้ กรุณาลองอีกครั้งในภายหลัง",
    storageBusy:
      "พื้นที่จัดเก็บของเซิร์ฟเวอร์ชั่วคราวไม่เพียงพอ กรุณาลองอีกครั้งในภายหลัง",
    videoTooLong: "วิดีโอนี้มีความยาวเกินขีดจำกัดที่รองรับ",
    videoTooLarge:
      "วิดีโอนี้มีขนาดใหญ่เกินขีดจำกัดการดาวน์โหลดที่รองรับ",
    sourceUnavailable:
      "วิดีโอนี้ไม่พร้อมใช้งานหรือไม่สามารถเข้าถึงได้",
    subtitleNotFound:
      "ไม่สามารถดาวน์โหลดคำบรรยายที่เลือกได้",
    fileExpired: "การดาวน์โหลดนี้หมดอายุแล้ว กรุณาสร้างการดาวน์โหลดใหม่",
    serviceRestarted:
      "การดาวน์โหลดถูกขัดจังหวะเนื่องจากเซิร์ฟเวอร์รีสตาร์ท กรุณาลองอีกครั้ง",
    downloadVideoFailed:
      "ไม่สามารถดาวน์โหลดวิดีโอนี้ได้ กรุณาลองอีกครั้ง",
    internalError:
      "เซิร์ฟเวอร์เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองอีกครั้ง",
    botCheck:
      "YouTube กำลังขอให้ยืนยันว่าคำขอนี้ไม่ใช่บอต กรุณารอสักครู่แล้วลองอีกครั้ง หรือลองใช้ลิงก์วิดีโออื่น",
  },
  meta: {
    title: "Vidsavey - ดาวน์โหลดวิดีโอออนไลน์ฟรี",
    description:
      "ดาวน์โหลดวิดีโอออนไลน์ได้อย่างรวดเร็วและง่ายดายด้วย Vidsavey บันทึกวิดีโอเป็น MP4 หรือ MP3 และดาวน์โหลดคำบรรยายที่มีให้",
    keywords: [
      "Vidsavey",
      "โหลดวิดีโอ",
      "ดาวน์โหลดวิดีโอ",
      "ดาวน์โหลดวิดีโอออนไลน์",
      "โหลดวิดีโอ youtube",
      "โหลด youtube",
      "youtube เป็น mp4",
      "youtube เป็น mp3",
      "โหลด mp3",
      "โหลดคำบรรยาย",
    ],
    ogTitle: "Vidsavey - ดาวน์โหลดวิดีโอออนไลน์ฟรี",
    ogDescription:
      "ดาวน์โหลดวิดีโอที่รองรับเป็น MP4 หรือ MP3 ออนไลน์ด้วย Vidsavey",
    twitterTitle: "Vidsavey - ดาวน์โหลดวิดีโอออนไลน์ฟรี",
    twitterDescription:
      "ดาวน์โหลดวิดีโอออนไลน์ได้อย่างรวดเร็วและง่ายดายด้วย Vidsavey บันทึกวิดีโอเป็น MP4 หรือ MP3",
  },
};

export const th: Dictionary = thBase as Dictionary;
