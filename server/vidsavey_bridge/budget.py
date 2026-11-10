"""Third-party provider budget guard, backed by persistent SQLite.

Tracks paid submissions, cost spend, and success rates per provider so the
worker can refuse to create new paid tasks once a daily/monthly budget is
exhausted. All accounting is idempotent per logical task key, so worker
retries cannot double-bill the same download.

Pending paid submissions reserve their estimated cost until their outcome is
recorded. Keep the estimate conservative: actual bills can exceed estimates,
so the configured cap is not a guarantee against supplier overcharges.

Wire into the YouTube worker:
  - immediately before the potentially billable supplier call:
    budget.try_submit(provider, task_key, estimated_usd)
  - after the final outcome or verified cancellation:
    budget.record_outcome(provider, task_key, success, actual_cost_usd)
  - NEVER use check() + record_submission() as a non-atomic substitute.
"""
from __future__ import annotations

import sqlite3
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path


class BudgetExceeded(Exception):
    def __init__(self, code: str) -> None:
        self.code = code
        super().__init__(code)


@dataclass(frozen=True)
class BudgetDecision:
    allowed: bool
    code: str | None = None


def _utc_now(now: datetime | None = None) -> datetime:
    if now is None:
        return datetime.now(timezone.utc)
    if now.tzinfo is None:
        raise ValueError("now must be timezone-aware")
    return now.astimezone(timezone.utc)


