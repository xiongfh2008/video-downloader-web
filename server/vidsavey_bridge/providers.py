"""VidFetch-primary / SnapAny-fallback YouTube downloader + SnapAny generic extractor.

Synchronous worker-oriented adapters. Use in the existing VIDSAVEY background
worker, NOT inside a FastAPI request handler. Responses are materialized as
files to preserve the existing /api/video/file/{task_id} API.

Error model (P0-7): ProviderFailure.kind is one of
  - "permanent":   no point retrying anywhere (video gone, bad URL, ...)
  - "recoverable": safe to try the fallback provider / retry later
  - "uncertain":   a PAID task may exist upstream (creation timed out, job
                   status unknown, transfer of a generated file failed). The
                   caller MUST reconcile the original job (poll()) and MUST
                   NOT submit a second paid request for the same video.
"""
from __future__ import annotations

import ipaddress
import os
import socket
import subprocess
import time
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urljoin, urlsplit

import requests

try:  # urllib3 >= 2.x is required for DNS pinning (server_hostname support).
    import urllib3
    from urllib3 import HTTPSConnectionPool

    _URRLIB3_PINNING = int(urllib3.__version__.split(".")[0]) >= 2
except Exception:  # pragma: no cover - fallback for exotic environments
    _URRLIB3_PINNING = False


PERMANENT_VIDFETCH_CODES = {
    "video_unavailable",
    "invalid_format",
    "invalid_url",
    "private_video",
    "age_restricted",
    "unsupported_type",
    "format_unavailable",
}


class ProviderFailure(Exception):
    def __init__(self, provider: str, code: str, message: str,
                 fallback_allowed: bool = True, kind: str = "recoverable"):
        super().__init__(f"{provider}: {code}: {message}")
        self.provider = provider
        self.code = code
        self.fallback_allowed = fallback_allowed
        self.kind = kind
        if kind == "permanent":
            self.fallback_allowed = False
        if kind == "uncertain":
            # Uncertain paid-task state: never re-submit to another provider.
            self.fallback_allowed = False


@dataclass(frozen=True)
class DownloadResult:
    provider: str
    file_path: Path
    extension: str
    upstream_id: str | None = None


def canonical_youtube_url(raw: str) -> str:
    try:
        parsed = urlsplit(raw)
        host = (parsed.hostname or "").lower()
        if parsed.scheme != "https" or parsed.username or parsed.password or parsed.port not in (None, 443):
            raise ValueError("invalid URL")
        if host in ("youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com"):
            from urllib.parse import parse_qs
            if parsed.path == "/watch":
                vid = parse_qs(parsed.query).get("v", [""])[0]
            elif parsed.path.startswith("/shorts/"):
                vid = parsed.path.split("/")[2]
            else:
                raise ValueError("unsupported YouTube URL")
        elif host == "youtu.be":
            vid = parsed.path.strip("/")
        else:
            raise ValueError("unsupported host")
        if len(vid) != 11 or not all(c.isascii() and (c.isalnum() or c in "-_") for c in vid):
            raise ValueError("invalid video id")
        return "https://www.youtube.com/watch?v=" + vid
    except (ValueError, AttributeError, IndexError) as exc:
        raise ProviderFailure("router", "invalid_url",
                              "Not a supported public YouTube video URL",
                              kind="permanent") from exc


def _read_error(resp: requests.Response) -> str:
    try:
        j = resp.json()
        if isinstance(j, dict):
            return str(j.get("code") or j.get("error", {}).get("code") or j.get("detail")
                       or resp.status_code)[:120]
    except (ValueError, AttributeError):
        pass
    return "http_" + str(resp.status_code)


# ---------------------------------------------------------------------------
# SSRF-safe media transfer (P0-6): HTTPS only, global DNS resolution, and DNS
# pinning via urllib3 2.x so the connection cannot be re-bound to a private
# address between validation and connect. Redirects are followed manually and
# re-validated + re-pinned at every hop.
# ---------------------------------------------------------------------------

def _resolve_global(hostname: str, port: int) -> list[str]:
    try:
        addrs = sorted({
            item[4][0]
            for item in socket.getaddrinfo(hostname, port, type=socket.SOCK_STREAM)
            if item and len(item) >= 5 and item[4]
        })
    except (OSError, socket.gaierror) as exc:
        raise ProviderFailure("transfer", "unsafe_url",
                              "Media URL could not be resolved",
                              kind="permanent") from exc
    if not addrs:
        raise ProviderFailure("transfer", "unsafe_url",
                              "Media URL could not be resolved", kind="permanent")
    if any(not ipaddress.ip_address(addr).is_global for addr in addrs):
        raise ProviderFailure("transfer", "unsafe_url",
                              "Media URL resolved to a restricted address",
                              kind="permanent")
    return addrs


