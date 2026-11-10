"""VIDSAVEY YouTube provider and daily quota reference integration.

This is a standalone integration package. It is not automatically wired to the
existing private FastAPI backend.
"""
from .providers import YouTubeDownloadRouter, DownloadResult, ProviderFailure
from .quota import DailyDownloadQuota, QuotaExceeded, create_signed_browser_cookie, verify_signed_browser_cookie

__all__ = ["YouTubeDownloadRouter", "DownloadResult", "ProviderFailure", "DailyDownloadQuota", "QuotaExceeded", "create_signed_browser_cookie", "verify_signed_browser_cookie"]
