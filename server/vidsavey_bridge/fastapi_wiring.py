"""Reference FastAPI wiring for the daily download quota.

The production backend lives on the VPS (/opt/video-downloader/backend) and is
NOT in this repository. This module provides copy-in building blocks that the
existing routes can call without changing the /api/video/* contract:

  - create_quota_router(): adds GET /api/video/quota (remaining count + cookie
    issuance) behind the same browser cookie used by POST /api/video/download.
  - resolve_browser_identity(): validates/refreshes the signed browser cookie
    and returns (cookie_value, set_cookie_needed) for use inside the existing
    download route.
  - reserve_for_download(): atomic quota reservation + idempotency for the
    existing download route; raises QuotaHTTP(429) with the cookie preserved.

Merge points are documented in BACKEND_INTEGRATION.md sections B/C.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from .quota import (
    DailyDownloadQuota,
    QuotaExceeded,
    Reservation,
    create_signed_browser_cookie,
    verify_signed_browser_cookie,
)

BROWSER_COOKIE_NAME = "vidsavey_browser_id"
COOKIE_MAX_AGE_SECONDS = 365 * 24 * 60 * 60


class QuotaHTTP(Exception):
    """Carries a ready-to-return JSONResponse (including Set-Cookie)."""

    def __init__(self, response: JSONResponse) -> None:
        self.response = response
        super().__init__(response.status_code)


def next_utc_midnight(now: datetime | None = None) -> str:
    stamp = now or datetime.now(timezone.utc)
    if stamp.tzinfo is None:
        stamp = stamp.replace(tzinfo=timezone.utc)
    tomorrow = stamp.astimezone(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    ) + timedelta(days=1)
    return tomorrow.strftime("%Y-%m-%dT%H:%M:%SZ")


def apply_browser_cookie(response: JSONResponse, value: str) -> None:
    # Secure+HttpOnly+SameSite=Lax per spec; served over HTTPS at
    # api.vidsavey.com. The frontend calls with credentials:"include" and the
    # backend CORS must allow https://vidsavey.com + https://www.vidsavey.com
    # with allow_credentials=True (no wildcard).
    response.set_cookie(
        BROWSER_COOKIE_NAME,
        value,
        max_age=COOKIE_MAX_AGE_SECONDS,
        httponly=True,
        secure=True,
        samesite="lax",
        path="/",
    )


def resolve_browser_identity(request: Request, secret: str) -> tuple[str, str | None]:
    """Return (cookie_value, fresh_cookie_or_None).

    fresh_cookie must be applied via apply_browser_cookie() on the FINAL
    response actually sent to the browser (success or 429 alike).
    """
    raw = request.cookies.get(BROWSER_COOKIE_NAME)
    if verify_signed_browser_cookie(secret, raw):
        return raw, None
    fresh = create_signed_browser_cookie(secret)
    return fresh, fresh


def trusted_client_ip(request: Request) -> str:
    """Client IP from the validated proxy chain.

    Uvicorn must run with --proxy-headers --forwarded-allow-ips=<nginx ip> and
    Nginx must set `proxy_set_header X-Forwarded-For $remote_addr;` so that
    request.client.host is the real visitor IP. CF-Connecting-IP must only be
    honored by Nginx after validating $remote_addr against Cloudflare ranges.
    Never read X-Forwarded-For inside the application itself.
    """
    client = request.client
    if not client or not client.host:
        raise QuotaHTTP(JSONResponse(
            status_code=503,
            content={"detail": {"code": "quota_unavailable",
                                "message": "Client address could not be determined."}},
        ))
    return client.host


def _quota_error_response(exc: QuotaExceeded, cookie_value: str,
                          fresh_cookie: str | None) -> JSONResponse:
    response = JSONResponse(
        status_code=429,
        headers={"Retry-After": "86400"},
        content={"detail": {
            "code": exc.code,
            "message": ("You have reached the daily limit of "
                        f"{exc.limit} downloads. Try again tomorrow (UTC)."),
            "reset_at": next_utc_midnight(),
        }},
    )
    if fresh_cookie:
        # First visit was already over quota (e.g. shared IP): still hand out
        # the identity cookie so the client can track its own usage.
        apply_browser_cookie(response, fresh_cookie)
    return response


def reserve_for_download(request: Request, quota: DailyDownloadQuota,
                         request_id: str | None) -> tuple[Reservation, str, str | None]:
    """Atomic reservation for the existing POST /api/video/download route.

    Call AFTER URL validation / SSRF checks and BEFORE creating the task.
    Returns (reservation, browser_cookie, fresh_cookie). On quota exhaustion
    raises QuotaHTTP carrying a 429 JSONResponse (with identity cookie).
    """
    cookie_value, fresh_cookie = resolve_browser_identity(request, quota.secret)
    if not request_id:
        raise QuotaHTTP(JSONResponse(
            status_code=400,
            content={"detail": {"code": "missing_request_id",
                                "message": "Missing idempotency request id."}},
        ))
    ip = trusted_client_ip(request)
    try:
        claim = quota.reserve(request_id, cookie_value, ip)
    except QuotaExceeded as exc:
        raise QuotaHTTP(_quota_error_response(exc, cookie_value, fresh_cookie)) from exc
    except ValueError as exc:
        # Invalid cookie identity or non-global client IP (proxy misconfig).
        raise QuotaHTTP(JSONResponse(
            status_code=503,
            content={"detail": {"code": "quota_unavailable",
                                "message": "Quota identity is temporarily unavailable."}},
        )) from exc
    return claim, cookie_value, fresh_cookie


def install_quota_http_handler(app) -> None:
    """Register the QuotaHTTP exception handler on the existing FastAPI app."""
    from fastapi import FastAPI  # noqa: F401  (type clarity only)

    @app.exception_handler(QuotaHTTP)
    async def _quota_http_handler(_, exc: QuotaHTTP) -> JSONResponse:
        return exc.response


def create_quota_router(quota: DailyDownloadQuota) -> APIRouter:
    """GET /api/video/quota — remaining downloads for this browser+IP."""
    router = APIRouter(prefix="/api/video")

    @router.get("/quota")
    def quota_status(request: Request) -> JSONResponse:
        cookie_value, fresh_cookie = resolve_browser_identity(request, quota.secret)
        try:
            remaining = quota.remaining(cookie_value, trusted_client_ip(request))
        except ValueError as exc:
            raise QuotaHTTP(JSONResponse(
                status_code=503,
                content={"detail": {"code": "quota_unavailable",
                                    "message": "Quota is temporarily unavailable."}},
            )) from exc
        response = JSONResponse(content={
            "success": True,
            "data": {
                "remaining": remaining,
                "limit": quota.limit,
                "reset_at": next_utc_midnight(),
            },
        })
        if fresh_cookie:
            apply_browser_cookie(response, fresh_cookie)
        return response

    return router