def _pinned_get(url: str, headers: dict[str, str], max_bytes: int):
    """One pinned GET; returns a urllib3 HTTPResponse (preload_content=False)."""
    parsed = urlsplit(url)
    port = parsed.port or 443
    addrs = _resolve_global(parsed.hostname, port)
    path = parsed.path or "/"
    if parsed.query:
        path += "?" + parsed.query
    timeout = urllib3.Timeout(connect=10, read=90)
    last_error: Exception | None = None
    for addr in addrs:
        pool = HTTPSConnectionPool(
            host=addr,
            port=port,
            server_hostname=parsed.hostname,   # SNI stays the real hostname
            assert_hostname=parsed.hostname,   # cert is validated for hostname
            timeout=timeout,
            retries=False,
            maxsize=1,
            blocksize=64 * 1024,
        )
        try:
            resp = pool.urlopen(
                "GET",
                path,
                headers={**headers, "Host": parsed.hostname},
                preload_content=False,
                redirect=False,
                decode_content=False,
            )
            if resp.status >= 400:
                resp.close()
                raise ProviderFailure("transfer", "http_" + str(resp.status),
                                      "Signed or proxy media link failed",
                                      kind="recoverable")
            expected = resp.headers.get("Content-Length")
            if expected and expected.isdigit() and int(expected) > max_bytes:
                resp.close()
                raise ProviderFailure("transfer", "video_too_large",
                                      "Exceeded VIDSAVEY max file size", kind="permanent")
            return resp
        except ProviderFailure:
            raise
        except Exception as exc:  # connect errors: try the next resolved IP
            last_error = exc
            continue
    raise ProviderFailure("transfer", "network_error", type(last_error).__name__ if last_error else "connect_failed")


def _requests_get(url: str, headers: dict[str, str], session: requests.Session, max_bytes: int):
    """Fallback GET without pinning (legacy urllib3 1.x environments)."""
    parsed = urlsplit(url)
    _resolve_global(parsed.hostname, parsed.port or 443)  # validation only
    try:
        return session.get(url, headers=headers, stream=True,
                           timeout=(10, 90), allow_redirects=False)
    except requests.RequestException as exc:
        raise ProviderFailure("transfer", "network_error", type(exc).__name__) from exc


def _transfer(url: str, dst: Path, max_bytes: int, session: requests.Session,
              redirects: int = 3) -> None:
    current = url
    dst.parent.mkdir(parents=True, exist_ok=True)
    headers = {"User-Agent": "vidsavey-downloader/1.0", "Accept": "*/*"}
    for _ in range(redirects + 1):
        parsed = urlsplit(current)
        if parsed.scheme != "https" or not parsed.hostname or parsed.username \
                or parsed.password or parsed.port not in (None, 443):
            raise ProviderFailure("transfer", "unsafe_url",
                                  "HTTPS public media URL required", kind="permanent")
        if _URRLIB3_PINNING:
            resp = _pinned_get(current, headers, max_bytes)
            status = resp.status
            location = resp.headers.get("Location")
        else:  # legacy path
            raw = _requests_get(current, headers, session, max_bytes)
            status = raw.status_code
            location = raw.headers.get("Location")
        if status in (301, 302, 303, 307, 308):
            try:
                resp.close()
            except Exception:
                pass
            if not location:
                raise ProviderFailure("transfer", "bad_redirect", "Missing Location")
            current = urljoin(current, location)
            continue
        total = 0
        tmp = dst.with_name(dst.name + ".part")
        try:
            with tmp.open("wb") as fh:
                if _URRLIB3_PINNING:
                    try:
                        for chunk in resp.stream(1024 * 1024):
                            if not chunk:
                                continue
                            total += len(chunk)
                            if total > max_bytes:
                                raise ProviderFailure("transfer", "video_too_large",
                                                      "Exceeded VIDSAVEY max file size",
                                                      kind="permanent")
                            fh.write(chunk)
                    finally:
                        try:
                            resp.close()
                        except Exception:
                            pass
                else:
                    with raw:
                        for chunk in raw.iter_content(chunk_size=1024 * 1024):
                            if not chunk:
                                continue
                            total += len(chunk)
                            if total > max_bytes:
                                raise ProviderFailure("transfer", "video_too_large",
                                                      "Exceeded VIDSAVEY max file size",
                                                      kind="permanent")
                            fh.write(chunk)
            if total <= 0:
                raise ProviderFailure("transfer", "empty_file",
                                      "Supplier delivered an empty media file")
            os.replace(tmp, dst)
        finally:
            tmp.unlink(missing_ok=True)
        return
    raise ProviderFailure("transfer", "redirect_limit", "Too many redirects", kind="permanent")


