from pathlib import Path
import pytest
import requests
from vidsavey_bridge.providers import (
    YouTubeDownloadRouter, ProviderFailure, canonical_youtube_url,
    VidFetchProvider, SnapAnyExtractProvider, _transfer, _URRLIB3_PINNING,
)


def test_youtube_url_normalization():
    assert canonical_youtube_url("https://youtu.be/Bcj8Ux1vAQQ") == "https://www.youtube.com/watch?v=Bcj8Ux1vAQQ"
    assert canonical_youtube_url("https://www.youtube.com/shorts/Bcj8Ux1vAQQ") == "https://www.youtube.com/watch?v=Bcj8Ux1vAQQ"
    for u in ("https://evil.test/", "http://youtu.be/Bcj8Ux1vAQQ", "https://youtu.be/Bcj8Ux1vAQQ.evil.test/"):
        with pytest.raises(ProviderFailure):
            canonical_youtube_url(u)


def test_primary_first_and_fallback(monkeypatch,tmp_path):
    router=YouTubeDownloadRouter("fake-vidfetch","fake-snapany")
    calls=[]
    def primary(*args):
        calls.append("vidfetch")
        raise ProviderFailure("vidfetch","quota_exceeded","No free quota")
    def secondary(*args):
        calls.append("snapany")
        return "completed"
    monkeypatch.setattr(router.primary,"download",primary)
    monkeypatch.setattr(router.backup,"download",secondary)
    assert router.download("https://youtu.be/Bcj8Ux1vAQQ","mp4",tmp_path/"result")=="completed"
    assert calls==["vidfetch","snapany"]


def test_no_double_bill_when_primary_uncertain(monkeypatch,tmp_path):
    router=YouTubeDownloadRouter("fake-vidfetch","fake-snapany")
    called=[]
    def primary(*args):
        raise ProviderFailure("vidfetch","job_timeout","Job may continue upstream",False)
    def secondary(*args):
        called.append(True)
    monkeypatch.setattr(router.primary,"download",primary)
    monkeypatch.setattr(router.backup,"download",secondary)
    with pytest.raises(ProviderFailure,match="job_timeout"):
        router.download("https://youtu.be/Bcj8Ux1vAQQ","mp3",tmp_path/"result")
    assert not called


def test_subtitles_are_not_sent_to_paid_video_api(tmp_path):
    router=YouTubeDownloadRouter("fake-vidfetch","fake-snapany")
    with pytest.raises(ProviderFailure,match="unsupported_format"):
        router.download("https://youtu.be/Bcj8Ux1vAQQ","srt",tmp_path/"result")


# --- P0-1: job creation with unknown outcome must never trigger fallback ---

def test_create_job_network_timeout_is_uncertain_no_fallback(monkeypatch,tmp_path):
    router=YouTubeDownloadRouter("fake-vidfetch","fake-snapany")
    def fail_post(*args,**kwargs):
        raise requests.ConnectionError("upstream timeout")
    monkeypatch.setattr(router.primary.session,"request",fail_post)
    called=[]
    monkeypatch.setattr(router.backup,"download",lambda *a,**k: called.append(True))
    with pytest.raises(ProviderFailure,match="create_job_unknown"):
        router.download("https://youtu.be/Bcj8Ux1vAQQ","mp4",tmp_path/"out")
    assert not called


def test_status_query_failure_midflight_is_uncertain(monkeypatch,tmp_path):
    router=YouTubeDownloadRouter("fake-vidfetch","fake-snapany")
    def created(*args,**kwargs):
        return {"id":"job-1","status":"queued"}
    def poll_fails(job_id):
        # poll() normally wraps transport errors as recoverable failures
        raise ProviderFailure("vidfetch","network_error","poll dropped")
    monkeypatch.setattr(router.primary,"_create_job",created)
    monkeypatch.setattr(router.primary,"poll",poll_fails)
    called=[]
    monkeypatch.setattr(router.backup,"download",lambda *a,**k: called.append(True))
    with pytest.raises(ProviderFailure,match="status_unknown"):
        router.download("https://youtu.be/Bcj8Ux1vAQQ","mp4",tmp_path/"out")
    assert not called


# --- P0-3: signed-URL transfer failure -> refresh job, never re-create task ---

