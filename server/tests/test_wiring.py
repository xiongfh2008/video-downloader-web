"""Tests for the FastAPI wiring reference (GET /api/video/quota + reserve)."""
import uuid

import pytest

fastapi = pytest.importorskip("fastapi")
from fastapi import FastAPI, Request  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from vidsavey_bridge.fastapi_wiring import (  # noqa: E402
    BROWSER_COOKIE_NAME,
    QuotaHTTP,
    create_quota_router,
    install_quota_http_handler,
    next_utc_midnight,
    reserve_for_download,
)
from vidsavey_bridge.quota import DailyDownloadQuota  # noqa: E402

SECRET = "A secure randomly generated local development key 12345"
# TestClient sends through the local loopback; quota.py requires a global IP,
# so tests inject a public address the way the trusted Nginx/uvicorn chain
# would in production.
PUBLIC_IP = "8.8.8.8"


@pytest.fixture()
def env(tmp_path, monkeypatch):
    quota = DailyDownloadQuota(str(tmp_path / "q.sqlite3"), SECRET, daily_limit=2)
    app = FastAPI()
    install_quota_http_handler(app)
    app.include_router(create_quota_router(quota))

    @app.post("/api/video/download")
    def download(request: Request):
        request_id = request.headers.get("X-Download-Request-ID")
        claim, cookie_value, fresh_cookie = reserve_for_download(
            request, quota, request_id
        )
        quota.attach_task(claim.request_id, f"task-{claim.request_id[:8]}")
        body = {"success": True, "task_id": f"task-{claim.request_id[:8]}",
                "status": "queued", "status_url": "/api/video/tasks/x",
                "remaining": claim.remaining}
        from fastapi.responses import JSONResponse
        response = JSONResponse(body)
        if fresh_cookie:
            from vidsavey_bridge.fastapi_wiring import apply_browser_cookie
            apply_browser_cookie(response, fresh_cookie)
        return response

    monkeypatch.setattr(
        "vidsavey_bridge.fastapi_wiring.trusted_client_ip",
        lambda request: PUBLIC_IP,
    )
    # HTTPS base URL so httpx stores and replays the Secure browser cookie,
    # mirroring production (api.vidsavey.com is HTTPS-only).
    client = TestClient(app, base_url="https://testserver")
    return quota, client


def test_quota_endpoint_issues_cookie_and_counts(env):
    _, client = env
    first = client.get("/api/video/quota")
    assert first.status_code == 200
    assert first.json() == {"success": True, "data": {
        "remaining": 2, "limit": 2, "reset_at": next_utc_midnight()}}
    cookie_header = first.headers.get("set-cookie", "")
    assert BROWSER_COOKIE_NAME in cookie_header
    assert "HttpOnly" in cookie_header and "SameSite=lax" in cookie_header
    assert "Secure" in cookie_header


def test_download_flow_consumes_and_blocks(env):
    _, client = env
    headers = {"X-Download-Request-ID": uuid.uuid4().hex}
    r1 = client.post("/api/video/download", headers=headers)
    assert r1.status_code == 200 and r1.json()["remaining"] == 1
    # Same request id retried -> same task, no double consumption.
    r1b = client.post("/api/video/download", headers=headers)
    assert r1b.status_code == 200
    assert r1b.json()["task_id"] == r1.json()["task_id"]

    r2 = client.post("/api/video/download",
                     headers={"X-Download-Request-ID": uuid.uuid4().hex})
    assert r2.status_code == 200 and r2.json()["remaining"] == 0

    r3 = client.post("/api/video/download",
                     headers={"X-Download-Request-ID": uuid.uuid4().hex})
    assert r3.status_code == 429
    detail = r3.json()["detail"]
    assert detail["code"] in ("daily_browser_limit", "daily_ip_limit")
    assert detail["reset_at"].endswith("T00:00:00Z")

    quota_view = client.get("/api/video/quota")
    assert quota_view.json()["data"]["remaining"] == 0


def test_missing_request_id_rejected(env):
    _, client = env
    response = client.post("/api/video/download")
    assert response.status_code == 400
    assert response.json()["detail"]["code"] == "missing_request_id"


def test_failed_task_release_reflected_in_quota(env):
    quota, client = env
    rid = uuid.uuid4().hex
    r1 = client.post("/api/video/download", headers={"X-Download-Request-ID": rid})
    assert r1.status_code == 200
    assert quota.finish(rid, False)  # worker marks the task failed
    view = client.get("/api/video/quota")
    assert view.json()["data"]["remaining"] == 2
