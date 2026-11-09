# VIDSAVEY FastAPI 后端接线手册

## A. 与现有 V1.2 API 兼容

| 旧接口 | 需要修改的行为 | 不变的部分 |
| --- | --- | --- |
| `POST /api/video/info` | YouTube 优先通过 VidFetch `POST /v1/info` 免费取得元数据。必须核验**真实返回 JSON 字段**后映射为旧有 `data` | 返回 `success,data.id/title/uploader/duration/thumbnail/webpage_url/subtitles`；非 YouTube 仍 yt-dlp |
| `POST /api/video/download` | 新增独立浏览器/IP 双额度的**事务预占**；新增 Provider Router | 原有请求字段、返回 `task_id,status=queued,status_url` |
| `GET /api/video/tasks/{task_id}` | `success` 前必须确保最终文件存在；`failed` 释放额度 | 状态值 `queued/preparing/downloading/processing/success/failed/expired`，progress/error_code |
| `GET /api/video/file/{task_id}` | 继续从 `/data` 输出文件，仍执行鉴权/安全/文件 TTL | 原有接口路径不变 |

**注意**：本包有适配 `VidFetch` 的已知返回字段，但没有真实密钥请求，`POST /v1/info` 的真实 JSON schema 尚未比对，不能把任何推测字段当作已验证字段直接上线。SnapAny 的字段已经按官方完整示例映射。

## B. 浏览器 Cookie + 真正的访问 IP

- 采用服务端签发并 HMAC 签名的 cookie `vidsavey_browser_id`，`HttpOnly; Secure; SameSite=Lax; Path=/`，Cookie 存在 `api.vidsavey.com` 域名即可。
- 首页创建下载时需允许浏览器跨**同站不同域**携带 Cookie：

```typescript
// components/home-view.tsx 真实下载请求
const response = await fetch(DOWNLOAD_API_URL, {
  method: "POST",
  credentials: "include", // api.vidsavey.com 上的 browser_id cookie
  headers: {
    "Content-Type": "application/json",
    "X-Download-Request-ID": crypto.randomUUID(),
  },
  body: JSON.stringify(payload),
});
```

- 后端 CORS 必须使用显式 `https://vidsavey.com`、`https://www.vidsavey.com` 的白名单，开启 `allow_credentials=True`，禁止 `*`。
- **不能从客户端传来的 `X-Forwarded-For` 随意取 IP**。先确认 Cloudflare → Nginx 中 `CF-Connecting-IP` 被受信任 Cloudflare 段校验，再由 Nginx 填写 `X-Forwarded-For: $remote_addr`，Uvicorn 仅信任受控反向代理；应用使用经过校验的最终 `request.client.host`。现场抽样确认不是 Docker gateway/localhost，否则必须修复后再启用额度。
- 服务器对新浏览器首次请求签发 Cookie；原始 nonce 不进入数据库，仅存 HMAC 派生 subject。轮换 Secret 可能导致所有身份重置，需有管理策略。
- 无 Cookie/失效 Cookie，重新签发并随响应 `Set-Cookie`；浏览器拒绝 Cookie 时依然受 IP 限制，但可选择提示启用 Cookie。

FastAPI 概念代码（需合并现有路由，不得直接取代旧路由）：

```python
# 新增配置；VIDSAVEY_QUOTA_SECRET 使用环境变量加载，不写在代码里
quota = DailyDownloadQuota(
    db_path="/data/download_quota.sqlite3",
    secret=os.environ["VIDSAVEY_QUOTA_SECRET"],
    daily_limit=2,
)

# POST /api/video/download，原有 URL/SSRF 检查后、队列创建前：
# NOTE: `response` 必须是最终向浏览器发出的 Response 对象。
raw_cookie = request.cookies.get("vidsavey_browser_id")
if verify_signed_browser_cookie(os.environ["VIDSAVEY_QUOTA_SECRET"], raw_cookie):
    browser_cookie = raw_cookie
else:
    browser_cookie = create_signed_browser_cookie(os.environ["VIDSAVEY_QUOTA_SECRET"])
    response.set_cookie("vidsavey_browser_id", browser_cookie,
        httponly=True,secure=True,samesite="lax",path="/",max_age=365*24*60*60)

# 此 IP 必须已经受信任代理验证，不能任意取客户端 X-Forwarded-For。
client_ip = request.client.host
request_id = request.headers.get("X-Download-Request-ID")
if not request_id:
    # 请求必须提供幂等键；也可以由服务端创建并返回后续重试。
    raise HTTPException(status_code=400,detail={"code":"missing_request_id"})

try:
    claim = quota.reserve(request_id,browser_cookie,client_ip)
except QuotaExceeded as exc:
    raise HTTPException(status_code=429, detail={
        "code":exc.code,
        "message":"You have reached your 2 downloads for today. Try again tomorrow (UTC).",
        "reset_at": (datetime.fromisoformat(exc.day).date() + timedelta(days=1)).isoformat()+"T00:00:00Z",
    })

if claim.existing:
    # 返回同一 task_id，不创建第二个下载任务；如果尚未 attach_task，则返回 409 + Retry-After。
    ...
else:
    try:
        created = existing_create_task(payload)
        quota.attach_task(request_id,created.task_id)
    except Exception:
        quota.finish(request_id,False)
        raise
    # 必须保证真正发送给客户端的响应对象包含新的 Set-Cookie。
    return created
```

