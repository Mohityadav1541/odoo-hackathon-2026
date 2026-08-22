from datetime import datetime, date, timedelta
from typing import Dict, Any, List, Optional
from database import get_cursor
from config import (
    LATE_CHECKIN_THRESHOLD, EARLY_CHECKOUT_THRESHOLD, TARGET_WORKING_HOURS,
    MAX_LATE_DEDUCTION, LATE_DEDUCTION_PER_EVENT,
    MAX_EARLY_DEDUCTION, EARLY_DEDUCTION_PER_EVENT,
    MAX_UNAUTH_ABSENCE_DEDUCTION, UNAUTH_ABSENCE_DEDUCTION_PER_DAY
)

def _parse_time(time_str: str) -> datetime.time:
    t = datetime.strptime(time_str, "%H:%M")
    return t.time()

late_threshold_time = _parse_time(LATE_CHECKIN_THRESHOLD)
early_threshold_time = _parse_time(EARLY_CHECKOUT_THRESHOLD)

def calculate_leave_metrics(employee_id: int, start_date: date, end_date: date) -> Dict[str, Any]:
    """
    Leave data is context only. Do not penalize approved leaves.
    Distinguish approved, rejected, unpaid, and pending.
    """
    with get_cursor() as cur:
        cur.execute("""
            SELECT type, status, "startDate", "endDate"
            FROM "LeaveRequest"
            WHERE "employeeId" = %s
              AND "startDate" <= %s AND "endDate" >= %s
        """, (employee_id, end_date, start_date))
        leaves = cur.fetchall()

    metrics = {
        "total_leave_days": 0,
        "approved_leave_days": 0,
        "rejected_leave_days": 0,
        "unpaid_leave_days": 0
    }

    for lv in leaves:
        # Calculate overlap in days
        lv_start = lv['startDate'].date()
        lv_end = lv['endDate'].date()
        actual_start = max(lv_start, start_date)
        actual_end = min(lv_end, end_date)
        if actual_start <= actual_end:
            days = (actual_end - actual_start).days + 1
            metrics["total_leave_days"] += days
            
            if lv['status'] == 'APPROVED':
                metrics["approved_leave_days"] += days
                if lv['type'] == 'UNPAID':
                    metrics["unpaid_leave_days"] += days
            elif lv['status'] == 'REJECTED':
                metrics["rejected_leave_days"] += days

    return metrics

def calculate_reliability_metrics(attendance_records: List[Dict], leave_metrics: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate late arrivals, early checkouts, and unexplained absences.
    """
    late_arrivals = 0
    early_checkouts = 0
    unexplained_absences = 0
    
    # We count how many 'ABSENT' records exist in Attendance table. 
    # If they are covered by an approved leave, we don't penalize.
    # In a real system, we'd check day-by-day overlap. Here we do an aggregate approximation.
    absent_records = sum(1 for r in attendance_records if r['status'] == 'ABSENT')
    unexplained_absences = max(0, absent_records - leave_metrics['approved_leave_days'])

    for record in attendance_records:
        if record['checkIn']:
            # Compare time
            checkin_time = record['checkIn'].time()
            if checkin_time > late_threshold_time:
                late_arrivals += 1
                
        if record['checkOut']:
            checkout_time = record['checkOut'].time()
            if checkout_time < early_threshold_time:
                early_checkouts += 1

    return {
        "late_arrivals": late_arrivals,
        "early_checkouts": early_checkouts,
        "unexplained_absences": unexplained_absences
    }

def calculate_attendance_score(employee_id: int, period_start: date, period_end: date) -> Dict[str, Any]:
    """
    Returns the attendance score out of 100 and related metrics.
    """
    # 1. Fetch user ID for the employee
    with get_cursor() as cur:
        cur.execute('SELECT "userId" FROM "Employee" WHERE id = %s', (employee_id,))
        emp_row = cur.fetchone()
        if not emp_row:
            return {"error": "Employee not found"}
        user_id = emp_row['userId']

        # Fetch attendance records
        cur.execute("""
            SELECT date, "checkIn", "checkOut", status
            FROM "Attendance"
            WHERE "userId" = %s AND date >= %s AND date <= %s
        """, (user_id, period_start, period_end))
        records = cur.fetchall()

    leave_metrics = calculate_leave_metrics(employee_id, period_start, period_end)
    reliability = calculate_reliability_metrics(records, leave_metrics)

    total_days = len(records)
    if total_days == 0:
        return {
            "score": None, # Missing data
            "metrics": {
                "total_working_days": 0,
                "attendance_percentage": 0
            }
        }

    present_days = sum(1 for r in records if r['status'] == 'PRESENT')
    half_days = sum(1 for r in records if r['status'] == 'HALF_DAY')
    absent_days = sum(1 for r in records if r['status'] == 'ABSENT')
    leave_days = sum(1 for r in records if r['status'] == 'LEAVE')

    # Base score: percentage of attended days (Leave does not penalize base percentage)
    # Total countable days = total_days - leave_days (assuming leave is excused)
    countable_days = total_days - leave_days
    if countable_days > 0:
        base_percentage = ((present_days + 0.5 * half_days) / countable_days) * 100
    else:
        base_percentage = 100.0 # All days were leave

    # Apply reliability deductions
    late_deduction = min(MAX_LATE_DEDUCTION, reliability['late_arrivals'] * LATE_DEDUCTION_PER_EVENT)
    early_deduction = min(MAX_EARLY_DEDUCTION, reliability['early_checkouts'] * EARLY_DEDUCTION_PER_EVENT)
    absence_deduction = min(MAX_UNAUTH_ABSENCE_DEDUCTION, reliability['unexplained_absences'] * UNAUTH_ABSENCE_DEDUCTION_PER_DAY)

    final_score = base_percentage - late_deduction - early_deduction - absence_deduction
    final_score = max(0.0, min(100.0, final_score))

    # Average working hours calculation
    total_hours = 0
    days_with_hours = 0
    for r in records:
        if r['checkIn'] and r['checkOut']:
            diff = r['checkOut'] - r['checkIn']
            total_hours += diff.total_seconds() / 3600
            days_with_hours += 1
            
    avg_working_hours = (total_hours / days_with_hours) if days_with_hours > 0 else 0

    return {
        "score": round(final_score, 2),
        "metrics": {
            "total_working_days": total_days,
            "present_days": present_days,
            "absent_days": absent_days,
            "half_days": half_days,
            "leave_days": leave_days,
            "attendance_percentage": round(base_percentage, 2),
            "late_checkins": reliability['late_arrivals'],
            "early_checkouts": reliability['early_checkouts'],
            "unexplained_absences": reliability['unexplained_absences'],
            "average_working_hours": round(avg_working_hours, 2),
            "leave_breakdown": leave_metrics
        }
    }
