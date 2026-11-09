"""P0-2 / P0-5 regression tests: atomic budget submit + reconcile-then-release."""
import threading
import time as _time

import pytest

from vidsavey_bridge.budget import ProviderBudget
from vidsavey_bridge.quota import DailyDownloadQuota, create_signed_browser_cookie

SECRET = "A secure randomly generated local development key 12345"


def test_try_submit_atomic_under_concurrency(tmp_path):
    budget = ProviderBudget(str(tmp_path / "b.sqlite3"), snapany_daily_call_limit=1)
    results = []
    lock = threading.Lock()

    def worker(i):
        decision = budget.try_submit("snapany", f"req-{i}:snapany")
        with lock:
            results.append(decision)

    threads = [threading.Thread(target=worker, args=(i,)) for i in range(8)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    assert len([r for r in results if r.allowed]) == 1
    assert budget.snapshot()["providers"]["snapany"]["calls_today"] == 1


def test_try_submit_idempotent_per_task(tmp_path):
    budget = ProviderBudget(str(tmp_path / "b.sqlite3"), snapany_daily_call_limit=1)
    assert budget.try_submit("snapany", "req-1:snapany").allowed
    for _ in range(3):
        assert budget.try_submit("snapany", "req-1:snapany").allowed
    assert budget.snapshot()["providers"]["snapany"]["calls_today"] == 1


def test_try_submit_respects_daily_cost_cap(tmp_path):
    budget = ProviderBudget(str(tmp_path / "b.sqlite3"), daily_cost_limit_usd=0.05)
    budget.record_outcome("vidfetch", "old-task", True, cost_usd=0.04)
    assert budget.try_submit("vidfetch", "req-1:vidfetch", estimated_usd=0.02).allowed is False
    assert budget.try_submit("vidfetch", "req-1:vidfetch", estimated_usd=0.01).allowed


def test_cleanup_stale_reconciles_task_state(tmp_path):
    quota = DailyDownloadQuota(str(tmp_path / "q.sqlite3"), SECRET, daily_limit=2)
    claims = [("rid-running", "task-running", "8.8.8.8"),
              ("rid-dead", "task-dead", "8.8.4.4"),
              ("rid-lost", None, "8.8.1.1")]
    for rid, tid, ip in claims:
        cookie = create_signed_browser_cookie(SECRET)
        quota.reserve(rid, cookie, ip)
        if tid:
            quota.attach_task(rid, tid)
    for rid, _tid, _ip in claims:
        with quota._connect() as con:
            con.execute("UPDATE quota_claims SET created_at=? WHERE request_id=?",
                        (_time.time() - 99999, rid))
    dead = {"task-dead"}
    released = quota.cleanup_stale(max_age_seconds=3600,
                                   is_task_dead=lambda tid: tid in dead)
    assert released == 2
    with quota._connect() as con:
        statuses = dict(con.execute(
            "SELECT request_id,status FROM quota_claims").fetchall())
    assert statuses["rid-running"] == "reserved"
    assert statuses["rid-dead"] == "released"
    assert statuses["rid-lost"] == "released"
    # Attached task without callback is never released (conservative).
    quota2 = DailyDownloadQuota(str(tmp_path / "q2.sqlite3"), SECRET, daily_limit=2)
    cookie = create_signed_browser_cookie(SECRET)
    quota2.reserve("rid-2-claim", cookie, "8.8.8.8")
    quota2.attach_task("rid-2-claim", "task-2")
    with quota2._connect() as con:
        con.execute("UPDATE quota_claims SET created_at=? WHERE request_id='rid-2-claim'",
                    (_time.time() - 99999,))
    assert quota2.cleanup_stale(max_age_seconds=3600) == 0
    assert quota2.remaining(cookie, "8.8.8.8") == 1
