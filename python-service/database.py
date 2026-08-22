"""
Database connection pool.

Uses psycopg2 connection pooling to talk to the same Neon PostgreSQL
instance as the Node.js backend (shared DATABASE_URL).

Prisma uses quoted, PascalCase table names by default in PostgreSQL,
e.g. "Attendance", "LeaveRequest", "User", "Employee".
All raw SQL in this service quotes identifiers accordingly.
"""

import contextlib
from typing import Generator

import psycopg2
from psycopg2 import pool as pg_pool
from psycopg2.extras import RealDictCursor

from config import DATABASE_URL

# Thread-safe connection pool (min=1, max=10 connections)
_pool: "pg_pool.ThreadedConnectionPool" = None


def _get_pool() -> pg_pool.ThreadedConnectionPool:
    global _pool
    if _pool is None:
        _pool = pg_pool.ThreadedConnectionPool(
            minconn=1,
            maxconn=10,
            dsn=DATABASE_URL,
        )
    return _pool


@contextlib.contextmanager
def get_cursor() -> Generator[RealDictCursor, None, None]:
    """
    Context manager that yields a RealDictCursor and auto-commits/rolls back.

    Usage::

        with get_cursor() as cur:
            cur.execute("SELECT ...")
            rows = cur.fetchall()
    """
    pool = _get_pool()
    conn = pool.getconn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            yield cur
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        pool.putconn(conn)


def close_pool() -> None:
    """Call on application shutdown to release all connections."""
    global _pool
    if _pool:
        _pool.closeall()
        _pool = None
