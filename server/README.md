# VIDSAVEY — YouTube / Bilibili 下载集成

> **状态说明（2026-11-10）**：本目录是 GitHub 分支中的 Python bridge 代码，**不是当前 Contabo VPS 的完整 FastAPI 应用**。按项目维护人员 2026-11-10 的交付报告，bridge 已在 VPS 上接入并部署，浏览器/IP 配额、TikTok 回归已做生产验证；本仓库未能独立读取该生产运行版本。**VidFetch 和 SnapAny 的真实下载仍未验证**（生产未配置 API Key），不能宣布 YouTube 或 Bilibili 已修复。

## 本次规则

| 平台 | 默认引擎 | 备用 | 每日限额 |
| --- | --- | --- | --- |
| YouTube（MP4/MP3） | VidFetch（启用供应商模式后） | SnapAny YouTube proxy | 浏览器与 IP 各 2 次/UTC 日 |
| Bilibili | 原有 yt-dlp | SnapAny extract（只有实际测试成功后启用） | 与 YouTube 共享上述 2 次 |
| 其他（TikTok、Instagram 等） | 原有 yt-dlp | 不调用以上供应商 | 本次新增 2 次限额不适用 |

*YouTube 字幕仍走现有字幕实现，不送入 VidFetch/SnapAny 的付费视频接口；限额由 VPS 的实际任务路由实现。*

## 安装与离线测试

```bash
cd server
python -m pip install -r requirements.txt
python -m pytest -q
```

前端从仓库根目录执行 `npm ci && npm run build && npm run build:vinext`。PR 分支的 `.github/workflows/vidsavey-ci.yml` 自动运行以上检查；**CI 不接触供应商密钥，也不验证真实视频下载**。

## 关键模块

- `vidsavey_bridge/providers.py`：YouTube VidFetch → SnapAny Proxy、Bilibili SnapAnyExtract 候选、FFmpeg、媒体 URL 安全下载与错误分类。
- `vidsavey_bridge/quota.py`：SQLite 按浏览器和公网 IP 双重每日额度、原子预占、任务完成扣减、失败释放、重启恢复。
- `vidsavey_bridge/fastapi_wiring.py`：`GET /api/video/quota`、HMAC 浏览器 Cookie、HTTP 429 与代理 IP 辅助函数；必须接入实际 FastAPI 路由。
- `vidsavey_bridge/budget.py`：`ProviderBudget.try_submit(provider, task_key, estimated_usd)` 原子核验 + 预占第三方预计费用；`record_outcome(..., cost_usd=实际费用)` 结算。

### 预算模块：2026-11-10 改动

旧版预算代码只将已结算金额计入上限：并发提交时即使有原子事务，也可能低估尚未结算任务的潜在消费。最新版本增加 `estimated_cost_usd`，未结算任务以预计金额占用每日/月度预算，完成后改为实际费用。

- 原有 `budget_tasks` 表将自动、非破坏性地添加 `estimated_cost_usd` 列。
- **VPS 上必须实际部署新版 `budget.py`，该修复才会生效**。GitHub 更新不自动修改 VPS 文件。
- 若日/月成本上限已配置，创建可能收费的任务时必须传入**非零、保守**的 `estimated_usd`。省略估价传 0 会使预算保护失去意义。
- `try_submit()` 必须在外部可能收费的 API 请求**之前**执行；未确定上游是否已接收的请求不得释放预占或盲目向备用渠道重试。
- `record_outcome()` 仅在确认最终实际收费情况后结算，未知状态保留预占待对账。
- 实际费用可能大于估计，应用预算上限是软件防护，不是供应商消费硬限额；建议结合供应商控制台消费警报。

## 历史接口与生产接线

当前前端 API 契约不变：

```text
POST /api/video/info
POST /api/video/download
GET  /api/video/tasks/{task_id}
GET  /api/video/file/{task_id}
GET  /api/video/quota   # 新增
```

前端仅在 `NEXT_PUBLIC_DAILY_DOWNLOAD_QUOTA=true` 时请求额度端点和跨子域携带 Cookie。后端对 YouTube 和 Bilibili 必须强制验证额度，不能依赖前端按钮判断。

生产代码与本目录可能已有差异。实际接线前需比对 VPS：
`/opt/video-downloader/backend/app/bridge/`、`app/services/platform.py`、`app/services/quota_service.py`、`app/services/budget_service.py`、实际下载路由和任务服务；具体目录以实际服务器为准。旧版 `BACKEND_INTEGRATION.md` 的代码示例是参考而非可直接覆盖的生产路由。

## 真实联调尚缺的条件

- `VIDFETCH_API_KEY`、`SNAPANY_API_KEY`：仅在 VPS 的 Secret/环境变量中配置，不提交到 GitHub、不发送至聊天。
- YouTube：以 `https://youtu.be/Bcj8Ux1vAQQ` 验证 VidFetch info/MP4/MP3 及 SnapAny Proxy 下载，确认 VPS 本地文件可播放。
- Bilibili：用可合法下载的公开 BV 视频验证旧 yt-dlp 与 SnapAny `extract/post`；返回直链 ≠ VPS 能下载。此前 Contabo yt-dlp 遇到 412，不可假称修复。
- 先验证接口、余额、预算、额度及其他平台回归，再考虑开启生产供应商模式和 Bilibili fallback。

## 参考资料

- VidFetch 官方文档：https://www.vidfetch.dev/youtube-downloader-api
- SnapAny YouTube proxy：https://platform.snapany.com/zh/docs/youtube-proxy-download
- SnapAny 通用提取：https://platform.snapany.com/docs/extract-post
- GitHub PR：https://github.com/xiongfh2008/video-downloader-web/pull/1
