"""VidFetch-primary / SnapAny-fallback YouTube downloader.

Synchronous worker-oriented reference adapter. Use in the existing VIDSAVEY
background worker, NOT inside a FastAPI request handler. Responses are
materialized as files to preserve the existing /api/video/file/{task_id} API.
"""
from __future__ import annotations

import ipaddress
import os
import socket
import subprocess
import time
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlsplit

import requests


class ProviderFailure(Exception):
    def __init__(self, provider: str, code: str, message: str, fallback_allowed: bool = True):
        super().__init__(f"{provider}: {code}: {message}")
        self.provider=provider
        self.code=code
        self.fallback_allowed=fallback_allowed


@dataclass(frozen=True)
class DownloadResult:
    provider: str
    file_path: Path
    extension: str
    upstream_id: str | None = None


def canonical_youtube_url(raw: str) -> str:
    try:
        parsed=urlsplit(raw)
        host=(parsed.hostname or "").lower()
        if parsed.scheme != "https" or parsed.username or parsed.password or parsed.port not in (None,443):
            raise ValueError("invalid URL")
        if host in ("youtube.com","www.youtube.com","m.youtube.com","music.youtube.com"):
            # Keep only strict watch or Shorts URLs to avoid arbitrary redirects.
            from urllib.parse import parse_qs
            if parsed.path == "/watch":
                vid=parse_qs(parsed.query).get("v",[""])[0]
            elif parsed.path.startswith("/shorts/"):
                vid=parsed.path.split("/")[2]
            else:
                raise ValueError("unsupported YouTube URL")
        elif host == "youtu.be":
            vid=parsed.path.strip("/")
        else:
            raise ValueError("unsupported host")
        if len(vid) != 11 or not all(c.isascii() and (c.isalnum() or c in "-_" ) for c in vid):
            raise ValueError("invalid video id")
        return "https://www.youtube.com/watch?v=" + vid
    except (ValueError, AttributeError) as exc:
        raise ProviderFailure("router","invalid_url","Not a supported public YouTube video URL",False) from exc


def _read_error(resp: requests.Response) -> str:
    try:
        j=resp.json()
        if isinstance(j,dict):
            return str(j.get("code") or j.get("error",{}).get("code") or j.get("detail") or resp.status_code)[:120]
    except (ValueError, AttributeError):
        pass
    return "http_"+str(resp.status_code)


def _valid_remote_url(url: str) -> None:
    """Defense in depth; retain the existing host-level SSRF egress firewall."""
    parsed=urlsplit(url)
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password or parsed.port not in (None,443):
        raise ProviderFailure("transfer","unsafe_url","HTTPS public media URL required",False)
    try:
        addresses=socket.getaddrinfo(parsed.hostname,443,type=socket.SOCK_STREAM)
        if not addresses or any(not ipaddress.ip_address(x[4][0]).is_global for x in addresses):
            raise ValueError("private or reserved resolution")
    except (OSError, ValueError) as exc:
        raise ProviderFailure("transfer","unsafe_url","Media URL resolved to a restricted address",False) from exc


def _transfer(url: str, dst: Path, max_bytes: int, session: requests.Session, redirects: int = 3) -> None:
    current=url
    dst.parent.mkdir(parents=True,exist_ok=True)
    for _ in range(redirects+1):
        _valid_remote_url(current)
        try:
            with session.get(current,stream=True,timeout=(10,90),allow_redirects=False) as resp:
                if resp.status_code in (301,302,303,307,308):
                    from urllib.parse import urljoin
                    location=resp.headers.get("Location")
                    if not location:
                        raise ProviderFailure("transfer","bad_redirect","Missing Location")
                    current=urljoin(current,location)
                    continue
                if resp.status_code >= 400:
                    raise ProviderFailure("transfer","http_"+str(resp.status_code),"Signed or proxy media link failed")
                expected=resp.headers.get("Content-Length")
                if expected and int(expected)>max_bytes:
                    raise ProviderFailure("transfer","video_too_large","Exceeded VIDSAVEY max file size",False)
                total=0
                tmp=dst.with_name(dst.name+".part")
                try:
                    with tmp.open("wb") as fh:
                        for chunk in resp.iter_content(chunk_size=1024*1024):
                            if not chunk:
                                continue
                            total+=len(chunk)
                            if total>max_bytes:
                                raise ProviderFailure("transfer","video_too_large","Exceeded VIDSAVEY max file size",False)
                            fh.write(chunk)
                    if total<=0:
                        raise ProviderFailure("transfer","empty_file","Supplier delivered an empty media file")
                    os.replace(tmp,dst)
                finally:
                    tmp.unlink(missing_ok=True)
                return
        except requests.RequestException as exc:
            raise ProviderFailure("transfer","network_error",str(type(exc).__name__)) from exc
    raise ProviderFailure("transfer","redirect_limit","Too many redirects",False)