**特别注意：** 如果原 FastAPI 路由通过 `return JSONResponse(...)` 返回，则 `response.set_cookie(...)` 写在参数注入的临时 `Response` 上不会自动传入 JSONResponse。需要把 Cookie 直接写到实际返回的 `JSONResponse`，包括 429 错误响应。示例代码仅表达接线点，实际接入必须保留 Cookie 头。

## C. Worker 逻辑（不能在 HTTP handler 内同步等待 300 秒）

```python
# 既有异步任务 worker，在 YouTube/mp4 或 YouTube/mp3 分支
router = YouTubeDownloadRouter(
    vidfetch_key=os.getenv("VIDFETCH_API_KEY"),
    snapany_key=os.getenv("SNAPANY_API_KEY"),
    ffmpeg="/usr/bin/ffmpeg",
)

try:
    # 此处 result 写入 `/data` 中 task 专属目录，并且完成后走原有状态机。
    result = router.download(
        url=task.url, format=task.format,
        output=Path(f"/data/tasks/{task.id}/download"),
        max_bytes=1024*1024*1024,
    )
    # 仍需旧系统更新 SQLite: preparing/downloading/processing/success
    existing_mark_success(task.id,file_path=str(result.file_path))
    quota.finish(task.idempotency_request_id,True)
except Exception:
    existing_mark_failed(task.id, error_code="download_failed")
    quota.finish(task.idempotency_request_id,False)
```

**状态与额度原子一致性**：生产中建议在**同一个 SQLite 事务**里写入最终任务状态、额度扣减。若当前任务数据库与额度数据库是两个文件，采用重启对账程序（比对 `success`/`failed` 与 `reserved`/`charged`）消除进程崩溃时的“成功但额度未扣”等短暂不一致。不要仅依赖 `cleanup_stale()` 按时间清理活跃任务。

## D. 成本保护与异常降级

- `VidFetch` 正常成功：仅调用 VidFetch。
- `VidFetch` 返回已确认失败、402 无剩余额度、可恢复的部分 5xx：可以调用 SnapAny。
- `VidFetch` 返回等待中的未决状态或请求超时、且**不能确定任务是否已创建**：不要立即调用 SnapAny，先查询/对账避免同一次下载重复扣费。
- `VidFetch` 返回 `video_unavailable`、`invalid_format`、视频私有等永久性错误：不应自动回退，向用户报告来源不可用。
- `SnapAny` 付费响应中的链接 30 分钟内尽快下载，不允许把可能过期的签名链接长时间缓存在数据库。
- SnapAny 对超过 1080p 或超过 3 GB 不返回代理 URL。不能改为从 Contabo 下载同一 `googlevideo.com` 直链作为“回退”，那会重新遇到 403。
- 配置全站外部 API 成本上限、限流、并发，并将第三方 API 消耗、来源、任务与错误码记录到日志/数据库（不写 API Key 或完整签名 URL）。建议对 SnapAny 每天总调用次数另设上限，必要时在供应商控制台设置消费阈值。

## E. 文案（现有多语言字典需同步更新）

- `daily_browser_limit`：`You've reached the daily limit of 2 downloads for this browser. Please try again tomorrow (UTC).`
- `daily_ip_limit`：`The daily limit of 2 downloads has been reached for this network. Please try again tomorrow (UTC).`
- `provider_unavailable`：`This video is temporarily unavailable to download. Please try again later.`
- `download_failed`：沿用现有下载失败文案。
- 若用户主动删除浏览器 Cookie/更换设备，IP 次数仍共享，因此文案应解释“网络限制”，避免声称“每人限制”。

## F. 发布/验收范围

1. 在 staging 环境完成 VidFetch 免费 info、MP4、MP3 实际请求与字段对齐。
2. 暂时禁用 VidFetch，确认 SnapAny 1080p 和音频代理可以从 Contabo 正常下载，并且 FFmpeg 产物可播放。
3. 同浏览器 + 同 IP 前两次 success，第三次 429；不同浏览器同 IP 第三次也 429；同浏览器切换 IP 第三次也 429。
4. 失败任务释放预占；并发 10 次只放行 2 次；断网重试同一请求 ID 不重复计数。
5. 新的一天 UTC 00:00:00 额度重置；客户端展示准确下一次重置时间。
6. 无 Cookie、禁用 Cookie、IPv6 访问、Cloudflare 代理、共享 NAT 网络、服务重启都要验证。
7. 原有 TikTok、Instagram、X 等平台下载 / SSRF / CORS / 文件 TTL 无回归；两家 Key 为空时禁止进入带凭证的渠道。
8. Cloudflare 前端 build、容器镜像、测试、部署与回滚按手册 V1.2 SOP 执行；正式前保留原镜像及 `/data` 的任务 DB。

## G. 最终缺失项

- **后端源代码**：后端位于 Contabo `/opt/video-downloader/backend`，不在当前已访问到的前端 GitHub 仓库中。必须取得现有 `POST /info`、`POST /download`、Worker、任务状态与文件输出代码才能完成无损接线。
- **真实供应商凭证**：`VIDFETCH_API_KEY`、`SNAPANY_API_KEY` 应由 VPS Secret/ENV 管理，不应发送到聊天或复制到 GitHub。
- **实时验证**：未发起真实 API 下载。供应商公开文档只能证明接口声明，不能证明对失败视频 `Bcj8Ux1vAQQ` 的实际成功率。