def test_transfer_failure_recovers_with_fresh_url(monkeypatch,tmp_path):
    provider=VidFetchProvider("fake-key")
    job={"id":"job-1","status":"completed","download_url":"https://media.example/stale"}
    attempts=[]
    def fake_transfer(url,dst,max_bytes,session):
        attempts.append(url)
        if url.endswith("stale"):
            raise ProviderFailure("vidfetch","http_403","signed url expired",kind="recoverable")
        dst.write_bytes(b"mp4data")
    monkeypatch.setattr("vidsavey_bridge.providers._transfer",fake_transfer)
    monkeypatch.setattr(provider,"poll",lambda job_id: {"id":job_id,"status":"completed",
                                                        "download_url":"https://media.example/fresh"})
    result=provider._fetch_completed(job,"mp4",tmp_path/"result",1024*1024)
    assert attempts==["https://media.example/stale","https://media.example/fresh"]
    assert result.provider=="vidfetch" and result.extension=="mp4"


def test_transfer_failure_after_refresh_is_uncertain(monkeypatch,tmp_path):
    provider=VidFetchProvider("fake-key")
    job={"id":"job-1","status":"completed","download_url":"https://media.example/stale"}
    def always_fail(url,dst,max_bytes,session):
        raise ProviderFailure("vidfetch","http_403","signed url expired",kind="recoverable")
    monkeypatch.setattr("vidsavey_bridge.providers._transfer",always_fail)
    monkeypatch.setattr(provider,"poll",lambda job_id: {"id":job_id,"status":"completed",
                                                        "download_url":"https://media.example/fresh"})
    monkeypatch.setattr("vidsavey_bridge.providers.time.sleep",lambda s: None)
    with pytest.raises(ProviderFailure) as excinfo:
        provider._fetch_completed(job,"mp4",tmp_path/"result",1024*1024)
    assert excinfo.value.kind=="uncertain"


# --- P0-7: error classification ---

def test_error_classification(monkeypatch,tmp_path):
    provider=VidFetchProvider("fake-key")
    # recoverable: VidFetch auth/quota/5xx problems may be retried on SnapAny
    class Fake401:
        status_code=401
        def json(self): return {"code":"unauthorized"}
    monkeypatch.setattr(provider.session,"request",lambda *a,**k: Fake401())
    with pytest.raises(ProviderFailure) as excinfo:
        provider.free_info("https://www.youtube.com/watch?v=Bcj8Ux1vAQQ")
    assert excinfo.value.kind=="recoverable" and excinfo.value.fallback_allowed
    # permanent: video cannot be downloaded anywhere
    class Fake410:
        status_code=410
        def json(self): return {"code":"video_unavailable"}
    monkeypatch.setattr(provider.session,"request",lambda *a,**k: Fake410())
    with pytest.raises(ProviderFailure) as excinfo:
        provider.free_info("https://www.youtube.com/watch?v=Bcj8Ux1vAQQ")
    assert excinfo.value.kind=="permanent" and not excinfo.value.fallback_allowed


# --- Bilibili: SnapAny generic extractor ---

def test_snapany_extract_provider_parses_medias(monkeypatch,tmp_path):
    provider=SnapAnyExtractProvider("fake-key")
    payload={"title":"BV demo","medias":[
        {"media_type":"video","variants":[{"quality":"720","video_proxy_url":"https://p.example/v720"}]},
        {"media_type":"audio","resource_proxy_url":"https://p.example/a"},
    ]}
    monkeypatch.setattr(provider,"_post_extract",lambda endpoint,url: payload)
    def fake_transfer(url,dst,max_bytes,session):
        dst.write_bytes(b"x"*1024)
    monkeypatch.setattr("vidsavey_bridge.providers._transfer",fake_transfer)
    def fake_ffmpeg(args,code):
        from pathlib import Path as _P
        _P(args[-1]).write_bytes(b"y"*1024)
    monkeypatch.setattr(provider,"_run_ffmpeg",fake_ffmpeg)
    assert provider.extract("https://www.bilibili.com/video/BV1GJ411x7h7")["title"]=="BV demo"
    result=provider.download("https://www.bilibili.com/video/BV1GJ411x7h7","mp4",
                             tmp_path/"result",1024*1024)
    assert result.extension=="mp4" and (tmp_path/"result.mp4").exists()


# --- P0-6: SSRF / DNS pinning ---

def test_transfer_rejects_non_global_hosts(tmp_path):
    for host in ("https://127.0.0.1/f.mp4","https://169.254.169.254/latest/meta-data"):
        with pytest.raises(ProviderFailure,match="unsafe_url"):
            _transfer(host,tmp_path/"out.mp4",1024*1024,requests.Session())
    with pytest.raises(ProviderFailure,match="unsafe_url"):
        _transfer("http://transfer.example/f.mp4",tmp_path/"out.mp4",1024*1024,requests.Session())


def test_dns_pinning_available():
    # urllib3 2.x must be present so DNS cannot be re-bound between the
    # safety check and the connection.
    assert _URRLIB3_PINNING
