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


def test_pending_estimated_spend_prevents_parallel_daily_overrun(tmp_path):
    """Pending provider charges must count toward a daily USD cap, not just settled bills."""
    budget = ProviderBudget(str(tmp_path / "pending.sqlite3"),
                            daily_cost_limit_usd=0.05, monthly_cost_limit_usd=0.10)
    decisions = []
    lock = threading.Lock()

    def worker(i):
        result = budget.try_submit("vidfetch", f"pending-{i}:vidfetch",
                                   estimated_usd=0.03)
        with lock:
            decisions.append(result)

    threads = [threading.Thread(target=worker, args=(i,)) for i in range(8)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    assert sum(d.allowed for d in decisions) == 1
    stats = budget.snapshot()["providers"]["vidfetch"]
    assert stats["pending_estimated_usd_today"] == pytest.approx(0.03)
    assert stats["cost_usd_today"] == 0
    assert not budget.check("vidfetch", estimated_usd=0.03).allowed


def test_settling_task_releases_unused_budget_reservation(tmp_path):
    budget = ProviderBudget(str(tmp_path / "settle.sqlite3"),
                            daily_cost_limit_usd=0.05)
    assert budget.try_submit("vidfetch", "settle-one", 0.03).allowed
    assert not budget.try_submit("vidfetch", "settle-two", 0.03).allowed
    assert budget.record_outcome("vidfetch", "settle-one", True, cost_usd=0.01)
    assert budget.try_submit("vidfetch", "settle-two", 0.03).allowed
    stats = budget.snapshot()["providers"]["vidfetch"]
    assert stats["cost_usd_today"] == pytest.approx(0.01)
    assert stats["pending_estimated_usd_today"] == pytest.approx(0.03)


def test_existing_budget_db_adds_estimate_column_without_losing_history(tmp_path):
    import sqlite3

    db = str(tmp_path / "old.sqlite3")
    with sqlite3.connect(db) as con:
        con.execute("""CREATE TABLE budget_tasks (
            task_key TEXT PRIMARY KEY,
            provider TEXT NOT NULL,
            day TEXT NOT NULL,
            month TEXT NOT NULL,
            submitted INTEGER NOT NULL DEFAULT 0,
            success INTEGER,
            cost_usd REAL NOT NULL DEFAULT 0
        )""")
        con.execute("""INSERT INTO budget_tasks
            (task_key, provider, day, month, submitted, success, cost_usd)
            VALUES ('old:vidfetch','vidfetch','2026-11-09','2026-11',1,1,0.02)""")

    budget = ProviderBudget(db, daily_cost_limit_usd=0.05)
    with budget._connect() as con:
        cols = [row["name"] for row in con.execute("PRAGMA table_info(budget_tasks)")]
        row = con.execute("SELECT cost_usd FROM budget_tasks WHERE task_key='old:vidfetch'").fetchone()
    assert "estimated_cost_usd" in cols
    assert row["cost_usd"] == pytest.approx(0.02)
