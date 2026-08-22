from typing import Dict, Any
from datetime import datetime, date
from database import get_cursor

def calculate_experience_score(employee_id: int) -> Dict[str, Any]:
    """
    Experience and Career Progression Calculation.
    """
    with get_cursor() as cur:
        # Fetch experience record
        cur.execute("""
            SELECT "currentRoleStartDate", "previousExperienceYears"
            FROM "EmployeeExperience"
            WHERE "employeeId" = %s
        """, (employee_id,))
        exp = cur.fetchone()
        
        # Fetch joining date from Employee
        cur.execute("""
            SELECT "joiningDate", "jobLevel"
            FROM "Employee"
            WHERE id = %s
        """, (employee_id,))
        emp = cur.fetchone()

    if not emp or not emp['joiningDate']:
        return {"score": None, "metrics": {}}

    now = datetime.now()
    
    joining_date = emp['joiningDate']
    if isinstance(joining_date, date) and not isinstance(joining_date, datetime):
        joining_date = datetime.combine(joining_date, datetime.min.time())
        
    years_at_company = (now - joining_date).days / 365.25

    if exp:
        role_start = exp['currentRoleStartDate']
        if isinstance(role_start, date) and not isinstance(role_start, datetime):
            role_start = datetime.combine(role_start, datetime.min.time())
        years_in_current_role = (now - role_start).days / 365.25
        prev_exp = float(exp['previousExperienceYears'])
    else:
        # If no explicit experience record, assume role started at joining and no prev exp
        years_in_current_role = years_at_company
        prev_exp = 0.0

    total_experience = prev_exp + years_at_company

    # Configurable HR rules for scoring (Max 100)
    # 0-60 points from company tenure (capped at 10 years)
    base_score = min(60.0, (years_at_company / 10.0) * 60.0)
    
    # 0-20 points from current role tenure (capped at 5 years)
    role_score = min(20.0, (years_in_current_role / 5.0) * 20.0)
    
    # 0-10 points from previous experience (capped at 10 years)
    prev_score = min(10.0, (prev_exp / 10.0) * 10.0)
    
    # 0-10 points seniority bonus based on job level
    level_bonus_map = {"L1": 0, "L2": 3, "L3": 5, "Senior": 7, "Lead": 10, "Manager": 10}
    level = emp['jobLevel'] if emp['jobLevel'] else "L1"
    level_score = level_bonus_map.get(level, 0)
    
    final_score = base_score + role_score + prev_score + level_score
    final_score = max(0.0, min(100.0, final_score))

    return {
        "score": round(final_score, 2),
        "metrics": {
            "total_professional_experience": round(total_experience, 2),
            "years_in_current_company": round(years_at_company, 2),
            "years_in_current_role": round(years_in_current_role, 2),
            "previous_experience": round(prev_exp, 2),
            "job_level": level
        }
    }