class VidFetchProvider:
    def __init__(self, api_key: str, session: requests.Session | None = None,
                 api_base: str = "https://api.vidfetch.dev", timeout_seconds: int = 300):
        self.key=api_key
        self.session=session or requests.Session()
        self.base=api_base.rstrip("/")
        self.timeout=timeout_seconds

    def _headers(self) -> dict[str,str]:
        return {"Authorization":"Bearer "+self.key,"Content-Type":"application/json"}

    def _json(self, method: str, endpoint: str, **kwargs) -> dict:
        try:
            resp=self.session.request(method,self.base+endpoint,headers=self._headers(),timeout=(10,40),**kwargs)
        except requests.RequestException as exc:
            raise ProviderFailure("vidfetch","network_error",str(type(exc).__name__)) from exc
        if resp.status_code >= 400:
            err=_read_error(resp)
            # No value in shifting permanent video/format errors to SnapAny.
            permanent=err in {"video_unavailable","invalid_format","invalid_url","private_video","age_restricted"}
            raise ProviderFailure("vidfetch",err,"VidFetch request failed",not permanent)
        try:
            data=resp.json()
            if not isinstance(data,dict):
                raise ValueError("not object")
            return data
        except ValueError as exc:
            raise ProviderFailure("vidfetch","invalid_response","Unexpected JSON response") from exc

    def free_info(self, youtube_url: str) -> dict:
        """Official POST /v1/info; use for free metadata lookup / preflight."""
        return self._json("POST","/v1/info",json={"url":youtube_url})

    def download(self,url: str,format: str,output:Path,max_bytes:int=1024*1024*1024) -> DownloadResult:
        fmt="mp3" if format=="mp3" else "1080p"
        job=self._json("POST","/v1/downloads",json={"url":url,"format":fmt})
        job_id=job.get("id")
        if not isinstance(job_id,str) or not job_id:
            raise ProviderFailure("vidfetch","invalid_response","Missing download job id")
        deadline=time.monotonic()+self.timeout
        while time.monotonic()<deadline:
            status=job.get("status")
            if status in ("completed","success"):
                dl_url=job.get("download_url")
                if not isinstance(dl_url,str) or not dl_url:
                    raise ProviderFailure("vidfetch","invalid_response","Completed job without download URL")
                dst=output.with_suffix(".mp3" if format=="mp3" else ".mp4")
                _transfer(dl_url,dst,max_bytes,self.session)
                return DownloadResult("vidfetch",dst,dst.suffix[1:],job_id)
            if status in ("failed","cancelled","expired"):
                failure=job.get("error") or {}
                code=(failure.get("code") if isinstance(failure,dict) else None) or "download_failed"
                permanent=code in {"video_unavailable","format_unavailable","invalid_format"}
                raise ProviderFailure("vidfetch",code,"Upstream download failed",not permanent)
            time.sleep(2)
            job=self._json("GET","/v1/downloads/"+job_id)
        # Timeout is uncertain: upstream may still be running/billing. Do not
        # automatically submit a second paid job to SnapAny in this state.
        raise ProviderFailure("vidfetch","job_timeout","Upstream job is still processing",False)


