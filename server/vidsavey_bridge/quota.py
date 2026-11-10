"""Atomic combined browser/IP quota, backed by persistent SQLite.

Each logical download reserves exactly one slot on both identifiers. The slot
is charged only after a completed file is present; failures release it.
Call `reserve` BEFORE adding work to the queue, and `finish` from the worker.
Never trust client-supplied IP headers unless a trusted proxy has validated them.
"""
from __future__ import annotations

import hashlib
import hmac
import ipaddress
import secrets
import sqlite3
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Callable


class QuotaExceeded(Exception):
    def __init__(self, dimension: str, day: str, limit: int) -> None:
        self.dimension = dimension
        self.day = day
        self.limit = limit
        self.code = "daily_browser_limit" if dimension == "browser" else "daily_ip_limit"
        super().__init__(self.code)


@dataclass(frozen=True)
class Reservation:
    request_id: str
    status: str
    remaining: int
    existing: bool = False
    task_id: str | None = None


def _sig(secret: str, value: str) -> str:
    return hmac.new(secret.encode(), value.encode(), hashlib.sha256).hexdigest()


def create_signed_browser_cookie(secret: str) -> str:
    if len(secret) < 32:
        raise ValueError("VIDSAVEY_QUOTA_SECRET must have at least 32 characters")
    nonce = secrets.token_urlsafe(24)
    return nonce + "." + _sig(secret, "browser:" + nonce)


def verify_signed_browser_cookie(secret: str, value: str | None) -> bool:
    if not value or "." not in value or len(secret) < 32:
        return False
    nonce, claimed = value.rsplit(".", 1)
    return bool(nonce) and len(nonce) <= 64 and hmac.compare_digest(
        claimed, _sig(secret, "browser:" + nonce)
    )


