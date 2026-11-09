from datetime import datetime, timezone, timedelta

import pytest

from vidsavey_bridge.budget import ProviderBudget, BudgetExceeded


def test_daily_cost_cap_blocks_and_records_idempotently(tmp_path):
    budget = ProviderBudget(str(tmp_path / "b.sqlite3"), daily_cost_limit_usd=0.05)
    budget.record_submission("vidfetch", "req-1:vidfetch")
    budget.record_outcome("vidfetch", "req-1:vidfetch", success=True, cost_usd=0.03)
    assert budget.check("vidfetch", estimated_usd=0.01).allowed
    with pytest.raises(BudgetExceeded, match="daily_cost_limit"):
        budget.require("vidfetch", estimated_usd=0.03)
    # Idempotent re-recording of the same task must not double-count spend.
    budget.record_outcome("vidfetch", "req-1:vidfetch", success=True, cost_usd=0.03)
    snap = budget.snapshot()
    assert snap["providers"]["vidfetch"]["cost_usd_today"] == pytest.approx(0.03)


def test_monthly_cost_cap(tmp_path):
    budget = ProviderBudget(str(tmp_path / "b.sqlite3"), monthly_cost_limit_usd=0.10)
    now = datetime(2026, 11, 9, 12, 0, tzinfo=timezone.utc)
    budget.record_outcome("snapany", "req-1:snapany", True, cost_usd=0.08)
    # Next month is a fresh budget window.
    next_month = datetime(2026, 12, 1, 0, 30, tzinfo=timezone.utc)
    assert budget.check("snapany", 0.05, now=next_month).allowed
    with pytest.raises(BudgetExceeded, match="monthly_cost_limit"):
        budget.require("snapany", 0.05, now=now)


def test_snapany_daily_call_limit(tmp_path):
    budget = ProviderBudget(str(tmp_path / "b.sqlite3"), snapany_daily_call_limit=2)
    budget.record_submission("snapany", "req-1:snapany")
    budget.record_submission("snapany", "req-2:snapany")
    assert budget.check("snapany").allowed is False
    assert budget.check("vidfetch").allowed is True  # other providers unaffected


def test_submission_idempotency(tmp_path):
    budget = ProviderBudget(str(tmp_path / "b.sqlite3"), snapany_daily_call_limit=1)
    assert budget.record_submission("snapany", "req-1:snapany")
    budget.record_submission("snapany", "req-1:snapany")  # retry same task
    budget.record_submission("snapany", "req-1:snapany")
    snap = budget.snapshot()
    assert snap["providers"]["snapany"]["calls_today"] == 1


def test_success_rate_stats(tmp_path):
    budget = ProviderBudget(str(tmp_path / "b.sqlite3"))
    budget.record_submission("vidfetch", "req-1:vidfetch")
    budget.record_outcome("vidfetch", "req-1:vidfetch", True, 0.0)
    budget.record_submission("vidfetch", "req-2:vidfetch")
    budget.record_outcome("vidfetch", "req-2:vidfetch", False, 0.0)
    snap = budget.snapshot()
    assert snap["providers"]["vidfetch"]["success_today"] == 1
    assert snap["providers"]["vidfetch"]["success_rate_today"] == 0.5


def test_utc_day_rollover_restores_call_budget(tmp_path):
    budget = ProviderBudget(str(tmp_path / "b.sqlite3"), snapany_daily_call_limit=1)
    late = datetime(2026, 11, 9, 23, 59, tzinfo=timezone.utc)
    budget.record_submission("snapany", "req-1:snapany", now=late)
    assert budget.check("snapany", now=late).allowed is False
    after = late + timedelta(minutes=2)
    assert budget.check("snapany", now=after).allowed is True


def test_unset_limits_allow_everything(tmp_path):
    budget = ProviderBudget(str(tmp_path / "b.sqlite3"))
    assert budget.check("snapany", estimated_usd=999).allowed