class SnapAnyProvider:
    ENDPOINT="https://api.snapany.com/openapi/v1/youtube/proxy-download"
    def __init__(self, api_key: str, session: requests.Session | None = None, ffmpeg: str = "ffmpeg"):
        self.key=api_key
        self.session=session or requests.Session()
        self.ffmpeg=ffmpeg

    def download(self,url:str,format:str,output:Path,max_bytes:int=1024*1024*1024) -> DownloadResult:
        try:
            resp=self.session.post(self.ENDPOINT,headers={"Authorization":"Bearer "+self.key,
                "Content-Type":"application/json"},json={"url":url},timeout=(10,70))
        except requests.RequestException as exc:
            raise ProviderFailure("snapany","network_error",str(type(exc).__name__),False) from exc
        if resp.status_code >= 400:
            code=_read_error(resp)
            raise ProviderFailure("snapany",code,"SnapAny extraction failed",False)
        try:
            post=resp.json()
            medias=post["medias"]
        except (ValueError,KeyError,TypeError) as exc:
            raise ProviderFailure("snapany","invalid_response","Missing medias",False) from exc
        output.parent.mkdir(parents=True,exist_ok=True)
        try:
            if format=="mp3":
                audio=next(x for x in medias if x.get("media_type")=="audio")
                audio_url=audio.get("resource_proxy_url") or next(
                    (x.get("audio_proxy_url") for x in audio.get("variants",[]) if x.get("audio_proxy_url")),None)
                if not audio_url:
                    raise ProviderFailure("snapany","no_proxy_audio","No proxy audio available",False)
                source=output.with_name(output.name+"_audio.m4a")
                dst=output.with_suffix(".mp3")
                _transfer(audio_url,source,max_bytes,self.session)
                try:
                    subprocess.run([self.ffmpeg,"-hide_banner","-loglevel","error","-nostdin","-y",
                                    "-i",str(source),"-vn","-codec:a","libmp3lame","-b:a","192k",str(dst)],
                                   timeout=240,check=True,capture_output=True)
                except (OSError,subprocess.SubprocessError) as exc:
                    raise ProviderFailure("snapany","transcode_failed","MP3 conversion failed",False) from exc
                finally:
                    source.unlink(missing_ok=True)
            else:
                video=next(x for x in medias if x.get("media_type")=="video")
                choices=[x for x in video.get("variants",[]) if x.get("video_proxy_url")
                         and int(x.get("quality") or 0)<=1080]
                if not choices:
                    direct=video.get("resource_proxy_url")
                    if not direct:
                        raise ProviderFailure("snapany","no_proxy_video","No 1080p-or-lower proxy URL",False)
                    dst=output.with_suffix(".mp4")
                    _transfer(direct,dst,max_bytes,self.session)
                else:
                    choice=max(choices,key=lambda x:int(x.get("quality") or 0))
                    video_dst=output.with_name(output.name+"_video.mp4")
                    dst=output.with_suffix(".mp4")
                    _transfer(choice["video_proxy_url"],video_dst,max_bytes,self.session)
                    audio_url=choice.get("audio_proxy_url")
                    if audio_url:
                        audio_dst=output.with_name(output.name+"_audio.m4a")
                        _transfer(audio_url,audio_dst,max_bytes,self.session)
                        try:
                            subprocess.run([self.ffmpeg,"-hide_banner","-loglevel","error","-nostdin","-y",
                                "-i",str(video_dst),"-i",str(audio_dst),"-map","0:v:0","-map","1:a:0",
                                "-c","copy","-movflags","+faststart",str(dst)],
                                timeout=240,check=True,capture_output=True)
                        except (OSError,subprocess.SubprocessError) as exc:
                            raise ProviderFailure("snapany","merge_failed","MP4 stream merge failed",False) from exc
                        finally:
                            audio_dst.unlink(missing_ok=True)
                            video_dst.unlink(missing_ok=True)
                    else:
                        os.replace(video_dst,dst)
            if dst.stat().st_size > max_bytes:
                raise ProviderFailure("snapany","video_too_large","Video exceeds size limit",False)
            return DownloadResult("snapany",dst,dst.suffix[1:],post.get("id"))
        except (StopIteration,KeyError,TypeError,ValueError) as exc:
            raise ProviderFailure("snapany","invalid_response","No suitable media stream",False) from exc


class YouTubeDownloadRouter:
    def __init__(self,vidfetch_key:str|None,snapany_key:str|None,
                 session:requests.Session|None=None,ffmpeg:str="ffmpeg"):
        self.session=session or requests.Session()
        self.primary=VidFetchProvider(vidfetch_key,self.session) if vidfetch_key else None
        self.backup=SnapAnyProvider(snapany_key,self.session,ffmpeg) if snapany_key else None

    def download(self,url:str,format:str,output:Path,max_bytes:int=1024*1024*1024) -> DownloadResult:
        if format not in ("mp4","mp3"):
            raise ProviderFailure("router","unsupported_format","Use existing subtitle route for captions",False)
        normalized=canonical_youtube_url(url)
        primary_error=None
        if self.primary:
            try:
                return self.primary.download(normalized,format,output,max_bytes)
            except ProviderFailure as exc:
                primary_error=exc
                if not exc.fallback_allowed:
                    raise
        if self.backup:
            return self.backup.download(normalized,format,output,max_bytes)
        if primary_error:
            raise primary_error
        raise ProviderFailure("router","provider_not_configured","No YouTube API keys configured",False)
