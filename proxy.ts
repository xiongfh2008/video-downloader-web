import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LANG, I18N_LANGS } from "./app/i18n";

// 多语言入口协商：仅对根路径生效。
// 按 Accept-Language 的优先级（q 值）匹配站点支持的语言：
// - 首选命中的是非默认语言且当前在根路径 → 307 跳转到 /{lang}
// - 首选命中默认语言（英文）或无匹配 → 保持英文版
// 手动切换（直接访问 /es 等具体路径）不受影响；privacy/terms 暂无多语言版本，不做跳转。
// 函数内判断 pathname 而非用 config.matcher，规避不同运行时对 "/" matcher 的实现差异。
export function proxy(request: NextRequest) {
  const header = request.headers.get("accept-language") ?? "";
  const requested = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return {
        tag: (tag ?? "").trim().toLowerCase(),
        q: q ? Number.parseFloat(q) || 0 : 1,
      };
    })
    .filter((entry) => entry.tag !== "" && entry.tag !== "*")
    .sort((a, b) => b.q - a.q);

  for (const { tag } of requested) {
    const base = tag.split("-")[0];

    if (base === DEFAULT_LANG) {
      break; // 用户首选英文，保持根路径
    }

    if ((I18N_LANGS as readonly string[]).includes(base)) {
      if (request.nextUrl.pathname === "/") {
        return NextResponse.redirect(new URL(`/${base}`, request.url), 307);
      }
      break; // 首选非英语但当前不在根路径（如已手动切换），不干预
    }
  }

  return NextResponse.next();
}