class VidFetchProvider:
    def __init__(self, api_key: str, session: requests.Session | None = None,
                 api_base: str = "https://api.vidfetch.dev", timeout_seconds: int = 300):
        self.key = api_key
        self.session = session or requests.Session()
        self.base = api_base.rstrip("/")
        self.timeout = timeout_seconds

    def _headers(self) -> dict[str, str]:
        return {"Authorization": "Bearer " + self.key, "Content-Type": "application/json"}

    def _json(self, method: str, endpoint: str, **kwargs) -> dict:
        try:
            resp = self.session.request(method, self.base + endpoint,
                                        headers=self._headers(), timeout=(10, 40), **kwargs)
        except requests.RequestException as exc:
            raise ProviderFailure("vidfetch", "network_error", type(exc).__name__) from exc
        if resp.status_code >= 400:
            err = _read_error(resp)
            kind = "permanent" if err in PERMANENT_VIDFETCH_CODES else "recoverable"
            raise ProviderFailure("vidfetch", err, "VidFetch request failed", kind=kind)
        try:
            data = resp.json()
            if not isinstance(data, dict):
                raise ValueError("not object")
            return data
        except ValueError as exc:
            raise ProviderFailure("vidfetch", "invalid_response",
                                  "Unexpected JSON response") from exc

    def free_info(self, youtube_url: str) -> dict:
        """Official POST /v1/info; use for free metadata lookup / preflight."""
        return self._json("POST", "/v1/info", json={"url": youtube_url})

    def poll(self, job_id: str) -> dict:
        """Re-check an existing upstream job (P0-1/P0-3 reconciliation)."""
        return self._json("GET", "/v1/downloads/" + job_id)

    def _create_job(self, url: str, fmt: str) -> dict:
        """POST /v1/downloads. A network failure here is UNCERTAIN: the
        request may have reached VidFetch and a paid job may exist, so we
        must never fall back to another paid provider in this state (P0-1)."""
        try:
            resp = self.session.request(
                "POST", self.base + "/v1/downloads", headers=self._headers(),
                json={"url": url, "format": fmt}, timeout=(10, 40))
        except requests.RequestException as exc:
            raise ProviderFailure("vidfetch", "create_job_unknown",
                                  "Could not confirm whether the paid job was created",
                                  kind="uncertain") from exc
        if resp.status_code >= 400:
            err = _read_error(resp)
            kind = "permanent" if err in PERMANENT_VIDFETCH_CODES else "recoverable"
            raise ProviderFailure("vidfetch", err, "VidFetch job creation failed", kind=kind)
        try:
            job = resp.json()
            if not isinstance(job, dict):
                raise ValueError("not object")
            return job
        except ValueError as exc:
            # Unknown whether the job was created -> uncertain.
            raise ProviderFailure("vidfetch", "create_job_unknown",
                                  "Unparseable response for job creation",
                                  kind="uncertain") from exc

    @staticmethod
    def _job_failure(job: dict) -> ProviderFailure | None:
        status = job.get("status")
        if status in ("completed", "success"):
            return None
        if status in ("failed", "cancelled", "expired"):
            failure = job.get("error") or {}
            code = (failure.get("code") if isinstance(failure, dict) else None) or "download_failed"
            kind = "permanent" if code in PERMANENT_VIDFETCH_CODES else "recoverable"
            return ProviderFailure("vidfetch", code, "Upstream download failed", kind=kind)
        return None

    def _fetch_completed(self, job: dict, format: str, output: Path,
                         max_bytes: int) -> DownloadResult:
        dl_url = job.get("download_url")
        if not isinstance(dl_url, str) or not dl_url:
            raise ProviderFailure("vidfetch", "invalid_response",
                                  "Completed job without download URL")
        dst = output.with_suffix(".mp3" if format == "mp3" else ".mp4")
        try:
            _transfer(dl_url, dst, max_bytes, self.session)
        except ProviderFailure as exc:
            # P0-3: the paid file exists; a stale/expired signed URL is the
            # most likely cause. Re-fetch the job for a fresh URL instead of
            # creating another paid task.
            job_id = job.get("id")
            if isinstance(job_id, str) and job_id and exc.code.startswith("http_"):
                for _ in range(2):
                    time.sleep(2)
                    refreshed = self.poll(job_id)
                    if self._job_failure(refreshed) is None:
                        dl_url = refreshed.get("download_url")
                        if isinstance(dl_url, str) and dl_url:
                            try:
                                _transfer(dl_url, dst, max_bytes, self.session)
                                return DownloadResult("vidfetch", dst, dst.suffix[1:], job_id)
                            except ProviderFailure:
                                continue
            # Still failing: uncertain paid state; do not bill twice.
            raise ProviderFailure("vidfetch", "transfer_failed",
                                  "Upstream file could not be retrieved",
                                  kind="uncertain") from exc
        return DownloadResult("vidfetch", dst, dst.suffix[1:], job.get("id"))

    def download(self, url: str, format: str, output: Path,
                 max_bytes: int = 1024 * 1024 * 1024) -> DownloadResult:
        fmt = "mp3" if format == "mp3" else "1080p"
        job = self._create_job(url, fmt)
        job_id = job.get("id")
        if not isinstance(job_id, str) or not job_id:
            raise ProviderFailure("vidfetch", "invalid_response", "Missing download job id")
        deadline = time.monotonic() + self.timeout
        while time.monotonic() < deadline:
            failure = self._job_failure(job)
            if failure is not None:
                raise failure
            if job.get("status") in ("completed", "success"):
                return self._fetch_completed(job, format, output, max_bytes)
            time.sleep(2)
            try:
                job = self.poll(job_id)
            except ProviderFailure as exc:
                if exc.kind == "permanent":
                    raise
                # Status query failed mid-flight: the job still exists and we
                # cannot know its state -> uncertain, never re-submit (P0-1).
                raise ProviderFailure("vidfetch", "status_unknown",
                                      "Upstream job state could not be confirmed",
                                      kind="uncertain") from exc
        raise ProviderFailure("vidfetch", "job_timeout",
                              "Upstream job is still processing", kind="uncertain")


