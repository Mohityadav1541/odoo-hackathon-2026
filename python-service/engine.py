from typing import Dict, Any, Tuple
from datetime import datetime
from database import get_cursor

from attendance import calculate_attendance_score
from performance import calculate_overall_performance
from feedback import calculate_manager_feedback_score, calculate_peer_feedback_score
from experience import calculate_experience_score

def get_active_config() -> Dict[str, Any]:
    with get_cursor() as cur:
        cur.execute("""
            SELECT * FROM "PromotionConfig" WHERE "isActive" = true ORDER BY "createdAt" DESC LIMIT 1
        """)
        config = cur.fetchone()
        
    if not config:
        # Provide default weights if none exist
        return {
            "name": "Default Hardcoded",
            "attendanceWeight": 10.0,
            "performanceWeight": 30.0,
            "projectWeight": 20.0,
            "managerFeedbackWeight": 20.0,
            "peerFeedbackWeight": 10.0,
            "experienceWeight": 10.0,
            "promotionThreshold": 90.0,
            "considerationThreshold": 80.0,
            "developmentThreshold": 70.0
        }
    
    # Ensure float conversion
    for key in ['attendanceWeight', 'performanceWeight', 'projectWeight', 
                'managerFeedbackWeight', 'peerFeedbackWeight', 'experienceWeight',
                'promotionThreshold', 'considerationThreshold', 'developmentThreshold']:
        config[key] = float(config[key])
    return config

def validate_weights(config: Dict[str, Any]) -> bool:
    total = sum([
        config['attendanceWeight'],
        config['performanceWeight'],
        config['projectWeight'],
        config['managerFeedbackWeight'],
        config['peerFeedbackWeight'],
        config['experienceWeight']
    ])
    return abs(total - 100.0) < 0.01

def determine_status(score: float, config: Dict[str, Any]) -> str:
    if score >= config['promotionThreshold']:
        return "Strong Candidate"
    elif score >= config['considerationThreshold']:
        return "Consider"
    elif score >= config['developmentThreshold']:
        return "Development Required"
    else:
        return "Not Recommended"

def run_promotion_engine(employee_id: int, period: str, period_start: datetime.date, period_end: datetime.date) -> Dict[str, Any]:
    """
    Step 7: Centralized Promotion Score Engine.
    """
    config = get_active_config()
    if not validate_weights(config):
        return {"error": "Active PromotionConfig weights do not total 100%"}

    attendance = calculate_attendance_score(employee_id, period_start, period_end)
    performance = calculate_overall_performance(employee_id, period)
    manager = calculate_manager_feedback_score(employee_id, period)
    peer = calculate_peer_feedback_score(employee_id, period)
    experience = calculate_experience_score(employee_id)

    missing = []
    
    # Extract values, handling None
    s_att = attendance['score']
    if s_att is None:
        s_att = 0.0
        missing.append("attendance")
        
    s_perf = performance['metrics'].get('performance_review_score')
    if s_perf is None:
        s_perf = 0.0
        missing.append("performance")
        
    s_proj = performance['metrics'].get('project_overall_score')
    if s_proj is None:
        s_proj = 0.0
        missing.append("project")
        
    s_mgr = manager['score']
    if s_mgr is None:
        s_mgr = 0.0
        missing.append("manager_feedback")
        
    s_peer = peer['score']
    if s_peer is None:
        s_peer = 0.0
        missing.append("peer_feedback")
        
    s_exp = experience['score']
    if s_exp is None:
        s_exp = 0.0
        missing.append("experience")

    # Calculate weighted sum
    final_score = (
        (s_att * config['attendanceWeight'] / 100.0) +
        (s_perf * config['performanceWeight'] / 100.0) +
        (s_proj * config['projectWeight'] / 100.0) +
        (s_mgr * config['managerFeedbackWeight'] / 100.0) +
        (s_peer * config['peerFeedbackWeight'] / 100.0) +
        (s_exp * config['experienceWeight'] / 100.0)
    )
    final_score = max(0.0, min(100.0, round(final_score, 2)))

    status = determine_status(final_score, config)

    return {
        "final_score": final_score,
        "status": status,
        "missing_data": missing,
        "config_used": config['name'],
        "raw_scores": {
            "attendance": s_att,
            "performance": s_perf,
            "project": s_proj,
            "manager_feedback": s_mgr,
            "peer_feedback": s_peer,
            "experience": s_exp
        },
        "weights": {
            "attendance": config['attendanceWeight'],
            "performance": config['performanceWeight'],
            "project": config['projectWeight'],
            "manager_feedback": config['managerFeedbackWeight'],
            "peer_feedback": config['peerFeedbackWeight'],
            "experience": config['experienceWeight']
        },
        "breakdown": {
            "attendance_contribution": round(s_att * config['attendanceWeight'] / 100.0, 2),
            "performance_contribution": round(s_perf * config['performanceWeight'] / 100.0, 2),
            "project_contribution": round(s_proj * config['projectWeight'] / 100.0, 2),
            "manager_feedback_contribution": round(s_mgr * config['managerFeedbackWeight'] / 100.0, 2),
            "peer_feedback_contribution": round(s_peer * config['peerFeedbackWeight'] / 100.0, 2),
            "experience_contribution": round(s_exp * config['experienceWeight'] / 100.0, 2)
        },
        "metrics_detail": {
            "attendance": attendance.get('metrics'),
            "performance": performance.get('metrics'),
            "manager": manager.get('metrics'),
            "peer": peer.get('metrics'),
            "experience": experience.get('metrics')
        }
    }
