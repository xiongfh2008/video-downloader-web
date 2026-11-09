from pathlib import Path
import pytest
from vidsavey_bridge.providers import YouTubeDownloadRouter, ProviderFailure, canonical_youtube_url


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