class SnapAnyProvider:
    ENDPOINT = "https://api.snapany.com/openapi/v1/youtube/proxy-download"

    def __init__(self, api_key: str, session: requests.Session | None = None,
                 ffmpeg: str = "ffmpeg"):
        self.key = api_key
        self.session = session or requests.Session()
        self.ffmpeg = ffmpeg

    def _post_extract(self, endpoint: str, url: str) -> dict:
        try:
            resp = self.session.post(endpoint,
                                     headers={"Authorization": "Bearer " + self.key,
                                              "Content-Type": "application/json"},
                                     json={"url": url}, timeout=(10, 70))
        except requests.RequestException as exc:
            # Unknown whether the extraction (and its credits) was consumed.
            raise ProviderFailure("snapany", "network_error", type(exc).__name__,
                                  kind="uncertain") from exc
        if resp.status_code >= 400:
            code = _read_error(resp)
            raise ProviderFailure("snapany", code, "SnapAny extraction failed")
        try:
            post = resp.json()
            medias = post["medias"]
            if not isinstance(medias, list):
                raise ValueError("medias not a list")
            return post
        except (ValueError, KeyError, TypeError) as exc:
            raise ProviderFailure("snapany", "invalid_response",
                                  "Missing medias") from exc

    @staticmethod
    def _best_video(medias: list) -> tuple[str, int | None]:
        """Return (proxy_url, quality) for the best <=1080p proxy video."""
        for entry in medias:
            if not isinstance(entry, dict) or entry.get("media_type") != "video":
                continue
            variants = [v for v in entry.get("variants", []) if isinstance(v, dict)]
            choices = []
            for v in variants:
                q = v.get("quality")
                quality = int(q) if isinstance(q, (int, float, str)) and str(q).isdigit() else None
                url = v.get("video_proxy_url") or v.get("resource_proxy_url")
                if url and (quality is None or quality <= 1080):
                    choices.append((url, quality or 0))
            direct = entry.get("resource_proxy_url")
            if direct:
                choices.append((direct, 0))
            if choices:
                return max(choices, key=lambda item: item[1])
        raise ProviderFailure("snapany", "no_proxy_video",
                              "No 1080p-or-lower proxy URL available")

    @staticmethod
    def _best_audio(medias: list) -> str:
        for entry in medias:
            if not isinstance(entry, dict):
                continue
            if entry.get("media_type") == "audio":
                url = entry.get("resource_proxy_url") or entry.get("audio_proxy_url")
                if url:
                    return url
            variants = [v for v in entry.get("variants", []) if isinstance(v, dict)]
            for v in variants:
                if v.get("audio_proxy_url"):
                    return v["audio_proxy_url"]
        raise ProviderFailure("snapany", "no_proxy_audio", "No proxy audio available")

    def _run_ffmpeg(self, args: list[str], error_code: str) -> None:
        try:
            subprocess.run([self.ffmpeg, "-hide_banner", "-loglevel", "error", "-nostdin",
                            "-y", *args], timeout=240, check=True, capture_output=True)
        except (OSError, subprocess.SubprocessError) as exc:
            raise ProviderFailure("snapany", error_code, "FFmpeg processing failed") from exc

    def _materialize(self, medias: list, format: str, output: Path,
                     max_bytes: int) -> Path:
        output.parent.mkdir(parents=True, exist_ok=True)
        if format == "mp3":
            source = output.with_name(output.name + "_audio.m4a")
            dst = output.with_suffix(".mp3")
            _transfer(self._best_audio(medias), source, max_bytes, self.session)
            try:
                self._run_ffmpeg(["-i", str(source), "-vn", "-codec:a", "libmp3lame",
                                  "-b:a", "192k", str(dst)], "transcode_failed")
            finally:
                source.unlink(missing_ok=True)
        else:
            video_url, _quality = self._best_video(medias)
            video_dst = output.with_name(output.name + "_video.mp4")
            dst = output.with_suffix(".mp4")
            try:
                _transfer(video_url, video_dst, max_bytes, self.session)
                try:
                    audio_url = self._best_audio(medias)
                    audio_dst = output.with_name(output.name + "_audio.m4a")
                    try:
                        _transfer(audio_url, audio_dst, max_bytes, self.session)
                        self._run_ffmpeg(["-i", str(video_dst), "-i", str(audio_dst),
                                          "-map", "0:v:0", "-map", "1:a:0", "-c", "copy",
                                          "-movflags", "+faststart", str(dst)], "merge_failed")
                    finally:
                        audio_dst.unlink(missing_ok=True)
                except ProviderFailure as exc:
                    if exc.code in ("merge_failed", "transcode_failed"):
                        raise
                    # No audio stream available: keep video-only output.
                    os.replace(video_dst, dst)
            finally:
                video_dst.unlink(missing_ok=True)
        if not dst.exists() or dst.stat().st_size <= 0:
            raise ProviderFailure("snapany", "empty_file", "Merged output is missing")
        if dst.stat().st_size > max_bytes:
            raise ProviderFailure("snapany", "video_too_large", "Video exceeds size limit",
                                  kind="permanent")
        return dst

    def download(self, url: str, format: str, output: Path,
                 max_bytes: int = 1024 * 1024 * 1024) -> DownloadResult:
        post = self._post_extract(self.ENDPOINT, url)
        dst = self._materialize(post["medias"], format, output, max_bytes)
        return DownloadResult("snapany", dst, dst.suffix[1:], post.get("id"))