class ProviderBudget:
    """Cost and call caps for paid third-party providers (UTC day/month)."""

    def __init__(
        self,
        db_path: str,
        daily_cost_limit_usd: float | None = None,
        monthly_cost_limit_usd: float | None = None,
        snapany_daily_call_limit: int | None = None,
    ) -> None:
        if daily_cost_limit_usd is not None and daily_cost_limit_usd < 0:
            raise ValueError("daily_cost_limit_usd must be >= 0")
        if monthly_cost_limit_usd is not None and monthly_cost_limit_usd < 0:
            raise ValueError("monthly_cost_limit_usd must be >= 0")
        if snapany_daily_call_limit is not None and snapany_daily_call_limit < 0:
            raise ValueError("snapany_daily_call_limit must be >= 0")
        self.path = str(Path(db_path))
        self.daily_cost_limit = daily_cost_limit_usd
        self.monthly_cost_limit = monthly_cost_limit_usd
        self.snapany_daily_call_limit = snapany_daily_call_limit
        Path(self.path).parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as con:
            con.execute("PRAGMA journal_mode=WAL")
            con.executescript("""
                CREATE TABLE IF NOT EXISTS budget_tasks (
                    task_key TEXT PRIMARY KEY,
                    provider TEXT NOT NULL,
                    day TEXT NOT NULL,
                    month TEXT NOT NULL,
                    submitted INTEGER NOT NULL DEFAULT 0,
                    success INTEGER,
                    cost_usd REAL NOT NULL DEFAULT 0,
                    estimated_cost_usd REAL NOT NULL DEFAULT 0
                );
                CREATE INDEX IF NOT EXISTS idx_budget_tasks_day
                    ON budget_tasks (day, provider);
                CREATE INDEX IF NOT EXISTS idx_budget_tasks_month
                    ON budget_tasks (month, provider);
            """)
            # Existing installations have the pre-reservation schema. SQLite
            # migration is additive and preserves all cost history.
            columns = {row["name"] for row in con.execute("PRAGMA table_info(budget_tasks)")}
            if "estimated_cost_usd" not in columns:
                con.execute(
                    "ALTER TABLE budget_tasks ADD COLUMN estimated_cost_usd REAL NOT NULL DEFAULT 0"
                )

    def _connect(self) -> sqlite3.Connection:
        con = sqlite3.connect(self.path, timeout=30, isolation_level=None)
        con.row_factory = sqlite3.Row
        con.execute("PRAGMA busy_timeout=30000")
        return con

    @staticmethod
    def _validate_task_key(task_key: str) -> None:
        if not 4 <= len(task_key) <= 160 or not all(
            c.isascii() and (c.isalnum() or c in "-_:.") for c in task_key
        ):
            raise ValueError("invalid budget task_key")

    def check(self, provider: str, estimated_usd: float = 0.0,
              now: datetime | None = None) -> BudgetDecision:
        """Refuse new paid work once any configured cap would be exceeded."""
        if provider not in ("vidfetch", "snapany"):
            raise ValueError("unknown provider")
        if estimated_usd < 0:
            raise ValueError("estimated_usd must be >= 0")
        stamp = _utc_now(now)
        day = stamp.date().isoformat()
        month = stamp.strftime("%Y-%m")
        with self._connect() as con:
            if self.daily_cost_limit is not None:
                spent = con.execute(
                    "SELECT COALESCE(SUM(CASE WHEN submitted=1 AND success IS NULL "
                    "THEN estimated_cost_usd ELSE cost_usd END),0) AS s "
                    "FROM budget_tasks WHERE day=?",
                    (day,),
                ).fetchone()["s"]
                if spent + estimated_usd > self.daily_cost_limit + 1e-9:
                    return BudgetDecision(False, "daily_cost_limit_reached")
            if self.monthly_cost_limit is not None:
                spent = con.execute(
                    "SELECT COALESCE(SUM(CASE WHEN submitted=1 AND success IS NULL "
                    "THEN estimated_cost_usd ELSE cost_usd END),0) AS s "
                    "FROM budget_tasks WHERE month=?",
                    (month,),
                ).fetchone()["s"]
                if spent + estimated_usd > self.monthly_cost_limit + 1e-9:
                    return BudgetDecision(False, "monthly_cost_limit_reached")
            if provider == "snapany" and self.snapany_daily_call_limit is not None:
                calls = con.execute(
                    "SELECT COUNT(*) AS c FROM budget_tasks WHERE provider='snapany' "
                    "AND submitted=1 AND day=?",
                    (day,),
                ).fetchone()["c"]
                if calls >= self.snapany_daily_call_limit:
                    return BudgetDecision(False, "snapany_daily_call_limit_reached")
        return BudgetDecision(True)

    def try_submit(self, provider: str, task_key: str, estimated_usd: float = 0.0,
                   now: datetime | None = None) -> BudgetDecision:
        """Atomically verify budget caps and record the paid submission (P0-2).

        The cap check and the submission insert run inside a single
        BEGIN IMMEDIATE transaction, so concurrent workers cannot both pass
        the check on the same remaining budget. Pending estimates count towards
        caps until the supplier confirms the actual charge. Idempotent per task_key.
        """
        self._validate_task_key(task_key)
        if provider not in ("vidfetch", "snapany"):
            raise ValueError("unknown provider")
        if estimated_usd < 0:
            raise ValueError("estimated_usd must be >= 0")
        stamp = _utc_now(now)
        day = stamp.date().isoformat()
        month = stamp.strftime("%Y-%m")
        with self._connect() as con:
            con.execute("BEGIN IMMEDIATE")
            # Idempotent re-entry: an already-submitted task never counts as a
            # new call and must not be blocked by the caps (worker retries).
            row = con.execute(
                "SELECT submitted FROM budget_tasks WHERE task_key=?", (task_key,)
            ).fetchone()
            if row and row["submitted"]:
                return BudgetDecision(True)
            if self.daily_cost_limit is not None:
                spent = con.execute(
                    "SELECT COALESCE(SUM(CASE WHEN submitted=1 AND success IS NULL "
                    "THEN estimated_cost_usd ELSE cost_usd END),0) AS s "
                    "FROM budget_tasks WHERE day=?",
                    (day,),
                ).fetchone()["s"]
                if spent + estimated_usd > self.daily_cost_limit + 1e-9:
                    con.rollback()
                    return BudgetDecision(False, "daily_cost_limit_reached")
            if self.monthly_cost_limit is not None:
                spent = con.execute(
                    "SELECT COALESCE(SUM(CASE WHEN submitted=1 AND success IS NULL "
                    "THEN estimated_cost_usd ELSE cost_usd END),0) AS s "
                    "FROM budget_tasks WHERE month=?",
                    (month,),
                ).fetchone()["s"]
                if spent + estimated_usd > self.monthly_cost_limit + 1e-9:
                    con.rollback()
                    return BudgetDecision(False, "monthly_cost_limit_reached")
            if provider == "snapany" and self.snapany_daily_call_limit is not None:
                calls = con.execute(
                    "SELECT COUNT(*) AS c FROM budget_tasks WHERE provider='snapany' "
                    "AND submitted=1 AND day=?",
                    (day,),
                ).fetchone()["c"]
                if calls >= self.snapany_daily_call_limit:
                    con.rollback()
                    return BudgetDecision(False, "snapany_daily_call_limit_reached")
            if row:
                con.execute(
                    "UPDATE budget_tasks SET submitted=1, provider=?, day=?, month=?, "
                    "estimated_cost_usd=? WHERE task_key=?",
                    (provider, day, month, estimated_usd, task_key),
                )
            else:
                con.execute(
                    "INSERT INTO budget_tasks(task_key,provider,day,month,submitted,estimated_cost_usd) "
                    "VALUES(?,?,?,?,1,?)",
                    (task_key, provider, day, month, estimated_usd),
                )
            return BudgetDecision(True)

    def require(self, provider: str, estimated_usd: float = 0.0,
                now: datetime | None = None) -> None:
        decision = self.check(provider, estimated_usd, now)
        if not decision.allowed:
            raise BudgetExceeded(decision.code or "budget_exceeded")

    def record_submission(self, provider: str, task_key: str,
                          now: datetime | None = None,
                          estimated_usd: float = 0.0) -> bool:
        """Legacy compatibility wrapper; prefer try_submit() with an estimate.

        This wrapper now enforces caps atomically instead of bypassing them.
        An estimate of zero reserves no cost, so billable callers MUST supply
        a conservative nonzero estimate when cost limits are configured.
        """
        decision = self.try_submit(provider, task_key, estimated_usd, now)
        if not decision.allowed:
            raise BudgetExceeded(decision.code or "budget_exceeded")
        return True

    def record_outcome(self, provider: str, task_key: str, success: bool,
                       cost_usd: float = 0.0) -> bool:
        """Finalize one logical task: success flag + actual spend. Idempotent."""
        self._validate_task_key(task_key)
        if provider not in ("vidfetch", "snapany"):
            raise ValueError("unknown provider")
        if cost_usd < 0:
            raise ValueError("cost_usd must be >= 0")
        with self._connect() as con:
            con.execute("BEGIN IMMEDIATE")
            row = con.execute(
                "SELECT success FROM budget_tasks WHERE task_key=?", (task_key,)
            ).fetchone()
            if not row:
                # Outcome recorded without a prior submission (e.g. free info
                # call billed later); create the row so spend is still counted.
                stamp = _utc_now()
                con.execute(
                    "INSERT INTO budget_tasks(task_key,provider,day,month) VALUES(?,?,?,?)",
                    (task_key, provider, stamp.date().isoformat(), stamp.strftime("%Y-%m")),
                )
            elif row["success"] is not None:
                return False
            con.execute(
                "UPDATE budget_tasks SET success=?, cost_usd=? WHERE task_key=?",
                (1 if success else 0, cost_usd, task_key),
            )
            return True

    def snapshot(self, now: datetime | None = None) -> dict:
        """Ops/monitoring view: spend, calls and success rates per provider."""
        stamp = _utc_now(now)
        day = stamp.date().isoformat()
        month = stamp.strftime("%Y-%m")
        with self._connect() as con:
            rows = con.execute(
                "SELECT provider, "
                "SUM(CASE WHEN day=? THEN submitted ELSE 0 END) AS calls_today, "
                "SUM(CASE WHEN month=? THEN submitted END) AS calls_month, "
                "SUM(CASE WHEN day=? AND submitted=1 AND success IS NOT NULL "
                "    THEN 1 ELSE 0 END) AS finished_today, "
                "SUM(CASE WHEN day=? AND submitted=1 AND success=1 "
                "    THEN 1 ELSE 0 END) AS success_today, "
                "SUM(CASE WHEN day=? THEN cost_usd ELSE 0 END) AS cost_today, "
                "SUM(CASE WHEN month=? THEN cost_usd ELSE 0 END) AS cost_month, "
                "SUM(CASE WHEN day=? AND submitted=1 AND success IS NULL "
                "THEN estimated_cost_usd ELSE 0 END) AS reserved_today, "
                "SUM(CASE WHEN month=? AND submitted=1 AND success IS NULL "
                "THEN estimated_cost_usd ELSE 0 END) AS reserved_month "
                "FROM budget_tasks GROUP BY provider",
                (day, month, day, day, day, month, day, month),
            ).fetchall()
        stats: dict[str, dict] = {}
        for row in rows:
            finished = row["finished_today"] or 0
            stats[row["provider"]] = {
                "calls_today": row["calls_today"] or 0,
                "calls_month": row["calls_month"] or 0,
                "success_today": row["success_today"] or 0,
                "success_rate_today": round(
                    (row["success_today"] or 0) / finished, 4
                ) if finished else None,
                "cost_usd_today": round(row["cost_today"] or 0, 4),
                "cost_usd_month": round(row["cost_month"] or 0, 4),
                "pending_estimated_usd_today": round(row["reserved_today"] or 0, 4),
                "pending_estimated_usd_month": round(row["reserved_month"] or 0, 4),
            }
        return {
            "day": day,
            "month": month,
            "limits": {
                "daily_cost_limit_usd": self.daily_cost_limit,
                "monthly_cost_limit_usd": self.monthly_cost_limit,
                "snapany_daily_call_limit": self.snapany_daily_call_limit,
            },
            "providers": stats,
        }
