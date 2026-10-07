// Microsoft Clarity 行为分析。
// 使用官方原生内联片段（脚本自身 async 加载，不阻塞渲染），
// 而非 next/script —— 确保 vinext（Cloudflare Workers）等任意 SSR 运行时 100% 兼容。
// 两个 root layout（(default) 与 (i18n)/[lang]）均引入，覆盖全站页面。

const CLARITY_PROJECT_ID = "ytti0gqg6h";

const CLARITY_SNIPPET = `(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");`;

export function ClarityAnalytics() {
  return (
    <script
      id="clarity-analytics"
      dangerouslySetInnerHTML={{ __html: CLARITY_SNIPPET }}
    />
  );
}
