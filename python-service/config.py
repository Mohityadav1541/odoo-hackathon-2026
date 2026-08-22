"""
Configuration loader for the DayFlow Attendance Calculation Service.

All config values come from environment variables (same .env file used by
the Node.js backend — the DATABASE_URL points to the shared Neon PostgreSQL
instance so no duplicate DB is needed).
"""

import os
from dotenv import load_dotenv

# Load from parent directory's .env (shared with the Node.js backend)
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", "backend", ".env"))

# ── Database ────────────────────────────────────────────────
DATABASE_URL: str = os.getenv("DATABASE_URL", "")

# ── Attendance thresholds ───────────────────────────────────

# Time-of-day string in HH:MM (24-hour) after which a check-in is "late"
LATE_CHECKIN_THRESHOLD: str = os.getenv("LATE_CHECKIN_THRESHOLD", "09:30")

# Time-of-day string in HH:MM before which a check-out is "early"
EARLY_CHECKOUT_THRESHOLD: str = os.getenv("EARLY_CHECKOUT_THRESHOLD", "17:00")

# Expected hours per working day
TARGET_WORKING_HOURS: float = float(os.getenv("TARGET_WORKING_HOURS", "8.0"))

# ── Score deduction caps ────────────────────────────────────

# Maximum points deducted for late arrivals
MAX_LATE_DEDUCTION: float = float(os.getenv("MAX_LATE_DEDUCTION", "15.0"))

# Points deducted per late arrival event
LATE_DEDUCTION_PER_EVENT: float = float(os.getenv("LATE_DEDUCTION_PER_EVENT", "1.5"))

# Maximum points deducted for early checkouts
MAX_EARLY_DEDUCTION: float = float(os.getenv("MAX_EARLY_DEDUCTION", "10.0"))

# Points deducted per early checkout event
EARLY_DEDUCTION_PER_EVENT: float = float(os.getenv("EARLY_DEDUCTION_PER_EVENT", "1.0"))

# Maximum points deducted for unexplained (unauthorized) absences
MAX_UNAUTH_ABSENCE_DEDUCTION: float = float(os.getenv("MAX_UNAUTH_ABSENCE_DEDUCTION", "20.0"))

# Points deducted per unauthorized absence day
UNAUTH_ABSENCE_DEDUCTION_PER_DAY: float = float(os.getenv("UNAUTH_ABSENCE_DEDUCTION_PER_DAY", "3.0"))

# ── Service ─────────────────────────────────────────────────
SERVICE_HOST: str = os.getenv("PYTHON_SERVICE_HOST", "0.0.0.0")
SERVICE_PORT: int = int(os.getenv("PYTHON_SERVICE_PORT", "8001"))
