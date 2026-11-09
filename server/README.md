# VIDSAVEY 双供应商接入参考包（未部署）

目标：**VidFetch 优先、SnapAny 备用**；**同一浏览器与同一公网 IP 各 2 次/UTC 自然日**。

> 重要：本包提供通过静态检查、可离线测试的接入模块和对接说明，但**没有接入到 VIDSAVEY 生产 FastAPI 后端**，没有 API Key，也没有进行真实第三方视频下载测试。不能直接将目录复制到生产目录后认为已经上线。完整上线需要结合现有 FastAPI 队列/SQLite/错误返回约定接线并验证。

## 官方接口（2026-11-09 核验）

- VidFetch：`POST https://api.vidfetch.dev/v1/info`（免费信息查询），`POST /v1/downloads`（异步返回 202 + `id`），`GET /v1/downloads/{id}`（直到 `completed` / `failed`），完成后使用 `download_url`。支持 `mp3` 和 `144p`–`2160p`。https://www.vidfetch.dev/youtube-downloader-api
- SnapAny：`POST https://api.snapany.com/openapi/v1/youtube/proxy-download`，返回 `medias[].variants[].video_proxy_url`、`audio_proxy_url`、`resource_proxy_url`；按官方文档 1080p 及以下支持代理，链接一般应按 30 分钟过期处理。https://platform.snapany.com/zh/docs/youtube-proxy-download

## 目录

- `vidsavey_bridge/providers.py`：VidFetch 同步 Worker 适配、SnapAny 代理流/FFmpeg 适配、优先级与故障转移。
- `vidsavey_bridge/quota.py`：SQLite 原子化浏览器和 IP 双限额、任务预占、成功扣次、失败释放、幂等。
- `vidsavey_bridge/fastapi_wiring.py`：可直接并入现有 FastAPI 应用的接线模块：`GET /api/video/quota`（剩余次数 + Cookie 签发）、`reserve_for_download()`（下载路由原子预占 + 幂等 429）、`install_quota_http_handler()`。真实客户端 IP 依赖 uvicorn `--proxy-headers --forwarded-allow-ips=<nginx>` 与 Nginx `X-Forwarded-For $remote_addr`。
- `vidsavey_bridge/budget.py`：第三方成本保护：日/月成本上限、SnapAny 每日调用上限、按 task_key 幂等记账（防重复付费）、成功率统计。
- `BACKEND_INTEGRATION.md`：如何接入现有 FastAPI / SQLite / 任务队列及前端。
- `.env.example`：需要由 VPS 环境注入的变量名，**不存真实密钥**。
- `tests/`：离线测试，覆盖同 IP、多浏览器、原子并发、重试幂等、UTC 跨天、主渠道降级、成本上限、quota 接口。

## 本地运行测试

```bash
cd vidsavey_dual_provider_integration
python -m pip install -r requirements.txt
python -m pytest -q
```

## 接入建议

1. 将 `vidsavey_bridge/` 放入现有后端 Python 包/镜像，并在容器依赖中增加 `requests`。
2. 使用已有数据库持久化卷 `/data` 保存新增 `download_quota.sqlite3` 与 `provider_budget.sqlite3`；不可写在容器临时层。
3. 后端应用挂载 `fastapi_wiring.create_quota_router(quota)` 提供 `GET /api/video/quota`，并调用 `install_quota_http_handler(app)`；`/api/video/download` **在创建异步任务前**改用 `reserve_for_download(request, quota, request_id)` 做原子预占（成功创建任务后 `attach_task`，创建失败 `finish(request_id, False)`）。
4. 后端 Worker 在 YouTube MP4/MP3 分支调用 `YouTubeDownloadRouter.download`；其他平台仍走原有 yt-dlp，字幕继续使用原有字幕路径（本包不为字幕增加收费 Provider）。
5. Worker 文件落地且旧有最终态判定成功后 `quota.finish(request_id, True)`；全部 Provider 失败/任务 cancelled/服务重启时 `quota.finish(request_id, False)`。
6. Worker 在每次创建付费任务前调用 `budget.require(provider, estimated_usd)`（超限抛 `BudgetExceeded`），任务提交后 `record_submission`，终态后 `record_outcome`；`budget.snapshot()` 可供监控/日志输出。
7. 每日限额为全站每个实际下载文件 2 次（浏览器 + IP 独立）。如果政策只需对 YouTube 生效，后端只对 YouTube 分支调用 `reserve`，否则对所有平台的 MP4/MP3/字幕都调用。
8. API 响应、任务状态、文件路径继续遵守原有 `/api/video/info`、`/api/video/download`、`/api/video/tasks/{task_id}`、`/api/video/file/{task_id}` 契约；新增 `GET /api/video/quota` 为增量接口，不影响旧契约。
9. 在受控测试环境完成两个 API 的实测；不要直接替换线上容器或生产 DNS、Nginx、Cloudflare。

## 主要限制

- 暂无 VIDSAVEY 的 **当前生产后端源码**，因此无法完成与后端业务路由/队列的实际集成，也不能验证当前 BOPS/VPS 日志与 API 凭证；这是生产上线的真实阻塞项。
- `requests` 通过 URL 前检查 DNS 并拒绝非公网地址，属于防御性检查，但不能取代现有容器层出站防火墙，仍存在 DNS rebinding/重定向等动态风险；建议在生产采用经限制的出站网络策略。
- `VidFetch` 创建任务后网络超时的状态不一定能判定是否实际创建成功。本包在任务轮询超时时**不会**自动启用 SnapAny，避免双重付费/双任务；需对账确认后人工或系统重新执行。
- SnapAny `proxy-download` 响应成功可能已经计费；下载文件或 FFmpeg 失败后不会自动重复请求该付费接口。
- 该版本仅适配 YouTube MP4/MP3；字幕仍由原有下载通道处理，若 YouTube 字幕获取也失败，可单独评估 SnapAny 字幕 API（按次收费）。
- 单浏览器身份依赖服务端签发 Cookie，用户主动清 Cookie / 换设备仍会获得新浏览器标识；IP 限制能减少绕过，但共享公网 IP 的不同用户也会共享 2 次额度。无法在免登录匿名系统中保证每个真实自然人唯一。
- 本包默认主渠道视频分辨率请求 1080p，备用至多 1080p；若强制将高分辨率统一降级，要在前端明确提示。