class SnapAnyExtractProvider(SnapAnyProvider):
    """Generic SnapAny extractor (e.g. Bilibili) via /openapi/v1/extract/post.

    UNVERIFIED against real Bilibili responses until an API key is available;
    gated behind BILIBILI_SNAPANY_FALLBACK_ENABLED and must never be claimed
    as supported before a live test succeeds.
    """

    ENDPOINT = "https://api.snapany.com/openapi/v1/extract/post"

    def extract(self, url: str) -> dict:
        """Return {'title': ..., 'medias': [...]} for metadata/preflight."""
        post = self._post_extract(self.ENDPOINT, url)
        return {"title": post.get("title"), "medias": post.get("medias", [])}


class YouTubeDownloadRouter:
    def __init__(self, vidfetch_key: str | None, snapany_key: str | None,
                 session: requests.Session | None = None, ffmpeg: str = "ffmpeg"):
        self.session = session or requests.Session()
        self.primary = VidFetchProvider(vidfetch_key, self.session) if vidfetch_key else None
        self.backup = SnapAnyProvider(snapany_key, self.session, ffmpeg) if snapany_key else None

    def download(self, url: str, format: str, output: Path,
                 max_bytes: int = 1024 * 1024 * 1024) -> DownloadResult:
        if format not in ("mp4", "mp3"):
            raise ProviderFailure("router", "unsupported_format",
                                  "Use existing subtitle route for captions", kind="permanent")
        normalized = canonical_youtube_url(url)
        primary_error = None
        if self.primary:
            try:
                return self.primary.download(normalized, format, output, max_bytes)
            except ProviderFailure as exc:
                primary_error = exc
                if not exc.fallback_allowed:
                    raise
        if self.backup:
            return self.backup.download(normalized, format, output, max_bytes)
        if primary_error:
            raise primary_error
        raise ProviderFailure("router", "provider_not_configured",
                              "No YouTube API keys configured", kind="permanent")