class DailyDownloadQuota:
    def __init__(self, db_path: str, secret: str, daily_limit: int = 2) -> None:
        if len(secret) < 32:
            raise ValueError("VIDSAVEY_QUOTA_SECRET must have at least 32 characters")
        if not 1 <= daily_limit <= 100:
            raise ValueError("daily_limit must be between 1 and 100")
        self.path = str(Path(db_path))
        self.secret = secret
        self.limit = daily_limit
        Path(self.path).parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as con:
            con.execute("PRAGMA journal_mode=WAL")
            con.executescript("""
                CREATE TABLE IF NOT EXISTS quota_usage (
                    day TEXT NOT NULL,
                    kind TEXT NOT NULL CHECK(kind IN ('browser','ip')),
                    subject TEXT NOT NULL,
                    used INTEGER NOT NULL DEFAULT 0,
                    reserved INTEGER NOT NULL DEFAULT 0,
                    PRIMARY KEY (day, kind, subject)
                );
                CREATE TABLE IF NOT EXISTS quota_claims (
                    request_id TEXT PRIMARY KEY,
                    day TEXT NOT NULL,
                    browser_subject TEXT NOT NULL,
                    ip_subject TEXT NOT NULL,
                    status TEXT NOT NULL CHECK(status IN ('reserved','charged','released')),
                    created_at REAL NOT NULL,
                    task_id TEXT
                );
                CREATE INDEX IF NOT EXISTS idx_quota_claims_age
                    ON quota_claims (created_at, status);
            """)

    def _connect(self) -> sqlite3.Connection:
        con = sqlite3.connect(self.path, timeout=30, isolation_level=None)
        con.row_factory = sqlite3.Row
        con.execute("PRAGMA busy_timeout=30000")
        return con

    @staticmethod
    def _day(now: datetime | None) -> str:
        if now is None:
            now = datetime.now(timezone.utc)
        if now.tzinfo is None:
            raise ValueError("now must be timezone-aware")
        return now.astimezone(timezone.utc).date().isoformat()

    def _subjects(self, browser_cookie: str, ip: str) -> tuple[str, str]:
        if not verify_signed_browser_cookie(self.secret, browser_cookie):
            raise ValueError("unsigned or invalid browser cookie")
        addr = ipaddress.ip_address(ip)
        if not addr.is_global:
            # Protect against a proxy configuration that accidentally reports
            # 127.0.0.1 or a Docker gateway for every visitor.
            raise ValueError("client IP is not public: verify trusted reverse-proxy real IP")
        return (_sig(self.secret, "subject:browser:" + browser_cookie),
                _sig(self.secret, "subject:ip:" + addr.compressed))

    def reserve(self, request_id: str, browser_cookie: str, ip: str,
                now: datetime | None = None) -> Reservation:
        if not 8 <= len(request_id) <= 128 or not all(c.isascii() and (c.isalnum() or c in "-_") for c in request_id):
            raise ValueError("invalid idempotency request_id")
        day = self._day(now)
        browser, address = self._subjects(browser_cookie, ip)
        with self._connect() as con:
            con.execute("BEGIN IMMEDIATE")
            existing = con.execute("SELECT * FROM quota_claims WHERE request_id=?", (request_id,)).fetchone()
            if existing:
                if existing["browser_subject"] != browser or existing["ip_subject"] != address:
                    raise ValueError("request_id belongs to a different identity")
                return Reservation(request_id, existing["status"], self._remaining(con, day, browser, address),
                                   True, existing["task_id"])
            for kind, subject in (("browser", browser), ("ip", address)):
                row = con.execute("SELECT used,reserved FROM quota_usage WHERE day=? AND kind=? AND subject=?",
                                  (day,kind,subject)).fetchone()
                if row and row["used"] + row["reserved"] >= self.limit:
                    raise QuotaExceeded(kind, day, self.limit)
            for kind, subject in (("browser", browser), ("ip", address)):
                con.execute("""INSERT INTO quota_usage(day,kind,subject,used,reserved)
                               VALUES(?,?,?,0,1)
                               ON CONFLICT(day,kind,subject) DO UPDATE SET reserved=reserved+1""",
                            (day,kind,subject))
            con.execute("""INSERT INTO quota_claims(request_id,day,browser_subject,ip_subject,status,created_at)
                           VALUES(?,?,?,?,?,?)""",
                        (request_id,day,browser,address,"reserved",time.time()))
            return Reservation(request_id, "reserved", self._remaining(con, day, browser, address))

    def _remaining(self, con: sqlite3.Connection, day: str, browser: str, address: str) -> int:
        result = []
        for kind, subject in (("browser",browser),("ip",address)):
            row=con.execute("SELECT used,reserved FROM quota_usage WHERE day=? AND kind=? AND subject=?",
                            (day,kind,subject)).fetchone()
            result.append(max(0,self.limit-(row["used"]+row["reserved"]) if row else self.limit))
        return min(result)

    def attach_task(self, request_id: str, task_id: str) -> None:
        with self._connect() as con:
            con.execute("BEGIN IMMEDIATE")
            row=con.execute("SELECT task_id,status FROM quota_claims WHERE request_id=?",(request_id,)).fetchone()
            if not row or row["status"] != "reserved":
                raise ValueError("reservation not active")
            if row["task_id"] and row["task_id"] != task_id:
                raise ValueError("reservation already attached to a different task")
            con.execute("UPDATE quota_claims SET task_id=? WHERE request_id=?",(task_id,request_id))

    def finish(self, request_id: str, success: bool) -> bool:
        """Idempotently finalize one logical download. Returns whether updated."""
        with self._connect() as con:
            con.execute("BEGIN IMMEDIATE")
            row=con.execute("SELECT * FROM quota_claims WHERE request_id=?",(request_id,)).fetchone()
            if not row or row["status"] != "reserved":
                return False
            for kind,subject in (("browser",row["browser_subject"]),("ip",row["ip_subject"])):
                if success:
                    con.execute("""UPDATE quota_usage SET reserved=reserved-1,used=used+1
                                   WHERE day=? AND kind=? AND subject=? AND reserved>0""",
                                (row["day"],kind,subject))
                else:
                    con.execute("""UPDATE quota_usage SET reserved=reserved-1
                                   WHERE day=? AND kind=? AND subject=? AND reserved>0""",
                                (row["day"],kind,subject))
            con.execute("UPDATE quota_claims SET status=? WHERE request_id=?",
                        ("charged" if success else "released",request_id))
            return True

    def cleanup_stale(self, max_age_seconds: int = 7200,
                      is_task_dead: "Callable[[str | None], bool] | None" = None) -> int:
        """Release abandoned reservations only after task-state reconciliation.

        P0-5: a claim with an attached task_id is released ONLY if the caller
        supplied an ``is_task_dead`` callback and it returns True for that
        task (e.g. the task is failed/expired/missing in the task store).
        Running tasks must never lose their reserved slot. Claims without a
        task_id are treated as dead after the age cutoff (task creation never
        completed).
        """
        cutoff = time.time() - max_age_seconds
        with self._connect() as con:
            rows = con.execute(
                "SELECT request_id, task_id FROM quota_claims "
                "WHERE status='reserved' AND created_at<?",
                (cutoff,),
            ).fetchall()
        count = 0
        for row in rows:
            task_id = row["task_id"]
            if task_id is None:
                dead = True
            elif is_task_dead is not None:
                dead = bool(is_task_dead(task_id))
            else:
                continue  # cannot confirm: keep the reservation
            if dead and self.finish(row["request_id"], success=False):
                count += 1
        return count

    def remaining(self, browser_cookie: str, ip: str, now: datetime | None = None) -> int:
        day=self._day(now)
        browser,address=self._subjects(browser_cookie,ip)
        with self._connect() as con:
            return self._remaining(con,day,browser,address)
