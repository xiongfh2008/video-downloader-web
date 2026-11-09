from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone, timedelta
import uuid
import pytest

from vidsavey_bridge.quota import (DailyDownloadQuota,QuotaExceeded,
    create_signed_browser_cookie,verify_signed_browser_cookie)

SECRET="A secure randomly generated local development key 12345"
IP1="8.8.8.8"
IP2="1.1.1.1"


def new_id():
    return uuid.uuid4().hex


def test_browser_and_ip_independent(tmp_path):
    store=DailyDownloadQuota(str(tmp_path/"q.sqlite3"),SECRET)
    a=create_signed_browser_cookie(SECRET)
    b=create_signed_browser_cookie(SECRET)
    for _ in range(2):
        rid=new_id()
        assert store.reserve(rid,a,IP1).status=="reserved"
        assert store.finish(rid,True)
    with pytest.raises(QuotaExceeded) as x:
        store.reserve(new_id(),a,IP2)
    assert x.value.code=="daily_browser_limit"
    with pytest.raises(QuotaExceeded) as x:
        store.reserve(new_id(),b,IP1)
    assert x.value.code=="daily_ip_limit"
    assert store.reserve(new_id(),b,IP2).status=="reserved"


def test_failed_tasks_release_both_slots(tmp_path):
    store=DailyDownloadQuota(str(tmp_path/"q.sqlite3"),SECRET)
    b=create_signed_browser_cookie(SECRET)
    rid=new_id()
    store.reserve(rid,b,IP1)
    assert store.remaining(b,IP1)==1
    assert store.finish(rid,False)
    assert store.remaining(b,IP1)==2
    assert not store.finish(rid,False)


def test_idempotent_reservations_and_task_binding(tmp_path):
    store=DailyDownloadQuota(str(tmp_path/"q.sqlite3"),SECRET)
    cookie=create_signed_browser_cookie(SECRET)
    rid=new_id()
    assert not store.reserve(rid,cookie,IP1).existing
    store.attach_task(rid,"TASK-123")
    again=store.reserve(rid,cookie,IP1)
    assert again.existing and again.task_id=="TASK-123"
    assert store.remaining(cookie,IP1)==1
    store.finish(rid,True)
    assert store.remaining(cookie,IP1)==1
    assert store.reserve(rid,cookie,IP1).status=="charged"


def test_utc_reset(tmp_path):
    store=DailyDownloadQuota(str(tmp_path/"q.sqlite3"),SECRET)
    cookie=create_signed_browser_cookie(SECRET)
    before=datetime(2026,11,9,23,59,tzinfo=timezone.utc)
    after=before+timedelta(minutes=2)
    for _ in range(2):
        rid=new_id();store.reserve(rid,cookie,IP1,now=before);store.finish(rid,True)
    assert store.remaining(cookie,IP1,now=before)==0
    assert store.remaining(cookie,IP1,now=after)==2


def test_racing_requests_cannot_bypass(tmp_path):
    store=DailyDownloadQuota(str(tmp_path/"q.sqlite3"),SECRET)
    cookie=create_signed_browser_cookie(SECRET)
    def worker(_):
        try:
            store.reserve(new_id(),cookie,IP1)
            return "accepted"
        except QuotaExceeded:
            return "blocked"
    with ThreadPoolExecutor(max_workers=10) as executor:
        results=list(executor.map(worker,range(10)))
    assert results.count("accepted")==2
    assert results.count("blocked")==8


def test_browser_cookie_tampering(tmp_path):
    cookie=create_signed_browser_cookie(SECRET)
    assert verify_signed_browser_cookie(SECRET,cookie)
    assert not verify_signed_browser_cookie(SECRET,cookie+"x")


def test_reverse_proxy_misconfiguration_is_detected(tmp_path):
    store=DailyDownloadQuota(str(tmp_path/"q.sqlite3"),SECRET)
    cookie=create_signed_browser_cookie(SECRET)
    with pytest.raises(ValueError,match="client IP is not public"):
        store.reserve(new_id(),cookie,"127.0.0.1")
